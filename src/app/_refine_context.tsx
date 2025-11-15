"use client";

import { CustomHeader } from "@/components/layout/CustomHeader";
import { CustomLayout } from "@/components/layout/CustomLayout";
import { CustomSider } from "@/components/layout/CustomSider";
import { Toaster } from "@/components/ui/sonner";
import { authProviderClient } from "@/providers/auth-provider/auth-provider.client";
import { dataProvider } from "@/providers/data-provider";
import { DevtoolsProvider } from "@/providers/devtools";
import { Refine, RefineProps } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import {
  BarChart2,
  File,
  FileText,
  Home,
  Store,
  User,
  LayoutDashboard, // Added
  Users, // Added
  Briefcase, // Added
  Shapes, // Added
  Sparkles, // Added
  Percent, // Added
  Landmark, // Added
  ShieldAlert, // Added
  Map, // Added
  Image, // Added
  MapPin, // Added
  ClipboardList, // Added
} from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

export function RefineContext({
  children,
  ...props
}: {
  children: React.ReactNode;
} & RefineProps) {
  const pathname = usePathname();
  const authPaths = ["/login", "/register", "/forgot-password"];
  const isAuthPage = authPaths.includes(pathname);

  const Layout = isAuthPage
    ? ({ children }: { children: React.ReactNode }) => <>{children}</>
    : CustomLayout;

  return (
    <DevtoolsProvider>
      <Refine
        routerProvider={routerProvider}
        dataProvider={dataProvider}
        authProvider={authProviderClient}
        resources={[
          {
            name: "dashboard",
            list: "/dashboard",
            meta: { label: "Dashboard", icon: <LayoutDashboard size={16} /> }, // Updated
          },
          {
            name: "profiles",
            list: "/profiles",
            show: "/profiles/:id",
            edit: "/profiles/:id/edit",
            meta: { label: "Perfis", icon: <Users size={16} /> }, // Updated
          },
          {
            name: "services",
            list: "/services",
            create: "/services/create",
            show: "/services/:id",
            edit: "/services/:id/edit",
            meta: { label: "Serviços", icon: <Briefcase size={16} /> }, // Updated
          },
          {
            name: "categories",
            list: "/categories",
            create: "/categories/create",
            show: "/categories/:id",
            edit: "/categories/:id/edit",
            meta: { label: "Categorias", icon: <Shapes size={16} /> }, // Updated
          },
          {
            name: "amenities",
            list: "/amenities",
            create: "/amenities/create",
            show: "/amenities/:id",
            edit: "/amenities/:id/edit",
            meta: { label: "Comodidades", icon: <Sparkles size={16} /> }, // Updated
          },
          {
            name: "service-offerings",
            list: "/service-offerings",
            create: "/service-offerings/create",
            show: "/service-offerings/:id",
            edit: "/service-offerings/:id/edit",
            meta: { label: "Ofertas de Serviço", icon: <Percent size={16} /> }, // Updated
          },
          {
            name: "service-ownership-claims",
            list: "/service-ownership-claims",
            meta: { label: "Reivindicações", icon: <Landmark size={16} /> }, // Updated
          },
          {
            name: "reports",
            list: "/reports",
            meta: { label: "Denúncias", icon: <ShieldAlert size={16} /> }, // Updated
          },
          {
            name: "city-descriptions",
            list: "/city-descriptions",
            meta: {
              label: "Descrições de Cidades",
              icon: <FileText size={16} />,
            }, // Updated
          },
          {
            name: "city-images",
            list: "/city-images",
            meta: { label: "Imagens de Cidades", icon: <Image size={16} /> }, // Updated
          },
          {
            name: "state-descriptions",
            list: "/state-descriptions",
            meta: {
              label: "Descrições de Estados",
              icon: <MapPin size={16} />,
            }, // Updated
          },
          {
            name: "static-content",
            list: "/static-content",
            edit: "/static-content/:id/edit",
            meta: {
              label: "Conteúdo Estático",
              icon: <ClipboardList size={16} />,
            }, // Updated
          },
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
        }}
        {...props}
      >
        <Layout Header={CustomHeader} Sider={CustomSider}>
          {children}
        </Layout>
      </Refine>
      <Toaster />
    </DevtoolsProvider>
  );
}

