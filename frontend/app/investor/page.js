'use client';
import { useAccount } from 'wagmi';
import TokenBalance from '@/components/investor/TokenBalance';
import UnclaimedProfits from '@/components/investor/UnclaimedProfits';
import BuyTokens from '@/components/investor/BuyTokens';
import ClaimProfits from '@/components/investor/ClaimProfits';
import StockToChain from '@/components/shared/StockToChain';

export default function InvestorPage() {
  const { address } = useAccount();

  if (!address) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Espace Investisseur</h1>
        <p>Veuillez connecter votre wallet pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Espace Investisseur</h1>
      
      <StockToChain />
      <TokenBalance />
      <UnclaimedProfits />
      <BuyTokens />
      <ClaimProfits />
    </div>
  );
}