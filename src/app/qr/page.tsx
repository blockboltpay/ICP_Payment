'use client';
import React, { useEffect, useState } from 'react';
import Transfer from './Transfer';

const Bridge = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [currentView, setCurrentView] = useState('transfer');
    const nnsCanisterId = 'tyyy3-4aaaa-aaaaq-aab7a-cai';
    const transferCanister = 'bza44-ciaaa-aaaan-qlvna-cai';
    const whitelist = [nnsCanisterId, transferCanister];

    useEffect(() => {
        const checkConnection = async () => {
            if (window.ic && window.ic.plug) {
                const connected = await window.ic.plug.isConnected();
                setIsConnected(connected);
            }
        };

        checkConnection();
    }, []);

    const connectWallet = async () => {
        if (window.ic && window.ic.plug) {
            try {
                const publicKey = await window.ic.plug.requestConnect({
                    whitelist,
                });
                setIsConnected(true);
            } catch (error) {
                console.error('Connection declined:', error);
            }
        }
    };

    const disconnectWallet = async () => {
        if (window.ic && window.ic.plug) {
            try {
                await window.ic.plug.disconnect();
                setIsConnected(false);
            } catch (error) {
                console.error('Error disconnecting the wallet:', error);
            }
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen p-6">
            <div className="flex justify-between bg-gray-800 text-white p-4">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setCurrentView('transfer')}
                        className={`hover:bg-gray-700 px-3 py-2 rounded ${currentView === 'transfer' ? 'bg-gray-700' : ''}`}
                    >
                        Transfer
                    </button>
                    <button
                        onClick={() => setCurrentView('qr')}
                        className={`hover:bg-gray-700 px-3 py-2 rounded ${currentView === 'qr' ? 'bg-gray-700' : ''}`}
                    >
                        QR
                    </button>
                </div>
                <div className="wallet-connection">
                    {isConnected ? (
                        <button
                            onClick={disconnectWallet}
                            className="disconnect-wallet-button bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition duration-300 ease-in-out"
                        >
                            Disconnect Wallet
                        </button>
                    ) : (
                        <button
                            onClick={connectWallet}
                            className="connect-wallet-button bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded transition duration-300 ease-in-out"
                        >
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>
            {currentView === 'transfer' && <Transfer isConnected={isConnected} />}
        </div>
    );
};

export default Bridge;