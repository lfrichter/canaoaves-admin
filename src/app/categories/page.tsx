"use client";

import { DeleteButton, EditButton, ShowButton } from "@/components/refine-ui/buttons";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { useServerTable } from "@/hooks/useServerTable";
import { Category } from "@/types/app";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

export default function CategoryList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const columns = React.useMemo<ColumnDef<Category>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
        size: 130,
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

  const table = useServerTable<Category>({
    resource: "categories",
    columns: columns,
    searchParams: searchParams || {},
  });

  return (
    <ListView>
      <ListViewHeader title="Categorias" canCreate />
      <DataTable table={table} />
    </ListView>
  );
}
