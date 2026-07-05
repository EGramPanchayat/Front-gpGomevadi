import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axioesInstance from "../utils/axioesInstance";
import { useLanguage } from "../utils/LanguageContext";

const TAX_TYPE_LABELS = {
  samanya_water: { mr: "सामान्य पाणीपट्टी", en: "General Water Tax" },
  vishesh_water: { mr: "विशेष पाणीपट्टी", en: "Special Water Tax" },
  house: { mr: "घरपट्टी", en: "House Tax" },
  health: { mr: "आरोग्य कर", en: "Health Tax" },
  electricity: { mr: "वीज कर", en: "Electricity Tax" },
  fine: { mr: "दंड", en: "Fine / Penalty" },
};

// Helper: Get current financial year start year
// If month >= April (3 in 0-indexed), current year is the start; else previous year
const getCurrentFinancialYear = () => {
  const now = new Date();
  return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
};

// Generate financial year options (past 5 + next 2)
const getFinancialYearOptions = () => {
  const current = getCurrentFinancialYear();
  const years = [];
  for (let i = current + 2; i >= current - 5; i--) {
    years.push(i);
  }
  return years;
};

// Notification type labels & icons
const notifTypeLabels = {
  tax_assigned: { label: "नवीन कर", color: "bg-blue-100 text-blue-800" },
  tax_updated: { label: "कर अद्ययावत", color: "bg-amber-100 text-amber-800" },
  payment_received: { label: "भरणा जमा", color: "bg-green-100 text-green-800" },
  fine_assigned: { label: "दंड आकारणी", color: "bg-red-100 text-red-800" },
  bulk_release: { label: "वार्षिक कर", color: "bg-purple-100 text-purple-800" },
  auto_release: { label: "स्वयंचलित कर", color: "bg-indigo-100 text-indigo-800" },
};

