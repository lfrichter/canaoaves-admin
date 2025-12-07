"use client";

import { CrudFilters } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";

export function useServerTable<TData extends object>({
  resource,
  columns,
  searchParams,
  initialPageSize = 10,
  searchField = "name",
}: {
  resource: string;
  columns: ColumnDef<TData>[];
  searchParams: { [key: string]: string | undefined };
  initialPageSize?: number;
  searchField?: string;
}) {
  // Parse URL params
  const currentPage = Number(searchParams?.currentPage ?? "1");
  const pageSize = Number(searchParams?.pageSize ?? initialPageSize.toString());
  const searchQuery = searchParams?.q ?? "";
  const paramId = searchParams?.id;

  // Build server-side filters
  const initialFilters: CrudFilters = [];

  if (searchQuery) {
    initialFilters.push({
      field: searchField,
      operator: "contains",
      value: searchQuery,
    });
  }

  if (paramId) {
    initialFilters.push({
      field: "id",
      operator: "eq",
      value: paramId,
    });
  }

  // Pass filters + pagination via refineCoreProps
  const table = useTable<TData>({
    refineCoreProps: {
      resource,
      syncWithLocation: true,

      filters: {
        mode: "server",
        // ✅ Use `initial` para definir os filtros INICIAIS (a partir da URL)
        initial: initialFilters,
      },

      pagination: {
        // ✅ Use `current` e `pageSize` para paginação
        current: currentPage,
        pageSize: pageSize,
      },

      // Opcional: meta pode ser útil para passar dados extras ao data provider
      meta: {
        searchQuery,
        paramId,
      },
    },

    columns,
  });

  return table;
}
