import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, Filter, FileSpreadsheet, Loader2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, Cancel01Icon, Alert02Icon } from "@hugeicons/core-free-icons";
import { DatePicker, CustomSelect } from "../../components/UI";
import { getOrganizersReport, getOrganizationsList, getOrganizersList } from "../../services/reportsApi";
import { exportReportToExcel, exportReportToPDF, exportReportToCSV } from "../../lib/exportReport";
import dayjs from "dayjs";

const OrganizersReportPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [isGenerated, setIsGenerated] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [orgOrg, setOrgOrg] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [meetingStatus, setMeetingStatus] = useState("");
  const [meetingDuration, setMeetingDuration] = useState("");

  // Data state
  const [organizationsList, setOrganizationsList] = useState([]);
  const [organizersList, setOrganizersList] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [organizersLoading, setOrganizersLoading] = useState(false);
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load dropdown references only on mount
  useEffect(() => {
    const loadReferences = async () => {
      try {
        setOrgsLoading(true);
        setOrganizersLoading(true);
        const [orgs, organizers] = await Promise.all([
          getOrganizationsList(),
          getOrganizersList(),
        ]);
        setOrganizationsList(orgs || []);
        setOrganizersList(organizers || []);
      } catch (err) {
        console.error("Filtr ma'lumotlarini yuklashda xatolik:", err);
      } finally {
        setOrgsLoading(false);
        setOrganizersLoading(false);
      }
    };
    loadReferences();
  }, []);

  // Search organizations via API
  const handleSearchOrganizations = useCallback(async (query) => {
    try {
      setOrgsLoading(true);
      const params = query ? { search: query } : {};
      const orgs = await getOrganizationsList(params);
      setOrganizationsList(orgs || []);
    } catch (err) {
      console.error("Tashkilotlarni qidirishda xatolik:", err);
    } finally {
      setOrgsLoading(false);
    }
  }, []);

  // Search organizers via API
  const handleSearchOrganizers = useCallback(async (query) => {
    try {
      setOrganizersLoading(true);
      const params = query ? { search: query } : {};
      const orgs = await getOrganizersList(params);
      setOrganizersList(orgs || []);
    } catch (err) {
      console.error("Tashkilotchilarni qidirishda xatolik:", err);
    } finally {
      setOrganizersLoading(false);
    }
  }, []);

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (startDate || endDate) count += 1;
    if (orgOrg) count += 1;
    if (organizerId) count += 1;
    if (meetingStatus) count += 1;
    if (meetingDuration) count += 1;
    return count;
  }, [startDate, endDate, orgOrg, organizerId, meetingStatus, meetingDuration]);

  // Period label text
  const periodLabelText = useMemo(() => {
    const startStr = startDate ? dayjs(startDate).format("DD.MM.YYYY") : "01.09.2026";
    const endStr = endDate ? dayjs(endDate).format("DD.MM.YYYY") : "10.10.2026";
    const organizerObj = organizersList.find((o) => o.id === organizerId);
    const organizerStr = organizerObj ? organizerObj.name : "barchasi";
    const orgStr = orgOrg || "barchasi";

    return `Davr: ${startStr} – ${endStr}, Tashkilotchi: ${organizerStr}, Tashkilot: ${orgStr}`;
  }, [startDate, endDate, organizerId, orgOrg, organizersList]);

  // Fetch report data on demand
  const fetchReport = useCallback(
    async (pageNumber = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: pageNumber,
        };

        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }

        if (startDate) {
          const startObj = new Date(startDate);
          startObj.setHours(0, 0, 0, 0);
          params.start_date = startObj.toISOString();
        }

        if (endDate) {
          const endObj = new Date(endDate);
          endObj.setHours(23, 59, 59, 999);
          params.end_date = endObj.toISOString();
        }

        if (orgOrg) {
          params.organization = orgOrg;
        }

        if (organizerId) {
          params.organizer = organizerId;
        }

        if (meetingStatus) {
          params.status = meetingStatus;
        }

        if (meetingDuration) {
          params.duration = Number(meetingDuration);
        }

        const res = await getOrganizersReport(params);
        setReportsData(res.results || []);
        setTotalCount(res.count || 0);
        setTotalPages(res.total_pages || 1);
        setPage(res.page || pageNumber);
        setIsGenerated(true);
      } catch (err) {
        console.error("Tashkilotchilar hisobotini olishda xatolik:", err);
        setError("Hisobot ma'lumotlarini yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    },
    [
      searchTerm,
      startDate,
      endDate,
      orgOrg,
      organizerId,
      meetingStatus,
      meetingDuration,
    ]
  );

  const handleGenerate = () => {
    fetchReport(1);
  };

  // Export event listener for Navbar button
  useEffect(() => {
    const handleExportEvent = (e) => {
      if (!isGenerated || reportsData.length === 0) {
        setToastMessage({
          type: "warning",
          title: "Hisobot mavjud emas",
          description: "Avval «Shakllantirish» tugmasini bosib hisobotni shakllantiring.",
        });
        return;
      }

      const format = e.detail?.format || "excel";
      const columns = [
        { key: "index", label: "№", formatter: (_, __, idx) => idx + 1, align: "center" },
        { key: "full_name", label: "Tashkilotchi" },
        { key: "organization", label: "Tashkilot" },
        { key: "created_count", label: "Yaratilgan", formatter: (_, r) => r.created_count ?? r.createdCount ?? r.total_meetings ?? 0, align: "center" },
        { key: "completed_count", label: "O'tkazilgan", formatter: (_, r) => r.completed_count ?? r.heldCount ?? r.completed_meetings ?? 0, align: "center" },
        {
          key: "cancelled_count",
          label: "Bekor qilingan",
          formatter: (_, r) => {
            const cr = r.created_count ?? r.createdCount ?? r.total_meetings ?? 0;
            const comp = r.completed_count ?? r.heldCount ?? r.completed_meetings ?? 0;
            return r.cancelled_count ?? r.cancelledCount ?? (cr >= comp ? cr - comp : 0);
          },
          align: "center",
        },
      ];

      const title = "Tashkilotchilar bo'yicha hisobot";
      const filename = "tashkilotchilar_hisoboti";

      if (format === "excel") {
        exportReportToExcel(reportsData, columns, title, periodLabelText, filename);
        setToastMessage({
          type: "success",
          title: "Excel yuklab olindi",
          description: "Tashkilotchilar hisoboti Excel (.xlsx) formatida muvaffaqiyatli saqlandi.",
        });
      } else if (format === "pdf") {
        exportReportToPDF(reportsData, columns, title, periodLabelText, filename);
        setToastMessage({
          type: "success",
          title: "PDF yuklab olindi",
          description: "Tashkilotchilar hisoboti PDF formatida muvaffaqiyatli saqlandi.",
        });
      } else {
        exportReportToCSV(reportsData, columns, title, periodLabelText, filename);
        setToastMessage({
          type: "success",
          title: "CSV yuklab olindi",
          description: "Tashkilotchilar hisoboti CSV formatida muvaffaqiyatli saqlandi.",
        });
      }
    };

    window.addEventListener("export-report", handleExportEvent);
    return () => window.removeEventListener("export-report", handleExportEvent);
  }, [isGenerated, reportsData, periodLabelText]);

  // Organization options
  const orgOptions = useMemo(() => {
    const base = [{ value: "", label: "Tashkilotni tanlang" }];
    const items = organizationsList.map((org) => {
      const name = typeof org === "string" ? org : org?.name || org?.title;
      return { value: name, label: name };
    });
    return [...base, ...items];
  }, [organizationsList]);

  // Organizer options
  const organizerOptions = useMemo(() => {
    const base = [{ value: "", label: "Tashkilotchini tanlang" }];
    const items = organizersList.map((o) => ({
      value: o.id || o.name,
      label: o.name || o.full_name || o.id,
    }));
    return [...base, ...items];
  }, [organizersList]);

  return (
    <div className="p-6 py-5 font-['Manrope',sans-serif]">
      {/* Top Controls: Search (Left), Filter Toggle, Shakllantirish Button (Right) */}
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
              className="w-full h-9 pl-10 pr-4 rounded-lg border border-[#E2E6F2] bg-[#F4F6FB] text-[13.5px] text-[#1A1D2E] placeholder:text-[#8B90A5] outline-none focus:border-[#3858C7] focus:bg-white focus:ring-2 focus:ring-[#3858C7]/10 transition-all"
            />
          </div>

          {/* Collapsible Filter Toggle */}
          <button
            type="button"
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            className={`inline-flex items-center gap-2 h-9 px-4 rounded-lg border text-[13.5px] font-semibold transition-all cursor-pointer ${
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
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#059669] active:scale-[0.98] text-white font-bold text-[13.5px] h-9 px-5 rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-75"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={18} />
            )}
            <span>Shakllantirish</span>
          </button>
        </div>
      </div>

      {/* Collapsible Filters: 3 columns layout matching Figma */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isFilterVisible
            ? "max-h-[600px] opacity-100 mb-6 overflow-visible"
            : "max-h-0 opacity-0 mb-0 overflow-hidden pointer-events-none"
        }`}
      >
        <div className="pt-0.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-1">
            {/* Row 1 */}
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
                options={orgOptions}
                placeholder="Tashkilotni tanlang"
                searchable={true}
                onSearch={handleSearchOrganizations}
                loading={orgsLoading}
              />
            </div>

            {/* Row 2 */}
            <div>
              <label className="block text-[12px] font-medium text-[#5E6480] mb-1.5">
                Tashkilotchi
              </label>
              <CustomSelect
                value={organizerId}
                onChange={(v) => setOrganizerId(v)}
                options={organizerOptions}
                placeholder="Tashkilotchini tanlang"
                searchable={true}
                onSearch={handleSearchOrganizers}
                loading={organizersLoading}
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#5E6480] mb-1.5">
                Yig'ilish holati
              </label>
              <CustomSelect
                value={meetingStatus}
                onChange={(v) => setMeetingStatus(v)}
                options={[
                  { value: "", label: "Barchasi" },
                  { value: "completed", label: "O'tkazilgan" },
                  { value: "ongoing", label: "Joriy" },
                  { value: "scheduled", label: "Rejalashtirilgan" },
                  { value: "cancelled", label: "Bekor qilingan" },
                ]}
                placeholder="Barchasi"
                searchable={false}
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#5E6480] mb-1.5">
                Davomiyligi
              </label>
              <CustomSelect
                value={meetingDuration}
                onChange={(v) => setMeetingDuration(v)}
                options={[
                  { value: "", label: "Barchasi" },
                  { value: "30", label: "< 30 daqiqa" },
                  { value: "60", label: "30-60 daqiqa" },
                  { value: "90", label: "> 60 daqiqa" },
                ]}
                placeholder="Barchasi"
                searchable={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchReport(page)}
            className="inline-flex items-center gap-1.5 font-bold text-xs underline cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Qayta urinish</span>
          </button>
        </div>
      )}

      {/* Report Content */}
      {!isGenerated && !loading ? (
        <div className="py-28 text-center text-[#5E6480] text-[13.5px] font-medium select-none">
          Hisobot hali shakllantirilmagan. Filtrlarni tanlang va «Shakllantirish» tugmasini bosing.
        </div>
      ) : (
        <div className="animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-[#5E6480] font-medium mb-3">
            <span>{periodLabelText}</span>
          </div>

          <div className="overflow-auto max-h-[calc(100vh-230px)]">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-[#F8F9FC] z-10">
                <tr className="border-b border-[#F1F3F9] text-[#5B6078] text-[13px] font-medium">
                  <th className="py-3 px-4 w-12 font-medium">№</th>
                  <th className="py-3 px-4 font-medium">Tashkilotchi</th>
                  <th className="py-3 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#4AC99B] rounded-full"></span>
                      <span>Tashkilot</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 font-medium text-right">Yaratilgan</th>
                  <th className="py-3 px-4 font-medium text-right">O'tkazilgan</th>
                  <th className="py-3 px-4 font-medium text-right pr-6">Bekor qilingan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F9]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-[#8B90A5]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 size={24} className="animate-spin text-[#3858C7]" />
                        <span className="text-[13px]">Tashkilotchilar hisoboti yuklanmoqda...</span>
                      </div>
                    </td>
                  </tr>
                ) : reportsData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-[#8B90A5] text-[13.5px]">
                      Tanlangan parametrlar bo'yicha hech qanday tashkilotchi topilmadi.
                    </td>
                  </tr>
                ) : (
                  reportsData.map((row, idx) => {
                    const rowIdx = (page - 1) * 20 + idx + 1;
                    const fullName =
                      row.full_name ||
                      row.fullName ||
                      row.organizer?.full_name ||
                      row.organizer?.name ||
                      (typeof row.organizer === "string" ? row.organizer : "Noma'lum");
                    const organization =
                      row.organization?.name ||
                      (typeof row.organization === "string" ? row.organization : "—");
                    const createdCount =
                      row.created_count ?? row.createdCount ?? row.total_meetings ?? 0;
                    const completedCount =
                      row.completed_count ?? row.heldCount ?? row.completed_meetings ?? 0;
                    const cancelledCount =
                      row.cancelled_count ??
                      row.cancelledCount ??
                      row.cancelled_meetings ??
                      (createdCount >= completedCount ? createdCount - completedCount : 0);

                    return (
                      <tr
                        key={row.id || idx}
                        className="hover:bg-[#F8FAFC] transition-colors text-[13px] text-[#1A1D2E]"
                      >
                        <td className="py-3.5 px-4 text-[#8B90A5]">{rowIdx}</td>
                        <td className="py-3.5 px-4 font-medium text-[#1A1D2E]">
                          {fullName}
                        </td>
                        <td className="py-3.5 px-4 text-[#5E6480]">{organization}</td>
                        <td className="py-3.5 px-4 text-right text-[#5E6480] font-medium">
                          {createdCount}
                        </td>
                        <td className="py-3.5 px-4 text-right text-[#5E6480] font-medium">
                          {completedCount}
                        </td>
                        <td className="py-3.5 px-4 text-right text-[#5E6480] font-medium pr-6">
                          {cancelledCount}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <div className="text-[12.5px] text-[#8B90A5]">
                Ko'rsatilmoqda: <span className="font-semibold text-[#1A1D2E]">{(page - 1) * 20 + 1}</span> -{" "}
                <span className="font-semibold text-[#1A1D2E]">{Math.min(page * 20, totalCount)}</span> /{" "}
                <span className="font-semibold text-[#1A1D2E]">{totalCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => fetchReport(page - 1)}
                  className="p-1.5 rounded-lg border border-[#E2E6F2] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[12.5px] font-semibold text-[#1A1D2E] px-2">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => fetchReport(page + 1)}
                  className="p-1.5 rounded-lg border border-[#E2E6F2] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`bg-white border rounded-2xl shadow-xl p-4 flex items-start gap-3.5 max-w-md ${
            toastMessage.type === "warning" ? "border-[#F59E0B]/40" : "border-[#10B981]/40"
          }`}>
            <div className={`flex-shrink-0 mt-0.5 ${
              toastMessage.type === "warning" ? "text-[#F59E0B]" : "text-[#10B981]"
            }`}>
              <HugeiconsIcon icon={toastMessage.type === "warning" ? Alert02Icon : CheckmarkCircle02Icon} size={22} />
            </div>
            <div className="flex-1 pr-2">
              <h4 className="text-[14px] font-bold text-[#1A1D2E] leading-tight">
                {toastMessage.title}
              </h4>
              <p className="text-[12.5px] text-[#5E6480] mt-1 leading-snug">
                {toastMessage.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-[#8B90A5] hover:text-[#1A1D2E] p-1 rounded-lg hover:bg-[#F1F3F9] transition-colors cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizersReportPage;
