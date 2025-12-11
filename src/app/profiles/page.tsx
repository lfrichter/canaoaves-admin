"use client";

import { DeleteButton, EditButton, RestoreButton } from "@/components/refine-ui/buttons";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { TableSearchInput } from "@/components/refine-ui/data-table/table-search-input";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { ArrowUpCircle, ArrowUpDown, Calendar, Filter, Shield, ShieldAlert, Trophy, User } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

// 1. IMPORT DO HOOK RESPONSIVO
import { useIsMobile } from "@/hooks/use-mobile";

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

const getRoleBadge = (role: string) => {
  switch (role) {
    case "master":
      return <Badge className="border-transparent bg-slate-800 text-slate-100 hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-800 dark:hover:bg-slate-300"><ShieldAlert className="w-3 h-3 mr-1" /> Master</Badge>;
    case "admin":
      return <Badge className="border-transparent bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>;
    default:
      return <Badge variant="secondary" className="font-normal text-muted-foreground"><User className="w-3 h-3 mr-1" /> Usuário</Badge>;
  }
};

export default function ProfileList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsHook = useSearchParams();

  // 2. USO DO HOOK
  const isMobile = useIsMobile();

  const currentStatus = searchParamsHook.get("status") || "active";

  const columns = useMemo<ColumnDef<ProfileWithUser>[]>(
    () => {
      // Definição completa das colunas
      const allColumns: ColumnDef<ProfileWithUser>[] = [
        {
          id: "full_name",
          header: ({ column }) => <SortableHeader column={column} title="Usuário" />,
          accessorKey: "full_name",
          size: 250,
          cell: ({ row }) => {
            const profile = row.original;
            const isDeleted = !!profile.deleted_at;
            return (
              <div className={`flex items-center gap-3 ${isDeleted ? "opacity-60 grayscale" : ""}`}>
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                    {profile.full_name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-foreground flex items-center gap-2">
                    {profile.full_name || "Sem nome"}
                    {isDeleted && <Badge variant="destructive" className="h-4 px-1 text-[10px]">Excluído</Badge>}
                  </span>
                  <span className="text-xs text-muted-foreground">{profile.email}</span>
                </div>
              </div>
            );
          },
        },
        {
          id: "app_role",
          header: ({ column }) => <SortableHeader column={column} title="Permissão" />,
          accessorKey: "app_role",
          size: 70,
          cell: ({ getValue }) => getRoleBadge(getValue() as string)
        },
        {
          id: "score",
          header: ({ column }) => <SortableHeader column={column} title="Nível & Score" />,
          accessorKey: "score",
          size: 110,
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
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-0.5">
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
                  <TooltipContent className="p-3 bg-popover border shadow-xl">
                    <div className="space-y-2">
                      <p className="font-bold flex items-center text-sm text-popover-foreground">
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
          size: 70,
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
          size: 140, // Mantive o ajuste de 140 que fizemos anteriormente
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
      ];

      // 3. LÓGICA DE FILTRO MOBILE
      if (isMobile) {
        return allColumns.filter(col => col.id !== "created_at" && col.id !== "app_role");
      }

      return allColumns;
    },
    [isMobile] // Recalcula quando mudar o tamanho da tela
  );

  const table = useServerTable<ProfileWithUser>({
    resource: "profiles",
    columns: columns,
    searchParams: searchParams || {},
    initialPageSize: 20,
    sorters: { initial: [{ field: "created_at", order: "desc" }] },
    meta: {
      userStatus: currentStatus
    }
  });

  const handleStatusFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParamsHook.toString());
    params.set("current", "1");
    params.set("status", value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <ListView>
      <ListViewHeader title="Gestão de Usuários">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-end sm:items-center">
          <div className="w-full sm:w-[300px] relative">
            <TableSearchInput placeholder="Buscar por nome ou email..." />
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
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Ativos
                  </span>
                </SelectItem>
                <SelectItem value="deleted">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Excluídos
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
