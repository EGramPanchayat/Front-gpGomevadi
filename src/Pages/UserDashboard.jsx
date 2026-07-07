import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axioesInstance from "../utils/axioesInstance";
import { useSiteConfig } from "../utils/SiteConfigContext";
import { useLanguage } from "../utils/LanguageContext";

const TAX_CATEGORIES = [
  {
    id: "water",
    types: ["samanya_water", "vishesh_water"],
    number: "01",
  },
  {
    id: "house",
    types: ["house", "health", "electricity"],
    number: "02",
  },
  {
    id: "fine",
    types: ["fine"],
    number: "03",
  },
];

const TaxCategoryIcon = ({ categoryId, className = "h-5 w-5" }) => {
  if (categoryId === "water") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75S6.75 9.4 6.75 14a5.25 5.25 0 0010.5 0C17.25 9.4 12 3.75 12 3.75z" />
        <path strokeLinecap="round" d="M9.5 15.2a2.8 2.8 0 002.8 2.3" />
      </svg>
    );
  }

  if (categoryId === "house") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 10.5L12 3.75l8.25 6.75M5.75 9.25v10.5h12.5V9.25M9.5 19.75v-6.5h5v6.5" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.25l8.25 14.25H3.75L12 4.25zM12 9v4.5M12 17h.01" />
    </svg>
  );
};

const RazorpayMark = () => (
  <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white text-green-800 shadow-inner">
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 20L11.5 4H18L13.5 20H7Z" fill="currentColor" />
      <path d="M5 20L8.8 7H12L8.2 20H5Z" fill="#F97316" />
    </svg>
  </span>
);

const TAX_TYPE_NAMES = {
  samanya_water: { en: "General Water Tax", mr: "सामान्य पाणीपट्टी" },
  vishesh_water: { en: "Special Water Tax", mr: "विशेष पाणीपट्टी" },
  water: { en: "Water Tax", mr: "पाणीपट्टी" },
  house: { en: "House Tax", mr: "घरपट्टी" },
  health: { en: "Health Tax", mr: "आरोग्य कर" },
  electricity: { en: "Electricity Tax", mr: "वीज कर" },
  fine: { en: "Fine / Penalty", mr: "दंड" },
};

