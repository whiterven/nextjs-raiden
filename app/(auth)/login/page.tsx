'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useState, useRef, Suspense } from 'react';
import { toast } from '@/components/toast';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';

import { login, type LoginActionState } from '../actions';
import { useSession } from 'next-auth/react';

// Client component that uses searchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams?.get('verified') === 'true';
  const error = searchParams?.get('error');

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const hasShownMessage = useRef(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );

  const { update: updateSession } = useSession();

  useEffect(() => {
    if (verified && !hasShownMessage.current) {
      hasShownMessage.current = true;
      toast({
        type: 'success',
        description: 'Your email has been verified! You can now log in.',
      });
    }

    if (error && !hasShownMessage.current) {
      hasShownMessage.current = true;
      toast({
        type: 'error',
        description: error === 'invalid-token' 
          ? 'Invalid verification token.'
          : error === 'verification-failed'
            ? 'Email verification failed. Please try again.'
            : 'An error occurred during verification.',
      });
    }
  }, [verified, error]);

  useEffect(() => {
    if (!hasShownMessage.current) {
      if (state.status === 'failed') {
        hasShownMessage.current = true;
        toast({
          type: 'error',
          description: 'Invalid credentials!',
        });
      } else if (state.status === 'invalid_data') {
        hasShownMessage.current = true;
        toast({
          type: 'error',
          description: 'Failed validating your submission!',
        });
      } else if (state.status === 'success') {
        hasShownMessage.current = true;
        setIsSuccessful(true);
        updateSession();
        router.refresh();
      }
    }
  }, [state.status, router, updateSession]);

  const handleSubmit = (formData: FormData) => {
    hasShownMessage.current = false;
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background p-4">
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
          <div className="flex flex-col items-center gap-4 mt-4">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-600 hover:underline dark:text-zinc-400"
            >
              Forgot password?
            </Link>
            <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
              {"Don't have an account? "}
              <Link
                href="/register"
                className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
              >
                Sign up
              </Link>
              {' for free.'}
            </p>
          </div>
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
  );
}

// Loading fallback component
function LoginLoading() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12 items-center">
        <div className="animate-pulse w-32 h-8 bg-gray-200 rounded dark:bg-zinc-800"></div>
        <div className="animate-pulse w-64 h-64 bg-gray-200 rounded-lg dark:bg-zinc-800"></div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}