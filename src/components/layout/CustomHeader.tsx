"use client";

import { Logo } from "@/components/layout/Logo";
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
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  useActiveAuthProvider,
  useGetIdentity,
  useLogout,
  useMenu,
} from "@refinedev/core";
import { LogOutIcon } from "lucide-react";
import Link from "next/link";

// Horizontal Menu Component (for desktop)
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

// Logout Button Component
const LogoutButton = () => {
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  return (
    <button
      className="flex items-center gap-2 cursor-pointer text-sm font-medium text-destructive"
      onClick={() => logout()}
      disabled={isLoggingOut}
    >
      <LogOutIcon className="h-4 w-4" />
      <span>{isLoggingOut ? "Saindo..." : "Desconectar"}</span>
    </button>
  );
};

// Main Header Component
export const CustomHeader = () => {
  const { isMobile } = useSidebar();
  return isMobile ? <MobileCustomHeader /> : <DesktopCustomHeader />;
};

// Desktop Header
const DesktopCustomHeader = () => {
  const { open } = useSidebar();

  return (
    <header
      className={cn(
        "sticky", "top-0", "flex", "h-16", "shrink-0", "items-center",
        "gap-4", "border-b", "border-border", "bg-sidebar", "px-6",
        "justify-between", "z-40"
      )}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger /> {/* SidebarTrigger remains */}
        {/* Logo removed */}
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <User />
        <LogoutButton />
      </div>
    </header>
  );
};

// Mobile Header
const MobileCustomHeader = () => {
  return (
    <header
      className={cn(
        "sticky", "top-0", "flex", "h-16", "items-center", "justify-between",
        "border-b", "border-border", "bg-sidebar", "px-4", "z-40"
      )}
    >
      <div className="flex items-center gap-2">
        {/* SidebarTrigger removed */}
        {/* Logo removed */}
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <User />
        <LogoutButton />
      </div>
    </header>
  );
};

CustomHeader.displayName = "CustomHeader";