export default function VmsTaxesAdmin({ preselectedFamily, clearPreselectedFamily }) {
  const { lang } = useLanguage();
  const taxTypeLabel = (type) => TAX_TYPE_LABELS[type]?.[lang] || TAX_TYPE_LABELS[type]?.mr || type;
  const [activeTab, setActiveTab] = useState("stats");
  const [families, setFamilies] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stats states
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Auto Release Scheduler states
  const [schedule, setSchedule] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [togglingSchedule, setTogglingSchedule] = useState(false);

  // Assign individual tax states
  const [taxType, setTaxType] = useState("house");
  const [year, setYear] = useState(getCurrentFinancialYear());
  const [amount, setAmount] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Notifications states
  const [notifications, setNotifications] = useState([]);
  const [notifTotal, setNotifTotal] = useState(0);
  const [notifPage, setNotifPage] = useState(1);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Drill-down pending families states
  const [selectedYearPending, setSelectedYearPending] = useState(null);
  const [pendingFamilies, setPendingFamilies] = useState([]);
  const [loadingPendingFamilies, setLoadingPendingFamilies] = useState(false);

  // Selected ledger year & inline fine states
  const [selectedLedgerYear, setSelectedLedgerYear] = useState(getCurrentFinancialYear());
  const [inlineFineAmount, setInlineFineAmount] = useState("");
  const [inlineFineReason, setInlineFineReason] = useState("");
  const [showFineReasonModal, setShowFineReasonModal] = useState(false);
  const [assigningInlineFine, setAssigningInlineFine] = useState(false);

  // Record payment states
  const [payAmount, setPayAmount] = useState("");
  const [selectedBillId, setSelectedBillId] = useState("");
  const [recording, setRecording] = useState(false);

  // Offline category payment states
  const [offlineCategory, setOfflineCategory] = useState("water");
  const [offlineCatAmount, setOfflineCatAmount] = useState("");
  const [recordingCat, setRecordingCat] = useState(false);

  // Searchable family dropdown state
  const [familySearch, setFamilySearch] = useState("");
  const [showFamilyDropdown, setShowFamilyDropdown] = useState(false);
  const familyDropdownRef = React.useRef(null);

  // Close family dropdown on outside click
  React.useEffect(() => {
    const handler = (e) => {
      if (familyDropdownRef.current && !familyDropdownRef.current.contains(e.target)) {
        setShowFamilyDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load Families list for ledger dropdown
  useEffect(() => {
    axioesInstance
      .get("/admin/families")
      .then((res) => {
        setFamilies(res.data || []);
        if (preselectedFamily) {
          setSelectedFamilyId(preselectedFamily.familyId);
          setActiveTab("ledger");
          if (clearPreselectedFamily) {
            clearPreselectedFamily();
          }
        } else if (res.data && res.data.length > 0) {
          setSelectedFamilyId(res.data[0].familyId);
        }
      })
      .catch(() => {
        toast.error("Failed to load family list");
      });
  }, []);

  // Update selected ledger if preselected family changes during dashboard lifecycle
  useEffect(() => {
    if (preselectedFamily) {
      setSelectedFamilyId(preselectedFamily.familyId);
      setActiveTab("ledger");
      if (clearPreselectedFamily) {
        clearPreselectedFamily();
      }
    }
  }, [preselectedFamily]);

  // Fetch Global Stats
  const fetchGlobalStats = () => {
    setLoadingStats(true);
    axioesInstance
      .get("/admin/taxes/stats")
      .then((res) => {
        setStats(res.data);
      })
      .catch(() => {
        toast.error("Failed to load tax collection statistics");
      })
      .finally(() => {
        setLoadingStats(false);
      });
  };

  const fetchSchedule = () => {
    setLoadingSchedule(true);
    axioesInstance
      .get("/admin/taxes/schedule")
      .then((res) => {
        setSchedule(res.data);
      })
      .catch(() => {
        toast.error("Failed to load tax schedule");
      })
      .finally(() => {
        setLoadingSchedule(false);
      });
  };

  const fetchPendingFamilies = (year) => {
    setSelectedYearPending(year);
    setLoadingPendingFamilies(true);
    axioesInstance
      .get(`/admin/taxes/pending-families/${year}`)
      .then((res) => {
        setPendingFamilies(res.data || []);
      })
      .catch(() => {
        toast.error("Failed to load pending families list");
      })
      .finally(() => {
        setLoadingPendingFamilies(false);
      });
  };

  useEffect(() => {
    if (activeTab === "stats") {
      fetchGlobalStats();
      fetchSchedule();
    }
  }, [activeTab]);

  // Fetch Individual family taxes
  const fetchTaxes = (famId) => {
    if (!famId) return;
    setLoading(true);
    axioesInstance
      .get(`/taxes/${famId}`)
      .then((res) => {
        setBills(res.data.bills || []);
      })
      .catch(() => {
        toast.error("Failed to load tax details");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedFamilyId && activeTab === "ledger") {
      fetchTaxes(selectedFamilyId);
    }
  }, [selectedFamilyId, activeTab]);

  // Fetch Payments logs
  const fetchPayments = () => {
    setLoading(true);
    axioesInstance
      .get("/admin/payments/logs")
      .then((res) => {
        setPayments(res.data || []);
      })
      .catch(() => {
        toast.error("Failed to load transaction history");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (activeTab === "logs") {
      fetchPayments();
    }
  }, [activeTab]);

  // Fetch Admin Notifications
  const fetchNotifications = (page = 1) => {
    setLoadingNotifs(true);
    axioesInstance
      .get(`/admin/notifications?page=${page}&limit=30`)
      .then((res) => {
        setNotifications(res.data.notifications || []);
        setNotifTotal(res.data.total || 0);
        setNotifPage(res.data.page || 1);
      })
      .catch(() => {
        toast.error("सूचना लोड करण्यात अपयश (Failed to load notifications)");
      })
      .finally(() => {
        setLoadingNotifs(false);
      });
  };

  useEffect(() => {
    if (activeTab === "notifications") {
      fetchNotifications(1);
    }
  }, [activeTab]);

  // Assign individual tax
  const handleAssignTax = async (e) => {
    e.preventDefault();
    if (!selectedFamilyId || !taxType || !year || !amount) {
      return toast.error("Please fill all required fields");
    }

    setAssigning(true);
    try {
      await axioesInstance.post("/admin/taxes/assign", {
        familyId: selectedFamilyId,
        taxType,
        year: Number(year),
        amount: Number(amount),
      });
      toast.success("Tax assigned successfully!");
      setAmount("");
      fetchTaxes(selectedFamilyId);
    } catch (err) {
      toast.error(err.response?.data?.error || "Error assigning tax");
    } finally {
      setAssigning(false);
    }
  };

  // Record cash payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedBillId || !payAmount) {
      return toast.error("Please select a bill and enter payment amount");
    }

    setRecording(true);
    try {
      await axioesInstance.post("/admin/payments/offline", {
        billId: selectedBillId,
        amountPaid: Number(payAmount),
      });
      toast.success("Offline payment recorded successfully!");
      setPayAmount("");
      setSelectedBillId("");
      fetchTaxes(selectedFamilyId);
    } catch (err) {
      toast.error(err.response?.data?.error || "Error recording payment");
    } finally {
      setRecording(false);
    }
  };

  // Toggle tax schedule
  const handleToggleSchedule = () => {
    setTogglingSchedule(true);
    axioesInstance
      .post("/admin/taxes/schedule/toggle")
      .then((res) => {
        setSchedule(res.data);
        toast.success(res.data.isPaused ? "स्वयंचलित कर आकारणी तात्पुरती थांबवली आहे (Auto-release paused)" : "स्वयंचलित कर आकारणी सक्रिय केली आहे (Auto-release active)");
      })
      .catch(() => {
        toast.error("Failed to toggle schedule state");
      })
      .finally(() => {
        setTogglingSchedule(false);
      });
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden bg-green-900 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Solid Designer Circles (Low Opacity & Behind Content) */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-600/30 rounded-full pointer-events-none z-0"></div>
        <div className="absolute -bottom-24 -left-16 w-56 h-56 bg-orange-500/30 rounded-full pointer-events-none z-0"></div>
        <div className="absolute top-1/2 left-[60%] w-16 h-16 bg-yellow-400/30 rounded-full -translate-y-1/2 pointer-events-none z-0"></div>

        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white drop-shadow-md">कर भरणा आणि महसूल केंद्र (Village Tax Hub)</h2>
          <p className="text-sm text-green-100 font-semibold mt-1">ग्रामपंचायत कर संकलन, थकबाकी अहवाल आणि वार्षिक कर आकारणी नियंत्रण पॅनेल</p>
        </div>

        {/* TAB CONTROLS */}
        <div className="relative z-10 flex bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0">
          <button
            onClick={() => {
              setActiveTab("stats");
              setSelectedYearPending(null);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition ${activeTab === "stats"
                ? "bg-green-700 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            आकडेवारी आणि नवीन कर
          </button>
          <button
            onClick={() => {
              setActiveTab("ledger");
              setSelectedYearPending(null);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition ${activeTab === "ledger"
                ? "bg-green-700 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            कुटुंबनिहाय खाते
          </button>
          <button
            onClick={() => {
              setActiveTab("logs");
              setSelectedYearPending(null);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition ${activeTab === "logs"
                ? "bg-green-700 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            व्यवहार लॉग
          </button>
          <button
            onClick={() => {
              setActiveTab("notifications");
              setSelectedYearPending(null);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition ${activeTab === "notifications"
                ? "bg-green-700 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            सूचना
          </button>
        </div>
      </div>

      {/* ──────────────── TAB 1: STATS & RELEASE ──────────────── */}
      {activeTab === "stats" && (
        <div className="space-y-8">
          {selectedYearPending !== null ? (() => {
            // Find stats for the selected year from the yearlyBreakdown array
            const yb = stats?.yearlyBreakdown?.find((y) => y.year === selectedYearPending) || {};
            const waterVasuli = yb.waterPaid || 0;
            const houseVasuli = yb.housePaid || 0;
            const fineVasuli = yb.finePaid || 0;
            const totalVasuli = waterVasuli + houseVasuli + fineVasuli;

            return (
            <div className="space-y-6">
              {/* YEAR STATS CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total */}
                <div className="relative overflow-hidden bg-gradient-to-br from-green-700 to-emerald-800 p-5 rounded-3xl text-white shadow-xl hover:scale-[1.02] transition">
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full pointer-events-none z-0"></div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-green-100 relative z-10">एकूण वसुली</p>
                  <p className="text-2xl font-black mt-1 relative z-10">₹{totalVasuli.toLocaleString()}</p>
                  <p className="text-[9px] text-green-200 mt-1 font-bold relative z-10">Total Collected ({selectedYearPending}–{Number(selectedYearPending)+1})</p>
                </div>

                {/* Water */}
                <div className="relative overflow-hidden bg-white p-5 rounded-3xl border border-blue-100 shadow-xl hover:scale-[1.02] transition">
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/10 rounded-full pointer-events-none z-0"></div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-400 relative z-10">पाणीपट्टी वसुली</p>
                  <p className="text-2xl font-black mt-1 text-slate-800 relative z-10">₹{waterVasuli.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold relative z-10">Water Tax (सामान्य + विशेष)</p>
                </div>

                {/* House */}
                <div className="relative overflow-hidden bg-white p-5 rounded-3xl border border-teal-100 shadow-xl hover:scale-[1.02] transition">
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-teal-500/10 rounded-full pointer-events-none z-0"></div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-teal-500 relative z-10">घरपट्टी + इतर वसुली</p>
                  <p className="text-2xl font-black mt-1 text-slate-800 relative z-10">₹{houseVasuli.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold relative z-10">House + Health + Electricity</p>
                </div>

                {/* Fine */}
                <div className="relative overflow-hidden bg-white p-5 rounded-3xl border border-amber-100 shadow-xl hover:scale-[1.02] transition">
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/10 rounded-full pointer-events-none z-0"></div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-500 relative z-10">दंड वसुली</p>
                  <p className="text-2xl font-black mt-1 text-slate-800 relative z-10">₹{fineVasuli.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold relative z-10">Late Penalty Fines</p>
                </div>
              </div>

              {/* DRILL-DOWN PANEL FOR PENDING FAMILIES */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-50">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-green-800">
                      थकीत कुटुंबे यादी - वर्ष {selectedYearPending} - {Number(selectedYearPending) + 1}
                    </h3>
                    <p className="text-xs text-gray-400 font-semibold mt-1">
                      या वर्षातील प्रलंबित घरपट्टी, पाणीपट्टी आणि दंड असलेले कुटुंब
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedYearPending(null)}
                    className="bg-green-700 hover:bg-green-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition duration-300"
                  >
                     {lang === "mr" ? "मागे जा" : "Back"}
                  </button>
                </div>

              {loadingPendingFamilies ? (
                <p className="text-center text-gray-500 py-12 font-bold font-sans">थकीत कुटुंबे यादी लोड होत आहे...</p>
              ) : pendingFamilies.length === 0 ? (
                <p className="text-center text-gray-550 py-12 font-bold font-sans">या वर्षासाठी थकबाकी असलेले कोणतेही कुटुंब आढळले नाही.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-green-50 text-green-800 font-bold border-b border-green-100">
                        <th className="p-4 rounded-l-xl">कुटुंब ID</th>
                        <th className="p-4">कुटुंब प्रमुख (Head Name)</th>
                        <th className="p-4">घर क्र. व मोबाईल</th>
                        <th className="p-4">पाणीपट्टी थकबाकी</th>
                        <th className="p-4">घरपट्टी थकबाकी</th>
                        <th className="p-4">दंड (Fine)</th>
                        <th className="p-4">एकूण थकबाकी</th>
                        <th className="p-4 rounded-r-xl">क्रिया (Action)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pendingFamilies.map((fam) => (
                        <tr key={fam.familyId} className="hover:bg-gray-50/50 transition">
                          <td className="p-4 font-mono font-bold text-green-700">{fam.familyId}</td>
                          <td className="p-4 font-bold text-gray-800">{fam.headName}</td>
                          <td className="p-4 text-xs font-semibold text-gray-550">
                            घर क्र: {fam.houseNumber}
                            <p className="mt-0.5 font-sans font-semibold text-gray-400">{fam.mobileNumber}</p>
                          </td>
                          <td className="p-4 font-bold text-gray-700">₹{fam.waterPending}</td>
                          <td className="p-4 font-bold text-gray-700">₹{fam.housePending}</td>
                          <td className="p-4 text-amber-600 font-black">₹{fam.finePending}</td>
                          <td className="p-4 text-red-650 font-black">₹{fam.totalPending}</td>
                          <td className="p-4">
                            <button
                              onClick={() => {
                                setSelectedFamilyId(fam.familyId);
                                setYear(selectedYearPending);
                                setTaxType("fine");
                                setSelectedLedgerYear(selectedYearPending);
                                setActiveTab("ledger");
                                setSelectedYearPending(null);
                                toast.success(`Redirected to Ledger. Pre-filled Year ${selectedYearPending} & Tax Type "Fine"`);
                              }}
                              className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg shadow whitespace-nowrap transition duration-300"
                            >
                              {lang === "mr" ? "दंड आकारणी" : "View Ledger & Assign Fine"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </div>
            </div>
          );
          })() : (
            /* STATS OVERVIEW CARDS & REPORT TABLE */
            <>
              {loadingStats ? (
                <div className="text-center py-12 text-gray-500 font-bold">आकडेवारी लोड होत आहे... (Loading statistics)</div>
              ) : (
                <>


                  {/* PAST YEARS THAKBAKI BREAKDOWN */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Yearly breakdown table (2/3 width) */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xl border border-green-50">
                      <div className="border-b pb-3 mb-4">
                        <h3 className="text-lg font-bold text-green-800">वार्षिक थकबाकी अहवाल (Yearly Outstanding Report)</h3>
                        <p className="text-xs text-gray-400 font-semibold mt-1">मागील वर्षांचे एकूण प्रलंबित कर तपशील (गांव बेरीज / Whole Village Sum)</p>
                      </div>

                      {stats?.yearlyBreakdown?.length === 0 ? (
                        <p className="text-center text-gray-500 py-12 font-bold">पद्धतीमध्ये कोणतेही प्रलंबित कर नाहीत.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm border-collapse">
                            <thead>
                              <tr className="bg-green-50 text-green-800 font-bold border-b border-green-100">
                                <th className="p-4 rounded-l-xl">वर्ष (Year)</th>
                                <th className="p-4">१) पाणीपट्टी थकबाकी (सामान्य+विशेष)</th>
                                <th className="p-4">२) घरपट्टी थकबाकी (घर+आरोग्य+वीज)</th>
                                <th className="p-4">एकूण प्रलंबित (Total Due)</th>
                                <th className="p-4 rounded-r-xl">क्रिया (Action)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {stats?.yearlyBreakdown?.map((yr) => {
                                const waterPending = yr.waterAmount - yr.waterPaid;
                                const housePending = yr.houseAmount - yr.housePaid;
                                const totalPending = waterPending + housePending + (yr.fineAmount - yr.finePaid);

                                return (
                                  <tr key={yr.year} className="hover:bg-gray-50/50 transition">
                                    <td className="p-4 font-black text-gray-800">{yr.year}</td>
                                    <td className="p-4">
                                      {waterPending <= 0 ? (
                                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">Nil (निरंक)</span>
                                      ) : (
                                        <div className="font-bold text-gray-700">
                                          <span>₹{waterPending}</span>
                                          <p className="text-[9px] text-gray-400 font-normal mt-0.5">एकूण: ₹{yr.waterAmount} | वसूल: ₹{yr.waterPaid}</p>
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-4">
                                      {housePending <= 0 ? (
                                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">Nil (निरंक)</span>
                                      ) : (
                                        <div className="font-bold text-gray-700">
                                          <span>₹{housePending}</span>
                                          <p className="text-[9px] text-gray-400 font-normal mt-0.5">एकूण: ₹{yr.houseAmount} | वसूल: ₹{yr.housePaid}</p>
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-4">
                                      {totalPending <= 0 ? (
                                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">सर्व निरंक (All Clear)</span>
                                      ) : (
                                        <span className="font-black text-red-650">₹{totalPending}</span>
                                      )}
                                    </td>
                                    <td className="p-4">
                                      <button
                                        onClick={() => fetchPendingFamilies(yr.year)}
                                        className="text-xs bg-green-700 hover:bg-green-800 text-white font-bold px-3 py-1.5 rounded-lg shadow transition duration-300"
                                      >
                                        {lang === "mr" ? "यादी पहा" : "View List"}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* AUTO-RELEASE TAX SCHEDULE CARD (1/3 width) */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-50 flex flex-col justify-between">
                      <div>
                        <div className="border-b pb-3 mb-4">
                          <h3 className="text-lg font-bold text-green-800">स्वयंचलित कर वेळापत्रक (Auto-Release Schedule)</h3>
                          <p className="text-xs text-gray-400 font-semibold mt-1">दरवर्षी १ एप्रिल रोजी चालू दरानुसार स्वयंचलित कर आकारणी</p>
                        </div>

                        <div className="space-y-4">
                          {/* Next schedule display */}
                          <div className={`p-4 rounded-2xl border transition ${schedule?.isPaused
                              ? "bg-rose-50/50 border-rose-100 text-rose-950"
                              : "bg-emerald-50/50 border-emerald-100 text-emerald-950"
                            }`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${schedule?.isPaused ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                                }`} />
                              <p className="text-xs font-black uppercase tracking-wider">
                                {schedule?.isPaused ? "तात्पुरता थांबवला (PAUSED)" : "सक्रिय आणि नियोजित (ACTIVE)"}
                              </p>
                            </div>
                            <p className="text-lg font-black font-sans mt-2">
                              वर्ष {schedule?.nextReleaseYear} - {schedule?.nextReleaseYear ? schedule.nextReleaseYear + 1 : ""}
                            </p>
                            <p className="text-[10px] text-gray-450 mt-1 font-bold">
                              {schedule?.isPaused
                                ? "स्वयंचलित कर आकारणी थांबवली आहे. १ एप्रिल रोजी कर आपोआप लागू होणार नाही."
                                : "१ एप्रिल रोजी मागील वर्षाच्या चालू दरानुसार सर्व कुटुंबांना कर आपोआप लागू होईल."
                              }
                            </p>
                          </div>

                          {/* Earlier release history */}
                          <div className="pt-2">
                            <p className="text-xs font-extrabold text-gray-550 mb-2">मागील वर्षांचे प्रकाशन (Release History):</p>
                            {(!schedule?.history || schedule.history.length === 0) ? (
                              <p className="text-[11px] text-gray-450 italic">इतिहास उपलब्ध नाही.</p>
                            ) : (
                              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {schedule.history.slice().reverse().map((h) => (
                                  <div key={h._id} className="flex justify-between items-center bg-gray-50/60 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                                    <span className="text-xs font-bold text-gray-700">वर्ष {h.year} - {h.year + 1}</span>
                                    <span className="text-[10px] text-gray-400 font-sans font-semibold">
                                      {new Date(h.releasedAt).toLocaleDateString()} रोजी लागू
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleToggleSchedule}
                        disabled={togglingSchedule}
  className={`w-full mt-4 font-black py-3 rounded-xl shadow transition duration-300 ${schedule?.isPaused
      ? "bg-orange-500 hover:bg-orange-600 text-white"
      : "bg-green-700 hover:bg-green-800 text-white"
    }`}
                      >
                        {togglingSchedule
                          ? "प्रक्रिया सुरू..."
                          : schedule?.isPaused
                            ? "स्वयंचलित कर सुरू करा / Resume"
                            : "स्वयंचलित कर थांबवा / Pause"
                        }
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ──────────────── TAB 2: LEDGER (INDIVIDUAL ACCOUNT) ──────────────── */}
      {activeTab === "ledger" && (
        <div className="space-y-8">
          {/* HOUSEHOLD SELECTION HEADER */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-green-700">कुटुंबनिहाय खाते (Household Accounts)</h3>
              <p className="text-sm text-gray-500">कुटुंब निवडून कर लागू करा किंवा पेमेंट नोंदवा</p>
            </div>
            {/* SEARCHABLE FAMILY DROPDOWN */}
            <div className="w-full md:w-96" ref={familyDropdownRef}>
              <label className="block text-xs font-bold text-gray-700 mb-1">कुटुंब निवडा (Search by Name / Phone / ID):</label>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Select Family"
                  aria-expanded={showFamilyDropdown}
                  onClick={() => setShowFamilyDropdown((v) => !v)}
                  className="w-full flex items-center justify-between border-2 border-green-600 p-2.5 rounded-xl text-sm font-bold text-gray-800 bg-white text-left"
                >
                  <span className="truncate">
                    {selectedFamilyId
                      ? (() => {
                          const f = families.find((x) => x.familyId === selectedFamilyId);
                          return f ? `${f.familyId} - ${f.mainMemberName} (${f.houseNumber})` : selectedFamilyId;
                        })()
                      : "कुटुंब निवडा..."}
                  </span>
                  <svg className="w-4 h-4 ml-2 text-green-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showFamilyDropdown && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-green-200 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                        </svg>
                        <input
                          autoFocus
                          type="text"
                          placeholder="नाव, फोन, घर क्र. शोधा..."
                          value={familySearch}
                          onChange={(e) => setFamilySearch(e.target.value)}
                          className="bg-transparent flex-1 text-sm outline-none font-semibold text-gray-800"
                        />
                      </div>
                    </div>
                    {/* Results */}
                    <div className="max-h-56 overflow-y-auto">
                      {families
                        .filter((f) => {
                          const q = familySearch.toLowerCase();
                          return (
                            !q ||
                            f.mainMemberName?.toLowerCase().includes(q) ||
                            f.mobileNumber?.includes(q) ||
                            f.familyId?.toLowerCase().includes(q) ||
                            f.houseNumber?.toLowerCase().includes(q)
                          );
                        })
                        .map((f) => (
                          <button
                            key={f._id}
                            type="button"
                            onClick={() => {
                              setSelectedFamilyId(f.familyId);
                              setShowFamilyDropdown(false);
                              setFamilySearch("");
                            }}
                            className={`w-full text-left px-4 py-2.5 hover:bg-green-50 transition text-sm ${
                              selectedFamilyId === f.familyId ? "bg-green-50 font-black text-green-800" : "text-gray-700 font-semibold"
                            }`}
                          >
                            <span className="font-black text-green-700">{f.familyId}</span> — {f.mainMemberName}
                            <span className="block text-[10px] text-gray-400">{f.houseNumber} | {f.mobileNumber}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ASSIGN TAX FORM */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-50">
              <h4 className="text-lg font-bold text-green-700 mb-4 border-b pb-2">नवीन कर लागू करा (Assign Tax)</h4>
              <form onSubmit={handleAssignTax} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">कर प्रकार (Tax Type)</label>
                    <select
                      value={taxType}
                      onChange={(e) => setTaxType(e.target.value)}
                      className="border border-green-600 p-2 rounded-xl w-full text-sm outline-none font-semibold"
                    >
                      <option value="samanya_water">सामान्य पाणीपट्टी (General Water Tax)</option>
                      <option value="vishesh_water">विशेष पाणीपट्टी (Special Water Tax)</option>
                      <option value="house">घरपट्टी (House Tax)</option>
                      <option value="health">आरोग्य कर (Health Tax)</option>
                      <option value="electricity">वीज कर (Electricity Tax)</option>
                      <option value="fine">दंड (Fine / Penalty)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">आकारणी वर्ष (Financial Year)</label>
                    <select
                      required
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="border border-green-600 p-2 rounded-xl w-full text-sm outline-none font-semibold"
                    >
                      {getFinancialYearOptions().map((yr) => (
                        <option key={yr} value={yr}>
                          {yr} - {yr + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">कर रक्कम (Amount) *</label>
                    <input
                      type="number"
                      required
                      placeholder="उदा. ५००"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="border border-green-600 p-2.5 rounded-xl w-full text-sm outline-none font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={assigning}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl shadow transition"
                >
                  {assigning ? "Please wait..." : "Assign Tax"}
                </button>
              </form>
            </div>

            {/* OFFLINE PAYMENT CARD */}
            <div className="bg-orange-50 rounded-3xl p-6 shadow-xl border border-orange-100">
              <h4 className="text-lg font-bold text-orange-700 mb-4 border-b border-orange-200 pb-2">
                ऑफलाइन पेमेंट नोंदवा <span className="font-semibold text-orange-500">(Record Offline Payment)</span>
              </h4>

              <div className="space-y-4">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">पेमेंट गट (Payment Category)</label>
                  <select
                    value={offlineCategory}
                    onChange={(e) => setOfflineCategory(e.target.value)}
                    className="border border-orange-500 p-2 rounded-xl w-full text-sm outline-none font-semibold bg-white text-gray-800"
                  >
                    <option value="water">💧 पाणीपट्टी — थकबाकी + चालू (सामान्य + विशेष)</option>
                    <option value="house">🏠 घरपट्टी + वीजकर + आरोग्य कर — थकबाकी + चालू</option>
                    <option value="fine">⚠️ दंड (Fines)</option>
                  </select>
                </div>

                {/* Outstanding Balance */}
                {selectedFamilyId && (() => {
                  const catTypes = {
                    water: ["samanya_water", "vishesh_water"],
                    house: ["house", "health", "electricity"],
                    fine: ["fine"],
                  }[offlineCategory] || [];
                  const total = bills
                    .filter((b) => catTypes.includes(b.taxType) && b.status !== "paid")
                    .reduce((sum, b) => sum + (b.amount - (b.paidAmount || 0)), 0);
                  return (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">एकूण थकबाकी (Total Outstanding)</label>
                      <div className="border border-orange-500 p-2.5 rounded-xl w-full text-sm font-black bg-white flex items-center justify-between text-gray-800">
                        <span>₹{total.toLocaleString()}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          {total > 0 ? "थकबाकी आहे" : "निरंक ✓"}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">पेमेंट रक्कम (Payment Amount) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="उदा. ५००"
                    value={offlineCatAmount}
                    onChange={(e) => setOfflineCatAmount(e.target.value)}
                    className="border border-orange-500 p-2.5 rounded-xl w-full text-sm outline-none font-semibold bg-white text-gray-800 placeholder-gray-400"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  disabled={recordingCat || !selectedFamilyId || !offlineCatAmount}
                  onClick={async () => {
                    if (!selectedFamilyId || !offlineCatAmount) return toast.error("कुटुंब निवडा आणि रक्कम टाका");
                    setRecordingCat(true);
                    try {
                      const res = await axioesInstance.post("/admin/payments/offline-category", {
                        familyId: selectedFamilyId,
                        category: offlineCategory,
                        amount: Number(offlineCatAmount),
                      });
                      toast.success(res.data.message || "Payment recorded!");
                      setOfflineCatAmount("");
                      fetchTaxes(selectedFamilyId);
                      fetchGlobalStats();
                    } catch (err) {
                      toast.error(err?.response?.data?.message || "Payment failed");
                    } finally {
                      setRecordingCat(false);
                    }
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow transition"
                >
                  {recordingCat ? "Processing..." : "पेमेंट नोंदवा / Record Payment"}
                </button>
              </div>
            </div>
          </div>

          {/* BILLS LEDGER BY FINANCIAL YEAR */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-50 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
              <div>
                <h4 className="text-lg font-bold text-green-700">वार्षिक कर तपशील (Yearly Tax Details)</h4>
                <p className="text-xs text-gray-400">आकारणी वर्ष निवडून थकीत, भरलेली रक्कम आणि दंड आकारणी व्यवस्थापित करा</p>
              </div>
              <div className="w-full sm:w-60">
                <label className="block text-xs font-bold text-gray-700 mb-1">आकारणी वर्ष निवडा (Select Financial Year):</label>
                <select
                  value={selectedLedgerYear}
                  onChange={(e) => setSelectedLedgerYear(Number(e.target.value))}
                  className="border border-green-600 p-2 rounded-xl w-full text-sm outline-none font-bold text-gray-800"
                >
                  {(() => {
                    // Collect all unique years from bills, or ensure current and previous 5 years are available
                    const uniqueYears = [...new Set(bills.map((b) => b.year))];
                    const currentYear = new Date().getFullYear();
                    for (let i = 0; i < 5; i++) {
                      if (!uniqueYears.includes(currentYear - i)) {
                        uniqueYears.push(currentYear - i);
                      }
                    }
                    return uniqueYears
                      .sort((a, b) => b - a)
                      .map((yr) => (
                        <option key={yr} value={yr}>
                          वर्ष {yr} - {yr + 1}
                        </option>
                      ));
                  })()}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-6 text-gray-500 font-bold font-sans">लोड होत आहे...</div>
            ) : (() => {
              const yearBills = bills.filter((b) => b.year === Number(selectedLedgerYear));

              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Table of Bills for selected year (2/3 width) */}
                  <div className="lg:col-span-2 space-y-4">
                    {yearBills.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-gray-505 font-bold font-sans">निवडलेल्या {selectedLedgerYear} वर्षासाठी कोणतेही कर आकारले गेलेले नाहीत.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="bg-green-50 text-green-800 font-bold border-b border-green-100">
                              <th className="p-4 rounded-l-xl">कर प्रकार (Tax Type)</th>
                              <th className="p-4">एकूण रक्कम (Total)</th>
                              <th className="p-4">जमा रक्कम (Paid)</th>
                              <th className="p-4">उर्वरित देय (Outstanding)</th>
                              <th className="p-4 rounded-r-xl">स्थिती (Status)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {yearBills.map((b) => {
                              const outstanding = b.amount - b.paidAmount;
                              const isOverpaid = outstanding < 0;
                              return (
                                <tr key={b._id} className="hover:bg-gray-50/50 transition">
                                  <td className="p-4 font-bold text-gray-700">{taxTypeLabels[b.taxType] || b.taxType}</td>
                                  <td className="p-4 text-gray-800 font-semibold">₹{b.amount}</td>
                                  <td className="p-4 text-green-600 font-bold">₹{b.paidAmount}</td>
                                  <td className={`p-4 font-black ${isOverpaid ? "text-emerald-600" : "text-red-650"}`}>
                                    {isOverpaid ? `+₹${Math.abs(outstanding)}` : `₹${outstanding}`}
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isOverpaid
                                        ? "bg-emerald-100 text-emerald-800"
                                        : b.status === "paid"
                                          ? "bg-green-100 text-green-700"
                                          : b.status === "partial"
                                            ? "bg-orange-100 text-orange-655"
                                            : "bg-red-100 text-red-655"
                                      }`}>
                                      {isOverpaid ? "अतिरिक्त" : b.status.toUpperCase()}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Inline assign fine section (1/3 width) */}
                  <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-5 flex flex-col justify-between">
                    <div>
                      <h5 className="font-bold text-sm text-green-805 mb-2">वर्ष {selectedLedgerYear} साठी दंड आकारणी</h5>
                      <p className="text-[11px] text-gray-400 mb-4 font-semibold leading-relaxed">
                        निवडलेल्या कुटुंबाला या आर्थिक वर्षासाठी विलंब शुल्क किंवा दंड (Late Fine) थेट लागू करा.
                      </p>

                                            <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!selectedFamilyId || !selectedLedgerYear || !inlineFineAmount) {
                            return toast.error("कृपया दंड रक्कम टाका (Please enter fine amount)");
                          }
                          setAssigningInlineFine(true);
                          try {
                            await axioesInstance.post("/admin/taxes/assign", {
                              familyId: selectedFamilyId,
                              taxType: "fine",
                              year: Number(selectedLedgerYear),
                              amount: Number(inlineFineAmount),
                              reason: inlineFineReason,
                            });
                            toast.success(`Fine of ₹${inlineFineAmount} assigned successfully for year ${selectedLedgerYear}!`);
                            setInlineFineAmount("");
                            setInlineFineReason("");
                            fetchTaxes(selectedFamilyId);
                          } catch (err) {
                            toast.error(err.response?.data?.error || "Error assigning fine");
                          } finally {
                            setAssigningInlineFine(false);
                          }
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-xs font-bold text-gray-550 mb-1">दंड रक्कम (Fine Amount) *</label>
                          <input
                            type="number"
                            required
                            placeholder="उदा. ५०"
                            value={inlineFineAmount}
                            onChange={(e) => setInlineFineAmount(e.target.value)}
                            className="border border-green-600 bg-white p-2 rounded-xl w-full text-xs font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-550 mb-1">दंड आकारण्याचे कारण (Reason for Fine)</label>
                          <textarea
                            rows={2}
                            placeholder="उदा. विलंब शुल्क किंवा इतर कारण"
                            value={inlineFineReason}
                            onChange={(e) => setInlineFineReason(e.target.value)}
                            className="border border-green-600 bg-white p-2 rounded-xl w-full text-xs font-semibold outline-none resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={assigningInlineFine}
                          className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl shadow text-xs transition duration-300"
                        >
                          {assigningInlineFine ? "लागू होत आहे..." : "दंड लागू करा / Assign Fine"}
                        </button>
                      </form>
                    </div>

                    {/* Quick year balance summary */}
                    <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs space-y-1.5 font-sans font-semibold text-gray-500">
                      <div className="flex justify-between">
                        <span>एकूण कर (Total Tax):</span>
                        <span className="text-gray-800 font-bold">
                          ₹{yearBills.reduce((sum, b) => sum + b.amount, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>एकूण जमा (Total Paid):</span>
                        <span className="text-green-600 font-bold">
                          ₹{yearBills.reduce((sum, b) => sum + b.paidAmount, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-dashed pt-1.5 font-bold">
                        <span>उर्वरित येणे (Outstanding):</span>
                        <span className="text-red-650 font-black">
                          ₹{yearBills.reduce((sum, b) => sum + (b.amount - b.paidAmount), 0)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowFineReasonModal(true)}
                        className="w-full mt-3.5 bg-orange-100 hover:bg-orange-200 text-orange-700 hover:text-orange-850 font-black py-2 rounded-xl text-[10px] transition uppercase tracking-wider flex items-center justify-center gap-1 border border-orange-200"
                      >
                        📄 {lang === "mr" ? "दंडाचे कारण पहा" : "View Fine Reason"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ──────────────── TAB 3: TRANSACTION LOGS ──────────────── */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-50">
          <h4 className="text-lg font-bold text-green-700 mb-4 border-b pb-2">पेमेंट जमा इतिहास (Payment Transaction Log)</h4>
          {loading ? (
            <div className="text-center py-6 text-gray-500 font-bold">लोड होत आहे...</div>
          ) : payments.length === 0 ? (
            <p className="text-gray-500 text-center py-6 font-bold">अद्याप कोणताही व्यवहार झालेला नाही.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-green-50 text-green-800 font-bold border-b border-green-100">
                    <th className="p-4 rounded-l-xl">तारीख</th>
                    <th className="p-4">कुटुंब आयडी</th>
                    <th className="p-4">कर प्रकार</th>
                    <th className="p-4">भरलेली रक्कम</th>
                    <th className="p-4">भरणा पद्धती</th>
                    <th className="p-4 rounded-r-xl">व्यवहार आयडी</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 text-gray-600 font-medium">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td className="p-4 font-mono font-bold text-green-700">{p.familyId}</td>
                      <td className="p-4 font-bold text-gray-700">{taxTypeLabels[p.taxType] || p.taxType}</td>
                      <td className="p-4 font-bold text-green-600">₹{p.amountPaid}</td>
                      <td className="p-4">
                        <span className="uppercase text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs text-gray-400 break-all">{p.transactionId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {/* ──────────────── TAB 4: NOTIFICATIONS ──────────────── */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-6 gap-4">
            <div>
              <h4 className="text-lg font-bold text-green-700">सूचना केंद्र (Notification Center)</h4>
              <p className="text-xs text-gray-400 font-semibold mt-1">
                सर्व कर आकारणी, भरणा, दंड आणि बदलांच्या सूचना (All tax, payment & change notifications)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">
                एकूण: {notifTotal} सूचना
              </span>
              <button
                onClick={() => fetchNotifications(notifPage)}
                className="text-xs bg-green-700 hover:bg-green-800 text-white font-bold px-3 py-1.5 rounded-lg shadow transition duration-300"
              >
                ↻ ताजे करा / Refresh
              </button>
            </div>
          </div>

          {loadingNotifs ? (
            <div className="text-center py-12 text-gray-500 font-bold">सूचना लोड होत आहे...</div>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-12 font-bold">अद्याप कोणतीही सूचना नाही.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-green-50 text-green-800 font-bold border-b border-green-100">
                      <th className="p-4 rounded-l-xl">तारीख व वेळ</th>
                      <th className="p-4">प्रकार (Type)</th>
                      <th className="p-4">कुटुंब आयडी</th>
                      <th className="p-4">शीर्षक (Title)</th>
                      <th className="p-4 rounded-r-xl">तपशील (Details)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {notifications.map((n) => {
                      const typeInfo = notifTypeLabels[n.type] || { label: n.type, color: "bg-gray-100 text-gray-700" };
                      return (
                        <tr key={n._id} className="hover:bg-gray-50/50 transition">
                          <td className="p-4 text-gray-600 font-medium text-xs whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleDateString("mr-IN")}
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {new Date(n.createdAt).toLocaleTimeString("mr-IN", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-bold text-green-700 text-xs">{n.familyId}</td>
                          <td className="p-4 font-bold text-gray-800 text-xs">{n.title}</td>
                          <td className="p-4 text-gray-600 text-xs max-w-xs">
                            <p className="line-clamp-2">{n.message}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {notifTotal > 30 && (
                <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t">
                  <button
                    disabled={notifPage <= 1}
                    onClick={() => fetchNotifications(notifPage - 1)}
                    className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-lg disabled:opacity-40 transition"
                  >
                    ◀ मागील
                  </button>
                  <span className="text-xs font-bold text-gray-600">
                    पान {notifPage} / {Math.ceil(notifTotal / 30)}
                  </span>
                  <button
                    disabled={notifPage >= Math.ceil(notifTotal / 30)}
                    onClick={() => fetchNotifications(notifPage + 1)}
                    className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-lg disabled:opacity-40 transition"
                  >
                    पुढील ▶
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {showFineReasonModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-green-150 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-lg font-black mb-2 flex items-center gap-2" style={{ color: "#14532d" }}>
              <span>⚠️ दंड आकारणी कारणे (Fine Details)</span>
            </h4>
            <p className="text-xs text-gray-400 font-bold mb-4">वर्ष {selectedLedgerYear} - {Number(selectedLedgerYear) + 1}</p>
            
            {(() => {
              const fineBill = bills.find((b) => b.year === Number(selectedLedgerYear) && b.taxType === "fine");
              if (!fineBill) {
                return (
                  <p className="text-gray-500 text-center py-6 text-sm font-semibold">
                    या वर्षासाठी कोणताही दंड आकारण्यात आलेला नाही.
                  </p>
                );
              }
              return (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-semibold space-y-2">
                    <p className="text-gray-650"><strong>दंड रक्कम:</strong> <span className="text-orange-600 text-sm font-black">₹{fineBill.amount}</span></p>
                    <p className="text-gray-650">
                      <strong>कर स्थिती:</strong>{" "}
                      <span className="font-extrabold">
                        {fineBill.status === "paid"
                          ? "पूर्ण भरलेला (Paid)"
                          : fineBill.status === "partial"
                            ? "अंशतः भरलेला (Partially Paid)"
                            : "थकीत (Pending)"}
                      </span>
                    </p>
                    <p className="text-gray-650"><strong>लागू तारीख:</strong> {new Date(fineBill.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-orange-50/40 border border-orange-100 p-4 rounded-2xl text-xs text-gray-700">
                    <strong className="block text-[10px] uppercase font-black tracking-wider text-orange-650 mb-1">दंड कारण / शेरा:</strong>
                    <p className="leading-relaxed font-semibold">{fineBill.reason || "कोणतेही कारण नमूद केलेले नाही."}</p>
                  </div>
                </div>
              );
            })()}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFineReasonModal(false)}
                className="bg-green-700 hover:bg-green-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition"
              >
                बंद करा (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
