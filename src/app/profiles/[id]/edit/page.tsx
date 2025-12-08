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
import { Authenticated, useSelect } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import {
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
  const {
    refineCore: { query, onFinish, formLoading },
    saveButtonProps,
    control,
    handleSubmit,
    watch,
    ...form
  } = useForm({
    refineCoreProps: {
      resource: "view_admin_profiles", // A View que criamos com tudo incluso
      action: "edit",
      id: id,
    },
  });

  // O record agora contém TUDO: listas JSON, counts, nomes de cidade/categoria
  const record = query?.data?.data;
  const watchedType = watch("profile_type");

  // Apenas o Select de Categorias precisa buscar dados externos
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

  const handleCustomSubmit = async (values: any) => {
      // Mapeia apenas os campos que existem na tabela profiles real
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
      await onFinish(payload);
  };

  if (query?.isLoading) {
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
                <Form {...form} control={control} handleSubmit={handleSubmit}>
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
                            <Shield className="w-4 h-4"/> Área Administrativa
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
                      <Button type="submit" size="lg" disabled={formLoading}>
                        {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SaveIcon className="mr-2 h-4 w-4" />}
                        Salvar Alterações
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* === DIREITA: CONTEXTO (Dados da View) === */}
          <div className="space-y-6">

            {/* IDENTIDADE */}
            <Card className="overflow-hidden border-slate-200 shadow-sm">
                <div className="h-24 w-full relative" style={{ backgroundColor: `${badgeColor}20` }}>
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                        <Avatar className="h-20 w-20 border-4 border-white shadow-md bg-white">
                            <AvatarImage src={record.avatar_url} className="object-cover"/>
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
                            <Mail className="w-3 h-3"/> {record.email || "Email oculto"}
                        </div>
                        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground/60 mt-1 font-mono">
                            <Hash className="w-3 h-3"/> ID: {record.registration_number || "-"}
                        </div>
                    </div>

                    {/* Gamificação */}
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
                            {nextStart && <p className="text-xs text-muted-foreground mt-1">Falta <strong className="text-foreground">{nextStart - score}</strong> para subir.</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ESTATÍSTICAS (Valores diretos da View) */}
            <Card>
                <CardHeader className="pb-3 pt-5">
                    <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                        <Trophy className="w-4 h-4"/> Engajamento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-slate-50 rounded border flex flex-col items-center">
                            <Heart className="w-4 h-4 text-pink-500 mb-1"/>
                            <span className="text-sm font-bold">{record.total_likes_received || 0}</span>
                            <span className="text-[9px] text-muted-foreground uppercase">Curtidas</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border flex flex-col items-center">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mb-1"/>
                            <span className="text-sm font-bold">{record.total_confirmations_made || 0}</span>
                            <span className="text-[9px] text-muted-foreground uppercase">Validou</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border flex flex-col items-center">
                            <MessageSquare className="w-4 h-4 text-blue-500 mb-1"/>
                            <span className="text-sm font-bold">{record.total_comments_made || 0}</span>
                            <span className="text-[9px] text-muted-foreground uppercase">Comentou</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* LOCALIZAÇÃO (Valores diretos da View) */}
            <Card>
                <CardHeader className="pb-3 pt-5">
                    <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4"/> Localização
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-muted-foreground">Cidade</span>
                        <span className="font-medium text-right">{record.city_name || "-"}</span>
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

            {/* ATIVIDADE (Listas JSON da View - Zero Fetch Extra!) */}
            <Card>
                <CardHeader className="pb-3 pt-5">
                    <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                        <Briefcase className="w-4 h-4"/> Atividade
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Serviços (Dono) */}
                    <div>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-2 flex justify-between">
                            <span>Dono de Serviços</span>
                            <Badge variant="outline" className="text-[9px] h-4">{record.total_services_owned || 0}</Badge>
                        </span>
                        {record.recent_owned_services?.length > 0 ? (
                            <div className="space-y-2">
                                {record.recent_owned_services.map((s: any) => (
                                    <Link key={s.id} href={`/services/${s.id}/edit`} className="block group">
                                        <div className="p-2 rounded border bg-slate-50 group-hover:bg-blue-50 transition-colors flex justify-between items-center">
                                            <span className="text-xs font-medium truncate max-w-[180px] text-slate-700">{s.name}</span>
                                            {s.is_authenticated && <Shield className="w-3 h-3 text-green-500"/>}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : <p className="text-xs text-muted-foreground italic pl-1">Nenhum serviço próprio.</p>}
                    </div>

                    <Separator />

                    {/* Indicações */}
                    <div>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-2 flex justify-between">
                            <span>Indicações</span>
                            <Badge variant="outline" className="text-[9px] h-4">{record.total_services_indicated || 0}</Badge>
                        </span>
                        {record.recent_indicated_services?.length > 0 ? (
                            <div className="space-y-2">
                                {record.recent_indicated_services.map((s: any) => (
                                    <Link key={s.id} href={`/services/${s.id}/edit`} className="block group">
                                        <div className="p-2 rounded border bg-white group-hover:bg-slate-50 transition-colors flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground group-hover:text-foreground truncate max-w-[180px]">{s.name}</span>
                                            <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-slate-500"/>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : <p className="text-xs text-muted-foreground italic pl-1">Nenhuma indicação.</p>}
                    </div>

                    {/* Comentários Recentes */}
                    {record.recent_comments?.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-2 flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3"/> Últimos Comentários
                                </span>
                                <div className="space-y-3">
                                    {record.recent_comments.map((c: any) => (
                                        <div key={c.id} className="text-xs border-l-2 border-slate-200 pl-2">
                                            <p className="text-slate-600 italic line-clamp-2">"{c.content}"</p>
                                            <span className="text-[9px] text-muted-foreground block mt-1">
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

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
