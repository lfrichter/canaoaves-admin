import { RefreshButton } from "@/app/_components/refresh-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Camera,
  Globe,
  ImageIcon,
  MapPin,
  MessageSquare,
  ShieldAlert,
  Users
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "./actions/dashboard";

// Garante que os dados estejam sempre frescos
export const revalidate = 0;

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  // Mapeamento das Tarefas de Moderação (Usando camelCase vindo do backend)
  const moderationItems = [
    {
      title: "Denúncias e Alertas",
      value: stats.pendingReports, // Corrigido: pendingReports
      icon: <ShieldAlert className={`h-6 w-6 ${stats.pendingReports > 0 ? "text-red-500" : "text-muted-foreground"}`} />,
      href: "/reports",
      description: "Comentários, fotos e perfis reportados",
      alert: stats.pendingReports > 0,
    },
    {
      title: "Reivindicações de Posse",
      value: stats.pendingClaims, // Corrigido: pendingClaims
      icon: <Building2 className="h-6 w-6 text-amber-500" />,
      href: "/service-ownership-claims",
      description: "Proprietários solicitando controle",
      alert: stats.pendingClaims > 0,
    },
    {
      title: "Descrições de Cidades",
      value: stats.pendingCityDescriptions, // Corrigido: pendingCityDescriptions
      icon: <MapPin className="h-6 w-6 text-blue-500" />,
      href: "/city-descriptions",
      description: "Conteúdo colaborativo pendente",
    },
    {
      title: "Imagens de Cidades",
      value: stats.pendingCityImages, // Corrigido: pendingCityImages
      icon: <ImageIcon className="h-6 w-6 text-purple-500" />,
      href: "/city-images",
      description: "Fotos de capa pendentes",
    },
    {
      title: "Descrições de Estados",
      value: stats.pendingStateDescriptions, // Corrigido: pendingStateDescriptions
      icon: <Globe className="h-6 w-6 text-green-500" />,
      href: "/state-descriptions",
      description: "Conteúdo estadual pendente",
    },
  ];

  // Mapeamento de Métricas Gerais
  const metricItems = [
    {
      title: "Usuários Ativos",
      value: stats.totalProfiles, // Corrigido: totalProfiles
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      href: "/profiles",
    },
    {
      title: "Serviços Publicados",
      value: stats.totalServices, // Corrigido: totalServices
      icon: <Building2 className="h-4 w-4 text-muted-foreground" />,
      href: "/services",
    },
    {
      title: "Total de Comentários",
      value: stats.totalComments, // Corrigido: totalComments
      icon: <MessageSquare className="h-4 w-4 text-muted-foreground" />,
      href: "/comments",
    },
    {
      title: "Fotos na Galeria",
      value: stats.totalPhotos, // Corrigido: totalPhotos
      icon: <Camera className="h-4 w-4 text-muted-foreground" />,
      href: "/photos",
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Cabeçalho */}
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
            <Link href={item.href} key={item.title}>
              <Card
                className={`
                  h-full transition-all duration-200 hover:shadow-md
                  ${item.alert ? "border-red-200 bg-red-50/50 hover:bg-red-50" : "hover:bg-muted/50"}
                `}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.title}
                  </CardTitle>
                  {item.icon}
                </CardHeader>
                <CardContent>
                  {/* Renderização segura do número */}
                  <div className={`text-2xl font-bold ${item.alert ? "text-red-700" : ""}`}>
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
            <Link href={item.href} key={item.title}>
              <Card className="hover:bg-muted/50 transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.title}
                  </CardTitle>
                  {item.icon}
                </CardHeader>
                <CardContent>
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
