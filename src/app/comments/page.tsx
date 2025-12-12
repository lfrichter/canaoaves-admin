"use client";

import { deleteOne, update } from "@/app/actions/data";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
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
import { useIsMobile } from "@/hooks/use-mobile";
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
  User
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

export default function CommentList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  // [MELHORIA] Adicionado hook para responsividade (caso precise no futuro)
  const isMobile = useIsMobile();

  // Garantir que searchParams existe
  const safeParams = searchParams || {};

  const columns = React.useMemo<ColumnDef<IComment>[]>(
    () => {
      const allColumns: ColumnDef<IComment>[] = [
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
                  {type === 'service' ? 'Serviço' : 'Observador'}
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
            const refreshTable = () => {
              (table as any).options.meta?.refineCore?.tableQuery?.refetch();
            };
            return <CommentActions row={row.original} onRefresh={refreshTable} />;
          },
        },
      ];

      // Ocultar coluna Data no mobile para não quebrar layout
      if (isMobile) {
        return allColumns.filter(col => col.id !== 'created_at');
      }
      return allColumns;
    },
    [isMobile]
  );

  const table = useServerTable<IComment>({
    resource: "comments",
    columns: columns,
    searchParams: safeParams,
    initialPageSize: 20,
    searchField: "content",
    sorters: {
      initial: [{ field: "created_at", order: "desc" }],
    }
  } as any); // [CORREÇÃO] Bypass para erro de tipagem no 'sorters'

  return (
    <ListView>
      <ListViewHeader title="Gestão de Comentários">
        {/* [CORREÇÃO] Bypass para erro de tipagem no 'placeholder' */}
        <TableSearchInput {...({ placeholder: "Buscar comentários..." } as any)} />
      </ListViewHeader>

      {safeParams.id && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2 mt-4">
          <Link href="/reports" className="flex items-center gap-1 text-sm text-muted-foreground hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <p className="text-sm font-medium sm:flex-grow sm:text-center">Filtrando por ID: {safeParams.id}</p>
          <a
            href="/comments"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 px-3"
          >
            Limpar Filtro
          </a>
        </div>
      )}
      <DataTable table={table} />
    </ListView>
  );
}
