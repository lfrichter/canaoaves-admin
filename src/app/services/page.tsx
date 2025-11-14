"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { EditButton, ShowButton, DeleteButton } from "@/components/refine-ui/buttons";

interface IService {
  id: string;
  name: string;
  description: string;
}

export default function ServiceList() {
  const columns = React.useMemo<ColumnDef<IService>[]>(
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
        id: "description",
        accessorKey: "description",
        header: "Descrição",
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

  const table = useTable<IService>({
    refineCoreProps: {
      resource: "services",
      syncWithLocation: true,
    },
    columns,
  });

  return (
    <ListView>
      <ListViewHeader title="Serviços" canCreate />
      <DataTable table={table} />
    </ListView>
  );
}
