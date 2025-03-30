'use client';
import StockToChain from "../components/StockToChain";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { useAccount } from "wagmi";
import { Frown } from 'lucide-react';

export default function Home() {

  const { isConnected } = useAccount();

  return (
    <div className="p-5">
      {isConnected ? (
        <StockToChain />
      ) : (
        <Alert className="bg-yellow-100">
          <Frown className="h-4 w-4" />
          <AlertTitle>Warning!</AlertTitle>
          <AlertDescription>
            You must connect your Wallet to use this DApp.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}