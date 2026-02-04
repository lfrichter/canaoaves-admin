"use client";

import { CrudFilters } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect } from "react";

export function useServerTable<TData extends object>({
  resource,
  columns,
  searchParams,
  initialPageSize = 10,
  searchField = "name",
  sorters, // [NOVO] Aceita ordenação inicial
  meta,    // [NOVO] Aceita meta dados extras (filtros customizados)
}: {
  resource: string;
  columns: ColumnDef<TData>[];
  searchParams: { [key: string]: string | undefined };
  initialPageSize?: number;
  searchField?: string;
  sorters?: any; // Tipagem flexível para passar direto pro Refine
  meta?: any;    // Tipagem flexível
}) {
  // Parse URL params (suporta tanto 'current' quanto 'currentPage' para robustez)
  const current = Number(searchParams?.current || searchParams?.currentPage || 1);
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
        // [CORREÇÃO] 'as any' aqui evita o erro estrito de tipagem do Refine
        current: current,
        pageSize: pageSize,
      } as any,

      // [ATUALIZAÇÃO] Agora repassamos sorters e mergeamos o meta
      sorters: sorters,
      meta: {
        ...meta, // Mantém filtros extras passados pela página (ex: status, userStatus)
        searchQuery,
        paramId,
      },
    },

    columns,
  });

  // [NOVO] Sincroniza filtros quando os parâmetros da URL mudam (navegação client-side)
  useEffect(() => {
    const filters: CrudFilters = [];

    // Filtro de Busca Geral
    filters.push({
      field: searchField,
      operator: "contains",
      value: searchQuery || undefined,
    });

    // Filtro por ID (se houver)
    filters.push({
      field: "id",
      operator: "eq",
      value: paramId || undefined,
    });

    table.refineCore.setFilters(filters, "merge");
  }, [searchQuery, paramId, searchField, table.refineCore.setFilters]);

  return table;
}
