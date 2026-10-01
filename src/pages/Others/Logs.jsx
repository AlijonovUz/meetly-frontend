import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  Clock,
  X,
  ChevronDown,
} from "lucide-react";
import { CustomSelect, DatePicker, TimePicker } from "../../components/UI";
import { mockLogsList } from "../../data/mockData";

const Logs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters state
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
      endTime,
    });
    setIsFilterOpen(false);
  };

  // Filter logs logic
  const filteredLogs = useMemo(() => {
    return mockLogsList.filter((log) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesUser = log.user.toLowerCase().includes(query);
        const matchesTable = log.tableName.toLowerCase().includes(query);
        const matchesAction = log.action.toLowerCase().includes(query);
        const matchesIp = log.ipAddress.includes(query);
        if (!matchesUser && !matchesTable && !matchesAction && !matchesIp) {
          return false;
        }
      }

      // Action filter
      if (appliedFilters.action && appliedFilters.action !== "Barchasi") {
        if (log.action.toLowerCase() !== appliedFilters.action.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [searchTerm, appliedFilters]);

  const hasActiveFilters = Boolean(
    appliedFilters.action || appliedFilters.startDate || appliedFilters.endDate
  );

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Izlash"
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

      {/* Logs Table */}
      <div className="overflow-auto h-[calc(100vh-165px)]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#F1F3F9] text-[#8B90A5] text-[12.5px] font-medium">
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
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-[#F8FAFC] font-medium cursor-pointer group text-[13.5px] text-[#1A1D2E]"
                >
                  <td className="py-4 px-3 text-[#8B90A5]">{index + 1}</td>
                  <td className="py-4 px-3 truncate max-w-[200px] font-semibold text-[#1A1D2E] group-hover:text-[#3858C7] transition-colors">
                    {log.user}
                  </td>
                  <td className="py-4 px-3 text-[#5E6480]">{log.time}</td>
                  <td className="py-4 px-3 text-[#5E6480]">
                    {log.tableName}
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`font-medium ${
                        log.action === "Create"
                          ? "text-[#10B981]"
                          : log.action === "Delete"
                          ? "text-[#EF4444]"
                          : "text-[#1A1D2E]"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-[#5E6480] text-right">{log.recordId}</td>
                  <td className="py-4 px-3 text-[#5E6480] text-[13px] text-right">
                    {log.ipAddress}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#8B90A5] text-[14px]">
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-xl hover:bg-[#F1F3F9] text-[#1A1D2E] transition-colors cursor-pointer"
                >
                  <ArrowLeft size={20} />
                </button>
                <h3 className="text-[17px] md:text-[18px] font-bold text-[#1A1D2E]">
                  Foydalanuvchi va so'rov haqida ma'lumot
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
                <div className="h-11 px-3.5 rounded-xl border border-[#E2E6F2] bg-white flex items-center text-[13.5px] text-[#1A1D2E] font-medium">
                  {selectedLog.user}
                </div>
              </div>

              {/* Vaqti & IP manzili */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1">
                    Vaqti
                  </label>
                  <div className="h-11 px-3.5 rounded-xl border border-[#E2E6F2] bg-white flex items-center justify-between text-[13.5px] text-[#1A1D2E]">
                    <span>{selectedLog.time}</span>
                    <Calendar size={16} className="text-[#8B90A5]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1">
                    IP manzili
                  </label>
                  <div className="h-11 px-3.5 rounded-xl border border-[#E2E6F2] bg-white flex items-center text-[13.5px] text-[#1A1D2E]">
                    {selectedLog.ipAddress}
                  </div>
                </div>
              </div>

              {/* Harakati & Jadval nomi & Yozuv raqami */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1">
                    Harakati
                  </label>
                  <div className="h-11 px-3.5 rounded-xl border border-[#E2E6F2] bg-white flex items-center text-[13.5px] text-[#1A1D2E] font-medium">
                    {selectedLog.action}
                  </div>
                </div>
                <div>
                  <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1">
                    Jadval nomi
                  </label>
                  <div className="h-11 px-3.5 rounded-xl border border-[#E2E6F2] bg-white flex items-center text-[13.5px] text-[#1A1D2E]">
                    {selectedLog.tableName}
                  </div>
                </div>
                <div>
                  <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1">
                    Yozuv raqami
                  </label>
                  <div className="h-11 px-3.5 rounded-xl border border-[#E2E6F2] bg-white flex items-center text-[13.5px] text-[#1A1D2E]">
                    {selectedLog.recordId}
                  </div>
                </div>
              </div>

              {/* Eski qiymat */}
              <div>
                <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1">
                  Eski qiymat
                </label>
                <div className="rounded-2xl border border-[#E2E6F2] bg-[#F8FAFC] p-4 font-mono text-[12.5px] text-[#1A1D2E] whitespace-pre min-h-[70px]">
                  {selectedLog.oldValue || "null"}
                </div>
              </div>

              {/* Yangi qiymat */}
              <div>
                <label className="block text-[11.5px] font-medium text-[#5E6480] mb-1">
                  Yangi qiymat
                </label>
                <div className="rounded-2xl border border-[#E2E6F2] bg-[#F8FAFC] p-4 font-mono text-[12.5px] text-[#1A1D2E] whitespace-pre min-h-[70px]">
                  {selectedLog.newValue || "null"}
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
                  options={[
                    { value: "Create", label: "Create" },
                    { value: "Update", label: "Update" },
                    { value: "Delete", label: "Delete" },
                  ]}
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
                    placeholder="01.05.2026"
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
                    placeholder="31.05.2026"
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