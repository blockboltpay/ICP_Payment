'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '@/utils/ledger.did';
import { idlFactoryB } from '@/utils/bolt.did';
import { sound_box_url, sound_provider_id } from '@/utils';
interface TransferProps {
  isConnected: boolean;
}

const Transfer = ({ isConnected }: TransferProps) => {
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [satoAmount, setSatoAmount] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const MAINNET_LEDGER_CANISTER_ID = 'xevnm-gaaaa-aaaar-qafnq-cai';
  const transferCanister = 'bza44-ciaaa-aaaan-qlvna-cai';

  useEffect(() => {
    if (isConnected) {
      //   balanceUpdate();
    }
  }, [isConnected]);


  const txnWithSoundBox = (getAmount: any, coin: string) => {
    const data = {
      device_id: "nQ8uwTe1p7n",
      ip_key: sound_provider_id,
      text: `Received ${getAmount} ${coin} on ICP chain On Blockbolt`,
    };
    try {
      axios
        .post(sound_box_url, data)
        .then(() => { })
        .catch(() => { });
    } catch (error: any) { }
  };

  const approve = async () => {
    try {
      const canisterId = MAINNET_LEDGER_CANISTER_ID;
      const actor: any = await window.ic.plug.createActor({
        canisterId: canisterId,
        interfaceFactory: idlFactory,
      });
      const text = 'My first BTC transfer';
      const memo = Array.from(new TextEncoder().encode(text));
      const APPROVAL_FEE = BigInt(10000);
      const totalApprovalAmount = BigInt(10000) + APPROVAL_FEE;
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
      // console.log('example', exmple);
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
        token_type: { ckUSDC: null },
        amount: BigInt(10000),
        toAccount: {
          owner: userPrincipal,
          subaccount: [],
        },
        order_id: orderId,
        merchant_name: merchantName
      };
      const example = await actor.transfer(transferArgs);
      txnWithSoundBox(BigInt(10000), 'ICP');
    } catch (error: any) {
      console.error('Error in randomTransfers:', error);
      setErrorMessage(
        error.message || 'An error occurred during the transfer.'
      );
    }
  };

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

  const verifyTransfer = async () => {
    const orderId = 46356;
    const transferCanister = "bza44-ciaaa-aaaan-qlvna-cai";
    try {
      const agent = await HttpAgent.create({ host: 'https://ic0.app' });
      await agent.fetchRootKey();
      const actor = Actor.createActor(idlFactoryB, {
        agent,
        canisterId: transferCanister,
      });
      const result = await actor.getTransferStatus(orderId);
      return result;
    } catch (error) {
      console.error('Error verifying transfer:', error);
      throw error;
    }
  };

  const isOrderCompleted = async () => {
    const orderId = 45865
    try {
      const actor: any = await window.ic.plug.createActor({
        canisterId: transferCanister,
        interfaceFactory: idlFactoryB,
      });
      const re = await actor.isOrderCompleted(orderId);
      return
    } catch (error) {
      console.error('Error checking order completion:', error);
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
          onClick={verifyTransfer}
          className="connect-wallet-button bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out"
        >
          Verify Transfer
        </button>
        <button
          onClick={isOrderCompleted}
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