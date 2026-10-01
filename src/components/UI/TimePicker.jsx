import React, { useState, useRef, useEffect } from "react";
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
  value = "00:00",
  onChange,
  placeholder = "00:00",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState("bottom");
  const [inputText, setInputText] = useState(value || "");
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const hoursListRef = useRef(null);
  const minutesListRef = useRef(null);

  // Parse current value
  const [currentHour, currentMinute] = (value && value.includes(":") ? value : "00:00").split(":");

  // Tashqi value o'zgarsa, input matnini yangilaymiz
  useEffect(() => {
    setInputText(value || "");
  }, [value]);

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
      const normalized = normalizeTime(masked);
      onChange?.(normalized);
    } else if (masked === "") {
      onChange?.("");
    }
  };

  const handleBlur = () => {
    if (inputText.trim() === "") {
      return;
    }
    if (inputText.length === 5) {
      const normalized = normalizeTime(inputText);
      setInputText(normalized);
      onChange?.(normalized);
    } else if (inputText.length > 0) {
      const normalized = normalizeTime(inputText);
      setInputText(normalized);
      onChange?.(normalized);
    }
  };

  const handleSelectHour = (h) => {
    const newTime = `${h}:${currentMinute || "00"}`;
    setInputText(newTime);
    onChange?.(newTime);
  };

  const handleSelectMinute = (m) => {
    const newTime = `${currentHour || "00"}:${m}`;
    setInputText(newTime);
    onChange?.(newTime);
  };

  const handleSetNow = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const newTime = `${h}:${m}`;
    setInputText(newTime);
    onChange?.(newTime);
    setIsOpen(false);
  };

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
          className={`w-full bg-white border border-[#E2E6F2] rounded-2xl pl-3.5 pr-10 h-11 text-[13.5px] font-medium text-[#1A1D2E] outline-none transition-all placeholder:text-[#8B90A5] focus:border-[#3858C7] focus:ring-2 focus:ring-[#3858C7]/10 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
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
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5B6078] hover:text-[#1A1D2E] transition-colors cursor-pointer flex items-center justify-center"
        >
          <HugeiconsIcon icon={Clock01Icon} size={17} />
        </button>
      </div>

      {/* Popover Dropdown - Minimal & Compact */}
      {isOpen && (
        <div
          className={`absolute left-0 ${
            placement === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } w-[190px] bg-white border border-[#E2E6F2] rounded-2xl shadow-xl z-50 p-2.5 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-[#F1F3F9]">
            <span className="text-xs font-bold text-[#1A1D2E] tracking-tight">
              {inputText || value || "00:00"}
            </span>
            <button
              type="button"
              onClick={handleSetNow}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#3858C7] text-[11px] font-bold transition-colors cursor-pointer active:scale-95"
            >
              <HugeiconsIcon icon={FlashIcon} size={11} />
              <span>Hozir</span>
            </button>
          </div>

          {/* Time Columns Header */}
          <div className="grid grid-cols-2 text-center text-[10px] font-bold text-[#8B90A5] uppercase tracking-wider mb-1">
            <span>Soat</span>
            <span>Daqiqa</span>
          </div>

          {/* 2 Clean Scrollable Columns with hidden scrollbars */}
          <div className="grid grid-cols-2 gap-1.5 h-36">
            {/* Hours Column */}
            <div
              ref={hoursListRef}
              className="overflow-y-auto space-y-0.5 pr-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {HOURS.map((h) => {
                const isSelected = h === currentHour;
                return (
                  <button
                    key={h}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => handleSelectHour(h)}
                    className={`w-full h-7 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? "bg-[#3858C7] text-white shadow-2xs"
                        : "text-[#5B6078] hover:text-[#1A1D2E] hover:bg-[#F4F6FB]"
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
                return (
                  <button
                    key={m}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => handleSelectMinute(m)}
                    className={`w-full h-7 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? "bg-[#3858C7] text-white shadow-2xs"
                        : "text-[#5B6078] hover:text-[#1A1D2E] hover:bg-[#F4F6FB]"
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
