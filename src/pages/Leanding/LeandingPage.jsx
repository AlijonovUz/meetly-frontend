import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Menu,
  X,
  Plus,
  Minus,
  CalendarPlus2,
  Link as LinkIcon,
  UserRoundCheck,
  ChartBar,
} from "lucide-react";
import { FaTelegramPlane } from "react-icons/fa";
import { loginWithPassport, isAuthenticated } from "../../services/auth";

const LeandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const authed = isAuthenticated();

  const handlePassportLogin = async (e) => {
    if (e) e.preventDefault();
    if (authLoading) return;
    setAuthLoading(true);
    try {
      await loginWithPassport();
    } catch (err) {
      console.error("Passport login xatosi:", err);
    } finally {
      setAuthLoading(false);
    }
  };
  
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const faqs = [
    {
      q: "Muloqotdan foydalanish uchun alohida roʻyxatdan oʻtish kerakmi?",
      a: "Yoʻq. Passport orqali Telegram yoki Google bilan kirasiz. Agar boshqa Raqamli Nazorat loyihasida Passportingiz boʻlsa, shu profil ishlaydi.",
    },
    {
      q: "Ishtirokchilar yigʻilishga qanday qoʻshiladi?",
      a: "Tashkilotchi tomonidan yuborilgan yagona taklif havolasi orqali brauzerda toʻgʻridan-toʻgʻri yoki ilova orqali bir bosishda qoʻshilish mumkin.",
    },
    {
      q: "Qatnashish qanday hisoblanadi?",
      a: "Har bir ishtirokchining kirish va chiqish vaqtlari avtomatik qayd etiladi va davomat hisobotida toʻliq koʻrsatiladi.",
    },
    {
      q: "Yigʻilish vaqtini oʻzgartirish mumkinmi?",
      a: "Ha, tashkilotchi istalgan vaqtda yigʻilish sanasi va vaqtini tahrirlashi mumkin. Barcha ishtirokchilar oʻzgarish haqida xabardor qilinadi.",
    },
    {
      q: "Hisobotlarni yuklab olsa boʻladimi?",
      a: "Ha, yigʻilishlar, qatnashuvchilar va tashkilotchilar boʻyicha barcha hisobotlarni Excel hamda PDF formatlarida bir tugma bilan yuklab olish mumkin.",
    },
  ];

  return (
    <>
      <div className="min-h-screen overflow-x-clip px-4 sm:px-8 lg:px-[120px] bg-[#F1F3F9] relative text-[#1A1D2E] font-['Manrope',sans-serif] selection:bg-[#3F57B3]/20 selection:text-[#3F57B3]">

        <header className="w-full h-[72px] rounded-[28px] bg-[#000000] px-6 sticky top-4 z-50 sm:px-8 flex items-center justify-between shadow-2xl">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <img
              src="/logo2.svg"
              alt="Raqamli Muloqot"
              className="w-10 h-10 group-hover:scale-105 transition-transform"
            />
            <span className="text-[15px] sm:text-[16px] font-['Unbounded',sans-serif] font-bold text-white tracking-tight">
              Raqamli Muloqot
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[15px] font-extrabold text-white">
            <button
              onClick={() => scrollToSection("imkoniyatlar")}
              className="hover:text-[#7F95E6] transition-colors cursor-pointer"
            >
              Imkoniyatlar
            </button>
            <button
              onClick={() => scrollToSection("qanday-ishlaydi")}
              className="hover:text-[#7F95E6] transition-colors cursor-pointer"
            >
              Qanday ishlaydi
            </button>
            <button
              onClick={() => scrollToSection("statistika")}
              className="hover:text-[#7F95E6] transition-colors cursor-pointer"
            >
              Statistika
            </button>
            <button
              onClick={() => scrollToSection("savollar")}
              className="hover:text-[#7F95E6] transition-colors cursor-pointer"
            >
              Savollar
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {authed ? (
              <button
                type="button"
                onClick={() => navigate("/")}
                className="h-[38px] px-5 rounded-full bg-gradient-to-r from-[#5272F0] to-[#3F57B3] hover:opacity-95 text-white text-[13.5px] font-extrabold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Boshqaruv paneli</span>
                <ArrowRight size={15} />
              </button>
            ) : (
              /* Passport Button */
              <button
                type="button"
                onClick={handlePassportLogin}
                disabled={authLoading}
                className="h-[38px] px-5 rounded-full bg-gradient-to-r from-[#4E75FF] to-[#3B5BDB] hover:opacity-95 text-white text-[13.5px] font-extrabold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Passport</span>
                    <img src="/user.svg" className="pointer-events-none" alt="" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed top-24 left-4 right-4 bg-[#000000] text-white p-6 rounded-2xl shadow-2xl z-50 flex flex-col gap-4 border border-white/10 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => scrollToSection("imkoniyatlar")}
              className="text-left font-bold text-[15px] py-2 hover:text-[#7F95E6]"
            >
              Imkoniyatlar
            </button>
            <button
              onClick={() => scrollToSection("qanday-ishlaydi")}
              className="text-left font-bold text-[15px] py-2 hover:text-[#7F95E6]"
            >
              Qanday ishlaydi
            </button>
            <button
              onClick={() => scrollToSection("statistika")}
              className="text-left font-bold text-[15px] py-2 hover:text-[#7F95E6]"
            >
              Statistika
            </button>
            <button
              onClick={() => scrollToSection("savollar")}
              className="text-left font-bold text-[15px] py-2 hover:text-[#7F95E6]"
            >
              Savollar
            </button>
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handlePassportLogin}
                disabled={authLoading}
                className="w-full h-[44px] rounded-full bg-gradient-to-r from-[#4E75FF] to-[#3B5BDB] text-white text-[14px] font-extrabold flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Passport orqali kirish</span>
                    <img src="/user.svg" alt="" className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= HERO SECTION & NAVBAR ================= */}
        <section className="relative pt-6 pb-20 md:pb-28">
          {/* Soft Ambient Gradient Glows */}
          <div className="absolute -top-[400px] -left-[400px] w-[720px] h-[720px] rounded-full bg-gradient-to-r from-[#526ED4]/20 to-[#526ED4]/20 blur-[130px] pointer-events-none"></div>
          <div className="absolute top-[100px] -right-[600px] w-[600px] h-[600px] rounded-full bg-linear-to-br from-[#30C9ED]/25 to-[#30C9ED]/25 blur-[140px] pointer-events-none"></div>
          <div>
            {/* ================= HERO CONTENT ================= */}
            <div className="text-center mt-14 sm:mt-18">
              {/* Eyebrow Tag */}
              <div className="inline-flex items-center gap-2.5 h-[36px] rounded-full bg-[#EEF2FF] pl-1.5 pr-4 border border-[#DCE4FF] shadow-2xs">
                <span className="h-[24px] px-3.5 rounded-full bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white text-[12px] font-extrabold flex items-center justify-center shadow-xs">
                  Yangi
                </span>
                <span className="text-[13.5px] sm:text-[14px] font-bold text-[#3F57B3]">
                  Raqamli Nazorat ekotizimi, yagona Passport bilan
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-[34px] sm:text-[46px] md:text-[56px] lg:text-[60px] font-['Unbounded',sans-serif] font-medium text-[#1A1D2E] tracking-tight leading-[1.14] max-w-[1100px] mx-auto mt-6">
                Yigʻilishlarni bir joyda <br className="hidden sm:inline" />
                tashkil eting va kuzating
              </h1>

              {/* Subtitle */}
              <p className="text-[15px] sm:text-[18px] md:text-[19px] font-bold text-[#5B6078] max-w-[860px] mx-auto mt-5 leading-relaxed">
                Onlayn audio va video yigʻilishlar, taklif havolalari, qatnashishni hisobga olish va hisobotlar. Bitta Passport bilan barcha Raqamli Nazorat xizmatlariga kiring.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8 relative">
                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={handlePassportLogin}
                  disabled={authLoading}
                  className="h-[54px] sm:h-[56px] px-8 rounded-full bg-gradient-to-r from-[#5272F0] to-[#3F57B3] hover:opacity-95 active:scale-[0.98] text-white text-[15px] font-bold inline-flex items-center gap-2.5 shadow-xl shadow-[#4E75FF]/25 hover:shadow-[#4E75FF]/35 transition-all cursor-pointer"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Passport orqali boshlash</span>
                      <ArrowRight size={18} strokeWidth={2.5} />
                    </>
                  )}
                </button>

                {/* Secondary CTA */}
                <button
                  type="button"
                  onClick={() => scrollToSection("imkoniyatlar")}
                  className="h-[54px] sm:h-[56px] px-8 rounded-full bg-gradient-to-r from-[#3F7AB3] via-[#28B6D8] via-[#31C8ED] to-[#4DA7BD] hover:opacity-95 active:scale-[0.98] text-white text-[15px] font-bold inline-flex items-center gap-2.5 shadow-xl shadow-[#208DBB]/25 hover:shadow-[#208DBB]/35 transition-all cursor-pointer"
                >
                  <span>Imkoniyatlarni koʻrish</span>
                  <ArrowUpRight size={19} strokeWidth={2.5} />
                </button>
              </div>

              {/* ================= HERO DASHBOARD PREVIEW & FLOATING CARDS ================= */}
              <div className="relative mt-14 sm:mt-16 max-w-[1200px] mx-auto">
                {/* Main Dashboard Image (3.svg) */}
                <div className="relative w-full">
                  <img
                    src="/3.svg"
                    alt="Dashboard Preview"
                    className="w-full h-auto object-contain block pointer-events-none"
                  />
                </div>

                {/* Float Card 1: Marketing strategiyasi */}
                <div className="hidden lg:block absolute -left-26 top-[28%] z-20 transition-transform hover:scale-105 duration-300">
                  <img
                    src="/1.svg"
                    alt="Marketing strategiyasi"
                    className="w-[340px] sm:w-[380px] h-auto object-contain pointer-events-none"
                  />
                </div>

                {/* Float Card 2: Oʻrtacha qatnashish */}
                <div className="hidden lg:block absolute -right-28 top-[40%] z-20 transition-transform hover:scale-105 duration-300">
                  <img
                    src="/2.svg"
                    alt="Oʻrtacha qatnashish"
                    className="w-[320px] sm:w-[360px] h-auto object-contain pointer-events-none"
                  />
                </div>
              </div>
              <div className="w-full h-[180px] bottom-[75px] bg-gradient-to-b blur-[50px] from-[#F1F3F9]/30 to-[#F1F3F9] absolute"></div>
            </div>
          </div>
        </section>

        {/* ================= STATS COUNTER BAR ================= */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat 1 */}
            <div className="w-full h-[160px] py-6 rounded-[20px] bg-[#1A1D2E] text-white p-6 flex flex-col justify-between shadow-sm">
              <span className="text-[44px] font-['Unbounded',sans-serif] font-semibold tracking-tight leading-none">
                1 248
              </span>
              <span className="text-[15px] font-medium text-[#94A3B8]">
                faol foydalanuvchi
              </span>
            </div>

            {/* Stat 2 */}
            <div className="w-full h-[160px] py-6 rounded-[20px] bg-white border border-[#E2E6F2] p-6 flex flex-col justify-between shadow-2xs">
              <span className="text-[44px] font-['Unbounded',sans-serif] font-semibold text-[#1A1D2E] tracking-tight leading-none">
                256
              </span>
              <span className="text-[15px] font-medium text-[#5B6078]">
                oʻtkazilgan yigʻilish
              </span>
            </div>

            {/* Stat 3 */}
            <div className="w-full h-[160px] py-6 rounded-[20px] bg-white border border-[#E2E6F2] p-6 flex flex-col justify-between shadow-2xs">
              <span className="text-[44px] font-['Unbounded',sans-serif] font-semibold text-[#1A1D2E] tracking-tight leading-none">
                84%
              </span>
              <span className="text-[15px] font-medium text-[#5B6078]">
                oʻrtacha qatnashish
              </span>
            </div>

            {/* Stat 4 */}
            <div className="w-full h-[160px] py-6 rounded-[20px] bg-white border border-[#E2E6F2] p-6 flex flex-col justify-between shadow-2xs">
              <span className="text-[44px] font-['Unbounded',sans-serif] font-semibold text-[#1A1D2E] tracking-tight leading-none">
                30+
              </span>
              <span className="text-[15px] font-medium text-[#5B6078]">
                Raqamli Nazorat loyihasi bitta Passport bilan
              </span>
            </div>
          </div>
        </section>

        {/* ================= IMKONIYaTLAR SECTION ================= */}
        <section id="imkoniyatlar" className="py-20">
          <div className="max-w-3xl mb-12">
            <span className="text-[13px] font-extrabold text-[#3F57B3] tracking-wider uppercase block mb-2">
              IMKONIYATLAR
            </span>
            <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-['Unbounded',sans-serif] font-medium text-[#1A1D2E] tracking-tight leading-tight">
              Yigʻilish uchun kerak boʻlgan <br />
              hamma narsa bitta joyda
            </h2>
            <p className="text-[16px] font-medium text-[#5B6078] mt-3">
              Yaratishdan tortib hisobotgacha: tashkilotchi va ishtirokchi uchun oddiy, tushunarli jarayon.
            </p>
          </div>

          {/* 6 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Yigʻilish yaratish */}
            <div className="w-full h-[304px] rounded-[20px] bg-white border border-[#E2E6F2] p-6 flex flex-col justify-between shadow-2xs hover:border-[#3F57B3]/40 transition-all">
              <div>
                <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white flex items-center justify-center mb-4">
                  <CalendarPlus2 size={24} />
                </div>
                <h3 className="text-[20px] font-extrabold text-[#1A1D2E] mb-2">
                  Yigʻilish yaratish
                </h3>
                <p className="text-[15px] font-medium text-[#5B6078] leading-relaxed">
                  Nomi, tavsifi, sana, vaqt va davomiylikni kiriting. Tasdiqlash talabini yoqib qoʻyish mumkin.
                </p>
              </div>

              {/* Widget */}
              <div className="bg-[#F1F3F9] rounded-xl p-3 grid grid-cols-3 gap-1 text-center text-[12px]">
                <div>
                  <span className="text-[#8F95A8] block text-[11px] font-bold">Sana</span>
                  <span className="font-extrabold text-[#1A1D2E]">15.10.2026</span>
                </div>
                <div className="border-x border-[#E2E6F2]">
                  <span className="text-[#8F95A8] block text-[11px] font-bold">Vaqti</span>
                  <span className="font-extrabold text-[#1A1D2E]">15:00</span>
                </div>
                <div>
                  <span className="text-[#8F95A8] block text-[11px] font-bold">Davomiyligi</span>
                  <span className="font-extrabold text-[#1A1D2E]">45 daqiqa</span>
                </div>
              </div>
            </div>

            {/* Card 2: Taklif havolasi */}
            <div className="w-full h-[304px] rounded-[20px] bg-white border border-[#E2E6F2] p-6 flex flex-col justify-between shadow-2xs hover:border-[#3F57B3]/40 transition-all">
              <div>
                <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white flex items-center justify-center mb-4">
                  <LinkIcon size={24} />
                </div>
                <h3 className="text-[20px] font-extrabold text-[#1A1D2E] mb-2">
                  Taklif havolasi
                </h3>
                <p className="text-[15px] font-medium text-[#5B6078] leading-relaxed">
                  Tizim yigʻilish uchun alohida havola beradi. Ishtirokchilar faqat shu havola orqali qoʻshiladi.
                </p>
              </div>

              {/* Widget */}
              <div className="bg-[#F1F3F9] rounded-xl p-2.5 flex items-center justify-between gap-2">
                <span className="text-[13px] font-bold text-[#1A1D2E] truncate pl-2">
                  meet.muloqot.uz/m1213-mxr
                </span>
                <button
                  className="h-[32px] px-3.5 rounded-full bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white text-[12px] font-extrabold transition-all shrink-0 cursor-pointer"
                >
                  {copiedLink ? "Nusxalandi!" : "Nusxalash"}
                </button>
              </div>
            </div>

            {/* Card 3: Qatnashishni hisobga olish */}
            <div className="w-full h-[304px] rounded-[20px] bg-white border border-[#E2E6F2] p-6 flex flex-col justify-between shadow-2xs hover:border-[#3F57B3]/40 transition-all">
              <div>
                <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white flex items-center justify-center mb-4">
                  <UserRoundCheck size={24} />
                </div>
                <h3 className="text-[20px] font-extrabold text-[#1A1D2E] mb-2">
                  Qatnashishni hisobga olish
                </h3>
                <p className="text-[15px] font-medium text-[#5B6078] leading-relaxed">
                  Kim qachon kirgan va chiqqan, qancha vaqt qatnashgani avtomatik yoziladi.
                </p>
              </div>

              {/* Widget */}
              <div className="bg-[#F1F3F9] rounded-xl p-2.5 space-y-1.5 text-[11.5px]">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[#1A1D2E]">Alyona Sokolova</span>
                  <span className="text-[#8F95A8] font-medium">09:00 – 09:45</span>
                  <span className="text-[#10B981]">Qatnashdi</span>
                </div>
                <div className="flex items-center justify-between font-bold pt-1 border-t border-[#E2E6F2]">
                  <span className="text-[#1A1D2E]">Mikhail Borisov</span>
                  <span className="text-[#8F95A8] font-medium">11:00 – 11:15</span>
                  <span className="text-[#10B981]">Qatnashdi</span>
                </div>
              </div>
            </div>

            {/* Card 4: Holatlar real vaqtda */}
            <div className="w-full h-[304px] rounded-[20px] bg-white border border-[#E2E6F2] p-6 flex flex-col justify-between shadow-2xs hover:border-[#3F57B3]/40 transition-all">
              <div>
                <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white flex items-center justify-center mb-4">
                  <Clock size={24} />
                </div>
                <h3 className="text-[20px] font-extrabold text-[#1A1D2E] mb-2">
                  Holatlar real vaqtda
                </h3>
                <p className="text-[15px] font-medium text-[#5B6078] leading-relaxed">
                  Rejalashtirilgan, joriy, oʻtkazilgan va bekor qilingan yigʻilishlar bir qarashda.
                </p>
              </div>

              {/* Widget */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-[#EEF2FB] text-[#3F57B3] text-[12px] font-extrabold">
                  ● Rejalashtirilgan
                </span>
                <span className="px-3 py-1 rounded-full bg-[#FFF7ED] text-[#F97316] text-[12px] font-extrabold">
                  ● Joriy
                </span>
                <span className="px-3 py-1 rounded-full bg-[#ECFDF5] text-[#10B981] text-[12px] font-extrabold">
                  ● Oʻtkazilgan
                </span>
              </div>
            </div>

            {/* Card 5: Hisobotlar */}
            <div className="w-full h-[304px] rounded-[20px] bg-white border border-[#E2E6F2] p-6 flex flex-col justify-between shadow-2xs hover:border-[#3F57B3]/40 transition-all">
              <div>
                <div className="w-[52px] h-[52px] rounded-[16px] bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white flex items-center justify-center mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20h16" />
                    <path d="M7 20v-5" />
                    <path d="M12 20v-9" />
                    <path d="M17 20v-13" />
                  </svg>
                </div>
                <h3 className="text-[20px] font-extrabold text-[#1A1D2E] mb-2">
                  Hisobotlar
                </h3>
                <p className="text-[15px] font-medium text-[#5B6078] leading-relaxed">
                  Yigʻilishlar, ishtirokchilar va tashkilotchilar boʻyicha hisobotlar. Yuklab olish bir bosishda.
                </p>
              </div>

              {/* Widget */}
              <div className="space-y-2.5">
                <div>
                  <span className="text-[12.5px] font-semibold text-[#5B6078] block mb-1">
                    Yigʻilishlar boʻyicha
                  </span>
                  <div className="w-full h-[5px] rounded-full bg-[#EEF1F7] overflow-hidden">
                    <div className="w-[88%] h-full rounded-full bg-[#3F57B3]"></div>
                  </div>
                </div>

                <div>
                  <span className="text-[12.5px] font-semibold text-[#5B6078] block mb-1">
                    Ishtirokchilar boʻyicha
                  </span>
                  <div className="w-full h-[5px] rounded-full bg-[#EEF1F7] overflow-hidden">
                    <div className="w-[68%] h-full rounded-full bg-[#3F57B3]"></div>
                  </div>
                </div>

                <div>
                  <span className="text-[12.5px] font-semibold text-[#5B6078] block mb-1">
                    Tashkilotchilar boʻyicha
                  </span>
                  <div className="w-full h-[5px] rounded-full bg-[#EEF1F7] overflow-hidden">
                    <div className="w-[48%] h-full rounded-full bg-[#3F57B3]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 6: Yagona Passport */}
            <div className="w-full h-[304px] rounded-[20px] bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white p-6 flex flex-col justify-between shadow-lg">
              <div>
                <div className="w-[52px] h-[52px] rounded-[14px] bg-white/20 flex items-center justify-center text-white mb-4">
                  <ShieldCheck size={26} />
                </div>
                <h3 className="text-[20px] font-extrabold text-white mb-2">
                  Yagona Passport
                </h3>
                <p className="text-[15px] font-medium text-[#E4E9FF] leading-relaxed">
                  Alohida roʻyxatdan oʻtish yoʻq. Telegram yoki Google orqali bir marta kirasiz.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePassportLogin}
                disabled={authLoading}
                className="w-full h-[44px] rounded-full bg-white text-[#3F57B3] text-[14px] font-extrabold flex items-center justify-center gap-2 shadow-sm hover:bg-[#F8FAFC] transition-all cursor-pointer"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-[#3F57B3] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Passport orqali kirish</span>
                    <ExternalLink size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ================= QANDAY ISHLAYDI SECTION ================= */}
        <section id="qanday-ishlaydi" className="py-20">
          <div className="max-w-3xl mb-12">
            <span className="text-[13px] font-extrabold text-[#3F57B3] tracking-wider uppercase block mb-2">
              QANDAY ISHLAYDI
            </span>
            <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-['Unbounded',sans-serif] font-medium text-[#1A1D2E] tracking-tight leading-tight">
              Toʻrt qadamda birinchi yigʻilish
            </h2>
          </div>

          {/* 4 Steps with Horizontal Stepper */}
          <div className="relative">
            {/* Horizontal Timeline Connector Line */}
            <div className="hidden lg:block absolute top-[19px] left-[19px] right-0 h-[2px] bg-gradient-to-r from-[#526ED4] to-[#30C9ED] z-0"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col">
                <div className="flex items-center mb-6">
                  <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white text-[13.5px] font-extrabold flex items-center justify-center shadow-xs">
                    01
                  </div>
                </div>
                <div className="w-full min-h-[155px] rounded-[20px] bg-white p-6 sm:p-7 flex flex-col justify-start">
                  <h4 className="text-[18px] font-bold text-[#1A1D2E] leading-snug">
                    Passport orqali kiring
                  </h4>
                  <p className="text-[14px] font-medium text-[#64748B] mt-3 leading-relaxed">
                    Telegram yoki Google bilan. Parol kerak emas.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col">
                <div className="flex items-center mb-6">
                  <div className="w-[38px] h-[38px] rounded-full bg-white border border-[#C5D5F6] text-[#3F57B3] text-[13.5px] font-bold flex items-center justify-center">
                    02
                  </div>
                </div>
                <div className="w-full min-h-[155px] rounded-[20px] bg-white p-6 sm:p-7 flex flex-col justify-start">
                  <h4 className="text-[18px] font-bold text-[#1A1D2E] leading-snug">
                    Yigʻilish yarating
                  </h4>
                  <p className="text-[14px] font-medium text-[#64748B] mt-3 leading-relaxed">
                    Nomi, sana, vaqt va davomiylikni kiriting.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col">
                <div className="flex items-center mb-6">
                  <div className="w-[38px] h-[38px] rounded-full bg-white border border-[#C5D5F6] text-[#3F57B3] text-[13.5px] font-bold flex items-center justify-center">
                    03
                  </div>
                </div>
                <div className="w-full min-h-[155px] rounded-[20px] bg-white p-6 sm:p-7 flex flex-col justify-start">
                  <h4 className="text-[18px] font-bold text-[#1A1D2E] leading-snug">
                    Havolani ulashing
                  </h4>
                  <p className="text-[14px] font-medium text-[#64748B] mt-3 leading-relaxed">
                    Tizim bergan havolani ishtirokchilarga yuboring.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col">
                <div className="flex items-center mb-6">
                  <div className="w-[38px] h-[38px] rounded-full bg-white border border-[#C5D5F6] text-[#3F57B3] text-[13.5px] font-bold flex items-center justify-center">
                    04
                  </div>
                </div>
                <div className="w-full min-h-[155px] rounded-[20px] bg-white p-6 sm:p-7 flex flex-col justify-start">
                  <h4 className="text-[18px] font-bold text-[#1A1D2E] leading-snug">
                    Natijani kuzating
                  </h4>
                  <p className="text-[14px] font-medium text-[#64748B] mt-3 leading-relaxed">
                    Qatnashish va hisobotlar avtomatik tayyorlanadi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= STATISTIKA DARK BLOCK ================= */}
        <section id="statistika" className="py-20">
          <div className="w-full rounded-[24px] bg-[#222222] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
            {/* Background Decorative Ellipse Glow */}
            <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#3F57B3]/25 rounded-full blur-[160px] pointer-events-none -z-0"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
              {/* Left Column */}
              <div className="lg:col-span-5 space-y-6">
                <span className="text-[13px] font-extrabold text-[#7F95E6] tracking-wider uppercase block">
                  STATISTIKA
                </span>
                <h2 className="text-[32px] sm:text-[40px] font-['Unbounded',sans-serif] font-medium text-[#E6EDF3] tracking-tight leading-tight">
                  Har bir yigʻilish <br />
                  raqamlarda
                </h2>
                <p className="text-[16px] font-medium text-[#B9C0D6] leading-relaxed">
                  Tashkilotchi va rahbar uchun aniq manzara: qancha yigʻilish oʻtdi, kim qatnashdi, qayerda kechikish bor.
                </p>

                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#3F57B3] flex items-center justify-center text-white shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-[16px] font-bold text-[#E6EDF3]">
                      Haftalik dinamika va trend
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#3F57B3] flex items-center justify-center text-white shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-[16px] font-bold text-[#E6EDF3]">
                      Holat boʻyicha taqsimot
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#3F57B3] flex items-center justify-center text-white shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-[16px] font-bold text-[#E6EDF3]">
                      Qatnashish foizi har bir xodim uchun
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column (Widgets -> 7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Top Curve Chart Card */}
                <div className="w-full h-[300px] rounded-[20px] bg-white p-6 text-[#1A1D2E] shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-extrabold text-[#5B6078] uppercase block">
                        YIGʻILISHLAR DINAMIKASI, 12 HAFTA
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[30px] font-['Unbounded',sans-serif] font-semibold text-[#1A1D2E] leading-none">
                          256
                        </span>
                        <span className="h-[24px] px-2.5 rounded-full bg-[#E8F7F0] text-[#16A34A] text-[12px] font-extrabold inline-flex items-center">
                          ↑ +12,1%
                        </span>
                      </div>
                    </div>

                    <div className="h-[28px] px-3 rounded-[8px] bg-[#1A1D2E] text-white text-[11px] font-extrabold flex items-center">
                      32 ta, shu hafta
                    </div>
                  </div>

                  {/* SVG Line & Area Curve */}
                  <div className="relative w-full h-36">
                    <svg viewBox="0 0 596 110" className="w-full h-full" preserveAspectRatio="none">
                      <line x1="0" y1="20" x2="596" y2="20" stroke="#EEF1F7" strokeWidth="1" />
                      <line x1="0" y1="50" x2="596" y2="50" stroke="#EEF1F7" strokeWidth="1" />
                      <line x1="0" y1="80" x2="596" y2="80" stroke="#EEF1F7" strokeWidth="1" />
                      <line x1="0" y1="108" x2="596" y2="108" stroke="#EEF1F7" strokeWidth="1" />
                      <defs>
                        <linearGradient id="darkSectionGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3F57B3" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#3F57B3" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 75 C 60 70, 120 75, 180 65 C 240 55, 300 60, 360 48 C 420 45, 480 30, 540 25 L 596 18 L 596 108 L 0 108 Z"
                        fill="url(#darkSectionGrad)"
                      />
                      <path
                        d="M 0 75 C 60 70, 120 75, 180 65 C 240 55, 300 60, 360 48 C 420 45, 480 30, 540 25 L 596 18"
                        fill="none"
                        stroke="#3F57B3"
                        strokeWidth="3"
                      />
                      <circle cx="585" cy="19" r="5" fill="#FFFFFF" stroke="#3F57B3" strokeWidth="3" />
                    </svg>
                  </div>
                </div>

                {/* Bottom Row Split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Donut Card */}
                  <div className="w-full rounded-[24px] bg-white p-6 text-[#1A1D2E] shadow-sm flex flex-col justify-between">
                    <span className="text-[12px] font-extrabold text-[#5B6078] tracking-wider uppercase block">
                      HOLAT BOʻYICHA
                    </span>

                    <div className="flex items-center justify-between gap-4 my-auto pt-3">
                      {/* Donut graphic */}
                      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          {/* Oʻtkazilgan */}
                          <circle
                            cx="50"
                            cy="50"
                            r="36"
                            fill="none"
                            stroke="#38C98D"
                            strokeWidth="14"
                            strokeDasharray="162 226"
                            strokeDashoffset="0"
                          />
                          {/* Rejalashtirilgan */}
                          <circle
                            cx="50"
                            cy="50"
                            r="36"
                            fill="none"
                            stroke="#3B5BDB"
                            strokeWidth="14"
                            strokeDasharray="33 226"
                            strokeDashoffset="-162"
                          />
                          {/* Joriy */}
                          <circle
                            cx="50"
                            cy="50"
                            r="36"
                            fill="none"
                            stroke="#E07A28"
                            strokeWidth="14"
                            strokeDasharray="4 226"
                            strokeDashoffset="-195"
                          />
                          {/* Bekor qilingan */}
                          <circle
                            cx="50"
                            cy="50"
                            r="36"
                            fill="none"
                            stroke="#9AA5B8"
                            strokeWidth="14"
                            strokeDasharray="27 226"
                            strokeDashoffset="-199"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[24px] font-['Unbounded',sans-serif] font-bold text-[#1A1D2E] leading-none">
                            256
                          </span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="text-[13px] space-y-2.5 text-[#5B6078] flex-1 pl-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-medium text-[#475569]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#38C98D]"></span>
                            Oʻtkazilgan
                          </span>
                          <span className="text-[#1A1D2E] font-bold">184</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-medium text-[#475569]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#3B5BDB]"></span>
                            Rejalashtirilgan
                          </span>
                          <span className="text-[#1A1D2E] font-bold">37</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-medium text-[#475569]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E07A28]"></span>
                            Joriy
                          </span>
                          <span className="text-[#1A1D2E] font-bold">2</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-medium text-[#475569]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#9AA5B8]"></span>
                            Bekor qilingan
                          </span>
                          <span className="text-[#1A1D2E] font-bold">33</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Weekly Bar Card */}
                  <div className="w-full rounded-[24px] bg-white p-6 text-[#1A1D2E] shadow-sm flex flex-col justify-between">
                    <span className="text-[12px] font-extrabold text-[#5B6078] tracking-wider uppercase block">
                      QATNASHISH, HAFTA KUNLARI
                    </span>

                    <div className="flex items-end justify-between gap-2 h-36 pt-4">
                      {[
                        { day: "Du", val: "88%", h: "88%", isPeak: false },
                        { day: "Se", val: "91%", h: "98%", isPeak: true },
                        { day: "Cho", val: "79%", h: "79%", isPeak: false },
                        { day: "Pa", val: "86%", h: "86%", isPeak: false },
                        { day: "Ju", val: "82%", h: "82%", isPeak: false },
                        { day: "Sha", val: "64%", h: "64%", isPeak: false },
                      ].map((bar) => (
                        <div key={bar.day} className="flex-1 flex flex-col items-center justify-end h-full">
                          <span className="text-[12px] font-bold text-[#1A1D2E] mb-2">
                            {bar.val}
                          </span>
                          <div
                            style={{ height: bar.h }}
                            className={`w-full max-w-[38px] rounded-[14px] transition-all ${bar.isPeak ? "bg-[#3B5BDB]" : "bg-[#C5D2F6]"
                              }`}
                          />
                          <span className="text-[12.5px] font-semibold text-[#5B6078] mt-2.5">
                            {bar.day}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PASSPORT INTEGRATION SECTION ================= */}
        <section className="py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[#FFFFFF] p-6 sm:p-10 lg:pl-15 rounded-2xl">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 pt-4 lg:pt-15 pb-4 lg:pb-10">
              <span className="text-[13px] font-extrabold text-[#3F57B3] tracking-wider uppercase block">
                YAGONA KIRISH
              </span>
              <h2 className="text-[32px] sm:text-[40px] font-['Unbounded',sans-serif] font-medium text-[#1A1D2E] tracking-tight leading-tight">
                Bitta Passport, <br />
                barcha loyihalar
              </h2>
              <p className="text-[16px] font-medium text-[#5B6078] leading-relaxed max-w-[520px]">
                Muloqot Raqamli Nazorat ekotizimining bir qismi. Passport orqali bir marta roʻyxatdan oʻting va boshqa loyihalarga ham shu profil bilan kiring. Shaxsiy maʼlumotlar Passport tizimida saqlanadi.
              </p>

              {/* Ecosystem Badges */}
              <div className="flex flex-wrap gap-2.5 pt-2 max-w-[500px]">
                {["Raqamli salon", "Raqamli taksi", "Raqamli choyxona", "Raqamli dorixona", "Raqamli barber"].map(
                  (name) => (
                    <span
                      key={name}
                      className="h-[34px] px-3.5 rounded-full bg-[#F1F3F9] text-[#3F57B3] text-[13px] font-extrabold flex items-center justify-center"
                    >
                      {name}
                    </span>
                  )
                )}
                <span className="h-[34px] px-3.5 rounded-full bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white text-[13px] font-extrabold flex items-center justify-center">
                  +25 loyiha
                </span>
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePassportLogin}
                  disabled={authLoading}
                  className="w-[237px] h-[54px] rounded-full bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white text-[15px] font-extrabold inline-flex items-center justify-center gap-2 shadow-lg shadow-[#3F57B3]/25 transition-all cursor-pointer hover:opacity-95"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Passport orqali kirish</span>
                      <ExternalLink size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Passport Login Mockup Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[420px] h-[352px] rounded-[20px] bg-white border border-[#E2E6F2] p-7 shadow-2xl flex flex-col justify-between">
                {/* Header with Passport Logo */}
                <div className="flex items-center gap-2.5">
                  <img src="/user1.svg" className="pointer-events-none" alt="" />
                  <span className="text-[15px] font-['Unbounded',sans-serif] font-extrabold text-[#1A1D2E]">
                    Passport
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[24px] font-extrabold text-[#1A1D2E] leading-tight">
                    Tizimga kirish
                  </h4>
                  <p className="text-[14px] font-medium text-[#5B6078]">
                    Davom etish uchun kirish usulini tanlang
                  </p>
                </div>

                {/* Telegram Button */}
                <button
                  type="button"
                  onClick={handlePassportLogin}
                  disabled={authLoading}
                  className="w-full h-[52px] rounded-[14px] bg-[#229ED9] hover:bg-[#1E8EC4] text-white text-[15px] font-extrabold flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FaTelegramPlane size={18} />
                      <span>Telegram orqali kirish</span>
                    </>
                  )}
                </button>

                {/* Divider Line */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-[1px] bg-[#EEF1F7]"></div>
                  <span className="text-[12px] font-bold text-[#8F95A8]">yoki</span>
                  <div className="flex-1 h-[1px] bg-[#EEF1F7]"></div>
                </div>

                {/* Google Button */}
                <button
                  type="button"
                  onClick={handlePassportLogin}
                  disabled={authLoading}
                  className="w-full h-[52px] rounded-[14px] bg-white border border-[#E2E6F2] hover:bg-[#F8FAFC] text-[#1A1D2E] text-[15px] font-extrabold flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-[#1A1D2E] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <img src="/G.svg" className="pointer-events-none" alt="" />
                      <span>Google orqali davom etish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SAVOLLAR (FAQ) SECTION ================= */}
        <section id="savollar" className="py-20 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Header */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-[13px] font-extrabold text-[#3F57B3] tracking-wider uppercase block">
                SAVOLLAR
              </span>
              <h2 className="text-[32px] sm:text-[36px] font-['Unbounded',sans-serif] font-medium text-[#1A1D2E] tracking-tight leading-tight">
                Koʻp beriladigan <br />
                savollar
              </h2>
              <p className="text-[16px] font-medium text-[#5B6078] leading-relaxed max-w-[340px]">
                Javob topilmadimi? Raqamli Nazorat jamoasiga yozing.
              </p>
            </div>

            {/* Right FAQ Items List */}
            <div className="lg:col-span-8 space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className={`w-full rounded-[18px] bg-white border border-[#E2E6F2] transition-all overflow-hidden ${isOpen ? "p-6" : "p-5"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      className="w-full flex items-center justify-between gap-4 text-left font-extrabold text-[16px] text-[#1A1D2E] hover:text-[#3F57B3] transition-colors cursor-pointer"
                    >
                      <span className="pr-2">{faq.q}</span>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${isOpen
                          ? "bg-gradient-to-r from-[#5272F0] to-[#3F57B3] text-white"
                          : "bg-[#F1F3F9] text-[#1A1D2E]"
                          }`}
                      >
                        {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                      </div>
                    </button>

                    {isOpen && (
                      <p className="text-[15px] font-medium text-[#5B6078] leading-relaxed mt-3 pt-3 border-t border-[#F1F3F9] animate-in fade-in duration-150">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= CTA BANNER ================= */}
        <section className="py-10">
          <div className="w-full h-auto min-h-[300px] rounded-[24px] bg-[linear-gradient(148deg,#5272F0_10%,#3F57B3_83.61%)] p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Decorative Figma Ellipses */}
            <div className="absolute -right-50 -top-40 w-[520px] h-[520px] rounded-full border-[50px] border-white/10 pointer-events-none"></div>
            <div className="absolute -left-17 -bottom-40 w-[300px] h-[300px] rounded-full border-[40px] border-white/10 pointer-events-none"></div>

            <div className="space-y-3 max-w-[720px] relative z-10 text-center md:text-left">
              <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-['Unbounded',sans-serif] font-medium text-white tracking-tight leading-tight">
                Birinchi yigʻilishingizni <br />
                bugun oʻtkazing
              </h2>
              <p className="text-[17px] font-medium text-[#E4E9FF]">
                Passport orqali kiring, yigʻilish yarating va havolani ulashing.
              </p>
            </div>

            {/* White Button */}
            <button
              type="button"
              onClick={handlePassportLogin}
              disabled={authLoading}
              className="w-[263px] h-[56px] rounded-full bg-white text-[#3F57B3] hover:bg-[#F8FAFC] active:scale-[0.98] text-[15px] font-extrabold inline-flex items-center justify-center gap-2.5 shadow-xl shrink-0 relative z-10 transition-all cursor-pointer"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-[#3F57B3] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Passport orqali boshlash</span>
                  <ArrowRight size={17} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </section>
      </div>


      {/* ================= FOOTER ================= */}
      <footer className="bg-white px-4 sm:px-8 lg:px-[120px] border-t border-[#EEF1F7] py-12 font-['Manrope',sans-serif]">
        <div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo2.svg" className="pointer-events-none w-10 h-10" alt="" />
              <div className="flex flex-col">
                <span className="text-[20px] font-['Unbounded',sans-serif] font-extrabold text-[#0D1117] leading-none">
                  Raqamli Muloqot
                </span>
                <span className="text-[14px] font-bold text-[#5B6078] mt-0.5">
                  Raqamli Nazorat loyihasi
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-[14px] font-extrabold text-[#1A1D2E]">
              <button
                onClick={() => scrollToSection("imkoniyatlar")}
                className="hover:text-[#3F57B3] transition-colors cursor-pointer"
              >
                Imkoniyatlar
              </button>
              <button
                onClick={() => scrollToSection("qanday-ishlaydi")}
                className="hover:text-[#3F57B3] transition-colors cursor-pointer"
              >
                Qanday ishlaydi
              </button>
              <button
                onClick={() => scrollToSection("statistika")}
                className="hover:text-[#3F57B3] transition-colors cursor-pointer"
              >
                Statistika
              </button>
              <button
                onClick={() => scrollToSection("savollar")}
                className="hover:text-[#3F57B3] transition-colors cursor-pointer"
              >
                Savollar
              </button>
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-full h-[1px] bg-[#EEF1F7] my-6"></div>

          {/* Bottom Copyright & Link */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#8F95A8] font-medium">
            <span>© {new Date().getFullYear()} Raqamli Nazorat. Barcha huquqlar himoyalangan.</span>
            <button
              type="button"
              onClick={handlePassportLogin}
              className="text-[#3F57B3] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Passport orqali yagona kirish</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LeandingPage;