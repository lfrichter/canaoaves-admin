"use client";

import { deleteContent, handleContentApproval } from "@/app/actions/content";
import { update } from "@/app/actions/data"; // Importar a server action de update genérica
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
import { Textarea } from "@/components/ui/textarea"; // Certifique-se de ter este componente no shadcn
import { useTable } from "@refinedev/react-table";
import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Check, Edit, Save, Trash2, Wand2, X } from "lucide-react"; // Ícones sugeridos
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface ICityDescription {
  id: string;
  description: string;
  approved: boolean;
  created_at: string;
  city_name: string | null;
  city_state: string | null;
  profile_full_name: string | null;
  profile_public_name: string | null;
  profile_score: number | null;
  profile_category_name: string | null;
  profile_phone: string | null;
  profile_avatar_url: string | null;
  user_email: string | null;
}

// --- Componente Isolado para Ações (Edição/Aprovação) ---
const CityDescriptionActions = ({
  row,
  onRefresh,
}: {
  row: ICityDescription;
  onRefresh: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(row.description || "");

  // Atualiza o texto local se a prop mudar
  useEffect(() => {
    setText(row.description || "");
  }, [row.description]);

  // Mutation: Aprovar
  const { mutate: approveMutate, isPending: isApproving } = useMutation({
    mutationFn: () => handleContentApproval("city_descriptions", row.id, true),
    onSuccess: () => {
      toast.success("Aprovado com sucesso!");
      setIsOpen(false);
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Mutation: Rejeitar/Excluir
  const { mutate: rejectMutate, isPending: isRejecting } = useMutation({
    mutationFn: () => deleteContent("city_descriptions", row.id),
    onSuccess: () => {
      toast.success("Rejeitado com sucesso!");
      setIsOpen(false);
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Mutation: Atualizar Texto
  const { mutate: updateTextMutate, isPending: isUpdating } = useMutation({
    mutationFn: async () => {
      // Chama a action genérica de update do data.ts
      // Importante: 'city_descriptions' aqui vai escrever na tabela real, o que é correto.
      return await update("city_descriptions", row.id, { description: text });
    },
    onSuccess: () => {
      toast.success("Texto atualizado!");
      setIsEditing(false);
      onRefresh(); // Atualiza a tabela "por trás" do modal
    },
    onError: (err: any) => toast.error("Erro ao salvar: " + err.message),
  });

  const handleSanitize = () => {
    if (!text) return;
    // Remove excesso de quebras de linha (mais de 2 vira 2), remove espaços nas pontas
    const sanitized = text
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    setText(sanitized);
    toast.info("Texto higienizado (excesso de espaços removidos).");
  };

  const avatarUrl = row.profile_avatar_url;
  const displayName = row.profile_public_name || row.profile_full_name || "Usuário desconhecido";
  const location = row.city_name ? `${row.city_name}, ${row.city_state}` : "N/A";

  return (
    <div className="flex flex-wrap gap-2">
      {/* Botões Rápidos na Listagem */}
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

      {/* Modal de Detalhes e Edição */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="default">
            Revisar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revisão de Conteúdo</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Cabeçalho do Usuário */}
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                  {displayName.charAt(0)}
                </div>
              )}
              <div className="space-y-1">
                <h4 className="font-semibold leading-none">{displayName}</h4>
                <p className="text-sm text-muted-foreground">{row.user_email}</p>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                  <span className="bg-white px-2 py-0.5 rounded border">
                    Score: {row.profile_score || 0}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border">
                    {row.profile_category_name || "Membro"}
                  </span>
                </div>
              </div>
              <div className="ml-auto text-right text-xs text-muted-foreground space-y-1">
                <p>Enviado em: {new Date(row.created_at).toLocaleDateString("pt-BR")}</p>
                <p className="font-medium text-foreground">{location}</p>
              </div>
            </div>

            {/* Área de Edição */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Conteúdo</Label>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="h-7 text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" /> Editar Texto
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSanitize}
                        className="h-7 text-xs text-amber-600"
                        title="Remover quebras de linha excessivas e espaços"
                      >
                        <Wand2 className="w-3 h-3 mr-1" /> Limpar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsEditing(false);
                          setText(row.description); // Reverte
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
                    id="description"
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
              {isRejecting ? "Rejeitando..." : "Rejeitar Conteúdo"}
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

// --- Componente Principal ---
export default function CityDescriptionList() {
  const columns = React.useMemo<ColumnDef<ICityDescription>[]>(
    () => [
      {
        id: "city_name",
        header: "Localização",
        cell: ({ row }) => {
          const { city_name, city_state } = row.original;
          if (!city_name) return <span className="text-muted-foreground italic">Cidade removida?</span>;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{city_name}</span>
              <span className="text-xs text-muted-foreground">{city_state}</span>
            </div>
          );
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
          // Helper para forçar refresh da tabela após ação
          const refreshTable = () => {
            (table as any).options.meta?.refineCore?.tableQuery?.refetch();
          };
          return <CityDescriptionActions row={row.original} onRefresh={refreshTable} />;
        },
      },
    ],
    []
  );

  const table = useTable<ICityDescription>({
    refineCoreProps: {
      resource: "city_descriptions", // O backend vai interceptar e ler da VIEW
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
      <ListViewHeader title="Moderação de Descrições" />
      <DataTable table={table} />
    </ListView>
  );
}
