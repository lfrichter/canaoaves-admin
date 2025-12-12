"use client";

import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { createBrowserClient } from "@supabase/ssr"; // Vamos usar direto da fonte
import {
  Globe,
  ImageIcon,
  LogOut,
  MapPin,
  Megaphone,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getPendingCounts } from "@/app/actions/dashboard";

const getInitials = (name?: string) => {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
};

const UserDropdown = () => {
  const { data: user } = useGetIdentity<{
    id: string;
    name: string;
    public_name?: string;
    email: string;
    avatar?: string;
  }>();

  // Estado para guardar dados diversos
  const [profileId, setProfileId] = useState<string | null>(null);
  const [pendingReports, setPendingReports] = useState(0);
  const [pendingClaims, setPendingClaims] = useState(0);
  const [pendingCityDesc, setPendingCityDesc] = useState(0);
  const [pendingCityImg, setPendingCityImg] = useState(0);
  const [pendingStateDesc, setPendingStateDesc] = useState(0);

  // Efeito para buscar todos os dados assíncronos
  useEffect(() => {
    if (!user?.id) return;

    const fetchInitialData = async () => {
      // 1. Busca ID do Perfil (pode continuar no cliente se desejado)
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileData?.id) {
        setProfileId(profileData.id);
      }

      // 2. Busca contagens via Server Action (para contornar RLS)
      const counts = await getPendingCounts();
      setPendingReports(counts.reports);
      setPendingClaims(counts.claims);
      setPendingCityDesc(counts.cityDescriptions);
      setPendingCityImg(counts.cityImages);
      setPendingStateDesc(counts.stateDescriptions);
    };

    fetchInitialData();
  }, [user?.id]);

  const { mutate: logout, isPending } = useLogout();

  const displayName = user?.public_name || user?.name || "Usuário";
  const profileLink = profileId ? `/profiles/${profileId}/edit` : "#";
  const showAdminLinks = pendingReports > 0 || pendingClaims > 0;
  const showContentLinks = pendingCityDesc > 0 || pendingCityImg > 0 || pendingStateDesc > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-9 w-9 rounded-full overflow-hidden border border-border hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar} alt={displayName} />
            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link
              href={profileLink}
              className={cn("flex items-center w-full", !profileId && "opacity-50")}
              onClick={(e) => !profileId && e.preventDefault()}
            >
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* Links de Moderação de Alertas */}
        {(showAdminLinks || showContentLinks) && <DropdownMenuSeparator />}

        {pendingReports > 0 && (
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/reports" className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Megaphone className="mr-2 h-4 w-4 text-destructive" />
                <span className="text-destructive">Denúncias</span>
              </div>
              <Badge variant="destructive">{pendingReports}</Badge>
            </Link>
          </DropdownMenuItem>
        )}

        {pendingClaims > 0 && (
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/service-ownership-claims" className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <ShieldCheck className="mr-2 h-4 w-4 text-amber-600" />
                <span>Reivindicações</span>
              </div>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">{pendingClaims}</Badge>
            </Link>
          </DropdownMenuItem>
        )}

        {/* Links de Moderação de Conteúdo */}
        {showContentLinks && (
          <>
            {pendingCityDesc > 0 && (
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/city-descriptions" className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Descrições</span>
                  </div>
                  <Badge variant="secondary">{pendingCityDesc}</Badge>
                </Link>
              </DropdownMenuItem>
            )}
            {pendingCityImg > 0 && (
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/city-images" className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <ImageIcon className="mr-2 h-4 w-4 text-purple-500" />
                    <span>Imagens</span>
                  </div>
                  <Badge variant="secondary">{pendingCityImg}</Badge>
                </Link>
              </DropdownMenuItem>
            )}
            {pendingStateDesc > 0 && (
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/state-descriptions" className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4 text-green-500" />
                    <span>Estados</span>
                  </div>
                  <Badge variant="secondary">{pendingStateDesc}</Badge>
                </Link>
              </DropdownMenuItem>
            )}
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
          onClick={() => logout()}
          disabled={isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isPending ? "Saindo..." : "Sair"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const DesktopCustomHeader = () => {
  const { data: user } = useGetIdentity<{ app_role: "admin" | "master" }>();
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-sidebar px-6">
      <div className="flex items-center gap-2">
        {(user?.app_role === "master" || user?.app_role === "admin") && <SidebarTrigger />}
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserDropdown />
      </div>
    </header>
  );
};

const MobileCustomHeader = () => {
  const { data: user } = useGetIdentity<{ app_role: "admin" | "master" }>();
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-sidebar px-4">
      <div className="flex items-center gap-2">
        {(user?.app_role === "master" || user?.app_role === "admin") && <SidebarTrigger />}
        <Logo showText={true} />
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserDropdown />
      </div>
    </header>
  );
};

export const CustomHeader = () => {
  const { isMobile } = useSidebar();
  return isMobile ? <MobileCustomHeader /> : <DesktopCustomHeader />;
};

CustomHeader.displayName = "CustomHeader";
