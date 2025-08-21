import { trpc } from "@/trpc/react";

export const useStep2Calculation = (carbonProjectId: string) => {
  const { data, isLoading, refetch } =
    trpc.stepTwoGhgCalculation.getByCarbonProjectId.useQuery(
      { carbonProjectId },
      { enabled: !!carbonProjectId }
    );

  return {
    isLoading,
    data: data?.stepDuaGhgCalculations ?? [],
    refetch,
    invalidate: () =>
      trpc.useUtils().stepTwoGhgCalculation.getByCarbonProjectId.invalidate({
        carbonProjectId,
      }),
  };
};
