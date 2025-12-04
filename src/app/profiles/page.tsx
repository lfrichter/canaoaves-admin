"use client";

import { DeleteButton, EditButton, RestoreButton, ShowButton } from "@/components/refine-ui/buttons";
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
        // Adicionamos um indicador visual de status
        cell: ({ row }) => {
          const isDeleted = !!row.original.deleted_at;
          return (
            <span className={isDeleted ? "text-red-500 line-through decoration-red-500" : ""}>
              {row.original.full_name}
              {isDeleted && <span className="ml-2 text-xs bg-red-100 text-red-800 px-1 rounded">Inativo</span>}
            </span>
          );
        }
      },
      {
        id: "actions",
        header: "Ações",
        cell: function render({ row }) {
          const id = row.original.id;
          const isDeleted = !!row.original.deleted_at;

          return (
            <div className="flex gap-2">
              <ShowButton recordItemId={id} />
              <EditButton recordItemId={id} />

              {/* Lógica de Troca de Botão */}
              {isDeleted ? (
                // Você precisará criar este componente ou usar um botão genérico com action customizada
                <RestoreButton recordItemId={id} />
                // <DeleteButton recordItemId={id} />
              ) : (
                <DeleteButton recordItemId={id} />
              )}
            </div>
          );
        },
      },
    ],
    []
  );
// export default function ProfileList({
//   searchParams,
// }: {
//   searchParams?: { [key: string]: string | undefined };
// }) {
//   const columns = React.useMemo<ColumnDef<ProfileWithUser>[]>(
//     () => [
//       {
//         id: "id",
//         accessorKey: "id",
//         header: "ID",
//       },
//       {
//         id: "email",
//         accessorKey: "email",
//         header: "Email",
//       },
//       {
//         id: "full_name",
//         accessorKey: "full_name",
//         header: "Nome completo",
//       },
//       {
//         id: "actions",
//         header: "Ações",
//         cell: function render({ row }) {
//           const id = row.original.id;
//           return (
//             <div className="flex gap-2">
//               <ShowButton recordItemId={id} />
//               <EditButton recordItemId={id} />
//               <DeleteButton recordItemId={id} />
//             </div>
//           );
//         },
//       },
//     ],
//     []
//   );

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
