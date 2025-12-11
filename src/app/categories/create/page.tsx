"use client";

import { getList } from "@/app/actions/data";
import { CreateView, CreateViewHeader } from "@/components/refine-ui/views/create-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { Building2, Loader2, Search, Smile, Trash2, User } from "lucide-react"; // <--- Adicionado Trash2
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

// --- 1. DADOS: Lista Expandida e Categorizada ---
const ICON_CATEGORIES: Record<string, string[]> = {
  "Aves & Animais": [
    "🦅", "🦆", "🦉", "🦜", "🦩", "🦢", "🐓", "🦃", "🦚", "🐧", "🐦", "🐤", "🐣", "🦇", "🦋", "🐞", "🐝", "🐜", "🦗", "🕷️", "🐢", "🐍", "🦎", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🦒", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🐐", "🐕", "🐈", "🐇", "🐿️"
  ],
  "Natureza & Paisagem": [
    "🌳", "🌲", "🌴", "🌵", "🌾", "🌿", "🍀", "🍁", "🍂", "🍃", "🍄", "🌰", "🌷", "🌸", "🌹", "🌺", "🌻", "🌼", "🌽", "🏞️", "🌅", "🌄", "🌠", "🔥", "🌈", "☀️", "🌤️", "☁️", "⛈️", "❄️", "🌊", "🌍", "🌎", "🌏"
  ],
  "Viagem & Locais": [
    "🏡", "🏠", "🏚️", "🏢", "🏣", "🏤", "🏥", "🏦", "🏨", "🏩", "🏪", "🏫", "🏬", "🏭", "🏯", "🏰", "💒", "🗼", "🗽", "⛪", "🕌", "🛕", "🕍", "⛩️", "🕋", "⛲", "⛺", "🌁", "🌃", "🏙️", "🛤️", "🛣️", "🗺️", "🗾", "🧭"
  ],
  "Serviços & Atividades": [
    "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋", "🔌", "💻", "🖥️", "🖨️", "🖱️", "🖲️", "💽", "💾", "💿", "📀", "🧮", "🔭", "🔬", "👣", "🎒", "🥾", "🕶️", "🧢", "🎣", "🚣", "🏊", "🏄", "🛁", "🛌", "🍽️", "🍴", "🥄", "🔪", "🏺", "🧊", "🥤", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🧃", "🥛", "🍼", "☕", "🍵", "🥪", "🍞", "🥐", "🥖", "🥨", "🥯", "🥞", "🧇", "🧀", "🍖", "🍗", "🥩", "🥓", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🥙", "🧆", "🥚", "🍳", "🥘", "🍲", "🥣", "🥗", "🍿", "🧈", "🧂", "🥫", "🍱", "🍘", "🍙", "🍚", "🍛", "🍜", "🍝", "🍠", "🍢", "🍣", "🍤", "🍥", "🥮", "🍡", "🥟", "🥠", "🥡", "🦀", "🦞", "🦐", "🦑", "🦪", "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯"
  ],
  "Transporte": [
    "✈️", "🛫", "🛬", "🛩️", "🚀", "🛸", "🚁", "🛶", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢", "⚓", "⛽", "🚧", "🚦", "🚥", "🚏", "🗺️", "🗿", "🗽", "🗼", "🏰", "🏯", "🏟️", "🎡", "🎢", "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️", "🌋", "⛰️", "🏔️", "🗻", "🏕️", "⛺"
  ],
  "Pessoas & Profissões": [
    "👤", "👥", "🗣️", "🫂", "👮", "🕵️", "💂", "👷", "🤴", "👸", "👳", "👲", "🧕", "🤵", "👰", "🤰", "🤱", "👼", "🎅", "🤶", "🦸", "🦹", "🧙", "🧚", "🧛", "🧜", "🧝", "🧞", "🧟", "💆", "💇", "🚶", "🏃", "💃", "🕺", "👯", "🧖", "🧗", "🤺", "🏇", "⛷️", "🏂", "🏌️", "🏄", "🚣", "🏊", "⛹️", "🏋️", "🚴", "🚵", "🤸", "🤼", "🤽", "🤾", "🤹", "🎓", "🧫", "💊", "💉"
  ],
  "Símbolos & Úteis": [
    "✅", "❎", "✳️", "❇️", "❌", "🚫", "🛑", "⛔", "⚠️", "🚸", "ℹ️", "📶", "📳", "📴", "♻️", "⚜️", "🔱", "📛", "🔰", "⭕", "🔥", "💧", "⚡", "⭐", "🌟", "✨", "💫", "☄️", "🎈", "🎉", "🎊", "🎋", "🎍", "🎎", "🎏", "🎐", "🎑", "🧧", "🎀", "🎁", "🎗️", "🎟️", "🎫"
  ]
};

