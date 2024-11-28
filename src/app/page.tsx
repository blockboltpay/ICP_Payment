"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactoryB } from '@/utils/bolt.did';
import { idlFactory } from '@/utils/ledger.did';
import { sound_box_url, sound_provider_id } from '@/utils';
import ScanModal from '@/components/Modal';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CoinsIcon, LogOutIcon, ScanIcon } from "@/components/Icons";

type TokenType = { 'ckBTC': null } | { 'ckETH': null } | { 'ICP': null } | { 'ckUSDC': null } | { 'GLDGov': null };
interface TransferArgs {
  token_type: TokenType;
  amount: bigint;
  toAccount: {
    owner: Principal;
    subaccount: number[];
  };
  order_id: number;
  merchant_name: string;
}
interface CanisterActor {
  transfer: (args: TransferArgs) => Promise<{ 'Ok': bigint } | { 'Err': string }>;
  getTransferStatus: (orderId: number) => Promise<any>;
}
interface TokenActor {
  icrc1_balance_of: (account: { owner: Principal; subaccount: number[] }) => Promise<bigint>;
  icrc2_allowance: (args: { account: { owner: Principal; subaccount: number[] }, spender: { owner: Principal; subaccount: number[] } }) => Promise<{ allowance: bigint }>;
  icrc2_approve: (args: any) => Promise<any>;
}

