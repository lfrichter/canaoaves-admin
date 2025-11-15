"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader, // Import SidebarHeader
  useSidebar, // Import useSidebar to get the open state
} from "@/components/ui/sidebar";
import { useMenu } from "@refinedev/core";
import Link from "next/link";
import React from "react";
import { Logo } from "./Logo"; // Import Logo

export const CustomSider = () => {
  const { menuItems, selectedKey } = useMenu();
  const { open } = useSidebar(); // Get the open state from useSidebar

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader> {/* Re-introduce SidebarHeader */}
        <Logo showText={open} /> {/* Pass open state to showText prop */}
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
