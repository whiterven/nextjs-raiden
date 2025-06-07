import { db } from '@/lib/db';
import { securedApiKey } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import crypto from 'crypto';

// Decryption function - matches the encryption in the API endpoint
function decryptApiKey(encryptedData: string): string {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-encryption-key-must-be-32-chars', 'utf-8');
  const [ivHex, encryptedHex] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Retrieves an API key for the specified service and user
 * @param userId The user ID
 * @param service The service name (e.g., "openai", "github")
 * @returns The decrypted API key or null if not found
 */
export async function getApiKey(userId: string, service: string): Promise<string | null> {
  try {
    const keys = await db
      .select()
      .from(securedApiKey)
      .where(
        and(
          eq(securedApiKey.userId, userId),
          eq(securedApiKey.service, service)
        )
      );

    if (keys.length === 0) {
      return null;
    }

    // Decrypt the key
    return decryptApiKey(keys[0].encryptedKey);
  } catch (error) {
    console.error(`Failed to retrieve API key for service ${service}:`, error);
    return null;
  }
}

/**
 * Checks if a user has stored an API key for the specified service
 * @param userId The user ID
 * @param service The service name
 * @returns boolean indicating if the key exists
 */
export async function hasApiKey(userId: string, service: string): Promise<boolean> {
  try {
    const keys = await db
      .select({ id: securedApiKey.id })
      .from(securedApiKey)
      .where(
        and(
          eq(securedApiKey.userId, userId),
          eq(securedApiKey.service, service)
        )
      );

    return keys.length > 0;
  } catch (error) {
    console.error(`Failed to check API key for service ${service}:`, error);
    return false;
  }
}

/**
 * Get all services for which a user has stored API keys
 * @param userId The user ID
 * @returns Array of service names
 */
export async function getUserApiServices(userId: string): Promise<string[]> {
  try {
    const keys = await db
      .select({ service: securedApiKey.service })
      .from(securedApiKey)
      .where(eq(securedApiKey.userId, userId));

    return keys.map(key => key.service);
  } catch (error) {
    console.error('Failed to retrieve user API services:', error);
    return [];
  }
}
