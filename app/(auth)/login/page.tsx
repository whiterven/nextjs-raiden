'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from '@/components/toast';
import { ArrowLeft } from 'lucide-react';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';

import { login, type LoginActionState } from '../actions';
import { useSession } from 'next-auth/react';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );

  const { update: updateSession } = useSession();

  useEffect(() => {
    if (state.status === 'failed') {
      toast({
        type: 'error',
        description: 'Invalid credentials!',
      });
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Failed validating your submission!',
      });
    } else if (state.status === 'success') {
      setIsSuccessful(true);
      updateSession();
      router.refresh();
    }
  }, [state.status, updateSession, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background relative">
      {/* Beautiful Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        {/* Welcome Section */}
        <div className="flex flex-col items-center justify-center gap-4 px-4 text-center sm:px-16">
          <div className="mb-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              Welcome Back! 👋
            </h2>
          </div>
          <h3 className="text-xl font-semibold dark:text-zinc-50">Jump Back In</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Ready to continue your journey? Sign in to your account
          </p>
        </div>
        
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
          
          {/* Terms and Privacy Policy */}
          <p className="text-center text-xs text-gray-500 dark:text-zinc-500 mt-4 leading-relaxed">
            By clicking continue, you agree to our{' '}
            <Link
              href="/terms"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 hover:underline-offset-4 transition-all"
            >
              Terms of Service
            </Link>
            {' and '}
            <Link
              href="/privacy"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 hover:underline-offset-4 transition-all"
            >
              Privacy Policy
            </Link>
            .
          </p>
          
          {/* Sign up link */}
          <p className="text-center text-sm text-gray-600 mt-6 dark:text-zinc-400">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Sign up
            </Link>
            {' for free.'}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
