'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';

import { register, type RegisterActionState } from '../actions';
import { toast } from '@/components/toast';
import { useSession } from 'next-auth/react';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: 'idle',
    },
  );

  const { update: updateSession } = useSession();

  useEffect(() => {
    if (state.status === 'user_exists') {
      toast({ type: 'error', description: 'Account already exists!' });
    } else if (state.status === 'failed') {
      toast({ type: 'error', description: 'Failed to create account!' });
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Failed validating your submission!',
      });
    } else if (state.status === 'success') {
      toast({ type: 'success', description: 'Account created successfully!' });

      setIsSuccessful(true);
      updateSession();
      router.refresh();
    }
  }, [state, updateSession, router]);

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

      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        {/* Welcome Section */}
        <div className="flex flex-col items-center justify-center gap-4 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">We Can&apos;t Wait to See You Join Us</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Create your account and become part of our amazing community
          </p>
        </div>
        
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Sign Up</SubmitButton>
          
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
          
          {/* Sign in link */}
          <p className="text-center text-sm text-gray-600 mt-6 dark:text-zinc-400">
            {&apos;Already have an account? &apos;}
            <Link
              href="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Sign in
            </Link>
            {&apos; instead.&apos;}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
