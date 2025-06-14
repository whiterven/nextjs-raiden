'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { toast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Loading fallback component
function ResetPasswordLoading() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-8 items-center">
        <div className="animate-pulse w-32 h-8 bg-gray-200 rounded dark:bg-zinc-800"></div>
        <div className="animate-pulse w-64 h-64 bg-gray-200 rounded-lg dark:bg-zinc-800"></div>
      </div>
    </div>
  );
}

// Main content component that uses searchParams
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation functions
  const isPasswordValid = () => password.length >= 8;
  const doPasswordsMatch = () => password === confirmPassword;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!token) {
      toast({
        type: 'error',
        description: 'Invalid or missing reset token. Please request a new password reset link.',
      });
      return;
    }
    
    if (!isPasswordValid()) {
      toast({
        type: 'error',
        description: 'Password must be at least 8 characters long.',
      });
      return;
    }
    
    if (!doPasswordsMatch()) {
      toast({
        type: 'error',
        description: 'Passwords do not match.',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsSuccess(true);
        toast({
          type: 'success',
          description: 'Your password has been reset successfully.',
        });
      } else {
        toast({
          type: 'error',
          description: data.message || 'Failed to reset password. The link may have expired.',
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-8">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            {isSuccess ? 'Password Reset Complete' : 'Reset Your Password'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {isSuccess 
              ? 'Your password has been successfully reset.' 
              : 'Please enter a new password for your account.'}
          </p>
        </div>
        
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="text-sm font-medium text-gray-700 dark:text-zinc-300"
              >
                New Password
              </label>
              <Input
                id="password"
                type="password" 
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full"
              />
              {password && !isPasswordValid() && (
                <p className="text-xs text-red-500">
                  Password must be at least 8 characters long
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label 
                htmlFor="confirmPassword" 
                className="text-sm font-medium text-gray-700 dark:text-zinc-300"
              >
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password" 
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full"
              />
              {confirmPassword && !doPasswordsMatch() && (
                <p className="text-xs text-red-500">
                  Passwords do not match
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-4 px-4 sm:px-16">
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              Sign in with your new password
            </Button>
          </div>
        )}
        
        <p className="text-center text-sm text-gray-600 px-4 sm:px-16 dark:text-zinc-400">
          {!isSuccess && "If you didn't request a password reset, you can safely ignore this page."}
        </p>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}