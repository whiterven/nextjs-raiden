//app/(auth)/auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
    verifyRequest: '/verify-email',
    error: '/auth-error',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // Add protected routes here
      const isLoggedIn = !!auth?.user;
      const protectedPaths = [
        '/settings',
        '/billing',
        '/chat',
      ];
      
      const isProtected = protectedPaths.some(
        (path) => nextUrl.pathname.startsWith(path)
      );
      
      // If the route is protected and the user is not logged in, 
      // redirect to the login page
      if (isProtected && !isLoggedIn) {
        return false; // Will redirect to pages.signIn
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
