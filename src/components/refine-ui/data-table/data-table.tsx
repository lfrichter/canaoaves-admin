"use client";

import { DataTablePagination } from "@/components/refine-ui/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { BaseRecord, HttpError } from "@refinedev/core";
import type { UseTableReturnType } from "@refinedev/react-table";
import { flexRender } from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";

type DataTableProps<TData extends BaseRecord> = {
  table: UseTableReturnType<TData, HttpError>;
};

export function DataTable<TData extends BaseRecord>({
  table,
}: DataTableProps<TData>) {
  const {
    reactTable,
    reactTable: { getHeaderGroups, getRowModel, getAllColumns },
    refineCore: { tableQuery },
  } = table;

  const leafColumns = table.reactTable.getAllLeafColumns();
  const isLoading = tableQuery.isLoading;
  const pageSize = table.reactTable.getState().pagination.pageSize;

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [isOverflowing, setIsOverflowing] = useState({
    horizontal: false,
    vertical: false,
  });

  useEffect(() => {
    const checkOverflow = () => {
      if (tableRef.current && tableContainerRef.current) {
        const table = tableRef.current;
        const container = tableContainerRef.current;
        const horizontalOverflow = table.offsetWidth > container.clientWidth;
        const verticalOverflow = table.offsetHeight > container.clientHeight;
        setIsOverflowing({
          horizontal: horizontalOverflow,
          vertical: verticalOverflow,
        });
      }
    };
    checkOverflow();
    if (typeof window !== "undefined")
      window.addEventListener("resize", checkOverflow);
    const timeoutId = setTimeout(checkOverflow, 100);
    return () => {
      if (typeof window !== "undefined")
        window.removeEventListener("resize", checkOverflow);
      clearTimeout(timeoutId);
    };
  }, [tableQuery.data?.data, pageSize]);

  return (
    <div className={cn("flex", "flex-col", "flex-1", "gap-4")}>
      <div ref={tableContainerRef} className={cn("rounded-md", "border")}>
        <Table ref={tableRef} style={{ tableLayout: "fixed", width: "100%" }}>
          <TableHeader>
            {getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isPlaceholder = header.isPlaceholder;
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        ...getCommonStyles({
                          column: header.column,
                          isOverflowing: isOverflowing,
                        }),
                      }}
                    >
                      {isPlaceholder ? null : (
                        <div className={cn("flex", "items-center", "gap-1")}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="relative">
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {leafColumns.map((col) => (
                    <TableCell key={col.id}>
                      <div className="h-8 bg-muted/20 animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : getRowModel().rows?.length ? (
              getRowModel().rows.map((row) => (
                <TableRow
                  key={row.original?.id ?? row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        ...getCommonStyles({
                          column: cell.column,
                          isOverflowing,
                        }),
                      }}
                    >
                      <div className="truncate">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <DataTableNoData
                isOverflowing={isOverflowing}
                columnsLength={getAllColumns().length}
              />
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && getRowModel().rows?.length > 0 && (
        <DataTablePagination table={reactTable} />
      )}
    </div>
  );
}

// Helpers...
function DataTableNoData({ isOverflowing, columnsLength }: any) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columnsLength} className="h-24 text-center">
        Sem resultados.
      </TableCell>
    </TableRow>
  );
}

export function getCommonStyles<TData>({
  column,
  isOverflowing,
}: any): React.CSSProperties {
  const isPinned = column.getIsPinned();
  return {
    width: column.getSize(),
    position: isOverflowing.horizontal && isPinned ? "sticky" : "relative",
    left:
      isOverflowing.horizontal && isPinned === "left"
        ? `${column.getStart("left")}px`
        : undefined,
    right:
      isOverflowing.horizontal && isPinned === "right"
        ? `${column.getAfter("right")}px`
        : undefined,
    background: isOverflowing.horizontal && isPinned ? "var(--background)" : "",
    zIndex: isOverflowing.horizontal && isPinned ? 1 : 0,
  };
}

DataTable.displayName = "DataTable";