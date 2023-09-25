"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Unplug, Home } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import TypographyH2 from "@/components/TypographyH2";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import WalletSelector from "../../components/walletSelector";
import TypographyH1 from "@/components/TypographyH1";
import { TypographyP } from "@/components/TypographyP";
import { HistoryTable } from "./HistoryTable";
import { Event, columns } from "./columns";

/* 
  This page displays the history of the user's account.
  It fetches all the events from the blockchain and filters
  them to only show the events that are relevant to the user.
*/
export default function HistoryPage() {
  const { connected, account, isLoading, network } = useWallet();
  const [data, setData] = useState<Event[]>([]);
  const [accountExists, setAccountExists] = useState<Boolean>(true);

  useEffect(() => {
    console.log(data);
  });
  /*
    Checks if the connected account exists whenever the connected and account variables change.
    Also fetches the events from the birthday_bot module and filters them to only show the events 
    that are relevant to the user.
  */
  useEffect(() => {
    checkIfAccountExists();

    if (connected && account) {
      getEvents().then((events) => {
        /* 
          Check if the account address has any leading zeros after the '0x' prefix. If it does,
          remove the leading zeros. This is to account for the fact that the account address
          from the wallet provider may have leading zeros, but the account address from the module 
          events does not have leading zeros.
        */
        while (account.address.startsWith("0x0")) {
          account.address = account.address.replace("0x0", "0x");
        }
        /* 
          Organizes, filters, and sorts the events to only show the events that are relevant to the
          user.
        */
        setData(
          events
            .map((event: any) => {
              let event_type:
                | "add-birthday-gift"
                | "claim-birthday-gift"
                | "cancel-birthday-gift"
                | undefined;
              let recipient = event.data.recipient;
              let amount = event.data.gift_amount_apt;
              let gifter = event.data.gifter;
              let giftTimestamp = event.data.birthday_timestamp_seconds;
              if (
                event.type ===
                `${process.env.MODULE_ADDRESS}::${process.env.MODULE_NAME}::BirthdayGiftAddedEvent`
              ) {
                event_type = "add-birthday-gift";
              } else if (
                event.type ===
                `${process.env.MODULE_ADDRESS}::${process.env.MODULE_NAME}::BirthdayGiftClaimedEvent`
              ) {
                event_type = "claim-birthday-gift";
              } else if (
                event.type ===
                `${process.env.MODULE_ADDRESS}::${process.env.MODULE_NAME}::BirthdayGiftRemovedEvent`
              ) {
                event_type = "cancel-birthday-gift";
              }
              return {
                id: parseInt(
                  `${
                    event.sequence_number
                  }${event.guid.creation_number.toString()}`
                ),
                type: event_type,
                eventTimestamp: event.data.event_creation_timestamp_seconds,

                recipient: recipient,
                amount: amount,
                gifter: gifter,
                giftTimestamp: giftTimestamp,
              };
            })
            .filter((event: Event) => {
              return (
                event.recipient === account?.address ||
                event.gifter === account?.address
              );
            })
            .sort((a: Event, b: Event) => {
              return a.eventTimestamp - b.eventTimestamp;
            })
            .reverse()
        );
      });
    } else {
      setData([]);
    }
  }, [connected, account]);

  const checkIfAccountExists = async () => {
    if (!connected || !account || !account.address) {
      return;
    }

    try {
      const response = await fetch(
        `https://fullnode.testnet.aptoslabs.com/v1/accounts/${account.address}`,
        {
          method: "GET",
        }
      );

      const accountData = await response.json();

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
      setAccountExists(false);
    }
  };

  /* 
    Fetches the events emitted from the birthday_bot module.
  */
  const getEvents = async () => {
    const eventEndpoints = [
      { endpoint: "/birthday_gift_added_events", ty: "add-birthday-gift" },
      {
        endpoint: "/birthday_gift_claimed_events",
        ty: "claim-birthday-gift",
      },
      {
        endpoint: "/birthday_gift_removed_events",
        ty: "cancel-birthday-gift",
      },
    ];
    let allEvents: any = [];

    for (const endpoint of eventEndpoints) {
      const response = await fetch(
        `https://fullnode.testnet.aptoslabs.com/v1/accounts/${process.env.RESOURCE_ACCOUNT_ADDRESS}/events/${process.env.MODULE_ADDRESS}::${process.env.MODULE_NAME}::ModuleEvents${endpoint.endpoint}`,
        {
          method: "GET",
        }
      );

      const eventData = await response.json();

      allEvents = allEvents.concat(eventData);
    }

    return allEvents;
  };

  return (
    <div className="min-h-screen max-h-min w-full max-w-screen flex flex-col items-center dark:bg-slate-950">
      <div className="flex w-full max-w-screen-2xl lg:flex-row flex-col  justify-between items-center my-2 px-40">
        <TypographyH2>Birthday Bot</TypographyH2>
        <div className="flex flex-row justify-around gap-2">
          <ThemeToggle />
          <a href="/">
            <Button variant="outline">
              Home
              <Home className="ml-2" size={16} />
            </Button>
          </a>
          <WalletSelector />
        </div>
      </div>
      <Separator />
      <div className="mt-4 h-full">
        <div className="flex flex-col items-center">
          <TypographyH1>Account History</TypographyH1>
          <TypographyP>View your account history below.</TypographyP>
        </div>
        <HistoryTable columns={columns} data={data} />
      </div>
      {
        // -- Alert Component --
        connected && !isLoading && network?.name.toString() !== "Testnet" && (
          <div className="h-full w-full flex flex-row items-end justify-end grow">
            <Alert variant="destructive" className="w-fit mb-2 mr-2">
              <Unplug className="h-4 w-4" />
              <AlertTitle>Switch your network!</AlertTitle>
              <AlertDescription>
                Switch your network to Testnet to use this app.
              </AlertDescription>
            </Alert>
          </div>
        )
      }
      {
        // -- Alert Component --
        connected &&
          isLoading &&
          network?.name.toString() == "Testnet" &&
          accountExists && (
            <div className="h-full w-full flex flex-row items-end justify-end grow">
              <Alert variant="destructive" className="w-fit mb-2 mr-2">
                <Unplug className="h-4 w-4" />
                <AlertTitle>Account not found!</AlertTitle>
                <AlertDescription>
                  Please make sure your account is exists on Testnet and try
                  again.
                </AlertDescription>
              </Alert>
            </div>
          )
      }
    </div>
  );
}
