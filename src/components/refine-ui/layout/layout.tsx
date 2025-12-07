// src/components/refine-ui/layout/layout.tsx

"use client";

import { CustomHeader } from "@/components/layout/CustomHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";
import React from "react"; // Importar React
export function Layout({ children, Sider }: PropsWithChildren<{ Sider?: React.FC }>) {

  return (
    <SidebarProvider>
      {/* Renderiza o Sider (Sidebar) SÓ se ele for passado como prop */}
      {Sider && <Sider />}

      <SidebarInset>
        <CustomHeader />
        <main
          className={cn(
            "@container/main",
            "container",
            "mx-auto",
            "relative",
            "w-full",
            "flex",
            "flex-col",
            "flex-1",
            "px-4",
            "pt-4"
          )}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

Layout.displayName = "Layout";
