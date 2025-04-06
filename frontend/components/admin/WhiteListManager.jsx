'use client';
import { useWriteContract } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/constants';
import { useState } from 'react';
import { isAddress } from 'viem';

export default function WhitelistManager() {
  const [whitelistAddress, setWhitelistAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { writeContractAsync } = useWriteContract();

  const handleAddToWhitelist = async () => {
    console.log("Tentative d'ajout à la whitelist");
    setError(null);

    if (!isAddress(whitelistAddress)) {
      return setError("Adresse invalide");
    }

    setIsLoading(true);

    try {
      console.log("Envoi de la transaction...");
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'addToWhitelist',
        args: [[whitelistAddress]], // ✅ tableau de 1 adresse
      });

      console.log('Transaction envoyée :', txHash);
    } catch (err) {
      console.error("Erreur transaction :", err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWhitelist = async () => {
    console.log("Tentative de retrait de la whitelist");
    setError(null);

    if (!isAddress(whitelistAddress)) {
      return setError("Adresse invalide");
    }

    setIsLoading(true);

    try {
      console.log("Envoi de la transaction...");
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'removeFromWhitelist',
        args: [[whitelistAddress]], // ✅ également tableau
      });

      console.log('Transaction envoyée :', txHash);
    } catch (err) {
      console.error("Erreur transaction :", err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4 p-4 border rounded shadow bg-white">
      <h2 className="text-lg font-bold mb-2">Gestion de la whitelist</h2>

      <input
        type="text"
        placeholder="Adresse à whitelister (ex: 0x...)"
        value={whitelistAddress}
        onChange={(e) => setWhitelistAddress(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        disabled={isLoading}
      />

      <div className="flex gap-2">
        <button
          onClick={handleAddToWhitelist}
          disabled={isLoading}
          className={`p-2 rounded ${
            isLoading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          Ajouter
        </button>
        <button
          onClick={handleRemoveFromWhitelist}
          disabled={isLoading}
          className={`p-2 rounded ${
            isLoading ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          Retirer
        </button>
      </div>

      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
}
