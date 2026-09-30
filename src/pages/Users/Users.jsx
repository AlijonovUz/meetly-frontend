import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { CustomSelect } from "../../components/UI";
import {
  mockUsersList,
  mockRegions,
  mockDistricts,
} from "../../data/mockData";

const Users = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Barchasi");
  const [selectedDistrict, setSelectedDistrict] = useState("Barchasi");
  const [sortOrder, setSortOrder] = useState("az"); // "az" | "za"
  const [users, setUsers] = useState(mockUsersList);

  const regionOptions = useMemo(
    () => [
      { value: "Barchasi", label: "Viloyat" },
      ...mockRegions
        .filter((r) => r !== "Barchasi")
        .map((reg) => ({ value: reg, label: reg })),
    ],
    []
  );

  const districtOptions = useMemo(
    () => [
      { value: "Barchasi", label: "Tuman" },
      ...mockDistricts
        .filter((d) => d !== "Barchasi")
        .map((dist) => ({ value: dist, label: dist })),
    ],
    []
  );

  const sortOptions = [
    { value: "az", label: "A dan Z gacha" },
    { value: "za", label: "Z dan A gacha" },
  ];

  const toggleFavorite = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isFavorite: !u.isFavorite } : u))
    );
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchesSearch =
          user.fullName.toLowerCase().includes(search.toLowerCase()) ||
          user.organization.toLowerCase().includes(search.toLowerCase()) ||
          user.region.toLowerCase().includes(search.toLowerCase()) ||
          user.district.toLowerCase().includes(search.toLowerCase());

        const matchesRegion =
          selectedRegion === "Barchasi" || user.region === selectedRegion;

        const matchesDistrict =
          selectedDistrict === "Barchasi" || user.district === selectedDistrict;

        return matchesSearch && matchesRegion && matchesDistrict;
      })
      .sort((a, b) => {
        if (sortOrder === "az") {
          return a.fullName.localeCompare(b.fullName);
        } else {
          return b.fullName.localeCompare(a.fullName);
        }
      });
  }, [users, search, selectedRegion, selectedDistrict, sortOrder]);

  return (
    <div className="p-5 py-4.5 space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative min-w-[280px] sm:min-w-[320px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8B90A5]">
            <HugeiconsIcon icon={Search01Icon} size={18} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism Sharifi bo'yicha izlash"
            className="w-full bg-white border border-[#E2E6F2] rounded-xl pl-10 pr-4 h-8 text-[13.5px] text-[#1A1D2E] placeholder-[#8B90A5] focus:outline-none focus:border-[#4763E4] focus:ring-2 focus:ring-[#4763E4]/10 transition-all shadow-2xs"
          />
        </div>

        {/* Region Filter */}
        <div className="min-w-[150px]">
          <CustomSelect
            value={selectedRegion}
            onChange={setSelectedRegion}
            options={regionOptions}
            placeholder="Viloyat"
            searchPlaceholder="Viloyat izlash..."
          />
        </div>

        {/* District Filter */}
        <div className="min-w-[150px]">
          <CustomSelect
            value={selectedDistrict}
            onChange={setSelectedDistrict}
            options={districtOptions}
            placeholder="Tuman"
            searchPlaceholder="Tuman izlash..."
          />
        </div>

        {/* Sort Filter */}
        <div className="min-w-[160px]">
          <CustomSelect
            value={sortOrder}
            onChange={setSortOrder}
            options={sortOptions}
            placeholder="A dan Z gacha"
            searchable={false}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-transparent overflow-auto h-[calc(100vh-150px)]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-[#F8F9FC]">
            <tr className="border-b border-[#E2E6F2] text-[#8B90A5] text-[13px] font-medium">
              <th className="py-3 px-4 font-normal w-12 text-center">#</th>
              <th className="py-3 px-4 font-normal">Ism Sharif</th>
              <th className="py-3 px-4 font-normal">Tashkilot</th>
              <th className="py-3 px-4 font-normal">Viloyat</th>
              <th className="py-3 px-4 font-normal">Tuman</th>
              <th className="py-3 px-4 font-normal">Tug'ilgan kun</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6F2]/50 text-[13.5px]">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  onClick={() => navigate(`/users/${user.id}`)}
                  className="hover:bg-white/60 transition-colors group cursor-pointer"
                >
                  {/* Index Number */}
                  <td className="py-3.5 px-4 text-center text-[#5B6078] font-medium">
                    {index + 1}
                  </td>

                  {/* Full Name with Star Icon */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(user.id, e)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${user.isFavorite
                            ? "text-[#F59E0B] bg-[#FEF3C7]"
                            : "text-[#637EEB] hover:bg-[#EEF2FF]"
                          }`}
                        title={
                          user.isFavorite
                            ? "Saralanganlardan o'chirish"
                            : "Saralanganlarga qo'shish"
                        }
                      >
                        <HugeiconsIcon
                          icon={StarIcon}
                          size={16}
                          className={user.isFavorite ? "fill-[#F59E0B]" : ""}
                        />
                      </button>
                      <span className="font-medium text-[#1A1D2E] group-hover:text-[#4763E4] transition-colors truncate max-w-[240px]">
                        {user.fullName}
                      </span>
                    </div>
                  </td>

                  {/* Organization */}
                  <td className="py-3.5 px-4 text-[#1A1D2E]">
                    {user.organization}
                  </td>

                  {/* Region */}
                  <td className="py-3.5 px-4 text-[#1A1D2E]">
                    {user.region}
                  </td>

                  {/* District */}
                  <td className="py-3.5 px-4 text-[#1A1D2E]">
                    {user.district}
                  </td>

                  {/* Birth Date */}
                  <td className="py-3.5 px-4 text-[#1A1D2E]">
                    {user.birthDate}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-[#8B90A5] text-sm"
                >
                  Foydalanuvchilar topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;