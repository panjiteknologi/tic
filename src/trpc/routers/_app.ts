import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { testRouter } from "./test";
import { tenantRouter } from "./tenant";
import { invitationRouter } from "./invitation";
import { productsRouter } from "./products";
import { rawsRouter } from "./raws";
import { carbonProjectRouter } from "./carbon-project";
import { fertilizerNitrogenRouter } from "./fertilizer-nitrogen";

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
  products: productsRouter,
  raws: rawsRouter,
  carbonProject: carbonProjectRouter,
  fertilizerNitrogen: fertilizerNitrogenRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
