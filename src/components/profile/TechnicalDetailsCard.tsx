"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Briefcase,
  CalendarDays,
  Check,
  ChevronUpIcon,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Hash,
  UserCircle,
} from "lucide-react";
import { useState } from "react";

// Definindo uma interface para o 'record' para melhor type-safety
interface ProfileRecord {
  gender_details?: string | { main?: string };
  start_date?: string;
  slug?: string;
  show_full_name?: boolean;
  website_url?: string;
  life_list_url?: string;
}

interface TechnicalDetailsCardProps {
  record: ProfileRecord;
}

export function TechnicalDetailsCard({ record }: TechnicalDetailsCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  if (!record) return null;

  // --- PARSERS & HELPERS ---
  const publicUrl = record.slug
    ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://canaoaves.com.br'}/person/${record.slug}`
    : "";

  let displayGender = "Não informado";
  if (record.gender_details) {
    try {
      const genderObj = typeof record.gender_details === 'string'
        ? JSON.parse(record.gender_details)
        : record.gender_details;
      displayGender = genderObj.main || "Não informado";
      displayGender = displayGender.charAt(0).toUpperCase() + displayGender.slice(1);
    } catch (e) { }
  }

  const handleCopy = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  return (
    <Card className="w-full pb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between px-6 py-4">
          <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
            <Code2 className="w-4 h-4" /> Detalhes Técnicos
          </CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Toggle</span>
              <ChevronUpIcon className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "" : "rotate-180"}`} />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <CardContent className="space-y-2 pt-0 text-sm">
            {/* Gênero */}
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground flex items-center gap-2"><UserCircle className="w-3 h-3" /> Gênero</span>
              <span className="font-medium">{displayGender}</span>
            </div>
            {/* Data de Início */}
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground flex items-center gap-2"><CalendarDays className="w-3 h-3" /> Início</span>
              <span className="font-medium">{record.start_date ? new Date(record.start_date).toLocaleDateString('pt-BR') : "-"}</span>
            </div>

            {/* Slug */}
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground flex items-center gap-2"><Hash className="w-3 h-3" /> Slug</span>
              <span className="font-mono text-xs bg-muted/80 p-1 rounded">{record.slug || "-"}</span>
            </div>

            {/* Public Link */}
            <div className="flex justify-between py-2 border-b border-border items-center">
              <span className="text-muted-foreground flex items-center gap-2"><Globe className="w-3 h-3" /> Link Público</span>
              <div className="flex items-center gap-2">
                <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-xs">
                  Ver Perfil <ExternalLink className="w-3 h-3" />
                </a>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCopy}>
                  {hasCopied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            {/* Outros campos... */}
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
  );
}
