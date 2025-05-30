'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProfileForm } from '@/components/settings/profile-form';
import { AppearanceForm } from '@/components/settings/appearance-form';
import { AccountForm } from '@/components/settings/account-form';
import { NotificationsForm } from '@/components/settings/notifications-form';
import { LanguageForm } from '@/components/settings/language-form';
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="container px-4 md:px-6 py-6 md:py-10 max-w-6xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className="size-8 md:size-9"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="space-y-0.5">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>
      <Separator className="my-4 md:my-6" />
      <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex h-9 md:h-10 items-center justify-start w-auto p-1 bg-muted/50 mb-2 md:mb-0">
            <TabsTrigger value="profile" className="text-sm">Profile</TabsTrigger>
            <TabsTrigger value="account" className="text-sm">Account</TabsTrigger>
            <TabsTrigger value="appearance" className="text-sm">Appearance</TabsTrigger>
            <TabsTrigger value="notifications" className="text-sm">Notifications</TabsTrigger>
            <TabsTrigger value="language" className="text-sm">Language</TabsTrigger>
          </TabsList>
        </ScrollArea>
        <TabsContent value="profile" className="space-y-4 md:space-y-6">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="account" className="space-y-4 md:space-y-6">
          <AccountForm />
        </TabsContent>
        <TabsContent value="appearance" className="space-y-4 md:space-y-6">
          <AppearanceForm />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4 md:space-y-6">
          <NotificationsForm />
        </TabsContent>
        <TabsContent value="language" className="space-y-4 md:space-y-6">
          <LanguageForm />
        </TabsContent>
      </Tabs>
    </div>
  );
} 