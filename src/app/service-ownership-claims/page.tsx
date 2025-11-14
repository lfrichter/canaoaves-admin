"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { handleClaimApproval } from "@/app/actions/service-claims";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner"; // Assuming sonner is used for notifications

interface IServiceOwnershipClaim {
  id: string;
  service_name: string;
  claimant_name: string;
  document: string;
  status: string;
}

export default function ServiceOwnershipClaimList() {
  const tableRef = React.useRef<any>(null);

  const { mutate: approveMutate } = useMutation({
    mutationFn: (claimId: string) => handleClaimApproval(claimId, true),
    onSuccess: () => {
      toast.success("Reivindicação aprovada com sucesso!");
      tableRef.current?.refineCore.refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao aprovar reivindicação: ${error.message}`);
    },
  });

  const { mutate: rejectMutate } = useMutation({
    mutationFn: (claimId: string) => handleClaimApproval(claimId, false),
    onSuccess: () => {
      toast.success("Reivindicação rejeitada com sucesso!");
      tableRef.current?.refineCore.refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao rejeitar reivindicação: ${error.message}`);
    },
  });

  const handleApprove = React.useCallback(async (claimId: string) => {
    approveMutate(claimId);
  }, [approveMutate]);

  const handleReject = React.useCallback(async (claimId: string) => {
    rejectMutate(claimId);
  }, [rejectMutate]);

  const columns = React.useMemo<ColumnDef<IServiceOwnershipClaim>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
      },
      {
        id: "service_name",
        accessorKey: "service_name",
        header: "Nome do Serviço",
      },
      {
        id: "claimant_name",
        accessorKey: "claimant_name",
        header: "Nome do Reivindicante",
      },
      {
        id: "document",
        accessorKey: "document",
        header: "Documento",
      },
      {
        id: "actions",
        header: "Ações",
        cell: function render({ row }) {
          const claimId = row.original.id;
          return (
            <div className="flex gap-2">
              <button
                className="px-4 py-2 text-white bg-green-500 rounded"
                onClick={() => handleApprove(claimId)}
              >
                Aprovar
              </button>
              <button
                className="px-4 py-2 text-white bg-red-500 rounded"
                onClick={() => handleReject(claimId)}
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

  const table = useTable<IServiceOwnershipClaim>({
    refineCoreProps: {
      resource: "service_ownership_claims",
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
      <ListViewHeader title="Reivindicações de Propriedade de Serviço" />
      <DataTable table={table} />
    </ListView>
  );
}