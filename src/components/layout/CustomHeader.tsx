"use client";

import React from 'react';
import { UserAvatar } from "@/components/refine-ui/layout/user-avatar";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import {
  useActiveAuthProvider,
  useGetIdentity,
  useLogout,
  useMenu,
} from "@refinedev/core";
import { LogOutIcon } from "lucide-react";
import Link from "next/link";

// Logo Component (defined inline for simplicity)
const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={cn("flex w-[120px] h-[90px] flex-col justify-center items-center gap-1.5 relative max-sm:mb-5", className)}>
      <a href="/">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/1f88cd11f8a5df44a75646386760f0de82578a46?width=170"
          alt="Canaoaves Logo"
          className="w-[60px] h-[60px] absolute left-[30px] -top-0.5"
        />
        <h1 className="w-[120px] h-[30px] text-black text-[24px] font-normal absolute text-center left-0 top-[58px]">
          Canaoaves
        </h1>
      </a>
    </div>
  );
};

// Horizontal Menu Component
function HorizontalMenu() {
  const { menuItems } = useMenu();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {menuItems.map((item) => (
          <NavigationMenuItem key={item.key}>
            <Link href={item.route || "/"} legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {item.label}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

// User Info Component
const User = () => {
  const { data: user } = useGetIdentity<{ name: string; email: string }>();
  return (
    <div className="flex items-center gap-2">
      <UserAvatar />
      <span className="text-sm font-medium">{user?.name ?? user?.email}</span>
    </div>
  );
};

// User Dropdown Component
const UserDropdown = () => {
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const authProvider = useActiveAuthProvider();

  if (!authProvider?.getIdentity) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <User />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            logout();
          }}
          className="flex items-center gap-2 cursor-pointer text-destructive"
        >
          <LogOutIcon className="h-4 w-4" />
          <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const CustomHeader = () => {
  return (
    <header
      className={cn(
        "sticky",
        "top-0",
        "flex",
        "h-24", // Increased height
        "shrink-0",
        "items-center",
        "gap-4",
        "border-b",
        "border-border",
        "bg-sidebar",
        "px-4", // Added horizontal padding
        "justify-between", // Changed from justify-end
        "z-40"
      )}
    >
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <Logo />
        <h2 className="text-xl font-bold">Administração</h2>
      </div>

      {/* Center */}
      <div className="flex-1 flex justify-center">
        <HorizontalMenu />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserDropdown />
      </div>
    </header>
  );
};

CustomHeader.displayName = "CustomHeader";