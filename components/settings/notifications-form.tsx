'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const notificationsFormSchema = z.object({
  communication_emails: z.boolean().default(true).optional(),
  marketing_emails: z.boolean().default(false).optional(),
  social_emails: z.boolean().default(false).optional(),
  security_emails: z.boolean().default(true).optional(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

// This can come from your database
const defaultValues: Partial<NotificationsFormValues> = {
  communication_emails: true,
  marketing_emails: false,
  social_emails: false,
  security_emails: true,
};

export function NotificationsForm() {
  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues,
  });

  async function onSubmit(data: NotificationsFormValues) {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update notifications');
      }

      toast({
        type: 'success',
        description: "Notification preferences updated.",
      });
    } catch (error) {
      toast({
        type: 'error',
        description: "Failed to update notification preferences.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you receive notifications.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose what types of emails you&apos;d like to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="communication_emails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 md:space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-0.5 md:space-y-1 leading-none">
                      <FormLabel className="text-sm md:text-base">Communication emails</FormLabel>
                      <FormDescription className="text-xs md:text-sm">
                        Receive emails about your account&apos;s activity and conversations.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marketing_emails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 md:space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-0.5 md:space-y-1 leading-none">
                      <FormLabel className="text-sm md:text-base">Marketing emails</FormLabel>
                      <FormDescription className="text-xs md:text-sm">
                        Receive emails about new features, tips, and promotions.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="social_emails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 md:space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-0.5 md:space-y-1 leading-none">
                      <FormLabel className="text-sm md:text-base">Social emails</FormLabel>
                      <FormDescription className="text-xs md:text-sm">
                        Receive emails for community updates and social features.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="security_emails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 md:space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled
                      />
                    </FormControl>
                    <div className="space-y-0.5 md:space-y-1 leading-none">
                      <FormLabel className="text-sm md:text-base">Security emails</FormLabel>
                      <FormDescription className="text-xs md:text-sm">
                        Receive emails about your account security and important updates.
                        These cannot be disabled.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Button type="submit">Update preferences</Button>
        </form>
      </Form>
    </div>
  );
} 