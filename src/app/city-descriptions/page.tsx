"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/core";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { useMutation } from "@refinedev/react-query";
import { toast } from "sonner";
import { handleContentApproval, deleteContent } from "@/app/actions/content";

interface ICityDescription {
  id: string;
  city_name: string;
  description: string;
  approved: boolean;
}

export default function CityDescriptionList() {
  const table = useTable<ICityDescription>({
    resource: "city_descriptions",
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
        mutationFn: () => handleContentApproval("city_descriptions", id, true),
        onSuccess: () => {
          toast.success("Descrição de cidade aprovada com sucesso!");
          table.refineCore.refetch();
        },
        onError: (error) => {
          toast.error(`Erro ao aprovar descrição de cidade: ${error.message}`);
        },
      },
    );
  };

  const handleReject = async (id: string) => {
    mutate(
      {
        mutationFn: () => deleteContent("city_descriptions", id),
        onSuccess: () => {
          toast.success("Descrição de cidade rejeitada (excluída) com sucesso!");
          table.refineCore.refetch();
        },
        onError: (error) => {
          toast.error(`Erro ao rejeitar descrição de cidade: ${error.message}`);
        },
      },
    );
  };

  const columns = React.useMemo<ColumnDef<ICityDescription>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
      },
      {
        id: "city_name",
        accessorKey: "city_name",
        header: "Nome da Cidade",
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
      <ListViewHeader title="Descrições de Cidades para Aprovação" />
      <DataTable table={{ ...table, reactTable: table.reactTable, columns }} />
    </ListView>
  );
}
