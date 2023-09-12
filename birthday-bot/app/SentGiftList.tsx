import React, { useEffect } from "react";
import { X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sleep } from "@/lib/utils";

type Gift = {
  address: String;
  amount: number;
  timestamp: number;
};

/*
  List of gifts that the user has sent to others.
*/
export default function SentGiftList(
  props: {
    isTxnInProgress: boolean;
    setTxn: (isTxnInProgress: boolean) => void;
  }
) {
  // Wallet adapter state
  const { account, connected, signAndSubmitTransaction } = useWallet();
  // Gift list state
  const [gifts, setGifts] = React.useState<Gift[]>([]);

  /* 
    Retrieves the gifts sent by the user whenever the account, connected, or isTxnInProgress state 
    changes.
  */
  useEffect(() => {
    if (connected) {
      getGifts().then((gifts) => {
        setGifts(gifts);
      });
    }
  }, [account, connected, props.isTxnInProgress]);

  /* 
    Retrieves the gifts sent by the user.
  */  
  const getGifts = async () => {
    /*
      TODO #2: Validate the account is defined before continuing. If not, return.
    */

    /*
      TODO #3: Make a request to the view function `view_gifters_gifts` to retrieve the gifts sent by 
            the user.
    */

    /* 
      TODO #4: Parse the response from the view request and create the gifts array using the given 
            data. Return the new gifts array.

      HINT:
        - Remember to convert the amount to floating point number
    */
    return []; // PLACEHOLDER 
  };

  /*
    Cancels a gift sent by the user.
  */
  const cancelGift = async (recipientAddress: String) => {
    /* 
      TODO #6: Set the `isTxnInProgress` state to true.
    */

    /* 
      TODO #7: Submit a transaction to the `remove_birthday_gift` entry function to cancel the gift
            for the recipient.
      
      HINT:
        - In case of error, set the `isTxnInProgress` state to false and return.
    */

    /*
      TODO #8: Set the `isTxnInProgress` state to false.
    */

  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <CardTitle className="my-2">Gifts sent from you</CardTitle>
        <CardDescription className="break-normal w-96">
          View all of the unclaimed gifts you have sent to others. You can cancel any of these gifts
          at any time and the APT will be returned to your wallet.
        </CardDescription>
      </div>
      <ScrollArea className="border rounded-lg">
        <div className="h-fit max-h-56">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Recipient</TableHead>
                <TableHead className="text-center">Birthday</TableHead>
                <TableHead className="text-center">Amount</TableHead>
                <TableHead className="text-center">Cancel gift</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                /* 
                  TODO #1: If the gifts array is empty, display a table row with a message that the user
                        doesn't have any active gifts. Use the provided components to display the
                        message.

                  HINT: 
                    - Use the length property of the gifts array to determine if it is empty
                   
                  -- Component -- 
                  <TableRow>
                    <TableCell colSpan={4}>
                      <p className="break-normal w-80 text-center">
                        You don't have any active gifts. Send a gift to someone to get started!
                      </p>
                    </TableCell>
                  </TableRow>
                */
              }
              {
                /*
                  TODO #5: Iterate over the gifts array and display each gift in a table row. Use the 
                        provided components to display the gift information.

                  -- Components --
                  <TableRow key={index}>
                    <TableCell className="font-mono">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="underline">
                            PLACEHOLDER: Display the truncated address of the gift recipient here
                            HINT: Show the first 6 characters of the address (including 0x), followed by '...', then the last 4 characters of the address
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              PLACEHOLDER: Display the full address of the gift sender here
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="underline">
                            PLACEHOLDER: Show the release date of the gift here
                            HINT: 
                              - Convert the timestamp to a Date object and use the toLocaleDateString() method to format the date
                              - Note that the timestamp from Aptos is in seconds, but not milliseconds
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              PLACEHOLDER: Show the release date and time of the gift here
                              HINT: 
                                - Convert the timestamp to a Date object and use the toLocaleString() method to format the date and time
                                - Note that the timestamp from Aptos is in seconds, but not milliseconds
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="font-mono text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="underline">
                            PLACEHOLDER: Show the gift amount in APT here (rounded to 2 decimal places)
                            HINT: Remember to show the unit of the amount (APT) after the amount
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              PLACEHOLDER: Show the gift amount in APT here (rounded to 8 decimal places)
                              HINT: Remember to show the unit of the amount (APT) after the amount
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <X className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will cancel the gift for{" "}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="underline">
                                    PLACEHOLDER: Display the truncated address of the gift sender here
                                    HINT: Show the first 6 characters of the address (including 0x), followed by '...', then the last 4 characters of the address
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      PLACEHOLDER: Display the full address of the gift sender here
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider> and return the{" "}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="underline">
                                    PLACEHOLDER: Show the gift amount in APT here (rounded to 2 decimal places)
                                    HINT: Remember to show the unit of the amount (APT) after the amount
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      PLACEHOLDER: Show the gift amount in APT here (rounded to 8 decimal places)
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider> APT to your wallet.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Nevermind</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {console.log("PLACEHOLDER: Call the cancelGift function here")}}
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                */
              }
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
