import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare03Icon,
  Clock04Icon,
  Settings01Icon,
  SidebarLeftIcon,
  Message01Icon,
  ArrowRight01Icon,
  UserGroup02Icon,
  Folder02Icon,
  Analytics01Icon,
} from "@hugeicons/core-free-icons";
import { mockUserProfile } from "../../data/mockData";

const Sidebar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
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

  const handleSidebarClick = (e) => {
    // If collapsed, clicking on empty/non-interactive areas opens the sidebar
    if (sidebarCollapsed) {
      if (!e.target.closest("a") && !e.target.closest("button")) {
        setSidebarCollapsed(false);
      }
    }
  };

  return (
    <aside
      onClick={handleSidebarClick}
      className={`h-screen bg-[#F1F3F9] border-r border-[#E2E6F2] flex flex-col justify-between transition-all duration-300 ease-in-out select-none flex-shrink-0 ${
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
          className={`h-[64px] flex items-center px-4 border-b border-[#E2E6F2]/60 flex-shrink-0 ${
            sidebarCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#637EEB] to-[#8FA2F4] flex items-center justify-center text-white shadow-xs flex-shrink-0">
              <HugeiconsIcon icon={Message01Icon} size={20} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-[17px] tracking-tight text-[#1A1D2E] truncate">
                Muloqot
              </span>
            )}
          </div>

          {/* Toggle Collapse Button - Only visible when expanded */}
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSidebarCollapsed(true);
              }}
              className="p-1.5 rounded-lg text-[#5B6078] hover:text-[#1A1D2E] hover:bg-[#E2E6F2] transition-colors cursor-pointer"
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
                      ? "bg-[#E2E6F2] text-[#1A1D2E] font-semibold shadow-xs"
                      : "text-[#5B6078] hover:bg-[#E8ECF6] hover:text-[#1A1D2E]"
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
                        isActive
                          ? "text-[#1A1D2E]"
                          : "text-[#5B6078] group-hover:text-[#1A1D2E]"
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
      <div className="p-3 border-t border-[#E2E6F2]/80 space-y-2 flex-shrink-0">
        {/* Bottom Nav Items (Logs, Settings) */}
        <nav className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-[#E2E6F2] text-[#1A1D2E] font-semibold shadow-xs"
                    : "text-[#5B6078] hover:bg-[#E8ECF6] hover:text-[#1A1D2E]"
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
                      isActive
                        ? "text-[#1A1D2E]"
                        : "text-[#5B6078] group-hover:text-[#1A1D2E]"
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

        {/* User Profile Card */}
        <div className="pt-2 border-t border-[#E2E6F2]/60">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group ${
                isActive ? "bg-[#E2E6F2]" : "hover:bg-[#E8ECF6]"
              } ${sidebarCollapsed ? "justify-center p-1" : ""}`
            }
            title={
              sidebarCollapsed
                ? `${mockUserProfile.name} (${mockUserProfile.role})`
                : undefined
            }
          >
            {/* Avatar without green dot */}
            <div className="w-10 h-10 rounded-xl bg-[#DADFF0] text-[#3D4F88] font-bold flex items-center justify-center text-sm shadow-inner flex-shrink-0">
              {mockUserProfile.initial || "D"}
            </div>

            {/* User Details */}
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-[#1A1D2E] truncate leading-tight group-hover:text-[#4763E4] transition-colors">
                  {mockUserProfile.name}
                </div>
                <div className="mt-0.5">
                  <span className="text-[11px] font-semibold text-[#526ED3] uppercase tracking-wide">
                    {mockUserProfile.role}
                  </span>
                </div>
              </div>
            )}

            {!sidebarCollapsed && (
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={16}
                className="text-[#8B90A5] group-hover:text-[#1A1D2E] transition-colors flex-shrink-0"
              />
            )}
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;