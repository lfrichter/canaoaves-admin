"use client";

import { CrudFilters, HttpError } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useServerTable<TData extends object>({
  resource,
  columns,
  initialPageSize = 10,
  searchField = "name",
  sorters,
  meta,
}: {
  resource: string;
  columns: ColumnDef<TData>[];
  initialPageSize?: number;
  searchField?: string;
  sorters?: any;
  meta?: any;
}) {
  const searchParams = useSearchParams();

  const current = Number(searchParams.get("current") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? initialPageSize);
  const searchQuery = searchParams.get("q") ?? "";
  const paramId = searchParams.get("id");

  /**
   * 🔑 Filtros PRONTOS antes do useTable
   */
  const filters: CrudFilters = useMemo(() => {
    const f: CrudFilters = [];

    if (searchQuery) {
      f.push({
        field: searchField,
        operator: "contains",
        value: searchQuery,
      });
    }

    if (paramId) {
      f.push({
        field: "id",
        operator: "eq",
        value: paramId,
      });
    }

    return f;
  }, [searchQuery, paramId, searchField]);

  return useTable<TData, HttpError>({
    refineCoreProps: {
      resource,

      pagination: {
        current,
        pageSize,
      } as any,

      filters: {
        initial: filters, // 🔥 ponto crítico
      },

      sorters,

      meta: {
        ...meta,
        searchQuery,
        paramId,
        searchField,
      },

      queryOptions: {
        staleTime: 0,
        refetchOnMount: true,
      },
    },
    columns,
  });
}
