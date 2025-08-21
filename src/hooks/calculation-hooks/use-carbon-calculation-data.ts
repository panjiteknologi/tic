import { trpc } from "@/trpc/react";
import { useParams } from "next/navigation";

export const useCarbonCalculationData = () => {
  const { projectId } = useParams();
  const id = projectId as string;

  const verificationsQuery =
    trpc.stepOneGhgVerification.getByCarbonProjectId.useQuery({
      carbonProjectId: id,
    });

  const calculationsQuery =
    trpc.stepTwoGhgCalculation.getByCarbonProjectId.useQuery({
      carbonProjectId: id,
    });

  const processQuery = trpc.stepThreeGhgProcess.getByCarbonProjectId.useQuery({
    carbonProjectId: id,
  });

  const additionalQuery =
    trpc.stepThreeGhgAdditional.getByCarbonProjectId.useQuery({
      carbonProjectId: id,
    });

  const otherCaseQuery =
    trpc.stepThreeGhgOtherCase.getByCarbonProjectId.useQuery({
      carbonProjectId: id,
    });

  const auditQuery = trpc.stepFourGhgAudit.getByCarbonProjectId.useQuery({
    carbonProjectId: id,
  });

  // Handle errors with logging
  const errors = [
    verificationsQuery.error,
    calculationsQuery.error,
    processQuery.error,
    additionalQuery.error,
    otherCaseQuery.error,
    auditQuery.error,
  ];

  errors.forEach((err, idx) => {
    if (err) console.error(`Error on step ${idx + 1}:`, err);
  });

  const isLoading =
    verificationsQuery.isLoading ||
    calculationsQuery.isLoading ||
    processQuery.isLoading ||
    additionalQuery.isLoading ||
    otherCaseQuery.isLoading ||
    auditQuery.isLoading;

  const refetchAll = async () => {
    await Promise.all([
      verificationsQuery.refetch(),
      calculationsQuery.refetch(),
      processQuery.refetch(),
      additionalQuery.refetch(),
      otherCaseQuery.refetch(),
      auditQuery.refetch(),
    ]);
  };

  return {
    isLoading,
    verifications: verificationsQuery.data,
    calculations: calculationsQuery.data,
    process: processQuery.data,
    additional: additionalQuery.data,
    otherCase: otherCaseQuery.data,
    audit: auditQuery.data,
    refetchAll,
  };
};
