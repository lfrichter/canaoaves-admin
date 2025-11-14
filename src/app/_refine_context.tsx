"use client";

import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import React from "react";

import routerProvider from "@refinedev/nextjs-router/app";

import "@/app/globals.css";
import { Toaster } from "@/components/refine-ui/notification/toaster";
import { useNotificationProvider } from "@/components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "@/components/refine-ui/theme/theme-provider";
import { authProviderClient } from "@providers/auth-provider/auth-provider.client";
import { dataProvider } from "@providers/data-provider";
import { Layout } from "@/components/refine-ui/layout/layout";

type RefineContextProps = {
  children: React.ReactNode;
};

export const RefineContext = ({ children }: RefineContextProps) => {
  const notificationProvider = useNotificationProvider();

  return (
    <RefineKbarProvider>
      <ThemeProvider>
        <Refine
          authProvider={authProviderClient}
          dataProvider={dataProvider}
          notificationProvider={notificationProvider}
          routerProvider={routerProvider}
          resources={[
            { name: "dashboard", list: "/", meta: { label: "Dashboard" } },
            { name: "profiles", list: "/profiles", meta: { label: "Perfis" } },
            { name: "services", list: "/services", meta: { label: "Serviços" } },
            { name: "categories", list: "/categories", meta: { label: "Categorias" } },
            { name: "amenities", list: "/amenities", meta: { label: "Comodidades" } },
            { name: "service_offerings", list: "/service-offerings", meta: { label: "Ofertas de Serviço" } },
            { name: "service_ownership_claims", list: "/service-ownership-claims", meta: { label: "Reivindicações" } },
            { name: "reports", list: "/reports", meta: { label: "Denúncias" } },
            { name: "city_descriptions", list: "/city-descriptions", meta: { label: "Descrições de Cidades" } },
            { name: "city_images", list: "/city-images", meta: { label: "Imagens de Cidades" } },
            { name: "state_descriptions", list: "/state-descriptions", meta: { label: "Descrições de Estados" } },
            { name: "static_content", list: "/static-content", meta: { label: "Conteúdo Estático" } },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
        >
          <Layout>
            {children}
          </Layout>
          <Toaster />
          <RefineKbar />
        </Refine>
      </ThemeProvider>
    </RefineKbarProvider>
  );
};
