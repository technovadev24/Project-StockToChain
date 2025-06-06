'use client'; 
import { useState, useEffect } from "react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/constants";
import { useReadContract, useWatchContractEvent } from "wagmi";

const StockToChain = () => {
    // Lecture des données du contrat
    const { data: totalSupply, isError: isTotalSupplyError } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'totalSupply',
    });

    const { data: workflowStatus, isError: isWorkflowStatusError } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'workflowStatus',
    });

    const { data: currentPrice, isError: isCurrentPriceError } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getCurrentPriceInPOL',
    });

    // Écoute des événements importants
    useWatchContractEvent({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        eventName: 'TokensPurchased',
        onLogs(logs) {
            console.log('Nouveaux tokens achetés:', logs);
        },
    });

    useWatchContractEvent({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        eventName: 'ProfitsDistributed',
        onLogs(logs) {
            console.log('Profits distribués:', logs);
        },
    });

    // Fonction pour convertir le statut en texte lisible
    const getStatusText = (status) => {
        switch(status) {
            case 0: return "Initial";
            case 1: return "En cours de vente";
            case 2: return "Vente terminée";
            case 3: return "Distribution des profits";
            default: return "Statut inconnu";
        }
    };

    // Fonction pour formater les nombres
    const formatNumber = (number) => {
        if (!number) return "Chargement...";
        return new Intl.NumberFormat('fr-FR').format(number.toString());
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-xl font-bold mb-4">Informations du Contrat</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Total Supply</p>
                    <p className="font-semibold">
                        {isTotalSupplyError ? "Erreur de chargement" : formatNumber(totalSupply)}
                    </p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Statut</p>
                    <p className="font-semibold">
                        {isWorkflowStatusError ? "Erreur de chargement" : getStatusText(workflowStatus)}
                    </p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Prix actuel</p>
                    <p className="font-semibold">
                        {isCurrentPriceError ? "Erreur de chargement" : `${formatNumber(currentPrice)} POL`}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default StockToChain