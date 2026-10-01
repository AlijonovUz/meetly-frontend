import React from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  Home01Icon,
  SparklesIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  Folder02Icon,
  Notification03Icon,
} from "@hugeicons/core-free-icons";

const UnderDevelopment = ({
  title = "Sahifa ishlab chiqilmoqda",
  subtitle = "Ushbu bo‘lim hozirda dasturchilarimiz tomonidan faol ishlab chiqilmoqda va tez orada to‘liq foydalanishga topshiriladi.",
  pageName = "Modul",
  icon,
  badgeText = "Tez kunda ishga tushadi",
  progress = 75,
  estimatedDate = "Tez orada",
  features = [],
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-400/5 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Main Card */}
      <div className="w-full max-w-3xl bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-xl shadow-gray-200/50 relative backdrop-blur-sm text-center">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100/80 text-blue-700 text-xs font-semibold mb-6 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <span>{badgeText}</span>
        </div>

        {/* Icon & Glow Wrapper */}
        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl blur-lg" />
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-4 ring-blue-50">
            {icon ? (
              typeof icon === "function" || typeof icon === "object" ? (
                <HugeiconsIcon icon={icon} size={44} className="text-white" />
              ) : (
                icon
              )
            ) : (
              <HugeiconsIcon icon={SparklesIcon} size={44} className="text-white" />
            )}
          </div>
          
          {/* Floating mini badge */}
          <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 p-1.5 rounded-xl shadow-md border-2 border-white flex items-center justify-center">
            <HugeiconsIcon icon={Clock01Icon} size={16} />
          </div>
        </div>

        {/* Title and Description */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
          {title}
        </h1>
        <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-8">
          {subtitle}
        </p>

        {/* Progress Bar Info */}
        <div className="max-w-md mx-auto bg-gray-50/80 border border-gray-100 rounded-2xl p-4 mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-2">
            <span className="flex items-center gap-1.5 text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Tayyorgarlik darajasi
            </span>
            <span className="text-blue-600 font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200/70 h-2.5 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2.5 text-[11px] text-gray-400">
            <span>Holat: Faol ishlab chiqishda</span>
            <span>Rejalashtirilgan: {estimatedDate}</span>
          </div>
        </div>

        {/* Planned Features List */}
        {features && features.length > 0 && (
          <div className="text-left mb-8 max-w-xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
              <HugeiconsIcon icon={SparklesIcon} size={14} className="text-blue-500" />
              {pageName} uchun kutilayotgan imkoniyatlar:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {features.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50/60 border border-gray-100 text-xs text-gray-700 hover:bg-blue-50/40 hover:border-blue-100 transition-colors"
                >
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                  </div>
                  <span className="font-medium leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-gray-700 text-sm font-semibold transition-all duration-150 cursor-pointer active:scale-95"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={18} />
            <span>Orqaga qaytish</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all duration-150 cursor-pointer active:scale-95"
          >
            <HugeiconsIcon icon={Home01Icon} size={18} />
            <span>Bosh sahifaga o‘tish</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/meetings")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold transition-all duration-150 cursor-pointer active:scale-95"
          >
            <HugeiconsIcon icon={Folder02Icon} size={18} className="text-blue-600" />
            <span>Yig‘ilishlar ro‘yxati</span>
          </button>
        </div>

      </div>

      {/* Footer Info */}
      <p className="mt-6 text-xs text-gray-400 flex items-center gap-1.5">
        <HugeiconsIcon icon={Notification03Icon} size={14} />
        Tizim yangilanishlari haqida administrator orqali xabar beriladi
      </p>
    </div>
  );
};

export default UnderDevelopment;
