import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axioesInstance from "../utils/axioesInstance";
import { useSiteConfig } from "../utils/SiteConfigContext";
import { useLanguage } from "../utils/LanguageContext";
import { useSearchParams } from "react-router-dom";
import { User, ShieldCheck, CheckCircle2, Home, LayoutDashboard, Lock, Receipt, IndianRupee, ChevronRight, FileText } from "lucide-react";

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

export default function QrPartialPage() {
  const { config } = useSiteConfig();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [gpDetails, setGpDetails] = useState(null);
  const [family, setFamily] = useState(null);
  
  // OTP verification states
  const [otpSent, setOtpSent] = useState(false);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpValues, setOtpValues] = useState(Array(4).fill(""));
  const [countdown, setCountdown] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);

  // Billing and Payment states
  const [bills, setBills] = useState([]);
  const [payAmounts, setPayAmounts] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const { lang: language } = useLanguage();

  const inputRefs = useRef([]);

  const familyId = searchParams.get("familyId");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!familyId || !token) {
      toast.error("Invalid QR code link");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axioesInstance.get(`/family/qr-lookup/${familyId}?token=${token}`);
        if (res.data.success) {
          setGpDetails(res.data.gpDetails);
          setFamily(res.data.family);
          setEmail(res.data.family?.email || "");

          // Silent session check: try to refresh citizen token
          try {
            const refreshRes = await axioesInstance.post("/auth/otp/refresh");
            if (refreshRes.data.token) {
              localStorage.setItem("userToken", refreshRes.data.token);
              // Fetch secure bills now that user is authorized
              const billsRes = await axioesInstance.get(`/taxes/${familyId}`);
              const loadedBills = billsRes.data.bills || [];
              setBills(loadedBills);
              
              const initialCategoryAmounts = {};
              TAX_CATEGORIES.forEach((category) => {
                initialCategoryAmounts[category.id] = billTotals(
                  loadedBills.filter((bill) => category.types.includes(bill.taxType)),
                ).remaining;
              });
              setPayAmounts(initialCategoryAmounts);
              setOtpVerified(true);
              toast.success("सत्र सक्रिय आहे, थेट देयके तपासा / Active session detected, view bills directly.");
            }
          } catch {
            // Silence session check failures
          }
        }
      } catch {
        toast.error("Failed to load family data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [familyId, token]);

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestOtp = async () => {
    setRequestingOtp(true);
    try {
      const { data } = await axioesInstance.post("/auth/otp/request-by-qr", {
        familyId,
        token
      });
      if (data.success) {
        setEmail(data.email);
        setMaskedEmail(data.maskedEmail);
        setOtpSent(true);
        startCountdown();
        toast.success("OTP sent to registered email address!");
        if (data.otp) {
          console.log(`[TESTING OTP]: ${data.otp}`);
          toast.info(`Sandbox Mode: Your OTP is ${data.otp}`, { autoClose: 10000 });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to request OTP");
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otp || otp.length !== 4) {
      return toast.error("Please enter a valid 4-digit OTP code");
    }

    setVerifyingOtp(true);
    try {
      const { data } = await axioesInstance.post("/auth/otp/verify", {
        email,
        code: otp,
      });
      if (data.token) {
        localStorage.setItem("userToken", data.token);
      }
      
      toast.success("पडताळणी यशस्वी! / Verification Successful!");
      
      // Fetch secure bills now that user is authorized
      const billsRes = await axioesInstance.get(`/taxes/${familyId}`);
      const loadedBills = billsRes.data.bills || [];
      setBills(loadedBills);

      const initialCategoryAmounts = {};
      TAX_CATEGORIES.forEach((category) => {
        initialCategoryAmounts[category.id] = billTotals(
          loadedBills.filter((bill) => category.types.includes(bill.taxType)),
        ).remaining;
      });
      setPayAmounts(initialCategoryAmounts);
      setOtpVerified(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP code");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpChange = (value, index) => {
    const cleanValue = value.replace(/\D/g, "");
    const newOtp = [...otpValues];
    newOtp[index] = cleanValue.substring(cleanValue.length - 1);
    setOtpValues(newOtp);
    setOtp(newOtp.join(""));

    if (cleanValue && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  useEffect(() => {
    if (otp.length === 4) {
      handleVerifyOtp();
    }
  }, [otp]);

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!/^\d{4}$/.test(data)) return;
    const newOtp = data.split("");
    setOtpValues(newOtp);
    setOtp(data);
    inputRefs.current[3].focus();
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

      const { data: orderData } = await axioesInstance.post("/payments/order", {
        category: group.id,
        familyId: familyId,
        amount: payAmt,
      });

      if (orderData.mock) {
        toast.info("Sandbox Mode: Simulating secure checkout...");
        setTimeout(async () => {
          try {
            await axioesInstance.post("/payments/verify", {
              category: group.id,
              familyId: familyId,
              amount: payAmt,
              razorpayOrderId: orderData.orderId,
              razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(7)}`,
              mock: true,
            });
            toast.success("Payment of ₹" + payAmt + " successful!");
            setTimeout(() => window.location.reload(), 1500);
          } catch {
            toast.error("Payment verification failed");
          }
        }, 1500);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: gpDetails?.name || "ग्रामपंचायत गोमेवाडी",
        description: `${CATEGORY_NAMES[group.id][language]} — oldest dues first`,
        image: gpDetails?.logo || "/images/satyamev.jpg",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await axioesInstance.post("/payments/verify", {
              category: group.id,
              familyId: familyId,
              amount: payAmt,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verifyRes.data.success) {
              toast.success("Payment successful!");
              setTimeout(() => window.location.reload(), 1500);
            }
          } catch (err) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: family?.mainMemberName,
          email: family?.email,
          contact: family?.whatsappNumber,
        },
        theme: {
          color: "#15803d",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Failed to initialize payment");
    } finally {
      setProcessingId(null);
    }
  };

  const currentFinancialYear = getCurrentFinancialYear();

  const paymentGroups = TAX_CATEGORIES.map((category) => {
    const categoryBills = bills.filter((bill) => category.types.includes(bill.taxType));
    const totals = billTotals(categoryBills);
    return {
      id: category.id,
      ...totals,
    };
  });

  const totalDue = paymentGroups.reduce((sum, group) => sum + group.remaining, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="text-green-900 font-medium animate-pulse">लोड होत आहे...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans sm:py-8">
      {/* Mobile App Container */}
      <div className="w-full max-w-md bg-slate-50 sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col min-h-screen sm:min-h-0 sm:h-[850px]">
        
        {/* Header Section (Curved Background) */}
        <div className="bg-gradient-to-br from-green-700 via-emerald-600 to-green-900 pt-12 pb-20 px-6 rounded-b-[2.5rem] shadow-md relative z-0 overflow-hidden">
          {/* Decorative Translucent Circles */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/10 rounded-full pointer-events-none z-0"></div>
          <div className="absolute -bottom-16 -left-10 w-36 h-36 bg-white/5 rounded-full pointer-events-none z-0"></div>
          <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-white/10 rounded-full pointer-events-none z-0"></div>
          <div className="absolute top-6 left-6 w-24 h-24 bg-white/5 rounded-full pointer-events-none z-0"></div>

          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full z-10">
            <ShieldCheck className="w-4 h-4 text-white animate-pulse" />
            <span className="text-xs font-medium text-white tracking-wide uppercase">
              {language === "mr" ? "सुरक्षित" : "Secure"}
            </span>
          </div>
          <div className="text-center mt-4 space-y-1.5 relative z-10">
            <h4 className={`text-lg font-black text-white/95 uppercase select-none ${language === "mr" ? "" : "tracking-widest"}`}>
              {language === "mr" ? "महाराष्ट्र शासन" : "Government of Maharashtra"}
            </h4>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {gpDetails?.name || "ग्रामपंचायत गोमेवाडी"}
            </h1>
            <p className="text-green-100 text-base font-extrabold tracking-wide">
              {language === "mr" ? "ता. आटपाडी, जि. सांगली" : "Tal. Atpadi, Dist. Sangli"}
            </p>
          </div>
        </div>

        {/* Overlapping Logo */}
        <div className="flex justify-center -mt-12 relative z-10">
          <div className="bg-white p-3 rounded-full shadow-xl border border-slate-100">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-slate-50">
              <img 
                src={gpDetails?.logo || "/images/satyamev.jpg"} 
                alt="Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="px-5 pt-6 pb-28 flex-1 overflow-y-auto space-y-5">
          
          {/* Scan success confirmation */}
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-green-900 text-sm">
                {language === "mr" ? "स्कॅन यशस्वी!" : "Scan Successful!"}
              </h4>
              <p className="text-xs text-green-700 mt-0.5">
                {language === "mr" ? "QR कोड सुरक्षितपणे ओळखला गेला आहे" : "QR Code securely recognized"}
              </p>
            </div>
          </div>

          {/* Family Card (Neumorphic/Clean) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {language === "mr" ? "कुटुंब प्रमुख" : "Head of Family"}
                </p>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">
                  {family?.mainMemberName || "—"}
                </h2>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
              <div>
                <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {language === "mr" ? "कुटुंब ID" : "Family ID"}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 font-mono truncate">{family?.familyId || "—"}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {language === "mr" ? "घर क्रमांक" : "House No."}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">{family?.houseNumber || "—"}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {language === "mr" ? "सदस्य संख्या" : "Members"}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {family?.familySize || 0} {language === "mr" ? "व्यक्ती" : "Persons"}
                </p>
              </div>
            </div>
          </div>

          {!otpVerified ? (
            /* SECURE PRE-OTP CHALLENGE STEP */
            !otpSent ? (
              <div className="space-y-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => (window.location.href = "/")}
                  className="w-full py-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2.5 transition active:scale-[0.98] shadow-sm text-sm"
                >
                  <Home className="w-5 h-5 text-slate-500" />
                  {language === "mr" ? "मुख्य वेबसाईटवर जा" : "Go to Main Website"}
                </button>

                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={requestingOtp}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-orange-500/30 active:scale-[0.98] disabled:opacity-75 text-sm"
                >
                  {requestingOtp ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>{language === "mr" ? "ओटीपी पाठवत आहे..." : "Sending OTP..."}</span>
                    </>
                  ) : (
                    <>
                      <LayoutDashboard className="w-5 h-5" />
                      {language === "mr" ? "करांचा भरणा करा" : "Pay Taxes"}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-6 animate-fadeIn text-center">
                <div className="space-y-1.5">
                  <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-2 border border-green-100">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {language === "mr" ? "ईमेल पडताळणी" : "OTP Verification"}
                  </h3>
                  <p className="text-xs text-slate-500 leading-normal">
                    {language === "mr" ? "नोंदणीकृत ईमेल पत्ता" : "OTP sent to registered email"}{" "}
                    <span className="font-bold text-slate-800">{maskedEmail}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="flex justify-between gap-2 max-w-xs mx-auto">
                    {otpValues.map((val, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        value={val}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        onPaste={handleOtpPaste}
                        className="w-11 h-12 border-2 rounded-xl text-center font-extrabold text-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none bg-slate-50 transition"
                      />
                    ))}
                  </div>

                  <div className="text-center text-xs font-bold">
                    {countdown > 0 ? (
                      <span className="text-slate-400">
                        {language === "mr" ? `पुन्हा पाठवा ${countdown} सेकंदात` : `Resend in ${countdown}s`}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        className="text-green-700 hover:text-green-800 transition underline"
                      >
                        {language === "mr" ? "ओटीपी पुन्हा पाठवा" : "Resend OTP"}
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={verifyingOtp || otp.length !== 4}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-green-600/30 text-sm flex items-center justify-center gap-1.5"
                  >
                    {verifyingOtp ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>{language === "mr" ? "सत्यापित करत आहे..." : "Verifying..."}</span>
                      </>
                    ) : (
                      <span>{language === "mr" ? "पडताळणी करा" : "Verify & Pay"}</span>
                    )}
                  </button>
                </form>
              </div>
            )
          ) : (
            /* SECURE PAYMENTS LIST RENDERED POST-OTP VERIFICATION */
            <div className="space-y-4 animate-fadeIn">
              {/* Tax Bills Header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  {language === "mr" ? "कर देयके" : "Tax Bills"}
                </h3>
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md">
                  {paymentGroups.length} {language === "mr" ? "प्रकार" : "Items"}
                </span>
              </div>

              {/* Tax Bills List */}
              {paymentGroups.length > 0 ? (
                <div className="space-y-3">
                  {paymentGroups.map((group) => (
                    <div key={group.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex flex-col gap-3">
                      {/* Bill Header */}
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <Receipt className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-semibold text-slate-800">
                            {CATEGORY_NAMES[group.id][language]}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {currentFinancialYear}-{String(currentFinancialYear + 1).slice(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${group.remaining === 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {group.remaining === 0 ? (language === "mr" ? "जमा" : "Paid") : (language === "mr" ? "थकीत" : "Pending")}
                          </span>
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      <div className="bg-slate-50 rounded-xl p-3.5 mt-1 space-y-2 text-sm border border-slate-100 text-left">
                        <div className="flex justify-between text-slate-600">
                          <span>{language === "mr" ? "चालू वर्ष" : "Current Year"} ({currentFinancialYear}-{String(currentFinancialYear + 1).slice(2)})</span>
                          <span className="font-medium text-slate-800 flex items-center">
                            {money(group.currentDue)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>{language === "mr" ? "मागील थकबाकी" : "Previous Dues"}</span>
                          <span className="font-medium text-slate-800 flex items-center">
                            {money(group.previousDue)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                          <span className="font-bold text-slate-800">
                            {language === "mr" ? "एकूण देय रक्कम" : "Total Payable"}
                          </span>
                          <span className="font-bold text-slate-900 flex items-center text-base">
                            {money(group.remaining)}
                          </span>
                        </div>
                      </div>

                      {group.remaining > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            value={payAmounts[group.id] || ""}
                            onChange={(e) => setPayAmounts({ ...payAmounts, [group.id]: e.target.value })}
                            placeholder={language === "mr" ? "रक्कम प्रविष्ट करा" : "Enter amount"}
                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring focus:ring-green-150 focus:outline-none text-xs font-semibold"
                          />
                          <button
                            onClick={() => handlePayCategory(group)}
                            disabled={processingId === group.id}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold shadow-md active:scale-95 whitespace-nowrap"
                          >
                            {processingId === group.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                                <span>{language === "mr" ? "प्रक्रिया..." : "Processing..."}</span>
                              </>
                            ) : (
                              <span>{language === "mr" ? "ऑनलाइन भरा" : "Pay Online"}</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 border border-slate-200/60 text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="font-bold text-slate-800">
                    {language === "mr" ? "सर्व कर भरलेले आहेत" : "No Bills Found"}
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    {language === "mr" ? "या कुटुंबासाठी सध्या कोणतेही कर रेकॉर्ड नाहीत." : "There are currently no tax records for this family."}
                  </p>
                </div>
              )}

              {/* Dashboard Redirection Button */}
              <button
                onClick={() => (window.location.href = "/user/dashboard")}
                className="w-full mt-2 bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold py-4 rounded-xl transition text-xs shadow-inner flex items-center justify-center gap-2 border border-slate-200/40"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                {language === "mr" ? "संपूर्ण डॅशबोर्डवर जा" : "Go to Dashboard"}
              </button>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Bar (Post-OTP Verified Only) */}
        {otpVerified && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-5 pt-4 rounded-b-[2.5rem] shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-10">
            <div className="flex items-end justify-between mb-4">
              <div className="text-left">
                <p className="text-sm font-medium text-slate-500 mb-1">
                  {language === "mr" ? "एकूण देय रक्कम" : "Total Amount Due"}
                </p>
                <h2 className="text-3xl font-black text-slate-900 flex items-center tracking-tight">
                  {money(totalDue)}
                </h2>
              </div>
            </div>
            
            <button 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-between px-6 transition-all shadow-lg shadow-green-600/30 active:scale-[0.98]"
              disabled={totalDue === 0}
              onClick={() => {
                if (totalDue > 0) {
                  const firstUnpaid = paymentGroups.find(g => g.remaining > 0);
                  if (firstUnpaid) handlePayCategory(firstUnpaid);
                }
              }}
            >
              <span className="text-lg">
                {totalDue > 0
                  ? (language === "mr" ? "सर्व कर थकीत देयके भरा" : "Pay Now")
                  : (language === "mr" ? "सर्व कर भरलेले आहेत" : "Nothing to Pay")}
              </span>
              {totalDue > 0 ? (
                <ChevronRight className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-green-300" />
              )}
            </button>
          </div>
        )}

      </div>
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </div>
  );
}
