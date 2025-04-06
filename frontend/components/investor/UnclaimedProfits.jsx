// components/investor/UnclaimedProfits.jsx
'use client';
import { useAccount, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/constants';

export default function UnclaimedProfits() {
  const { address } = useAccount();
  
  const { data: unclaimedProfits, isError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'calculateInvestorProfitShare',
    args: [address],
  });

  const formatNumber = (number) => {
    if (!number) return "0";
    return new Intl.NumberFormat('fr-FR').format(number.toString());
  };

  return (
    <div className="mb-4">
      <h2>Profits non réclamés</h2>
      <p className="font-semibold">
        {isError ? "Erreur de chargement" : `${formatNumber(unclaimedProfits)} POL`}
      </p>
    </div>
  );
}