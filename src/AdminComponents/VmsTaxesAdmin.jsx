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

  const getPaymentBucketLabel = (taxType) => {
    if (taxType === "water" || taxType === "samanya_water" || taxType === "vishesh_water") {
      return lang === "mr" ? "पाणीपट्टी (Water Tax)" : "Water Tax";
    }
    if (taxType === "house" || taxType === "health" || taxType === "electricity") {
      return lang === "mr" ? "घरपट्टी व इतर कर (House & Other Taxes)" : "House & Other Taxes";
    }
    return lang === "mr" ? "दंड (Fines & Penalties)" : "Fines & Penalties";
  };

  const handleGenerateReceipt = (payment) => {
    const receiptWindow = window.open("", "_blank", "width=920,height=900");
    if (!receiptWindow) {
      toast.error("Please allow pop-ups to generate the receipt.");
      return;
    }

    const allocations = Array.isArray(payment.allocations) && payment.allocations.length > 0
      ? payment.allocations
      : [{
        year: payment.year || "-",
        taxType: payment.taxType,
        amount: payment.amountPaid,
      }];
    const totalAllocated = allocations.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    // Calculate remaining payable
    let targetTypes = [payment.taxType];
    if (payment.taxType === "water" || payment.taxType === "samanya_water" || payment.taxType === "vishesh_water") {
      targetTypes = ["samanya_water", "vishesh_water"];
    } else if (payment.taxType === "house" || payment.taxType === "health" || payment.taxType === "electricity") {
      targetTypes = ["house", "health", "electricity"];
    } else if (payment.taxType === "fine") {
      targetTypes = ["fine"];
    }
    const remainingPayable = bills
      ? bills
          .filter((b) => targetTypes.includes(b.taxType) && b.status !== "paid")
          .reduce((sum, b) => sum + (b.amount - (b.paidAmount || 0)), 0)
      : 0;

    const selectedFamily = families.find((x) => x.familyId === (payment.familyId || selectedFamilyId));

    const receiptNo = payment.transactionId || payment._id || `receipt-${Date.now()}`;
    const receiptFileName = `receipt-${String(receiptNo).replace(/[^a-z0-9_-]/gi, "-")}.html`;
    const rows = allocations.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.year && item.year !== "-" ? `FY ${item.year}-${Number(item.year) + 1}` : "-"}</td>
        <td>${getPaymentBucketLabel(payment.taxType)}</td>
        <td>${taxTypeLabel(item.taxType)}</td>
        <td class="amount">Rs. ${Number(item.amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
      </tr>
    `).join("");

    const receiptHtml = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Payment Receipt - ${receiptNo}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #f3f4f6; color: #111827; font-family: Arial, sans-serif; }
    .toolbar { position: sticky; top: 0; display: flex; justify-content: flex-end; gap: 10px; padding: 14px 18px; background: #ffffff; border-bottom: 1px solid #e5e7eb; }
    button { border: 0; border-radius: 8px; padding: 10px 14px; font-weight: 800; cursor: pointer; }
    .print { background: #166534; color: white; }
    .download { background: #f97316; color: white; }
    .receipt { max-width: 820px; margin: 24px auto; background: white; border: 1px solid #d1d5db; padding: 34px; }
    .header { display: flex; align-items: center; justify-content: space-between; gap: 24px; border-bottom: 3px solid #166534; padding-bottom: 18px; }
    .brand { display: flex; align-items: center; gap: 14px; }
    .logo { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #166534; }
    h1 { margin: 0; font-size: 24px; color: #14532d; }
    .subtitle { margin-top: 4px; color: #6b7280; font-weight: 700; font-size: 12px; }
    .badge { border: 1px solid #bbf7d0; color: #166534; background: #f0fdf4; border-radius: 999px; padding: 8px 12px; font-size: 12px; font-weight: 900; white-space: nowrap; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px; margin: 24px 0; }
    .field { border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .label { color: #6b7280; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .04em; }
    .value { margin-top: 4px; font-size: 14px; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; }
    th, td { border: 1px solid #e5e7eb; padding: 11px; text-align: left; font-size: 13px; }
    th { background: #f0fdf4; color: #14532d; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
    .amount { text-align: right; font-weight: 900; }
    .total { display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); justify-content: flex-end; gap: 14px; margin-top: 18px; }
    .total-box { min-width: 260px; border: 2px solid #166534; border-radius: 8px; padding: 14px; }
    .total-box .label { color: #14532d; }
    .total-box .value { font-size: 24px; color: #166534; text-align: right; }
    .remaining-box { border-color: #f97316; }
    .remaining-box .label { color: #9a3412; }
    .remaining-box .value { color: #c2410c; }
    .footer { margin-top: 34px; display: grid; grid-template-columns: 1fr 1fr; gap: 28px; color: #6b7280; font-size: 12px; }
    .sign { text-align: right; padding-top: 42px; border-top: 1px dashed #9ca3af; font-weight: 900; color: #374151; }
    @media print {
      body { background: white; }
      .toolbar { display: none; }
      .receipt { margin: 0; max-width: none; border: 0; padding: 18px; }
    }
    @media (max-width: 640px) {
      .receipt { margin: 0; padding: 22px; }
      .header, .grid, .footer { grid-template-columns: 1fr; display: grid; }
      .toolbar { justify-content: stretch; }
      button { flex: 1; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="print" onclick="window.print()">Print / Save PDF</button>
    <button class="download" onclick="downloadReceipt()">Download HTML</button>
  </div>
  <main class="receipt">
    <section class="header">
      <div class="brand">
        <img class="logo" src="/images/satyamev.jpg" alt="Logo" />
        <div>
          <h1>Gram Panchayat Gomevadi</h1>
          <div class="subtitle">Official tax payment receipt</div>
        </div>
      </div>
      <div class="badge">Receipt Generated</div>
    </section>

    <section class="grid">
      <div class="field"><div class="label">Receipt No.</div><div class="value">${receiptNo}</div></div>
      <div class="field"><div class="label">Payment Date</div><div class="value">${new Date(payment.paymentDate || payment.createdAt).toLocaleString("en-US", { hour12: true })}</div></div>
      <div class="field"><div class="label">Family ID</div><div class="value">${selectedFamily?.familyId || "-"}</div></div>
      <div class="field"><div class="label">House No.</div><div class="value">${selectedFamily?.houseNumber || "-"}</div></div>
      <div class="field"><div class="label">Name</div><div class="value">${selectedFamily?.mainMemberName || "-"}</div></div>
      <div class="field"><div class="label">Mobile</div><div class="value">${selectedFamily?.mobileNumber || selectedFamily?.whatsappNumber || "-"}</div></div>
      <div class="field"><div class="label">Payment Mode</div><div class="value">${payment.paymentMethod || "-"}</div></div>
      <div class="field"><div class="label">Payment Category</div><div class="value">${getPaymentBucketLabel(payment.taxType)}</div></div>
    </section>

    <h2 style="font-size:16px;color:#14532d;margin:12px 0 0;">Tax Details</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Financial Year</th>
          <th>Payment Against</th>
          <th>Tax Type</th>
          <th style="text-align:right;">Paid Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <section class="total">
      <div class="total-box">
        <div class="label">Total Paid</div>
        <div class="value">Rs. ${Number(payment.amountPaid || totalAllocated || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
      </div>
      <div class="total-box remaining-box">
        <div class="label">Remaining Amount To Be Paid</div>
        <div class="value">Rs. ${Number(remainingPayable || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
      </div>
    </section>

    <section class="footer">
      <div>
        <strong>Transaction ID:</strong> ${payment.transactionId || "-"}<br />
        <strong>Status:</strong> ${payment.status || "success"}<br />
        This is a computer-generated receipt.
      </div>
      <div class="sign">Authorized Signature / Seal</div>
    </section>
  </main>
  <script>
    function downloadReceipt() {
      var html = "<!doctype html>\\n" + document.documentElement.outerHTML;
      var blob = new Blob([html], { type: "text/html" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = ${JSON.stringify(receiptFileName)};
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }
  </script>
</body>
</html>`;

    receiptWindow.document.open();
    receiptWindow.document.write(receiptHtml);
    receiptWindow.document.close();
  };

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
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const [showAssignFineModal, setShowAssignFineModal] = useState(false);
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
  const [expandedYear, setExpandedYear] = useState(null);
  const [expandedPaymentId, setExpandedPaymentId] = useState(null);
  const [familyPayments, setFamilyPayments] = useState([]);

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
        setFamilyPayments(res.data.payments || []);
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

  // Assign inline fine handler (desktop & mobile)
  const handleAssignFineSubmit = async (e) => {
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
      setShowAssignFineModal(false);
      fetchTaxes(selectedFamilyId);
    } catch (err) {
      toast.error(err.response?.data?.error || "Error assigning fine");
    } finally {
      setAssigningInlineFine(false);
    }
  };

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
          <h2 className="text-2xl font-black text-white drop-shadow-md">
            {lang === "mr" ? "कर भरणा आणि महसूल केंद्र" : "Village Tax Hub"}
          </h2>
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
                        <h3 className="text-lg font-bold text-green-800">
                          {lang === "mr" ? "वार्षिक थकबाकी अहवाल" : "Yearly Outstanding Report"}
                        </h3>
                        <p className="text-xs text-gray-400 font-semibold mt-1">मागील वर्षांचे एकूण प्रलंबित कर तपशील (गांव बेरीज / Whole Village Sum)</p>
                      </div>

                      {stats?.yearlyBreakdown?.length === 0 ? (
                        <p className="text-center text-gray-500 py-12 font-bold">पद्धतीमध्ये कोणतेही प्रलंबित कर नाहीत.</p>
                      ) : (
                        <>
                          {/* DESKTOP VIEW */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                              <thead>
                                <tr className="bg-green-50 text-green-800 font-bold border-b border-green-100">
                                  <th className="p-4 rounded-l-xl">{lang === "mr" ? "वर्ष" : "Year"}</th>
                                  <th className="p-4">१) पाणीपट्टी थकबाकी (सामान्य+विशेष)</th>
                                  <th className="p-4">२) घरपट्टी थकबाकी (घर+आरोग्य+वीज)</th>
                                  <th className="p-4">{lang === "mr" ? "एकूण प्रलंबित" : "Total Due"}</th>
                                  <th className="p-4 rounded-r-xl">{lang === "mr" ? "क्रिया" : "Action"}</th>
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
                                          type="button"
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

                          {/* MOBILE VIEW CARD LIST */}
                          <div className="block md:hidden space-y-4">
                            {stats?.yearlyBreakdown?.map((yr) => {
                              const waterPending = yr.waterAmount - yr.waterPaid;
                              const housePending = yr.houseAmount - yr.housePaid;
                              const totalPending = waterPending + housePending + (yr.fineAmount - yr.finePaid);
                              const isExpanded = expandedYear === yr.year;

                              return (
                                <div
                                  key={yr.year}
                                  className="bg-white border border-green-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                                >
                                  {/* Card Header */}
                                  <div
                                    onClick={() => setExpandedYear(isExpanded ? null : yr.year)}
                                    className="flex justify-between items-center cursor-pointer"
                                  >
                                    <span className="font-black text-gray-800 text-sm">
                                      {lang === "mr" ? `वर्ष: ${yr.year}` : `Year: ${yr.year}`}
                                    </span>
                                    <div className="flex items-center gap-3">
                                      {totalPending <= 0 ? (
                                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                          {lang === "mr" ? "सर्व निरंक" : "All Clear"}
                                        </span>
                                      ) : (
                                        <span className="font-black text-red-650 text-xs">
                                          ₹{totalPending}
                                        </span>
                                      )}
                                      <span className="text-slate-400 text-xs transition-transform duration-200">
                                        {isExpanded ? "▲" : "▼"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Card Details */}
                                  {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                      {/* Water Pending */}
                                      <div className="flex flex-col gap-1.5 pb-2 border-b border-dashed border-slate-100">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-500 font-bold">१) पाणीपट्टी थकबाकी (सामान्य+विशेष):</span>
                                          {waterPending <= 0 ? (
                                            <span className="text-green-700 font-extrabold">{lang === "mr" ? "निरंक" : "Nil"}</span>
                                          ) : (
                                            <span className="text-slate-700 font-mono font-bold">₹{waterPending}</span>
                                          )}
                                        </div>
                                        {waterPending > 0 && (
                                          <p className="text-[9.5px] text-slate-400 font-semibold self-end">
                                            एकूण: ₹{yr.waterAmount} | वसूल: ₹{yr.waterPaid}
                                          </p>
                                        )}
                                      </div>

                                      {/* House Pending */}
                                      <div className="flex flex-col gap-1.5 pb-2 border-b border-dashed border-slate-100">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-500 font-bold">२) घरपट्टी थकबाकी (घर+आरोग्य+वीज):</span>
                                          {housePending <= 0 ? (
                                            <span className="text-green-700 font-extrabold">{lang === "mr" ? "निरंक" : "Nil"}</span>
                                          ) : (
                                            <span className="text-slate-700 font-mono font-bold">₹{housePending}</span>
                                          )}
                                        </div>
                                        {housePending > 0 && (
                                          <p className="text-[9.5px] text-slate-400 font-semibold self-end">
                                            एकूण: ₹{yr.houseAmount} | वसूल: ₹{yr.housePaid}
                                          </p>
                                        )}
                                      </div>

                                      {/* Total Outstanding */}
                                      <div className="flex justify-between text-xs font-bold pt-1">
                                        <span className="text-slate-700">{lang === "mr" ? "एकूण प्रलंबित:" : "Total Due:"}</span>
                                        <span className={totalPending > 0 ? "text-red-650 font-black text-sm" : "text-green-700 font-black text-sm"}>
                                          ₹{totalPending}
                                        </span>
                                      </div>

                                      {/* Action button */}
                                      <div className="pt-2">
                                        <button
                                          type="button"
                                          onClick={() => fetchPendingFamilies(yr.year)}
                                          className="w-full bg-green-700 hover:bg-green-800 text-white font-extrabold py-2 px-3 rounded-xl text-xs shadow-sm transition"
                                        >
                                          {lang === "mr" ? "यादी पहा" : "View List"}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
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
              <h3 className="text-xl font-bold text-green-700">{lang === "mr" ? "कुटुंबनिहाय खाते" : "Household Accounts"}</h3>
              <p className="text-sm text-gray-500">कुटुंब निवडून कर लागू करा किंवा पेमेंट नोंदवा</p>
            </div>
            {/* SEARCHABLE FAMILY DROPDOWN */}
            <div className="w-full md:w-96" ref={familyDropdownRef}>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === "mr" ? "कुटुंब निवडा (नाव/मोबाईल/आयडीनुसार शोधा):" : "Select Family (Search by Name / Phone / ID):"}
              </label>
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
              <h4 className="text-lg font-bold text-green-700 mb-4 border-b pb-2">
                {lang === "mr" ? "नवीन कर लागू करा" : "Assign Tax"}
              </h4>
              <form onSubmit={handleAssignTax} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      {lang === "mr" ? "कर प्रकार" : "Tax Type"}
                    </label>
                    <select
                      value={taxType}
                      onChange={(e) => setTaxType(e.target.value)}
                      className="border border-green-600 p-2 rounded-xl w-full text-sm outline-none font-semibold"
                    >
                      <option value="samanya_water">{lang === "mr" ? "सामान्य पाणीपट्टी" : "General Water Tax"}</option>
                      <option value="vishesh_water">{lang === "mr" ? "विशेष पाणीपट्टी" : "Special Water Tax"}</option>
                      <option value="house">{lang === "mr" ? "घरपट्टी" : "House Tax"}</option>
                      <option value="health">{lang === "mr" ? "आरोग्य कर" : "Health Tax"}</option>
                      <option value="electricity">{lang === "mr" ? "वीज कर" : "Electricity Tax"}</option>
                      <option value="fine">{lang === "mr" ? "दंड" : "Fine / Penalty"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      {lang === "mr" ? "आकारणी वर्ष" : "Financial Year"}
                    </label>
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
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      {lang === "mr" ? "कर रक्कम *" : "Tax Amount *"}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder={lang === "mr" ? "उदा. ५००" : "e.g. 500"}
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
                {lang === "mr" ? "ऑफलाइन पेमेंट नोंदवा" : "Record Offline Payment"}
              </h4>

              <div className="space-y-4">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {lang === "mr" ? "पेमेंट गट" : "Payment Category"}
                  </label>
                  <select
                    value={offlineCategory}
                    onChange={(e) => setOfflineCategory(e.target.value)}
                    className="border border-orange-500 p-2 rounded-xl w-full text-sm outline-none font-semibold bg-white text-gray-800"
                  >
                    <option value="water">{lang === "mr" ? "💧 पाणीपट्टी — थकबाकी + चालू (सामान्य + विशेष)" : "💧 Water Tax — Arrears + Current"}</option>
                    <option value="house">{lang === "mr" ? "🏠 घरपट्टी + वीजकर + आरोग्य कर — थकबाकी + चालू" : "🏠 House, Electricity & Health Tax — Arrears + Current"}</option>
                    <option value="fine">{lang === "mr" ? "⚠️ दंड" : "⚠️ Fines"}</option>
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
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        {lang === "mr" ? "एकूण थकबाकी" : "Total Outstanding"}
                      </label>
                      <div className="border border-orange-500 p-2.5 rounded-xl w-full text-sm font-black bg-white flex items-center justify-between text-gray-800">
                        <span>₹{total.toLocaleString()}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          {total > 0 ? (lang === "mr" ? "थकबाकी आहे" : "Due") : (lang === "mr" ? "निरंक ✓" : "Nil ✓")}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {lang === "mr" ? "पेमेंट रक्कम *" : "Payment Amount *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder={lang === "mr" ? "उदा. ५००" : "e.g. 500"}
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
                  {recordingCat ? (lang === "mr" ? "प्रक्रिया होत आहे..." : "Processing...") : (lang === "mr" ? "पेमेंट नोंदवा" : "Record Payment")}
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
                      <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
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
                                    <td className="p-4 font-bold text-gray-700">{taxTypeLabel(b.taxType)}</td>
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

                        {/* Mobile Card List View */}
                        <div className="block md:hidden space-y-3">
                          {yearBills.map((b) => {
                            const outstanding = b.amount - b.paidAmount;
                            const isOverpaid = outstanding < 0;
                            return (
                              <div key={b._id} className="bg-white rounded-2xl p-4 border border-green-700 shadow-sm space-y-2">
                                <div className="flex justify-between items-center border-b pb-2">
                                  <span className="font-extrabold text-slate-800 text-sm">{taxTypeLabel(b.taxType)}</span>
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
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs font-semibold pt-1">
                                  <div>
                                    <span className="block text-[10px] text-gray-400 uppercase">एकूण (Total)</span>
                                    <span className="text-gray-800">₹{b.amount}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] text-gray-400 uppercase">जमा (Paid)</span>
                                    <span className="text-green-600">₹{b.paidAmount}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] text-gray-400 uppercase">देय (Due)</span>
                                    <span className={`font-black ${isOverpaid ? "text-emerald-650" : "text-red-650"}`}>
                                      {isOverpaid ? `+₹${Math.abs(outstanding)}` : `₹${outstanding}`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Inline assign fine section (1/3 width) */}
                  <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-5 flex flex-col justify-between">
                    <div>
                      <h5 className="font-bold text-sm text-green-805 mb-2">वर्ष {selectedLedgerYear} साठी दंड आकारणी</h5>
                      <p className="text-[11px] text-gray-400 mb-4 font-semibold leading-relaxed">
                        निवडलेल्या कुटुंबाला या आर्थिक वर्षासाठी विलंब शुल्क किंवा दंड (Late Fine) थेट लागू करा.
                      </p>

                                            {/* Desktop direct form */}
                      <form
                        onSubmit={handleAssignFineSubmit}
                        className="hidden md:block space-y-4"
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

                      {/* Mobile modal trigger button */}
                      <button
                        type="button"
                        onClick={() => setShowAssignFineModal(true)}
                        className="block md:hidden w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-xl shadow text-xs transition duration-300"
                      >
                        ⚠️ {lang === "mr" ? "दंड आकारणी (Assign Fine)" : "Assign Fine"}
                      </button>
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

                {/* Divider */}
                {familyPayments.length > 0 && <div className="border-t border-slate-100 pt-4" />}

                {/* View Receipts Button */}
                {familyPayments.length > 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReceiptsModal(true)}
                      className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition duration-300 text-sm hover:-translate-y-0.5"
                    >
                      🧾 {lang === "mr" ? "भरणा पावत्या पहा आणि डाउनलोड करा" : "View & Download Payment Receipts"}
                    </button>
                  </div>
                )}
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
            <>
              {/* DESKTOP VIEW */}
              <div className="hidden md:block overflow-x-auto">
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
                        <td className="p-4 font-bold text-gray-700">{taxTypeLabel(p.taxType)}</td>
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

              {/* MOBILE VIEW CARD LIST */}
              <div className="block md:hidden space-y-4">
                {payments.map((p) => {
                  const isExpanded = expandedPaymentId === p._id;
                  return (
                    <div
                      key={p._id}
                      className="bg-white border border-green-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                    >
                      {/* Card Header */}
                      <div
                        onClick={() => setExpandedPaymentId(isExpanded ? null : p._id)}
                        className="flex justify-between items-center cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-mono font-black text-green-700 text-sm">
                            {p.familyId}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                            {new Date(p.paymentDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-gray-700 text-xs">
                              {taxTypeLabel(p.taxType)}
                            </p>
                            <p className="font-black text-green-600 text-sm mt-0.5">
                              ₹{p.amountPaid}
                            </p>
                          </div>
                          <span className="text-slate-400 text-xs transition-transform duration-200">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>
                      </div>

                      {/* Card Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-bold">भरणा पद्धती (Method):</span>
                            <span className="uppercase font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700 text-[10px]">
                              {p.paymentMethod}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-500 font-bold">व्यवहार आयडी (Transaction ID):</span>
                            <span className="font-mono text-slate-400 text-[10px] break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                              {p.transactionId || "—"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
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
      {showReceiptsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-green-150 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h4 className="text-lg font-black flex items-center gap-2" style={{ color: "#14532d" }}>
                  <span>🧾 भरणा पावती इतिहास (Payment Receipts History)</span>
                </h4>
                <p className="text-xs text-gray-400 font-bold mt-1">
                  {lang === "mr" ? "कुटुंबाचे सर्व कर भरणा रेकॉर्ड्स आणि पावत्या डाउनलोड करा" : "All tax payment records and invoice receipts of the family"}
                </p>
              </div>
              <button
                onClick={() => setShowReceiptsModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1.5 hover:bg-slate-100 rounded-full transition"
                aria-label="Close modal"
              >
                ✖
              </button>
            </div>

            {/* Receipts List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-sass-scrollbar">
              {familyPayments.length === 0 ? (
                <p className="text-gray-505 text-center py-8 font-bold">कोणतीही पावती उपलब्ध नाही.</p>
              ) : (
                <div className="space-y-3">
                  {familyPayments.map((p) => (
                    <div key={p._id} className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-800">{taxTypeLabel(p.taxType)}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            p.paymentMethod === "offline" ? "bg-slate-200/80 text-slate-700 bg-slate-200" : "bg-blue-50 text-blue-650"
                          }`}>
                            {p.paymentMethod === "offline" ? (lang === "mr" ? "ऑफलाईन" : "Offline") : (lang === "mr" ? "ऑनलाईन" : "Online")}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-450 font-mono">
                          <strong>तारीख/वेळ:</strong> {new Date(p.paymentDate || p.createdAt).toLocaleString("en-US", { hour12: true })}
                        </p>
                        <p className="text-[10px] text-gray-450 font-mono">
                          <strong>ट्रान्झॅक्शन ID:</strong> {p.transactionId || "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                        <span className="text-green-700 font-extrabold text-sm">₹{p.amountPaid}</span>
                        <button
                          type="button"
                          onClick={() => handleGenerateReceipt(p)}
                          className="text-[11px] font-black text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl px-3.5 py-2 transition flex items-center gap-1.5 font-sans shrink-0 shadow-sm"
                        >
                          <span>📥</span> {lang === "mr" ? "पावती डाउनलोड" : "Receipt"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end border-t pt-4">
              <button
                type="button"
                onClick={() => setShowReceiptsModal(false)}
                className="bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-sm"
              >
                बंद करा (Close)
              </button>
            </div>
          </div>
        </div>
      )}
      {showAssignFineModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-green-150 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h4 className="text-base font-black flex items-center gap-2" style={{ color: "#14532d" }}>
                <span>⚠️ वर्ष {selectedLedgerYear} साठी दंड आकारणी</span>
              </h4>
              <button
                onClick={() => setShowAssignFineModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1"
                aria-label="Close modal"
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleAssignFineSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">दंड रक्कम (Fine Amount) *</label>
                <input
                  type="number"
                  required
                  placeholder="उदा. ५०"
                  value={inlineFineAmount}
                  onChange={(e) => setInlineFineAmount(e.target.value)}
                  className="border border-green-600 bg-white p-2.5 rounded-xl w-full text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">दंड आकारण्याचे कारण (Reason for Fine)</label>
                <textarea
                  rows={3}
                  placeholder="उदा. विलंब शुल्क किंवा इतर कारण"
                  value={inlineFineReason}
                  onChange={(e) => setInlineFineReason(e.target.value)}
                  className="border border-green-600 bg-white p-2.5 rounded-xl w-full text-xs font-semibold outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignFineModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
                >
                  रद्द करा (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={assigningInlineFine}
                  className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl text-xs shadow transition"
                >
                  {assigningInlineFine ? "लागू होत आहे..." : "दंड लागू करा"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
