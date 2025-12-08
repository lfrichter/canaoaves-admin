"use client";

import { DeleteButton } from "@/components/refine-ui/buttons";
import { EditView, EditViewHeader } from "@/components/refine-ui/views/edit-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Authenticated } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import {
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle2,
  ExternalLink,
  Globe,
  Layers,
  Loader2,
  Mail,
  Map as MapIcon,
  Phone,
  Target,
  User
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

// --- 1. COMPONENTE PAI (WRAPPER) ---
// Apenas renderiza o formulário dentro do contexto de autenticação.
export default function ServiceEdit() {
  return (
    <Authenticated key="service-edit-page" v3LegacyAuthProviderCompatible={false}>
      <ServiceEditForm />
    </Authenticated>
  );
}

// --- 2. FORMULÁRIO REAL (AGORA AUTÔNOMO) ---
function ServiceEditForm() {
  const params = useParams();
  const id = params?.id as string;

  // A guarda de rota e validação do ID agora vivem aqui.
  // Se não houver ID, o formulário nem tenta ser renderizado.
  if (!id || id === "undefined") {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const {
    refineCore: { query, onFinish },
    saveButtonProps,
    ...form
  } = useForm({
    refineCoreProps: {
      resource: "services",
      action: "edit",
      id: id,
      queryOptions: {
        // Esta guarda é uma segurança extra, mas a verificação acima é a principal.
        enabled: !!id,
      },
    },
  });

  const record = query?.data?.data;
  const isLoadingRecord = query?.isLoading;

  // Sincroniza o formulário com os dados do backend quando eles chegam
  useEffect(() => {
    if (record) {
      form.reset(record);
    }
  }, [record, form.reset]);

  // A view agora nos dá essa informação diretamente.
  const isIndication = record?.created_by_user_id && (record?.owner_user_id !== record?.created_by_user_id);


  if (isLoadingRecord) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Carregando serviço...</p>
      </div>
    );
  }

  // Se terminou de carregar e não tem record, aí sim é 404
  if (!record) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-muted-foreground">Serviço não encontrado</h2>
        <p className="text-sm text-muted-foreground">Verifique se o ID está correto ou se foi excluído.</p>
      </div>
    )
  }

  return (
    <EditView>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        <EditViewHeader title={`Gerenciar: ${record.name || "Serviço"}`} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* --- ESQUERDA: FORMULÁRIO --- */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados Principais</CardTitle>
                <CardDescription>Informações públicas editáveis.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onFinish)} className="grid gap-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              // Isso garante que o select atualize visualmente quando os dados chegarem
                              key={record.status}
                              value={field.value}
                              defaultValue={record.status}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">
                                  <span className="flex items-center text-muted-foreground"><AlertCircle className="w-3 h-3 mr-2" /> Rascunho</span>
                                </SelectItem>
                                <SelectItem value="published">
                                  <span className="flex items-center text-green-600"><CheckCircle2 className="w-3 h-3 mr-2" /> Publicado</span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Slug (URL)</label>
                        <div className="h-10 px-3 py-2 rounded-md border bg-muted text-sm text-muted-foreground truncate flex items-center select-all">
                          {record.slug || "..."}
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Oficial</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do serviço" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descrição completa..."
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between items-center pt-4 border-t mt-4">
                      <DeleteButton
                        recordItemId={id}
                        resource="services"
                        confirmTitle="Excluir Serviço?"
                        confirmOkText="Sim, excluir"
                      />
                      <Button type="submit" size="lg">
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                      </Button>
                    </div>

                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* --- DIREITA: METADADOS --- */}
          <div className="space-y-6">

            {/* CARD 1: ORIGEM */}
            <Card className="bg-slate-50 border-slate-200 shadow-sm">
              <CardHeader className="pb-0 pt-0">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" /> Propriedade e Origem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">

                {/* DONO */}
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Dono Atual</span>
                  <div className="flex items-center gap-3 mt-1.5 p-2 bg-white rounded border shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border overflow-hidden relative">
                      {record.owner_avatar_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={record.owner_avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="overflow-hidden w-full">
                        <>
                          <p className="font-medium truncate text-slate-900">
                            {record.owner_full_name || record.owner_public_name || "Sem Dono (Sistema)"}
                          </p>
                          {record.owner_app_role && <Badge variant="outline" className="mt-1">{record.owner_app_role}</Badge>}
                          <p className="text-[10px] text-muted-foreground truncate mt-1">{record.owner_email || "-"}</p>
                        </>
                    </div>
                  </div>
                </div>

                {/* QUEM INDICOU */}
                {isIndication && (
                  <div className="relative">
                    <div className="absolute left-5 -top-4 bottom-4 w-px bg-slate-200 -z-10"></div>

                    <span className="text-[10px] uppercase text-blue-600 font-semibold flex items-center gap-1 bg-slate-50 w-fit pr-2">
                      <AlertCircle className="w-3 h-3" /> Cadastrado por (Indicação)
                    </span>

                    <div className="mt-2 ml-2">
                      {record.creator_full_name ? (
                        <div className="p-3 bg-blue-50/50 rounded border border-blue-100 border-dashed relative">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-blue-200 overflow-hidden">
                              {record.creator_avatar_url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={record.creator_avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-blue-300" />
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <span className="font-medium text-xs text-blue-900 block truncate">
                                {record.creator_full_name || record.creator_public_name}
                              </span>
                              {record.creator_app_role && <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-800 border-blue-200">{record.creator_app_role}</Badge>}
                              <span className="text-[10px] text-slate-500 flex items-center mt-1">
                                <Calendar className="w-3 h-3 mr-1" />
                                {record?.created_at ? new Date(record.created_at).toLocaleDateString('pt-BR') : '-'}
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full h-7 text-xs bg-white hover:text-blue-600" asChild>
                            <Link href={`/profiles/${record.created_by_user_id}`} target="_blank">
                              Ver Observador Público <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground block p-2 border border-dashed rounded">
                          Usuário desconhecido (ID: {record?.created_by_user_id})
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center px-1">
                  <span className="text-muted-foreground text-xs">Autenticado?</span>
                  {record?.is_authenticated ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Sim</Badge>
                  ) : <Badge variant="outline">Não</Badge>}
                </div>
              </CardContent>
            </Card>

            {/* CARD 2: DETALHES */}
            <Card>
              <CardHeader className="pb-0 pt-0">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Detalhes do Serviço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">

                {/* FOTO */}
                {record?.featured_photo_url && (
                  <div className="aspect-square relative rounded-md overflow-hidden bg-slate-100 border group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={record.featured_photo_url} alt="Capa" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center shadow-sm">
                      <Camera className="w-3 h-3 mr-1" /> Capa
                    </div>
                  </div>
                )}

                {/* CATEGORIA E LOCAL */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-2 rounded border">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold">Categoria</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg">{record.category_icon || "📂"}</span>
                      <span className="text-xs font-medium leading-tight">
                        {record.category_name || <span className="text-muted-foreground opacity-50">...</span>}
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-2 rounded border">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold">Cidade</span>
                    <div className="flex items-center gap-1.5 mt-1 text-xs">
                      <MapIcon className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium truncate">
                        {record.city_name ? `${record.city_name} - ${record.city_state}` : <span className="text-muted-foreground opacity-50">...</span>}
                      </span>
                    </div>
                  </div>
                </div>


                {/* MISSÃO */}
                {record?.mission && (
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-1 mb-1">
                      <Target className="w-3 h-3" /> Missão
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed italic bg-yellow-50/50 p-2 rounded border border-yellow-100 text-yellow-800">
                      "{record.mission}"
                    </p>
                  </div>
                )}

                {/* ÁREAS (Com verificação de vazio) */}
                {(() => {
                  // Limpa a string do Postgres e cria o array
                  const areas = String(record?.areas_of_operation || "")
                    .replace(/[{}"\\]/g, '')
                    .split(',')
                    .map((a) => a.trim())
                    .filter(Boolean); // Remove itens vazios

                  // Se o array estiver vazio, não renderiza nada (nem o título)
                  if (areas.length === 0) return null;

                  return (
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground font-bold mb-1.5 block">
                        Áreas de Atuação
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {areas.map((area, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] px-2 h-5 border-slate-200">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <Separator />

                {/* CONTATOS */}
                <div className="space-y-2">
                  {record?.website_url && (
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                      <Link href={record.website_url} target="_blank" className="text-blue-600 hover:underline text-xs truncate">
                        {record.website_url}
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="text-xs truncate">{record?.email || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="text-xs">{record?.phone || "-"}</span>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </EditView>
  );
}

