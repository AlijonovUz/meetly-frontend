import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Calendar, ChevronDown, X, Loader2 } from "lucide-react";
import { FaArrowRightLong } from "react-icons/fa6";
import { getDashboardStats } from "../../services/reportsApi";
import { DatePicker } from "../../components/UI";
import dayjs from "dayjs";

const PERIOD_OPTIONS = [
  { id: "today", label: "Bugun" },
  { id: "7days", label: "7 kun" },
  { id: "30days", label: "30 kun" },
  { id: "year", label: "Yil" },
];

const Analytics = () => {
  // Current user info to check is_staff
  const reduxUser = useSelector((state) => state.references?.currentUser);
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "{}");
    } catch {
      return {};
    }
  }, []);
  const currentUser = reduxUser || storedUser;
  const isStaff = Boolean(currentUser?.is_staff);

  const [selectedPeriod, setSelectedPeriod] = useState("30 kun");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isCustomRangeActive, setIsCustomRangeActive] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const datePickerRef = useRef(null);
  const todayStr = dayjs().format("YYYY-MM-DD");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Close datePicker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        if (
          e.target.closest &&
          (e.target.closest("[data-radix-popper-content-wrapper]") ||
            e.target.closest('[role="dialog"]'))
        ) {
          return;
        }
        setDatePickerOpen(false);
      }
    };
    if (datePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [datePickerOpen]);

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
  const fetchDashboard = useCallback(async (periodLabel, customRange = null) => {
    try {
      setLoading(true);
      setError(null);
      let start_date, end_date;
      if (customRange?.start_date || customRange?.end_date) {
        start_date = customRange.start_date;
        end_date = customRange.end_date;
      } else {
        const range = getDateRangeForPeriod(periodLabel);
        start_date = range.start_date;
        end_date = range.end_date;
      }
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
  }, []);

  const handleApplyCustomDate = () => {
    if (!customStartDate && !customEndDate) return;
    const today = dayjs().endOf("day");

    let startObj = customStartDate ? dayjs(customStartDate).startOf("day") : dayjs(customEndDate).startOf("day");
    let endObj = customEndDate ? dayjs(customEndDate).endOf("day") : dayjs(customStartDate).endOf("day");

    if (startObj.isAfter(today)) startObj = today.startOf("day");
    if (endObj.isAfter(today)) endObj = today;
    if (endObj.isBefore(startObj)) endObj = startObj.endOf("day");

    const customRange = {
      start_date: startObj.toISOString(),
      end_date: endObj.toISOString(),
    };

    const label = customStartDate && customEndDate && customStartDate !== customEndDate
      ? `${dayjs(customStartDate).format("DD.MM.YYYY")} - ${dayjs(customEndDate).format("DD.MM.YYYY")}`
      : `${dayjs(customStartDate || customEndDate).format("DD.MM.YYYY")}`;

    setIsCustomRangeActive(true);
    setSelectedPeriod(label);
    fetchDashboard(label, customRange);
    setDatePickerOpen(false);
  };

  const handleResetCustomDate = () => {
    setCustomStartDate("");
    setCustomEndDate("");
    setIsCustomRangeActive(false);
    setSelectedPeriod("30 kun");
    fetchDashboard("30 kun", null);
    setDatePickerOpen(false);
  };

  const handleSelectPresetPeriod = (label) => {
    setIsCustomRangeActive(false);
    setCustomStartDate("");
    setCustomEndDate("");
    setSelectedPeriod(label);
    fetchDashboard(label, null);
  };

  // Mini sparkline bar generator
  const renderMiniBars = (sparklineData = []) => {
    if (!sparklineData || sparklineData.length === 0) {
      return (
        <div className="flex items-end gap-1 h-10 self-end">
          {[20, 30, 25, 35, 40, 30, 45, 50].map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className="w-1.5 rounded-full bg-[#E2E6F2] dark:bg-[#232E47]"
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
                isHighlighted ? "bg-[#3858C7] dark:bg-[#4D6FE8]" : "bg-[#B7C7F3] dark:bg-[#232E47]"
              }`}
            />
          );
        })}
      </div>
    );
  };

  // ================= INTERACTIVE DYNAMICS CHART CALCULATIONS =================
  const [activeWeekIndex, setActiveWeekIndex] = useState(null);
  const [isHoveringDynamics, setIsHoveringDynamics] = useState(false);
  const dynamicsContainerRef = useRef(null);

  const dynamicsWeeks = useMemo(() => {
    const weeks = dashboardData?.dynamics?.weeks;
    if (weeks && Array.isArray(weeks) && weeks.length > 0) {
      return weeks.map((w, idx) => {
        const count = w.count ?? 0;
        const prevCount = idx > 0 ? (weeks[idx - 1].count ?? 0) : count;
        const diff = count - prevCount;
        const growthStr = prevCount > 0 
          ? `${diff >= 0 ? "+" : ""}${((diff / prevCount) * 100).toFixed(1)}%` 
          : diff > 0 ? `+${diff}` : "+0%";

        return {
          week: idx + 1,
          shortLabel: `${idx + 1}`,
          label: w.week_label || `${idx + 1}-h`,
          fullLabel: w.week_label || `${idx + 1}-hafta`,
          date: w.date_range || w.date || (w.start_date && w.end_date ? `${dayjs(w.start_date).format("D MMM")} - ${dayjs(w.end_date).format("D MMM")}` : ""),
          count,
          growth: w.growth || growthStr,
          isCurrent: idx === weeks.length - 1,
        };
      });
    }

    // Default 12 weeks fallback if empty
    return [
      { week: 1, shortLabel: "1", label: "1-h", fullLabel: "1-hafta", date: "1-hafta", count: 0, growth: "+0%" },
      { week: 2, shortLabel: "2", label: "2-h", fullLabel: "2-hafta", date: "2-hafta", count: 0, growth: "+0%" },
      { week: 3, shortLabel: "3", label: "3-h", fullLabel: "3-hafta", date: "3-hafta", count: 0, growth: "+0%" },
      { week: 4, shortLabel: "4", label: "4-h", fullLabel: "4-hafta", date: "4-hafta", count: 0, growth: "+0%" },
      { week: 5, shortLabel: "5", label: "5-h", fullLabel: "5-hafta", date: "5-hafta", count: 0, growth: "+0%" },
      { week: 6, shortLabel: "6", label: "6-h", fullLabel: "6-hafta", date: "6-hafta", count: 0, growth: "+0%" },
      { week: 7, shortLabel: "7", label: "7-h", fullLabel: "7-hafta", date: "7-hafta", count: 0, growth: "+0%" },
      { week: 8, shortLabel: "8", label: "8-h", fullLabel: "8-hafta", date: "8-hafta", count: 0, growth: "+0%" },
      { week: 9, shortLabel: "9", label: "9-h", fullLabel: "9-hafta", date: "9-hafta", count: 0, growth: "+0%" },
      { week: 10, shortLabel: "10", label: "10-h", fullLabel: "10-hafta", date: "10-hafta", count: 0, growth: "+0%" },
      { week: 11, shortLabel: "11", label: "11-h", fullLabel: "11-hafta", date: "11-hafta", count: 0, growth: "+0%" },
      { week: 12, shortLabel: "12", label: "12-h", fullLabel: "12-hafta", date: "12-hafta", count: 0, growth: "+0%", isCurrent: true },
    ];
  }, [dashboardData]);

  const dynamicsPoints = useMemo(() => {
    const list = dynamicsWeeks;
    const counts = list.map((d) => d.count);
    const maxVal = Math.max(...counts, 4);
    const minVal = 0;
    const width = 596;
    const startX = 24;
    const usableW = width - 48;
    const topY = 24;
    const bottomY = 170;
    const usableH = bottomY - topY;

    return list.map((d, i) => {
      const x = startX + (i / Math.max(list.length - 1, 1)) * usableW;
      const y = bottomY - ((d.count - minVal) / (maxVal - minVal || 1)) * usableH;
      return { ...d, x, y };
    });
  }, [dynamicsWeeks]);

  const currentActiveWeekIndex = activeWeekIndex !== null && activeWeekIndex < dynamicsPoints.length
    ? activeWeekIndex
    : dynamicsPoints.length - 1;
  const activeDynamicsData = dynamicsPoints[currentActiveWeekIndex] || dynamicsPoints[0];

  const dynamicsPathD = useMemo(() => {
    if (dynamicsPoints.length === 0) return "";
    if (dynamicsPoints.length === 1) return `M 0 ${dynamicsPoints[0].y} L 596 ${dynamicsPoints[0].y}`;
    return dynamicsPoints.reduce((acc, p, i, arr) => {
      if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      const prev = arr[i - 1];
      const cx1 = prev.x + (p.x - prev.x) / 2;
      const cx2 = cx1;
      return `${acc} C ${cx1.toFixed(1)} ${prev.y.toFixed(1)}, ${cx2.toFixed(1)} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }, "");
  }, [dynamicsPoints]);

  const dynamicsAreaD = useMemo(() => {
    if (!dynamicsPathD || dynamicsPoints.length === 0) return "";
    const last = dynamicsPoints[dynamicsPoints.length - 1];
    const first = dynamicsPoints[0];
    return `${dynamicsPathD} L ${last.x.toFixed(1)} 195 L ${first.x.toFixed(1)} 195 Z`;
  }, [dynamicsPathD, dynamicsPoints]);

  const handleDynamicsMouseMove = (e) => {
    if (!dynamicsContainerRef.current || dynamicsPoints.length === 0) return;
    setIsHoveringDynamics(true);
    const rect = dynamicsContainerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const width = rect.width;
    const ratio = Math.max(0, Math.min(1, (relativeX - 16) / (width - 32)));
    const index = Math.round(ratio * (dynamicsPoints.length - 1));
    if (index >= 0 && index < dynamicsPoints.length) {
      setActiveWeekIndex(index);
    }
  };

  // ================= INTERACTIVE DONUT CHART CALCULATIONS =================
  const [hoveredStatusIndex, setHoveredStatusIndex] = useState(null);

  const statusChartData = useMemo(() => {
    const statusObj = dashboardData?.status_breakdown || dashboardData?.user_status_breakdown;
    const total = statusObj?.total ?? (Array.isArray(statusObj?.by_status) ? statusObj.by_status.reduce((acc, curr) => acc + (curr.count || 0), 0) : 0);
    const rawByStatus = statusObj?.by_status || (Array.isArray(statusObj) ? statusObj : []);

    const defaultItems = [
      { id: "completed", key: "completed", label: "Oʻtkazilgan", count: 0, color: "#26C281" },
      { id: "scheduled", key: "scheduled", label: "Rejalashtirilgan", count: 0, color: "#4361EE" },
      { id: "ongoing", key: "ongoing", label: "Joriy", count: 0, color: "#F59E0B" },
      { id: "cancelled", key: "cancelled", label: "Bekor qilingan", count: 0, color: "#8D99AE" },
    ];

    const items = rawByStatus.length > 0 ? rawByStatus.map((st) => {
      const key = st.key || st.status || "other";
      const color =
        st.color ||
        (key === "completed" || key === "attended" || key === "qatnashdim" || key === "o'tkazilgan"
          ? "#26C281"
          : key === "scheduled" || key === "rejalashtirilgan"
          ? "#4361EE"
          : key === "ongoing" || key === "late" || key === "kechikdim" || key === "joriy"
          ? "#F59E0B"
          : "#8D99AE");
      const count = st.count ?? 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : (st.percentage ?? 0);
      return {
        id: key,
        key,
        label: st.label || key,
        count,
        percent: `${percentage}%`,
        percentage,
        color,
      };
    }) : defaultItems.map((item) => ({ ...item, percent: "0%", percentage: 0 }));

    const circumference = 226.2; // 2 * PI * 36
    let currentOffset = 0;

    const slices = items.map((item) => {
      const ratio = total > 0 ? item.count / total : 0;
      const dashLength = ratio * circumference;
      const dashArray = `${dashLength.toFixed(1)} ${circumference.toFixed(1)}`;
      const dashOffset = (-currentOffset).toFixed(1);
      currentOffset += dashLength;
      return {
        ...item,
        dashArray,
        dashOffset,
      };
    });

    return { total, items: slices };
  }, [dashboardData]);

  const activeStatusItem = hoveredStatusIndex !== null ? statusChartData.items[hoveredStatusIndex] : null;

  // ================= INTERACTIVE WEEKLY ATTENDANCE CALCULATIONS =================
  const [hoveredDayIndex, setHoveredDayIndex] = useState(null);

  const weekdayAttendance = useMemo(() => {
    const items = dashboardData?.weekday_attendance;
    if (items && Array.isArray(items) && items.length > 0) {
      const maxRate = Math.max(...items.map((i) => i.rate ?? 0));
      return items.map((item) => ({
        day: item.day_key || item.day_name?.slice(0, 3) || "",
        fullName: item.day_name || "",
        value: item.rate ?? 0,
        count: item.count ?? item.attendees_count ?? 0,
        isPeak: maxRate > 0 && item.rate === maxRate,
      }));
    }

    // Default 6 days
    return [
      { day: "Du", fullName: "Dushanba", value: 0, count: 0, isPeak: false },
      { day: "Se", fullName: "Seshanba", value: 0, count: 0, isPeak: false },
      { day: "Cho", fullName: "Chorshanba", value: 0, count: 0, isPeak: false },
      { day: "Pa", fullName: "Payshanba", value: 0, count: 0, isPeak: false },
      { day: "Ju", fullName: "Juma", value: 0, count: 0, isPeak: false },
      { day: "Sha", fullName: "Shanba", value: 0, count: 0, isPeak: false },
    ];
  }, [dashboardData]);

  const activeWeekday = hoveredDayIndex !== null ? weekdayAttendance[hoveredDayIndex] : null;

  // Faol tashkilotchilar (Staff)
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
        const count = org.count ?? org.meeting_count ?? 0;
        const percentage = org.percentage ?? Math.round((count / maxCount) * 100);
        const color = colors[index % colors.length];
        return { name, count, percentage, color };
      });
    }
    return [];
  }, [dashboardData]);

  // Imzolarim (User)
  const userSignatures = useMemo(() => {
    return dashboardData?.signatures || dashboardData?.my_signatures || dashboardData?.pending_signatures || [];
  }, [dashboardData]);

  // Bugungi majlislar
  const todayMeetings = useMemo(() => {
    return dashboardData?.today_meetings || [];
  }, [dashboardData]);

  // Format Helper: Status badge
  const renderMeetingStatusBadge = (status, statusDisplay) => {
    const st = (status || "").toLowerCase();
    if (st === "completed" || st === "o'tkazilgan" || st === "oʻtkazilgan") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#10B981] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#10B981]/15 px-2.5 py-1 rounded-full whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
          {statusDisplay || "Oʻtkazilgan"}
        </span>
      );
    }
    if (st === "ongoing" || st === "joriy") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#F97316] dark:text-[#FB923C] bg-[#FFF7ED] dark:bg-[#F97316]/15 px-2.5 py-1 rounded-full whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
          {statusDisplay || "Joriy"}
        </span>
      );
    }
    if (st === "scheduled" || st === "rejalashtirilgan") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#3858C7] dark:text-[#7F95E6] bg-[#EEF2FB] dark:bg-[#3858C7]/20 px-2.5 py-1 rounded-full whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3858C7]"></span>
          {statusDisplay || "Rejalashtirilgan"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#1C2438] px-2.5 py-1 rounded-full whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]"></span>
        {statusDisplay || "Bekor qilingan"}
      </span>
    );
  };

  // Card ma'lumotlari (Staff vs Non-Staff)
  const cards = isStaff ? dashboardData?.cards : (dashboardData?.user_cards || dashboardData?.cards);
  const card1 = isStaff ? cards?.users : (cards?.attended_meetings || cards?.users);
  const card2 = isStaff ? cards?.total_meetings : (cards?.attendance_rate || cards?.total_meetings);
  const card3 = isStaff ? cards?.current_meetings : (cards?.pending_signatures || cards?.current_meetings);
  const card4 = isStaff ? cards?.avg_attendance_rate : (cards?.time_spent || cards?.avg_attendance_rate);

  // Header Subtitle sanasi
  const formattedSubtitle = useMemo(() => {
    const period = dashboardData?.period;
    const months = [
      "yanvar", "fevral", "mart", "aprel", "may", "iyun",
      "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"
    ];

    if (period?.start_date && period?.end_date) {
      const endD = new Date(period.end_date);
      const dateStr = `${endD.getDate()}-${months[endD.getMonth()]}, ${endD.getFullYear()}`;
      if (!isStaff) {
        return `${dateStr} | Oxirgi ${selectedPeriod}, o'zgarish oldingi ${selectedPeriod}ga nisbatan`;
      }
      return `${dateStr} | Tanlangan davr: ${selectedPeriod}`;
    }

    const today = new Date();
    const dateStr = `${today.getDate()}-${months[today.getMonth()]}, ${today.getFullYear()}`;
    if (!isStaff) {
      return `${dateStr} | Oxirgi 30 kun, o'zgarish oldingi 30 kunga nisbatan`;
    }
    return `${dateStr} | Oxirgi 30 kun`;
  }, [dashboardData, selectedPeriod, isStaff]);

  return (
    <div className="p-4 sm:p-6 py-5 font-['Manrope',sans-serif]">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          {!isStaff && (
            <div className="text-[12px] font-semibold text-[#8B90A5] dark:text-[#94A3B8] mb-0.5">
              Dashboard
            </div>
          )}
          <h1 className="text-[22px] md:text-[24px] font-bold text-[#1A1D2E] dark:text-white flex items-center gap-2.5">
            <span>{isStaff ? "Dashboard" : "Mening statistikam"}</span>
            {loading && (
              <Loader2 className="w-4 h-4 text-[#3858C7] animate-spin" />
            )}
          </h1>
          <p className="text-[12.5px] text-[#8B90A5] dark:text-[#94A3B8] mt-0.5">
            {formattedSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented Period Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#F4F6FB] dark:bg-[#121624] border border-[#E2E6F2] dark:border-[#2B3553]">
            {PERIOD_OPTIONS.map((p) => {
              const isActive = !isCustomRangeActive && selectedPeriod === p.label;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPresetPeriod(p.label)}
                  className={`px-3 sm:px-3.5 py-1.5 text-[12px] sm:text-[12.5px] font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-white dark:bg-[#1C2438] text-[#1A1D2E] dark:text-white shadow-sm font-extrabold"
                      : "text-[#5E6480] dark:text-[#94A3B8] hover:text-[#1A1D2E] dark:hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Custom Date Range Filter Dropdown */}
          <div className="relative" ref={datePickerRef}>
            <button
              type="button"
              onClick={() => setDatePickerOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-[12.5px] font-bold transition-all shadow-xs cursor-pointer shrink-0 border ${
                isCustomRangeActive
                  ? "bg-[#3858C7] text-white border-[#3858C7] shadow-sm"
                  : "bg-white dark:bg-[#161C2E] border-[#E2E6F2] dark:border-[#2B3553] text-[#1A1D2E] dark:text-[#E2E8F0] hover:bg-[#F8FAFC] dark:hover:bg-[#1C2438]"
              }`}
            >
              <Calendar size={15} className={isCustomRangeActive ? "text-white" : "text-[#5E6480] dark:text-[#94A3B8]"} />
              <span>{isCustomRangeActive ? selectedPeriod : "Sana bo'yicha"}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${datePickerOpen ? "rotate-180" : ""} ${
                  isCustomRangeActive ? "text-white" : "text-[#5E6480] dark:text-[#94A3B8]"
                }`}
              />
            </button>

            {/* Date Range Popover */}
            {datePickerOpen && (
              <div className="absolute right-0 top-full mt-2 w-[310px] sm:w-[330px] p-4 rounded-2xl bg-white dark:bg-[#161C2E] border border-[#E2E6F2] dark:border-[#2B3553] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 font-['Manrope',sans-serif]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F1F3F9] dark:border-[#1E263C]">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#3858C7] dark:text-[#4D6FE8]" />
                    <span className="text-[13px] font-bold text-[#1A1D2E] dark:text-white">
                      Sana bo'yicha filtrlash
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDatePickerOpen(false)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[#8B90A5] hover:text-[#1A1D2E] dark:hover:text-white hover:bg-[#F1F3F9] dark:hover:bg-[#1C2438] cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5B6078] dark:text-[#94A3B8] mb-1">
                      Boshlanish sanasi
                    </label>
                    <DatePicker
                      value={customStartDate}
                      onChange={(d) => setCustomStartDate(d ? dayjs(d).format("YYYY-MM-DD") : "")}
                      maxDate={customEndDate ? new Date(customEndDate) : new Date()}
                      placeholder="KK.OO.YYYY"
                      inputClassName="h-9 px-3 text-[12.5px] rounded-xl bg-[#F8FAFC] dark:bg-[#121624] border-[#E2E6F2] dark:border-[#2B3553]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5B6078] dark:text-[#94A3B8] mb-1">
                      Tugash sanasi
                    </label>
                    <DatePicker
                      value={customEndDate}
                      onChange={(d) => setCustomEndDate(d ? dayjs(d).format("YYYY-MM-DD") : "")}
                      maxDate={new Date()}
                      minDate={customStartDate ? new Date(customStartDate) : undefined}
                      placeholder="KK.OO.YYYY"
                      inputClassName="h-9 px-3 text-[12.5px] rounded-xl bg-[#F8FAFC] dark:bg-[#121624] border-[#E2E6F2] dark:border-[#2B3553]"
                    />
                  </div>

                  <p className="text-[11px] text-[#8B90A5] dark:text-[#64748B]">
                    * Faqat bugungacha bo'lgan sanalarni tanlash mumkin.
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleResetCustomDate}
                      className="flex-1 h-8.5 rounded-xl text-[12px] font-bold bg-[#F1F3F9] dark:bg-[#1C2438] text-[#5B6078] dark:text-[#94A3B8] hover:bg-[#E2E6F2] dark:hover:bg-[#232E47] transition-all cursor-pointer"
                    >
                      Tozalash
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyCustomDate}
                      disabled={!customStartDate && !customEndDate}
                      className="flex-1 h-8.5 rounded-xl text-[12px] font-bold bg-[#3858C7] hover:bg-[#2C48B0] disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-xs cursor-pointer"
                    >
                      Qo'llash
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-sm rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchDashboard(selectedPeriod)}
            className="text-xs font-bold underline cursor-pointer hover:text-red-900 dark:hover:text-red-200"
          >
            Qayta urinish
          </button>
        </div>
      )}

      {/* 4 KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Card 1: Foydalanuvchilar / Qatnashgan majlislarim */}
        <div className="bg-white dark:bg-[#161C2E] border border-[#E2E6F2] dark:border-[#2B3553] hover:border-[#3858C7]/50 rounded-2xl p-5 flex items-center justify-between shadow-2xs hover-card-lift transition-all">
          <div>
            <span className="text-[11px] font-bold text-[#8B90A5] dark:text-[#94A3B8] tracking-wider uppercase block">
              {card1?.label || (isStaff ? "FOYDALANUVCHILAR" : "QATNASHGAN MAJLISLARIM")}
            </span>
            <div className="text-[26px] font-extrabold text-[#1A1D2E] dark:text-white my-1 tracking-tight">
              {card1?.current !== undefined
                ? Number(card1.current).toLocaleString("uz-UZ")
                : card1?.count !== undefined
                ? Number(card1.count).toLocaleString("uz-UZ")
                : "0"}
            </div>
            {card1?.change_percentage !== undefined ? (
              <div
                className={`inline-flex items-center gap-1 text-[11.5px] font-bold px-2 py-0.5 rounded-lg ${
                  card1.change_percentage >= 0
                    ? "text-[#10B981] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#10B981]/15"
                    : "text-[#EF4444] dark:text-[#F87171] bg-[#FEF2F2] dark:bg-[#EF4444]/15"
                }`}
              >
                <span>{card1.change_percentage >= 0 ? "↑" : "↓"}</span>
                <span>
                  {card1.change_percentage >= 0 ? "+" : ""}
                  {card1.change_percentage}%
                </span>
              </div>
            ) : card1?.change_count !== undefined ? (
              <div className="inline-flex items-center gap-1 text-[11.5px] font-bold px-2 py-0.5 rounded-lg text-[#10B981] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#10B981]/15">
                <span>↑</span>
                <span>+{card1.change_count} ta</span>
              </div>
            ) : null}
          </div>
          {renderMiniBars(card1?.sparkline)}
        </div>

        {/* Card 2: Jami majlislar / Qatnashish foizim */}
        <div className="bg-white dark:bg-[#161C2E] border border-[#E2E6F2] dark:border-[#2B3553] hover:border-[#3858C7]/50 rounded-2xl p-5 flex items-center justify-between shadow-2xs hover-card-lift transition-all">
          <div>
            <span className="text-[11px] font-bold text-[#8B90A5] dark:text-[#94A3B8] tracking-wider uppercase block">
              {card2?.label || (isStaff ? "JAMI MAJLISLAR" : "QATNASHISH FOIZIM")}
            </span>
            <div className="text-[26px] font-extrabold text-[#1A1D2E] dark:text-white my-1 tracking-tight">
              {card2?.current !== undefined
                ? isStaff
                  ? Number(card2.current).toLocaleString("uz-UZ")
                  : `${card2.current}%`
                : "0"}
            </div>
            {card2?.change_percentage !== undefined && (
              <div
                className={`inline-flex items-center gap-1 text-[11.5px] font-bold px-2 py-0.5 rounded-lg ${
                  card2.change_percentage >= 0
                    ? "text-[#10B981] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#10B981]/15"
                    : "text-[#EF4444] dark:text-[#F87171] bg-[#FEF2F2] dark:bg-[#EF4444]/15"
                }`}
              >
                <span>{card2.change_percentage >= 0 ? "↑" : "↓"}</span>
                <span>
                  {card2.change_percentage >= 0 ? "+" : ""}
                  {card2.change_percentage}%
                </span>
              </div>
            )}
          </div>
          {renderMiniBars(card2?.sparkline)}
        </div>

        {/* Card 3: Joriy majlislar / Imzo kutilmoqda */}
        <div className="bg-white dark:bg-[#161C2E] border border-[#E2E6F2] dark:border-[#2B3553] hover:border-[#3858C7]/50 rounded-2xl p-5 flex items-center justify-between shadow-2xs hover-card-lift transition-all">
          <div>
            <span className="text-[11px] font-bold text-[#8B90A5] dark:text-[#94A3B8] tracking-wider uppercase block">
              {card3?.label || (isStaff ? "JORIY MAJLISLAR" : "IMZO KUTILMOQDA")}
            </span>
            <div className="text-[26px] font-extrabold text-[#1A1D2E] dark:text-white my-1 tracking-tight">
              {card3?.count !== undefined
                ? Number(card3.count).toLocaleString("uz-UZ")
                : card3?.current !== undefined
                ? Number(card3.current).toLocaleString("uz-UZ")
                : "0"}
            </div>
            {isStaff ? (
              <div className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#F97316] dark:text-[#FB923C] bg-[#FFF7ED] dark:bg-[#F97316]/15 px-2 py-0.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
                <span>Hozir o'tmoqda</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#D97706] dark:text-[#FBBF24] bg-[#FFFBEB] dark:bg-[#F59E0B]/15 px-2.5 py-0.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                <span>Imzolash kerak</span>
              </div>
            )}
          </div>
          {renderMiniBars(card3?.sparkline)}
        </div>

        {/* Card 4: O'rtacha qatnashish / Sarflangan vaqt */}
        <div className="bg-white dark:bg-[#161C2E] border border-[#E2E6F2] dark:border-[#2B3553] hover:border-[#3858C7]/50 rounded-2xl p-5 flex items-center justify-between shadow-2xs hover-card-lift transition-all">
          <div>
            <span className="text-[11px] font-bold text-[#8B90A5] dark:text-[#94A3B8] tracking-wider uppercase block">
              {card4?.label || (isStaff ? "O'RTACHA QATNASHISH" : "SARFLANGAN VAQT")}
            </span>
            <div className="text-[26px] font-extrabold text-[#1A1D2E] dark:text-white my-1 tracking-tight">
              {card4?.current !== undefined
                ? isStaff
                  ? `${card4.current}%`
                  : typeof card4.current === "string"
                  ? card4.current
                  : `${card4.current} soat`
                : isStaff
                ? "0%"
                : "0 soat"}
            </div>
            {card4?.change_percentage !== undefined ? (
              <div
                className={`inline-flex items-center gap-1 text-[11.5px] font-bold px-2 py-0.5 rounded-lg ${
                  card4.change_percentage >= 0
                    ? "text-[#10B981] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#10B981]/15"
                    : "text-[#EF4444] dark:text-[#F87171] bg-[#FEF2F2] dark:bg-[#EF4444]/15"
                }`}
              >
                <span>{card4.change_percentage >= 0 ? "↑" : "↓"}</span>
                <span>
                  {card4.change_percentage >= 0 ? "+" : ""}
                  {card4.change_percentage}%
                </span>
              </div>
            ) : card4?.change != null ? (
              <div className="inline-flex items-center gap-1 text-[11.5px] font-bold px-2 py-0.5 rounded-lg text-[#10B981] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#10B981]/15">
                <span>↑</span>
                <span>+{card4.change} soat</span>
              </div>
            ) : null}
          </div>
          {renderMiniBars(card4?.sparkline)}
        </div>
      </div>

      {/* Middle Section: Dynamics Area Chart & Status Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Left: Meeting Dynamics 12 Weeks (2 cols) */}
        <div
          ref={dynamicsContainerRef}
          onMouseEnter={() => setIsHoveringDynamics(true)}
          onMouseMove={handleDynamicsMouseMove}
          onMouseLeave={() => {
            setIsHoveringDynamics(false);
            setActiveWeekIndex(null);
          }}
          className="lg:col-span-2 bg-white dark:bg-[#161C2E] border border-[#E2E6F2] dark:border-[#2B3553] hover:border-[#3858C7]/50 rounded-2xl p-4 sm:p-5 shadow-2xs hover-card-lift flex flex-col justify-between select-none relative group transition-all"
        >
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div>
              <span className="text-[11px] sm:text-[11.5px] font-bold text-[#8B90A5] dark:text-[#94A3B8] tracking-wider uppercase block">
                {isStaff
                  ? `MAJLISLAR DINAMIKASI, ${dynamicsWeeks.length} HAFTA`
                  : `MENING QATNASHISHIM, ${dynamicsWeeks.length} HAFTA`}
              </span>
              <div className="flex items-center gap-2.5 mt-1">
                <span className="text-[24px] sm:text-[28px] font-['Unbounded',sans-serif] font-semibold text-[#1A1D2E] dark:text-white leading-none">
                  {dashboardData?.dynamics?.total ?? dynamicsWeeks.reduce((acc, curr) => acc + curr.count, 0)}
                </span>
                <span className="h-[22px] px-2 rounded-full bg-[#E8F7F0] dark:bg-[#10B981]/15 text-[#16A34A] dark:text-[#34D399] text-[11px] font-extrabold inline-flex items-center gap-1">
                  <span>↑</span>
                  <span>{activeDynamicsData.growth}</span>
                </span>
              </div>
            </div>

            {/* Dynamic Active Week Badge */}
            <div className="h-[32px] px-3.5 rounded-xl bg-[#1A1D2E] dark:bg-[#1C2438] text-white text-[11.5px] font-extrabold flex items-center gap-2 shadow-md border dark:border-[#2B3553] transition-all">
              <span className={`w-2 h-2 rounded-full bg-[#38C98D] ${isHoveringDynamics ? "animate-ping" : ""}`}></span>
              <span>
                {isHoveringDynamics
                  ? `${activeDynamicsData.count} ta, ${activeDynamicsData.isCurrent ? "shu hafta" : activeDynamicsData.fullLabel}`
                  : `${dashboardData?.dynamics?.current_week_count ?? dynamicsWeeks[dynamicsWeeks.length - 1]?.count ?? 0} ta, shu hafta`}
              </span>
            </div>
          </div>

          {/* Smooth Area Curve SVG with Interactive Hover Tracker */}
          <div className="relative w-full h-48 sm:h-56 pt-2 cursor-crosshair">
            <svg
              viewBox="0 0 596 200"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="analyticsCurveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3858C7" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#3858C7" stopOpacity="0.01" />
                </linearGradient>
                <filter id="analyticsPointGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#3858C7" floodOpacity="0.45" />
                </filter>
              </defs>

              {/* Grid Horizontal Lines */}
              <line x1="10" y1="25" x2="586" y2="25" stroke="currentColor" className="text-[#F1F3F9] dark:text-[#1E263C]" strokeWidth="1" />
              <line x1="10" y1="65" x2="586" y2="65" stroke="currentColor" className="text-[#F1F3F9] dark:text-[#1E263C]" strokeWidth="1" />
              <line x1="10" y1="105" x2="586" y2="105" stroke="currentColor" className="text-[#F1F3F9] dark:text-[#1E263C]" strokeWidth="1" />
              <line x1="10" y1="145" x2="586" y2="145" stroke="currentColor" className="text-[#F1F3F9] dark:text-[#1E263C]" strokeWidth="1" />
              <line x1="10" y1="175" x2="586" y2="175" stroke="currentColor" className="text-[#E2E6F2] dark:text-[#2B3553]" strokeWidth="1" />

              {/* Area Fill */}
              <path
                d={dynamicsAreaD}
                fill="url(#analyticsCurveGradient)"
                className="transition-all duration-300"
              />

              {/* Smooth Stroke Line */}
              <path
                d={dynamicsPathD}
                fill="none"
                stroke="#3858C7"
                strokeWidth="3"
                strokeLinecap="round"
                className="transition-all duration-300 dark:stroke-[#4D6FE8]"
              />

              {/* Active Vertical Guideline (only when hovering) */}
              {isHoveringDynamics && (
                <line
                  x1={activeDynamicsData.x}
                  y1="16"
                  x2={activeDynamicsData.x}
                  y2="175"
                  stroke="#3858C7"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.85"
                  className="transition-all duration-150 dark:stroke-[#4D6FE8]"
                />
              )}

              {/* All Data Points (only visible when hovering card) */}
              {isHoveringDynamics && dynamicsPoints.map((p, idx) => {
                const isActive = idx === currentActiveWeekIndex;
                return (
                  <g key={idx} className="cursor-pointer" onClick={() => setActiveWeekIndex(idx)}>
                    {isActive && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="12"
                        fill="#3858C7"
                        fillOpacity="0.18"
                        className="animate-pulse"
                      />
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isActive ? "6" : "3.5"}
                      fill={isActive ? "#FFFFFF" : "#3858C7"}
                      stroke="#3858C7"
                      strokeWidth={isActive ? "3.5" : "1.5"}
                      filter={isActive ? "url(#analyticsPointGlow)" : undefined}
                      className="transition-all duration-200"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Floating Dynamic Tooltip (only when hovering) */}
            {isHoveringDynamics && (
              <div
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-full mb-2 transition-all duration-150 ease-out z-30"
                style={{
                  left: `${(activeDynamicsData.x / 596) * 100}%`,
                  top: `${(activeDynamicsData.y / 200) * 100}%`,
                }}
              >
                <div className="bg-[#1A1D2E] dark:bg-[#1C2438] text-white text-[10.5px] sm:text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-white/10 dark:border-[#2B3553] flex flex-col items-center">
                  <span className="text-[#38C98D] text-[9.5px] sm:text-[10px] font-extrabold">
                    {activeDynamicsData.fullLabel} {activeDynamicsData.date ? `(${activeDynamicsData.date})` : ""}
                  </span>
                  <span className="text-white text-[11px] sm:text-[12px] font-black">
                    {activeDynamicsData.count} ta majlis
                  </span>
                  <div className="w-2 h-2 bg-[#1A1D2E] dark:bg-[#1C2438] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-white/10 dark:border-[#2B3553]"></div>
                </div>
              </div>
            )}
          </div>

          {/* X Axis Week Buttons Grid - 100% full width, no scrollbar */}
          <div className="w-full grid grid-cols-12 gap-0.5 sm:gap-1 pt-2.5 border-t border-[#EEF1F7] dark:border-[#1E263C] text-[10px] sm:text-[11px] font-semibold text-[#8F95A8] dark:text-[#64748B] select-none">
            {dynamicsWeeks.map((d, idx) => {
              const isActive = idx === currentActiveWeekIndex;
              const isHighlight = isHoveringDynamics && isActive;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsHoveringDynamics(true);
                    setActiveWeekIndex(idx);
                  }}
                  onMouseEnter={() => {
                    setIsHoveringDynamics(true);
                    setActiveWeekIndex(idx);
                  }}
                  className={`w-full py-1 text-center rounded-md transition-all truncate cursor-pointer ${
                    isHighlight
                      ? "bg-[#3858C7] text-white font-extrabold shadow-xs"
                      : "hover:text-[#1A1D2E] dark:hover:text-white hover:bg-[#F1F3F9] dark:hover:bg-[#1C2438]"
                  }`}
                  title={`${d.fullLabel}: ${d.count} ta`}
                >
                  <span className="hidden xl:inline">{d.label}</span>
                  <span className="xl:hidden">{d.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Status Donut Chart (1 col) */}
        <div
          onMouseLeave={() => setHoveredStatusIndex(null)}
          className="bg-white dark:bg-[#161C2E] border border-[#E2E6F2] dark:border-[#2B3553] hover:border-[#3858C7]/50 rounded-2xl p-4 sm:p-5 shadow-2xs hover-card-lift flex flex-col justify-between transition-all"
        >
          <div className="flex items-center justify-between h-5 mb-2">
            <span className="text-[11px] sm:text-[11.5px] font-bold text-[#8B90A5] dark:text-[#94A3B8] tracking-wider uppercase block">
              {isStaff ? "HOLAT BO'YICHA" : "MENING MAJLISLARIM"}
            </span>
            <span
              style={{ color: activeStatusItem ? activeStatusItem.color : "#8F95A8" }}
              className="text-[11.5px] font-extrabold transition-colors duration-150"
            >
              {activeStatusItem ? `${activeStatusItem.label}: ${activeStatusItem.percent}` : "100%"}
            </span>
          </div>

          {/* Interactive Donut Chart */}
          <div className="relative flex items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 overflow-visible">
                {/* Background empty track if total is 0 */}
                {statusChartData.total === 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    className="text-[#F1F3F9] dark:text-[#1E263C]"
                    strokeWidth="13"
                  />
                )}

                {/* Base Slices */}
                {statusChartData.items.map((item, idx) => {
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
                      opacity={hoveredStatusIndex !== null && !isHovered ? 0.4 : 1}
                    />
                  );
                })}

                {/* Active Highlighted Slice rendered on top */}
                {activeStatusItem && (
                  <circle
                    key={`active-${activeStatusItem.id}`}
                    cx="50"
                    cy="50"
                    r="36"
                    fill="none"
                    stroke={activeStatusItem.color}
                    strokeWidth="15"
                    strokeDasharray={activeStatusItem.dashArray}
                    strokeDashoffset={activeStatusItem.dashOffset}
                    strokeLinecap="butt"
                    className="transition-all duration-150 cursor-pointer pointer-events-none drop-shadow-sm"
                  />
                )}
              </svg>

              {/* Centered Dynamic Total & Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-[22px] font-['Unbounded',sans-serif] font-bold text-[#1A1D2E] dark:text-white leading-none">
                  {activeStatusItem ? activeStatusItem.count : statusChartData.total.toLocaleString("uz-UZ")}
                </span>
                <span
                  style={{ color: activeStatusItem ? activeStatusItem.color : "#8F95A8" }}
                  className="text-[10px] font-extrabold tracking-wider mt-0.5"
                >
                  {activeStatusItem ? activeStatusItem.percent : "JAMI"}
                </span>
              </div>
            </div>
          </div>

          {/* Status Breakdown Legend with Hover Highlight */}
          <div className="space-y-1.5 mt-2 pt-2.5 border-t border-[#F1F3F9] dark:border-[#1E263C]">
            {statusChartData.items.map((st, idx) => {
              const isHovered = hoveredStatusIndex === idx;
              return (
                <div
                  key={st.key}
                  onMouseEnter={() => setHoveredStatusIndex(idx)}
                  className={`flex items-center justify-between py-1 px-2 rounded-xl transition-colors cursor-pointer ${
                    isHovered ? "bg-[#F1F3F9] dark:bg-[#1C2438]" : "hover:bg-[#F8FAFC] dark:hover:bg-[#1C2438]/50"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      style={{ backgroundColor: st.color }}
                      className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-150 ${
                        isHovered ? "scale-125" : ""
                      }`}
                    ></span>
                    <span className={`text-[12.5px] truncate ${isHovered ? "font-bold text-[#1A1D2E] dark:text-white" : "font-medium text-[#5E6480] dark:text-[#94A3B8]"}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="font-semibold text-[#1A1D2E] dark:text-white text-[12.5px] shrink-0">
                    {st.count ?? 0}{" "}
                    <span className="text-[#8B90A5] dark:text-[#64748B] font-normal text-[11px] ml-1">
                      {st.percent}
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
        {/* Col 1: Bugungi majlislar */}
        <div className="bg-white dark:bg-[#161C2E] border border-[#E2E6F2] dark:border-[#2B3553] hover:border-[#3858C7]/50 rounded-2xl p-5 shadow-2xs hover-card-lift flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11.5px] font-bold text-[#8B90A5] dark:text-[#94A3B8] tracking-wider uppercase">
              {isStaff ? "BUGUNGI MAJLISLAR" : "BUGUNGI MAJLISLARIM"}
            </span>
            {isStaff && (
              <Link
                to="/meetings"
                className="flex items-center gap-1 text-[12px] font-bold text-[#3858C7] dark:text-[#7F95E6] hover:text-[#2844A8] transition-colors"
              >
                Barchasi <FaArrowRightLong size={12} />
              </Link>
            )}
          </div>

          <div className="space-y-2 flex-1">
            {todayMeetings.length === 0 ? (
              <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center p-4 text-[#8B90A5] dark:text-[#64748B]">
                <p className="text-[13px] font-medium">
                  Bugun rejalashtirilgan majlislar yo'q
                </p>
              </div>
            ) : (
              todayMeetings.slice(0, 5).map((m, idx) => {
                const time = m.time || (m.start_date ? dayjs(m.start_date).format("HH:mm") : m.start_time || "—");
                const title = m.title || m.name || "Nomsiz majlis";
                const organizer =
                  m.organizer_name ||
                  m.organizer?.full_name ||
                  m.organizer?.name ||
                  (typeof m.organizer === "string" ? m.organizer : "Tashkilotchi");

                return (
                  <div
                    key={m.id || idx}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-[#1C2438] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="text-[12.5px] font-bold text-[#1A1D2E] dark:text-white min-w-[42px] shrink-0">
                        {time}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-[13px] font-bold text-[#1A1D2E] dark:text-white leading-tight truncate">
                          {title}
                        </h4>
                        <p className="text-[11.5px] text-[#8B90A5] dark:text-[#94A3B8] mt-0.5 truncate">
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
        <div
          onMouseLeave={() => setHoveredDayIndex(null)}
          className="bg-white dark:bg-[#161C2E] border border-[#E2E6F2] dark:border-[#2B3553] hover:border-[#3858C7]/50 rounded-2xl p-5 px-6 shadow-2xs hover-card-lift flex flex-col justify-between transition-all"
        >
          <div className="flex items-center justify-between h-5 mb-4">
            <span className="text-[11.5px] font-bold text-[#8B90A5] dark:text-[#94A3B8] tracking-wider uppercase block">
              {isStaff ? "QATNASHISH, HAFTA KUNLARI" : "QATNASHISHIM, HAFTA KUNLARI"}
            </span>
            <span
              className={`text-[11.5px] font-extrabold text-[#3858C7] dark:text-[#7F95E6] transition-opacity duration-150 ${
                activeWeekday ? "opacity-100" : "opacity-0"
              }`}
            >
              {activeWeekday ? `${activeWeekday.fullName}: ${activeWeekday.value}%` : ""}
            </span>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 pb-1 min-h-[180px]">
            {weekdayAttendance.map((item, idx) => {
              const isHovered = hoveredDayIndex === idx;
              return (
                <div
                  key={item.day}
                  onMouseEnter={() => setHoveredDayIndex(idx)}
                  className="flex-1 max-w-[42px] h-full flex flex-col items-center justify-end gap-1.5 cursor-pointer group"
                >
                  <span
                    className={`text-[11px] font-bold transition-colors duration-150 ${
                      isHovered ? "text-[#3858C7] dark:text-[#7F95E6]" : "text-[#1A1D2E] dark:text-white"
                    }`}
                  >
                    {item.value}%
                  </span>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-200 ${
                        isHovered
                          ? "bg-[#3858C7] shadow-md shadow-[#3858C7]/30"
                          : item.isPeak
                          ? "bg-[#3858C7]"
                          : "bg-[#B7C7F3] dark:bg-[#232E47] group-hover:bg-[#A3B8EE] dark:group-hover:bg-[#2B3553]"
                      }`}
                      style={{
                        height: `${Math.max(item.value, item.value === 0 ? 6 : item.value)}%`,
                      }}
                    />
                  </div>
                  <span
                    className={`text-[11px] transition-colors duration-150 ${
                      isHovered
                        ? "font-extrabold text-[#3858C7] dark:text-[#7F95E6]"
                        : item.isPeak
                        ? "font-bold text-[#3858C7] dark:text-[#7F95E6]"
                        : "font-semibold text-[#8B90A5] dark:text-[#64748B]"
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 3: Faol tashkilotchilar (Staff) / Imzolarim (User) */}
        {isStaff ? (
          <div className="bg-white dark:bg-[#161C2E] border border-[#E2E6F2] dark:border-[#2B3553] hover:border-[#3858C7]/50 rounded-2xl p-5 shadow-2xs hover-card-lift flex flex-col justify-start transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11.5px] font-bold text-[#8B90A5] dark:text-[#94A3B8] tracking-wider uppercase">
                FAOL TASHKILOTCHILAR
              </span>
              <Link
                to="/reports/organizers"
                className="flex items-center gap-1 text-[12px] font-bold text-[#3858C7] dark:text-[#7F95E6] hover:text-[#2844A8] transition-colors"
              >
                Barchasi <FaArrowRightLong size={12} />
              </Link>
            </div>

            <div className="space-y-3.5 flex-1">
              {topOrganizers.length === 0 ? (
                <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center p-4 text-[#8B90A5] dark:text-[#64748B]">
                  <p className="text-[13px] font-medium">
                    Faol tashkilotchilar mavjud emas
                  </p>
                </div>
              ) : (
                topOrganizers.slice(0, 5).map((org, idx) => (
                  <div key={idx} className="p-1.5 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-[#1C2438] transition-colors">
                    <div className="flex items-center justify-between text-[12.5px] font-semibold text-[#1A1D2E] dark:text-white mb-1">
                      <span className="truncate pr-2">{org.name}</span>
                      <span className="shrink-0 font-bold">{org.count} ta</span>
                    </div>
                    <div className="w-full bg-[#F1F3F9] dark:bg-[#121624] h-2 rounded-full overflow-hidden">
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
        ) : (
          <div className="bg-white dark:bg-[#161C2E] border border-[#E2E6F2] dark:border-[#2B3553] hover:border-[#3858C7]/50 rounded-2xl p-5 shadow-2xs hover-card-lift flex flex-col justify-between transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11.5px] font-bold text-[#8B90A5] dark:text-[#94A3B8] tracking-wider uppercase">
                IMZOLARIM
              </span>
              <Link
                to="/reports/signatures"
                className="flex items-center gap-1 text-[12px] font-bold text-[#3858C7] dark:text-[#7F95E6] hover:text-[#2844A8] transition-colors"
              >
                Barchasi <FaArrowRightLong size={12} />
              </Link>
            </div>

            <div className="space-y-2 flex-1">
              {userSignatures.length === 0 ? (
                <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center p-4 text-[#8B90A5] dark:text-[#64748B]">
                  <p className="text-[13px] font-medium">
                    Imzolar mavjud emas
                  </p>
                </div>
              ) : (
                userSignatures.slice(0, 5).map((sig, idx) => {
                  const title = sig.meeting?.title || sig.title || sig.name || "Nomsiz majlis";
                  const organizer =
                    sig.meeting?.organizer?.full_name ||
                    sig.meeting?.organizer?.name ||
                    sig.organizer_name ||
                    sig.meeting?.code ||
                    "";
                  const isSigned = sig.is_signed === true || sig.status === "signed" || sig.status === "imzolangan";

                  return (
                    <div
                      key={sig.id || idx}
                      className="flex items-center justify-between text-[13px] p-2 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-[#1C2438] transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-[#1A1D2E] dark:text-white truncate block leading-tight">
                          {title}
                        </span>
                        {organizer && (
                          <span className="text-[11.5px] text-[#8B90A5] dark:text-[#94A3B8] truncate block mt-0.5">
                            {organizer}
                          </span>
                        )}
                      </div>
                      <span
                        className={`font-bold text-[11.5px] px-2.5 py-0.5 rounded-full shrink-0 ${
                          !isSigned
                            ? "text-[#D97706] dark:text-[#FBBF24] bg-[#FFFBEB] dark:bg-[#F59E0B]/15"
                            : "text-[#10B981] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#10B981]/15"
                        }`}
                      >
                        {isSigned ? "Imzolangan" : "Kutilmoqda"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;