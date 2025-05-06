import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url(),
  },

  client: {
    // Client-side environment variables (if any) go here
    NEXT_PUBLIC_ENDPOINT_URL: z.string().url(),
  },

  // Include all environment variables here
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,

    NEXT_PUBLIC_ENDPOINT_URL: process.env.NEXT_PUBLIC_ENDPOINT_URL,
  },
});
