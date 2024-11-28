import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Button } from "@/components/ui/button";
import { XIcon } from "@/components/Icons";
import { Card, CardHeader, CardFooter, CardTitle, CardContent } from "@/components/ui/card"
import { ExternalLinkIcon } from '@radix-ui/react-icons';

interface ScanData {
    token_type: {
        [key: string]: null;
    };
    amount: string;
    merchant_address: string;
    order_id: number;
    merchant_name: string;
    network: string;
    coin_name: string;
    blockchain: string;
    canister_id: string;
    blockbolt_canister_id: string;
}

interface ScanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProcess: (scanData: any) => Promise<any>;
    isProcessing: boolean;
    scanData: any;
    setScanData: React.Dispatch<React.SetStateAction<ScanData>>;
}

const ScanModal: React.FC<ScanModalProps> = ({
    isOpen,
    onClose,
    onProcess,
    isProcessing,
    scanData,
    setScanData
}) => {
    const [error, setError] = useState<string | null>(null);
    const [transferResult, setTransferResult] = useState<any | null>(null);

    const handleScan = (result: any) => {
        if (result) {
            try {
                const scannedData = result?.text || result;
                const parsedData = JSON.parse(scannedData);
                if (parsedData.token_type && parsedData.amount && parsedData.merchant_address && parsedData.order_id && parsedData.merchant_name) {
                    setScanData(parsedData);
                    setError(null);
                } else {
                    throw new Error("Invalid QR code data structure");
                }
            } catch (error) {
                console.error('Error parsing QR code data:', error);
                setError(`Error parsing QR code data: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    };

    const handleProcess = async () => {
        if (scanData && !isProcessing) {
            try {
                const result = await onProcess(scanData);
                setTransferResult(result);
                setError(null);
            } catch (error) {
                console.error('Processing error:', error);
                setError(`Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    };

    if (!isOpen) return null;

    const formatTransferResult = (result: any): string => {
        if (typeof result === 'object' && result !== null) {
            return Object.entries(result)
                .map(([key, value]) => {
                    if (typeof value === 'bigint') {
                        return `${key}: ${value.toString()}`;
                    } else if (typeof value === 'object' && value !== null) {
                        return `${key}: ${formatTransferResult(value)}`;
                    } else {
                        return `${key}: ${value}`;
                    }
                })
                .join('\n');
        }
        return String(result);
    };

    const serializeBigInt = (obj: any): any => {
        if (typeof obj === 'bigint') {
            return obj.toString();
        } else if (Array.isArray(obj)) {
            return obj.map(serializeBigInt);
        } else if (typeof obj === 'object' && obj !== null) {
            return Object.fromEntries(
                Object.entries(obj).map(([key, value]) => [key, serializeBigInt(value)])
            );
        }
        return obj;
    };

    const getExplorerLink = (tokenType: string, transactionId: string) => {
        switch (tokenType) {
            case 'ICP':
                return `https://dashboard.internetcomputer.org/transaction/${transactionId}`;
            case 'ckBTC':
                return `https://dashboard.internetcomputer.org/bitcoin/transaction/${transactionId}`;
            case 'ckETH':
                return `https://dashboard.internetcomputer.org/ethereum/transaction/${transactionId}`;
            case 'ckUSDC':
                return `https://dashboard.internetcomputer.org/ethereum/transaction/xevnm-gaaaa-aaaar-qafnq-cai/${transactionId}`;
            case 'glvgov':
                return `https://dashboard.internetcomputer.org/sns/tw2vt-hqaaa-aaaaq-aab6a-cai/transaction/${transactionId}`;
            default:
                return '';
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="relative">
                    <h2 className="text-lg font-medium">Transaction Details</h2>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={onClose}>
                        <XIcon className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    {Object.keys(scanData).length > 0 ? (
                        <div className="space-y-2">
                            <div className="grid gap-1">
                                <p className="text-sm text-muted-foreground">Merchant</p>
                                <p className="font-medium">{scanData.merchant_name}</p>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm text-muted-foreground">Recipient Address</p>
                                <p className="font-medium">{scanData.merchant_address.slice(0, 10)}...{scanData.merchant_address.slice(-10)}</p>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="font-medium">{scanData.amount} {Object.keys(scanData.token_type)[0]}</p>
                            </div>
                            {transferResult && (
                                <div className="grid gap-2">
                                    <p className="text-sm text-muted-foreground">Transfer Result</p>
                                    <pre className="bg-muted p-2 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                                        {formatTransferResult(transferResult)}
                                    </pre>
                                    {transferResult.Ok && (
                                        <a
                                            href={getExplorerLink(Object.keys(scanData.token_type)[0], transferResult.Ok.toString())}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                        >
                                            View Transaction on Explorer
                                            <ExternalLinkIcon className="ml-2 h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <QrReader
                            onResult={handleScan}
                            constraints={{ facingMode: 'environment' }}
                            containerStyle={{ width: '100%' }}
                        />
                    )}
                </CardContent>
                <CardFooter>
                    {Object.keys(scanData).length > 0 && !transferResult && (
                        <Button
                            className="w-full"
                            onClick={handleProcess}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Approve & Transfer'}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default ScanModal;

