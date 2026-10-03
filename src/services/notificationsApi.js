import { axiosAPI } from "./axiosAPI";

/**
 * Bildirishnomalar ro'yxatini olish
 * Endpoint: GET /api/v1/notifications/
 * @param {Object} params - { is_read, search, ordering, page, page_size }
 */
export const getNotifications = async (params = {}) => {
  const response = await axiosAPI.get("notifications/", { params });
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
 * Bitta bildirishnomani olish
 * Endpoint: GET /api/v1/notifications/{id}/
 * @param {string} id - Bildirishnoma UUID
 */
export const getNotificationById = async (id) => {
  const response = await axiosAPI.get(`notifications/${id}/`);
  return response.data?.data || response.data;
};

/**
 * Bildirishnomalar sonini olish (unread, read, total)
 * Endpoint: GET /api/v1/notifications/counts/
 */
export const getNotificationCounts = async () => {
  const response = await axiosAPI.get("notifications/counts/");
  return response.data?.data || response.data;
};

/**
 * Bitta bildirishnomani o'qildi deb belgilash
 * Endpoint: POST /api/v1/notifications/{id}/read/
 * @param {string} id - Bildirishnoma UUID
 */
export const markNotificationAsRead = async (id) => {
  try {
    const response = await axiosAPI.post(`notifications/${id}/read/`);
    return response.data?.data || response.data;
  } catch (err) {
    // Fallback: PATCH /api/v1/notifications/{id}/read/
    const response = await axiosAPI.patch(`notifications/${id}/read/`);
    return response.data?.data || response.data;
  }
};

/**
 * Barcha bildirishnomalarni o'qildi deb belgilash
 * Endpoint: POST /api/v1/notifications/read-all/
 */
export const markAllNotificationsAsRead = async () => {
  const response = await axiosAPI.post("notifications/read-all/");
  return response.data?.data || response.data;
};

/**
 * WebSocket uchun bir martalik ticket olish
 * Endpoint: POST /api/v1/notifications/ticket/
 */
export const getNotificationTicket = async () => {
  try {
    const response = await axiosAPI.post("notifications/ticket/");
    return response.data?.data || response.data;
  } catch (e) {
    try {
      const response = await axiosAPI.post("notifications/tickets/");
      return response.data?.data || response.data;
    } catch (err) {
      throw err;
    }
  }
};
