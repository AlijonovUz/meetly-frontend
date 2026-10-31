import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Tick02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { Check, Loader2, Ban } from "lucide-react";
import { DatePicker, TimePicker, CustomSelect } from "../../components/UI";
import AttendanceSignatureModal from "../../components/Modals/AttendanceSignatureModal";
import { getCurrentUser } from "../../services/auth";
import {
  getMeetingById,
  updateMeeting,
  cancelMeeting,
  getMeetingAttendances,
} from "../../services/meetingsApi";

const DURATION_OPTIONS = [
  { value: "15", label: "15 daqiqa" },
  { value: "30", label: "30 daqiqa" },
  { value: "40", label: "40 daqiqa" },
  { value: "45", label: "45 daqiqa" },
  { value: "60", label: "1 soat" },
  { value: "90", label: "1.5 soat" },
  { value: "120", label: "2 soat" },
];

const APPROVAL_OPTIONS = [
  { value: "false", label: "Talab qilinmaydi" },
  { value: "true", label: "Talab qilinadi" },
];

const MeetingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states for editable meeting
  const [startDateStr, setStartDateStr] = useState("");
  const [startTimeStr, setStartTimeStr] = useState("");
  const [durationVal, setDurationVal] = useState("30");
  const [requiresApprovalVal, setRequiresApprovalVal] = useState("false");
  const [isSaving, setIsSaving] = useState(false);

  // Copy link state
  const [copiedLink, setCopiedLink] = useState(false);

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Signature modal state
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [userSignedLocally, setUserSignedLocally] = useState(false);

  // Signature preview modal state
  const [previewSignature, setPreviewSignature] = useState(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Format Helper: date & time extraction
  const extractDateAndTimeToFields = (isoStr) => {
    if (!isoStr) return { date: "", time: "" };
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return { date: "", time: "" };
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      return {
        date: `${day}.${month}.${year}`,
        time: `${hours}:${mins}`,
      };
    } catch {
      return { date: "", time: "" };
    }
  };

  const formatDisplayDateTime = (isoStr) => {
    if (!isoStr) return "";
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

  // Fetch meeting details & attendances
  const fetchMeeting = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, attendancesRes] = await Promise.all([
        getMeetingById(id),
        getMeetingAttendances({ meeting: id }).catch((err) => {
          console.error("Qatnashuvchilarni yuklashda xatolik:", err);
          return { results: [] };
        }),
      ]);

      setMeeting(data);
      setAttendances(attendancesRes.results || []);

      if (data?.title || data?.name) {
        window.dispatchEvent(
          new CustomEvent("set-navbar-title", {
            detail: { id, title: data.title || data.name },
          })
        );
      }

      const { date, time } = extractDateAndTimeToFields(data.start_date);
      setStartDateStr(date);
      setStartTimeStr(time);
      setDurationVal(String(data.duration || 30));
      setRequiresApprovalVal(data.requires_approval ? "true" : "false");
    } catch (err) {
      console.error("Yig'ilish tafsilotlarini yuklashda xatolik:", err);
      setError("Yig'ilish ma'lumotlarini yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchMeeting();
    }
  }, [id, fetchMeeting]);

  const isCancelled =
    meeting?.status === "cancelled" || meeting?.status === "bekor qilingan";
  const isCompleted =
    meeting?.status === "completed" || meeting?.status === "tugallangan" || meeting?.status === "closed" || meeting?.is_active === false;
  const isEnded = isCancelled || isCompleted;
  const isScheduled =
    meeting?.status === "scheduled" || meeting?.status === "rejalashtirilgan";

  const handleCopyLink = () => {
    if (isEnded) return;
    const code = meeting?.code || meeting?.id || "";
    const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "https://meetly.uz";
    const fullLink = `${origin}/join/${code}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(fullLink);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Save changes
  const handleSaveChanges = async () => {
    if (!meeting) return;

    try {
      setIsSaving(true);

      // Parse date & time to ISO
      let isoStartDate = meeting.start_date;
      if (startDateStr && startTimeStr) {
        const [d, m, y] = startDateStr.split(".").map(Number);
        const [hh, mm] = startTimeStr.split(":").map(Number);
        const newDate = new Date(y, m - 1, d, hh, mm);
        if (!isNaN(newDate.getTime())) {
          if (newDate < new Date(Date.now() - 60000)) {
            setToastMessage({
              type: "error",
              title: "Xatolik yuz berdi",
              description: "Boshlanish vaqti hozirgi vaqtdan oldin bo'lishi mumkin emas.",
            });
            setIsSaving(false);
            return;
          }
          isoStartDate = newDate.toISOString();
        }
      }

      const payload = {
        start_date: isoStartDate,
        duration: parseInt(durationVal, 10) || 30,
        requires_approval: requiresApprovalVal === "true",
      };

      const updated = await updateMeeting(meeting.id, payload);
      setMeeting(updated);

      setToastMessage({
        type: "success",
        title: "Muvaffaqiyatli saqlandi",
        description: "Yig'ilish ma'lumotlari yangilandi.",
      });
    } catch (err) {
      console.error("Saqlashda xatolik:", err);
      setToastMessage({
        type: "error",
        title: "Xatolik yuz berdi",
        description:
          err?.response?.data?.message ||
          "Ma'lumotlarni saqlashda xatolik yuz berdi.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel meeting
  const handleConfirmCancel = async () => {
    if (!meeting || !cancelReason.trim()) return;

    try {
      setIsCancelling(true);
      const res = await cancelMeeting(meeting.id, {
        reason: cancelReason.trim(),
      });
      setMeeting(res);
      setCancelModalOpen(false);
      setCancelReason("");

      setToastMessage({
        type: "success",
        title: "Yig'ilish bekor qilindi",
        description: "Yig'ilish muvaffaqiyatli bekor qilindi.",
      });
    } catch (err) {
      console.error("Bekor qilishda xatolik:", err);
      setToastMessage({
        type: "error",
        title: "Xatolik yuz berdi",
        description:
          err?.response?.data?.message ||
          "Yig'ilishni bekor qilishda xatolik yuz berdi.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const currentUser = useMemo(() => getCurrentUser(), []);

  const organizerName = useMemo(() => {
    if (!meeting) return "";
    if (meeting.organizer_info) {
      const full = `${meeting.organizer_info.first_name || ""} ${meeting.organizer_info.last_name || ""
        }`.trim();
      if (full) return full;
    }
    return meeting.organizer || "Tashkilotchi";
  }, [meeting]);

  const inviteLinkText = useMemo(() => {
    const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "https://meetly.uz";
    if (!meeting) return `${origin}/join/`;
    return `${origin}/join/${meeting.code}`;
  }, [meeting]);

  const isChanged = useMemo(() => {
    if (!meeting) return false;
    const { date, time } = extractDateAndTimeToFields(meeting.start_date);
    const origDuration = String(meeting.duration || 30);
    const origApproval = meeting.requires_approval ? "true" : "false";

    return (
      startDateStr !== date ||
      startTimeStr !== time ||
      durationVal !== origDuration ||
      requiresApprovalVal !== origApproval
    );
  }, [meeting, startDateStr, startTimeStr, durationVal, requiresApprovalVal]);

  const participantsList = useMemo(() => {
    if (attendances && attendances.length > 0) return attendances;
    return meeting?.participants || [];
  }, [attendances, meeting]);

  // Find current user's attendance record
  const myAttendance = useMemo(() => {
    if (!currentUser) return null;
    const findMatch = (list) =>
      list.find((att) => {
        const u = att.user_info || att.user;
        if (!u) return false;
        if (typeof u === "object") {
          if (u.id && currentUser.id && String(u.id) === String(currentUser.id)) return true;
          if (u.phone_number && currentUser.phone_number && u.phone_number === currentUser.phone_number) return true;
          if (u.email && currentUser.email && u.email === currentUser.email) return true;
        } else {
          if (String(u) === String(currentUser.id)) return true;
        }
        return false;
      });

    return findMatch(attendances) || findMatch(meeting?.participants || []);
  }, [attendances, meeting, currentUser]);

  // Check if current user has already signed this meeting
  const isSigned = useMemo(() => {
    if (userSignedLocally) return true;
    if (myAttendance) {
      return Boolean(myAttendance.signature || myAttendance.is_signed === true);
    }
    if (meeting?.is_signed === true || Boolean(meeting?.signature) || Boolean(meeting?.user_signature)) {
      return true;
    }
    return false;
  }, [userSignedLocally, myAttendance, meeting]);

  // Notification / meeting data for signature modal
  const signatureModalData = useMemo(() => {
    if (!meeting) return null;
    const { date, time } = extractDateAndTimeToFields(meeting.start_date);
    return {
      id: myAttendance?.id || meeting.id,
      title: meeting.title || meeting.name,
      extra_data: {
        attendance_id: myAttendance?.id,
        meeting_id: meeting.id,
        meeting_title: meeting.title || meeting.name,
        start_date: meeting.start_date,
        date: date,
        start_time: time,
        duration_text: meeting.duration ? `${meeting.duration} daqiqa` : undefined,
      },
    };
  }, [meeting, myAttendance]);

  const handleSignatureSuccess = async () => {
    setUserSignedLocally(true);
    setToastMessage({
      type: "success",
      title: "Imzo saqlandi",
      description: "Yig'ilishga imzo muvaffaqiyatli qo'yildi.",
    });
    await fetchMeeting();
  };

  const getAttendeeName = (item) => {
    if (item?.user_info) {
      const full = `${item.user_info.first_name || ""} ${item.user_info.last_name || ""}`.trim();
      if (full) return full;
      if (item.user_info.phone_number) return item.user_info.phone_number;
      if (item.user_info.email) return item.user_info.email;
    }
    return (
      item?.name ||
      `${item?.first_name || ""} ${item?.last_name || ""}`.trim() ||
      "Foydalanuvchi"
    );
  };

  const isSelectedDateToday = useMemo(() => {
    if (!startDateStr) return false;
    const parts = startDateStr.split(".");
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const sel = new Date(y, m, d);
      return dayjs(sel).isSame(dayjs(), "day");
    }
    return false;
  }, [startDateStr]);

  const minStartTime = isSelectedDateToday ? dayjs().format("HH:mm") : undefined;

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[50vh] text-[#8B90A5] gap-3 font-['Manrope',sans-serif]">
        <Loader2 className="w-8 h-8 text-[#4763E4] animate-spin" />
        <span className="text-sm font-medium">Yig'ilish ma'lumotlari yuklanmoqda...</span>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="p-8 font-['Manrope',sans-serif]">
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">Xatolik</h3>
            <p className="text-sm mt-0.5">{error || "Yig'ilish topilmadi"}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/meetings")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            Ortga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 py-5 space-y-4 font-['Manrope',sans-serif]">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-[26px] font-bold text-[#1A1D2E] dark:text-white tracking-tight truncate max-w-full">
          {meeting.title || meeting.name || "Yig'ilish"}
        </h1>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Imzo qo'yish tugmasi (faqat yig'ilish qatnashchisi bo'lsa, imzo qo'yilmagan va bekor qilinmagan bo'lsa) */}
          {Boolean(myAttendance) && !isSigned && !isCancelled && isCompleted && (
            <button
              type="button"
              onClick={() => setSignatureModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3 bg-[#3858C7] hover:bg-[#2F4BB8] active:scale-[0.98] text-white rounded-xl text-[13.5px] font-bold transition-all shadow-xs cursor-pointer"
            >
              <HugeiconsIcon icon={Edit02Icon} size={16} strokeWidth={2.2} />
              <span>Imzo qo'yish</span>
            </button>
          )}

          {/* Right Action: Cancel Button OR Status Pill */}
          {isCancelled ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold text-[#5B6078] dark:text-[#94A3B8] bg-[#EEF2F6] dark:bg-[#1E263C]">
              <span className="w-2 h-2 rounded-full bg-[#94A3B8]"></span>
              <span>Bekor qilingan</span>
            </div>
          ) : isCompleted ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold text-[#10B981] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#10B981]/15 border border-[#A7F3D0] dark:border-[#10B981]/30">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>Tugallangan</span>
            </div>
          ) : isScheduled ? (
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3 border bg-white dark:bg-[#161C2E] border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[#EF4444]/10 active:scale-[0.98] rounded-xl text-[13.5px] font-extrabold transition-all shadow-2xs cursor-pointer"
            >
              <Ban size={16} strokeWidth={2.2} />
              <span>Yig'ilishni bekor qilish</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold text-[#3858C7] dark:text-[#7F95E6] bg-[#EEF2FB] dark:bg-[#3858C7]/15 border border-[#BFDBFE] dark:border-[#3858C7]/30">
              <span className="w-2 h-2 rounded-full bg-[#3858C7] animate-pulse"></span>
              <span>Davom etmoqda</span>
            </div>
          )}
        </div>
      </div>

      {/* Cancelled Banner (Shown when status is cancelled) */}
      {isCancelled && (
        <div className="bg-[#FEF2F2] dark:bg-red-950/25 border border-[#FCA5A5] dark:border-red-900/40 rounded-2xl p-4 sm:p-5 text-[13px] text-[#1A1D2E] dark:text-slate-200 space-y-1 animate-in fade-in duration-200">
          <h4 className="font-bold text-[#DC2626] dark:text-red-400 text-[14px]">
            Yig'ilish bekor qilingan
          </h4>
          <p className="text-[#4B5563] dark:text-slate-400 leading-relaxed">
            {formatDisplayDateTime(meeting.updated_at || meeting.completed_at)},{" "}
            <span className="font-semibold text-[#1A1D2E] dark:text-white">{organizerName}</span>{" "}
            tomonidan. Sabab:{" "}
            <span className="text-[#1A1D2E] dark:text-white">
              {meeting.cancellation_reason || "Ko'rsatilmagan"}
            </span>
          </p>
        </div>
      )}

      {/* Taklif havolasi Card */}
      <div className="space-y-1.5">
        <label className="block text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8]">
          Taklif havolasi
        </label>
        <div className={`flex items-center justify-between border rounded-2xl px-5 h-11 bg-white dark:bg-[#121624] border-[#E2E6F2] dark:border-[#2B3553] shadow-2xs transition-colors ${
          isEnded ? "cursor-default" : ""
        }`}>
          <span className={`text-[14px] font-bold truncate pr-4 ${
            isEnded ? "text-[#1A1D2E] dark:text-slate-400 select-none" : "text-[#1A1D2E] dark:text-white"
          }`}>
            {inviteLinkText}
          </span>
          {!isEnded ? (
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#3858C7] dark:text-[#7F95E6] hover:text-[#2F4BB8] transition-colors cursor-pointer flex-shrink-0"
            >
              <HugeiconsIcon
                icon={copiedLink ? Tick02Icon : Copy01Icon}
                size={16}
                strokeWidth={2.5}
              />
              <span>{copiedLink ? "Nusxalandi!" : "Nusxalash"}</span>
            </button>
          ) : (
            <span className="text-xs font-semibold text-[#8B90A5] dark:text-[#64748B] flex-shrink-0 select-none">
              Muddati tugagan
            </span>
          )}
        </div>
      </div>

      {/* Info Grid (4 fields) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Boshlanish sanasi */}
        <div>
          <label className="block text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] mb-1.5">
            Boshlanish sanasi
          </label>
          {isScheduled ? (
            <DatePicker
              value={startDateStr}
              onChange={(d) => {
                if (!d) setStartDateStr("");
                else {
                  const day = String(d.getDate()).padStart(2, "0");
                  const month = String(d.getMonth() + 1).padStart(2, "0");
                  const year = d.getFullYear();
                  setStartDateStr(`${day}.${month}.${year}`);
                }
              }}
              minDate={new Date()}
              placeholder="01.10.2026"
              inputClassName="h-11! rounded-xl! border-[#E2E6F2]! dark:border-[#2B3553]! text-[13.5px]! font-semibold! text-[#1A1D2E]! dark:text-white!"
            />
          ) : (
            <div className="flex items-center justify-between bg-white dark:bg-[#121624] border border-[#E2E6F2] dark:border-[#2B3553] rounded-xl px-4 h-11 text-[13.5px] font-semibold text-[#1A1D2E] dark:text-white shadow-2xs">
              <span>{startDateStr || ""}</span>
            </div>
          )}
        </div>

        {/* Vaqti */}
        <div>
          <label className="block text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] mb-1.5">
            Vaqti
          </label>
          {isScheduled ? (
            <TimePicker
              value={startTimeStr}
              onChange={setStartTimeStr}
              minTime={minStartTime}
              placeholder="15:00"
              className="h-11! rounded-xl! border-[#E2E6F2]! dark:border-[#2B3553]! text-[13.5px]! font-semibold! text-[#1A1D2E]! dark:text-white!"
            />
          ) : (
            <div className="flex items-center justify-between bg-white dark:bg-[#121624] border border-[#E2E6F2] dark:border-[#2B3553] rounded-xl px-4 h-11 text-[13.5px] font-semibold text-[#1A1D2E] dark:text-white shadow-2xs">
              <span>{startTimeStr || ""}</span>
            </div>
          )}
        </div>

        {/* Davomiyligi */}
        <div>
          <label className="block text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] mb-1.5">
            Davomiyligi
          </label>
          {isScheduled ? (
            <div className="flex items-center bg-white dark:bg-[#121624] border border-[#E2E6F2] dark:border-[#2B3553] rounded-xl px-4 h-11 text-[13.5px] text-[#1A1D2E] dark:text-white focus-within:border-[#3858C7] focus-within:ring-2 focus-within:ring-[#3858C7]/10 transition-all shadow-2xs">
              <input
                type="text"
                inputMode="numeric"
                value={durationVal}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/\D/g, "");
                  setDurationVal(onlyNums);
                }}
                placeholder="30"
                className="w-full h-11! bg-transparent text-[#1A1D2E] dark:text-white placeholder-[#8B90A5] dark:placeholder-[#64748B] focus:outline-none font-semibold text-[13.5px]"
              />
              <span className="text-[#8B90A5] dark:text-[#64748B] text-[13px] font-medium ml-1.5 select-none shrink-0">
                daqiqa
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white dark:bg-[#121624] border border-[#E2E6F2] dark:border-[#2B3553] rounded-xl px-4 h-11 text-[13.5px] font-semibold text-[#1A1D2E] dark:text-white shadow-2xs">
              <span>{durationVal ? `${durationVal} daqiqa` : ""}</span>
            </div>
          )}
        </div>

        {/* Tasdiqlash talabi */}
        <div>
          <label className="block text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] mb-1.5">
            Tasdiqlash talabi
          </label>
          {isScheduled ? (
            <CustomSelect
              value={requiresApprovalVal}
              onChange={setRequiresApprovalVal}
              options={APPROVAL_OPTIONS}
              placeholder="Talab qilinmaydi"
              searchable={false}
              className="h-11! rounded-xl! text-[13.5px]! font-semibold!"
            />
          ) : (
            <div className="flex items-center justify-between bg-white dark:bg-[#121624] border border-[#E2E6F2] dark:border-[#2B3553] rounded-xl px-4 h-11 text-[13.5px] font-semibold text-[#1A1D2E] dark:text-white shadow-2xs">
              <span>
                {requiresApprovalVal === "true"
                  ? "Talab qilinadi"
                  : "Talab qilinmaydi"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notice & Save Button (Only if scheduled) */}
      {isScheduled && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <p className="text-[12.5px] text-[#8B90A5] dark:text-[#64748B]">
            Yig'ilish boshlanmaguncha sana, vaqt va davomiylikni o'zgartirish mumkin.
          </p>
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={!isChanged || isSaving}
            className="inline-flex items-center gap-2 bg-[#3858C7] hover:bg-[#2F4BB8] text-white text-[13.5px] font-semibold px-5 py-3 rounded-xl transition-all shadow-xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-default disabled:active:scale-100 cursor-pointer"
          > 
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check strokeWidth={2.5} size={18} />
            )}
            <span>{isSaving ? "Saqlanmoqda..." : "Saqlash"}</span>
          </button>
        </div>
      )}

      {/* Ishtirokchilar Section */}
      <div className="space-y-3">
        <h2 className="text-[17px] font-bold text-[#1A1D2E] dark:text-white">
          Ishtirokchilar
        </h2>

        {isCancelled ? (
          <div className="p-6 text-center text-[#8B90A5] dark:text-[#64748B] text-[13.5px]">
            Yig'ilish bekor qilingani haqida ishtirokchilarga xabar yuborildi. Taklif havolasi endi ishlamaydi.
          </div>
        ) : (
          <div className="overflow-auto h-[calc(100vh-450px)]">
            <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="sticky top-0 z-10 bg-[#F8F9FC] dark:bg-[#161B22] border-b border-[#E2E6F2] dark:border-[#2B3553] text-[#8B90A5] dark:text-[#94A3B8] text-[13px] font-medium">
                  <th className="py-3 px-4 font-normal w-12 text-center">№</th>
                  <th className="py-3 px-4 font-normal">Ism Sharif</th>
                  <th className="py-3 px-4 font-normal text-right">Kirgan vaqti</th>
                  <th className="py-3 px-4 font-normal text-right">Chiqgan vaqti</th>
                  <th className="py-3 px-4 font-normal text-right">Sarflangan vaqt</th>
                  <th className="py-3 px-4 font-normal text-right">Holati</th>
                  <th className="py-3 px-4 font-normal text-right">Imzo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6F2]/60 dark:divide-[#2B3553]/60 text-[13.5px]">
                {participantsList.length > 0 ? (
                  participantsList.map((p, idx) => (
                    <tr
                      key={p.id || idx}
                      className="hover:bg-[#F8F9FC]/60 dark:hover:bg-[#1C2438] transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-medium text-[13px] text-[#8B90A5] dark:text-[#64748B]">
                        {idx + 1}
                      </td>
                      <td onClick={() => navigate(`/users/${p.user_info?.id}`)} className="py-3.5 px-4 font-semibold text-[#1A1D2E] dark:text-white cursor-pointer hover:text-[#3858C7] dark:hover:text-[#7F95E6]">
                        {getAttendeeName(p)}
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        <span
                          className={
                            p.is_late
                              ? "text-[#EF4444] font-medium"
                              : "text-[#1A1D2E] dark:text-slate-300"
                          }
                        >
                          {p.joined_at
                            ? formatDisplayDateTime(p.joined_at)
                            : p.joinTime || ""}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-end text-[#1A1D2E] dark:text-slate-300">
                        {p.left_at ? formatDisplayDateTime(p.left_at) : ""}
                      </td>
                      <td className="py-3.5 px-4 text-end text-[#1A1D2E] dark:text-slate-300">
                        {p.duration != null ? `${p.duration} daqiqa` : ""}
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        {p.is_late ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] bg-[#F1F3F9] dark:bg-[#1E263C]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                            <span>Kechikdi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] bg-[#F1F3F9] dark:bg-[#1E263C]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                            <span>Qatnashdi</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-end flex items-center justify-end">
                        {p.signature ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewSignature({
                                url: p.signature,
                                name: getAttendeeName(p),
                              })
                            }
                            className="border border-[#E2E6F2] dark:border-[#2B3553] hover:border-[#3858C7] hover:bg-[#F8FAFC] dark:hover:bg-[#1C2438] rounded-xl px-2.5 py-1 w-24 h-9 flex items-center justify-center bg-white dark:bg-[#121624] shadow-2xs cursor-pointer group transition-all"
                            title="Imzoni kattalashtirib ko'rish"
                          >
                            <img
                              src={p.signature}
                              alt="Imzo"
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform dark:invert"
                            />
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold text-[#D97706] dark:text-[#FBBF24] bg-[#FFFBEB] dark:bg-[#F59E0B]/15">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                            <span>Imzolanmagan</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 px-6 text-center text-[#8B90A5] dark:text-[#64748B] text-[13.5px]"
                    >
                      Hozircha ishtirokchilar yo'q. Havolani yuboring, qo'shilganlar shu yerda ko'rinadi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL: YIG'ILISHNI BEKOR QILISH ================= */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#161C2E] rounded-3xl shadow-2xl border border-[#E2E6F2] dark:border-[#2B3553] w-full max-w-[540px] overflow-hidden p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1A1D2E] dark:text-white tracking-tight">
                Yig'ilishni bekor qilish
              </h3>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="p-1 rounded-lg text-[#8B90A5] hover:text-[#1A1D2E] dark:hover:text-white hover:bg-[#F1F3F9] dark:hover:bg-[#232E47] transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
            </div>

            {/* Description */}
            <p className="text-[13.5px] text-[#5B6078] dark:text-[#94A3B8] leading-relaxed">
              «<span className="font-semibold text-[#1A1D2E] dark:text-white">{meeting.title || meeting.name}</span>» bekor qilinadi. Taklif havolasi ishlamay qoladi, ishtirokchilarga sabab bilan xabar yuboriladi.
            </p>

            {/* Reason Field */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#1A1D2E] dark:text-white">
                Sabab *
              </label>
              <textarea
                rows={4}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Tashkilotchi xizmat safarida, yig'ilish keyingi haftaga ko'chiriladi."
                className="w-full bg-[#FAFAFA] dark:bg-[#121624] border border-[#E2E6F2] dark:border-[#2B3553] rounded-2xl p-4 text-[13.5px] text-[#1A1D2E] dark:text-white placeholder-[#8B90A5] dark:placeholder-[#64748B] focus:outline-none focus:border-[#EF4444] focus:bg-white dark:focus:bg-[#121624] focus:ring-2 focus:ring-[#EF4444]/10 transition-all shadow-2xs resize-none"
              />
            </div>

            {/* Action Footer */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[14px] font-bold text-[#1A1D2E] dark:text-white hover:bg-[#F1F3F9] dark:hover:bg-[#232E47] transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
                <span>Orqaga</span>
              </button>

              <button
                type="button"
                disabled={!cancelReason.trim() || isCancelling}
                onClick={handleConfirmCancel}
                className="flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white text-[13.5px] font-semibold px-4 py-3 rounded-2xl transition-all shadow-xs active:scale-[0.98] cursor-pointer"
              >
                {isCancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Ban size={17} strokeWidth={2.4} />
                )}
                <span>Yig'ilishni bekor qilish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: IMZO QO'YISH ================= */}
      <AttendanceSignatureModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        notificationData={signatureModalData}
        onSuccess={handleSignatureSuccess}
      />

      {/* ================= MODAL: IMZONI KATTALASHTIRIB KO'RISH ================= */}
      {previewSignature && (
        <div
          className="fixed inset-0 z-[99999] bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewSignature(null)}
        >
          <div
            className="bg-white dark:bg-[#161C2E] border border-slate-200/90 dark:border-[#2B3553] rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-150 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F9] dark:border-[#232E47]">
              <div>
                <h3 className="text-base font-bold text-[#1A1D2E] dark:text-white">Imzo ko'rinishi</h3>
                {previewSignature.name && (
                  <p className="text-xs text-[#8B90A5] dark:text-[#94A3B8] font-medium mt-0.5">{previewSignature.name}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewSignature(null)}
                className="p-1.5 rounded-xl hover:bg-[#F1F3F9] dark:hover:bg-[#232E47] text-[#8B90A5] dark:text-[#94A3B8] hover:text-[#1A1D2E] dark:hover:text-white transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
              </button>
            </div>

            {/* Enlarged Signature Display */}
            <div className="bg-[#F8FAFC] dark:bg-[#121624] border border-[#E2E6F2] dark:border-[#2B3553] rounded-2xl p-6 flex items-center justify-center min-h-[220px] max-h-[360px] overflow-hidden">
              <img
                src={previewSignature.url}
                alt="Imzo"
                className="max-h-full max-w-full object-contain dark:invert"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setPreviewSignature(null)}
                className="px-5 py-2.5 bg-[#F1F3F9] dark:bg-[#1C2438] hover:bg-[#E2E6F2] dark:hover:bg-[#232E47] text-[#1A1D2E] dark:text-white text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`bg-white dark:bg-[#161C2E] border rounded-2xl shadow-xl p-4 flex items-start gap-3.5 max-w-md ${toastMessage.type === "error"
                ? "border-[#FECDCA] dark:border-red-900/50"
                : "border-[#10B981]/40 dark:border-[#10B981]/30"
              }`}
          >
            <div
              className={`flex-shrink-0 mt-0.5 ${toastMessage.type === "error" ? "text-[#D92D20]" : "text-[#10B981]"
                }`}
            >
              {toastMessage.type === "error" ? (
                <div className="w-6 h-6 rounded-full bg-[#FEF3F2] dark:bg-red-950/40 flex items-center justify-center text-[#D92D20]">
                  <HugeiconsIcon icon={Cancel01Icon} size={15} strokeWidth={2.5} />
                </div>
              ) : (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} />
              )}
            </div>
            <div className="flex-1 pr-2">
              <h4
                className={`text-[14px] font-bold leading-tight ${toastMessage.type === "error" ? "text-[#D92D20]" : "text-[#1A1D2E] dark:text-white"
                  }`}
              >
                {toastMessage.title}
              </h4>
              <p className="text-[12.5px] text-[#5E6480] dark:text-[#94A3B8] mt-1 leading-snug">
                {toastMessage.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-[#8B90A5] hover:text-[#1A1D2E] dark:hover:text-white p-1 rounded-lg hover:bg-[#F1F3F9] dark:hover:bg-[#232E47] transition-colors cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingDetailPage;
