import {
  allocationFactor,
  bioethanolCultivation,
  bioethanolTransport,
  biofuelConversion,
  calculationEnergy,
  emissionCultivation,
  emissionProcessing,
  emissionTransport,
  energyContent,
  lower,
} from "@/constant/step-5";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function ConversionAllocationInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <Fragment>
      <div className="mx-5 mb-6">
        <div className="space-y-4 mt-3">
          {Object.entries(energyContent).map(([key, value]) => (
            <Fragment key={key}>
              {renderInput(
                value.keterangan,
                key,
                value.satuan,
                value.disabled,
                value.type,
                value.placeholder
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">
          Biofuel feedstock factor (conversion)
        </span>
        <div className="space-y-4 mt-3">
          {Object.entries(biofuelConversion).map(([key, value]) => (
            <Fragment key={key}>
              {renderInput(
                value.keterangan,
                key,
                value.satuan,
                value.disabled,
                value.type,
                value.placeholder
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">
          Raw materials emissions for one tonne bioethanol after conversion and
          before allocation
        </span>
        <div className="space-y-4 mt-3">
          {Object.entries(bioethanolCultivation).map(([key, value]) => (
            <Fragment key={key}>
              {renderInput(
                value.keterangan,
                key,
                value.satuan,
                value.disabled,
                value.type,
                value.placeholder
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">
          Upstream transport emissions for one tonne bioethanol after conversion
          and before allocation
        </span>
        <div className="space-y-4 mt-3">
          {Object.entries(bioethanolTransport).map(([key, value]) => (
            <Fragment key={key}>
              {renderInput(
                value.keterangan,
                key,
                value.satuan,
                value.disabled,
                value.type,
                value.placeholder
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">
          Lower heating values of output products
        </span>
        <div className="space-y-4 mt-3">
          {Object.entries(lower).map(([key, value]) => (
            <Fragment key={key}>
              {renderInput(
                value.keterangan,
                key,
                value.satuan,
                value.disabled,
                value.type,
                value.placeholder
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">Calculation of energy content</span>
        <div className="space-y-4 mt-3">
          {Object.entries(calculationEnergy).map(([key, value]) => (
            <Fragment key={key}>
              {renderInput(
                value.keterangan,
                key,
                value.satuan,
                value.disabled,
                value.type,
                value.placeholder
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">Allocation factors</span>
        <div className="space-y-4 mt-3">
          {Object.entries(allocationFactor).map(([key, value]) => (
            <Fragment key={key}>
              {renderInput(
                value.keterangan,
                key,
                value.satuan,
                value.disabled,
                value.type,
                value.placeholder
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">
          Raw materials emissions for one tonne of bioethanol after conversion
          and after allocation
        </span>
        <div className="space-y-4 mt-3">
          {Object.entries(emissionCultivation).map(([key, value]) => (
            <Fragment key={key}>
              {renderInput(
                value.keterangan,
                key,
                value.satuan,
                value.disabled,
                value.type,
                value.placeholder
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">
          Upstream transport emissions for one tonne bioethanol after conversion
          and after allocation
        </span>
        <div className="space-y-4 mt-3">
          {Object.entries(emissionTransport).map(([key, value]) => (
            <Fragment key={key}>
              {renderInput(
                value.keterangan,
                key,
                value.satuan,
                value.disabled,
                value.type,
                value.placeholder
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mx-5 mb-6">
        <span className="text-sm font-bold">
          Emissions from process-specific inputs for one tonne bioethanol after
          allocation
        </span>
        <div className="space-y-4 mt-3">
          {Object.entries(emissionProcessing).map(([key, value]) => (
            <Fragment key={key}>
              {renderInput(
                value.keterangan,
                key,
                value.satuan,
                value.disabled,
                value.type,
                value.placeholder
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </Fragment>
  );
}
