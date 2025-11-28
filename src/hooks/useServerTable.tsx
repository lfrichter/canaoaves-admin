"use client";

import { CrudFilters } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";

/**
 * Hook customizado para encapsular a lógica de Paginação no Lado do Servidor
 * no Next.js App Router com Refine.
 * * Ele lê os parâmetros 'currentPage'/'pageSize' da URL e os passa via 'meta'
 * para o dataProvider, forçando o refetch correto.
 * * @param resource O nome do recurso (ex: "amenities", "categories").
 * @param columns As colunas da tabela.
 * @param searchParams Os parâmetros de busca passados pelo Next.js (URL Query).
 * @returns O objeto de tabela completo do useTable.
 */
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
  // Lemos a paginação e a busca da URL com Fallbacks seguros
  const currentPage = Number(searchParams?.currentPage ?? 1);
  const pageSize = Number(searchParams?.pageSize ?? initialPageSize);
  const searchQuery = searchParams?.q ?? "";
  const initialFilters: CrudFilters = searchQuery
    ? [
      {
        field: searchField,
        operator: "contains",
        value: searchQuery,
      },
    ]
    : [];

  // A lógica de uso do useTable encapsulada
  const table = useTable<TData>({
    refineCoreProps: {
      resource: resource,
      syncWithLocation: false,

      // 1. Configuração para a UI: Sincroniza a interface
      pagination: {
        mode: "server",
        current: currentPage,
        pageSize: pageSize,
      },

      filters: {
        mode: "server",
        initial: initialFilters,
      },

      // 2. Correção de Server Action: Passa os dados pelo meta
      meta: {
        pagination: {
          currentPage: currentPage,
          pageSize: pageSize,
        },
        searchQuery: searchQuery,
      },

      // 3. Força o Refetch: Garante que a busca seja refeita quando a URL muda
      queryOptions: {
        queryKey: [resource, "list", { currentPage, pageSize, searchQuery, filters: initialFilters },],
      },
    },
    columns,
  });

  return table;
}
