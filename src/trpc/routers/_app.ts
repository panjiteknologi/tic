import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { testRouter } from "./test";
import { tenantRouter } from "./tenant";
import { invitationRouter } from "./invitation";

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async (opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  test: testRouter,
  tenant: tenantRouter,
  invitation: invitationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
