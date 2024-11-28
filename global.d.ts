// interface WalletConnectionOptions {
//   whitelist: string[];
// }

// interface Window {
//   ic: {
//     bitfinityWallet: {
//       createActor(arg0: {
//         canisterId: string;
//         interfaceFactory: ({ IDL }: { IDL: any }) => any;
//       }): any;
//       batchTransactions(arg0: {}[]): unknown;
//       isConnected: () => Promise<boolean>;
//       requestConnect: (options: WalletConnectionOptions) => Promise<any>;
//       disconnect: () => Promise<void>;
//     };
//   };
// }

interface Window {
  ic: {
    plug: {
      principalId: any;
      accountId: string;
      requestConnect(arg0: { whitelist: string[] }): unknown;
      get_transactions(): unknown;
      getAccountID(): unknown;
      disable(): unknown;
      getPrincipal(): unknown;
      createActor(arg0: { canisterId: string; interfaceFactory: import("@dfinity/candid/lib/cjs/idl").InterfaceFactory; }): any;
      batchTransactions(arg0: {}[]): unknown;
      isConnected: () => Promise<boolean>;
      // requestConnect: () => Promise<void>;
      disconnect: () => Promise<void>;
    };
  };
}
