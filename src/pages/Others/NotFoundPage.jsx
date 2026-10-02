import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithPassport, isAuthenticated } from "../../services/auth";
import { ArrowLeft, Home, ShieldAlert, LogIn, ArrowRight } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const authed = isAuthenticated();

  const handlePassportLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await loginWithPassport();
    } catch (err) {
      console.error("Passport login xatosi:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F9] font-['Manrope',sans-serif] flex items-center justify-center p-6 relative overflow-hidden text-[#1A1D2E]">
      {/* Background ambient gradient glow */}
      <div className="absolute -top-[300px] -left-[300px] w-[650px] h-[650px] rounded-full bg-gradient-to-r from-[#526ED4]/20 to-[#526ED4]/20 blur-[130px] pointer-events-none"></div>
      <div className="absolute -bottom-[300px] -right-[300px] w-[650px] h-[650px] rounded-full bg-gradient-to-r from-[#30C9ED]/20 to-[#30C9ED]/20 blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-xl bg-white rounded-[28px] border border-[#E2E6F2] p-8 sm:p-12 shadow-2xl relative z-10 text-center">
        {/* Top Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src="/logo2.svg" alt="Raqamli Muloqot" className="w-10 h-10" />
          <span className="text-[17px] font-['Unbounded',sans-serif] font-bold text-[#1A1D2E] tracking-tight">
            Raqamli Muloqot
          </span>
        </div>

        {/* 404 Badge & Number */}
        <div className="my-6">
          <span className="text-[72px] sm:text-[96px] font-['Unbounded',sans-serif] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#5272F0] via-[#3B5BDB] to-[#30C9ED] leading-none tracking-tight block select-none">
            404
          </span>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FCA5A5]/50 text-[#EF4444] text-[13px] font-bold mt-2">
            <ShieldAlert size={16} />
            <span>Sahifa topilmadi yoki ruxsat etilmagan</span>
          </div>
        </div>

        {/* Text */}
        <h2 className="text-[22px] sm:text-[26px] font-['Unbounded',sans-serif] font-bold text-[#1A1D2E] leading-tight mb-3">
          Sahifa mavjud emas
        </h2>
        <p className="text-[15px] font-medium text-[#5B6078] max-w-md mx-auto leading-relaxed mb-8">
          Siz tashrif buyurmoqchi bo'lgan havola mavjud emas yoki bu sahifaga kirish uchun Raqamli Passport orqali tizimga kirishingiz talab etiladi.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={() => navigate(authed ? "/" : "/leanding")}
            className="w-full sm:w-auto h-[50px] px-6 rounded-full bg-[#F1F3F9] hover:bg-[#E2E6F2] text-[#1A1D2E] text-[14.5px] font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft size={17} />
            <span>{authed ? "Boshqaruv paneli" : "Bosh sahifa"}</span>
          </button>

          <button
            type="button"
            onClick={handlePassportLogin}
            disabled={loading}
            className="w-full sm:w-auto h-[50px] px-7 rounded-full bg-gradient-to-r from-[#5272F0] to-[#3F57B3] hover:opacity-95 active:scale-[0.98] text-white text-[14.5px] font-bold inline-flex items-center justify-center gap-2 shadow-lg shadow-[#4E75FF]/25 transition-all cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Passport orqali kirish</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
