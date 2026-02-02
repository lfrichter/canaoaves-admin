"use client";

import { deleteContent, handleContentApproval } from "@/app/actions/content";
import { update } from "@/app/actions/data"; // Importar update genérico
import { UserProfileCard } from "@/components/admin/UserProfileCard";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import {
  ListView,
  ListViewHeader,
} from "@/components/refine-ui/views/list-view";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTable } from "@refinedev/react-table";
import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Check, Edit, Save, Trash2, Wand2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

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

interface IStateDescription {
  id: string;
  state_code: string;
  description: string;
  approved: boolean;
  created_at: string;
  profile_full_name: string | null;
  profile_public_name: string | null;
  profile_score: number | null;
  profile_category_name: string | null;
  category_icon: string | null;
  profile_phone: string | null;
  profile_avatar_url: string | null;
  user_email: string | null;
}

// --- Componente Isolado para Ações (Edição/Aprovação) ---
const StateDescriptionActions = ({
  row,
  onRefresh,
}: {
  row: IStateDescription;
  onRefresh: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(row.description || "");

  useEffect(() => {
    setText(row.description || "");
  }, [row.description]);

  // Mutation: Aprovar
  const { mutate: approveMutate, isPending: isApproving } = useMutation({
    mutationFn: () => handleContentApproval("state_descriptions", row.id, true),
    onSuccess: () => {
      toast.success("Estado aprovado com sucesso!");
      setIsOpen(false);
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Mutation: Rejeitar/Excluir
  const { mutate: rejectMutate, isPending: isRejecting } = useMutation({
    mutationFn: () => deleteContent("state_descriptions", row.id),
    onSuccess: () => {
      toast.success("Conteúdo rejeitado com sucesso!");
      setIsOpen(false);
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Mutation: Atualizar Texto
  const { mutate: updateTextMutate, isPending: isUpdating } = useMutation({
    mutationFn: async () => {
      // Escreve na tabela real 'state_descriptions'
      return await update("state_descriptions", row.id, { description: text });
    },
    onSuccess: () => {
      toast.success("Texto atualizado!");
      setIsEditing(false);
      onRefresh();
    },
    onError: (err: any) => toast.error("Erro ao salvar: " + err.message),
  });

  const handleSanitize = () => {
    if (!text) return;
    const sanitized = text
      .replace(/\n{3,}/g, "\n\n") // Max 2 quebras de linha
      .trim();
    setText(sanitized);
    toast.info("Texto higienizado (excesso de espaços removidos).");
  };

  const avatarUrl = row.profile_avatar_url;
  const displayName = row.profile_public_name || row.profile_full_name || "Usuário desconhecido";
  const stateName = brStateNames[row.state_code] || row.state_code;

  return (
    <div className="flex flex-wrap gap-2">
      {/* Botões Rápidos */}
      {!row.approved && (
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={() => approveMutate()}
          disabled={isApproving}
          title="Aprovar Rápido"
        >
          <Check className="h-4 w-4" />
        </Button>
      )}

      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => rejectMutate()}
        disabled={isRejecting}
        title="Rejeitar Rápido"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Modal Detalhado */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="default">
            Revisar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revisão: {stateName}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Card do Usuário */}
            <UserProfileCard
              key={row.id}
              displayName={displayName}
              email={row.user_email}
              avatarUrl={avatarUrl}
              profileScore={row.profile_score}
              profileCategoryName={row.profile_category_name}
              profileCategoryIcon={row.category_icon}
              createdAt={row.created_at}
              locationLabel={`${stateName} (${row.state_code})`}
              phone={row.profile_phone}
            />

            {/* Editor de Texto */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="desc-state">Descrição do Estado</Label>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="h-7 text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" /> Editar
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSanitize}
                        className="h-7 text-xs text-amber-600"
                        title="Remover espaços extras"
                      >
                        <Wand2 className="w-3 h-3 mr-1" /> Limpar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsEditing(false);
                          setText(row.description);
                        }}
                        className="h-7 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" /> Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    id="desc-state"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[200px] font-sans text-base leading-relaxed"
                  />
                  <Button
                    onClick={() => updateTextMutate()}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isUpdating ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              ) : (
                <div
                  className="rounded-md border p-4 min-h-[150px] bg-muted/20 whitespace-pre-wrap text-sm leading-relaxed cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => setIsEditing(true)}
                  title="Clique para editar"
                >
                  {row.description}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              onClick={() => rejectMutate()}
              disabled={isRejecting || isApproving}
            >
              {isRejecting ? "Rejeitando..." : "Rejeitar"}
            </Button>
            <Button
              onClick={() => approveMutate()}
              disabled={isRejecting || isApproving}
              className="bg-green-600 hover:bg-green-700 ml-2"
            >
              {isApproving ? "Aprovando..." : "Aprovar e Publicar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function StateDescriptionList() {
  const columns = React.useMemo<ColumnDef<IStateDescription>[]>(
    () => [
      {
        id: "state_name",
        accessorKey: "state_code",
        header: "Estado",
        cell: ({ row }) => {
          const code = row.original.state_code;
          return <span className="font-medium">{brStateNames[code] || code}</span>;
        },
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Resumo",
        cell: ({ row }) => (
          <span className="block max-w-md truncate text-muted-foreground" title={row.original.description}>
            {row.original.description}
          </span>
        ),
      },
      {
        id: "usuario",
        header: "Autor",
        cell: ({ row }) => {
          const { profile_public_name, profile_full_name, user_email } = row.original;
          return (
            <div className="flex flex-col">
              <span className="text-sm">{profile_public_name || profile_full_name || "N/A"}</span>
              <span className="text-xs text-muted-foreground">{user_email}</span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Ações",
        cell: function render({ row, table }) {
          const refreshTable = () => {
            (table as any).options.meta?.refineCore?.tableQuery?.refetch();
          };
          return <StateDescriptionActions row={row.original} onRefresh={refreshTable} />;
        },
      },
    ],
    []
  );

  const table = useTable<IStateDescription>({
    refineCoreProps: {
      resource: "state_descriptions", // Backend vai ler da VIEW
      filters: {
        permanent: [
          { field: "approved", operator: "eq", value: false },
        ],
      },
      syncWithLocation: true,
      pagination: { pageSize: 20 },
    },
    columns,
  });

  return (
    <ListView>
      <ListViewHeader title="Moderação de Estados" />
      <DataTable table={table} />
    </ListView>
  );
}
