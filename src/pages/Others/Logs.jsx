import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  Clock,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { CustomSelect, DatePicker, TimePicker } from "../../components/UI";
import { getLogs, getLogById } from "../../services/logsApi";
import dayjs from "dayjs";

const getActionMeta = (action) => {
  const a = String(action).toLowerCase();
  if (a === "0" || a === "create") {
    return { label: "Create", color: "text-[#10B981]", bg: "bg-[#ECFDF5]" };
  }
  if (a === "1" || a === "update") {
    return { label: "Update", color: "text-[#E07A28]", bg: "bg-[#FFF4ED]" };
  }
  if (a === "2" || a === "delete") {
    return { label: "Delete", color: "text-[#EF4444]", bg: "bg-[#FEF2F2]" };
  }
  if (a === "3" || a === "access") {
    return { label: "Access", color: "text-[#3858C7]", bg: "bg-[#EEF2FF]" };
  }
  return { label: String(action || ""), color: "text-[#1A1D2E]", bg: "bg-[#F1F3F9]" };
};

const formatTimestamp = (ts) => {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    return dayjs(d).format("DD.MM.YYYY HH:mm")
  } catch (e) {
    return String(ts);
  }
};

const Logs = () => {
  // Search & Filters state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter form states
  const [selectedAction, setSelectedAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    action: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  // Data & Pagination states
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Guards against duplicate concurrent calls
  const isFetchingRef = useRef(false);
  const scrollContainerRef = useRef(null);

  // 1. Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 2. Fetch logs with pagination & filters
  const fetchLogsData = useCallback(
    async (targetPage, isNextPage = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isNextPage) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = {
          page: targetPage,
        };

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }
        if (appliedFilters.action !== "" && appliedFilters.action !== "Barchasi") {
          params.action = appliedFilters.action;
        }
        if (appliedFilters.startDate) {
          // Convert date string (DD.MM.YYYY to YYYY-MM-DD if needed)
          const sDate = appliedFilters.startDate.includes(".")
            ? appliedFilters.startDate.split(".").reverse().join("-")
            : appliedFilters.startDate;
          params.start_date = sDate;
        }
        if (appliedFilters.endDate) {
          const eDate = appliedFilters.endDate.includes(".")
            ? appliedFilters.endDate.split(".").reverse().join("-")
            : appliedFilters.endDate;
          params.end_date = eDate;
        }

        const data = await getLogs(params);
        const newResults = data.results || [];

        setTotalCount(data.count || 0);

        if (isNextPage) {
          setLogs((prev) => {
            const existingIds = new Set(prev.map((l) => l.id));
            const uniqueNew = newResults.filter((l) => !existingIds.has(l.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setLogs(newResults);
        }

        setPage(targetPage);
        setHasMore(Boolean(data.next && newResults.length > 0));
      } catch (err) {
        console.error("Loglarni yuklashda xatolik:", err);
        setError("Log ma'lumotlarini yuklab bo'lmadi");
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [debouncedSearch, appliedFilters]
  );

  // 3. Initial fetch & re-fetch on filter change
  useEffect(() => {
    fetchLogsData(1, false);
  }, [fetchLogsData]);

  // 4. Infinite scroll listener
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 80;

    if (isNearBottom && hasMore && !loading && !loadingMore && !isFetchingRef.current) {
      fetchLogsData(page + 1, true);
    }
  };

  const handleApplyFilter = () => {
    setAppliedFilters({
      action: selectedAction,
      startDate,
      startTime,
      endDate,
      endTime,
    });
    setIsFilterOpen(false);
  };

  const handleClearFilter = () => {
    setSelectedAction("");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setAppliedFilters({
      action: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    });
    setIsFilterOpen(false);
  };

  const handleLogClick = async (log) => {
    setSelectedLog(log);
    if (!log?.id) return;
    setDetailLoading(true);
    try {
      const detailData = await getLogById(log.id);
      if (detailData) {
        setSelectedLog(detailData);
      }
    } catch (err) {
      console.error("Log detail yuklashda xatolik:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const hasActiveFilters = Boolean(
    appliedFilters.action || appliedFilters.startDate || appliedFilters.endDate
  );

  const actionOptions = [
    { value: "", label: "Barchasi" },
    { value: "0", label: "Create" },
    { value: "1", label: "Update" },
    { value: "2", label: "Delete" },
    { value: "3", label: "Access" },
  ];

  return (
    <div className="p-6 py-5 font-['Manrope',sans-serif]">
      {/* Top Controls: Search and Filter */}
      <div className="flex items-center gap-3 mb-6">
        {/* Search Input */}
        <div className="relative w-64 md:w-72">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B90A5] pointer-events-none"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Izlash (foydalanuvchi, IP, jadval)"
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#E2E6F2] bg-[#F4F6FB] text-[13.5px] text-[#1A1D2E] placeholder:text-[#8B90A5] outline-none focus:border-[#3858C7] focus:bg-white focus:ring-2 focus:ring-[#3858C7]/20 transition-all"
          />
        </div>

        {/* Filter Button */}
        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl border text-[13.5px] font-semibold transition-all cursor-pointer ${
            hasActiveFilters
              ? "border-[#3858C7] bg-[#EEF2FB] text-[#3858C7]"
              : "border-[#E2E6F2] bg-[#F8FAFC] text-[#1A1D2E] hover:bg-[#F1F3F9]"
          }`}
        >
          <Filter size={16} className={hasActiveFilters ? "text-[#3858C7]" : "text-[#5E6480]"} />
          <span>Filtrlash</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-[#3858C7]"></span>
          )}
        </button>
      </div>

      {/* Logs Table with Infinite Scroll */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-auto h-[calc(100vh-165px)] rounded-xl relative"
      >
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-[#F8F9FC]">
            <tr className="border-b border-[#E2E6F2] text-[#8B90A5] text-[12.5px] font-medium">
              <th className="py-3 px-3 w-12 font-medium">№</th>
              <th className="py-3 px-3 font-medium">Foydalanuvchi</th>
              <th className="py-3 px-3 font-medium">Vaqt</th>
              <th className="py-3 px-3 font-medium">Jadval nomi</th>
              <th className="py-3 px-3 font-medium">Harakat</th>
              <th className="py-3 px-3 font-medium text-right">Yozuv raqami</th>
              <th className="py-3 px-3 font-medium text-right">IP manzili</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F3F9]">
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center text-[#8B90A5]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 size={28} className="animate-spin text-[#3858C7]" />
                    <span className="text-[13.5px]">Loglar yuklanmoqda...</span>
                  </div>
                </td>
              </tr>
            ) : error && logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-[#EF4444]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={() => fetchLogsData(1, false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3858C7] text-white text-xs font-semibold cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Qayta urinish</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : logs.length > 0 ? (
              <>
                {logs.map((log, index) => {
                  const actionMeta = getActionMeta(log.action);
                  const actorName = log.actor_name || log.actor || "Tizim";
                  const timeFormatted = formatTimestamp(log.timestamp || log.time);
                  const tableName = log.content_type_name || log.object_repr || log.tableName || "";
                  const recordId = log.object_pk || log.object_id || log.recordId || "";
                  const ipAddr = log.remote_addr || log.ipAddress || "";

                  return (
                    <tr
                      key={log.id || index}
                      onClick={() => handleLogClick(log)}
                      className="hover:bg-[#F8FAFC] font-medium cursor-pointer group text-[13.5px] text-[#1A1D2E] transition-colors"
                    >
                      <td className="py-4 px-3 text-[#8B90A5]">{index + 1}</td>
                      <td className="py-4 px-3 truncate max-w-[200px] font-semibold text-[#1A1D2E] group-hover:text-[#3858C7] transition-colors">
                        {actorName}
                      </td>
                      <td className="py-4 px-3 text-[#5E6480] whitespace-nowrap">
                        {timeFormatted}
                      </td>
                      <td className="py-4 px-3 text-[#5E6480] truncate max-w-[180px]">
                        {tableName}
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`font-semibold text-xs px-2.5 py-1 rounded-full ${actionMeta.bg} ${actionMeta.color}`}
                        >
                          {actionMeta.label}
                        </span>
                      </td>
                      <td
                        className="py-4 px-3 text-[#5E6480] text-right text-[13px] truncate max-w-[150px]"
                        title={recordId}
                      >
                        {recordId}
                      </td>
                      <td className="py-4 px-3 text-[#5E6480] text-[13px] text-right">
                        {ipAddr}
                      </td>
                    </tr>
                  );
                })}

                {/* Infinite Scroll loading indicator */}
                {loadingMore && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-[#5B6078]">
                      <div className="inline-flex items-center gap-2 text-xs font-semibold">
                        <Loader2 size={16} className="animate-spin text-[#3858C7]" />
                        <span>Ko'proq loglar yuklanmoqda...</span>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ) : (
              <tr>
                <td colSpan={7} className="py-16 text-center text-[#8B90A5] text-[14px]">
                  Hech qanday log topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL: "Foydalanuvchi va so'rov haqida ma'lumot" */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2E6F2] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 animate-in zoom-in-95 duration-150 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#F1F3F9]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-xl hover:bg-[#F1F3F9] text-[#1A1D2E] transition-colors cursor-pointer"
                >
                  <ArrowLeft size={20} />
                </button>
                <h3 className="text-[17px] md:text-[18px] font-bold text-[#1A1D2E] flex items-center gap-2">
                  <span>Log tafsilotlari</span>
                  {detailLoading && (
                    <Loader2 size={16} className="animate-spin text-[#3858C7]" />
                  )}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-xl text-[#8B90A5] hover:text-[#1A1D2E] hover:bg-[#F1F3F9] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              {/* Foydalanuvchi */}
              <div>
                <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1">
                  Foydalanuvchi
                </label>
                <div className="h-11 px-3.5 rounded-xl border border-[#E2E6F2] bg-[#F8FAFC] flex items-center text-[13.5px] text-[#1A1D2E] font-medium">
                  {selectedLog.actor_name || selectedLog.actor || selectedLog.user || "Tizim"}
                </div>
              </div>

              {/* Vaqti & IP manzili */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1">
                    Vaqti
                  </label>
                  <div className="h-11 px-3.5 rounded-xl border border-[#E2E6F2] bg-[#F8FAFC] flex items-center justify-between text-[13.5px] text-[#1A1D2E]">
                    <span>{formatTimestamp(selectedLog.timestamp || selectedLog.time)}</span>
                    <Calendar size={16} className="text-[#8B90A5]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1">
                    IP manzili
                  </label>
                  <div className="h-11 px-3.5 rounded-xl border border-[#E2E6F2] bg-[#F8FAFC] flex items-center text-[13.5px] text-[#1A1D2E]">
                    {selectedLog.remote_addr || selectedLog.ipAddress || "—"}
                  </div>
                </div>
              </div>

              {/* Harakati & Jadval nomi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1">
                    Harakati
                  </label>
                  <div className="h-11 px-3.5 rounded-xl border border-[#E2E6F2] bg-[#F8FAFC] flex items-center text-[13.5px] text-[#1A1D2E] font-medium">
                    {getActionMeta(selectedLog.action).label}
                  </div>
                </div>
                <div>
                  <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1">
                    Jadval / Obyekt
                  </label>
                  <div className="h-11 px-3.5 rounded-xl border border-[#E2E6F2] bg-[#F8FAFC] flex items-center text-[13.5px] text-[#1A1D2E] truncate">
                    {selectedLog.content_type_name || selectedLog.object_repr || selectedLog.tableName || "—"}
                  </div>
                </div>
              </div>

              {/* Yozuv raqami (Full width) */}
              <div>
                <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1">
                  Yozuv raqami
                </label>
                <div className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#E2E6F2] bg-[#F8FAFC] flex items-center text-[13.5px] text-[#1A1D2E] break-all select-all leading-normal">
                  {selectedLog.object_pk || selectedLog.object_id || selectedLog.recordId || "—"}
                </div>
              </div>

              {/* O'zgarishlar / Changes */}
              <div>
                <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1">
                  O'zgarishlar
                </label>
                <div className="rounded-2xl border border-[#E2E6F2] bg-[#F8FAFC] p-4 text-[13px] text-[#1A1D2E] whitespace-pre-wrap overflow-auto min-h-[70px] max-h-[180px] leading-relaxed">
                  {selectedLog.changes
                    ? typeof selectedLog.changes === "object"
                      ? JSON.stringify(selectedLog.changes, null, 2)
                      : String(selectedLog.changes)
                    : selectedLog.additional_data
                    ? JSON.stringify(selectedLog.additional_data, null, 2)
                    : "O'zgarish ma'lumotlari mavjud emas"}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#3858C7] hover:text-[#2844A8] py-2 px-4 rounded-xl hover:bg-[#EEF2FB] transition-colors cursor-pointer"
              >
                <X size={16} />
                <span>Yopish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILTER MODAL: "Filtrlash" */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2E6F2] w-full max-w-2xl p-6 animate-in zoom-in-95 duration-150 relative">
            {/* Modal Header */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1 rounded-lg hover:bg-[#F1F3F9] text-[#1A1D2E] transition-colors cursor-pointer"
                >
                  <ArrowLeft size={18} />
                </button>
                <h3 className="text-[18px] font-bold text-[#1A1D2E]">Filtrlash</h3>
              </div>
              <p className="text-[12.5px] text-[#5E6480] ml-7">
                Kerakli filtrlarni tanlang, natijalar shunga qarab saralanadi
              </p>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              {/* Harakat Select */}
              <div>
                <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1.5">
                  Harakat
                </label>
                <CustomSelect
                  value={selectedAction}
                  onChange={(val) => setSelectedAction(val)}
                  options={actionOptions}
                  placeholder="Harakatini tanlang"
                  searchable={false}
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Vaqt oralig'i */}
              <div>
                <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1.5">
                  Vaqt oralig'i
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <DatePicker
                    value={startDate}
                    onChange={(d) => setStartDate(d)}
                    placeholder="Boshlanish sanasi"
                    className="w-full"
                  />
                  <TimePicker
                    value={startTime}
                    onChange={(t) => setStartTime(t)}
                    placeholder="00:00"
                    className="w-full"
                  />
                  <DatePicker
                    value={endDate}
                    onChange={(d) => setEndDate(d)}
                    placeholder="Tugash sanasi"
                    className="w-full"
                  />
                  <TimePicker
                    value={endTime}
                    onChange={(t) => setEndTime(t)}
                    placeholder="23:59"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-8 flex items-center justify-end gap-3 pt-3 border-t border-[#F1F3F9]">
              <button
                type="button"
                onClick={handleClearFilter}
                className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#1A1D2E] hover:text-[#EF4444] px-4 py-2.5 rounded-xl hover:bg-[#F1F3F9] transition-colors cursor-pointer"
              >
                <X size={16} />
                <span>Tozalash</span>
              </button>

              <button
                type="button"
                onClick={handleApplyFilter}
                className="inline-flex items-center gap-2 bg-[#3858C7] hover:bg-[#2C48B0] active:scale-[0.98] text-white font-bold text-[13.5px] px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Search size={16} />
                <span>Qidirish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;