"use client";

import { DeleteButton, EditButton, ShowButton } from "@/components/refine-ui/buttons";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { useServerTable } from "@/hooks/useServerTable";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

interface IServiceOffering {
  id: string;
  name: string;
}

export default function ServiceOfferingList({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {

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

  const table = useServerTable<IAmenity>({
    resource: "service_offerings",
    columns: columns,
    searchParams: searchParams,
  });

  return (
    <ListView>
      <ListViewHeader title="Ofertas de Serviço" canCreate />
      <DataTable table={table} />
    </ListView>
  );
}