const CATEGORY_NAMES = {
  water: { en: "Water Tax (General + Special)", mr: "पाणीपट्टी (सामान्य + विशेष)" },
  house: { en: "House + Health + Electricity Tax", mr: "घरपट्टी + आरोग्य कर + वीज कर" },
  fine: { en: "All Fines / Penalties", mr: "सर्व दंड" },
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const billTotals = (billList) =>
  billList.reduce(
    (totals, bill) => {
      const amount = Number(bill.amount) || 0;
      const paid = Math.min(Math.max(Number(bill.paidAmount) || 0, 0), amount);
      totals.total += amount;
      totals.paid += paid;
      totals.remaining += Math.max(amount - paid, 0);
      return totals;
    },
    { total: 0, paid: 0, remaining: 0 },
  );

const getCurrentFinancialYear = () => {
  const today = new Date();
  return today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
};

const translations = {
  en: {
    greetingMorning: "Good Morning",
    greetingAfternoon: "Good Afternoon",
    greetingEvening: "Good Evening",
    headOfFamily: "Head of Family",
    houseNumber: "House Number",
    registeredPhone: "Registered Phone",
    whatsappContact: "WhatsApp Contact",
    registeredAddress: "Registered Address",
    men: "Men",
    women: "Women",
    seniors: "Seniors",
    children: "Children",
    dashboard: "Dashboard",
    payTaxes: "Pay Taxes",
    certificates: "Certificates",
    logout: "Logout",
    totalDues: "Total Dues",
    outstandingBalance: "Outstanding Balance",
    applicationCount: "Submitted Applications",
    completedCertificates: "Completed Certificates",
    familyProfile: "Family Profile",
    taxBreakdown: "Tax Breakdown",
    taxTypeHouse: "House Tax + Health Tax + Electricity Tax",
    taxTypeWater: "Water Tax (General + Special)",
    taxTypeHealth: "Health Tax",
    taxTypeFine: "Fine / Penalty",
    year: "Year",
    paid: "Paid",
    partial: "Partial",
    pending: "Pending",
    totalTax: "Total Tax",
    paidAmount: "Paid Amount",
    remainingTax: "Remaining Tax",
    enterAmount: "Enter Amount (₹)",
    payOnline: "Pay Online",
    receiptsLedger: "Receipts Ledger",
    paymentHistory: "Payment History",
    applyCertificate: "Apply for Certificate",
    selectType: "Select Type",
    applicantName: "Applicant Name",
    whatsappNumber: "WhatsApp Number",
    emailAddress: "Email Address",
    birthReg: "Birth Registration (₹20)",
    deathReg: "Death Registration (₹20)",
    marriageReg: "Marriage Certificate (₹20)",
    transcript8a: "8A Transcript (₹20)",
    noDuesReg: "No Dues Certificate (₹20)",
    bplReg: "BPL Certificate (Free)",
    destituteReg: "Destitute Certificate (Free)",
    childName: "Child's Name",
    dob: "Date of Birth",
    deceasedName: "Deceased Name",
    dateOfDeath: "Date of Death",
    coupleName: "Couple Names (Husband & Wife)",
    marriageYear: "Year of Marriage",
    propertyNo: "Property Number",
    niradharName: "Destitute Person's Name",
    certificateName: "Certificate Recipient Name",
    submitPay: "Pay ₹20 & Submit",
    submitFree: "Submit Free",
    applicationsStatus: "Applications Status",
    date: "Date",
    remarks: "Remarks",
    downloadCert: "Download Certificate",
    freeExempt: "Free Exemption",
    noBills: "No tax bills available.",
    noPayments: "No payment history available.",
    noApplications: "No applications submitted yet.",
    noteTitle: "Note:",
    noteText: "The above details are registered with the Gram Panchayat. For any changes, please contact the Gram Panchayat administration.",
    processing: "Processing...",
    submitting: "Submitting...",
    viewDetails: "View Details →",
    applyNow: "Apply Now →",
    downloadNow: "Download Now →",
    notifications: "Notifications",
    markAllRead: "Mark all as read",
    noNotifications: "No new notifications",
    notificationTitle: "Notifications Log",
    clear: "Clear",
    unread: "Unread",
  },
  mr: {
    greetingMorning: "शुभ प्रभात",
    greetingAfternoon: "शुभ दुपार",
    greetingEvening: "शुभ संध्या",
    headOfFamily: "कुटुंब प्रमुख",
    houseNumber: "घर क्रमांक",
    registeredPhone: "मोबाईल नंबर",
    whatsappContact: "व्हॉट्सॲप नंबर",
    registeredAddress: "पत्ता",
    men: "पुरुष",
    women: "महिला",
    seniors: "ज्येष्ठ नागरिक",
    children: "बालके",
    dashboard: "डॅशबोर्ड",
    payTaxes: "कर व देयके",
    certificates: "दाखला अर्ज",
    logout: "बाहेर पडा",
    totalDues: "थकीत कर",
    outstandingBalance: "एकूण थकीत रक्कम",
    applicationCount: "दाखला अर्ज संख्या",
    completedCertificates: "पूर्ण झालेले दाखले",
    familyProfile: "कुटुंबाची सविस्तर माहिती",
    taxBreakdown: "करांचे विवरण",
    taxTypeHouse: "घरपट्टी + आरोग्य कर + वीज कर",
    taxTypeWater: "पाणीपट्टी (सामान्य पाणीपट्टी + विशेष पाणीपट्टी)",
    taxTypeHealth: "आरोग्य कर",
    taxTypeFine: "दंड (Fine / Penalty)",
    year: "वर्ष",
    paid: "जमा",
    partial: "अंशतः",
    pending: "थकीत",
    totalTax: "एकूण कर",
    paidAmount: "भरलेली रक्कम",
    remainingTax: "उर्वरित कर",
    enterAmount: "रक्कम टाका (₹)",
    payOnline: "ऑनलाईन भरा",
    receiptsLedger: "भरणा इतिहास",
    paymentHistory: "पेमेंट इतिहास",
    applyCertificate: "नवीन दाखला अर्ज",
    selectType: "दाखल्याचा प्रकार निवडा",
    applicantName: "अर्जदाराचे नाव",
    whatsappNumber: "व्हॉट्सॲप नंबर",
    emailAddress: "ईमेल पत्ता",
    birthReg: "जन्म नोंद (₹२०)",
    deathReg: "मृत्यू नोंद (₹२०)",
    marriageReg: "विवाह नोंदणी दाखला (₹२०)",
    transcript8a: "८ अ उतारा (₹२०)",
    noDuesReg: "येणे बाकी दाखला (₹२०)",
    bplReg: "दारिद्र्य दाखला (BPL) (मोफत)",
    destituteReg: "निराधार दाखला (मोफत)",
    childName: "बाळाचे नाव",
    dob: "जन्मतारीख",
    deceasedName: "मृत व्यक्तीचे नाव",
    dateOfDeath: "मृत्यूची तारीख",
    coupleName: "पती व पत्नीचे नाव",
    marriageYear: "नोंदणी वर्ष",
    propertyNo: "मिळकत क्रमांक",
    niradharName: "निराधार व्यक्तीचे नाव",
    certificateName: "दाखला ज्यांच्या नावे हवा आहे त्यांचे नाव",
    submitPay: "₹२० भरा आणि सबमिट करा",
    submitFree: "मोफत सबमिट करा",
    applicationsStatus: "अर्जांची स्थिती",
    date: "तारीख",
    remarks: "अधिकारी शेरा",
    downloadCert: "दाखला डाऊनलोड करा",
    freeExempt: "मोफत सवलत",
    noBills: "कराची बिले उपलब्ध नाहीत.",
    noPayments: "पेमेंट इतिहास उपलब्ध नाही.",
    noApplications: "अद्याप कोणताही अर्ज केलेला नाही.",
    noteTitle: "टीप:",
    noteText: "वरील माहिती केवळ ग्रामपंचायत कार्यालयात नोंदणीकृत आहे. बदल किंवा दुरुस्तीसाठी ग्रामपंचायत प्रशासनाशी संपर्क साधावा.",
    processing: "प्रक्रिया सुरू आहे...",
    submitting: "सादर होत आहे...",
    viewDetails: "तपशील पहा →",
    applyNow: "नवीन अर्ज करा →",
    downloadNow: "डाऊनलोड करा →",
    notifications: "सूचना",
    markAllRead: "सर्व वाचले म्हणून नोंदवा",
    noNotifications: "नवीन सूचना नाहीत",
    notificationTitle: "सूचना इतिहास",
    clear: "बंद करा",
    unread: "न वाचलेले",
  }
};

export default function UserDashboard() {
  const { config } = useSiteConfig();
  const { lang: language, setLang: setLanguage } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState(null);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'taxes', 'applications'
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(null);
  const [editingApplication, setEditingApplication] = useState(null);
  const [showFineModal, setShowFineModal] = useState(false);
  const [selectedFineForModal, setSelectedFineForModal] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  // Notifications states
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Application form states
  const [form, setForm] = useState({
    forName: "",
    whatsappNo: "",
    email: "",
    type: "birth",
    dob: "",
    childName: "",
    deathName: "",
    deathDate: "",
    coupleName: "",
    marriageYear: "",
    propertyNo: "",
    certificateName: "",
    niradharName: "",
  });
  const [submittingApp, setSubmittingApp] = useState(false);

  // Razorpay payment state
  const [payAmounts, setPayAmounts] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const t = translations[language];

  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    // Check if authenticated
    axioesInstance
      .get("/auth/otp/check")
      .then((res) => {
        if (!res.data.ok) {
          window.location.href = "/user-login";
          return;
        }
        const familyData = res.data.family;
        setFamily(familyData);
        setForm((prev) => ({
          ...prev,
          forName: familyData?.mainMemberName || "",
          whatsappNo: familyData?.whatsappNumber || familyData?.mobileNumber || "",
        }));
        return Promise.all([
          axioesInstance.get(`/taxes/${familyData.familyId}`),
          axioesInstance.get("/user/applications"),
          axioesInstance.get("/user/notifications"),
        ]);
      })
      .then((responses) => {
        if (responses) {
          const [taxRes, appRes, notifRes] = responses;
          setBills(taxRes.data.bills || []);
          setPayments(taxRes.data.payments || []);
          setApplications(Array.isArray(appRes.data) ? appRes.data : (appRes.data.applications || []));
          if (notifRes) {
            setNotifications(notifRes.data.notifications || []);
            setUnreadNotifCount(notifRes.data.unreadCount || 0);
          }

          const loadedBills = taxRes.data.bills || [];
          const availableYears = [...new Set(loadedBills.map((bill) => Number(bill.year)))].sort((a, b) => b - a);
          setSelectedFinancialYear(availableYears[0] ?? null);

          // The payment page works with three all-year aggregates.
          const initialCategoryAmounts = {};
          TAX_CATEGORIES.forEach((category) => {
            initialCategoryAmounts[category.id] = billTotals(
              loadedBills.filter((bill) => category.types.includes(bill.taxType)),
            ).remaining;
          });
          setPayAmounts(initialCategoryAmounts);
        }
      })
      .catch(() => {
        toast.error("Failed to load details or session expired.");
        window.location.href = "/user-login";
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axioesInstance.post("/auth/otp/logout");
      localStorage.removeItem("userToken");
      toast.success("Logged out successfully.");
      setTimeout(() => {
        window.location.replace("/");
      }, 1000);
    } catch {
      localStorage.removeItem("userToken");
      window.location.replace("/");
    }
  };

  // Re-fetch all dashboard data without a full page reload
  const refreshDashboardData = async () => {
    try {
      const [taxRes, appRes, notifRes] = await Promise.all([
        axioesInstance.get(`/taxes/${family.familyId}`),
        axioesInstance.get("/user/applications"),
        axioesInstance.get("/user/notifications"),
      ]);
      const loadedBills = taxRes.data.bills || [];
      setBills(loadedBills);
      setPayments(taxRes.data.payments || []);
      setApplications(Array.isArray(appRes.data) ? appRes.data : (appRes.data.applications || []));
      setNotifications(notifRes.data.notifications || []);
      setUnreadNotifCount(notifRes.data.unreadCount || 0);

      // Recalculate payment amounts
      const initialCategoryAmounts = {};
      TAX_CATEGORIES.forEach((category) => {
        initialCategoryAmounts[category.id] = billTotals(
          loadedBills.filter((bill) => category.types.includes(bill.taxType)),
        ).remaining;
      });
      setPayAmounts(initialCategoryAmounts);
    } catch {
      // Silent fail — data will be stale but user stays on dashboard
    }
  };

  const fetchUserNotifications = () => {
    setLoadingNotifs(true);
    axioesInstance
      .get("/user/notifications")
      .then((res) => {
        setNotifications(res.data.notifications || []);
        setUnreadNotifCount(res.data.unreadCount || 0);
      })
      .catch(() => { })
      .finally(() => {
        setLoadingNotifs(false);
      });
  };

  const handleMarkRead = (id) => {
    axioesInstance
      .patch(`/user/notifications/${id}/read`)
      .then(() => {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadNotifCount(prev => Math.max(0, prev - 1));
      })
      .catch(() => {
        toast.error("अपडेट अयशस्वी");
      });
  };

  const handleMarkAllRead = () => {
    axioesInstance
      .patch("/user/notifications/read-all")
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadNotifCount(0);
        toast.success(language === "mr" ? "सर्व सूचना वाचल्या" : "All notifications marked as read");
      })
      .catch(() => {
        toast.error("अपडेट अयशस्वी");
      });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayCategory = async (group) => {
    const inputKey = group.id;
    const payAmt = Number(payAmounts[inputKey]);
    const maxPayable = group.remaining;
    const minPayable = Math.min(500, maxPayable);

    if (isNaN(payAmt) || payAmt < minPayable || payAmt > maxPayable) {
      return toast.error(
        language === "mr"
          ? `कृपया ₹${minPayable} आणि ₹${maxPayable} दरम्यानची रक्कम प्रविष्ट करा.`
          : `Please enter a valid amount between ₹${minPayable} and ₹${maxPayable}`
      );
    }

    setProcessingId(inputKey);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK load failed");
      }

      // Order creation
      const { data: orderData } = await axioesInstance.post("/payments/order", {
        category: group.id,
        familyId: family.familyId,
        amount: payAmt,
      });

      if (orderData.mock) {
        toast.info("Sandbox Mode: Simulating secure checkout...");
        setTimeout(async () => {
          try {
            await axioesInstance.post("/payments/verify", {
              category: group.id,
              familyId: family.familyId,
              amount: payAmt,
              razorpayOrderId: orderData.orderId,
              razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(7)}`,
              mock: true,
            });
            toast.success("Payment of ₹" + payAmt + " successful!");
            await refreshDashboardData();
          } catch {
            toast.error("Payment verification failed");
          }
        }, 1500);
        return;
      }

      // Real integration
      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: "ग्रामपंचायत गोमेवाडी",
        description: `${CATEGORY_NAMES[group.id][language]} — oldest dues first`,
        image: "/images/satyamev.jpg",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            await axioesInstance.post("/payments/verify", {
              category: group.id,
              familyId: family.familyId,
              amount: payAmt,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment completed successfully!");
            await refreshDashboardData();
          } catch {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: family.mainMemberName,
        },
        theme: {
          color: "#15803d",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      toast.error(err.message || "Failed to initiate payment");
    } finally {
      setProcessingId(null);
    }
  };

  const startEditing = (app) => {
    setEditingApplication(app);
    setForm({
      forName: app.applicantName || "",
      type: app.type || "जन्म नोंद",
      whatsappNo: app.details?.whatsappNo || "",
      email: app.details?.email || "",
      dob: app.details?.dob || "",
      childName: app.details?.childName || "",
      deathName: app.details?.deathName || "",
      deathDate: app.details?.deathDate || "",
      coupleName: app.details?.coupleName || "",
      marriageYear: app.details?.marriageYear || "",
      propertyNo: app.details?.propertyNo || "",
      certificateName: app.details?.certificateName || "",
      niradharName: app.details?.niradharName || "",
    });
  };

  const cancelEditing = () => {
    setEditingApplication(null);
    setForm({
      forName: family?.mainMemberName || "",
      whatsappNo: family?.whatsappNumber || family?.mobileNumber || "",
      email: "",
      type: "जन्म नोंद",
      dob: "",
      childName: "",
      deathName: "",
      deathDate: "",
      coupleName: "",
      marriageYear: "",
      propertyNo: "",
      certificateName: "",
      niradharName: "",
    });
  };

  const submitApplicationRequest = async (transactionId) => {
    try {
      await axioesInstance.post("/user/applications", {
        applicantName: form.forName,
        type: form.type,
        details: {
          whatsappNo: form.whatsappNo,
          email: form.email,
          transactionId,
          dob: form.dob,
          childName: form.childName,
          deathName: form.deathName,
          deathDate: form.deathDate,
          coupleName: form.coupleName,
          marriageYear: form.marriageYear,
          propertyNo: form.propertyNo,
          certificateName: form.certificateName,
          niradharName: form.niradharName,
        },
      });

      toast.success("Application and fee submitted successfully!");

      // Reset form (keeping user identity fields)
      setForm({
        forName: family?.mainMemberName || "",
        whatsappNo: family?.whatsappNumber || family?.mobileNumber || "",
        email: "",
        type: "जन्म नोंद",
        dob: "",
        childName: "",
        deathName: "",
        deathDate: "",
        coupleName: "",
        marriageYear: "",
        propertyNo: "",
        certificateName: "",
        niradharName: "",
      });

      // Refresh applications list
      const appRes = await axioesInstance.get("/user/applications");
      setApplications(Array.isArray(appRes.data) ? appRes.data : (appRes.data.applications || []));
    } catch {
      toast.error("Failed to submit application.");
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleApplyCertificate = async (e) => {
    e.preventDefault();

    if (!form.forName || !form.email || !form.type) {
      return toast.error("Please enter applicant name, email and type.");
    }

    if (form.whatsappNo && !/^[0-9]{10}$/.test(form.whatsappNo)) {
      return toast.error("WhatsApp number must be 10 digits.");
    }

    // Type field-specific validations
    switch (form.type) {
      case 'जन्म नोंद':
        if (!form.childName || !form.dob) return toast.error("Please enter child name and date of birth.");
        break;
      case 'मृत्यू नोंद':
        if (!form.deathName || !form.deathDate) return toast.error("Please enter deceased name and date of death.");
        break;
      case 'विवाह नोंदणी दाखला':
        if (!form.coupleName || !form.marriageYear) return toast.error("Please enter couple names and year of marriage.");
        break;
      case '८ अ उतारा':
        if (!form.propertyNo) return toast.error("Please enter property index number.");
        break;
      case 'निराधार असल्याचा दाखला मागणी':
        if (!form.niradharName) return toast.error("Please enter destitute person's name.");
        break;
      case 'दारिद्र्य रेषेखाली असल्याचा दाखला':
      case 'ग्रामपंचायत येणे बाकी दाखला':
        if (!form.certificateName) return toast.error("Please enter recipient name.");
        break;
    }

    if (editingApplication) {
      setSubmittingApp(true);
      try {
        await axioesInstance.put(`/user/applications/${editingApplication._id}`, {
          applicantName: form.forName,
          details: {
            whatsappNo: form.whatsappNo,
            email: form.email,
            dob: form.dob,
            childName: form.childName,
            deathName: form.deathName,
            deathDate: form.deathDate,
            coupleName: form.coupleName,
            marriageYear: form.marriageYear,
            propertyNo: form.propertyNo,
            certificateName: form.certificateName,
            niradharName: form.niradharName,
          },
        });

        toast.success(language === "mr" ? "अर्ज यशस्वीरीत्या अद्ययावत केला!" : "Application updated successfully!");
        cancelEditing();
        const appRes = await axioesInstance.get("/user/applications");
        setApplications(Array.isArray(appRes.data) ? appRes.data : (appRes.data.applications || []));
      } catch {
        toast.error(language === "mr" ? "अर्ज अद्ययावत करण्यात अयशस्वी." : "Failed to update application.");
      } finally {
        setSubmittingApp(false);
      }
      return;
    }

    const isFeeRequired = ['जन्म नोंद', 'मृत्यू नोंद', 'विवाह नोंदणी दाखला', '८ अ उतारा', 'ग्रामपंचायत येणे बाकी दाखला'].includes(form.type);

    if (isFeeRequired) {
      setSubmittingApp(true);
      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) throw new Error("Razorpay SDK load failed");

        const { data: orderData } = await axioesInstance.post("/payments/order", {
          billId: "CERTIFICATE_FEE",
          amount: 20, // Rs 20 certificate application fee
        });

        if (orderData.mock) {
          toast.info("Sandbox Mode: Simulating secure fee checkout...");
          setTimeout(async () => {
            try {
              const { data: verifyData } = await axioesInstance.post("/payments/verify", {
                billId: "CERTIFICATE_FEE",
                amount: 20,
                razorpayOrderId: orderData.orderId,
                razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(7)}`,
                mock: true,
              });

              await submitApplicationRequest(verifyData.transactionId || `MOCK_TX_${Date.now()}`);
            } catch {
              toast.error("Payment verification failed");
              setSubmittingApp(false);
            }
          }, 1500);
          return;
        }

        // Real checkout
        const options = {
          key: orderData.keyId,
          amount: orderData.amount * 100,
          currency: orderData.currency,
          name: "ग्रामपंचायत गोमेवाडी",
          description: `शुल्क: ${form.type} अर्ज`,
          image: "/images/satyamev.jpg",
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              await axioesInstance.post("/payments/verify", {
                billId: "CERTIFICATE_FEE",
                amount: 20,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              await submitApplicationRequest(response.razorpay_payment_id);
            } catch {
              toast.error("Payment verification failed");
              setSubmittingApp(false);
            }
          },
          prefill: {
            name: form.forName,
            contact: form.whatsappNo,
          },
          theme: {
            color: "#15803d",
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (err) {
        toast.error(err.message || "Failed to initiate fee payment");
        setSubmittingApp(false);
      }
    } else {
      setSubmittingApp(true);
      try {
        await submitApplicationRequest("FREE_EXEMPT");
      } catch {
        toast.error("Failed to submit application.");
        setSubmittingApp(false);
      }
    }
  };

  const calculateTotalDues = () => {
    return bills.reduce((sum, b) => sum + (b.amount - b.paidAmount), 0);
  };

  const financialYears = [...new Set(bills.map((bill) => Number(bill.year)))].sort((a, b) => b - a);
  const selectedYearBills = bills.filter((bill) => Number(bill.year) === Number(selectedFinancialYear));
  const currentFinancialYear = getCurrentFinancialYear();
  const paymentGroups = TAX_CATEGORIES.map((category) => {
    const categoryBills = bills.filter((bill) => category.types.includes(bill.taxType));
    return {
      ...category,
      ...billTotals(categoryBills),
      previousDue: billTotals(
        categoryBills.filter((bill) => Number(bill.year) < currentFinancialYear),
      ).remaining,
      currentDue: billTotals(
        categoryBills.filter((bill) => Number(bill.year) === currentFinancialYear),
      ).remaining,
      futureDue: billTotals(
        categoryBills.filter((bill) => Number(bill.year) > currentFinancialYear),
      ).remaining,
    };
  });
  const formatPaymentDateTime = (date) =>
    new Date(date).toLocaleString(language === "mr" ? "mr-IN" : "en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const escapeReceiptHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const getTaxLabel = (taxType) => {
    if (taxType === "house") return t.taxTypeHouse;
    if (taxType === "water") return t.taxTypeWater;
    if (taxType === "fine") return t.taxTypeFine;
    if (taxType === "health") return t.taxTypeHealth;
    return TAX_TYPE_NAMES[taxType]?.[language] || `${taxType} Tax`;
  };

  const getPaymentBucketLabel = (year) => {
    const numericYear = Number(year);
    if (!Number.isFinite(numericYear)) return language === "mr" ? "अनिर्दिष्ट" : "Not specified";
    if (numericYear < currentFinancialYear) return language === "mr" ? "थकबाकी (मागील थकीत)" : "Thakbaki / Previous arrears";
    if (numericYear === currentFinancialYear) return language === "mr" ? "चालू वर्षाचा कर" : "This year's payment";
    return language === "mr" ? "भविष्यातील कर" : "Future year payment";
  };

  const getRemainingForPayment = (payment) => {
    const category = TAX_CATEGORIES.find((item) => item.id === payment.taxType);
    const taxTypes = category?.types || [payment.taxType];
    return billTotals(bills.filter((bill) => taxTypes.includes(bill.taxType))).remaining;
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
    const remainingPayable = getRemainingForPayment(payment);
    const receiptNo = payment.transactionId || payment._id || `receipt-${Date.now()}`;
    const receiptFileName = `receipt-${String(receiptNo).replace(/[^a-z0-9_-]/gi, "-")}.html`;
    const rows = allocations.map((item, index) => {
      const matchingBill = bills
        ? bills.find((b) => b.year === Number(item.year) && b.taxType === item.taxType)
        : null;
      const rawRemaining = matchingBill ? matchingBill.amount - (matchingBill.paidAmount || 0) : 0;
      const displayRemaining = rawRemaining < 0
        ? `Rs. -${Math.abs(rawRemaining)} (Repay / Credit)`
        : `Rs. ${rawRemaining.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeReceiptHtml(item.year && item.year !== "-" ? `FY ${item.year}-${Number(item.year) + 1}` : "-")}</td>
          <td>${escapeReceiptHtml(getPaymentBucketLabel(item.year))}</td>
          <td>${escapeReceiptHtml(getTaxLabel(item.taxType))}</td>
          <td class="amount">Rs. ${Number(item.amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
          <td class="amount">${escapeReceiptHtml(displayRemaining)}</td>
        </tr>
      `;
    }).join("");

    const receiptHtml = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Payment Receipt - ${escapeReceiptHtml(receiptNo)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #f3f4f6; color: #111827; font-family: Arial, "Noto Sans Devanagari", sans-serif; }
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
      <div class="field"><div class="label">Receipt No.</div><div class="value">${escapeReceiptHtml(receiptNo)}</div></div>
      <div class="field"><div class="label">Payment Date</div><div class="value">${escapeReceiptHtml(formatPaymentDateTime(payment.paymentDate))}</div></div>
      <div class="field"><div class="label">Family ID</div><div class="value">${escapeReceiptHtml(family?.familyId)}</div></div>
      <div class="field"><div class="label">House No.</div><div class="value">${escapeReceiptHtml(family?.houseNumber || "-")}</div></div>
      <div class="field"><div class="label">Name</div><div class="value">${escapeReceiptHtml(family?.mainMemberName || "-")}</div></div>
      <div class="field"><div class="label">Email / WA</div><div class="value">${escapeReceiptHtml(family?.email || family?.whatsappNumber || "-")}</div></div>
      <div class="field"><div class="label">Payment Mode</div><div class="value">${escapeReceiptHtml(payment.paymentMethod || "-")}</div></div>
      <div class="field"><div class="label">Payment Category</div><div class="value">${escapeReceiptHtml(getTaxLabel(payment.taxType))}</div></div>
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
          <th style="text-align:right;">Remaining Amount</th>
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
        <strong>Transaction ID:</strong> ${escapeReceiptHtml(payment.transactionId || "-")}<br />
        <strong>Status:</strong> ${escapeReceiptHtml(payment.status || "success")}<br />
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

  const yearlyTaxStatement = (
    <section className={`rounded-3xl p-5 md:p-6 shadow-sm border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-emerald-100"}`}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-black text-orange-600">
            {language === "mr" ? "वर्षनिहाय कर विवरण" : "Yearly tax statement"}
          </p>
          <h2 className={`text-xl font-black mt-1 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            {language === "mr" ? "कर आकारणी, भरलेली व उर्वरित रक्कम" : "Assessed, paid and remaining tax"}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {language === "mr"
              ? "ही माहिती फक्त पाहण्यासाठी आहे. भरणा करण्यासाठी ‘कर व देयके’ विभाग वापरा."
              : "This statement is view-only. Use Pay Taxes to make a payment."}
          </p>
        </div>
        {financialYears.length > 0 && (
          <label className="min-w-56">
            <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
              {language === "mr" ? "आर्थिक वर्ष निवडा" : "Select financial year"}
            </span>
            <select
              value={selectedFinancialYear ?? ""}
              onChange={(event) => setSelectedFinancialYear(Number(event.target.value))}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDarkMode ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-emerald-200 text-gray-700"}`}
            >
              {financialYears.map((year) => (
                <option key={year} value={year}>
                  FY {year} - {year + 1}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {financialYears.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">{t.noBills}</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {TAX_CATEGORIES.map((category) => {
            const categoryBills = selectedYearBills.filter((bill) => category.types.includes(bill.taxType));
            const totals = billTotals(categoryBills);
            const isFine = category.id === "fine";
            const cardTone = isDarkMode
              ? "bg-slate-950/50 border-slate-800"
              : isFine
                ? "bg-orange-50/30 border-orange-100"
                : "bg-emerald-50/30 border-emerald-100";

            return (
              <article key={category.id} className={`rounded-2xl border p-4 ${cardTone}`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex gap-2.5">
                    <span className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${isFine ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
                      <TaxCategoryIcon categoryId={category.id} className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className={`text-sm font-black ${isDarkMode ? "text-slate-100" : "text-gray-800"}`}>
                        {CATEGORY_NAMES[category.id][language]}
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        FY {selectedFinancialYear} - {Number(selectedFinancialYear) + 1}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-black px-2 py-1 rounded-lg ${totals.remaining > 0 ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {totals.remaining > 0 ? t.pending : t.paid}
                  </span>
                </div>

                <div className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-3 gap-y-2 text-xs items-center rounded-xl p-3 ${isDarkMode ? "bg-slate-900" : "bg-white/80"}`}>
                  <span className="text-[9px] font-black uppercase text-gray-400">
                    {language === "mr" ? "कर प्रकार" : "Tax type"}
                  </span>
                  <span className="text-[9px] font-black uppercase text-gray-400 text-right">{t.totalTax}</span>
                  <span className="text-[9px] font-black uppercase text-gray-400 text-right">{t.paidAmount}</span>
                  <span className="text-[9px] font-black uppercase text-gray-400 text-right">{t.remainingTax}</span>
                  {category.types.map((taxType) => {
                    const row = billTotals(categoryBills.filter((bill) => bill.taxType === taxType));
                    return (
                      <React.Fragment key={taxType}>
                        <span className={`font-bold ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                          {TAX_TYPE_NAMES[taxType][language]}
                        </span>
                        <span className="font-bold text-right">{money(row.total)}</span>
                        <span className="font-bold text-emerald-600 text-right">{money(row.paid)}</span>
                        <span className="font-bold text-orange-600 text-right">{money(row.remaining)}</span>
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className={`grid grid-cols-3 gap-2 mt-3 pt-3 border-t ${isDarkMode ? "border-slate-800" : "border-gray-200/70"}`}>
                  <div>
                    <p className="text-[9px] uppercase font-black text-gray-400">{t.totalTax}</p>
                    <p className="font-black text-sm mt-0.5">{money(totals.total)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] uppercase font-black text-gray-400">{t.paidAmount}</p>
                    <p className="font-black text-sm text-emerald-600 mt-0.5">{money(totals.paid)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-black text-gray-400">{t.remainingTax}</p>
                    <p className="font-black text-sm text-orange-600 mt-0.5">{money(totals.remaining)}</p>
                  </div>
                </div>

                {isFine && categoryBills.find((b) => b.taxType === "fine") && (
                  <button
                    type="button"
                    onClick={() => {
                      const fineBill = categoryBills.find((b) => b.taxType === "fine");
                      setSelectedFineForModal(fineBill);
                      setShowFineModal(true);
                    }}
                    className="w-full mt-3.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-extrabold py-2 rounded-xl text-[10px] transition uppercase tracking-wider flex items-center justify-center gap-1 border border-orange-200"
                  >
                    {language === "mr" ? "📄 दंडाचे कारण पहा" : "📄 View Fine Reason"}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "completed") return app.status === "completed";
    if (filterStatus === "pending") return app.status === "pending" || app.status === "need_documents";
    return true;
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-slate-950" : "bg-gray-50"}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className={`h-screen overflow-hidden font-sans flex flex-col md:flex-row transition-colors duration-300 ${isDarkMode
      ? "bg-slate-950 text-slate-100"
      : "bg-gradient-to-br from-green-50/50 via-white to-orange-50/50 text-gray-800"
      }`}>

      {/* SIDEBAR FOR DESKTOP */}
      <aside className={`hidden md:flex md:w-64 p-6 flex-col justify-between shadow-2xl relative transition-colors duration-300 ${isDarkMode ? "bg-slate-900 border-r border-slate-800 text-white" : "bg-green-900 text-white"
        }`}>
        <div className="space-y-8">
          {/* LOGO */}
          <div className={`flex flex-col border-b pb-4 gap-3 ${isDarkMode ? "border-slate-800" : "border-green-800"}`}>
            {/* Row for Logo Circle + Grampanchayat Name */}
            {(() => {
              const gpVillageName = config?.gpName ? config.gpName.replace(/ग्रामपंचायत/g, "").trim() : "गोमेवाडी";
              return (
                <div className="flex items-center gap-3">
                  <img
                    src="/images/satyamev.jpg"
                    alt="Logo"
                    className="h-14 w-14 rounded-full object-cover border-2 border-white shadow shrink-0"
                  />
                  <div className="min-w-0">
                    <h2 className="font-black text-[17px] leading-tight text-white tracking-wide">ग्रामपंचायत</h2>
                    <h3 className="font-black text-[17px] leading-tight text-white mt-0.5 tracking-wide">{gpVillageName}</h3>
                  </div>
                </div>
              );
            })()}
            
            {/* Full width bottom info: Tal & Dist dynamic in Marathi */}
            <div className="flex justify-between items-center text-xs font-black text-gray-100 mt-1">
              <span>ता. {config?.taluka || "आटपाडी"}</span>
              <span>जि. {config?.district || "सांगली"}</span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${isDarkMode ? "bg-slate-800 text-green-400 border border-slate-700" : "bg-white/10 text-orange-300 border border-white/10"}`}>Citizen</span>
            </div>
          </div>

          {/* User profile widget */}
          <div className={`rounded-2xl p-4 border transition ${isDarkMode ? "bg-slate-950/40 border-slate-800" : "bg-green-800/50 border-green-700"
            }`}>
            <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-green-300"}`}>
              {language === "mr" ? "घरमालक" : "Household Head"}
            </p>
            <p className="font-bold text-base truncate">{family?.mainMemberName}</p>
            <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-white/50"}`}>
              {language === "mr" ? `घर क्र: ${family?.houseNumber}` : `House No: ${family?.houseNumber}`}
            </p>
          </div>

          {/* MENU LINKS */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition ${activeTab === "overview" ? "bg-orange-500 text-white shadow-lg" : "hover:bg-green-800/40 text-green-100"
                }`}
            >
              <span>📊 {t.dashboard}</span>
            </button>
            <button
              onClick={() => setActiveTab("taxes")}
              className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition ${activeTab === "taxes" ? "bg-orange-500 text-white shadow-lg" : "hover:bg-green-800/40 text-green-100"
                }`}
            >
              <span>💳 {t.payTaxes}</span>
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition ${activeTab === "applications" ? "bg-orange-500 text-white shadow-lg" : "hover:bg-green-800/40 text-green-100"
                }`}
            >
              <span>📄 {t.certificates}</span>
            </button>
          </nav>
        </div>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition border border-white/20 shadow-md flex items-center justify-center gap-2"
        >
          <span>🚪</span> {t.logout}
        </button>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 pt-6 px-4 md:pt-8 md:px-8 pb-28 md:pb-10 space-y-4 md:space-y-6 overflow-y-auto relative">


        {/* Emerald header navbar for Pay Taxes and Certificates tabs */}
        {activeTab !== "overview" ? (
          <div className="relative overflow-hidden bg-green-900 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-600/30 rounded-full pointer-events-none z-0"></div>
            <div className="absolute -bottom-24 -left-16 w-56 h-56 bg-orange-500/30 rounded-full pointer-events-none z-0"></div>
            <div className="absolute top-1/2 left-[60%] w-16 h-16 bg-yellow-400/30 rounded-full -translate-y-1/2 pointer-events-none z-0"></div>

            <div className="relative z-10">
              <h2 className="text-2xl font-black text-white drop-shadow-md">
                {activeTab === "taxes"
                  ? language === "mr" ? "कर व देयके" : "Tax Details"
                  : activeTab === "taxPayment"
                    ? language === "mr" ? "एकत्रित भरणा" : "Consolidated Payment"
                    : activeTab === "paymentHistory"
                      ? language === "mr" ? "भरणा इतिहास" : "Payment History"
                      : language === "mr" ? "दाखला मागणी अर्ज" : "Certificate Requests"}
              </h2>
              <p className="text-sm text-green-100 font-semibold mt-1">
                {activeTab === "taxes"
                  ? language === "mr"
                    ? "वर्षनिहाय कर आकारणी, भरलेली रक्कम आणि उर्वरित कर तपशील"
                    : "Year-wise assessed, paid and remaining tax details"
                  : activeTab === "taxPayment"
                    ? language === "mr"
                      ? "मागील थकबाकी आणि चालू वर्षाची रक्कम एकत्र भरता येईल"
                      : "Pay previous arrears and current year dues together"
                    : activeTab === "paymentHistory"
                      ? language === "mr"
                        ? "कर भरणा पावत्या, व्यवहार आयडी आणि तारीख-वेळ तपशील"
                        : "Tax receipts, transaction IDs and date-time details"
                      : language === "mr"
                        ? "दाखले अर्ज, शुल्क भरणा आणि अर्ज स्थिती व्यवस्थापन"
                        : "Certificate applications, fee payment and request status management"}
              </p>
            </div>

            {["taxes", "taxPayment", "paymentHistory"].includes(activeTab) && (
              <div className="relative z-10 flex bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("taxes")}
                  className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${activeTab === "taxes"
                    ? "bg-green-700 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <span>{language === "mr" ? "कर व देयके" : "Tax Details"}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${activeTab === "taxes" ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"
                    }`}>
                    {financialYears.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("taxPayment")}
                  className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${activeTab === "taxPayment"
                    ? "bg-green-700 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <span>{language === "mr" ? "भरणा करा" : "Pay"}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${activeTab === "taxPayment" ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"
                    }`}>
                    {paymentGroups.filter((group) => group.remaining > 0).length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("paymentHistory")}
                  className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${activeTab === "paymentHistory"
                    ? "bg-green-700 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <span>{language === "mr" ? "भरणा इतिहास" : "Payment History"}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${activeTab === "paymentHistory" ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"
                    }`}>
                    {payments.length}
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* ──────── TAB 1: OVERVIEW ──────── */}
        {activeTab === "overview" && (
          <div className="space-y-6 flex flex-col">

            {/* Welcome Greeting Banner (Restricted to dashboard tab) */}
            <div className={`relative rounded-3xl pt-8 pb-5 px-6 md:pt-10 md:pb-6 md:px-8 border shadow-sm overflow-hidden transition-colors duration-300 ${isDarkMode
              ? "bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border-slate-850 text-white"
              : "bg-gradient-to-br from-green-50/50 via-emerald-50/25 to-white border-green-100/70 text-gray-800"
              }`}>
              {/* Multi-angle Designer Circles */}
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-green-500/5 blur-sm pointer-events-none"></div>
              <div className="absolute top-1/2 -translate-y-1/2 -right-16 w-36 h-36 rounded-full bg-green-100/50 pointer-events-none"></div>

              {/* GP Logo & Name Section */}
              <div className={`relative z-30 border-b pb-4 mb-4 space-y-3 ${isDarkMode ? "border-slate-800" : "border-green-100"}`}>

                {/* Line 1: Action icons at the right */}
                <div className="flex items-center justify-end gap-1.5 relative z-30 select-none">
                  {/* Bell Notification Button */}
                  <button
                    onClick={() => {
                      setShowNotifPanel(!showNotifPanel);
                      if (!showNotifPanel) {
                        fetchUserNotifications();
                      }
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 relative group ${isDarkMode ? "hover:bg-slate-800 text-slate-350 hover:text-white" : "hover:bg-green-50 text-green-800"}`}
                    title={t.notifications}
                  >
                    <div className="relative">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {unreadNotifCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow">
                          {unreadNotifCount}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Dark Mode toggle button */}
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group ${isDarkMode ? "hover:bg-slate-800 text-yellow-300" : "hover:bg-green-50 text-amber-500"}`}
                    title={isDarkMode ? "Light Mode" : "Dark Mode"}
                  >
                    {isDarkMode ? (
                      <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.93 4.93l1.59 1.59m10.96 10.96l1.59 1.59M3 12h2.25m13.5 0H21m-16.07 7.07l1.59-1.59M16.93 7.07l1.59-1.59M12 8a4 4 0 100 8 4 4 0 000-8z" />
                      </svg>
                    )}
                  </button>

                  {/* Hamburger Menu Button (3 lines) */}
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`w-9 h-9 rounded-full flex flex-col justify-center items-center gap-1.5 transition-all duration-300 ${isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-green-50 text-green-800"}`}
                    title="Menu"
                  >
                    <span className={`w-5 h-0.5 transition-all duration-300 ${isDarkMode ? "bg-slate-300" : "bg-green-800"} ${showMenu ? "rotate-45 translate-y-2" : ""}`} />
                    <span className={`w-5 h-0.5 transition-all duration-300 ${isDarkMode ? "bg-slate-300" : "bg-green-800"} ${showMenu ? "opacity-0" : ""}`} />
                    <span className={`w-5 h-0.5 transition-all duration-300 ${isDarkMode ? "bg-slate-300" : "bg-green-800"} ${showMenu ? "-rotate-45 -translate-y-2" : ""}`} />
                  </button>

                  {/* Dropdown Menu Popup */}
                  {showMenu && (
                    <div className={`absolute top-11 right-0 w-48 rounded-2xl shadow-xl border p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 z-50 ${
                      isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-gray-200 text-gray-800"
                    }`}>
                      {/* Language Selection */}
                      <div>
                        <p className="text-[9px] uppercase tracking-wider font-extrabold opacity-60 mb-1.5">
                          {language === "mr" ? "भाषा / Language" : "Language"}
                        </p>
                        <div className={`flex rounded-lg p-0.5 ${isDarkMode ? "bg-slate-950" : "bg-slate-100"}`}>
                          <button
                            onClick={() => {
                              setLanguage("mr");
                              setShowMenu(false);
                            }}
                            className={`flex-1 py-1 rounded text-[10px] font-black transition ${
                              language === "mr" 
                                ? "bg-green-700 text-white shadow-sm" 
                                : isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-gray-650 hover:text-gray-900"
                            }`}
                          >
                            मराठी
                          </button>
                          <button
                            onClick={() => {
                              setLanguage("en");
                              setShowMenu(false);
                            }}
                            className={`flex-1 py-1 rounded text-[10px] font-black transition ${
                              language === "en" 
                                ? "bg-green-700 text-white shadow-sm" 
                                : isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-gray-650 hover:text-gray-900"
                            }`}
                          >
                            En
                          </button>
                        </div>
                      </div>

                      <div className={`border-t ${isDarkMode ? "border-slate-800" : "border-gray-100"}`} />

                      {/* Logout Action */}
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full text-left py-1 flex items-center gap-2 text-[11px] font-bold text-red-500 hover:text-red-605 transition"
                      >
                        <span>🚪</span>
                        <span>{language === "mr" ? "बाहेर पडा (Logout)" : "Logout"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Line 2: GP Logo & Name */}
                <div className="flex items-center gap-4">
                  <img
                    src="/images/satyamev.jpg"
                    alt="GP Logo"
                    className="h-14 w-14 md:h-16 md:w-16 rounded-full border-2 border-white shadow object-cover shrink-0"
                  />
                  <div>
                    <h2 className={`text-lg md:text-2xl font-black tracking-tight ${isDarkMode ? "text-green-400" : "text-green-800"}`}>
                      {config?.gpName || "ग्रामपंचायत गोमेवाडी"}
                    </h2>
                    <p className={`text-[10px] md:text-xs font-semibold mt-0.5 ${isDarkMode ? "text-slate-400" : "text-gray-555"}`}>
                      {config?.taluka && `ता. ${config.taluka}`}{config?.district && ` | जि. ${config.district}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Left part: Welcome message */}
              <div className="space-y-2 relative z-10">
                <h1 className={`text-lg md:text-xl font-black tracking-tight transition-colors duration-300 ${isDarkMode ? "text-green-400" : "text-green-700"
                  }`}>
                  {language === "en" ? `Hello, ${family?.mainMemberName || "Citizen"}!` : `नमस्कार, ${family?.mainMemberName || "नागरिक"}!`} <span className="inline-block hover:animate-bounce cursor-default select-none">👋</span>
                </h1>
                <p className={`text-sm leading-relaxed font-semibold transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                  {language === "en" 
                    ? "Welcome to your digital Grampanchayat portal. Here you can apply for various certificates, pay house tax, water tax, and other taxes to obtain official receipts." 
                    : "आपल्या डिजिटल ग्रामपंचायत पोर्टलवर आपले सहर्ष स्वागत आहे. येथून आपण विविध दाखल्यांचे अर्ज करू शकता, घरपट्टी, पाणीपट्टी आणि इतर कर भरून शासकीय पावत्या प्राप्त करू शकता."}
                </p>

              </div>
            </div>

            {/* STATS METERS */}
            <div className="order-2 md:order-1 grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4 md:mt-0">
              <div className={`rounded-3xl p-6 shadow border flex flex-col justify-between hover:shadow-lg transition duration-200 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-green-100"
                }`}>
                <span className="text-gray-400 text-sm font-semibold">{t.outstandingBalance}</span>
                <span className={`text-3xl font-black mt-2 ${calculateTotalDues() > 0 ? "text-amber-600" : "text-green-600"}`}>
                  ₹{calculateTotalDues()}
                </span>
                <button onClick={() => setActiveTab("taxes")} className="text-xs font-bold text-green-700 hover:underline mt-4 text-left">
                  {t.viewDetails}
                </button>
              </div>

              <div className={`rounded-3xl p-6 shadow border flex flex-col justify-between hover:shadow-lg transition duration-200 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-green-100"
                }`}>
                <span className="text-gray-400 text-sm font-semibold">{t.applicationCount}</span>
                <span className="text-3xl font-black text-green-600 mt-2">{applications.length}</span>
                <button onClick={() => setActiveTab("applications")} className="text-xs font-bold text-green-700 hover:underline mt-4 text-left">
                  {t.applyNow}
                </button>
              </div>

              <div className={`rounded-3xl p-6 shadow border flex flex-col justify-between hover:shadow-lg transition duration-200 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-green-100"
                }`}>
                <span className="text-gray-400 text-sm font-semibold">{t.completedCertificates}</span>
                <span className="text-3xl font-black text-green-600 mt-2">
                  {applications.filter(a => a.status === "completed").length}
                </span>
                <button onClick={() => setActiveTab("applications")} className="text-xs font-bold text-green-700 hover:underline mt-4 text-left">
                  {t.downloadNow}
                </button>
              </div>
            </div>

            {/* Restructured Household Profile Grid */}
            <div className="order-1 md:order-2 grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Profile Card (1/3 width) */}
              <div className="bg-gradient-to-br from-green-900 to-green-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8"></div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl shadow">
                      👤
                    </div>
                    <div>
                      <span className="text-[10px] text-green-200 font-bold uppercase tracking-widest">{t.headOfFamily}</span>
                      <h4 className="text-lg font-black tracking-tight mt-0.5">{family?.mainMemberName}</h4>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-green-200">{t.houseNumber}:</span>
                      <span className="font-bold bg-white/10 px-2.5 py-1 rounded-lg">{family?.houseNumber}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-green-200">{language === "mr" ? "नोंदणीकृत ईमेल (Email):" : "Registered Email:"}</span>
                      <span className="font-bold">{family?.email}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-green-200">{t.whatsappContact}:</span>
                      <span className="font-bold">{family?.whatsappNumber || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4 text-xs text-green-100/70">
                  <p className="font-bold uppercase text-[9px] tracking-wider text-green-300">{t.registeredAddress}</p>
                  <p className="mt-1 font-medium leading-relaxed">{family?.address || "Gomevadi, Maharashtra, India"}</p>
                </div>
              </div>

              {/* Household Stats & Details Grid (2/3 width) */}
              <div className={`lg:col-span-2 rounded-3xl p-6 shadow-md border flex flex-col justify-between relative overflow-hidden ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-green-50"
                }`}>
                {/* Decorative Corner Circles */}
                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-green-500/5 pointer-events-none"></div>
                <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-orange-500/5 pointer-events-none"></div>

                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-5 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-green-700/10 text-green-700 flex items-center justify-center font-black text-sm">F</span>
                    {t.familyProfile}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                    {/* Men */}
                    <div className={`border rounded-2xl p-4 text-center transition duration-300 group relative overflow-hidden ${isDarkMode
                      ? "bg-slate-950/40 border-slate-800 hover:bg-slate-950 hover:border-blue-500/50"
                      : "bg-blue-50/10 border-blue-100 hover:bg-blue-50/30 hover:border-blue-300"
                      }`}>
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-500/10 group-hover:scale-125 transition duration-300"></div>
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-2.5 group-hover:bg-blue-500/20 transition duration-300">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase block tracking-wider">{t.men}</span>
                      <span className={`text-2xl font-black transition mt-1 block ${isDarkMode ? "text-slate-100" : "text-gray-800"}`}>
                        {family?.menCount ?? 0}
                      </span>
                    </div>

                    {/* Women */}
                    <div className={`border rounded-2xl p-4 text-center transition duration-300 group relative overflow-hidden ${isDarkMode
                      ? "bg-slate-950/40 border-slate-800 hover:bg-slate-950 hover:border-pink-500/50"
                      : "bg-pink-50/10 border-pink-100 hover:bg-pink-50/30 hover:border-pink-300"
                      }`}>
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-pink-500/10 group-hover:scale-125 transition duration-300"></div>
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center mx-auto mb-2.5 group-hover:bg-pink-500/20 transition duration-300">
                        <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase block tracking-wider">{t.women}</span>
                      <span className={`text-2xl font-black transition mt-1 block ${isDarkMode ? "text-slate-100" : "text-gray-800"}`}>
                        {family?.womenCount ?? 0}
                      </span>
                    </div>

                    {/* Seniors */}
                    <div className={`border rounded-2xl p-4 text-center transition duration-300 group relative overflow-hidden ${isDarkMode
                      ? "bg-slate-950/40 border-slate-800 hover:bg-slate-950 hover:border-amber-500/50"
                      : "bg-amber-50/10 border-amber-100 hover:bg-amber-50/30 hover:border-amber-300"
                      }`}>
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-500/10 group-hover:scale-125 transition duration-300"></div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-2.5 group-hover:bg-amber-500/20 transition duration-300">
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase block tracking-wider">{t.seniors}</span>
                      <span className={`text-2xl font-black transition mt-1 block ${isDarkMode ? "text-slate-100" : "text-gray-800"}`}>
                        {family?.seniorCount ?? 0}
                      </span>
                    </div>
                    {/* Children */}
                    <div className={`border rounded-2xl p-4 text-center transition duration-300 group relative overflow-hidden ${isDarkMode
                      ? "bg-slate-950/40 border-slate-800 hover:bg-slate-950 hover:border-green-500/50"
                      : "bg-green-50/10 border-green-100 hover:bg-green-50/30 hover:border-green-300"
                      }`}>
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-green-500/10 group-hover:scale-125 transition duration-300"></div>
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-2.5 group-hover:bg-green-500/20 transition duration-300">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase block tracking-wider">{t.children}</span>
                      <span className={`text-2xl font-black transition mt-1 block ${isDarkMode ? "text-slate-100" : "text-gray-800"}`}>
                        {family?.childrenCount ?? 0}
                      </span>
                    </div>

                  </div>
                </div>

                <div className={`mt-6 border p-4 rounded-2xl text-xs relative z-10 ${isDarkMode ? "bg-slate-950/40 border-slate-800 text-slate-400" : "bg-orange-50/40 border-orange-100/60 text-orange-800"
                  }`}>
                  <p className="font-bold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none">!</span>
                    {t.noteTitle}
                  </p>
                  <p className="mt-1 font-medium leading-relaxed font-sans">
                    {t.noteText}
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ──────── TAB 2: TAXES ──────── */}
        {activeTab === "taxes" && (
          yearlyTaxStatement
        )}

        {/* ──────── TAB: TAX PAYMENT ──────── */}
        {activeTab === "taxPayment" && (
          <div className={`relative overflow-hidden shadow-xl p-5 md:p-6 border transition-all duration-300 rounded-3xl ${isDarkMode
            ? "bg-slate-900 border-emerald-800/80"
            : "bg-gradient-to-br from-white via-green-50/20 to-orange-50/30 border-green-100"
            }`}>
            <div className={`relative z-10 mb-5 rounded-2xl border p-4 ${isDarkMode ? "bg-slate-950/40 border-slate-800" : "bg-white/80 border-green-100"}`}>
              <p className="text-[10px] uppercase tracking-[0.18em] font-black text-orange-600">
                {language === "mr" ? "एकत्रित भरणा" : "Consolidated payment"}
              </p>
              <h3 className={`text-xl font-black mt-1 ${isDarkMode ? "text-green-400" : "text-green-800"}`}>
                {language === "mr" ? "कर व देयके - सर्व वर्षे" : "Pay taxes — all financial years"}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed font-semibold">
                {language === "mr"
                  ? "प्रत्येक गटातील मागील सर्व थकबाकी आणि चालू वर्षाची रक्कम एकत्र दाखवली आहे. अंशतः भरणा केल्यास सर्वात जुन्या वर्षाची थकबाकी प्रथम भरली जाईल."
                  : "Each group combines all previous arrears with the current year. Partial payments are always applied to the oldest outstanding bill first."}
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {paymentGroups.map((group) => {
                const isPaid = group.remaining === 0;
                const val = payAmounts[group.id] ?? "";
                const isFine = group.id === "fine";
                const accent = isFine
                  ? {
                    icon: "bg-orange-50 text-orange-700 border-orange-100",
                    border: "border-orange-200",
                    panel: "bg-orange-50/50 border-orange-100",
                    amount: "text-orange-700",
                  }
                  : {
                    icon: "bg-green-50 text-green-700 border-green-100",
                    border: "border-green-200",
                    panel: "bg-green-50/60 border-green-100",
                    amount: "text-green-700",
                  };
                return (
                  <article key={group.id} className={`relative overflow-hidden rounded-2xl border bg-white p-4 md:p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${accent.border}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className={`h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 ${accent.icon}`}>
                          <TaxCategoryIcon categoryId={group.id} className="h-6 w-6" />
                        </span>
                        <div>
                          <h4 className="font-black text-sm text-green-900">
                            {CATEGORY_NAMES[group.id][language]}
                          </h4>
                          <p className="text-[10px] text-green-700/70 mt-1 font-bold">
                            {language === "mr" ? "वैयक्तिक वर्ष निवडण्याची गरज नाही" : "No individual year selection needed"}
                          </p>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black ${isPaid ? "bg-green-50 text-green-700 border border-green-100" : "bg-orange-50 text-orange-700 border border-orange-100"}`}>
                        {isPaid ? t.paid : t.pending}
                      </span>
                    </div>

                    <div className={`grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-3 rounded-2xl border p-4 mt-4 ${accent.panel}`}>
                      <div>
                        <p className="text-[9px] uppercase font-black text-green-700/70">
                          {language === "mr" ? "मागील वर्षांची थकबाकी" : "Previous-year arrears"}
                        </p>
                        <p className="text-lg font-black text-orange-600 mt-0.5">{money(group.previousDue)}</p>
                      </div>
                      <span className="hidden sm:flex items-center justify-center self-center px-1 text-green-700 font-black">+</span>
                      <div className="sm:text-center">
                        <p className="text-[9px] uppercase font-black text-green-700/70">
                          {language === "mr" ? `चालू वर्ष ${currentFinancialYear}-${currentFinancialYear + 1}` : `Current FY ${currentFinancialYear}-${currentFinancialYear + 1}`}
                        </p>
                        <p className="text-lg font-black text-green-700 mt-0.5">{money(group.currentDue)}</p>
                      </div>
                      <span className="hidden sm:flex items-center justify-center self-center px-1 text-orange-600 font-black">=</span>
                      <div className="sm:text-right">
                        <p className="text-[9px] uppercase font-black text-green-700/70">
                          {language === "mr" ? "एकूण देय रक्कम" : "Total payable"}
                        </p>
                        <p className={`text-xl font-black mt-0.5 ${isPaid ? "text-green-600" : accent.amount}`}>{money(group.remaining)}</p>
                      </div>
                    </div>

                    {group.futureDue > 0 && (
                      <p className="mt-3 text-[10px] font-bold text-orange-700">
                        {language === "mr" ? "आगामी वर्षांची देय रक्कम" : "Future-year dues"}: {money(group.futureDue)}
                      </p>
                    )}

                    {!isPaid && (
                      <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/60 p-3">
                        <p className="text-[10px] font-bold text-orange-700 mb-3">
                          {language === "mr"
                            ? "अंशतः रक्कम भरू शकता; ती सर्वात जुन्या थकबाकीमध्ये प्रथम जमा होईल."
                            : "You may pay partially; it will be credited against the oldest arrears first."}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="relative w-full">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-green-900 font-black text-sm">
                              ₹
                            </span>
                            <input
                              type="number"
                              placeholder={t.enterAmount}
                              value={val}
                              max={group.remaining}
                              min={1}
                              onChange={(event) => setPayAmounts({ ...payAmounts, [group.id]: event.target.value })}
                              className="border border-orange-200 outline-none pl-8 pr-3 py-3 rounded-xl w-full font-black text-sm focus:ring-4 focus:ring-orange-500/10 text-green-900 bg-white"
                            />
                          </div>
                          <button
                            onClick={() => handlePayCategory(group)}
                            disabled={processingId !== null}
                            className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-black py-3 px-5 rounded-xl shadow-lg shadow-green-900/20 whitespace-nowrap text-sm transition"
                          >
                            <RazorpayMark />
                            {processingId === group.id ? t.processing : t.payOnline}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ──────── TAB: PAYMENT HISTORY ──────── */}
        {activeTab === "paymentHistory" && (
          <div className={`rounded-3xl shadow p-6 border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-green-100"
            }`}>
            <h3 className={`text-lg font-black mb-4 pb-2 border-b-2 transition-colors duration-300 ${isDarkMode ? "border-emerald-800/80 text-emerald-400" : "border-green-800 text-green-800"
              }`}>{t.receiptsLedger}</h3>
            {payments.length === 0 ? (
              <p className="text-gray-500 text-center py-10 text-sm">{t.noPayments}</p>
            ) : (
              <div className="space-y-4">
                {payments.map((p) => (
                  <div key={p._id} className={`rounded-2xl border p-4 ${isDarkMode ? "bg-slate-950/40 border-slate-800" : "bg-green-50/20 border-green-100"}`}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 text-sm font-bold">
                      <span className="capitalize">
                        {p.taxType === "house" ? t.taxTypeHouse :
                          p.taxType === "water" ? t.taxTypeWater :
                            p.taxType === "fine" ? t.taxTypeFine :
                              p.taxType === "health" ? t.taxTypeHealth :
                                `${p.taxType} Tax`}
                      </span>
                      <span className="text-green-600 text-base font-black">+₹{p.amountPaid}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-400 mt-2">
                      <span>{formatPaymentDateTime(p.paymentDate)}</span>
                      <span className={`uppercase text-[9px] px-2 py-1 rounded-lg font-bold w-fit ${isDarkMode ? "bg-slate-900 text-slate-400" : "bg-white text-gray-600"
                        }`}>
                        {p.paymentMethod}
                      </span>
                    </div>
                    {Array.isArray(p.allocations) && p.allocations.length > 1 && (
                      <div className={`mt-3 rounded-xl border p-3 ${isDarkMode ? "border-slate-800 bg-slate-900/70" : "border-green-100 bg-white/70"}`}>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Tax details</p>
                        <div className="space-y-1.5">
                          {p.allocations.map((item, index) => (
                            <div key={`${p._id}-${item.billId || index}`} className="grid grid-cols-[1fr_auto] gap-3 text-xs">
                              <span className={isDarkMode ? "text-slate-300" : "text-gray-600"}>
                                FY {item.year}-{Number(item.year) + 1} | {getPaymentBucketLabel(item.year)} | {getTaxLabel(item.taxType)}
                              </span>
                              <span className="font-black text-green-700">+Rs. {item.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-[10px] text-gray-400 font-mono truncate">ID: {p.transactionId}</p>
                        <p className="text-[10px] font-bold text-orange-600 mt-1">
                          Remaining to pay: Rs. {getRemainingForPayment(p).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleGenerateReceipt(p)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-2 text-[11px] font-black text-white shadow-sm hover:bg-orange-700 transition"
                      >
                        Generate Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ──────── TAB 3: APPLICATIONS ──────── */}
        {activeTab === "applications" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Application request form (1/3 width) */}
            <div className="space-y-6">
              <div className={`rounded-3xl shadow p-6 border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-green-100"
                }`}>
                <h3 className={`text-lg font-black mb-4 pb-2 border-b-2 transition-colors duration-300 ${isDarkMode ? "border-emerald-800/80 text-emerald-400" : "border-emerald-700 text-emerald-700"
                  }`}>
                  {editingApplication 
                    ? (language === "mr" ? "अर्ज दुरुस्ती करा" : "Edit Application Details")
                    : t.applyCertificate}
                </h3>
                <form onSubmit={handleApplyCertificate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{t.selectType}</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      disabled={!!editingApplication}
                      className={`border p-2.5 rounded-xl w-full max-w-full truncate text-xs font-bold outline-none ${
                        editingApplication ? "bg-slate-100 text-gray-500 opacity-80 cursor-not-allowed" : ""
                      } ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-green-600 text-gray-800"
                        }`}
                    >
                      <option value="birth">{t.birthReg}</option>
                      <option value="death">{t.deathReg}</option>
                      <option value="marriage">{t.marriageReg}</option>
                      <option value="8a">{t.transcript8a}</option>
                      <option value="nodues">{t.noDuesReg}</option>
                      <option value="bpl">{t.bplReg}</option>
                      <option value="destitute">{t.destituteReg}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{t.applicantName}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Shete"
                      value={form.forName}
                      onChange={(e) => setForm({ ...form, forName: e.target.value })}
                      className={`border p-2.5 rounded-xl w-full text-xs outline-none ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-green-200 text-gray-855"
                        }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{t.whatsappNumber}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543210"
                      value={form.whatsappNo}
                      onChange={(e) => setForm({ ...form, whatsappNo: e.target.value })}
                      className={`border p-2.5 rounded-xl w-full text-xs outline-none ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-green-200 text-gray-855"
                        }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{t.emailAddress}</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={`border p-2.5 rounded-xl w-full text-xs outline-none ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-green-200 text-gray-855"
                        }`}
                    />
                  </div>

                  {/* DYNAMIC FORMS STACK */}
                  {form.type === "birth" && (
                    <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-green-50/50 border-green-100"
                      }`}>
                      <p className="text-xs font-extrabold text-green-700 uppercase">👶 {t.birthReg}</p>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.childName}</label>
                        <input
                          type="text"
                          required
                          value={form.childName}
                          onChange={(e) => setForm({ ...form, childName: e.target.value })}
                          className={`border p-2 rounded-xl w-full text-xs outline-none ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-green-200"
                            }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.dob}</label>
                        <input
                          type="date"
                          required
                          value={form.dob}
                          onChange={(e) => setForm({ ...form, dob: e.target.value })}
                          className={`border p-2 rounded-xl w-full text-xs outline-none ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-green-200"
                            }`}
                        />
                      </div>
                    </div>
                  )}

                  {form.type === "death" && (
                    <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-green-50/50 border-green-100"
                      }`}>
                      <p className="text-[10px] font-bold text-green-700 uppercase">🪦 {t.deathReg}</p>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t.deceasedName}</label>
                        <input
                          type="text"
                          required
                          value={form.deathName}
                          onChange={(e) => setForm({ ...form, deathName: e.target.value })}
                          className={`border p-2 rounded-xl w-full text-xs outline-none ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-green-200"
                            }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t.dateOfDeath}</label>
                        <input
                          type="date"
                          required
                          value={form.deathDate}
                          onChange={(e) => setForm({ ...form, deathDate: e.target.value })}
                          className={`border p-2 rounded-xl w-full text-xs outline-none ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-green-200"
                            }`}
                        />
                      </div>
                    </div>
                  )}

                  {form.type === "marriage" && (
                    <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-green-50/50 border-green-100"
                      }`}>
                      <p className="text-[10px] font-bold text-green-700 uppercase">💍 {t.marriageReg}</p>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t.coupleName}</label>
                        <input
                          type="text"
                          required
                          placeholder="Husband & Wife Names"
                          value={form.coupleName}
                          onChange={(e) => setForm({ ...form, coupleName: e.target.value })}
                          className={`border p-2 rounded-xl w-full text-xs outline-none ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-green-200"
                            }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t.marriageYear}</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 2024"
                          value={form.marriageYear}
                          onChange={(e) => setForm({ ...form, marriageYear: e.target.value })}
                          className={`border p-2 rounded-xl w-full text-xs outline-none ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-green-200"
                            }`}
                        />
                      </div>
                    </div>
                  )}

                  {form.type === "8a" && (
                    <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-green-50/50 border-green-100"
                      }`}>
                      <p className="text-[10px] font-bold text-green-700 uppercase">📄 {t.transcript8a}</p>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t.propertyNo}</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 182"
                          value={form.propertyNo}
                          onChange={(e) => setForm({ ...form, propertyNo: e.target.value })}
                          className={`border p-2 rounded-xl w-full text-xs outline-none ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-green-200"
                            }`}
                        />
                      </div>
                    </div>
                  )}

                  {form.type === "destitute" && (
                    <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-green-50/50 border-green-100"
                      }`}>
                      <p className="text-[10px] font-bold text-green-700 uppercase">🤝 {t.destituteReg}</p>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t.niradharName}</label>
                        <input
                          type="text"
                          required
                          value={form.niradharName}
                          onChange={(e) => setForm({ ...form, niradharName: e.target.value })}
                          className={`border p-2 rounded-xl w-full text-xs outline-none ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-green-200"
                            }`}
                        />
                      </div>
                    </div>
                  )}

                  {(form.type === "bpl" || form.type === "nodues") && (
                    <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-green-50/50 border-green-100"
                      }`}>
                      <p className="text-[10px] font-bold text-green-700 uppercase">📑 {t.selectType}</p>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t.certificateName}</label>
                        <input
                          type="text"
                          required
                          value={form.certificateName}
                          onChange={(e) => setForm({ ...form, certificateName: e.target.value })}
                          className={`border p-2 rounded-xl w-full text-xs outline-none ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-green-200"
                            }`}
                        />
                      </div>
                    </div>
                  )}

                                    <button
                    type="submit"
                    disabled={submittingApp}
                    className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl shadow transition text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    {!submittingApp && !editingApplication && <RazorpayMark />}
                    {!submittingApp && !editingApplication && ['à¤œà¤¨à¥ à¤® à¤¨à¥‹à¤‚à¤¦', 'à¤®à¥ƒà¤¤à¥ à¤¯à¥‚ à¤¨à¥‹à¤‚à¤¦', 'à¤µà¤¿à¤µà¤¾à¤¹ à¤¨à¥‹à¤‚à¤¦à¤£à¥€ à¤¦à¤¾à¤–à¤²à¤¾', 'à¥® à¤… à¤‰à¤¤à¤¾à¤°à¤¾', 'à¤—à¥ à¤°à¤¾à¤®à¤ªà¤‚à¤šà¤¾à¤¯à¤¤ à¤¯à¥‡à¤£à¥‡ à¤¬à¤¾à¤•à¥€ à¤¦à¤¾à¤–à¤²à¤¾'].includes(form.type) && <RazorpayMark />}
                    {submittingApp 
                      ? (editingApplication ? (language === "mr" ? "अद्ययावत होत आहे..." : "Updating...") : t.submitting) 
                      : (editingApplication ? (language === "mr" ? "बदल जतन करा" : "Save Changes") : ['birth', 'death', 'marriage', '8a', 'nodues'].includes(form.type) ? t.submitPay : t.submitFree)}
                  </button>
                  {editingApplication && (
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition mt-2 border"
                    >
                      {language === "mr" ? "रद्द करा" : "Cancel"}
                    </button>
                  )}
                </form>
              </div>
            </div>

            {/* Applications tracker logs (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <div className={`rounded-3xl shadow p-6 border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-green-100"
                }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-2 border-b-2 border-emerald-700/80">
                  <h3 className={`text-lg font-black transition-colors duration-300 ${isDarkMode ? "text-emerald-400" : "text-emerald-700"}`}>
                    {t.applicationsStatus}
                  </h3>
                  <div className="flex bg-green-700 dark:bg-green-800 p-1 rounded-xl gap-1 mt-2 sm:mt-0 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setFilterStatus("pending")}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all duration-200 ${
                        filterStatus === "pending"
                          ? "bg-white text-green-700 shadow-sm"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      {language === "mr" ? "प्रलंबित" : "Pending"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus("completed")}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all duration-200 ${
                        filterStatus === "completed"
                          ? "bg-white text-green-700 shadow-sm"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      {language === "mr" ? "पूर्ण" : "Completed"}
                    </button>
                  </div>
                </div>

                {filteredApplications.length === 0 ? (
                  <p className="text-gray-500 text-center py-10">
                    {applications.length === 0
                      ? t.noApplications
                      : language === "mr"
                        ? "या स्थितीचे कोणतेही अर्ज उपलब्ध नाहीत."
                        : "No applications with this status found."}
                  </p>
                ) : (
                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
                    {filteredApplications.map((app) => (
                      <div key={app._id} className={`border rounded-3xl p-5 flex flex-col justify-between hover:shadow transition duration-200 ${isDarkMode ? "border-slate-800 bg-slate-950/40" : "border-green-100 bg-white"
                        }`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-extrabold text-lg">
                              {app.type === "जन्म नोंद" ? t.birthReg.split(" (")[0] :
                                app.type === "मृत्यू नोंद" ? t.deathReg.split(" (")[0] :
                                  app.type === "विवाह नोंदणी दाखला" ? t.marriageReg.split(" (")[0] :
                                    app.type === "८ अ उतारा" ? t.transcript8a.split(" (")[0] :
                                      app.type === "ग्रामपंचायत येणे बाकी दाखला" ? t.noDuesReg.split(" (")[0] :
                                        app.type === "दारिद्र्य रेषेखाली असल्याचा दाखला" ? t.bplReg.split(" (")[0] :
                                          app.type === "निराधार असल्याचा दाखला मागणी" ? t.destituteReg.split(" (")[0] :
                                            app.type}
                            </h4>
                            <p className="text-xs text-gray-400 font-bold">{t.applicantName}: {app.applicantName}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{t.date}: {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : app.status === "need_documents"
                                ? "bg-red-100 text-red-600"
                                : "bg-orange-100 text-orange-600"
                              }`}>
                              {app.status === "completed" ? "Completed" : app.status === "need_documents" ? "Need Documents" : "Pending"}
                            </span>
                            {app.status === "pending" && (
                              <button
                                type="button"
                                onClick={() => startEditing(app)}
                                className="text-[10px] font-black text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-xl transition"
                              >
                                {language === "mr" ? "दुरुस्ती करा" : "Edit"}
                              </button>
                            )}
                          </div>
                        </div>

                        {app.details && (
                          <div className={`text-xs p-4 rounded-2xl border mb-3 space-y-1 font-medium ${isDarkMode ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-gray-50 border-gray-100 text-gray-600"
                            }`}>
                            {app.details.whatsappNo && <p>💬 {t.whatsappNumber}: <span className="font-bold">{app.details.whatsappNo}</span></p>}
                            {app.details.email && <p>✉️ {t.emailAddress}: <span className="font-bold">{app.details.email}</span></p>}
                            {app.details.transactionId && <p className="font-mono text-[10px]">💳 Payment ID: <span className="text-green-700 font-bold">{app.details.transactionId}</span></p>}
                            {app.details.childName && <p>👶 {t.childName}: <span className="font-bold">{app.details.childName}</span> | {t.dob}: <span className="font-bold">{app.details.dob}</span></p>}
                            {app.details.deathName && <p>🪦 {t.deceasedName}: <span className="font-bold">{app.details.deathName}</span> | {t.date}: <span className="font-bold">{app.details.deathDate}</span></p>}
                            {app.details.coupleName && <p>💍 {t.coupleName}: <span className="font-bold">{app.details.coupleName}</span> | {t.marriageYear}: <span className="font-bold">{app.details.marriageYear}</span></p>}
                            {app.details.propertyNo && <p>🏠 {t.propertyNo}: <span className="font-bold">{app.details.propertyNo}</span></p>}
                            {app.details.niradharName && <p>🤝 {t.niradharName}: <span className="font-bold">{app.details.niradharName}</span></p>}
                            {app.details.certificateName && <p>📑 {t.certificateName}: <span className="font-bold">{app.details.certificateName}</span></p>}
                          </div>
                        )}

                        {/* Admin remarks if any */}
                        {app.remark && (
                          <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r-xl mb-3">
                            <p className="text-xs font-bold text-orange-700">{t.remarks}:</p>
                            <p className="text-sm text-gray-700 mt-0.5">{app.remark}</p>
                          </div>
                        )}

                        {app.status === "completed" && app.documentUrl && (
                          <div className="mt-2 flex justify-start">
                            <a
                              href={app.documentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-green-700 hover:bg-green-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center gap-1.5"
                            >
                              📥 {t.downloadCert}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ──────────────── NOTIFICATION DRAWER ──────────────── */}
      {showNotifPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowNotifPanel(false)}
          />

          {/* Drawer Panel */}
          <div className={`relative w-full max-w-md h-full shadow-2xl flex flex-col transition-transform duration-300 transform translate-x-0 ${isDarkMode ? "bg-slate-900 text-slate-100" : "bg-white text-gray-800"
            }`}>
            {/* Header */}
            <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? "border-slate-800 bg-slate-950/60" : "border-gray-100 bg-slate-50/50"
              }`}>
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <span>🔔</span> {t.notificationTitle}
                </h3>
                {unreadNotifCount > 0 && (
                  <span className="inline-block mt-1 text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    {unreadNotifCount} {t.unread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadNotifCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-green-700 hover:text-green-800 font-bold hover:underline"
                  >
                    {t.markAllRead}
                  </button>
                )}
                <button
                  onClick={() => setShowNotifPanel(false)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold ${isDarkMode ? "border-slate-700 hover:bg-slate-800" : "border-gray-200 hover:bg-gray-100"
                    }`}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingNotifs ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                  <p className="text-xs text-gray-400 font-bold">लोड होत आहे...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-16">
                  <span className="text-4xl">📭</span>
                  <p className="text-gray-450 font-bold mt-3 text-sm">{t.noNotifications}</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => {
                      if (!notif.isRead) {
                        handleMarkRead(notif._id);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition duration-200 cursor-pointer relative group ${!notif.isRead
                      ? isDarkMode
                        ? "bg-slate-800/80 border-l-4 border-l-green-500 border-slate-700"
                        : "bg-green-50/30 border-l-4 border-l-green-700 border-green-150"
                      : isDarkMode
                        ? "bg-slate-900/50 border-slate-800 opacity-75"
                        : "bg-white border-gray-150 opacity-75"
                      }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h5 className="font-extrabold text-xs text-gray-800 dark:text-slate-200">
                        {notif.title}
                      </h5>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-green-600 shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-gray-550 dark:text-slate-400 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-dashed border-gray-200/50 dark:border-slate-800">
                      <span className="text-[9px] text-gray-400 font-semibold">
                        {new Date(notif.createdAt).toLocaleDateString(language === "mr" ? "mr-IN" : "en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        {new Date(notif.createdAt).toLocaleTimeString(language === "mr" ? "mr-IN" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {!notif.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkRead(notif._id);
                          }}
                          className="text-[10px] text-green-700 font-bold hover:underline opacity-0 group-hover:opacity-100 transition"
                        >
                          {language === "mr" ? "वाचले म्हणून नोंदवा" : "Mark read"}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={4000} theme="colored" />

      {/* BOTTOM NAVIGATION FOR MOBILE */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-around items-center py-2.5 border-t backdrop-blur shadow-lg transition-colors duration-300 ${isDarkMode ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-green-100 text-gray-700"
        }`}>
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-extrabold transition ${activeTab === "overview" ? "text-orange-500 scale-105" : "opacity-60 hover:opacity-100"
            }`}
        >
          <span className="text-lg">📊</span>
          <span>{language === "mr" ? "डॅशबोर्ड" : "Dashboard"}</span>
        </button>
        <button
          onClick={() => setActiveTab("taxes")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-extrabold transition ${activeTab === "taxes" ? "text-orange-500 scale-105" : "opacity-60 hover:opacity-100"
            }`}
        >
          <span className="text-lg">💳</span>
          <span>{language === "mr" ? "कर व देयके" : "Pay Taxes"}</span>
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-extrabold transition ${activeTab === "applications" ? "text-orange-500 scale-105" : "opacity-60 hover:opacity-100"
            }`}
        >
          <span className="text-lg">📄</span>
          <span>{language === "mr" ? "दाखला अर्ज" : "Certificates"}</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className={`rounded-3xl p-6 max-w-sm w-full shadow-2xl border animate-in fade-in zoom-in-95 duration-200 ${
            isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-green-150 text-gray-800"
          }`}>
            <h4 className="text-lg font-black mb-3 flex items-center gap-2" style={{ color: isDarkMode ? "#4ade80" : "#15803d" }}>
              <span>🚪 {language === "mr" ? "बाहेर पडा" : "Logout"}</span>
            </h4>
            <p className="text-sm font-semibold mb-6">
              {language === "mr" 
                ? "तुम्हाला खरोखर लॉगआउट करायचे आहे का?" 
                : "Are you sure you want to log out?"}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  isDarkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-350" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {language === "mr" ? "रद्द करा" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-650 hover:bg-red-700 shadow-md transition"
              >
                {language === "mr" ? "बाहेर पडा" : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFineModal && selectedFineForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-6 max-w-md w-full shadow-2xl border animate-in fade-in zoom-in-95 duration-200 ${
            isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-green-150 text-gray-800"
          }`}>
            <h4 className="text-lg font-black mb-2 flex items-center gap-2" style={{ color: isDarkMode ? "#4ade80" : "#14532d" }}>
              <span>⚠️ दंड आकारणी कारणे (Fine Details)</span>
            </h4>
            <p className="text-xs text-gray-400 font-bold mb-4">
              FY {selectedFineForModal.year} - {Number(selectedFineForModal.year) + 1}
            </p>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border text-xs font-semibold space-y-2 ${
                isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100"
              }`}>
                <p className={`${isDarkMode ? "text-slate-350" : "text-gray-650"}`}>
                  <strong>दंड रक्कम:</strong> <span className="text-orange-600 text-sm font-black">₹{selectedFineForModal.amount}</span>
                </p>
                <p className={`${isDarkMode ? "text-slate-350" : "text-gray-650"}`}>
                  <strong>कर स्थिती:</strong>{" "}
                  <span className="font-extrabold">
                    {selectedFineForModal.status === "paid"
                      ? (language === "mr" ? "पूर्ण भरलेला (Paid)" : "Paid")
                      : selectedFineForModal.status === "partial"
                        ? (language === "mr" ? "अंशतः भरलेला (Partially Paid)" : "Partially Paid")
                        : (language === "mr" ? "थकीत (Pending)" : "Pending")}
                  </span>
                </p>
                <p className={`${isDarkMode ? "text-slate-350" : "text-gray-650"}`}>
                  <strong>लागू तारीख:</strong> {new Date(selectedFineForModal.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className={`p-4 rounded-2xl border text-xs ${
                isDarkMode ? "bg-slate-955 border-slate-855 text-slate-300" : "bg-orange-50/40 border-orange-100 text-gray-700"
              }`}>
                <strong className="block text-[10px] uppercase font-black tracking-wider text-orange-650 mb-1">
                  दंड कारण / शेरा (Reason):
                </strong>
                <p className="leading-relaxed font-semibold">
                  {selectedFineForModal.reason || "कोणतेही कारण नमूद केलेले नाही."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowFineModal(false);
                  setSelectedFineForModal(null);
                }}
                className="bg-green-700 hover:bg-green-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition"
              >
                {language === "mr" ? "बंद करा" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
