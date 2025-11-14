"use client";

import { cn } from "@/lib/utils";
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Canaoaves Logo"
          width={30}
          height={30}
          className="w-[30px] h-[30px]"
          priority
        />
      </Link>
      <span
        className={cn(
          "text-xs text-gray-600 font-bold transition-opacity duration-200",
          {
            "opacity-100": showText,
            "opacity-0": !showText,
          }
        )}
      >
        Administração
      </span>
    </div>
  );
};
