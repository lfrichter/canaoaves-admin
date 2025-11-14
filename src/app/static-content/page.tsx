"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { EditButton } from "@/components/refine-ui/buttons";

interface IStaticContent {
  id: string;
  content_html: string;
}

export default function StaticContentList() {
  const columns = React.useMemo<ColumnDef<IStaticContent>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
      },
      {
        id: "actions",
        header: "Ações",
        cell: function render({ row }) {
          const id = row.original.id;
          return (
            <div className="flex gap-2">
              <EditButton recordItemId={id} />
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useTable<IStaticContent>({
    refineCoreProps: {
      resource: "static_content",
      syncWithLocation: true,
    },
    columns,
  });

  return (
    <ListView>
      <ListViewHeader title="Conteúdo Estático" />
      <DataTable table={table} />
    </ListView>
  );
}
