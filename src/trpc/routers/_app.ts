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
import { ipccProjectsRouter } from "./ipcc/ipcc-projects";
import { ipccActivityDataRouter } from "./ipcc/ipcc-activity-data";
import { ipccEmissionCalculationsRouter } from "./ipcc/ipcc-emission-calculations";
import { ipccProjectSummariesRouter } from "./ipcc/ipcc-project-summaries";
import { ipccEmissionCategoriesRouter } from "./ipcc/ipcc-emission-categories";
import { ipccEmissionFactorsRouter } from "./ipcc/ipcc-emission-factors";
import { ipccGwpValuesRouter } from "./ipcc/ipcc-gwp-values";
import { ipccProjectCategoriesRouter } from "./ipcc/ipcc-project-categories";
import { ipccDashboardRouter } from "./ipcc/ipcc-dashboard";

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
  ipccProjects: ipccProjectsRouter,
  ipccActivityData: ipccActivityDataRouter,
  ipccEmissionCalculations: ipccEmissionCalculationsRouter,
  ipccProjectSummaries: ipccProjectSummariesRouter,
  ipccEmissionCategories: ipccEmissionCategoriesRouter,
  ipccEmissionFactors: ipccEmissionFactorsRouter,
  ipccGwpValues: ipccGwpValuesRouter,
  ipccProjectCategories: ipccProjectCategoriesRouter,
  ipccDashboard: ipccDashboardRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
