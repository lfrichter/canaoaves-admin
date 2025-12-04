"use client";

import { Button } from "@/components/ui/button";
import {
  type BaseKey,
  useApiUrl,
  useCustomMutation,
  useInvalidate,
  useParsed,
  useTranslate,
} from "@refinedev/core";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

type RestoreButtonProps = {
  resource?: string;
  recordItemId: BaseKey;
  values?: Record<string, unknown>;
  onSuccess?: () => void;
} & React.ComponentProps<typeof Button>;

export const RestoreButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  RestoreButtonProps
>(
  (
    {
      resource: propResource,
      recordItemId,
      values = { deletedAt: null },
      onSuccess,
      children,
      onClick,
      ...rest
    },
    ref
  ) => {
    const translate = useTranslate();
    const apiUrl = useApiUrl();
    const { resource: urlResource } = useParsed();
    const invalidate = useInvalidate(); // <--- 2. Inicialize o hook
    const router = useRouter(); // <--- Opcional: para garantir refresh do Next.js

    // Define o recurso e a URL manualmente para garantir o formato correto
    const resourceName = propResource ?? urlResource?.name;

    // Usamos useCustomMutation para ter controle total sobre o Request
    const { mutate, isLoading } = useCustomMutation();

    const handleRestore = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);
        return;
      }

      if (!resourceName) return;

      mutate(
        {
          // Forçamos a URL correta: apiUrl + recurso + ID
          url: `${apiUrl}/${resourceName}/${recordItemId}`,
          // Forçamos o método PATCH (padrão para atualizações parciais)
          method: "patch",
          // Enviamos apenas o objeto de valores, sem arrays estranhos
          values: values,
          successNotification: {
            message: translate("notifications.restoreSuccess", "Registro restaurado"),
            description: translate("notifications.restoreSuccessDescription", "Sucesso ao restaurar registro"),
            type: "success",
          },
        },
        {
          onSuccess: () => {
            // Avisa o Refine que os dados de "list", "many" e "detail" desse recurso estão velhos
            invalidate({
              resource: resourceName,
              invalidates: ["list", "many", "detail"],
            });

            // Opcional: Se sua lista depender de dados do servidor (Server Components)
            router.refresh();

            if (onSuccess) onSuccess();
            // Opcional: Recarregar a página se o Refine não atualizar a lista automaticamente
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          },
        }
      );
    };

    return (
      <Button
        {...rest}
        ref={ref}
        disabled={isLoading || rest.disabled}
        onClick={handleRestore}
        variant="outline"
      >
        {children ?? (
          <div className="flex items-center gap-2 font-semibold">
            <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>{translate("buttons.restore", "Restaurar")}</span>
          </div>
        )}
      </Button>
    );
  }
);

RestoreButton.displayName = "RestoreButton";
