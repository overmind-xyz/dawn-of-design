# Birthday Bot FE quest starter template
This is the starter template for Overmind's FE quest built on top of the Birthday Bot smart contract quest. The birthday bot quest can be viewed [here](https://overmind.xyz/quests/birthday-bot). 

# Table of Contents
- [Birthday Bot FE quest starter template](#birthday-bot-fe-quest-starter-template)
- [Table of Contents](#table-of-contents)
- [Tech Stack](#tech-stack)
- [Developer Cheat Sheet](#developer-cheat-sheet)
  - [Birthday Bot module](#birthday-bot-module)
    - [Module details](#module-details)
    - [Module deployment details](#module-deployment-details)
  - [React and Next.js](#react-and-nextjs)
    - [Conditional rendering](#conditional-rendering)
    - [Rendering lists](#rendering-lists)
  - [Wallet adapter](#wallet-adapter)
    - [Initializing the wallet adapter](#initializing-the-wallet-adapter)
    - [useWallet hook](#usewallet-hook)
    - [Connecting and disconnecting from the wallet](#connecting-and-disconnecting-from-the-wallet)
    - [Signing and submitting transactions](#signing-and-submitting-transactions)
    - [Account information](#account-information)
    - [Network information](#network-information)
    - [Wallet information](#wallet-information)
    - [Wallets information](#wallets-information)
  - [Aptos API](#aptos-api)
    - [Calling view functions](#calling-view-functions)
    - [Retrieve account data](#retrieve-account-data)
    - [Querying events](#querying-events)
- [Quest](#quest)
  - [Deploying the dapp locally](#deploying-the-dapp-locally)
  - [Completing the quest](#completing-the-quest)

# Tech Stack
- [Yarn](https://yarnpkg.com/) package manager
- [React](https://react.dev/) library for building user interfaces
- [Next.js](https://nextjs.org/) framework for React
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components using Radix UI and Tailwind CSS
- [Aptos wallet adapter](https://github.com/aptos-labs/aptos-wallet-adapter/tree/main/packages/wallet-adapter-react), [Aptos TS SDK](https://aptos.dev/sdks/ts-sdk/index/), and [Aptos API](https://aptos.dev/nodes/aptos-api-spec/#/) for interacting with the Aptos blockchain

# Developer Cheat Sheet

## Birthday Bot module
This FE quest is built on top of the Birthday Bot smart contract quest. The Birthday Bot module is a smart contract that allows users to create a birthday gift for a friend. The gift is only claimable on or after the friend's birthday. The gift can be cancelled by the gifter at any time before it is claimed and the APT will be refunded back to the gifter. The module has been modified to be more frontend compatible. The module code can be viewed [here](./contracts/sources/birthday_bot_completed.move).

### Module details
The Birthday Bot module has the following entry functions:
  - `add_birthday_gift`: Allows a user to create a new or edit an existing birthday gift. The user must provide the following arguments: 
    - `recipient`: The address of the recipient of the gift
    - `gift_amount_apt`: The amount of APT to be gifted to the recipient
    - `birthday_timestamp_seconds`: The timestamp when the recipient's gift can be claimed
  - `remove_birthday_gift`: Allows the gift sender to cancel the gift before it is claimed. The user must provide the following arguments: 
    - `recipient`: The address of the recipient of the gift to be cancelled
  - `claim_birthday_gift`: Allows the recipient to claim a gift once the birthday timestamp has passed. The user must provide the following arguments: 
    - `gifter`: The address of the sender of the gift to be claimed

The Birthday Bot module has the following view functions:
  - `view_gifters_gifts`: Returns a list of all gifts sent by the specified address. The function returns the gifts in three lists: list of recipients, list of gift amounts, and list of timestamps. The user must provide the following arguments: 
    - `gifter`: The address of the sender of the gifts to be returned
  - `view_recipients_gifts`: Returns a list of all gifts received by the specified address. The function returns the gifts in three lists: list of senders, list of gift amounts, and list of timestamps. The user must provide the following arguments: 
    - `recipient`: The address of the recipient of the gifts to be returned

The Birthday Bot module has the following events (stored in `ModuleEvents`):
  - `birthday_gift_added_events`: Emitted when a new gift is created or an existing gift is edited. The event contains the following data: 
    - `gifter`: The address of the sender of the gift
    - `recipient`: The address of the recipient of the gift
    - `gift_amount_apt`: The amount of APT to be gifted to the recipient
    - `birthday_timestamp_seconds`: The timestamp when the recipient's gift can be claimed
    - `gift_timestamp_seconds`: The timestamp when the gift was created or edited
  - `birthday_gift_removed_events`: Emitted when a gift is cancelled. The event contains the following data: 
    - `gifter`: The address of the sender of the gift
    - `recipient`: The address of the recipient of the gift
    - `gift_amount_apt`: The amount of APT to be gifted to the recipient
    - `birthday_timestamp_seconds`: The timestamp when the recipient's gift can be claimed
    - `gift_timestamp_seconds`: The timestamp when the gift was cancelled
  - `birthday_gift_claimed_events`: Emitted when a gift is claimed. The event contains the following data: 
    - `gifter`: The address of the sender of the gift
    - `recipient`: The address of the recipient of the gift
    - `gift_amount_apt`: The amount of APT to be gifted to the recipient
    - `birthday_timestamp_seconds`: The timestamp when the recipient's gift can be claimed
    - `gift_timestamp_seconds`: The timestamp when the gift was claimed

### Module deployment details
This dapp interacts with a deployed birthday bot instance on Aptos Testnet. The deployed module has the following properties: 
- module address: `0x15ead142473563d1a07fae2aa04c6d38d19b33222c110a4667af357aa31439c2`
- module name: `birthday_bot`

The resource account that is created for the module in the `init_module` function is: `0x770e0ac04e517bfe36a25e3f7cd8f303842ec9a819adb579167c9086cce74ebd`

These properties are set up in the [`next.config.js`](./birthday-bot/next.config.js) and can be used in the tsx file with: 
- module address: `process.env.MODULE_ADDRESS`
- module name: `process.env.MODULE_NAME`
- module's resource account address: `process.env.RESOURCE_ACCOUNT_ADDRESS`

The deployed module can be viewed [here](https://explorer.aptoslabs.com/account/0x15ead142473563d1a07fae2aa04c6d38d19b33222c110a4667af357aa31439c2/modules/code/birthday_bot?network=testnet). 

## React and Next.js
This dapp is built using React and Next.js. React is a JavaScript library for building user interfaces. Next.js is a React framework that provides a number of features including server-side rendering, file-based routing, and automatic code splitting.

### Conditional rendering
This dapp uses conditional rendering to display different components based on the state of the dapp. The following examples show how conditional rendering is used in this dapp.

The following code snippet shows how conditional rendering is used to display a loading message while the wallet is loading: 
```tsx
// Get the isLoading property from the wallet adapter (boolean indicating if the wallet is loading)
const { isLoading } = useWallet();

// Conditional rendering to display a loading message
<>
  {
    isLoading && 
    (
      <div>
        <h1>Loading...</h1>
      </div>
    )
  }
</>
```

The following code snippet shows how conditional rendering is used with the ternary operator to display a message based on the connected state of the wallet: 
```tsx
// Get the connected property from the wallet adapter (boolean indicating if the wallet is connected)
const { connected } = useWallet();

// Conditional rendering to display a message based on the connected state
<>
  {
    connected ? 
    (
      <div>
        <h1>Connected</h1>
      </div>
    ) : 
    (
      <div>
        <h1>Not connected</h1>
      </div>
    )
  }
</>
```

### Rendering lists
There are times when a list of data needs to be rendered. If the list is static, the list can be hard-coded in the tsx file. If the list is dynamic, the list can be stored in a state variable and rendered using the `map` function. This is called dynamic rendering and is used in this dapp.

This dapp uses the `map` function to render lists of data. The following examples show how the `map` function is used in this dapp.

The following code snippet shows how the `map` function is used to render a list of wallets: 
```tsx
// Get the wallets property from the wallet adapter
const { wallets } = useWallet();

/* 
  Iterates through each wallets and returns a div with the wallet name. The index is used as the key 
  to ensure that each div is unique.
*/
<>
  <h1>Wallets</h1>
  {
    wallets.map((wallet, index) => {
      return (
        <div key={index}>
          <h2>{wallet.name}</h2>
        </div>
      )
    })
  }
</>
```

## Wallet adapter
The Aptos wallet adapter contains the logic for connecting to the Aptos wallet and submitting transactions. 


### Initializing the wallet adapter

The wallet adapter provider is initialized in the [`app/layout.tsx`](./birthday-bot/app/layout.tsx) file. 

### useWallet hook

All wallet properties and functions are provided with the `useWallet` hook. The hook must be imported from the wallet adapter package: 
```tsx
import { useWallet } from '@aptos-labs/aptos-wallet-adapter-react';
```
Once the hook is imported, you can use the provide properties and functions: 
```tsx
const {
  connect,    // connect to the wallet
  account,    // connected wallet's account information
  network,    // connected wallet's network
  connected,  // boolean indicating if the wallet is connected
  disconnect, // disconnect from the wallet
  isLoading,  // boolean indicating if the wallet is loading
  wallet,     // connected wallet information
  wallets,    // list of information for all supported wallets
  signAndSubmitTransaction,     // sign and submit a transaction
  signAndSubmitBCSTransaction,  // sign and submit a BCS transaction
  signTransaction,              // sign a transaction
  signMessage,                  // sign a message
  signMessageAndVerify,         // sign a message and verify
} = useWallet();
```

### Connecting and disconnecting from the wallet
To connect to a wallet, use the `connect` function provided by the `useWallet` hook as follows: 
```tsx
// Get the connect function from the wallet adapter
const { connect } = useWallet();

// Function to connect to a wallet
const handleConnect = (walletName: string) => {
  connect(walletName);
};

// Wallet selector component for a single wallet
<div>
  <h1>{wallet.name}</h1>
  <Button 
    variant="secondary" 
    onClick={() => handleConnect(wallet.name)}
  >
    Connect
  </Button>
</div>
```

Similarly, to disconnect from the wallet, use the `disconnect` function provided by the `useWallet` hook as follows: 
```tsx
// Get the disconnect function from the wallet adapter
const { disconnect } = useWallet();

// Function to disconnect from the wallet
const handleDisconnect = () => {
  disconnect();
};

// Disconnect button
<Button onClick={() => handleDisconnect()}>
  Disconnect
</Button>
```

### Signing and submitting transactions

To sign and submit a transaction, use the `signAndSubmitTransaction` function provided by the `useWallet` hook as follows: 
```tsx
/*
  Function to sign and submit a transaction. In this case, the transaction is a call to transfer 10 
  APT to the address 0xabc123. 

  Note: The Types.TransactionPayload type is imported from the Aptos TS SDK. This is the only use of
        the TS SDK in this dapp.

  Note: The signer argument is provided by the wallet adapter internally. There is no need to 
        provide this argument.
*/
const handleSignAndSubmitTransaction = async () => {
  // Transaction payload
  const payload: Types.TransactionPayload = {
    type: "entry_function_payload", // The type of transaction payload
    function: `0x1::coin::transfer`, // The address::module::function to call
    type_arguments: ['0x1::aptos_coin::AptosCoin'],
    arguments: [
      '0xabc123', // recipient address
      1000000000, // 10 APT
    ],
  };
  
  /*
    Sign and submit the transaction in a try/catch block

    NOTE: The sleep helper function to ensure that the transaction is reliably viewable on the 
          blockchain. The minimum amount of seconds to wait to get reliable results is stored in the 
          environment under `TRANSACTION_DELAY_MILLISECONDS`. Even though the Aptos TS SDK has a 
          helper function, waitForTransaction, we have found it more reliable to use the sleep 
          function.
  */
  try {
    const result = await signAndSubmitTransaction(payload);
    await sleep(parseInt(process.env.TRANSACTION_DELAY_MILLISECONDS || '0'))
    console.log(result);
  } catch (e) {
    console.log(e);
  }

};

// Sign and submit transaction button
<Button onClick={() => handleSignAndSubmitTransaction()}>
  Transfer 10 APT to 0xabc123
</Button>
```

### Account information

The `account` property provided by the `useWallet` hook contains the following information: 
```tsx
declare type AccountInfo = {
  address: string;
  publicKey: string | string[];
  minKeysRequired?: number;
  ansName?: string | null;
};

// Div to display account address
<div>
  <h1>Address: {account.address}</h1>
</div>
```

### Network information

The `network` property provided by the `useWallet` hook contains the following information: 
```tsx
declare type NetworkInfo = {
  name: NetworkName;
  chainId?: string;
  url?: string;
};

enum NetworkName {
  Mainnet = "mainnet",
  Testnet = "testnet",
  Devnet = "devnet"
}

// Example conditional rendering based on network
<>
  {
    network.name.toString() !== 'Testnet' && 
    (
      <div>
        <h1>Warning! You are on the wrong network. Please switch to Testnet.</h1>
      </div>
    )
  }
</>
```

### Wallet information

The `wallet` property provided by the `useWallet` hook contains the following information: 
```tsx
declare type WalletInfo = {
  name: WalletName; // name of the wallet as a string
  icon: string;
  url: string;
};

// Div to display wallet name
<div>
  <h1>Wallet: {wallet.name}</h1>
</div>
```

### Wallets information

The `wallets` property provided by the `useWallet` hook contains the following information: 
```tsx
declare type Wallet<Name extends string = string> = AdapterPlugin<Name> & {
  readyState?: WalletReadyState;
};

declare type AdapterPlugin<Name extends string = string> = AdapterPluginProps<Name> & AdapterPluginEvents;

interface AdapterPluginProps<Name extends string = string> {
  name: WalletName<Name>;
  url: string;
  icon: `data:image/${"svg+xml" | "webp" | "png" | "gif"};base64,${string}`;
  providerName?: string;
  provider: any;
  deeplinkProvider?: (data: {
      url: string;
  }) => string;
  connect(): Promise<any>;
  disconnect: () => Promise<any>;
  network: () => Promise<any>;
  signAndSubmitTransaction<T extends Types.TransactionPayload, V>(transaction: T, options?: V): Promise<{
      hash: Types.HexEncodedBytes;
  }>;
  signMessage<T extends SignMessagePayload>(message: T): Promise<SignMessageResponse>;
}

interface AdapterPluginEvents {
  onNetworkChange: OnNetworkChange;
  onAccountChange(callback: any): Promise<any>;
}

declare enum WalletReadyState {
  /**
   * User-installable wallets can typically be detected by scanning for an API
   * that they've injected into the global context. If such an API is present,
   * we consider the wallet to have been installed.
   */
  Installed = "Installed",
  NotDetected = "NotDetected",
  /**
   * Loadable wallets are always available to you. Since you can load them at
   * any time, it's meaningless to say that they have been detected.
   */
  Loadable = "Loadable",
  /**
   * If a wallet is not supported on a given platform (eg. server-rendering, or
   * mobile) then it will stay in the `Unsupported` state.
   */
  Unsupported = "Unsupported"
}

/* 
  div to display all wallets and provide a connect or install button based on the wallet's ready 
  state
*/
<>
  {
    wallets.map((wallet, index) => (
      <div key={index}>
        <h1>{wallet.name}</h1>
        {
          wallet.readyState === WalletReadyState.Installed && 
          (
            <Button 
              variant="secondary" 
              onClick={() => handleConnect(wallet.name)}
            >
              Connect
            </Button>
          )
        }
        {
          wallet.readyState === WalletReadyState.NotDetected && 
          (
            <a href={wallet.url} target="_blank">
              <Button 
                variant="secondary" 
              >
                Install
              </Button>
            </a>
          )
        }
      </div>
    ))
  }
</>
```

## Aptos API
The Aptos API is used to read data from the Aptos blockchain. In this dapp, the API is used to call view functions as well as query events emitted by the birthday bot module. 

### Calling view functions
The Aptos API can be used to call view functions. The API view function endpoint is: 
```
https://fullnode.testnet.aptoslabs.com/v1/view
```

Making a request to this endpoint can be done the following way: 
```tsx
// State to store balance with default value of "0"
const [balance, setBalance] = useState<string>("0");

// Get the account and connected state from the wallet adapter
const { account, connected } = useWallet();

// Calls the getBalance function when the account or connected state changes
useEffect(() => {
  if (connected && account) {
    getBalance(account.address);
  }
}, [connected, account]);

// Function to call the balance view function
const getBalance = async (address: string) => {
  const body = {
    function:
      "0x1::coin::balance",
    type_arguments: ["0x1::aptos_coin::AptosCoin"],
    arguments: [address],
  };

  let res;
  try {
    res = await fetch(
      `https://fullnode.testnet.aptoslabs.com/v1/view`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    )
  } catch (e) {
    setBalance("0");
    return;
  }

  const data = await res.json();

  setBalance((data / 100000000).toLocaleString());
}

// Div to display balance
<div>
  <h1>Balance: {balance}</h1>
</div>
```

### Retrieve account data 
The Aptos API can be used to retrieve account data. The API account endpoint is: 
```
https://fullnode.testnet.aptoslabs.com/v1/accounts/{address}
```
where `{address}` is the address of the account to retrieve data for.

Making a request to this endpoint can done the following way: 
```tsx
const getAccountData = async () => {
  // Making the API request
  const response = await fetch (
    `https://fullnode.testnet.aptoslabs.com/v1/accounts/${account.address}`,
    {
      method: 'GET'
    }
  );

  // Parsing the response into a json
  const accountData = await response.json();

  console.log(accountData);
}
```

### Querying events
The Aptos API can be used to query events emitted by the birthday bot module. The API event endpoint is: 
```
https://fullnode.testnet.aptoslabs.com/v1/accounts/{address}/events/{event_handle}/{field_name}
```
where `{address}` is the address of the account that holds the object containing the events, `{event_handle}` is the type of the object that contains the events, and `{field_name}` is the name of the field that contains the events.

Making a request to this endpoint can be done the following way:
```tsx
// Event types
export type Event = {
  id: number, 
  type: "add-birthday-gift" | "claim-birthday-gift" | "cancel-birthday-gift", 
  eventTimestamp: number, 
  
  recipient: string,
  amount: number,
  gifter: string,
  giftTimestamp: number,
}

// connected and account state from the wallet adapter
const { connected, account } = useWallet();
// State to store events
const [events, setEvents] = useState([]);

// Updates the events state when the account or connected state changes
useEffect(() => {
  if (connected && account) {
    getEvents();
  } else {
    setEvents([]);
  }
}, [connected, account]);

// function to query `birthday_gift_added_events` events emitted by the birthday bot module 
const getEvents = async () => {
  const response = await fetch (
    `https://fullnode.testnet.aptoslabs.com/v1/accounts/${process.env.RESOURCE_ACCOUNT_ADDRESS}/events/${process.env.MODULE_ADDRESS}::${process.env.MODULE_NAME}::ModuleEvents/birthday_gift_added_events`,
    {
      method: 'GET'
    }
  );

  const eventData = await response.json();

  console.log(eventData);

  setEvents(eventData);
}

// Div to display events
<div>
  <h1>Events</h1>
  {
    events.map((event) => (
      <div key={event.id}>
        <h2>Gifter: {event.gifter}</h2>
        <h3>Recipient: {event.recipient}</h3>
        <h3>Timestamp: {event.giftTimestamp}</h3>
        <h3>Amount: {event.amount}</h3>
      </div>
    ))
  }
</div>
```

# Quest
## Deploying the dapp locally
  1. Navigate to the `birthday-bot` directory
  2. Run `yarn install` to install dependencies
  3. Run `yarn dev` to start the development server
  4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result

## Completing the quest
  1. Read through the [Developer Cheat Sheet](#developer-cheat-sheet) above to understand the dapp and the supporting dependencies. Look back to that section for reference as you complete the quest.
  2. Visit and try out the demo dapp [here](https://birthday-bot-fe-reference.vercel.app/). Feel free to use this demo as a reference as you complete the quest.
  3. Deploy and open the dapp locally as described [above](#deploying-the-dapp-locally). 
  4. Complete the quests by following the TODO comments in the following files (recommended order): 
       - [ ] [`components/walletSelector.tsx`](./birthday-bot/components/walletSelector.tsx)
       - [ ] [`app/page.tsx`](./birthday-bot/app/page.tsx)
       - [ ] [`app/GiftCreator.tsx`](./birthday-bot/app/GiftCreator.tsx)
       - [ ] [`app/ReceivedGiftList.tsx`](./birthday-bot/app/ReceivedGiftList.tsx)
       - [ ] [`app/SentGift.tsx`](./birthday-bot/app/SentGiftList.tsx)
       - [ ] [`app/history/HistoryTable.tsx`](./birthday-bot/app/history/HistoryTable.tsx)
       - [ ] [`app/history/page.tsx`](./birthday-bot/app/history/page.tsx)