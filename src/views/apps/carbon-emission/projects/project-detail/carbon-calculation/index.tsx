import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TableCalculationView } from "./table-calculation-view";
import { EmissionsTypes } from "@/types/carbon-types";
import { Input } from "@/components/ui/input";

interface CarbonCalculationViewProps {
  projectId: string;
  data: EmissionsTypes[];
  onEdit?: (updated: EmissionsTypes) => void;
  onDelete: (id: string) => void;
  activeStep: string;
}

export function CarbonCalculationView({
  projectId,
  data,
  onEdit,
  onDelete,
  activeStep,
}: CarbonCalculationViewProps) {
  const router = useRouter();
  const itemsPerPage = 10;

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    return data.filter((emission) =>
      [emission.keterangan, emission.satuan, emission.source]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search, data]);

  const isEmpty = !filteredData || filteredData.length === 0;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goAddCalculation = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("activeStep", activeStep);
      router.push(
        `/apps/carbon-emission/iscc/projects/${projectId}/add-calculation`
      );
    }
  };

  useMemo(() => setCurrentPage(1), [search]);

  return (
    <Fragment>
      <div className="space-y-4 mt-2 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <h2 className="text-black text-lg font-bold">Carbon Calculation</h2>
          <Input
            placeholder="Search carbon data..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>

        {data?.length === 0 && (
          <div className="flex justify-end">
            <Button className="cursor-pointer" onClick={goAddCalculation}>
              + Add Calculation
            </Button>
          </div>
        )}

        <div
          className={
            isEmpty
              ? ""
              : "pb-4 w-full overflow-x-auto rounded-md border bg-white shadow-sm"
          }
        >
          <TableCalculationView
            data={currentData}
            onEdit={onEdit}
            onDelete={onDelete}
            isEmpty={isEmpty}
            totalPages={totalPages}
            currentPage={currentPage}
            onPrev={handlePrev}
            onNext={handleNext}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </Fragment>
  );
}
