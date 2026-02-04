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
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

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
        id: "name",
        enableColumnFilter: true,
        header: "Nome",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
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

  const table = useTable<ICity>({
    columns,
    refineCoreProps: {
      resource: "cities",
      meta: {
        select: "*, city_descriptions(id, approved)"
      },
      pagination: { pageSize: 20 },
      sorters: {
        initial: [{ field: "name", order: "asc" }],
      },
      filters: {
        initial: [],
      }
    },
  });

  // SOLUÇÃO DA BUSCA:
  // Extraímos setFilters diretamente do refineCore.
  // Isso é garantido de existir e funcionar, pois é a API do Refine,
  // ignorando as idiossincrasias da versão do TanStack Table.
  const {
    refineCore: { setFilters }
  } = table;

  return (
    <ListView>
      <ListViewHeader
        title="Cadastro de Cidades"
        canCreate={false}
      />

      <div className="p-4 bg-background border-b">
        <Input
          placeholder="Buscar cidade por nome..."
          className="max-w-sm"
          onChange={(e) => {
            // Filtro direto no Refine (Supabase)
            setFilters([
              {
                field: "name",
                operator: "contains",
                // Se estiver vazio, passamos undefined para limpar o filtro
                value: e.target.value ? e.target.value : undefined,
              },
            ]);
          }}
        />
      </div>

      <DataTable table={table} />
    </ListView>
  );
}
