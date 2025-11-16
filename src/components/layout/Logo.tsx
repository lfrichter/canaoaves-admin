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
  const logoSizeClass = isLogin ? 'w-[80px] h-[80px]' : 'w-[30px] h-[30px]';
  const textSizeClass = isLogin ? 'text-lg' : 'text-xs';

  // --- 1. LÓGICA DO CONTAINER CORRIGIDA ---
  // A classe de layout agora depende se o 'showText' está ativo.
  const containerLayoutClass = isLogin
    ? 'flex flex-col items-center gap-2' // Login: Vertical com gap
    : showText
      ? 'flex items-center gap-2' // Header Aberto: Horizontal com gap
      : 'flex items-center justify-center'; // Header Fechado: Centralizado, sem gap

  return (
    // Aplicamos a nova classe de layout dinâmica
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

      {/* --- 2. RENDERIZAÇÃO CONDICIONAL DO TEXTO --- */}
      {/* O <span> agora é completamente removido do DOM quando 'showText' é falso.
        Isso remove o 'gap-2' e permite que o 'justify-center' (acima) funcione.
      */}
      {showText && (
        <span
          className={cn(
            "text-gray-200 font-bold whitespace-nowrap", // Adicionado whitespace-nowrap
            textSizeClass,
            "transition-opacity duration-200", // Mantém a animação de fade
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
