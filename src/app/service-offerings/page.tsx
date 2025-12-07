"use client";

import { DeleteButton, EditButton, ShowButton } from "@/components/refine-ui/buttons";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { TableSearchInput } from "@/components/refine-ui/data-table/table-search-input";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useServerTable } from "@/hooks/useServerTable";
import { ServiceOffering } from "@/types/app";
import { ColumnDef } from "@tanstack/react-table";
import { Briefcase, Calendar, Tags } from "lucide-react";
import React from "react";

export default function ServiceOfferingList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const columns = React.useMemo<ColumnDef<ServiceOffering>[]>(
    () => [
      {
        id: "info",
        header: "Oferta / Serviço",
        accessorKey: "name", // Para ordenação
        cell: ({ row }) => {
          const { name, description } = row.original;
          return (
            <div className="flex items-center gap-3">
              {/* Ícone Decorativo (Violeta para diferenciar de Comodidades) */}
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-violet-50">
                <Briefcase className="h-4 w-4 text-violet-600" />
              </div>

              <div className="flex flex-col justify-center">
                <span className="font-medium text-sm text-foreground">
                  {name}
                </span>
                {description && (
                  <span className="text-xs text-muted-foreground line-clamp-1 max-w-md" title={description}>
                    {description}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "created_at",
        header: "Criado em",
        accessorKey: "created_at",
        size: 150,
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
          const name = row.original.name;

          return (
            <div className="flex items-center gap-1">

              {/* [NOVO] Botão de Gerenciar Categorias */}
              <CategoryManager
                itemId={id}
                itemName={name}
                type="offering" // <--- MUDANÇA AQUI
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                      <Tags className="w-4 h-4" />
                  </Button>
                }
              />

              <div className="w-px h-4 bg-border mx-1" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div><ShowButton resource="service_offerings" recordItemId={id} /></div>
                  </TooltipTrigger>
                  <TooltipContent>Ver Detalhes</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div><EditButton resource="service_offerings" recordItemId={id} /></div>
                  </TooltipTrigger>
                  <TooltipContent>Editar Oferta</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="w-px h-4 bg-border mx-1" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div><DeleteButton resource="service_offerings" recordItemId={id} /></div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-destructive text-destructive-foreground">
                    Excluir
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

  const table = useServerTable<ServiceOffering>({
    resource: "service_offerings",
    columns: columns,
    searchParams: searchParams || {},
    initialPageSize: 20,
    searchField: "name",
    sorters: {
      initial: [{ field: "name", order: "asc" }] // Ordem alfabética
    }
  });

  return (
    <ListView>
      <ListViewHeader title="Ofertas de Serviço" canCreate>
        <TableSearchInput placeholder="Buscar ofertas..." />
      </ListViewHeader>
      <DataTable table={table} />
    </ListView>
  );
}
