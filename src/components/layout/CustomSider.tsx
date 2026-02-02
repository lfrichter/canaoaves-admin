"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useGetIdentity, useMenu } from "@refinedev/core";
import { ChevronRight } from "lucide-react";
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

  // Helper recursivo para renderizar itens de menu
  const renderMenuItem = (item: any, isSub = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isLink = !!item.route;

    // Caso 1: Item com Filhos (Grupo/Acordeão)
    if (hasChildren) {
      return (
        <Collapsible
          key={item.key}
          asChild
          defaultOpen={false}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={item.label}>
                {!isSub && item.icon}
                <span>{item.label}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.children.map((child: any) => renderMenuItem(child, true))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    // Caso 2: Item sem rota (Título estático, caso não tenha filhos)
    if (!isLink) {
      return (
        <SidebarMenuItem key={item.key}>
          <SidebarMenuButton tooltip={item.label} className="cursor-default hover:bg-transparent">
            {!isSub && item.icon}
            <span>{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    // Caso 3: Sub-item (Link dentro de grupo)
    if (isSub) {
      return (
        <SidebarMenuSubItem key={item.key}>
          <SidebarMenuSubButton asChild isActive={selectedKey === item.key}>
            <Link href={item.route} onClick={() => setOpenMobile(false)}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      );
    }

    // Caso 4: Item Top-Level Normal (Link direto)
    return (
      <SidebarMenuItem key={item.key}>
        <SidebarMenuButton
          asChild
          isActive={selectedKey === item.key}
          tooltip={item.label}
        >
          <Link
            href={item.route}
            onClick={() => setOpenMobile(false)}
            className={cn(
              "flex items-center gap-2 w-full",
              !open && "justify-center ml-2"
            )}
          >
            {item.icon}
            {open && <span>{item.label}</span>}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      collapsible={(userRole === "master" || userRole === "admin") ? "icon" : undefined}
      className={cn(borderColorClass)}
    >
      <SidebarHeader className={cn(
        "flex items-center py-4 transition-all",
        open ? "pl-3 justify-start" : "justify-center px-0"
      )}>
        <Logo showText={open} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => renderMenuItem(item))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
