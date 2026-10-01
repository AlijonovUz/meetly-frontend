import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  LockPasswordIcon,
} from "@hugeicons/core-free-icons";
import { Ban, Lock, Unlock } from "lucide-react";
import {
  mockUsersList,
  mockUserMeetings,
} from "../../data/mockData";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find user by ID or default to first user
  const user =
    mockUsersList.find((u) => u.id === id) || mockUsersList[0];

  // Block state
  const [isBlocked, setIsBlocked] = useState(user.isBlocked ?? false);
  const [blockReason, setBlockReason] = useState(
    user.blockReason || "yig'ilishlarda spam xabarlar yuborgan."
  );
  const [blockDate, setBlockDate] = useState("01.10.2026 11:20");
  const [blockedBy, setBlockedBy] = useState("Doston Ochilov");

  // Modals
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);
  const [reasonInput, setReasonInput] = useState("");

  const [region] = useState("Toshkent viloyati");
  const [district] = useState("Toshkent tumani");
  const [birthDate] = useState("15.04.2004");
  const [organization] = useState(user.organization || "Raqamli Nazorat");
  const [meetingFilter, setMeetingFilter] = useState("all"); // "all" | "planned" | "completed"

  // Filter meetings
  const filteredMeetings = useMemo(() => {
    if (meetingFilter === "all") return mockUserMeetings;
    return mockUserMeetings.filter((m) => m.status === meetingFilter);
  }, [meetingFilter]);

  const plannedCount = mockUserMeetings.filter(
    (m) => m.status === "planned"
  ).length;
  const completedCount = mockUserMeetings.filter(
    (m) => m.status === "completed"
  ).length;

  const handleConfirmBlock = (e) => {
    e.preventDefault();
    if (!reasonInput.trim()) return;
    setIsBlocked(true);
    setBlockReason(reasonInput.trim());
    setBlockDate("01.10.2026 11:20");
    setBlockedBy("Doston Ochilov");
    setBlockModalOpen(false);
  };

  const handleConfirmUnblock = () => {
    setIsBlocked(false);
    setUnblockModalOpen(false);
  };

  return (
    <div className="p-5 px-4.5 space-y-5">
      {/* Top Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-[#E2E6F2] shadow-xs flex-shrink-0 border-2 border-white">
            <img
              src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1D2E] tracking-tight">
              {user.fullName}
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F1F3F9] text-xs font-semibold text-[#5B6078]">
              <span
                className={`w-2 h-2 rounded-full ${
                  isBlocked ? "bg-[#DD4C1E]" : "bg-[#4AC99B]"
                }`}
              />
              <span>{isBlocked ? "Bloklangan" : "Faol"}</span>
            </div>
          </div>
        </div>

        {/* Action Button: Block or Unblock */}
        {isBlocked ? (
          <button
            type="button"
            onClick={() => setUnblockModalOpen(true)}
            className="flex items-center gap-2 bg-[#3858C7] hover:bg-[#2F4BB8] text-white text-[13.5px] font-semibold px-5 py-3 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Unlock size={17} strokeWidth={2.2} />
            <span>Blokdan chiqarish</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setReasonInput("");
              setBlockModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#D92D20] hover:bg-[#B42318] text-white text-[13.5px] font-semibold px-5 py-3 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Ban size={16} strokeWidth={2.2} />
            <span>Bloklash</span>
          </button>
        )}
      </div>

      {/* Blocked Alert Banner if isBlocked is true */}
      {isBlocked && (
        <div className="bg-[#FEF3F2] border border-[#FECDCA] rounded-2xl p-4 space-y-1 animate-in fade-in duration-200">
          <h4 className="text-[13.5px] font-bold text-[#D92D20]">
            Foydalanuvchi bloklangan
          </h4>
          <p className="text-[13px] text-[#5B6078]">
            {blockDate}, {blockedBy} tomonidan. Sabab: {blockReason}
          </p>
        </div>
      )}

      {/* Static Info Cards (2 columns with lock icons) */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Viloyat */}
          <div>
            <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
              Viloyat
            </label>
            <div className="w-full bg-[#FAFAFC] border border-[#E2E6F2] rounded-xl px-4 h-12 flex items-center justify-between text-[13.5px] font-medium text-[#1A1D2E] select-none shadow-2xs">
              <span>{user.region || region}</span>
              <Lock size={18} className="text-[#8B90A5]" />
            </div>
          </div>

          {/* Tuman */}
          <div>
            <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
              Tuman
            </label>
            <div className="w-full bg-[#FAFAFC] border border-[#E2E6F2] rounded-xl px-4 h-12 flex items-center justify-between text-[13.5px] font-medium text-[#1A1D2E] select-none shadow-2xs">
              <span>{user.district || district}</span>
              <Lock size={18} className="text-[#8B90A5]" />
            </div>
          </div>

          {/* Tug'ulgan sanasi */}
          <div>
            <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
              Tug'ulgan sanasi
            </label>
            <div className="w-full bg-[#FAFAFC] border border-[#E2E6F2] rounded-xl px-4 h-12 flex items-center justify-between text-[13.5px] font-medium text-[#1A1D2E] select-none shadow-2xs">
              <span>{user.birthDate || birthDate}</span>
              <Lock size={18} className="text-[#8B90A5]" />
            </div>
          </div>

          {/* Tashkilot */}
          <div>
            <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
              Tashkilot
            </label>
            <div className="w-full bg-[#FAFAFC] border border-[#E2E6F2] rounded-xl px-4 h-12 flex items-center justify-between text-[13.5px] font-medium text-[#1A1D2E] select-none shadow-2xs">
              <span>{user.organization || organization}</span>
              <Lock size={18} className="text-[#8B90A5]" />
            </div>
          </div>
        </div>

        {/* Footer Explanation Note */}
        <p className="text-[12.5px] text-[#8B90A5]">
          Foydalanuvchi ma'lumotlari Passport orqali boshqariladi. Administrator ularni o'zgartira olmaydi, faqat bloklashi mumkin.
        </p>
      </div>

      {/* Meeting History Section */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base font-bold text-[#1A1D2E]">
          Yig'ilishlar tarixi
        </h2>

        {/* Filter Pills */}
        <div className="inline-flex p-1 bg-[#EEF1F8] rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setMeetingFilter("all")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              meetingFilter === "all"
                ? "bg-white text-[#1A1D2E] shadow-xs"
                : "text-[#5B6078] hover:text-[#1A1D2E]"
            }`}
          >
            <span>Barchasi</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md font-bold ${
                meetingFilter === "all"
                  ? "bg-[#F1F3F9] text-[#1A1D2E]"
                  : "bg-white text-[#8B90A5]"
              }`}
            >
              {mockUserMeetings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMeetingFilter("planned")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              meetingFilter === "planned"
                ? "bg-white text-[#1A1D2E] shadow-xs"
                : "text-[#5B6078] hover:text-[#1A1D2E]"
            }`}
          >
            <span>Rejalashtirilgan</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md font-bold ${
                meetingFilter === "planned"
                  ? "bg-[#F1F3F9] text-[#1A1D2E]"
                  : "bg-white text-[#8B90A5]"
              }`}
            >
              {plannedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMeetingFilter("completed")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              meetingFilter === "completed"
                ? "bg-white text-[#1A1D2E] shadow-xs"
                : "text-[#5B6078] hover:text-[#1A1D2E]"
            }`}
          >
            <span>O’tkazilgan</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md font-bold ${
                meetingFilter === "completed"
                  ? "bg-[#F1F3F9] text-[#1A1D2E]"
                  : "bg-white text-[#8B90A5]"
              }`}
            >
              {completedCount}
            </span>
          </button>
        </div>

        {/* Meetings Table */}
        <div className="overflow-auto h-[calc(100vh-515px)]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F8F9FC]">
              <tr className="border-b border-[#E2E6F2] text-[#8B90A5] text-[13px] font-medium">
                <th className="py-3 px-4 font-normal w-12 text-left">№</th>
                <th className="py-3 px-4 font-normal">Nomi</th>
                <th className="py-3 px-4 font-normal">Yaratilgan sana</th>
                <th className="py-3 px-4 font-normal text-right">Holati</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6F2]/50 text-[13.5px]">
              {filteredMeetings.length > 0 ? (
                filteredMeetings.map((meeting, index) => (
                  <tr
                    key={meeting.id}
                    onClick={() => window.open(`/meetings/${meeting.id}`, "_blank")}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 text-[#5B6078] font-medium">
                      {index + 1}
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 font-medium text-[#1A1D2E]">
                      {meeting.name}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-[#1A1D2E]">
                      {meeting.date}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            meeting.status === "planned"
                              ? "bg-[#E15241]"
                              : "bg-[#10B981]"
                          }`}
                        />
                        <span className="text-[13px] font-medium text-[#5B6078]">
                          {meeting.statusLabel}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-[#8B90A5] text-sm"
                  >
                    Yig'ilishlar mavjud emas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: FOYDALANUVCHINI BLOKLASH ================= */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[28px] shadow-2xl border border-[#E2E6F2] w-full max-w-lg p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-150 relative">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xl font-bold text-[#1A1D2E]">
                Foydalanuvchini bloklash
              </h3>
              <button
                type="button"
                onClick={() => setBlockModalOpen(false)}
                className="p-1 rounded-lg text-[#1A1D2E] hover:bg-[#F1F3F9] transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
            </div>

            <p className="text-[13.5px] text-[#5B6078] leading-relaxed">
              {user.fullName} tizimga kira olmaydi va yig'ilishlarga qo'shila olmaydi. Keyinroq blokdan chiqarish mumkin.
            </p>

            <form onSubmit={handleConfirmBlock} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
                  Sabab *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Bloklash sababini kiriting"
                  className="w-full bg-white border border-[#E2E6F2] rounded-2xl p-4 text-[13.5px] text-[#1A1D2E] placeholder-[#8B90A5] focus:outline-none focus:border-[#D92D20] focus:ring-2 focus:ring-[#D92D20]/10 transition-all shadow-2xs resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setBlockModalOpen(false)}
                  className="flex items-center gap-2 text-[14px] font-bold text-[#1A1D2E] hover:text-black transition-colors cursor-pointer py-2.5 px-2"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={18} />
                  <span>Bekor qilish</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#D92D20] hover:bg-[#B42318] text-white text-[14px] font-semibold px-6 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <Ban size={18} strokeWidth={2.2} />
                  <span>Bloklash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: BLOKDAN CHIQARISH ================= */}
      {unblockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[28px] shadow-2xl border border-[#E2E6F2] w-full max-w-lg p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 relative">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xl font-bold text-[#1A1D2E]">
                Blokdan chiqarish
              </h3>
              <button
                type="button"
                onClick={() => setUnblockModalOpen(false)}
                className="p-1 rounded-lg text-[#1A1D2E] hover:bg-[#F1F3F9] transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
            </div>

            <p className="text-[14px] text-[#5B6078] leading-relaxed">
              {user.fullName} yana tizimga kira oladi va yig'ilishlarga qo'shila oladi.
            </p>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setUnblockModalOpen(false)}
                className="flex items-center gap-2 text-[14px] font-bold text-[#1A1D2E] hover:text-black transition-colors cursor-pointer py-2.5 px-2"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
                <span>Bekor qilish</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmUnblock}
                className="flex items-center gap-2 bg-[#3858C7] hover:bg-[#2F4BB8] text-white text-[14px] font-semibold px-6 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <Unlock size={18} strokeWidth={2.2} />
                <span>Blokdan chiqarish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailPage;
