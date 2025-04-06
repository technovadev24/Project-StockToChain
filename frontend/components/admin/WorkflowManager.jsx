'use client';
import { useWriteContract, useReadContract, useAccount, usePublicClient } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/constants';
import { useState } from 'react';

export default function WorkflowManager() {
  const { writeContractAsync } = useWriteContract(); // ✅ version async pour récupérer le hash
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [status, setStatus] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lecture du statut actuel
  const { data: currentStatus, isError: isStatusError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'workflowStatus',
  });

  // Lecture du propriétaire
  const { data: owner, isError: isOwnerError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const handleUpdateStatus = async () => {
    if (isLoading || !address || !owner || currentStatus === undefined) return;

    const newStatus = parseInt(status);
    const current = Number(currentStatus);

    console.log('Tentative de mise à jour du statut');
    console.log('Adresse connectée:', address);
    console.log('Propriétaire du contrat:', owner);
    console.log('Statut actuel:', current, '→ Nouveau statut :', newStatus);

    const isValidTransition =
      (current === 0 && newStatus === 1) ||
      (current === 1 && newStatus === 2) ||
      (current === 2 && newStatus === 3);

    if (!isValidTransition) {
      setError("Transition invalide selon le workflow. Respecte l'ordre : 0 → 1 → 2 → 3.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'updateWorkflowStatus',
        args: [newStatus],
      });

      console.log('Transaction envoyée :', txHash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log('Transaction confirmée :', receipt);
    } catch (err) {
      console.error('Erreur transaction :', err);
      setError(err.message || 'Erreur pendant la transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">État du workflow</h2>

      <div className="space-y-2 mb-4">
        {isStatusError ? (
          <p className="text-red-500">Erreur lors du chargement du statut actuel</p>
        ) : (
          <p>Statut actuel: {currentStatus?.toString()}</p>
        )}

        {isOwnerError ? (
          <p className="text-red-500">Erreur lors de la vérification du propriétaire</p>
        ) : (
          <p>Propriétaire: {owner}</p>
        )}

        <p>Adresse connectée: {address}</p>
      </div>

      <div className="space-y-4">
        <select
          onChange={(e) => setStatus(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={isLoading}
        >
          <option value="0">SaleNotStarted</option>
          <option value="1">SaleActive</option>
          <option value="2">SaleEnded</option>
          <option value="3">BuybackActive</option>
        </select>

        <button
          onClick={handleUpdateStatus}
          disabled={isLoading}
          className={`w-full p-2 rounded ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isLoading ? 'Mise à jour en cours...' : 'Mettre à jour'}
        </button>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}
