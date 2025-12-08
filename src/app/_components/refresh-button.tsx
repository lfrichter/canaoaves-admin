"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";

export function RefreshButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Previne comportamento padrão caso esteja dentro de um form, por exemplo
    e.preventDefault();

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline" // Padrão visual (pode ser sobrescrito via props)
      onClick={handleRefresh}
      disabled={isPending || props.disabled}
      className={cn(className)}
      {...props}
    >
      {children ?? (
        <div className="flex items-center gap-2">
          <RefreshCcw
            className={cn("h-4 w-4", {
              "animate-spin": isPending,
            })}
          />
          <span>{isPending ? "Atualizando..." : "Atualizar"}</span>
        </div>
      )}
    </Button>
  );
}
