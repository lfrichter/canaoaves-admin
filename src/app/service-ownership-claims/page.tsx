"use client";

import { handleClaimApproval } from "@/app/actions/service-claims";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import {
  ListView,
  ListViewHeader,
} from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTable } from "@refinedev/react-table";
import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  Briefcase,
  Check,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  User,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";

interface IServiceClaim {
  id: string;
  created_at: string;
  status: string;
  message: string | null;
  document_url: string;

  // Dados do Formulário
  form_name: string;
  form_email: string;
  form_phone: string;
  form_role: string;

  // Dados do Serviço
  service_id: string;
  service_name: string;
  service_slug: string;
  service_already_authenticated: boolean;

  // Dados do Observador
  profile_public_name: string | null;
  profile_full_name: string | null;
  profile_avatar_url: string | null;
  profile_score: number | null;
  profile_category_name: string | null;
}

// --- Componente de Ações Isolado ---
const ClaimActions = ({ row, onRefresh }: { row: IServiceClaim; onRefresh: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Mutation: Aprovar
  const { mutate: approveMutate, isPending: isApproving } = useMutation({
    mutationFn: () => handleClaimApproval(row.id, true),
    onSuccess: () => {
      toast.success("Reivindicação aprovada! O usuário agora é dono do serviço.");
      setIsOpen(false);
      onRefresh();
    },
    onError: (err: any) => toast.error("Erro ao aprovar: " + err.message),
  });

  // Mutation: Rejeitar
  const { mutate: rejectMutate, isPending: isRejecting } = useMutation({
    mutationFn: () => handleClaimApproval(row.id, false),
    onSuccess: () => {
      toast.success("Reivindicação rejeitada.");
      setIsOpen(false);
      onRefresh();
    },
    onError: (err: any) => toast.error("Erro ao rejeitar: " + err.message),
  });

  const displayName = row.profile_public_name || row.profile_full_name || "Usuário Desconhecido";
  const serviceLink = `https://www.canaoaves.com.br/service/${row.service_slug}`;
  const adminServiceLink = `/services/${row.service_id}/edit`;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 text-green-600 hover:bg-green-50"
        onClick={() => approveMutate()}
        disabled={isApproving}
        title="Aprovar Rápido"
      >
        <Check className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 text-red-600 hover:bg-red-50"
        onClick={() => rejectMutate()}
        disabled={isRejecting}
        title="Rejeitar Rápido"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Modal Expandido */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="default" className="h-8">
            <Eye className="w-3 h-3 mr-2" /> Detalhes
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Análise de Reivindicação</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">

            {/* COLUNA 1: QUEM ESTÁ PEDINDO */}
            <div className="space-y-4 border-r pr-0 md:pr-6 border-dashed md:border-solid border-gray-200">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" /> Solicitante
              </h4>

              {/* Card do Observador na Plataforma */}
              <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border">
                {row.profile_avatar_url ? (
                  <Image src={row.profile_avatar_url} alt="Avatar" width={48} height={48} className="rounded-full object-cover border" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center"><User className="w-6 h-6 text-gray-400" /></div>
                )}
                <div>
                  <p className="font-bold text-sm">{displayName}</p>
                  <div className="flex gap-2 text-[10px] text-muted-foreground mt-1">
                    <span className="
                      bg-card px-1 border rounded
                      dark:bg-muted/50 dark:border-muted
                    ">
                      Score: {row.profile_score || 0}
                    </span>
                    <span className="
                      bg-card px-1 border rounded
                      dark:bg-muted/50 dark:border-muted
                    ">
                      {row.profile_category_name || "Membro"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dados do Formulário */}
              <div className="text-sm space-y-2">
                <p className="font-medium text-xs text-muted-foreground uppercase mt-4 mb-2">Dados Enviados no Formulário</p>
                <div className="grid grid-cols-[100px_1fr] gap-1">
                  <span className="font-medium text-muted-foreground">Nome:</span>
                  <span>{row.form_name}</span>

                  <span className="font-medium text-muted-foreground">Email:</span>
                  <span>{row.form_email}</span>

                  <span className="font-medium text-muted-foreground">Telefone:</span>
                  <span>{row.form_phone}</span>

                  <span className="font-medium text-muted-foreground">Cargo/Papel:</span>
                  <Badge variant="secondary" className="w-fit">{row.form_role}</Badge>
                </div>
              </div>

            </div>

            {/* COLUNA 2: O QUE ESTÁ SENDO PEDIDO */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Serviço Alvo
              </h4>

              <div className="
                  bg-blue-50 dark:bg-blue-950/30
                  p-4 rounded-lg
                  border border-blue-200 dark:border-blue-800/40
                ">
                <p className="font-bold text-lg text-blue-900 dark:text-blue-300">
                  {row.service_name}
                </p>

                {row.service_already_authenticated && (
                  <Badge variant="destructive" className="mt-2">
                    Atenção: Serviço já autenticado!
                  </Badge>
                )}

                <div className="flex flex-col gap-2 mt-4">
                  <Link
                    href={serviceLink}
                    target="_blank"
                    className="text-xs flex items-center text-blue-600 dark:text-blue-400 hover:underline hover:dark:text-blue-300"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" /> Ver página pública
                  </Link>

                  <Link
                    href={adminServiceLink}
                    target="_blank"
                    className="text-xs flex items-center text-amber-600 dark:text-amber-400 hover:underline hover:dark:text-amber-300"
                  >
                    <Edit className="w-3 h-3 mr-1" /> Editar cadastro atual
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-sm">Documento Comprobatório:</p>
                {row.document_url ? (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={row.document_url} target="_blank">
                      <FileText className="w-4 h-4 mr-2" />
                      Abrir Documento Anexado
                    </Link>
                  </Button>
                ) : (
                  <div className="text-red-500 text-sm flex items-center">
                    <X className="w-4 h-4 mr-1" /> Nenhum documento enviado
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cold-1 gap-6 pt-4 border-t">
            <div className="space-y-2">
              <p className="font-medium text-sm">Mensagem do Solicitante:</p>
              <div className="bg-muted p-3 rounded-md text-sm italic min-h-[60px]">
                "{row.message || "Sem mensagem adicional."}"
              </div>
            </div>


          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button variant="destructive" onClick={() => rejectMutate()} disabled={isRejecting || isApproving}>
              {isRejecting ? "Rejeitando..." : "Rejeitar Pedido"}
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 ml-2" onClick={() => approveMutate()} disabled={isRejecting || isApproving}>
              {isApproving ? "Aprovando..." : "Aprovar e Transferir Propriedade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function ServiceOwnershipClaimList() {
  const columns = React.useMemo<ColumnDef<IServiceClaim>[]>(
    () => [
      {
        id: "service",
        header: "Serviço Reivindicado",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.service_name}</span>
            <span className="text-xs text-muted-foreground">ID: {row.original.service_id.substring(0, 8)}...</span>
          </div>
        ),
      },
      {
        id: "claimant",
        header: "Solicitante (Formulário)",
        accessorKey: "form_name",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm">{row.original.form_name}</span>
            <span className="text-xs text-muted-foreground">{row.original.form_role}</span>
          </div>
        )
      },
      {
        id: "profile",
        header: "Observador Vinculado",
        cell: ({ row }) => {
          const name = row.original.profile_public_name || row.original.profile_full_name;
          return (
            <div className="flex items-center gap-2">
              {row.original.profile_avatar_url ? (
                <Image src={row.original.profile_avatar_url} width={24} height={24} alt="Avatar" className="rounded-full" />
              ) : <User className="w-4 h-4 text-gray-400" />}
              <span className="text-sm text-muted-foreground">{name}</span>
            </div>
          )
        }
      },
      {
        id: "document",
        header: "Doc",
        cell: ({ row }) => row.original.document_url ? (
          <Link href={row.original.document_url} target="_blank" title="Ver Documento">
            <FileText className="w-4 h-4 text-blue-500 hover:text-blue-700" />
          </Link>
        ) : <span className="text-muted-foreground">-</span>
      },
      {
        id: "date",
        header: "Data",
        accessorKey: "created_at",
        cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{new Date(getValue() as string).toLocaleDateString("pt-BR")}</span>
      },
      {
        id: "actions",
        header: "Ações",
        cell: function render({ row, table }) {
          const refreshTable = () => {
            (table as any).options.meta?.refineCore?.tableQuery?.refetch();
          };
          return <ClaimActions row={row.original} onRefresh={refreshTable} />;
        },
      },
    ],
    []
  );

  const table = useTable<IServiceClaim>({
    refineCoreProps: {
      resource: "service_ownership_claims", // Backend lê da View
      filters: {
        permanent: [
          { field: "status", operator: "eq", value: "pending" },
        ],
      },
      syncWithLocation: true,
      pagination: { pageSize: 20 },
    },
    columns,
  });

  return (
    <ListView>
      <ListViewHeader title="Reivindicações de Propriedade" />
      <DataTable table={table} />
    </ListView>
  );
}
