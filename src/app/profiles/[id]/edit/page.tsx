"use client";

import { DeleteButton } from "@/components/refine-ui/buttons";
import { EditView, EditViewHeader } from "@/components/refine-ui/views/edit-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Authenticated, useSelect, useUpdate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import {
  ArrowUpCircle,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Hash, Heart,
  Loader2,
  Mail, MapPin,
  MessageCircle,
  MessageSquare,
  SaveIcon,
  Shield, Trophy
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
// [1] Importe useEffect
import { useEffect } from "react";

import {
  GAMIFICATION_COLORS,
  GAMIFICATION_ICONS,
  GAMIFICATION_LABELS,
  GAMIFICATION_LEVELS
} from "@/lib/gamificationConstants";
import { getStatusDetails, normalizeStatusKey } from "@/lib/gamificationUtils";

export default function ProfileEdit() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Authenticated key="profile-edit-page" v3LegacyAuthProviderCompatible={false}>
      <ProfileEditContent id={id} />
    </Authenticated>
  );
}

function ProfileEditContent({ id }: { id: string }) {
  const { mutate: updateProfile, isLoading: isUpdating } = useUpdate();

  const {
    refineCore: { query, formLoading },
    saveButtonProps,
    control,
    handleSubmit,
    watch,
    reset, // [2] Precisamos do reset exposto aqui
    ...form
  } = useForm({
    refineCoreProps: {
      resource: "view_admin_profiles",
      action: "edit",
      id: id,
    },
  });

  const record = query?.data?.data;
  const watchedType = watch("profile_type");

  // [3] CORREÇÃO DE POPULAÇÃO DO FORMULÁRIO (Sincronização Forçada)
  useEffect(() => {
    if (record) {
      reset({
        full_name: record.full_name || "",
        public_name: record.public_name || "",
        document: record.document || "",
        phone: record.phone || "",
        description: record.description || "",
        app_role: record.app_role || "user",
        // Converte para string para garantir que o Select entenda o valor
        category_id: record.category_id ? String(record.category_id) : undefined,
        score: Number(record.score || 0),
      });
    }
  }, [record, reset]);

  const { options: categoryOptions } = useSelect({
    resource: "categories",
    optionLabel: "name",
    optionValue: "id",
    pagination: { pageSize: 100 },
    filters: [{ field: "type", operator: "eq", value: watchedType || "pessoa" }],
  });

  // --- GAMIFICAÇÃO ---
  const score = Number(record?.score || 0);
  const { name: badgeName, nextStart } = getStatusDetails(score, GAMIFICATION_LEVELS);
  const statusKey = normalizeStatusKey(badgeName);
  const badgeLabel = GAMIFICATION_LABELS[statusKey] || badgeName || "Iniciante";
  const badgeIcon = GAMIFICATION_ICONS[statusKey] || '🥚';
  const badgeColor = GAMIFICATION_COLORS[statusKey] || '#64748b';

  const roleOptions = [
    { label: "Usuário Comum", value: "user" },
    { label: "Admin (Moderador)", value: "admin" },
    { label: "Master (Super Admin)", value: "master" },
  ];

  const handleCustomSubmit = (values: any) => {
    const payload = {
      full_name: values.full_name,
      public_name: values.public_name,
      document: values.document,
      phone: values.phone,
      description: values.description,
      app_role: values.app_role,
      category_id: values.category_id,
      score: values.score,
    };

    updateProfile({
      resource: "profiles",
      id: id,
      values: payload,
      successNotification: {
        message: "Perfil atualizado com sucesso",
        type: "success",
      },
      invalidates: ['all']
    });
  };

  const isLoading = query?.isLoading || formLoading;
  const isSaving = isUpdating;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!record) return <div className="p-8 text-center text-muted-foreground">Perfil não encontrado.</div>;

  return (
    <EditView>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        <EditViewHeader title={`Perfil: ${record.full_name || "Usuário"}`} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* === COLUNA ESQUERDA (PRINCIPAL) === */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. FORMULÁRIO DE EDIÇÃO */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Cadastrais</CardTitle>
                <CardDescription>Informações principais editáveis.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form} control={control} handleSubmit={handleSubmit} reset={reset}>
                  <form onSubmit={handleSubmit(handleCustomSubmit)} className="grid gap-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="public_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Público (Apelido)</FormLabel>
                            <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="document"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Documento (CPF/CNPJ)</FormLabel>
                            <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone / WhatsApp</FormLabel>
                            <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biografia / Sobre</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} className="min-h-[100px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md border space-y-4">
                      <h4 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Área Administrativa
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={control}
                          name="app_role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Permissão</FormLabel>
                              <Select onValueChange={field.onChange} key={field.value} value={field.value || "user"} defaultValue={record.app_role || "user"}>
                                <FormControl><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{roleOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="category_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categoria</FormLabel>
                              <Select onValueChange={field.onChange} key={field.value} value={field.value ? String(field.value) : undefined}>
                                <FormControl><SelectTrigger className="bg-background"><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                <SelectContent>{categoryOptions.map((opt) => <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>)}</SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="score"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pontuação</FormLabel>
                              <FormControl><Input type="number" className="bg-background" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t mt-4">
                      <DeleteButton recordItemId={id} resource="profiles" confirmTitle="Banir Usuário?" confirmOkText="Sim, Banir" />
                      <Button type="submit" size="lg" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SaveIcon className="mr-2 h-4 w-4" />}
                        Salvar Alterações
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* 2. CARD DE SERVIÇOS E ATIVIDADE */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-muted-foreground" /> Serviços e Atividade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Serviços (Dono) */}
                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground block mb-3 flex justify-between">
                    <span>Dono de Serviços</span>
                    <Badge variant="secondary" className="h-5">{record.total_services_owned || 0}</Badge>
                  </span>

                  {record.recent_owned_services?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {record.recent_owned_services.map((s: any) => (
                        <Link key={s.id} href={`/services/${s.id}/edit`} className="block group">
                          <div className="p-3 rounded-md border bg-slate-50 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-semibold truncate text-slate-800 group-hover:text-blue-800 w-full">{s.name}</span>
                              {s.is_authenticated && <Shield className="w-3 h-3 text-green-500 shrink-0 ml-2" title="Autenticado" />}
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center">
                              Ver detalhes <ExternalLink className="w-3 h-3 ml-1" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed rounded text-center">
                      <p className="text-xs text-muted-foreground italic">Nenhum serviço próprio.</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Indicações */}
                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground block mb-3 flex justify-between">
                    <span>Indicações Feitas</span>
                    <Badge variant="secondary" className="h-5">{record.total_services_indicated || 0}</Badge>
                  </span>

                  {record.recent_indicated_services?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {record.recent_indicated_services.map((s: any) => (
                        <Link key={s.id} href={`/services/${s.id}/edit`} className="block group">
                          <div className="p-3 rounded-md border bg-white group-hover:bg-slate-50 transition-all">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-medium truncate text-muted-foreground group-hover:text-foreground w-full">{s.name}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center">
                              Indicado <ExternalLink className="w-3 h-3 ml-1" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed rounded text-center">
                      <p className="text-xs text-muted-foreground italic">Nenhuma indicação feita.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 3. CARD DE COMENTÁRIOS */}
            {record.recent_comments?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-muted-foreground" /> Comentários Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {record.recent_comments.map((c: any) => (
                      <div key={c.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                          <div className="w-0.5 h-full bg-slate-100 my-1"></div>
                        </div>
                        <div className="pb-4 border-b border-slate-50 last:border-0 w-full">
                          <p className="text-sm text-slate-700 italic">"{c.content}"</p>
                          <span className="text-[10px] text-muted-foreground block mt-1 font-medium">
                            Postado em {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* === COLUNA DIREITA (LATERAL - Resumo) === */}
          <div className="space-y-6">

            {/* CARD 1: IDENTIDADE */}
            <Card className="overflow-hidden border-slate-200 shadow-sm sticky top-4">
              <div className="h-24 w-full relative" style={{ backgroundColor: `${badgeColor}20` }}>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-md bg-white">
                    <AvatarImage src={record.avatar_url} className="object-cover" />
                    <AvatarFallback className="text-2xl font-bold bg-slate-100 text-slate-400">
                      {record.full_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <CardContent className="pt-12 text-center space-y-5">
                <div>
                  <h3 className="font-bold text-lg leading-tight">{record.public_name || record.full_name}</h3>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                    <Mail className="w-3 h-3" /> {record.email || "Email oculto"}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground/60 mt-1 font-mono">
                    <Hash className="w-3 h-3" /> ID: {record.registration_number || "-"}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                  <div className="flex justify-center">
                    <Badge className="text-sm px-4 py-1.5 font-bold border shadow-sm" style={{ backgroundColor: `${badgeColor}15`, color: badgeColor, borderColor: `${badgeColor}40` }}>
                      <span className="mr-2 text-lg">{badgeIcon}</span> {badgeLabel}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground px-1">
                      <span>{score.toLocaleString()} pts</span>
                      <span>{nextStart ? nextStart.toLocaleString() : 'MAX'} pts</span>
                    </div>
                    <div className="w-full h-2.5 bg-white border border-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: nextStart ? `${Math.min((score / nextStart) * 100, 100)}%` : '100%', backgroundColor: badgeColor }} />
                    </div>
                    {nextStart ? (
                      <div className="text-xs text-muted-foreground pt-2 border-t flex items-center justify-center">
                        <ArrowUpCircle className="w-3 h-3 mr-1.5 text-blue-500" />
                        Faltam <strong className="mx-1">{(nextStart - score).toLocaleString('pt-BR')}</strong> para subir
                      </div>
                    ) : (
                      <p className="text-xs text-green-600 font-bold mt-1">Nível Máximo Atingido!</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARD 2: ESTATÍSTICAS */}
            <Card>
              <CardHeader className="pb-3 pt-5">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> Engajamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-50 rounded border flex flex-col items-center hover:bg-slate-100 transition-colors">
                    <Heart className="w-4 h-4 text-pink-500 mb-1" />
                    <span className="text-sm font-bold">{record.total_likes_received || 0}</span>
                    <span className="text-[9px] text-muted-foreground uppercase">Curtidas</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border flex flex-col items-center hover:bg-slate-100 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mb-1" />
                    <span className="text-sm font-bold">{record.total_confirmations_made || 0}</span>
                    <span className="text-[9px] text-muted-foreground uppercase">Validou</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border flex flex-col items-center hover:bg-slate-100 transition-colors">
                    <MessageSquare className="w-4 h-4 text-blue-500 mb-1" />
                    <span className="text-sm font-bold">{record.total_comments_made || 0}</span>
                    <span className="text-[9px] text-muted-foreground uppercase">Comentou</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARD 3: LOCALIZAÇÃO */}
            <Card>
              <CardHeader className="pb-3 pt-5">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-muted-foreground">Cidade</span>
                  <span className="font-medium text-right">{record.city_name || "Não informada"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-muted-foreground">Estado</span>
                  <span className="font-medium text-right">{record.city_state || "-"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Categoria</span>
                  <span className="font-medium flex items-center gap-1">
                    {record.category_icon} {record.category_name || "Sem categoria"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="text-[10px] text-center text-muted-foreground/50 font-mono">
              System ID: {id}
            </div>

          </div>
        </div>
      </div>
    </EditView>
  );
}
