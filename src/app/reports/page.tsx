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

// --- MUDANÇA 1: Interface atualizada ---
interface IReport {
  id: string;
  target_id: string;
  target_type: "profile" | "service" | "comment" | "photo";
  reason:
  | "incorrect_information"
  | "inappropriate_content"
  | "spam"
  | "fraud"
  | "other";
  status: string;
  description: string;
  created_at: string;
  // Perfil do *denunciante*
  reporter: {
    full_name: string;
    public_name: string;
    score: number;
    categories: {
      name: string;
    };
  } | null;
  // Objeto aninhado para o *alvo* (se for um serviço)
  target_service: {
    slug: string;
  } | null;
  // Objeto aninhado para o *alvo* (se for um perfil)
  target_profile: {
    slug: string;
  } | null;
}

// --- MUDANÇA 2: Helper de Link atualizado ---

// Traduz o 'reason'
function getReasonLabel(reason: IReport["reason"]): string {
  const labels = {
    incorrect_information: "Informação Incorreta",
    inappropriate_content: "Conteúdo Inapropriado",
    spam: "Spam",
    fraud: "Fraude / Golpe",
    other: "Outro",
  };
  return labels[reason] || reason;
}

// Constrói o link para o *site público*
function getPublicTargetLink(
  report: IReport // Agora recebe o objeto 'report' inteiro
): { href: string; label: string } | null {
  const baseUrl = "https://www.canaoaves.com.br";
  const { target_type, target_id, target_service, target_profile } = report;

  switch (target_type) {
    case "service":
      // Usa o 'slug' do objeto aninhado 'target_service'
      const serviceSlug = target_service?.slug;
      if (serviceSlug) {
        return {
          href: `${baseUrl}/service/${serviceSlug}`,
          label: "Ver Serviço (Slug)",
        };
      }
      // Fallback para o ID (embora o 'slug' seja o ideal)
      return {
        href: `${baseUrl}/service/${target_id}`,
        label: "Ver Serviço (ID)",
      };

    case "profile":
      // Usa o 'slug' do objeto aninhado 'target_profile'
      const profileSlug = target_profile?.slug;
      if (profileSlug) {
        return {
          href: `${baseUrl}/profile/${profileSlug}`,
          label: "Ver Perfil (Slug)",
        };
      }
      return {
        href: `${baseUrl}/profile/${target_id}`,
        label: "Ver Perfil (ID)",
      };

    case "comment":
    case "photo":
    default:
      return null;
  }
}

// Traduz o 'target_type'
function getTypeLabel(target_type: IReport["target_type"]): string {
  const labels = {
    profile: "Perfil",
    service: "Serviço",
    comment: "Comentário",
    photo: "Foto",
  };
  return labels[target_type] || target_type;
}

export default function ReportList() {
  // --- ORDEM DE DECLARAÇÃO CORRIGIDA ---

  // 1. Declarar 'table' com 'let'
  let table: any = null;

  // 2. Definir Mutações
  const { mutate: resolveMutate } = useMutation({
    mutationFn: (reportId: string) => resolveReport(reportId),
    onSuccess: () => {
      toast.success("Denúncia resolvida com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao resolver denúncia: ${error.message}`);
    },
  });

  const { mutate: ignoreMutate } = useMutation({
    mutationFn: (reportId: string) => ignoreReport(reportId),
    onSuccess: () => {
      toast.success("Denúncia ignorada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao ignorar denúncia: ${error.message}`);
    },
  });

  // 3. Definir Handlers
  const handleResolve = React.useCallback(
    async (reportId: string) => {
      resolveMutate(reportId, {
        onSuccess: () => {
          table?.refineCore.refetch();
        },
      });
    },
    [resolveMutate]
  );

  const handleIgnore = React.useCallback(
    async (reportId: string) => {
      ignoreMutate(reportId, {
        onSuccess: () => {
          table?.refineCore.refetch();
        },
      });
    },
    [ignoreMutate]
  );

  // 4. Definir Colunas
  const columns = React.useMemo<ColumnDef<IReport>[]>(
    () => [
      {
        id: "target",
        header: "Alvo Denunciado",
        cell: function render({ row }) {
          // Passa o objeto 'report' inteiro para o helper
          const linkInfo = getPublicTargetLink(row.original);

          if (linkInfo) {
            return (
              <Button asChild variant="link" className="p-0">
                <Link href={linkInfo.href} target="_blank">
                  {linkInfo.label}
                </Link>
              </Button>
            );
          }
          return (
            <span className="font-mono text-xs" title={row.original.target_id}>
              {row.original.target_id.substring(0, 8)}...
            </span>
          );
        },
      },
      {
        id: "type",
        accessorKey: "target_type",
        header: "Tipo",
        cell: function render({ row }) {
          return (
            <Badge variant="outline">
              {getTypeLabel(row.original.target_type)}
            </Badge>
          );
        },
      },
      {
        id: "reason",
        accessorKey: "reason",
        header: "Motivo",
        cell: function render({ row }) {
          return <span>{getReasonLabel(row.original.reason)}</span>;
        },
      },
      {
        id: "actions",
        header: "Ações",
        cell: function render({ row }) {
          const report = row.original;
          const reporter = report.reporter;
          const categoryName = reporter?.categories?.name || "Não informado";

          return (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleResolve(report.id)}
              >
                Resolver
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleIgnore(report.id)}
              >
                Ignorar
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Ver Detalhes
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Detalhes da Denúncia</DialogTitle>
                  </DialogHeader>

                  <div className="py-4 text-sm">
                    <div className="grid grid-cols-3 gap-y-2 gap-x-4">
                      <strong className="col-span-1">Denunciado por:</strong>
                      <span className="col-span-2">
                        {reporter?.public_name || "N/A"}
                        {reporter?.full_name && ` - ${reporter.full_name}`}
                      </span>

                      <strong className="col-span-1">Tipo:</strong>
                      <span className="col-span-2">{categoryName}</span>

                      <strong className="col-span-1">Ranking:</strong>
                      <span className="col-span-2">{reporter?.score || 0}</span>

                      <strong className="col-span-1">Enviado em:</strong>
                      <span className="col-span-2">
                        {new Date(report.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>

                    <strong className="mt-4 block">Motivo da Denúncia:</strong>
                    <p className="mt-1 rounded border bg-gray-50 p-3 font-medium">
                      {getReasonLabel(report.reason)}
                    </p>

                    <strong className="mt-4 block">Mensagem:</strong>
                    <p className="mt-1 h-36 max-h-[40vh] overflow-y-auto rounded border bg-gray-50 p-3">
                      {report.description || "Nenhuma mensagem."}
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          );
        },
      },
    ],
    [handleResolve, handleIgnore]
  );

  // 5. Definir 'table' (agora 'columns' está definido)
  // Corrigido para não desestruturar (const table = ...)
  table = useTable<IReport>({
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
      // --- MUDANÇA 3: 'meta.select' atualizado ---
      meta: {
        select:
          "*, " + // Campos da denúncia
          "reporter:profiles!reports_reporter_id_fkey(full_name, public_name, score, categories(name)), " + // Perfil do denunciante
          "target_service:services!target_id(slug), " + // Slug do serviço (alvo)
          "target_profile:profiles!target_id(slug)", // Slug do perfil (alvo)
      },
    },
    columns,
  });

  return (
    <ListView>
      <ListViewHeader title="Denúncias" />
      <DataTable table={table} />
    </ListView>
  );
}
