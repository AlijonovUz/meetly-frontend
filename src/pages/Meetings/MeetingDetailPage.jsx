import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Tick02Icon,
  ArrowLeft02Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { mockMeetingsList } from "../../data/mockData";

// Helper to check if participant joined after meeting start time
const isParticipantLate = (joinTimeStr, meetingStartTimeStr) => {
  if (!joinTimeStr || !meetingStartTimeStr) return false;

  const getTimeMinutes = (str) => {
    if (!str) return null;
    const parts = str.trim().split(" ");
    const timePart = parts.length > 1 ? parts[1] : parts[0];
    if (!timePart || !timePart.includes(":")) return null;
    const [h, m] = timePart.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  const joinMins = getTimeMinutes(joinTimeStr);
  const startMins = getTimeMinutes(meetingStartTimeStr);

  if (joinMins !== null && startMins !== null) {
    return joinMins > startMins;
  }
  return false;
};

const MeetingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);

  // Find meeting by ID or fallback to the specific mahalla meeting / first meeting
  const meeting =
    mockMeetingsList.find((m) => String(m.id) === String(id)) ||
    mockMeetingsList.find((m) => m.id === "13") ||
    mockMeetingsList[0];

  const handleCopyLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(meeting.link || "muloqot.app/join/8f3a2c91");
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const participants = meeting.participants || [];

  return (
    <div className="p-5 py-4.5 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#1A1D2E] tracking-tight">
            {meeting.name}
          </h1>
        </div>
      </div>

      {/* Taklif havolasi Card */}
      <div className="space-y-2">
        <label className="block text-[13px] font-medium text-[#5B6078]">
          Taklif havolasi
        </label>
        <div className="flex items-center justify-between bg-white border border-[#E2E6F2] rounded-2xl px-5 h-12 shadow-2xs">
          <span className="text-[14px] font-semibold text-[#1A1D2E] select-all truncate pr-4">
            {meeting.link || "muloqot.app/join/8f3a2c91"}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4763E4] hover:text-[#3A52C7] transition-colors cursor-pointer flex-shrink-0"
          >
            <HugeiconsIcon
              icon={copiedLink ? Tick02Icon : Copy01Icon}
              size={16}
            />
            <span>{copiedLink ? "Nusxalandi!" : "Nusxalash"}</span>
          </button>
        </div>
      </div>

      {/* Info Grid (4 fields) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Boshlanish sanasi */}
        <div>
          <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
            Boshlanish sanasi
          </label>
          <div className="flex items-center justify-between bg-white border border-[#E2E6F2] rounded-xl px-4 h-11 text-[13.5px] font-semibold text-[#1A1D2E] shadow-2xs">
            <span>{meeting.startTime?.split(" ")[0] || "01.10.2026"}</span>
          </div>
        </div>

        {/* Vaqti */}
        <div>
          <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
            Vaqti
          </label>
          <div className="flex items-center justify-between bg-white border border-[#E2E6F2] rounded-xl px-4 h-11 text-[13.5px] font-semibold text-[#1A1D2E] shadow-2xs">
            <span>{meeting.startTime?.split(" ")[1] || "15:00"}</span>
          </div>
        </div>

        {/* Davomiyligi */}
        <div>
          <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
            Davomiyligi
          </label>
          <div className="flex items-center justify-between bg-white border border-[#E2E6F2] rounded-xl px-4 h-11 text-[13.5px] font-semibold text-[#1A1D2E] shadow-2xs">
            <span>{meeting.duration || "30 daqiqa"}</span>
          </div>
        </div>

        {/* Tasdiqlash talabi */}
        <div>
          <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
            Tasdiqlash talabi
          </label>
          <div className="flex items-center justify-between bg-white border border-[#E2E6F2] rounded-xl px-4 h-11 text-[13.5px] font-semibold text-[#1A1D2E] shadow-2xs">
            <span>
              {meeting.requireApproval ? "Talab qilinadi" : "Talab qilinmaydi"}
            </span>
          </div>
        </div>
      </div>

      {/* Ishtirokchilar Section */}
      <div className="space-y-3 pt-2">
        <h2 className="text-[17px] font-bold text-[#1A1D2E]">
          Ishtirokchilar
        </h2>

        <div className="overflow-auto h-[calc(100vh-460px)]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E2E6F2] bg-[#F8F9FC] text-[#8B90A5] text-[13px] font-medium">
                <th className="py-3 px-4 font-normal w-12 text-center">№</th>
                <th className="py-3 px-4 font-normal">Ism Sharif</th>
                <th className="py-3 px-4 font-normal">Kirgan vaqti</th>
                <th className="py-3 px-4 font-normal">Chiqgan vaqti</th>
                <th className="py-3 px-4 font-normal">Sarflangan vaqt</th>
                <th className="py-3 px-4 font-normal text-right pr-6">Holati</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6F2]/60 text-[13.5px]">
              {participants.length > 0 ? (
                participants.map((p, idx) => {
                  const late = isParticipantLate(p.joinTime, meeting.startTime);
                  return (
                    <tr
                      key={p.id || idx}
                      className={`transition-colors ${late
                        ? "bg-[#fdf7f7] hover:bg-[#fff7f7]"
                        : "hover:bg-[#F8F9FC]/60"
                        }`}
                    >
                      {/* Index */}
                      <td
                        className={`py-3.5 px-4 text-center font-medium text-[13px] ${late ? "text-[#b56d7d]" : "text-[#8B90A5]"
                          }`}
                      >
                        {idx + 1}
                      </td>

                      {/* Full Name */}
                      <td className="py-3.5 px-4 font-semibold text-[#1A1D2E]">
                        <span>{p.name}</span>
                      </td>

                      {/* Join Time */}
                      <td
                        className={`py-3.5 px-4 ${late
                          ? "font-semibold text-[#b56d7d]"
                          : "text-[#1A1D2E]"
                          }`}
                      >
                        {p.joinTime}
                      </td>

                      {/* Leave Time */}
                      <td className="py-3.5 px-4 text-[#1A1D2E]">
                        {p.leaveTime}
                      </td>

                      {/* Spent Time */}
                      <td className="py-3.5 px-4 text-[#1A1D2E]">
                        {p.spentTime}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-right pr-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-medium text-[#5B6078] bg-white border border-[#E2E6F2]/60 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                          <span>{p.status || "Qatnashdi"}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 px-6 text-center text-[#8B90A5] text-[13.5px]"
                  >
                    Hozircha ishtirokchilar yo'q. Havolani yuboring, qo'shilganlar shu yerda ko'rinadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetailPage;
