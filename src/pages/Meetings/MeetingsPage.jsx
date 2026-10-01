import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  FilterVerticalIcon,
  Cancel01Icon,
  CheckmarkSquare02Icon,
  Copy01Icon,
  Tick02Icon,
  Calendar03Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { CustomSelect, DatePicker, TimePicker } from "../../components/UI";
import {
  mockMeetingsList,
  mockOrganizers,
} from "../../data/mockData";
import { Check } from "lucide-react";

const MeetingsPage = () => {
  const navigate = useNavigate();

  // State
  const [meetings, setMeetings] = useState(mockMeetingsList);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "active" | "planned" | "completed"
  const [search, setSearch] = useState("");

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

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: meetings.length,
      active: meetings.filter((m) => m.status === "active").length,
      planned: meetings.filter((m) => m.status === "planned").length,
      completed: meetings.filter((m) => m.status === "completed").length,
    };
  }, [meetings]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.organizer && appliedFilters.organizer !== "Barchasi") count++;
    if (appliedFilters.createdFrom || appliedFilters.createdTo) count++;
    if (appliedFilters.startFrom || appliedFilters.startTo) count++;
    return count;
  }, [appliedFilters]);

  // Organizer options
  const organizerOptions = useMemo(() => {
    return mockOrganizers.map((org) => ({
      value: org,
      label: org === "Barchasi" ? "Tashkilotchini tanlang" : org,
    }));
  }, []);

  // Helper date parse
  const parseDateStr = (dateStr) => {
    if (!dateStr) return null;
    const clean = dateStr.trim();
    const parts = clean.split(/[\s.]+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null;
  };

  // Filtered and searched meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      // Tab filter
      if (activeTab === "active" && meeting.status !== "active") return false;
      if (activeTab === "planned" && meeting.status !== "planned") return false;
      if (activeTab === "completed" && meeting.status !== "completed") return false;

      // Search filter (name or organizer)
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = meeting.name.toLowerCase().includes(q);
        const matchesOrg = meeting.organizer.toLowerCase().includes(q);
        if (!matchesName && !matchesOrg) return false;
      }

      // Applied organizer filter
      if (
        appliedFilters.organizer &&
        appliedFilters.organizer !== "Barchasi" &&
        meeting.organizer !== appliedFilters.organizer
      ) {
        return false;
      }

      // Applied created date filter
      if (appliedFilters.createdFrom || appliedFilters.createdTo) {
        const meetingCreatedDate = parseDateStr(meeting.createdAt);
        if (meetingCreatedDate) {
          if (appliedFilters.createdFrom) {
            const from = parseDateStr(appliedFilters.createdFrom);
            if (from && meetingCreatedDate < from) return false;
          }
          if (appliedFilters.createdTo) {
            const to = parseDateStr(appliedFilters.createdTo);
            if (to && meetingCreatedDate > to) return false;
          }
        }
      }

      // Applied start date filter
      if (appliedFilters.startFrom || appliedFilters.startTo) {
        const meetingStartDate = parseDateStr(meeting.startTime);
        if (meetingStartDate) {
          if (appliedFilters.startFrom) {
            const from = parseDateStr(appliedFilters.startFrom);
            if (from && meetingStartDate < from) return false;
          }
          if (appliedFilters.startTo) {
            const to = parseDateStr(appliedFilters.startTo);
            if (to && meetingStartDate > to) return false;
          }
        }
      }

      return true;
    });
  }, [meetings, activeTab, search, appliedFilters]);

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedFilters({
      organizer: filterOrganizer,
      createdFrom: filterCreatedFrom,
      createdTo: filterCreatedTo,
      startFrom: filterStartFrom,
      startTo: filterStartTo,
    });
    setFilterModalOpen(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilterOrganizer("Barchasi");
    setFilterCreatedFrom("");
    setFilterCreatedTo("");
    setFilterStartFrom("");
    setFilterStartTo("");
    setAppliedFilters({
      organizer: "Barchasi",
      createdFrom: "",
      createdTo: "",
      startFrom: "",
      startTo: "",
    });
    setFilterModalOpen(false);
  };

  // Listen for newly created meeting from global CreateMeetingModal
  useEffect(() => {
    const handleCreated = (e) => {
      if (e.detail) {
        setMeetings((prev) => [e.detail, ...prev]);
      }
    };
    window.addEventListener("meeting-created", handleCreated);
    return () => window.removeEventListener("meeting-created", handleCreated);
  }, []);

  // Status badge styling
  const renderStatusBadge = (status, label) => {
    if (status === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-medium text-[#5B6078] bg-[#F1F3F9]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4AC99B]"></span>
          <span>{label || "O'tkazilgan"}</span>
        </span>
      );
    }
    if (status === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-medium text-[#5B6078] bg-[#F1F3F9]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
          <span>{label || "Joriy"}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-medium text-[#5B6078] bg-[#F1F3F9]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#DD4C1E]"></span>
        <span>{label || "Rejalashtirilgan"}</span>
      </span>
    );
  };

  return (
    <div className="p-5 py-4.5 space-y-4">
      {/* Top Filter and Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: Tabs + Search + Filter Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs Pill */}
          <div className="inline-flex items-center p-1 bg-[#F1F3F9] rounded-xl gap-1 select-none">
            {[
              { id: "all", label: "Barchasi", count: counts.all },
              { id: "active", label: "Joriy", count: counts.active, isRed: true },
              { id: "planned", label: "Rejalashtirilgan", count: counts.planned },
              { id: "completed", label: "O’tkazilgan", count: counts.completed },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-white text-[#1A1D2E] shadow-2xs"
                      : "text-[#5B6078] hover:text-[#1A1D2E]"
                  }`}
                >
                  <span className="leading-tight">{tab.label}</span>
                  <span
                    className={`min-w-[20px] h-[18px] px-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-medium leading-none transition-colors ${
                      tab.isRed
                        ? "bg-[#EF4444] text-white"
                        : isActive
                        ? "bg-[#F1F3F9] text-[#1A1D2E]"
                        : "bg-white text-[#8B90A5]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8B90A5]">
              <HugeiconsIcon icon={Search01Icon} size={18} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nomi bo'yicha izlash"
              className="w-full bg-[#F8F9FC] border border-[#E2E6F2] rounded-xl pl-10 pr-4 h-9 text-[13.5px] text-[#1A1D2E] placeholder-[#8B90A5] focus:outline-none focus:border-[#4763E4] focus:bg-white focus:ring-2 focus:ring-[#4763E4]/10 transition-all shadow-2xs"
            />
          </div>

          {/* Filter Modal Trigger Button */}
          <button
            type="button"
            onClick={() => setFilterModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 h-9 rounded-xl border text-[13px] font-semibold transition-all cursor-pointer ${activeFilterCount > 0
              ? "bg-[#EEF2FF] border-[#4763E4]/30 text-[#4763E4]"
              : "bg-[#F1F3F9] border-[#E2E6F2] text-[#5B6078] hover:text-[#1A1D2E] hover:bg-[#E8ECF6]"
              }`}
          >
            <HugeiconsIcon icon={FilterVerticalIcon} size={16} />
            <span>
              Filtrlash{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </span>
          </button>
        </div>
      </div>

      {/* Meetings Table */}
      <div className="overflow-auto h-[calc(100vh-160px)]">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 z-10 bg-[#F8F9FC]">
            <tr className="border-b border-[#E2E6F2] bg-[#F8F9FC] text-[#8B90A5] text-[13px] font-medium">
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
          <tbody className="divide-y divide-[#E2E6F2]/60 text-[13.5px]">
            {filteredMeetings.length > 0 ? (
              filteredMeetings.map((meeting, index) => (
                <tr
                  key={meeting.id}
                  onClick={() => navigate(`/meetings/${meeting.id}`)}
                  className="hover:bg-[#F8F9FC] transition-colors group cursor-pointer"
                >
                  {/* Index */}
                  <td className="py-3.5 px-4 text-center text-[#8B90A5] font-medium text-[13px]">
                    {index + 1}
                  </td>

                  {/* Name */}
                  <td className="py-3.5 px-4 truncate">
                    <span className="font-semibold text-[#1A1D2E] group-hover:text-[#4763E4] transition-colors line-clamp-1">
                      {meeting.name}
                    </span>
                  </td>

                  {/* Organizer */}
                  <td className="py-3.5 px-4 text-[#1A1D2E] truncate">
                    {meeting.organizer}
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 px-4 text-[#1A1D2E] whitespace-nowrap">
                    {meeting.createdAt}
                  </td>

                  {/* Start Time */}
                  <td className="py-3.5 px-4 text-[#1A1D2E] whitespace-nowrap">
                    {meeting.startTime}
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 text-[#1A1D2E] whitespace-nowrap">
                    {meeting.duration}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                    {renderStatusBadge(meeting.status, meeting.statusLabel)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="py-16 text-center text-[#8B90A5] text-[13.5px]"
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
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2E6F2] w-full max-w-[600px] overflow-visible p-6 space-y-5 animate-in zoom-in-95 duration-150 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1A1D2E] tracking-tight">
                Filtrlash
              </h3>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="p-1 rounded-lg text-[#8B90A5] hover:text-[#1A1D2E] hover:bg-[#F1F3F9] transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
            </div>

            {/* Filter Fields */}
            <div className="space-y-4">
              {/* Organizer */}
              <div className="relative z-30">
                <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
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

              {/* Created Date Range */}
              <div>
                <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
                  Yaratilgan sana
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={filterCreatedFrom}
                    onChange={(e) => setFilterCreatedFrom(e.target.value)}
                    placeholder="dan"
                    className="w-full bg-white border border-[#E2E6F2] rounded-xl px-4 h-11 text-[13.5px] text-[#1A1D2E] placeholder-[#8B90A5] focus:outline-none focus:border-[#4763E4] focus:ring-2 focus:ring-[#4763E4]/10 transition-all shadow-2xs"
                  />
                  <input
                    type="text"
                    value={filterCreatedTo}
                    onChange={(e) => setFilterCreatedTo(e.target.value)}
                    placeholder="gacha"
                    className="w-full bg-white border border-[#E2E6F2] rounded-xl px-4 h-11 text-[13.5px] text-[#1A1D2E] placeholder-[#8B90A5] focus:outline-none focus:border-[#4763E4] focus:ring-2 focus:ring-[#4763E4]/10 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Start Date Range */}
              <div>
                <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
                  Boshlanish sanasi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={filterStartFrom}
                    onChange={(e) => setFilterStartFrom(e.target.value)}
                    placeholder="dan"
                    className="w-full bg-white border border-[#E2E6F2] rounded-xl px-4 h-11 text-[13.5px] text-[#1A1D2E] placeholder-[#8B90A5] focus:outline-none focus:border-[#4763E4] focus:ring-2 focus:ring-[#4763E4]/10 transition-all shadow-2xs"
                  />
                  <input
                    type="text"
                    value={filterStartTo}
                    onChange={(e) => setFilterStartTo(e.target.value)}
                    placeholder="gacha"
                    className="w-full bg-white border border-[#E2E6F2] rounded-xl px-4 h-11 text-[13.5px] text-[#1A1D2E] placeholder-[#8B90A5] focus:outline-none focus:border-[#4763E4] focus:ring-2 focus:ring-[#4763E4]/10 transition-all shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t border-[#E2E6F2]/60">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3.5 py-3 rounded-xl text-[13.5px] font-semibold text-[#1A1D2E] hover:bg-[#F1F3F9] transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-[#1A1D2E]" />
                <span>Tozalash</span>
              </button>

              <button
                type="button"
                onClick={handleApplyFilters}
                className="flex items-center gap-2 bg-[#3F57B3] hover:bg-[#344AA5] text-white text-[13.5px] font-semibold px-3.5 py-3 rounded-xl transition-all shadow-xs active:scale-[0.98] cursor-pointer"
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