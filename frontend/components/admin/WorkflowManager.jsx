'use client';
import { useWriteContract } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/constants';
import { useState } from 'react';

export default function WorkflowManager() {
  const [status, setStatus] = useState('0');
  
  const { writeContract: updateWorkflowStatus } = useWriteContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'nextWorkflowStatus',
    onSuccess: () => {
      console.log('Statut mis à jour avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour:', error);
    }
  });

  const handleUpdateStatus = () => {
    console.log('Tentative de mise à jour du statut');
    try {
      updateWorkflowStatus();
      console.log('Transaction envoyée à MetaMask');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la transaction:', error);
    }
  };

  return (
    <div>
      <h2>État du workflow</h2>
      <select onChange={(e) => setStatus(e.target.value)}>
        <option value="0">SaleNotStarted</option>
        <option value="1">SaleActive</option>
        <option value="2">SaleEnded</option>
        <option value="3">BuybackActive</option>
      </select>
      <button 
        onClick={handleUpdateStatus}
      >
        Mettre à jour
      </button>
    </div>
  );
}