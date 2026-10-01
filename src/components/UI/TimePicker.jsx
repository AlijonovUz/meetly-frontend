import React, { useState, useRef, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, FlashIcon } from "@hugeicons/core-free-icons";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

const TimePicker = ({
  value = "00:00",
  onChange,
  placeholder = "00:00",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState("bottom");
  const containerRef = useRef(null);
  const hoursListRef = useRef(null);
  const minutesListRef = useRef(null);

  // Parse current value
  const [currentHour, currentMinute] = (value && value.includes(":") ? value : "00:00").split(":");

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

  const handleSelectHour = (h) => {
    const newTime = `${h}:${currentMinute || "00"}`;
    onChange?.(newTime);
  };

  const handleSelectMinute = (m) => {
    const newTime = `${currentHour || "00"}:${m}`;
    onChange?.(newTime);
  };

  const handleSetNow = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const newTime = `${h}:${m}`;
    onChange?.(newTime);
    setIsOpen(false);
  };

  return (
    <div className="relative select-none" ref={containerRef}>
      {/* Trigger Input/Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-white border border-[#E2E6F2] rounded-2xl pl-4 pr-10 h-12 text-[13.5px] font-medium text-[#1A1D2E] flex items-center justify-between transition-all shadow-2xs ${
          isOpen
            ? "border-[#3858C7] ring-2 ring-[#3858C7]/10"
            : "hover:border-[#CBD5E1]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      >
        <span>{value || placeholder}</span>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5B6078] pointer-events-none">
          <HugeiconsIcon icon={Clock01Icon} size={18} />
        </div>
      </button>

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
              {value || "00:00"}
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
