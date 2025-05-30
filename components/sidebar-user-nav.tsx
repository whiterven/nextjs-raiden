'use client';

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  ChevronUp,
  Loader2
} from "lucide-react";
import type { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRouter } from 'next/navigation';
import { guestRegex } from '@/lib/constants';
import { getUserByEmail } from '@/app/(auth)/actions';

export function SidebarUserNav({ user }: { user: User }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { setTheme, theme } = useTheme();
  const { isMobile } = useSidebar();
  const isGuest = guestRegex.test(session?.user?.email ?? '');
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      if (session?.user?.email) {
        const userData = await getUserByEmail(session.user.email);
        setDbUser(userData);
      }
      setLoading(false);
    }
    fetchUser();
  }, [session?.user?.email]);

  const displayName = dbUser?.firstName && dbUser?.lastName 
    ? `${dbUser.firstName} ${dbUser.lastName}`
    : session?.user?.email;

  if (status === 'loading' || loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10 justify-between">
            <div className="flex flex-row gap-2">
              <div className="size-6 bg-zinc-500/30 rounded-full animate-pulse" />
              <span className="bg-zinc-500/30 text-transparent rounded-md animate-pulse">
                Loading auth status
              </span>
            </div>
            <Loader2 className="animate-spin text-zinc-500" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (isGuest) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                data-testid="user-nav-button"
                className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} alt="Guest" />
                  <AvatarFallback>G</AvatarFallback>
                </Avatar>
                <span data-testid="user-email" className="truncate">
                  Guest
                </span>
                <ChevronUp className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              data-testid="user-nav-menu"
              side="top"
              className="w-[--radix-popper-anchor-width]"
            >
              <DropdownMenuItem
                data-testid="user-nav-item-theme"
                className="cursor-pointer"
                onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild data-testid="user-nav-item-auth">
                <button
                  type="button"
                  className="w-full cursor-pointer"
                  onClick={() => router.push('/login')}
                >
                  Login to your account
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={`https://avatar.vercel.sh/${session?.user?.email}`} alt={session?.user?.email ?? ''} />
                <AvatarFallback className="rounded-lg">
                  {session?.user?.email?.charAt(0).toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs">{session?.user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={`https://avatar.vercel.sh/${session?.user?.email}`} alt={session?.user?.email ?? ''} />
                  <AvatarFallback className="rounded-lg">
                    {session?.user?.email?.charAt(0).toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs">{session?.user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <BadgeCheck className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                signOut({
                  redirectTo: '/',
                });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
