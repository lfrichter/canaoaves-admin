"use client";

import { DeleteButton, EditButton, RestoreButton } from "@/components/refine-ui/buttons";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { TableSearchInput } from "@/components/refine-ui/data-table/table-search-input";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useServerTable } from "@/hooks/useServerTable";
import {
  GAMIFICATION_COLORS,
  GAMIFICATION_ICONS,
  GAMIFICATION_LABELS,
  GAMIFICATION_LEVELS
} from "@/lib/gamificationConstants";
import { getStatusDetails, normalizeStatusKey } from "@/lib/gamificationUtils";
import { ProfileWithUser } from "@/types/app";
import { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpCircle, ArrowUpDown, Calendar, Shield, ShieldAlert, Trophy, User } from "lucide-react";
import { useMemo } from "react";

interface SortableHeaderProps {
  column: Column<any, any>;
  title: string;
}

const SortableHeader = ({ column, title }: SortableHeaderProps) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="-ml-3 h-8 data-[state=open]:bg-accent hover:bg-slate-50"
    >
      <span>{title}</span>
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  );
};

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

  const columns = useMemo<ColumnDef<ProfileWithUser>[]>(
    () => [
      {
        // [CORREÇÃO] ID alterado para bater com a coluna do banco
        id: "full_name",
        header: ({ column }) => <SortableHeader column={column} title="Usuário" />,
        accessorKey: "full_name",
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
                  {isDeleted && <Badge variant="destructive" className="h-4 px-1 text-[10px]">Inativo</Badge>}
                </span>
                <span className="text-xs text-muted-foreground">{profile.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        // [CORREÇÃO] ID alterado para bater com a coluna do banco (app_role)
        id: "app_role",
        header: ({ column }) => <SortableHeader column={column} title="Permissão" />,
        accessorKey: "app_role",
        size: 100,
        cell: ({ getValue }) => getRoleBadge(getValue() as string)
      },
      {
        id: "score",
        header: ({ column }) => <SortableHeader column={column} title="Nível & Score" />,
        accessorKey: "score",
        size: 140,
        cell: ({ row }) => {
          const score = Number(row.original.score || 0);

          const { name, nextStart } = getStatusDetails(score, GAMIFICATION_LEVELS);

          const statusKey = normalizeStatusKey(name);
          const label = GAMIFICATION_LABELS[statusKey] || name;
          const icon = GAMIFICATION_ICONS[statusKey] || '🏆';
          const color = GAMIFICATION_COLORS[statusKey] || '#64748b';

          return (
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-start gap-1 cursor-help w-full max-w-[140px]">
                    <Badge
                      style={{
                        backgroundColor: `${color}15`,
                        color: color,
                        borderColor: `${color}30`
                      }}
                      className="font-bold border hover:bg-muted transition-colors w-full justify-start"
                    >
                      <span className="mr-1.5 text-base">{icon}</span>
                      {label}
                    </Badge>

                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: nextStart ? `${Math.min((score / nextStart) * 100, 100)}%` : '100%',
                          backgroundColor: color
                        }}
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-3 bg-white border shadow-xl">
                  <div className="space-y-2">
                    <p className="font-bold flex items-center text-sm text-slate-800">
                      <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                      {score.toLocaleString('pt-BR')} pontos
                    </p>
                    {nextStart ? (
                      <div className="text-xs text-muted-foreground pt-2 border-t flex items-center">
                        <ArrowUpCircle className="w-3 h-3 mr-1.5 text-blue-500" />
                        Faltam <strong className="mx-1">{(nextStart - score).toLocaleString('pt-BR')}</strong> para o próximo nível
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-600 pt-2 border-t font-medium flex items-center">
                        <Shield className="w-3 h-3 mr-1.5" /> Nível Máximo!
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      },
      {
        id: "created_at",
        header: ({ column }) => <SortableHeader column={column} title="Cadastro" />,
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
              <EditButton recordItemId={id} hideText size="sm" />
              <div className="w-px h-4 bg-border mx-1" />
              {isDeleted ? (
                <RestoreButton recordItemId={id} hideText size="sm" />
              ) : (
                <DeleteButton recordItemId={id} hideText size="sm" />
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
    sorters: { initial: [{ field: "created_at", order: "desc" }] }
  });

  return (
    <ListView>
      <ListViewHeader title="Gestão de Usuários">
        <TableSearchInput placeholder="Buscar por nome ou email..." />
      </ListViewHeader>
      <DataTable table={table} />
    </ListView>
  );
}
