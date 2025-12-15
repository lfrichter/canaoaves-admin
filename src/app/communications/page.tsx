"use client";

import { getRecipientsAction } from "@/app/actions/get-recipients";
import { sendBroadcastAction } from "@/app/actions/send-broadcast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { useGetIdentity, useNotification } from "@refinedev/core";
import { AlertTriangle, BarChart3, Loader2, Search, Send } from "lucide-react";
import { useEffect, useState } from "react";

export default function CommunicationsPage() {
  const { data: user } = useGetIdentity();
  const { open } = useNotification();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [sendToAll, setSendToAll] = useState(true);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  const [monthlyUsage, setMonthlyUsage] = useState(0);
  const RESEND_LIMIT = 3000;

  useEffect(() => {
    const fetchUsage = async () => {
      const { data, error } = await supabaseBrowserClient.rpc('get_monthly_email_usage');
      if (!error && data !== null) {
        setMonthlyUsage(data as number);
      }
    };
    fetchUsage();
  }, []);

  useEffect(() => {
    if (!sendToAll && profiles.length === 0) {
      const fetchUsers = async () => {
        setIsLoadingProfiles(true);
        const result = await getRecipientsAction();
        if (result.success && result.data) {
          setProfiles(result.data);
        } else {
          open({ type: "error", message: "Erro ao carregar usuários", description: result.error });
        }
        setIsLoadingProfiles(false);
      };
      fetchUsers();
    }
  }, [sendToAll, profiles.length, open]);

  const filteredProfiles = profiles.filter((p: any) =>
    (p.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUser = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      open({ type: "error", message: "Erro", description: "Preencha assunto e mensagem." });
      return;
    }

    if (!sendToAll && selectedEmails.length === 0) {
      open({ type: "error", message: "Erro", description: "Selecione pelo menos um usuário." });
      return;
    }

    const estimatedCount = sendToAll ? 200 : selectedEmails.length;
    if (monthlyUsage + estimatedCount > RESEND_LIMIT) {
      if (!confirm(`⚠️ ALERTA: Este envio pode exceder o limite mensal de ${RESEND_LIMIT} e-mails. Continuar mesmo assim?`)) {
        return;
      }
    }

    const confirmMsg = sendToAll
      ? "⚠️ ATENÇÃO: Isso enviará um e-mail para TODOS os usuários. Continuar?"
      : `Confirmar envio para ${selectedEmails.length} usuários selecionados?`;

    if (!confirm(confirmMsg)) return;

    setIsLoading(true);

    try {
      const targets = sendToAll ? undefined : selectedEmails;
      const result = await sendBroadcastAction(subject, message, user?.id, targets);

      if (result.success) {
        open({
          type: "success",
          message: "Envio Concluído!",
          description: `Mensagem enviada para ${result.count} usuários.`,
        });
        setSubject("");
        setMessage("");
        if (!sendToAll) setSelectedEmails([]);
        setMonthlyUsage(prev => prev + (result.count || 0));
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      open({ type: "error", message: "Erro no envio", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const usagePercentage = Math.min((monthlyUsage / RESEND_LIMIT) * 100, 100);
  const isLimitNear = usagePercentage > 80;

  return (
    // [AJUSTE RESPONSIVO] p-4 no mobile, p-6 no desktop
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comunicados</h1>
          <p className="text-muted-foreground">Envie e-mails para a base de usuários.</p>
        </div>

        <div className="bg-card border rounded-lg p-4 w-full md:w-64 shadow-sm text-card-foreground">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <BarChart3 className="h-4 w-4" /> Uso Mensal
            </span>
            <span className={`text-sm font-bold ${isLimitNear ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {monthlyUsage} / {RESEND_LIMIT}
            </span>
          </div>
          <Progress value={usagePercentage} className={`h-2 ${isLimitNear ? "[&>div]:bg-red-500" : "[&>div]:bg-emerald-500"}`} />
          <p className="text-[10px] text-muted-foreground mt-1 text-right">Renova dia 01</p>
        </div>
      </div>

      <div className="grid gap-6">

        {/* Aviso com Classe Global (warning-card) */}
        <div className="warning-card">
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="min-w-0"> {/* min-w-0 evita que o texto force a largura */}
            <p className="font-bold">Política de Uso do E-mail</p>
            <p className="opacity-90 break-words">
              Use esta ferramenta com responsabilidade. Envios excessivos podem ser marcados como spam.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" /> Nova Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* SELEÇÃO DE PÚBLICO */}
            <div className="space-y-3">
              <Label>Destinatários</Label>
              {/* [AJUSTE RESPONSIVO] flex-col no mobile (empilha), flex-row no desktop */}
              <div className="flex flex-col sm:flex-row gap-3 mb-2">
                <Button
                  variant={sendToAll ? "default" : "outline"}
                  onClick={() => setSendToAll(true)}
                  className="w-full sm:w-1/2" // Largura total no mobile
                >
                  Todos os Usuários
                </Button>
                <Button
                  variant={!sendToAll ? "default" : "outline"}
                  onClick={() => setSendToAll(false)}
                  className="w-full sm:w-1/2" // Largura total no mobile
                >
                  Selecionar Manualmente
                </Button>
              </div>

              {!sendToAll && (
                // [CORREÇÃO] Adicionado max-w-full e reduzido padding no mobile (p-3)
                <div className="border rounded-md p-3 md:p-4 bg-muted/30 animate-in fade-in zoom-in-95 duration-200 max-w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                      placeholder="Buscar por nome ou e-mail..."
                      className="h-9 w-full" // Garante que o input respeite a largura
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {isLoadingProfiles ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Carregando...
                    </div>
                  ) : (
                    // [CORREÇÃO] w-full no ScrollArea para garantir que não estoure
                    <ScrollArea className="h-[200px] w-full border rounded-md bg-background">
                      <div className="p-2 space-y-1">
                        {filteredProfiles.map((p: any) => (
                          <div
                            key={p.id}
                            // [CORREÇÃO] Items alinhados no topo (items-start) para caso o email quebre em 2 linhas
                            className="flex items-start space-x-3 p-2 hover:bg-accent rounded cursor-pointer transition-colors"
                            onClick={() => toggleUser(p.email)}
                          >
                            {/* [CORREÇÃO] shrink-0 impede que o checkbox seja esmagado + margem superior para alinhar com texto */}
                            <Checkbox
                              id={p.id}
                              checked={selectedEmails.includes(p.email)}
                              onCheckedChange={() => toggleUser(p.email)}
                              className="shrink-0 mt-1"
                            />

                            {/* [CORREÇÃO] min-w-0 é CRUCIAL para o flexbox permitir quebra de texto/truncagem */}
                            <label htmlFor={p.id} className="text-sm font-medium leading-tight cursor-pointer flex-1 min-w-0 grid gap-0.5">
                              {/* Nome com truncate (corta com ...) se for muito longo */}
                              <span className="truncate w-full block">{p.full_name}</span>

                              {/* Email com break-all para forçar quebra em qualquer caractere se precisar */}
                              <span className="text-muted-foreground font-normal text-xs break-all">
                                &lt;{p.email}&gt;
                              </span>
                            </label>
                          </div>
                        ))}
                        {filteredProfiles.length === 0 && (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Nenhum usuário encontrado.
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}

                  <div className="mt-2 text-sm text-muted-foreground flex justify-between items-center flex-wrap gap-2">
                    <span>{selectedEmails.length} selecionados</span>
                    {selectedEmails.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedEmails([])} className="h-6 px-2 text-xs">
                        Limpar
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Remetente</Label>
              <Input
                value="Canaoaves <nao-responda@canaoaves.com.br>"
                readOnly
                className="bg-secondary/50 text-muted-foreground border-dashed focus-visible:ring-0 cursor-not-allowed"
                tabIndex={-1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                placeholder="Ex: Atualizações da plataforma"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Escreva sua mensagem aqui..."
                className="min-h-[200px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Dica: Você pode usar HTML simples ou apenas texto. Quebras de linha serão respeitadas.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSend}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : <><Send className="mr-2 h-4 w-4" /> Enviar Mensagem</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
