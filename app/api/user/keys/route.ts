import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { securedApiKey } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';

// Improved encryption for API keys with proper key length handling
function encryptApiKey(apiKey: string): string {
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
    const iv = crypto.randomBytes(16); // 16 bytes IV for AES
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV and encrypted content, both hex encoded
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt API key');
  }
}

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

const apiKeySchema = z.object({
  service: z.string().min(1, "Service name is required"),
  key: z.string().min(1, "API key is required"),
});

// GET all API keys for the current user (only returns service names, not the actual keys)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const keys = await db
      .select({
        id: securedApiKey.id,
        service: securedApiKey.service,
        createdAt: securedApiKey.createdAt,
      })
      .from(securedApiKey)
      .where(eq(securedApiKey.userId, session.user.id));

    return NextResponse.json(keys);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" }, 
      { status: 500 }
    );
  }
}

// POST to add a new API key
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { service, key } = apiKeySchema.parse(body);

    // Check if a key for this service already exists
    const existingKeys = await db
      .select()
      .from(securedApiKey)
      .where(
        and(
          eq(securedApiKey.userId, session.user.id),
          eq(securedApiKey.service, service)
        )
      );

    if (existingKeys.length > 0) {
      return NextResponse.json(
        { error: "A key for this service already exists. Delete it first to add a new one." },
        { status: 400 }
      );
    }

    // Encrypt the API key
    const encryptedKey = encryptApiKey(key);

    // Store the encrypted API key
    await db.insert(securedApiKey).values({
      userId: session.user.id,
      service,
      encryptedKey,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: "API key added successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error adding API key:", error);
    return NextResponse.json(
      { error: "Failed to add API key" },
      { status: 500 }
    );
  }
}

// DELETE to remove an API key
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { error: "API key ID is required" },
        { status: 400 }
      );
    }

    // Ensure the user owns this key before deleting
    const existingKey = await db
      .select()
      .from(securedApiKey)
      .where(
        and(
          eq(securedApiKey.id, keyId),
          eq(securedApiKey.userId, session.user.id)
        )
      );

    if (existingKey.length === 0) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    // Delete the key
    await db
      .delete(securedApiKey)
      .where(
        and(
          eq(securedApiKey.id, keyId),
          eq(securedApiKey.userId, session.user.id)
        )
      );

    return NextResponse.json(
      { message: "API key deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}

// Helper endpoint to retrieve a specific API key (should be used carefully)
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if we're getting the service from query params
    const url = new URL(req.url);
    let service = url.searchParams.get('service');

    // If not in query params, check the request body
    if (!service) {
      const body = await req.json();
      service = body.service;
    }

    if (!service) {
      return NextResponse.json(
        { error: "Service name is required" },
        { status: 400 }
      );
    }

    // Find the key for this service
    const keys = await db
      .select()
      .from(securedApiKey)
      .where(
        and(
          eq(securedApiKey.userId, session.user.id),
          eq(securedApiKey.service, service)
        )
      );

    if (keys.length === 0) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    try {
      // Decrypt the key
      const decryptedKey = decryptApiKey(keys[0].encryptedKey);
      
      // Only return the last 4 characters, masking the rest
      const maskedKey = `...${decryptedKey.slice(-4)}`;
      
      return NextResponse.json({ 
        id: keys[0].id,
        service: keys[0].service,
        maskedKey
      });
    } catch (decryptError) {
      console.error("Error decrypting API key:", decryptError);
      return NextResponse.json(
        { error: "Could not retrieve the API key" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error retrieving API key:", error);
    return NextResponse.json(
      { error: "Failed to retrieve API key" },
      { status: 500 }
    );
  }
} 