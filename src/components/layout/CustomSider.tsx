"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useMenu } from "@refinedev/core";
import Link from "next/link";
import { Logo } from "./Logo";

export const CustomSider = () => {
  const { menuItems, selectedKey } = useMenu();
  return (
    <Sidebar collapsible="icon"> {/* Ensure collapsible="icon" */}
      <SidebarHeader>
        <Logo /> {/* Logo first */}
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
