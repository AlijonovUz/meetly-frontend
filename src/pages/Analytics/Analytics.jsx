import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import { FaArrowRightLong } from "react-icons/fa6";

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30 kun");
  const periods = ["Bugun", "7 kun", "30 kun", "Yil"];

  const weeklyAttendance = [
    { day: "Du", value: 88, isPeak: false },
    { day: "Se", value: 91, isPeak: true },
    { day: "Cho", value: 79, isPeak: false },
    { day: "Pa", value: 86, isPeak: false },
    { day: "Ju", value: 82, isPeak: false },
    { day: "Sha", value: 64, isPeak: false },
  ];

  // Mini sparkline bar generator
  const renderMiniBars = (heights) => (
    <div className="flex items-end gap-1 h-10 self-end">
      {heights.map((h, i) => (
        <div
          key={i}
          style={{ height: `${h}%` }}
          className={`w-1.5 rounded-full transition-all duration-300 ${
            i >= heights.length - 2 ? "bg-[#3858C7]" : "bg-[#B7C7F3]"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="p-6 py-5 font-['Manrope',sans-serif] min-h-screen">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-[22px] md:text-[24px] font-bold text-[#1A1D2E]">
            Dashboard
          </h1>
          <p className="text-[12.5px] text-[#8B90A5] mt-0.5">
            1-oktabr, 2026 <span className="mx-1.5 text-[#D1D5DB]">|</span> Oxirgi 30 kun, oʻzgarish oldingi 30 kunga nisbatan
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented Period Tabs */}
          <div className="flex items-center p-1 rounded-xl">
            {periods.map((p) => {
              const isActive = selectedPeriod === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-3.5 py-1.5 text-[12.5px] font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-white text-[#1A1D2E] shadow-md! font-extrabold!"
                      : "text-[#5E6480] hover:text-[#1A1D2E]"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* New Meeting Button */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-create-meeting-modal"))}
            className="inline-flex items-center gap-2 bg-[#3858C7] hover:bg-[#2C48B0] active:scale-[0.98] text-white font-bold text-[13px] h-9 px-4 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus size={16} strokeWidth={3.5} />
            <span>Yangi yigʻilish</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Card 1: Foydalanuvchilar */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold text-[#8B90A5] tracking-wider uppercase block">
              FOYDALANUVCHILAR
            </span>
            <div className="text-[26px] font-extrabold text-[#1A1D2E] my-1 tracking-tight">
              1 248
            </div>
            <div className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-lg">
              <span>↑</span>
              <span>+6,4%</span>
            </div>
          </div>
          {renderMiniBars([30, 45, 60, 40, 75, 55, 80, 95])}
        </div>

        {/* Card 2: Jami yig'ilishlar */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold text-[#8B90A5] tracking-wider uppercase block">
              JAMI YIG'ILISHLAR
            </span>
            <div className="text-[26px] font-extrabold text-[#1A1D2E] my-1 tracking-tight">
              256
            </div>
            <div className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-lg">
              <span>↑</span>
              <span>+12,1%</span>
            </div>
          </div>
          {renderMiniBars([40, 35, 50, 65, 55, 70, 85, 90])}
        </div>

        {/* Card 3: Joriy yig'ilishlar */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold text-[#8B90A5] tracking-wider uppercase block">
              JORIY YIGʻILISHLAR
            </span>
            <div className="text-[26px] font-extrabold text-[#1A1D2E] my-1 tracking-tight">
              2
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#F97316] bg-[#FFF7ED] px-2 py-0.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
              <span>Hozir o'tmoqda</span>
            </div>
          </div>
          {renderMiniBars([20, 30, 40, 60, 50, 75, 65, 85])}
        </div>

        {/* Card 4: O'rtacha qatnashish */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold text-[#8B90A5] tracking-wider uppercase block">
              O'RTACHA QATNASHISH
            </span>
            <div className="text-[26px] font-extrabold text-[#1A1D2E] my-1 tracking-tight">
              84%
            </div>
            <div className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-lg">
              <span>↑</span>
              <span>+3,2%</span>
            </div>
          </div>
          {renderMiniBars([50, 60, 55, 70, 65, 80, 85, 95])}
        </div>
      </div>

      {/* Middle Section: Dynamics Area Chart & Status Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Left: Meeting Dynamics 12 Weeks (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#E2E6F2] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11.5px] font-bold text-[#8B90A5] tracking-wider uppercase">
              YIG'ILISHLAR DINAMIKASI, 12 HAFTA
            </span>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#5E6480]">
              <span className="w-2 h-2 rounded-full bg-[#3858C7]"></span>
              <span>O'tkazilgan yig'ilishlar</span>
            </div>
          </div>

          {/* Smooth Area Curve SVG with Tooltip */}
          <div className="relative w-full h-56 pt-2">
            <svg
              viewBox="0 0 600 200"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3858C7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3858C7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Horizontal Lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="#F1F3F9" strokeWidth="1" />
              <line x1="0" y1="65" x2="600" y2="65" stroke="#F1F3F9" strokeWidth="1" />
              <line x1="0" y1="110" x2="600" y2="110" stroke="#F1F3F9" strokeWidth="1" />
              <line x1="0" y1="155" x2="600" y2="155" stroke="#F1F3F9" strokeWidth="1" />
              <line x1="0" y1="195" x2="600" y2="195" stroke="#E2E6F2" strokeWidth="1" />

              {/* Area Fill */}
              <path
                d="M 0 130 C 50 120, 100 130, 150 125 C 200 120, 250 100, 300 105 C 350 110, 400 90, 450 85 C 500 80, 550 50, 600 45 L 600 195 L 0 195 Z"
                fill="url(#curveGradient)"
              />

              {/* Smooth Stroke Line */}
              <path
                d="M 0 130 C 50 120, 100 130, 150 125 C 200 120, 250 100, 300 105 C 350 110, 400 90, 450 85 C 500 80, 550 50, 600 45"
                fill="none"
                stroke="#3858C7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Active Point at the end */}
              <circle cx="585" cy="48" r="4.5" fill="#3858C7" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            {/* Custom Tooltip on Active Point */}
            <div className="absolute right-4 top-2 bg-[#1A1D2E] text-white text-[11.5px] font-semibold px-2.5 py-1 rounded-lg shadow-lg pointer-events-none">
              32 ta, shu hafta
            </div>
          </div>

          {/* X Axis Labels */}
          <div className="flex items-center justify-between text-[11px] text-[#8B90A5] mt-3 px-1">
            <span>1-hafta</span>
            <span>3-hafta</span>
            <span>5-hafta</span>
            <span>7-hafta</span>
            <span>9-hafta</span>
            <span>12-hafta</span>
          </div>
        </div>

        {/* Right: Status Donut Chart (1 col) */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <span className="text-[11.5px] font-bold text-[#8B90A5] tracking-wider uppercase mb-3">
            HOLAT BO'YICHA
          </span>

          {/* Donut Chart */}
          <div className="relative flex items-center justify-center py-2">
            <svg viewBox="0 0 160 160" className="w-36 h-36">
              {/* Total circle circumference ~ 377 (2 * PI * 60) */}
              {/* O'tkazilgan (71.9% -> 271) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#10B981"
                strokeWidth="18"
                strokeDasharray="271 377"
                strokeDashoffset="0"
                className="transition-all duration-500"
              />
              {/* Rejalashtirilgan (14.5% -> 55) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#3858C7"
                strokeWidth="18"
                strokeDasharray="55 377"
                strokeDashoffset="-273"
                className="transition-all duration-500"
              />
              {/* Bekor qilingan (12.9% -> 48) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#98A2B3"
                strokeWidth="18"
                strokeDasharray="48 377"
                strokeDashoffset="-330"
                className="transition-all duration-500"
              />
              {/* Joriy (0.8% -> 4) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#F97316"
                strokeWidth="18"
                strokeDasharray="4 377"
                strokeDashoffset="-326"
                className="transition-all duration-500"
              />
            </svg>

            {/* Centered Total Count */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[24px] font-extrabold text-[#1A1D2E] leading-none">
                256
              </span>
              <span className="text-[10px] font-bold text-[#8B90A5] tracking-wider mt-0.5">
                JAMI
              </span>
            </div>
          </div>

          {/* Status Breakdown Legend */}
          <div className="space-y-2 mt-3 pt-3 border-t border-[#F1F3F9]">
            <div className="flex items-center justify-between text-[12.5px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                <span className="text-[#5E6480]">O'tkazilgan</span>
              </div>
              <div className="font-semibold text-[#1A1D2E]">
                184 <span className="text-[#8B90A5] font-normal text-[11px] ml-1.5">71,9%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[12.5px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3858C7]"></span>
                <span className="text-[#5E6480]">Rejalashtirilgan</span>
              </div>
              <div className="font-semibold text-[#1A1D2E]">
                37 <span className="text-[#8B90A5] font-normal text-[11px] ml-1.5">14,5%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[12.5px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></span>
                <span className="text-[#5E6480]">Joriy</span>
              </div>
              <div className="font-semibold text-[#1A1D2E]">
                2 <span className="text-[#8B90A5] font-normal text-[11px] ml-1.5">0,8%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[12.5px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#98A2B3]"></span>
                <span className="text-[#5E6480]">Bekor qilingan</span>
              </div>
              <div className="font-semibold text-[#1A1D2E]">
                33 <span className="text-[#8B90A5] font-normal text-[11px] ml-1.5">12,9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Col 1: Bugungi yig'ilishlar */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11.5px] font-bold text-[#8B90A5] tracking-wider uppercase">
              BUGUNGI YIG'ILISHLAR
            </span>
            <Link
              to="/meetings"
              className="flex items-center gap-1 text-[12px] font-bold text-[#3858C7] hover:text-[#2844A8] transition-colors"
            >
              Barchasi <FaArrowRightLong size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {/* Item 1 */}
            <div className="flex items-center justify-between py-1 border-b border-[#F8FAFC]">
              <div className="flex items-start gap-3">
                <span className="text-[12.5px] font-bold text-[#1A1D2E] min-w-[42px]">
                  09:00
                </span>
                <div>
                  <h4 className="text-[13px] font-bold text-[#1A1D2E] leading-tight">
                    Haftalik sinxronlash
                  </h4>
                  <p className="text-[11.5px] text-[#8B90A5] mt-0.5">Alyona Sokolova</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                O'tkazilgan
              </span>
            </div>

            {/* Item 2 */}
            <div className="flex items-center justify-between py-1 border-b border-[#F8FAFC]">
              <div className="flex items-start gap-3">
                <span className="text-[12.5px] font-bold text-[#1A1D2E] min-w-[42px]">
                  11:30
                </span>
                <div>
                  <h4 className="text-[13px] font-bold text-[#1A1D2E] leading-tight">
                    Mijozlar bilan uchrashuv
                  </h4>
                  <p className="text-[11.5px] text-[#8B90A5] mt-0.5">Doston Ochilov</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                O'tkazilgan
              </span>
            </div>

            {/* Item 3 */}
            <div className="flex items-center justify-between py-1 border-b border-[#F8FAFC]">
              <div className="flex items-start gap-3">
                <span className="text-[12.5px] font-bold text-[#1A1D2E] min-w-[42px]">
                  16:00
                </span>
                <div>
                  <h4 className="text-[13px] font-bold text-[#1A1D2E] leading-tight">
                    Marketing strategiyasi
                  </h4>
                  <p className="text-[11.5px] text-[#8B90A5] mt-0.5">Vladimir Smirnov</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#F97316] bg-[#FFF7ED] px-2 py-0.5 rounded-full whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
                Joriy
              </span>
            </div>

            {/* Item 4 */}
            <div className="flex items-center justify-between py-1 border-b border-[#F8FAFC]">
              <div className="flex items-start gap-3">
                <span className="text-[12.5px] font-bold text-[#1A1D2E] min-w-[42px]">
                  16:15
                </span>
                <div>
                  <h4 className="text-[13px] font-bold text-[#1A1D2E] leading-tight">
                    Yillik hisobot
                  </h4>
                  <p className="text-[11.5px] text-[#8B90A5] mt-0.5">Ekaterina Vasilievna</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#F97316] bg-[#FFF7ED] px-2 py-0.5 rounded-full whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
                Joriy
              </span>
            </div>

            {/* Item 5 */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-start gap-3">
                <span className="text-[12.5px] font-bold text-[#1A1D2E] min-w-[42px]">
                  17:30
                </span>
                <div>
                  <h4 className="text-[13px] font-bold text-[#1A1D2E] leading-tight">
                    Xodimlar treningi
                  </h4>
                  <p className="text-[11.5px] text-[#8B90A5] mt-0.5">Mikhail Borisov</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#3858C7] bg-[#EEF2FB] px-2 py-0.5 rounded-full whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3858C7]"></span>
                Rejalashtirilgan
              </span>
            </div>
          </div>
        </div>

        {/* Col 2: Qatnashish, hafta kunlari */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 px-6 shadow-2xs flex flex-col">
          <span className="text-[11.5px] font-bold text-[#8B90A5] tracking-wider uppercase mb-4">
            QATNASHISH, HAFTA KUNLARI
          </span>

          <div className="flex-1 flex items-end justify-between gap-2 pb-1 min-h-[180px]">
            {weeklyAttendance.map((item) => (
              <div
                key={item.day}
                className="w-[35px] h-full flex flex-col items-center justify-end gap-1.5"
              >
                <span
                  className={`text-[11px] font-bold ${
                    item.isPeak ? "text-[#3858C7]" : "text-[#1A1D2E]"
                  }`}
                >
                  {item.value}%
                </span>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      item.isPeak
                        ? "bg-[#3858C7] shadow-xs"
                        : "bg-[#B7C7F3]"
                    }`}
                    style={{ height: `${item.value}%` }}
                  />
                </div>
                <span
                  className={`text-[11px] ${
                    item.isPeak
                      ? "font-bold text-[#3858C7]"
                      : "font-semibold text-[#8B90A5]"
                  }`}
                >
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: Faol tashkilotchilar */}
        <div className="bg-white border border-[#E2E6F2] rounded-2xl p-5 shadow-2xs flex flex-col justify-start">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11.5px] font-bold text-[#8B90A5] tracking-wider uppercase">
              FAOL TASHKILOTCHILAR
            </span>
            <Link
              to="/reports/organizers"
              className="flex items-center gap-1 text-[12px] font-bold text-[#3858C7] hover:text-[#2844A8] transition-colors"
            >
              Barchasi <FaArrowRightLong size={12} />
            </Link>
          </div>

          <div className="space-y-3.5">
            {/* 1 */}
            <div>
              <div className="flex items-center justify-between text-[12.5px] font-semibold text-[#1A1D2E] mb-1">
                <span>Doston Ochilov</span>
                <span>24 ta</span>
              </div>
              <div className="w-full bg-[#F1F3F9] h-2 rounded-full overflow-hidden">
                <div className="bg-[#3858C7] h-full rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>

            {/* 2 */}
            <div>
              <div className="flex items-center justify-between text-[12.5px] font-semibold text-[#1A1D2E] mb-1">
                <span>Alyona Sokolova</span>
                <span>19 ta</span>
              </div>
              <div className="w-full bg-[#F1F3F9] h-2 rounded-full overflow-hidden">
                <div className="bg-[#5C78DE] h-full rounded-full" style={{ width: "79%" }}></div>
              </div>
            </div>

            {/* 3 */}
            <div>
              <div className="flex items-center justify-between text-[12.5px] font-semibold text-[#1A1D2E] mb-1">
                <span>Timur Akhmedov</span>
                <span>15 ta</span>
              </div>
              <div className="w-full bg-[#F1F3F9] h-2 rounded-full overflow-hidden">
                <div className="bg-[#8CA2EC] h-full rounded-full" style={{ width: "62%" }}></div>
              </div>
            </div>

            {/* 4 */}
            <div>
              <div className="flex items-center justify-between text-[12.5px] font-semibold text-[#1A1D2E] mb-1">
                <span>Irina Petrova</span>
                <span>12 ta</span>
              </div>
              <div className="w-full bg-[#F1F3F9] h-2 rounded-full overflow-hidden">
                <div className="bg-[#B7C7F3] h-full rounded-full" style={{ width: "50%" }}></div>
              </div>
            </div>

            {/* 5 */}
            <div>
              <div className="flex items-center justify-between text-[12.5px] font-semibold text-[#1A1D2E] mb-1">
                <span>Natalia Fedorova</span>
                <span>9 ta</span>
              </div>
              <div className="w-full bg-[#F1F3F9] h-2 rounded-full overflow-hidden">
                <div className="bg-[#D1DCF9] h-full rounded-full" style={{ width: "37%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-[12.5px] font-semibold text-[#1A1D2E] mb-1">
                <span>Natalia Fedorova</span>
                <span>9 ta</span>
              </div>
              <div className="w-full bg-[#F1F3F9] h-2 rounded-full overflow-hidden">
                <div className="bg-[#D1DCF9] h-full rounded-full" style={{ width: "37%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;