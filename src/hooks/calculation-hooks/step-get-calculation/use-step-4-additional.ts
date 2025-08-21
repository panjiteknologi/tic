import { trpc } from "@/trpc/react";

export const useStep4Additional = (carbonProjectId: string) => {
  const { data, isLoading, refetch } =
    trpc.stepThreeGhgAdditional.getByCarbonProjectId.useQuery(
      { carbonProjectId },
      { enabled: !!carbonProjectId }
    );

  return {
    isLoading,
    data: data?.stepTigaAdditionals ?? [],
    refetch,
    invalidate: () =>
      trpc.useUtils().stepThreeGhgAdditional.getByCarbonProjectId.invalidate({
        carbonProjectId,
      }),
  };
};
