import { RefreshButton } from "@/app/_components/refresh-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Camera,
  Coffee,
  Globe,
  ImageIcon,
  MapPin,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Users
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "./actions/dashboard";

export const revalidate = 0;

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const moderationItems = [
    {
      title: "Denúncias e Alertas",
      value: stats.pendingReports,
      // Ícone ajustado para brilhar um pouco mais no dark mode se necessário
      icon: <ShieldAlert className={`h-6 w-6 ${stats.pendingReports > 0 ? "text-red-500 dark:text-red-400" : "text-muted-foreground"}`} />,
      href: "/reports",
      description: "Comentários, fotos e observadores reportados",
      alert: stats.pendingReports > 0,
    },
    {
      title: "Reivindicações",
      value: stats.pendingClaims,
      icon: <ShieldCheck className="h-6 w-6 text-amber-500" />,
      href: "/service-ownership-claims",
      description: "Proprietários solicitando controle",
      alert: stats.pendingClaims > 0,
    },
    {
      title: "Descrições de Cidades",
      value: stats.pendingCityDescriptions,
      icon: <MapPin className="h-6 w-6 text-blue-500" />,
      href: "/city-descriptions",
      description: "Conteúdo colaborativo pendente",
    },
    {
      title: "Imagens de Cidades",
      value: stats.pendingCityImages,
      icon: <ImageIcon className="h-6 w-6 text-purple-500" />,
      href: "/city-images",
      description: "Fotos de capa pendentes",
    },
    {
      title: "Descrições de Estados",
      value: stats.pendingStateDescriptions,
      icon: <Globe className="h-6 w-6 text-green-500" />,
      href: "/state-descriptions",
      description: "Conteúdo estadual pendente",
    },
  ];

  const metricItems = [
    {
      title: "Observadores Ativos",
      value: stats.totalProfiles,
      icon: <Users className="h-6 w-6 text-muted-foreground" />,
      href: "/profiles",
    },
    {
      title: "Serviços Publicados",
      value: stats.totalServices,
      icon: <Coffee className="h-6 w-6 text-muted-foreground" />,
      href: "/services",
    },
    {
      title: "Total de Comentários",
      value: stats.totalComments,
      icon: <MessageSquare className="h-6 w-6 text-muted-foreground" />,
      href: "/comments",
    },
    {
      title: "Fotos na Galeria",
      value: stats.totalPhotos,
      icon: <Camera className="h-6 w-6 text-muted-foreground" />,
      href: "/photos",
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral e tarefas pendentes.</p>
        </div>
        <RefreshButton />
      </div>

      {/* Seção 1: Fila de Moderação */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Fila de Moderação</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {moderationItems.map((item) => (
            <Link href={item.href} key={item.title} className="h-full">
              <Card
                className={`
                  flex flex-col h-full transition-all duration-200 hover:shadow-md
                  ${item.alert
                    // [CORREÇÃO DARK MODE]
                    // Light: Fundo vermelho claro, borda vermelha clara.
                    // Dark: Fundo vermelho escuro (10% opacidade), borda vermelha escura.
                    ? "border-red-200 bg-red-50/50 hover:bg-red-50 dark:bg-red-900/10 dark:border-red-900/50 dark:hover:bg-red-900/20"
                    : "hover:bg-muted/50"
                  }
                `}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 gap-3">
                  <CardTitle className="text-sm font-medium leading-tight">
                    {item.title}
                  </CardTitle>
                  <div className="shrink-0">
                    {item.icon}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 justify-end">
                  <div className={`
                    text-2xl font-bold
                    ${item.alert ? "text-red-700 dark:text-red-400" : ""}
                  `}>
                    {(item.value ?? 0).toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Seção 2: Métricas da Plataforma */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Métricas da Plataforma</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metricItems.map((item) => (
            <Link href={item.href} key={item.title} className="h-full">
              <Card className="flex flex-col h-full hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 gap-3">
                  <CardTitle className="text-sm font-medium leading-tight">
                    {item.title}
                  </CardTitle>
                  <div className="shrink-0">
                    {item.icon}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 justify-end">
                  <div className="text-2xl font-bold">
                    {(item.value ?? 0).toLocaleString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
