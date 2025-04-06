# StockToChain

A decentralized platform for tokenizing distillery assets with guaranteed buyback, built on Polygon Amoy testnet.

## Overview

StockToChain is a smart contract-based platform that allows investors to:
- Purchase tokens representing distillery assets
- Receive guaranteed profits after 4 years
- Participate in a transparent and secure investment ecosystem

## Features

- Token sale with whitelist mechanism
- Automated profit distribution
- Guaranteed buyback program
- Real-time price feeds using Chainlink
- Multi-stage workflow management
- Emergency withdrawal functionality

## Technical Stack

- Smart Contracts: Solidity 0.8.28
- Network: Polygon Amoy testnet
- Price Feeds: Chainlink Aggregator V3
- Frontend: Next.js with wagmi v2
- Testing: Hardhat with Chai

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet
- MATIC tokens for gas fees

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/StockToChain.git
cd StockToChain
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables:
```bash
# In backend/.env
RPC_URL=http://127.0.0.1:8545
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_private_key
COMPANY_WALLET=your_company_wallet
PLATFORM_WALLET=your_platform_wallet
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Chainlink Price Feeds
AMOY_EUR_USD_PRICE_FEED=0x7d7356BF7131eCF77DcCFa3a9D62f9B0D82c5D5
AMOY_POL_USD_PRICE_FEED=0xd9F615A8F8C994Be37F7bb6Df3BCFe899246C80e
```

## Development

1. Start local Hardhat node:
```bash
cd backend
npx hardhat node
```

2. Deploy contracts locally:
```bash
npx hardhat run scripts/deploy.js --network hardhat
```

3. Start frontend development server:
```bash
cd frontend
npm run dev
```

## Deployment

1. Deploy to Polygon Amoy testnet:
```bash
cd backend
npx hardhat run scripts/deploy.js --network amoy
```

2. Verify contract on Polygonscan Amoy:
```bash
npx hardhat verify --network amoy DEPLOYED_CONTRACT_ADDRESS
```

## Testing

Run the test suite:
```bash
cd backend
npx hardhat test
```

## Contract Addresses

- Polygon Amoy testnet: [Contract Address](https://amoy.polygonscan.com/address/YOUR_CONTRACT_ADDRESS)
- Chainlink Price Feeds:
  - EUR/USD: 0x7d7356BF7131eCF77DcCFa3a9D62f9B0D82c5D5
  - POL/USD: 0xd9F615A8F8C994Be37F7bb6Df3BCFe899246C80e

## Security

- Contract audited
- OpenZeppelin contracts used
- ReentrancyGuard implemented
- Pausable functionality for emergencies
- Whitelist mechanism for controlled access

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request