import React, { useEffect } from "react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AptosClient, Types } from "aptos";
import { sleep } from "@/lib/utils";

type RecipientGifts = {
  from: string;
  amount: number;
  timestamp: number;
};

const MODULE_ADDRESS = process.env.MODULE_ADDRESS;
const MODULE_NAME = process.env.MODULE_NAME;
const RESOURCE_ACCOUNT_ADDRESS = process.env.RESOURCE_ACCOUNT_ADDRESS;

// Create an AptosClient to interact with testnet.
const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");

/* 
  Lists all of the user's received gifts. Allows the user to claim gifts whose release time has 
  passed.
*/
export default function ReceivedGiftList(props: {
  isTxnInProgress: boolean;
  setTxn: (isTxnInProgress: boolean) => void;
}) {
  // Lists of gifts sent to the user
  const [gifts, setGifts] = React.useState<RecipientGifts[]>([]);
  // State for the wallet
  const { account, connected, signAndSubmitTransaction } = useWallet();

  /* 
    Get's the gifts sent to the user when the account, connected, or isTxnInProgress state 
    variables change. 
  */
  useEffect(() => {
    if (connected) {
      getGifts().then((gifts) => {
        setGifts(gifts);
      });
    }
  }, [account, connected, props.isTxnInProgress]);

  /* 
    Gets the gifts sent to the user.
  */
  const getGifts = async () => {
    if (!account?.address) {
      return [];
    }

    const body: Types.TransactionPayload = {
      type: "view_function_payload",
      function:
        "0x15ead142473563d1a07fae2aa04c6d38d19b33222c110a4667af357aa31439c2::birthday_bot::view_recipients_gifts",
      type_arguments: [],
      arguments: [account?.address],
    };

    let res;
    try {
      res = await fetch(`https://fullnode.testnet.aptoslabs.com/v1/view`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
    } catch (e) {
      console.error("Error fetching recipient gifts:", e);
      return;
    }

    const data = await res.json();

    const [giftFroms, rawGiftAmounts, giftTimestampsSeconds] = data;

    const giftAmounts = rawGiftAmounts.map(
      (amount: number) => amount / 100000000
    );

    const gifts = giftFroms.map((from: string, index: number) => {
      return {
        from,
        amount: giftAmounts[index],
        timestamp: giftTimestampsSeconds[index],
      };
    });

    gifts.sort(
      (a: { timestamp: number }, b: { timestamp: number }) =>
        a.timestamp - b.timestamp
    );

    return gifts;
  };

  const claimGift = async (giftSender: string) => {
    props.setTxn(true);

    try {
      const txnBody: Types.TransactionPayload = {
        type: "entry_function_payload",
        type_arguments: [],
        function:
          "0x15ead142473563d1a07fae2aa04c6d38d19b33222c110a4667af357aa31439c2::birthday_bot::claim_birthday_gift",
        arguments: [giftSender],
      };

      await signAndSubmitTransaction(txnBody);
    } catch (error) {
      console.error("Error submitting transaction:", error);
      props.setTxn(false);
      return;
    }

    props.setTxn(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <CardTitle className="my-2">Gifts sent to you!</CardTitle>
        <CardDescription className="break-normal w-96">
          View and open all of your gifts! You can only open gifts after the
          release time has passed. Spend your gifts on something nice!
        </CardDescription>
      </div>
      <ScrollArea className="border rounded-lg">
        <div className="h-fit max-h-56">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">From</TableHead>
                <TableHead className="text-center">Amount</TableHead>
                <TableHead className="text-center">Release time</TableHead>
                <TableHead className="text-center">Claim</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gifts.length == 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <p className="break-normal w-80 text-center">
                      You have no gifts yet. Send some gifts to your friends for
                      their birthdays!
                    </p>
                  </TableCell>
                </TableRow>
              )}
              {gifts.map((gift, index) => {
                const aptosTime = gift.timestamp;
                const javascriptTimestampInMilliseconds = aptosTime * 1000;
                const releaseDate = new Date(javascriptTimestampInMilliseconds);
                const isGiftClaimable =
                  new Date().getTime() > gift.timestamp * 1000;

                return (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="underline">
                            {`${gift.from.slice(0, 6)}...
                ${gift.from.slice(-4)}`}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{gift.from}</p>
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
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => claimGift(gift.from)}
                        disabled={!isGiftClaimable}
                      >
                        Claim
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
