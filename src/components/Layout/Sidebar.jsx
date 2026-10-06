import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare03Icon,
  Clock04Icon,
  Settings01Icon,
  SidebarLeftIcon,
  Message01Icon,
  UserGroup02Icon,
  Folder02Icon,
  Analytics01Icon,
  Moon02Icon,
  Logout03Icon,
  UserIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { mockUserProfile } from "../../data/mockData";
import { IoMoon } from "react-icons/io5";
import { LogOut, ChevronDown } from "lucide-react";
import { logout, getCurrentUser } from "../../services/auth";
import { useTheme } from "../../context/ThemeContext";

const Sidebar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const reduxUser = useSelector((state) => state.references?.currentUser);
  const currentUser = reduxUser || getCurrentUser();
  const isStaff = Boolean(
    currentUser?.is_staff || currentUser?.is_superuser || currentUser?.role === "admin"
  );
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(
    location.pathname.startsWith("/reports") || true
  );
  const profileMenuRef = useRef(null);

  const mainNavItems = [
    {
      to: "/",
      label: "Analitika",
      icon: DashboardSquare03Icon,
      end: true,
    },
    ...(isStaff
      ? [
          {
            to: "/users",
            label: "Foydalanuvchilar",
            icon: UserGroup02Icon,
          },
        ]
      : []),
    {
      to: "/meetings",
      label: "Yig‘ilishlar",
      icon: Folder02Icon,
    },
  ];

  const reportSubItems = [
    {
      to: "/reports/meetings",
      altTo: "/reports",
      label: "Yig'ilishlar bo'yicha",
    },
    {
      to: "/reports/participants",
      label: "Ishtirokchilar bo'yicha",
    },
    {
      to: "/reports/organizers",
      label: "Tashkilotchilar bo'yicha",
    },
    {
      to: "/reports/signatures",
      label: "Imzolar bo'yicha",
    },
  ];

  const bottomNavItems = [
    {
      to: "/logs",
      label: "Umumiy tarix",
      icon: Clock04Icon,
    },
    {
      to: "/settings",
      label: "Sozlamalar",
      icon: Settings01Icon,
    },
  ];

  // Close profile popup on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSidebarClick = (e) => {
    if (sidebarCollapsed) {
      if (!e.target.closest("a") && !e.target.closest("button")) {
        setSidebarCollapsed(false);
      }
    }
  };

  return (
    <aside
      onClick={handleSidebarClick}
      className={`h-screen bg-[#3858C7] dark:bg-[#2B3553] dark:border-r dark:border-[#21262D] text-white flex flex-col justify-between transition-all duration-300 ease-in-out select-none flex-shrink-0 relative ${sidebarCollapsed ? "w-[76px] cursor-pointer" : "w-[260px]"
        }`}
      title={sidebarCollapsed ? "Yon panelni ochish uchun bosing" : undefined}
    >
      {/* Top Header & Main Navigation */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand / Logo */}
        <div
          onClick={(e) => {
            if (sidebarCollapsed) {
              e.stopPropagation();
              setSidebarCollapsed(false);
            }
          }}
          className={`h-[60px] flex items-center px-4 flex-shrink-0 ${sidebarCollapsed ? "justify-center" : "justify-between"
            }`}
        >
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => navigate("/")}>
            <img src={sidebarCollapsed ? "/logo2.svg" : "/logo.svg"} alt="logo" className="pointer-events-none object-contain" />
          </div>

          {/* Toggle Collapse Button */}
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSidebarCollapsed(true);
              }}
              className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Yig'ish"
            >
              <HugeiconsIcon icon={SidebarLeftIcon} size={20} />
            </button>
          )}
        </div>

        {/* Main Nav Items */}
        <div className="px-3 py-4 overflow-y-auto flex-1">
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 group ${isActive
                    ? "bg-[#2844A8] dark:bg-[#283D91] text-white font-bold shadow-2xs"
                    : "text-white/80 hover:bg-white/10 dark:hover:bg-white/5 hover:text-white"
                  } ${sidebarCollapsed ? "justify-center px-0" : ""}`
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <HugeiconsIcon
                      icon={item.icon}
                      size={20}
                      className={`flex-shrink-0 transition-colors duration-200 ${isActive ? "text-white" : "text-white/80 group-hover:text-white"
                        }`}
                      strokeWidth={2}
                    />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* Hisobotlar Collapsible Dropdown */}
            <div>
              <button
                type="button"
                onClick={() => {
                  if (sidebarCollapsed) {
                    setSidebarCollapsed(false);
                    setReportsOpen(true);
                  } else {
                    setReportsOpen(!reportsOpen);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 cursor-pointer ${location.pathname.startsWith("/reports")
                  ? "text-white font-bold"
                  : "text-white/80 hover:bg-white/10 dark:hover:bg-white/5 hover:text-white"
                  } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                title={sidebarCollapsed ? "Hisobotlar" : undefined}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <HugeiconsIcon
                    icon={Analytics01Icon}
                    size={20}
                    className={`flex-shrink-0 transition-colors duration-200 ${location.pathname.startsWith("/reports")
                      ? "text-white"
                      : "text-white/80"
                      }`}
                    strokeWidth={2}
                  />
                  {!sidebarCollapsed && (
                    <span className="truncate">Hisobotlar</span>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <ChevronDown
                    size={16}
                    className={`text-white/80 transition-transform duration-200 ${reportsOpen ? "rotate-180" : ""
                      }`}
                  />
                )}
              </button>

              {/* Sub-items (Yig'ilishlar, Ishtirokchilar, Tashkilotchilar) */}
              {!sidebarCollapsed && reportsOpen && (
                <div className="mt-1 space-y-1 pl-4 pr-1">
                  {reportSubItems.map((sub) => {
                    const isSubActive =
                      location.pathname === sub.to ||
                      (sub.altTo && location.pathname === sub.altTo);
                    return (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        className={`block px-4 py-2.5 rounded-xl text-[13px] transition-colors ${isSubActive
                          ? "bg-[#2844A8] dark:bg-[#283D91] text-white font-medium"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        {sub.label}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Bottom Area: Secondary Nav & Profile */}
      <div className="p-3 border-t border-white/15 dark:border-white/10 space-y-2 flex-shrink-0 relative" ref={profileMenuRef}>
        {/* Bottom Nav Items (Logs, Settings) */}
        <nav className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 group ${isActive
                  ? "bg-[#2844A8] dark:bg-[#283D91] text-white font-bold shadow-2xs"
                  : "text-white/80 hover:bg-white/10 dark:hover:bg-white/5 hover:text-white"
                } ${sidebarCollapsed ? "justify-center px-0" : ""}`
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <HugeiconsIcon
                    icon={item.icon}
                    size={20}
                    className={`flex-shrink-0 transition-colors duration-200 ${isActive ? "text-white" : "text-white/80 group-hover:text-white"
                      }`}
                    strokeWidth={2}
                  />
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Card Button */}
        <div className="pt-2 border-t border-white/15 dark:border-white/10 relative">
          {(() => {
            const displayName =
              [currentUser?.first_name, currentUser?.last_name, currentUser?.patronymic]
                .filter(Boolean)
                .join(" ") ||
              currentUser?.full_name ||
              "Foydalanuvchi";

            const displayRole = (currentUser?.is_staff ? "Administrator" : "Foydalanuvchi");

            const displayInitials =
              (
                (currentUser?.first_name?.[0] || "") +
                (currentUser?.last_name?.[0] || "")
              ).toUpperCase() ||
              (displayName?.[0] || "F").toUpperCase();

            return (
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 cursor-pointer text-left ${profileMenuOpen ? "bg-[#2844A8] dark:bg-[#1C2438]" : "hover:bg-white/10 dark:hover:bg-white/5"
                  } ${sidebarCollapsed ? "justify-center p-1" : ""}`}
                title={`${displayName} (${displayRole})`}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-white/20 dark:bg-white/10 text-white font-bold flex items-center justify-center text-xs shadow-inner flex-shrink-0 backdrop-blur-xs">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span>{displayInitials}</span>
                  )}
                </div>

                {/* User Details */}
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-white truncate leading-tight">
                      {displayName}
                    </div>
                    <div className="mt-0.5">
                      <span className="text-[11px] font-medium text-white/70 truncate block">
                        {displayRole}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            );
          })()}

          {/* Profile Popover Menu (as in mockup image) */}
          {profileMenuOpen && (
            <div
              className={`absolute z-50 bg-white dark:bg-[#161B22] text-[#1A1D2E] dark:text-white rounded-2xl shadow-2xl border border-[#E2E6F2] dark:border-[#2B3553] p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150 left-full bottom-0 ml-5 w-64`}
            >
              {/* Row 1: Qorong'i mavzu (Dark mode toggle) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[13.5px] font-medium text-[#1A1D2E] dark:text-white">
                  <IoMoon size={18} className="text-[#1A1D2E] dark:text-[#FFFFFF]" />
                  <span>Qorong'i mavzu</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDark}
                    onChange={toggleTheme}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-[#E2E6F2] dark:bg-[#232E47] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-transparent after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#3858C7]"></div>
                </label>
              </div>

              {/* Row 2: Shaxsiy kabinet */}
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  navigate("/profile");
                }}
                className="w-full flex items-center justify-between py-1 text-[13.5px] font-medium text-[#1A1D2E] dark:text-white hover:text-[#3858C7] dark:hover:text-[#7F95E6] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <img src={isDark ? "/profielcard_icon_dark.svg" : "/profielcard_icon.svg"} alt="" className="dark:brightness-200" />
                  <span>Shaxsiy kabinet</span>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-[#8B90A5] dark:text-[#64748B]" />
              </button>

              {/* Divider */}
              <div
                className="border-t border-[#F1F3F9] dark:border-[#232E47] pt-2 flex justify-end cursor-pointer"
                onClick={() => {
                  setProfileMenuOpen(false);
                  logout();
                }}
              >
                {/* Row 3: Chiqish */}
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[#E15241] hover:text-[#B42318] transition-colors cursor-pointer"
                >
                  <span>Chiqish</span>
                  <LogOut strokeWidth={2.5} size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;