// backend/scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const company = process.env.COMPANY_WALLET;
  const platform = process.env.PLATFORM_WALLET;
  const eurUsdFeed = process.env.AMOY_EUR_USD_PRICE_FEED;
  const polUsdFeed = process.env.AMOY_POL_USD_PRICE_FEED;

  if (!company || !platform || !eurUsdFeed || !polUsdFeed) {
    throw new Error("Une ou plusieurs variables .env sont manquantes");
  }

  const StockToChain = await hre.ethers.getContractFactory("StockToChain");
  const contract = await StockToChain.deploy(
    eurUsdFeed,
    polUsdFeed,
    company,
    platform
  );

  await contract.waitForDeployment();
  console.log("✅ Contrat StockToChain déployé à :", contract.target);
}

main().catch((error) => {
  console.error("Erreur de déploiement :", error);
  process.exitCode = 1;
});
