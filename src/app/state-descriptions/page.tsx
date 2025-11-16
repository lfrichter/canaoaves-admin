"use client";

import { deleteContent, handleContentApproval } from "@/app/actions/content";
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
import React from "react";
import { toast } from "sonner";

// --- MUDANÇA 1: Interface atualizada para RPC (plana) ---
interface IStateDescription {
  id: string;
  state_code: string;
  description: string;
  approved: boolean;
  created_at: string;
  // Dados do Perfil (Submitter)
  profile_full_name: string | null;
  profile_public_name: string | null;
  profile_score: number | null;
  profile_category_name: string | null;
  profile_phone: string | null;
  profile_avatar_url: string | null;
  user_email: string | null;
}

// Mapeamento de Siglas para Nomes de Estados
const brStateNames: { [key: string]: string } = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas",
  BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo",
  GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul",
  MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
  PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
  SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};

export default function StateDescriptionList() {
  let table: any = null;

  const { mutate: approveMutate } = useMutation({
    mutationFn: (id: string) =>
      handleContentApproval("state_descriptions", id, true),
    onSuccess: () => {
      toast.success("Descrição de estado aprovada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao aprovar descrição de estado: ${error.message}`);
    },
  });

  const { mutate: rejectMutate } = useMutation({
    mutationFn: (id: string) => deleteContent("state_descriptions", id),
    onSuccess: () => {
      toast.success("Descrição de estado rejeitada (excluída) com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao rejeitar descrição de estado: ${error.message}`);
    },
  });

  const handleApprove = React.useCallback(
    async (id: string) => {
      approveMutate(id, {
        onSuccess: () => {
          table?.refineCore.tableQuery.refetch();
        },
      });
    },
    [approveMutate]
  );

  const handleReject = React.useCallback(
    async (id: string) => {
      rejectMutate(id, {
        onSuccess: () => {
          table?.refineCore.tableQuery.refetch();
        },
      });
    },
    [rejectMutate]
  );

  // --- MUDANÇA 2: Colunas atualizadas para RPC ---
  const columns = React.useMemo<ColumnDef<IStateDescription>[]>(
    () => [
      {
        id: "state_name",
        accessorKey: "state_code",
        header: "Nome do Estado",
        cell: function render({ row }) {
          const code = row.original.state_code;
          return <span>{brStateNames[code] || code}</span>;
        },
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Descrição",
        cell: function render({ row }) {
          const desc = row.original.description;
          return (
            <span className="block max-w-sm truncate" title={desc}>
              {desc}
            </span>
          );
        },
      },
      {
        id: "usuario",
        header: "Usuário",
        cell: function render({ row }) {
          const { profile_public_name, profile_full_name } = row.original;
          if (!profile_public_name && !profile_full_name) {
            return <span className="text-gray-500">...</span>;
          }
          return <span>{profile_public_name || profile_full_name}</span>;
        },
      },
      {
        id: "actions",
        header: "Ações",
        cell: function render({ row }) {
          const desc = row.original;
          const categoryName = desc.profile_category_name || "Não informado";
          const stateName = brStateNames[desc.state_code] || desc.state_code;
          const avatarUrl = desc.profile_avatar_url;

          return (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleApprove(desc.id)}
              >
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(desc.id)}
              >
                Rejeitar
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Ver Detalhes
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Detalhes da Descrição</DialogTitle>
                  </DialogHeader>

                  <div className="py-4 text-sm">
                    {/* Avatar e Nome */}
                    <div className="flex items-center gap-3 mb-4">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={desc.profile_public_name || "Avatar"}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                      )}
                      <div>
                        <strong className="block">
                          {desc.profile_public_name ||
                            desc.profile_full_name ||
                            "Usuário não encontrado"}
                        </strong>
                        <span className="text-xs text-muted-foreground">
                          {categoryName} (Ranking: {desc.profile_score || 0})
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-y-2 gap-x-4">
                      <strong className="col-span-1">Email:</strong>
                      <span className="col-span-2">
                        {desc.user_email || "N/A"}
                      </span>

                      <strong className="col-span-1">Telefone:</strong>
                      <span className="col-span-2">
                        {desc.profile_phone || "N/A"}
                      </span>

                      <strong className="col-span-1">Enviado em:</strong>
                      <span className="col-span-2">
                        {new Date(desc.created_at).toLocaleString("pt-BR")}
                      </span>

                      <strong className="col-span-1">Estado:</strong>
                      <span className="col-span-2">{stateName}</span>
                    </div>

                    <strong className="mt-4 block">Descrição Enviada:</strong>
                    <p className="mt-1 h-48 max-h-[50vh] overflow-y-auto rounded border p-3">
                      {desc.description || "Nenhuma descrição."}
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

  table = useTable<IStateDescription>({
    refineCoreProps: {
      resource: "state_descriptions",
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
      // --- MUDANÇA 3: Remover o 'meta.select' quebrado ---
      // meta: { ... }
    },
    columns,
  });

  return (
    <ListView>
      <ListViewHeader title="Descrições de Estados para Aprovação" />
      <DataTable table={table} />
    </ListView>
  );
}
