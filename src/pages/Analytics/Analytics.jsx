import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { FaArrowRightLong } from "react-icons/fa6";
import { getDashboardStats } from "../../services/reportsApi";

const PERIOD_OPTIONS = [
  { id: "today", label: "Bugun" },
  { id: "7days", label: "7 kun" },
  { id: "30days", label: "30 kun" },
  { id: "year", label: "Yil" },
];

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30 kun");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Sana oraliqlarini hisoblash (start_date, end_date)
  const getDateRangeForPeriod = useCallback((periodLabel) => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    let start = new Date(now);

    switch (periodLabel) {
      case "Bugun":
        start.setHours(0, 0, 0, 0);
        break;
      case "7 kun":
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        break;
      case "30 kun":
        start.setDate(now.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        break;
      case "Yil":
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        break;
      default:
        start.setDate(now.getDate() - 29);
        start.setHours(0, 0, 0, 0);
    }

    return {
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    };
  }, []);

  // API orqali ma'lumotlarni yuklab olish
  const fetchDashboard = useCallback(async (periodLabel) => {
    try {
      setLoading(true);
      setError(null);
      const { start_date, end_date } = getDateRangeForPeriod(periodLabel);
      const res = await getDashboardStats({ start_date, end_date });
      setDashboardData(res);
    } catch (err) {
      console.error("Dashboard yuklashda xatolik:", err);
      setError("Statistika ma'lumotlarini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [getDateRangeForPeriod]);

  useEffect(() => {
    fetchDashboard(selectedPeriod);
  }, [selectedPeriod, fetchDashboard]);

  // Mini sparkline bar generator
  const renderMiniBars = (sparklineData = []) => {
    if (!sparklineData || sparklineData.length === 0) {
      return (
        <div className="flex items-end gap-1 h-10 self-end">
          {[20, 30, 25, 35, 40, 30, 45, 50].map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className="w-1.5 rounded-full bg-[#E2E6F2]"
            />
          ))}
        </div>
      );
    }

    const counts = sparklineData.map((item) =>
      typeof item === "number" ? item : item.count ?? 0
    );
    const maxVal = Math.max(...counts, 1);
    const heights = counts.map((c) =>
      c === 0 ? 12 : Math.max(12, Math.round((c / maxVal) * 100))
    );

    return (
      <div className="flex items-end gap-1 h-10 self-end">
        {heights.map((h, i) => {
          const isHighlighted = i >= heights.length - 2;
          const rawItem = sparklineData[i];
          const tooltip = rawItem?.date
            ? `${rawItem.date}: ${counts[i]}`
            : undefined;

          return (
            <div
              key={i}
              title={tooltip}
              style={{ height: `${h}%` }}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                isHighlighted ? "bg-[#3858C7]" : "bg-[#B7C7F3]"
              }`}
            />
          );
        })}
      </div>
    );
  };

  // Dinamika grafigi uchun silliq Bezier egri chizig'ini hisoblash
  const dynamicsCurve = useMemo(() => {
    const weeks = dashboardData?.dynamics?.weeks || [];
    if (weeks.length === 0) {
      return {
        linePath: "M 0 180 L 600 180",
        areaPath: "M 0 180 L 600 180 L 600 195 L 0 195 Z",
        lastPoint: { x: 585, y: 180, count: 0 },
        labels: [],
      };
    }

    const counts = weeks.map((w) => w.count ?? 0);
    const maxVal = Math.max(...counts, 1);
    const width = 600;
    const baseHeight = 185;
    const topPadding = 30;
    const usableHeight = baseHeight - topPadding;

    const points = weeks.map((w, idx) => {
      const x = (idx / (weeks.length - 1 || 1)) * (width - 30) + 15;
      const count = w.count ?? 0;
      const y = baseHeight - (count / maxVal) * usableHeight;
      return { x, y, count, label: w.week_label };
    });

    if (points.length === 1) {
      const p = points[0];
      return {
        linePath: `M 0 ${p.y} L 600 ${p.y}`,
        areaPath: `M 0 ${p.y} L 600 ${p.y} L 600 195 L 0 195 Z`,
        lastPoint: p,
        labels: [p.label],
      };
    }

    let linePath = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 5;
      const cp1y = p1.y + (p2.y - p0.y) / 5;
      const cp2x = p2.x - (p3.x - p1.x) / 5;
      const cp2y = p2.y - (p3.y - p1.y) / 5;

      linePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(
        1
      )} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const last = points[points.length - 1];
    const first = points[0];
    const areaPath = `${linePath} L ${last.x.toFixed(1)} 195 L ${first.x.toFixed(
      1
    )} 195 Z`;

    return {
      linePath,
      areaPath,
      lastPoint: last,
      labels: points.map((p) => p.label),
    };
  }, [dashboardData]);

  // Holat bo'yicha (Donut chart) hisob-kitoblari
  const statusChartData = useMemo(() => {
    const statusObj = dashboardData?.status_breakdown;
    const total = statusObj?.total ?? 0;
    const byStatus = statusObj?.by_status || [];

    const circumference = 376.99; // 2 * PI * 60

    if (total === 0 || byStatus.length === 0) {
      return {
        total: 0,
        items: byStatus.length > 0 ? byStatus : [
          { key: "completed", label: "O'tkazilgan", count: 0, percentage: 0 },
          { key: "scheduled", label: "Rejalashtirilgan", count: 0, percentage: 0 },
          { key: "ongoing", label: "Joriy", count: 0, percentage: 0 },
          { key: "cancelled", label: "Bekor qilingan", count: 0, percentage: 0 },
        ],
        slices: [],
      };
    }

    let currentOffset = 0;
    const slices = byStatus.map((st) => {
      const pct = (st.count ?? 0) / total;
      const dashLength = pct * circumference;
      const color =
        st.key === "completed"
          ? "#10B981"
          : st.key === "scheduled"
          ? "#3858C7"
          : st.key === "ongoing"
          ? "#F97316"
          : "#98A2B3";

      const slice = {
        key: st.key,
        color,
        strokeDasharray: `${dashLength.toFixed(1)} ${circumference.toFixed(1)}`,
        strokeDashoffset: -currentOffset,
      };

      currentOffset += dashLength;
      return slice;
    });

    return { total, items: byStatus, slices };
  }, [dashboardData]);

  // Hafta kunlari qatnashishi
  const weekdayAttendance = useMemo(() => {
    const items = dashboardData?.weekday_attendance;
    if (items && Array.isArray(items) && items.length > 0) {
      const maxRate = Math.max(...items.map((i) => i.rate ?? 0));
      return items.map((item) => ({
        day: item.day_key || item.day_name?.slice(0, 3) || "",
        fullName: item.day_name || "",
        value: item.rate ?? 0,
        isPeak: maxRate > 0 && item.rate === maxRate,
      }));
    }

    // Default fallback
    return [
      { day: "Du", fullName: "Dushanba", value: 0, isPeak: false },
      { day: "Se", fullName: "Seshanba", value: 0, isPeak: false },
      { day: "Cho", fullName: "Chorshanba", value: 0, isPeak: false },
      { day: "Pa", fullName: "Payshanba", value: 0, isPeak: false },
      { day: "Ju", fullName: "Juma", value: 0, isPeak: false },
      { day: "Sha", fullName: "Shanba", value: 0, isPeak: false },
    ];
  }, [dashboardData]);

  // Faol tashkilotchilar
  const topOrganizers = useMemo(() => {
    const list = dashboardData?.top_organizers;
    if (list && Array.isArray(list) && list.length > 0) {
      const maxCount = Math.max(...list.map((o) => o.count ?? o.meetings_count ?? 1), 1);
      const colors = ["#3858C7", "#5C78DE", "#8CA2EC", "#B7C7F3", "#D1DCF9"];

      return list.map((org, index) => {
        const name =
          org.name ||
          org.full_name ||
          org.user_name ||
          org.organizer ||
          "Noma'lum";
        const count = org.count ?? org.meetings_count ?? 0;
        const percentage = org.percentage ?? Math.round((count / maxCount) * 100);
        const color = colors[index % colors.length];
        return { name, count, percentage, color };
      });
    }
    return [];
  }, [dashboardData]);

  // Bugungi yig'ilishlar
  const todayMeetings = useMemo(() => {
    return dashboardData?.today_meetings || [];
  }, [dashboardData]);

  // Format Helper: Status badge
  const renderMeetingStatusBadge = (status, statusDisplay) => {
    const st = (status || "").toLowerCase();
    if (st === "completed" || st === "o'tkazilgan") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
          {statusDisplay || "O'tkazilgan"}
        </span>
      );
    }
    if (st === "ongoing" || st === "joriy") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#F97316] bg-[#FFF7ED] px-2 py-0.5 rounded-full whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
          {statusDisplay || "Joriy"}
        </span>
      );
    }
    if (st === "scheduled" || st === "rejalashtirilgan") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#3858C7] bg-[#EEF2FB] px-2 py-0.5 rounded-full whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3858C7]"></span>
          {statusDisplay || "Rejalashtirilgan"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]"></span>
        {statusDisplay || "Bekor qilingan"}
      </span>
    );
  };

  // Card ma'lumotlari
  const cards = dashboardData?.cards;
  const usersCard = cards?.users;
  const totalMeetingsCard = cards?.total_meetings;
  const currentMeetingsCard = cards?.current_meetings;
  const avgAttendanceCard = cards?.avg_attendance_rate;

  // Header Subtitle sanasi
  const formattedSubtitle = useMemo(() => {
    const period = dashboardData?.period;
    if (period?.start_date && period?.end_date) {
      const endD = new Date(period.end_date);
      const months = [
        "yanvar", "fevral", "mart", "aprel", "may", "iyun",
        "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"
      ];
      const dateStr = `${endD.getDate()}-${months[endD.getMonth()]}, ${endD.getFullYear()}`;
      return `${dateStr} | Tanlangan davr: ${selectedPeriod}`;
    }
    const today = new Date();
    const months = [
      "yanvar", "fevral", "mart", "aprel", "may", "iyun",
      "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"
    ];
    return `${today.getDate()}-${months[today.getMonth()]}, ${today.getFullYear()} | Oxirgi 30 kun`;
  }, [dashboardData, selectedPeriod]);

  return (
    <div className="p-6 py-5 font-['Manrope',sans-serif] min-h-screen">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-[22px] md:text-[24px] font-bold text-[#1A1D2E] flex items-center gap-2.5">
            <span>Dashboard</span>
            {loading && (
              <Loader2 className="w-4 h-4 text-[#3858C7] animate-spin" />
            )}
          </h1>
          <p className="text-[12.5px] text-[#8B90A5] mt-0.5">
            {formattedSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented Period Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#F4F6FB] border border-[#E2E6F2]">
            {PERIOD_OPTIONS.map((p) => {
              const isActive = selectedPeriod === p.label;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPeriod(p.label)}
                  className={`px-3.5 py-1.5 text-[12.5px] font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-white text-[#1A1D2E] shadow-sm font-extrabold"
                      : "text-[#5E6480] hover:text-[#1A1D2E]"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* New Meeting Button */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-create-meeting-modal"))}
            className="inline-flex items-center gap-2 bg-[#3858C7] hover:bg-[#2C48B0] active:scale-[0.98] text-white font-bold text-[13px] h-9 px-4 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus size={16} strokeWidth={3.5} />
            <span>Yangi yigʻilish</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchDashboard(selectedPeriod)}
            className="text-xs font-bold underline cursor-pointer hover:text-red-900"
          >
            Qayta urinish
          </button>
        </div>
      )}

      {/* 4 KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Card 1: Foydalanuvchilar */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold text-[#8B90A5] tracking-wider uppercase block">
              FOYDALANUVCHILAR
            </span>
            <div className="text-[26px] font-extrabold text-[#1A1D2E] my-1 tracking-tight">
              {usersCard?.current !== undefined
                ? Number(usersCard.current).toLocaleString("uz-UZ")
                : "—"}
            </div>
            {usersCard?.change_percentage !== undefined && (
              <div
                className={`inline-flex items-center gap-1 text-[11.5px] font-bold px-2 py-0.5 rounded-lg ${
                  usersCard.change_percentage >= 0
                    ? "text-[#10B981] bg-[#ECFDF5]"
                    : "text-[#EF4444] bg-[#FEF2F2]"
                }`}
              >
                <span>{usersCard.change_percentage >= 0 ? "↑" : "↓"}</span>
                <span>
                  {usersCard.change_percentage >= 0 ? "+" : ""}
                  {usersCard.change_percentage}%
                </span>
              </div>
            )}
          </div>
          {renderMiniBars(usersCard?.sparkline)}
        </div>

        {/* Card 2: Jami yig'ilishlar */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold text-[#8B90A5] tracking-wider uppercase block">
              JAMI YIG'ILISHLAR
            </span>
            <div className="text-[26px] font-extrabold text-[#1A1D2E] my-1 tracking-tight">
              {totalMeetingsCard?.current !== undefined
                ? Number(totalMeetingsCard.current).toLocaleString("uz-UZ")
                : "—"}
            </div>
            {totalMeetingsCard?.change_percentage !== undefined && (
              <div
                className={`inline-flex items-center gap-1 text-[11.5px] font-bold px-2 py-0.5 rounded-lg ${
                  totalMeetingsCard.change_percentage >= 0
                    ? "text-[#10B981] bg-[#ECFDF5]"
                    : "text-[#EF4444] bg-[#FEF2F2]"
                }`}
              >
                <span>{totalMeetingsCard.change_percentage >= 0 ? "↑" : "↓"}</span>
                <span>
                  {totalMeetingsCard.change_percentage >= 0 ? "+" : ""}
                  {totalMeetingsCard.change_percentage}%
                </span>
              </div>
            )}
          </div>
          {renderMiniBars(totalMeetingsCard?.sparkline)}
        </div>

        {/* Card 3: Joriy yig'ilishlar */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold text-[#8B90A5] tracking-wider uppercase block">
              JORIY YIGʻILISHLAR
            </span>
            <div className="text-[26px] font-extrabold text-[#1A1D2E] my-1 tracking-tight">
              {currentMeetingsCard?.count !== undefined
                ? Number(currentMeetingsCard.count).toLocaleString("uz-UZ")
                : "—"}
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#F97316] bg-[#FFF7ED] px-2 py-0.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
              <span>Hozir o'tmoqda</span>
            </div>
          </div>
          {renderMiniBars(currentMeetingsCard?.sparkline)}
        </div>

        {/* Card 4: O'rtacha qatnashish */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold text-[#8B90A5] tracking-wider uppercase block">
              O'RTACHA QATNASHISH
            </span>
            <div className="text-[26px] font-extrabold text-[#1A1D2E] my-1 tracking-tight">
              {avgAttendanceCard?.current !== undefined
                ? `${avgAttendanceCard.current}%`
                : "—"}
            </div>
            {avgAttendanceCard?.change_percentage !== undefined && (
              <div
                className={`inline-flex items-center gap-1 text-[11.5px] font-bold px-2 py-0.5 rounded-lg ${
                  avgAttendanceCard.change_percentage >= 0
                    ? "text-[#10B981] bg-[#ECFDF5]"
                    : "text-[#EF4444] bg-[#FEF2F2]"
                }`}
              >
                <span>{avgAttendanceCard.change_percentage >= 0 ? "↑" : "↓"}</span>
                <span>
                  {avgAttendanceCard.change_percentage >= 0 ? "+" : ""}
                  {avgAttendanceCard.change_percentage}%
                </span>
              </div>
            )}
          </div>
          {renderMiniBars(avgAttendanceCard?.sparkline)}
        </div>
      </div>

      {/* Middle Section: Dynamics Area Chart & Status Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Left: Meeting Dynamics 12 Weeks (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#E2E6F2] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11.5px] font-bold text-[#8B90A5] tracking-wider uppercase">
              YIG'ILISHLAR DINAMIKASI, {dashboardData?.dynamics?.weeks?.length || 12} HAFTA
            </span>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#5E6480]">
              <span className="w-2 h-2 rounded-full bg-[#3858C7]"></span>
              <span>O'tkazilgan yig'ilishlar</span>
            </div>
          </div>

          {/* Smooth Area Curve SVG with Tooltip */}
          <div className="relative w-full h-56 pt-2">
            <svg
              viewBox="0 0 600 200"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3858C7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3858C7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Horizontal Lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="#F1F3F9" strokeWidth="1" />
              <line x1="0" y1="65" x2="600" y2="65" stroke="#F1F3F9" strokeWidth="1" />
              <line x1="0" y1="110" x2="600" y2="110" stroke="#F1F3F9" strokeWidth="1" />
              <line x1="0" y1="155" x2="600" y2="155" stroke="#F1F3F9" strokeWidth="1" />
              <line x1="0" y1="195" x2="600" y2="195" stroke="#E2E6F2" strokeWidth="1" />

              {/* Area Fill */}
              <path
                d={dynamicsCurve.areaPath}
                fill="url(#curveGradient)"
                className="transition-all duration-500"
              />

              {/* Smooth Stroke Line */}
              <path
                d={dynamicsCurve.linePath}
                fill="none"
                stroke="#3858C7"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-500"
              />

              {/* Active Point at the end */}
              <circle
                cx={dynamicsCurve.lastPoint.x}
                cy={dynamicsCurve.lastPoint.y}
                r="4.5"
                fill="#3858C7"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="transition-all duration-500"
              />
            </svg>

            {/* Custom Tooltip on Active Point */}
            <div className="absolute right-4 top-2 bg-[#1A1D2E] text-white text-[11.5px] font-semibold px-2.5 py-1 rounded-lg shadow-lg pointer-events-none">
              {dashboardData?.dynamics?.current_week_count ??
                dynamicsCurve.lastPoint.count ??
                0}{" "}
              ta, shu hafta
            </div>
          </div>

          {/* X Axis Labels */}
          <div className="flex items-center justify-between text-[11px] text-[#8B90A5] mt-3 px-1 overflow-x-auto">
            {dynamicsCurve.labels.length > 0 ? (
              dynamicsCurve.labels
                .filter((_, idx, arr) => {
                  if (arr.length <= 6) return true;
                  return (
                    idx === 0 ||
                    idx === Math.floor(arr.length * 0.2) ||
                    idx === Math.floor(arr.length * 0.4) ||
                    idx === Math.floor(arr.length * 0.6) ||
                    idx === Math.floor(arr.length * 0.8) ||
                    idx === arr.length - 1
                  );
                })
                .map((lbl, i) => <span key={i}>{lbl}</span>)
            ) : (
              <>
                <span>1-hafta</span>
                <span>3-hafta</span>
                <span>5-hafta</span>
                <span>7-hafta</span>
                <span>9-hafta</span>
                <span>12-hafta</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Status Donut Chart (1 col) */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <span className="text-[11.5px] font-bold text-[#8B90A5] tracking-wider uppercase mb-3">
            HOLAT BO'YICHA
          </span>

          {/* Donut Chart */}
          <div className="relative flex items-center justify-center py-2">
            <svg viewBox="0 0 160 160" className="w-36 h-36">
              {/* Background empty track if total is 0 */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#F1F3F9"
                strokeWidth="18"
              />

              {/* Dynamic Slices */}
              {statusChartData.slices.map((slice) => (
                <circle
                  key={slice.key}
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth="18"
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-500"
                />
              ))}
            </svg>

            {/* Centered Total Count */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[24px] font-extrabold text-[#1A1D2E] leading-none">
                {statusChartData.total.toLocaleString("uz-UZ")}
              </span>
              <span className="text-[10px] font-bold text-[#8B90A5] tracking-wider mt-0.5">
                JAMI
              </span>
            </div>
          </div>

          {/* Status Breakdown Legend */}
          <div className="space-y-2 mt-3 pt-3 border-t border-[#F1F3F9]">
            {statusChartData.items.map((st) => {
              const color =
                st.key === "completed"
                  ? "bg-[#10B981]"
                  : st.key === "scheduled"
                  ? "bg-[#3858C7]"
                  : st.key === "ongoing"
                  ? "bg-[#F97316]"
                  : "bg-[#98A2B3]";

              return (
                <div
                  key={st.key}
                  className="flex items-center justify-between text-[12.5px]"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
                    <span className="text-[#5E6480]">{st.label}</span>
                  </div>
                  <div className="font-semibold text-[#1A1D2E]">
                    {st.count ?? 0}{" "}
                    <span className="text-[#8B90A5] font-normal text-[11px] ml-1.5">
                      {st.percentage ?? 0}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Col 1: Bugungi yig'ilishlar */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11.5px] font-bold text-[#8B90A5] tracking-wider uppercase">
              BUGUNGI YIG'ILISHLAR
            </span>
            <Link
              to="/meetings"
              className="flex items-center gap-1 text-[12px] font-bold text-[#3858C7] hover:text-[#2844A8] transition-colors"
            >
              Barchasi <FaArrowRightLong size={12} />
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {todayMeetings.length === 0 ? (
              <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center p-4 text-[#8B90A5]">
                <p className="text-[13px] font-medium">
                  Bugun rejalashtirilgan yig'ilishlar yo'q
                </p>
              </div>
            ) : (
              todayMeetings.slice(0, 5).map((m, idx) => {
                const time =
                  m.time ||
                  (m.start_time
                    ? new Date(m.start_time).toLocaleTimeString("uz-UZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—");
                const title = m.title || m.name || "Nomsiz yig'ilish";
                const organizer =
                  m.organizer_name ||
                  m.organizer?.full_name ||
                  m.organizer?.name ||
                  (typeof m.organizer === "string" ? m.organizer : "Tashkilotchi");

                return (
                  <div
                    key={m.id || idx}
                    className={`flex items-center justify-between py-1.5 ${
                      idx < todayMeetings.length - 1 ? "border-b border-[#F8FAFC]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 pr-2">
                      <span className="text-[12.5px] font-bold text-[#1A1D2E] min-w-[42px] shrink-0">
                        {time}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-[13px] font-bold text-[#1A1D2E] leading-tight truncate">
                          {title}
                        </h4>
                        <p className="text-[11.5px] text-[#8B90A5] mt-0.5 truncate">
                          {organizer}
                        </p>
                      </div>
                    </div>
                    {renderMeetingStatusBadge(m.status, m.status_display)}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Col 2: Qatnashish, hafta kunlari */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 px-6 shadow-2xs flex flex-col">
          <span className="text-[11.5px] font-bold text-[#8B90A5] tracking-wider uppercase mb-4">
            QATNASHISH, HAFTA KUNLARI
          </span>

          <div className="flex-1 flex items-end justify-between gap-2 pb-1 min-h-[180px]">
            {weekdayAttendance.map((item) => (
              <div
                key={item.day}
                className="w-[35px] h-full flex flex-col items-center justify-end gap-1.5"
                title={`${item.fullName}: ${item.value}%`}
              >
                <span
                  className={`text-[11px] font-bold ${
                    item.isPeak ? "text-[#3858C7]" : "text-[#1A1D2E]"
                  }`}
                >
                  {item.value}%
                </span>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      item.isPeak ? "bg-[#3858C7] shadow-xs" : "bg-[#B7C7F3]"
                    }`}
                    style={{
                      height: `${Math.max(item.value, item.value === 0 ? 6 : item.value)}%`,
                    }}
                  />
                </div>
                <span
                  className={`text-[11px] ${
                    item.isPeak
                      ? "font-bold text-[#3858C7]"
                      : "font-semibold text-[#8B90A5]"
                  }`}
                >
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: Faol tashkilotchilar */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 shadow-2xs flex flex-col justify-start">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11.5px] font-bold text-[#8B90A5] tracking-wider uppercase">
              FAOL TASHKILOTCHILAR
            </span>
            <Link
              to="/reports/organizers"
              className="flex items-center gap-1 text-[12px] font-bold text-[#3858C7] hover:text-[#2844A8] transition-colors"
            >
              Barchasi <FaArrowRightLong size={12} />
            </Link>
          </div>

          <div className="space-y-3.5 flex-1">
            {topOrganizers.length === 0 ? (
              <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center p-4 text-[#8B90A5]">
                <p className="text-[13px] font-medium">
                  Faol tashkilotchilar mavjud emas
                </p>
              </div>
            ) : (
              topOrganizers.slice(0, 5).map((org, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-[12.5px] font-semibold text-[#1A1D2E] mb-1">
                    <span className="truncate pr-2">{org.name}</span>
                    <span className="shrink-0">{org.count} ta</span>
                  </div>
                  <div className="w-full bg-[#F1F3F9] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(org.percentage, 4)}%`,
                        backgroundColor: org.color,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;