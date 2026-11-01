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

/**
 * Majlislar bo'yicha hisobotni olish
 * Endpoint: GET /api/v1/reports/meetings/
 * @param {Object} params - { start_date, end_date, organizer, status, duration, signature, search, ordering, page }
 */
export const getMeetingsReport = async (params = {}) => {
  const response = await axiosAPI.get("reports/meetings/", { params });
  const data = response.data?.data || response.data;

  if (Array.isArray(data)) {
    return {
      results: data,
      count: data.length,
      page: 1,
      total_pages: 1,
    };
  }

  return {
    results: data?.results || [],
    count: data?.count ?? 0,
    page: data?.page ?? 1,
    total_pages: data?.total_pages ?? 1,
  };
};

/**
 * Ishtirokchilar bo'yicha hisobotni olish
 * Endpoint: GET /api/v1/reports/participants/
 * @param {Object} params - { start_date, end_date, organization, participant, signature, search, ordering, page }
 */
export const getParticipantsReport = async (params = {}) => {
  const response = await axiosAPI.get("reports/participants/", { params });
  const data = response.data?.data || response.data;

  if (Array.isArray(data)) {
    return {
      results: data,
      count: data.length,
      page: 1,
      total_pages: 1,
    };
  }

  return {
    results: data?.results || [],
    count: data?.count ?? 0,
    page: data?.page ?? 1,
    total_pages: data?.total_pages ?? 1,
  };
};

/**
 * Tashkilotchilar bo'yicha hisobotni olish
 * Endpoint: GET /api/v1/reports/organizers/
 * @param {Object} params - { start_date, end_date, organizer, organization, status, duration, search, ordering, page }
 */
export const getOrganizersReport = async (params = {}) => {
  const response = await axiosAPI.get("reports/organizers/", { params });
  const data = response.data?.data || response.data;

  if (Array.isArray(data)) {
    return {
      results: data,
      count: data.length,
      page: 1,
      total_pages: 1,
    };
  }

  return {
    results: data?.results || [],
    count: data?.count ?? 0,
    page: data?.page ?? 1,
    total_pages: data?.total_pages ?? 1,
  };
};

/**
 * Imzolar bo'yicha hisobotni olish
 * Endpoint: GET /api/v1/reports/signatures/
 * @param {Object} params - { start_date, end_date, meeting, participant, organizer, signature, search, ordering, page }
 */
export const getSignaturesReport = async (params = {}) => {
  const response = await axiosAPI.get("reports/signatures/", { params });
  const data = response.data?.data || response.data;

  if (Array.isArray(data)) {
    return {
      results: data,
      count: data.length,
      page: 1,
      total_pages: 1,
    };
  }

  return {
    results: data?.results || [],
    count: data?.count ?? 0,
    page: data?.page ?? 1,
    total_pages: data?.total_pages ?? 1,
  };
};

/**
 * Tashkilotlar ro'yxati (Dropdown uchun)
 * Endpoint: GET /api/v1/users/organizations/
 */
export const getOrganizationsList = async (params = {}) => {
  try {
    const response = await axiosAPI.get("users/organizations/", { params });
    const data = response.data?.data || response.data;
    if (Array.isArray(data)) return { results: data, count: data.length, next: null };
    return {
      results: data?.results || [],
      count: data?.count ?? 0,
      next: data?.next ?? null,
      page: data?.page ?? 1,
      total_pages: data?.total_pages ?? 1,
    };
  } catch (error) {
    console.error("Tashkilotlar ro'yxatini olishda xatolik:", error);
    return { results: [], count: 0, next: null, page: 1, total_pages: 1 };
  }
};

/**
 * Tashkilotchilar ro'yxati (Dropdown uchun)
 * Endpoint: GET /api/v1/meetings/organizers/
 */
export const getOrganizersList = async (params = {}) => {
  try {
    const response = await axiosAPI.get("meetings/organizers/", { params });
    const data = response.data?.data || response.data;
    if (Array.isArray(data)) return { results: data, count: data.length, next: null };
    return {
      results: data?.results || [],
      count: data?.count ?? 0,
      next: data?.next ?? null,
      page: data?.page ?? 1,
      total_pages: data?.total_pages ?? 1,
    };
  } catch (error) {
    console.error("Tashkilotchilar ro'yxatini olishda xatolik:", error);
    return { results: [], count: 0, next: null, page: 1, total_pages: 1 };
  }
};

/**
 * Ishtirokchilar ro'yxati (Dropdown uchun)
 * Endpoint: GET /api/v1/meetings/participants/
 */
export const getParticipantsList = async (params = {}) => {
  try {
    const response = await axiosAPI.get("meetings/participants/", { params });
    const data = response.data?.data || response.data;
    if (Array.isArray(data)) return { results: data, count: data.length, next: null };
    return {
      results: data?.results || [],
      count: data?.count ?? 0,
      next: data?.next ?? null,
      page: data?.page ?? 1,
      total_pages: data?.total_pages ?? 1,
    };
  } catch (error) {
    console.error("Ishtirokchilar ro'yxatini olishda xatolik:", error);
    return { results: [], count: 0, next: null, page: 1, total_pages: 1 };
  }
};

/**
 * Majlislar ro'yxati (Dropdown uchun)
 * Endpoint: GET /api/v1/meetings/
 */
export const getMeetingsList = async (params = {}) => {
  try {
    const response = await axiosAPI.get("meetings/", { params });
    const data = response.data?.data || response.data;
    if (Array.isArray(data)) return { results: data, count: data.length, next: null };
    return {
      results: data?.results || [],
      count: data?.count ?? 0,
      next: data?.next ?? null,
      page: data?.page ?? 1,
      total_pages: data?.total_pages ?? 1,
    };
  } catch (error) {
    console.error("Majlislar ro'yxatini olishda xatolik:", error);
    return { results: [], count: 0, next: null, page: 1, total_pages: 1 };
  }
};

/**
 * Majlis orqali imzo topshirish
 * Endpoint: POST /api/v1/meetings/{meeting_id}/signature/
 */
export const submitMeetingSignature = async (meetingId, signaturePayload) => {
  let formData;
  if (signaturePayload instanceof FormData) {
    formData = signaturePayload;
  } else {
    formData = new FormData();
    if (typeof signaturePayload === "string" && signaturePayload.startsWith("data:")) {
      const arr = signaturePayload.split(",");
      const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      formData.append("signature", blob, "signature.png");
    } else if (signaturePayload instanceof Blob || signaturePayload instanceof File) {
      formData.append("signature", signaturePayload, "signature.png");
    } else {
      formData.append("signature", signaturePayload);
    }
  }

  const response = await axiosAPI.post(`meetings/${meetingId}/signature/`, formData);
  return response.data?.data || response.data;
};
