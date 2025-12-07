"use client";

import { DeleteButton, EditButton, ShowButton } from "@/components/refine-ui/buttons";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { TableSearchInput } from "@/components/refine-ui/data-table/table-search-input";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useServerTable } from "@/hooks/useServerTable";
import { Category } from "@/types/app";
import { ColumnDef } from "@tanstack/react-table";
import { Briefcase, Calendar, Layers, Tag, User } from "lucide-react";
import React from "react";

// Helper para colorir os tipos de categoria
const getTypeBadge = (type: string) => {
  switch (type) {
    case "pessoa":
      return (
        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
          <User className="w-3 h-3 mr-1" /> Pessoa
        </Badge>
      );
    case "empresa":
      return (
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
          <Briefcase className="w-3 h-3 mr-1" /> Empresa / Serviço
        </Badge>
      );
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
};

export default function CategoryList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const columns = React.useMemo<ColumnDef<Category>[]>(
    () => [
      {
        id: "name",
        header: "Categoria",
        accessorKey: "name", // Para ordenação
        size: 250,
        cell: ({ row }) => {
          const { name, slug } = row.original;
          return (
            <div className="flex items-center gap-3">
              {/* Ícone Placeholder */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/50">
                <Layers className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex flex-col">
                <span className="font-medium text-sm text-foreground">
                  {name}
                </span>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Tag className="w-3 h-3 mr-1 opacity-70" />
                  {slug || "sem-slug"}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "type",
        header: "Tipo",
        accessorKey: "type",
        size: 80,
        cell: ({ getValue }) => getTypeBadge(getValue() as string),
      },
      {
        id: "created_at",
        header: "Criado em",
        accessorKey: "created_at",
        size: 50,
        cell: ({ getValue }) => (
          <div className="flex items-center text-muted-foreground text-xs">
            <Calendar className="w-3 h-3 mr-1.5 opacity-70" />
            {new Date(getValue() as string).toLocaleDateString("pt-BR")}
          </div>
        )
      },
      {
        id: "actions",
        header: "Ações",
        cell: function render({ row }) {
          const id = row.original.id;
          return (
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div><ShowButton resource="categories" recordItemId={id} /></div>
                  </TooltipTrigger>
                  <TooltipContent>Ver Detalhes</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div><EditButton resource="categories" recordItemId={id} /></div>
                  </TooltipTrigger>
                  <TooltipContent>Editar Categoria</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="w-px h-4 bg-border mx-1" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div><DeleteButton resource="categories" recordItemId={id} /></div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-destructive text-destructive-foreground">
                    Excluir Categoria
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useServerTable<Category>({
    resource: "categories",
    columns: columns,
    searchParams: searchParams || {},
    initialPageSize: 20,
    searchField: "name", // Busca pelo nome da categoria
    sorters: {
      initial: [{ field: "name", order: "asc" }] // Categorias geralmente ficam melhor em ordem alfabética
    }
  });

  return (
    <ListView>
      <ListViewHeader title="Categorias" canCreate>
        <TableSearchInput placeholder="Buscar categorias..." />
      </ListViewHeader>
      <DataTable table={table} />
    </ListView>
  );
}