const II = () => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [actor, setActor] = useState<CanisterActor | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPrincipal, setUserPrincipal] = useState<string | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanData, setScanData] = useState<any>({});
  const [balances, setBalances] = useState<{ ICP: bigint; ckBTC: bigint; ckETH: bigint, ckUSDC: bigint, GLDGov: bigint }>({
    ICP: BigInt(0),
    ckBTC: BigInt(0),
    ckETH: BigInt(0),
    ckUSDC: BigInt(0),
    GLDGov: BigInt(0)
  });
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const icpCanisterId = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
  const ckETHCanisterId = 'ss2fx-dyaaa-aaaar-qacoq-cai';
  const ckBTCCanisterId = 'mxzaz-hqaaa-aaaar-qaada-cai';
  const ckUSDCCanisterId = 'ss2fx-dyaaa-aaaar-qacoq-cai';
  const GLDGovCanisterId = 'tyyy3-4aaaa-aaaaq-aab7a-cai';
  const transferCanisterId = "bza44-ciaaa-aaaan-qlvna-cai";

  useEffect(() => {
    initializeAuthClient();
  }, []);

  const initializeAuthClient = async () => {
    const client = await AuthClient.create();
    setAuthClient(client);
    if (await client.isAuthenticated()) {
      handleAuthenticated(client);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
    }
  };

  const login = async () => {
    if (authClient) {
      try {
        await authClient.login({
          identityProvider: "https://identity.ic0.app",
          onSuccess: () => handleAuthenticated(authClient),
          onError: (error) => {
            console.error('Login error:', error);
          },
        });
      } catch (error) {
        console.error('Authentication error:', error);
      }
    } else {
      console.error('AuthClient not initialized');
    }
  };

  const logout = async () => {
    if (authClient) {
      await authClient.logout();
      setIsAuthenticated(false);
      setUserPrincipal(null);
      setActor(null);
      setBalances({ ICP: BigInt(0), ckBTC: BigInt(0), ckETH: BigInt(0), ckUSDC: BigInt(0), GLDGov: BigInt(0) });
    }
  };

  const handleAuthenticated = async (client: AuthClient) => {
    try {
      const identity = client.getIdentity();
      const principal = identity.getPrincipal().toString();
      setUserPrincipal(principal);
      const agent = await HttpAgent.create({ identity, host: 'https://ic0.app' });
      await agent.fetchRootKey();
      const actor = Actor.createActor<CanisterActor>(idlFactoryB, {
        agent,
        canisterId: transferCanisterId,
      });
      setActor(actor);
      setIsAuthenticated(true);
      await updateBalances(agent, principal);
    } catch (error) {
      console.error('Error in handleAuthenticated:', error);
    }
  };

  const formatTokenAmount = (amount: bigint, decimals: number = 8, displayDecimals: number = 4): string => {
    const wholePart = amount / BigInt(10 ** decimals);
    const fractionalPart = amount % BigInt(10 ** decimals);
    const decimalString = `${wholePart}.${fractionalPart.toString().padStart(decimals, '0')}`;
    const formattedNumber = parseFloat(decimalString).toFixed(displayDecimals);
    return formattedNumber.replace(/\.?0+$/, '');
  };

  const parseTokenInput = (input: string, tokenType: string): bigint => {
    const value = parseFloat(input);
    const decimals = tokenType === 'ckETH' ? 18 : 8;
    return BigInt(Math.floor(value * 10 ** decimals));
  };

  const updateBalances = async (agent: HttpAgent, principal: string) => {
    const tokens = [
      { name: 'ICP', canisterId: icpCanisterId },
      { name: 'ckBTC', canisterId: ckBTCCanisterId },
      { name: 'ckETH', canisterId: ckETHCanisterId },
      { name: 'ckUSDC', canisterId: ckUSDCCanisterId },
      { name: 'GLDGov', canisterId: GLDGovCanisterId },
    ];
    const newBalances: { [key: string]: bigint } = {};
    for (const token of tokens) {
      const tokenActor = Actor.createActor<TokenActor>(idlFactory, {
        agent,
        canisterId: token.canisterId,
      });
      const balance = await tokenActor.icrc1_balance_of({ owner: Principal.fromText(principal), subaccount: [] });
      newBalances[token.name] = balance;
    }
    setBalances(newBalances as { ICP: bigint; ckBTC: bigint; ckETH: bigint, ckUSDC: bigint, GLDGov: bigint });
  };

  const txnWithSoundBox = (getAmount: any, coin: string, scanData: any) => {
    const data = {
      device_id: scanData.device_id,
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

  const checkAllowanceAndTransfer = async (scanData: any) => {
    if (Object.keys(scanData).length > 0) {
      if (!authClient || !userPrincipal) {
        console.error('Missing required data for processing');
        return;
      }
      setIsProcessing(true);
      try {
        const tokenType = scanData.coin_name as string;
        const amount = parseTokenInput(scanData.amount, tokenType);
        let APPROVAL_FEE: bigint;
        switch (tokenType) {
          case 'ICP':
            APPROVAL_FEE = BigInt(40000); // 0.0001 ICP
            break;
          case 'ckETH':
            APPROVAL_FEE = BigInt(2 * 10 ** 18);
            break;
          case 'ckBTC':
            APPROVAL_FEE = BigInt(100);
            break;
          case 'ckUSDC':
            APPROVAL_FEE = BigInt(2_000_000_000_000);
            break;
          case 'GLDGov':
            APPROVAL_FEE = BigInt(100_000);
            break;
          default:
            throw new Error(`Unsupported token type: ${tokenType}`);
        }
        const totalApprovalAmount = amount + APPROVAL_FEE;
        const canisterId =
          tokenType === 'ICP' ? icpCanisterId :
            tokenType === 'ckBTC' ? ckBTCCanisterId :
              tokenType === 'ckETH' ? ckETHCanisterId :
                tokenType === 'ckUSDC' ? ckUSDCCanisterId :
                  tokenType === 'GLDGov' ? GLDGovCanisterId :
                    null;

        if (!canisterId) {
          throw new Error(`Unsupported token type: ${tokenType}`);
        }
        const identity = authClient.getIdentity();
        const agent = await HttpAgent.create({ identity, host: 'https://ic0.app' });
        await agent.fetchRootKey();
        const tokenActor = Actor.createActor<TokenActor>(idlFactory, {
          agent,
          canisterId,
        });
        const expirationTime = BigInt(Date.now() + 5 * 60 * 1000) * BigInt(1000000);
        const approveResult = await tokenActor.icrc2_approve({
          amount: BigInt(totalApprovalAmount),
          spender: { owner: Principal.fromText(transferCanisterId), subaccount: [] },
          fee: [],
          memo: [],
          from_subaccount: [],
          created_at_time: [],
          expected_allowance: [],
          expires_at: [expirationTime],
        });
        if ('Err' in approveResult) {
          throw new Error(`Approval failed: ${JSON.stringify(approveResult.Err)}`);
        }
        const transferActor = Actor.createActor<CanisterActor>(idlFactoryB, {
          agent,
          canisterId: transferCanisterId,
        });
        const transferArgs: TransferArgs = {
          token_type: { [tokenType]: null } as TokenType,
          amount: BigInt(amount),
          toAccount: {
            owner: Principal.fromText(scanData.merchant_address),
            subaccount: [],
          },
          order_id: scanData.order_id,
          merchant_name: scanData.merchant_name,
        };
        if (scanData && scanData.device_id) {
          txnWithSoundBox(BigInt(amount), tokenType, scanData);
        }
        const result = await transferActor.transfer(transferArgs);
        if ('err' in result) {
          throw new Error(`Transfer failed: ${JSON.stringify(result.err)}`);
        }
        await updateBalances(agent, userPrincipal);
        return result;
      } catch (error) {
        console.error('Error in handleTransaction:', error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {isAuthenticated && (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={logout}>
            <LogOutIcon className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="text-lg font-medium">Wallet Dashboard</div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsScanModalOpen(true)}>
            <ScanIcon className="h-5 w-5" />
            <span className="sr-only">Scan</span>
          </Button>
        </header>
      )}
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 sm:p-6">
        {!isAuthenticated ? (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-foreground md:text-5xl mb-4">BlockBolt ICP Wallet</h1>
            <p className="text-lg text-muted-foreground md:text-xl mb-6">Manage your cryptocurrency portfolio with ease.</p>
            <Button size="lg" className="w-full max-w-[300px] px-8 py-3 rounded-full" onClick={login}>
              Login with Internet Identity
            </Button>
          </div>
        ) : (
          <>
            <div className="grid w-full max-w-md gap-2">
              <div className="text-center text-2xl font-bold">Your Wallet</div>
              <div className="grid gap-1 text-center text-sm text-muted-foreground">
                <div>Principal ID: {userPrincipal && shortenAddress(userPrincipal)}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => userPrincipal && copyToClipboard(userPrincipal)}
                >
                  Copy
                </Button>
                {copySuccess && <span className="text-green-500">{copySuccess}</span>}
              </div>
            </div>
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Tokens</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 items-center gap-2">
                  <div className="flex items-center gap-2">
                    <CoinsIcon className="h-5 w-5" />
                    <span>ICP</span>
                  </div>
                  <div className="text-right font-medium">{formatTokenAmount(balances.ICP)}</div>
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <div className="flex items-center gap-2">
                    <CoinsIcon className="h-5 w-5" />
                    <span>ckBTC</span>
                  </div>
                  <div className="text-right font-medium">{formatTokenAmount(balances.ckBTC)}</div>
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <div className="flex items-center gap-2">
                    <CoinsIcon className="h-5 w-5" />
                    <span>ckETH</span>
                  </div>
                  <div className="text-right font-medium">{formatTokenAmount(balances.ckETH, 18)}</div>
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <div className="flex items-center gap-2">
                    <CoinsIcon className="h-5 w-5" />
                    <span>GLFGov</span>
                  </div>
                  <div className="text-right font-medium">{formatTokenAmount(balances.GLDGov)}</div>
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <div className="flex items-center gap-2">
                    <CoinsIcon className="h-5 w-5" />
                    <span>ckUSDC</span>
                  </div>
                  <div className="text-right font-medium">{formatTokenAmount(balances.ckUSDC)}</div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        <ScanModal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          onProcess={checkAllowanceAndTransfer}
          isProcessing={isProcessing}
          scanData={scanData}
          setScanData={setScanData}
        />
      </main>
    </div>
  )
}
export default II;