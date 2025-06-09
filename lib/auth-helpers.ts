//lib/auth-helpers.ts
import { auth } from '@/app/(auth)/auth';

/**
 * Get the current authenticated user's ID
 * @returns The user ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id || null;
  } catch (error) {
    console.error('Failed to get current user ID:', error);
    return null;
  }
}

/**
 * Get the current authenticated user session
 * @returns The session object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const session = await auth();
    return session?.user || null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Ensure user is authenticated, throw error if not
 * @returns The user ID
 * @throws Error if user is not authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Authentication required');
  }
  return userId;
}