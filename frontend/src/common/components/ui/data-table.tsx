import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { Label } from "@/common/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/common/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/common/components/ui/table";
import { cn } from "@/common/utils/classnames";
import { AnimatePresence, motion } from "framer-motion";
import { Package } from "lucide-react";
import { useMemo, useState } from "react";
import { Checkbox } from "./checkbox";
import { Skeleton } from "./skeleton";

interface Props<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  bulkAction?: (rows: T[], clearSelection: () => void) => React.ReactNode;
  endAction?: ColumnDef<T>["cell"];
  emptyState?: React.ReactNode;
  className?: string;
  pagination?: boolean;
  bordered?: boolean;
  rounded?: boolean;
}

export function DataTable<T>({
  data: initialData,
  columns: initialColumns,
  onRowClick,
  isLoading = false,
  bulkAction,
  endAction,
  emptyState,
  className,
  pagination = true,
  bordered = true,
  rounded = true,
}: Props<T>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const clearSelection = () => setRowSelection({});

  const columns = useMemo(() => {
    let modifiedColumns = [...initialColumns];

    if (bulkAction) {
      const selectionColumn: ColumnDef<T> = {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center w-min">
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center w-min" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      };
      modifiedColumns = [selectionColumn, ...modifiedColumns];
    }

    if (endAction) {
      const actionsColumn: ColumnDef<T> = {
        id: "actions",
        header: () => <div className="flex items-center justify-center">Actions</div>,
        cell: endAction,
        enableSorting: false,
        enableHiding: false,
      };
      modifiedColumns = [...modifiedColumns, actionsColumn];
    }

    return modifiedColumns;
  }, [initialColumns, bulkAction, endAction]);

  const table = useReactTable({
    data: initialData,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelectedRows = selectedRows.length > 0;

  return (
    <>
      <AnimatePresence>
        {bulkAction && hasSelectedRows && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20" style={{ width: "fit-content" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex items-center gap-2 px-3 py-2 min-w-32 bg-background border border-border rounded-xl shadow-lg"
            >
              {bulkAction(
                selectedRows.map((row) => row.original),
                clearSelection
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className={cn("flex w-full flex-col gap-6", className)}>
        <div className={cn("relative overflow-auto", bordered && "border", rounded && "rounded-lg")}>
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={header.column.id === "select" ? { width: "50px" } : undefined}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="hover:bg-transparent">
                      {Array(columns.length)
                        .fill(0)
                        .map((_, cellIndex) => (
                          <TableCell key={`skeleton-cell-${cellIndex}`}>
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(onRowClick ? "hover:bg-muted/50" : "hover:bg-transparent")}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        onClick={() =>
                          cell.column.id !== "select" && cell.column.id !== "actions" && onRowClick
                            ? onRowClick(row.original)
                            : undefined
                        }
                        className={
                          cell.column.id !== "select" && cell.column.id !== "actions" && onRowClick
                            ? "cursor-pointer"
                            : ""
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length}>
                    {emptyState || (
                      <div className="flex flex-col h-32 gap-1 items-center justify-center text-center">
                        <Package className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
                        <p className="text-sm text-muted-foreground">No results found</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {pagination && table.getRowModel().rows.length > 0 && table.getPageCount() > 1 && (
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="text-sm text-muted-foreground">
              <span className="hidden lg:inline">{table.getFilteredRowModel().rows.length} total rows</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="rows-per-page" className="text-sm font-medium whitespace-nowrap">
                  Rows per page
                </Label>
                <Select value={`${pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
                  <SelectTrigger className="w-20" id="rows-per-page">
                    <SelectValue placeholder={pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((size) => (
                      <SelectItem key={size} value={`${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => table.previousPage()}
                      className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {getPageRange(pageIndex, table.getPageCount()).map((i) => (
                    <PaginationItem key={i}>
                      {i === -1 ? (
                        <span className="px-2">...</span>
                      ) : (
                        <PaginationLink
                          isActive={pageIndex === i}
                          onClick={() => table.setPageIndex(i)}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => table.nextPage()}
                      className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function getPageRange(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  if (currentPage < 3) {
    return [0, 1, 2, 3, -1, totalPages - 1];
  }

  if (currentPage > totalPages - 4) {
    return [0, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1];
  }

  return [0, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages - 1];
}
