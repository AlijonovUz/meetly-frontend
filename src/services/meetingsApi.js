import { axiosAPI } from "./axiosAPI";

/**
 * Majlislar ro'yxatini olish
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
 * Bitta majlis ma'lumotlarini olish
 * Endpoint: GET /api/v1/meetings/{id}/
 */
export const getMeetingById = async (id) => {
  const response = await axiosAPI.get(`meetings/${id}/`);
  return response.data?.data || response.data;
};

/**
 * Yangi majlis yaratish
 * Endpoint: POST /api/v1/meetings/
 * @param {Object} payload - { title, description, start_date, duration, requires_approval, allow_join_before_host }
 */
export const createMeeting = async (payload) => {
  const response = await axiosAPI.post("meetings/", payload);
  return response.data?.data || response.data;
};

/**
 * Majlis ma'lumotlarini to'liq/qisman yangilash
 * Endpoint: PATCH /api/v1/meetings/{id}/ yoki PUT /api/v1/meetings/{id}/
 */
export const updateMeeting = async (id, payload) => {
  const response = await axiosAPI.patch(`meetings/${id}/`, payload);
  return response.data?.data || response.data;
};

/**
 * Majlisni o'chirish
 * Endpoint: DELETE /api/v1/meetings/{id}/
 */
export const deleteMeeting = async (id) => {
  const response = await axiosAPI.delete(`meetings/${id}/`);
  return response.data;
};

/**
 * Majlisni bekor qilish
 * Endpoint: POST /api/v1/meetings/{id}/cancel/
 * @param {string} id
 * @param {Object} data - { reason }
 */
export const cancelMeeting = async (id, { reason }) => {
  const response = await axiosAPI.post(`meetings/${id}/cancel/`, { reason });
  return response.data?.data || response.data;
};

/**
 * Majlis qatnashuvchilari (attendances) ro'yxatini olish
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

/**
 * Majlislar sonini olish (statuslar bo'yicha)
 * Endpoint: GET /api/v1/meetings/counts/
 * @param {Object} params - ixtiyoriy filtrlash parametrlari
 */
export const getMeetingCounts = async (params = {}) => {
  const response = await axiosAPI.get("meetings/counts/", { params });
  return response.data?.data || response.data;
};

/**
 * Majlisdan qatnashchini chiqarish
 * Endpoint: POST /api/v1/meetings/{id}/remove-participant/
 * @param {string} meetingId - majlis ID yoki UUID
 * @param {Object} payload - { user_id, participant_identity }
 */
export const removeMeetingParticipant = async (meetingId, payload = {}) => {
  const response = await axiosAPI.post(`meetings/${meetingId}/remove-participant/`, payload);
  return response.data?.data || response.data;
};

/**
 * Majlis qatnashuviga imzo qo'yish (Attendance Signature)
 * Endpoint: POST /api/v1/meetings/attendances/{id}/signature/
 * @param {string} attendanceId - Majlis qatnashuvi UUID
 * @param {File|Blob|string|FormData} signaturePayload - Imzo fayli yoki base64
 */
export const submitAttendanceSignature = async (attendanceId, signaturePayload) => {
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

  const response = await axiosAPI.post(
    `meetings/attendances/${attendanceId}/signature/`,
    formData
  );
  return response.data?.data || response.data;
};

/**
 * Majlis orqali to'g'ridan-to'g'ri imzo topshirish (Meeting Signature)
 * Endpoint: POST /api/v1/meetings/{meeting_id}/signature/
 * @param {string} meetingId
 * @param {File|Blob|string|FormData} signaturePayload
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


