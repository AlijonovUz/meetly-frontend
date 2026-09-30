import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshCwIcon, RotateRight01Icon } from "@hugeicons/core-free-icons";
import { CustomSelect } from "../../components/UI";
import {
  mockUsersList,
  mockUserMeetings,
  mockRegions,
  mockDistricts,
  mockOrganizations,
} from "../../data/mockData";
import { RefreshCw } from "lucide-react";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find user by ID or default to first user
  const user =
    mockUsersList.find((u) => u.id === id) || mockUsersList[0];

  const [region, setRegion] = useState("Toshkent viloyati");
  const [district, setDistrict] = useState("Toshkent tumani");
  const [birthDate, setBirthDate] = useState("15.04.2004");
  const [organization, setOrganization] = useState("");
  const [meetingFilter, setMeetingFilter] = useState("all"); // "all" | "planned" | "completed"

  const regionOptions = useMemo(
    () =>
      mockRegions
        .filter((r) => r !== "Barchasi")
        .map((r) => ({ value: r, label: r })),
    []
  );

  const districtOptions = useMemo(
    () =>
      mockDistricts
        .filter((d) => d !== "Barchasi")
        .map((d) => ({ value: d, label: d })),
    []
  );

  const orgOptions = useMemo(
    () => mockOrganizations.map((o) => ({ value: o, label: o })),
    []
  );

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

  return (
    <div className="p-5 px-4.5 space-y-4">
      {/* Top Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#E2E6F2] shadow-xs flex-shrink-0 border-2 border-white">
            <img
              src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1D2E] tracking-tight">
              {user.fullName}
            </h1>
          </div>
        </div>

        {/* Refresh / Action Button */}
        <button
          type="button"
          onClick={() => { }}
          className="p-2.5 rounded-xl text-[#5B6078] hover:text-[#1A1D2E] hover:bg-[#E8ECF6] transition-colors cursor-pointer"
          title="Yangilash"
        >
          <RefreshCw size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Form Fields (2 columns) - Disabled / Read-only */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Viloyat */}
        <div>
          <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
            Viloyat
          </label>
          <CustomSelect
            value={region}
            onChange={setRegion}
            options={regionOptions}
            placeholder="Viloyatni tanlang"
            searchPlaceholder="Viloyat qidirish..."
            className="h-11!"
            disabled={true}
          />
        </div>

        {/* Tuman */}
        <div>
          <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
            Tuman
          </label>
          <CustomSelect
            value={district}
            onChange={setDistrict}
            options={districtOptions}
            placeholder="Tumanni tanlang"
            searchPlaceholder="Tuman qidirish..."
            className="h-11!"
            disabled={true}
          />
        </div>

        {/* Tug'ulgan sanasi */}
        <div>
          <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
            Tug'ulgan sanasi
          </label>
          <input
            type="text"
            value={birthDate}
            readOnly
            disabled
            className="w-full bg-white border border-[#E2E6F2] rounded-xl px-4 h-11 text-[13.5px] font-medium text-[#1A1D2E] shadow-2xs cursor-default select-none focus:outline-none"
          />
        </div>

        {/* Tashkilot */}
        <div>
          <label className="block text-[13px] font-medium text-[#5B6078] mb-1.5">
            Tashkilot
          </label>
          <CustomSelect
            value={organization}
            onChange={setOrganization}
            options={orgOptions}
            placeholder="Tanlang"
            searchPlaceholder="Tashkilot qidirish..."
            className="h-11!"
            disabled={true}
          />
        </div>
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
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${meetingFilter === "all"
                ? "bg-white text-[#1A1D2E] shadow-xs"
                : "text-[#5B6078] hover:text-[#1A1D2E]"
              }`}
          >
            <span>Barchasi</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md font-bold ${meetingFilter === "all"
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
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${meetingFilter === "planned"
                ? "bg-white text-[#1A1D2E] shadow-xs"
                : "text-[#5B6078] hover:text-[#1A1D2E]"
              }`}
          >
            <span>Rejalashtirilgan</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md font-bold ${meetingFilter === "planned"
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
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${meetingFilter === "completed"
                ? "bg-white text-[#1A1D2E] shadow-xs"
                : "text-[#5B6078] hover:text-[#1A1D2E]"
              }`}
          >
            <span>O’tkazilgan</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md font-bold ${meetingFilter === "completed"
                  ? "bg-[#F1F3F9] text-[#1A1D2E]"
                  : "bg-[white] text-[#8B90A5]"
                }`}
            >
              {completedCount}
            </span>
          </button>
        </div>

        {/* Meetings Table */}
        <div className="overflow-auto h-[calc(100vh-480px)]">
          <table className="w-full text-left border-collapse">
            <thead>
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
                    className="hover:bg-white/60 transition-colors"
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
                          className={`w-2 h-2 rounded-full ${meeting.status === "planned"
                              ? "bg-[#E15241]"
                              : "bg-[#10B981]"
                            }`}
                        ></span>
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
    </div>
  );
};

export default UserDetailPage;
