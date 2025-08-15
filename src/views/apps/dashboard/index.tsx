"use client";

import { useDateCustomerQuery } from "@/hooks/use-date-customer";
import React from "react";

const DashboardView = () => {
  const { data, isLoading, error, isError } = useDateCustomerQuery(
    { staleTime: 5 * 60 * 1000 } // 5 menit
  );

  if (isLoading) {
    <div>
      <h1 className="text-teal-800 font-bold">TEST Loading...</h1>
    </div>;
  }

  return (
    <div>
      <h1 className="text-amber-700 font-bold">Real Data : </h1>
      <br />
      {/* <p className="text-pink-800 font-black">
        Cust : {data[0]?.customer ?? ""}
      </p>
      <p className="text-pink-800 font-black">
        Sales : {data[0]?.sales_person ?? ""}
      </p> */}
    </div>
  );
};

export default DashboardView;
