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
import Image from "next/image"; // Importar Image
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

import {
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "@/types/app";

// --- Interface Atualizada (Plana, vinda da RPC) ---
interface IReport {
  id: string;
  target_id: string;
  target_type: ReportTargetType;
  reason: ReportReason;
  status: string;
  description: string;
  created_at: string;
  // Campos do Denunciante (Reporter)
  reporter_full_name: string | null;
  reporter_public_name: string | null;
  reporter_score: number | null;
  reporter_category_name: string | null;
  target_slug: string | null;
  // Campos de Contato
  reporter_phone: string | null;
  reporter_avatar_url: string | null;
  reporter_email: string | null;
}

// Helper: Traduz o 'reason'
function getReasonLabel(reason: ReportReason): string {
  const labels = {
    incorrect_information: "Informação Incorreta",
    inappropriate_content: "Conteúdo Inapropriado",
    spam: "Spam",
    fraud: "Fraude / Golpe",
    other: "Outro",
  };
  return labels[reason] || reason;
}

// Helper: Constrói o link para o *site público*
function getPublicTargetLink(
  report: IReport
): { href: string; label: string } | null {
  const baseUrl = "https://www.canaoaves.com.br";
  const { target_type, target_slug } = report;

  switch (target_type) {
    case "service":
      if (target_slug) {
        return {
          href: `${baseUrl}/service/${target_slug}`,
          label: "Ver Serviço",
        };
      }
      break;
    case "profile":
      if (target_slug) {
        return {
          href: `${baseUrl}/profile/${target_slug}`,
          label: "Ver Perfil",
        };
      }
      break;
    default:
      return null;
  }
  return null;
}

// Helper: Traduz o 'target_type'
function getTypeLabel(target_type: ReportTargetType): string {
  const labels = {
    profile: "Perfil",
    service: "Serviço",
    comment: "Comentário",
    photo: "Foto",
  };
  return labels[target_type] || target_type;
}

export default function ReportList() {
  let table: any = null;

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

  const columns = React.useMemo<ColumnDef<IReport>[]>(
    () => [
      {
        id: "target",
        header: "Alvo Denunciado",
        cell: function render({ row }) {
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
          const categoryName = report.reporter_category_name || "Não informado";
          const avatarUrl = report.reporter_avatar_url;

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
                    {/* --- Avatar e Nome --- */}
                    <div className="flex items-center gap-3 mb-4">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={report.reporter_public_name || "Avatar"}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                      )}
                      <div>
                        <strong className="block">
                          {report.reporter_public_name || "N/A"}
                          {report.reporter_full_name &&
                            ` - ${report.reporter_full_name}`}
                        </strong>
                        <span className="text-xs text-muted-foreground">
                          {categoryName} (Ranking: {report.reporter_score || 0})
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-y-2 gap-x-4">
                      <strong className="col-span-1">Email:</strong>
                      <span className="col-span-2">{report.reporter_email || "N/A"}</span>

                      <strong className="col-span-1">Telefone:</strong>
                      <span className="col-span-2">{report.reporter_phone || "N/A"}</span>

                      <strong className="col-span-1">Enviado em:</strong>
                      <span className="col-span-2">
                        {new Date(report.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>

                    <strong className="mt-4 block">Motivo da Denúncia:</strong>
                    <p className="mt-1 rounded border p-3 font-medium">
                      {getReasonLabel(report.reason)}
                    </p>

                    <strong className="mt-4 block">Mensagem:</strong>
                    <p className="mt-1 h-36 max-h-[40vh] overflow-y-auto rounded border p-3">
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

  table = useTable<IReport>({
    refineCoreProps: {
      resource: "reports",
      filters: {
        permanent: [
          {
            field: "status",
            operator: "eq",
            value: "pending" as ReportStatus,
          },
        ],
      },
      syncWithLocation: true,
      // 'meta' é removido pois a Server Action 'getList'
      // está interceptando 'reports' e chamando a RPC.
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
