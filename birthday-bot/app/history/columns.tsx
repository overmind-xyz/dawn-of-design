'use client'

import { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* 
  Type for events in the history table
*/
export type Event = {
  id: number, 
  type: "add-birthday-gift" | "claim-birthday-gift" | "cancel-birthday-gift", 
  eventTimestamp: number, 
  
  recipient: string,
  amount: number,
  gifter: string,
  giftTimestamp: number,
}

/* 
  The file contains the columns for the history table. 
*/
export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "id",
    header: () => <div className="text-center">ID</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("id")}</div>
    }
  }, 
  {
    accessorKey: "type",
    header: () => <div className="text-center">Type</div>,
    cell: ({ row }) => {
      let type = row.getValue("type");

      if (type == "add-birthday-gift") {
        return <div className="text-center">Gift created</div>
      } else if (type == "claim-birthday-gift") {
        return <div className="text-center">Gift claimed</div>
      } else if (type == "cancel-birthday-gift") {
        return <div className="text-center">Gift canceled</div>
      } else {
        return <div className="text-center">Unknown</div>
      }
    }
  },
  {
    accessorKey: "eventTimestamp",
    header: () => <div className="text-center">Event Timestamp</div>,
    cell: ({ row }) => {
      let timestamp = parseInt(row.getValue("eventTimestamp"));

      let date = new Date(timestamp * 1000);

      return <div className="text-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="underline">
              {date.toLocaleDateString()}
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {date.toLocaleString()}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    }
  },
  {
    accessorKey: "gifter",
    header: () => <div className="text-center">Gifter</div>,
    cell: ({ row }) => {
      const gifter = row.getValue("gifter") as string | undefined;

      if (gifter == undefined) {
        return <div className="text-center">-</div>
      } else {
        let truncatedAddress =
          gifter.slice(0, 6) + "..." + gifter.slice(-4);
        return <div className="text-center font-mono">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="underline">
                {truncatedAddress}
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {gifter}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      }
    }
  },
  {
    accessorKey: "recipient",
    header: () => <div className="text-center">Recipient</div>,
    cell: ({ row }) => {
      let recipient = row.getValue("recipient") as string | undefined;

      if (recipient == undefined) {
        return <div className="text-center">-</div>
      } else {
        let truncatedAddress =
          recipient.slice(0, 6) + "..." + recipient.slice(-4);
        return <div className="text-center font-mono">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="underline">
                {truncatedAddress}
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {recipient}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      }
    }
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-center">Amount</div>,
    cell: ({ row }) => {
      if (row.getValue("amount") == undefined) {
        return <div className="text-center">-</div>
      }
      const amount = parseFloat(row.getValue("amount")) / 100000000;
      const formatted = amount.toLocaleString(undefined, {
        minimumFractionDigits: 8,
      });
      
 
      return <div className="text-right font-small font-mono">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="underline">
              {amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}{" "}
              APT
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {amount.toLocaleString(undefined, {
                  minimumFractionDigits: 8,
                })}{" "}
                APT
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    },
  },
  {
    accessorKey: "giftTimestamp",
    header: () => <div className="text-center">Gift Timestamp</div>,
    cell: ({ row }) => {
      if (row.getValue("giftTimestamp") == undefined) {
        return <div className="text-center">-</div>
      }
      const giftTimestamp = parseInt(row.getValue("giftTimestamp"));
      const date = new Date(giftTimestamp * 1000);

      return <div className="text-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="underline">
              {date.toLocaleDateString()}
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {date.toLocaleString()}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    }
  },
];