import { getDashboardStats, DashboardStats } from "@/app/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshButton } from "./_components/refresh-button";

export default async function DashboardPage() {
  let stats: DashboardStats | null = null;
  let error: string | null = null;

  try {
    stats = await getDashboardStats();
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <RefreshButton />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Reivindicações Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_claims}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Denúncias Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_reports}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Descrições de Cidades Não Aprovadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unapproved_city_descriptions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Imagens de Cidades Não Aprovadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unapproved_city_images}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Descrições de Estados Não Aprovadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unapproved_state_descriptions}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}