import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

export const axiosAPI = axios.create({
  baseURL: baseURL,
  paramsSerializer: {
    encode: (param) => param,
  },
});

// ── Har bir so'rovga access tokenni qo'shish (Request Interceptor) ──
axiosAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── 401 (token eskirganda) avtomatik yangilash (Response Interceptor) ──
axiosAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const url = originalRequest?.url || "";

    const errorCode =
      error?.response?.data?.error?.errorCode ||
      error?.response?.data?.errorCode;

    // Agar foydalanuvchi bloklangan bo'lsa (user_blocked)
    if (errorCode === "user_blocked") {
      try {
        const existing = JSON.parse(localStorage.getItem("currentUser") || "{}");
        const details = error?.response?.data?.error?.details || {};
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ ...existing, ...details, is_blocked: true })
        );
      } catch (e) {}
      return Promise.reject(error);
    }

    const isAuthRequest =
      url.includes("auth/passport") || url.includes("auth/token/refresh");

    if (status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      const refreshToken =
        localStorage.getItem("refresh_token");

      if (refreshToken && refreshToken !== "undefined" && refreshToken !== "null") {
        try {
          const cleanBase = baseURL.replace(/\/+$/, "");
          const res = await axios.post(`${cleanBase}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccess = res.data?.data?.access;
          if (newAccess) {
            localStorage.setItem("access_token", newAccess);
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return axiosAPI(originalRequest);
          }
        } catch (refreshErr) {
          // Refresh token ham eskirgan bo'lsa tozalash
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("currentUser");

          if (
            window.location.pathname !== "/leanding" &&
            window.location.pathname !== "/auth/callback"
          ) {
            window.location.href = "/leanding";
          }
          return Promise.reject(refreshErr);
        }
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("currentUser");

        if (
          window.location.pathname !== "/leanding" &&
          window.location.pathname !== "/auth/callback"
        ) {
          window.location.href = "/leanding";
        }
      }
    }

    return Promise.reject(error);
  }
);
