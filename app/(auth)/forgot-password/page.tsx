'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsSubmitted(true);
      } else {
        toast({
          type: 'error',
          description: data.message || 'Something went wrong. Please try again.',
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to send reset email. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-8">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <button
            onClick={() => router.back()}
            className="self-start text-gray-600 hover:underline dark:text-zinc-400"
          >
            Back
          </button>
          <h3 className="text-xl font-semibold dark:text-zinc-50">Reset Password</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {isSubmitted
              ? "We've sent you an email with instructions to reset your password."
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="text-sm font-medium text-gray-700 dark:text-zinc-300"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email" 
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
            
            <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
              Remember your password?{' '}
              <Link
                href="/login"
                className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
              >
                Sign in
              </Link>
            </p>
          </form>
        ) : (
          <div className="flex flex-col gap-4 px-4 sm:px-16">
            <Button 
              onClick={() => router.push('/login')} 
              variant="outline"
              className="w-full"
            >
              Return to login
            </Button>
            
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              variant="ghost"
              className="w-full"
            >
              Try another email
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}