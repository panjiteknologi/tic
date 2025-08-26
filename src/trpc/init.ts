/* eslint-disable @typescript-eslint/no-unused-vars */
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import { headers } from "next/headers";
import superjson from "superjson";
import { auth } from "@/lib/auth";

interface Context {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string;
  } | null;
}

export const createTRPCContext = cache(async (): Promise<Context> => {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    return {
      user: session?.user
        ? {
            ...session.user,
            image: session.user.image ?? undefined,
          }
        : null,
    };
  } catch (error) {
    return {
      user: null,
    };
  }
});

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // now we know user is not null
    },
  });
});
