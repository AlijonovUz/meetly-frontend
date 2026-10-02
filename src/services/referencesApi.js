import { axiosAPI } from "./axiosAPI";

/**
 * Viloyatlar ro'yxatini olish
 * Endpoint: GET /api/v1/references/regions/
 */
export const getRegions = async (params = {}) => {
  try {
    const response = await axiosAPI.get("references/regions/", { params });
    const data = response.data;
    if (Array.isArray(data)) {
      return { results: data, count: data.length, next: null };
    }
    return {
      results: data?.results || data?.data?.results || data?.data || [],
      count: data?.count ?? data?.data?.count ?? 0,
      next: data?.next ?? data?.data?.next ?? null,
    };
  } catch (error) {
    console.error("Viloyatlarni olishda xatolik:", error);
    return { results: [], count: 0, next: null };
  }
};

/**
 * Tumanlar ro'yxatini olish (viloyat bo'yicha filtrlash mumkin)
 * Endpoint: GET /api/v1/references/districts/
 */
export const getDistricts = async (params = {}) => {
  try {
    const response = await axiosAPI.get("references/districts/", { params });
    const data = response.data;
    if (Array.isArray(data)) {
      return { results: data, count: data.length, next: null };
    }
    return {
      results: data?.results || data?.data?.results || data?.data || [],
      count: data?.count ?? data?.data?.count ?? 0,
      next: data?.next ?? data?.data?.next ?? null,
    };
  } catch (error) {
    console.error("Tumanlarni olishda xatolik:", error);
    return { results: [], count: 0, next: null };
  }
};
