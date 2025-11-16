"use client";

import { cn } from "@/lib/utils";
import { useGetIdentity, useMenu } from "@refinedev/core";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Logo } from "./Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export const CustomSider = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { data: user } = useGetIdentity<{
    app_role: "admin" | "master";
  }>();
  const { menuItems, selectedKey } = useMenu();
  const { open } = useSidebar();

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
    <Sidebar collapsible={userRole === "master" ? "icon" : undefined} className={cn(borderColorClass)}>
      <SidebarHeader>
        <Logo showText={open} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.key}>
              <Link href={item.route || "/"}>
                <SidebarMenuButton isActive={selectedKey === item.key}>
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
