import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { handlePassportCallback, getCurrentUser, loginWithPassport } from "../../services/auth";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Send,
  X,
  Loader2,
  Clock,
} from "lucide-react";
import { FaTelegramPlane } from "react-icons/fa";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SentIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Login03Icon,
} from "@hugeicons/core-free-icons";
import dayjs from "dayjs";

const getBaseApiUrl = () => {
  const url = import.meta.env.VITE_BASE_URL || "";
  return url.endsWith("/") ? url : `${url}/`;
};

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState("");
  const [blockedUser, setBlockedUser] = useState(() => getCurrentUser() || {});
  const [blockedDetails, setBlockedDetails] = useState(null);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [showStepper, setShowStepper] = useState(false);

  // Appeal state
  const [modalOpen, setModalOpen] = useState(false);
  const [reasonInput, setReasonInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [appealData, setAppealData] = useState(null);
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

  // Check appeal status if user id is known
  const checkAppealStatus = async (uid) => {
    if (!uid || uid === "current_user") return;
    try {
      const res = await axios.get(`${getBaseApiUrl()}users/appeals/status/`, {
        params: { user_id: uid },
      });
      const data = res.data?.data || res.data;
      const appealObj = data?.appeal || (Array.isArray(data) ? data[0] : data);
      if (appealObj && (appealObj.id || appealObj.message || appealObj.status)) {
        setAppealData({
          id: appealObj.id,
          userId: uid,
          text: appealObj.message || appealObj.text,
          date: appealObj.created_at || appealObj.date,
          created_at: appealObj.created_at,
          reviewed_at: appealObj.reviewed_at,
          rejection_reason: appealObj.rejection_reason,
          status: appealObj.status || "PENDING",
          raw: appealObj,
        });
      }
    } catch (e) {
      // no existing appeal
    }
  };

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      try {
        const savedBlocked = localStorage.getItem("last_blocked_details");
        if (savedBlocked) {
          const parsed = JSON.parse(savedBlocked);
          setStatus("error");
          setErrorMsg(parsed.errorMsg || "Hisobingiz administrator tomonidan bloklangan.");
          setBlockedDetails(parsed.details || parsed);
          setIsUserBlocked(true);
          const uid = parsed.details?.user_id || parsed.user_id;
          if (uid) {
            checkAppealStatus(uid);
          }
          return;
        }
      } catch (e) {}

      setStatus("error");
      setErrorMsg("Avtorizatsiya kodi (code) topilmadi.");
      setIsUserBlocked(false);
      return;
    }

    let isMounted = true;

    const authenticate = async () => {
      try {
        const redirectUri = `${window.location.origin}/auth/callback`;
        await handlePassportCallback(code, redirectUri);
        localStorage.removeItem("last_blocked_details");
        if (isMounted) {
          setStatus("success");

          const targetRedirect =
            sessionStorage.getItem("redirect_after_login") ||
            localStorage.getItem("redirect_after_login");

          sessionStorage.removeItem("redirect_after_login");
          localStorage.removeItem("redirect_after_login");

          const isValidRedirect =
            targetRedirect &&
            targetRedirect !== "/leanding" &&
            targetRedirect !== "/auth/callback" &&
            targetRedirect !== "/";

          setTimeout(() => {
            navigate(isValidRedirect ? targetRedirect : "/", { replace: true });
          }, 1000);
        }
      } catch (err) {
        if (isMounted) {
          setStatus("error");
          const errData = err?.response?.data;
          const errorObj = errData?.error;
          const details = errorObj?.details || errData?.details || {};
          const isBlocked =
            errorObj?.errorCode === "user_blocked" ||
            Boolean(details?.blocked_reason) ||
            Boolean(details?.user_id && details?.blocked_reason);

          setIsUserBlocked(Boolean(isBlocked));
          if (isBlocked) {
            setBlockedDetails(details);
          } else {
            setBlockedDetails(null);
          }

          const msg =
            errorObj?.errorMsg ||
            errData?.message ||
            err?.message ||
            "Kirish jarayonida xatolik yuz berdi. Kod eskirgan yoki yaroqsiz bo'lishi mumkin.";
          setErrorMsg(msg);

          const userObj =
            errData?.data?.user ||
            errData?.user ||
            getCurrentUser() ||
            {};
          setBlockedUser(userObj);

          const uid =
            details?.user_id ||
            userObj.id ||
            userObj.user_id ||
            errData?.data?.user_id ||
            errData?.user_id;

          if (isBlocked && (errorObj?.errorCode === "user_blocked" || details?.user_id)) {
            try {
              localStorage.setItem(
                "last_blocked_details",
                JSON.stringify({ details, errorMsg: msg, user_id: uid })
              );
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e) {}
          }

          if (isBlocked && uid) {
            checkAppealStatus(uid);
          }
        }
      }
    };

    authenticate();

    return () => {
      isMounted = false;
    };
  }, [searchParams, navigate]);

  const handleSendAppeal = async (e) => {
    e.preventDefault();
    if (!reasonInput.trim() || submitting) return;

    setSubmitting(true);

    const currentUser = getCurrentUser() || blockedUser || {};
    const uid =
      blockedDetails?.user_id ||
      currentUser.id ||
      currentUser.user_id ||
      blockedUser?.id ||
      "blocked_user";
    const phoneNumber =
      currentUser.phone_number ||
      currentUser.phoneNumber ||
      "";
    const passportId =
      blockedDetails?.passport_id ||
      currentUser.passport_id ||
      currentUser.passportId ||
      "";

    const payload = {
      user_id: uid,
      phone_number: phoneNumber,
      passport_id: passportId,
      message: reasonInput.trim(),
    };

    try {
      const res = await axios.post(`${getBaseApiUrl()}users/appeals/`, payload);
      const response = res.data?.data || res.data;

      const now = new Date();
      const formattedDate = dayjs(response?.created_at ? new Date(response.created_at) : now).format("DD.MM.YYYY HH:mm");

      const newAppeal = {
        id: response?.id,
        userId: uid,
        text: reasonInput.trim(),
        date: formattedDate,
        created_at: response?.created_at,
        reviewed_at: response?.reviewed_at,
        rejection_reason: response?.rejection_reason,
        status: response?.status || "PENDING",
        raw: response,
      };

      setAppealData(newAppeal);
      setShowStepper(true);
      setModalOpen(false);
      setReasonInput("");
      setToastMessage({
        type: "success",
        title: "E'tiroz yuborildi",
        description: "E'tirozingiz muvaffaqiyatli qabul qilindi.",
      });
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

      // Agar allaqachon mavjud bo'lsa, modalni yopib statusni yuklash
      if (uid && uid !== "blocked_user") {
        checkAppealStatus(uid);
        setModalOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F9] font-['Manrope',sans-serif] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-[300px] -left-[300px] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#526ED4]/20 to-[#526ED4]/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-[300px] -right-[300px] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#30C9ED]/20 to-[#30C9ED]/20 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg bg-white rounded-[24px] border border-[#E2E6F2] p-8 shadow-2xl relative z-10 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src="/logo2.svg" alt="Raqamli Muloqot" className="w-10 h-10" />
          <span className="text-[17px] font-['Unbounded',sans-serif] font-bold text-[#1A1D2E] tracking-tight">
            Raqamli Muloqot
          </span>
        </div>

        {status === "loading" && (
          <div className="space-y-4 py-6">
            <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-4 border-[#EEF2FF] border-t-[#3858C7] animate-spin"></div>
            </div>
            <h3 className="text-[18px] font-['Unbounded',sans-serif] font-medium text-[#1A1D2E]">
              Tizimga kirilmoqda...
            </h3>
            <p className="text-[14px] text-[#5B6078] max-w-xs mx-auto">
              Passport ma'lumotlari tekshirilmoqda, iltimos bir necha soniya kuting.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#10B981] mx-auto flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-[18px] font-['Unbounded',sans-serif] font-medium text-[#1A1D2E]">
              Muvaffaqiyatli!
            </h3>
            <p className="text-[14px] text-[#5B6078]">
              Tizimga muvaffaqiyatli kirdingiz. Boshqaruv paneliga yo'naltirilmoqdasiz...
            </p>
          </div>
        )}

        {status === "error" && (!showStepper || !appealData) && (
          <div className="space-y-5 py-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-[#FEF2F2] text-[#EF4444] mx-auto flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-[18px] font-['Unbounded',sans-serif] font-medium text-[#1A1D2E]">
                Kirishda xatolik
              </h3>
              <p className="text-[14px] text-[#EF4444] mt-2 font-medium bg-[#FEF2F2] p-3 rounded-xl border border-[#FCA5A5]/40 leading-snug">
                {errorMsg}
              </p>

              {blockedDetails?.blocked_reason && (
                <div className="mt-3 bg-[#FAFAFC] border border-[#E2E6F2] rounded-xl p-3.5 text-left space-y-1">
                  <div className="text-[11.5px] font-semibold text-[#8B90A5] uppercase tracking-wider">
                    Bloklanish sababi:
                  </div>
                  <div className="text-[13.5px] font-medium text-[#1A1D2E] leading-relaxed break-words">
                    {blockedDetails.blocked_reason}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-3">
              {isUserBlocked && (
                <>
                  {appealData ? (
                    <button
                      type="button"
                      onClick={() => setShowStepper(true)}
                      className="w-full h-[48px] rounded-xl bg-[#3858C7] hover:bg-[#2B46AC] active:scale-[0.98] text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <HugeiconsIcon icon={SentIcon} strokeWidth={3} size={16} className="-rotate-12 translate-y-[-1px]" />
                      <span>E'tiroz holati</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="w-full h-[48px] rounded-xl bg-[#3858C7] hover:bg-[#2B46AC] active:scale-[0.98] text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <HugeiconsIcon icon={SentIcon} strokeWidth={3} size={16} className="-rotate-12 translate-y-[-1px]" />
                      <span>E'tiroz yuborish</span>
                    </button>
                  )}
                </>
              )}

              <Link
                to="/leanding"
                className="w-full h-[46px] rounded-xl bg-[#F2F4F7] hover:bg-[#E4E7EC] active:scale-[0.98] text-[#344054] text-[14px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Landing sahifasiga qaytish</span>
              </Link>
            </div>
          </div>
        )}

        {status === "error" && showStepper && appealData && (
          <div className="space-y-5 py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#EEF2FF] text-[#3858C7] border border-[#D0DCFF]/60 flex items-center justify-center mx-auto shadow-xs">
              <FaTelegramPlane size={24} className="translate-x-0.5 -translate-y-0.5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1A1D2E] tracking-tight">
                {appealData.status === "APPROVED"
                  ? "E'tirozingiz tasdiqlandi!"
                  : appealData.status === "REJECTED"
                  ? "E'tirozingiz rad etildi"
                  : "E'tirozingiz yuborildi!"}
              </h2>
              <p className="text-[13.5px] text-[#5B6078] max-w-sm mx-auto mt-1 leading-relaxed">
                {appealData.status === "APPROVED"
                  ? "Hisobingiz blokdan chiqarildi. Endi Passport orqali tizimga kirishingiz mumkin."
                  : appealData.status === "REJECTED"
                  ? (appealData.rejection_reason || "Administrator murojaatingizni ko'rib chiqib rad etdi.")
                  : "Administrator murojaatingizni ko'rib chiqadi."}
              </p>
            </div>

            {/* Stepper Card */}
            <div className="bg-[#FAFAFC] border border-[#E2E6F2] rounded-2xl p-4.5 text-left space-y-4">
              {/* Step 1: E'tiroz yuborildi */}
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={18} />
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

              {/* Step 2: Ko'rib chiqilmoqda */}
              <div className="flex items-start gap-3.5 pt-3 border-t border-[#F1F3F9]">
                {appealData.status === "APPROVED" || appealData.status === "REJECTED" ? (
                  <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={18} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#EEF2FF] text-[#3858C7] flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3858C7] animate-pulse"></div>
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

              {/* Step 3: Javob */}
              <div className="flex items-start gap-3.5 pt-3 border-t border-[#F1F3F9]">
                {appealData.status === "APPROVED" ? (
                  <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={18} />
                  </div>
                ) : appealData.status === "REJECTED" ? (
                  <div className="w-6 h-6 rounded-full bg-[#FEF3F2] text-[#D92D20] flex items-center justify-center shrink-0 mt-0.5">
                    <HugeiconsIcon icon={Cancel01Icon} size={15} strokeWidth={2.5} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-[#D1D5DB] flex items-center justify-center shrink-0 mt-0.5"></div>
                )}
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium text-[13.5px] ${
                      appealData.status === "APPROVED"
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

            <div className="pt-2 flex flex-col gap-2.5">
              {appealData.status === "APPROVED" ? (
                <button
                  type="button"
                  onClick={loginWithPassport}
                  className="w-full h-[48px] rounded-xl bg-[#3858C7] hover:bg-[#2B46AC] active:scale-[0.98] text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <HugeiconsIcon icon={Login03Icon} strokeWidth={2.5} size={17} />
                  <span>Kirish</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowStepper(false)}
                  className="w-full h-[46px] rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] active:scale-[0.98] text-[#3858C7] text-[14px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Ortga</span>
                </button>
              )}

              <Link
                to="/leanding"
                className="w-full h-[46px] rounded-xl bg-[#F2F4F7] hover:bg-[#E4E7EC] active:scale-[0.98] text-[#344054] text-[14px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Landing sahifasiga qaytish</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Appeal Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-[540px] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-[#E2E6F2]">
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
            <p className="text-[13px] text-[#5B6078] leading-relaxed text-left">
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
                  className="px-4 py-2.5 flex items-center gap-1.5 rounded-xl hover:bg-[#F8FAFC] text-[#1A1D2E] text-[13.5px] font-bold transition-colors cursor-pointer"
                >
                  <X strokeWidth={2.5} size={16} />
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={!reasonInput.trim() || submitting}
                  className={`px-5 py-2.5 rounded-xl text-white text-[13.5px] font-semibold transition-all shadow-xs flex items-center gap-2 ${
                    reasonInput.trim() && !submitting
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
            className={`bg-white border rounded-2xl shadow-xl p-4 flex items-start gap-3.5 max-w-md text-left ${
              toastMessage.type === "error"
                ? "border-[#FECDCA]"
                : "border-[#10B981]/40"
            }`}
          >
            <div
              className={`flex-shrink-0 mt-0.5 ${
                toastMessage.type === "error" ? "text-[#D92D20]" : "text-[#10B981]"
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
                className={`text-[14px] font-bold leading-tight ${
                  toastMessage.type === "error" ? "text-[#D92D20]" : "text-[#1A1D2E]"
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

export default AuthCallbackPage;

