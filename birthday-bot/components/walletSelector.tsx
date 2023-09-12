"use client";

import { WalletReadyState, useWallet } from "@aptos-labs/wallet-adapter-react";
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

/* 
  Component that displays a button to connect a wallet. If the wallet is connected, it displays the 
  wallet's APT balance, address and a button to disconnect the wallet. 

  When the connect button is clicked, a dialog is displayed with a list of all supported wallets. If 
  a supported wallet is installed, the user can click the connect button to connect the wallet. If
  the wallet is not installed, the user can click the install button to install the wallet.
*/
export default function WalletSelector(
  props: {
    isTxnInProgress?: boolean;
  }
) {

  // wallet state variables 
  const { connect, account, connected, disconnect, wallets, isLoading } = useWallet();
  // State to hold the current account's APT balance. In string - floating point format.
  const [balance, setBalance] = useState<string | undefined>(undefined);

  /* 
    Gets the balance of the connected account whenever the connected, account, and isTxnInProgress
    variables change.
  */
  useEffect(() => {
    if (connected && account) {
      getBalance(account.address);
    }
  }, [connected, account, props.isTxnInProgress]);

  /*
    Gets the balance of the given address. In case of an error, the balance is set to 0. The balance
    is returned in floating point format.
    @param address - The address to get the APT balance of.
  */
  const getBalance = async (address: string) => {
    /* 

      TODO #3: Make a call to the 0x1::coin::balance function to get the balance of the given address. 
      
      HINT: 
        - The APT balance is return with a certain number of decimal places. Remember to convert the 
          balance to floating point format as a string.
        - Remember to make the API request in a try/catch block. If there is an error, set the 
          balance to "0".

    */
  };

  return (
    <div>
      {!connected && !isLoading && (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Connect Wallet</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect your wallet</DialogTitle>
              {
                /* 
                  TODO #1: Return a list of all supported wallets. If the wallet is installed, display
                  a button to connect the wallet. If the wallet is not installed, display a button 
                  to install the wallet. 

                  HINT: 
                    - Use the two components below to display the wallet name and the connect or 
                      install button. Remember to fill in the `onClick` event handler for the connect 
                      button and the `href` for the install button. 
                    - Use the `wallets` array to get the list of supported wallets.
                    - Fill in the `Wallet Name` placeholder with the name of the wallet.

                  -- Connect Wallet Component --
                  <div
                    key={wallet.name}
                    className="flex w-fulls items-center justify-between rounded-xl p-2"
                  >
                    <h1>PLACEHOLDER: Wallet Name</h1>
                    <Button variant="secondary" onClick={() => console.log("PLACEHOLDER: Connect wallet")}>
                      Connect
                    </Button>
                  </div>

                  -- Install Wallet Component --
                  <div
                    key={wallet.name}
                    className="flex w-fulls items-center justify-between rounded-xl p-2"
                  >
                    <h1>PLACEHOLDER: Wallet Name</h1>
                    <a href="PLACEHOLDER.com" target="_blank">
                      <Button variant="secondary">
                        Install
                      </Button>
                    </a>
                  </div>
                */
              }
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
      {
        /* 
          TODO #4: Display a loading button if the wallet is currently loading

          HINT: 
            - Use the `isLoading` variable to check if the wallet is loading.
            - Use the Button component below to display.

          -- Loading Button Component --
          <Button variant="secondary" disabled>
            Loading...
          </Button>
        */
      }
      {
        /* 
          TODO #2: Display the wallet's APT balance and address if the wallet is connected and the 
                account is defined. Use the component below to display the wallet's APT balance and 
                address, as well as provide the disconnect button. 

          HINT: 
            - Use the `connected` and `account` variables to check if the wallet is connected and the
              account is defined.
            - Use the `balance` state variable to display the wallet's APT balance.
            - Remember to fill in the `onClick` event handler for the disconnect button.
          
          -- Wallet Balance Component --
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="font-mono">
                  PLACEHOLDER APT | {account.address.slice(0, 5)}...{account.address.slice(-4)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => {console.log("PLACEHOLDER: Disconnect wallet")}}>
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        */
      }
    </div>
  );
}
