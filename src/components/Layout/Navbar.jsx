import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01Icon,
  Menu01Icon,
  Download01Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { FaCheck, FaFileExcel, FaFilePdf, FaFileCsv } from "react-icons/fa6";
import { useNotifications } from "../../context/NotificationContext";
import { mockUsersList, mockMeetingsList } from "../../data/mockData";

const formatRelativeTime = (dateString) => {
  if (!dateString) return "Hozirgina";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Hozirgina";
    if (diffMins < 60) return `${diffMins} daqiqa oldin`;
    if (diffHours < 24 && date.getDate() === now.getDate()) return `${diffHours} soat oldin`;
    if (diffDays === 1 || (diffHours < 48 && date.getDate() === now.getDate() - 1)) return "Kecha";
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch (e) {
    return "";
  }
};

const Navbar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    openSignatureModal,
  } = useNotifications();

  // Dynamic breadcrumbs based on route
  const getBreadcrumbs = () => {
    const pathname = location.pathname;

    if (pathname === "/") {
      return [{ label: "Analitika" }];
    }
    if (pathname === "/users") {
      return [{ label: "Foydalanuvchilar" }];
    }
    if (pathname.startsWith("/users/")) {
      const id = pathname.replace("/users/", "");
      const user = mockUsersList.find((u) => u.id === id) || mockUsersList[0];
      return [
        { label: "Foydalanuvchilar", to: "/users" },
        { label: user.fullName },
      ];
    }
    if (pathname === "/meetings") {
      return [
        { label: "Yig'ilishlar", to: "/meetings" },
      ];
    }
    if (pathname.startsWith("/meetings/")) {
      const id = pathname.replace("/meetings/", "");
      const meeting =
        mockMeetingsList.find((m) => m.id === id) ||
        mockMeetingsList.find((m) => m.id === "13") ||
        mockMeetingsList[0];
      return [
        { label: "Yig'ilishlar", to: "/meetings" },
        { label: meeting.name },
      ];
    }
    if (pathname.startsWith("/reports")) {
      let sub = "Yig'ilishlar bo'yicha";
      if (pathname.includes("participants")) sub = "Ishtirokchilar bo'yicha";
      if (pathname.includes("organizers")) sub = "Tashkilotchilar bo'yicha";
      if (pathname.includes("signatures")) sub = "Imzolar bo'yicha";
      return [
        { label: "Hisobotlar", to: "/reports" },
        { label: sub },
      ];
    }
    if (pathname === "/logs") {
      return [{ label: "Umumiy tarix" }];
    }
    if (pathname === "/settings") {
      return [{ label: "Sozlamalar" }];
    }
    if (pathname === "/profile") {
      return [{ label: "Profil" }];
    }
    return [{ label: "Bosh sahifa" }];
  };

  const breadcrumbs = getBreadcrumbs();

  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  // Close notifications & export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-[60px] bg-[#3858C7] border-b border-white/10 border-l border-white/10 px-6 flex items-center justify-between sticky top-0 z-30 select-none font-['Manrope',sans-serif] text-white">
      {/* Left side: Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        {/* Mobile toggle button */}
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="md:hidden p-2 rounded-xl text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={Menu01Icon} size={20} />
        </button>

        {/* Breadcrumb path */}
        <nav className="flex items-center gap-1.5 text-[13px]">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={idx} className="flex items-center gap-1.5">
                {crumb.to && !isLast ? (
                  <button
                    type="button"
                    onClick={() => navigate(crumb.to)}
                    className="text-white/70 hover:text-white font-medium transition-colors cursor-pointer"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span
                    className={
                      isLast
                        ? "text-white font-semibold"
                        : "text-white/70 font-medium"
                    }
                  >
                    {crumb.label}
                  </span>
                )}
                {!isLast && <span className="text-white/40 text-[13px] mx-0.5">›</span>}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Right side: Action (if meetings / reports) & Notification Bell */}
      <div className="flex items-center gap-3">
        {/* Contextual Action Button for meetings */}
        {location.pathname === "/meetings" && (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-create-meeting-modal"))}
            className="hidden sm:inline-flex items-center gap-2 bg-white hover:bg-white/95 text-[#1A1D2E] text-[13px] font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <img src="/meet_icon.svg" alt="" className="pointer-events-none w-4.5 h-4.5" />
            <span>Yig'ilish qo'shish</span>
          </button>
        )}

        {/* Contextual Action Button for reports with 3 format options */}
        {location.pathname.startsWith("/reports") && (
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="hidden sm:inline-flex items-center gap-2 bg-white hover:bg-white/95 text-[#1A1D2E] text-[13px] font-semibold h-9 px-3.5 rounded-xl transition-all shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <HugeiconsIcon icon={Download01Icon} size={18} strokeWidth={2.5} />
              <span>Yuklab olish</span>
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-[#1A1D2E] rounded-xl shadow-xl border border-[#E2E6F2] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setExportMenuOpen(false);
                    window.dispatchEvent(new CustomEvent("export-report", { detail: { format: "excel" } }));
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-[#EEF2FB] hover:text-[#3858C7] transition-all text-left cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#E6F8EF] text-[#16A34A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    <FaFileExcel size={17} />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1A1D2E] text-[13px] leading-tight">Excel (.xlsx)</div>
                    <div className="text-[11px] text-[#8B90A5] mt-0.5">Stilli jadval</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExportMenuOpen(false);
                    window.dispatchEvent(new CustomEvent("export-report", { detail: { format: "pdf" } }));
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-[#EEF2FB] hover:text-[#3858C7] transition-all text-left cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    <FaFilePdf size={17} />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1A1D2E] text-[13px] leading-tight">PDF (.pdf)</div>
                    <div className="text-[11px] text-[#8B90A5] mt-0.5">Chop etish uchun</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExportMenuOpen(false);
                    window.dispatchEvent(new CustomEvent("export-report", { detail: { format: "csv" } }));
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-[#EEF2FB] hover:text-[#3858C7] transition-all text-left cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    <FaFileCsv size={17} />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1A1D2E] text-[13px] leading-tight">CSV (.csv)</div>
                    <div className="text-[11px] text-[#8B90A5] mt-0.5">Matnli ma'lumot</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Notification Bell Dropdown (Screenshot 2) */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`relative flex items-center justify-center w-9.5 h-9.5 rounded-xl transition-all cursor-pointer ${
              notificationsOpen
                ? "bg-white text-[#1A1D2E] shadow-sm"
                : "bg-[#E9ECF5] text-[#1A1D2E] hover:bg-white"
            }`}
            title="Bildirishnomalar"
          >
            <HugeiconsIcon icon={Notification01Icon} size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EF4444] border-2 border-white rounded-full"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel (Screenshot 2) */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2.5 w-84 sm:w-92 bg-white dark:bg-[#12161F] text-[#1A1D2E] dark:text-white rounded-3xl shadow-[0_15px_45px_rgba(0,0,0,0.18)] border border-slate-200/90 dark:border-white/10 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="px-3.5 py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Bildirishnomalar
                  </span>
                  {unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-[11px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-xs text-[#3B59BA] hover:underline font-medium cursor-pointer"
                  >
                    Barchasini o'qildi qilish
                  </button>
                )}
              </div>

              {/* List */}
              <div
                className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#CBD5E1 transparent" }}
              >
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Hozircha bildirishnomalar yo'q
                  </div>
                ) : (
                  notifications.map((n) => {
                    const extra = n.extra_data || {};
                    const isSignatureReq =
                      extra.type === "signature_request" ||
                      extra.type === "signature" ||
                      Boolean(extra.attendance_id) ||
                      n.title?.toLowerCase().includes("imzo kutilmoqda") ||
                      n.message?.toLowerCase().includes("imzo bilan tasdiqlang");

                    const isSigned =
                      Boolean(n.is_signed || extra.is_signed || extra.signature_url) ||
                      n.title?.toLowerCase().includes("imzo saqlandi");

                    const meetingTitle =
                      extra.meeting_title ||
                      extra.title ||
                      extra.meeting_name ||
                      "";

                    return (
                      <div
                        key={n.id}
                        onClick={() => !n.is_read && markAsRead(n.id)}
                        className={`p-3 transition-colors flex items-start gap-3 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 ${
                          !n.is_read ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                        }`}
                      >
                        {/* Left Icon Avatar */}
                        {isSignatureReq && !isSigned ? (
                          <div className="w-9 h-9 rounded-full bg-[#E8EDFB] text-[#3B59BA] flex items-center justify-center shrink-0">
                            <HugeiconsIcon icon={Edit02Icon} size={16} strokeWidth={2} />
                          </div>
                        ) : isSigned ? (
                          <div className="w-9 h-9 rounded-full bg-[#E6F8EF] text-[#10B981] flex items-center justify-center shrink-0">
                            <FaCheck size={14} />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                            <HugeiconsIcon icon={Notification01Icon} size={16} strokeWidth={2} />
                          </div>
                        )}

                        {/* Content Body */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5
                              className={`text-sm truncate ${
                                !n.is_read
                                  ? "font-semibold text-slate-900 dark:text-white"
                                  : "font-normal text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {isSignatureReq && !isSigned
                                ? "Imzo kutilmoqda"
                                : isSigned
                                ? "Imzo saqlandi"
                                : n.title || "Xabarnoma"}
                            </h5>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[11px] text-slate-400 font-normal">
                                {formatRelativeTime(n.created_at)}
                              </span>
                              {!n.is_read && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {isSignatureReq && !isSigned
                              ? `«${meetingTitle}» yakunlandi. Qatnashganingizni imzo bilan tasdiqlang.`
                              : isSigned
                              ? `«${meetingTitle}» yig'ilishidagi qatnashishingiz tasdiqlandi.`
                              : n.message}
                          </p>

                          {/* "Imzolash" Button (Screenshot 2) */}
                          {isSignatureReq && !isSigned && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openSignatureModal(n);
                                setNotificationsOpen(false);
                              }}
                              className="mt-2.5 px-3.5 py-1.5 rounded-xl bg-[#3B59BA] hover:bg-[#324D9E] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                            >
                              <HugeiconsIcon icon={Edit02Icon} size={13} strokeWidth={2} />
                              <span>Imzolash</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;


