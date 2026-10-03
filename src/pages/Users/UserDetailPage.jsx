import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Ban, Lock, Unlock, Loader2, ArrowLeft, X } from "lucide-react";
import { mockUsersList } from "../../data/mockData";
import {
  getUserById,
  toggleUserBlock,
  getAppealStatus,
  approveAppeal,
  rejectAppeal,
} from "../../services/usersApi";
import { getMeetings } from "../../services/meetingsApi";
import dayjs from "dayjs";

const MEETING_TABS = [
  { id: "all", label: "Barchasi", countKey: "all" },
  { id: "ongoing", label: "Joriy", countKey: "ongoing", isRed: true },
  { id: "scheduled", label: "Rejalashtirilgan", countKey: "scheduled" },
  { id: "completed", label: "O'tkazilgan", countKey: "completed" },
];

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // User state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Block state
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockDate, setBlockDate] = useState("");
  const [blockedBy, setBlockedBy] = useState("Administrator");
  const [appealData, setAppealData] = useState(null);

  // Modals
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [reasonInput, setReasonInput] = useState("");
  const [rejectReasonInput, setRejectReasonInput] = useState("");

  // Meetings state
  const [meetingFilter, setMeetingFilter] = useState("all");
  const [userMeetings, setUserMeetings] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [meetingCounts, setMeetingCounts] = useState({
    all: 0,
    ongoing: 0,
    scheduled: 0,
    completed: 0,
  });
  const [textareaHeight, setTextareaHeight] = useState(90);

  // Fetch meetings with organizer filter & status
  const fetchUserMeetings = useCallback(async () => {
    if (!id) return;
    try {
      setMeetingsLoading(true);
      const params = { organizer: id };
      if (meetingFilter && meetingFilter !== "all") {
        params.status = meetingFilter;
      }
      const res = await getMeetings(params);
      setUserMeetings(res.results || []);
    } catch (err) {
      console.error("Foydalanuvchi yig'ilishlarini yuklashda xatolik:", err);
      setUserMeetings([]);
    } finally {
      setMeetingsLoading(false);
    }
  }, [id, meetingFilter]);

  // Fetch count breakdown for tabs
  const fetchMeetingCounts = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getMeetings({ organizer: id, page_size: 100 });
      const list = res.results || [];
      setMeetingCounts({
        all: res.count ?? list.length,
        ongoing: list.filter((m) => m.status === "ongoing" || m.status === "active").length,
        scheduled: list.filter((m) => m.status === "scheduled" || m.status === "planned").length,
        completed: list.filter((m) => m.status === "completed").length,
      });
    } catch (err) {
      console.error("Yig'ilishlar sonini olishda xatolik:", err);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchMeetingCounts();
    }
  }, [id, fetchMeetingCounts]);

  useEffect(() => {
    if (id) {
      fetchUserMeetings();
    }
  }, [id, meetingFilter, fetchUserMeetings]);

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load user data and appeal (only if user is blocked) by ID from API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getUserById(id)
      .then(async (data) => {
        if (!isMounted) return;
        if (data) {
          setUser(data);
          const blocked = Boolean(data.is_blocked);
          setIsBlocked(blocked);
          setBlockReason(data.blocked_reason || "");
          const updatedDate = data.updated_at
            ? dayjs(data.updated_at).format("DD.MM.YYYY HH:mm")
            : "";
          setBlockDate(updatedDate);

          // Faqat foydalanuvchi bloklangan bo'lsa shikoyat statusini so'raymiz
          if (blocked) {
            try {
              const appealRes = await getAppealStatus(id);
              if (!isMounted) return;
              const raw = appealRes?.data || appealRes;
              const appeal = raw?.appeal || (Array.isArray(raw) ? raw[0] : raw);

              if (appeal && (appeal.id || appeal.message || appeal.text) && (appeal.status === "PENDING" || !appeal.status)) {
                setAppealData({
                  id: appeal.id,
                  text: appeal.message || appeal.text,
                  date: appeal.created_at
                    ? dayjs(appeal.created_at).format("DD.MM.YYYY HH:mm")
                    : "",
                  status: appeal.status || "PENDING",
                  raw: appeal,
                });
              } else {
                let storedAppeal = null;
                try {
                  const stored = localStorage.getItem(`user_appeal_${id}`);
                  if (stored) storedAppeal = JSON.parse(stored);
                } catch (e) {}
                setAppealData(storedAppeal);
              }
            } catch (err) {
              console.error("Shikoyat statusini yuklashda xatolik:", err);
              let storedAppeal = null;
              try {
                const stored = localStorage.getItem(`user_appeal_${id}`);
                if (stored) storedAppeal = JSON.parse(stored);
              } catch (e) {}
              if (isMounted) setAppealData(storedAppeal);
            }
          } else {
            setAppealData(null);
          }
        }
      })
      .catch((err) => {
        console.error("Foydalanuvchini yuklashda xatolik:", err);
        const fallback = mockUsersList.find((u) => u.id === id) || mockUsersList[0];
        setUser(fallback);
        const blocked = fallback?.isBlocked || false;
        setIsBlocked(blocked);
        setBlockReason(fallback?.blockReason || "");
        setAppealData(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Drag handler for textarea resize
  const handleMouseDownResize = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = textareaHeight;

    const handleMouseMove = (moveEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(70, Math.min(320, startHeight + delta));
      setTextareaHeight(newHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };


  const handleConfirmBlock = async (e) => {
    e.preventDefault();
    if (!reasonInput.trim()) {
      setToastMessage({
        type: "error",
        title: "Xatolik",
        description: "Iltimos, bloklash sababini kiriting.",
      });
      return;
    }
    if (actionLoading) return;
    setActionLoading(true);

    try {
      await toggleUserBlock(id, reasonInput.trim());
      setIsBlocked(true);
      setBlockReason(reasonInput.trim());
      setBlockDate(dayjs().format("DD.MM.YYYY HH:mm"));
      setBlockedBy("Administrator");
      setBlockModalOpen(false);
      setReasonInput("");
      setToastMessage({
        type: "success",
        title: "Foydalanuvchi bloklandi",
        description: "Foydalanuvchi muvaffaqiyatli bloklandi.",
      });
    } catch (err) {
      console.error("Foydalanuvchini bloklashda xatolik:", err);
      const errMsg =
        err?.response?.data?.error?.errorMsg ||
        err?.response?.data?.error?.message ||
        err?.response?.data?.errorMsg ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.reason) ? err?.response?.data?.reason.join(", ") : err?.response?.data?.reason) ||
        err?.message ||
        "Bloklashda xatolik yuz berdi";

      setToastMessage({
        type: "error",
        title: "Xatolik",
        description: errMsg,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRejectAppeal = async (e) => {
    if (e) e.preventDefault();
    if (!rejectReasonInput.trim()) {
      setToastMessage({
        type: "error",
        title: "Xatolik",
        description: "Iltimos, e'tirozni rad etish sababini kiriting.",
      });
      return;
    }
    if (actionLoading) return;
    setActionLoading(true);

    try {
      if (appealData?.id) {
        await rejectAppeal(appealData.id, { reason: rejectReasonInput.trim() });
      }
      localStorage.removeItem(`user_appeal_${id}`);
      setAppealData(null);
      setRejectModalOpen(false);
      setRejectReasonInput("");
      setToastMessage({
        type: "success",
        title: "E'tiroz rad etildi",
        description: "Foydalanuvchi yuborgan e'tiroz muvaffaqiyatli rad etildi.",
      });
    } catch (err) {
      console.error("E'tirozni rad etishda xatolik:", err);
      const errMsg =
        err?.response?.data?.error?.errorMsg ||
        err?.response?.data?.error?.message ||
        err?.response?.data?.errorMsg ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.reason) ? err?.response?.data?.reason.join(", ") : err?.response?.data?.reason) ||
        err?.message ||
        "E'tirozni rad etishda xatolik yuz berdi";

      setToastMessage({
        type: "error",
        title: "Xatolik",
        description: errMsg,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmUnblock = async () => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      if (appealData?.id) {
        await approveAppeal(appealData.id);
      } else {
        await toggleUserBlock(id, "");
      }
      setIsBlocked(false);
      localStorage.removeItem(`user_appeal_${id}`);
      setAppealData(null);
      setUnblockModalOpen(false);
      setToastMessage({
        type: "success",
        title: "Blokdan chiqarildi",
        description: "Foydalanuvchi muvaffaqiyatli blokdan chiqarildi.",
      });
    } catch (err) {
      console.error("Foydalanuvchini blokdan chiqarishda xatolik:", err);
      const errMsg =
        err?.response?.data?.error?.errorMsg ||
        err?.response?.data?.error?.message ||
        err?.response?.data?.errorMsg ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Blokdan chiqarishda xatolik yuz berdi";

      setToastMessage({
        type: "error",
        title: "Xatolik",
        description: errMsg,
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 size={32} className="animate-spin text-[#3858C7]" />
        <span className="text-[#5B6078] text-sm font-medium">
          Foydalanuvchi ma'lumotlari yuklanmoqda...
        </span>
      </div>
    );
  }

  const fullName =
    user?.full_name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.fullName ||
    "Noma'lum foydalanuvchi";
  const avatar =
    user?.avatar ||
    "";
  const regionName = user?.region_info?.name || user?.region || "";
  const districtName = user?.district_info?.name || user?.district || "";
  const birthDateStr = user?.birth_date || user?.birthDate || "";
  const organizationName = user?.organization || "";

  return (
    <div className="p-5 px-4.5 space-y-5">
      {/* Top Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-[#E2E6F2] shadow-xs flex-shrink-0 border-2 border-white flex items-center justify-center font-bold text-lg text-[#3858C7]">
            {avatar ? (
              <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              (user.first_name?.[0] + "" + user.last_name?.[0] || "U").toUpperCase()
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1D2E] tracking-tight">
              {fullName}
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

      {/* 02.9 Foydalanuvchi, e'tiroz kelgan Card */}
      {isBlocked && appealData && (
        <div className="bg-[#F6F8FD] border border-[#D0DCFF] rounded-2xl p-4 sm:p-5 space-y-3.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-[14px] font-bold text-[#3858C7]">
              Foydalanuvchi e'tiroz yubordi
            </h4>
            <span className="text-[12.5px] text-[#8B90A5]">
              {appealData.date || "02.10.2026 10:15"}
            </span>
          </div>

          <p className="text-[13.5px] text-[#1A1D2E] leading-relaxed">
            «{appealData.text || appealData}»
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setRejectReasonInput("");
                setRejectModalOpen(true);
              }}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#FECDCA] text-[#D92D20] bg-white hover:bg-[#FEF3F2] text-[13px] font-semibold transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              <X size={15} />
              <span>Rad etish</span>
            </button>

            <button
              type="button"
              onClick={() => setUnblockModalOpen(true)}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3858C7] hover:bg-[#2F4BB8] text-white text-[13px] font-semibold transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              <Unlock size={15} />
              <span>Blokdan chiqarish</span>
            </button>
          </div>
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
              <span>{regionName}</span>
              <Lock size={18} className="text-[#8B90A5]" />
            </div>
          </div>

          {/* Tuman */}
          <div>
            <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
              Tuman
            </label>
            <div className="w-full bg-[#FAFAFC] border border-[#E2E6F2] rounded-xl px-4 h-12 flex items-center justify-between text-[13.5px] font-medium text-[#1A1D2E] select-none shadow-2xs">
              <span>{districtName}</span>
              <Lock size={18} className="text-[#8B90A5]" />
            </div>
          </div>

          {/* Tug'ulgan sanasi */}
          <div>
            <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
              Tug'ulgan sanasi
            </label>
            <div className="w-full bg-[#FAFAFC] border border-[#E2E6F2] rounded-xl px-4 h-12 flex items-center justify-between text-[13.5px] font-medium text-[#1A1D2E] select-none shadow-2xs">
              <span>{dayjs(birthDateStr).format("DD.MM.YYYY")}</span>
              <Lock size={18} className="text-[#8B90A5]" />
            </div>
          </div>

          {/* Tashkilot */}
          <div>
            <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
              Tashkilot
            </label>
            <div className="w-full bg-[#FAFAFC] border border-[#E2E6F2] rounded-xl px-4 h-12 flex items-center justify-between text-[13.5px] font-medium text-[#1A1D2E] select-none shadow-2xs">
              <span>{organizationName}</span>
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
          {MEETING_TABS.map((tab) => {
            const isActive = meetingFilter === tab.id;
            const count = meetingCounts[tab.countKey] || 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMeetingFilter(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-[#1A1D2E] shadow-xs"
                    : "text-[#5B6078] hover:text-[#1A1D2E]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-md font-bold transition-colors ${
                    tab.isRed && !isActive
                      ? "bg-[#F8D7DA] text-[#DC2626]"
                      : tab.isRed
                      ? "bg-[#EF4444] text-white font-bold"
                      : isActive
                      ? "bg-[#F1F3F9] text-[#1A1D2E]"
                      : "bg-white text-[#8B90A5]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Meetings Table */}
        <div className="bg-transparent overflow-auto h-[calc(100vh-510px)]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F8F9FC] z-10">
              <tr className="border-b border-[#E2E6F2] text-[#8B90A5] text-[13px] font-medium">
                <th className="py-3 px-4 font-normal w-12 text-center">#</th>
                <th className="py-3 px-4 font-normal">Nomi</th>
                <th className="py-3 px-4 font-normal text-right">Yaratilgan sana</th>
                <th className="py-3 px-4 font-normal text-right">Holati</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6F2]/50 text-[13.5px]">
              {meetingsLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8B90A5] text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 text-[#4763E4] animate-spin" />
                      <span>Yuklanmoqda...</span>
                    </div>
                  </td>
                </tr>
              ) : userMeetings.length > 0 ? (
                userMeetings.map((meeting, index) => {
                  const status = meeting.status;
                  return (
                    <tr
                      key={meeting.id || index}
                      onClick={() => navigate(`/meetings/${meeting.id}`)}
                      className="hover:bg-white/60 transition-colors group cursor-pointer"
                    >
                      <td className="py-3.5 px-4 text-center text-[#5B6078] font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#1A1D2E] group-hover:text-[#3858C7] transition-colors truncate max-w-[250px]">
                        {meeting.title || meeting.name || "Nomsiz yig'ilish"}
                      </td>
                      <td className="py-3.5 text-right px-4 text-[#1A1D2E]">
                        {meeting.created_at
                          ? dayjs(meeting.created_at).format("DD.MM.YYYY HH:mm")
                          : ""}
                      </td>
                      <td className="py-3.5 px- text-end">
                        {(status === "ongoing" || status === "active") && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF4ED] text-[#E07A28] text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E07A28]" />
                            Joriy
                          </span>
                        )}
                        {(status === "scheduled" || status === "planned") && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#3858C7] text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3858C7]" />
                            Rejalashtirilgan
                          </span>
                        )}
                        {status === "completed" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EDFBF5] text-[#22C55E] text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                            O'tkazilgan
                          </span>
                        )}
                        {status === "cancelled" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                            Bekor qilingan
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8B90A5] text-sm">
                    Yig'ilishlar topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block Confirmation Modal */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-[560px] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-[#E2E6F2]">
            {/* Modal Header: Title & Close Button */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[19px] sm:text-[20px] text-[#1A1D2E] tracking-tight">
                Foydalanuvchini bloklash
              </h3>
              <button
                type="button"
                onClick={() => setBlockModalOpen(false)}
                className="text-[#1A1D2E] hover:text-black p-1 rounded-lg hover:bg-[#F1F3F9] transition-colors cursor-pointer"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Description Text */}
            <p className="text-[14px] text-[#5B6078] leading-relaxed">
              {fullName} tizimga kira olmaydi va yig'ilishlarga qo'shila olmaydi. Keyinroq blokdan chiqarish mumkin.
            </p>

            <form onSubmit={handleConfirmBlock} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
                  Sabab <span className="text-[#D92D20]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Bloklash sababini kiriting"
                  className="w-full bg-white border border-[#D0DCFF] focus:border-[#D92D20] rounded-2xl p-3.5 text-[13.5px] text-[#1A1D2E] placeholder-[#8B90A5] focus:outline-none focus:ring-2 focus:ring-[#D92D20]/10 transition-all resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setBlockModalOpen(false)}
                  className="inline-flex items-center gap-2 text-[#1A1D2E] hover:text-black text-[14px] font-bold py-2.5 px-2 transition-colors cursor-pointer"
                >
                  <X size={16} strokeWidth={2.5} />
                  <span>Bekor qilish</span>
                </button>

                <button
                  type="submit"
                  disabled={!reasonInput.trim() || actionLoading}
                  className={`h-11 px-6 rounded-xl font-semibold text-[14px] text-white transition-all shadow-xs flex items-center gap-2 ${
                    reasonInput.trim() && !actionLoading
                      ? "bg-[#D92D20] hover:bg-[#B42318] cursor-pointer active:scale-95"
                      : "bg-[#D92D20]/50 cursor-not-allowed"
                  }`}
                >
                  {actionLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Ban size={17} strokeWidth={2.2} />
                  )}
                  <span>Bloklash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unblock Confirmation Modal */}
      {unblockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-[480px] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-[#E2E6F2]">
            {/* Modal Header: Title & Close Button */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[19px] sm:text-[20px] text-[#1A1D2E] tracking-tight">
                Blokdan chiqarish
              </h3>
              <button
                type="button"
                onClick={() => setUnblockModalOpen(false)}
                className="text-[#1A1D2E] hover:text-black p-1 rounded-lg hover:bg-[#F1F3F9] transition-colors cursor-pointer"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Description Text */}
            <p className="text-[14px] text-[#5B6078] leading-relaxed">
              {fullName} yana tizimga kira oladi va yig'ilishlarga qo'shila oladi.
            </p>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setUnblockModalOpen(false)}
                className="inline-flex items-center gap-2 text-[#1A1D2E] hover:text-black text-[14px] font-bold py-2.5 px-2 transition-colors cursor-pointer"
              >
                <X size={16} strokeWidth={2.5} />
                <span>Bekor qilish</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmUnblock}
                disabled={actionLoading}
                className="h-11 px-5 rounded-xl bg-[#3858C7] hover:bg-[#2F4BB8] text-white text-[14px] font-semibold transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Unlock size={17} strokeWidth={2.2} />
                )}
                <span>Blokdan chiqarish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Appeal Confirmation Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-[560px] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-[#E2E6F2]">
            {/* Modal Header: Title & Close Button */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[19px] sm:text-[20px] text-[#1A1D2E] tracking-tight">
                E'tirozni rad etish
              </h3>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="text-[#1A1D2E] hover:text-black p-1 rounded-lg hover:bg-[#F1F3F9] transition-colors cursor-pointer"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Description Text */}
            <p className="text-[14px] text-[#5B6078] leading-relaxed">
              Foydalanuvchi yuborgan e'tirozni rad etish sababini kiriting. Ushbu sabab foydalanuvchiga ko'rsatiladi.
            </p>

            <form onSubmit={handleConfirmRejectAppeal} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
                  Rad etish sababi <span className="text-[#D92D20]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="E'tirozni rad etish sababini kiriting..."
                  className="w-full bg-white border border-[#D0DCFF] focus:border-[#D92D20] rounded-2xl p-3.5 text-[13.5px] text-[#1A1D2E] placeholder-[#8B90A5] focus:outline-none focus:ring-2 focus:ring-[#D92D20]/10 transition-all resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="inline-flex items-center gap-2 text-[#1A1D2E] hover:text-black text-[14px] font-bold py-2.5 px-2 transition-colors cursor-pointer"
                >
                  <X size={16} strokeWidth={2.5} />
                  <span>Bekor qilish</span>
                </button>

                <button
                  type="submit"
                  disabled={!rejectReasonInput.trim() || actionLoading}
                  className={`h-11 px-6 rounded-xl font-semibold text-[14px] text-white transition-all shadow-xs flex items-center gap-2 ${
                    rejectReasonInput.trim() && !actionLoading
                      ? "bg-[#D92D20] hover:bg-[#B42318] cursor-pointer active:scale-95"
                      : "bg-[#D92D20]/50 cursor-not-allowed"
                  }`}
                >
                  {actionLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <X size={17} strokeWidth={2.2} />
                  )}
                  <span>Rad etish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`bg-white border rounded-2xl shadow-xl p-4 flex items-start gap-3.5 max-w-md ${
              toastMessage.type === "error"
                ? "border-[#FECDCA]"
                : "border-[#10B981]/40"
            }`}
          >
            <div
              className={`flex-shrink-0 mt-0.5 ${
                toastMessage.type === "error" ? "text-[#D92D20]" : "text-[#10B981]"
              }`}
            >
              {toastMessage.type === "error" ? (
                <div className="w-6 h-6 rounded-full bg-[#FEF3F2] flex items-center justify-center text-[#D92D20]">
                  <HugeiconsIcon icon={Cancel01Icon} size={15} strokeWidth={2.5} />
                </div>
              ) : (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} />
              )}
            </div>
            <div className="flex-1 pr-2">
              <h4
                className={`text-[14px] font-bold leading-tight ${
                  toastMessage.type === "error" ? "text-[#D92D20]" : "text-[#1A1D2E]"
                }`}
              >
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

export default UserDetailPage;

