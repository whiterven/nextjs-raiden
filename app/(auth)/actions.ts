'use server';

import { z } from 'zod';

import { createUser, getUser } from '@/lib/db/queries';

import { signIn } from './auth';

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'invalid_data'
    | 'user_exists';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = loginFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const signInResult = await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    if (signInResult?.error) {
      return { status: 'failed' };
    }

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }
    return { status: 'failed' };
  }
};

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = registerFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
    });

    let existingUser;
    try {
      [existingUser] = await getUser(validatedData.email);
    } catch (error) {
      console.error('Error checking existing user:', error);
      return { status: 'failed' };
    }

    if (existingUser) {
      return { status: 'user_exists' } as RegisterActionState;
    }

    try {
      const newUser = await createUser(
        validatedData.email,
        validatedData.password,
        validatedData.firstName,
        validatedData.lastName
      );

      if (!newUser || newUser.length === 0) {
        console.error('User creation failed - no user returned');
        return { status: 'failed' };
      }

      const signInResult = await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        console.error('Sign in failed after user creation:', signInResult.error);
        return { status: 'failed' };
      }

      return { status: 'success' };
    } catch (error) {
      console.error('Error during user creation or sign in:', error);
      return { status: 'failed' };
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }
    return { status: 'failed' };
  }
};

export async function getUserByEmail(email: string) {
  try {
    const [user] = await getUser(email);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
