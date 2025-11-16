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

interface ICityImage {
  id: string;
  image_url: string;
  approved: boolean;
  created_at: string;
  cities: {
    name: string;
    state: string;
  };
  profiles: {
    full_name: string;
    public_name: string;
    score: number;
    categories: {
      name: string;
    };
  };
}

export default function CityImageList() {
  // --- ORDEM DE DECLARAÇÃO CORRIGIDA ---

  // 1. Declarar 'table' com 'let' para que possa ser referenciado
  //    pelos handlers antes da inicialização completa.
  let table: any = null;

  // 2. Definir as mutações
  const { mutate: approveMutate } = useMutation({
    mutationFn: (id: string) => handleContentApproval("city_images", id, true),
    onSuccess: () => {
      toast.success("Imagem de cidade aprovada com sucesso!");
      // o refetch será chamado pelo handler
    },
    onError: (error: any) => {
      toast.error(`Erro ao aprovar imagem de cidade: ${error.message}`);
    },
  });

  const { mutate: rejectMutate } = useMutation({
    mutationFn: (id: string) => deleteContent("city_images", id),
    onSuccess: () => {
      toast.success("Imagem de cidade rejeitada (excluída) com sucesso!");
      // o refetch será chamado pelo handler
    },
    onError: (error: any) => {
      toast.error(`Erro ao rejeitar imagem de cidade: ${error.message}`);
    },
  });

  // 3. Definir os Handlers
  const handleApprove = React.useCallback(
    async (id: string) => {
      approveMutate(id, {
        onSuccess: () => {
          // Agora 'table' está acessível no closure
          table?.refineCore.refetch();
        },
      });
    },
    [approveMutate] // 'table' não é uma dependência
  );

  const handleReject = React.useCallback(
    async (id: string) => {
      rejectMutate(id, {
        onSuccess: () => {
          table?.refineCore.refetch();
        },
      });
    },
    [rejectMutate] // 'table' não é uma dependência
  );

  // 4. Definir as Colunas (que dependem dos handlers)
  const columns = React.useMemo<ColumnDef<ICityImage>[]>(
    () => [
      {
        id: "localizacao",
        header: "Localização",
        cell: function render({ row }) {
          const city = row.original.cities;
          if (!city) {
            return <span className="text-gray-500">Pendente</span>;
          }
          const location = city.state ? `${city.name}, ${city.state}` : city.name;
          return <span>{location}</span>;
        },
      },
      {
        id: "imagem",
        header: "Imagem",
        cell: function render({ row }) {
          return (
            <Image
              src={row.original.image_url}
              alt="City Image Preview"
              width={100}
              height={100}
              className="h-16 w-16 rounded object-cover"
            />
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
          const image = row.original;
          const profile = image.profiles;
          const categoryName = profile?.categories?.name || "Não informado";

          return (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleApprove(image.id)}
              >
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(image.id)}
              >
                Rejeitar
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Ver Detalhes
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Detalhes da Imagem</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <Image
                      src={image.image_url}
                      alt="City Image"
                      width={800}
                      height={600}
                      className="w-full rounded-md object-contain"
                    />
                  </div>
                  <div className="py-4 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <strong className="col-span-1">Enviado por:</strong>
                      <span className="col-span-2">
                        {profile?.public_name ||
                          profile?.full_name ||
                          "Usuário não encontrado"}
                      </span>
                      <strong className="col-span-1">Tipo:</strong>
                      <span className="col-span-2">{categoryName}</span>
                      <strong className="col-span-1">Ranking:</strong>
                      <span className="col-span-2">{profile?.score || 0}</span>
                      <strong className="col-span-1">Enviado em:</strong>
                      <span className="col-span-2">
                        {new Date(image.created_at).toLocaleString("pt-BR")}
                      </span>
                      <strong className="col-span-1">ID Imagem:</strong>
                      <span className="col-span-2 font-mono text-xs">
                        {image.id}
                      </span>
                    </div>
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

  // 5. Finalmente, definir 'table' (que depende de 'columns')
  table = useTable<ICityImage>({
    refineCoreProps: {
      resource: "city_images",
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
      meta: {
        select:
          "*, cities(name, state), profiles(full_name, public_name, score, categories(name))",
      },
    },
    columns, // Agora 'columns' está definida
  });

  return (
    <ListView>
      <ListViewHeader title="Imagens de Cidades para Aprovação" />
      <DataTable table={table} />
    </ListView>
  );
}
