"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useGetIdentity, useMenu } from "@refinedev/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

export const CustomSider = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { data: user } = useGetIdentity<{
    app_role: "admin" | "master";
  }>();
  const { menuItems, selectedKey } = useMenu();

  const { open, setOpenMobile } = useSidebar();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userRole = user?.app_role;

  const borderColorClass =
    isMounted && userRole === "master"
      ? "border-r-4 border-yellow-500"
      : isMounted && userRole === "admin"
        ? "border-r-4 border-gray-400"
        : "";

  return (
    <Sidebar
      collapsible={(userRole === "master" || userRole === "admin") ? "icon" : undefined}
      className={cn(borderColorClass)}
    >
      {/* [CORREÇÃO CRÍTICA]:
          - Se aberto: 'pl-3' para alinhar à esquerda junto com os itens.
          - Se fechado: 'justify-center px-0' para centralizar exato e remover padding que empurrava o logo.
      */}
      <SidebarHeader className={cn(
        "flex items-center py-4 transition-all",
        open ? "pl-3 justify-start" : "justify-center px-0"
      )}>
        <Logo showText={open} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.key}>
              <SidebarMenuButton
                asChild
                isActive={selectedKey === item.key}
                tooltip={item.label}
              >
                {/* [CORREÇÃO ÍCONES]:
                    - !open: Adicionado 'justify-center' E 'p-0'.
                    Muitas vezes o padding padrão do botão atrapalha a centralização do ícone sozinho.
                */}
                <Link
                  href={item.route || "/"}
                  onClick={() => setOpenMobile(false)}
                  className={cn(
                    "flex items-center gap-2 w-full",
                    !open && "justify-center ml-2"
                  )}
                >
                  {item.icon}
                  {/* Renderizamos o span apenas se aberto para garantir que não ocupe espaço fantasma */}
                  {open && <span>{item.label}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
