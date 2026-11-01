import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Menu,
  X,
  Plus,
  Minus,
  CalendarPlus2,
  Link as LinkIcon,
  UserRoundCheck,
  ChartBar,
} from "lucide-react";
import { FaTelegramPlane } from "react-icons/fa";
import { loginWithAuthly, isAuthenticated } from "../../services/auth";

// Reusable Scroll-Reveal Component
const Reveal = ({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 750,
  className = "",
  threshold = 0.12,
  rootMargin = "0px 0px -50px 0px",
  once = true,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(el);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  const getTransform = () => {
    if (isVisible) return "translate3d(0, 0, 0) scale(1) rotateX(0deg)";
    switch (animation) {
      case "fade-up":
        return "translate3d(0, 36px, 0)";
      case "fade-down":
        return "translate3d(0, -36px, 0)";
      case "fade-left":
        return "translate3d(40px, 0, 0)";
      case "fade-right":
        return "translate3d(-40px, 0, 0)";
      case "zoom-in":
        return "scale(0.92)";
      case "zoom-in-up":
        return "translate3d(0, 35px, 0) scale(0.95)";
      case "flip-up":
        return "perspective(800px) rotateX(12deg) translate3d(0, 30px, 0)";
      default:
        return "translate3d(0, 36px, 0)";
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: "transform, opacity",
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// ================= 1. INTERACTIVE 12-WEEK DYNAMICS CHART =================
const weeklyDynamicsData = [
  { week: 1, label: "1-h", shortLabel: "1", fullLabel: "1-hafta", date: "15-21 Iyul", count: 12, growth: "+4.2%" },
  { week: 2, label: "2-h", shortLabel: "2", fullLabel: "2-hafta", date: "22-28 Iyul", count: 14, growth: "+16.6%" },
  { week: 3, label: "3-h", shortLabel: "3", fullLabel: "3-hafta", date: "29 Iyul - 4 Avg", count: 15, growth: "+7.1%" },
  { week: 4, label: "4-h", shortLabel: "4", fullLabel: "4-hafta", date: "5-11 Avgust", count: 17, growth: "+13.3%" },
  { week: 5, label: "5-h", shortLabel: "5", fullLabel: "5-hafta", date: "12-18 Avgust", count: 18, growth: "+5.8%" },
  { week: 6, label: "6-h", shortLabel: "6", fullLabel: "6-hafta", date: "19-25 Avgust", count: 20, growth: "+11.1%" },
  { week: 7, label: "7-h", shortLabel: "7", fullLabel: "7-hafta", date: "26 Avg - 1 Sen", count: 21, growth: "+5.0%" },
  { week: 8, label: "8-h", shortLabel: "8", fullLabel: "8-hafta", date: "2-8 Sentabr", count: 23, growth: "+9.5%" },
  { week: 9, label: "9-h", shortLabel: "9", fullLabel: "9-hafta", date: "9-15 Sentabr", count: 25, growth: "+8.7%" },
  { week: 10, label: "10-h", shortLabel: "10", fullLabel: "10-hafta", date: "16-22 Sentabr", count: 28, growth: "+12.0%" },
  { week: 11, label: "11-h", shortLabel: "11", fullLabel: "11-hafta", date: "23-29 Sentabr", count: 31, growth: "+10.7%" },
  { week: 12, label: "12-h", shortLabel: "12", fullLabel: "12-hafta", date: "30 Sen - 6 Okt", count: 32, growth: "+12.1%", isCurrent: true },
];

const InteractiveDynamicsChart = () => {
  const [activeWeekIndex, setActiveWeekIndex] = useState(11);
  const containerRef = useRef(null);

  const points = weeklyDynamicsData.map((d, i) => {
    const x = 24 + (i / 11) * 548;
    const y = 96 - ((d.count - 10) / 24) * 76;
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = arr[i - 1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cx2 = cx1;
    return `${acc} C ${cx1} ${prev.y}, ${cx2} ${p.y}, ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} 108 L ${points[0].x} 108 Z`;
  const activeData = points[activeWeekIndex] || points[11];

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const width = rect.width;
    const ratio = Math.max(0, Math.min(1, (relativeX - 16) / (width - 32)));
    const index = Math.round(ratio * 11);
    if (index >= 0 && index <= 11) {
      setActiveWeekIndex(index);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="w-full min-h-[300px] sm:min-h-[320px] rounded-[20px] sm:rounded-[24px] bg-white p-4 sm:p-6 text-[#1A1D2E] shadow-lg flex flex-col justify-between hover-card-lift select-none relative group"
    >
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div>
          <span className="text-[10px] sm:text-[11px] font-extrabold text-[#5B6078] uppercase tracking-wider block">
            YIGʻILISHLAR DINAMIKASI, 12 HAFTA
          </span>
          <div className="flex items-center gap-2.5 sm:gap-3 mt-1">
            <span className="text-[26px] sm:text-[32px] font-['Unbounded',sans-serif] font-semibold text-[#1A1D2E] leading-none">
              256
            </span>
            <span className="h-[22px] sm:h-[24px] px-2 sm:px-2.5 rounded-full bg-[#E8F7F0] text-[#16A34A] text-[11px] sm:text-[12px] font-extrabold inline-flex items-center gap-1 transition-all">
              <span>↑</span>
              <span>{activeData.growth}</span>
            </span>
          </div>
        </div>

        {/* Dynamic Badge */}
        <div className="h-[30px] sm:h-[34px] px-3 sm:px-4 rounded-[10px] sm:rounded-[12px] bg-[#1A1D2E] text-white text-[11px] sm:text-[12px] font-extrabold flex items-center gap-1.5 sm:gap-2 shadow-md transition-all duration-300">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#38C98D] animate-ping"></span>
          <span>
            {activeData.count} ta, {activeData.isCurrent ? "shu hafta" : activeData.fullLabel}
          </span>
        </div>
      </div>

      {/* SVG Interactive Chart Area */}
      <div className="relative w-full h-32 sm:h-38 my-1 cursor-crosshair">
        <svg viewBox="0 0 596 115" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {/* Horizontal grid lines */}
          <line x1="10" y1="20" x2="586" y2="20" stroke="#EEF1F7" strokeWidth="1" />
          <line x1="10" y1="50" x2="586" y2="50" stroke="#EEF1F7" strokeWidth="1" />
          <line x1="10" y1="80" x2="586" y2="80" stroke="#EEF1F7" strokeWidth="1" />
          <line x1="10" y1="108" x2="586" y2="108" stroke="#EEF1F7" strokeWidth="1" />

          <defs>
            <linearGradient id="dynamicsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3F57B3" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#3F57B3" stopOpacity="0.01" />
            </linearGradient>
            <filter id="pointGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#3F57B3" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill="url(#dynamicsGrad)" className="transition-all duration-300" />

          {/* Main Curve Line */}
          <path d={pathD} fill="none" stroke="#3F57B3" strokeWidth="3.5" strokeLinecap="round" />

          {/* Active Vertical Guideline */}
          <line
            x1={activeData.x}
            y1="12"
            x2={activeData.x}
            y2="108"
            stroke="#3F57B3"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.8"
            className="transition-all duration-150"
          />

          {/* All Week Points */}
          {points.map((p, idx) => {
            const isActive = idx === activeWeekIndex;
            return (
              <g key={idx} className="cursor-pointer" onClick={() => setActiveWeekIndex(idx)}>
                {isActive && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="12"
                    fill="#3F57B3"
                    fillOpacity="0.18"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? "6" : "3.5"}
                  fill={isActive ? "#FFFFFF" : "#3F57B3"}
                  stroke="#3F57B3"
                  strokeWidth={isActive ? "3.5" : "1.5"}
                  filter={isActive ? "url(#pointGlow)" : undefined}
                  className="transition-all duration-200"
                />
              </g>
            );
          })}
        </svg>

        {/* Dynamic Floating Tooltip */}
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-full mb-2.5 transition-all duration-150 ease-out z-30"
          style={{
            left: `${(activeData.x / 596) * 100}%`,
            top: `${(activeData.y / 115) * 100}%`,
          }}
        >
          <div className="bg-[#1A1D2E] text-white text-[10.5px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-white/10 flex flex-col items-center">
            <span className="text-[#38C98D] text-[9.5px] sm:text-[10px] font-extrabold">{activeData.fullLabel} ({activeData.date})</span>
            <span className="text-white text-[11px] sm:text-[12px] font-black">{activeData.count} ta yigʻilish</span>
            <div className="w-2 h-2 bg-[#1A1D2E] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-white/10"></div>
          </div>
        </div>
      </div>

      {/* Week Badges / Ticks - Full width 12-col grid, no scrollbar */}
      <div className="w-full grid grid-cols-12 gap-0.5 sm:gap-1 pt-2 border-t border-[#EEF1F7] text-[10px] sm:text-[11px] font-semibold text-[#8F95A8] select-none">
        {weeklyDynamicsData.map((d, idx) => {
          const isActive = idx === activeWeekIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveWeekIndex(idx)}
              onMouseEnter={() => setActiveWeekIndex(idx)}
              className={`w-full py-0.5 sm:py-1 text-center rounded-md transition-all truncate cursor-pointer ${
                isActive
                  ? "bg-[#3F57B3] text-white font-extrabold shadow-xs"
                  : "hover:text-[#1A1D2E] hover:bg-[#F1F3F9]"
              }`}
            >
              <span className="hidden sm:inline">{d.label}</span>
              <span className="sm:hidden">{d.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ================= 2. INTERACTIVE DONUT CHART =================
const statusData = [
  { id: "otkazilgan", label: "Oʻtkazilgan", count: 184, percent: "71.9%", color: "#26C281", dashArray: "162.5 226.2", dashOffset: "0" },
  { id: "rejalashtirilgan", label: "Rejalashtirilgan", count: 37, percent: "14.5%", color: "#4361EE", dashArray: "32.7 226.2", dashOffset: "-162.5" },
  { id: "joriy", label: "Joriy", count: 2, percent: "0.8%", color: "#F59E0B", dashArray: "1.8 226.2", dashOffset: "-195.2" },
  { id: "bekor", label: "Bekor qilingan", count: 33, percent: "12.9%", color: "#8D99AE", dashArray: "29.2 226.2", dashOffset: "-197.0" },
];

const InteractiveDonutChart = () => {
  const [hoveredStatusIndex, setHoveredStatusIndex] = useState(null);
  const activeItem = hoveredStatusIndex !== null ? statusData[hoveredStatusIndex] : null;

  return (
    <div
      onMouseLeave={() => setHoveredStatusIndex(null)}
      className="w-full h-full min-h-[260px] sm:min-h-[270px] rounded-[20px] sm:rounded-[24px] bg-white p-4 sm:p-5 text-[#1A1D2E] shadow-sm flex flex-col justify-between border border-transparent hover:border-[#E2E6F2] transition-colors"
    >
      <div className="flex items-center justify-between h-5 mb-1">
        <span className="text-[11px] sm:text-[12px] font-extrabold text-[#5B6078] tracking-wider uppercase block">
          HOLAT BOʻYICHA
        </span>
        <span
          style={{ color: activeItem ? activeItem.color : "#8F95A8" }}
          className="text-[11.5px] sm:text-[12px] font-extrabold transition-colors duration-150"
        >
          {activeItem ? `${activeItem.label}: ${activeItem.percent}` : "100%"}
        </span>
      </div>

      <div className="flex flex-row items-center justify-between gap-2 sm:gap-3 my-auto py-1">
        {/* Interactive Donut graphic */}
        <div className="relative w-[95px] h-[95px] sm:w-[108px] sm:h-[108px] shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 overflow-visible">
            {/* Base Slices */}
            {statusData.map((item, idx) => {
              const isHovered = hoveredStatusIndex === idx;
              return (
                <circle
                  key={item.id}
                  cx="50"
                  cy="50"
                  r="36"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="13"
                  strokeDasharray={item.dashArray}
                  strokeDashoffset={item.dashOffset}
                  strokeLinecap="butt"
                  onMouseEnter={() => setHoveredStatusIndex(idx)}
                  className="transition-all duration-200 cursor-pointer"
                  opacity={hoveredStatusIndex !== null && !isHovered ? 0.45 : 1}
                />
              );
            })}

            {/* Active Highlighted Slice rendered on top */}
            {activeItem && (
              <circle
                key={`active-${activeItem.id}`}
                cx="50"
                cy="50"
                r="36"
                fill="none"
                stroke={activeItem.color}
                strokeWidth="15"
                strokeDasharray={activeItem.dashArray}
                strokeDashoffset={activeItem.dashOffset}
                strokeLinecap="butt"
                className="transition-all duration-150 cursor-pointer pointer-events-none drop-shadow-sm"
              />
            )}
          </svg>

          {/* Center Dynamic Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-[18px] sm:text-[21px] font-['Unbounded',sans-serif] font-bold text-[#1A1D2E] leading-none">
              {activeItem ? activeItem.count : 256}
            </span>
            <span
              style={{ color: activeItem ? activeItem.color : "#8F95A8" }}
              className="text-[9.5px] sm:text-[10.5px] font-extrabold mt-0.5"
            >
              {activeItem ? activeItem.percent : "Jami"}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
          {statusData.map((item, idx) => {
            const isHovered = hoveredStatusIndex === idx;
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredStatusIndex(idx)}
                className={`flex items-center justify-between py-1 px-1.5 sm:px-2 rounded-xl transition-colors cursor-pointer ${
                  isHovered ? "bg-[#F1F3F9]" : "hover:bg-[#F8FAFC]"
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 pr-1">
                  <span
                    style={{ backgroundColor: item.color }}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 transition-transform duration-150 ${
                      isHovered ? "scale-125" : ""
                    }`}
                  ></span>
                  <span className={`text-[11px] sm:text-[12px] truncate ${isHovered ? "font-bold text-[#1A1D2E]" : "font-medium text-[#475569]"}`}>
                    {item.label}
                  </span>
                </div>
                <span className="text-[11.5px] sm:text-[12.5px] font-extrabold text-[#1A1D2E] shrink-0">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ================= 3. INTERACTIVE WEEKLY ATTENDANCE BAR CHART =================
const weeklyAttendanceData = [
  { day: "Du", fullDay: "Dushanba", val: "88%", count: 138, height: "88%", isPeak: false },
  { day: "Se", fullDay: "Seshanba", val: "91%", count: 145, height: "98%", isPeak: true },
  { day: "Cho", fullDay: "Chorshanba", val: "79%", count: 124, height: "79%", isPeak: false },
  { day: "Pa", fullDay: "Payshanba", val: "86%", count: 136, height: "86%", isPeak: false },
  { day: "Ju", fullDay: "Juma", val: "82%", count: 130, height: "82%", isPeak: false },
  { day: "Sha", fullDay: "Shanba", val: "64%", count: 98, height: "64%", isPeak: false },
];

const InteractiveWeeklyBarChart = () => {
  const [hoveredDayIndex, setHoveredDayIndex] = useState(null);
  const activeDay = hoveredDayIndex !== null ? weeklyAttendanceData[hoveredDayIndex] : null;

  return (
    <div
      onMouseLeave={() => setHoveredDayIndex(null)}
      className="w-full h-full min-h-[260px] sm:min-h-[270px] rounded-[20px] sm:rounded-[24px] bg-white p-4 sm:p-5 text-[#1A1D2E] shadow-sm flex flex-col justify-between border border-transparent hover:border-[#E2E6F2] transition-colors"
    >
      <div className="flex items-center justify-between h-5">
        <span className="text-[11px] sm:text-[12px] font-extrabold text-[#5B6078] tracking-wider uppercase block">
          QATNASHISH, HAFTA KUNLARI
        </span>
        <span
          className={`text-[10.5px] sm:text-[11.5px] font-extrabold text-[#3F57B3] transition-opacity duration-150 ${
            activeDay ? "opacity-100" : "opacity-0"
          }`}
        >
          {activeDay ? `${activeDay.fullDay}: ${activeDay.count} nafar` : "145 nafar"}
        </span>
      </div>

      <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-32 sm:h-36 pt-2 pb-1 relative">
        {weeklyAttendanceData.map((bar, idx) => {
          const isHovered = hoveredDayIndex === idx;
          return (
            <div
              key={bar.day}
              onMouseEnter={() => setHoveredDayIndex(idx)}
              className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group"
            >
              {/* Value Label */}
              <span
                className={`text-[10.5px] sm:text-[11.5px] font-extrabold mb-1.5 transition-colors duration-150 ${
                  isHovered ? "text-[#3F57B3]" : "text-[#1A1D2E]"
                }`}
              >
                {bar.val}
              </span>

              {/* Bar Element */}
              <div
                style={{ height: bar.height }}
                className={`w-full max-w-[28px] sm:max-w-[34px] rounded-[10px] sm:rounded-[12px] transition-colors duration-200 ${
                  isHovered
                    ? "bg-[#3B5BDB] shadow-md shadow-[#3B5BDB]/35"
                    : bar.isPeak
                    ? "bg-[#3B5BDB]"
                    : "bg-[#C5D2F6] group-hover:bg-[#B2C6F8]"
                }`}
              />

              {/* Day Label */}
              <span
                className={`text-[11px] sm:text-[12px] mt-2 transition-colors duration-150 ${
                  isHovered
                    ? "font-extrabold text-[#3F57B3]"
                    : "font-semibold text-[#5B6078]"
                }`}
              >
                {bar.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LeandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const authed = isAuthenticated();

  const handleAuthlyLogin = async (e) => {
    if (e) e.preventDefault();
    if (authLoading) return;
    setAuthLoading(true);
    try {
      await loginWithAuthly();
    } catch (err) {
      console.error("Authly login xatosi:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://meetly.uz/join/ycy-xhvd-okx");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };
  
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const faqs = [
    {
      q: "Meetlydan foydalanish uchun alohida roʻyxatdan oʻtish kerakmi?",
      a: "Yoʻq. Authly orqali Telegram yoki Google bilan kirasiz. Agar boshqa loyihada Authly profilingiz boʻlsa, shu profil ishlaydi.",
    },
    {
      q: "Ishtirokchilar yigʻilishga qanday qoʻshiladi?",
      a: "Tashkilotchi tomonidan yuborilgan yagona taklif havolasi orqali brauzerda toʻgʻridan-toʻgʻri yoki ilova orqali bir bosishda qoʻshilish mumkin.",
    },
    {
      q: "Qatnashish qanday hisoblanadi?",
      a: "Har bir ishtirokchining kirish va chiqish vaqtlari avtomatik qayd etiladi va davomat hisobotida toʻliq koʻrsatiladi.",
    },
    {
      q: "Yigʻilish vaqtini oʻzgartirish mumkinmi?",
      a: "Ha, tashkilotchi istalgan vaqtda yigʻilish sanasi va vaqtini tahrirlashi mumkin. Barcha ishtirokchilar oʻzgarish haqida xabardor qilinadi.",
    },
    {
      q: "Hisobotlarni yuklab olsa boʻladimi?",
      a: "Ha, yigʻilishlar, qatnashuvchilar va tashkilotchilar boʻyicha barcha hisobotlarni Excel hamda PDF formatlarida bir tugma bilan yuklab olish mumkin.",
    },
  ];

  return (
    <>
      <div className="min-h-screen overflow-x-clip px-3 sm:px-6 md:px-10 lg:px-16 xl:px-[120px] bg-[#F1F3F9] relative text-[#1A1D2E] font-['Manrope',sans-serif] selection:bg-[#3F57B3]/20 selection:text-[#3F57B3]">

        {/* ================= HEADER & NAV ================= */}
        <header className="w-full max-w-[1360px] mx-auto h-[58px] sm:h-[68px] md:h-[72px] rounded-[18px] sm:rounded-[24px] md:rounded-[28px] bg-[#000000]/95 backdrop-blur-md px-3.5 sm:px-6 lg:px-8 sticky top-2.5 sm:top-4 z-50 flex items-center justify-between shadow-2xl border border-white/10 transition-all">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <img
              src="/logo2.svg"
              alt="Meetly"
              className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-[13px] xs:text-[14.5px] sm:text-[16px] font-['Unbounded',sans-serif] font-bold text-white tracking-tight truncate">
              Meetly
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[14px] xl:text-[15px] font-extrabold text-white">
            <button
              onClick={() => scrollToSection("imkoniyatlar")}
              className="hover:text-[#7F95E6] transition-colors cursor-pointer"
            >
              Imkoniyatlar
            </button>
            <button
              onClick={() => scrollToSection("qanday-ishlaydi")}
              className="hover:text-[#7F95E6] transition-colors cursor-pointer"
            >
              Qanday ishlaydi
            </button>
            <button
              onClick={() => scrollToSection("statistika")}
              className="hover:text-[#7F95E6] transition-colors cursor-pointer"
            >
              Statistika
            </button>
            <button
              onClick={() => scrollToSection("savollar")}
              className="hover:text-[#7F95E6] transition-colors cursor-pointer"
            >
              Savollar
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {authed ? (
              <button
                type="button"
                onClick={() => navigate("/")}
                className="hidden sm:flex h-[36px] sm:h-[38px] px-3.5 sm:px-5 rounded-full bg-gradient-to-r from-[#5272F0] to-[#3F57B3] hover:opacity-95 text-white text-[12.5px] sm:text-[13.5px] font-extrabold items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Boshqaruv paneli</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              /* Authly Button */
              <button
                type="button"
                onClick={handleAuthlyLogin}
                disabled={authLoading}
                className="hidden sm:flex h-[36px] sm:h-[38px] px-3.5 sm:px-5 rounded-full bg-gradient-to-r from-[#4E75FF] to-[#3B5BDB] hover:opacity-95 text-white text-[12.5px] sm:text-[13.5px] font-extrabold items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Kirish</span>
                    <img src="/user.svg" className="pointer-events-none w-3.5 h-3.5 sm:w-4 sm:h-4" alt="" />
                  </>
                )}
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-3 sm:inset-x-6 top-[72px] sm:top-[84px] bg-[#000000]/95 backdrop-blur-2xl text-white p-5 sm:p-6 rounded-[22px] shadow-2xl z-50 flex flex-col gap-3 border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => scrollToSection("imkoniyatlar")}
              className="text-left font-bold text-[15px] py-2.5 px-3 rounded-xl hover:bg-white/10 hover:text-[#7F95E6] transition-colors"
            >
              Imkoniyatlar
            </button>
            <button
              onClick={() => scrollToSection("qanday-ishlaydi")}
              className="text-left font-bold text-[15px] py-2.5 px-3 rounded-xl hover:bg-white/10 hover:text-[#7F95E6] transition-colors"
            >
              Qanday ishlaydi
            </button>
            <button
              onClick={() => scrollToSection("statistika")}
              className="text-left font-bold text-[15px] py-2.5 px-3 rounded-xl hover:bg-white/10 hover:text-[#7F95E6] transition-colors"
            >
              Statistika
            </button>
            <button
              onClick={() => scrollToSection("savollar")}
              className="text-left font-bold text-[15px] py-2.5 px-3 rounded-xl hover:bg-white/10 hover:text-[#7F95E6] transition-colors"
            >
              Savollar
            </button>
            <div className="pt-3 border-t border-white/10 mt-1">
              <button
                type="button"
                onClick={handleAuthlyLogin}
                disabled={authLoading}
                className="w-full h-[46px] rounded-full bg-gradient-to-r from-[#4E75FF] to-[#3B5BDB] text-white text-[14px] font-extrabold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-lg"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Authly orqali kirish</span>
                    <img src="/user.svg" alt="" className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="max-w-[1360px] mx-auto">
          {/* ================= HERO SECTION ================= */}
          <section className="relative pt-4 sm:pt-6 md:pt-10 pb-12 sm:pb-20 md:pb-24">
            {/* Soft Ambient Gradient Glows with smooth animation */}
            <div className="absolute -top-[300px] -left-[300px] w-[500px] sm:w-[720px] h-[500px] sm:h-[720px] rounded-full bg-gradient-to-r from-[#526ED4]/20 to-[#526ED4]/20 blur-[100px] sm:blur-[130px] pointer-events-none animate-ambient-glow"></div>
            <div className="absolute top-[100px] -right-[400px] sm:-right-[600px] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-gradient-to-br from-[#30C9ED]/20 to-[#30C9ED]/20 blur-[100px] sm:blur-[140px] pointer-events-none animate-ambient-glow" style={{ animationDelay: "3s" }}></div>
            
            <div>
              {/* ================= HERO CONTENT ================= */}
              <div className="text-center mt-6 sm:mt-12 md:mt-16">
                {/* Eyebrow Tag */}
                <Reveal animation="fade-down" delay={100}>
                  <div className="inline-flex items-center gap-1.5 sm:gap-2.5 min-h-[32px] sm:h-[36px] rounded-full bg-[#EEF2FF] p-1 sm:pl-1.5 sm:pr-4 border border-[#DCE4FF] shadow-2xs hover:border-[#3F57B3]/40 transition-colors max-w-full">
                    <span className="h-[22px] sm:h-[24px] px-2 sm:px-3 rounded-full bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white text-[10.5px] sm:text-[12px] font-extrabold flex items-center justify-center shadow-xs shrink-0">
                      Yangi
                    </span>
                    <span className="text-[11.5px] xs:text-[12.5px] sm:text-[13.5px] md:text-[14px] font-bold text-[#3F57B3] truncate sm:whitespace-normal">
                      Meetly ekotizimi, yagona Authly bilan
                    </span>
                  </div>
                </Reveal>

                {/* Headline */}
                <Reveal animation="fade-up" delay={200}>
                  <h1 className="text-[26px] xs:text-[32px] sm:text-[42px] md:text-[50px] lg:text-[56px] xl:text-[60px] font-['Unbounded',sans-serif] font-medium text-[#1A1D2E] tracking-tight leading-[1.18] sm:leading-[1.14] max-w-[1080px] mx-auto mt-4 sm:mt-6">
                    Yigʻilishlarni bir joyda <br className="hidden sm:inline" />
                    tashkil eting va kuzating
                  </h1>
                </Reveal>

                {/* Subtitle */}
                <Reveal animation="fade-up" delay={300}>
                  <p className="text-[13.5px] xs:text-[15px] sm:text-[17px] md:text-[18.5px] font-bold text-[#5B6078] max-w-[840px] mx-auto mt-3.5 sm:mt-5 leading-relaxed px-1 sm:px-0">
                    Onlayn audio va video yigʻilishlar, taklif havolalari, qatnashishni hisobga olish va hisobotlar. Bitta Authly bilan barcha Meetly xizmatlariga kiring.
                  </p>
                </Reveal>

                {/* CTA Buttons */}
                <Reveal animation="fade-up" delay={400}>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 w-full sm:w-auto max-w-sm sm:max-w-none mx-auto px-1 sm:px-0">
                    {/* Primary CTA */}
                    <button
                      type="button"
                      onClick={handleAuthlyLogin}
                      disabled={authLoading}
                      className="h-[48px] sm:h-[54px] md:h-[56px] px-6 sm:px-8 rounded-full bg-gradient-to-r from-[#5272F0] to-[#3F57B3] hover:opacity-95 active:scale-[0.98] text-white text-[14px] sm:text-[15px] font-bold inline-flex items-center justify-center gap-2.5 shadow-xl shadow-[#4E75FF]/25 hover:shadow-[#4E75FF]/35 transition-all cursor-pointer"
                    >
                      {authLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Authly orqali boshlash</span>
                          <ArrowRight size={17} strokeWidth={2.5} />
                        </>
                      )}
                    </button>

                    {/* Secondary CTA */}
                    <button
                      type="button"
                      onClick={() => scrollToSection("imkoniyatlar")}
                      className="h-[48px] sm:h-[54px] md:h-[56px] px-6 sm:px-8 rounded-full bg-gradient-to-r from-[#3F7AB3] via-[#28B6D8] via-[#31C8ED] to-[#4DA7BD] hover:opacity-95 active:scale-[0.98] text-white text-[14px] sm:text-[15px] font-bold inline-flex items-center justify-center gap-2.5 shadow-xl shadow-[#208DBB]/25 hover:shadow-[#208DBB]/35 transition-all cursor-pointer"
                    >
                      <span>Imkoniyatlarni koʻrish</span>
                      <ArrowUpRight size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </Reveal>

                {/* ================= HERO DASHBOARD PREVIEW & FLOATING CARDS ================= */}
                <div className="relative mt-8 sm:mt-14 md:mt-16 max-w-[1160px] mx-auto">
                  {/* Main Dashboard Image */}
                  <Reveal animation="zoom-in-up" delay={500} duration={850}>
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-white/60">
                      <img
                        src="/3.svg"
                        alt="Dashboard Preview"
                        className="w-full h-auto object-contain block pointer-events-none"
                      />
                    </div>
                  </Reveal>

                  {/* Float Card 1: Marketing strategiyasi */}
                  <Reveal animation="fade-right" delay={650} duration={850} className="hidden lg:block absolute -left-8 xl:-left-20 top-[28%] z-20">
                    <div className="animate-float-1 transition-transform hover:scale-105 duration-300">
                      <img
                        src="/1.svg"
                        alt="Marketing strategiyasi"
                        className="w-[260px] xl:w-[360px] h-auto object-contain pointer-events-none drop-shadow-xl"
                      />
                    </div>
                  </Reveal>

                  {/* Float Card 2: Oʻrtacha qatnashish */}
                  <Reveal animation="fade-left" delay={750} duration={850} className="hidden lg:block absolute -right-8 xl:-right-20 top-[40%] z-20">
                    <div className="animate-float-2 transition-transform hover:scale-105 duration-300">
                      <img
                        src="/2.svg"
                        alt="Oʻrtacha qatnashish"
                        className="w-[240px] xl:w-[340px] h-auto object-contain pointer-events-none drop-shadow-xl"
                      />
                    </div>
                  </Reveal>
                </div>
                <div className="w-full h-[100px] sm:h-[160px] bottom-[30px] sm:bottom-[60px] bg-gradient-to-b blur-[30px] sm:blur-[50px] from-[#F1F3F9]/20 to-[#F1F3F9] absolute pointer-events-none"></div>
              </div>
            </div>
          </section>

          {/* ================= STATS COUNTER BAR ================= */}
          <section className="py-4 sm:py-6 md:py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {/* Stat 1 */}
              <Reveal animation="zoom-in-up" delay={0}>
                <div className="w-full min-h-[120px] sm:min-h-[145px] md:h-[160px] p-4 sm:p-5 md:p-6 rounded-[16px] sm:rounded-[20px] bg-[#1A1D2E] text-white flex flex-col justify-between shadow-lg hover-card-lift">
                  <span className="text-[26px] xs:text-[30px] sm:text-[36px] md:text-[40px] lg:text-[44px] font-['Unbounded',sans-serif] font-semibold tracking-tight leading-none bg-gradient-to-r from-white to-[#CBD5E1] bg-clip-text text-transparent">
                    1 248
                  </span>
                  <span className="text-[12px] xs:text-[13px] sm:text-[14.5px] sm:text-[15px] font-medium text-[#94A3B8]">
                    faol foydalanuvchi
                  </span>
                </div>
              </Reveal>

              {/* Stat 2 */}
              <Reveal animation="zoom-in-up" delay={120}>
                <div className="w-full min-h-[120px] sm:min-h-[145px] md:h-[160px] p-4 sm:p-5 md:p-6 rounded-[16px] sm:rounded-[20px] bg-white border border-[#E2E6F2] flex flex-col justify-between shadow-2xs hover-card-lift">
                  <span className="text-[26px] xs:text-[30px] sm:text-[36px] md:text-[40px] lg:text-[44px] font-['Unbounded',sans-serif] font-semibold text-[#1A1D2E] tracking-tight leading-none">
                    256
                  </span>
                  <span className="text-[12px] xs:text-[13px] sm:text-[14.5px] sm:text-[15px] font-medium text-[#5B6078]">
                    oʻtkazilgan yigʻilish
                  </span>
                </div>
              </Reveal>

              {/* Stat 3 */}
              <Reveal animation="zoom-in-up" delay={240}>
                <div className="w-full min-h-[120px] sm:min-h-[145px] md:h-[160px] p-4 sm:p-5 md:p-6 rounded-[16px] sm:rounded-[20px] bg-white border border-[#E2E6F2] flex flex-col justify-between shadow-2xs hover-card-lift">
                  <span className="text-[26px] xs:text-[30px] sm:text-[36px] md:text-[40px] lg:text-[44px] font-['Unbounded',sans-serif] font-semibold text-[#1A1D2E] tracking-tight leading-none">
                    84%
                  </span>
                  <span className="text-[12px] xs:text-[13px] sm:text-[14.5px] sm:text-[15px] font-medium text-[#5B6078]">
                    oʻrtacha qatnashish
                  </span>
                </div>
              </Reveal>

              {/* Stat 4 */}
              <Reveal animation="zoom-in-up" delay={360}>
                <div className="w-full min-h-[120px] sm:min-h-[145px] md:h-[160px] p-4 sm:p-5 md:p-6 rounded-[16px] sm:rounded-[20px] bg-white border border-[#E2E6F2] flex flex-col justify-between shadow-2xs hover-card-lift">
                  <span className="text-[26px] xs:text-[30px] sm:text-[36px] md:text-[40px] lg:text-[44px] font-['Unbounded',sans-serif] font-semibold text-[#1A1D2E] tracking-tight leading-none">
                    30+
                  </span>
                  <span className="text-[12px] xs:text-[13px] sm:text-[14.5px] sm:text-[15px] font-medium text-[#5B6078] line-clamp-2 sm:line-clamp-none">
                    Meetly loyihasi
                  </span>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ================= IMKONIYaTLAR SECTION ================= */}
          <section id="imkoniyatlar" className="py-12 sm:py-16 md:py-20">
            <Reveal animation="fade-up">
              <div className="max-w-3xl mb-6 sm:mb-10 md:mb-12">
                <span className="text-[11.5px] sm:text-[13px] font-extrabold text-[#3F57B3] tracking-wider uppercase block mb-1 sm:mb-2">
                  IMKONIYATLAR
                </span>
                <h2 className="text-[22px] xs:text-[26px] sm:text-[32px] md:text-[38px] font-['Unbounded',sans-serif] font-medium text-[#1A1D2E] tracking-tight leading-tight">
                  Yigʻilish uchun kerak boʻlgan <br className="hidden sm:inline" />
                  hamma narsa bitta joyda
                </h2>
                <p className="text-[13.5px] sm:text-[15.5px] md:text-[16px] font-medium text-[#5B6078] mt-2 sm:mt-3">
                  Yaratishdan tortib hisobotgacha: tashkilotchi va ishtirokchi uchun oddiy, tushunarli jarayon.
                </p>
              </div>
            </Reveal>

            {/* 6 Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {/* Card 1: Yigʻilish yaratish */}
              <Reveal animation="zoom-in-up" delay={0}>
                <div className="w-full min-h-[270px] sm:h-[304px] rounded-[18px] sm:rounded-[20px] bg-white border border-[#E2E6F2] p-4.5 sm:p-6 flex flex-col justify-between shadow-2xs hover-card-lift hover:border-[#3F57B3]/40">
                  <div>
                    <div className="w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] rounded-[14px] bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
                      <CalendarPlus2 size={21} />
                    </div>
                    <h3 className="text-[17px] sm:text-[19px] font-extrabold text-[#1A1D2E] mb-1.5 sm:mb-2">
                      Yigʻilish yaratish
                    </h3>
                    <p className="text-[13px] sm:text-[14.5px] font-medium text-[#5B6078] leading-relaxed">
                      Nomi, tavsifi, sana, vaqt va davomiylikni kiriting. Tasdiqlash talabini yoqib qoʻyish mumkin.
                    </p>
                  </div>

                  {/* Widget */}
                  <div className="bg-[#F1F3F9] rounded-xl p-2.5 sm:p-3 grid grid-cols-3 gap-1 text-center text-[12px] mt-3 sm:mt-4">
                    <div>
                      <span className="text-[#8F95A8] block text-[10px] sm:text-[11px] font-bold">Sana</span>
                      <span className="font-extrabold text-[#1A1D2E] text-[11px] sm:text-[12px]">15.10.2026</span>
                    </div>
                    <div className="border-x border-[#E2E6F2]">
                      <span className="text-[#8F95A8] block text-[10px] sm:text-[11px] font-bold">Vaqti</span>
                      <span className="font-extrabold text-[#1A1D2E] text-[11px] sm:text-[12px]">15:00</span>
                    </div>
                    <div>
                      <span className="text-[#8F95A8] block text-[10px] sm:text-[11px] font-bold">Davomiyligi</span>
                      <span className="font-extrabold text-[#1A1D2E] text-[11px] sm:text-[12px]">45 daqiqa</span>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Card 2: Taklif havolasi */}
              <Reveal animation="zoom-in-up" delay={100}>
                <div className="w-full min-h-[270px] sm:h-[304px] rounded-[18px] sm:rounded-[20px] bg-white border border-[#E2E6F2] p-4.5 sm:p-6 flex flex-col justify-between shadow-2xs hover-card-lift hover:border-[#3F57B3]/40">
                  <div>
                    <div className="w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] rounded-[14px] bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
                      <LinkIcon size={21} />
                    </div>
                    <h3 className="text-[17px] sm:text-[19px] font-extrabold text-[#1A1D2E] mb-1.5 sm:mb-2">
                      Taklif havolasi
                    </h3>
                    <p className="text-[13px] sm:text-[14.5px] font-medium text-[#5B6078] leading-relaxed">
                      Tizim yigʻilish uchun alohida havola beradi. Ishtirokchilar faqat shu havola orqali qoʻshiladi.
                    </p>
                  </div>

                  {/* Widget */}
                  <div className="bg-[#F1F3F9] rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                    <span className="text-[11.5px] sm:text-[13px] font-bold text-[#1A1D2E] truncate pl-1 sm:pl-2">
                      meetly.uz/join/ycy-xhvd-okx
                    </span>
                    <button
                      onClick={handleCopyLink}
                      type="button"
                      className="h-[28px] sm:h-[32px] px-2.5 sm:px-3.5 rounded-full bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white text-[11px] sm:text-[12px] font-extrabold transition-all shrink-0 cursor-pointer active:scale-95"
                    >
                      {copiedLink ? "Nusxalandi!" : "Nusxalash"}
                    </button>
                  </div>
                </div>
              </Reveal>

              {/* Card 3: Qatnashishni hisobga olish */}
              <Reveal animation="zoom-in-up" delay={200}>
                <div className="w-full min-h-[270px] sm:h-[304px] rounded-[18px] sm:rounded-[20px] bg-white border border-[#E2E6F2] p-4.5 sm:p-6 flex flex-col justify-between shadow-2xs hover-card-lift hover:border-[#3F57B3]/40">
                  <div>
                    <div className="w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] rounded-[14px] bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
                      <UserRoundCheck size={21} />
                    </div>
                    <h3 className="text-[17px] sm:text-[19px] font-extrabold text-[#1A1D2E] mb-1.5 sm:mb-2">
                      Qatnashishni hisobga olish
                    </h3>
                    <p className="text-[13px] sm:text-[14.5px] font-medium text-[#5B6078] leading-relaxed">
                      Kim qachon kirgan va chiqqan, qancha vaqt qatnashgani avtomatik yoziladi.
                    </p>
                  </div>

                  {/* Widget */}
                  <div className="bg-[#F1F3F9] rounded-xl p-2.5 space-y-1.5 text-[10.5px] sm:text-[11.5px] mt-3 sm:mt-4">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#1A1D2E] truncate pr-2">Alyona Sokolova</span>
                      <span className="text-[#8F95A8] font-medium text-[10px] sm:text-[11px] shrink-0">09:00–09:45</span>
                      <span className="text-[#10B981] shrink-0 pl-1.5">Qatnashdi</span>
                    </div>
                    <div className="flex items-center justify-between font-bold pt-1 border-t border-[#E2E6F2]">
                      <span className="text-[#1A1D2E] truncate pr-2">Mikhail Borisov</span>
                      <span className="text-[#8F95A8] font-medium text-[10px] sm:text-[11px] shrink-0">11:00–11:15</span>
                      <span className="text-[#10B981] shrink-0 pl-1.5">Qatnashdi</span>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Card 4: Holatlar real vaqtda */}
              <Reveal animation="zoom-in-up" delay={100}>
                <div className="w-full min-h-[270px] sm:h-[304px] rounded-[18px] sm:rounded-[20px] bg-white border border-[#E2E6F2] p-4.5 sm:p-6 flex flex-col justify-between shadow-2xs hover-card-lift hover:border-[#3F57B3]/40">
                  <div>
                    <div className="w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] rounded-[14px] bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
                      <Clock size={21} />
                    </div>
                    <h3 className="text-[17px] sm:text-[19px] font-extrabold text-[#1A1D2E] mb-1.5 sm:mb-2">
                      Holatlar real vaqtda
                    </h3>
                    <p className="text-[13px] sm:text-[14.5px] font-medium text-[#5B6078] leading-relaxed">
                      Rejalashtirilgan, joriy, oʻtkazilgan va bekor qilingan yigʻilishlar bir qarashda.
                    </p>
                  </div>

                  {/* Widget */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 mt-3 sm:mt-4">
                    <span className="px-2.5 sm:px-3 py-1 rounded-full bg-[#EEF2FB] text-[#3F57B3] text-[10.5px] sm:text-[12px] font-extrabold">
                      ● Rejalashtirilgan
                    </span>
                    <span className="px-2.5 sm:px-3 py-1 rounded-full bg-[#FFF7ED] text-[#F97316] text-[10.5px] sm:text-[12px] font-extrabold">
                      ● Joriy
                    </span>
                    <span className="px-2.5 sm:px-3 py-1 rounded-full bg-[#ECFDF5] text-[#10B981] text-[10.5px] sm:text-[12px] font-extrabold">
                      ● Oʻtkazilgan
                    </span>
                  </div>
                </div>
              </Reveal>

              {/* Card 5: Hisobotlar */}
              <Reveal animation="zoom-in-up" delay={200}>
                <div className="w-full min-h-[270px] sm:h-[304px] rounded-[18px] sm:rounded-[20px] bg-white border border-[#E2E6F2] p-4.5 sm:p-6 flex flex-col justify-between shadow-2xs hover-card-lift hover:border-[#3F57B3]/40">
                  <div>
                    <div className="w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] rounded-[14px] bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
                      <ChartBar size={21} />
                    </div>
                    <h3 className="text-[17px] sm:text-[19px] font-extrabold text-[#1A1D2E] mb-1.5 sm:mb-2">
                      Hisobotlar
                    </h3>
                    <p className="text-[13px] sm:text-[14.5px] font-medium text-[#5B6078] leading-relaxed">
                      Yigʻilishlar, ishtirokchilar va tashkilotchilar boʻyicha hisobotlar. Yuklab olish bir bosishda.
                    </p>
                  </div>

                  {/* Widget */}
                  <div className="space-y-1.5 sm:space-y-2 mt-3 sm:mt-4">
                    <div>
                      <span className="text-[11px] sm:text-[11.5px] font-semibold text-[#5B6078] block mb-0.5 sm:mb-1">
                        Yigʻilishlar boʻyicha
                      </span>
                      <div className="w-full h-[5px] rounded-full bg-[#EEF1F7] overflow-hidden">
                        <div className="w-[88%] h-full rounded-full bg-[#3F57B3] transition-all duration-1000"></div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] sm:text-[11.5px] font-semibold text-[#5B6078] block mb-0.5 sm:mb-1">
                        Ishtirokchilar boʻyicha
                      </span>
                      <div className="w-full h-[5px] rounded-full bg-[#EEF1F7] overflow-hidden">
                        <div className="w-[68%] h-full rounded-full bg-[#3F57B3] transition-all duration-1000"></div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] sm:text-[11.5px] font-semibold text-[#5B6078] block mb-0.5 sm:mb-1">
                        Tashkilotchilar boʻyicha
                      </span>
                      <div className="w-full h-[5px] rounded-full bg-[#EEF1F7] overflow-hidden">
                        <div className="w-[48%] h-full rounded-full bg-[#3F57B3] transition-all duration-1000"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Card 6: Yagona Authly */}
              <Reveal animation="zoom-in-up" delay={300}>
                <div className="w-full min-h-[270px] sm:h-[304px] rounded-[18px] sm:rounded-[20px] bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white p-4.5 sm:p-6 flex flex-col justify-between shadow-xl hover-card-lift">
                  <div>
                    <div className="w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] rounded-[14px] bg-white/20 flex items-center justify-center text-white mb-3 sm:mb-4">
                      <ShieldCheck size={22} />
                    </div>
                    <h3 className="text-[17px] sm:text-[19px] font-extrabold text-white mb-1.5 sm:mb-2">
                      Yagona Authly
                    </h3>
                    <p className="text-[13px] sm:text-[14.5px] font-medium text-[#E4E9FF] leading-relaxed">
                      Alohida roʻyxatdan oʻtish yoʻq. Telegram yoki Google orqali bir marta kirasiz.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAuthlyLogin}
                    disabled={authLoading}
                    className="w-full h-[42px] sm:h-[44px] rounded-full bg-white text-[#3F57B3] text-[13px] sm:text-[14px] font-extrabold flex items-center justify-center gap-2 shadow-sm hover:bg-[#F8FAFC] active:scale-95 transition-all cursor-pointer mt-3 sm:mt-4"
                  >
                    {authLoading ? (
                      <div className="w-4 h-4 border-2 border-[#3F57B3] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Authly orqali kirish</span>
                        <ExternalLink size={14} />
                      </>
                    )}
                  </button>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ================= QANDAY ISHLAYDI SECTION ================= */}
          <section id="qanday-ishlaydi" className="py-12 sm:py-16 md:py-20">
            <Reveal animation="fade-up">
              <div className="max-w-3xl mb-6 sm:mb-10 md:mb-12">
                <span className="text-[11.5px] sm:text-[13px] font-extrabold text-[#3F57B3] tracking-wider uppercase block mb-1 sm:mb-2">
                  QANDAY ISHLAYDI
                </span>
                <h2 className="text-[22px] xs:text-[26px] sm:text-[32px] md:text-[38px] font-['Unbounded',sans-serif] font-medium text-[#1A1D2E] tracking-tight leading-tight">
                  Toʻrt qadamda birinchi yigʻilish
                </h2>
              </div>
            </Reveal>

            {/* 4 Steps with Horizontal Stepper */}
            <div className="relative">
              {/* Horizontal Timeline Connector Line (Desktop) */}
              <div className="hidden lg:block absolute top-[19px] left-[19px] right-0 h-[2px] bg-gradient-to-r from-[#526ED4] to-[#30C9ED] z-0"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 relative z-10">
                {/* Step 1 */}
                <Reveal animation="fade-up" delay={0}>
                  <div className="flex flex-col group">
                    <div className="flex items-center mb-3 sm:mb-5">
                      <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white text-[12.5px] sm:text-[13.5px] font-extrabold flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        01
                      </div>
                    </div>
                    <div className="w-full min-h-[120px] sm:min-h-[145px] rounded-[16px] sm:rounded-[20px] bg-white p-4.5 sm:p-6 flex flex-col justify-start hover-card-lift border border-[#E2E6F2]">
                      <h4 className="text-[15.5px] sm:text-[17.5px] font-bold text-[#1A1D2E] leading-snug">
                        Authly orqali kiring
                      </h4>
                      <p className="text-[13px] sm:text-[14px] font-medium text-[#64748B] mt-1.5 sm:mt-2.5 leading-relaxed">
                        Telegram yoki Google bilan. Parol kerak emas.
                      </p>
                    </div>
                  </div>
                </Reveal>

                {/* Step 2 */}
                <Reveal animation="fade-up" delay={120}>
                  <div className="flex flex-col group">
                    <div className="flex items-center mb-3 sm:mb-5">
                      <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full bg-white border border-[#C5D5F6] text-[#3F57B3] text-[12.5px] sm:text-[13.5px] font-bold flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-[#EEF2FF] transition-all">
                        02
                      </div>
                    </div>
                    <div className="w-full min-h-[120px] sm:min-h-[145px] rounded-[16px] sm:rounded-[20px] bg-white p-4.5 sm:p-6 flex flex-col justify-start hover-card-lift border border-[#E2E6F2]">
                      <h4 className="text-[15.5px] sm:text-[17.5px] font-bold text-[#1A1D2E] leading-snug">
                        Yigʻilish yarating
                      </h4>
                      <p className="text-[13px] sm:text-[14px] font-medium text-[#64748B] mt-1.5 sm:mt-2.5 leading-relaxed">
                        Nomi, sana, vaqt va davomiylikni kiriting.
                      </p>
                    </div>
                  </div>
                </Reveal>

                {/* Step 3 */}
                <Reveal animation="fade-up" delay={240}>
                  <div className="flex flex-col group">
                    <div className="flex items-center mb-3 sm:mb-5">
                      <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full bg-white border border-[#C5D5F6] text-[#3F57B3] text-[12.5px] sm:text-[13.5px] font-bold flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-[#EEF2FF] transition-all">
                        03
                      </div>
                    </div>
                    <div className="w-full min-h-[120px] sm:min-h-[145px] rounded-[16px] sm:rounded-[20px] bg-white p-4.5 sm:p-6 flex flex-col justify-start hover-card-lift border border-[#E2E6F2]">
                      <h4 className="text-[15.5px] sm:text-[17.5px] font-bold text-[#1A1D2E] leading-snug">
                        Havolani ulashing
                      </h4>
                      <p className="text-[13px] sm:text-[14px] font-medium text-[#64748B] mt-1.5 sm:mt-2.5 leading-relaxed">
                        Tizim bergan havolani ishtirokchilarga yuboring.
                      </p>
                    </div>
                  </div>
                </Reveal>

                {/* Step 4 */}
                <Reveal animation="fade-up" delay={360}>
                  <div className="flex flex-col group">
                    <div className="flex items-center mb-3 sm:mb-5">
                      <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full bg-white border border-[#C5D5F6] text-[#3F57B3] text-[12.5px] sm:text-[13.5px] font-bold flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-[#EEF2FF] transition-all">
                        04
                      </div>
                    </div>
                    <div className="w-full min-h-[120px] sm:min-h-[145px] rounded-[16px] sm:rounded-[20px] bg-white p-4.5 sm:p-6 flex flex-col justify-start hover-card-lift border border-[#E2E6F2]">
                      <h4 className="text-[15.5px] sm:text-[17.5px] font-bold text-[#1A1D2E] leading-snug">
                        Natijani kuzating
                      </h4>
                      <p className="text-[13px] sm:text-[14px] font-medium text-[#64748B] mt-1.5 sm:mt-2.5 leading-relaxed">
                        Qatnashish va hisobotlar avtomatik tayyorlanadi.
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ================= STATISTIKA DARK BLOCK ================= */}
          <section id="statistika" className="py-12 sm:py-16 md:py-20">
            <Reveal animation="zoom-in-up" duration={850}>
              <div className="w-full rounded-[20px] sm:rounded-[26px] md:rounded-[28px] bg-[#222222] p-4.5 sm:p-7 md:p-9 lg:p-11 text-white relative overflow-hidden shadow-2xl">
                {/* Background Decorative Ellipse Glow */}
                <div className="absolute top-0 right-0 w-[400px] sm:w-[600px] lg:w-[700px] h-[400px] sm:h-[600px] lg:h-[700px] bg-[#3F57B3]/25 rounded-full blur-[100px] sm:blur-[160px] pointer-events-none -z-0 animate-ambient-glow"></div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start relative z-10">
                  {/* Left Column */}
                  <Reveal animation="fade-right" delay={150} className="lg:col-span-5 space-y-3.5 sm:space-y-5">
                    <div>
                      <span className="text-[11.5px] sm:text-[13px] font-extrabold text-[#7F95E6] tracking-wider uppercase block mb-1 sm:mb-2">
                        STATISTIKA
                      </span>
                      <h2 className="text-[24px] xs:text-[28px] sm:text-[34px] md:text-[38px] font-['Unbounded',sans-serif] font-medium text-[#E6EDF3] tracking-tight leading-tight">
                        Har bir yigʻilish <br className="hidden sm:inline" />
                        raqamlarda
                      </h2>
                      <p className="text-[13.5px] sm:text-[15.5px] font-medium text-[#B9C0D6] leading-relaxed mt-2 sm:mt-3">
                        Tashkilotchi va rahbar uchun aniq manzara: qancha yigʻilish oʻtdi, kim qatnashdi, qayerda kechikish bor.
                      </p>

                      <div className="space-y-2.5 sm:space-y-3 pt-3.5 sm:pt-5">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#3F57B3] flex items-center justify-center text-white shrink-0 shadow-sm">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="text-[13.5px] sm:text-[15.5px] font-bold text-[#E6EDF3]">
                            Haftalik dinamika va trend
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#3F57B3] flex items-center justify-center text-white shrink-0 shadow-sm">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="text-[13.5px] sm:text-[15.5px] font-bold text-[#E6EDF3]">
                            Holat boʻyicha taqsimot
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#3F57B3] flex items-center justify-center text-white shrink-0 shadow-sm">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="text-[13.5px] sm:text-[15.5px] font-bold text-[#E6EDF3]">
                            Qatnashish foizi har bir xodim uchun
                          </span>
                        </div>
                      </div>
                    </div>
                  </Reveal>

                  {/* Right Column (Widgets -> 7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Top Curve Chart Card - 12 Haftalik Dinamika */}
                    <Reveal animation="fade-left" delay={200}>
                      <InteractiveDynamicsChart />
                    </Reveal>

                    {/* Bottom Row Split */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Donut Card - Holat bo'yicha */}
                      <Reveal animation="zoom-in-up" delay={300}>
                        <InteractiveDonutChart />
                      </Reveal>

                      {/* Attendance Weekly Bar Card */}
                      <Reveal animation="zoom-in-up" delay={400}>
                        <InteractiveWeeklyBarChart />
                      </Reveal>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* ================= AUTHLY INTEGRATION SECTION ================= */}
          <section className="py-12 sm:py-16 md:py-20">
            <Reveal animation="zoom-in-up">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center bg-[#FFFFFF] p-4.5 sm:p-7 md:p-9 lg:p-12 lg:pl-14 rounded-[20px] sm:rounded-[26px] md:rounded-[28px] shadow-sm hover-card-lift">
                {/* Left Content */}
                <Reveal animation="fade-right" delay={150} className="lg:col-span-7 space-y-3 sm:space-y-4 pt-1 lg:pt-6 pb-1 lg:pb-6">
                  <div>
                    <span className="text-[11.5px] sm:text-[13px] font-extrabold text-[#3F57B3] tracking-wider uppercase block mb-1 sm:mb-2">
                      YAGONA KIRISH
                    </span>
                    <h2 className="text-[24px] xs:text-[28px] sm:text-[34px] md:text-[38px] font-['Unbounded',sans-serif] font-medium text-[#1A1D2E] tracking-tight leading-tight">
                      Bitta Authly, <br className="hidden sm:inline" />
                      barcha loyihalar
                    </h2>
                    <p className="text-[13.5px] sm:text-[15.5px] font-medium text-[#5B6078] leading-relaxed max-w-[520px] mt-2 sm:mt-3">
                      Meetly yagona Authly ekotizimining bir qismi. Authly orqali bir marta roʻyxatdan oʻting va boshqa loyihalarga ham shu profil bilan kiring. Shaxsiy maʼlumotlar Authly tizimida saqlanadi.
                    </p>

                    {/* CTA Button */}
                    <div className="pt-4 sm:pt-6">
                      <button
                        type="button"
                        onClick={handleAuthlyLogin}
                        disabled={authLoading}
                        className="w-full sm:w-auto sm:min-w-[220px] h-[48px] sm:h-[54px] px-6 sm:px-8 rounded-full bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white text-[14px] sm:text-[15px] font-extrabold inline-flex items-center justify-center gap-2 shadow-lg shadow-[#3F57B3]/25 transition-all cursor-pointer hover:opacity-95 active:scale-95"
                      >
                        {authLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>Authly orqali kirish</span>
                            <ExternalLink size={15} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Reveal>

                {/* Right Authly Login Mockup Card */}
                <Reveal animation="fade-left" delay={200} className="lg:col-span-5 flex justify-center w-full">
                  <div className="w-full max-w-[400px] min-h-[310px] sm:h-[340px] rounded-[18px] sm:rounded-[20px] bg-white border border-[#E2E6F2] p-4.5 sm:p-6 shadow-xl flex flex-col justify-between hover-card-lift">
                    {/* Header with Authly Logo */}
                    <div className="flex items-center gap-2.5">
                      <img src="/user1.svg" className="pointer-events-none w-5 h-5" alt="" />
                      <span className="text-[14px] sm:text-[15px] font-['Unbounded',sans-serif] font-extrabold text-[#1A1D2E]">
                        Authly
                      </span>
                    </div>

                    <div className="space-y-1 my-2.5 sm:my-0">
                      <h4 className="text-[19px] sm:text-[23px] font-extrabold text-[#1A1D2E] leading-tight">
                        Tizimga kirish
                      </h4>
                      <p className="text-[12.5px] sm:text-[13.5px] font-medium text-[#5B6078]">
                        Davom etish uchun kirish usulini tanlang
                      </p>
                    </div>

                    {/* Telegram Button */}
                    <button
                      type="button"
                      onClick={handleAuthlyLogin}
                      disabled={authLoading}
                      className="w-full h-[46px] sm:h-[50px] rounded-[14px] bg-[#229ED9] hover:bg-[#1E8EC4] text-white text-[13.5px] sm:text-[14.5px] font-extrabold flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      {authLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <FaTelegramPlane size={16} />
                          <span>Telegram orqali kirish</span>
                        </>
                      )}
                    </button>

                    {/* Divider Line */}
                    <div className="flex items-center gap-2.5 my-1.5 sm:my-0">
                      <div className="flex-1 h-[1px] bg-[#EEF1F7]"></div>
                      <span className="text-[11px] sm:text-[11.5px] font-bold text-[#8F95A8]">yoki</span>
                      <div className="flex-1 h-[1px] bg-[#EEF1F7]"></div>
                    </div>

                    {/* Google Button */}
                    <button
                      type="button"
                      onClick={handleAuthlyLogin}
                      disabled={authLoading}
                      className="w-full h-[46px] sm:h-[50px] rounded-[14px] bg-white border border-[#E2E6F2] hover:bg-[#F8FAFC] text-[#1A1D2E] text-[13.5px] sm:text-[14.5px] font-extrabold flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                    >
                      {authLoading ? (
                        <div className="w-5 h-5 border-2 border-[#1A1D2E] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <img src="/G.svg" className="pointer-events-none w-4 h-4" alt="" />
                          <span>Google orqali davom etish</span>
                        </>
                      )}
                    </button>
                  </div>
                </Reveal>
              </div>
            </Reveal>
          </section>

          {/* ================= SAVOLLAR (FAQ) SECTION ================= */}
          <section id="savollar" className="py-12 sm:py-16 md:py-20 pt-6 sm:pt-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
              {/* Left Header */}
              <Reveal animation="fade-right" className="lg:col-span-4 space-y-3 sm:space-y-4">
                <div>
                  <span className="text-[11.5px] sm:text-[13px] font-extrabold text-[#3F57B3] tracking-wider uppercase block mb-1 sm:mb-2">
                    SAVOLLAR
                  </span>
                  <h2 className="text-[24px] xs:text-[28px] sm:text-[32px] md:text-[36px] font-['Unbounded',sans-serif] font-medium text-[#1A1D2E] tracking-tight leading-tight">
                    Koʻp beriladigan <br className="hidden sm:inline" />
                    savollar
                  </h2>
                  <p className="text-[13.5px] sm:text-[15.5px] font-medium text-[#5B6078] leading-relaxed max-w-[340px] mt-2 sm:mt-3">
                    Javob topilmadimi? Meetly jamoasiga yozing.
                  </p>
                </div>
              </Reveal>

              {/* Right FAQ Items List */}
              <div className="lg:col-span-8 space-y-2.5 sm:space-y-3.5">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <Reveal key={idx} animation="fade-left" delay={idx * 70}>
                      <div
                        className={`w-full rounded-[15px] sm:rounded-[18px] bg-white border transition-all duration-300 overflow-hidden ${
                          isOpen
                            ? "p-4 sm:p-5 md:p-6 shadow-md border-[#3F57B3]/40 ring-1 ring-[#3F57B3]/10"
                            : "p-3.5 sm:p-4.5 md:p-5 border-[#E2E6F2] hover:border-[#3F57B3]/30 hover:shadow-2xs"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                          className="w-full flex items-center justify-between gap-2.5 sm:gap-4 text-left font-extrabold text-[13.5px] xs:text-[14.5px] sm:text-[16px] text-[#1A1D2E] hover:text-[#3F57B3] transition-colors cursor-pointer group"
                        >
                          <span className={`pr-1 sm:pr-2 transition-colors duration-200 ${isOpen ? "text-[#3F57B3]" : "text-[#1A1D2E]"}`}>
                            {faq.q}
                          </span>
                          <div
                            className={`w-6.5 h-6.5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                              isOpen
                                ? "bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white rotate-180 shadow-xs"
                                : "bg-[#F1F3F9] text-[#1A1D2E] group-hover:bg-[#EEF2FF] group-hover:text-[#3F57B3]"
                            }`}
                          >
                            {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                          </div>
                        </button>

                        {/* Smooth Expanding/Collapsing Accordion Body */}
                        <div
                          className={`grid transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
                            isOpen
                              ? "grid-rows-[1fr] opacity-100 mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-[#F1F3F9]"
                              : "grid-rows-[0fr] opacity-0 mt-0 pt-0 border-t-0"
                          }`}
                        >
                          <div className="overflow-hidden min-h-0">
                            <p className="text-[13px] sm:text-[14.5px] md:text-[15px] font-medium text-[#5B6078] leading-relaxed">
                              {faq.a}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ================= CTA BANNER ================= */}
          <section className="py-8 sm:py-10">
            <Reveal animation="zoom-in-up">
              <div className="w-full min-h-[240px] sm:min-h-[280px] rounded-[20px] sm:rounded-[26px] md:rounded-[28px] bg-[linear-gradient(148deg,#5272F0_10%,#3F57B3_83.61%)] p-5 sm:p-8 md:p-12 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8 hover-card-lift">
                {/* Decorative Figma Ellipses */}
                <div className="absolute -right-50 -top-40 w-[520px] h-[520px] rounded-full border-[50px] border-white/10 pointer-events-none animate-ambient-glow"></div>
                <div className="absolute -left-17 -bottom-40 w-[300px] h-[300px] rounded-full border-[40px] border-white/10 pointer-events-none animate-ambient-glow" style={{ animationDelay: "2.5s" }}></div>

                <div className="space-y-2 sm:space-y-3 max-w-[700px] relative z-10 text-center md:text-left">
                  <h2 className="text-[22px] xs:text-[26px] sm:text-[32px] md:text-[38px] font-['Unbounded',sans-serif] font-medium text-white tracking-tight leading-tight">
                    Birinchi yigʻilishingizni <br className="hidden sm:inline" />
                    bugun oʻtkazing
                  </h2>
                  <p className="text-[13.5px] sm:text-[16px] md:text-[17px] font-medium text-[#E4E9FF]">
                    Authly orqali kiring, yigʻilish yarating va havolani ulashing.
                  </p>
                </div>

                {/* White Button */}
                <button
                  type="button"
                  onClick={handleAuthlyLogin}
                  disabled={authLoading}
                  className="w-full md:w-auto md:min-w-[250px] h-[48px] sm:h-[54px] md:h-[56px] px-6 sm:px-8 rounded-full bg-white text-[#3F57B3] hover:bg-[#F8FAFC] active:scale-[0.98] text-[14px] sm:text-[15px] font-extrabold inline-flex items-center justify-center gap-2.5 shadow-xl shrink-0 relative z-10 transition-all cursor-pointer"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-[#3F57B3] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Authly orqali boshlash</span>
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </div>
            </Reveal>
          </section>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <Reveal animation="fade-up">
        <footer className="bg-white px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-[120px] border-t border-[#EEF1F7] py-6 sm:py-10 font-['Manrope',sans-serif]">
          <div className="max-w-[1360px] mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 pb-2">
              {/* Logo */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <img src="/logo2.svg" className="pointer-events-none w-8 h-8 sm:w-10 sm:h-10" alt="" />
                <div className="flex flex-col text-center md:text-left">
                  <span className="text-[17px] sm:text-[19px] font-['Unbounded',sans-serif] font-extrabold text-[#0D1117] leading-none">
                    Meetly
                  </span>
                  <span className="text-[12px] sm:text-[13.5px] font-bold text-[#5B6078] mt-0.5">
                    Xavfsiz video aloqa platformasi
                  </span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-7 text-[13px] sm:text-[14px] font-extrabold text-[#1A1D2E]">
                <button
                  onClick={() => scrollToSection("imkoniyatlar")}
                  className="hover:text-[#3F57B3] transition-colors cursor-pointer"
                >
                  Imkoniyatlar
                </button>
                <button
                  onClick={() => scrollToSection("qanday-ishlaydi")}
                  className="hover:text-[#3F57B3] transition-colors cursor-pointer"
                >
                  Qanday ishlaydi
                </button>
                <button
                  onClick={() => scrollToSection("statistika")}
                  className="hover:text-[#3F57B3] transition-colors cursor-pointer"
                >
                  Statistika
                </button>
                <button
                  onClick={() => scrollToSection("savollar")}
                  className="hover:text-[#3F57B3] transition-colors cursor-pointer"
                >
                  Savollar
                </button>
              </div>
            </div>

            {/* Divider Line */}
            <div className="w-full h-[1px] bg-[#EEF1F7] my-4 sm:my-5"></div>

            {/* Bottom Copyright & Link */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-[12px] sm:text-[13px] text-[#8F95A8] font-medium text-center sm:text-left">
              <span>© {new Date().getFullYear()} Meetly. Barcha huquqlar himoyalangan.</span>
              <button
                type="button"
                onClick={handleAuthlyLogin}
                className="text-[#3F57B3] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Authly orqali yagona kirish</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </footer>
      </Reveal>
    </>
  );
};

export default LeandingPage;