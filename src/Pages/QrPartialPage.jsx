import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axioesInstance from "../utils/axioesInstance";
import { useSiteConfig } from "../utils/SiteConfigContext";
import { useSearchParams } from "react-router-dom";
import { User, Receipt, IndianRupee, ShieldCheck, AlertCircle, CheckCircle2, ChevronRight, FileText } from "lucide-react";

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
  const [bills, setBills] = useState([]);
  const [language, setLanguage] = useState(() => localStorage.getItem("lang") || "mr");
  const [payAmounts, setPayAmounts] = useState({});
  const [processingId, setProcessingId] = useState(null);

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
          setBills(res.data.bills || []);

          const loadedBills = res.data.bills || [];
          const initialCategoryAmounts = {};
          TAX_CATEGORIES.forEach((category) => {
            initialCategoryAmounts[category.id] = billTotals(
              loadedBills.filter((bill) => category.types.includes(bill.taxType)),
            ).remaining;
          });
          setPayAmounts(initialCategoryAmounts);
        }
      } catch (err) {
        toast.error("Failed to load data. Invalid QR code.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [familyId, token]);

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

    if (isNaN(payAmt) || payAmt <= 0 || payAmt > maxPayable) {
      return toast.error(`Please enter a valid amount between ₹1 and ₹${maxPayable}`);
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
            await axioesInstance.post("/payments/verify", {
              category: group.id,
              familyId: familyId,
              amount: payAmt,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment completed successfully!");
            setTimeout(() => window.location.reload(), 1500);
          } catch {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: family?.mainMemberName,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="text-green-900 font-medium animate-pulse">लोड होत आहे...</p>
      </div>
    );
  }

  const totalDue = paymentGroups.reduce((sum, group) => sum + group.remaining, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans sm:py-8">
      {/* Mobile App Container */}
      <div className="w-full max-w-md bg-slate-50 sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col min-h-screen sm:min-h-0 sm:h-[850px]">
        
        {/* Header Section (Curved Background) */}
        <div className="bg-gradient-to-br from-green-700 via-emerald-600 to-green-900 pt-12 pb-20 px-6 rounded-b-[2.5rem] shadow-md relative z-0">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span className="text-xs font-medium text-white tracking-wide">सुरक्षित</span>
          </div>
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
              {gpDetails?.name || "ग्रामपंचायत गोमेवाडी"}
            </h1>
            <p className="text-green-200 text-sm font-medium uppercase tracking-widest">
              डिजिटल कर पोर्टल
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
        <div className="px-5 pt-6 pb-28 flex-1 overflow-y-auto">
          
          {/* Family Card (Neumorphic/Clean) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">कुटुंब प्रमुख</p>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">
                  {family?.mainMemberName}
                </h2>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-100 flex gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">एकूण सदस्य</span>
                </div>
                <p className="font-semibold text-slate-700">{family?.familySize || 0} व्यक्ती</p>
              </div>
            </div>
          </div>

          {/* Tax Bills Header */}
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              कर बिले
            </h3>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md">
              {paymentGroups.length} आयटम
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
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">{CATEGORY_NAMES[group.id][language]}</h4>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${group.remaining === 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {group.remaining === 0 ? 'जमा' : 'थकीत'}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="bg-slate-50 rounded-xl p-3 mt-1 space-y-2 text-sm border border-slate-100">
                    <div className="flex justify-between text-slate-600">
                      <span>चालू वर्ष ({currentFinancialYear}-{currentFinancialYear + 1})</span>
                      <span className="font-medium text-slate-800 flex items-center">
                        <IndianRupee className="w-3 h-3 mr-0.5" /> {money(group.currentDue)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>मागील वर्षांची थकबाकी</span>
                      <span className="font-medium text-slate-800 flex items-center">
                        <IndianRupee className="w-3 h-3 mr-0.5" /> {money(group.previousDue)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                      <span className="font-bold text-slate-800">एकूण देय रक्कम</span>
                      <span className={`font-bold flex items-center text-base ${group.remaining === 0 ? 'text-green-700' : 'text-slate-900'}`}>
                        <IndianRupee className="w-4 h-4 mr-0.5" /> {money(group.remaining)}
                      </span>
                    </div>
                  </div>

                  {group.remaining > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="number"
                        value={payAmounts[group.id] || ""}
                        onChange={(e) => setPayAmounts({ ...payAmounts, [group.id]: e.target.value })}
                        placeholder="रक्कम टाका"
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring focus:ring-green-300 focus:outline-none text-sm"
                      />
                      <button
                        onClick={() => handlePayCategory(group)}
                        disabled={processingId === group.id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                      >
                        {processingId === group.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>प्रक्रिया...</span>
                          </>
                        ) : (
                          <>
                            <span>ऑनलाइन भरा</span>
                          </>
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
              <h4 className="font-bold text-slate-800">कोणतेही बिल नाहीत</h4>
              <p className="text-sm text-slate-500 mt-1">या कुटुंबासाठी सध्या कोणतेही कर रेकॉर्ड नाहीत.</p>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-5 pt-4 rounded-b-[2.5rem] shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">एकूण देय रक्कम</p>
              <h2 className="text-3xl font-black text-slate-900 flex items-center tracking-tight">
                <IndianRupee className="w-7 h-7 mr-1 text-slate-400" />
                {totalDue.toLocaleString('en-IN')}
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
              {totalDue > 0 ? "आता भरा" : "भरायचे काहीही नाही"}
            </span>
            {totalDue > 0 ? (
              <ChevronRight className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-green-300" />
            )}
          </button>

          {/* Login Button for Full Access */}
          <button
            onClick={() => (window.location.href = "/user-login")}
            className="w-full mt-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition text-sm"
          >
            संपूर्ण माहिती पाहण्यासाठी लॉगिन करा
          </button>
        </div>

      </div>
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </div>
  );
}
