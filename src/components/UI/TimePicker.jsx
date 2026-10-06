import React, { useState, useRef, useEffect, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, FlashIcon } from "@hugeicons/core-free-icons";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

// Auto mask: raqamlardan "HH:mm" hosil qiladi
function applyTimeMask(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

// "HH:mm" formatini tekshirish
function normalizeTime(val) {
  if (!val || typeof val !== "string") return "00:00";
  const parts = val.split(":");
  let h = parseInt(parts[0], 10);
  let m = parseInt(parts[1] || "0", 10);
  if (isNaN(h)) h = 0;
  if (isNaN(m)) m = 0;
  if (h > 23) h = 23;
  if (m > 59) m = 59;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const TimePicker = ({
  value = "",
  onChange,
  placeholder = "00:00",
  className = "",
  disabled = false,
  minTime,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState("bottom");
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const hoursListRef = useRef(null);
  const minutesListRef = useRef(null);

  // Parse minTime
  const minTimeParsed = useMemo(() => {
    if (!minTime || typeof minTime !== "string" || !minTime.includes(":")) return null;
    const [mh, mm] = minTime.split(":").map((n) => parseInt(n, 10));
    if (isNaN(mh) || isNaN(mm)) return null;
    return {
      hour: mh,
      minute: mm,
      str: `${String(mh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`,
    };
  }, [minTime]);

  const clampTime = React.useCallback((val) => {
    if (!val) return "";
    const norm = normalizeTime(val);
    if (!minTimeParsed) return norm;
    if (norm < minTimeParsed.str) {
      return minTimeParsed.str;
    }
    return norm;
  }, [minTimeParsed]);

  const [inputText, setInputText] = useState(() => (value ? clampTime(value) : ""));

  // Parse current value
  const [currentHour, currentMinute] = (value && value.includes(":") ? value : "00:00").split(":");

  // Tashqi value yoki minTime o'zgarsa, input matnini yangilaymiz
  useEffect(() => {
    if (value) {
      const clamped = clampTime(value);
      setInputText(clamped);
      if (clamped !== value) {
        onChange?.(clamped);
      }
    } else {
      setInputText("");
    }
  }, [value, minTimeParsed, clampTime, onChange]);

  // Auto position top / bottom
  const updatePlacement = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dropdownHeight = 220;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      setPlacement("top");
    } else {
      setPlacement("bottom");
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePlacement();
      window.addEventListener("scroll", updatePlacement, true);
      window.addEventListener("resize", updatePlacement);

      // Smoothly scroll selected numbers into view
      setTimeout(() => {
        if (hoursListRef.current) {
          const selectedHourEl = hoursListRef.current.querySelector('[data-selected="true"]');
          if (selectedHourEl) {
            selectedHourEl.scrollIntoView({ block: "center", behavior: "smooth" });
          }
        }
        if (minutesListRef.current) {
          const selectedMinEl = minutesListRef.current.querySelector('[data-selected="true"]');
          if (selectedMinEl) {
            selectedMinEl.scrollIntoView({ block: "center", behavior: "smooth" });
          }
        }
      }, 50);
    }
    return () => {
      window.removeEventListener("scroll", updatePlacement, true);
      window.removeEventListener("resize", updatePlacement);
    };
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const raw = e.target.value;
    const masked = applyTimeMask(raw);
    setInputText(masked);

    if (masked.length === 5) {
      const clamped = clampTime(masked);
      setInputText(clamped);
      onChange?.(clamped);
    } else if (masked === "") {
      onChange?.("");
    }
  };

  const handleBlur = () => {
    if (inputText.trim() === "") {
      return;
    }
    const clamped = clampTime(inputText);
    setInputText(clamped);
    onChange?.(clamped);
  };

  const handleSelectHour = (h) => {
    const hourNum = parseInt(h, 10);
    if (minTimeParsed && hourNum < minTimeParsed.hour) return;

    let targetMinute = currentMinute || "00";
    if (minTimeParsed && hourNum === minTimeParsed.hour) {
      if (parseInt(targetMinute, 10) < minTimeParsed.minute) {
        targetMinute = String(minTimeParsed.minute).padStart(2, "0");
      }
    }

    const newTime = `${h}:${targetMinute}`;
    const clamped = clampTime(newTime);
    setInputText(clamped);
    onChange?.(clamped);
  };

  const handleSelectMinute = (m) => {
    const minuteNum = parseInt(m, 10);
    const hourNum = parseInt(currentHour || "0", 10);
    if (minTimeParsed) {
      if (hourNum < minTimeParsed.hour) return;
      if (hourNum === minTimeParsed.hour && minuteNum < minTimeParsed.minute) return;
    }

    const newTime = `${currentHour || "00"}:${m}`;
    const clamped = clampTime(newTime);
    setInputText(clamped);
    onChange?.(clamped);
  };

  const handleSetNow = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const newTime = `${h}:${m}`;
    const clamped = clampTime(newTime);
    setInputText(clamped);
    onChange?.(clamped);
    setIsOpen(false);
  };

  const currentHourNum = parseInt(currentHour || "0", 10);

  return (
    <div className="relative select-none" ref={containerRef}>
      {/* Input container */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          maxLength={5}
          disabled={disabled}
          className={`w-full bg-white dark:bg-[#121624] border border-[#E2E6F2] dark:border-[#2B3553] rounded-2xl pl-3.5 pr-10 h-11 text-[13.5px] font-medium text-[#1A1D2E] dark:text-white outline-none transition-all placeholder:text-[#8B90A5] dark:placeholder:text-[#64748B] focus:border-[#3858C7] focus:ring-2 focus:ring-[#3858C7]/10 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              inputRef.current?.focus();
            }
          }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5B6078] dark:text-[#94A3B8] hover:text-[#1A1D2E] dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center"
        >
          <HugeiconsIcon icon={Clock01Icon} size={17} />
        </button>
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute left-0 ${
            placement === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } w-[190px] bg-white dark:bg-[#161C2E] border border-[#E2E6F2] dark:border-[#2B3553] rounded-2xl shadow-xl z-50 p-2.5 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-[#F1F3F9] dark:border-[#232E47]">
            <span className="text-xs font-bold text-[#1A1D2E] dark:text-white tracking-tight">
              {inputText || value || "00:00"}
            </span>
            <button
              type="button"
              onClick={handleSetNow}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[#3858C7] dark:text-[#7F95E6] text-[11px] font-bold transition-colors cursor-pointer active:scale-95"
            >
              <HugeiconsIcon icon={FlashIcon} size={11} />
              <span>Hozir</span>
            </button>
          </div>

          {/* Time Columns Header */}
          <div className="grid grid-cols-2 text-center text-[10px] font-bold text-[#8B90A5] dark:text-[#64748B] uppercase tracking-wider mb-1">
            <span>Soat</span>
            <span>Daqiqa</span>
          </div>

          {/* 2 Clean Scrollable Columns */}
          <div className="grid grid-cols-2 gap-1.5 h-36">
            {/* Hours Column */}
            <div
              ref={hoursListRef}
              className="overflow-y-auto space-y-0.5 pr-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {HOURS.map((h) => {
                const isSelected = h === currentHour;
                const hNum = parseInt(h, 10);
                const isHourDisabled = minTimeParsed && hNum < minTimeParsed.hour;

                return (
                  <button
                    key={h}
                    type="button"
                    disabled={isHourDisabled}
                    data-selected={isSelected}
                    onClick={() => handleSelectHour(h)}
                    className={`w-full h-7 rounded-lg text-xs font-semibold text-center transition-all flex items-center justify-center ${
                      isHourDisabled
                        ? "text-[#94A3B8] dark:text-[#64748B] opacity-40 cursor-not-allowed pointer-events-none hover:bg-transparent"
                        : isSelected
                        ? "bg-[#3858C7] text-white shadow-2xs cursor-pointer"
                        : "text-[#5B6078] dark:text-[#94A3B8] hover:text-[#1A1D2E] dark:hover:text-white hover:bg-[#F4F6FB] dark:hover:bg-[#1C2438] cursor-pointer"
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            {/* Minutes Column */}
            <div
              ref={minutesListRef}
              className="overflow-y-auto space-y-0.5 pr-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {MINUTES.map((m) => {
                const isSelected = m === currentMinute;
                const mNum = parseInt(m, 10);
                const isMinuteDisabled =
                  minTimeParsed &&
                  (currentHourNum < minTimeParsed.hour ||
                    (currentHourNum === minTimeParsed.hour && mNum < minTimeParsed.minute));

                return (
                  <button
                    key={m}
                    type="button"
                    disabled={isMinuteDisabled}
                    data-selected={isSelected}
                    onClick={() => handleSelectMinute(m)}
                    className={`w-full h-7 rounded-lg text-xs font-semibold text-center transition-all flex items-center justify-center ${
                      isMinuteDisabled
                        ? "text-[#94A3B8] dark:text-[#64748B] opacity-40 cursor-not-allowed pointer-events-none hover:bg-transparent"
                        : isSelected
                        ? "bg-[#3858C7] text-white shadow-2xs cursor-pointer"
                        : "text-[#5B6078] dark:text-[#94A3B8] hover:text-[#1A1D2E] dark:hover:text-white hover:bg-[#F4F6FB] dark:hover:bg-[#1C2438] cursor-pointer"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
