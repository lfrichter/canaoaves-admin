"use client";

import { EditButton, ShowButton } from "@/components/refine-ui/buttons";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { useServerTable } from "@/hooks/useServerTable";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

interface IProfileList {
  id: string; // ID da tabela profiles (PK)
  full_name: string;
  app_role: string;
  email: string; // Vindo do auth.users
  total_count: number;
}

export default function ProfileList({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {

  const columns = React.useMemo<ColumnDef<IProfileList>[]>(
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

  const table = useServerTable<IProfileList>({
    resource: "profiles",
    columns: columns,
    searchParams: searchParams,
    initialPageSize: 20,
  });

  return (
    <ListView>
      <ListViewHeader title="Perfis" />
      <DataTable table={table} />
    </ListView>
  );
}
