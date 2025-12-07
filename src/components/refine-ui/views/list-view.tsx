"use client";

import type { PropsWithChildren } from "react";

import { CreateButton } from "@/components/refine-ui/buttons/create";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useResourceParams, useUserFriendlyName } from "@refinedev/core";

type ListViewProps = PropsWithChildren<{
  className?: string;
}>;

export function ListView({ children, className }: ListViewProps) {
  return (
    <div className={cn("flex flex-col", "gap-4", "p-4 md:p-6 lg:p-8", className)}>
      {children}
    </div>
  );
}

type ListHeaderProps = PropsWithChildren<{
  resource?: string;
  title?: string;
  canCreate?: boolean;
  headerClassName?: string;
  wrapperClassName?: string;
}>;

export const ListViewHeader = ({
  children, // [NOVO] Aceita componentes extras (ex: SearchInput)
  canCreate,
  resource: resourceFromProps,
  title: titleFromProps,
  wrapperClassName,
  headerClassName,
}: ListHeaderProps) => {
  const getUserFriendlyName = useUserFriendlyName();

  const { resource, identifier } = useResourceParams({
    resource: resourceFromProps,
  });
  const resourceName = identifier ?? resource?.name;

  const isCreateButtonVisible = canCreate === true && !!resource?.create;

  const title =
    titleFromProps ??
    getUserFriendlyName(
      resource?.meta?.label ?? identifier ?? resource?.name,
      "plural"
    );

  return (
    <div className={cn("flex flex-col w-full", "gap-4", wrapperClassName)}>
      {/* Linha do Breadcrumb */}
      <div className="flex items-center relative gap-2">
        <div className="bg-background z-[2] pr-4">
          <Breadcrumb />
        </div>
        <Separator className={cn("absolute", "left-0", "right-0", "z-[1]")} />
      </div>

      {/* Cabeçalho Responsivo */}
      <div
        className={cn(
          "flex flex-col w-full gap-4 md:flex-row md:items-center md:justify-between",
          headerClassName
        )}
      >
        <h2 className="text-2xl font-bold">{title}</h2>

        {/* Container de Ações (Search + Create) */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-stretch sm:items-center">
          {/* Renderiza o SearchInput ou outros filtros aqui */}
          {children}

          {isCreateButtonVisible && (
            <div className="flex-shrink-0">
              <CreateButton resource={resourceName} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ListView.displayName = "ListView";
