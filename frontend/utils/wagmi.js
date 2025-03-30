import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  hardhat
} from 'wagmi/chains'; 

import { http } from 'viem';

export const config = getDefaultConfig({
  appName: 'StockToChain',
  projectId: 'f21b4828b314fed0671b2d549a5b7a45',
  chains: [
    hardhat
  ],
  ssr: true,
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545')
  }
});