import { trpc } from "@/trpc/react";

export const useStep3Process = (carbonProjectId: string) => {
  const { data, isLoading, refetch } =
    trpc.stepThreeGhgProcess.getByCarbonProjectId.useQuery(
      { carbonProjectId },
      { enabled: !!carbonProjectId }
    );

  return {
    isLoading,
    data: data?.stepTigaGhgCalculationProcesses ?? [],
    refetch,
    invalidate: () =>
      trpc.useUtils().stepThreeGhgProcess.getByCarbonProjectId.invalidate({
        carbonProjectId,
      }),
  };
};
