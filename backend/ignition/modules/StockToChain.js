const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
require('dotenv').config();

module.exports = buildModule("StockToChain", (m) => {
    // Get deployment parameters from environment variables
    const companyWallet = process.env.COMPANY_WALLET;
    const platformWallet = process.env.PLATFORM_WALLET;

    // Deploy EUR/USD mock
    const eurUsdPriceFeed = m.contract("MockV3Aggregator", [8, 100000000], { id: "EurUsdPriceFeed" }); // 8 decimals, 1.00 USD

    // Deploy POL/USD mock
    const polUsdPriceFeed = m.contract("MockV3Aggregator", [8, 100000000], { id: "PolUsdPriceFeed" }); // 8 decimals, 1.00 USD

    // Deploy the main contract using the mock addresses
    const stockToChain = m.contract("StockToChain", [
        eurUsdPriceFeed,
        polUsdPriceFeed,
        companyWallet,
        platformWallet
    ], { id: "StockToChain" });

    return {
        stockToChain,
        eurUsdPriceFeed,
        polUsdPriceFeed
    };
}); 