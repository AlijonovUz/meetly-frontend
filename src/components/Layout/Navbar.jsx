import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01Icon,
  Menu01Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import { mockUserProfile, mockNotifications, mockUsersList, mockMeetingsList } from "../../data/mockData";

const Navbar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef(null);

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
        { label: "Barchasi" },
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
    if (pathname === "/reports") {
      return [
        { label: "Hisobotlar", to: "/reports" },
        { label: "Yig'ilishlar bo'yicha" },
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

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
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
            <span>Yangi yig'ilish</span>
          </button>
        )}

        {/* Contextual Action Button for reports */}
        {location.pathname === "/reports" && (
          <button
            type="button"
            onClick={() => {}}
            className="hidden sm:inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-[13px] font-medium h-9 px-4 rounded-xl transition-all shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <HugeiconsIcon icon={Download01Icon} size={18} />
            <span>Yuklab olish</span>
          </button>
        )}

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer ${
              notificationsOpen
                ? "bg-[#E9ECF5] border-[#EEF1F7] text-[#1A1D2E]"
                : "bg-[#E9ECF5] border-[#EEF1F7] text-[#1A1D2E] hover:bg-[#F1F3F9] hover:text-[#1A1D2E]"
            }`}
            title="Bildirishnomalar"
          >
            <HugeiconsIcon icon={Notification01Icon} size={20} />
            {mockUserProfile.unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EF4444] border-2 border-white rounded-full"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-[#1A1D2E] rounded-2xl shadow-2xl border border-[#E2E6F2] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2.5 border-b border-[#F1F3F9] flex items-center justify-between">
                <span className="font-semibold text-[13px] text-[#1B1F3B]">
                  Bildirishnomalar
                </span>
                <span className="text-[11px] font-semibold bg-[#EEF2FF] text-[#3858C7] px-2 py-0.5 rounded-full">
                  {mockNotifications.filter((n) => n.unread).length} ta yangi
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#F1F3F9] mt-1">
                {mockNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-3 py-2.5 rounded-xl hover:bg-[#F8F9FC] transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                      n.unread ? "bg-[#F4F6FC]/50" : ""
                    }`}
                  >
                    <div>
                      <p className="text-[13px] font-medium text-[#1B1F3B] leading-snug">
                        {n.title}
                      </p>
                      <p className="text-[11px] text-[#8B90A5] mt-0.5">{n.time}</p>
                    </div>
                    {n.unread && (
                      <span className="w-2 h-2 rounded-full bg-[#3858C7] mt-1.5 flex-shrink-0"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
