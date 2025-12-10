"use client";

import { DeleteButton } from "@/components/refine-ui/buttons";
import { EditView, EditViewHeader } from "@/components/refine-ui/views/edit-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { Authenticated, useGetIdentity, useSelect, useUpdate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronUpIcon,
  ExternalLink,
  Eye,
  Globe,
  Hash, Heart,
  Loader2,
  Lock,
  Mail, MapPin,
  MessageCircle,
  MessageSquare,
  SaveIcon,
  Shield, Trophy,
  UserCircle
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const { data: identity } = useGetIdentity<{ app_role: string }>();
  const isMaster = identity?.app_role === 'master';

  const [isOpenDetails, setIsOpenDetails] = useState(false);

  const { mutate: updateProfile, isLoading: isUpdating } = useUpdate();

  const {
    refineCore: { query, formLoading },
    control,
    handleSubmit,
    watch,
    reset,
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

  useEffect(() => {
    if (record) {
      reset({
        full_name: record.full_name || "",
        public_name: record.public_name || "",
        document: record.document || "",
        phone: record.phone || "",
        description: record.description || "",
        app_role: record.app_role || "user",
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

  // --- PARSERS ---
  let displayLocation = { city: "Não informada", state: "-", country: "BR" };

  if (record) {
    if (record.city_name) {
      displayLocation = {
        city: record.city_name,
        state: record.city_state,
        country: "Brasil"
      };
    } else if (record.location_details) {
      try {
        const loc = typeof record.location_details === 'string'
          ? JSON.parse(record.location_details)
          : record.location_details;

        displayLocation = {
          city: loc.city || "N/A",
          state: loc.province || loc.state || "-",
          country: loc.country || "Exterior"
        };
      } catch (e) {
        console.error("Erro ao ler location_details", e);
      }
    }
  }

  let displayGender = "Não informado";
  if (record?.gender_details) {
    try {
      const genderObj = typeof record.gender_details === 'string'
        ? JSON.parse(record.gender_details)
        : record.gender_details;
      displayGender = genderObj.main || "Não informado";
      displayGender = displayGender.charAt(0).toUpperCase() + displayGender.slice(1);
    } catch (e) { }
  }

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
      successNotification: { message: "Perfil atualizado com sucesso", type: "success" },
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

          {/* === ESQUERDA: FORMULÁRIO === */}
          <div className="lg:col-span-2 space-y-6">
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

                    {/* [FIX DARK MODE] Alterado de bg-slate-50 para bg-muted/40 */}
                    <div className="bg-muted/40 p-4 rounded-md border border-border space-y-4">
                      <h4 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Área Administrativa
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={control}
                          name="app_role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Permissão
                                {!isMaster && <Lock className="w-3 h-3 text-muted-foreground" />}
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                key={field.value}
                                value={field.value || "user"}
                                defaultValue={record.app_role || "user"}
                                disabled={!isMaster}
                              >
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
                              <FormLabel className="flex items-center gap-2">
                                Pontuação
                                {!isMaster && <Lock className="w-3 h-3 text-muted-foreground" />}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="bg-background"
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                  disabled={!isMaster}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t mt-4">
                      <DeleteButton recordItemId={id} resource="profiles" confirmTitle="Banir Usuário?" confirmOkText="Sim, Banir" size="sm" hideText />
                      <Button type="submit" size="sm" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SaveIcon className="mr-2 h-4 w-4" />}
                        Salvar Alterações
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* CARDS SECUNDÁRIOS DE ATIVIDADE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="h-full">
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Briefcase className="w-5 h-5 text-muted-foreground" /> Serviços e Indicações</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase text-muted-foreground block mb-2 flex justify-between">
                      <span>Dono</span><Badge variant="secondary" className="h-5">{record.total_services_owned || 0}</Badge>
                    </span>
                    {record.recent_owned_services?.length > 0 ? (
                      <div className="space-y-2">{record.recent_owned_services.map((s: any) => (
                        // [FIX DARK MODE] bg-slate-50 -> bg-muted/40 | border-blue-300 -> border-primary/50
                        <Link key={s.id} href={`/services/${s.id}/edit`} className="block text-sm p-2 bg-muted/40 border border-border rounded hover:border-primary/50 transition-colors truncate">{s.name}</Link>
                      ))}</div>
                    ) : <p className="text-xs text-muted-foreground italic">Nenhum.</p>}
                  </div>
                  <Separator />
                  <div>
                    <span className="text-xs font-bold uppercase text-muted-foreground block mb-2 flex justify-between">
                      <span>Indicações</span><Badge variant="secondary" className="h-5">{record.total_services_indicated || 0}</Badge>
                    </span>
                    {record.recent_indicated_services?.length > 0 ? (
                      <div className="space-y-2">{record.recent_indicated_services.map((s: any) => (
                        // [FIX DARK MODE] bg-white -> bg-card | hover:bg-slate-50 -> hover:bg-muted/50
                        <Link key={s.id} href={`/services/${s.id}/edit`} className="block text-sm p-2 bg-card border border-border rounded hover:bg-muted/50 transition-colors truncate text-muted-foreground">{s.name}</Link>
                      ))}</div>
                    ) : <p className="text-xs text-muted-foreground italic">Nenhuma.</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><MessageCircle className="w-5 h-5 text-muted-foreground" /> Últimos Comentários</CardTitle></CardHeader>
                <CardContent>
                  {record.recent_comments?.length > 0 ? (
                    <div className="space-y-4">
                      {record.recent_comments.map((c: any) => (
                        // [FIX DARK MODE] border-slate-200 -> border-border
                        <div key={c.id} className="text-xs border-l-2 border-border pl-2">
                          <p className="text-muted-foreground italic line-clamp-2">"{c.content}"</p>
                          <span className="text-[9px] text-muted-foreground/60 block mt-1">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-muted-foreground italic">Nenhum comentário.</p>}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* === DIREITA: CONTEXTO E METADADOS === */}
          <div className="space-y-6">

            {/* CARD 1: IDENTIDADE */}
            <Card className="overflow-hidden border-border shadow-sm sticky top-4">
              <div className="h-24 w-full relative" style={{ backgroundColor: `${badgeColor}20` }}>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  {/* [FIX DARK MODE] bg-white -> bg-background */}
                  <Avatar className="h-20 w-20 border-4 border-background shadow-md bg-background">
                    <AvatarImage src={record.avatar_url} className="object-cover" />
                    <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">
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

                {/* [FIX DARK MODE] bg-slate-50 -> bg-muted/40 */}
                <div className="bg-muted/40 p-4 rounded-lg border border-border space-y-3">
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
                    {/* [FIX DARK MODE] bg-white -> bg-secondary/50 | border-slate-200 -> border-border */}
                    <div className="w-full h-2.5 bg-secondary/50 border border-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: nextStart ? `${Math.min((score / nextStart) * 100, 100)}%` : '100%', backgroundColor: badgeColor }} />
                    </div>
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

                  {/* Curtidas */}
                  <div className="p-2 bg-muted/40 rounded border border-border flex flex-col items-center justify-center min-h-[80px]">
                    <Heart className="w-4 h-4 text-pink-500 mb-1" />
                    <span className="text-sm font-bold leading-none">{record.total_likes_received || 0}</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Curtidas</span>
                  </div>

                  {/* Confirmações */}
                  <div className="p-2 bg-muted/40 rounded border border-border flex flex-col items-center justify-center min-h-[80px]">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mb-1" />
                    <span className="text-sm font-bold leading-none">{record.total_confirmations_made || 0}</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Validações</span>
                  </div>

                  {/* Comentários */}
                  <div className="p-2 bg-muted/40 rounded border border-border flex flex-col items-center justify-center min-h-[80px]">
                    <MessageSquare className="w-4 h-4 text-blue-500 mb-1" />
                    <span className="text-sm font-bold leading-none">{record.total_comments_made || 0}</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Comentários</span>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* CARD 3: LOCALIZAÇÃO */}
            <Card>
              <CardHeader className="pb-3 pt-5"><CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4" /> Localização</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                {/* [FIX DARK MODE] border-slate-100 -> border-border */}
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Cidade</span>
                  <span className="font-medium text-right">{displayLocation.city}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">UF / Província</span>
                  <span className="font-medium text-right">{displayLocation.state}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">País</span>
                  <span className="font-medium text-right">{displayLocation.country}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Categoria</span>
                  <span className="font-medium flex items-center gap-1">{record.category_icon} {record.category_name || "Sem categoria"}</span>
                </div>
              </CardContent>
            </Card>

            {/* CARD 4: DETALHES TÉCNICOS */}
            <Card className="w-full pb-0">
              <Collapsible open={isOpenDetails} onOpenChange={setIsOpenDetails}>
                <div className="flex items-center justify-between px-6 py-4">
                  <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Detalhes Técnicos
                  </CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Toggle</span>
                      <ChevronUpIcon className={`h-4 w-4 transition-transform duration-200 ${isOpenDetails ? "" : "rotate-180"}`} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0 text-sm">
                    {/* [FIX DARK MODE] border-slate-100 -> border-border */}
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground flex items-center gap-2"><UserCircle className="w-3 h-3" /> Gênero</span>
                      <span className="font-medium">{displayGender}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground flex items-center gap-2"><CalendarDays className="w-3 h-3" /> Início</span>
                      <span className="font-medium">{record.start_date ? new Date(record.start_date).toLocaleDateString('pt-BR') : "-"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground flex items-center gap-2"><Eye className="w-3 h-3" /> Exibe Nome Completo?</span>
                      <Badge variant={record.show_full_name ? "default" : "secondary"} className="h-5">{record.show_full_name ? "Sim" : "Não"}</Badge>
                    </div>

                    {record.website_url && (
                      <div className="flex justify-between py-2 border-b border-border items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><Globe className="w-3 h-3" /> Website</span>
                        <a href={record.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-xs truncate max-w-[150px]">
                          Link Externo <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {record.life_list_url && (
                      <div className="flex justify-between py-2 items-center">
                        <span className="text-muted-foreground flex items-center gap-2"><Briefcase className="w-3 h-3" /> Life List</span>
                        <a href={record.life_list_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-xs truncate max-w-[150px]">
                          Ver Lista <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
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
