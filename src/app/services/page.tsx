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
import { useServerTable } from "@/hooks/useServerTable";
import { Service } from "@/types/app";
import { ColumnDef } from "@tanstack/react-table";
import { Building2, Calendar, CheckCircle2, FileText, Globe } from "lucide-react";
import Image from "next/image";
import React from "react";

// Helper para Status
const getStatusBadge = (status: string) => {
  switch (status) {
    case "published":
      return <Badge className="bg-green-600 hover:bg-green-700 border-green-600"><Globe className="w-3 h-3 mr-1" /> Publicado</Badge>;
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
  const columns = React.useMemo<ColumnDef<Service>[]>(
    () => [
      {
        id: "info",
        header: "Serviço / Estabelecimento",
        accessorKey: "name", // Para ordenação
        cell: ({ row }) => {
          const service = row.original;
          const photo = service.featured_photo_url;

          return (
            <div className="flex items-start gap-3">
              {/* Foto ou Placeholder */}
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

              {/* Texto */}
              <div className="flex flex-col justify-center">
                <span className="font-medium text-sm text-foreground flex items-center gap-1.5">
                  {service.name}
                  {service.is_authenticated && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50" />
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
        header: "Status",
        accessorKey: "status",
        size: 100,
        cell: ({ getValue }) => getStatusBadge(getValue() as string),
      },
      {
        id: "created_at",
        header: "Criado em",
        accessorKey: "created_at",
        size: 120,
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
                    <div><EditButton recordItemId={id} /></div>
                  </TooltipTrigger>
                  <TooltipContent>Editar Serviço</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="w-px h-4 bg-border mx-1" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div><DeleteButton recordItemId={id} /></div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-destructive text-destructive-foreground">
                    Excluir Serviço
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

  const table = useServerTable<Service>({
    resource: "services",
    columns: columns,
    searchParams: searchParams || {},
    initialPageSize: 10,
    searchField: "name",
    sorters: {
      initial: [{ field: "created_at", order: "desc" }]
    }
  });

  return (
    <ListView>
      <ListViewHeader title="Catálogo de Serviços">
        <TableSearchInput placeholder="Buscar serviços..." />
      </ListViewHeader>
      <DataTable table={table} />
    </ListView>
  );
}
