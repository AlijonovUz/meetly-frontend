import React, { useRef, useState, useEffect, useCallback } from "react";
import { FaXmark } from "react-icons/fa6";
import { Edit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { submitAttendanceSignature, submitMeetingSignature } from "../../services/meetingsApi";
import { toast } from "../../Toast/ToastProvider";

export default function AttendanceSignatureModal({
  isOpen,
  onClose,
  notificationData,
  onSuccess,
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract meeting and attendance info from notification data
  const extraData = notificationData?.extra_data || {};
  const attendanceId =
    extraData.attendance_id ||
    extraData.attendanceId ||
    extraData.attendance?.id ||
    notificationData?.attendance_id ||
    (notificationData?.id && !String(notificationData?.id).startsWith("meet_") ? notificationData?.id : null);

  const meetingId =
    extraData.meeting_id ||
    extraData.meetingId ||
    notificationData?.meeting_id ||
    notificationData?.meeting?.id ||
    notificationData?.id;

  const meetingTitle =
    extraData.meeting_title ||
    extraData.meeting_name ||
    extraData.title ||
    notificationData?.title?.replace(/^Imzo kutilmoqda\s*[-–:]*\s*/i, "") ||
    "Mahalla raislari yig'ilishi";

  const meetingDate = extraData.date || extraData.start_date
    ? new Date(extraData.date || extraData.start_date).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "01.10.2026";

  const meetingTime = extraData.start_time
    ? String(extraData.start_time).slice(0, 5)
    : "15:00";

  const userAttendedTime = extraData.attended_time || extraData.duration_text
    ? extraData.attended_time || extraData.duration_text
    : `${meetingTime} – ${extraData.end_time ? String(extraData.end_time).slice(0, 5) : "15:30"}`;

  // Initialize and clear canvas when modal opens
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          // Adjust canvas coordinate space to display size for sharp retina drawing
          const rect = canvas.getBoundingClientRect();
          const dpr = window.devicePixelRatio || 1;
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          const ctx = canvas.getContext("2d");
          ctx.scale(dpr, dpr);
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = "#1E293B";
        }
        clearCanvas();
      }, 50);
    }
  }, [isOpen, clearCanvas]);

  // Coordinate calculations
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.closePath();
    }
    setIsDrawing(false);
  };

  const handleSubmit = async () => {
    if (!hasSignature || !canvasRef.current || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const canvas = canvasRef.current;
      const signatureDataUrl = canvas.toDataURL("image/png");

      // Convert canvas to binary Blob / File
      const signatureBlob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png");
      });

      const file = signatureBlob
        ? new File([signatureBlob], "signature.png", { type: "image/png" })
        : signatureDataUrl;

      if (attendanceId) {
        await submitAttendanceSignature(attendanceId, file);
      } else if (meetingId) {
        await submitMeetingSignature(meetingId, file);
      }

      toast.success(
        "Imzo saqlandi",
        `«${meetingTitle}»da qatnashganingiz tasdiqlandi.`
      );

      if (onSuccess) {
        onSuccess(notificationData, signatureDataUrl);
      }
      onClose();
    } catch (err) {
      console.error("Imzo yuborishda xato:", err);
      const errorMsg =
        err?.response?.data?.error?.errorMsg ||
        err?.response?.data?.errorMsg ||
        err?.response?.data?.message ||
        "Imzoni saqlashda xatolik yuz berdi. Qaytadan urinib ko'ring.";
      toast.error("Xatolik", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-['Manrope',sans-serif]">
      <div className="bg-white dark:bg-[#12161F] rounded-3xl shadow-2xl border border-slate-200/90 dark:border-white/10 w-full max-w-[500px] p-6 space-y-4.5 animate-in zoom-in-95 duration-150 relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Qatnashishni tasdiqlash
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
          >
            <FaXmark size={15} />
          </button>
        </div>

        {/* Meeting Information Box */}
        <div className="bg-[#F8FAFC] dark:bg-[#181C24] p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 dark:border-white/5 space-y-1.5">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
            {meetingTitle}
          </h4>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Sana:{" "}
              <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                {meetingDate}
              </strong>
            </span>
            <span>
              Vaqti:{" "}
              <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                {meetingTime}
              </strong>
            </span>
            <span>
              Siz qatnashdingiz:{" "}
              <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                {userAttendedTime}
              </strong>
            </span>
          </div>
        </div>

        {/* Signature Pad Section */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            Imzo *
          </label>
          <div
            className={`relative w-full h-44 rounded-2xl bg-white overflow-hidden transition-all select-none touch-none ${
              hasSignature
                ? "border-2 border-[#3B59BA] shadow-xs"
                : "border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400"
            }`}
          >
            {/* Placeholder before user starts drawing */}
            {!hasSignature && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 p-4">
                <HugeiconsIcon icon={Edit02Icon} size={22} className="text-slate-400 mb-1" />
                <span className="text-xs sm:text-sm font-normal text-slate-400 text-center">
                  Sichqoncha bilan shu yerga imzo chizing
                </span>
                <div className="w-48 border-b border-slate-200 mt-4 relative flex items-center justify-start">
                  <span className="text-[11px] text-slate-300 absolute -top-2 left-0">✕</span>
                </div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair block"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          {/* Sub-label and Clear Button */}
          <div className="flex items-center justify-between text-xs pt-0.5 px-0.5">
            <span className="text-[11px] text-slate-400">
              Imzo rasm sifatida saqlanadi
            </span>
            {hasSignature && (
              <button
                type="button"
                onClick={clearCanvas}
                className="text-xs font-semibold text-slate-500 hover:text-red-500 cursor-pointer transition-colors"
              >
                Tozalash
              </button>
            )}
          </div>
        </div>

        {/* Warning Notice Box */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#FFFBEB] dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/30 text-amber-800 dark:text-amber-200 text-xs font-medium leading-relaxed">
          Imzo qo'yilmasa, yig'ilishdagi qatnashishingiz tasdiqlanmagan hisoblanadi.
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#F0F3F7] dark:bg-[#1E2430] hover:bg-slate-200 dark:hover:bg-[#283040] text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm cursor-pointer transition-all active:scale-95"
          >
            Keyinroq
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasSignature || isSubmitting}
            className={`px-5 py-2.5 rounded-xl bg-[#3B59BA] hover:bg-[#324D9E] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm ${
              !hasSignature || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <HugeiconsIcon icon={Edit02Icon} size={15} strokeWidth={2} />
            <span>{isSubmitting ? "Saqlanmoqda..." : "Imzolash"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
