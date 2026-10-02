import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UserX,
  Send,
  LogOut,
  X,
  CheckCircle2,
  Clock,
  Circle,
  ArrowRight,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { FaTelegramPlane } from "react-icons/fa";
import { logout, getCurrentUser, loginWithPassport } from "../../services/auth";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Logout03Icon,
  SentIcon,
  UserBlock01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Login03Icon,
} from "@hugeicons/core-free-icons";
import dayjs from "dayjs";

const getBaseApiUrl = () => {
  const url = import.meta.env.VITE_BASE_URL || "";
  return url.endsWith("/") ? url : `${url}/`;
};

const BlockedUserScreen = ({ onAppealSubmitted }) => {
  const user = getCurrentUser() || {};
  const userId = user.id || user.user_id || "current_user";

  const storageKey = `user_appeal_${userId}`;
  const [appealData, setAppealData] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [canSubmitAppeal, setCanSubmitAppeal] = useState(true);
  const [customBlockedReason, setCustomBlockedReason] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [reasonInput, setReasonInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load appeal status by userId from API (without Bearer token)
  useEffect(() => {
    if (!userId || userId === "current_user") return;
    axios
      .get(`${getBaseApiUrl()}users/appeals/status/`, {
        params: { user_id: userId },
      })
      .then((res) => {
        const rawData = res.data?.data || res.data;
        if (rawData) {
          if (rawData.can_submit_appeal !== undefined) {
            setCanSubmitAppeal(Boolean(rawData.can_submit_appeal));
          }
          if (rawData.blocked_reason) {
            setCustomBlockedReason(rawData.blocked_reason);
          }
        }

        const data = rawData?.appeal || (Array.isArray(rawData) ? rawData[0] : (rawData?.id ? rawData : null));
        if (data && (data.id || data.message || data.status)) {
          const appeal = {
            id: data.id,
            userId: userId,
            text: data.message || data.text,
            date: data.created_at || data.date,
            created_at: data.created_at,
            reviewed_at: data.reviewed_at,
            rejection_reason: data.rejection_reason,
            status: data.status || "PENDING",
            raw: data,
          };
          setAppealData(appeal);
          try {
            localStorage.setItem(storageKey, JSON.stringify(appeal));
          } catch (e) { }
        } else {
          setAppealData(null);
          try {
            localStorage.removeItem(storageKey);
          } catch (e) { }
        }
      })
      .catch((err) => {
        console.error("Shikoyat statusini yuklashda xatolik:", err);
      });
  }, [userId, storageKey]);

  // Sync state if localStorage changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setAppealData(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, [storageKey]);

  const handleSendAppeal = async (e) => {
    e.preventDefault();
    if (!reasonInput.trim() || submitting) return;

    setSubmitting(true);

    const payload = {
      user_id: user.id || user.user_id,
      phone_number: user.phone_number || user.phoneNumber || "",
      passport_id: user.passport_id || user.passportId || "",
      message: reasonInput.trim(),
    };

    try {
      // Direct axios call without Authorization header
      const res = await axios.post(`${getBaseApiUrl()}users/appeals/`, payload);
      const response = res.data?.data || res.data;

      const now = new Date();
      const formattedDate = dayjs(response?.created_at ? new Date(response.created_at) : now).format("DD.MM.YYYY HH:mm");

      const newAppeal = {
        id: response?.id,
        userId: payload.user_id,
        text: reasonInput.trim(),
        date: formattedDate,
        created_at: response?.created_at,
        reviewed_at: response?.reviewed_at,
        rejection_reason: response?.rejection_reason,
        status: response?.status || "PENDING",
        raw: response,
      };

      localStorage.setItem(storageKey, JSON.stringify(newAppeal));
      setAppealData(newAppeal);
      setModalOpen(false);
      setReasonInput("");

      if (onAppealSubmitted) {
        onAppealSubmitted(newAppeal);
      }
    } catch (err) {
      console.error("E'tiroz yuborishda xatolik:", err);
      const errRes = err?.response?.data;
      const errorObj = errRes?.error;
      const details = errorObj?.details || errRes?.details;

      let errMsg = "";
      if (details) {
        if (Array.isArray(details.non_field_errors) && details.non_field_errors.length > 0) {
          errMsg = details.non_field_errors.join(", ");
        } else if (typeof details === "string") {
          errMsg = details;
        } else if (typeof details === "object") {
          const keys = Object.keys(details);
          const firstKey = keys[0];
          if (firstKey) {
            const val = details[firstKey];
            errMsg = Array.isArray(val) ? val.join(", ") : String(val);
          }
        }
      }

      if (!errMsg) {
        errMsg =
          errorObj?.errorMsg ||
          errorObj?.message ||
          errRes?.errorMsg ||
          errRes?.detail ||
          errRes?.message ||
          (Array.isArray(errRes?.message) ? errRes?.message.join(", ") : null) ||
          (Array.isArray(errRes?.non_field_errors) ? errRes?.non_field_errors.join(", ") : null) ||
          err?.message ||
          "E'tiroz yuborishda xatolik yuz berdi";
      }

      setToastMessage({
        type: "error",
        title: errorObj?.errorMsg || "Xatolik",
        description: errMsg,
      });

      // Agar allaqachon e'tiroz yuborilgan bo'lsa, modalni yopib statusni yuklash
      if (userId && userId !== "current_user") {
        axios
          .get(`${getBaseApiUrl()}users/appeals/status/`, {
            params: { user_id: userId },
          })
          .then((res) => {
            const rawData = res.data?.data || res.data;
            const data = Array.isArray(rawData) ? rawData[0] : rawData;
            if (data && (data.id || data.message || data.status)) {
              const appeal = {
                id: data.id,
                userId: userId,
                text: data.message || data.text,
                date: data.created_at || data.date,
                created_at: data.created_at,
                reviewed_at: data.reviewed_at,
                rejection_reason: data.rejection_reason,
                status: data.status || "PENDING",
                raw: data,
              };
              setAppealData(appeal);
              setModalOpen(false);
              try {
                localStorage.setItem(storageKey, JSON.stringify(appeal));
              } catch (e) { }
            }
          })
          .catch(() => { });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const blockDate = user.updated_at
    ? dayjs(user.updated_at).format("DD.MM.YYYY HH:mm")
    : "";

  const blockReason =
    customBlockedReason || user.blocked_reason || "Yig'ilishlarda spam xabarlar yuborgan.";

  return (
    <div className="min-h-screen bg-[#FFFFFF] sm:bg-[#F8FAFC] font-['Manrope',sans-serif] flex items-center justify-center p-4 sm:p-6 text-[#1A1D2E] relative overflow-hidden">
      {/* Main Container */}
      {!appealData ? (
        /* ================= 02.6 BLOKLANGAN FOYDALANUVCHI, KIRISHDA (Matching Image 2) ================= */
        <div className="w-full max-w-[560px] mx-auto text-center animate-in fade-in duration-200 py-6">
          {/* User Blocked Icon */}
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center mx-auto mb-5 shadow-2xs">
            <HugeiconsIcon icon={UserBlock01Icon} size={26} strokeWidth={2.2} />
          </div>

          {/* Heading */}
          <h2 className="text-[22px] sm:text-[24px] font-bold text-[#101828] tracking-tight">
            Hisobingiz bloklangan
          </h2>

          {/* Subtitle */}
          <p className="text-[14px] text-[#475467] max-w-md mx-auto mt-2 leading-relaxed">
            Administrator hisobingizni blokladi, shu sababli tizimdan foydalana olmaysiz.
          </p>

          {/* Details Box */}
          <div className="bg-white border border-[#EAECF0] rounded-2xl p-5 my-6 space-y-3.5 text-[14px] text-left shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#667085] font-normal">Bloklangan sana</span>
              <span className="font-bold text-[#101828]">{blockDate}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-[#667085] font-normal shrink-0">Sabab</span>
              <span className="font-bold text-[#101828] text-right">{blockReason}</span>
            </div>
          </div>

          {/* Bottom Helper Note */}
          <p className="text-[13px] text-[#667085] mb-6 leading-normal">
            Agar bu xato deb hisoblasangiz, administratorga e'tiroz yuboring.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="h-11 px-5 rounded-xl bg-[#3858C7] hover:bg-[#2B46AC] active:scale-[0.98] text-white text-[14px] font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <HugeiconsIcon icon={SentIcon} strokeWidth={3} size={15} className="-rotate-12 translate-y-[-1px]" />
              <span>E'tiroz yuborish</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="h-11 px-5 rounded-xl bg-[#F2F4F7] hover:bg-[#E4E7EC] active:scale-[0.98] text-[#344054] text-[14px] font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <HugeiconsIcon icon={Logout03Icon} strokeWidth={3} size={16} />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      ) : (
        /* ================= 02.8 E'TIROZ YUBORILDI (STATUS / STEPPER) ================= */
        <div className="w-full max-w-xl mx-auto py-8 text-center animate-in fade-in zoom-in-95 duration-200">
          {/* Telegram Airplane Icon */}
          <div className="w-16 h-16 rounded-full bg-[#EBF1FF] text-[#3858C7] flex items-center justify-center mx-auto mb-5 shadow-2xs">
            <HugeiconsIcon icon={SentIcon} size={28} className="translate-x-0.5 -translate-y-0.5" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-[26px] font-bold text-[#1A1D2E] tracking-tight mb-2">
            {appealData.status === "APPROVED"
              ? "E'tirozingiz tasdiqlandi!"
              : appealData.status === "REJECTED"
                ? "E'tirozingiz rad etildi"
                : "E'tirozingiz yuborildi"}
          </h2>

          {/* Subtitle */}
          <p className="text-[14px] text-[#5B6078] max-w-md mx-auto mb-7 leading-relaxed">
            {appealData.status === "APPROVED"
              ? "Hisobingiz administrator tomonidan blokdan chiqarildi. Endi Passport orqali tizimga kirishingiz mumkin."
              : appealData.status === "REJECTED"
                ? (appealData.rejection_reason || "Administrator murojaatingizni ko'rib chiqib rad etdi.")
                : "Administrator murojaatingizni ko'rib chiqadi."}
          </p>

          {/* Stepper Card */}
          <div className="w-full max-w-[460px] bg-white border border-[#E2E6F2] rounded-2xl p-5 sm:p-6 mb-7 text-left space-y-5 shadow-none mx-auto">
            {/* Step 1: E'tiroz yuborildi (Done) */}
            <div className="flex items-start gap-3.5">
              <div className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={16} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[13.5px] text-[#1A1D2E]">
                  E'tiroz yuborildi
                </div>
                <div className="text-[12px] text-[#8B90A5] mt-0.5">
                  {appealData.created_at
                    ? dayjs(appealData.created_at).format("DD.MM.YYYY HH:mm")
                    : (appealData.date ? dayjs(appealData.date).format("DD.MM.YYYY HH:mm") : dayjs().format("DD.MM.YYYY HH:mm"))}
                </div>
              </div>
            </div>

            {/* Step 2: Ko'rib chiqilmoqda / Ko'rib chiqildi */}
            <div className="flex items-start gap-3.5">
              {appealData.status === "APPROVED" || appealData.status === "REJECTED" ? (
                <div className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#E0EAFF] flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3858C7]"></div>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[13.5px] text-[#1A1D2E]">
                  {appealData.status === "APPROVED" || appealData.status === "REJECTED"
                    ? "Ko'rib chiqildi"
                    : "Ko'rib chiqilmoqda"}
                </div>
                <div className="text-[12px] text-[#8B90A5] mt-0.5">
                  {appealData.reviewed_at
                    ? dayjs(appealData.reviewed_at).format("DD.MM.YYYY HH:mm")
                    : "Odatda 1 ish kuni ichida"}
                </div>
              </div>
            </div>

            {/* Step 3: Javob (Pending / Approved / Rejected) */}
            <div className="flex items-start gap-3.5">
              {appealData.status === "APPROVED" ? (
                <div className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                </div>
              ) : appealData.status === "REJECTED" ? (
                <div className="w-6 h-6 rounded-full bg-[#FEF3F2] text-[#D92D20] flex items-center justify-center shrink-0 mt-0.5">
                  <HugeiconsIcon icon={Cancel01Icon} size={15} strokeWidth={2.5} />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-[#D0D5DD] flex items-center justify-center shrink-0 mt-0.5"></div>
              )}
              <div className="flex-1 min-w-0">
                <div
                  className={`font-semibold text-[13.5px] ${appealData.status === "APPROVED"
                      ? "text-[#10B981] font-bold"
                      : appealData.status === "REJECTED"
                        ? "text-[#D92D20] font-bold"
                        : "text-[#8B90A5]"
                    }`}
                >
                  {appealData.status === "APPROVED"
                    ? "Blokdan chiqarildi"
                    : appealData.status === "REJECTED"
                      ? "Rad etildi"
                      : "Javob"}
                </div>
                <div className="text-[12px] text-[#8B90A5] mt-0.5">
                  {appealData.status === "APPROVED"
                    ? "Hisobingiz blokdan chiqarildi"
                    : appealData.status === "REJECTED"
                      ? (appealData.rejection_reason || "E'tirozingiz rad etildi")
                      : "Blokdan chiqarish yoki rad etish"}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {appealData.status === "APPROVED" && (
              <button
                type="button"
                onClick={loginWithPassport}
                className="h-11 px-6 rounded-xl bg-[#3858C7] hover:bg-[#2B46AC] active:scale-[0.98] text-white text-[13.5px] font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <HugeiconsIcon icon={Login03Icon} strokeWidth={2.5} size={16} />
                <span>Passport orqali kirish</span>
              </button>
            )}

            {canSubmitAppeal && appealData.status === "REJECTED" && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="h-11 px-6 rounded-xl bg-[#3858C7] hover:bg-[#2B46AC] active:scale-[0.98] text-white text-[13.5px] font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <HugeiconsIcon icon={SentIcon} strokeWidth={3} size={15} className="-rotate-12 translate-y-[-1px]" />
                <span>Qayta e'tiroz yuborish</span>
              </button>
            )}

            <button
              type="button"
              onClick={logout}
              className="h-11 px-6 rounded-xl bg-[#F2F4F7] hover:bg-[#E4E7EC] active:scale-[0.98] text-[#344054] text-[13.5px] font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-none"
            >
              <HugeiconsIcon icon={Logout03Icon} strokeWidth={2.5} size={16} />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-[560px] rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-[#E2E6F2]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F3F9]">
              <h3 className="font-bold text-[18px] text-[#1A1D2E]">
                E'tiroz yuborish
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#8B90A5] hover:text-[#1A1D2E] p-1 rounded-lg hover:bg-[#F1F3F9] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Description */}
            <p className="text-[13px] text-[#5B6078] leading-relaxed">
              Bloklanish sababini hisobga olgan holda, nima uchun hisobingiz ochilishi kerakligini tushuntiring.
            </p>

            {/* Modal Form */}
            <form onSubmit={handleSendAppeal} className="space-y-4">
              <div>
                <textarea
                  rows={4}
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Men spam yubormaganman. Bu xabarlar ish guruhidagi e'lonlar edi, iltimos qayta ko'rib chiqing..."
                  className="w-full bg-[#FAFAFC] border border-[#E2E6F2] rounded-2xl p-3.5 text-[13.5px] text-[#1A1D2E] placeholder-[#8B90A5] focus:outline-none focus:border-[#3858C7] focus:ring-2 focus:ring-[#3858C7]/15 transition-all resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 flex items-center gap-1.5 rounded-xl hover:bg-[#F8FAFC] text-[13.5px] font-bold transition-colors cursor-pointer"
                >
                  <X strokeWidth={2.5} size={16} />
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={!reasonInput.trim() || submitting}
                  className={`px-5 py-2.5 rounded-xl text-white text-[13.5px] font-semibold transition-all shadow-xs flex items-center gap-2 ${reasonInput.trim() && !submitting
                      ? "bg-[#3858C7] hover:bg-[#2B46AC] cursor-pointer active:scale-95"
                      : "bg-[#3858C7]/50 cursor-not-allowed"
                    }`}
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <HugeiconsIcon icon={SentIcon} strokeWidth={3} size={15} />
                  )}
                  <span>{submitting ? "Yuborilmoqda..." : "Yuborish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`bg-white border rounded-2xl shadow-xl p-4 flex items-start gap-3.5 max-w-md ${toastMessage.type === "error"
                ? "border-[#FECDCA]"
                : "border-[#10B981]/40"
              }`}
          >
            <div
              className={`flex-shrink-0 mt-0.5 ${toastMessage.type === "error" ? "text-[#D92D20]" : "text-[#10B981]"
                }`}
            >
              {toastMessage.type === "error" ? (
                <div className="w-5.5 h-5.5 rounded-full bg-[#FEF3F2] flex items-center justify-center text-[#D92D20]">
                  <HugeiconsIcon icon={Cancel01Icon} size={15} strokeWidth={2.5} />
                </div>
              ) : (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} />
              )}
            </div>
            <div className="flex-1 pr-2">
              <h4
                className={`text-[14px] font-bold leading-tight ${toastMessage.type === "error" ? "text-[#D92D20]" : "text-[#1A1D2E]"
                  }`}
              >
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
    </div>
  );
};

export default BlockedUserScreen;
