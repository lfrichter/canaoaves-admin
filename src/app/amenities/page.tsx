"use client";

import { CategoryManager } from "@/components/admin/CategoryManager";
import { DeleteButton, EditButton } from "@/components/refine-ui/buttons";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { TableSearchInput } from "@/components/refine-ui/data-table/table-search-input";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useServerTable } from "@/hooks/useServerTable";
import { Amenity } from "@/types/app";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar, Sparkles, Tags } from "lucide-react";
import { useMemo } from "react";

// 1. IMPORT DO HOOK
import { useIsMobile } from "@/hooks/use-mobile";

export default function AmenityList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  // 2. USO DO HOOK
  const isMobile = useIsMobile();

  const columns = useMemo<ColumnDef<Amenity>[]>(
    () => {
      const allColumns: ColumnDef<Amenity>[] = [
        {
          id: "info",
          header: "Comodidade",
          accessorKey: "name",
          size: 170,
          cell: ({ row }) => {
            const { name, description } = row.original;
            return (
              <div className="flex items-center gap-3">
                {/* Ícone Decorativo - Mantemos hidden sm:flex para economizar espaço dentro da célula */}
                <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border bg-amber-50/50">
                  <Sparkles className="h-4 w-4 text-amber-500" />
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
          header: "Criado em", // Removemos o 'hidden sm:inline' pois a coluna inteira sairá
          accessorKey: "created_at",
          size: 120, // Ajuste de tamanho padrão
          cell: ({ getValue }) => (
            // Removemos o 'hidden sm:flex' pois a coluna não existirá no mobile
            <div className="flex items-center text-muted-foreground text-xs">
              <Calendar className="w-3 h-3 mr-1.5 opacity-70" />
              {new Date(getValue() as string).toLocaleDateString("pt-BR")}
            </div>
          )
        },
        {
          id: "actions",
          header: "Ações",
          size: 140, // Espaço confortável para os 3 botões
          cell: function render({ row }) {
            const id = row.original.id;
            const name = row.original.name;

            return (
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <CategoryManager
                          itemId={id}
                          itemName={name}
                          type="amenity"
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                              <Tags className="w-4 h-4" />
                            </Button>
                          }
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Associar categorias</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="w-px h-4 bg-border mx-1" />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div><EditButton resource="amenities" recordItemId={id} size="sm" hideText /></div>
                    </TooltipTrigger>
                    <TooltipContent>Editar Comodidade</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="w-px h-4 bg-border mx-1" />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div><DeleteButton resource="amenities" recordItemId={id} size="sm" hideText /></div>
                    </TooltipTrigger>
                    <TooltipContent>Excluir</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          },
        },
      ];

      // 3. REMOVE A COLUNA NO MOBILE
      if (isMobile) {
        return allColumns.filter((col) => col.id !== "created_at");
      }

      return allColumns;
    },
    [isMobile]
  );

  const table = useServerTable<Amenity>({
    resource: "amenities",
    columns: columns,
    searchParams: searchParams || {},
    initialPageSize: 20,
    searchField: "name",
    sorters: {
      initial: [{ field: "name", order: "asc" }]
    }
  });

  return (
    <ListView>
      <ListViewHeader title="Comodidades" canCreate>
        <TableSearchInput placeholder="Buscar comodidade..." />
      </ListViewHeader>
      <DataTable table={table} />
    </ListView>
  );
}
