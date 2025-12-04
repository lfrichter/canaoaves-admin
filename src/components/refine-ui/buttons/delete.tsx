"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  type BaseKey,
  useDeleteButton,
  useInvalidate,
  useParsed
} from "@refinedev/core";
import { Loader2, Trash } from "lucide-react";
// [1] Importar o hook de rotas do Next.js
import { useRouter } from "next/navigation";
import React from "react";

type DeleteButtonProps = {
  resource?: string;
  recordItemId?: BaseKey;
  accessControl?: {
    enabled?: boolean;
    hideIfUnauthorized?: boolean;
  };
  onSuccess?: () => void;
  meta?: Record<string, unknown>;
} & React.ComponentProps<typeof Button>;

export const DeleteButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  DeleteButtonProps
>(({ resource: propResource, recordItemId, accessControl, meta, onSuccess, children, ...rest }, ref) => {

  const invalidate = useInvalidate();
  const { resource: urlResource } = useParsed();
  const router = useRouter(); // [2] Inicializar o router

  const resourceName = propResource ?? urlResource?.name;

  const {
    hidden,
    disabled,
    loading,
    onConfirm,
    label,
    confirmTitle: defaultConfirmTitle,
    confirmOkLabel: defaultConfirmOkLabel,
    cancelLabel: defaultCancelLabel,
  } = useDeleteButton({
    resource: resourceName,
    id: recordItemId,
    accessControl,
    meta,
    // [3] Interceptamos o sucesso
    onSuccess: () => {
      // Invalidação padrão do Refine (React Query)
      if (resourceName) {
        invalidate({
          resource: resourceName,
          invalidates: ["list", "many", "detail"],
        });

        // [4] Lógica específica para PROFILES
        if (resourceName === "profiles") {
          // Opção A (Recomendada): Atualiza os dados do servidor sem recarregar a página inteira
          router.refresh();

          // Opção B (Nuclear): Se a Opção A não funcionar, descomente a linha abaixo.
          // Isso fará o mesmo que você fez no RestoreButton (F5 na página).
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }

      if (onSuccess) {
        onSuccess();
      }
    }
  });

  const [open, setOpen] = React.useState(false);

  const isDisabled = disabled || rest.disabled || loading;
  const isHidden = hidden || rest.hidden;

  if (isHidden) return null;

  const confirmCancelText = defaultCancelLabel;
  const confirmOkText = defaultConfirmOkLabel;
  const confirmTitle = defaultConfirmTitle;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span>
          <Button
            variant="destructive"
            {...rest}
            ref={ref}
            disabled={isDisabled}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children ?? (
              <div className="flex items-center gap-2 font-semibold">
                <Trash className="h-4 w-4" />
                <span>{label}</span>
              </div>
            )}
          </Button>
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto" align="start">
        <div className="flex flex-col gap-2">
          <p className="text-sm">{confirmTitle}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              {confirmCancelText}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={loading}
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
            >
              {confirmOkText}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

DeleteButton.displayName = "DeleteButton";
