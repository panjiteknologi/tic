import { trpc } from "@/trpc/react";

export const useInvalidateCacheByStep = () => {
  const utils = trpc.useUtils();

  return async (activeStep: string, carbonProjectId: string) => {
    const stepInvalidationMap: Record<string, () => Promise<void>> = {
      step1: async () =>
        utils.stepOneGhgVerification.getByCarbonProjectId.invalidate({
          carbonProjectId,
        }),
      step2: async () =>
        utils.stepTwoGhgCalculation.getByCarbonProjectId.invalidate({
          carbonProjectId,
        }),
      step3: async () =>
        utils.stepThreeGhgProcess.getByCarbonProjectId.invalidate({
          carbonProjectId,
        }),
      step4: async () =>
        utils.stepThreeGhgAdditional.getByCarbonProjectId.invalidate({
          carbonProjectId,
        }),
      step5: async () =>
        utils.stepThreeGhgOtherCase.getByCarbonProjectId.invalidate({
          carbonProjectId,
        }),
      step6: async () =>
        utils.stepFourGhgAudit.getByCarbonProjectId.invalidate({
          carbonProjectId,
        }),
    };

    const invalidate = stepInvalidationMap[activeStep];
    if (invalidate) {
      await invalidate();
    } else {
      console.error(`Invalid step: ${activeStep}`);
    }
  };
};
