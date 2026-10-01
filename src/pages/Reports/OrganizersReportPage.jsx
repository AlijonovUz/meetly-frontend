import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, FileSpreadsheet } from "lucide-react";
import { DatePicker, CustomSelect } from "../../components/UI";
import { mockOrganizerReports } from "../../data/mockData";

const OrganizersReportPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [isGenerated, setIsGenerated] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [orgOrg, setOrgOrg] = useState("");
  const [organizerName, setOrganizerName] = useState("");

  // Export event listener
  useEffect(() => {
    const handleExport = () => {
      alert("Tashkilotchilar bo'yicha hisobot yuklab olindi (Excel/PDF)");
    };
    window.addEventListener("export-report", handleExport);
    return () => window.removeEventListener("export-report", handleExport);
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (startDate || endDate) count += 1;
    if (orgOrg) count += 1;
    if (organizerName) count += 1;
    return count;
  }, [startDate, endDate, orgOrg, organizerName]);

  const filteredOrganizers = useMemo(() => {
    return mockOrganizerReports.filter((item) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const m1 = item.organizer.toLowerCase().includes(q);
        const m2 = item.organization.toLowerCase().includes(q);
        if (!m1 && !m2) return false;
      }
      if (orgOrg && orgOrg !== "Barchasi" && item.organization !== orgOrg) return false;
      if (organizerName && item.organizer !== organizerName) return false;
      return true;
    });
  }, [searchTerm, orgOrg, organizerName]);

  const handleGenerate = () => {
    setIsGenerated(true);
  };

  return (
    <div className="p-6 py-5 font-['Manrope',sans-serif]">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
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
              placeholder="Nomi bo'yicha izlash"
              className="w-full h-9 pl-10 pr-4 rounded-xl border border-[#E2E6F2] bg-[#F4F6FB] text-[13.5px] text-[#1A1D2E] placeholder:text-[#8B90A5] outline-none focus:border-[#3858C7] focus:bg-white focus:ring-2 focus:ring-[#3858C7]/10 transition-all"
            />
          </div>

          {/* Collapsible Filter Toggle */}
          <button
            type="button"
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            className={`inline-flex items-center gap-2 h-9 px-4 rounded-xl border text-[13.5px] font-semibold transition-all cursor-pointer ${
              isFilterVisible || activeFiltersCount > 0
                ? "border-[#E2E6F2] bg-[#F4F6FB] text-[#1A1D2E]"
                : "border-[#E2E6F2] bg-white text-[#1A1D2E] hover:bg-[#F8FAFC]"
            }`}
          >
            <Filter size={16} strokeWidth={2.5} className="text-[#5E6480]" />
            <span>
              Filtrlash {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </span>
          </button>
        </div>

        {/* Generate Action Button */}
        <div>
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#059669] active:scale-[0.98] text-white font-bold text-[13.5px] h-9 px-5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet size={18} />
            <span>Shakllantirish</span>
          </button>
        </div>
      </div>

      {/* Collapsible Filters */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isFilterVisible
            ? "max-h-[600px] opacity-100 mb-6 overflow-visible"
            : "max-h-0 opacity-0 mb-0 overflow-hidden pointer-events-none"
        }`}
      >
        <div className="pt-0.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-1">
            <div>
              <label className="block text-[12px] font-medium text-[#5E6480] mb-1.5">
                Sana, dan
              </label>
              <DatePicker
                value={startDate}
                onChange={(d) => setStartDate(d)}
                placeholder="kun.oy.yil"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#5E6480] mb-1.5">
                Sana, gacha
              </label>
              <DatePicker
                value={endDate}
                onChange={(d) => setEndDate(d)}
                placeholder="kun.oy.yil"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#5E6480] mb-1.5">
                Tashkilot
              </label>
              <CustomSelect
                value={orgOrg}
                onChange={(v) => setOrgOrg(v)}
                options={[
                  { value: "", label: "Tashkilotni tanlang" },
                  { value: "Raqamli Nazorat", label: "Raqamli Nazorat" },
                  { value: "Toshkent IT Park", label: "Toshkent IT Park" },
                  { value: "IT-Markaz", label: "IT-Markaz" },
                ]}
                placeholder="Tashkilotni tanlang"
                searchable={false}
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#5E6480] mb-1.5">
                Tashkilotchi
              </label>
              <CustomSelect
                value={organizerName}
                onChange={(v) => setOrganizerName(v)}
                options={[
                  { value: "", label: "Tashkilotchini tanlang" },
                  { value: "Doston Ochilov", label: "Doston Ochilov" },
                  { value: "Alyona Sokolova", label: "Alyona Sokolova" },
                  { value: "Timur Akhmedov", label: "Timur Akhmedov" },
                  { value: "Irina Petrova", label: "Irina Petrova" },
                  { value: "Natalya Fedorova", label: "Natalya Fedorova" },
                ]}
                placeholder="Tashkilotchini tanlang"
                searchable={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {!isGenerated ? (
        <div className="py-28 text-center text-[#5E6480] text-[13.5px] font-medium select-none">
          Hisobot hali shakllantirilmagan. Filtrlarni tanlang va «Shakllantirish» tugmasini bosing.
        </div>
      ) : (
        <div className="animate-in fade-in duration-200">
          <div className="text-[12.5px] text-[#5E6480] font-medium mb-4">
            Davr: 01.09.2026 – 30.09.2026, Tashkilotchi: Barchasi
          </div>

          <div className="overflow-auto max-h-[calc(100vh-200px)]">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-[#F8F9FC] z-10">
                <tr className="border-b border-[#F1F3F9] text-[#8B90A5] text-[12.5px] font-medium">
                  <th className="py-3 px-3 w-12 font-medium">№</th>
                  <th className="py-3 px-3 font-medium">Tashkilotchi</th>
                  <th className="py-3 px-3 font-medium">Tashkilot</th>
                  <th className="py-3 px-3 font-medium text-center">Yaratilgan</th>
                  <th className="py-3 px-3 font-medium text-center">O'tkazilgan</th>
                  <th className="py-3 px-3 font-medium text-center">O'rt. davomiylik</th>
                  <th className="py-3 px-3 font-medium text-right">O'rt. qatnashish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F9]">
                {filteredOrganizers.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#F8FAFC] transition-colors text-[13.5px] text-[#1A1D2E]"
                  >
                    <td className="py-3.5 px-3 text-[#8B90A5]">{idx + 1}</td>
                    <td className="py-3.5 px-3 font-semibold text-[#1A1D2E]">
                      {row.organizer}
                    </td>
                    <td className="py-3.5 px-3 text-[#5E6480]">{row.organization}</td>
                    <td className="py-3.5 px-3 text-center text-[#5E6480]">
                      {row.createdCount}
                    </td>
                    <td className="py-3.5 px-3 text-center text-[#5E6480]">
                      {row.heldCount}
                    </td>
                    <td className="py-3.5 px-3 text-center text-[#5E6480]">
                      {row.avgDuration}
                    </td>
                    <td className="py-3.5 px-3 text-right font-semibold text-[#1A1D2E]">
                      {row.avgAttendance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizersReportPage;
