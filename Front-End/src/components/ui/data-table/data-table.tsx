"use client"

import {
  Table as TanStackTable,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Skeleton } from "../skeleton"
import React, { useImperativeHandle } from "react"

export interface DataTableHandle<TData> {
    getTable: () => TanStackTable<TData>;
    children?: React.ReactNode;
}

export interface DataTableSubComponentProps<TData> {
    table: TanStackTable<TData>;
}

export interface DataTableToolbarProps<TData> extends DataTableSubComponentProps<TData> {
    dataTableRef: React.RefObject<DataTableHandle<TData>>;
    children?: React.ReactNode;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  loading?: boolean;
  toolbar?: (props: DataTableToolbarProps<TData>) => React.ReactNode;
  ref?: React.Ref<DataTableHandle<TData>>;
  pagination?: React.ComponentType<DataTableSubComponentProps<TData>>;
  manualPagination?: boolean;
  noResultsText?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  className,
  loading,
  toolbar,
  ref,
  manualPagination,
  noResultsText,
  pagination: Pagination,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: Pagination !== undefined ? getPaginationRowModel() : undefined,
    manualPagination: manualPagination,
    state: {
      sorting,
      columnFilters,
    },
  });

  useImperativeHandle(ref, () => ({
    getTable: (): TanStackTable<TData> => table,
  }));

  const renderLoading = () => {
    const rows: React.ReactNode[] = [];

    for (let idx = 0; idx < 10; idx++) {
      rows.push(
        <TableRow key={idx}>
          {columns.map(c =>
            <TableCell key={c.id}>
              <Skeleton className='m-2'/>
            </TableCell>
          )}
        </TableRow>
      );
    }

    return rows;
  };

  const renderHeader = () => {
    return table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {
          headerGroup.headers.map((header) => {
            return (
              <TableHead key={header.id}>
                {
                  header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                }
              </TableHead>
            );
          })
        }
      </TableRow>
    ));
  };

  const renderBody = () => {
    if (loading) {
      return renderLoading();
    }

    const rows = table.getRowModel().rows;
    if (rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            {noResultsText ?? 'No results.'}
          </TableCell>
        </TableRow>
      );
    }

    return rows.map((row) => {
      return (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && 'selected'}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      );
    });
  };

  return (
    <>
    {toolbar && toolbar({ dataTableRef: ref as React.RefObject<DataTableHandle<TData>>, table })}
    <div className={cn(
      "rounded-md border",
      className,
    )}>
      <Table>
        <TableHeader>
          {renderHeader()}
        </TableHeader>
        <TableBody>
          {renderBody()}
        </TableBody>
      </Table>
    </div>
    {
      Pagination !== undefined &&
      <div className='py-2 w-full'>
        <Pagination table={table} />
      </div>
    }
    </>
  )
}
