import { createQueryHook } from "@/lib/create-api-hooks";
import { dateCustomerService } from "@/services/date-customer-api";

const dateCustomerKeys = {
  details: () => ["detail"] as const,
};

export const useDateCustomerQuery = createQueryHook(
  dateCustomerKeys.details,
  dateCustomerService.getDateCustomers
);
