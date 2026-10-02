import { axiosAPI } from "./axiosAPI";

/**
 * Foydalanuvchilar ro'yxatini olish (pagination, search, filters bilan)
 * Endpoint: GET /api/v1/users/
 */
export const getUsers = async (params = {}) => {
  const response = await axiosAPI.get("users/", { params });
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
 * Bitta foydalanuvchi ma'lumotlarini olish
 * Endpoint: GET /api/v1/users/{id}/
 */
export const getUserById = async (id) => {
  const response = await axiosAPI.get(`users/${id}/`);
  return response.data?.data || response.data;
};

/**
 * Foydalanuvchini bloklash / blokdan chiqarish
 * Endpoint: POST /api/v1/users/{id}/toggle-block/
 */
export const toggleUserBlock = async (id, reason = "") => {
  const response = await axiosAPI.post(`users/${id}/toggle-block/`, { reason });
  return response.data?.data || response.data;
};

/**
 * E'tiroz yuborish (Blocked user appeal yaratish)
 * Endpoint: POST /api/v1/users/appeals/
 */
export const createAppeal = async (payload) => {
  const response = await axiosAPI.post("users/appeals/", payload);
  return response.data?.data || response.data;
};

/**
 * Foydalanuvchi shikoyatlari / e'tirozlari ro'yxatini olish
 * Endpoint: GET /api/v1/users/appeals/
 * params: { user_id, status, ordering, page }
 */
export const getUserAppeals = async (params = {}) => {
  const response = await axiosAPI.get("users/appeals/", { params });
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  }
  return data?.results || data?.data?.results || data?.data || [];
};

/**
 * Foydalanuvchi shikoyati statusini olish
 * Endpoint: GET /api/v1/users/appeals/status/
 * params: { user_id }
 */
export const getAppealStatus = async (userId) => {
  const response = await axiosAPI.get("users/appeals/status/", {
    params: { user_id: userId },
  });
  return response.data?.data || response.data;
};

/**
 * Shikoyatni ma'qullash va foydalanuvchini blokdan chiqarish
 * Endpoint: POST /api/v1/users/appeals/{id}/approve/
 */
export const approveAppeal = async (appealId) => {
  const response = await axiosAPI.post(`users/appeals/${appealId}/approve/`);
  return response.data?.data || response.data;
};

/**
 * Shikoyatni rad etish
 * Endpoint: POST /api/v1/users/appeals/{id}/reject/
 */
export const rejectAppeal = async (appealId, payload = {}) => {
  const response = await axiosAPI.post(`users/appeals/${appealId}/reject/`, payload);
  return response.data?.data || response.data;
};



