"use client";

import { DeleteButton, EditButton, RestoreButton, ShowButton } from "@/components/refine-ui/buttons";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { TableSearchInput } from "@/components/refine-ui/data-table/table-search-input";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useServerTable } from "@/hooks/useServerTable";
import { ProfileWithUser } from "@/types/app";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar, Shield, ShieldAlert, Trophy, User } from "lucide-react";
import React from "react";

// Helper para cores das roles
const getRoleBadge = (role: string) => {
  switch (role) {
    case "master":
      return <Badge className="bg-slate-900 hover:bg-slate-800 border-slate-900"><ShieldAlert className="w-3 h-3 mr-1 text-red-500" /> Master</Badge>;
    case "admin":
      return <Badge className="bg-blue-600 hover:bg-blue-700 border-blue-600"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>;
    default:
      return <Badge variant="secondary" className="font-normal text-muted-foreground"><User className="w-3 h-3 mr-1" /> Usuário</Badge>;
  }
};

export default function ProfileList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const columns = React.useMemo<ColumnDef<ProfileWithUser>[]>(
    () => [
      {
        id: "identity",
        header: "Usuário",
        accessorKey: "full_name", // Para ordenação funcionar
        cell: ({ row }) => {
          const profile = row.original;
          const isDeleted = !!profile.deleted_at;

          return (
            <div className={`flex items-center gap-3 ${isDeleted ? "opacity-50 grayscale" : ""}`}>
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                  {profile.full_name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <span className="font-medium text-sm text-foreground flex items-center gap-2">
                  {profile.full_name || "Sem nome"}
                  {isDeleted && (
                    <Badge variant="destructive" className="h-4 px-1 text-[10px] uppercase">
                      Inativo
                    </Badge>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">{profile.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "role",
        header: "Permissão",
        accessorKey: "app_role",
        size: 100,
        cell: ({ getValue }) => {
          const role = getValue() as string;
          return getRoleBadge(role || "user");
        }
      },
      {
        id: "score",
        header: "Score",
        accessorKey: "score",
        size: 80,
        cell: ({ getValue }) => (
          <div className="flex items-center text-amber-600 font-medium text-sm">
            <Trophy className="w-3 h-3 mr-1.5" />
            {Number(getValue() || 0).toLocaleString('pt-BR')}
          </div>
        )
      },
      {
        id: "created_at",
        header: "Cadastro",
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
          const isDeleted = !!row.original.deleted_at;

          return (
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* Envolvemos em div para o tooltip funcionar no botão */}
                    <div><ShowButton recordItemId={id} /></div>
                  </TooltipTrigger>
                  <TooltipContent>Ver Detalhes</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div><EditButton recordItemId={id} /></div>
                  </TooltipTrigger>
                  <TooltipContent>Editar Perfil</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="w-px h-4 bg-border mx-1" />

              {/* Lógica de Troca de Botão (Restaurar vs Excluir) */}
              {isDeleted ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div><RestoreButton recordItemId={id} /></div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-green-600 text-white border-green-700">
                      Reativar Usuário
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div><DeleteButton recordItemId={id} /></div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-destructive text-destructive-foreground">
                      Banir Usuário
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useServerTable<ProfileWithUser>({
    resource: "profiles",
    columns: columns,
    searchParams: searchParams || {},
    initialPageSize: 20,
    searchField: "full_name", // Busca pelo nome
    // Ordenação padrão por data de criação decrescente
    sorters: {
      initial: [{ field: "created_at", order: "desc" }]
    }
  });

  return (
    <ListView>
      <ListViewHeader title="Gestão de Usuários"><TableSearchInput placeholder="Buscar por nome ou email..." /></ListViewHeader>
      <DataTable table={table} />
    </ListView>
  );
}
