import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axioesInstance from "../utils/axioesInstance";
import { useLanguage } from "../utils/LanguageContext";
import { getCertificateTypeName } from "../utils/translations";

const TAX_TYPE_LABELS = {
  samanya_water: { mr: "सामान्य पाणीपट्टी", en: "General Water Tax" },
  vishesh_water: { mr: "विशेष पाणीपट्टी", en: "Special Water Tax" },
  water: { mr: "पाणीपट्टी", en: "Water Tax" },
  house: { mr: "घरपट्टी", en: "House Tax" },
  health: { mr: "आरोग्य कर", en: "Health Tax" },
  electricity: { mr: "वीज कर", en: "Electricity Tax" },
  fine: { mr: "दंड", en: "Fine / Penalty" },
};

export default function VmsFamiliesAdmin({ onRedirectToTax }) {
  const { lang } = useLanguage();
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Switch tabs: "search" or "add" or "all"
  const [activeTab, setActiveTab] = useState("search");

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [familyApps, setFamilyApps] = useState([]);
  const [loadingTaxes, setLoadingTaxes] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedFamilyForQr, setSelectedFamilyForQr] = useState(null);
  const [taxFilter, setTaxFilter] = useState("all"); // "all", "pending"
  const [expandedFamilyId, setExpandedFamilyId] = useState(null);

  // Form states
  const [familyId, setFamilyId] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [mainMemberName, setMainMemberName] = useState("");
  const [email, setEmail] = useState("");
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
      const appRes = await axioesInstance.get("/admin/applications");
      // Filter applications for this family
      const apps = (appRes.data || []).filter((app) => app.familyId === family.familyId);
      setFamilyApps(apps);
    } catch (err) {
      toast.error("Failed to load certificates for this family");
    } finally {
      setLoadingTaxes(false);
    }
  };

  const startEditing = () => {
    setFamilyId(selectedFamily.familyId);
    setHouseNumber(selectedFamily.houseNumber || "");
    setMainMemberName(selectedFamily.mainMemberName || "");
    setEmail(selectedFamily.email || "");
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
    if (!houseNumber || !mainMemberName || !email || !address) {
      return toast.error("Please fill all required fields");
    }

    setSaving(true);
    try {
      const res = await axioesInstance.put(`/admin/families/${selectedFamily._id}`, {
        houseNumber,
        mainMemberName,
        email,
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
    if (!familyId || !houseNumber || !mainMemberName || !email || !address) {
      return toast.error("Please fill all required fields");
    }

    setSaving(true);
    try {
      await axioesInstance.post("/admin/families", {
        familyId,
        houseNumber,
        mainMemberName,
        email,
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
      setEmail("");
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

  // Search & Tax filter applies to the "all" tab
  const filteredFamiliesAll = latestFamilies.filter((f) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = q === "" || (
      f.mainMemberName?.toLowerCase().includes(q) ||
      f.email?.toLowerCase().includes(q) ||
      f.familyId?.toLowerCase().includes(q)
    );
    const matchesTax = taxFilter === "all" || !f.hasTaxAssigned;
    return matchesSearch && matchesTax;
  });

  // Pagination for all families view based on filtered results
  const itemsPerPage = 15;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFamiliesAll.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFamiliesAll.length / itemsPerPage);

  return (
    <div className="space-y-8">
      <style>{`
        .custom-sass-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-sass-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-sass-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        .custom-sass-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-sass-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
        .dark .custom-sass-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden bg-green-900 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-600/30 rounded-full pointer-events-none z-0"></div>
        <div className="absolute -bottom-24 -left-16 w-56 h-56 bg-orange-500/30 rounded-full pointer-events-none z-0"></div>
        <div className="absolute top-1/2 left-[60%] w-16 h-16 bg-yellow-400/30 rounded-full -translate-y-1/2 pointer-events-none z-0"></div>

        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white drop-shadow-md">
            {lang === "mr" ? "कुटुंब नोंदणी आणि व्यवस्थापन केंद्र" : "Village Household Hub"}
          </h2>
          <p className="text-sm text-green-100 font-semibold mt-1">
            {lang === "mr" 
              ? "ग्रामपंचायत कुटुंब नोंदणी, शोध आणि लोकसंख्या व्यवस्थापन नियंत्रण पॅनेल" 
              : "Gram Panchayat household registration, search, and demographics management panel"}
          </p>
        </div>

        {/* TAB CONTROLS */}
        <div className="relative z-10 flex bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0 w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab("search");
              setSelectedFamily(null);
            }}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
              activeTab === "search"
                ? "bg-green-700 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {lang === "mr" ? "कुटुंब व्यवस्थापन" : "Household Hub"}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setSelectedFamily(null);
              setCurrentPage(1);
            }}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
              activeTab === "all"
                ? "bg-green-700 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {lang === "mr" ? "सर्व कुटुंब यादी" : "Family Directory"}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("add");
              setSelectedFamily(null);
            }}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
              activeTab === "add"
                ? "bg-green-700 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {lang === "mr" ? "नवीन कुटुंब नोंदणी" : "Register Household"}
          </button>
        </div>
      </div>

      {/* 1. STATS METADATA GRID - SAAS Upgrade */}
      {activeTab === "search" && selectedFamily === null && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {/* Total Families */}
          <div className="relative overflow-hidden bg-white p-5 rounded-3xl border border-green-100 text-left shadow-xl hover:scale-[1.02] transition-all duration-300 group">
            {/* Decorative Circles */}
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-green-500/5 rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {lang === "mr" ? "एकूण कुटुंबे" : "Total Families"}
                </p>
                <div className="p-1.5 rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-black text-green-700 tracking-tight">{families.length}</p>
              <p className="text-[9px] text-slate-400 mt-1 font-bold">Households</p>
            </div>
          </div>

          {/* Total Population */}
          <div className="relative overflow-hidden bg-white p-5 rounded-3xl border border-blue-100 text-left shadow-xl hover:scale-[1.02] transition-all duration-300 group">
            {/* Decorative Circles */}
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500/10 rounded-full pointer-events-none" />
            <div className="absolute -left-4 -top-4 w-12 h-12 bg-blue-300/10 rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {lang === "mr" ? "एकूण लोकसंख्या" : "Total Population"}
                </p>
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-black text-green-700 tracking-tight">
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
            <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-teal-500/5 rounded-full pointer-events-none" />
            <div className="absolute top-2 right-12 w-6 h-6 bg-teal-500/10 rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {lang === "mr" ? "एकूण पुरुष" : "Total Men"}
                </p>
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-black text-green-700 tracking-tight">
                {families.reduce((acc, f) => acc + (f.menCount || 0), 0)}
              </p>
              <p className="text-[9px] text-slate-400 mt-1 font-bold">Men</p>
            </div>
          </div>

          {/* Total Women */}
          <div className="relative overflow-hidden bg-white p-5 rounded-3xl border border-rose-100 text-left shadow-xl hover:scale-[1.02] transition-all duration-300 group">
            {/* Decorative Circles */}
            <div className="absolute -top-2 -left-2 w-10 h-10 bg-rose-500/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-6 -right-6 w-18 h-18 bg-rose-500/5 rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {lang === "mr" ? "एकूण महिला" : "Total Women"}
                </p>
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-black text-green-700 tracking-tight">
                {families.reduce((acc, f) => acc + (f.womenCount || 0), 0)}
              </p>
              <p className="text-[9px] text-slate-400 mt-1 font-bold">Women</p>
            </div>
          </div>

          {/* Seniors */}
          <div className="relative overflow-hidden bg-white p-5 rounded-3xl border border-amber-100 text-left shadow-xl hover:scale-[1.02] transition-all duration-300 group">
            {/* Decorative Circles */}
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-amber-500/10 rounded-full pointer-events-none" />
            <div className="absolute -top-8 -right-8 w-18 h-18 bg-amber-500/5 rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {lang === "mr" ? "ज्येष्ठ नागरिक" : "Total Seniors"}
                </p>
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-black text-green-700 tracking-tight">
                {families.reduce((acc, f) => acc + (f.seniorCount || 0), 0)}
              </p>
              <p className="text-[9px] text-slate-400 mt-1 font-bold">Seniors (60+)</p>
            </div>
          </div>

          {/* Kids */}
          <div className="relative overflow-hidden bg-white p-5 rounded-3xl border border-purple-100 text-left shadow-xl hover:scale-[1.02] transition-all duration-300 group">
            {/* Decorative Circles */}
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-500/10 rounded-full pointer-events-none" />
            <div className="absolute bottom-4 -right-3 w-6 h-6 bg-purple-500/5 rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {lang === "mr" ? "बालके (0-18)" : "Total Kids (0-18)"}
                </p>
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-black text-green-700 tracking-tight">
                {families.reduce((acc, f) => acc + (f.childrenCount || 0), 0)}
              </p>
              <p className="text-[9px] text-slate-400 mt-1 font-bold">Children (0-18)</p>
            </div>
          </div>
        </div>
      )}

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
                    setFamilyApps([]);
                  }}
                  className="flex items-center gap-2 text-white bg-orange-500 hover:bg-orange-600 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all duration-205 hover:-translate-y-0.5"
                >
                  {lang === "mr" ? "← मागे जा" : "← Back"}
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
                        <label className="block text-slate-500 font-bold mb-1">ईमेल पत्ता *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border border-slate-200 p-2.5 rounded-xl w-full font-semibold outline-none focus:border-green-600 focus:ring-4 focus:ring-green-50"
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
                          <span className="text-slate-400 font-bold">ईमेल (Email):</span>{" "}
                          <span className="font-medium text-slate-800">{selectedFamily.email}</span>
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
                      <div className="overflow-x-auto border border-slate-150 rounded-2xl max-h-[240px] overflow-y-auto pr-1 custom-sass-scrollbar">
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
            /* SEARCH TAB EMPTY STATE GUIDE - Families list removed from here */
            <div className="bg-white rounded-3xl p-8 border border-green-100 shadow-xl text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.125L12 17l-3 2.25m3-2.25l3 2.25M12 17V3M4 20h16a1 1 0 001-1V9a1 1 0 00-1-1h-4m-4 0H4a1 1 0 00-1 1v10a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-black text-slate-800">
                  {lang === "mr" ? "कुटुंब व्यवस्थापन केंद्र" : "Household Management Hub"}
                </h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  {lang === "mr" 
                    ? "कुटुंबांचे शोध घेण्यासाठी, कर भरणे, किंवा QR कोड मुद्रित करण्यासाठी 'सर्व कुटुंब यादी' टॅबवर जा. नवीन कुटुंब जोडण्यासाठी 'नवीन कुटुंब नोंदणी' टॅब वापरा." 
                    : "Navigate to 'All Families List' tab to search, assign taxes, view profiles or print QR codes. Go to 'Register Household' to add a new family."}
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("all");
                    setTaxFilter("all");
                  }}
                  className="bg-green-700 hover:bg-green-800 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md transition hover:-translate-y-0.5"
                >
                  {lang === "mr" ? "सर्व कुटुंब यादी पहा" : "View All Families"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("add")}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md transition hover:-translate-y-0.5"
                >
                  {lang === "mr" ? "नवीन कुटुंब नोंदणी" : "Register Household"}
                </button>
              </div>
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
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">ईमेल पत्ता (OTP साठी) *</label>
              <input
                type="email"
                required
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                {saving ? (lang === "mr" ? "नोंदणी होत आहे..." : "Registering...") : (lang === "mr" ? "कुटुंब नोंदवा" : "Register Family")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. ALL FAMILIES TAB */}
      {activeTab === "all" && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-50 animate-fadeIn space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                सर्व नोंदणीकृत कुटुंबे (All Registered Households)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                ग्रामपंचायतीमध्ये नोंदणीकृत असलेली सर्व कुटुंबे आणि सदस्यांची यादी
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab("search");
                setSearchQuery("");
              }}
              className="flex items-center gap-2 text-white bg-orange-500 hover:bg-orange-600 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all duration-205 hover:-translate-y-0.5"
            >
              {lang === "mr" ? "← मागे जा" : "← Back"}
            </button>
          </div>


          {/* Tax Filter and Search Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex bg-slate-200/60 p-1 rounded-xl w-full sm:w-fit border border-slate-300/30">
              <button
                type="button"
                onClick={() => {
                  setTaxFilter("all");
                  setCurrentPage(1);
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  taxFilter === "all"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {lang === "mr" ? "सर्व कुटुंबे" : "All Households"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTaxFilter("pending");
                  setCurrentPage(1);
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  taxFilter === "pending"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>{lang === "mr" ? "कर आकारणी" : "Pending Tax"}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${taxFilter === "pending" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}>
                  {latestFamilies.filter(f => !f.hasTaxAssigned).length}
                </span>
              </button>
            </div>

            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={lang === "mr" ? "शोधण्यासाठी नाव / ईमेल / कुटुंब ID प्रविष्ट करा..." : "Search name, email or family ID..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl w-full text-xs font-semibold focus:border-green-600 focus:outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-sm text-slate-400">
              {lang === "mr" ? "लोड होत आहे..." : "Loading..."}
            </div>
          ) : latestFamilies.length === 0 ? (
            <p className="text-center text-slate-400 py-10 text-sm">
              {lang === "mr" ? "कोणतेही नोंदणीकृत कुटुंब आढळले नाही." : "No registered families found."}
            </p>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-green-50 text-green-800 font-bold border-b border-green-100 text-xs">
                      <th className="p-4 rounded-l-xl">{lang === "mr" ? "कुटुंब ID" : "Family ID"}</th>
                      <th className="p-4">{lang === "mr" ? "कुटुंब प्रमुख (Head Name)" : "Head of Family Name"}</th>
                      <th className="p-4">{lang === "mr" ? "ईमेल पत्ता" : "Email Address"}</th>
                      <th className="p-4 text-center">{lang === "mr" ? "कर आकारणी" : "Tax Assignment"}</th>
                      <th className="p-4 rounded-r-xl text-center">{lang === "mr" ? "क्रिया" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentItems.map((f) => (
                      <tr key={f._id} className="hover:bg-slate-50/40 transition">
                        <td className="p-4 font-mono font-black text-xs text-green-700">{f.familyId}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8.5 h-8.5 rounded-full bg-green-50 text-green-700 font-black text-xs flex items-center justify-center border border-green-150/30 shadow-inner select-none">
                              {f.mainMemberName ? f.mainMemberName.charAt(0) : "U"}
                            </div>
                            <div>
                              <p className="text-slate-800 font-extrabold text-sm leading-snug">{f.mainMemberName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500 text-xs">{f.email}</td>
                        <td className="p-4 text-center">
                          {f.hasTaxAssigned ? (
                            <span className="inline-flex items-center justify-center gap-1 bg-green-50 text-green-700 border border-green-200 w-24 py-1.5 rounded-xl text-xs font-black select-none">
                              ✓ {lang === "mr" ? "पूर्ण" : "Done"}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                  if (onRedirectToTax) {
                                    onRedirectToTax(f);
                                  }
                              }}
                              title={lang === "mr" ? "थेट कर आकारणी करा" : "Assign Tax Directly"}
                              className="inline-flex items-center justify-center gap-1 bg-red-50 text-red-655 border border-red-200 w-24 py-1.5 rounded-xl text-xs font-black hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all cursor-pointer shadow-sm active:scale-95 select-none animate-pulse"
                            >
                              ✗ {lang === "mr" ? "प्रलंबित" : "Pending"}
                            </button>
                          )}
                        </td>
                        <td className="p-4 flex gap-2 justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("search");
                              handleSelectFamily(f);
                            }}
                            className="border border-green-600 text-green-700 hover:bg-green-700 hover:text-white font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                          >
                            {lang === "mr" ? "पहा" : "Profile"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFamilyForQr(f);
                              setShowQrModal(true);
                            }}
                            className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-sm transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1"
                          >
                            QR कोड
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(f._id)}
                            className="border border-red-200 text-red-650 hover:bg-red-500 hover:text-white font-extrabold px-3 py-1.5 rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5"
                          >
                            {lang === "mr" ? "हटवा" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARD LIST VIEW */}
              <div className="block md:hidden space-y-4">
                {currentItems.map((f) => {
                  const isExpanded = expandedFamilyId === f._id;
                  return (
                    <div
                      key={f._id}
                      className="bg-white border border-green-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                    >
                      {/* Card Header (Always Visible) */}
                      <div
                        onClick={() => setExpandedFamilyId(isExpanded ? null : f._id)}
                        className="flex justify-between items-center cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-50 text-green-700 font-black text-xs flex items-center justify-center border border-green-150/30 shadow-inner select-none">
                            {f.mainMemberName ? f.mainMemberName.charAt(0) : "U"}
                          </div>
                          <div>
                            <p className="text-slate-800 font-extrabold text-sm leading-snug">{f.mainMemberName}</p>
                            <p className="text-[10px] font-mono font-black text-green-600 mt-0.5">{f.familyId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {f.hasTaxAssigned ? (
                            <span className="inline-flex items-center justify-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-xl text-[10px] font-black">
                              ✓ {lang === "mr" ? "पूर्ण" : "Done"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-xl text-[10px] font-black animate-pulse">
                              ✗ {lang === "mr" ? "प्रलंबित" : "Pending"}
                            </span>
                          )}
                          <span className="text-slate-400 text-xs transition-transform duration-200">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>
                      </div>

                      {/* Card Details (Visible on click) */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-bold">{lang === "mr" ? "ईमेल पत्ता:" : "Email:"}</span>
                            <span className="text-slate-700 font-bold">{f.email}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {!f.hasTaxAssigned && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (onRedirectToTax) {
                                    onRedirectToTax(f);
                                  }
                                }}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2 px-3 rounded-xl text-xs shadow-sm transition"
                              >
                                {lang === "mr" ? "कर आकारणी" : "Assign Tax"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab("search");
                                handleSelectFamily(f);
                              }}
                              className="flex-1 border border-green-600 text-green-700 hover:bg-green-700 hover:text-white font-extrabold py-2 px-3 rounded-xl text-xs shadow-sm transition text-center"
                            >
                              {lang === "mr" ? "पहा" : "Profile"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFamilyForQr(f);
                                setShowQrModal(true);
                              }}
                              className="flex-1 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-extrabold py-2 px-3 rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-1"
                            >
                              {lang === "mr" ? "QR कोड" : "QR Code"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(f._id)}
                              className="border border-red-200 text-red-650 hover:bg-red-500 hover:text-white font-extrabold py-2 px-3 rounded-xl text-xs transition"
                            >
                              {lang === "mr" ? "हटवा" : "Delete"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-bold">
                    {lang === "mr" 
                      ? `एकूण ${filteredFamiliesAll.length} पैकी ${indexOfFirstItem + 1} ते ${Math.min(indexOfLastItem, latestFamilies.length)} कुटुंबे दर्शवत आहे` 
                      : `Showing ${indexOfFirstItem + 1} to ${Math.min(indexOfLastItem, latestFamilies.length)} of ${filteredFamiliesAll.length} families`}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className="px-3.5 py-2 rounded-xl text-xs font-extrabold border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {lang === "mr" ? "← पूर्वी" : "← Prev"}
                    </button>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNum = index + 1;
                      if (totalPages > 6 && Math.abs(pageNum - currentPage) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return <span key={pageNum} className="px-2 py-1 text-slate-400 text-xs">...</span>;
                        }
                        return null;
                      }
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-xl text-xs font-black transition ${
                            currentPage === pageNum
                              ? "bg-green-700 text-white shadow-md"
                              : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className="px-3.5 py-2 rounded-xl text-xs font-extrabold border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {lang === "mr" ? "पुढील →" : "Next →"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {showQrModal && selectedFamilyForQr && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-green-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Green Header */}
            <div className="bg-green-900 px-6 py-4 flex items-center justify-between text-white border-b border-green-800">
              <h4 className="text-base font-black tracking-wide flex items-center gap-1.5">
                <span className="text-lg">📱</span> कुटुंब QR कोड (Family QR)
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false);
                  setSelectedFamilyForQr(null);
                }}
                className="text-white/80 hover:text-white text-2xl font-bold transition leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 text-center space-y-5">
              {/* Family details with orange border */}
              <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 text-center">
                <h5 className="font-black text-slate-800 text-sm leading-snug">
                  {selectedFamilyForQr.mainMemberName}
                </h5>
                <p className="text-[10px] font-black text-orange-650 mt-1 tracking-wider uppercase">
                  कुटुंब ID: {selectedFamilyForQr.familyId} | घर क्र: {selectedFamilyForQr.houseNumber}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `${window.location.origin}/qr-partial?familyId=${selectedFamilyForQr.familyId}&token=${selectedFamilyForQr.qrToken}`
                  )}`}
                  alt="Family QR Code"
                  className="w-44 h-44 object-contain shadow-md rounded-xl bg-white p-2.5 border border-slate-200"
                />
                <p className="text-[10px] font-black text-green-800 mt-4 tracking-wider uppercase bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  स्कॅन करा (Scan to View)
                </p>
              </div>

              {/* Bottom buttons: Green and Orange */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                      `${window.location.origin}/qr-partial?familyId=${selectedFamilyForQr.familyId}&token=${selectedFamilyForQr.qrToken}`
                    )}`;
                    window.open(url, "_blank");
                  }}
                  className="flex-1 bg-green-700 hover:bg-green-800 text-white font-extrabold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 hover:-translate-y-0.5 transform duration-150"
                >
                  🖨️ {lang === "mr" ? "मुद्रित करा" : "Print"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQrModal(false);
                    setSelectedFamilyForQr(null);
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-650 text-white font-extrabold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 hover:-translate-y-0.5 transform duration-150"
                >
                  {lang === "mr" ? "बंद करा" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