// --- 2. Schema de Validação ---
const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  slug: z.string().min(2, "Slug é obrigatório"),
  type: z.enum(["pessoa", "empresa"], {
    required_error: "Selecione o tipo de categoria",
  }),
  description: z.string().optional(),
  icon: z.string().nullable().optional(), // Aceita null ou string
  parent_id: z.string().nullable().optional(),
});

export default function CategoryCreate() {
  const {
    refineCore: { onFinish },
    saveButtonProps,
    ...form
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "pessoa",
      name: "",
      slug: "",
      description: "",
      icon: "",
      parent_id: null,
    },
  });

  const selectedType = form.watch("type");
  const nameValue = form.watch("name");
  const iconValue = form.watch("icon");

  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [isLoadingParents, setIsLoadingParents] = useState(false);

  // Estado do Modal de Ícones
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState("");

  // --- Auto-Slug ---
  useEffect(() => {
    if (nameValue) {
      const slug = nameValue
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      form.setValue("slug", slug);
    }
  }, [nameValue, form]);

  // --- Busca de Categorias Pai ---
  useEffect(() => {
    const fetchParents = async () => {
      setIsLoadingParents(true);
      try {
        const { data } = await getList("categories", {
          current: 1,
          pageSize: 1000,
          sorters: [{ field: "name", order: "asc" }],
          filters: [
            { field: "type", operator: "eq", value: selectedType }
          ]
        });

        const roots = (data || []).filter((cat: any) => !cat.parent_id);
        setParentCategories(roots);
      } catch (error) {
        console.error("Erro ao buscar categorias pai:", error);
        toast.error("Erro ao carregar lista de categorias pai");
        setParentCategories([]);
      } finally {
        setIsLoadingParents(false);
      }
    };

    fetchParents();
  }, [selectedType]);

  // --- Filtro de Ícones ---
  const filteredIcons = useMemo(() => {
    if (!iconSearch) return ICON_CATEGORIES;

    const search = iconSearch.toLowerCase();
    const result: Record<string, string[]> = {};

    Object.entries(ICON_CATEGORIES).forEach(([category, icons]) => {
      if (category.toLowerCase().includes(search)) {
        result[category] = icons;
      } else {
        const found = icons.filter(icon => icon.includes(search));
        if (found.length > 0) result[category] = found;
      }
    });
    return result;
  }, [iconSearch]);

  return (
    <CreateView>
      <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">

        <CreateViewHeader title="Nova Categoria" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFinish)} className="space-y-8 pb-10">

            <div className="grid gap-6 md:grid-cols-2">

              {/* LADO ESQUERDO */}
              <div className="space-y-6">

                {/* Tipo */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Tipo de Categoria</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div>
                            <RadioGroupItem value="pessoa" id="type-pessoa" className="peer sr-only" />
                            <label
                              htmlFor="type-pessoa"
                              className="
                                flex flex-col items-center justify-between rounded-md border-2 border-muted
                                bg-popover p-4
                                hover:bg-accent hover:text-accent-foreground
                                peer-data-[state=checked]:border-blue-500
                                peer-data-[state=checked]:bg-blue-500/10
                                peer-data-[state=checked]:text-blue-700
                                dark:peer-data-[state=checked]:bg-blue-500/15
                                dark:peer-data-[state=checked]:text-blue-300
                                cursor-pointer transition-all
                              "
                            >
                              <User className="mb-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
                              <span className="font-semibold text-sm text-foreground">Pessoa</span>
                            </label>
                          </div>
                          <div>
                            <RadioGroupItem value="empresa" id="type-empresa" className="peer sr-only" />
                            <label
                              htmlFor="type-empresa"
                              className="
                                flex flex-col items-center justify-between rounded-md border-2 border-muted
                                bg-popover p-4
                                hover:bg-accent hover:text-accent-foreground
                                peer-data-[state=checked]:border-emerald-500
                                peer-data-[state=checked]:bg-emerald-500/10
                                peer-data-[state=checked]:text-emerald-700
                                dark:peer-data-[state=checked]:bg-emerald-500/15
                                dark:peer-data-[state=checked]:text-emerald-300
                                cursor-pointer transition-all
                              "
                            >
                              <Building2 className="mb-2 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                              <span className="font-semibold text-sm text-foreground">Serviço / Empresa</span>
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dados Principais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Categoria</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Pousadas, Guia de Turismo..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-[100px_1fr] gap-4">
                      {/* --- ÍCONE COM DIALOG E ROLAGEM VERTICAL --- */}
                      <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Ícone</FormLabel>
                            <Dialog open={isIconModalOpen} onOpenChange={setIsIconModalOpen}>
                              <DialogTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    type="button"
                                    id={field.name}
                                    className={cn(
                                      "w-full h-10 px-2 text-2xl justify-center",
                                      !field.value && "text-muted-foreground text-sm"
                                    )}
                                  >
                                    {field.value || <Smile className="h-5 w-5" />}
                                  </Button>
                                </FormControl>
                              </DialogTrigger>

                              {/* CONFIGURAÇÃO DO MODAL COM ROLAGEM */}
                              <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-hidden p-0">

                                <div className="px-6 pt-6 pb-2 shrink-0">
                                  <DialogHeader>
                                    <DialogTitle>Selecionar Ícone</DialogTitle>
                                  </DialogHeader>

                                  {/* Busca e Botão de Remover */}
                                  <div className="flex gap-2 py-4 items-center">
                                    <div className="relative flex-1">
                                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        placeholder="Buscar categoria ou nome..."
                                        className="pl-9"
                                        value={iconSearch}
                                        onChange={(e) => setIconSearch(e.target.value)}
                                      />
                                    </div>
                                    <Input
                                      placeholder="Colar"
                                      className="w-16 text-center text-xl p-0"
                                      maxLength={2}
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value)}
                                      title="Cole um emoji aqui"
                                    />
                                    {/* BOTÃO REMOVER ÍCONE */}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                      title="Remover Ícone"
                                      onClick={() => {
                                        form.setValue("icon", null);
                                        setIsIconModalOpen(false);
                                      }}
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </Button>
                                  </div>
                                </div>

                                {/* ÁREA DE SCROLL */}
                                <ScrollArea className="flex-1 w-full bg-muted/10">
                                  <div className="px-6 pb-6">
                                    <div className="space-y-8 pb-6">
                                      {Object.entries(filteredIcons).map(([category, icons]) => (
                                        icons.length > 0 && (
                                          <div key={category}>
                                            <h4 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2 mt-4 border-b pb-1">
                                              {category}
                                              <span className="text-[10px] opacity-50 font-normal">({icons.length})</span>
                                            </h4>

                                            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
                                              {icons.map((icon) => (
                                                <button
                                                  key={icon}
                                                  type="button"
                                                  onClick={() => {
                                                    form.setValue("icon", icon);
                                                    setIsIconModalOpen(false);
                                                  }}
                                                  className={cn(
                                                    "h-10 w-10 flex items-center justify-center rounded-md text-2xl transition-all hover:scale-110 border border-transparent hover:border-border hover:bg-white hover:shadow-sm cursor-pointer active:scale-95",
                                                    field.value === icon && "bg-primary/10 border-primary shadow-inner scale-105"
                                                  )}
                                                >
                                                  {icon}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        )
                                      ))}

                                      {/* Estado Vazio */}
                                      {Object.keys(filteredIcons).length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                          <Smile className="w-10 h-10 mb-2 opacity-20" />
                                          <p>Nenhum ícone encontrado.</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug (URL)</FormLabel>
                            <FormControl>
                              <Input {...field} className="font-mono text-sm bg-muted/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição Curta</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o propósito..."
                              className="resize-none min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* LADO DIREITO */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Hierarquia</CardTitle>
                    <CardDescription>
                      Organize onde esta categoria se encaixa.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="parent_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria Pai (Opcional)</FormLabel>
                          <Select
                            onValueChange={(val) => field.onChange(val === "root" ? null : val)}
                            value={field.value || "root"}
                            disabled={isLoadingParents}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={isLoadingParents ? "Carregando..." : "Selecione..."} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="root">
                                <span className="text-muted-foreground italic">-- Nenhuma (Categoria Raiz) --</span>
                              </SelectItem>
                              {parentCategories.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  <div className="flex items-center gap-2">
                                    {option.icon && <span>{option.icon}</span>}
                                    {option.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Só aparecem categorias raízes do tipo <strong>{selectedType}</strong>.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Preview Visual */}
                <div className="border rounded-lg p-4 bg-muted/20 border-dashed flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Preview Visual</span>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border rounded-full shadow-sm">
                    <span className="text-2xl">{iconValue || "❓"}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-sm">{nameValue || "Nome da Categoria"}</span>
                      <span className="text-[10px] text-muted-foreground leading-none">
                        {selectedType === 'pessoa' ? 'Observador Profissional' : 'Serviço/Local'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button {...saveButtonProps} size="sm" className="w-full md:w-auto">
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Categoria
              </Button>
            </div>
          </form>
        </Form>

      </div>
    </CreateView>
  );
}
