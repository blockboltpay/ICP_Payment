'use client';
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';

interface QrProps {
    isConnected: boolean;
}

const QrGen = ({ isConnected }: QrProps) => {
    const [recipientAddress, setRecipientAddress] = useState<string>('');
    const [satoAmount, setSatoAmount] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState('');
    const [qrValueApprove, setQrValueApprove] = useState('');

    useEffect(() => {
        if (isConnected) {
            //   balanceUpdate();
        }
    }, [isConnected]);

    const handleApproveClick = () => {
        if (recipientAddress && satoAmount) {  // Ensure recipientAddress and satoAmount are provided
            const qrData = `ckbtc:${recipientAddress}?amount=${satoAmount}`;
            setQrValueApprove(qrData);
        } else {
            setErrorMessage('Recipient address or amount not provided');
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center space-y-4">
            <div className="flex w-[80%] justify-between">
                <div className="flex flex-col items-center space-y-2 w-[48%]">
                    <input
                        type="text"
                        placeholder="Recipient Address"
                        className="text-black py-3 px-4 rounded w-full font-medium text-lg"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Amount in Satoshi"
                        className="text-black py-3 px-4 rounded w-full font-medium text-lg"
                        value={satoAmount}
                        onChange={(e) => setSatoAmount(e.target.value)}
                    />
                    <button onClick={handleApproveClick} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out">
                        Generate QR
                    </button>
                    {qrValueApprove && (
                        <QRCode value={qrValueApprove} size={256} level="H" includeMargin={true} />
                    )}
                </div>
            </div>
            {errorMessage && (
                <div className="error-message bg-red-500 text-white p-3 rounded">
                    {errorMessage}
                </div>
            )}
        </div>
    );
};

export default QrGen;