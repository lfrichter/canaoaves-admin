"use client";

import { ThemeProvider } from "@/components/refine-ui/theme/theme-provider";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider from "@refinedev/nextjs-router/app";
import React from "react";

import "@/app/globals.css";
import { Layout } from "@/components/refine-ui/layout/layout";
import { Sidebar } from "@/components/refine-ui/layout/sidebar";
import { Toaster } from "@/components/refine-ui/notification/toaster";
import { useNotificationProvider } from "@/components/refine-ui/notification/use-notification-provider";
import { authProviderClient } from "@providers/auth-provider/auth-provider.client";
import { dataProvider } from "@providers/data-provider";
import { useGetIdentity } from "@refinedev/core";
import { usePathname } from "next/navigation";

// --- MUDANÇA 1: Importar os ícones do 'lucide-react' ---
import {
  Briefcase,
  ClipboardList,
  FileText,
  Image,
  Landmark,
  LayoutDashboard,
  MapPin,
  Percent,
  Shapes,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const notificationProvider = useNotificationProvider();

  return (
    <ThemeProvider>
      <RefineKbarProvider>
        <Refine
          authProvider={authProviderClient}
          dataProvider={dataProvider}
          notificationProvider={notificationProvider}
          routerProvider={routerProvider}
          // --- MUDANÇA 2: Adicionar a prop 'icon' em cada 'meta' ---
          resources={[
            {
              name: "dashboard",
              list: "/",
              meta: { label: "Dashboard", icon: <LayoutDashboard size={16} /> },
            },
            {
              name: "profiles",
              list: "/profiles",
              meta: { label: "Perfis", icon: <Users size={16} /> },
            },
            {
              name: "services",
              list: "/services",
              meta: { label: "Serviços", icon: <Briefcase size={16} /> },
            },
            {
              name: "categories",
              list: "/categories",
              create: "/categories/create", // <-- ADICIONADO
              edit: "/categories/:id/edit", // <-- ADICIONADO
              show: "/categories/:id", // <-- ADICIONADO
              meta: { label: "Categorias", icon: <Shapes size={16} /> },
            },
            {
              name: "amenities",
              list: "/amenities",
              meta: { label: "Comodidades", icon: <Sparkles size={16} /> },
            },
            {
              name: "service_offerings",
              list: "/service-offerings",
              meta: { label: "Ofertas de Serviço", icon: <Percent size={16} /> },
            },
            {
              name: "service_ownership_claims",
              list: "/service-ownership-claims",
              meta: { label: "Reivindicações", icon: <Landmark size={16} /> },
            },
            {
              name: "reports",
              list: "/reports",
              meta: { label: "Denúncias", icon: <ShieldAlert size={16} /> },
            },
            {
              name: "city_descriptions",
              list: "/city-descriptions",
              meta: {
                label: "Descrições de Cidades",
                icon: <FileText size={16} />,
              },
            },
            {
              name: "city_images",
              list: "/city-images",
              meta: { label: "Imagens de Cidades", icon: <Image size={16} /> },
            },
            {
              name: "state_descriptions",
              list: "/state-descriptions",
              meta: {
                label: "Descrições de Estados",
                icon: <MapPin size={16} />,
              },
            },
            {
              name: "static_content",
              list: "/static-content",
              meta: {
                label: "Conteúdo Estático",
                icon: <ClipboardList size={16} />,
              },
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
        >
          <AppLayout>
            {children}
          </AppLayout>

          <Toaster />
          <RefineKbar />
        </Refine>
      </RefineKbarProvider>
    </ThemeProvider>
  );
};

// Componente de Layout Lógico
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: user } = useGetIdentity<{ app_role: "admin" | "master" }>();
  const userRole = user?.app_role;

  const pathname = usePathname();
  const publicRoutes = ["/login", "/register", "/forgot-password"];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <Layout
      Sider={userRole === "master" ? Sidebar : undefined}
    >
      {children}
    </Layout>
  );
};
