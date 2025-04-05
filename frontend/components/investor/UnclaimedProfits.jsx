// components/investor/UnclaimedProfits.jsx
'use client';
import { useAccount, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/constants';

export default function UnclaimedProfits() {
  const { address } = useAccount();
  
  const { data: unclaimedProfits } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'calculateInvestorProfitShare',
    args: [address],
  });

  return (
    <div className="mb-4">
      <h2>Profits non réclamés</h2>
      <p>{unclaimedProfits ? parseEther(unclaimedProfits.toString()) : '0'} POL</p>
    </div>
  );
}