"use client";

import { cn } from "@/lib/utils";
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import logoImg from '../../../public/Logo-Canaoaves-small.png';

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

  // [CORREÇÃO 3]: Aumentei o tamanho do logo no modo colapsado.
  // Antes era h-[24px], agora é h-[40px] w-[40px] para ficar mais visível.
  const logoSizeClass = isLogin
    ? 'w-[80px] h-[80px]'
    : showText
      ? 'h-[30px] w-auto object-contain'
      : 'h-[40px] w-[40px] object-contain';

  const textSizeClass = isLogin ? 'text-lg' : 'text-xs';

  const containerLayoutClass = isLogin
    ? 'flex flex-col items-center gap-2'
    : showText
      ? 'flex items-center gap-2'
      : 'flex w-full items-center justify-center'; // Mantém centralizado SE estiver fechado

  return (
    <div className={cn(containerLayoutClass, className)}>
      {/* Link ocupa largura total se estiver fechado para garantir o clique */}
      <Link href="/" className={cn(!showText && "flex justify-center w-full")}>
        <Image
          src={logoImg}
          alt="Canaoaves Logo"
          width={logoSize}
          height={logoSize}
          className={cn(logoSizeClass, "transition-all duration-200")}
          priority
        />
      </Link>

      {showText && (
        <span
          className={cn(
            "font-bold whitespace-nowrap",
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
