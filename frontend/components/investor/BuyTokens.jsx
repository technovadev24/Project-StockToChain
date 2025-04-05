// components/investor/BuyTokens.jsx
'use client';
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/constants';
import { useState } from 'react';

export default function BuyTokens() {
  const [amount, setAmount] = useState('');
  
  const { writeContract: buyTokens } = useWriteContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'buyTokens',
  });

  return (
    <div className="mb-4">
      <h2>Acheter des tokens</h2>
      <input 
        type="number" 
        placeholder="Quantité de tokens"
        onChange={(e) => setAmount(e.target.value)}
      />
      <button 
        onClick={() => buyTokens({ args: [parseEther(amount)] })}
      >
        Acheter
      </button>
    </div>
  );
}