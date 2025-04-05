// components/investor/TokenBalance.jsx
'use client';
import { useAccount, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/constants';

export default function TokenBalance() {
  const { address } = useAccount();
  
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  return (
    <div className="mb-4">
      <h2>Votre solde de tokens</h2>
      <p>{balance ? parseEther(balance.toString()) : '0'} STCT</p>
    </div>
  );
}