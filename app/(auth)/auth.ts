//app/(auth)/auth.ts
import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { createGuestUser, getUser } from '@/lib/db/queries';
import { authConfig } from './auth.config';
import { DUMMY_PASSWORD } from '@/lib/constants';
import type { DefaultJWT } from 'next-auth/jwt';
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email/utils';

export type UserType = 'guest' | 'regular' | 'advanced' | 'expert';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
      firstName?: string;
      lastName?: string;
      emailVerified?: Date | null; // Changed to allow null
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
    firstName?: string;
    lastName?: string;
    emailVerified?: Date | null; // Changed to allow null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
    firstName?: string;
    lastName?: string;
    emailVerified?: Date | null; // Changed to allow null
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) return null;

        return {
          id: user.id,
          email: user.email,
          type: user.type,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          emailVerified: user.emailVerified || null // Explicitly handle null
        };
      },
    }),
    Credentials({
      id: 'guest',
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return {
          id: guestUser.id,
          email: guestUser.email,
          type: 'guest' as const,
          firstName: guestUser.firstName || undefined,
          lastName: guestUser.lastName || undefined,
          emailVerified: null // Set to null for guest users
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.emailVerified = user.emailVerified;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.emailVerified = token.emailVerified ?? null;
      }

      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Don't send emails for guest users
      if (user.type === 'guest' || !user.email) return;
      
      const baseUrl = process.env.NEXTAUTH_URL;
      if (!baseUrl) {
        console.error('NEXTAUTH_URL environment variable is not defined');
        return;
      }
      
      // Send welcome email
      const name = user.firstName || user.email.split('@')[0];
      await sendWelcomeEmail(user.email, name);
      
      // Send verification email
      if (user.id) {
        await sendVerificationEmail(user.id, user.email, name, baseUrl);
      }
    },
  },
});