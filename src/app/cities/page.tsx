"use client";

import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { TableSearchInput } from "@/components/refine-ui/data-table/table-search-input";
import {
  ListView,
  ListViewHeader,
} from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useServerTable } from "@/hooks/useServerTable";
import { ColumnDef } from "@tanstack/react-table";
import { MapPin, Pencil, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ICity {
  id: string;
  name: string;
  state: string;
  city_descriptions?: { id: string; approved: boolean }[];
  city_images?: { image_url: string }[];
}

export default function CityList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const columns = React.useMemo<ColumnDef<ICity>[]>(
    () => [
      {
        accessorKey: "name",
        id: "name",
        enableColumnFilter: true,
        header: "Nome",
        cell: ({ row }) => {
          const city = row.original;
          // Pega a primeira imagem disponível (se houver)
          const photo = city.city_images?.[0]?.image_url;

          return (
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 min-w-[3rem] rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                {photo ? (
                  <Image
                    src={photo}
                    alt={city.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <MapPin className="w-6 h-6 text-muted-foreground/50" />
                )}
              </div>
              <span className="font-medium">{city.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "state",
        header: "UF",
        size: 80,
      },
      {
        id: "status_content",
        header: "Status",
        cell: ({ row }) => {
          const descriptions = row.original.city_descriptions || [];
          const hasDescription = descriptions.length > 0;

          return hasDescription ? (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              Cadastrado
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Pendente
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
          const descriptions = row.original.city_descriptions || [];
          const existingDescription = descriptions[0];

          // LÓGICA DE LINKS CORRIGIDA (Conforme solicitado)
          if (existingDescription) {
            return (
              <Button variant="secondary" size="sm" asChild>
                {/* Editar: Aponta para /cities/[description_id]
                   (Onde [id] é o ID da DESCRIÇÃO, conforme sua instrução)
                */}
                <Link href={`/cities/${existingDescription.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            );
          }

          return (
            <Button variant="outline" size="sm" asChild>
              {/* Criar: Aponta para /cities/[city_id]/descriptions/create
                  (Rota aninhada usando o ID da CIDADE)
              */}
              <Link href={`/cities/${row.original.id}/descriptions/create`}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Texto
              </Link>
            </Button>
          );
        },
      },
    ],
    []
  );

  const table = useServerTable<ICity>({
    resource: "cities",
    columns: columns,
    searchParams: searchParams || {},
    searchField: "name",
    initialPageSize: 20,
    sorters: {
      initial: [{ field: "name", order: "asc" }],
    },
    meta: {
      select: "*, city_descriptions(id, approved), city_images(image_url)"
    }
  } as any);

  return (
    <ListView>
      <ListViewHeader
        title="Cadastro de Cidades"
        canCreate={true}
      >
        <TableSearchInput placeholder="Buscar cidade por nome..." />
      </ListViewHeader>

      <DataTable table={table} />
    </ListView>
  );
}
