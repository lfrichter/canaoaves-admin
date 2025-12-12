"use client";

import { DeleteButton, EditButton } from "@/components/refine-ui/buttons";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { TableSearchInput } from "@/components/refine-ui/data-table/table-search-input";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useServerTable } from "@/hooks/useServerTable";
import { Service } from "@/types/app";
import { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Building2, Calendar, CheckCircle2, FileText, Filter, Globe } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

// --- HEADER ORDENÁVEL ---
interface SortableHeaderProps {
  column: Column<any, any>;
  title: string;
}

const SortableHeader = ({ column, title }: SortableHeaderProps) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="-ml-3 h-8 data-[state=open]:bg-accent hover:bg-muted/50"
    >
      <span>{title}</span>
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  );
};

// Helper de Status
const getStatusBadge = (status: string) => {
  switch (status) {
    case "published":
      return <Badge className="border-transparent bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20"><Globe className="w-3 h-3 mr-1" /> Publicado</Badge>;
    case "draft":
      return <Badge variant="secondary" className="text-muted-foreground"><FileText className="w-3 h-3 mr-1" /> Rascunho</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function ServiceList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsHook = useSearchParams();
  const isMobile = useIsMobile();

  // 1. Ler o status atual da URL
  const currentStatus = searchParamsHook.get("status") || "all";

  const columns = useMemo<ColumnDef<Service>[]>(
    () => {
      // [CORREÇÃO] Estava como ColumnDef<Category>[], mas o tipo correto é Service
      const allColumns: ColumnDef<Service>[] = [
        {
          id: "name",
          header: ({ column }) => <SortableHeader column={column} title="Serviço / Estabelecimento" />,
          accessorKey: "name",
          size: 450,
          cell: ({ row }) => {
            const service = row.original;
            const photo = service.featured_photo_url;

            return (
              <div className="flex items-start gap-3">
                <div className="relative h-12 w-12 min-w-[3rem] rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={service.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-medium text-sm text-foreground flex items-center gap-1.5">
                    {service.name}
                    {service.is_authenticated && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/10 dark:fill-blue-500/20" />
                          </TooltipTrigger>
                          <TooltipContent>Serviço Verificado / Autenticado</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs" title={service.description || ""}>
                    {service.description || "Sem descrição definida."}
                  </span>
                </div>
              </div>
            );
          },
        },
        {
          id: "status",
          header: ({ column }) => <SortableHeader column={column} title="Status" />,
          accessorKey: "status",
          size: 90,
          enableColumnFilter: true,
          cell: ({ getValue }) => getStatusBadge(getValue() as string),
        },
        {
          id: "created_at",
          header: ({ column }) => <SortableHeader column={column} title="Criado em" />,
          accessorKey: "created_at",
          size: 80,
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
                      {/* [CORREÇÃO] Bypass hideText */}
                      <div><EditButton recordItemId={id} size="sm" {...({ hideText: true } as any)} /></div>
                    </TooltipTrigger>
                    <TooltipContent>Editar Serviço</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="w-px h-4 bg-border mx-1" />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {/* [CORREÇÃO] Bypass hideText */}
                      <div><DeleteButton recordItemId={id} size="sm" {...({ hideText: true } as any)} /></div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Excluir Serviço
                    </TooltipContent>
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

  const table = useServerTable<Service>({
    resource: "services",
    columns: columns,
    searchParams: searchParams || {},
    initialPageSize: 10,
    searchField: "name",
    sorters: {
      initial: [{ field: "created_at", order: "desc" }]
    },
    meta: {
      statusFilter: currentStatus !== "all" ? currentStatus : undefined,
    }
  } as any); // [CORREÇÃO] Bypass para erros de tipagem no config do hook

  // Função para atualizar a URL
  const handleStatusFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParamsHook.toString());
    params.set("current", "1"); // Resetar paginação

    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <ListView>
      <ListViewHeader title="Catálogo de Serviços">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-end sm:items-center">

          <div className="w-full sm:w-[300px] relative">
            {/* [CORREÇÃO] Bypass placeholder */}
            <TableSearchInput {...({ placeholder: "Buscar serviços..." } as any)} />
          </div>

          <div className="w-full sm:w-[180px]">
            <Select
              value={currentStatus}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="h-10 w-full bg-background">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="published">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Publicados
                  </span>
                </SelectItem>
                <SelectItem value="draft">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Rascunhos
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ListViewHeader>
      <DataTable table={table} />
    </ListView>
  );
}
