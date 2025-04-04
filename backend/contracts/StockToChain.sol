// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./interfaces/AggregatorV3Interface.sol";

/**
 * @title StockToChain
 * @dev Implémentation d'un token ERC20 avec système de vente, distribution de profits et rachat
 */
contract StockToChain is ERC20, Ownable, Pausable, ReentrancyGuard {
    
    error NoTokensToBuyBack();

    using Address for address;

    /// @dev Énumération des différents états du workflow du contrat
    enum WorkflowStatus {
        SaleNotStarted,
        SaleActive,
        SaleEnded,
        BuybackActive
    }

    /// @dev Structure stockant les informations d'un investisseur
    struct Investor {
        bool whitelisted;
        uint256 lastPurchaseTime;
        uint256 unclaimedProfits;
        uint256 totalInvested;
        uint256 totalTokens;
    }

    /// @dev Structure stockant les informations d'un Price Feed
    struct PriceFeed {
        AggregatorV3Interface feed;
        uint8 decimals;
    }

    /// @dev Structure stockant la répartition des profits
    struct ProfitDistribution {
        uint256 companyShare;
        uint256 platformShare;
        uint256 tokenHolderShare;
    }

    /// @dev Price Feeds Chainlink pour les conversions EUR/USD et POL/USD
    AggregatorV3Interface private immutable eurUsdPriceFeed;
    AggregatorV3Interface private immutable polUsdPriceFeed;
    /// @dev Nombre de décimales des Price Feeds
    uint8 private constant PRICE_FEED_DECIMALS = 8;

    /// @dev Prix du token en EUR (avec 18 décimales)
    uint256 public constant TOKEN_PRICE_EUR = 50 * 10**18;
    /// @dev Supply total des tokens (avec 18 décimales)
    uint256 public constant TOTAL_SUPPLY = 84000 * 10**18;
    /// @dev Période d'attente pour réclamer les profits (4 ans)
    uint256 public constant PROFIT_CLAIM_PERIOD = 4 * 365 days;

    /// @dev Ratios de distribution des profits (en points de base)
    uint256 public constant COMPANY_RATIO = 6000;
    uint256 public constant TOKEN_HOLDERS_RATIO = 3000;
    uint256 public constant PLATFORM_RATIO = 1000;

    /// @dev Variables d'état du contrat
    WorkflowStatus public workflowStatus;
    mapping(address => Investor) public investors;
    uint256 public totalDistributedProfits;
    address public immutable platformWallet;
    address[] private investorList;
    mapping(address => bool) private isInInvestorList;

    /// @dev Événements du contrat
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 price);
    event ProfitsDistributed(uint256 totalAmount);
    event ProfitsClaimed(address indexed investor, uint256 amount);
    event BuybackExecuted(uint256 totalAmount);
    event InvestorWhitelisted(address indexed investor);
    event InvestorRemovedFromWhitelist(address indexed investor);
    event WorkflowStatusChanged(WorkflowStatus newStatus);
    event EmergencyWithdraw(address indexed token, uint256 amount);
    event Received(address indexed sender, uint256 amount);
    event FallbackCalled(address indexed sender, uint256 amount, bytes data);

    constructor(
        address _eurUsdPriceFeed,
        address _polUsdPriceFeed,
        address _companyWallet,
        address _platformWallet
    ) ERC20("StockToChain Token", "STCT") Ownable(_companyWallet) {
        require(_eurUsdPriceFeed != address(0), "Invalid EUR/USD price feed");
        require(_polUsdPriceFeed != address(0), "Invalid POL/USD price feed");
        require(_companyWallet != address(0), "Invalid company wallet");
        require(_platformWallet != address(0), "Invalid platform wallet");

        eurUsdPriceFeed = AggregatorV3Interface(_eurUsdPriceFeed);
        polUsdPriceFeed = AggregatorV3Interface(_polUsdPriceFeed);

        platformWallet = _platformWallet;
        workflowStatus = WorkflowStatus.SaleNotStarted;
    }

    // Modifiers
    modifier onlyWhitelisted() {
        require(investors[msg.sender].whitelisted, "Address not whitelisted");
        _;
    }

    modifier saleActive() {
        require(workflowStatus == WorkflowStatus.SaleActive, "Sale is not active");
        _;
    }

    modifier canClaimProfits() {
        require(
            block.timestamp >= investors[msg.sender].lastPurchaseTime + PROFIT_CLAIM_PERIOD,
            "Must wait 4 years before claiming profits"
        );
        _;
    }

    modifier validWorkflowTransition(WorkflowStatus newStatus) {
        require(
            (workflowStatus == WorkflowStatus.SaleNotStarted && newStatus == WorkflowStatus.SaleActive) ||
            (workflowStatus == WorkflowStatus.SaleActive && newStatus == WorkflowStatus.SaleEnded) ||
            (workflowStatus == WorkflowStatus.SaleEnded && newStatus == WorkflowStatus.BuybackActive),
            "Invalid workflow transition"
        );
        _;
    }
     // External Functions
    /**
     * @dev Achete des tokens
     * @param amount Nombre de tokens à acheter
     */
    function buyTokens(uint256 amount) external payable whenNotPaused saleActive onlyWhitelisted nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= TOTAL_SUPPLY, "Exceeds total supply");

        uint256 priceInPol = getCurrentPriceInPOL(amount);
        require(msg.value >= priceInPol, "Insufficient payment");

        _mint(msg.sender, amount);
        
        /// @dev Mise à jour des données de l'investisseur
        Investor storage investor = investors[msg.sender];
        investor.lastPurchaseTime = block.timestamp;
        investor.totalInvested += priceInPol;
        investor.totalTokens += amount;

        /// @dev Ajout à la liste des investisseurs si non présent
        if (!isInInvestorList[msg.sender]) {
            investorList.push(msg.sender);
            isInInvestorList[msg.sender] = true;
        }

        /// @dev Remboursement du surplus de POL
        if (msg.value > priceInPol) {
            payable(msg.sender).transfer(msg.value - priceInPol);
        }

        emit TokensPurchased(msg.sender, amount, priceInPol);
    }

    /**
     * @dev Distribue les profits aux différents acteurs
     * @notice Cette fonction distribue les profits selon les ratios définis :
     *         - 60% pour la société
     *         - 30% pour les détenteurs de tokens
     *         - 10% pour la plateforme
     */
    function distributeProfits() external payable onlyOwner whenNotPaused {
        require(msg.value > 0, "No profits to distribute");
        
        ProfitDistribution memory distribution = ProfitDistribution({
            companyShare: (msg.value * COMPANY_RATIO) / 10000,
            platformShare: (msg.value * PLATFORM_RATIO) / 10000,
            tokenHolderShare: msg.value - ((msg.value * COMPANY_RATIO) / 10000) - ((msg.value * PLATFORM_RATIO) / 10000)
        });

        /// @dev Transfert des parts de la société et de la plateforme
        payable(owner()).transfer(distribution.companyShare);
        payable(platformWallet).transfer(distribution.platformShare);

        /// @dev Mise à jour des profits distribués
        totalDistributedProfits += distribution.tokenHolderShare;
        uint256 supply = totalSupply();
        require(supply > 0, "No tokens in circulation");

        /// @dev Distribution des profits par lots pour éviter les problèmes de gas
        uint256 batchSize = 50;
        uint256 startIndex = 0;
        
        while (startIndex < investorList.length) {
            uint256 endIndex = startIndex + batchSize;
            if (endIndex > investorList.length) {
                endIndex = investorList.length;
            }
            
            for (uint256 i = startIndex; i < endIndex; i++) {
                address addr = investorList[i];
                Investor storage inv = investors[addr];
                if (inv.totalTokens > 0) {
                    uint256 share = (distribution.tokenHolderShare * inv.totalTokens) / supply;
                    inv.unclaimedProfits += share;
                }
            }
            
            startIndex = endIndex;
        }

        emit ProfitsDistributed(msg.value);
    }

    /**
     * @dev Permet à un investisseur de réclamer ses profits
     * @notice L'investisseur doit attendre 4 ans après son dernier achat pour pouvoir réclamer ses profits
     */
    function claimProfits() external whenNotPaused canClaimProfits {
        uint256 share = calculateInvestorProfitShare(msg.sender);
        require(share > 0, "No profits to claim");

        investors[msg.sender].unclaimedProfits = 0;
        payable(msg.sender).transfer(share);

        emit ProfitsClaimed(msg.sender, share);
    }

    /**
     * @dev Calcule le prix en POL pour un montant donné de tokens
     * @param amount Nombre de tokens pour lequel calculer le prix
     * @return Le prix en POL pour le montant spécifié
     */
    function getCurrentPriceInPOL(uint256 amount) public view returns (uint256) {
        (, int256 eurUsdPrice,,,) = eurUsdPriceFeed.latestRoundData();
        (, int256 polUsdPrice,,,) = polUsdPriceFeed.latestRoundData();
        require(eurUsdPrice > 0 && polUsdPrice > 0, "Invalid price feed data");
        uint256 priceInEur = (amount * TOKEN_PRICE_EUR) / 10**18;
        return (priceInEur * uint256(eurUsdPrice)) / (uint256(polUsdPrice) * 10**PRICE_FEED_DECIMALS);
    }

    /**
     * @dev Calcule la part de profits d'un investisseur
     * @param investor L'adresse de l'investisseur
     * @return La part de profits calculée pour l'investisseur
     */
    function calculateInvestorProfitShare(address investor) public view returns (uint256) {
        if (investors[investor].totalTokens == 0) return 0;
        return (investors[investor].unclaimedProfits * investors[investor].totalTokens) / totalSupply();
    }

    /**
     * @dev Calcule le prix de rachat en POL pour un montant donné de tokens
     * @param amount Nombre de tokens pour lequel calculer le prix de rachat
     * @return Le prix de rachat en POL pour le montant spécifié
     */
    function getBuybackPriceInPOL(uint256 amount) public view returns (uint256) {
        return getCurrentPriceInPOL(amount);
    }

    /**
     * @dev Récupère un résumé complet des investissements d'un investisseur
     * @param investor L'adresse de l'investisseur
     * @return balance Le solde de tokens de l'investisseur
     * @return unclaimedProfit Les profits non réclamés
     * @return profitClaimTime Le temps restant avant de pouvoir réclamer les profits
     * @return isWhitelisted Si l'investisseur est whitelisté
     * @return totalInvested Le montant total investi
     */
    function getInvestmentSummary(address investor) external view returns (
        uint256 balance,
        uint256 unclaimedProfit,
        uint256 profitClaimTime,
        bool isWhitelisted,
        uint256 totalInvested
    ) {
        Investor memory investorData = investors[investor];
        return (
            investorData.totalTokens,
            investorData.unclaimedProfits,
            investorData.lastPurchaseTime + PROFIT_CLAIM_PERIOD,
            investorData.whitelisted,
            investorData.totalInvested
        );
    }

    /**
     * @dev Ajoute une adresse à la whitelist
     * @param investor L'adresse à whitelister
     */
    function whitelistInvestor(address investor) external onlyOwner {
        require(investor != address(0), "Invalid address");
        investors[investor].whitelisted = true;
        emit InvestorWhitelisted(investor);
    }

    /**
     * @dev Retire une adresse de la whitelist
     * @param investor L'adresse à retirer de la whitelist
     */
    function removeFromWhitelist(address investor) external onlyOwner {
        require(investor != address(0), "Invalid address");
        investors[investor].whitelisted = false;
        emit InvestorRemovedFromWhitelist(investor);
    }

    /**
     * @dev Change le statut du workflow
     * @param newStatus Le nouveau statut à définir
     */
    function changeWorkflowStatus(WorkflowStatus newStatus) external onlyOwner validWorkflowTransition(newStatus) {
        workflowStatus = newStatus;
        emit WorkflowStatusChanged(newStatus);
    }

    /**
     * @dev Met en pause le contrat
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Démet en pause le contrat
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Permet de retirer des tokens en cas d'urgence
     * @param token L'adresse du token à retirer
     * @param amount Le montant à retirer
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(this), "Cannot withdraw contract's own token");
        require(amount > 0, "Amount must be greater than 0");
        if (token == address(0)) {
            require(amount <= address(this).balance, "Insufficient contract balance");
            payable(owner()).transfer(amount);
        } else {
            require(amount <= IERC20(token).balanceOf(address(this)), "Insufficient token balance");
            IERC20(token).transfer(owner(), amount);
        }
        emit EmergencyWithdraw(token, amount);
    }
    /// @dev Prix de rachat stocké une seule fois pour tous les batchs de rachat
    uint256 private buybackPriceFinal;
    /**
     * @dev Exécute le rachat batché des tokens par la société
     * @param start Index de départ dans la liste des investisseurs
     * @param end Index de fin (exclusif) dans la liste des investisseurs
     */
    function buybackByCompanyBatch(uint256 start, uint256 end) external payable onlyOwner whenNotPaused {
        require(msg.value > 0, "No funds for buyback");
        require(workflowStatus == WorkflowStatus.BuybackActive, "Buyback not active");
        require(end > start && end <= investorList.length, "Invalid index range");

        uint256 totalTokens = totalSupply();
        if (totalTokens == 0) revert NoTokensToBuyBack();

        /// @dev Calcul du prix de rachat une seule fois dans le premier batch
        if (start == 0) {
            buybackPriceFinal = getBuybackPriceInPOL(totalTokens);
            require(msg.value >= buybackPriceFinal, "Insufficient funds for buyback");
        }

        uint256 remainingFunds = msg.value - buybackPriceFinal;
        uint256 totalInvested = 0;

        for (uint256 i = start; i < end; i++) {
            address investor = investorList[i];
            if (investors[investor].totalTokens > 0) {
                totalInvested += investors[investor].totalInvested;
            }
        }

        for (uint256 i = start; i < end; i++) {
            address investor = investorList[i];
            if (investors[investor].totalTokens > 0) {
                uint256 investorShare = (investors[investor].totalInvested * remainingFunds) / totalInvested;
                if (investorShare > 0) {
                    payable(investor).transfer(investorShare);
                }
            }
        }

        /// @dev Burn et event à la fin du dernier batch uniquement
        if (end == investorList.length) {
            uint256 contractBalance = balanceOf(address(this));
            if (contractBalance < totalTokens) {
                revert NoTokensToBuyBack();
            }
            _burn(address(this), totalTokens);
            emit BuybackExecuted(buybackPriceFinal);
        }
    }

    /// @notice Appelé lorsqu'un envoi de POL natif est effectué sans data (ex : simple transfert)
    receive() external payable {
        require(msg.value > 0, "Receive: Zero value");
        emit Received(msg.sender, msg.value);
    }

    /// @notice Appelé lorsqu'un envoi de POL natif est accompagné de data mais n'appelle aucune fonction
    fallback() external payable {
        require(msg.value > 0, "Fallback: Zero value");
        emit FallbackCalled(msg.sender, msg.value, msg.data);
    }
}