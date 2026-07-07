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
              toast.success("Active session detected, view bills directly.");
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
        },
        // UPI Intent: opens Google Pay / PhonePe / Paytm / BHIM directly on mobile
        config: {
          display: {
            blocks: {
              upi: {
                name: "UPI से भुगतान करें / Pay via UPI",
                instruments: [
                  {
                    method: "upi",
                    flows: ["intent", "collect", "qr"],
                    apps: ["google_pay", "phonepe", "paytm", "bhim"],
                  },
                ],
              },
              other: {
                name: "अन्य विकल्प / Other Options",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" },
                ],
              },
            },
            sequence: ["block.upi", "block.other"],
            preferences: {
              show_default_blocks: false,
            },
          },
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
    <div className="min-h-screen bg-[#01140f] flex justify-center font-sans sm:py-8 relative overflow-hidden">
      {/* Glow Circles in Background */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none z-0"></div>
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-20 -left-10 w-72 h-72 rounded-full bg-orange-400/10 blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-5 right-5 w-48 h-48 rounded-full bg-yellow-400/5 blur-2xl pointer-events-none z-0"></div>

      {/* Mobile App Container */}
      <div className="w-full max-w-md bg-[#022c22] sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col min-h-screen sm:min-h-0 sm:h-[850px] z-10 border border-emerald-900/30">
        
        {/* Header Section (Curved Background) */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-green-955 pt-12 pb-20 px-6 rounded-b-[2.5rem] shadow-md relative z-0 overflow-hidden border-b border-emerald-700/20">
          {/* Decorative Translucent Circles */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-orange-500/10 rounded-full pointer-events-none z-0"></div>
          <div className="absolute -bottom-16 -left-10 w-36 h-36 bg-orange-500/5 rounded-full pointer-events-none z-0"></div>
          <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-orange-500/10 rounded-full pointer-events-none z-0"></div>
          <div className="absolute top-6 left-6 w-24 h-24 bg-orange-500/5 rounded-full pointer-events-none z-0"></div>

          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-full z-10 border border-white/5">
            <ShieldCheck className="w-4.5 h-4.5 text-white animate-pulse" />
            <span className="text-sm font-semibold text-white tracking-wide uppercase">
              {language === "mr" ? "सुरक्षित" : "Secure"}
            </span>
          </div>
          <div className="text-center mt-4 space-y-1.5 relative z-10">
            <h4 className={`text-xl font-black text-white/95 uppercase select-none ${language === "mr" ? "" : "tracking-widest"}`}>
              {language === "mr" ? "महाराष्ट्र शासन" : "Government of Maharashtra"}
            </h4>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {gpDetails?.name || "ग्रामपंचायत गोमेवाडी"}
            </h1>
            <p className="text-emerald-250 text-emerald-350 text-lg font-black tracking-wide">
              {language === "mr" ? "ता. आटपाडी, जि. सांगली" : "Tal. Atpadi, Dist. Sangli"}
            </p>
          </div>
        </div>

        {/* Overlapping Logo */}
        <div className="flex justify-center -mt-12 relative z-10">
          <div className="bg-[#022c22] p-3 rounded-full shadow-xl border border-emerald-800/40">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-white">
              <img 
                src={gpDetails?.logo || "/images/satyamev.jpg"} 
                alt="Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="px-5 pt-6 pb-32 flex-1 overflow-y-auto space-y-5">
          
          {/* Scan success confirmation */}
          <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-2xl p-4.5 flex items-center gap-3 text-white">
            <div className="w-11 h-11 rounded-full bg-emerald-900/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6.5 h-6.5 text-green-400" />
            </div>
            <div className="text-left">
              <h4 className="font-extrabold text-green-300 text-base">
                {language === "mr" ? "स्कॅन यशस्वी!" : "Scan Successful!"}
              </h4>
              <p className="text-sm text-green-200 mt-0.5">
                {language === "mr" ? "QR कोड सुरक्षितपणे ओळखला गेला आहे" : "QR Code securely recognized"}
              </p>
            </div>
          </div>

          {/* Family Card */}
          <div className="bg-emerald-950/40 rounded-2xl p-5 border border-emerald-850/40 text-left text-white shadow-inner">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6.5 h-6.5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-extrabold text-emerald-355 uppercase tracking-wider mb-1">
                  {language === "mr" ? "कुटुंब प्रमुख" : "Head of Family"}
                </p>
                <h2 className="text-xl font-extrabold text-white leading-tight">
                  {family?.mainMemberName || "—"}
                </h2>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-emerald-900/30 grid grid-cols-3 gap-2">
              <div>
                <div className="flex items-center gap-1 text-emerald-300/80 mb-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {language === "mr" ? "कुटुंब ID" : "Family ID"}
                  </span>
                </div>
                <p className="text-sm font-black text-white font-mono truncate">{family?.familyId || "—"}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-emerald-300/80 mb-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {language === "mr" ? "घर क्रमांक" : "House No."}
                  </span>
                </div>
                <p className="text-sm font-black text-white">{family?.houseNumber || "—"}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-emerald-300/80 mb-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {language === "mr" ? "सदस्य संख्या" : "Members"}
                  </span>
                </div>
                <p className="text-sm font-black text-white">
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
                  className="w-full py-4 bg-[#01221a]/80 hover:bg-[#01221a] text-white border border-emerald-800/30 font-bold rounded-xl flex items-center justify-center gap-2.5 transition active:scale-[0.98] shadow-sm text-base cursor-pointer"
                >
                  <Home className="w-5.5 h-5.5 text-emerald-350" />
                  {language === "mr" ? "मुख्य वेबसाईटवर जा" : "Go to Main Website"}
                </button>

                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={requestingOtp}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-orange-500/30 active:scale-[0.98] disabled:opacity-75 text-base cursor-pointer"
                >
                  {requestingOtp ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>{language === "mr" ? "ओटीपी पाठवत आहे..." : "Sending OTP..."}</span>
                    </>
                  ) : (
                    <>
                      <LayoutDashboard className="w-5.5 h-5.5" />
                      {language === "mr" ? "करांचा भरणा करा" : "Pay Taxes"}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-emerald-950/45 rounded-2xl p-6 border border-emerald-800/30 space-y-6 animate-fadeIn text-center text-white">
                <div className="space-y-1.5">
                  <div className="w-14 h-14 rounded-full bg-emerald-900/30 text-green-400 flex items-center justify-center mx-auto mb-2 border border-emerald-800/40">
                    <Lock className="w-6.5 h-6.5" />
                  </div>
                  <h3 className="font-extrabold text-white text-xl">
                    {language === "mr" ? "ईमेल पडताळणी" : "OTP Verification"}
                  </h3>
                  <p className="text-sm text-slate-205 leading-normal">
                    {language === "mr" ? "नोंदणीकृत ईमेल पत्ता" : "OTP sent to registered email"}{" "}
                    <span className="font-extrabold text-white">{maskedEmail}</span>
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
                        className="w-12 h-13 border rounded-xl text-center font-black text-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-emerald-950/80 text-white border-emerald-800/50 transition"
                      />
                    ))}
                  </div>

                  <div className="text-center text-sm font-bold">
                    {countdown > 0 ? (
                      <span className="text-emerald-300">
                        {language === "mr" ? `पुन्हा पाठवा ${countdown} सेकंदात` : `Resend in ${countdown}s`}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        className="text-green-400 hover:text-green-300 transition underline font-bold cursor-pointer"
                      >
                        {language === "mr" ? "ओटीपी पुन्हा पाठवा" : "Resend OTP"}
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={verifyingOtp || otp.length !== 4}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-orange-500/30 text-base flex items-center justify-center gap-1.5 cursor-pointer"
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
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  {language === "mr" ? "कर देयके" : "Tax Bills"}
                </h3>
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs font-extrabold px-2.5 py-1 rounded-md">
                  {paymentGroups.length} {language === "mr" ? "प्रकार" : "Items"}
                </span>
              </div>

              {/* Tax Bills List */}
              {paymentGroups.length > 0 ? (
                <div className="space-y-3">
                  {paymentGroups.map((group) => (
                    <div key={group.id} className="bg-emerald-950/45 rounded-2xl p-4 border border-emerald-800/30 flex flex-col gap-3 text-white">
                      {/* Bill Header */}
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                          <Receipt className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="text-base font-bold text-white">
                            {CATEGORY_NAMES[group.id][language]}
                          </h4>
                          <p className="text-xs text-slate-350 mt-0.5">
                            {currentFinancialYear}-{String(currentFinancialYear + 1).slice(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide border ${group.remaining === 0 ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-orange-500/20 text-orange-400 border-orange-500/20'}`}>
                            {group.remaining === 0 ? (language === "mr" ? "जमा" : "Paid") : (language === "mr" ? "थकीत" : "Pending")}
                          </span>
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      <div className="bg-[#011c16]/50 rounded-xl p-3.5 mt-1 space-y-2 text-base border border-emerald-900/40 text-left">
                        <div className="flex justify-between text-emerald-200/90">
                          <span>{language === "mr" ? "चालू वर्ष" : "Current Year"} ({currentFinancialYear}-{String(currentFinancialYear + 1).slice(2)})</span>
                          <span className="font-semibold text-white flex items-center">
                            {money(group.currentDue)}
                          </span>
                        </div>
                        <div className="flex justify-between text-emerald-200/90">
                          <span>{language === "mr" ? "मागील थकबाकी" : "Previous Dues"}</span>
                          <span className="font-semibold text-white flex items-center">
                            {money(group.previousDue)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-emerald-900/40 pt-2 mt-2">
                          <span className="font-extrabold text-white/95">
                            {language === "mr" ? "एकूण देय रक्कम" : "Total Payable"}
                          </span>
                          <span className="font-extrabold text-orange-400 flex items-center text-lg">
                            {money(group.remaining)}
                          </span>
                        </div>
                      </div>

                      {group.remaining > 0 && (
                        <div className="flex flex-col gap-3 mt-1">
                          
                          {/* Amount Input Row */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                                {language === "mr" ? "भरण्याची रक्कम" : "Amount to Pay"}
                              </label>
                              {/* Pay Full quick button */}
                              <button
                                type="button"
                                onClick={() => setPayAmounts({ ...payAmounts, [group.id]: group.remaining })}
                                className="text-xs font-black text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:border-orange-400/50 px-2.5 py-1 rounded-lg transition cursor-pointer bg-orange-500/5 hover:bg-orange-500/10"
                              >
                                {language === "mr" ? "पूर्ण रक्कम" : "Full Amount"} {money(group.remaining)}
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-black text-base pointer-events-none">₹</span>
                                <input
                                  type="number"
                                  value={payAmounts[group.id] || ""}
                                  onChange={(e) => setPayAmounts({ ...payAmounts, [group.id]: e.target.value })}
                                  placeholder="0"
                                  min={Math.min(500, group.remaining)}
                                  max={group.remaining}
                                  className="w-full pl-8 pr-4 py-3 bg-emerald-950/80 text-white border border-emerald-700/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 focus:outline-none text-base font-black"
                                />
                              </div>
                              <button
                                onClick={() => handlePayCategory(group)}
                                disabled={processingId === group.id}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl transition disabled:opacity-50 flex items-center gap-2 text-sm font-black shadow-lg shadow-orange-500/20 active:scale-95 whitespace-nowrap cursor-pointer"
                              >
                                {processingId === group.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    <span>{language === "mr" ? "प्रक्रिया..." : "Processing..."}</span>
                                  </>
                                ) : (
                                  <>
                                    <IndianRupee className="w-4 h-4" />
                                    <span>{language === "mr" ? "भरा" : "Pay"}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Quick amount chips */}
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs text-emerald-400/70 font-semibold self-center mr-0.5">
                              {language === "mr" ? "जलद निवड:" : "Quick:"}
                            </span>
                            {[500, 1000, 2000, 5000].filter(v => v < group.remaining).map(v => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => setPayAmounts({ ...payAmounts, [group.id]: v })}
                                className={`px-3 py-1 rounded-lg text-xs font-black border transition cursor-pointer ${
                                  Number(payAmounts[group.id]) === v
                                    ? "bg-emerald-700 text-white border-emerald-600"
                                    : "bg-emerald-950/60 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/60 hover:text-white"
                                }`}
                              >
                                ₹{v.toLocaleString("en-IN")}
                              </button>
                            ))}
                          </div>

                          {/* Hint */}
                          <p className="text-xs text-emerald-400/60 leading-relaxed">
                            {language === "mr"
                              ? `किमान ₹${Math.min(500, group.remaining).toLocaleString("en-IN")} आणि जास्तीत जास्त ${money(group.remaining)} भरता येईल. आंशिक भरणा स्वीकार्य आहे.`
                              : `Min ₹${Math.min(500, group.remaining).toLocaleString("en-IN")} · Max ${money(group.remaining)}. Partial payment accepted.`}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-emerald-950/40 rounded-2xl p-8 border border-emerald-800/20 text-center text-white">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="font-extrabold text-white text-lg">
                    {language === "mr" ? "सर्व कर भरलेले आहेत" : "No Bills Found"}
                  </h4>
                  <p className="text-sm text-slate-350 mt-1">
                    {language === "mr" ? "या कुटुंबासाठी सध्या कोणतेही कर रेकॉर्ड नाहीत." : "There are currently no tax records for this family."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Go to Dashboard Button at the bottom of the scrollable container - only show post OTP verification */}
          {otpVerified && (
            <button
              onClick={() => {
                window.location.href = "/user/dashboard";
              }}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2.5 text-base cursor-pointer"
            >
              <LayoutDashboard className="w-5.5 h-5.5 text-white/80" />
              {language === "mr" ? "तुमच्या डॅशबोर्डवर जा" : "Go to your dashboard"}
            </button>
          )}
        </div>

        {/* Sticky Bottom Action Bar (Post-OTP Verified Only) */}
        {otpVerified && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#022a21]/95 backdrop-blur-md border-t border-emerald-800/40 p-5 pt-4 rounded-b-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.3)] z-10 text-white">
            <div className="flex items-end justify-between mb-4">
              <div className="text-left">
                <p className="text-sm font-semibold text-emerald-355 mb-1">
                  {language === "mr" ? "एकूण देय रक्कम" : "Total Amount Due"}
                </p>
                <h2 className="text-4xl font-black text-white flex items-center tracking-tight">
                  {money(totalDue)}
                </h2>
              </div>
            </div>
            
            <button 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-between px-6 transition-all shadow-lg shadow-green-600/30 active:scale-[0.98] text-base cursor-pointer"
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
