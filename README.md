The BlockBolt Payment Protocol is a decentralized, contactless payment ecosystem aimed at transforming the interaction between businesses and consumers through blockchain technology. By integrating interoperability, Internet of Things (IoT) capabilities, a commerce platform, and a user-friendly design, BlockBolt simplifies traditional cryptocurrency payments. This delivers a streamlined, secure, and highly accessible payment infrastructure.

This project serves as a valuable demonstration of how the ICP wallet can effectively integrate with the Blockbolt Payment Protocol, showcasing its potential to enhance payment solutions.

- **Demo Video:**
https://www.loom.com/share/33d3899e445c4139b8911914588fb88a?sid=246264c3-c3e8-4b6a-b0ba-bc264dd04193

- **Demo eCommerce Website:**
https://store.blockbolt.io/mocha

- **Payment Demo on NNS:**
https://nns.blockbolt.io/

- **Web3 Wallet (Demo Purpose Only):**
https://vjj55-fyaaa-aaaal-arsxq-cai.icp0.io/

## Installation Guide
### 1. Prerequisites
Before you begin, ensure the following tools are installed on your system:
- Node.js
- Git
- NPM (comes with Node.js) or Yarn (alternative package manager).

#### To install Yarn globally, run:

`npm install -g yarn`

### 2. Clone the Repository
- 1. Open a terminal on your machine.
- 2. Clone the repository using the following command:

`git clone https://github.com/blockboltpay/ICP_Payment.git`

- 3. Navigate into the project directory:

`cd ICP_Payment`

### 3. Install Dependencies
Install the required dependencies for the project. Use either NPM or Yarn:

#### Using NPM:

`npm install`

#### Using Yarn:
`yarn install`

This command will download and set up all necessary packages as specified in the package.json file.

### 4. Run Project in Browser

#### For Development Mode

Run the application in development mode:

`npm run dev`

- The app will be accessible at:
  http://localhost:3000

#### For Production Mode

- 1. Build the project:

`npm run build`

- 2. Start the production server:

`npm start`

- The app will be accessible at:
http://localhost:3000

## To successfully incorporate the Blockbolt payment protocol into your mobile or web3 wallet, please follow the detailed steps outlined below. The integration process is straightforward and user-friendly, making it easy for you to enhance your wallet's functionality with the Blockbolt system!

### **Step 1: Approval**

To initiate the process, approve the token transfer using the unique canister ID for the specific coin. This Coin Canister ID is found in the Blockbolt payment QR code at the time of checkout. After extracting it, you can proceed with the approval.

**Function: `icrc2_approve`**

#### **Key Arguments:**

- `amount`: Amount to approve

**Example Code:**

      const approve = async () => {
      try {
      const canisterId = BLOCKBOLT_CANISTER_ID; //you will get the Canister id from Blockbolt Payment QR Code, under 'canister_id' parameter.
      const actor: any = await window.ic.plug.createActor({
      canisterId:,
      interfaceFactory: idlFactory,
      });
      const text = 'My first BTC transfer';
      const memo = Array.from(new TextEncoder().encode(text));
			const addr = window.ic.plug.principalId;
      const exmple = await actor.icrc2_approve({
        from: Principal.fromText(addr),
        spender: {
          owner: Principal.fromText(transferCanister),
          subaccount: [],
        },
        fee: [],
        memo: [memo],
        from_subaccount: [],
        created_at_time: [],
        expires_at: [],
        expected_allowance: [],
        amount: BigInt(1000000),
      });
      console.log('example', exmple)
    } catch (error: any) {
      console.error('Error in randomTransfers:', error);
      setErrorMessage(
        error.message || 'An error occurred during the transfer.'
      );
    }
    };

### **Step 2: Transfer**

After approval, use the Blockbolt canister to initiate the transfer.

**Function**

`transfer`

#### **Key Arguments:**

- `token_type`: Specify the token type  ex: ckETH, ckBTC, ICP
- `amount`: BigInt value of the amount to transfer
- `toAccount`:
    - `owner`: User's principal
    - `subaccount`: Usually an empty array [ ]
- `order_id`: Unique identifier for the order
- `merchant_name`: Name of the merchant
- `canister_id`: canister id based on coin type
- `blockbolt_canister_id`: Blockbolt canister id

Example Code:

      const transfer = async () => {
      try {
      const canisterId = 'bza44-ciaaa-aaaan-qlvna-cai';
      console.log(canisterId, 'demo');
      const actor: any = await window.ic.plug.createActor({
        canisterId: transferCanister,
        interfaceFactory: idlFactoryB,
      });
      const orderId = 444555;
      const userPrincipal = Principal.fromText("yd6nc-eevu3-n2ubz-ztsq2-iodbn-hh4vr-xb33i-pz3as-ecpjm-yf7op-pae");
      const merchantName = "First Merchant";
      const transferArgs = {
        token_type: { ICP: null }, // ckBTC, ckETH
        amount: BigInt(100000),
        toAccount: {
          owner: userPrincipal,
          subaccount: [],
        },
        order_id: orderId,
        merchant_name: merchantName
      };
      console.log(actor, 'actor');
      const example = await actor.transfer(transferArgs);      
      console.log(example);
    } catch (error: any) {
      console.error('Error in randomTransfers:', error);
      setErrorMessage(
        error.message || 'An error occurred during the transfer.'
      );
    }
    };

### **Step 3: Check Transaction Status**

You can check the status of a transaction using the order ID.

- Function: `checkStatus`
- Argument: `order_id`

Example QR Code for Payment

- Token Type: “token_type"
- Amount: “amount"
- Merchant Wallet Address: “merchant_address"
- Order ID: "order_id"
- Merchant Name: "merchant_name"
- Network: "network"
- Coin Name: "coin_name"
- Blockchain: "blockchain"
- Coin Canister ID: "canister_id"
- Blockchain Canister ID: "blockbolt_canister_id"


#### **Important Notes:**

- Ensure you have the necessary permissions and connections with Internet Identity.
- Handle errors appropriately in your implementation.
- Always use BigInt for amount values to avoid precision issues.


### In-store Purchase Demo for Game and dAPP : BlockBolt Checkout

[![YouTube](http://i.ytimg.com/vi/ep9mQV2bCRI/hqdefault.jpg)](https://www.youtube.com/watch?v=ep9mQV2bCRI)

https://youtu.be/ep9mQV2bCRI

### Proposed Solution > Blockbolt Payment Demo on NNS (ICP)
[![YouTube](http://i.ytimg.com/vi/7ehzjZT8Yj4/hqdefault.jpg)](https://www.youtube.com/watch?v=7ehzjZT8Yj4)

https://youtu.be/7ehzjZT8Yj4

If you have any questions, please contact us at support@blockbolt.io or send a message on the Discord server BlockBolt.

## OFFICIAL INFORMATION

- Website: https://blockbolt.io/
- Twitter: https://twitter.com/blockboltpay
- Discord: https://discord.com/invite/Fb8CA6ny67
- Email: [support@blockbolt.io](mailto:support@blockbolt.io)
