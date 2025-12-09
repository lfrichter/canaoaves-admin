"use client";

import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

  // Estado simples para guardar o ID do perfil
  const [profileId, setProfileId] = useState<string | null>(null);

  // Efeito "Bala de Prata": Busca direta sem passar pelo Refine Data Provider
  useEffect(() => {
    const fetchProfileDirectly = async () => {
      if (!user?.id) return;

      try {
        // Cria cliente temporário apenas para essa busca (sem precisar de arquivos externos)
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Busca na tabela profiles onde user_id é igual ao do Auth
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data?.id) {
          console.log("Perfil encontrado via Direct Client:", data.id);
          setProfileId(data.id);
        } else {
          console.warn("Perfil não encontrado no banco:", error);
        }
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
      }
    };

    fetchProfileDirectly();
  }, [user?.id]);

  const { mutate: logout, isPending } = useLogout();

  const displayName = user?.public_name || user?.name || "Usuário";
  const profileLink = profileId ? `/profiles/${profileId}/edit` : "#";

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
              // Se não tiver ID, deixa opaco mas permite clicar (melhor que travar tudo)
              className={cn("flex items-center w-full", !profileId && "opacity-50")}
              onClick={(e) => !profileId && e.preventDefault()}
            >
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

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
