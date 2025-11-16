"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleContentApproval, deleteContent } from "@/app/actions/content";
import Image from "next/image";

interface ICityImage {
  id: string;
  city_name: string;
  image_url: string;
  approved: boolean;
}

export default function CityImageList() {
  const { mutate: approveMutate } = useMutation({
    mutationFn: (id: string) => handleContentApproval("city_images", id, true),
    onSuccess: () => {
      toast.success("Imagem de cidade aprovada com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao aprovar imagem de cidade: ${error.message}`);
    },
  });

  const { mutate: rejectMutate } = useMutation({
    mutationFn: (id: string) => deleteContent("city_images", id),
    onSuccess: () => {
      toast.success("Imagem de cidade rejeitada (excluída) com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao rejeitar imagem de cidade: ${error.message}`);
    },
  });

  const handleApprove = React.useCallback(async (id: string) => {
    approveMutate(id);
  }, [approveMutate]);

  const handleReject = React.useCallback(async (id: string) => {
    rejectMutate(id);
  }, [rejectMutate]);

  const columns = React.useMemo<ColumnDef<ICityImage>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
      },
      {
        id: "city_name",
        accessorKey: "city_name",
        header: "Nome da Cidade",
      },
      {
        id: "image_url",
        accessorKey: "image_url",
        header: "Imagem",
        cell: function render({ row }) {
          const imageUrl = row.original.image_url;
          return (
            <Image
              src={imageUrl}
              alt="City Image"
              width={100}
              height={100}
              style={{ objectFit: "cover" }}
            />
          );
        },
      },
      {
        id: "actions",
        header: "Ações",
        cell: function render({ row }) {
          const id = row.original.id;
          return (
            <div className="flex gap-2">
              <button
                className="px-4 py-2 text-white bg-green-500 rounded"
                onClick={() => handleApprove(id)}
              >
                Aprovar
              </button>
              <button
                className="px-4 py-2 text-white bg-red-500 rounded"
                onClick={() => handleReject(id)}
              >
                Rejeitar
              </button>
            </div>
          );
        },
      },
    ],
    [handleApprove, handleReject]
  );

  const refineTableProps = useTable<ICityImage>({
    refineCoreProps: {
      resource: "city_images",
      filters: [
        {
          field: "approved",
          operator: "eq",
          value: false,
        },
      ],
      syncWithLocation: true,
    },
    columns,
  });

  const refetch = refineTableProps.refineCore.refetch;

  return (
    <ListView>
      <ListViewHeader title="Imagens de Cidades para Aprovação" />
      <DataTable table={refineTableProps} />
    </ListView>
  );
}