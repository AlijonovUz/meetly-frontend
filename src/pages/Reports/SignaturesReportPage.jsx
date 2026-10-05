import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, Filter, FileSpreadsheet, Loader2, ChevronLeft, ChevronRight, RefreshCw, Eye, X } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, Cancel01Icon, Alert02Icon } from "@hugeicons/core-free-icons";
import { DatePicker, CustomSelect } from "../../components/UI";
import { getSignaturesReport, getParticipantsList, getOrganizersList, getMeetingsList } from "../../services/reportsApi";
import { exportReportToExcel, exportReportToPDF, exportReportToCSV } from "../../lib/exportReport";
import dayjs from "dayjs";

const SignaturesReportPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [isGenerated, setIsGenerated] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters (Exactly 6 filters matching Figma)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [meetingId, setMeetingId] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [signatureStatus, setSignatureStatus] = useState("");

  // Data state
  const [meetingsList, setMeetingsList] = useState([]);
  const [participantsList, setParticipantsList] = useState([]);
  const [organizersList, setOrganizersList] = useState([]);
  const [meetsLoading, setMeetsLoading] = useState(false);
  const [partsLoading, setPartsLoading] = useState(false);
  const [organizersLoading, setOrganizersLoading] = useState(false);
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Signature modal preview
  const [previewSignatureUrl, setPreviewSignatureUrl] = useState(null);

  // Load dropdown references only on mount
  useEffect(() => {
    const loadReferences = async () => {
      try {
        setPartsLoading(true);
        setOrganizersLoading(true);
        setMeetsLoading(true);
        const [parts, orgs, meets] = await Promise.all([
          getParticipantsList(),
          getOrganizersList(),
          getMeetingsList(),
        ]);
        setParticipantsList(parts || []);
        setOrganizersList(orgs || []);
        setMeetingsList(meets || []);
      } catch (err) {
        console.error("Filtr ma'lumotlarini yuklashda xatolik:", err);
      } finally {
        setPartsLoading(false);
        setOrganizersLoading(false);
        setMeetsLoading(false);
      }
    };
    loadReferences();
  }, []);

  // Search meetings via API
  const handleSearchMeetings = useCallback(async (query) => {
    try {
      setMeetsLoading(true);
      const params = query ? { search: query } : {};
      const meets = await getMeetingsList(params);
      setMeetingsList(meets || []);
    } catch (err) {
      console.error("Yig'ilishlarni qidirishda xatolik:", err);
    } finally {
      setMeetsLoading(false);
    }
  }, []);

  // Search participants via API
  const handleSearchParticipants = useCallback(async (query) => {
    try {
      setPartsLoading(true);
      const params = query ? { search: query } : {};
      const parts = await getParticipantsList(params);
      setParticipantsList(parts || []);
    } catch (err) {
      console.error("Ishtirokchilarni qidirishda xatolik:", err);
    } finally {
      setPartsLoading(false);
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
    if (meetingId) count += 1;
    if (participantId) count += 1;
    if (organizerId) count += 1;
    if (signatureStatus) count += 1;
    return count;
  }, [startDate, endDate, meetingId, participantId, organizerId, signatureStatus]);

  // Period label text
  const periodLabelText = useMemo(() => {
    const startStr = startDate ? dayjs(startDate).format("DD.MM.YYYY") : "01.09.2026";
    const endStr = endDate ? dayjs(endDate).format("DD.MM.YYYY") : "30.09.2026";
    const partObj = participantsList.find((p) => p.id === participantId);
    const partStr = partObj ? partObj.name : "Barchasi";

    let stStr = "Barchasi";
    if (signatureStatus === "true") stStr = "Imzolangan";
    else if (signatureStatus === "false") stStr = "Kutilmoqda";

    return `Davr: ${startStr} – ${endStr}, Ishtirokchi: ${partStr}, Imzo: ${stStr}`;
  }, [startDate, endDate, participantId, signatureStatus, participantsList]);

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

        if (meetingId) {
          params.meeting = meetingId;
        }

        if (participantId) {
          params.participant = participantId;
        }

        if (organizerId) {
          params.organizer = organizerId;
        }

        if (signatureStatus !== "") {
          params.signature = signatureStatus === "true";
        }

        const res = await getSignaturesReport(params);
        setReportsData(res.results || []);
        setTotalCount(res.count || 0);
        setTotalPages(res.total_pages || 1);
        setPage(res.page || pageNumber);
        setIsGenerated(true);
      } catch (err) {
        console.error("Imzolar hisobotini olishda xatolik:", err);
        setError("Hisobot ma'lumotlarini yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    },
    [
      searchTerm,
      startDate,
      endDate,
      meetingId,
      participantId,
      organizerId,
      signatureStatus,
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
        {
          key: "participant",
          label: "Ishtirokchi",
          formatter: (val) => val?.full_name || val?.name || val || "",
        },
        {
          key: "meeting",
          label: "Yig'ilish",
          formatter: (val) => (val?.title ? `${val.title} (${val.code || ""})` : val || ""),
        },
        {
          key: "meeting_date",
          label: "Yig'ilish sanasi",
          formatter: (val) => (val ? dayjs(val).format("DD.MM.YYYY HH:mm") : ""),
        },
        {
          key: "signed_at",
          label: "Imzolangan vaqti",
          formatter: (val) => (val ? dayjs(val).format("DD.MM.YYYY HH:mm") : "—"),
        },
        {
          key: "is_signed",
          label: "Holati",
          formatter: (val, r) => (val === true || Boolean(r.signature) ? "Imzolangan" : "Kutilmoqda"),
          align: "right",
        },
      ];

      const title = "Imzolar bo'yicha hisobot";
      const filename = "imzolar_hisoboti";

      if (format === "excel") {
        exportReportToExcel(reportsData, columns, title, periodLabelText, filename);
        setToastMessage({
          type: "success",
          title: "Excel yuklab olindi",
          description: "Imzolar hisoboti Excel (.xlsx) formatida muvaffaqiyatli saqlandi.",
        });
      } else if (format === "pdf") {
        exportReportToPDF(reportsData, columns, title, periodLabelText, filename);
        setToastMessage({
          type: "success",
          title: "PDF yuklab olindi",
          description: "Imzolar hisoboti PDF formatida muvaffaqiyatli saqlandi.",
        });
      } else {
        exportReportToCSV(reportsData, columns, title, periodLabelText, filename);
        setToastMessage({
          type: "success",
          title: "CSV yuklab olindi",
          description: "Imzolar hisoboti CSV formatida muvaffaqiyatli saqlandi.",
        });
      }
    };

    window.addEventListener("export-report", handleExportEvent);
    return () => window.removeEventListener("export-report", handleExportEvent);
  }, [isGenerated, reportsData, periodLabelText]);

  // Meeting dropdown options
  const meetingOptions = useMemo(() => {
    const base = [{ value: "", label: "Yig'ilishni tanlang" }];
    const items = meetingsList.map((m) => ({
      value: m.id,
      label: m.title ? `${m.title} ${m.code ? `(${m.code})` : ""}` : m.code || m.id,
    }));
    return [...base, ...items];
  }, [meetingsList]);

  // Participant dropdown options
  const participantOptions = useMemo(() => {
    const base = [{ value: "", label: "Ishtirokchini tanlang" }];
    const items = participantsList.map((p) => ({
      value: p.id || p.name,
      label: p.name || p.full_name || p.id,
    }));
    return [...base, ...items];
  }, [participantsList]);

  // Organizer dropdown options
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

      {/* Collapsible Filters: 3 columns layout matching Figma (6 filters total) */}
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
                Yig'ilish
              </label>
              <CustomSelect
                value={meetingId}
                onChange={(v) => setMeetingId(v)}
                options={meetingOptions}
                placeholder="Yig'ilishni tanlang"
                searchable={true}
                onSearch={handleSearchMeetings}
                loading={meetsLoading}
              />
            </div>

            {/* Row 2 */}
            <div>
              <label className="block text-[12px] font-medium text-[#5E6480] mb-1.5">
                Ishtirokchi
              </label>
              <CustomSelect
                value={participantId}
                onChange={(v) => setParticipantId(v)}
                options={participantOptions}
                placeholder="Ishtirokchini tanlang"
                searchable={true}
                onSearch={handleSearchParticipants}
                loading={partsLoading}
              />
            </div>

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
                Imzo holati
              </label>
              <CustomSelect
                value={signatureStatus}
                onChange={(v) => setSignatureStatus(v)}
                options={[
                  { value: "", label: "Barchasi" },
                  { value: "true", label: "Imzolangan" },
                  { value: "false", label: "Kutilmoqda" },
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
                  <th className="py-3 px-3 w-12 font-medium">№</th>
                  <th className="py-3 px-3 font-medium">Ishtirokchi</th>
                  <th className="py-3 px-3 font-medium">Yig'ilish</th>
                  <th className="py-3 px-3 font-medium text-right">Yig'ilish sanasi</th>
                  <th className="py-3 px-3 font-medium text-right">Imzolangan vaqti</th>
                  <th className="py-3 px-3 font-medium text-center">Imzo</th>
                  <th className="py-3 px-3 font-medium text-right pr-4">Holati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F9]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-[#8B90A5]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 size={24} className="animate-spin text-[#3858C7]" />
                        <span className="text-[13px]">Imzolar hisoboti yuklanmoqda...</span>
                      </div>
                    </td>
                  </tr>
                ) : reportsData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-[#8B90A5] text-[13.5px]">
                      Tanlangan parametrlar bo'yicha hech qanday imzo topilmadi.
                    </td>
                  </tr>
                ) : (
                  reportsData.map((row, idx) => {
                    const rowIdx = (page - 1) * 20 + idx + 1;
                    const participantName =
                      row.participant?.full_name ||
                      row.participant?.name ||
                      (typeof row.participant === "string" ? row.participant : "");
                    const meetingTitle = row.meeting?.title || "Nomsiz yig'ilish";
                    const meetingCode = row.meeting?.code || "";
                    const meetingDateFormatted = row.meeting_date
                      ? dayjs(row.meeting_date).format("DD.MM.YYYY HH:mm")
                      : "";
                    const signedAtFormatted = row.signed_at
                      ? dayjs(row.signed_at).format("DD.MM.YYYY HH:mm")
                      : "";
                    const isSigned = row.is_signed === true || Boolean(row.signature);

                    return (
                      <tr
                        key={row.id || idx}
                        className="hover:bg-[#F8FAFC] transition-colors text-[13px] text-[#1A1D2E]"
                      >
                        <td className="py-3.5 px-3 text-[#8B90A5]">{rowIdx}</td>
                        <td className="py-3.5 px-3 font-semibold text-[#1A1D2E]">
                          <div className="flex items-center gap-2.5">
                            {row.participant?.avatar ? (
                              <img
                                src={row.participant.avatar}
                                alt={participantName}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#EEF2FB] text-[#3858C7] text-xs font-bold flex items-center justify-center">
                                {participantName[0]?.toUpperCase() || "I"}
                              </div>
                            )}
                            <span>{participantName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-[#1A1D2E] leading-tight">
                            {meetingTitle}
                          </div>
                          {meetingCode && (
                            <div className="text-[11px] text-[#8B90A5] mt-0.5 font-mono">
                              {meetingCode}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-[#5E6480] text-right whitespace-nowrap">
                          {meetingDateFormatted}
                        </td>
                        <td className="py-3.5 px-3 text-[#5E6480] text-right whitespace-nowrap">
                          {signedAtFormatted}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {row.signature ? (
                            <button
                              type="button"
                              onClick={() => setPreviewSignatureUrl(row.signature)}
                              className="inline-flex items-center justify-center p-1 rounded-md border border-[#E2E6F2] bg-white hover:bg-[#F8FAFC] hover:border-[#3858C7] transition-all cursor-pointer group shadow-2xs"
                              title="Imzoni kattalashtirib ko'rish"
                            >
                              <img
                                src={row.signature}
                                alt="Imzo"
                                className="h-6 max-w-[72px] object-contain group-hover:scale-105 transition-transform"
                              />
                            </button>
                          ) : (
                            <span className="text-[#8B90A5] text-xs"></span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right pr-4">
                          <span className="inline-flex bg-[#F1F3F9] py-0.5 px-2 rounded-md items-center gap-1.5 text-xs font-medium text-[#5B6078]">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSigned ? "bg-[#10B981]" : "bg-[#F59E0B]"
                              }`}
                            ></span>
                            {isSigned ? "Imzolangan" : "Kutilmoqda"}
                          </span>
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

      {/* Signature Image Preview Modal */}
      {previewSignatureUrl && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewSignatureUrl(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F1F3F9]">
              <h3 className="text-[16px] font-bold text-[#1A1D2E]">Imzo ko'rinishi</h3>
              <button
                type="button"
                onClick={() => setPreviewSignatureUrl(null)}
                className="p-1.5 rounded-xl hover:bg-[#F1F3F9] text-[#8B90A5] hover:text-[#1A1D2E] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E6F2] rounded-2xl p-6 flex items-center justify-center min-h-[180px]">
              <img
                src={previewSignatureUrl}
                alt="Imzo"
                className="max-h-48 max-w-full object-contain"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewSignatureUrl(null)}
                className="px-5 py-2 bg-[#3858C7] hover:bg-[#2C48B0] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
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

export default SignaturesReportPage;
