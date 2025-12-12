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
  hideText?: boolean; // [MELHORIA] Adicionado suporte oficial a hideText
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
      hideText = false, // Padrão false
      ...rest
    },
    ref
  ) => {
    const translate = useTranslate();
    const apiUrl = useApiUrl();
    const { resource: urlResource } = useParsed();
    const invalidate = useInvalidate();
    const router = useRouter();

    const resourceName = propResource ?? urlResource?.name;

    // [CORREÇÃO] 'as any' para ignorar o erro de tipagem do isLoading
    const { mutate, isLoading } = useCustomMutation() as any;

    const handleRestore = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);
        return;
      }

      if (!resourceName) return;

      mutate(
        {
          url: `${apiUrl}/${resourceName}/${recordItemId}`,
          method: "patch",
          values: values,
          successNotification: {
            message: translate("notifications.restoreSuccess", "Registro restaurado"),
            description: translate("notifications.restoreSuccessDescription", "Sucesso ao restaurar registro"),
            type: "success",
          },
        },
        {
          onSuccess: () => {
            invalidate({
              resource: resourceName,
              invalidates: ["list", "many", "detail"],
            });

            router.refresh();

            if (onSuccess) onSuccess();

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
        title={translate("buttons.restore", "Restaurar")} // Tooltip nativo se não tiver texto
      >
        <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""} ${!hideText && children ? "mr-2" : ""}`} />
        {!hideText && (children ?? <span>{translate("buttons.restore", "Restaurar")}</span>)}
      </Button>
    );
  }
);

RestoreButton.displayName = "RestoreButton";
