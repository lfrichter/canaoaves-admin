"use client";

import { CrudFilters, HttpError } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function useServerTable<TData extends object>({
  resource,
  columns,
  // searchParams ignorado pois agora usamos o hook direto (pode remover a prop das Pages depois)
  initialPageSize = 10,
  searchField = "name",
  sorters,
  meta,
}: {
  resource: string;
  columns: ColumnDef<TData>[];
  searchParams?: { [key: string]: string | undefined };
  initialPageSize?: number;
  searchField?: string;
  sorters?: any;
  meta?: any;
}) {
  // 1. Hook reativo do Next.js (Crucial para Client-Side Nav)
  const searchParamsHook = useSearchParams();

  const current = Number(searchParamsHook.get("current") || searchParamsHook.get("currentPage") || 1);
  const pageSize = Number(searchParamsHook.get("pageSize") || initialPageSize);
  const searchQuery = searchParamsHook.get("q") || "";
  const paramId = searchParamsHook.get("id");

  // 2. Configuração do Refine
  const table = useTable<TData, HttpError>({
    refineCoreProps: {
      resource,
      // syncWithLocation: true é ótimo, mas como temos lógica customizada para 'q' -> 'searchField',
      // vamos gerenciar os filtros via useEffect para garantir consistência.
      syncWithLocation: true,

      pagination: {
        current,
        pageSize,
      } as any,

      sorters,

      // Meta data para passar filtros extras para o DataProvider (Supabase)
      meta: {
        ...meta,
        searchQuery, // Passamos explícito para garantir que o DataProvider veja
        paramId,
      },

      // QueryOptions: Remove cache agressivo para evitar dados "stale" na troca de rota rápida
      queryOptions: {
        staleTime: 0,
        refetchOnMount: true,
      }
    },
    columns,
  });

  // 3. Sincronização URL -> Refine Filters
  useEffect(() => {
    const filters: CrudFilters = [];

    // Lógica de Busca Global (q -> searchField)
    if (searchQuery) {
      filters.push({
        field: searchField,
        operator: "contains",
        value: searchQuery,
      });
    } else {
      // Importante: Passar undefined força o Refine a limpar o filtro no merge
      filters.push({
        field: searchField,
        operator: "contains",
        value: undefined,
      });
    }

    // Lógica de Filtro por ID
    if (paramId) {
      filters.push({
        field: "id",
        operator: "eq",
        value: paramId,
      });
    } else {
      filters.push({
        field: "id",
        operator: "eq",
        value: undefined,
      });
    }

    // Aplica os filtros. O modo "merge" atualiza os existentes e adiciona novos.
    // Ao passar value: undefined, removemos o filtro ativo.
    console.log("🐛 [useServerTable] URL Params changed. Applying filters:", filters);
    table.refineCore.setFilters(filters, "merge");

  }, [searchQuery, paramId, searchField, table.refineCore.setFilters]);

  return table;
}
