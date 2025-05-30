'use client';

import { useTheme } from 'next-themes';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SunIcon, MoonIcon, MonitorIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function AppearanceForm() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize how BineAI looks on your device.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Select the theme for your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <RadioGroup
            defaultValue={theme}
            onValueChange={(value) => setTheme(value)}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem
                value="light"
                id="light"
                className="peer sr-only"
              />
              <Label
                htmlFor="light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-3 md:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <SunIcon className="size-5 md:size-6" />
                <div className="mt-2 space-y-1">
                  <p className="text-sm md:text-base font-medium leading-none">Light</p>
                </div>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="dark"
                id="dark"
                className="peer sr-only"
              />
              <Label
                htmlFor="dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-3 md:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <MoonIcon className="size-5 md:size-6" />
                <div className="mt-2 space-y-1">
                  <p className="text-sm md:text-base font-medium leading-none">Dark</p>
                </div>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="system"
                id="system"
                className="peer sr-only"
              />
              <Label
                htmlFor="system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-3 md:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <MonitorIcon className="size-5 md:size-6" />
                <div className="mt-2 space-y-1">
                  <p className="text-sm md:text-base font-medium leading-none">System</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
} 