"use client";

import { DeleteButton, EditButton, ShowButton } from "@/components/refine-ui/buttons";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { useServerTable } from "@/hooks/useServerTable";
import { Amenity } from "@/types/app";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

export default function AmenityList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const columns = React.useMemo<ColumnDef<Amenity>[]>(
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

  const table = useServerTable<Amenity>({
    resource: "amenities",
    columns: columns,
    searchParams: searchParams || {},
  });

  return (
    <ListView>
      <ListViewHeader title="Comodidades" canCreate />
      <DataTable table={table} />
    </ListView>
  );
}
