"use client";

import { deleteContent, handleContentApproval } from "@/app/actions/content";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import {
  ListView,
  ListViewHeader,
} from "@/components/refine-ui/views/list-view";
import { useTable } from "@refinedev/react-table";
import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { toast } from "sonner";

// --- MUDANÇA 1: Importar componentes do Modal ---
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- MUDANÇA 2: Interface atualizada ---
interface IStateDescription {
  id: string;
  state_code: string; // Tabela tem 'state_code', não 'state_name'
  description: string;
  approved: boolean;
  created_at: string; // Para o modal
  // Objeto aninhado do perfil
  profiles: {
    full_name: string;
    public_name: string;
    score: number;
    categories: {
      name: string;
    };
  };
}

// --- MUDANÇA 3: Mapeamento de Siglas para Nomes de Estados ---
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
  // --- MUDANÇA 4: Corrigir ordem de declaração ---

  // 1. Declarar 'table' com 'let'
  let table: any = null;

  // 2. Definir Mutações
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

  // 3. Definir Handlers
  const handleApprove = React.useCallback(
    async (id: string) => {
      approveMutate(id, {
        onSuccess: () => {
          table?.refineCore.refetch(); // Chamar refetch no sucesso
        },
      });
    },
    [approveMutate]
  );

  const handleReject = React.useCallback(
    async (id: string) => {
      rejectMutate(id, {
        onSuccess: () => {
          table?.refineCore.refetch(); // Chamar refetch no sucesso
        },
      });
    },
    [rejectMutate]
  );

  // 4. Definir Colunas
  const columns = React.useMemo<ColumnDef<IStateDescription>[]>(
    () => [
      {
        id: "state_name",
        accessorKey: "state_code", // Usar a sigla
        header: "Nome do Estado",
        // Mapear a sigla para o nome completo
        cell: function render({ row }) {
          const code = row.original.state_code;
          return <span>{brStateNames[code] || code}</span>;
        },
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Descrição",
        // Truncar a descrição para caber na tabela
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
          const profile = row.original.profiles;
          if (!profile) {
            return <span className="text-gray-500">...</span>;
          }
          return <span>{profile.public_name || profile.full_name}</span>;
        },
      },
      {
        id: "actions",
        header: "Ações",
        cell: function render({ row }) {
          const desc = row.original;
          const profile = desc.profiles;
          const categoryName = profile?.categories?.name || "Não informado";
          const stateName = brStateNames[desc.state_code] || desc.state_code;

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

              {/* Botão do Modal */}
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
                    <div className="grid grid-cols-3 gap-y-2 gap-x-4">
                      <strong className="col-span-1">Enviado por:</strong>
                      <span className="col-span-2">
                        {profile?.public_name || "N/A"}
                        {profile?.full_name && ` - ${profile.full_name}`}
                      </span>

                      <strong className="col-span-1">Tipo:</strong>
                      <span className="col-span-2">{categoryName}</span>

                      <strong className="col-span-1">Ranking:</strong>
                      <span className="col-span-2">{profile?.score || 0}</span>

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

  // 5. Definir 'table' (agora 'columns' está definido)
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
      // --- MUDANÇA 5: Adicionar o meta.select ---
      meta: {
        select:
          "*, profiles(full_name, public_name, score, categories(name))",
      },
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
