import { axiosAPI } from "./axiosAPI";

/**
 * Loglar ro'yxatini olish (pagination, search, action va sana filtrlari bilan)
 * Endpoint: GET /api/v1/audits/logs/
 */
export const getLogs = async (params = {}) => {
  const response = await axiosAPI.get("audits/logs/", { params });
  const data = response.data;

  if (Array.isArray(data)) {
    return { results: data, count: data.length, next: null, previous: null };
  }

  return {
    results: data?.results || data?.data?.results || data?.data || [],
    count: data?.count ?? data?.data?.count ?? 0,
    next: data?.next ?? data?.data?.next ?? null,
    previous: data?.previous ?? data?.data?.previous ?? null,
  };
};

/**
 * Bitta log tafsilotlarini olish
 * Endpoint: GET /api/v1/audits/logs/{id}/
 */
export const getLogById = async (id) => {
  const response = await axiosAPI.get(`audits/logs/${id}/`);
  return response.data?.data || response.data;
};
