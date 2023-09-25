"use client";

import {
  WalletName,
  WalletReadyState,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

const WalletSelector = ({ isTxnInProgress }: { isTxnInProgress?: boolean }) => {
  const {
    connect,
    account,
    connected,
    wallet,
    disconnect,
    wallets,
    isLoading,
    network,
  } = useWallet();

  const [balance, setBalance] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (connected && account) fetchBalance(account.address);
  }, [connected, account, isTxnInProgress]);

  const fetchBalance = async (address: string) => {
    const body = {
      function: "0x1::coin::balance",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: [address],
    };
  
    try {
      const response = await fetch(
        `https://fullnode.testnet.aptoslabs.com/v1/view`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status}`);
      }
  
      const data = await response.json();
      setBalance((data / 100000000).toLocaleString());
    } catch (error) {
      console.error("Error fetching balance:", error.message);
      setBalance("0");
    }
  };
  
  const handleWalletConnect = (walletName: WalletName<string>) => {
    connect(walletName);
  };

  const WalletConnectButton = ({
    name,
    url,
  }: {
    name: WalletName<string>;
    url: string;
  }) => {
    const walletInfo = wallets.find((w) => w.name === name);
    if (walletInfo?.readyState === WalletReadyState.Installed) {
      return (
        <div
          key={name}
          className="flex w-fulls items-center justify-between rounded-xl p-2"
        >
          <h1>{name}</h1>
          <Button variant="secondary" onClick={() => handleWalletConnect(name)}>
            Connect
          </Button>
        </div>
      );
    } else {
      return (
        <div
          key={name}
          className="flex w-fulls items-center justify-between rounded-xl p-2"
        >
          <h1>{name}</h1>
          <a href={url} target="_blank" rel="noreferrer">
            <Button variant="secondary">Install</Button>
          </a>
        </div>
      );
    }
  };
  

  return (
    <div>
      {!connected && !isLoading ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Connect Wallet</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect your wallet</DialogTitle>
              {wallets.map((w) => (
                <WalletConnectButton key={w.name} name={w.name} url={w.url} />
              ))}
            </DialogHeader>
          </DialogContent>
        </Dialog>
      ) : isLoading ? (
        <Button variant="secondary" disabled>
          Loading...
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="font-mono">{`${balance} APT | ${account?.address.slice(
              0,
              5
            )}...${account?.address.slice(-4)}`}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={disconnect}>Disconnect</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default WalletSelector;
