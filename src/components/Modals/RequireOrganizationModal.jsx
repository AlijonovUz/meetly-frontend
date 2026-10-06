import React, { useState } from "react";
import { Building2, ShieldAlert, Check, Loader2 } from "lucide-react";
import { updateOrganization } from "../../services/auth";

const RequireOrganizationModal = ({ isOpen, user, onSuccess }) => {
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = organization.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError("");

    try {
      const updatedUser = await updateOrganization(trimmed);
      onSuccess?.(trimmed, updatedUser);
    } catch (err) {
      console.error("Tashkilotni saqlashda xatolik:", err);
      const msg =
        err?.response?.data?.error?.errorMsg ||
        err?.response?.data?.message ||
        err?.message ||
        "Tashkilot nomini saqlab bo'lmadi. Qaytadan urinib ko'ring.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fullName =
    [user?.first_name, user?.last_name, user?.patronymic]
      .filter(Boolean)
      .join(" ") ||
    user?.full_name ||
    user?.username ||
    "Foydalanuvchi";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Manrope',sans-serif] animate-in fade-in duration-200"
    >
      <div className="w-full max-w-[500px] bg-white dark:bg-[#161C2E] border border-[#E2E6F2] dark:border-[#2B3553] rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 shadow-2xl relative text-left animate-in zoom-in-95 duration-200">
        {/* Top Icon Badge */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] dark:bg-[#1F2A48] border border-[#D0DCFF]/60 dark:border-[#3858C7]/30 text-[#3858C7] dark:text-[#6085FF] flex items-center justify-center shrink-0 shadow-xs">
            <Building2 size={24} />
          </div>
          <div>
            <span className="text-[11.5px] font-bold text-[#3858C7] dark:text-[#6085FF] uppercase tracking-wider block mb-0.5">
              Majburiy ma'lumot
            </span>
            <h2 className="text-[19px] sm:text-[21px] font-['Unbounded',sans-serif] font-bold text-[#1A1D2E] dark:text-white leading-tight">
              Tashkilotingizni kiriting
            </h2>
          </div>
        </div>

        {/* Warning & Instructions */}
        <div className="bg-[#FEF6EE] dark:bg-[#2A2117] border border-[#F9DBAF] dark:border-[#5A3E1B] rounded-2xl p-3.5 sm:p-4 mb-5 flex items-start gap-3 text-left">
          <ShieldAlert size={20} className="text-[#D97706] dark:text-[#F59E0B] shrink-0 mt-0.5" />
          <div className="text-[13px] leading-relaxed text-[#7C2D12] dark:text-[#FDE68A]">
            <p className="font-semibold mb-0.5">
              Salom, {fullName}!
            </p>
            <p className="text-[12.5px] opacity-90">
              Tizimdan to'liq foydalanish va yig'ilishlarda qatnashish uchun tashkilotingiz nomini kiritishingiz shart. Tashkilot kiritilmaguncha tizimdan foydalanib bo'lmaydi.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12.5px] font-bold text-[#1A1D2E] dark:text-slate-200 mb-1.5">
              Tashkilot nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              required
              value={organization}
              onChange={(e) => {
                setOrganization(e.target.value);
                if (error) setError("");
              }}
              placeholder="Masalan: Raqamli Nazorat LLC"
              className="w-full h-[48px] px-4 rounded-xl border border-[#E2E6F2] dark:border-[#2B3553] bg-[#F8FAFC] dark:bg-[#121624] text-[14px] text-[#1A1D2E] dark:text-white font-medium outline-none focus:border-[#3858C7] dark:focus:border-[#4D6FE8] focus:ring-2 focus:ring-[#3858C7]/20 transition-all placeholder:text-[#8B90A5] dark:placeholder:text-[#64748B]"
            />
            {error && (
              <p className="text-[12px] font-semibold text-red-500 mt-1.5 leading-tight">
                {error}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!organization.trim() || loading}
              className={`w-full h-[50px] rounded-xl text-white font-bold text-[14.5px] flex items-center justify-center gap-2 transition-all shadow-md ${
                organization.trim() && !loading
                  ? "bg-[#3858C7] hover:bg-[#2C48B0] active:scale-[0.99] cursor-pointer shadow-[#3858C7]/25"
                  : "bg-[#3858C7]/50 cursor-not-allowed opacity-70"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <Check size={18} strokeWidth={3} />
                  <span>Saqlash va davom etish</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequireOrganizationModal;
