"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/core";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { EditButton, ShowButton, DeleteButton } from "@/components/refine-ui/buttons";

interface IServiceOffering {
  id: string;
  name: string;
}

export default function ServiceOfferingList() {
  const table = useTable<IServiceOffering>({
    resource: "service_offerings",
    syncWithLocation: true,
  });

  const columns = React.useMemo<ColumnDef<IServiceOffering>[]>(
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

  return (
    <ListView>
      <ListViewHeader title="Ofertas de Serviço" canCreate />
      <DataTable table={{ ...table, reactTable: table.reactTable, columns }} />
    </ListView>
  );
}
