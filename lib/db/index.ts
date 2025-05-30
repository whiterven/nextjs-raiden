import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/lib/env';

// Create the connection
const client = postgres(env.POSTGRES_URL);

// Create the drizzle database instance
export const db = drizzle(client); 