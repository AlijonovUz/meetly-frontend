import { useState, useRef, useEffect, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Search01Icon,
  Tick02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Tanlang",
  searchable = true,
  searchPlaceholder = "Qidirish...",
  className = "",
  menuClassName = "",
  disabled = false,
  containerClassName = "",
  onSearch,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [placement, setPlacement] = useState("bottom");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const isFirstRender = useRef(true);

  // Auto detect best placement (top or bottom) based on available screen space
  const updatePlacement = () => {
    if (!dropdownRef.current) return;
    const rect = dropdownRef.current.getBoundingClientRect();
    const dropdownHeight = 250;
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
    }
    return () => {
      window.removeEventListener("scroll", updatePlacement, true);
      window.removeEventListener("resize", updatePlacement);
    };
  }, [isOpen]);

  // Normalize options to standard { value, label } format
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "object" && opt !== null) {
        return {
          value: opt.value !== undefined ? opt.value : opt.label,
          label: opt.label !== undefined ? opt.label : String(opt.value),
        };
      }
      return { value: opt, label: String(opt) };
    });
  }, [options]);

  // Find currently selected option
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Debounced API search when onSearch is provided
  useEffect(() => {
    if (!onSearch) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (onSearch) {
      return normalizedOptions;
    }
    if (!searchTerm.trim()) return normalizedOptions;
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [normalizedOptions, searchTerm, onSearch]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  const handleSelect = (optValue) => {
    onChange?.(optValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative select-none ${containerClassName}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 bg-white dark:bg-[#121624] border border-[#E2E6F2] dark:border-[#2B3553] rounded-xl h-11 px-3.5 text-[13.5px] font-medium transition-all shadow-2xs ${className} ${
          isOpen
            ? "border-[#3858C7] ring-2 ring-[#3858C7]/10 text-[#1A1D2E] dark:text-white"
            : "text-[#1A1D2E] dark:text-white hover:border-[#CBD5E1] dark:hover:border-[#3858C7]"
        } ${disabled ? "cursor-default bg-[#FFFFFF] dark:bg-[#121624] hover:border-[#E2E6F2] dark:hover:border-[#2B3553]" : "cursor-pointer"}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={16}
          className={`text-[#5B6078] dark:text-[#94A3B8] flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#3858C7] dark:text-[#7F95E6]" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 ${
            placement === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } w-full min-w-[200px] bg-white dark:bg-[#161C2E] border border-[#E2E6F2] dark:border-[#2B3553] rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${menuClassName}`}
        >
          {/* Search Input inside Menu */}
          {searchable && (
            <div className="px-2.5 pb-2 pt-0.5 border-b border-[#E2E6F2]/70 dark:border-[#2B3553]/70">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#8B90A5] dark:text-[#64748B]">
                  {loading ? (
                    <HugeiconsIcon icon={Loading03Icon} size={15} className="animate-spin text-[#3858C7]" />
                  ) : (
                    <HugeiconsIcon icon={Search01Icon} size={15} />
                  )}
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-[#F8F9FC] dark:bg-[#121624] border border-[#E2E6F2] dark:border-[#2B3553] rounded-lg pl-8 pr-3 py-1.5 text-[12.5px] text-[#1A1D2E] dark:text-white placeholder-[#8B90A5] dark:placeholder-[#64748B] focus:outline-none focus:border-[#4763E4] focus:bg-white dark:focus:bg-[#121624] transition-all"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto px-1.5 py-1 space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#EEF2FB] dark:bg-[#232E47] text-[#3858C7] dark:text-[#7F95E6] font-semibold"
                        : "text-[#1A1D2E] dark:text-slate-200 hover:bg-[#F8FAFC] dark:hover:bg-[#1C2438] hover:text-[#3858C7] dark:hover:text-[#7F95E6]"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={15}
                        className="text-[#3858C7] dark:text-[#7F95E6] flex-shrink-0 ml-2"
                      />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-center text-[12.5px] text-[#8B90A5] dark:text-[#64748B]">
                {loading ? "Yuklanmoqda..." : "Hech narsa topilmadi"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
