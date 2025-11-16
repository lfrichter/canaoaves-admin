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
import Image from "next/image";
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
    slug: string;
  };
  claimant_email: string;
  claimant_phone: string;
  claimant_role: string;
  message: string;
  created_at: string;
  profiles: {
    avatar_url: string | null;
  } | null;
}

export default function ServiceOwnershipClaimList() {
  const tableRef = React.useRef<any>(null);

  const { mutate: approveMutate } = useMutation({
    mutationFn: (claimId: string) => handleClaimApproval(claimId, true),
    onSuccess: () => {
      toast.success("Reivindicação aprovada com sucesso!");
      // --- MUDANÇA AQUI ---
      tableRef.current?.refineCore.tableQuery.refetch(); // Corrigido
    },
    onError: (error: any) => {
      toast.error(`Erro ao aprovar reivindicação: ${error.message}`);
    },
  });

  const { mutate: rejectMutate } = useMutation({
    mutationFn: (claimId: string) => handleClaimApproval(claimId, false),
    onSuccess: () => {
      toast.success("Reivindicação rejeitada com sucesso!");
      // --- MUDANÇA AQUI ---
      tableRef.current?.refineCore.tableQuery.refetch(); // Corrigido
    },
    onError: (error: any) => {
      toast.error(`Erro ao rejeitar reivindicação: ${error.message}`);
    },
  });

  const handleApprove = React.useCallback(
    async (claimId: string) => {
      approveMutate(claimId);
    },
    [approveMutate]
  );

  const handleReject = React.useCallback(
    async (claimId: string) => {
      rejectMutate(claimId);
    },
    [rejectMutate]
  );

  const columns = React.useMemo<ColumnDef<IServiceOwnershipClaim>[]>(
    () => [
      {
        id: "service_name",
        header: "Nome do Serviço",
        cell: function render({ row }) {
          const service = row.original.services;
          if (!service) {
            return <span className="text-gray-500">Serviço não encontrado</span>;
          }
          const href = `https://www.canaoaves.com.br/service/${service.slug}`;
          return (
            <Button asChild variant="link" className="p-0 text-left h-auto">
              <Link href={href} target="_blank" rel="noopener noreferrer">
                {service.name}
              </Link>
            </Button>
          );
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
          if (!url) return <span>N/A</span>;
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
          const avatarUrl = claim.profiles?.avatar_url;

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
                    <div className="flex items-center gap-3 mb-4">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={claim.claimant_name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                      )}
                      <div>
                        <strong className="block">{claim.claimant_name}</strong>
                        <span className="text-xs text-muted-foreground">
                          {claim.claimant_role}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <strong className="col-span-1">Email:</strong>
                      <span className="col-span-2">{claim.claimant_email}</span>
                      <strong className="col-span-1">Telefone:</strong>
                      <span className="col-span-2">{claim.claimant_phone}</span>
                      <strong className="col-span-1">Serviço:</strong>
                      <span className="col-span-2">{claim.services?.name}</span>
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
        select:
          "*, services(name, slug), profiles:profiles!service_ownership_claims_claimant_user_id_fkey(avatar_url)",
      },
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
