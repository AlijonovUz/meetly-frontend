import { axiosAPI } from "./axiosAPI";

/**
 * 1. Passport login havolasini olib o'sha manzilga yo'naltirish
 * Endpoint: GET /api/v1/auth/passport/url/
 */
export const loginWithPassport = async () => {
  try {
    const currentCallback = `${window.location.origin}/auth/callback`;
    const response = await axiosAPI.get("auth/passport/url/", {
      params: { redirect_uri: currentCallback },
    });
    let loginUrl = response.data?.data?.url;

    if (loginUrl) {
      try {
        // Agar backend bergan URL da redirect_uri bo'lsa, uni joriy port/domen (localhost yoki production) ga moslashtirish
        const parsedUrl = new URL(loginUrl);
        parsedUrl.searchParams.set("redirect_uri", currentCallback);
        loginUrl = parsedUrl.toString();
      } catch (e) {
        console.error("Redirect URI almashtirishda xatolik:", e);
      }
      window.location.href = loginUrl;
      return loginUrl;
    } else {
      throw new Error("Login URL topilmadi");
    }
  } catch (error) {
    console.error("Passport login URL olishda xatolik:", error);
    throw error;
  }
};

/**
 * 2. Callback sahifasida 'code' va 'redirect_uri' parametrini backendga yuborib JWT tokenlarni olish
 * Endpoint: POST /api/v1/auth/passport/callback/
 */
export const handlePassportCallback = async (code, redirectUri) => {
  const currentRedirectUri =
    redirectUri || `${window.location.origin}/auth/callback`;
  const response = await axiosAPI.post("auth/passport/callback/", {
    code,
    redirect_uri: currentRedirectUri,
  });
  const data = response.data?.data || {};
  const { access, refresh, passport_access_token, user } = data;

  if (access) {
    localStorage.setItem("access_token", access);
  }
  if (refresh) {
    localStorage.setItem("refresh_token", refresh);
  }
  if (passport_access_token) {
    localStorage.setItem("passport_access_token", passport_access_token);
  }
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    if (user.organization) {
      localStorage.setItem("user_organization", user.organization);
    }
  }

  return data;
};

/**
 * 3. O'z profil ma'lumotlarini olish
 * Endpoint: GET /api/v1/users/me/
 */
export const getMyProfile = async () => {
  const response = await axiosAPI.get("users/me/");
  const userData = response.data?.data;
  if (userData) {
    localStorage.setItem("currentUser", JSON.stringify(userData));
    if (userData.organization) {
      localStorage.setItem("user_organization", userData.organization);
    }
  }
  return userData;
};

/**
 * 4. Foydalanuvchi tashkilot nomini tahrirlash
 * Endpoint: PATCH /api/v1/users/me/
 */
export const updateOrganization = async (organization) => {
  const response = await axiosAPI.patch("users/me/", { organization });
  const updatedData = response.data?.data;
  if (updatedData) {
    const currentUser = getCurrentUser() || {};
    const newUser = { ...currentUser, organization: updatedData.organization || organization };
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    localStorage.setItem("user_organization", updatedData.organization || organization);
  }
  return updatedData;
};

/**
 * 5. Profilni Passport bilan qayta sinxronlashtirish
 * Endpoint: POST /api/v1/auth/passport/sync/
 */
export const syncPassportProfile = async () => {
  const passportToken = localStorage.getItem("passport_access_token")

  const response = await axiosAPI.post(
    "auth/passport/sync/",
    {
      access_token: passportToken,
    }
  );
  const syncedData = response.data?.data;
  if (syncedData?.user) {
    localStorage.setItem("currentUser", JSON.stringify(syncedData.user));
  }
  return syncedData;
};

/**
 * 6. Foydalanuvchining login qilgan yoki qilmaganligini tekshirish
 */
export const isAuthenticated = () => {
  const token =
    localStorage.getItem("access_token");
  return Boolean(token && token !== "undefined" && token !== "null");
};

/**
 * 7. Saqlangan joriy foydalanuvchi ma'lumotlarini olish
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (err) {
    console.error("User ma'lumotlarini o'qishda xatolik:", err);
  }
  return null;
};

/**
 * 8. Tizimdan chiqish (Logout)
 */
export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("passport_access_token");
  localStorage.removeItem("currentUser");
  window.location.href = "/leanding";
};
