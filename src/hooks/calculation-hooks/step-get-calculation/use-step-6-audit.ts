import { trpc } from "@/trpc/react";

export const useStep6Audit = (carbonProjectId: string) => {
  const { data, isLoading, refetch } =
    trpc.stepFourGhgAudit.getByCarbonProjectId.useQuery(
      { carbonProjectId },
      { enabled: !!carbonProjectId }
    );

  return {
    isLoading,
    data: data?.stepEmpatGhgAudits ?? [],
    refetch,
    invalidate: () =>
      trpc.useUtils().stepFourGhgAudit.getByCarbonProjectId.invalidate({
        carbonProjectId,
      }),
  };
};
