'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import Header from './Header'
import Footer from './Footer'

const Layout = ({ children}) => {
  const router = useRouter();
  const { address } = useAccount();
  
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  useEffect(() => {
    console.log('Connected address:', address);
    console.log('Contract owner:', owner);
    console.log('Contract address:', CONTRACT_ADDRESS);
    
    if (address) {
      if (address === owner) {
        console.log('Redirecting to admin');
        router.push('/admin');
      } else {
        console.log('Redirecting to investor');
        router.push('/investor');
      }
    }
  }, [address, owner, router]);

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
    </div>
  )
}

export default Layout
