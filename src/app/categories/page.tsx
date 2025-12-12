"use client";

import { DeleteButton, EditButton } from "@/components/refine-ui/buttons";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useServerTable } from "@/hooks/useServerTable";
import { Category } from "@/types/app";
import { ColumnDef } from "@tanstack/react-table";
import {
  Briefcase,
  Calendar,
  CornerDownRight,
  Layers,
  LayoutGrid,
  Tag,
  User
} from "lucide-react";
import { useMemo } from "react";

const getTypeBadge = (type: string) => {
  switch (type) {
    case "pessoa":
      return <Badge variant="outline" className="border-blue-200 dark:border-blue-900 bg-blue-500/10 text-blue-700 dark:text-blue-400"><User className="w-3 h-3 mr-1" /> Pessoa</Badge>;
    case "empresa":
      return <Badge variant="outline" className="border-emerald-200 dark:border-emerald-900 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><Briefcase className="w-3 h-3 mr-1" /> Empresa</Badge>;
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
};

export default function CategoryList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const isMobile = useIsMobile();

  const columns = useMemo<ColumnDef<Category>[]>(
    () => {
      const allColumns: ColumnDef<Category>[] = [
        {
          id: "name",
          header: "Categoria / Hierarquia",
          accessorKey: "name",
          size: 350,
          cell: ({ row }) => {
            const { name, slug, icon, parent_id, type } = row.original;
            const isParent = !parent_id;

            const FallbackIcon = type === 'pessoa' ? User : type === 'empresa' ? Briefcase : Layers;

            return (
              <div className="flex items-center gap-3">
                <div className={isParent ? "" : "pl-8"} />
                {!isParent && <CornerDownRight className="w-4 h-4 text-muted-foreground/40 -ml-6 mr-2" />}
                <div className={`
                  flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-lg border shadow-sm
                  ${icon ? "bg-card text-2xl" : "bg-muted/50"}
                  ${!isParent ? "h-8 w-8 text-xl" : ""}
                `}>
                  {icon ? <span>{icon}</span> : <FallbackIcon className="h-4 w-4 text-muted-foreground opacity-50" />}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm text-foreground flex items-center gap-2 ${isParent ? "font-bold text-base" : "font-medium"}`}>
                      {name}
                      {isParent && (
                        <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 text-[10px] font-semibold bg-slate-500/10 text-slate-700 dark:text-slate-400">
                          <LayoutGrid className="w-3 h-3 mr-1" /> Raiz
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                    <Tag className="w-3 h-3 mr-1 opacity-50" />
                    <span className="font-mono opacity-80">{slug || "-"}</span>
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
          size: 110,
          cell: ({ getValue }) => getTypeBadge(getValue() as string),
        },
        {
          id: "created_at",
          header: "Criado em",
          accessorKey: "created_at",
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
          size: 190,
          cell: function render({ row }) {
            const id = row.original.id;
            return (
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {/* [CORREÇÃO] Bypass hideText */}
                      <div><EditButton resource="categories" recordItemId={id} size="sm" {...({ hideText: true } as any)} /></div>
                    </TooltipTrigger>
                    <TooltipContent>Editar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="w-px h-4 bg-border mx-1" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {/* [CORREÇÃO] Bypass hideText */}
                      <div><DeleteButton resource="categories" recordItemId={id} size="sm" {...({ hideText: true } as any)} /></div>
                    </TooltipTrigger>
                    <TooltipContent>Excluir</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          },
        },
      ];

      if (isMobile) {
        return allColumns.filter(col => col.id !== "created_at");
      }

      return allColumns;
    },
    [isMobile]
  );

  const table = useServerTable<Category>({
    resource: "categories",
    columns: columns,
    searchParams: searchParams || {},
    pagination: { mode: "off" },
    searchField: "name",
    sorters: {
      initial: [
        { field: "type", order: "desc" },
        { field: "sort_path", order: "asc" }
      ]
    }
  } as any); // [CORREÇÃO] Bypass sorters

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      <ListView>
        <ListViewHeader title="Gestão de Categorias" canCreate>
          {/* [CORREÇÃO] Bypass placeholder */}
          <TableSearchInput {...({ placeholder: "Buscar categoria..." } as any)} />
        </ListViewHeader>
        <DataTable table={table} />
      </ListView>
    </div>
  );
}
