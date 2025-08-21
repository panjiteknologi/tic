import { trpc } from "@/trpc/react";

export const useStep1Verification = (carbonProjectId: string) => {
  const { data, isLoading, refetch } =
    trpc.stepOneGhgVerification.getByCarbonProjectId.useQuery(
      { carbonProjectId },
      { enabled: !!carbonProjectId }
    );

  return {
    isLoading,
    data: data?.stepSatuGhgVerifications ?? [],
    refetch,
    invalidate: () =>
      trpc.useUtils().stepOneGhgVerification.getByCarbonProjectId.invalidate({
        carbonProjectId,
      }),
  };
};
