"use client";

import { DeleteButton, EditButton, ShowButton } from "@/components/refine-ui/buttons";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import React from "react";

interface ICategory {
  id: string;
  name: string;
}

export default function CategoryList({ searchParams }: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {

  useSearchParams();
  const currentPage = Number(searchParams?.currentPage) || 1;
  const pageSize = Number(searchParams?.pageSize) || 10; // Ou seu default

  const columns = React.useMemo<ColumnDef<ICategory>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
      },
      {
        id: "name",
        accessorKey: "name",
        header: "Nome",
      },
      {
        id: "actions",
        header: "Ações",
        cell: function render({ row }) {
          const id = row.original.id;
          return (
            <div className="flex gap-2">
              <ShowButton resource="categories" recordItemId={id} />
              <EditButton resource="categories" recordItemId={id} />
              <DeleteButton resource="categories" recordItemId={id} />
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useTable<ICategory>({
    refineCoreProps: {
      resource: "categories",
      syncWithLocation: true,
      pagination: {
        current: currentPage,
        pageSize: pageSize,
      },

      // Garantir que a queryKey também seja reativa
      queryOptions: {
        queryKey: ["categories", "list", { currentPage, pageSize }],
      },
    },
    columns,
  });

  return (
    <ListView>
      <ListViewHeader title="Categorias" canCreate />
      <DataTable table={table} />
    </ListView>
  );
}
