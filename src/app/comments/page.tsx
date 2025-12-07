"use client";

import { deleteOne, update } from "@/app/actions/data";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
// [PADRÃO] Importamos o Input de busca padrão do seu projeto
import { TableSearchInput } from "@/components/refine-ui/data-table/table-search-input";
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
import { Textarea } from "@/components/ui/textarea";
// [PADRÃO] Trocamos useTable pelo seu hook customizado useServerTable
import { useServerTable } from "@/hooks/useServerTable";
import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft,
  Coffee,
  Edit,
  ExternalLink,
  Loader2,
  Trash2,
  User,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";

interface IComment {
  id: string;
  content: string;
  created_at: string;
  target_type: "service" | "profile";
  target_name: string | null;
  target_slug: string | null;
  author_full_name: string | null;
  author_public_name: string | null;
  author_avatar_url: string | null;
  author_email: string | null;
}

// --- Componente de Ações (Mantido igual) ---
const CommentActions = ({ row, onRefresh }: { row: IComment; onRefresh: () => void }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [text, setText] = useState(row.content);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mutation: Editar
  const { mutate: updateMutate, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      return await update("comments", row.id, { content: text });
    },
    onSuccess: () => {
      toast.success("Comentário editado.");
      setIsEditOpen(false);
      onRefresh();
    },
    onError: (err: any) => toast.error("Erro ao editar: " + err.message),
  });

  // Mutation: Deletar
  const { mutate: deleteMutate, isPending: isDeleteLoading } = useMutation({
    mutationFn: async () => {
      return await deleteOne("comments", row.id);
    },
    onSuccess: async () => {
      setIsDeleting(false);
      toast.success("Comentário removido.");
      onRefresh();
    },
    onError: (err: any) => toast.error("Erro ao remover: " + err.message),
  });

  return (
    <div className="flex gap-2">
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Comentário</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground">
              <p><strong>Autor:</strong> {row.author_public_name || row.author_full_name}</p>
              <p><strong>Em:</strong> {row.target_name}</p>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={() => updateMutate()} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Comentário?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Esta ação não pode ser desfeita. O comentário será removido permanentemente.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)} disabled={isDeleteLoading}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteMutate()} disabled={isDeleteLoading}>
              {isDeleteLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// [PADRÃO] Recebemos searchParams assim como na página de Profiles
export default function CommentList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const filterById = searchParams?.id
    ? [
      {
        field: "id",
        operator: "eq",
        value: searchParams.id,
      },
    ]
    : [];
  const columns = React.useMemo<ColumnDef<IComment>[]>(
    () => [
      {
        id: "author",
        header: "Autor",
        cell: ({ row }) => {
          const name = row.original.author_public_name || row.original.author_full_name || "Anônimo";
          const avatar = row.original.author_avatar_url;
          return (
            <div className="flex items-center gap-2">
              {avatar ? (
                <Image src={avatar} alt="Avatar" width={32} height={32} className="rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><User className="w-4 h-4 text-gray-400" /></div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">{row.original.author_email}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "content",
        accessorKey: "content",
        header: "Comentário",
        cell: ({ row }) => (
          <div className="max-w-md">
            <p className="text-sm line-clamp-2 text-muted-foreground" title={row.original.content}>
              {row.original.content}
            </p>
          </div>
        ),
      },
      {
        id: "target",
        header: "Onde",
        cell: ({ row }) => {
          const type = row.original.target_type;
          const name = row.original.target_name;
          const slug = row.original.target_slug;

          let href = "#";
          if (slug) {
            if (type === 'service') href = `https://www.canaoaves.com.br/service/${slug}`;
            if (type === 'profile') href = `https://www.canaoaves.com.br/person/${slug}`;
          }

          return (
            <div className="flex flex-col items-start gap-1">
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                {type === 'service' ? <Coffee className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                {type === 'service' ? 'Serviço' : 'Perfil'}
              </Badge>
              <Link href={href} target="_blank" className="text-xs font-medium hover:underline flex items-center text-blue-600">
                {name} <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </div>
          );
        },
      },
      {
        id: "created_at",
        header: "Data",
        accessorKey: "created_at",
        cell: ({ getValue }) => <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(getValue() as string).toLocaleDateString("pt-BR")} {new Date(getValue() as string).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</span>
      },
      {
        id: "actions",
        header: "Ações",
        cell: function render({ row, table }) {
          // [PADRÃO] O useServerTable geralmente expõe o refresh via table.options.meta
          const refreshTable = () => {
            (table as any).options.meta?.refineCore?.tableQuery?.refetch();
          };
          return <CommentActions row={row.original} onRefresh={refreshTable} />;
        },
      },
    ],
    []
  );

  // [PADRÃO] Hook useServerTable idêntico ao de profiles
  const table = useServerTable<IComment>({
    resource: "comments",
    columns: columns,
    searchParams: searchParams || {}, // Passa os parâmetros da URL
    initialPageSize: 20,
    searchField: "content", // Define qual campo será buscado no data.ts
    sorters: {
      initial: [{ field: "created_at", order: "desc" }],
    }
  });

  return (
    <ListView>
      {/* [PADRÃO] Componente de busca do projeto */}
      <ListViewHeader title="Gestão de Comentários">
        <TableSearchInput />

        {/* Aviso de Filtro Ativo */}
        {searchParams?.id && (
          <div className="ml-4 flex items-center gap-2 animate-in fade-in">

            <Button variant="default" size="sm" asChild className="h-8 mx-2 bg-slate-700 hover:bg-slate-800">
              <Link href="/reports">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>


            <Badge variant="secondary" className="h-8 px-3">
              Filtrando por ID: {searchParams.id}
            </Badge>

            {/* Este Link funciona como um "Reset". */}
            <Button variant="ghost" size="sm" asChild className="h-8">
              <a href="/comments" className="text-destructive hover:text-destructive">
                <X className="w-3 h-3 mr-2" />
                Limpar Filtro
              </a>
            </Button>
          </div>
        )}
      </ListViewHeader>
      <DataTable table={table} />
    </ListView>
  );
}
