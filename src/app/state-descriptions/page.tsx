"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/core";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { useMutation } from "@refinedev/react-query";
import { toast } from "sonner";
import { handleContentApproval, deleteContent } from "@/app/actions/content";

interface IStateDescription {
  id: string;
  state_name: string;
  description: string;
  approved: boolean;
}

export default function StateDescriptionList() {
  const table = useTable<IStateDescription>({
    resource: "state_descriptions",
    filters: {
      permanent: [
        {
          field: "approved",
          operator: "eq",
          value: false,
        },
      ],
    },
    syncWithLocation: true,
  });

  const { mutate } = useMutation();

  const handleApprove = async (id: string) => {
    mutate(
      {
        mutationFn: () => handleContentApproval("state_descriptions", id, true),
        onSuccess: () => {
          toast.success("Descrição de estado aprovada com sucesso!");
          table.refineCore.refetch();
        },
        onError: (error) => {
          toast.error(`Erro ao aprovar descrição de estado: ${error.message}`);
        },
      },
    );
  };

  const handleReject = async (id: string) => {
    mutate(
      {
        mutationFn: () => deleteContent("state_descriptions", id),
        onSuccess: () => {
          toast.success("Descrição de estado rejeitada (excluída) com sucesso!");
          table.refineCore.refetch();
        },
        onError: (error) => {
          toast.error(`Erro ao rejeitar descrição de estado: ${error.message}`);
        },
      },
    );
  };

  const columns = React.useMemo<ColumnDef<IStateDescription>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
      },
      {
        id: "state_name",
        accessorKey: "state_name",
        header: "Nome do Estado",
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
              <button
                className="px-4 py-2 text-white bg-green-500 rounded"
                onClick={() => handleApprove(id)}
              >
                Aprovar
              </button>
              <button
                className="px-4 py-2 text-white bg-red-500 rounded"
                onClick={() => handleReject(id)}
              >
                Rejeitar
              </button>
            </div>
          );
        },
      },
    ],
    [handleApprove, handleReject]
  );

  return (
    <ListView>
      <ListViewHeader title="Descrições de Estados para Aprovação" />
      <DataTable table={{ ...table, reactTable: table.reactTable, columns }} />
    </ListView>
  );
}
