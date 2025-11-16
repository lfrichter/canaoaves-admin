import { RefreshButton } from "@/app/_components/refresh-button";
import { getDashboardStats } from "@/app/actions/dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Globe,
  ImageIcon,
  MapPin,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";

// --- MUDANÇA AQUI ---
// Força o Next.js a nunca cachear esta página.
// Ela será re-renderizada no servidor a cada visita.
export const revalidate = 0;
// --- FIM DA MUDANÇA ---

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statItems = [
    // ... (resto do seu código)
    {
      title: "Reivindicações Pendentes",
      value: stats.pendingClaims,
      icon: <Building2 className="h-6 w-6 text-muted-foreground" />,
      href: "/service-ownership-claims",
    },
    {
      title: "Denúncias Pendentes",
      value: stats.pendingReports,
      icon: <ShieldAlert className="h-6 w-6 text-muted-foreground" />,
      href: "/reports",
    },
    {
      title: "Descrições de Cidades",
      value: stats.pendingCityDescriptions,
      icon: <MapPin className="h-6 w-6 text-muted-foreground" />,
      href: "/city-descriptions",
    },
    {
      title: "Imagens de Cidades",
      value: stats.pendingCityImages,
      icon: <ImageIcon className="h-6 w-6 text-muted-foreground" />,
      href: "/city-images",
    },
    {
      title: "Descrições de Estados",
      value: stats.pendingStateDescriptions,
      icon: <Globe className="h-6 w-6 text-muted-foreground" />,
      href: "/state-descriptions",
    },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Visão Geral da Moderação
        </h1>
        <RefreshButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statItems.map((item) => (
          <Link href={item.href} key={item.title}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                {item.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground">
                  Itens aguardando revisão
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
