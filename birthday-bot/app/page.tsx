"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import WalletSelector from "../components/walletSelector";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Hourglass, Terminal, Unplug } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import TypographyH2 from "@/components/TypographyH2";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import TypographyH1 from "@/components/TypographyH1";
import { TypographyP } from "@/components/TypographyP";
import GiftCreator from "./GiftCreator";
import GiftList from "./GiftList";

type AppAlertProps = {
  title: string;
  description: string;
  icon: React.ElementType;
  variant?: "destructive" | "default" | null | undefined;
};

const AppAlert: React.FC<AppAlertProps> = ({
  title,
  description,
  icon,
  variant = "destructive",
}) => (
  <div className="h-full w-full flex flex-row items-end justify-end grow">
    <Alert variant={variant} className="w-fit mb-2 mr-2">
      {React.createElement(icon, { className: "h-4 w-4" })}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  </div>
);

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
  }, [connected, account]);

  /* 
    Checks if the connected account exists. If the account does not exist, sets the accountExists
    state to false. If the account exists, sets the accountExists state to true.
  */
  const checkIfAccountExists = async () => {
    if (!connected || !account || !account.address) {
      return;
    }

    try {
      // Making the API request
      const response = await fetch(
        `https://fullnode.testnet.aptoslabs.com/v1/accounts/${account.address}`,
        {
          method: "GET",
        }
      );

      // Parsing the response into a json
      const accountData = await response.json();

      // Check if the response contains the error_code of 'account_not_found'
      if (
        accountData.error_code &&
        accountData.error_code === "account_not_found"
      ) {
        setAccountExists(false);
      } else {
        setAccountExists(true);
      }
    } catch (error) {
      console.error("Error fetching account data:", error);
      setAccountExists(false); // Optionally, set to false on error as a safe default
    }
  };
  return (
    <div className="min-h-screen h-full w-full max-w-screen flex flex-col items-center dark:bg-slate-950">
      <div className="flex w-full max-w-screen-2xl lg:flex-row flex-col justify-between items-center my-2 px-40">
        <TypographyH2>Birthday Bot</TypographyH2>
        <div className="flex flex-row justify-around gap-2">
          <ThemeToggle />
          <a href="/history">
            <Button variant="outline">
              History
              <History className="ml-2" size={16} />
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
            An automated and on-chain gift giving platform. Use this platform to
            create gifts that hold APT tokens that can be opened by the
            recipient on their birthday.
            <br />
            <br />
            This dapp is built from Overmind's{" "}
            <a
              href="https://overmind.xyz/quests/dawn-of-design"
              target="_blank"
            >
              <span className="underline decoration-slate-200">
                birthday bot frontend quest
              </span>
            </a>{" "}
            and is based off Overmind's{" "}
            <a href="https://overmind.xyz/quests/birthday-bot" target="_blank">
              <span className="underline decoration-slate-200">
                birthday bot quest
              </span>
            </a>
            .
          </TypographyP>
        </div>
      </div>
      {connected && network?.name.toString() == "Testnet" && accountExists && (
        <div className="h-full w-full flex lg:flex-row flex-col items-center justify-center gap-20 my-4 grow">
          <GiftCreator
            setTxn={setTxnInProgress}
            isTxnInProgress={txnInProgress}
          />
          <GiftList setTxn={setTxnInProgress} isTxnInProgress={txnInProgress} />
        </div>
      )}
      {isLoading && (
        <AppAlert
          title="Loading"
          description="Loading account data..."
          icon={Hourglass}
        />
      )}
      {!connected && !isLoading && (
        <AppAlert
          title="Connect your wallet!"
          description="You need to connect your wallet before you can use this app."
          icon={Unplug}
        />
      )}
      {connected && !isLoading && network?.name.toString() !== "Testnet" && (
        <AppAlert
          title="Switch your network!"
          description="Switch your network to Testnet to use this app."
          icon={Unplug}
        />
      )}
      {connected &&
        !isLoading &&
        network?.name.toString() === "Testnet" &&
        !accountExists && (
          <AppAlert
            title="Account not found!"
            description="Please make sure your account exists on Testnet and try again."
            icon={Unplug}
          />
        )}
    </div>
  );
}
