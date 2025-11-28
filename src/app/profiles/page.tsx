"use client";

import { EditButton, ShowButton } from "@/components/refine-ui/buttons";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { TableSearchInput } from "@/components/refine-ui/data-table/table-search-input";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { useServerTable } from "@/hooks/useServerTable";
import { ProfileWithUser } from "@/types/app";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

export default function ProfileList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const columns = React.useMemo<ColumnDef<ProfileWithUser>[]>(
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
        id: "full_name",
        accessorKey: "full_name",
        header: "Nome completo",
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

  const table = useServerTable<ProfileWithUser>({
    resource: "profiles",
    columns: columns,
    searchParams: searchParams || {},
    initialPageSize: 20,
    searchField: "full_name",
  });

  return (
    <ListView>
      <ListViewHeader title="Perfis">
        <TableSearchInput />
      </ListViewHeader>
      <DataTable table={table} />
    </ListView>
  );
}
