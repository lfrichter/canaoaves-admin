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
    <Sidebar collapsible={(userRole === "master" || userRole === "admin") ? "icon" : undefined} className={cn(borderColorClass)}>
      <SidebarHeader>
        <Logo showText={open} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.key}>
              {/* CORREÇÃO:
                1. 'asChild' no botão faz ele repassar o estilo para o Link filho.
                2. O 'onClick' fica NO LINK. É ele quem recebe o clique real do usuário.
                3. Chamamos setOpenMobile(false) sempre. No desktop não faz mal, no mobile fecha o menu.
              */}
              <SidebarMenuButton
                asChild
                isActive={selectedKey === item.key}
                tooltip={item.label}
              >
                <Link
                  href={item.route || "/"}
                  onClick={() => setOpenMobile(false)}
                >
                  {item.icon}
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
