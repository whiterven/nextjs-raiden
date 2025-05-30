'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from '@/components/toast';

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
  }, [state.status, router, updateSession]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen bg-background">
      {/* Image section - only visible on desktop */}
      <div className="hidden md:flex w-1/2 bg-zinc-50 dark:bg-zinc-900 items-center justify-center">
        <div className="relative w-full max-w-md aspect-square">
          <Image
            src="/bineai-login.png"
            alt="BineAI Login"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Form section */}
      <div className="w-full md:w-1/2 flex items-start pt-12 md:pt-0 md:items-center justify-center">
        <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
            <button
              onClick={() => router.back()}
              className="self-start text-gray-600 hover:underline dark:text-zinc-400"
            >
              Back
            </button>
            <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Use your email and password to sign in
            </p>
          </div>
          <AuthForm action={handleSubmit} defaultEmail={email}>
            <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
            <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
              {"Don't have an account? "}
              <Link
                href="/register"
                className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
              >
                Sign up
              </Link>
              {' for free.'}
            </p>
            <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
              By clicking Log In, you agree to our{' '}
              <Link
                href="/terms"
                className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </AuthForm>
        </div>
      </div>
    </div>
  );
}