'use client';
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/constants';
import { useState } from 'react';

export default function DistributeProfits() {
  const [amount, setAmount] = useState('');

  const { writeContract } = useWriteContract();

  const handleDistribute = async () => {
    console.log('Tentative de distribution des profits');

    if (!amount || Number(amount) <= 0) {
      return console.error("Veuillez entrer un montant supérieur à 0");
    }

    try {
      const value = parseEther(amount);
      console.log('Montant en wei:', value.toString());

      console.log('Envoi de la transaction...');
      const tx = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'distributeProfits',
        value: value
      });

      if (tx) {
        console.log('Transaction envoyée à MetaMask:', tx);
        // Attendre la confirmation de la transaction
        const receipt = await tx.wait();
        console.log('Transaction confirmée:', receipt);
      } else {
        console.error('La transaction n\'a pas été envoyée');
      }
    } catch (error) {
      console.error('Erreur transaction:', error);
      if (error?.cause?.message) {
        console.error('Cause probable:', error.cause.message);
      }
      if (error?.data) {
        console.error('Données d\'erreur:', error.data);
      }
    }
  };

  return (
    <div className="mb-4">
      <h2>Distribution des profits</h2>
      <input 
        type="number" 
        placeholder="Montant en POL (ex: 0.1)"
        step="0.01"
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleDistribute}>
        Distribuer
      </button>
    </div>
  );
}
