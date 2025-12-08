"use client";

import { ignoreReport, resolveReport } from "@/app/actions/reports";
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
import { ReportReason, ReportStatus, ReportTargetType } from "@/types/app";
import { useTable } from "@refinedev/react-table";
import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  Check,
  Coffee,
  Edit,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  MessageSquare,
  User,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";

// --- Interface Atualizada ---
interface IReport {
  id: string;
  target_id: string;
  target_type: ReportTargetType;
  reason: ReportReason;
  status: string;
  description: string;
  created_at: string;

  // Denunciante
  reporter_full_name: string | null;
  reporter_public_name: string | null;
  reporter_score: number | null;
  reporter_category_name: string | null;
  reporter_phone: string | null;
  reporter_avatar_url: string | null;
  reporter_email: string | null;

  // Alvo (Geral)
  target_slug: string | null;
  target_name: string | null;
  target_avatar_url: string | null;

  // Dados Específicos de Comentário (Vindos da nova RPC)
  comment_author_id: string | null;     // ID do observador de quem comentou
  comment_context_slug: string | null;  // Slug da página (serviço ou pessoa)
  comment_context_type: string | null;  // 'service' ou 'profile'
}

// --- Helpers ---

function getReasonLabel(reason: ReportReason): string {
  const labels: Record<string, string> = {
    incorrect_information: "Informação Incorreta",
    inappropriate_content: "Conteúdo Inapropriado",
    spam: "Spam",
    fraud: "Fraude / Golpe",
    other: "Outro",
  };
  return labels[reason] || reason;
}

function getTypeLabel(target_type: ReportTargetType) {
  switch (target_type) {
    case "service": return { label: "Serviço", icon: <Coffee className="w-3 h-3 mr-1" /> };
    case "profile": return { label: "Observador", icon: <User className="w-3 h-3 mr-1" /> };
    case "comment": return { label: "Comentário", icon: <MessageSquare className="w-3 h-3 mr-1" /> };
    case "photo": return { label: "Foto", icon: <ImageIcon className="w-3 h-3 mr-1" /> };
    default: return { label: target_type, icon: null };
  }
}

// Links para o Site Público
function getPublicTargetLink(report: IReport): string | null {
  const baseUrl = "https://www.canaoaves.com.br";

  // Lógica para Serviço Direto
  if (report.target_type === "service" && report.target_slug) {
    return `${baseUrl}/service/${report.target_slug}`;
  }

  // Lógica para Observador Direto (Correção: /person/)
  if (report.target_type === "profile" && report.target_slug) {
    return `${baseUrl}/person/${report.target_slug}`;
  }

  // Lógica para Comentário (Usa o Contexto)
  if (report.target_type === "comment" && report.comment_context_slug) {
    if (report.comment_context_type === "service") {
      return `${baseUrl}/service/${report.comment_context_slug}`;
    }
    if (report.comment_context_type === "profile") {
      return `${baseUrl}/person/${report.comment_context_slug}`;
    }
  }

  return null;
}

// Links para Edição no Admin
function getAdminEditLink(report: IReport): string | null {
  // Editar Serviço
  if (report.target_type === "service") {
    return `/services/${report.target_id}/edit`;
  }

  // Editar Observador
  if (report.target_type === "profile") {
    return `/profiles/${report.target_id}/edit`;
  }

  // Editar Autor do Comentário
  if (report.target_type === "comment" && report.comment_author_id) {
    return `/profiles/${report.comment_author_id}/edit`;
  }

  return null;
}

