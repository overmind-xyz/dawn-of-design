"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import WalletSelector from "../components/walletSelector";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Hourglass, Terminal, Unplug } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import TypographyH2 from "@/components/TypographyH2";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { History } from 'lucide-react';
import TypographyH1 from "@/components/TypographyH1";
import { TypographyP } from "@/components/TypographyP";
import GiftCreator from "./GiftCreator";
import GiftList from "./GiftList";

/* 
  The home page of the app. Displays a message and holds the GiftCreator and GiftList components.
*/
export default function Home() {
  // wallet state variables
  const { connected, isLoading, network, account } = useWallet();
  // State to indicate if a transaction is in progress. Used to disable and refresh components.
  const [txnInProgress, setTxnInProgress] = useState(false);
  // State to indicate if the connected account exists on Testnet. Used to display an error message.
  const [accountExists, setAccountExists] = useState<Boolean>(true);

  /*
    Checks if the connected account exists whenever the connected and account variables change.
  */
  useEffect(() => {
    checkIfAccountExists();
  }, [connected, account])

  /* 
    Checks if the connected account exists. If the account does not exist, sets the accountExists
    state to false. If the account exists, sets the accountExists state to true.
  */
  const checkIfAccountExists = async () => {
    /* 
      TODO #5: Make a request to the api endpoint to retrieve the account data. If the request returns 
            an object that contains `error_code` of `account_not_found`, set the accountExists state 
            to false. Otherwise, set the accountExists state to true.

      HINT: 
        - If the connected and account variables are false or undefined (respectively), return 
          early.
    */
    
  }

  return (
    <div className="min-h-screen h-full w-full max-w-screen flex flex-col items-center dark:bg-slate-950">
      <div className="flex w-full max-w-screen-2xl lg:flex-row flex-col justify-between items-center my-2 px-40">
        <TypographyH2>Birthday Bot</TypographyH2>
        <div className="flex flex-row justify-around gap-2">
          <ThemeToggle />
          <a href="/history">
            <Button variant="outline" >
              History 
              <History className="ml-2" size={16}/>
            </Button>
          </a>
          <WalletSelector isTxnInProgress={txnInProgress} />
        </div>
      </div>
      <Separator />
      <div className="my-6">
        <div className="flex flex-col items-center">
          <TypographyH1>The Birthday Bot</TypographyH1>
          <TypographyP classname="w-10/12 break-normal">
            An automated and on-chain gift giving platform. Use this platform to create gifts that hold
            APT tokens that can be opened by the recipient on their birthday.
            <br />
            <br />
            This dapp is built from Overmind's <a href="https://overmind.xyz/quests/dawn-of-design" target="_blank"><span className="underline decoration-slate-200">birthday bot frontend  quest</span></a> and is based off Overmind's <a href="https://overmind.xyz/quests/birthday-bot" target="_blank"><span className="underline decoration-slate-200">birthday bot quest</span></a>.
          </TypographyP>
        </div>
      </div>
      {
        connected && network?.name.toString() == "Testnet" && accountExists && 
        (
          <div className="h-full w-full flex lg:flex-row flex-col items-center justify-center gap-20 my-4 grow">
            <GiftCreator setTxn={setTxnInProgress} isTxnInProgress={txnInProgress} />
            <GiftList setTxn={setTxnInProgress} isTxnInProgress={txnInProgress} />
          </div>
        )
      }
      {
        /* 
          TODO #1: Display an loading message if the wallet is loading. Use the given components to 
                display the message.
          
          HINT: Use the `isLoading` variable to check if the wallet is loading.

          -- Alert Component --
          <div className="h-full w-full flex flex-row items-center justify-center grow">
            <Alert className="w-fit mb-2 mr-2">
              <Hourglass size={16} />
              <AlertTitle>Loading</AlertTitle>
              <AlertDescription>
                Loading account data...
              </AlertDescription>
            </Alert>
          </div>
        */
      }

      {
        /* 
          TODO #2: Display an error message if the wallet is not connected. Use the given components to 
                display the message.

          HINT: 
            - Use the `connected` variable to check if the wallet is connected.
            - Use the `isLoading` variable to check if the wallet is loading. Don't display the error
              message if the wallet is still loading.
            
          -- Alert Component --
          <div className="h-full w-full flex flex-row items-end justify-end grow">
            <Alert variant="destructive" className="w-fit mb-2 mr-2">
              <Unplug className="h-4 w-4" />
              <AlertTitle>Connect your wallet!</AlertTitle>
              <AlertDescription>
                You need to connect your wallet before you can use this app.
              </AlertDescription>
            </Alert>
          </div>
        */
      }
      {
        /* 
          TODO #3: Display an error message if the wallet is connected to the wrong network. Use the 
                given components to display the message.
          
          HINT:
            - Use the `connected` variable to check if the wallet is connected.
            - Use the `isLoading` variable to check if the wallet is loading. Don't display the error
              message if the wallet is still loading.
            - Use the `network` variable to check if the wallet is connected to the Testnet.

          -- Alert Component --
          <div className="h-full w-full flex flex-row items-end justify-end grow">
            <Alert variant="destructive" className="w-fit mb-2 mr-2">
              <Unplug className="h-4 w-4" />
              <AlertTitle>Switch your network!</AlertTitle>
              <AlertDescription>
                Switch your network to Testnet to use this app.
              </AlertDescription>
            </Alert>
          </div>
        */
      }
      {
        /* 
          TODO #4: Display an error message if the connected account does not exist on Testnet. Use the
                given components to display the message.

          HINT:
            - Use the `connected` variable to check if the wallet is connected.
            - Use the `isLoading` variable to check if the wallet is loading. Don't display the error
              message if the wallet is still loading.
            - Use the `accountExists` variable to check if the connected account exists on Testnet.
            - Use the `network` variable to check if the wallet is connected to the Testnet. Don't 
              display the error message if the wallet is not connected to the Testnet.

          -- Alert Component --
          <div className="h-full w-full flex flex-row items-end justify-end grow">
            <Alert variant="destructive" className="w-fit mb-2 mr-2">
              <Unplug className="h-4 w-4" />
              <AlertTitle>Account not found!</AlertTitle>
              <AlertDescription>
                Please make sure your account is exists on Testnet and try again.
              </AlertDescription>
            </Alert>
          </div>
        */
      }
    </div>
  );
}
