import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { testRouter } from "./test";
import { tenantRouter } from "./tenant";
import { invitationRouter } from "./invitation";
import { carbonProjectRouter } from "./carbon-project";
import { userRouter } from "./user";
import { ghgVerificationRouter } from "./ghg-verification";
import { ghgCalculationRouter } from "./ghg-calculation";
import { ghgProcessRouter } from "./ghg-process";
import { ghgAdditionalRouter } from "./ghg-additional";
import { ghgOtherCaseRouter } from "./ghg-other-case";
import { ghgAuditRouter } from "./ghg-audit";
import { standardRouter } from "./standard";
import { certificationRouter } from "./certification";

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
  carbonProject: carbonProjectRouter,
  stepOneGhgVerification: ghgVerificationRouter,
  stepTwoGhgCalculation: ghgCalculationRouter,
  stepThreeGhgProcess: ghgProcessRouter,
  stepThreeGhgAdditional: ghgAdditionalRouter,
  stepThreeGhgOtherCase: ghgOtherCaseRouter,
  stepFourGhgAudit: ghgAuditRouter,
  user: userRouter,
  standard: standardRouter,
  certification: certificationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
