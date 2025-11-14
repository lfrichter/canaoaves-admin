"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { EditButton, ShowButton, DeleteButton } from "@/components/refine-ui/buttons";

interface ICategory {
  id: string;
  name: string;
}

export default function CategoryList() {
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
              <ShowButton recordItemId={id} />
              <EditButton recordItemId={id} />
              <DeleteButton recordItemId={id} />
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
