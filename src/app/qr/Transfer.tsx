'use client';
import React, { useEffect, useState } from 'react';
import { Principal } from '@dfinity/principal';
import { idlFactory } from '@/utils/ledger.did';
import { idlFactoryB } from '@/utils/bolt.did';

interface TransferProps {
    isConnected: boolean;
}

const Transfer = ({ isConnected }: TransferProps) => {
    const [recipientAddress, setRecipientAddress] = useState<string>('');
    const [satoAmount, setSatoAmount] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState('');
    const MAINNET_LEDGER_CANISTER_ID = 'tyyy3-4aaaa-aaaaq-aab7a-cai';
    const transferCanister = 'bza44-ciaaa-aaaan-qlvna-cai';

    useEffect(() => {
        if (isConnected) {
            //   balanceUpdate();
        }
    }, [isConnected]);

    const approve = async () => {
        try {
            const canisterId = MAINNET_LEDGER_CANISTER_ID;
            const actor: any = await window.ic.plug.createActor({
                canisterId: canisterId,
                interfaceFactory: idlFactory,
            });
            const text = 'My first BTC transfer';
            const memo = Array.from(new TextEncoder().encode(text));
            const APPROVAL_FEE = BigInt(1000000);
            const totalApprovalAmount = BigInt(100000000) + APPROVAL_FEE;
            const expirationTime = BigInt(Date.now() + 5 * 60 * 1000) * BigInt(1000000);
            const exmple = await actor.icrc2_approve({
                from: Principal.fromText('zdc4v-k4yzm-xtjik-ofvho-rbn3q-o55zr-ubgsu-4xryy-fhtp2-qwa4q-rae'),
                spender: {
                    owner: Principal.fromText(transferCanister),
                    subaccount: [],
                },
                fee: [],
                memo: [memo],
                from_subaccount: [],
                created_at_time: [],
                expires_at: [expirationTime],
                expected_allowance: [],
                amount: totalApprovalAmount,
            });
        } catch (error: any) {
            console.error('Error in randomTransfers:', error);
            setErrorMessage(
                error.message || 'An error occurred during the transfer.'
            );
        }
    };

    const normal_transfer = async () => {
        try {
            const canisterId = 'bza44-ciaaa-aaaan-qlvna-cai';
            const actor: any = await window.ic.plug.createActor({
                canisterId: transferCanister,
                interfaceFactory: idlFactoryB,
            });
            const orderId = 4444555;
            const userPrincipal = Principal.fromText("yd6nc-eevu3-n2ubz-ztsq2-iodbn-hh4vr-xb33i-pz3as-ecpjm-yf7op-pae");
            const text = 'My first BTC transfer';
            const merchantName = "First Merchant";

            const transferArgs = {
                token_type: { GLDGov: null },
                amount: BigInt(1000),
                toAccount: {
                    owner: userPrincipal,
                    subaccount: [],
                },
                order_id: orderId,
                merchant_name: merchantName
            };
            const example = await actor.transfer(transferArgs);
            // console.log(example);
        } catch (error: any) {
            console.error('Error in randomTransfers:', error);
            setErrorMessage(
                error.message || 'An error occurred during the transfer.'
            );
        }
    };

    const createOrder = async () => {
        try {
            const actor: any = await window.ic.plug.createActor({
                canisterId: transferCanister,
                interfaceFactory: idlFactoryB,
            });
            const orderResult = await actor.createOrder(BigInt(1001));
            const order = orderResult.ok;
            const paymentPrincipal = Principal.fromUint8Array(order.paymentAddress);
            const paymentAddress = order.paymentAddress;
            if (paymentAddress.paymentAddress) {
                // console.log("Subaccount (Hex):", Buffer.from(paymentAddress.paymentAddress).toString('hex'));
            } else {
                // console.log("No subaccount specified");
            }
            const canisterPrincipal = order.paymentAddress.owner;
            const subaccountBlob = order.paymentAddress.subaccount[0];
            const icrcAccount = {
                owner: canisterPrincipal,
                subaccount: subaccountBlob ? [Array.from(subaccountBlob)] : [],
            };
        } catch (error) { }
    }
    const checkPaymentStatus = async () => {
        try {
            const actor: any = await window.ic.plug.createActor({
                canisterId: transferCanister,
                interfaceFactory: idlFactoryB,
            });
            const statusResult = await actor.checkPaymentStatus(BigInt(10));
        } catch (error) { }
    }

    const getTransferStatusasync = async () => {
        const orderId = 77885
        try {
            const actor: any = await window.ic.plug.createActor({
                canisterId: transferCanister,
                interfaceFactory: idlFactoryB,
            });
            const status = await actor.getTransferStatus(orderId);
            return status;
        } catch (error) {
            console.error('Error getting transfer status:', error);
            throw error;
        }
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center space-y-4">
            <div className="flex flex-col items-center space-y-2 w-[50%]">
                <input
                    type="number"
                    placeholder="Amount in Satoshi"
                    className="text-black py-3 px-4 rounded w-full font-medium text-lg"
                    value={satoAmount}
                    onChange={(e) => setSatoAmount(e.target.value)}
                />
                <button
                    onClick={approve}
                    className="connect-wallet-button bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out"
                >
                    Approve
                </button>
                <input
                    type="text"
                    placeholder="Recipient Address"
                    className="text-black py-3 px-4 rounded w-full font-medium text-lg"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                />
                <button
                    onClick={normal_transfer}
                    className="connect-wallet-button bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out"
                >
                    Transfer
                </button>
                <button
                    onClick={getTransferStatusasync}
                    className="connect-wallet-button bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out"
                >
                    Transfer Status
                </button>
                <button
                    onClick={createOrder}
                    className="connect-wallet-button bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out"
                >
                    Verify Transfer / create Order
                </button>
                <button
                    onClick={checkPaymentStatus}
                    className="connect-wallet-button bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out"
                >
                    Order Completed
                </button>
            </div>
            {errorMessage && (
                <div className="error-message bg-red-500 text-white p-3 rounded">
                    {errorMessage}
                </div>
            )}
        </div>
    );
};

export default Transfer;