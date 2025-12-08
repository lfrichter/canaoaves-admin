"use client";

import { deleteOne } from "@/app/actions/data"; // Import update para editar legenda se quiser
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
import { useServerTable } from "@/hooks/useServerTable";
import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft,
  Coffee,
  ExternalLink,
  Eye,
  Loader2,
  Trash2,
  User,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";

interface IPhoto {
  id: string;
  url: string;
  caption: string | null;
  created_at: string;
  target_type: "service" | "profile";
  target_name: string | null;
  target_slug: string | null;
  uploader_full_name: string | null;
  uploader_public_name: string | null;
  uploader_avatar_url: string | null;
  uploader_email: string | null;
}

// --- Componente de Ações (Ver / Deletar) ---
const PhotoActions = ({ row, onRefresh }: { row: IPhoto; onRefresh: () => void }) => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mutation: Deletar
  const { mutate: deleteMutate, isPending: isDeleteLoading } = useMutation({
    mutationFn: async () => {
      return await deleteOne("photos", row.id);
    },
    onSuccess: async () => {
      setIsDeleting(false);
      setIsViewOpen(false); // Fecha o modal de visualização se estiver deletando por lá
      toast.success("Imagem removida da galeria.");
      onRefresh();
    },
    onError: (err: any) => toast.error("Erro ao remover: " + err.message),
  });

  return (
    <div className="flex gap-2">
      {/* Botão de Ver/Gerenciar */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Visualizar Imagem</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Imagem Full */}
            <div className="relative w-full aspect-video bg-black/5 rounded-lg overflow-hidden border">
              <Image
                src={row.url}
                alt={row.caption || "Foto"}
                fill
                className="object-contain"
              />
            </div>

            {/* Metadados */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted/50 p-3 rounded">
                <p className="font-semibold mb-1">Enviado por:</p>
                <div className="flex items-center gap-2">
                  {row.uploader_avatar_url && (
                    <Image src={row.uploader_avatar_url} width={20} height={20} alt="Avatar" className="rounded-full" />
                  )}
                  <span>{row.uploader_public_name || row.uploader_full_name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{row.uploader_email}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded">
                <p className="font-semibold mb-1">Local (Contexto):</p>
                <p>{row.target_name}</p>
                <Badge variant="outline" className="mt-1">{row.target_type === 'service' ? 'Serviço' : 'Observador'}</Badge>
              </div>
            </div>

            {row.caption && (
              <div className="bg-muted/30 p-3 rounded border">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Legenda</p>
                <p>{row.caption}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Fechar</Button>
            <Button className="ml-2" variant="destructive" onClick={() => setIsDeleting(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Imagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão (Isolada para poder chamar de fora também) */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Imagem?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Tem certeza que deseja remover esta imagem da galeria? Esta ação é irreversível.
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

export default function PhotoList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const columns = React.useMemo<ColumnDef<IPhoto>[]>(
    () => [
      {
        id: "preview",
        header: "Imagem",
        size: 100,
        cell: ({ row }) => (
          <div className="relative h-16 w-24 rounded overflow-hidden border bg-muted group cursor-pointer">
            <Image
              src={row.original.url}
              alt="Preview"
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ),
      },
      {
        id: "caption",
        accessorKey: "caption",
        header: "Legenda / Info",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 max-w-xs">
            {row.original.caption ? (
              <span className="text-sm font-medium line-clamp-2">{row.original.caption}</span>
            ) : (
              <span className="text-xs text-muted-foreground italic">Sem legenda</span>
            )}
            <span className="text-[10px] text-muted-foreground">
              Enviado em: {new Date(row.original.created_at).toLocaleDateString("pt-BR")}
            </span>
          </div>
        ),
      },
      {
        id: "uploader",
        header: "Enviado Por",
        cell: ({ row }) => {
          const name = row.original.uploader_public_name || row.original.uploader_full_name || "Anônimo";
          return (
            <div className="flex flex-col">
              <span className="text-sm">{name}</span>
              <span className="text-xs text-muted-foreground">{row.original.uploader_email}</span>
            </div>
          );
        },
      },
      {
        id: "target",
        header: "Contexto",
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
        id: "actions",
        header: "Ações",
        cell: function render({ row, table }) {
          const refreshTable = () => {
            (table as any).options.meta?.refineCore?.tableQuery?.refetch();
          };
          return <PhotoActions row={row.original} onRefresh={refreshTable} />;
        },
      },
    ],
    []
  );

  const table = useServerTable<IPhoto>({
    resource: "photos",
    columns: columns,
    searchParams: searchParams || {},
    initialPageSize: 10, // Fotos ocupam mais espaço, melhor paginação menor
    searchField: "caption",
    sorters: {
      initial: [{ field: "created_at", order: "desc" }],
    }
  });

  return (
    <ListView>
      <ListViewHeader title="Galeria de Mídia">
        <TableSearchInput placeholder="Buscar legendas..." />

        {/* Navegação de Volta do Report */}
        {searchParams?.id && (
          <div className="ml-4 flex items-center gap-2 animate-in fade-in">
            <Button variant="default" size="sm" asChild className="h-8 bg-slate-700 hover:bg-slate-800">
              <Link href="/reports">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Denúncias
              </Link>
            </Button>

            <span className="text-muted-foreground">|</span>

            <Badge variant="secondary" className="h-8 px-3">
              Filtro Ativo: {searchParams.id}
            </Badge>

            <Button variant="ghost" size="sm" asChild className="h-8 text-muted-foreground">
              <a href="/photos">
                <X className="w-3 h-3 mr-1" />
                Ver Todas
              </a>
            </Button>
          </div>
        )}
      </ListViewHeader>
      <DataTable table={table} />
    </ListView>
  );
}
