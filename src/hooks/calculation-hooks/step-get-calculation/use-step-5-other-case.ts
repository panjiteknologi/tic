import { trpc } from "@/trpc/react";

export const useStep5OtherCase = (carbonProjectId: string) => {
  const { data, isLoading, refetch } =
    trpc.stepThreeGhgOtherCase.getByCarbonProjectId.useQuery(
      { carbonProjectId },
      { enabled: !!carbonProjectId }
    );

  return {
    isLoading,
    data: data?.stepTigaOtherCases ?? [],
    refetch,
    invalidate: () =>
      trpc.useUtils().stepThreeGhgOtherCase.getByCarbonProjectId.invalidate({
        carbonProjectId,
      }),
  };
};
