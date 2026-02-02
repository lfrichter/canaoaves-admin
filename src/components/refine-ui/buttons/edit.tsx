"use client";

import { Button } from "@/components/ui/button";
import { type BaseKey, useEditButton } from "@refinedev/core";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

type EditButtonProps = {
  resource?: BaseKey;
  recordItemId?: BaseKey;
  accessControl?: {
    enabled?: boolean;
    hideIfUnauthorized?: boolean;
  };
  meta?: Record<string, unknown>;
} & React.ComponentProps<typeof Button>;

export const EditButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  EditButtonProps
>(({ resource, recordItemId, accessControl, meta, children, onClick, ...rest }, ref) => {
  const router = useRouter();
  const { hidden, disabled, to } = useEditButton({
    resource,
    id: recordItemId,
    accessControl,
    meta,
  });

  const isDisabled = disabled || rest.disabled;
  const isHidden = hidden || rest.hidden;

  if (isHidden) return null;

  return (
    <Button
      {...rest}
      ref={ref}
      disabled={isDisabled}
      onClick={(e) => {
        if (isDisabled) {
          e.preventDefault();
          return;
        }
        if (onClick) {
          onClick(e);
        } else {
          router.push(to);
        }
      }}
    >
      {children ?? (
        <div className="flex items-center gap-2 font-semibold">
          <Edit className="w-4 h-4" />
          <span>Editar</span>
        </div>
      )}
    </Button>
  );
});

EditButton.displayName = "EditButton";