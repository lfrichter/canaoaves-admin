"use client";

import { Button } from "@/components/ui/button";
import { type BaseKey, useCreateButton } from "@refinedev/core";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

type CreateButtonProps = {
  /**
   * Resource name for API data interactions. `identifier` of the resource can be used instead of the `name` of the resource.
   * @default Inferred resource name from the route
   */
  resource?: BaseKey;
  /**
   * Access Control configuration for the button
   * @default `{ enabled: true, hideIfUnauthorized: false }`
   */
  accessControl?: {
    enabled?: boolean;
    hideIfUnauthorized?: boolean;
  };
  /**
   * `meta` property is used when creating the URL for the related action and path.
   */
  meta?: Record<string, unknown>;
} & React.ComponentProps<typeof Button>;

export const CreateButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  CreateButtonProps
>(({ resource, accessControl, meta, children, onClick, ...rest }, ref) => {
  const router = useRouter();
  const { hidden, disabled, to, label } = useCreateButton({
    resource,
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
          <Plus className="w-4 h-4" />
          <span>
            Criar
            {/* {label ?? "Criar"} */}
          </span>
        </div>
      )}
    </Button>
  );
});

CreateButton.displayName = "CreateButton";