// --- Componente de Ações ---
const ReportActions = ({ row, onRefresh }: { row: IReport; onRefresh: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Mutações
  const { mutate: resolveMutate, isPending: isResolving } = useMutation({
    mutationFn: () => resolveReport(row.id),
    onSuccess: () => {
      toast.success("Denúncia resolvida!");
      setIsOpen(false);
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { mutate: ignoreMutate, isPending: isIgnoring } = useMutation({
    mutationFn: () => ignoreReport(row.id),
    onSuccess: () => {
      toast.success("Denúncia ignorada.");
      setIsOpen(false);
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Dados para Renderização
  const reporterName = row.reporter_public_name || row.reporter_full_name || "Anônimo";
  const targetName = row.target_name || "Alvo desconhecido";
  const publicLink = getPublicTargetLink(row);
  const adminLink = getAdminEditLink(row);
  const typeInfo = getTypeLabel(row.target_type);

  // Define o texto do botão de edição com base no tipo
  const editButtonLabel = row.target_type === 'comment'
    ? "Editar Observador do Autor"
    : "Editar Cadastro";

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 text-green-600 hover:bg-green-50"
        onClick={() => resolveMutate()}
        title="Resolver (Aceitar Denúncia)"
        disabled={isResolving}
      >
        <Check className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 text-gray-500 hover:bg-gray-50"
        onClick={() => ignoreMutate()}
        title="Ignorar (Rejeitar Denúncia)"
        disabled={isIgnoring}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Modal Detalhado */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="default" className="h-8">
            <Eye className="w-3 h-3 mr-2" /> Detalhes
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Detalhes da Denúncia
              <Badge variant="outline" className="ml-2 flex items-center">
                {typeInfo.icon} {typeInfo.label}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">

            {/* LADO ESQUERDO: QUEM DENUNCIOU (REPORTER) */}
            <div className="space-y-4 border-r pr-0 md:pr-6 border-dashed md:border-solid border-gray-200">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Denunciante</h4>

              <div className="flex items-center gap-3">
                {row.reporter_avatar_url ? (
                  <Image src={row.reporter_avatar_url} alt="Avatar" width={48} height={48} className="rounded-full object-cover border" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center"><User className="w-6 h-6 text-gray-400" /></div>
                )}
                <div>
                  <p className="font-bold text-base">{reporterName}</p>
                  <p className="text-xs text-muted-foreground">{row.reporter_category_name || "Sem categoria"}</p>
                </div>
              </div>

              <div className="text-sm space-y-1 bg-muted/30 p-3 rounded-md">
                <p><span className="font-medium">Email:</span> {row.reporter_email || "N/A"}</p>
                <p><span className="font-medium">Tel:</span> {row.reporter_phone || "N/A"}</p>
                <p><span className="font-medium">Ranking:</span> {row.reporter_score || 0} pts</p>
                <p><span className="font-medium">Data:</span> {new Date(row.created_at).toLocaleString("pt-BR")}</p>
              </div>
            </div>

            {/* LADO DIREITO: ALVO (TARGET / AUTOR DO COMENTÁRIO) */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                {row.target_type === 'comment' ? "Autor do Comentário" : "Item Denunciado"}
              </h4>

              <div className="flex items-center gap-3">
                {row.target_avatar_url ? (
                  <Image src={row.target_avatar_url} alt="Target" width={48} height={48} className="rounded-md object-cover border" />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-amber-100 flex items-center justify-center text-amber-600">
                    {typeInfo.icon || <AlertCircle />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base line-clamp-1" title={targetName}>{targetName}</p>
                  <p className="text-xs text-muted-foreground">ID: {row.target_id.slice(0, 8)}...</p>

                  {row.target_type === 'comment' && row.comment_context_type && (
                    <p className="text-xs text-blue-600 mt-1">
                      Em: {row.comment_context_type === 'service' ? 'Página de Serviço' : 'Página de Observador'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                {publicLink && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link href={publicLink} target="_blank">
                      <ExternalLink className="w-4 h-4 mr-2 text-blue-500" />
                      Ver Página Pública
                    </Link>
                  </Button>
                )}
                {/* Link para Gestão de Comentários (Apenas se for comentário) */}
                {row.target_type === 'comment' && (
                  <Button variant="outline" size="sm" className="w-full justify-start bg-amber-50 hover:bg-amber-100 border-amber-200" asChild>
                    <Link href={`/comments?id=${row.target_id}`}>
                      <MessageSquare className="w-4 h-4 mr-2 text-amber-600" />
                      Gerenciar Comentário (Editar/Excluir)
                    </Link>
                  </Button>
                )}
                {adminLink && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link href={adminLink}>
                      <Edit className="w-4 h-4 mr-2 text-amber-600" />
                      {editButtonLabel}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* DESCRIÇÃO E MOTIVO */}
          <div className="border-t pt-4 space-y-3">
            <div>
              <span className="text-sm font-semibold block mb-1">Motivo:</span>
              <Badge variant="destructive">{getReasonLabel(row.reason)}</Badge>
            </div>

            <div>
              <span className="text-sm font-semibold block mb-1">Descrição do Problema:</span>
              <div className="bg-red-50 text-red-900 p-3 rounded-md border border-red-100 text-sm whitespace-pre-wrap min-h-[80px]">
                {row.description || "Nenhuma descrição fornecida."}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t pt-4 mt-2">
            <Button variant="secondary" onClick={() => ignoreMutate()} disabled={isIgnoring}>
              {isIgnoring ? "Processando..." : "Ignorar / Descartar"}
            </Button>
            <Button variant="destructive" onClick={() => resolveMutate()} disabled={isResolving} className="ml-2">
              {isResolving ? "Resolvendo..." : "Resolver (Aplicar Punição)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Página Principal ---
export default function ReportList() {
  const columns = React.useMemo<ColumnDef<IReport>[]>(
    () => [
      {
        id: "target",
        header: "Alvo / Contexto",
        cell: function render({ row }) {
          const typeInfo = getTypeLabel(row.original.target_type);
          const name = row.original.target_name || "Desconhecido";
          const publicLink = getPublicTargetLink(row.original);

          return (
            <div className="flex flex-col">
              <div className="flex items-center gap-1 font-medium text-sm">
                {typeInfo.icon}
                {publicLink ? (
                  <Link href={publicLink} target="_blank" className="hover:underline truncate max-w-[180px]" title="Abrir página pública">
                    {name}
                  </Link>
                ) : (
                  <span className="truncate max-w-[180px]" title={name}>{name}</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground ml-4">
                {row.original.target_id.substring(0, 8)}...
              </span>
            </div>
          );
        },
      },
      {
        id: "reporter",
        header: "Denunciante",
        cell: ({ row }) => {
          const name = row.original.reporter_public_name || "Anônimo";
          return (
            <div className="flex flex-col">
              <span className="text-sm">{name}</span>
              <span className="text-xs text-muted-foreground">{row.original.reporter_category_name}</span>
            </div>
          )
        }
      },
      {
        id: "reason",
        accessorKey: "reason",
        header: "Motivo",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-normal">
            {getReasonLabel(row.original.reason)}
          </Badge>
        ),
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
          return <ReportActions row={row.original} onRefresh={refreshTable} />;
        },
      },
    ],
    []
  );

  const table = useTable<IReport>({
    refineCoreProps: {
      resource: "reports",
      filters: {
        permanent: [
          { field: "status", operator: "eq", value: "pending" as ReportStatus },
        ],
      },
      syncWithLocation: true,
      pagination: { pageSize: 20 },
    },
    columns,
  });

  return (
    <ListView>
      <ListViewHeader title="Central de Denúncias" />
      <DataTable table={table} />
    </ListView>
  );
}
