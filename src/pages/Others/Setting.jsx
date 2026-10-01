import React, { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InformationCircleIcon,
  ArrowUpRight01Icon,
  LockIcon,
  Tick02Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { mockUserProfile } from "../../data/mockData";
import { PiArrowSquareOutBold } from "react-icons/pi";
import { Check, Lock } from "lucide-react";

const Setting = () => {
  const [savedOrg, setSavedOrg] = useState(
    () => localStorage.getItem("user_organization") || mockUserProfile.organization || "Raqamli Nazorat"
  );
  const [organization, setOrganization] = useState(savedOrg);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const isChanged = organization.trim() !== "" && organization.trim() !== savedOrg.trim();

  const user = {
    ...mockUserProfile,
    region: mockUserProfile.region || "Toshkent viloyati",
    district: mockUserProfile.district || "Toshkent tumani",
    birthDate: mockUserProfile.birthDate || "15.04.2004",
    avatar: mockUserProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!isChanged) return;
    localStorage.setItem("user_organization", organization);
    mockUserProfile.organization = organization;
    setSavedOrg(organization);
    setIsSaved(true);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setToastMessage({
      title: "Ma'lumotlaringiz yangilandi",
      description: `Tashkilot nomi yangilandi: ${organization}. Bugun ${timeStr}`,
    });
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
      {/* Toast Alert (Top-right absolute notification as in Figma) */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-white border border-[#10B981]/40 rounded-2xl shadow-xl p-4 flex items-start gap-3.5 max-w-md">
            <div className="text-[#10B981] flex-shrink-0 mt-0.5">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} />
            </div>
            <div className="flex-1 pr-2">
              <h4 className="text-[14px] font-bold text-[#1A1D2E] leading-tight">
                {toastMessage.title}
              </h4>
              <p className="text-[12.5px] text-[#5E6480] mt-1 leading-snug">
                {toastMessage.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-[#8B90A5] hover:text-[#1A1D2E] p-1 rounded-lg hover:bg-[#F1F3F9] transition-colors cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </button>
          </div>
        </div>
      )}

      {/* User Info / Avatar Card */}
      <div className="flex items-center gap-4.5 mb-8">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 md:w-[84px] md:h-[84px] rounded-2xl md:rounded-[20px] object-cover shadow-xs border border-[#E2E6F2]"
          />
        </div>
        <div>
          <h2 className="text-[19px] md:text-[20px] font-bold text-[#1A1D2E]">
            {user.name}
          </h2>
        </div>
      </div>

      {/* Passport Information Banner */}
      <div className="bg-[#EDEFF8] border border-[#3F57B340] rounded-2xl p-5 md:p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-2xs">
        <div className="flex items-center gap-3.5 max-w-2xl">
          <div className="text-[#3F57B3] flex-shrink-0 mt-0.5">
            <HugeiconsIcon icon={InformationCircleIcon} size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-[#1A1D2E] mb-1">
              Shaxsiy ma'lumotlar Passport tizimida saqlanadi
            </h3>
            <p className="text-[13px] text-[#5E6480] leading-relaxed">
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
            <label className="block text-[12px] font-medium text-[#5E6480] mb-1.5">
              Viloyat
            </label>
            <div className="h-[48px] px-4 rounded-xl border border-[#E2E6F2] bg-[#F8FAFC] flex items-center justify-between text-[13.5px] text-[#1A1D2E] font-medium select-none">
              <span>{user.region}</span>
              <Lock size={16} className="text-[#8B90A5]" />
            </div>
          </div>

          {/* Tuman (Disabled / Locked) */}
          <div>
            <label className="block text-[12px] font-medium text-[#5E6480] mb-1.5">
              Tuman
            </label>
            <div className="h-[48px] px-4 rounded-xl border border-[#E2E6F2] bg-[#F8FAFC] flex items-center justify-between text-[13.5px] text-[#1A1D2E] font-medium select-none">
              <span>{user.district}</span>
              <Lock size={16} className="text-[#8B90A5]" />
            </div>
          </div>

          {/* Tug'ilgan sanasi (Disabled / Locked) */}
          <div>
            <label className="block text-[12px] font-medium text-[#5E6480] mb-1.5">
              Tug'ilgan sanasi
            </label>
            <div className="h-[48px] px-4 rounded-xl border border-[#E2E6F2] bg-[#F8FAFC] flex items-center justify-between text-[13.5px] text-[#1A1D2E] font-medium select-none">
              <span>{user.birthDate}</span>
              <Lock size={16} className="text-[#8B90A5]" />
            </div>
          </div>

          {/* Tashkilot (Editable) */}
          <div>
            <label className="block text-[12px] font-medium text-[#5E6480] mb-1.5">
              Tashkilot
            </label>
            <div className="relative">
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Tashkilot nomini kiriting"
                className="w-full h-[48px] px-4 rounded-xl border border-[#E2E6F2] bg-white text-[13.5px] text-[#1A1D2E] font-medium outline-none focus:border-[#3858C7] focus:ring-2 focus:ring-[#3858C7]/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isChanged}
            className={`inline-flex items-center justify-center gap-2 font-bold text-[14.5px] px-4 py-3 rounded-xl transition-all shadow-sm ${
              isChanged
                ? "bg-[#3858C7] hover:bg-[#2C48B0] active:scale-[0.98] text-white cursor-pointer"
                : "bg-[#3858C7]/50 text-white/80 cursor-not-allowed"
            }`}
          >
            <Check strokeWidth={2.5} size={18} />
            <span>Saqlash</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Setting;