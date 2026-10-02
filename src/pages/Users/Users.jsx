import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Loader2, RefreshCw } from "lucide-react";
import { CustomSelect } from "../../components/UI";
import { getUsers } from "../../services/usersApi";
import { getRegions, getDistricts } from "../../services/referencesApi";

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const Users = () => {
  const navigate = useNavigate();

  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [sortOrder, setSortOrder] = useState("az");

  // Options states
  const [regionOptions, setRegionOptions] = useState([{ value: "", label: "Barcha viloyatlar" }]);
  const [districtOptions, setDistrictOptions] = useState([{ value: "", label: "Barcha tumanlar" }]);

  // Data & Pagination states
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Guards against concurrent / infinite requests
  const isFetchingRef = useRef(false);
  const tableContainerRef = useRef(null);

  // 1. Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 2. Load regions list on mount
  useEffect(() => {
    let isMounted = true;
    getRegions()
      .then((data) => {
        if (!isMounted) return;
        const options = [
          { value: "", label: "Barcha viloyatlar" },
          ...(data.results || []).map((r) => ({
            value: r.id,
            label: r.name,
          })),
        ];
        setRegionOptions(options);
      })
      .catch((err) => console.error("Viloyatlar yuklashda xatolik:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Load districts when selected region changes
  useEffect(() => {
    let isMounted = true;
    const params = selectedRegion ? { region: selectedRegion } : {};
    getDistricts(params)
      .then((data) => {
        if (!isMounted) return;
        const options = [
          { value: "", label: "Barcha tumanlar" },
          ...(data.results || []).map((d) => ({
            value: d.id,
            label: d.name,
          })),
        ];
        setDistrictOptions(options);
      })
      .catch((err) => console.error("Tumanlar yuklashda xatolik:", err));

    // Reset selected district when region changes
    setSelectedDistrict("");

    return () => {
      isMounted = false;
    };
  }, [selectedRegion]);

  // 4. Fetch Users function (handles page 1 reset vs next page append)
  const fetchUsersData = useCallback(
    async (targetPage, isNextPage = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isNextPage) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const orderingParam = sortOrder === "za" ? "-first_name" : "first_name";
        const params = {
          page: targetPage,
          ordering: orderingParam,
        };

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }
        if (selectedRegion) {
          params.region = selectedRegion;
        }
        if (selectedDistrict) {
          params.district = selectedDistrict;
        }

        const data = await getUsers(params);
        const newResults = data.results || [];

        setTotalCount(data.count || 0);

        if (isNextPage) {
          setUsers((prev) => {
            const existingIds = new Set(prev.map((u) => u.id));
            const uniqueNew = newResults.filter((u) => !existingIds.has(u.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setUsers(newResults);
        }

        setPage(targetPage);
        setHasMore(Boolean(data.next && newResults.length > 0));
      } catch (err) {
        console.error("Foydalanuvchilarni yuklashda xatolik:", err);
        setError("Foydalanuvchilarni yuklab bo'lmadi");
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [debouncedSearch, selectedRegion, selectedDistrict, sortOrder]
  );

  // 5. Trigger initial fetch or re-fetch on filter change
  useEffect(() => {
    fetchUsersData(1, false);
  }, [fetchUsersData]);

  // 6. Infinite Scroll on table container
  const handleScroll = () => {
    const container = tableContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 80;

    if (isNearBottom && hasMore && !loading && !loadingMore && !isFetchingRef.current) {
      fetchUsersData(page + 1, true);
    }
  };

  const sortOptions = [
    { value: "az", label: "A dan Z gacha" },
    { value: "za", label: "Z dan A gacha" },
  ];

  return (
    <div className="p-5 py-4.5 space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B90A5]">
            <HugeiconsIcon icon={Search01Icon} size={18} />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ism Sharifi bo'yicha izlash"
            className="w-full bg-white border border-[#E2E6F2] rounded-xl pl-10 pr-4 h-9 text-[13.5px] text-[#1A1D2E] placeholder-[#8B90A5] focus:outline-none focus:border-[#4763E4] focus:ring-2 focus:ring-[#4763E4]/10 transition-all shadow-2xs"
          />
        </div>

        {/* Region Filter */}
        <div className="min-w-[170px]">
          <CustomSelect
            value={selectedRegion}
            onChange={setSelectedRegion}
            options={regionOptions}
            placeholder="Viloyat"
            searchPlaceholder="Viloyat izlash..."
          />
        </div>

        {/* District Filter */}
        <div className="min-w-[170px]">
          <CustomSelect
            value={selectedDistrict}
            onChange={setSelectedDistrict}
            options={districtOptions}
            placeholder="Tuman"
            searchPlaceholder="Tuman izlash..."
            disabled={districtOptions.length <= 1 && !selectedRegion}
          />
        </div>

        {/* Sort Order */}
        <div className="min-w-[160px]">
          <CustomSelect
            value={sortOrder}
            onChange={setSortOrder}
            options={sortOptions}
            placeholder="Saralash"
            showSearch={false}
          />
        </div>
      </div>

      {/* Users Table */}
      <div
        ref={tableContainerRef}
        onScroll={handleScroll}
        className="bg-transparent overflow-auto h-[calc(100vh-150px)] rounded-xl relative"
      >
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-[#F8F9FC]">
            <tr className="border-b border-[#E2E6F2] text-[#8B90A5] text-[13px] font-medium">
              <th className="py-3 px-4 font-normal w-12 text-center">#</th>
              <th className="py-3 px-4 font-normal">F.I.SH</th>
              <th className="py-3 px-4 font-normal">Tashkilot</th>
              <th className="py-3 px-4 font-normal">Viloyat</th>
              <th className="py-3 px-4 font-normal">Tuman</th>
              <th className="py-3 px-4 font-normal">Tug'ilgan sanasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6F2]/50 text-[13.5px]">
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center text-[#8B90A5]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 size={28} className="animate-spin text-[#3858C7]" />
                    <span className="text-[13.5px]">Foydalanuvchilar yuklanmoqda...</span>
                  </div>
                </td>
              </tr>
            ) : error && users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-[#EF4444]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={() => fetchUsersData(1, false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3858C7] text-white text-xs font-semibold cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Qayta urinish</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : users.length > 0 ? (
              <>
                {users.map((user, index) => {
                  const fullName =
                    user.full_name ||
                    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                    user.username ||
                    "Noma'lum";
                  const organization = user.organization || "";
                  const regionName = user.region_info?.name || user.region || "";
                  const districtName = user.district_info?.name || user.district || "";
                  const birthDate = user.birth_date || user.birthDate || "";

                  return (
                    <tr
                      key={user.id || index}
                      onClick={() => navigate(`/users/${user.id}`)}
                      className="hover:bg-white/60 transition-colors group cursor-pointer"
                    >
                      {/* Index Number */}
                      <td className="py-3.5 px-4 text-center text-[#5B6078] font-medium">
                        {index + 1}
                      </td>

                      {/* Full Name with Avatar Initials */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#EEF2FF] text-[#4361EE] border border-[#D7E2FC] font-bold text-xs flex items-center justify-center shrink-0 select-none shadow-2xs">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              getInitials(fullName)
                            )}
                          </div>
                          <div className="flex items-center gap-2 truncate max-w-[260px]">
                            <span className="font-medium text-[#1A1D2E] group-hover:text-[#4763E4] transition-colors truncate">
                              {fullName}
                            </span>
                            {user.is_blocked && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#EF4444] border border-[#FCA5A5]/40 shrink-0">
                                Bloklangan
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Organization */}
                      <td className="py-3.5 px-4 text-[#1A1D2E]">
                        {organization}
                      </td>

                      {/* Region */}
                      <td className="py-3.5 px-4 text-[#1A1D2E]">
                        {regionName}
                      </td>

                      {/* District */}
                      <td className="py-3.5 px-4 text-[#1A1D2E]">
                        {districtName}
                      </td>

                      {/* Birth Date */}
                      <td className="py-3.5 px-4 text-[#1A1D2E]">
                        {birthDate}
                      </td>
                    </tr>
                  );
                })}

                {/* Loading More Spinner row at the bottom */}
                {loadingMore && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-[#5B6078]">
                      <div className="inline-flex items-center gap-2 text-xs font-semibold">
                        <Loader2 size={16} className="animate-spin text-[#3858C7]" />
                        <span>Ko'proq yuklanmoqda...</span>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-16 text-center text-[#8B90A5] text-sm"
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