import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axioesInstance from "../utils/axioesInstance";

const taxTypeLabels = {
  samanya_water: "सामान्य पाणीपट्टी (General Water)",
  vishesh_water: "विशेष पाणीपट्टी (Special Water)",
  house: "घरपट्टी (House Tax)",
  health: "आरोग्य कर (Health Tax)",
  electricity: "वीज कर (Electricity Tax)",
  fine: "दंड (Fine / Penalty)",
};

export default function VmsFamiliesAdmin() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Switch tabs: "search" or "add"
  const [activeTab, setActiveTab] = useState("search");

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [familyTaxes, setFamilyTaxes] = useState(null);
  const [familyApps, setFamilyApps] = useState([]);
  const [loadingTaxes, setLoadingTaxes] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [familyId, setFamilyId] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [mainMemberName, setMainMemberName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [address, setAddress] = useState("");
  const [menCount, setMenCount] = useState(0);
  const [womenCount, setWomenCount] = useState(0);
  const [seniorCount, setSeniorCount] = useState(0);
  const [childrenCount, setChildrenCount] = useState(0);

  const [saving, setSaving] = useState(false);

  const fetchFamilies = () => {
    setLoading(true);
    axioesInstance
      .get("/admin/families")
      .then((res) => {
        setFamilies(res.data || []);
      })
      .catch(() => {
        toast.error("Failed to load family list");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  useEffect(() => {
    if (families.length > 0) {
      let maxNum = 0;
      families.forEach((f) => {
        if (f.familyId && f.familyId.startsWith("FM")) {
          const numPart = parseInt(f.familyId.replace("FM", ""), 10);
          if (!isNaN(numPart) && numPart > maxNum) {
            maxNum = numPart;
          }
        }
      });
      const nextNum = maxNum + 1;
      setFamilyId(`FM${String(nextNum).padStart(4, "0")}`);
    } else {
      setFamilyId("FM0001");
    }
  }, [families, activeTab]);

  const handleSelectFamily = async (family) => {
    setSelectedFamily(family);
    setIsEditing(false);
    setLoadingTaxes(true);
    try {
      const [taxRes, appRes] = await Promise.all([
        axioesInstance.get(`/taxes/${family.familyId}`),
        axioesInstance.get("/admin/applications"),
      ]);
      setFamilyTaxes(taxRes.data);
      // Filter applications for this family
      const apps = (appRes.data || []).filter((app) => app.familyId === family.familyId);
      setFamilyApps(apps);
    } catch (err) {
      toast.error("Failed to load taxes or certificates for this family");
    } finally {
      setLoadingTaxes(false);
    }
  };

  const startEditing = () => {
    setFamilyId(selectedFamily.familyId);
    setHouseNumber(selectedFamily.houseNumber || "");
    setMainMemberName(selectedFamily.mainMemberName || "");
    setMobileNumber(selectedFamily.mobileNumber || "");
    setWhatsappNumber(selectedFamily.whatsappNumber || "");
    setAddress(selectedFamily.address || "");
    setMenCount(selectedFamily.menCount || 0);
    setWomenCount(selectedFamily.womenCount || 0);
    setSeniorCount(selectedFamily.seniorCount || 0);
    setChildrenCount(selectedFamily.childrenCount || 0);
    setIsEditing(true);
  };

  const handleUpdateFamily = async (e) => {
    e.preventDefault();
    if (!houseNumber || !mainMemberName || !mobileNumber || !address) {
      return toast.error("Please fill all required fields");
    }

    setSaving(true);
    try {
      const res = await axioesInstance.put(`/admin/families/${selectedFamily._id}`, {
        houseNumber,
        mainMemberName,
        mobileNumber,
        whatsappNumber,
        address,
        menCount: Number(menCount),
        womenCount: Number(womenCount),
        seniorCount: Number(seniorCount),
        childrenCount: Number(childrenCount),
      });
      toast.success("Family details updated successfully!");
      setSelectedFamily(res.data.family);
      setIsEditing(false);
      fetchFamilies();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error during update");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!familyId || !houseNumber || !mainMemberName || !mobileNumber || !address) {
      return toast.error("Please fill all required fields");
    }

    setSaving(true);
    try {
      await axioesInstance.post("/admin/families", {
        familyId,
        houseNumber,
        mainMemberName,
        mobileNumber,
        whatsappNumber,
        address,
        menCount,
        womenCount,
        seniorCount,
        childrenCount,
      });
      toast.success("Family registered successfully!");
      // Reset form
      setFamilyId("");
      setHouseNumber("");
      setMainMemberName("");
      setMobileNumber("");
      setWhatsappNumber("");
      setAddress("");
      setMenCount(0);
      setWomenCount(0);
      setSeniorCount(0);
      setChildrenCount(0);
      fetchFamilies();
      setActiveTab("search"); // Switch to search to see the new family
    } catch (err) {
      toast.error(err.response?.data?.error || "Error during registration");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this family? All family data will be lost.")) {
      return;
    }
    try {
      await axioesInstance.delete(`/admin/families/${id}`);
      toast.success("Family deleted successfully");
      if (selectedFamily && selectedFamily._id === id) {
        setSelectedFamily(null);
      }
      fetchFamilies();
    } catch (err) {
      toast.error("Error while deleting");
    }
  };

  // Sort families to show latest first
  const latestFamilies = [...families].reverse();

  // Efficient search filter
  const filteredFamilies = searchQuery.trim() === ""
    ? latestFamilies.slice(0, 3)
    : latestFamilies.filter((f) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          f.mainMemberName?.toLowerCase().includes(q) ||
          f.mobileNumber?.includes(q) ||
          f.familyId?.toLowerCase().includes(q)
        );
      });

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden bg-green-900 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-600/30 rounded-full pointer-events-none z-0"></div>
        <div className="absolute -bottom-24 -left-16 w-56 h-56 bg-orange-500/30 rounded-full pointer-events-none z-0"></div>
        <div className="absolute top-1/2 left-[60%] w-16 h-16 bg-yellow-400/30 rounded-full -translate-y-1/2 pointer-events-none z-0"></div>

        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white drop-shadow-md">कुटुंब नोंदणी आणि व्यवस्थापन केंद्र (Village Household Hub)</h2>
          <p className="text-sm text-green-100 font-semibold mt-1">ग्रामपंचायत कुटुंब नोंदणी, शोध आणि लोकसंख्या व्यवस्थापन नियंत्रण पॅनेल</p>
        </div>

        {/* TAB CONTROLS */}
        <div className="relative z-10 flex bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab("search");
              setSelectedFamily(null);
            }}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs transition ${
              activeTab === "search"
                ? "bg-green-700 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            कुटुंब शोधा व व्यवस्थापन
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("add");
              setSelectedFamily(null);
            }}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs transition ${
              activeTab === "add"
                ? "bg-green-700 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            नवीन कुटुंब नोंदणी
          </button>
        </div>
      </div>

      {/* 1. STATS METADATA GRID - SAAS Upgrade */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {/* Total Families */}
        <div className="relative overflow-hidden bg-white p-5 rounded-3xl border border-green-100 text-left shadow-xl hover:scale-[1.02] transition-all duration-300 group">
          {/* Decorative Circles */}
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-green-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute -left-4 -top-4 w-12 h-12 bg-green-300/10 rounded-full blur-md pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">एकूण कुटुंबे</p>
              <div className="p-1.5 rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight">{families.length}</p>
            <p className="text-[9px] text-slate-400 mt-1 font-bold">Households</p>
          </div>
        </div>

        {/* Total Population */}
        <div className="relative overflow-hidden bg-white p-5 rounded-3xl border border-blue-100 text-left shadow-xl hover:scale-[1.02] transition-all duration-300 group">
          {/* Decorative Circles */}
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute -left-4 -top-4 w-12 h-12 bg-blue-300/10 rounded-full blur-md pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">एकूण लोकसंख्या</p>
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight">
              {families.reduce(
                (acc, f) =>
                  acc +
                  (f.menCount || 0) +
                  (f.womenCount || 0) +
                  (f.seniorCount || 0) +
                  (f.childrenCount || 0),
                0
              )}
            </p>
            <p className="text-[9px] text-slate-400 mt-1 font-bold">Total Population</p>
          </div>
        </div>

        {/* Total Men */}
        <div className="relative overflow-hidden bg-white p-5 rounded-3xl border border-teal-100 text-left shadow-xl hover:scale-[1.02] transition-all duration-300 group">
          {/* Decorative Circles */}
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-teal-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute -left-4 -top-4 w-12 h-12 bg-teal-300/10 rounded-full blur-md pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">एकूण पुरुष</p>
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight">
              {families.reduce((acc, f) => acc + (f.menCount || 0), 0)}
            </p>
            <p className="text-[9px] text-slate-400 mt-1 font-bold">Men</p>
          </div>
        </div>

        {/* Total Women */}
        <div className="relative overflow-hidden bg-white p-5 rounded-3xl border border-rose-100 text-left shadow-xl hover:scale-[1.02] transition-all duration-300 group">
          {/* Decorative Circles */}
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-rose-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute -left-4 -top-4 w-12 h-12 bg-rose-300/10 rounded-full blur-md pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">एकूण महिला</p>
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight">
              {families.reduce((acc, f) => acc + (f.womenCount || 0), 0)}
            </p>
            <p className="text-[9px] text-slate-400 mt-1 font-bold">Women</p>
          </div>
        </div>

        {/* Seniors */}
        <div className="relative overflow-hidden bg-white p-5 rounded-3xl border border-amber-100 text-left shadow-xl hover:scale-[1.02] transition-all duration-300 group">
          {/* Decorative Circles */}
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute -left-4 -top-4 w-12 h-12 bg-amber-300/10 rounded-full blur-md pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ज्येष्ठ नागरिक</p>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight">
              {families.reduce((acc, f) => acc + (f.seniorCount || 0), 0)}
            </p>
            <p className="text-[9px] text-slate-400 mt-1 font-bold">Seniors (60+)</p>
          </div>
        </div>

        {/* Kids */}
        <div className="relative overflow-hidden bg-white p-5 rounded-3xl border border-purple-100 text-left shadow-xl hover:scale-[1.02] transition-all duration-300 group">
          {/* Decorative Circles */}
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-purple-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute -left-4 -top-4 w-12 h-12 bg-purple-300/10 rounded-full blur-md pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">बालके (0-18)</p>
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight">
              {families.reduce((acc, f) => acc + (f.childrenCount || 0), 0)}
            </p>
            <p className="text-[9px] text-slate-400 mt-1 font-bold">Children (0-18)</p>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & SHOW DETAILS TAB */}
      {activeTab === "search" && (
        <div className="space-y-6">
          {selectedFamily ? (
            /* DETAILED FAMILY PROFILE VIEW - CRITICAL SAAS LAYOUT */
            <div className="space-y-6 animate-fadeIn">
              {/* Profile Header navigation card */}
              <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-green-50 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFamily(null);
                    setFamilyTaxes(null);
                    setFamilyApps([]);
                  }}
                  className="flex items-center gap-2 text-slate-700 hover:text-slate-900 bg-white border border-slate-300 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-sm transition hover:shadow"
                >
                  ← कुटुंबांची यादी (Back to Families list)
                </button>
                <div className="text-right">
                  <h4 className="font-extrabold text-sm md:text-base text-slate-800 leading-tight">
                    कुटुंब प्रोफाईल: {selectedFamily.mainMemberName}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">ID: {selectedFamily.familyId}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Family Metadata Info */}
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-50 space-y-5">
                  <h4 className="text-base font-black text-slate-800 border-b pb-2 tracking-tight">कुटुंब माहिती (Profile Details)</h4>
                  
                  {isEditing ? (
                    /* EDITING FORM INSTEAD OF STATIC METADATA */
                    <form onSubmit={handleUpdateFamily} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">घर क्रमांक *</label>
                        <input
                          type="text"
                          required
                          value={houseNumber}
                          onChange={(e) => setHouseNumber(e.target.value)}
                          className="border border-slate-200 p-2.5 rounded-xl w-full font-semibold outline-none focus:border-green-600 focus:ring-4 focus:ring-green-50"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">कुटुंब प्रमुख नाव *</label>
                        <input
                          type="text"
                          required
                          value={mainMemberName}
                          onChange={(e) => setMainMemberName(e.target.value)}
                          className="border border-slate-200 p-2.5 rounded-xl w-full font-semibold outline-none focus:border-green-600 focus:ring-4 focus:ring-green-50"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">मोबाईल क्रमांक *</label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                          className="border border-slate-200 p-2.5 rounded-xl w-full font-semibold outline-none focus:border-green-600 focus:ring-4 focus:ring-green-50 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">व्हॉट्सॲप नंबर</label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
                          className="border border-slate-200 p-2.5 rounded-xl w-full font-semibold outline-none focus:border-green-600 focus:ring-4 focus:ring-green-50 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">पत्ता *</label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="border border-slate-200 p-2.5 rounded-xl w-full font-semibold outline-none focus:border-green-600 focus:ring-4 focus:ring-green-50"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">पुरुष संख्या</label>
                          <input
                            type="number"
                            value={menCount}
                            onChange={(e) => setMenCount(Number(e.target.value))}
                            className="border border-slate-200 p-2 rounded-xl w-full font-semibold outline-none focus:border-green-600 focus:ring-4 focus:ring-green-50"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">महिला संख्या</label>
                          <input
                            type="number"
                            value={womenCount}
                            onChange={(e) => setWomenCount(Number(e.target.value))}
                            className="border border-slate-200 p-2 rounded-xl w-full font-semibold outline-none focus:border-green-600 focus:ring-4 focus:ring-green-50"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">ज्येष्ठ नागरिक</label>
                          <input
                            type="number"
                            value={seniorCount}
                            onChange={(e) => setSeniorCount(Number(e.target.value))}
                            className="border border-slate-200 p-2 rounded-xl w-full font-semibold outline-none focus:border-green-600 focus:ring-4 focus:ring-green-50"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">बालके (0-18)</label>
                          <input
                            type="number"
                            value={childrenCount}
                            onChange={(e) => setChildrenCount(Number(e.target.value))}
                            className="border border-slate-200 p-2 rounded-xl w-full font-semibold outline-none focus:border-green-600 focus:ring-4 focus:ring-green-50"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-sm transition"
                        >
                          {saving ? "Saving..." : "जतन करा (Save)"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="flex-1 bg-slate-100 hover:bg-slate-250 text-slate-700 font-extrabold py-2.5 rounded-xl text-xs transition"
                        >
                          रद्द करा
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* VIEW PROFILE DETAILS MODE */
                    <>
                      <div className="space-y-3.5 text-xs md:text-sm">
                        <p className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-400 font-bold">कुटुंब आयडी (ID):</span>{" "}
                          <span className="font-mono font-black text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-150/50">{selectedFamily.familyId}</span>
                        </p>
                        <p className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-400 font-bold">घर क्रमांक (House No):</span>{" "}
                          <span className="font-bold text-slate-800">{selectedFamily.houseNumber}</span>
                        </p>
                        <p className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-400 font-bold">कुटुंब प्रमुख (Head Name):</span>{" "}
                          <span className="font-extrabold text-slate-800">{selectedFamily.mainMemberName}</span>
                        </p>
                        <p className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-400 font-bold">मोबाईल (Mobile):</span>{" "}
                          <span className="font-mono text-slate-800 font-medium">{selectedFamily.mobileNumber}</span>
                        </p>
                        <p className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-400 font-bold">व्हॉट्सॲप (WhatsApp):</span>{" "}
                          <span className="font-mono text-slate-800 font-medium">{selectedFamily.whatsappNumber || "—"}</span>
                        </p>
                        <p className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-400 font-bold">पत्ता (Address):</span>{" "}
                          <span className="font-medium text-slate-700 text-right max-w-[60%] leading-relaxed">{selectedFamily.address}</span>
                        </p>
                      </div>

                      {/* Demographics Card */}
                      <div className="mt-4 p-4 bg-slate-50/60 rounded-2xl border border-slate-150/40">
                        <p className="text-[10px] font-black text-slate-400 mb-3 text-center uppercase tracking-wider">
                          लोकसंख्या विभागणी (Demographics)
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-center text-xs">
                          <div className="bg-white p-3 rounded-xl border border-slate-150/80 shadow-sm hover:shadow-md transition">
                            <p className="text-slate-400 font-bold mb-0.5">पुरुष</p>
                            <p className="text-base font-extrabold text-slate-800">{selectedFamily.menCount || 0}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-150/80 shadow-sm hover:shadow-md transition">
                            <p className="text-slate-400 font-bold mb-0.5">महिला</p>
                            <p className="text-base font-extrabold text-slate-800">{selectedFamily.womenCount || 0}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-150/80 shadow-sm hover:shadow-md transition">
                            <p className="text-slate-400 font-bold mb-0.5">ज्येष्ठ</p>
                            <p className="text-base font-extrabold text-slate-800">{selectedFamily.seniorCount || 0}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-150/80 shadow-sm hover:shadow-md transition">
                            <p className="text-slate-400 font-bold mb-0.5">बालके</p>
                            <p className="text-base font-extrabold text-slate-800">{selectedFamily.childrenCount || 0}</p>
                          </div>
                        </div>
                        <div className="mt-4 text-center bg-gradient-to-r from-green-500 to-emerald-600 p-2.5 rounded-xl text-white font-extrabold text-xs shadow-sm">
                          एकूण कुटुंब सदस्य:{" "}
                          {(selectedFamily.menCount || 0) +
                            (selectedFamily.womenCount || 0) +
                            (selectedFamily.seniorCount || 0) +
                            (selectedFamily.childrenCount || 0)}
                        </div>
                      </div>

                      {/* Edit Button Option */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={startEditing}
                          className="w-full bg-slate-50 border border-green-600 text-green-700 hover:bg-green-700 hover:text-white font-extrabold py-2.5 rounded-xl text-xs transition-all duration-200 shadow-sm hover:shadow"
                        >
                          माहिती संपादित करा (Edit Profile)
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Panel: Taxes and Certificates requested */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Tax Information */}
                  <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-50">
                    <h4 className="text-base font-black text-slate-800 border-b pb-2 mb-4 tracking-tight">
                      कर विवरण (Tax History & Bills)
                    </h4>
                    {loadingTaxes ? (
                      <p className="text-slate-500 text-center py-6 text-sm">कर माहिती लोड होत आहे...</p>
                    ) : !familyTaxes || (!familyTaxes.bills?.length && !familyTaxes.payments?.length) ? (
                      <p className="text-slate-500 text-center py-6 text-sm">या कुटुंबासाठी कोणतीही कर आकारणी किंवा भरणा इतिहास नाही.</p>
                    ) : (
                      <div className="space-y-6">
                        {/* Bills Sub-table */}
                        {familyTaxes.bills?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-black text-slate-400 mb-2.5 uppercase tracking-wider">कर आकारणी बिले (Assigned Tax Bills)</p>
                            <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                                    <th className="p-3">वर्ष (Year)</th>
                                    <th className="p-3">कर प्रकार (Type)</th>
                                    <th className="p-3">रक्कम (Amount)</th>
                                    <th className="p-3">भरलेली रक्कम</th>
                                    <th className="p-3">देय तारीख</th>
                                    <th className="p-3 text-center">स्थिती</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {familyTaxes.bills.map((bill) => (
                                    <tr key={bill._id} className="hover:bg-slate-50/40">
                                      <td className="p-3 font-bold text-slate-800 font-mono">{bill.year}</td>
                                      <td className="p-3 font-extrabold text-slate-700">{taxTypeLabels[bill.taxType] || bill.taxType}</td>
                                      <td className="p-3 text-slate-800 font-extrabold">₹{bill.amount}</td>
                                      <td className="p-3 text-green-700 font-extrabold">₹{bill.paidAmount}</td>
                                      <td className="p-3 text-slate-500 font-mono">{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString("en-US") : "—"}</td>
                                      <td className="p-3 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wide flex items-center justify-center gap-1.5 w-fit mx-auto ${
                                          bill.status === "paid"
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : bill.status === "partial"
                                            ? "bg-orange-50 text-orange-600 border border-orange-200"
                                            : "bg-red-50 text-red-600 border border-red-200"
                                        }`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${
                                            bill.status === "paid" ? "bg-green-500" : bill.status === "partial" ? "bg-orange-400" : "bg-red-500"
                                          }`} />
                                          {bill.status === "paid" ? "पूर्ण भरला" : bill.status === "partial" ? "अंशतः भरला" : "थकीत"}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Payments Sub-table */}
                        {familyTaxes.payments?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-black text-slate-400 mb-2.5 uppercase tracking-wider">भरणा इतिहास (Receipt History)</p>
                            <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                                    <th className="p-3">तारीख/वेळ</th>
                                    <th className="p-3">कर प्रकार</th>
                                    <th className="p-3">भरलेली रक्कम</th>
                                    <th className="p-3">ट्रान्झॅक्शन ID</th>
                                    <th className="p-3">पद्धत</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {familyTaxes.payments.map((p) => (
                                    <tr key={p._id} className="hover:bg-slate-50/40">
                                      <td className="p-3 text-slate-500 font-mono">{new Date(p.paymentDate || p.createdAt).toLocaleString("en-US", { hour12: true })}</td>
                                      <td className="p-3 font-extrabold text-slate-700">{taxTypeLabels[p.taxType] || p.taxType}</td>
                                      <td className="p-3 text-green-700 font-extrabold">₹{p.amountPaid}</td>
                                      <td className="p-3 font-mono text-slate-400 text-[10px]">{p.transactionId}</td>
                                      <td className="p-3 capitalize">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          p.paymentMethod === "offline" ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-600"
                                        }`}>
                                          {p.paymentMethod}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Certificates Applications Sub-table */}
                  <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-50">
                    <h4 className="text-base font-black text-slate-800 border-b pb-2 mb-4 tracking-tight">
                      दाखला विनंती अर्ज (Certificate Applications)
                    </h4>
                    {loadingTaxes ? (
                      <p className="text-slate-500 text-center py-6 text-sm">दाखला इतिहास लोड होत आहे...</p>
                    ) : !familyApps || !familyApps.length ? (
                      <p className="text-slate-500 text-center py-6 text-sm">या कुटुंबासाठी कोणताही दाखला अर्ज मिळालेला नाही.</p>
                    ) : (
                      <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                              <th className="p-3">अर्जदार</th>
                              <th className="p-3">दाखला प्रकार</th>
                              <th className="p-3">अर्ज तारीख</th>
                              <th className="p-3">पूर्ण वेळ (Completed At)</th>
                              <th className="p-3">स्थिती</th>
                              <th className="p-3 text-center">कृती</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {familyApps.map((app) => (
                              <tr key={app._id} className="hover:bg-slate-50/40">
                                <td className="p-3 font-bold text-slate-800">{app.applicantName}</td>
                                <td className="p-3 font-extrabold text-slate-700 capitalize">
                                  {app.type === "birth" ? "जन्म दाखला" : 
                                   app.type === "death" ? "मृत्यू दाखला" : 
                                   app.type === "income" ? "उत्पन्न दाखला" : 
                                   app.type === "marriage" ? "विवाह दाखला" : 
                                   "रहिवासी दाखला"}
                                </td>
                                <td className="p-3 text-slate-500 font-mono">{new Date(app.createdAt).toLocaleDateString("en-US")}</td>
                                <td className="p-3 text-slate-500 font-mono">
                                  {app.status === "completed" 
                                    ? new Date(app.completedAt || app.updatedAt).toLocaleString("en-US", {
                                        day: "numeric",
                                        month: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true
                                      })
                                    : "—"}
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black flex items-center justify-center gap-1.5 w-fit ${
                                    app.status === "completed"
                                      ? "bg-green-50 text-green-700 border border-green-200"
                                      : app.status === "need_documents"
                                      ? "bg-red-50 text-red-650 border border-red-200"
                                      : "bg-orange-50 text-orange-600 border border-orange-200"
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      app.status === "completed" ? "bg-green-500" : app.status === "need_documents" ? "bg-red-500" : "bg-orange-400"
                                    }`} />
                                    {app.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  {app.documentUrl ? (
                                    <a
                                      href={app.documentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-green-700 hover:text-green-800 font-bold transition hover:underline"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                      पहा / Download
                                    </a>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SEARCH AND RESULTS TABLE */
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-100 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wide">
                  कुटुंब प्रमुखाचे नाव किंवा मोबाईल नंबरने शोधा (Search Household)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="शोधण्यासाठी नाव / मोबाईल नंबर / कुटुंब ID प्रविष्ट करा..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 pr-4 py-3.5 bg-white border border-green-600 rounded-2xl w-full text-sm outline-none font-semibold transition-all duration-300 focus:border-green-700 focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-6 text-sm text-slate-400">लोड होत आहे...</div>
              ) : filteredFamilies.length === 0 ? (
                <p className="text-center text-slate-400 py-6 text-sm">शोधलेले कुटुंब सापडले नाही.</p>
              ) : (
                <div className="overflow-x-auto">
                  {searchQuery.trim() === "" && (
                    <p className="text-[10px] text-orange-700 font-extrabold mb-3 bg-orange-50/60 p-2.5 rounded-xl border border-orange-150/40 inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                      नुकतीच नोंदणीकृत झालेली कुटुंबे (Showing latest 3 registered households):
                    </p>
                  )}
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-green-50 text-green-800 font-bold border-b border-green-100 text-xs">
                        <th className="p-4 rounded-l-xl">कुटुंब ID</th>
                        <th className="p-4">कुटुंब प्रमुख (Head Name)</th>
                        <th className="p-4">मोबाईल</th>
                        <th className="p-4 text-center">सदस्य संख्या</th>
                        <th className="p-4 rounded-r-xl text-center">क्रिया</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredFamilies.map((f) => (
                        <tr key={f._id} className="hover:bg-slate-50/40 transition">
                          <td className="p-4 font-mono font-black text-xs text-green-700">{f.familyId}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8.5 h-8.5 rounded-full bg-green-50 text-green-700 font-black text-xs flex items-center justify-center border border-green-150/30 shadow-inner select-none">
                                {f.mainMemberName ? f.mainMemberName.charAt(0) : "U"}
                              </div>
                              <div>
                                <p className="text-slate-800 font-extrabold text-sm leading-snug">{f.mainMemberName}</p>
                                <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">घर क्र: {f.houseNumber}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-slate-500 text-xs">{f.mobileNumber}</td>
                          <td className="p-4 text-center">
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-black border border-slate-200/40">
                              {(f.menCount || 0) +
                                (f.womenCount || 0) +
                                (f.seniorCount || 0) +
                                (f.childrenCount || 0)}
                            </span>
                          </td>
                          <td className="p-4 flex gap-2.5 justify-center">
                            <button
                              type="button"
                              onClick={() => handleSelectFamily(f)}
                              className="border border-green-600 text-green-700 hover:bg-green-700 hover:text-white font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                            >
                              पहा / View Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(f._id)}
                              className="border border-red-200 text-red-650 hover:bg-red-500 hover:text-white font-extrabold px-3 py-1.5 rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5"
                            >
                              हटवा
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. ADD FAMILY TAB */}
      {activeTab === "add" && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-50 animate-fadeIn max-w-none">
          <h3 className="text-lg font-black text-slate-800 mb-6 border-b pb-2 tracking-tight">
            नवीन कुटुंब नोंदणी (Register Household)
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">कुटुंब आयडी (Unique Family ID)</label>
              <input
                type="text"
                readOnly
                placeholder="FM0001"
                value={familyId}
                className="bg-slate-50 border border-slate-200 p-3 rounded-xl w-full text-sm outline-none text-slate-400 font-black font-mono select-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">घर क्रमांक (House No.) *</label>
              <input
                type="text"
                required
                placeholder="उदा. H-102"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                className="border border-slate-250 p-3 rounded-xl w-full text-sm outline-none font-semibold focus:border-green-600 focus:ring-4 focus:ring-green-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">मुख्य सदस्याचे नाव (Head Name) *</label>
              <input
                type="text"
                required
                placeholder="उदा. सतीश मारुती शिंदे"
                value={mainMemberName}
                onChange={(e) => setMainMemberName(e.target.value)}
                className="border border-slate-250 p-3 rounded-xl w-full text-sm outline-none font-semibold focus:border-green-600 focus:ring-4 focus:ring-green-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">मोबाईल नंबर (OTP साठी) *</label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="98XXXXXXXX"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                className="border border-slate-250 p-3 rounded-xl w-full text-sm outline-none font-semibold focus:border-green-600 focus:ring-4 focus:ring-green-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">व्हॉट्सॲप मोबाईल नंबर</label>
              <input
                type="tel"
                maxLength={10}
                placeholder="98XXXXXXXX"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
                className="border border-slate-250 p-3 rounded-xl w-full text-sm outline-none font-semibold focus:border-green-600 focus:ring-4 focus:ring-green-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">पत्ता (Address) *</label>
              <input
                type="text"
                required
                placeholder="उदा. गोमेवाडी गल्ली क्र. ३"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border border-slate-250 p-3 rounded-xl w-full text-sm outline-none font-semibold focus:border-green-600 focus:ring-4 focus:ring-green-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">पुरुष संख्या</label>
                <input
                  type="number"
                  value={menCount}
                  onChange={(e) => setMenCount(Number(e.target.value))}
                  className="border border-slate-250 p-3 rounded-xl w-full text-sm outline-none font-semibold focus:border-green-600 focus:ring-4 focus:ring-green-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">महिला संख्या</label>
                <input
                  type="number"
                  value={womenCount}
                  onChange={(e) => setWomenCount(Number(e.target.value))}
                  className="border border-slate-250 p-3 rounded-xl w-full text-sm outline-none font-semibold focus:border-green-600 focus:ring-4 focus:ring-green-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">ज्येष्ठ नागरिक</label>
                <input
                  type="number"
                  value={seniorCount}
                  onChange={(e) => setSeniorCount(Number(e.target.value))}
                  className="border border-slate-250 p-3 rounded-xl w-full text-sm outline-none font-semibold focus:border-green-600 focus:ring-4 focus:ring-green-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">बालके (0-18)</label>
                <input
                  type="number"
                  value={childrenCount}
                  onChange={(e) => setChildrenCount(Number(e.target.value))}
                  className="border border-slate-250 p-3 rounded-xl w-full text-sm outline-none font-semibold focus:border-green-600 focus:ring-4 focus:ring-green-50"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {saving ? "नोंदणी होत आहे..." : "कुटुंब नोंदवा / Register"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
