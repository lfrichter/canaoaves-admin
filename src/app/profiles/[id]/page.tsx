"use client";

import { useOne, useShow } from "@refinedev/core";
import { ArrowLeft, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProfileShow() {
  const router = useRouter();

  // 1. Busca os dados do Perfil
  const { query } = useShow({
    meta: {
      select: "*", // Garante que trazemos todos os campos
    },
  });
  const { data, isLoading } = query;
  const record = data?.data;

  // 2. Busca o nome da Categoria (baseado no ID do perfil)
  // O 'enabled' garante que só buscamos se o perfil já tiver carregado e tiver uma categoria
  const { data: categoryData, isLoading: isLoadingCategory } = useOne({
    resource: "categories",
    id: record?.category_id || "",
    queryOptions: {
      enabled: !!record?.category_id,
    },
  });
  const categoryName = categoryData?.data?.name;

  if (isLoading) {
    return <div className="p-6">Carregando detalhes do perfil...</div>;
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Cabeçalho com Botão Voltar e Editar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Detalhes do Perfil
            </h1>
            <p className="text-muted-foreground">
              Visualizando: {record?.full_name || "Sem nome"}
            </p>
          </div>
        </div>

        {/* Botão para ir direto para a edição */}
        <Button
          variant="outline"
          onClick={() => router.push(`/profiles/${record?.id}/edit`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="space-y-6">

        {/* SEÇÃO 1: Identificadores do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base uppercase text-muted-foreground">
              Identificadores do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem
              label="ID do Usuário (Auth)"
              value={record?.user_id}
            />
            <DetailItem
              label="Número de Registro"
              value={record?.registration_number}
            />
            <DetailItem
              label="Pontuação (Score)"
              value={record?.score}
              className="text-blue-600 font-bold"
            />
          </CardContent>
        </Card>

        {/* SEÇÃO 2: Permissões */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-base uppercase text-red-700">
              Permissões de Acesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DetailItem
              label="App Role"
              value={record?.app_role}
              className="uppercase font-bold tracking-wider"
            />
          </CardContent>
        </Card>

        {/* SEÇÃO 3: Dados Cadastrais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base uppercase text-muted-foreground">
              Dados Cadastrais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem label="Nome Completo" value={record?.full_name} />
              <DetailItem label="Identidade Pública (Apelido)" value={record?.public_name} />
              <DetailItem label="Documento (CPF/CNPJ)" value={record?.document} />
              {/* <DetailItem
                label="Categoria"
                value={isLoadingCategory ? "Carregando..." : categoryName}
              /> */}
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Descrição / Biografia</h4>
              <div className="p-4 bg-slate-50 rounded-md border text-sm text-slate-800 whitespace-pre-wrap">
                {record?.description || "Nenhuma descrição informada."}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// Componente auxiliar para exibir cada item (Label + Valor)
function DetailItem({
  label,
  value,
  isMono = false,
  className = ""
}: {
  label: string;
  value: string | number | undefined | null;
  isMono?: boolean;
  className?: string;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      <div className={`text-sm ${isMono ? "font-mono bg-slate-100 p-1 rounded inline-block" : ""} ${className}`}>
        {value || <span className="text-gray-400 italic">Não informado</span>}
      </div>
    </div>
  );
}
