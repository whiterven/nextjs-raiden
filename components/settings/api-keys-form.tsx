'use client';

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { toast } from "@/components/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Plus, Trash2, Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const apiKeyFormSchema = z.object({
  service: z
    .string()
    .min(1, { message: "Service name is required" })
    .max(50, { message: "Service name must not be longer than 50 characters" }),
  key: z
    .string()
    .min(1, { message: "API key is required" }),
});

type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;

type ApiKey = {
  id: string;
  service: string;
  createdAt: string;
};

// Common service name suggestions for the form
const SERVICE_SUGGESTIONS = [
  { name: "github", description: "GitHub API access" },
  { name: "GITHUB_TOKEN", description: "Alternative name for GitHub" },
  { name: "slack", description: "Slack integration" },
  { name: "clickup", description: "ClickUp tasks integration" },
];

export function ApiKeysForm() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState("");
  
  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      service: "",
      key: "",
    },
  });

  // Update the form with the selected suggestion
  useEffect(() => {
    if (selectedSuggestion) {
      form.setValue("service", selectedSuggestion);
    }
  }, [selectedSuggestion, form]);

  // Fetch API keys on component mount
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await fetch('/api/user/keys');
        if (!response.ok) {
          throw new Error('Failed to fetch API keys');
        }
        const data = await response.json();
        setApiKeys(data);
      } catch (error) {
        toast({
          type: 'error',
          description: "Failed to load API keys.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKeys();
  }, []);

  async function onSubmit(data: ApiKeyFormValues) {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/user/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to add API key');
      }

      // Refresh the API keys list
      const updatedKeysResponse = await fetch('/api/user/keys');
      const updatedKeys = await updatedKeysResponse.json();
      setApiKeys(updatedKeys);

      form.reset();
      setDialogOpen(false);
      
      toast({
        type: 'success',
        description: "API key added successfully.",
      });
    } catch (error) {
      toast({
        type: 'error',
        description: "Failed to add API key.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteApiKey(id: string) {
    try {
      const response = await fetch(`/api/user/keys?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      // Update the local state to reflect the deletion
      setApiKeys(apiKeys.filter(key => key.id !== id));
      
      toast({
        type: 'success',
        description: "API key deleted successfully.",
      });
    } catch (error) {
      toast({
        type: 'error',
        description: "Failed to delete API key.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">API Keys</h3>
        <p className="text-sm text-muted-foreground">
          Manage your API keys for third-party services.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Store your API keys securely for use with external services.
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4 mr-1" />
                Add Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add API Key</DialogTitle>
                <DialogDescription>
                  Add a new API key for a third-party service. Keys are stored securely.
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 mb-4">
                <div className="text-sm font-medium mb-2">Suggested services:</div>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_SUGGESTIONS.map((suggestion) => (
                    <TooltipProvider key={suggestion.name}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedSuggestion(suggestion.name)}
                            className={`text-xs ${form.getValues("service") === suggestion.name ? "bg-primary/10 border-primary" : ""}`}
                          >
                            {suggestion.name}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{suggestion.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Name</FormLabel>
                        <FormControl>
                          <Input placeholder="github, GITHUB_TOKEN, etc." {...field} />
                        </FormControl>
                        <FormDescription>
                          Name of the service this API key is for.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your API key" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your API key will be stored securely.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Adding..." : "Add API Key"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading API keys...</div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No API keys found. Add your first API key to get started.
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              {/* Desktop view - Full table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Key className="size-4 mr-2 text-muted-foreground" />
                            {apiKey.service}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(apiKey.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the API key for {apiKey.service}? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteApiKey(apiKey.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Mobile view - Card style list */}
              <div className="md:hidden">
                <div className="divide-y">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Key className="size-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">{apiKey.service}</span>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the API key for {apiKey.service}? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteApiKey(apiKey.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Added: {new Date(apiKey.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 