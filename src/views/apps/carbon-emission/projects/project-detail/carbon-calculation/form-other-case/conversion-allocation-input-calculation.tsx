import {
  allocationFactor,
  biofuelConversion,
  calculationEnergy,
  emissionCultivation,
  emissionProcessing,
  emissionTransport,
  energyContent,
  lower,
  rawMaterialConversion,
  upstreamTransport,
} from "@/constant/step-5";
import { FormCalculationTypes } from "@/types/carbon-types";
import { Fragment } from "react";

export default function ConversionAllocationInputCalculation({
  renderInput,
}: FormCalculationTypes) {
  return (
    <div className="space-y-4 mx-5 mb-6">
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

      <p className="text-sm font-semibold">
        Biofuel feedstock factor (conversion)
      </p>
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

      <p className="text-sm font-semibold">
        Raw materials emissions for one tonne bioethanol after conversion and
        before allocation
      </p>
      {Object.entries(rawMaterialConversion).map(([key, value]) => (
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

      <p className="text-sm font-semibold">
        Upstream transport emissions for one tonne bioethanol after conversion
        and before allocation
      </p>
      {Object.entries(upstreamTransport).map(([key, value]) => (
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

      <p className="text-sm font-semibold">
        Lower heating values of output products
      </p>
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

      <p className="text-sm font-semibold">Calculation of energy content</p>
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

      <p className="text-sm font-semibold">Allocation factors</p>
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

      <p className="text-sm font-semibold">
        Raw materials emissions for one tonne of bioethanol after conversion and
        after allocation
      </p>
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

      <p className="text-sm font-semibold">
        Upstream transport emissions for one tonne bioethanol after conversion
        and after allocation
      </p>
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

      <p className="text-sm font-semibold">
        Emissions from process-specific inputs for one tonne bioethanol after
        allocation
      </p>
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
  );
}
