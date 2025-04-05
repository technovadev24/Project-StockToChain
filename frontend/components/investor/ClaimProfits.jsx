// components/investor/ClaimProfits.jsx
'use client';
import { useWriteContract } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/constants';

export default function ClaimProfits() {
  const { writeContract: claimProfits } = useWriteContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'claimProfits',
  });

  return (
    <div>
      <button 
        onClick={() => claimProfits()}
      >
        Réclamer les profits
      </button>
    </div>
  );
}