import { CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import React from "react";
import { format } from "date-fns";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Types } from "aptos";
import LoadingOverlay from "react-loading-overlay-ts";
import { GridLoader } from "react-spinners";
import { sleep } from "@/lib/utils";

/* 
  Card component to create new gifts. Contains a form to enter the address, amount, and date of the
  gift to be created. Also contains a popover with instructions on how to use the component.
*/
export default function GiftCreator(props: {
  isTxnInProgress: boolean;
  setTxn: (isTxnInProgress: boolean) => void;
}) {
  /* 
    State variables for the address, amount, and date of the gift to be created.
  */
  const [address, setAddress] = React.useState<string | undefined>();
  const [amount, setAmount] = React.useState<string | undefined>("0");
  const [date, setDate] = React.useState<Date | undefined>();
  // wallet state functions
  const { signAndSubmitTransaction } = useWallet();

  /* 
    Submits a transaction to the blockchain to create a new gift. Requires the address, amount, and 
    date state variables to be defined and valid.
  */
  const addGift = async () => {
    if (!address || !amount || !date) {
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      return;
    }

    props.setTxn(true);

    setAddress(address);
    setAmount(amount);
    setDate(date);

    const payload: Types.TransactionPayload = {
      type: "entry_function_payload", // The type of transaction payload
      function: `${process.env.MODULE_ADDRESS}::birthday_bot::add_birthday_gift`, // The address::module::function to call
      type_arguments: [],
      arguments: [
        address,
        Math.round(numericAmount * 1e8),
        Math.floor(date.getTime() / 1000),
      ],
    };

    try {
      await signAndSubmitTransaction(payload);
      await sleep(parseInt(process.env.TRANSACTION_DELAY_MILLISECONDS || "0"));
    } catch (error) {
      console.error("Error submitting transaction:", error);
      props.setTxn(false);
      return;
    }

    props.setTxn(false);

    setAddress("");
    setAmount("");
    setDate(undefined);
  };

  return (
    <div>
      <LoadingOverlay
        active={props.isTxnInProgress}
        spinner={
          <GridLoader color="#94a3b8" margin={0} speedMultiplier={0.75} />
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Gift Wrapper</CardTitle>
            <CardDescription className="break-normal w-96">
              Create an automated, on-chain gift for a friend!
              <br />
              Enter their address, the amount of APT to send them, and the day
              you want the gift to be available on. Go ahead and make their day!
              <br />
              <Dialog>
                <DialogTrigger className="underline">
                  Click here for more details
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>To create a new gift</DialogTitle>
                  <DialogDescription>
                    To create a new gift, enter the recipient's address, the
                    amount of APT you want to gift, and the date you want the
                    gift to be available on.
                  </DialogDescription>
                  <DialogTitle>To change a gift's date</DialogTitle>
                  <DialogDescription>
                    To change a gift's date, simply create a new gift with the
                    same recipient and 0 APT, and the new date you want the gift
                    to be available on.
                  </DialogDescription>
                  <DialogTitle>To add more APT to a gift</DialogTitle>
                  <DialogDescription>
                    To add more APT to a gift, create a new gift with the same
                    recipient and data, and the additional amount of APT you
                    want to gift.
                  </DialogDescription>
                  <DialogTitle>To cancel a gift</DialogTitle>
                  <DialogDescription>
                    To cancel a gift, use the separate "Cancel gift"
                    functionality in your active gift list.
                  </DialogDescription>
                </DialogContent>
              </Dialog>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="my-2">
              <Label htmlFor="address">Recipient&#39;s address</Label>
              <Input
                type="address"
                id="address"
                value={address || ""}
                placeholder="0x0000"
                className="font-mono"
                onChange={(event) => {
                  setAddress(event.target.value);
                }}
              />
            </div>
            <div className="my-2">
              <Label htmlFor="amount">Gift amount</Label>
              <Input
                type="amount"
                id="amount"
                value={amount || ""}
                placeholder="0"
                className="font-mono"
                onChange={(event) => {
                  setAmount(event.target.value);
                }}
              />
            </div>
            <div className="my-3 flex justify-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Select birthday</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="rounded-md border bg-white dark:bg-slate-950 dark:border-slate-900 z-50">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus={true}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => {
                addGift();
              }}
              disabled={
                address == undefined || amount == undefined || date == undefined
              }
            >
              Create gift
            </Button>
          </CardFooter>
        </Card>
      </LoadingOverlay>
    </div>
  );
}
