import { axiosAPI } from "./axiosAPI";

/**
 * Yig'ilishlar ro'yxatini olish
 * Endpoint: GET /api/v1/meetings/
 * @param {Object} params - { search, status, page, page_size, start_date, end_date }
 */
export const getMeetings = async (params = {}) => {
  const response = await axiosAPI.get("meetings/", { params });
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
 * Bitta yig'ilish ma'lumotlarini olish
 * Endpoint: GET /api/v1/meetings/{id}/
 */
export const getMeetingById = async (id) => {
  const response = await axiosAPI.get(`meetings/${id}/`);
  return response.data?.data || response.data;
};

/**
 * Yangi yig'ilish yaratish
 * Endpoint: POST /api/v1/meetings/
 * @param {Object} payload - { title, description, start_date, duration, requires_approval, allow_join_before_host }
 */
export const createMeeting = async (payload) => {
  const response = await axiosAPI.post("meetings/", payload);
  return response.data?.data || response.data;
};

/**
 * Yig'ilish ma'lumotlarini to'liq/qisman yangilash
 * Endpoint: PATCH /api/v1/meetings/{id}/ yoki PUT /api/v1/meetings/{id}/
 */
export const updateMeeting = async (id, payload) => {
  const response = await axiosAPI.patch(`meetings/${id}/`, payload);
  return response.data?.data || response.data;
};

/**
 * Yig'ilishni o'chirish
 * Endpoint: DELETE /api/v1/meetings/{id}/
 */
export const deleteMeeting = async (id) => {
  const response = await axiosAPI.delete(`meetings/${id}/`);
  return response.data;
};

/**
 * Yig'ilishni bekor qilish
 * Endpoint: POST /api/v1/meetings/{id}/cancel/
 * @param {string} id
 * @param {Object} data - { reason }
 */
export const cancelMeeting = async (id, { reason }) => {
  const response = await axiosAPI.post(`meetings/${id}/cancel/`, { reason });
  return response.data?.data || response.data;
};

/**
 * Yig'ilish qatnashuvchilari (attendances) ro'yxatini olish
 * Endpoint: GET /api/v1/meetings/attendances/
 * @param {Object} params - { meeting, is_late, ordering, page, start_date, end_date, user }
 */
export const getMeetingAttendances = async (params = {}) => {
  const response = await axiosAPI.get("meetings/attendances/", { params });
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
