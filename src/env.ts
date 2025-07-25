import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]),
    BETTER_AUTH_SECRET: z.string().min(1),
    DATABASE_URL: z.string().url(),
  },

  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url(),
    // Client-side environment variables (if any) go here
  },

  // Include all environment variables here
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  },
});
