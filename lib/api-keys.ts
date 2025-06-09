//lib/api-keys.ts
import { db } from '@/lib/db';
import { securedApiKey } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import crypto from 'crypto';

// Decryption function - matches the encryption in the API endpoint
function decryptApiKey(encryptedData: string): string {
  try {
    const algorithm = 'aes-256-cbc';
    
    // Ensure key is exactly 32 bytes (256 bits) as required by AES-256
    let encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-must-be-32-chars';
    
    // Ensure the key is exactly 32 bytes by either truncating or padding
    if (encryptionKey.length > 32) {
      encryptionKey = encryptionKey.slice(0, 32);
    } else if (encryptionKey.length < 32) {
      encryptionKey = encryptionKey.padEnd(32, '0');
    }
    
    const key = Buffer.from(encryptionKey, 'utf-8');
    
    // Split the stored data into IV and encrypted content
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [ivHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Retrieves an API key for the specified service and user
 * @param userId The user ID
 * @param service The service name (e.g., "tavily", "github", "slack", "clickup")
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

/**
 * Batch retrieve multiple API keys for a user
 * @param userId The user ID
 * @param services Array of service names
 * @returns Object mapping service names to their API keys (null if not found)
 */
export async function getMultipleApiKeys(userId: string, services: string[]): Promise<Record<string, string | null>> {
  try {
    const keys = await db
      .select()
      .from(securedApiKey)
      .where(eq(securedApiKey.userId, userId));

    const result: Record<string, string | null> = {};
    
    // Initialize all services as null
    services.forEach(service => {
      result[service] = null;
    });

    // Decrypt and populate found keys
    for (const key of keys) {
      if (services.includes(key.service)) {
        try {
          result[key.service] = decryptApiKey(key.encryptedKey);
        } catch (error) {
          console.error(`Failed to decrypt key for ${key.service}:`, error);
          result[key.service] = null;
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Failed to retrieve multiple API keys:', error);
    // Return all services as null in case of error
    const result: Record<string, string | null> = {};
    services.forEach(service => {
      result[service] = null;
    });
    return result;
  }
}