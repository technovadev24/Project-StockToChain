'use client';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/constants';
import DistributeProfits from '@/components/admin/DistributeProfits';
import WhitelistManager from '@/components/admin/WhitelistManager';
import WorkflowManager from '@/components/admin/WorkflowManager';
import StockToChain from '@/components/shared/StockToChain';  

export default function AdminPage() {
  const { address } = useAccount();
  
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Espace Administrateur</h1>
      
      <StockToChain /> 
      <DistributeProfits />
      <WhitelistManager />
      <WorkflowManager />
    </div>
  );
}