import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InformationCircleIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { PiArrowSquareOutBold } from "react-icons/pi";
import { Check, Lock, RefreshCw } from "lucide-react";
import { getMyProfile, updateOrganization, syncPassportProfile } from "../../services/auth";
import { setCurrentUser } from "../../store/slice/referencesSlice";

const Setting = () => {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.references?.currentUser);
  const [profileData, setProfileData] = useState(() => reduxUser || {});
  const [savedOrg, setSavedOrg] = useState(
    () => reduxUser?.organization || "Tashkilot kiritilmagan"
  );
  const [organization, setOrganization] = useState(() => reduxUser?.organization || "");
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (reduxUser) {
      setProfileData(reduxUser);
      if (reduxUser.organization) {
        setSavedOrg(reduxUser.organization);
        setOrganization(reduxUser.organization);
      }
    }
  }, [reduxUser]);

  useEffect(() => {
    // API orqali profilni yuklash
    getMyProfile()
      .then((data) => {
        if (data) {
          setProfileData(data);
          dispatch(setCurrentUser(data));
          if (data.organization) {
            setSavedOrg(data.organization);
            setOrganization(data.organization);
          }
        }
      })
      .catch((err) => {
        console.error("Profilni yuklashda xatolik:", err);
      });
  }, [dispatch]);

  const isChanged =
    Boolean(organization.trim()) &&
    organization.trim() !== (savedOrg === "Tashkilot kiritilmagan" ? "" : savedOrg.trim());

  const fullName =
    [profileData.first_name, profileData.last_name, profileData.patronymic]
      .filter(Boolean)
      .join(" ") ||
    profileData.full_name ||
    "Foydalanuvchi";

  const initials =
    (
      (profileData.first_name?.[0] || "") +
      (profileData.last_name?.[0] || "")
    ).toUpperCase() || (fullName?.[0] || "F").toUpperCase();

  const user = {
    name: fullName,
    initials,
    region: profileData.region_info?.name || profileData.region || "",
    district: profileData.district_info?.name || profileData.district || "",
    birthDate: profileData.birth_date || profileData.birthDate || "",
    avatar: profileData.avatar,
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isChanged || saving) return;
    setSaving(true);
    try {
      await updateOrganization(organization.trim());
      setSavedOrg(organization.trim());
      dispatch(setCurrentUser({ ...profileData, organization: organization.trim() }));
      setIsSaved(true);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      setToastMessage({
        type: "success",
        title: "Ma'lumotlaringiz yangilandi",
        description: `Tashkilot nomi yangilandi: ${organization.trim()}. Bugun ${timeStr}`,
      });
    } catch (err) {
      console.error("Tashkilotni saqlashda xatolik:", err);
      setToastMessage({
        type: "error",
        title: "Xatolik",
        description:
          err?.response?.data?.error?.errorMsg ||
          err?.response?.data?.message ||
          "Tashkilot nomini yangilab bo'lmadi.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await syncPassportProfile();
      if (res?.user) {
        const mergedUser = {
          ...profileData,
          ...res.user,
          is_staff: res.user.is_staff !== undefined ? res.user.is_staff : (profileData?.is_staff ?? reduxUser?.is_staff),
        };
        setProfileData(mergedUser);
        dispatch(setCurrentUser(mergedUser));
      }
      setToastMessage({
        type: "success",
        title: "Sinxronlandi",
        description: "Profil ma'lumotlari Passport tizimi bilan sinxronlashtirildi.",
      });
    } catch (err) {
      console.error(err);
      setToastMessage({
        type: "error",
        title: "Xatolik",
        description:
          err?.response?.data?.error?.errorMsg ||
          err?.response?.data?.message ||
          err?.message ||
          "Passport bilan sinxronlashda xatolik yuz berdi.",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="p-6 py-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`bg-white dark:bg-[#161C2E] border dark:border-[#2B3553] rounded-2xl shadow-xl p-4 flex items-start gap-3.5 max-w-md ${
              toastMessage.type === "error"
                ? "border-[#FECDCA] dark:border-red-900/50"
                : "border-[#10B981]/40"
            }`}
          >
            <div
              className={`flex-shrink-0 mt-0.5 ${
                toastMessage.type === "error" ? "text-[#D92D20]" : "text-[#10B981]"
              }`}
            >
              {toastMessage.type === "error" ? (
                <div className="w-5.5 h-5.5 rounded-full bg-[#FEF3F2] dark:bg-red-950/40 flex items-center justify-center text-[#D92D20] dark:text-red-400">
                  <HugeiconsIcon icon={Cancel01Icon} size={15} strokeWidth={2.5} />
                </div>
              ) : (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} />
              )}
            </div>
            <div className="flex-1 pr-2">
              <h4
                className={`text-[14px] font-bold leading-tight ${
                  toastMessage.type === "error" ? "text-[#D92D20] dark:text-red-400" : "text-[#1A1D2E] dark:text-white"
                }`}
              >
                {toastMessage.title}
              </h4>
              <p className="text-[12.5px] text-[#5E6480] dark:text-[#94A3B8] mt-1 leading-snug">
                {toastMessage.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-[#8B90A5] hover:text-[#1A1D2E] dark:hover:text-white p-1 rounded-lg hover:bg-[#F1F3F9] dark:hover:bg-[#1C2438] transition-colors cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </button>
          </div>
        </div>
      )}

      {/* User Info / Avatar Card */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4.5">
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 md:w-[84px] md:h-[84px] rounded-2xl md:rounded-[20px] object-cover shadow-xs border border-[#E2E6F2] dark:border-[#2B3553]"
              />
            ) : (
              <div className="w-20 h-20 md:w-[84px] md:h-[84px] rounded-2xl md:rounded-[20px] bg-[#EEF2FF] dark:bg-[#1C2438] text-[#3858C7] dark:text-[#7C9BFF] font-bold text-xl md:text-2xl flex items-center justify-center shadow-xs border border-[#D0DCFF] dark:border-[#2B3553]">
                {user.initials}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-[19px] md:text-[20px] font-bold text-[#1A1D2E] dark:text-white">
              {user.name}
            </h2>
            <p className="text-[13px] font-medium text-[#5E6480] dark:text-[#94A3B8] mt-0.5">
              {savedOrg}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[#E2E6F2] dark:border-[#2B3553] bg-white dark:bg-[#161C2E] hover:bg-[#F8FAFC] dark:hover:bg-[#1C2438] text-[13px] font-bold text-[#3858C7] dark:text-[#7C9BFF] transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
          <span>Passport bilan sinxronlash</span>
        </button>
      </div>

      {/* Passport Information Banner */}
      <div className="bg-[#EDEFF8] dark:bg-[#161C2E] border border-[#3F57B340] dark:border-[#2B3553] rounded-2xl p-5 md:p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-2xs">
        <div className="flex items-center gap-3.5 max-w-2xl">
          <div className="text-[#3F57B3] dark:text-[#7C9BFF] flex-shrink-0 mt-0.5">
            <HugeiconsIcon icon={InformationCircleIcon} size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-[#1A1D2E] dark:text-white mb-1">
              Shaxsiy ma'lumotlar Passport tizimida saqlanadi
            </h3>
            <p className="text-[13px] text-[#5E6480] dark:text-[#94A3B8] leading-relaxed">
              Ism, viloyat, tuman va tug'ilgan sana yagona kirish tizimi Passport'da o'zgartiriladi. O'zgarishlar bu yerda avtomatik yangilanadi.
            </p>
          </div>
        </div>

        <a
          href="http://passport.raqamlinazorat.uz"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-[#3F57B3] hover:bg-[#2C48B0] active:scale-[0.98] text-white font-bold text-[14px] px-5 py-3.5 rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap self-start md:self-auto"
        >
          <span>Passport'da o'zgartirish</span>
          <PiArrowSquareOutBold size={16} strokeWidth={2.5} />
        </a>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-8">
          {/* Viloyat (Disabled / Locked) */}
          <div>
            <label className="block text-[12px] font-medium text-[#5E6480] dark:text-[#94A3B8] mb-1.5">
              Viloyat
            </label>
            <div className="h-[48px] px-4 rounded-xl border border-[#E2E6F2] dark:border-[#2B3553] bg-[#F8FAFC] dark:bg-[#121624] flex items-center justify-between text-[13.5px] text-[#1A1D2E] dark:text-white font-medium select-none">
              <span>{user.region}</span>
              <Lock size={16} className="text-[#8B90A5] dark:text-[#64748B]" />
            </div>
          </div>

          {/* Tuman (Disabled / Locked) */}
          <div>
            <label className="block text-[12px] font-medium text-[#5E6480] dark:text-[#94A3B8] mb-1.5">
              Tuman
            </label>
            <div className="h-[48px] px-4 rounded-xl border border-[#E2E6F2] dark:border-[#2B3553] bg-[#F8FAFC] dark:bg-[#121624] flex items-center justify-between text-[13.5px] text-[#1A1D2E] dark:text-white font-medium select-none">
              <span>{user.district}</span>
              <Lock size={16} className="text-[#8B90A5] dark:text-[#64748B]" />
            </div>
          </div>

          {/* Tug'ilgan sanasi (Disabled / Locked) */}
          <div>
            <label className="block text-[12px] font-medium text-[#5E6480] dark:text-[#94A3B8] mb-1.5">
              Tug'ilgan sanasi
            </label>
            <div className="h-[48px] px-4 rounded-xl border border-[#E2E6F2] dark:border-[#2B3553] bg-[#F8FAFC] dark:bg-[#121624] flex items-center justify-between text-[13.5px] text-[#1A1D2E] dark:text-white font-medium select-none">
              <span>{user.birthDate}</span>
              <Lock size={16} className="text-[#8B90A5] dark:text-[#64748B]" />
            </div>
          </div>

          {/* Tashkilot (Editable & Required) */}
          <div>
            <label className="block text-[12px] font-medium text-[#5E6480] dark:text-[#94A3B8] mb-1.5">
              Tashkilot <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Tashkilot nomini kiriting"
                className={`w-full h-[48px] px-4 rounded-xl border bg-white dark:bg-[#121624] text-[13.5px] text-[#1A1D2E] dark:text-white font-medium outline-none transition-all placeholder:text-[#8B90A5] dark:placeholder:text-[#64748B] ${
                  organization.trim() === ""
                    ? "border-red-400/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-[#E2E6F2] dark:border-[#2B3553] focus:border-[#3858C7] focus:ring-2 focus:ring-[#3858C7]/20"
                }`}
              />
            </div>
            {organization.trim() === "" && (
              <p className="text-[11.5px] text-red-500 mt-1.5 font-medium">
                Tashkilot nomini kiritish majburiy
              </p>
            )}
          </div>
        </div>

        {/* Actions Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isChanged || !organization.trim() || saving}
            className={`inline-flex items-center justify-center gap-2 font-bold text-[14.5px] px-5 py-3 rounded-xl transition-all shadow-sm ${
              isChanged && organization.trim() && !saving
                ? "bg-[#3858C7] hover:bg-[#2C48B0] active:scale-[0.98] text-white cursor-pointer"
                : "bg-[#3858C7]/50 text-white/80 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Check strokeWidth={2.5} size={18} />
                <span>Saqlash</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Setting;