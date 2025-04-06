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

  const handleClaimProfits = async () => {
    console.log('Tentative de réclamation des profits');

    try {
      console.log('Envoi de la transaction...');
      const tx = await claimProfits();

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
    <div>
      <button onClick={handleClaimProfits}>
        Réclamer les profits
      </button>
    </div>
  );
}