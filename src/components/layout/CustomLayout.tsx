"use client";

import { SidebarProvider, SidebarInset, SidebarRail } from "@/components/ui/sidebar"; // Import SidebarRail
import React from "react";

export const CustomLayout: React.FC<
  React.PropsWithChildren<{ Sider?: React.FC; Header: React.FC }>
> = ({ Sider, Header, children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {Sider && <Sider />}
        {Sider && <SidebarRail />}
        <SidebarInset>
          <Header />
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
