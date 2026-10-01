import React, { useState, useMemo, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Copy01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Check } from "lucide-react";
import { CustomSelect, DatePicker, TimePicker } from "../UI";

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

  const durationOptions = useMemo(
    () => [
      { value: "15 daqiqa", label: "15 daqiqa" },
      { value: "30 daqiqa", label: "30 daqiqa" },
      { value: "40 daqiqa", label: "40 daqiqa" },
      { value: "45 daqiqa", label: "45 daqiqa" },
      { value: "1 soat", label: "1 soat" },
      { value: "1.5 soat", label: "1.5 soat" },
      { value: "2 soat", label: "2 soat" },
    ],
    []
  );

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
    }
  }, [isOpen]);

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateMeeting = (e) => {
    e.preventDefault();
    if (!newMeetingName.trim()) return;

    const randomHash = Math.random().toString(36).substring(2, 10);
    const newLink = `muloqot.app/join/${randomHash}`;
    const createdMeeting = {
      id: Date.now().toString(),
      name: newMeetingName.trim(),
      organizer: "Doston Ochilov",
      createdAt: "01.10.2026 17:25",
      startTime: `${newStartDate || "01.10.2026"} ${newStartTime || "15:00"}`,
      duration: newDuration || "40 daqiqa",
      status: "planned",
      statusLabel: "Rejalashtirilgan",
      link: newLink,
      description: newMeetingDesc,
      requireApproval: newRequireApproval,
      allowJoinBeforeHost: newAllowJoinBeforeHost,
      participants: [],
    };

    if (onMeetingCreated) {
      onMeetingCreated(createdMeeting);
    }
    window.dispatchEvent(new CustomEvent("meeting-created", { detail: createdMeeting }));

    setCreatedModalData({
      name: newMeetingName.trim(),
      link: newLink,
    });
  };

  if (!isOpen && !createdModalData) return null;

  return (
    <>
      {/* ================= MODAL: YANGI YIG'ILISH ================= */}
      {isOpen && !createdModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[28px] shadow-2xl border border-[#E2E6F2] w-full max-w-2xl overflow-visible animate-in zoom-in-95 duration-150 relative p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-xl sm:text-[22px] font-bold text-[#1A1D2E] tracking-tight">
                Yangi yig'ilish
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-[#1A1D2E] hover:bg-[#F1F3F9] transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={22} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateMeeting} className="space-y-3">
              {/* Meeting Name */}
              <div>
                <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
                  Yig'ilish nomi
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={newMeetingName}
                  onChange={(e) => setNewMeetingName(e.target.value)}
                  placeholder="Yig'ilish nomini kiriting"
                  className="w-full bg-white border border-[#E2E6F2] rounded-2xl px-4 h-12 text-[14px] text-[#1A1D2E] placeholder-[#8B90A5] focus:outline-none focus:border-[#3858C7] focus:ring-2 focus:ring-[#3858C7]/10 transition-all shadow-2xs"
                />
              </div>

              {/* Approval Requirement Card */}
              <div className="bg-[#F4F6FB] rounded-2xl p-4 sm:p-4.5 border border-[#EBF0FA] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-[13.5px] font-bold text-[#1A1D2E]">
                    Tasdiqlash talabi
                  </h4>
                  <p className="text-[11.5px] sm:text-[12px] text-[#64748B] leading-relaxed max-w-[500px]">
                    Yoqilsa, yig‘ilishga qo‘shilmoqchi bo‘lgan har bir ishtirokchini yig‘ilish yaratuvchisi tasdiqlaydi.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={newRequireApproval}
                    onChange={(e) => setNewRequireApproval(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6.5 bg-[#CBD5E1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[22px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-transparent after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3858C7]"></div>
                </label>
              </div>

              {/* Allow Join Before Host Card */}
              <div className="bg-[#F4F6FB] rounded-2xl p-4 sm:p-4.5 border border-[#EBF0FA] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-[13.5px] font-bold text-[#1A1D2E]">
                    Tashkilotchidan oldin kirish
                  </h4>
                  <p className="text-[11.5px] sm:text-[12px] text-[#64748B] leading-relaxed max-w-[500px]">
                    Yoqilsa, ishtirokchilar tashkilotchidan oldin xonaga kirib, o‘zaro gaplashib turishi mumkin. O‘chiq bo‘lsa, tashkilotchi kirmaguncha kutish zalida kutib turishadi.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={newAllowJoinBeforeHost}
                    onChange={(e) => setNewAllowJoinBeforeHost(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6.5 bg-[#CBD5E1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[22px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-transparent after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3858C7]"></div>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
                  Tavsif
                </label>
                <div className="relative">
                  <textarea
                    style={{ height: `${descTextareaHeight}px` }}
                    value={newMeetingDesc}
                    onChange={(e) => setNewMeetingDesc(e.target.value)}
                    placeholder="Yig'ilish haqida qisqacha ma'lumot..."
                    className="w-full bg-white border border-[#E2E6F2] rounded-2xl p-4 pb-6 text-[14px] text-[#1A1D2E] placeholder-[#8B90A5] focus:outline-none focus:border-[#3858C7] focus:ring-2 focus:ring-[#3858C7]/10 transition-all shadow-2xs resize-none"
                  />
                  {/* Resizer bottom center handle */}
                  <div
                    onMouseDown={handleMouseDownResize}
                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center p-1.5 cursor-ns-resize group select-none"
                    title="O'lchamni o'zgartirish"
                  >
                    <div className="w-10 h-1 rounded-full bg-[#CBD5E1] group-hover:bg-[#94A3B8] transition-colors" />
                  </div>
                </div>
              </div>

              {/* Date, Time, Duration Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Start Date */}
                <div>
                  <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
                    Boshlanish vaqti
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
                    }}
                    placeholder="01.01.2026"
                    className="w-full"
                    inputClassName="h-12! rounded-2xl! border-[#E2E6F2]! text-[13.5px]! font-medium! text-[#1A1D2E]! focus-visible:border-[#3858C7]! focus-visible:ring-[#3858C7]/10!"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
                    Vaqti
                  </label>
                  <TimePicker
                    value={newStartTime}
                    onChange={setNewStartTime}
                    placeholder="00:00"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
                    Davomiyligi
                  </label>
                  <CustomSelect
                    value={newDuration}
                    onChange={setNewDuration}
                    options={durationOptions}
                    placeholder="40 daqiqa"
                    className="h-12! rounded-2xl!"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-2 text-[14px] font-bold text-[#1A1D2E] hover:text-black transition-colors cursor-pointer py-2.5 px-2"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={18} />
                  <span>Bekor qilish</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#3858C7] hover:bg-[#2F4BB8] text-white text-[14px] font-semibold px-6 py-3 rounded-2xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <Check strokeWidth={2.5} size={18} />
                  <span>Yaratish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: YIG'ILISH YARATILDI (HAVOLA) ================= */}
      {createdModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2E6F2] w-full max-w-lg overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1A1D2E] tracking-tight">
                Yig'ilish yaratildi
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCreatedModalData(null);
                  onClose();
                }}
                className="p-1 rounded-lg text-[#8B90A5] hover:text-[#1A1D2E] hover:bg-[#F1F3F9] transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
            </div>

            {/* Invite link container */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-[#5B6078]">
                Taklif havolasi
              </label>
              <div className="flex items-center justify-between bg-white border border-[#E2E6F2] rounded-2xl px-4 py-2.5 shadow-2xs">
                <span className="text-[14px] font-semibold text-[#1A1D2E] select-all truncate pr-3">
                  {createdModalData.link}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyLink(createdModalData.link)}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4763E4] hover:text-[#3A52C7] transition-colors cursor-pointer flex-shrink-0"
                >
                  <HugeiconsIcon
                    icon={copiedLink ? Tick02Icon : Copy01Icon}
                    size={16}
                  />
                  <span>{copiedLink ? "Nusxalandi!" : "Nusxalash"}</span>
                </button>
              </div>
              <p className="text-[12.5px] text-[#8B90A5]">
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
                className="flex items-center gap-2 bg-[#3F57B3] hover:bg-[#344AA5] text-white text-[13.5px] font-semibold px-3.5 py-3 rounded-xl transition-all shadow-xs active:scale-[0.98] cursor-pointer"
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
