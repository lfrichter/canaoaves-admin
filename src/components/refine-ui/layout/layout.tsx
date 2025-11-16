"use client";

import { CustomHeader } from "@/components/layout/CustomHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";

export function Layout({ children }: PropsWithChildren) {
  return (
    // <ThemeProvider>
      <SidebarProvider>
        <Sidebar />
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
              "pt-16"
            )}
          >
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    // </ThemeProvider>
  );
}

Layout.displayName = "Layout";
