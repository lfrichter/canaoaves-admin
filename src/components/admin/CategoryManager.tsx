"use client";

import { getList } from "@/app/actions/data";
import { getRelatedCategories, updateAmenityCategories, updateOfferingCategories } from "@/app/actions/relations";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, EyeOff, Loader2, Search, Tags } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface CategoryManagerProps {
  itemId: string;
  itemName: string;
  type: "amenity" | "offering";
  trigger?: React.ReactNode;
}

export function CategoryManager({ itemId, itemName, type, trigger }: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Estados de Dados
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Estados de Loading
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          // 1. Busca TODAS as categorias de empresa
          const { data } = await getList("categories", {
            current: 1,
            pageSize: 1000,
            sorters: [{ field: "name", order: "asc" }],
            filters: [{ field: "type", operator: "eq", value: "empresa" }]
          });

          setAllCategories(data || []);

          // 2. Busca Vínculos Existentes
          const ids = await getRelatedCategories(itemId, type);
          setSelectedIds(new Set(ids));

        } catch (error) {
          console.error("Erro ao carregar:", error);
          toast.error("Erro ao carregar dados.");
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchData();
    }
  }, [isOpen, itemId, type]);

  const toggleCategory = (catId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(catId)) newSet.delete(catId);
    else newSet.add(catId);
    setSelectedIds(newSet);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const action = type === "amenity" ? updateAmenityCategories : updateOfferingCategories;
      await action(itemId, Array.from(selectedIds));
      toast.success("Vínculos atualizados!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- LÓGICA DE AGRUPAMENTO (Grouping) ---

  // 1. Separa quem é Pai (Subtítulo) e quem é Filho (Item)
  const rootCategories = allCategories.filter(c => !c.parent_id);
  const childCategories = allCategories.filter(c => c.parent_id);

  // 2. Função para renderizar os grupos
  const renderGroups = () => {
    const term = search.toLowerCase();

    // Mapeia os Pais
    return rootCategories.map((root) => {
      // Encontra os filhos deste pai que batem com a busca
      const children = childCategories.filter(
        (child) =>
          child.parent_id === root.id &&
          child.name.toString().toLowerCase().includes(term)
      );

      // Se não tiver filhos (ou a busca filtrou todos), não exibe o cabeçalho
      if (children.length === 0) return null;

      return (
        <div key={root.id} className="mb-4 last:mb-0">
          {/* O PAI É APENAS VISUAL (Subtítulo) */}
          <div className="flex items-center gap-2 px-2 py-1 mb-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
              {root.icon && <span className="mr-1.5 text-sm grayscale opacity-70">{root.icon}</span>}
              {root.name}
            </span>
            <div className="h-px bg-border flex-1 ml-2 opacity-50"></div>
          </div>

          {/* Renderiza os filhos como Checkboxes */}
          <div className="space-y-1 ml-2">
            {children.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center space-x-3 hover:bg-muted/50 p-2 rounded-md transition-colors cursor-pointer group"
                onClick={() => toggleCategory(cat.id)}
              >
                <Checkbox
                  id={cat.id}
                  checked={selectedIds.has(cat.id)}
                  onCheckedChange={() => toggleCategory(cat.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-muted-foreground/30"
                />
                <label htmlFor={cat.id} className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2 flex-1 select-none">
                  {cat.icon && <span className="text-base">{cat.icon}</span>}
                  <span>{cat.name}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  // Verificação de "Fantasmas" (IDs selecionados que não estão na lista visível)
  // Útil para debug se algo sumir
  const ghostIds = Array.from(selectedIds).filter(
    (selId) => !childCategories.find((cat) => cat.id === selId)
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button variant="ghost" size="icon">
            <Tags className="w-4 h-4 text-muted-foreground" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular: {itemName}</DialogTitle>
          <DialogDescription>
            Associe às categorias correspondentes.
          </DialogDescription>
        </DialogHeader>

        {/* Alerta de Fantasmas */}
        {ghostIds.length > 0 && !isLoadingData && (
          <div className="bg-amber-500/10 border border-amber-200 dark:border-amber-800/60 rounded-md p-3 text-xs text-amber-700 dark:text-amber-400 flex flex-col gap-1">
            <div className="flex items-center font-bold">
              <EyeOff className="w-3 h-3 mr-1" />
              Atenção: Vínculos Antigos Detectados
            </div>
            <p>
              Existem <strong>{ghostIds.length}</strong> vínculos que não pertencem à estrutura atual (provavelmente IDs de pais ou categorias deletadas). Eles serão removidos ao salvar.
            </p>
          </div>
        )}

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar sub-categoria..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="border rounded-md bg-background">
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                {isLoadingData ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-xs">Carregando estrutura...</span>
                  </div>
                ) : allCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-center px-4">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">Nenhuma categoria disponível</p>
                  </div>
                ) : (
                  // AQUI CHAMAMOS A FUNÇÃO DE RENDERIZAÇÃO AGRUPADA
                  <div className="pb-2">
                    {renderGroups()}

                    {/* Fallback se a busca não retornar nada */}
                    {rootCategories.length > 0 && renderGroups()?.every(x => x === null) && (
                      <p className="text-center text-xs text-muted-foreground py-8">
                        Nenhuma opção encontrada para "{search}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-medium text-primary">
              {selectedIds.size} selecionados
            </span>
            <span>Total Opções: {childCategories.length}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving || isLoadingData}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
