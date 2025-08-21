/* eslint-disable @typescript-eslint/no-explicit-any */
import { trpc } from "@/trpc/react";

export type StepKey = "step1" | "step2" | "step3" | "step4" | "step5" | "step6";

/** Permukaan generik yang kita butuhkan saja */
type MutationAny = {
  mutate: (variables: any, ...args: any[]) => any;
  mutateAsync: (variables: any) => Promise<any>;
  reset: () => void;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
};

/** Helper cast aman (hindari error TS2352) */
const asMutationAny = (m: unknown) => m as MutationAny;

export const useTabActions = () => {
  const bulk = {
    step1: asMutationAny(trpc.stepOneGhgVerification.bulkAdd.useMutation()),
    step2: asMutationAny(trpc.stepTwoGhgCalculation.bulkAdd.useMutation()),
    step3: asMutationAny(trpc.stepThreeGhgProcess.bulkAdd.useMutation()),
    step4: asMutationAny(trpc.stepThreeGhgAdditional.bulkAdd.useMutation()),
    step5: asMutationAny(trpc.stepThreeGhgOtherCase.bulkAdd.useMutation()),
    step6: asMutationAny(trpc.stepFourGhgAudit.bulkAdd.useMutation()),
  } as Record<StepKey, MutationAny>;

  const update = {
    step1: asMutationAny(trpc.stepOneGhgVerification.update.useMutation()),
    step2: asMutationAny(trpc.stepTwoGhgCalculation.update.useMutation()),
    step3: asMutationAny(trpc.stepThreeGhgProcess.update.useMutation()),
    step4: asMutationAny(trpc.stepThreeGhgAdditional.update.useMutation()),
    step5: asMutationAny(trpc.stepThreeGhgOtherCase.update.useMutation()),
    step6: asMutationAny(trpc.stepFourGhgAudit.update.useMutation()),
  } as Record<StepKey, MutationAny>;

  const del = {
    step1: asMutationAny(trpc.stepOneGhgVerification.delete.useMutation()),
    step2: asMutationAny(trpc.stepTwoGhgCalculation.delete.useMutation()),
    step3: asMutationAny(trpc.stepThreeGhgProcess.delete.useMutation()),
    step4: asMutationAny(trpc.stepThreeGhgAdditional.delete.useMutation()),
    step5: asMutationAny(trpc.stepThreeGhgOtherCase.delete.useMutation()),
    step6: asMutationAny(trpc.stepFourGhgAudit.delete.useMutation()),
  } as Record<StepKey, MutationAny>;

  return { bulk, update, delete: del };
};
