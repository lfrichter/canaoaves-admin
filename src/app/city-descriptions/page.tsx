"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleContentApproval, deleteContent } from "@/app/actions/content";

interface ICityDescription {
  id: string;
  city_name: string;
  description: string;
  approved: boolean;
}

export default function CityDescriptionList() {
  const tableRef = React.useRef<any>(null);

  const { mutate: approveMutate } = useMutation({
    mutationFn: (id: string) => handleContentApproval("city_descriptions", id, true),
    onSuccess: () => {
      toast.success("Descrição de cidade aprovada com sucesso!");
      tableRef.current?.refineCore.refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao aprovar descrição de cidade: ${error.message}`);
    },
  });

  const { mutate: rejectMutate } = useMutation({
    mutationFn: (id: string) => deleteContent("city_descriptions", id),
    onSuccess: () => {
      toast.success("Descrição de cidade rejeitada (excluída) com sucesso!");
      tableRef.current?.refineCore.refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao rejeitar descrição de cidade: ${error.message}`);
    },
  });

  const handleApprove = React.useCallback(async (id: string) => {
    approveMutate(id);
  }, [approveMutate]);

  const handleReject = React.useCallback(async (id: string) => {
    rejectMutate(id);
  }, [rejectMutate]);

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

  const table = useTable<ICityDescription>({
    refineCoreProps: {
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
    },
    columns,
  });

  tableRef.current = table;

  return (
    <ListView>
      <ListViewHeader title="Descrições de Cidades para Aprovação" />
      <DataTable table={table} />
    </ListView>
  );
}
