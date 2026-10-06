import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Search, Filter, FileSpreadsheet, Loader2, RefreshCw, ChevronDown } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, Cancel01Icon, Alert02Icon } from "@hugeicons/core-free-icons";
import { DatePicker, CustomSelect } from "../../components/UI";
import { getParticipantsReport, getOrganizationsList, getParticipantsList } from "../../services/reportsApi";
import { exportReportToExcel, exportReportToPDF, exportReportToCSV } from "../../lib/exportReport";
import dayjs from "dayjs";

const ParticipantsReportPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [isGenerated, setIsGenerated] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [partOrg, setPartOrg] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [signatureStatus, setSignatureStatus] = useState("");

  // Data state
  const [organizationsList, setOrganizationsList] = useState([]);
  const [organizationsPage, setOrganizationsPage] = useState(1);
  const [organizationsHasMore, setOrganizationsHasMore] = useState(false);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [orgsLoadingMore, setOrgsLoadingMore] = useState(false);
  const [organizationsSearch, setOrganizationsSearch] = useState("");
  const isFetchingOrgsRef = useRef(false);

  const [participantsList, setParticipantsList] = useState([]);
  const [participantsPage, setParticipantsPage] = useState(1);
  const [participantsHasMore, setParticipantsHasMore] = useState(false);
  const [partsLoading, setPartsLoading] = useState(false);
  const [partsLoadingMore, setPartsLoadingMore] = useState(false);
  const [participantsSearch, setParticipantsSearch] = useState("");
  const isFetchingPartsRef = useRef(false);

  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const tableContainerRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Fetch Organizations with pagination
  const fetchOrganizations = useCallback(async (targetPage = 1, isNext = false, search = "") => {
    if (isFetchingOrgsRef.current) return;
    isFetchingOrgsRef.current = true;
    if (isNext) setOrgsLoadingMore(true);
    else setOrgsLoading(true);

    try {
      const params = { page: targetPage };
      if (search) params.search = search;
      const data = await getOrganizationsList(params);
      const newItems = Array.isArray(data) ? data : (data.results || []);

      setOrganizationsList((prev) => {
        if (targetPage === 1) return newItems;
        const existingIds = new Set(prev.map((item) => item.id || item.value));
        const filtered = newItems.filter((item) => !existingIds.has(item.id || item.value));
        return [...prev, ...filtered];
      });

      setOrganizationsPage(targetPage);
      setOrganizationsHasMore(Boolean(data.next || (data.total_pages && targetPage < data.total_pages)));
    } catch (err) {
      console.error("Tashkilotlarni yuklashda xatolik:", err);
    } finally {
      setOrgsLoading(false);
      setOrgsLoadingMore(false);
      isFetchingOrgsRef.current = false;
    }
  }, []);

  const handleSearchOrganizations = useCallback((query) => {
    setOrganizationsSearch(query);
    fetchOrganizations(1, false, query);
  }, [fetchOrganizations]);

  const handleLoadMoreOrganizations = useCallback(() => {
    if (!organizationsHasMore || orgsLoadingMore || orgsLoading) return;
    fetchOrganizations(organizationsPage + 1, true, organizationsSearch);
  }, [organizationsHasMore, orgsLoadingMore, orgsLoading, fetchOrganizations, organizationsPage, organizationsSearch]);

  // Fetch Participants with pagination
  const fetchParticipants = useCallback(async (targetPage = 1, isNext = false, search = "") => {
    if (isFetchingPartsRef.current) return;
    isFetchingPartsRef.current = true;
    if (isNext) setPartsLoadingMore(true);
    else setPartsLoading(true);

    try {
      const params = { page: targetPage };
      if (search) params.search = search;
      const data = await getParticipantsList(params);
      const newItems = Array.isArray(data) ? data : (data.results || []);

      setParticipantsList((prev) => {
        if (targetPage === 1) return newItems;
        const existingIds = new Set(prev.map((item) => item.id || item.value));
        const filtered = newItems.filter((item) => !existingIds.has(item.id || item.value));
        return [...prev, ...filtered];
      });

      setParticipantsPage(targetPage);
      setParticipantsHasMore(Boolean(data.next || (data.total_pages && targetPage < data.total_pages)));
    } catch (err) {
      console.error("Ishtirokchilarni yuklashda xatolik:", err);
    } finally {
      setPartsLoading(false);
      setPartsLoadingMore(false);
      isFetchingPartsRef.current = false;
    }
  }, []);

  const handleSearchParticipants = useCallback((query) => {
    setParticipantsSearch(query);
    fetchParticipants(1, false, query);
  }, [fetchParticipants]);

  const handleLoadMoreParticipants = useCallback(() => {
    if (!participantsHasMore || partsLoadingMore || partsLoading) return;
    fetchParticipants(participantsPage + 1, true, participantsSearch);
  }, [participantsHasMore, partsLoadingMore, partsLoading, fetchParticipants, participantsPage, participantsSearch]);

  useEffect(() => {
    fetchOrganizations(1, false, "");
    fetchParticipants(1, false, "");
  }, [fetchOrganizations, fetchParticipants]);

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
    if (partOrg) count += 1;
    if (participantId) count += 1;
    if (userStatus) count += 1;
    if (signatureStatus) count += 1;
    return count;
  }, [startDate, endDate, partOrg, participantId, userStatus, signatureStatus]);

  // Period label text
  const periodLabelText = useMemo(() => {
    const startStr = startDate ? dayjs(startDate).format("DD.MM.YYYY") : "01.09.2026";
    const endStr = endDate ? dayjs(endDate).format("DD.MM.YYYY") : "30.09.2026";
    const orgStr = partOrg || "Barchasi";
    let stStr = "Barchasi";
    if (userStatus === "active") stStr = "Faol";
    else if (userStatus === "blocked") stStr = "Bloklangan";

    return `Davr: ${startStr} – ${endStr}, Tashkilot: ${orgStr}, Holati: ${stStr}`;
  }, [startDate, endDate, partOrg, userStatus]);

  // Fetch report data on demand (when user clicks Shakllantirish or infinite scroll)
  const fetchReport = useCallback(
    async (pageNumber = 1, isNextPage = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        if (isNextPage) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
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

        if (partOrg) {
          params.organization = partOrg;
        }

        if (participantId) {
          params.participant = participantId;
        }

        if (signatureStatus !== "") {
          params.signature = signatureStatus === "true";
        }

        const res = await getParticipantsReport(params);
        const newResults = res.results || [];
        setTotalCount(res.count || 0);
        setTotalPages(res.total_pages || 1);
        setPage(pageNumber);

        if (isNextPage) {
          setReportsData((prev) => {
            const existingIds = new Set(prev.map((i) => i.id).filter(Boolean));
            if (existingIds.size > 0) {
              const uniqueNew = newResults.filter((i) => !i.id || !existingIds.has(i.id));
              return [...prev, ...uniqueNew];
            }
            return [...prev, ...newResults];
          });
        } else {
          setReportsData(newResults);
        }

        const hasNext = Boolean(
          res.next || (res.total_pages ? pageNumber < res.total_pages : newResults.length >= 20)
        );
        setHasMore(hasNext);
        setIsGenerated(true);
      } catch (err) {
        console.error("Ishtirokchilar hisobotini olishda xatolik:", err);
        setError("Hisobot ma'lumotlarini yuklashda xatolik yuz berdi");
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [
      searchTerm,
      startDate,
      endDate,
      partOrg,
      participantId,
      signatureStatus,
    ]
  );

  const handleGenerate = () => {
    setHasMore(true);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
    fetchReport(1, false);
  };

  // Scroll listener for table container
  const handleScroll = () => {
    const container = tableContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 80;

    if (isNearBottom && hasMore && !loading && !loadingMore && !isFetchingRef.current) {
      fetchReport(page + 1, true);
    }
  };

  const formatDuration = (mins) => {
    if (mins === undefined || mins === null || mins === "") return "0 daq";
    if (typeof mins === "string" && (mins.includes("soat") || mins.includes("daq"))) return mins;
    const num = Number(mins);
    if (isNaN(num) || num <= 0) return "0 daq";
    const hours = Math.floor(num / 60);
    const remainingMins = num % 60;
    if (hours > 0 && remainingMins > 0) {
      return `${hours} soat ${remainingMins < 10 ? `0${remainingMins}` : remainingMins} daq`;
    }
    if (hours > 0) {
      return `${hours} soat`;
    }
    return `${remainingMins} daq`;
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
        { key: "full_name", label: "F.I.Sh." },
        { key: "organization", label: "Tashkilot" },
        { key: "meetings_count", label: "Yig'ilishlar", formatter: (_, r) => r.meetings_count ?? r.invitedCount ?? r.meetingsCount ?? 0, align: "center" },
        { key: "signed_count", label: "Imzolagan", formatter: (_, r) => r.signed_count ?? r.attendedCount ?? r.signedCount ?? 0, align: "center" },
        {
          key: "total_duration",
          label: "Jami vaqt",
          formatter: (_, r) => formatDuration(r.total_duration ?? r.totalDuration ?? ((r.meetings_count ?? r.invitedCount ?? 1) * 45)),
          align: "center",
        },
        {
          key: "avg_duration",
          label: "O'rt. vaqt",
          formatter: (_, r) => formatDuration(r.avg_duration ?? r.avgDuration ?? 42),
          align: "center",
        },
        {
          key: "status",
          label: "Holati",
          formatter: (_, r) => (r.is_active !== false && r.status !== "blocked" && r.status !== "inactive" ? "Faol" : "Bloklangan"),
          align: "right",
        },
      ];

      const title = "Ishtirokchilar bo'yicha hisobot";
      const filename = "ishtirokchilar_hisoboti";

      if (format === "excel") {
        exportReportToExcel(reportsData, columns, title, periodLabelText, filename);
        setToastMessage({
          type: "success",
          title: "Excel yuklab olindi",
          description: "Ishtirokchilar hisoboti Excel (.xlsx) formatida muvaffaqiyatli saqlandi.",
        });
      } else if (format === "pdf") {
        exportReportToPDF(reportsData, columns, title, periodLabelText, filename);
        setToastMessage({
          type: "success",
          title: "PDF yuklab olindi",
          description: "Ishtirokchilar hisoboti PDF formatida muvaffaqiyatli saqlandi.",
        });
      } else {
        exportReportToCSV(reportsData, columns, title, periodLabelText, filename);
        setToastMessage({
          type: "success",
          title: "CSV yuklab olindi",
          description: "Ishtirokchilar hisoboti CSV formatida muvaffaqiyatli saqlandi.",
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

  // Participant options
  const participantOptions = useMemo(() => {
    const base = [{ value: "", label: "Ishtirokchini tanlang" }];
    const items = participantsList.map((p) => ({
      value: p.id || p.name,
      label: p.name || p.full_name || p.id,
    }));
    return [...base, ...items];
  }, [participantsList]);

  return (
    <div className="p-6 py-5 font-['Manrope',sans-serif]">
      {/* Top Controls: Filter Toggle (First), Search (Second), Shakllantirish Button (Third) - Right Aligned */}
      <div className="flex flex-wrap items-center justify-end gap-3 mb-6">
        {/* Collapsible Filter Toggle */}
        <button
          type="button"
          onClick={() => setIsFilterVisible(!isFilterVisible)}
          className={`inline-flex items-center gap-2 h-9 px-4 rounded-lg border text-[13.5px] font-semibold transition-all cursor-pointer ${isFilterVisible || activeFiltersCount > 0
            ? "border-[#E2E6F2] dark:border-[#2B3553] bg-[#F4F6FB] dark:bg-[#1C2438] text-[#1A1D2E] dark:text-white"
            : "border-[#E2E6F2] dark:border-[#2B3553] bg-white dark:bg-[#161C2E] text-[#1A1D2E] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1C2438]"
            }`}
        >
          <Filter size={16} strokeWidth={2.5} className="text-[#5E6480] dark:text-[#94A3B8]" />
          <span>
            Filtrlash {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 text-[#8B90A5] dark:text-[#94A3B8] ${isFilterVisible ? "rotate-180" : ""
              }`}
          />
        </button>

        {/* Search Input */}
        <div className="relative w-64 md:w-72">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B90A5] dark:text-[#64748B] pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nomi bo'yicha izlash"
            className="w-full h-9 pl-10 pr-4 rounded-lg border border-[#E2E6F2] dark:border-[#2B3553] bg-[#F4F6FB] dark:bg-[#121624] text-[13.5px] text-[#1A1D2E] dark:text-white placeholder:text-[#8B90A5] dark:placeholder:text-[#64748B] outline-none focus:border-[#3858C7] focus:bg-white dark:focus:bg-[#161C2E] focus:ring-2 focus:ring-[#3858C7]/10 transition-all"
          />
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
        className={`transition-all duration-300 ease-in-out ${isFilterVisible
          ? "max-h-[600px] opacity-100 mb-6 overflow-visible"
          : "max-h-0 opacity-0 mb-0 overflow-hidden pointer-events-none"
          }`}
      >
        <div className="pt-0.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-1">
            {/* Row 1 */}
            <div>
              <label className="block text-[12px] font-medium text-[#5E6480] dark:text-[#94A3B8] mb-1.5">
                Sana, dan
              </label>
              <DatePicker
                value={startDate}
                onChange={(d) => setStartDate(d)}
                maxDate={endDate || new Date()}
                placeholder="kun.oy.yil"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#5E6480] dark:text-[#94A3B8] mb-1.5">
                Sana, gacha
              </label>
              <DatePicker
                value={endDate}
                onChange={(d) => setEndDate(d)}
                minDate={startDate || undefined}
                maxDate={new Date()}
                placeholder="kun.oy.yil"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#5E6480] dark:text-[#94A3B8] mb-1.5">
                Tashkilot
              </label>
              <CustomSelect
                value={partOrg}
                onChange={(v) => setPartOrg(v)}
                options={orgOptions}
                placeholder="Tashkilotni tanlang"
                searchable={true}
                onSearch={handleSearchOrganizations}
                onLoadMore={handleLoadMoreOrganizations}
                hasMore={organizationsHasMore}
                loadingMore={orgsLoadingMore}
                loading={orgsLoading}
              />
            </div>

            {/* Row 2 */}
            <div>
              <label className="block text-[12px] font-medium text-[#5E6480] dark:text-[#94A3B8] mb-1.5">
                Ishtirokchi
              </label>
              <CustomSelect
                value={participantId}
                onChange={(v) => setParticipantId(v)}
                options={participantOptions}
                placeholder="Ishtirokchini tanlang"
                searchable={true}
                onSearch={handleSearchParticipants}
                onLoadMore={handleLoadMoreParticipants}
                hasMore={participantsHasMore}
                loadingMore={partsLoadingMore}
                loading={partsLoading}
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#5E6480] dark:text-[#94A3B8] mb-1.5">
                Foydalanuvchi holati
              </label>
              <CustomSelect
                value={userStatus}
                onChange={(v) => setUserStatus(v)}
                options={[
                  { value: "", label: "Barchasi" },
                  { value: "active", label: "Faol" },
                  { value: "blocked", label: "Bloklangan" },
                ]}
                placeholder="Barchasi"
                searchable={false}
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#5E6480] dark:text-[#94A3B8] mb-1.5">
                Imzo holati
              </label>
              <CustomSelect
                value={signatureStatus}
                onChange={(v) => setSignatureStatus(v)}
                options={[
                  { value: "", label: "Barchasi" },
                  { value: "true", label: "Imzolaganlar" },
                  { value: "false", label: "Kutilayotganlar" },
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
        <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm flex items-center justify-between">
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
        <div className="py-28 text-center text-[#5E6480] dark:text-[#94A3B8] text-[13.5px] font-medium select-none">
          Hisobot hali shakllantirilmagan. Filtrlarni tanlang va «Shakllantirish» tugmasini bosing.
        </div>
      ) : (
        <div className="animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-[#5E6480] dark:text-[#94A3B8] font-medium mb-3">
            <span>{periodLabelText}</span>
          </div>

          <div
            ref={tableContainerRef}
            onScroll={handleScroll}
            className="overflow-auto max-h-[calc(100vh-230px)]"
          >
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#F8F9FC] dark:bg-[#161B22]">
                <tr className="border-b border-[#F1F3F9] dark:border-[#1E263C] text-[#5B6078] dark:text-[#94A3B8] text-[13px] font-medium">
                  <th className="py-3 px-3 w-12 font-medium">№</th>
                  <th className="py-3 px-3 font-medium">F.I.Sh.</th>
                  <th className="py-3 px-3 font-medium">Tashkilot</th>
                  <th className="py-3 px-3 font-medium text-right">Yig'ilishlar</th>
                  <th className="py-3 px-3 font-medium text-right">Imzolagan</th>
                  <th className="py-3 px-3 font-medium text-right">Jami vaqt</th>
                  <th className="py-3 px-3 font-medium text-right">O'rt. vaqt</th>
                  <th className="py-3 px-3 font-medium text-right pr-4">Holati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F9] dark:divide-[#1E263C]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-[#8B90A5] dark:text-[#64748B]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 size={24} className="animate-spin text-[#3858C7]" />
                        <span className="text-[13px]">Ishtirokchilar hisoboti yuklanmoqda...</span>
                      </div>
                    </td>
                  </tr>
                ) : reportsData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-[#8B90A5] dark:text-[#64748B] text-[13.5px]">
                      Tanlangan parametrlar bo'yicha hech qanday ishtirokchi topilmadi.
                    </td>
                  </tr>
                ) : (
                  <>
                    {reportsData.map((row, idx) => {
                      const rowIdx = idx + 1;
                      const fullName = row.full_name || row.fullName || row.name || "Noma'lum";
                      const organization = row.organization || "—";
                      const meetingsCount = row.meetings_count ?? row.invitedCount ?? row.meetingsCount ?? 0;
                      const signedCount = row.signed_count ?? row.attendedCount ?? row.signedCount ?? 0;
                      const totalDurationText = formatDuration(
                        row.total_duration ?? row.totalDuration ?? (meetingsCount > 0 ? meetingsCount * 45 : 0)
                      );
                      const avgDurationText = formatDuration(
                        row.avg_duration ?? row.avgDuration ?? (meetingsCount > 0 ? 42 : 0)
                      );
                      const isActive = row.is_active !== false && row.status !== "blocked" && row.status !== "inactive";

                      return (
                        <tr
                          key={row.id || idx}
                          className="hover:bg-[#F8FAFC] dark:hover:bg-[#1C2438]/50 transition-colors text-[13px] text-[#1A1D2E] dark:text-white"
                        >
                          <td className="py-3.5 px-3 text-[#8B90A5] dark:text-[#64748B]">{rowIdx}</td>
                          <td className="py-3.5 px-3 font-semibold text-[#1A1D2E] dark:text-white">
                            <div className="flex items-center gap-2.5">
                              {row.avatar ? (
                                <img
                                  src={row.avatar}
                                  alt={fullName}
                                  className="w-7 h-7 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-[#EEF2FB] dark:bg-[#1C2438] text-[#3858C7] text-xs font-bold flex items-center justify-center">
                                  {fullName[0]?.toUpperCase() || "I"}
                                </div>
                              )}
                              <span>{fullName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-[#5E6480] dark:text-[#94A3B8]">{organization}</td>
                          <td className="py-3.5 px-3 text-right text-[#5E6480] dark:text-[#94A3B8] font-medium">
                            {meetingsCount}
                          </td>
                          <td className="py-3.5 px-3 text-right text-[#5E6480] dark:text-[#94A3B8] font-medium">
                            {signedCount}
                          </td>
                          <td className="py-3.5 px-3 text-right text-[#5E6480] dark:text-[#94A3B8]">
                            {totalDurationText}
                          </td>
                          <td className="py-3.5 px-3 text-right text-[#5E6480] dark:text-[#94A3B8]">
                            {avgDurationText}
                          </td>
                          <td className="py-3.5 px-3 text-right pr-4">
                            <span className="inline-flex bg-[#F1F3F9] dark:bg-[#1C2438] py-0.5 px-2 rounded-md items-center gap-1.5 text-xs font-medium text-[#5B6078] dark:text-[#94A3B8]">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#10B981]" : "bg-[#EF4444]"
                                  }`}
                              ></span>
                              {isActive ? "Faol" : "Bloklangan"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {loadingMore && (
                      <tr>
                        <td colSpan={8} className="py-4 text-center text-[#8B90A5] dark:text-[#64748B]">
                          <div className="flex items-center justify-center gap-2 text-xs font-medium">
                            <Loader2 size={16} className="animate-spin text-[#3858C7]" />
                            <span>Yana yuklanmoqda...</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`bg-white dark:bg-[#161C2E] border dark:border-[#2B3553] rounded-2xl shadow-xl p-4 flex items-start gap-3.5 max-w-md ${toastMessage.type === "warning" ? "border-[#F59E0B]/40" : "border-[#10B981]/40"
            }`}>
            <div className={`flex-shrink-0 mt-0.5 ${toastMessage.type === "warning" ? "text-[#F59E0B]" : "text-[#10B981]"
              }`}>
              <HugeiconsIcon icon={toastMessage.type === "warning" ? Alert02Icon : CheckmarkCircle02Icon} size={22} />
            </div>
            <div className="flex-1 pr-2">
              <h4 className="text-[14px] font-bold text-[#1A1D2E] dark:text-white leading-tight">
                {toastMessage.title}
              </h4>
              <p className="text-[12.5px] text-[#5E6480] dark:text-[#94A3B8] mt-1 leading-snug">
                {toastMessage.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-[#8B90A5] hover:text-[#1A1D2E] dark:hover:text-white p-1 rounded-lg hover:bg-[#F1F3F9] dark:hover:bg-[#1C2438] transition-colors cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsReportPage;
