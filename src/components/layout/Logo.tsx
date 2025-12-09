"use client";

import { cn } from "@/lib/utils";
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type LogoProps = {
  className?: string;
  showText?: boolean;
  variant?: 'header' | 'login';
};

export const Logo: React.FC<LogoProps> = ({
  className = "",
  showText: showTextProp = true,
  variant = 'header'
}) => {

  const isLogin = variant === 'login';
  const showText = isLogin ? true : showTextProp;

  const logoSize = isLogin ? 80 : 30;
  const logoSizeClass = isLogin ? 'w-[80px] h-[80px]' : 'h-[30px] w-auto';
  const textSizeClass = isLogin ? 'text-lg' : 'text-xs';

  const containerLayoutClass = isLogin
    ? 'flex flex-col items-center gap-2'
    : showText
      ? 'flex items-center gap-2'
      : 'flex items-center justify-center';

  return (
    <div className={cn(containerLayoutClass, className)}>
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Canaoaves Logo"
          width={logoSize}
          height={logoSize}
          className={logoSizeClass}
          priority
        />
      </Link>

      {showText && (
        <span
          className={cn(
            "font-bold whitespace-nowrap",
            // [CORREÇÃO] Substituído cores fixas por semânticas
            // 'text-foreground' garante legibilidade perfeita em qualquer tema
            "text-foreground",
            textSizeClass,
            "transition-opacity duration-200",
            {
              "opacity-100": showText,
              "opacity-0": !showText,
            }
          )}
        >
          Administração
        </span>
      )}
    </div>
  );
};
