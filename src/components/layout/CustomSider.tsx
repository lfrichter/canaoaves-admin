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
import { useGetIdentity, useMenu } from "@refinedev/core";
import Link from "next/link";
import React from "react";
import { Logo } from "./Logo";

export const CustomSider = () => {
  const { data: user } = useGetIdentity<{
    id: string;
    user_metadata: {
      app_role: "admin" | "master";
    };
  }>();
  const { menuItems, selectedKey } = useMenu();
  const { open } = useSidebar();

  const userRole = user?.user_metadata?.app_role;

  const filteredMenuItems =
    userRole === "admin"
      ? menuItems.filter((item) => item.key === "dashboard")
      : menuItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Logo showText={open} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredMenuItems.map((item) => (
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
