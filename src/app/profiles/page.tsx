"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { EditButton, ShowButton } from "@/components/refine-ui/buttons";

interface IProfile {
  id: string;
  email: string;
  app_role: string;
}

export default function ProfileList() {
  const columns = React.useMemo<ColumnDef<IProfile>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
      },
      {
        id: "app_role",
        accessorKey: "app_role",
        header: "Role",
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
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useTable<IProfile>({
    refineCoreProps: {
      resource: "profiles",
      syncWithLocation: true,
    },
    columns,
  });

  return (
    <ListView>
      <ListViewHeader title="Perfis" />
      <DataTable table={table} />
    </ListView>
  );
}
