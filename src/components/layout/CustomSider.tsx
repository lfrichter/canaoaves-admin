"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger, // Import SidebarTrigger
} from "@/components/ui/sidebar";
import { useMenu } from "@refinedev/core";
import Link from "next/link";
import { Logo } from "./Logo";
import React from "react";

export const CustomSider = () => {
  const { menuItems, selectedKey } = useMenu();
  console.log("CustomSider menuItems:", menuItems); // Added console.log
  return (
    <Sidebar>
      <SidebarHeader>
        <Logo /> {/* Logo first */}
        <SidebarTrigger /> {/* Then SidebarTrigger */}
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
