// src/app/cities/page.tsx
"use client";

import { DataTable } from "@/components/refine-ui/data-table/data-table";
import {
  ListView,
  ListViewHeader,
} from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { MapPin, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

// Interface alinhada com o retorno do Supabase (Join é um array)
interface ICity {
  id: string;
  name: string;
  state: string;
  city_descriptions?: { id: string; approved: boolean }[];
}

export default function CityList() {
  const columns = React.useMemo<ColumnDef<ICity>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
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
          // Consideramos "Cadastrado" se houver pelo menos uma descrição (aprovada ou não)
          // O admin pode querer editar mesmo que esteja pendente
          const hasDescription = descriptions.length > 0;

          return hasDescription ? (
            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
              Cadastrado
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Sem Texto
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Ações",
        enableSorting: false,
        cell: ({ row }) => {
          const descriptions = row.original.city_descriptions || [];
          const existingDescription = descriptions[0];

          // LÓGICA INTELIGENTE:
          // Se já tem descrição -> Botão EDITAR
          // Se não tem -> Botão CRIAR (passando o ID da cidade)
          if (existingDescription) {
            return (
              <Button variant="secondary" size="sm" asChild>
                <Link href={`/cities/${existingDescription.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            );
          }

          return (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/cities/${row.original.id}/descriptions/create`}>
                <Plus className="mr-2 h-4 w-4" />
                Criar
              </Link>
            </Button>
          );
        },
      },
    ],
    []
  );

  const table = useTable<ICity>({
    columns,
    refineCoreProps: {
      resource: "cities",
      // Join com city_descriptions para saber o status
      meta: {
        select: "*, city_descriptions(id, approved)"
      },
      pagination: { pageSize: 20 },
      sorters: {
        initial: [{ field: "name", order: "asc" }],
      },
    },
  });

  return (
    <ListView>
      <ListViewHeader
        title="Hub de Cidades"
        // Desabilitamos a criação de CIDADES (geográficas)
        canCreate={false}
      />

      <div className="p-4 bg-background border-b flex gap-4">
        <Input
          placeholder="Buscar cidade por nome..."
          className="max-w-sm"
          onChange={(e) => {
            table.getColumn("name")?.setFilterValue(e.target.value);
          }}
        />
      </div>

      <DataTable table={table} />
    </ListView>
  );
}
