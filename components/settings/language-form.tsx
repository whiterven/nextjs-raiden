'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
] as const;

const languageFormSchema = z.object({
  language: z.string({
    required_error: "Please select a language.",
  }),
});

type LanguageFormValues = z.infer<typeof languageFormSchema>;

// This can come from your database or user preferences
const defaultValues: Partial<LanguageFormValues> = {
  language: "en",
};

export function LanguageForm() {
  const form = useForm<LanguageFormValues>({
    resolver: zodResolver(languageFormSchema),
    defaultValues,
  });

  async function onSubmit(data: LanguageFormValues) {
    try {
      const response = await fetch('/api/user/language', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update language');
      }

      toast({
        type: 'success',
        description: "Your language preference has been updated.",
      });
    } catch (error) {
      toast({
        type: 'error',
        description: "Failed to update language preference.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Language</h3>
        <p className="text-sm text-muted-foreground">
          Select your preferred language for the interface.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Language Preference</CardTitle>
              <CardDescription>
                Choose the language you&apos;d like to use in the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base">Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full md:w-[240px]">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language.value} value={language.value}>
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs md:text-sm">
                      Choose your preferred language. This will affect the app&apos;s interface.
                    </FormDescription>
                    <FormMessage className="text-xs md:text-sm" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Button type="submit">Update language</Button>
        </form>
      </Form>
    </div>
  );
} 