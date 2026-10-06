import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  FilterVerticalIcon,
  Cancel01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { CustomSelect, DatePicker } from "../../components/UI";
import { Check, Loader2 } from "lucide-react";
import { getMeetings, getMeetingCounts } from "../../services/meetingsApi";
import { getUsers } from "../../services/usersApi";

const MeetingsPage = () => {
  const navigate = useNavigate();

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

  // State
  const [meetings, setMeetings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "ongoing" | "scheduled" | "completed"
  const [search, setSearch] = useState("");
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    ongoing: 0,
    scheduled: 0,
    completed: 0,
  });

  // Modals
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Filter form state
  const [filterOrganizer, setFilterOrganizer] = useState("Barchasi");
  const [filterCreatedFrom, setFilterCreatedFrom] = useState("");
  const [filterCreatedTo, setFilterCreatedTo] = useState("");
  const [filterStartFrom, setFilterStartFrom] = useState("");
  const [filterStartTo, setFilterStartTo] = useState("");

  // Applied filters (active state)
  const [appliedFilters, setAppliedFilters] = useState({
    organizer: "Barchasi",
    createdFrom: "",
    createdTo: "",
    startFrom: "",
    startTo: "",
  });

  // Fetch users if is_staff is true
  useEffect(() => {
    if (isStaff) {
      getUsers({ page_size: 100 })
        .then((res) => {
          setUsersList(res.results || []);
        })
        .catch((err) => {
          console.error("Foydalanuvchilarni yuklashda xatolik:", err);
        });
    }
  }, [isStaff]);

  // Organizer options (uses user id as value)
  const organizerOptions = useMemo(() => {
    if (!isStaff) return [];
    return [
      { value: "Barchasi", label: "Tashkilotchini tanlang" },
      ...usersList.map((u) => {
        const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim();
        const display = fullName || u.email || u.phone_number || "Foydalanuvchi";
        return {
          value: u.id,
          label: display,
        };
      }),
    ];
  }, [isStaff, usersList]);

  const formatDateForApi = (dateStr, type = "start") => {
    if (!dateStr) return undefined;
    const parts = dateStr.split(".");
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const dt = new Date(y, m, d);
      if (type === "end") {
        dt.setHours(23, 59, 59, 999);
      } else {
        dt.setHours(0, 0, 0, 0);
      }
      return dt.toISOString();
    }
    return dateStr;
  };

  // Fetch tab counts from API (/api/v1/meetings/counts/)
  const fetchCounts = useCallback(async () => {
    try {
      const res = await getMeetingCounts();
      const countsData = res?.data || res;
      if (countsData && typeof countsData === "object") {
        setTabCounts({
          all: Number(countsData.all ?? 0),
          ongoing: Number(countsData.ongoing ?? 0),
          scheduled: Number(countsData.scheduled ?? 0),
          completed: Number(countsData.completed ?? 0),
        });
      }
    } catch (err) {
      console.error("Yig'ilishlar sonini yuklashda xatolik:", err);
    }
  }, []);

  // Fetch meetings from API with 100% backend filtering
  const fetchMeetingsData = useCallback(
    async (tabStatus = activeTab, filters = appliedFilters, searchVal = search) => {
      try {
        setLoading(true);
        setError(null);

        const params = {};
        if (tabStatus && tabStatus !== "all") {
          params.status = tabStatus;
        }

        if (searchVal && searchVal.trim()) {
          params.search = searchVal.trim();
        }

        // If is_staff and organizer selected, send organizer ID
        if (isStaff && filters.organizer && filters.organizer !== "Barchasi") {
          params.organizer = filters.organizer;
        }

        if (filters.startFrom) {
          params.start_date_from = formatDateForApi(filters.startFrom, "start");
        }
        if (filters.startTo) {
          params.start_date_to = formatDateForApi(filters.startTo, "end");
        }

        if (filters.createdFrom) {
          params.created_at_from = formatDateForApi(filters.createdFrom, "start");
        }
        if (filters.createdTo) {
          params.created_at_to = formatDateForApi(filters.createdTo, "end");
        }

        const [res] = await Promise.all([
          getMeetings(params),
          fetchCounts(),
        ]);
        const results = res.results || [];
        setMeetings(results);
      } catch (err) {
        console.error("Yig'ilishlarni yuklashda xatolik:", err);
        setError("Yig'ilishlarni yuklab bo'lmadi");
      } finally {
        setLoading(false);
      }
    },
    [activeTab, appliedFilters, search, isStaff, fetchCounts]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMeetingsData(activeTab, appliedFilters, search);
    }, 250);
    return () => clearTimeout(timer);
  }, [activeTab, appliedFilters, search, fetchMeetingsData]);

  // Tab counts (fallback to tabCounts or computed)
  const counts = useMemo(() => {
    return tabCounts;
  }, [tabCounts]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (isStaff && appliedFilters.organizer && appliedFilters.organizer !== "Barchasi") count++;
    if (appliedFilters.createdFrom || appliedFilters.createdTo) count++;
    if (appliedFilters.startFrom || appliedFilters.startTo) count++;
    return count;
  }, [appliedFilters, isStaff]);

  // Helper date formatters
  const formatDisplayDate = (isoStr) => {
    if (!isoStr) return "—";
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      return `${day}.${month}.${year} ${hours}:${mins}`;
    } catch {
      return isoStr;
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    const nextFilters = {
      organizer: isStaff ? filterOrganizer : "Barchasi",
      createdFrom: filterCreatedFrom,
      createdTo: filterCreatedTo,
      startFrom: filterStartFrom,
      startTo: filterStartTo,
    };
    setAppliedFilters(nextFilters);
    setFilterModalOpen(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilterOrganizer("Barchasi");
    setFilterCreatedFrom("");
    setFilterCreatedTo("");
    setFilterStartFrom("");
    setFilterStartTo("");
    const resetFilters = {
      organizer: "Barchasi",
      createdFrom: "",
      createdTo: "",
      startFrom: "",
      startTo: "",
    };
    setAppliedFilters(resetFilters);
    setFilterModalOpen(false);
  };

  // Listen for newly created meeting from global CreateMeetingModal
  useEffect(() => {
    const handleCreated = () => {
      fetchMeetingsData(activeTab, appliedFilters);
    };
    window.addEventListener("meeting-created", handleCreated);
    return () => window.removeEventListener("meeting-created", handleCreated);
  }, [fetchMeetingsData, activeTab, appliedFilters]);

  // Status badge styling
  const renderStatusBadge = (status) => {
    const st = (status || "").toLowerCase();
    if (st === "completed" || st === "o'tkazilgan" || st === "oʻtkazilgan") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] bg-[#F1F3F9] dark:bg-[#1C2438] border border-transparent dark:border-[#2B3553]/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
          <span>O'tkazilgan</span>
        </span>
      );
    }
    if (st === "ongoing" || st === "active" || st === "joriy") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] bg-[#F1F3F9] dark:bg-[#1C2438] border border-transparent dark:border-[#2B3553]/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
          <span>Joriy</span>
        </span>
      );
    }
    if (st === "cancelled" || st === "bekor qilingan") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] bg-[#F1F3F9] dark:bg-[#1C2438] border border-transparent dark:border-[#2B3553]/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]"></span>
          <span>Bekor qilingan</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] bg-[#F1F3F9] dark:bg-[#1C2438] border border-transparent dark:border-[#2B3553]/60">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span>
        <span>Rejalashtirilgan</span>
      </span>
    );
  };

  return (
    <div className="p-5 py-4.5 space-y-4 font-['Manrope',sans-serif]">
      {/* Top Filter and Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: Status Tabs Pill */}
        <div className="inline-flex items-center p-1 bg-[#F1F3F9] dark:bg-[#121624] border border-transparent dark:border-[#2B3553] rounded-xl gap-1 select-none">
          {[
            { id: "all", label: "Barchasi", count: counts.all },
            { id: "ongoing", label: "Joriy", count: counts.ongoing, isRed: true },
            { id: "scheduled", label: "Rejalashtirilgan", count: counts.scheduled },
            { id: "completed", label: "O’tkazilgan", count: counts.completed },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${isActive
                    ? "bg-white dark:bg-[#1C2438] text-[#1A1D2E] dark:text-white shadow-2xs font-semibold"
                    : "text-[#5B6078] dark:text-[#94A3B8] hover:text-[#1A1D2E] dark:hover:text-white"
                  }`}
              >
                <span className="leading-tight">{tab.label}</span>
                <span
                  className={`min-w-[20px] h-[18px] px-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-medium leading-none transition-colors ${tab.isRed && !isActive
                    ? "bg-[#F8D7DA]! dark:bg-[#EF4444]/20! text-[#DC2626] dark:text-[#F87171]"
                      : tab.isRed
                        ? "bg-[#EF4444] text-white font-bold"
                        : isActive
                          ? "bg-[#F1F3F9] dark:bg-[#121624] text-[#1A1D2E] dark:text-white"
                          : "bg-white dark:bg-[#1C2438] text-[#8B90A5] dark:text-[#94A3B8]"
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Filter Button (First) then Search Input (Second) */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Filter Modal Trigger Button */}
          <button
            type="button"
            onClick={() => setFilterModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 h-9 rounded-xl border text-[13px] font-semibold transition-all cursor-pointer ${activeFilterCount > 0
                ? "bg-[#EEF2FF] dark:bg-[#3858C7]/20 border-[#4763E4]/30 dark:border-[#3858C7] text-[#3858C7] dark:text-[#7F95E6]"
                : "bg-[#F1F3F9] dark:bg-[#1C2438] border-[#E2E6F2] dark:border-[#2B3553] text-[#5B6078] dark:text-[#94A3B8] hover:text-[#1A1D2E] dark:hover:text-white hover:bg-[#E8ECF6] dark:hover:bg-[#232E47]"
              }`}
          >
            <HugeiconsIcon icon={FilterVerticalIcon} size={16} />
            <span>
              Filtrlash{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={14}
              className={`transition-transform duration-200 text-[#8B90A5] dark:text-[#94A3B8] ${filterModalOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Search Input */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8B90A5] dark:text-[#64748B]">
              <HugeiconsIcon icon={Search01Icon} size={18} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nomi bo'yicha izlash"
              className="w-full bg-[#F8F9FC] dark:bg-[#121624] border border-[#E2E6F2] dark:border-[#2B3553] rounded-xl pl-10 pr-4 h-9 text-[13.5px] text-[#1A1D2E] dark:text-white placeholder-[#8B90A5] dark:placeholder-[#64748B] focus:outline-none focus:border-[#3858C7] focus:bg-white dark:focus:bg-[#121624] focus:ring-2 focus:ring-[#3858C7]/10 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-sm rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchMeetingsData}
            className="text-xs font-bold underline cursor-pointer hover:text-red-900 dark:hover:text-red-200"
          >
            Qayta urinish
          </button>
        </div>
      )}

      {/* Meetings Table */}
      <div className="overflow-auto h-[calc(100vh-160px)]">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[#E2E6F2] dark:border-[#2B3553] text-[#8B90A5] dark:text-[#94A3B8] text-[13px] font-medium">
              <th className="py-3 px-4 font-normal w-[52px] text-center">№</th>
              <th className="py-3 px-4 font-normal w-[26%]">Nomi</th>
              <th className="py-3 px-4 font-normal w-[18%]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  <span>Tashkilotchi</span>
                </div>
              </th>
              <th className="py-3 px-4 font-normal w-[14%]">Yaratilgan sana</th>
              <th className="py-3 px-4 font-normal w-[14%]">Boshlanish vaqti</th>
              <th className="py-3 px-4 font-normal w-[12%]">Davomiyligi</th>
              <th className="py-3 px-4 font-normal w-[16%] text-right pr-6">Holati</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6F2]/60 dark:divide-[#2B3553]/60 text-[13.5px]">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-20 text-center text-[#8B90A5] dark:text-[#64748B]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-[#3858C7] animate-spin" />
                    <span>Yig'ilishlar yuklanmoqda...</span>
                  </div>
                </td>
              </tr>
            ) : meetings.length > 0 ? (
              meetings.map((meeting, index) => {
                const title = meeting.title || meeting.name || "Nomsiz yig'ilish";
                const orgName = meeting.organizer_info
                  ? `${meeting.organizer_info.first_name || ""} ${meeting.organizer_info.last_name || ""
                    }`.trim()
                  : meeting.organizer || "";
                const createdAt = formatDisplayDate(
                  meeting.created_at || meeting.createdAt
                );
                const startTime = formatDisplayDate(
                  meeting.start_date || meeting.startTime
                );
                const duration = meeting.duration
                  ? `${meeting.duration} daqiqa`
                  : "";

                return (
                  <tr
                    key={meeting.id}
                    onClick={() => navigate(`/meetings/${meeting.id}`)}
                    className="hover:bg-[#F8F9FC] dark:hover:bg-[#161C2E] transition-colors group cursor-pointer"
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 text-center text-[#8B90A5] dark:text-[#64748B] font-medium text-[13px]">
                      {index + 1}
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 truncate">
                      <span className="font-semibold text-[#1A1D2E] dark:text-white group-hover:text-[#3858C7] dark:group-hover:text-[#7F95E6] transition-colors line-clamp-1">
                        {title}
                      </span>
                    </td>

                    {/* Organizer */}
                    <td className="py-3.5 px-4 text-[#1A1D2E] dark:text-slate-300 truncate">
                      {orgName}
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-[#1A1D2E] dark:text-slate-300 whitespace-nowrap">
                      {createdAt}
                    </td>

                    {/* Start Time */}
                    <td className="py-3.5 px-4 text-[#1A1D2E] dark:text-slate-300 whitespace-nowrap">
                      {startTime}
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 text-[#1A1D2E] dark:text-slate-300 whitespace-nowrap">
                      {duration}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                      {renderStatusBadge(meeting.status)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="py-16 text-center text-[#8B90A5] dark:text-[#64748B] text-[13.5px]"
                >
                  Yig'ilishlar topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL: FILTRLASH ================= */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#161C2E] rounded-3xl shadow-2xl border border-[#E2E6F2] dark:border-[#2B3553] w-full max-w-[600px] overflow-visible p-6 space-y-5 animate-in zoom-in-95 duration-150 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1A1D2E] dark:text-white tracking-tight">
                Filtrlash
              </h3>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="p-1 rounded-lg text-[#8B90A5] hover:text-[#1A1D2E] dark:hover:text-white hover:bg-[#F1F3F9] dark:hover:bg-[#232E47] transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
            </div>

            {/* Filter Fields */}
            <div className="space-y-4">
              {/* Organizer (Only visible if user is_staff) */}
              {isStaff && (
                <div className="relative z-30">
                  <label className="block text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] mb-1.5">
                    Tashkilotchi
                  </label>
                  <CustomSelect
                    value={filterOrganizer}
                    onChange={setFilterOrganizer}
                    options={organizerOptions}
                    placeholder="Tashkilotchini tanlang"
                    searchPlaceholder="Tashkilotchi izlash..."
                    className="h-11!"
                    containerClassName="relative z-30"
                    menuClassName="z-50 shadow-2xl"
                  />
                </div>
              )}

              {/* Created Date Range */}
              <div>
                <label className="block text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] mb-1.5">
                  Yaratilgan sana
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <DatePicker
                    value={filterCreatedFrom}
                    onChange={(d) => {
                      if (!d) setFilterCreatedFrom("");
                      else {
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        setFilterCreatedFrom(`${day}.${month}.${year}`);
                      }
                    }}
                    placeholder="dan (01.01.2026)"
                  />
                  <DatePicker
                    value={filterCreatedTo}
                    onChange={(d) => {
                      if (!d) setFilterCreatedTo("");
                      else {
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        setFilterCreatedTo(`${day}.${month}.${year}`);
                      }
                    }}
                    placeholder="gacha (01.01.2026)"
                  />
                </div>
              </div>

              {/* Start Date Range */}
              <div>
                <label className="block text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] mb-1.5">
                  Boshlanish sanasi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <DatePicker
                    value={filterStartFrom}
                    onChange={(d) => {
                      if (!d) setFilterStartFrom("");
                      else {
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        setFilterStartFrom(`${day}.${month}.${year}`);
                      }
                    }}
                    placeholder="dan (01.01.2026)"
                  />
                  <DatePicker
                    value={filterStartTo}
                    onChange={(d) => {
                      if (!d) setFilterStartTo("");
                      else {
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        setFilterStartTo(`${day}.${month}.${year}`);
                      }
                    }}
                    placeholder="gacha (01.01.2026)"
                  />
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t border-[#E2E6F2]/60 dark:border-[#2B3553]/60">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3.5 py-3 rounded-xl text-[13.5px] font-semibold text-[#1A1D2E] dark:text-white hover:bg-[#F1F3F9] dark:hover:bg-[#232E47] transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-[#1A1D2E] dark:text-white" />
                <span>Tozalash</span>
              </button>

              <button
                type="button"
                onClick={handleApplyFilters}
                className="flex items-center gap-2 bg-[#3858C7] hover:bg-[#2F4BB8] text-white text-[13.5px] font-semibold px-5 py-3 rounded-xl transition-all shadow-xs active:scale-[0.98] cursor-pointer"
              >
                <Check strokeWidth={2.5} size={18} />
                <span>Qo'llash</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsPage;