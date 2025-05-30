import { z } from 'zod';

const envSchema = z.object({
  POSTGRES_URL: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1),
});

export const env = envSchema.parse(process.env); 