"use client";

import { CustomHeader } from "@/components/layout/CustomHeader";
import { CustomLayout } from "@/components/layout/CustomLayout";
import { CustomSider } from "@/components/layout/CustomSider";
import { useNotificationProvider } from "@/components/refine-ui/notification/use-notification-provider";
import { Toaster } from "@/components/ui/sonner";
import { authProviderClient } from "@/providers/auth-provider/auth-provider.client";
import { dataProvider } from "@/providers/data-provider";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider from "@refinedev/nextjs-router";
import {
  Briefcase,
  Camera,
  ClipboardList,
  FileText,
  Image,
  Landmark,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Percent,
  Shapes,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

type RefineContextProps = {
  children: React.ReactNode;
};

// --- CONTROLLER DO LAYOUT (ESSENCIAL PARA O MENU APARECER) ---
const LayoutController = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const authPaths = ["/login", "/register", "/forgot-password"];
  const isAuthPage = authPaths.includes(pathname);

  // Se for página de login, não mostra menu nem topo
  if (isAuthPage) {
    return <>{children}</>;
  }

  // [CORREÇÃO] Removi a lógica que escondia o menu para "admin".
  // Agora Admin e Master veem o Layout Completo (Topo + Lateral).
  return (
    <CustomLayout Header={CustomHeader} Sider={CustomSider}>
      {children}
    </CustomLayout>
  );
};

export const RefineContext = ({ children, ...props }: RefineContextProps) => {
  const notificationProvider = useNotificationProvider();

  return (
    <RefineKbarProvider>
      <Refine
        routerProvider={routerProvider}
        dataProvider={dataProvider}
        authProvider={authProviderClient}
        notificationProvider={notificationProvider}
        resources={[
          {
            name: "dashboard",
            list: "/dashboard",
            meta: { label: "Dashboard", icon: <LayoutDashboard size={16} /> },
          },
          {
            name: "profiles",
            list: "/profiles",
            show: "/profiles/:id",
            edit: "/profiles/:id/edit",
            meta: { label: "Observadores", icon: <Users size={16} /> },
          },
          {
            name: "services",
            list: "/services",
            create: "/services/create",
            show: "/services/:id",
            edit: "/services/:id/edit",
            meta: { label: "Serviços", icon: <Briefcase size={16} /> },
          },
          {
            name: "categories",
            list: "/categories",
            create: "/categories/create",
            show: "/categories/:id",
            edit: "/categories/:id/edit",
            meta: { label: "Categorias", icon: <Shapes size={16} /> },
          },
          {
            name: "amenities",
            list: "/amenities",
            create: "/amenities/create",
            show: "/amenities/:id",
            edit: "/amenities/:id/edit",
            meta: { label: "Comodidades", icon: <Sparkles size={16} /> },
          },
          {
            name: "service-offerings",
            list: "/service-offerings",
            create: "/service-offerings/create",
            show: "/service-offerings/:id",
            edit: "/service-offerings/:id/edit",
            meta: { label: "Ofertas de Serviço", icon: <Percent size={16} /> },
          },
          {
            name: "service-ownership-claims",
            list: "/service-ownership-claims",
            meta: { label: "Reivindicações", icon: <Landmark size={16} /> },
          },
          {
            name: "reports",
            list: "/reports",
            meta: { label: "Denúncias", icon: <ShieldAlert size={16} /> },
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
            name: "city-descriptions",
            list: "/city-descriptions",
            meta: {
              label: "Descrições de Cidades",
              icon: <FileText size={16} />,
            },
          },
          {
            name: "city-images",
            list: "/city-images",
            // eslint-disable-next-line jsx-a11y/alt-text
            meta: { label: "Imagens de Cidades", icon: <Image size={16} /> },
          },
          {
            name: "state-descriptions",
            list: "/state-descriptions",
            meta: {
              label: "Descrições de Estados",
              icon: <MapPin size={16} />,
            },
          },
          {
            name: "static-content",
            list: "/static-content",
            edit: "/static-content/:id/edit",
            meta: {
              label: "Conteúdo Estático",
              icon: <ClipboardList size={16} />,
            },
          }
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
        }}
        {...props}
      >
        {/* REINSERIDO: O LayoutController envolve o app e renderiza o Menu/Topo */}
        <LayoutController>
          {children}
        </LayoutController>

        <Toaster />
        <RefineKbar />
      </Refine>
    </RefineKbarProvider>
  );
}
