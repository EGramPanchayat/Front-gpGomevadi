import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axioesInstance from "../utils/axioesInstance";

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
    taxTypeHouse: "House Tax",
    taxTypeWater: "Water Tax",
    taxTypeHealth: "Health Tax",
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
    taxTypeHouse: "घरपट्टी",
    taxTypeWater: "पाणीपट्टी",
    taxTypeHealth: "आरोग्य कर",
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
    noDuesReg: "ग्रामपंचायत येणे बाकी दाखला (₹२०)",
    bplReg: "दारिद्र्य रेषेखाली असल्याचा दाखला (मोफत)",
    destituteReg: "निराधार असल्याचा दाखला मागणी (मोफत)",
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
    remarks: "अधिकारी रिमार्क",
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
  }
};

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState(null);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'taxes', 'applications'
  const [language, setLanguage] = useState(() => localStorage.getItem("lang") || "mr");
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  // Application form states
  const [form, setForm] = useState({
    forName: "",
    whatsappNo: "",
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
  const [submittingApp, setSubmittingApp] = useState(false);

  // Razorpay payment state
  const [payAmounts, setPayAmounts] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const t = translations[language];

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

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
        ]);
      })
      .then((responses) => {
        if (responses) {
          const [taxRes, appRes] = responses;
          setBills(taxRes.data.bills || []);
          setPayments(taxRes.data.payments || []);
          setApplications(appRes.data.applications || []);

          // Initialize payment inputs
          const initialAmounts = {};
          (taxRes.data.bills || []).forEach((b) => {
            initialAmounts[b._id] = b.amount - b.paidAmount;
          });
          setPayAmounts(initialAmounts);
        }
      })
      .catch((err) => {
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
        window.location.href = "/user-login";
      }, 1000);
    } catch {
      localStorage.removeItem("userToken");
      window.location.href = "/user-login";
    }
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

  const handlePay = async (bill) => {
    const payAmt = Number(payAmounts[bill._id]);
    const maxPayable = bill.amount - bill.paidAmount;

    if (isNaN(payAmt) || payAmt <= 0 || payAmt > maxPayable) {
      return toast.error(`Please enter a valid amount between ₹1 and ₹${maxPayable}`);
    }

    setProcessingId(bill._id);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK load failed");
      }

      // Order creation
      const { data: orderData } = await axioesInstance.post("/payments/order", {
        billId: bill._id,
        amount: payAmt,
      });

      if (orderData.mock) {
        toast.info("Sandbox Mode: Simulating secure checkout...");
        setTimeout(async () => {
          try {
            await axioesInstance.post("/payments/verify", {
              billId: bill._id,
              amount: payAmt,
              razorpayOrderId: orderData.orderId,
              razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(7)}`,
              mock: true,
            });
            toast.success("Payment of ₹" + payAmt + " successful!");
            setTimeout(() => window.location.reload(), 1500);
          } catch (verifyErr) {
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
        description: `${bill.taxType.toUpperCase()} TAX (${bill.year})`,
        image: "/images/satyamev.jpg",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            await axioesInstance.post("/payments/verify", {
              billId: bill._id,
              amount: payAmt,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment completed successfully!");
            setTimeout(() => window.location.reload(), 1500);
          } catch (e) {
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
      setApplications(appRes.data.applications || []);
    } catch (err) {
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
            } catch (err) {
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
            } catch (e) {
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
      } catch (err) {
        toast.error("Failed to submit application.");
        setSubmittingApp(false);
      }
    }
  };

  const calculateTotalDues = () => {
    return bills.reduce((sum, b) => sum + (b.amount - b.paidAmount), 0);
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return t.greetingMorning;
    if (hr < 17) return t.greetingAfternoon;
    return t.greetingEvening;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-slate-950" : "bg-gray-50"}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col md:flex-row transition-colors duration-300 ${isDarkMode
      ? "bg-slate-950 text-slate-100"
      : "bg-gradient-to-br from-green-50/50 via-white to-orange-50/50 text-gray-800"
      }`}>

      {/* SIDEBAR FOR DESKTOP */}
      <aside className={`hidden md:flex md:w-64 p-6 flex-col justify-between shadow-2xl relative transition-colors duration-300 ${isDarkMode ? "bg-slate-900 border-r border-slate-800 text-white" : "bg-green-900 text-white"
        }`}>
        <div className="space-y-8">
          {/* LOGO */}
          <div className={`flex items-center gap-3 border-b pb-4 ${isDarkMode ? "border-slate-800" : "border-green-800"}`}>
            <img
              src="/images/satyamev.jpg"
              alt="Logo"
              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow"
            />
            <div>
              <h2 className="font-bold text-lg leading-tight">Gomevadi GP</h2>
              <span className={`text-xs ${isDarkMode ? "text-slate-400" : "text-white/60"}`}>
                {language === "mr" ? "नागरिक डॅशबोर्ड" : "Citizen Dashboard"}
              </span>
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
          onClick={handleLogout}
          className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition border border-white/20 shadow-md flex items-center justify-center gap-2"
        >
          <span>🚪</span> {t.logout}
        </button>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 pt-4 px-4 md:pt-6 md:px-8 pb-28 md:pb-10 space-y-4 md:space-y-6 overflow-y-auto relative">

        {/* Sleek Header Navbar for Pay Taxes and Certificates tabs */}
        {activeTab !== "overview" ? (
          <div className={`relative flex justify-between items-center py-2.5 px-4 mb-4 border rounded-3xl overflow-hidden shadow-sm transition-all duration-300 ${
            isDarkMode 
              ? "bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950 border-slate-850" 
              : "bg-gradient-to-r from-green-50/50 via-white to-emerald-50/30 border-green-100/60"
          }`}>
            {/* Background design elements: absolute colored circles */}
            <div className="absolute -left-6 -top-6 w-16 h-16 rounded-full bg-green-500/5 blur-sm pointer-events-none"></div>
            <div className="absolute right-1/4 -top-8 w-20 h-20 rounded-full bg-emerald-400/5 blur-md pointer-events-none"></div>

            {/* Left side: Person name */}
            <div className="flex items-center gap-2.5 relative z-10">
              <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center shadow-inner transition-colors duration-300 ${
                isDarkMode 
                  ? "bg-slate-900 border border-slate-800 text-green-400" 
                  : "bg-green-100/60 border border-green-200/50 text-green-750"
              }`}>
                <span className="text-sm">👤</span>
              </div>
              <div>
                <h2 className={`text-sm font-black tracking-tight leading-tight ${isDarkMode ? "text-slate-100" : "text-green-900"}`}>
                  {family?.mainMemberName}
                </h2>
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 leading-none ${isDarkMode ? "text-slate-500" : "text-green-700/70"}`}>
                  {t.headOfFamily} | ID: {family?.familyId}
                </p>
              </div>
            </div>

            {/* Right side: Language & Dark mode toggle capsule */}
            <div className={`flex items-center gap-3 p-1 rounded-full border transition z-30 shadow-[0_4px_20px_rgba(0,0,0,0.04)] ${isDarkMode
                ? "border-slate-800 bg-slate-950/90 backdrop-blur-md"
                : "border-green-200/70 bg-white/95 backdrop-blur-md"
              }`}>
              {/* Cylinder language buttons */}
              <div className="flex items-center">
                <button
                  onClick={() => setLanguage("mr")}
                  className={`px-3.5 py-1 rounded-full text-xs font-black transition-all duration-300 ${language === "mr"
                      ? "bg-gradient-to-r from-green-700 to-emerald-800 text-white shadow scale-105"
                      : isDarkMode
                        ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                        : "text-green-800/85 hover:text-green-950 hover:bg-green-50"
                    }`}
                >
                  मराठी
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3.5 py-1 rounded-full text-xs font-black transition-all duration-300 ${language === "en"
                      ? "bg-gradient-to-r from-green-700 to-emerald-800 text-white shadow scale-105"
                      : isDarkMode
                        ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                        : "text-green-800/85 hover:text-green-905 hover:bg-green-50"
                    }`}
                >
                  En
                </button>
              </div>

              {/* Divider line */}
              <div className={`h-4 w-px ${isDarkMode ? "bg-slate-800" : "bg-green-200"}`}></div>

              {/* Dark Mode toggle button */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group ${isDarkMode ? "hover:bg-slate-800 text-yellow-300" : "hover:bg-green-50 text-amber-500"
                  }`}
                title={isDarkMode ? "Light Mode" : "Dark Mode"}
              >
                {isDarkMode ? (
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-300 drop-shadow-[0_0_5px_rgba(253,224,71,0.6)] transition-all duration-300 transform group-hover:rotate-12 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                    <span className="absolute -top-1 -right-0.5 text-[8px] text-yellow-200 animate-pulse select-none">✦</span>
                  </div>
                ) : (
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)] transition-all duration-300 transform group-hover:rotate-45 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.93 4.93l1.59 1.59m10.96 10.96l1.59 1.59M3 12h2.25m13.5 0H21m-16.07 7.07l1.59-1.59M16.93 7.07l1.59-1.59M12 8a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Floating Settings capsule - Available globally across all tabs when in overview */
          <div className={`absolute top-6 right-6 md:top-8 md:right-10 flex items-center gap-3 p-1 rounded-full border transition z-30 shadow-[0_4px_20px_rgba(0,0,0,0.06)] ${isDarkMode
              ? "border-slate-800 bg-slate-950/95 backdrop-blur-md"
              : "border-green-200/80 bg-white/95 backdrop-blur-md"
            }`}>
            {/* Cylinder language buttons */}
            <div className="flex items-center">
              <button
                onClick={() => setLanguage("mr")}
                className={`px-3.5 py-1 rounded-full text-xs font-black transition-all duration-300 ${language === "mr"
                    ? "bg-gradient-to-r from-green-700 to-emerald-800 text-white shadow scale-105"
                    : isDarkMode
                      ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                      : "text-green-800/85 hover:text-green-950 hover:bg-green-50"
                  }`}
              >
                मराठी
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-3.5 py-1 rounded-full text-xs font-black transition-all duration-300 ${language === "en"
                    ? "bg-gradient-to-r from-green-700 to-emerald-800 text-white shadow scale-105"
                    : isDarkMode
                      ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                      : "text-green-800/85 hover:text-green-905 hover:bg-green-50"
                  }`}
              >
                En
              </button>
            </div>

            {/* Divider line */}
            <div className={`h-4 w-px ${isDarkMode ? "bg-slate-800" : "bg-green-200"}`}></div>

            {/* Dark Mode toggle button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group ${isDarkMode ? "hover:bg-slate-800 text-yellow-300" : "hover:bg-green-50 text-amber-500"
                }`}
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? (
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-300 drop-shadow-[0_0_5px_rgba(253,224,71,0.6)] transition-all duration-300 transform group-hover:rotate-12 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                  <span className="absolute -top-1 -right-0.5 text-[8px] text-yellow-200 animate-pulse select-none">✦</span>
                </div>
              ) : (
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)] transition-all duration-300 transform group-hover:rotate-45 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.93 4.93l1.59 1.59m10.96 10.96l1.59 1.59M3 12h2.25m13.5 0H21m-16.07 7.07l1.59-1.59M16.93 7.07l1.59-1.59M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        )}

        {/* ──────── TAB 1: OVERVIEW ──────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">

            {/* Welcome Greeting Banner (Restricted to dashboard tab) */}
            <div className={`relative rounded-3xl py-5 px-6 md:py-6 md:px-8 border shadow-sm overflow-hidden transition-colors duration-300 ${isDarkMode
                ? "bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border-slate-850 text-white"
                : "bg-gradient-to-br from-green-50/50 via-emerald-50/25 to-white border-green-100/70 text-gray-800"
              }`}>
              {/* Multi-angle Designer Circles */}
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-green-500/5 blur-sm pointer-events-none"></div>
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-green-400/10 blur-xl pointer-events-none"></div>
              <div className="absolute top-1/2 -translate-y-1/2 -right-16 w-36 h-36 rounded-full bg-emerald-400/15 blur-xl pointer-events-none"></div>

              {/* Left part: Welcome message */}
              <div className="space-y-2 relative z-10 pr-28 md:pr-36">
                <h1 className={`text-xl md:text-2xl font-black tracking-tight transition-colors duration-300 ${isDarkMode ? "text-green-400" : "text-green-700"
                  }`}>
                  नमस्कार, {family?.mainMemberName || "नागरिक"}! <span className="inline-block hover:animate-bounce cursor-default select-none">👋</span>
                </h1>
                <p className={`text-sm leading-relaxed font-semibold transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                  आपल्या डिजिटल ग्रामपंचायत पोर्टलवर आपले सहर्ष स्वागत आहे. येथून आपण विविध दाखल्यांचे अर्ज करू शकता, घरपट्टी, पाणीपट्टी आणि इतर कर विनासायास भरून शासकीय पावत्या प्राप्त करू शकता.
                </p>
                {/* Family head info at bottom */}
                <p className="text-xs text-gray-400 font-bold mt-2">
                  {t.headOfFamily}: <span className="text-green-600 font-extrabold">{family?.mainMemberName}</span> | ID: <span className="text-orange-600 font-extrabold">{family?.familyId}</span>
                </p>
              </div>
            </div>

            {/* STATS METERS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

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
                      <span className="text-green-200">{t.registeredPhone}:</span>
                      <span className="font-bold">{family?.mobileNumber}</span>
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
                      <span className={`text-2xl font-black transition mt-1 block ${isDarkMode ? "text-slate-100" : "text-gray-805"}`}>
                        {family?.childrenCount ?? 0}
                      </span>
                    </div>

                  </div>
                </div>

                <div className={`mt-6 border p-4 rounded-2xl text-xs relative z-10 ${isDarkMode ? "bg-slate-950/40 border-slate-800 text-slate-400" : "bg-orange-50/40 border-orange-100/60 text-orange-850"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Taxes list (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <div className={`rounded-3xl shadow p-6 border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-green-100"
                }`}>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">{t.taxBreakdown}</h3>

                {bills.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">{t.noBills}</p>
                ) : (
                  <div className="space-y-6">
                    {bills.map((bill) => {
                      const pendingAmount = bill.amount - bill.paidAmount;
                      const isPaid = bill.status === "paid";

                      return (
                        <div key={bill._id} className={`border rounded-3xl p-5 hover:shadow-lg transition duration-300 ${isDarkMode ? "border-slate-800 bg-slate-950/40" : "border-green-100 bg-white"
                          }`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-lg capitalize">
                                {bill.taxType === "house" ? t.taxTypeHouse :
                                  bill.taxType === "water" ? t.taxTypeWater :
                                    bill.taxType === "health" ? t.taxTypeHealth :
                                      `${bill.taxType} Tax`}
                              </h4>
                              <p className="text-xs text-gray-400">{t.year}: {bill.year}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPaid ? "bg-green-100 text-green-700" : bill.status === "partial" ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-650"
                              }`}>
                              {isPaid ? t.paid : bill.status === "partial" ? t.partial : t.pending}
                            </span>
                          </div>

                          <div className={`grid grid-cols-3 gap-2 rounded-2xl py-3 text-center mb-4 ${isDarkMode ? "bg-slate-950" : "bg-gray-50"
                            }`}>
                            <div>
                              <p className="text-xs text-gray-400">{t.totalTax}</p>
                              <p className="font-bold">₹{bill.amount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">{t.paidAmount}</p>
                              <p className="font-bold text-green-600">₹{bill.paidAmount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">{t.remainingTax}</p>
                              <p className="font-bold text-amber-600">₹{pendingAmount}</p>
                            </div>
                          </div>

                          {!isPaid && (
                            <div className="flex flex-col sm:flex-row gap-3 items-end">
                              <div className="w-full">
                                <label className="block text-xs font-bold text-gray-500 mb-1">{t.enterAmount}</label>
                                <input
                                  type="number"
                                  value={payAmounts[bill._id] || ""}
                                  max={pendingAmount}
                                  min={1}
                                  onChange={(e) => setPayAmounts({ ...payAmounts, [bill._id]: e.target.value })}
                                  className={`border outline-none p-2 rounded-xl w-full font-bold text-sm ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-green-200 text-gray-800"
                                    }`}
                                />
                              </div>
                              <button
                                onClick={() => handlePay(bill)}
                                disabled={processingId !== null}
                                className="bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 px-6 rounded-xl shadow w-full sm:w-auto whitespace-nowrap text-sm"
                              >
                                {processingId === bill._id ? t.processing : t.payOnline}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Payment history / receipts (1/3 width) */}
            <div className="space-y-6">
              <div className={`rounded-3xl shadow p-6 border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-green-100"
                }`}>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">{t.receiptsLedger}</h3>
                {payments.length === 0 ? (
                  <p className="text-gray-500 text-center py-6 text-sm">{t.noPayments}</p>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    {payments.map((p) => (
                      <div key={p._id} className={`border-b pb-3 last:border-0 last:pb-0 ${isDarkMode ? "border-slate-800" : "border-gray-100"}`}>
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="capitalize">
                            {p.taxType === "house" ? t.taxTypeHouse :
                              p.taxType === "water" ? t.taxTypeWater :
                                p.taxType === "health" ? t.taxTypeHealth :
                                  `${p.taxType} Tax`}
                          </span>
                          <span className="text-green-600">+₹{p.amountPaid}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                          <span>{new Date(p.paymentDate).toLocaleDateString()}</span>
                          <span className={`uppercase text-[9px] px-1.5 py-0.5 rounded font-bold ${isDarkMode ? "bg-slate-950 text-slate-400" : "bg-gray-100 text-gray-600"
                            }`}>
                            {p.paymentMethod}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono mt-1 truncate">ID: {p.transactionId}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ──────── TAB 3: APPLICATIONS ──────── */}
        {activeTab === "applications" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Application request form (1/3 width) */}
            <div className="space-y-6">
              <div className={`rounded-3xl shadow p-6 border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-green-100"
                }`}>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">{t.applyCertificate}</h3>
                <form onSubmit={handleApplyCertificate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{t.selectType}</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className={`border p-2.5 rounded-xl w-full text-xs font-bold outline-none ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "border-green-600 text-gray-800"
                        }`}
                    >
                      <option value="जन्म नोंद">{t.birthReg}</option>
                      <option value="मृत्यू नोंद">{t.deathReg}</option>
                      <option value="विवाह नोंदणी दाखला">{t.marriageReg}</option>
                      <option value="८ अ उतारा">{t.transcript8a}</option>
                      <option value="ग्रामपंचायत येणे बाकी दाखला">{t.noDuesReg}</option>
                      <option value="दारिद्र्य रेषेखाली असल्याचा दाखला">{t.bplReg}</option>
                      <option value="निराधार असल्याचा दाखला मागणी">{t.destituteReg}</option>
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
                  {form.type === "जन्म नोंद" && (
                    <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-green-50/50 border-green-100"
                      }`}>
                      <p className="text-[10px] font-bold text-green-700 uppercase">👶 {t.birthReg}</p>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t.childName}</label>
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
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t.dob}</label>
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

                  {form.type === "मृत्यू नोंद" && (
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

                  {form.type === "विवाह नोंदणी दाखला" && (
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

                  {form.type === "८ अ उतारा" && (
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

                  {form.type === "निराधार असल्याचा दाखला मागणी" && (
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

                  {(form.type === "दारिद्र्य रेषेखाली असल्याचा दाखला" || form.type === "ग्रामपंचायत येणे बाकी दाखला") && (
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
                    className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl shadow transition text-xs uppercase tracking-wider"
                  >
                    {submittingApp ? t.submitting : ['जन्म नोंद', 'मृत्यू नोंद', 'विवाह नोंदणी दाखला', '८ अ उतारा', 'ग्रामपंचायत येणे बाकी दाखला'].includes(form.type) ? t.submitPay : t.submitFree}
                  </button>
                </form>
              </div>
            </div>

            {/* Applications tracker logs (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <div className={`rounded-3xl shadow p-6 border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-green-100"
                }`}>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">{t.applicationsStatus}</h3>

                {applications.length === 0 ? (
                  <p className="text-gray-500 text-center py-10">{t.noApplications}</p>
                ) : (
                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
                    {applications.map((app) => (
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

                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : app.status === "need_documents"
                              ? "bg-red-100 text-red-600"
                              : "bg-orange-100 text-orange-600"
                            }`}>
                            {app.status === "completed" ? "Completed" : app.status === "need_documents" ? "Need Documents" : "Pending"}
                          </span>
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
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 text-[10px] font-extrabold text-red-500 opacity-80 hover:opacity-100 transition"
        >
          <span className="text-lg">🚪</span>
          <span>{language === "mr" ? "बाहेर पडा" : "Logout"}</span>
        </button>
      </div>
    </div>
  );
}
