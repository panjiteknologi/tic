import { env } from "@/env";
import apiClient from "@/lib/api-client";

const baseUrl = env.NEXT_PUBLIC_ENDPOINT_URL;

export const dateCustomerService = {
  async getDateCustomers() {
    const response = await apiClient.get(`${baseUrl}/api/get_date_customer`);
    return response.data;
  },
};
