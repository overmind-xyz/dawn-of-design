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
import { Types } from "aptos";

type Gift = {
  address: string;
  amount: number;
  timestamp: number;
};

/*
  List of gifts that the user has sent to others.
*/
export default function SentGiftList(props: {
  isTxnInProgress: boolean;
  setTxn: (isTxnInProgress: boolean) => void;
}) {
  // Wallet adapter state
  const { account, connected, signAndSubmitTransaction } = useWallet();
  // Gift list state
  const [gifts, setGifts] = React.useState<Gift[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  /*
    Retrieves the gifts sent by the user whenever the account, connected, or isTxnInProgress state 
    changes.
  */
  useEffect(() => {
    if (connected) {
      setIsLoading(true);
      getGifts()
        .then((gifts) => {
          setGifts(gifts);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [account, connected, props.isTxnInProgress]);

  /*
    Retrieves the gifts sent by the user.
  */
  const getGifts = async () => {
    if (!account?.address) {
      return [];
    }

    const body: Types.TransactionPayload = {
      type: "view_function_payload",
      function:
        "0x15ead142473563d1a07fae2aa04c6d38d19b33222c110a4667af357aa31439c2::birthday_bot::view_gifters_gifts",
      type_arguments: [],
      arguments: [account?.address],
    };

    try {
      const res = await fetch(`https://fullnode.testnet.aptoslabs.com/v1/view`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch recipient gifts: ${res.status}`);
      }

      const data = await res.json();

      const [recipient, rawGiftAmounts, giftTimestampsSeconds] = data;

      const giftAmounts = rawGiftAmounts.map((amount: number) => amount / 100000000);

      const gifts = recipient.map((address: string, index: number) => {
        return {
          address,
          amount: giftAmounts[index],
          timestamp: giftTimestampsSeconds[index],
        };
      });

      gifts.sort(
        (a: { timestamp: number }, b: { timestamp: number }) =>
          a.timestamp - b.timestamp
      );

      return gifts;
    } catch (error) {
      console.error("Error fetching recipient gifts:", error);
      return [];
    }
  };

  /*
    Cancels a gift sent by the user.
  */
  const cancelGift = async (recipientAddress: string) => {
    props.setTxn(true);

    try {
      const txnBody: Types.TransactionPayload = {
        type: "entry_function_payload", // The type of transaction payload
        type_arguments: [],
        function:
          "0x15ead142473563d1a07fae2aa04c6d38d19b33222c110a4667af357aa31439c2::birthday_bot::remove_birthday_gift",
        arguments: [recipientAddress], // since 'gifter' is the only argument to this function
      };

      // Use the wallet adapter's function to sign and submit
      await signAndSubmitTransaction(txnBody);
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }

    props.setTxn(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <CardTitle className="my-2">Gifts sent from you</CardTitle>
        <CardDescription className="break-normal w-96">
          View all of the unclaimed gifts you have sent to others. You can
          cancel any of these gifts at any time, and the APT will be returned to
          your wallet.
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : gifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <p className="break-normal w-80 text-center">
                      You don't have any active gifts. Send a gift to someone to get started!
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                gifts.map((gift, index) => {
                  const aptosTime = gift.timestamp;
                  const javascriptTimestampInMilliseconds = aptosTime * 1000; // Convert to milliseconds
                  const releaseDate = new Date(
                    javascriptTimestampInMilliseconds
                  );
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-mono">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="underline">
                              {`${gift.address.slice(0, 6)}...
                ${gift.address.slice(-4)}`}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{gift.address}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="underline">
                              {releaseDate.toLocaleDateString()}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{releaseDate.toLocaleString()}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="font-mono text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="underline">
                              {`${gift.amount.toFixed(2)} APT`}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{`${gift.amount.toFixed(8)} APT`}</p>
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
                                      {`${account?.address.slice(0, 6)}...
                ${account?.address.slice(-4)}`}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{account?.address}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>{" "}
                                and return the{" "}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger className="underline">
                                      {`${gift.amount.toFixed(2)}`}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{`${gift.amount.toFixed(8)} APT`}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>{" "}
                                APT to your wallet.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Nevermind</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  cancelGift(gift.address);
                                }}
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              }
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
