"use client";

import { DeleteButton, EditButton, ShowButton } from "@/components/refine-ui/buttons";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { TableSearchInput } from "@/components/refine-ui/data-table/table-search-input";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { useServerTable } from "@/hooks/useServerTable";
import { Service } from "@/types/app";
import { useInvalidate } from "@refinedev/core";
import { ColumnDef } from "@tanstack/react-table";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export default function ServiceList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const invalidate = useInvalidate();
  const columns = React.useMemo<ColumnDef<Service>[]>(
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
              <DeleteButton
                recordItemId={id}
                onSuccess={() => {
                  invalidate({
                    resource: "services",
                    invalidates: ["list"]
                  });

                  // Remove query params (?q=xxx) voltando para a rota limpa
                  // router.replace(pathname);

                  // Força o Next.js a buscar os dados atualizados no servidor
                  // router.refresh();
                }}
              />
            </div>
          );
        },
      },
    ],
    [invalidate, router, pathname]
  );

  const table = useServerTable<Service>({
    resource: "services",
    columns: columns,
    searchParams: searchParams || {},
  });

  return (
    <ListView>
      <div className="flex justify-between items-center mb-4">
        <ListViewHeader title="Serviços" canCreate>
          <TableSearchInput />
        </ListViewHeader>
      </div>
      <DataTable table={table} />
    </ListView>
  );
}
