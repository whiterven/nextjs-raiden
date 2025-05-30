'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/toast";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function AccountForm() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function deleteAllChats() {
    try {
      const response = await fetch('/api/user/chats', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chats');
      }

      toast({
        type: 'success',
        description: "All your chats have been deleted.",
      });
    } catch (error) {
      toast({
        type: 'error',
        description: "Failed to delete chats.",
      });
    }
  }

  async function deleteAccount() {
    try {
      setIsDeleting(true);
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      await signOut({ redirect: false });
      router.push('/');
      toast({
        type: 'success',
        description: "Your account has been deleted.",
      });
    } catch (error) {
      toast({
        type: 'error',
        description: "Failed to delete account.",
      });
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base md:text-lg font-medium">Delete Chat History</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Delete all your chat history. This action cannot be undone.
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={deleteAllChats}
          disabled={isDeleting}
          className="w-full md:w-auto"
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Deleting...
            </>
          ) : (
            'Delete All Chats'
          )}
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base md:text-lg font-medium">Delete Account</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={deleteAccount}
          disabled={isDeleting}
          className="w-full md:w-auto"
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Deleting...
            </>
          ) : (
            'Delete Account'
          )}
        </Button>
      </div>
    </div>
  );
} 