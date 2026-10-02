import { axiosAPI } from "./axiosAPI";

/**
 * Dashboard statistikalarini olish
 * Endpoint: GET /api/v1/reports/dashboard/
 * @param {Object} params - { start_date, end_date }
 */
export const getDashboardStats = async (params = {}) => {
  const response = await axiosAPI.get("reports/dashboard/", { params });
  return response.data?.data || response.data;
};
