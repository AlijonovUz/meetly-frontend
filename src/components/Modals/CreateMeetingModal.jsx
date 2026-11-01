import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Copy01Icon,
  Tick02Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { Check, Loader2 } from "lucide-react";
import { CustomSelect, DatePicker, TimePicker } from "../UI";
import { createMeeting } from "../../services/meetingsApi";

const CreateMeetingModal = ({
  isOpen,
  onClose,
  onMeetingCreated,
}) => {
  const [newMeetingName, setNewMeetingName] = useState("");
  const [newMeetingDesc, setNewMeetingDesc] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newRequireApproval, setNewRequireApproval] = useState(true);
  const [newAllowJoinBeforeHost, setNewAllowJoinBeforeHost] = useState(false);

  const [createdModalData, setCreatedModalData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [descTextareaHeight, setDescTextareaHeight] = useState(90);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [errors, setErrors] = useState({});

  // Drag handler for textarea resize
  const handleMouseDownResize = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = descTextareaHeight;

    const handleMouseMove = (moveEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(70, Math.min(300, startHeight + delta));
      setDescTextareaHeight(newHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const parseDurationMinutes = (val) => {
    if (typeof val === "number") return val;
    if (!val) return 0;
    const num = parseInt(val, 10);
    return isNaN(num) || num <= 0 ? 0 : num;
  };

  useEffect(() => {
    if (isOpen) {
      setNewMeetingName("");
      setNewMeetingDesc("");
      setNewStartDate("");
      setNewStartTime("");
      setNewDuration("");
      setNewRequireApproval(true);
      setNewAllowJoinBeforeHost(false);
      setDescTextareaHeight(90);
      setCreatedModalData(null);
      setCopiedLink(false);
      setFormError(null);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const isSelectedDateToday = useMemo(() => {
    if (!newStartDate) return true;
    const parts = newStartDate.split(".");
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const sel = new Date(y, m, d);
      return dayjs(sel).isSame(dayjs(), "day");
    }
    return true;
  }, [newStartDate]);

  const minStartTime = isSelectedDateToday ? dayjs().format("HH:mm") : undefined;

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!newMeetingName.trim()) {
      newErrors.title = "Yig'ilish nomini kiritish majburiy";
    }

    if (!newStartDate || !newStartDate.trim()) {
      newErrors.startDate = "Boshlanish sanasini tanlash majburiy";
    }

    if (!newStartTime || !newStartTime.trim()) {
      newErrors.startTime = "Boshlanish vaqtini kiritish majburiy";
    }

    if (!newDuration || !newDuration.trim()) {
      newErrors.duration = "Davomiylikni kiritish majburiy";
    } else {
      const parsedDur = parseInt(newDuration, 10);
      if (isNaN(parsedDur) || parsedDur <= 0) {
        newErrors.duration = "Davomiylik kamida 1 daqiqa bo'lishi kerak";
      }
    }

    if (newStartDate && newStartTime) {
      const parts = newStartDate.split(".");
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        const [hh, mm] = newStartTime.split(":").map(Number);
        if (!isNaN(hh) && !isNaN(mm)) {
          const checkDate = new Date(y, m, d, hh, mm, 0, 0);
          if (checkDate < new Date(Date.now() - 60000)) {
            newErrors.startTime = "Boshlanish vaqti hozirgi vaqtdan oldin bo'lishi mumkin emas";
          }
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      let startDateObj = new Date();
      if (newStartDate) {
        const parts = newStartDate.split(".");
        if (parts.length === 3) {
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const y = parseInt(parts[2], 10);
          startDateObj = new Date(y, m, d);
        }
      }

      if (newStartTime) {
        const [hh, mm] = newStartTime.split(":").map(Number);
        if (!isNaN(hh) && !isNaN(mm)) {
          startDateObj.setHours(hh, mm, 0, 0);
        }
      }

      if (startDateObj < new Date(Date.now() - 60000)) {
        setFormError("Boshlanish vaqti hozirgi vaqtdan oldin bo'lishi mumkin emas.");
        setIsSubmitting(false);
        return;
      }

      const durationMinutes = parseDurationMinutes(newDuration);

      const payload = {
        title: newMeetingName.trim(),
        description: newMeetingDesc.trim() || null,
        start_date: startDateObj.toISOString(),
        duration: durationMinutes,
        requires_approval: newRequireApproval,
        allow_join_before_host: newAllowJoinBeforeHost,
      };

      const createdResponse = await createMeeting(payload);

      const code = createdResponse?.code || createdResponse?.id || "";
      const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "https://meetly.uz";
      const newLink = `${origin}/join/${code}`;

      if (onMeetingCreated) {
        onMeetingCreated(createdResponse);
      }
      window.dispatchEvent(
        new CustomEvent("meeting-created", { detail: createdResponse })
      );

      setCreatedModalData({
        name: createdResponse.title || newMeetingName.trim(),
        link: newLink,
      });
    } catch (err) {
      console.error("Yig'ilish yaratishda xatolik:", err);
      setFormError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Yig'ilish yaratishda xatolik yuz berdi"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !createdModalData) return null;

  return (
    <>
      {/* ================= MODAL: YANGI YIG'ILISH ================= */}
      {isOpen && !createdModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150 font-['Manrope',sans-serif]">
          <div className="bg-white dark:bg-[#161C2E] rounded-[28px] shadow-2xl border border-[#E2E6F2] dark:border-[#2B3553] w-full max-w-2xl overflow-visible animate-in zoom-in-95 duration-150 relative p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-xl sm:text-[22px] font-bold text-[#1A1D2E] dark:text-white tracking-tight">
                Yangi yig'ilish
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-[#1A1D2E] dark:text-white hover:bg-[#F1F3F9] dark:hover:bg-[#232E47] transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={22} />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs sm:text-sm rounded-xl">
                {formError}
              </div>
            )}

            {/* Modal Body / Form */}
            <form noValidate onSubmit={handleCreateMeeting} className="space-y-3">
              {/* Meeting Name */}
              <div>
                <label className="block text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] mb-1.5">
                  Yig'ilish nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={newMeetingName}
                  onChange={(e) => {
                    setNewMeetingName(e.target.value);
                    if (errors.title) {
                      setErrors((prev) => ({ ...prev, title: null }));
                    }
                  }}
                  placeholder="Yig'ilish nomini kiriting"
                  className={`w-full bg-white dark:bg-[#121624] border rounded-2xl px-4 h-12 text-[14px] text-[#1A1D2E] dark:text-white placeholder-[#8B90A5] dark:placeholder-[#64748B] focus:outline-none transition-all shadow-2xs ${
                    errors.title
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-[#E2E6F2] dark:border-[#2B3553] focus:border-[#3858C7] focus:ring-2 focus:ring-[#3858C7]/10"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1.5 text-[12px] font-semibold text-red-500 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in duration-150">
                    <HugeiconsIcon icon={Alert02Icon} size={15} />
                    <span>{errors.title}</span>
                  </p>
                )}
              </div>

              {/* Approval Requirement Card */}
              <div className="bg-[#F4F6FB] dark:bg-[#121624] rounded-2xl p-4 sm:p-4.5 border border-[#EBF0FA] dark:border-[#2B3553] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-[13.5px] font-bold text-[#1A1D2E] dark:text-white">
                    Tasdiqlash talabi
                  </h4>
                  <p className="text-[11.5px] sm:text-[12px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed max-w-[500px]">
                    Yoqilsa, yig'ilishga qo‘shilmoqchi bo‘lgan har bir ishtirokchini yig'ilish yaratuvchisi tasdiqlaydi.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={newRequireApproval}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (checked) {
                        setNewRequireApproval(true);
                        setNewAllowJoinBeforeHost(false);
                      } else {
                        setNewRequireApproval(false);
                        setNewAllowJoinBeforeHost(true);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6.5 bg-[#CBD5E1] dark:bg-[#232E47] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[22px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-transparent after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3858C7]"></div>
                </label>
              </div>

              {/* Allow Join Before Host Card */}
              <div className="bg-[#F4F6FB] dark:bg-[#121624] rounded-2xl p-4 sm:p-4.5 border border-[#EBF0FA] dark:border-[#2B3553] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-[13.5px] font-bold text-[#1A1D2E] dark:text-white">
                    Tashkilotchidan oldin kirish
                  </h4>
                  <p className="text-[11.5px] sm:text-[12px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed max-w-[500px]">
                    Yoqilsa, ishtirokchilar tashkilotchidan oldin xonaga kirib, o‘zaro gaplashib turishi mumkin. O‘chiq bo‘lsa, tashkilotchi kirmaguncha kutish zalida kutib turishadi.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={newAllowJoinBeforeHost}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (checked) {
                        setNewAllowJoinBeforeHost(true);
                        setNewRequireApproval(false);
                      } else {
                        setNewAllowJoinBeforeHost(false);
                        setNewRequireApproval(true);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6.5 bg-[#CBD5E1] dark:bg-[#232E47] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[22px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-transparent after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3858C7]"></div>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] mb-1.5">
                  Tavsif
                </label>
                <div className="relative">
                  <textarea
                    style={{ height: `${descTextareaHeight}px` }}
                    value={newMeetingDesc}
                    onChange={(e) => setNewMeetingDesc(e.target.value)}
                    placeholder="Yig'ilish haqida qisqacha ma'lumot..."
                    className="w-full bg-white dark:bg-[#121624] border border-[#E2E6F2] dark:border-[#2B3553] rounded-2xl p-4 pb-6 text-[14px] text-[#1A1D2E] dark:text-white placeholder-[#8B90A5] dark:placeholder-[#64748B] focus:outline-none focus:border-[#3858C7] focus:ring-2 focus:ring-[#3858C7]/10 transition-all shadow-2xs resize-none"
                  />
                  {/* Resizer bottom center handle */}
                  <div
                    onMouseDown={handleMouseDownResize}
                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center p-1.5 cursor-ns-resize group select-none"
                    title="O'lchamni o'zgartirish"
                  >
                    <div className="w-10 h-1 rounded-full bg-[#CBD5E1] dark:bg-[#2B3553] group-hover:bg-[#94A3B8] transition-colors" />
                  </div>
                </div>
              </div>

              {/* Date, Time, Duration Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Start Date */}
                <div>
                  <label className="block text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] mb-1.5">
                    Boshlanish vaqti <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    value={newStartDate}
                    onChange={(d) => {
                      if (!d) {
                        setNewStartDate("");
                      } else {
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        setNewStartDate(`${day}.${month}.${year}`);
                      }
                      if (errors.startDate) {
                        setErrors((prev) => ({ ...prev, startDate: null }));
                      }
                      setFormError(null);
                    }}
                    error={Boolean(errors.startDate)}
                    minDate={new Date()}
                    placeholder="01.01.2026"
                    className="w-full"
                    inputClassName={`h-12! rounded-2xl! text-[13.5px]! font-medium! text-[#1A1D2E]! dark:text-white! ${
                      errors.startDate
                        ? "border-red-500! focus-visible:border-red-500! focus-visible:ring-red-500/20!"
                        : "border-[#E2E6F2]! dark:border-[#2B3553]! focus-visible:border-[#3858C7]! focus-visible:ring-[#3858C7]/10!"
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1.5 text-[12px] font-semibold text-red-500 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in duration-150">
                      <HugeiconsIcon icon={Alert02Icon} size={15} />
                      <span>{errors.startDate}</span>
                    </p>
                  )}
                </div>

                {/* Time */}
                <div>
                  <label className="block text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] mb-1.5">
                    Vaqti <span className="text-red-500">*</span>
                  </label>
                  <TimePicker
                    value={newStartTime}
                    onChange={(val) => {
                      setNewStartTime(val);
                      if (errors.startTime) {
                        setErrors((prev) => ({ ...prev, startTime: null }));
                      }
                      setFormError(null);
                    }}
                    minTime={minStartTime}
                    placeholder="00:00"
                    className={`h-12! ${
                      errors.startTime
                        ? "border-red-500! focus:border-red-500! focus:ring-red-500/20!"
                        : ""
                    }`}
                  />
                  {errors.startTime && (
                    <p className="mt-1.5 text-[12px] font-semibold text-red-500 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in duration-150">
                      <HugeiconsIcon icon={Alert02Icon} size={15} />
                      <span>{errors.startTime}</span>
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8] mb-1.5">
                    Davomiyligi <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`flex items-center bg-white dark:bg-[#121624] border rounded-2xl px-4 h-12 text-[14px] text-[#1A1D2E] dark:text-white transition-all shadow-2xs ${
                      errors.duration
                        ? "border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
                        : "border-[#E2E6F2] dark:border-[#2B3553] focus-within:border-[#3858C7] focus-within:ring-2 focus-within:ring-[#3858C7]/10"
                    }`}
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newDuration}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/\D/g, "");
                        setNewDuration(onlyNums);
                        if (errors.duration) {
                          setErrors((prev) => ({ ...prev, duration: null }));
                        }
                        setFormError(null);
                      }}
                      placeholder="40"
                      className="w-full bg-transparent text-[#1A1D2E] dark:text-white placeholder-[#8B90A5] dark:placeholder-[#64748B] focus:outline-none font-medium text-[14px]"
                    />
                    <span className="text-[#8B90A5] dark:text-[#64748B] text-[13.5px] font-medium ml-1.5 select-none shrink-0">
                      daqiqa
                    </span>
                  </div>
                  {errors.duration && (
                    <p className="mt-1.5 text-[12px] font-semibold text-red-500 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in duration-150">
                      <HugeiconsIcon icon={Alert02Icon} size={15} />
                      <span>{errors.duration}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-2 text-[14px] font-bold text-[#1A1D2E] dark:text-white hover:text-black dark:hover:text-slate-200 transition-colors cursor-pointer py-2.5 px-2"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={18} />
                  <span>Bekor qilish</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#3858C7] hover:bg-[#2F4BB8] disabled:opacity-50 text-white text-[14px] font-semibold px-6 py-3 rounded-2xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check strokeWidth={2.5} size={18} />
                  )}
                  <span>{isSubmitting ? "Yaratilmoqda..." : "Yaratish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: YIG'ILISH YARATILDI (HAVOLA) ================= */}
      {createdModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150 font-['Manrope',sans-serif]">
          <div className="bg-white dark:bg-[#161C2E] rounded-3xl shadow-2xl border border-[#E2E6F2] dark:border-[#2B3553] w-full max-w-[600px] overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1A1D2E] dark:text-white tracking-tight">
                Yig'ilish yaratildi
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCreatedModalData(null);
                  onClose();
                }}
                className="p-1 rounded-lg text-[#8B90A5] hover:text-[#1A1D2E] dark:hover:text-white hover:bg-[#F1F3F9] dark:hover:bg-[#232E47] transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
            </div>

            {/* Invite link container */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#5B6078] dark:text-[#94A3B8]">
                Taklif havolasi
              </label>
              <div className="flex items-center justify-between bg-white dark:bg-[#121624] border border-[#E2E6F2] dark:border-[#2B3553] rounded-2xl px-4 py-2.5 shadow-2xs">
                <span className="text-[14px] font-semibold text-[#1A1D2E] dark:text-white select-all truncate pr-3">
                  {createdModalData.link}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyLink(createdModalData.link)}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-[#3858C7] dark:text-[#7F95E6] hover:text-[#2F4BB8] transition-colors cursor-pointer flex-shrink-0"
                >
                  <HugeiconsIcon
                    icon={copiedLink ? Tick02Icon : Copy01Icon}
                    size={16}
                  />
                  <span>{copiedLink ? "Nusxalandi!" : "Nusxalash"}</span>
                </button>
              </div>
              <p className="text-[12.5px] text-[#8B90A5] dark:text-[#64748B]">
                Ishtirokchilar faqat shu havola orqali taklif qilinadi
              </p>
            </div>

            {/* Ready Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setCreatedModalData(null);
                  onClose();
                }}
                className="flex items-center gap-2 bg-[#3858C7] hover:bg-[#2F4BB8] text-white text-[13.5px] font-semibold px-5 py-3 rounded-xl transition-all shadow-xs active:scale-[0.98] cursor-pointer"
              >
                <Check strokeWidth={2.5} size={18} />
                <span>Tayyor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateMeetingModal;
