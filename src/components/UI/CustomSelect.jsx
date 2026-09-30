import { useState, useRef, useEffect, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Search01Icon,
  Tick02Icon,
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

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

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return normalizedOptions;
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [normalizedOptions, searchTerm]);

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
        className={`w-full flex items-center justify-between gap-2.5 bg-white border border-[#E2E6F2] rounded-xl h-8 px-4 py-2.5 text-[13.5px] font-medium transition-all shadow-2xs ${className} ${
          isOpen
            ? "border-[#4763E4] ring-2 ring-[#4763E4]/10 text-[#1A1D2E]"
            : "text-[#1A1D2E] hover:border-[#CBD5E1]"
        } ${disabled ? "cursor-default bg-[#FFFFFF] hover:border-[#E2E6F2]" : "cursor-pointer"}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={16}
          className={`text-[#5B6078] flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#4763E4]" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 w-full min-w-[200px] bg-white border border-[#E2E6F2] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${menuClassName}`}
        >
          {/* Search Input inside Menu */}
          {searchable && (
            <div className="px-2.5 pb-2 pt-0.5 border-b border-[#E2E6F2]/70">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#8B90A5]">
                  <HugeiconsIcon icon={Search01Icon} size={15} />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-[#F8F9FC] border border-[#E2E6F2] rounded-xl pl-8 pr-3 py-1.5 text-[12.5px] text-[#1A1D2E] placeholder-[#8B90A5] focus:outline-none focus:border-[#4763E4] focus:bg-white transition-all"
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#EEF2FF] text-[#4763E4] font-semibold"
                        : "text-[#1A1D2E] hover:bg-[#F8F9FC] hover:text-[#4763E4]"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={15}
                        className="text-[#4763E4] flex-shrink-0 ml-2"
                      />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-center text-[12.5px] text-[#8B90A5]">
                Hech narsa topilmadi
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
