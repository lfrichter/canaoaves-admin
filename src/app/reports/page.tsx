"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/core";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { resolveReport, ignoreReport } from "@/app/actions/reports";
import { useMutation } from "@refinedev/react-query";
import { toast } from "sonner";

interface IReport {
  id: string;
  target_id: string;
  type: string;
  reason: string;
  status: string;
}

export default function ReportList() {
  const table = useTable<IReport>({
    resource: "reports",
    filters: {
      permanent: [
        {
          field: "status",
          operator: "eq",
          value: "pending",
        },
      ],
    },
    syncWithLocation: true,
  });

  const { mutate } = useMutation();

  const handleResolve = async (reportId: string) => {
    mutate(
      {
        mutationFn: () => resolveReport(reportId),
        onSuccess: () => {
          toast.success("Denúncia resolvida com sucesso!");
          table.refineCore.refetch();
        },
        onError: (error) => {
          toast.error(`Erro ao resolver denúncia: ${error.message}`);
        },
      },
    );
  };

  const handleIgnore = async (reportId: string) => {
    mutate(
      {
        mutationFn: () => ignoreReport(reportId),
        onSuccess: () => {
          toast.success("Denúncia ignorada com sucesso!");
          table.refineCore.refetch();
        },
        onError: (error) => {
          toast.error(`Erro ao ignorar denúncia: ${error.message}`);
        },
      },
    );
  };

  const columns = React.useMemo<ColumnDef<IReport>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
      },
      {
        id: "target_id",
        accessorKey: "target_id",
        header: "ID do Alvo",
      },
      {
        id: "type",
        accessorKey: "type",
        header: "Tipo",
      },
      {
        id: "reason",
        accessorKey: "reason",
        header: "Motivo",
      },
      {
        id: "actions",
        header: "Ações",
        cell: function render({ row }) {
          const reportId = row.original.id;
          return (
            <div className="flex gap-2">
              <button
                className="px-4 py-2 text-white bg-blue-500 rounded"
                onClick={() => handleResolve(reportId)}
              >
                Resolver
              </button>
              <button
                className="px-4 py-2 text-white bg-gray-500 rounded"
                onClick={() => handleIgnore(reportId)}
              >
                Ignorar
              </button>
            </div>
          );
        },
      },
    ],
    [handleResolve, handleIgnore]
  );

  return (
    <ListView>
      <ListViewHeader title="Denúncias" />
      <DataTable table={{ ...table, reactTable: table.reactTable, columns }} />
    </ListView>
  );
}