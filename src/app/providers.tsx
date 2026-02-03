"use client";

import { ThemeProvider } from "@/components/refine-ui/theme/theme-provider";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider from "@refinedev/nextjs-router/app";
import React from "react";

import "@/app/globals.css";
import { CustomSider } from "@/components/layout/CustomSider";
import { Layout } from "@/components/refine-ui/layout/layout";

import { Toaster } from "@/components/refine-ui/notification/toaster";
import { useNotificationProvider } from "@/components/refine-ui/notification/use-notification-provider";
import { authProviderClient } from "@providers/auth-provider/auth-provider.client";
import { dataProvider } from "@providers/data-provider";
import { useGetIdentity } from "@refinedev/core";
import { usePathname } from "next/navigation";

import {
  Camera,
  Coffee,
  Globe,
  Image as ImageIcon, // Renomeado para evitar conflito com 'next/image' se necessário
  LayoutDashboard,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Percent,
  Shapes,
  ShieldCheck,
  Sparkles,
  Users,
  Map,
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
          resources={[
            {
              name: "dashboard",
              list: "/",
              meta: { label: "Dashboard", icon: <LayoutDashboard size={16} /> },
            },
            {
              name: "reports",
              list: "/reports",
              show: "/reports/:id",
              meta: { label: "Denúncias", icon: <Megaphone size={16} /> },
            },
            {
              name: "profiles",
              list: "/profiles",
              create: "/profiles/create",
              edit: "/profiles/:id/edit",
              show: "/profiles/:id",
              meta: { label: "Observadores", icon: <Users size={16} /> },
            },
            {
              name: "services",
              list: "/services",
              create: "/services/create",
              edit: "/services/:id/edit",
              show: "/services/:id",
              meta: { label: "Serviços", icon: <Coffee size={16} /> },
            },
            {
              name: "categories",
              list: "/categories",
              create: "/categories/create",
              edit: "/categories/:id/edit",
              show: "/categories/:id",
              meta: { label: "Categorias", icon: <Shapes size={16} /> },
            },
            {
              name: "amenities",
              list: "/amenities",
              create: "/amenities/create",
              edit: "/amenities/:id/edit",
              show: "/amenities/:id",
              meta: { label: "Comodidades", icon: <Sparkles size={16} /> },
            },
            {
              name: "cities",
              list: "/cities", // Habilita a rota de listagem
              edit: "/cities/edit/:id", // Habilita a rota de edição da cidade (se houver)
              meta: {
                label: "Cidades",
                icon: <MapPin />, // Importe do lucide-react
              },
            },
            {
                name: "geografia",
                meta: {
                    label: "Geografia",
                    icon: <Map size={16} />,
                },
            },
            {
              name: "city_descriptions",
              list: "/city-descriptions",
              create: "/city-descriptions/create",
              edit: "/city-descriptions/:id",
              show: "/city-descriptions/:id",
              meta: {
                label: "Descrições de Cidades",
                icon: <MapPin size={16} />,
                parent: "geografia",
              },
            },
            {
              name: "city_images",
              list: "/city-images",
              meta: { label: "Imagens de Cidades", icon: <ImageIcon size={16} />, parent: "geografia" },
            },
            {
              name: "state_descriptions",
              list: "/state-descriptions",
              create: "/state-descriptions/create",
              edit: "/state-descriptions/:id",
              show: "/state-descriptions/:id",
              meta: {
                label: "Descrições de Estados",
                icon: <Globe size={16} />,
                parent: "geografia",
              },
            },
            {
              name: "service_offerings",
              list: "/service-offerings",
              create: "/service-offerings/create",
              edit: "/service-offerings/:id/edit",
              show: "/service-offerings/:id",
              meta: { label: "Ofertas de Serviço", icon: <Percent size={16} /> },
            },
            {
              name: "comments",
              list: "/comments",
              meta: { label: "Comentários", icon: <MessageSquare size={16} /> },
            },
            {
              name: "photos",
              list: "/photos",
              meta: { label: "Fotos", icon: <Camera size={16} /> },
            },
            {
              name: "service_ownership_claims",
              list: "/service-ownership-claims",
              show: "/service-ownership-claims/:id",
              meta: { label: "Reivindicações", icon: <ShieldCheck size={16} /> },
            },
            {
              name: "communications",
              list: "/communications",
              meta: { label: "Comunicados", icon: <Mail size={16} /> },
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
      Sider={(userRole === "master" || userRole === "admin") ? CustomSider : undefined}
    >
      {children}
    </Layout>
  );
};
