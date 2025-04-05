'use client';
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/constants';
import { useState } from 'react';

export default function DistributeProfits() {
  const [amount, setAmount] = useState('');
  
  const { writeContract: distributeProfits } = useWriteContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'distributeProfits',
    onSuccess: () => {
      console.log('Profits distribués avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors de la distribution:', error);
    }
  });

  const handleDistribute = () => {
    console.log('Clic sur le bouton Distribuer');
    console.log('Montant:', amount);
    if (amount) {
      console.log('Tentative d\'envoi de la transaction...');
      try {
        distributeProfits({ value: parseEther(amount) });
        console.log('Transaction envoyée à MetaMask');
      } catch (error) {
        console.error('Erreur lors de l\'envoi de la transaction:', error);
      }
    } else {
      console.log('Veuillez entrer un montant');
    }
  };

  return (
    <div className="mb-4">
      <h2>Distribution des profits</h2>
      <input 
        type="number" 
        placeholder="Montant en POL"
        onChange={(e) => setAmount(e.target.value)}
      />
      <button 
        onClick={handleDistribute}
      >
        Distribuer
      </button>
    </div>
  );
}