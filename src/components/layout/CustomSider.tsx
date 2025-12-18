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

  // Pegamos setOpenMobile para fechar o menu no celular
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
      {/* [CORREÇÃO 1]: Removido 'justify-center'.
        Adicionado 'pl-3' para alinhar à esquerda, na mesma linha visual dos ícones.
      */}
      <SidebarHeader className="flex items-center py-4 pl-3">
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
                {/* [CORREÇÃO 2]: Adicionado lógica (!open && "justify-center")
                   Isso força o ícone a centralizar PERFEITAMENTE quando a sidebar fecha.
                */}
                <Link
                  href={item.route || "/"}
                  onClick={() => setOpenMobile(false)}
                  className={cn(
                    "flex items-center gap-2 w-full",
                    !open && "justify-center px-0"
                  )}
                >
                  {item.icon}
                  {/* O span é ocultado automaticamente pelo CSS do Sidebar group-data-[collapsible=icon] */}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
