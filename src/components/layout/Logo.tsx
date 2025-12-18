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

  // [CORREÇÃO TAMANHO]:
  // - Aberto: h-[30px] (discreto, alinhado com texto)
  // - Fechado: h-[45px] (Maior, para ser o protagonista da sidebar fechada)
  const logoSizeClass = isLogin
    ? 'w-[80px] h-[80px]'
    : showText
      ? 'h-[30px] w-auto object-contain'
      : 'h-[31px] w-[31px] object-contain';

  const containerLayoutClass = isLogin
    ? 'flex flex-col items-center gap-2'
    : showText
      ? 'flex items-center gap-2'
      : 'flex w-full items-center justify-center'; // Garante centro absoluto

  return (
    <div className={cn(containerLayoutClass, className)}>
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
            // Ajuste fino: Se o logo é pequeno (30px), texto xs ou sm fica melhor alinhado
            "text-sm",
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
