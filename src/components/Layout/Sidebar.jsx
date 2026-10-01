import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

const Sidebar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const profileMenuRef = useRef(null);

  const mainNavItems = [
    {
      to: "/",
      label: "Analitika",
      icon: DashboardSquare03Icon,
      end: true,
    },
    {
      to: "/users",
      label: "Foydalanuvchilar",
      icon: UserGroup02Icon,
    },
    {
      to: "/meetings",
      label: "Yig‘ilishlar",
      icon: Folder02Icon,
    },
    {
      to: "/reports",
      label: "Hisobotlar",
      icon: Analytics01Icon,
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
      className={`h-screen bg-[#3858C7] text-white flex flex-col justify-between transition-all duration-300 ease-in-out select-none flex-shrink-0 relative ${
        sidebarCollapsed ? "w-[76px] cursor-pointer" : "w-[260px]"
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
          className={`h-[64px] flex items-center px-4 border-b border-white/15 flex-shrink-0 ${
            sidebarCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-xs flex-shrink-0 backdrop-blur-xs">
              <HugeiconsIcon icon={Message01Icon} size={20} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-[18px] tracking-tight text-white truncate">
                Muloqot
              </span>
            )}
          </div>

          {/* Toggle Collapse Button */}
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSidebarCollapsed(true);
              }}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-[#2844A8] text-white font-bold shadow-2xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  } ${sidebarCollapsed ? "justify-center px-0" : ""}`
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <HugeiconsIcon
                      icon={item.icon}
                      size={20}
                      className={`flex-shrink-0 transition-colors duration-200 ${
                        isActive ? "text-white" : "text-white/80 group-hover:text-white"
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
        </div>
      </div>

      {/* Bottom Area: Secondary Nav & Profile */}
      <div className="p-3 border-t border-white/15 space-y-2 flex-shrink-0 relative" ref={profileMenuRef}>
        {/* Bottom Nav Items (Logs, Settings) */}
        <nav className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-[#2844A8] text-white font-bold shadow-2xs"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                } ${sidebarCollapsed ? "justify-center px-0" : ""}`
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <HugeiconsIcon
                    icon={item.icon}
                    size={20}
                    className={`flex-shrink-0 transition-colors duration-200 ${
                      isActive ? "text-white" : "text-white/80 group-hover:text-white"
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
        <div className="pt-2 border-t border-white/15 relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 cursor-pointer text-left ${
              profileMenuOpen ? "bg-[#2844A8]" : "hover:bg-white/10"
            } ${sidebarCollapsed ? "justify-center p-1" : ""}`}
            title={`${mockUserProfile.name} (${mockUserProfile.role})`}
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white font-bold flex items-center justify-center text-xs shadow-inner flex-shrink-0 backdrop-blur-xs">
              {mockUserProfile.initial || "D"}
            </div>

            {/* User Details */}
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-white truncate leading-tight">
                  {mockUserProfile.name}
                </div>
                <div className="mt-0.5">
                  <span className="text-[11px] font-medium text-white/70">
                    {mockUserProfile.role}
                  </span>
                </div>
              </div>
            )}
          </button>

          {/* Profile Popover Menu (as in mockup image) */}
          {profileMenuOpen && (
            <div
              className={`absolute z-50 bg-white text-[#1A1D2E] rounded-2xl shadow-2xl border border-[#E2E6F2] p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150 left-full bottom-0 ml-3 w-64`}
            >
              {/* Row 1: Qorong'i mavzu (Dark mode toggle) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[13.5px] font-medium text-[#1A1D2E]">
                  <HugeiconsIcon icon={Moon02Icon} size={18} className="text-[#1A1D2E]" />
                  <span>Qorong'i mavzu</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-[#E2E6F2] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-transparent after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#3858C7]"></div>
                </label>
              </div>

              {/* Row 2: Shaxsiy kabinet */}
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  navigate("/profile");
                }}
                className="w-full flex items-center justify-between py-1 text-[13.5px] font-medium text-[#1A1D2E] hover:text-[#3858C7] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <HugeiconsIcon icon={UserIcon} size={18} className="text-[#1A1D2E]" />
                  <span>Shaxsiy kabinet</span>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-[#8B90A5]" />
              </button>

              {/* Divider */}
              <div className="border-t border-[#F1F3F9] pt-2 flex justify-end">
                {/* Row 3: Chiqish */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    alert("Tizimdan chiqildi");
                  }}
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[#E15241] hover:text-[#B42318] transition-colors cursor-pointer"
                >
                  <span>Chiqish</span>
                  <HugeiconsIcon icon={Logout03Icon} size={16} />
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