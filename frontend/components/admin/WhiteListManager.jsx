'use client';
import { useWriteContract } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/constants';
import { useState } from 'react';

export default function WhitelistManager() {
  const [whitelistAddress, setWhitelistAddress] = useState('');
  
  const { writeContract: addToWhitelist } = useWriteContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'addToWhitelist',
    onSuccess: () => {
      console.log('Adresse ajoutée à la whitelist');
    },
    onError: (error) => {
      console.error('Erreur lors de l\'ajout:', error);
    }
  });

  const { writeContract: removeFromWhitelist } = useWriteContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'removeFromWhitelist',
    onSuccess: () => {
      console.log('Adresse retirée de la whitelist');
    },
    onError: (error) => {
      console.error('Erreur lors du retrait:', error);
    }
  });

  const handleAddToWhitelist = () => {
    console.log('Tentative d\'ajout à la whitelist:', whitelistAddress);
    try {
      addToWhitelist({ args: [whitelistAddress] });
      console.log('Transaction d\'ajout envoyée à MetaMask');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la transaction:', error);
    }
  };

  const handleRemoveFromWhitelist = () => {
    console.log('Tentative de retrait de la whitelist:', whitelistAddress);
    try {
      removeFromWhitelist({ args: [whitelistAddress] });
      console.log('Transaction de retrait envoyée à MetaMask');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la transaction:', error);
    }
  };

  return (
    <div className="mb-4">
      <h2>Gestion de la whitelist</h2>
      <input 
        type="text" 
        placeholder="Adresse à whitelister"
        onChange={(e) => setWhitelistAddress(e.target.value)}
      />
      <button 
        onClick={handleAddToWhitelist}
      >
        Ajouter
      </button>
      <button 
        onClick={handleRemoveFromWhitelist}
      >
        Retirer
      </button>
    </div>
  );
}