"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface HistoryTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

/* 
  Component to display the history of events in a table.
*/
export function HistoryTable<TData, TValue>({
  columns,
  data,
}: HistoryTableProps<TData, TValue>) {
  // wallet adapter state
  const { isLoading, connected } = useWallet();

  /* 
    Table configuration state
  */
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  /* 
    Sets the page size of the table in the first render. 
  */
  useEffect(() => {
    table.setPageSize(pageSize);
  }, []);

  /*
    Table object
  */
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
              <ChevronDown className="ml-2" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!connected && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Connect your wallet to view your history.
                </TableCell>
              </TableRow>
            )}
            {connected &&
              !isLoading &&
              table.getRowModel().rows?.length == 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No data.
                  </TableCell>
                </TableRow>
              )}
            {connected &&
              !isLoading &&
              table.getRowModel().rows?.length > 0 &&
              table.getRowModel().rows?.map((row, index) => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              {pageSize}
              <ChevronDown className="ml-2" size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Page Size</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={pageSize.toString()}
              onValueChange={(value) => {
                if (value === `${data.length}`) {
                  setPageSize(data.length);
                  table.setPageSize(data.length);
                } else {
                  setPageSize(parseInt(value));
                  table.setPageSize(parseInt(value));
                }
                setPageNumber(1);
                table.setPageIndex(0);
              }}
            >
              <DropdownMenuRadioItem value="5">5</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="15">15</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={`${data.length}`}>
                All
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            table.previousPage();
            setPageNumber(pageNumber - 1);
          }}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft size={14} />
        </Button>
        <span>
          Page {pageNumber} of {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            table.nextPage();
            setPageNumber(pageNumber + 1);
          }}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
