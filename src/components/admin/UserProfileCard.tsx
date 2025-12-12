// components/UserProfileCard.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  GAMIFICATION_COLORS,
  GAMIFICATION_ICONS,
  GAMIFICATION_LABELS,
  GAMIFICATION_LEVELS,
} from "@/lib/gamificationConstants";
import { getStatusDetails, normalizeStatusKey } from "@/lib/gamificationUtils";
import { ArrowUpCircle, Calendar, Shield, Trophy, User } from "lucide-react";

interface UserProfileCardProps {
  displayName: string | null;
  email?: string | null;
  phone?: string | null | undefined;
  avatarUrl?: string | null;
  profileScore: number | null;
  profileCategoryName: string | null;
  profileCategoryIcon?: string | null;
  createdAt?: string | Date;
  locationLabel?: string;
  variant?: "default" | "claim";
}

export function UserProfileCard({
  displayName,
  email,
  phone,
  avatarUrl,
  profileScore = 0,
  profileCategoryName = "Membro",
  profileCategoryIcon,
  createdAt,
  locationLabel,
  variant = "default",
}: UserProfileCardProps) {
  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString("pt-BR") : "-";

  // --- LÓGICA DE GAMIFICAÇÃO ---
  const score = Number(profileScore || 0);
  const { name: statusName, nextStart } = getStatusDetails(score, GAMIFICATION_LEVELS);

  // [CORREÇÃO] Adicionado fallback para string vazia
  const statusKey = normalizeStatusKey(statusName || "");

  const label = GAMIFICATION_LABELS[statusKey] || statusName;
  const gamificationIcon = GAMIFICATION_ICONS[statusKey] || '🏆';
  const color = GAMIFICATION_COLORS[statusKey] || '#64748b';

  const isCompact = variant === "claim";

  return (
    <div className="flex flex-wrap items-start gap-4 p-4 bg-muted/50 rounded-lg border transition-all hover:bg-muted/70">

      <Avatar className="h-12 w-12 border bg-white">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className="bg-muted text-muted-foreground font-bold">
          {displayName?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-1.5 min-w-0 flex-1">
        <h4 className="font-semibold leading-none text-base">
          {displayName || "Usuário Desconhecido"}
        </h4>

        {!isCompact && email && (
          <p className="text-sm text-muted-foreground">{email}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-1">
          <Badge
            variant="outline"
            className="bg-background/50 border-dashed font-normal text-muted-foreground"
          >
            {profileCategoryIcon ? (
              <span className="mr-1.5">{profileCategoryIcon}</span>
            ) : (
              <User className="w-3 h-3 mr-1.5 opacity-70" />
            )}
            {profileCategoryName}
          </Badge>

          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-start cursor-help">
                  <Badge
                    style={{
                      backgroundColor: `${color}15`,
                      color: color,
                      borderColor: `${color}30`
                    }}
                    className="font-bold border hover:bg-muted transition-colors pr-3"
                  >
                    <span className="mr-1.5 text-sm">{gamificationIcon}</span>
                    {label}
                  </Badge>

                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1 max-w-[100px]">
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
              <TooltipContent className="p-3 bg-popover border shadow-xl z-50">
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

        </div>
      </div>

      {!isCompact && (
        <div className="w-full md:w-auto md:ml-auto md:text-right text-left text-xs text-muted-foreground space-y-1 mt-2 md:mt-0 pl-0 md:pl-4 border-l-0 md:border-l border-transparent md:border-border/40">
          <p className="flex items-center md:justify-end gap-1.5">
            <Calendar className="w-3 h-3 opacity-70" />
            {formattedDate}
          </p>
          {locationLabel && (
            <p className="font-medium text-foreground">{locationLabel}</p>
          )}
          {phone && (
            <p>Fone: {phone}</p>
          )}
        </div>
      )}
    </div>
  );
}
