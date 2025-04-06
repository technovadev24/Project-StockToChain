'use client';
import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/constants';

export default function BuyTokens() {
  const [amount, setAmount] = useState('1');
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [error, setError] = useState(null);
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  // Estimer le prix en POL
  const { data: estimated, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getCurrentPriceInPOL',
    args: [parseEther(amount || '0')],
    query: { enabled: !!amount },
  });

  useEffect(() => {
    if (estimated) {
      setEstimatedPrice(Number(estimated) / 1e18);
    }
  }, [estimated]);

  const handleBuy = async () => {
    setError(null);

    try {
      console.log('Envoi de la transaction...');
      const txHash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'buyTokens',
        args: [parseEther(amount)],
        value: estimated, // <------ valeur requise en POL
      });
      console.log('Transaction envoyée à MetaMask:', txHash);
    } catch (error) {
      console.error('Erreur transaction:', error);
      setError(error.message || "Erreur lors de l'achat de tokens");
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="font-bold text-lg">Acheter des tokens</h2>

      <input
        type="number"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          refetch(); // Met à jour le prix
        }}
        placeholder="Quantité de tokens"
        className="p-2 border rounded w-full"
      />

      {estimatedPrice && (
        <p className="text-sm text-gray-500">Prix estimé: {estimatedPrice.toFixed(8)} POL</p>
      )}

      <button
        onClick={handleBuy}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Acheter
      </button>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
