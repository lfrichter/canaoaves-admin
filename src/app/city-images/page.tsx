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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTable } from "@refinedev/react-table";
import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Check, Eye, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";

interface ICityImage {
  id: string;
  image_url: string;
  approved: boolean;
  created_at: string;
  // Dados da cidade
  city_name: string | null;
  city_state: string | null;
  // Dados do Perfil
  profile_full_name: string | null;
  profile_public_name: string | null;
  profile_score: number | null;
  profile_category_name: string | null;
  profile_phone: string | null;
  profile_avatar_url: string | null;
  user_email: string | null;
}

// --- Componente Isolado para Ações (Ver Detalhes / Aprovar) ---
const CityImageActions = ({
  row,
  onRefresh,
}: {
  row: ICityImage;
  onRefresh: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Mutation: Aprovar
  const { mutate: approveMutate, isPending: isApproving } = useMutation({
    mutationFn: () => handleContentApproval("city_images", row.id, true),
    onSuccess: () => {
      toast.success("Imagem aprovada com sucesso!");
      setIsOpen(false);
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Mutation: Rejeitar/Excluir
  const { mutate: rejectMutate, isPending: isRejecting } = useMutation({
    mutationFn: () => deleteContent("city_images", row.id),
    onSuccess: () => {
      toast.success("Imagem rejeitada com sucesso!");
      setIsOpen(false);
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const displayName = row.profile_public_name || row.profile_full_name || "Usuário desconhecido";
  const avatarUrl = row.profile_avatar_url;
  const location = row.city_name ? `${row.city_name}, ${row.city_state}` : "Localização desconhecida";

  return (
    <div className="flex flex-wrap gap-2">
      {/* Botões Rápidos */}
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

      {/* Modal Detalhado */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="default">
            <Eye className="w-4 h-4 mr-2" /> Revisar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revisão de Imagem</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Imagem Principal */}
            <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border">
              <Image
                src={row.image_url}
                alt={`Foto de ${location}`}
                fill
                className="object-contain"
              />
            </div>

            {/* Card do Usuário */}
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
                <p className="text-sm text-muted-foreground">{row.user_email || "Email N/A"}</p>
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
                <p>Tel: {row.profile_phone || "N/A"}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              onClick={() => rejectMutate()}
              disabled={isRejecting || isApproving}
            >
              {isRejecting ? "Rejeitando..." : "Rejeitar Imagem"}
            </Button>
            <Button
              onClick={() => approveMutate()}
              disabled={isRejecting || isApproving}
              className="bg-green-600 hover:bg-green-700 ml-2"
            >
              {isApproving ? "Aprovando..." : "Aprovar Imagem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Componente Principal ---
export default function CityImageList() {
  const columns = React.useMemo<ColumnDef<ICityImage>[]>(
    () => [
      {
        id: "localizacao",
        header: "Localização",
        cell: ({ row }) => {
          const { city_name, city_state } = row.original;
          if (!city_name) return <span className="text-muted-foreground italic">Pendente</span>;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{city_name}</span>
              <span className="text-xs text-muted-foreground">{city_state}</span>
            </div>
          );
        },
      },
      {
        id: "imagem",
        header: "Preview",
        cell: ({ row }) => (
          <div className="relative h-16 w-24 rounded overflow-hidden border bg-muted">
            <Image
              src={row.original.image_url}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
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
          return <CityImageActions row={row.original} onRefresh={refreshTable} />;
        },
      },
    ],
    []
  );

  const table = useTable<ICityImage>({
    refineCoreProps: {
      resource: "city_images", // Backend vai ler da VIEW
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
      <ListViewHeader title="Moderação de Imagens" />
      <DataTable table={table} />
    </ListView>
  );
}
