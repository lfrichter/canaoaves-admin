"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { resolveReport, ignoreReport } from "@/app/actions/reports";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface IReport {
  id: string;
  target_id: string;
  type: string;
  reason: string;
  status: string;
}

export default function ReportList() {
  const tableRef = React.useRef<any>(null);

  const { mutate: resolveMutate } = useMutation({
    mutationFn: (reportId: string) => resolveReport(reportId),
    onSuccess: () => {
      toast.success("Denúncia resolvida com sucesso!");
      tableRef.current?.refineCore.refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao resolver denúncia: ${error.message}`);
    },
  });

  const { mutate: ignoreMutate } = useMutation({
    mutationFn: (reportId: string) => ignoreReport(reportId),
    onSuccess: () => {
      toast.success("Denúncia ignorada com sucesso!");
      tableRef.current?.refineCore.refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao ignorar denúncia: ${error.message}`);
    },
  });

  const handleResolve = React.useCallback(async (reportId: string) => {
    resolveMutate(reportId);
  }, [resolveMutate]);

  const handleIgnore = React.useCallback(async (reportId: string) => {
    ignoreMutate(reportId);
  }, [ignoreMutate]);

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

  const table = useTable<IReport>({
    refineCoreProps: {
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
    },
    columns,
  });

  tableRef.current = table;

  return (
    <ListView>
      <ListViewHeader title="Denúncias" />
      <DataTable table={table} />
    </ListView>
  );
}