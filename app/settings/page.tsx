'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";
import { ProfileForm } from '@/components/settings/profile-form';
import { AppearanceForm } from '@/components/settings/appearance-form';
import { AccountForm } from '@/components/settings/account-form';
import { NotificationsForm } from '@/components/settings/notifications-form';
import { LanguageForm } from '@/components/settings/language-form';
import { ApiKeysForm } from '@/components/settings/api-keys-form';
import IntegrationsManager from '@/components/settings/integrations-manager';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Check if we're on a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

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

      {isMobile ? (
        // Mobile: Use a hamburger menu with Sheet component
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <div className="font-medium">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[240px]">
                <div className="py-4 space-y-2">
                  <h3 className="font-medium mb-2">Settings</h3>
                  <div className="flex flex-col space-y-1">
                    <Button 
                      variant={activeTab === "profile" ? "default" : "ghost"} 
                      className="justify-start" 
                      onClick={() => setActiveTab("profile")}
                    >
                      Profile
                    </Button>
                    <Button 
                      variant={activeTab === "account" ? "default" : "ghost"} 
                      className="justify-start" 
                      onClick={() => setActiveTab("account")}
                    >
                      Account
                    </Button>
                    <Button 
                      variant={activeTab === "appearance" ? "default" : "ghost"} 
                      className="justify-start" 
                      onClick={() => setActiveTab("appearance")}
                    >
                      Appearance
                    </Button>
                    <Button 
                      variant={activeTab === "notifications" ? "default" : "ghost"} 
                      className="justify-start" 
                      onClick={() => setActiveTab("notifications")}
                    >
                      Notifications
                    </Button>
                    <Button 
                      variant={activeTab === "language" ? "default" : "ghost"} 
                      className="justify-start" 
                      onClick={() => setActiveTab("language")}
                    >
                      Language
                    </Button>
                    <Button 
                      variant={activeTab === "api-keys" ? "default" : "ghost"} 
                      className="justify-start" 
                      onClick={() => setActiveTab("api-keys")}
                    >
                      API Keys
                    </Button>
                    <Button 
                      variant={activeTab === "integrations" ? "default" : "ghost"} 
                      className="justify-start" 
                      onClick={() => setActiveTab("integrations")}
                    >
                      Integrations
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
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
          <TabsContent value="api-keys" className="space-y-4 md:space-y-6">
            <ApiKeysForm />
          </TabsContent>
          <TabsContent value="integrations" className="space-y-4 md:space-y-6">
            <IntegrationsManager />
          </TabsContent>
        </Tabs>
      ) : (
        // Desktop: Use standard tabs
        <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-9 md:h-10 items-center justify-start w-auto p-1 bg-muted/50 mb-2 md:mb-0">
              <TabsTrigger value="profile" className="text-sm">Profile</TabsTrigger>
              <TabsTrigger value="account" className="text-sm">Account</TabsTrigger>
              <TabsTrigger value="appearance" className="text-sm">Appearance</TabsTrigger>
              <TabsTrigger value="notifications" className="text-sm">Notifications</TabsTrigger>
              <TabsTrigger value="language" className="text-sm">Language</TabsTrigger>
              <TabsTrigger value="api-keys" className="text-sm">API Keys</TabsTrigger>
              <TabsTrigger value="integrations" className="text-sm">Integrations</TabsTrigger>
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
          <TabsContent value="api-keys" className="space-y-4 md:space-y-6">
            <ApiKeysForm />
          </TabsContent>
          <TabsContent value="integrations" className="space-y-4 md:space-y-6">
            <IntegrationsManager />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 