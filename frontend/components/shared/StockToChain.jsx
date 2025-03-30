'use client'; 
import { useState, useEffect } from "react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/constants";
import { useReadContract, useWatchContractEvent, useWaitForTransactionReceipt, useAccount } from "wagmi";
