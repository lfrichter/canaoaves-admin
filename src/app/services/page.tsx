"use client";

import { DeleteButton, EditButton, ShowButton } from "@/components/refine-ui/buttons";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { useServerTable } from "@/hooks/useServerTable";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

interface IService {
  id: string;
  name: string;
  description: string;
}

export default function ServiceList({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {

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

  const table = useServerTable<IAmenity>({
    resource: "services",
    columns: columns,
    searchParams: searchParams,
  });

  return (
    <ListView>
      <ListViewHeader title="Serviços" canCreate />
      <DataTable table={table} />
    </ListView>
  );
}
