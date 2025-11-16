"use client";

import { handleClaimApproval } from "@/app/actions/service-claims";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import {
  ListView,
  ListViewHeader,
} from "@/components/refine-ui/views/list-view";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTable } from "@refinedev/react-table";
import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

interface IServiceOwnershipClaim {
  id: string;
  claimant_name: string;
  document_url: string;
  status: string;
  services: {
    name: string;
  };
  claimant_email: string;
  claimant_phone: string;
  claimant_role: string;
  message: string;
  created_at: string;
}

export default function ServiceOwnershipClaimList() {
  // --- A ORDEM DAS DECLARAÇÕES FOI CORRIGIDA ---

  // 1. Mutações e Handlers devem ser definidos PRIMEIRO
  // (O 'refetch' será definido depois, mas precisamos das funções)

  const { mutate: approveMutate } = useMutation({
    mutationFn: (claimId: string) => handleClaimApproval(claimId, true),
    onSuccess: () => {
      toast.success("Reivindicação aprovada com sucesso!");
      // O 'refetch' será chamado pelo 'handleApprove'
    },
    onError: (error: any) => {
      toast.error(`Erro ao aprovar reivindicação: ${error.message}`);
    },
  });

  const { mutate: rejectMutate } = useMutation({
    mutationFn: (claimId: string) => handleClaimApproval(claimId, false),
    onSuccess: () => {
      toast.success("Reivindicação rejeitada com sucesso!");
      // O 'refetch' será chamado pelo 'handleReject'
    },
    onError: (error: any) => {
      toast.error(`Erro ao rejeitar reivindicação: ${error.message}`);
    },
  });

  // Os handlers agora podem ser declarados
  const handleApprove = React.useCallback(
    async (claimId: string) => {
      approveMutate(claimId, {
        onSuccess: () => {
          // Chamamos o refetch aqui, depois que 'table' for inicializado
          table.refineCore.refetch();
        },
      });
    },
    [approveMutate] // 'table' não precisa ser dependência aqui
  );

  const handleReject = React.useCallback(
    async (claimId: string) => {
      rejectMutate(claimId, {
        onSuccess: () => {
          // Chamamos o refetch aqui
          table.refineCore.refetch();
        },
      });
    },
    [rejectMutate] // 'table' não precisa ser dependência aqui
  );

  // 2. Agora que os handlers existem, podemos definir as 'columns'
  const columns = React.useMemo<ColumnDef<IServiceOwnershipClaim>[]>(
    () => [
      {
        id: "service_name",
        header: "Serviço",
        cell: function render({ row }) {
          if (!row.original.services) {
            return <span className="text-gray-500">Serviço não encontrado</span>;
          }
          return <span>{row.original.services.name}</span>;
        },
      },
      {
        id: "claimant_name",
        accessorKey: "claimant_name",
        header: "Reivindicante",
      },
      {
        id: "document",
        accessorKey: "document_url",
        header: "Documento",
        cell: function render({ row }) {
          const url = row.original.document_url;
          if (!url) {
            return <span>N/A</span>;
          }
          return (
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Ver Documento
            </Link>
          );
        },
      },
      {
        id: "actions",
        header: "Ações",
        cell: function render({ row }) {
          const claim = row.original;
          return (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleApprove(claim.id)}
              >
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(claim.id)}
              >
                Rejeitar
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Ver Detalhes
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Detalhes da Reivindicação</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <strong className="col-span-1">ID:</strong>
                      <span className="col-span-2 font-mono text-xs">
                        {claim.id}
                      </span>
                      <strong className="col-span-1">Serviço:</strong>
                      <span className="col-span-2">{claim.services?.name}</span>
                      <strong className="col-span-1">Reivindicante:</strong>
                      <span className="col-span-2">{claim.claimant_name}</span>
                      <strong className="col-span-1">Email:</strong>
                      <span className="col-span-2">{claim.claimant_email}</span>
                      <strong className="col-span-1">Telefone:</strong>
                      <span className="col-span-2">{claim.claimant_phone}</span>
                      <strong className="col-span-1">Cargo:</strong>
                      <span className="col-span-2">{claim.claimant_role}</span>
                      <strong className="col-span-1">Enviado em:</strong>
                      <span className="col-span-2">
                        {new Date(claim.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <strong className="mt-4 block">Mensagem:</strong>
                    <p className="mt-1 rounded border p-2">
                      {claim.message || "Nenhuma mensagem."}
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          );
        },
      },
    ],
    [handleApprove, handleReject]
  );

  // 3. Finalmente, agora que 'columns' existe, podemos chamar 'useTable'
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
      meta: {
        select: "*, services(name)",
      },
    },
    columns, // Agora 'columns' está inicializado e disponível
  });

  return (
    <ListView>
      <ListViewHeader title="Reivindicações de Propriedade de Serviço" />
      <DataTable table={table} />
    </ListView>
  );
}
