import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axioesInstance from "../utils/axioesInstance";
import { useSiteConfig } from "../utils/SiteConfigContext";
import { useSearchParams } from "react-router-dom";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with GP Details */}
      <div className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <img
            src={gpDetails?.logo || "/images/satyamev.jpg"}
            alt="GP Logo"
            className="h-16 w-16 rounded-full object-cover border-2 border-green-600"
          />
          <div>
            <h1 className="text-2xl font-bold text-green-800">{gpDetails?.name || "ग्रामपंचायत गोमेवाडी"}</h1>
            <p className="text-gray-600 text-sm">Gram Panchayat Gomewadi</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Family Information Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">कुटुंब माहिती</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">कुटुंब प्रमुख</p>
              <p className="text-lg font-semibold text-gray-800">{family?.mainMemberName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">कुटुंब सदस्य संख्या</p>
              <p className="text-lg font-semibold text-gray-800">{family?.familySize || 0}</p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">कर व देयके</h2>
          
          {paymentGroups.map((group) => (
            group.remaining > 0 && (
              <div key={group.id} className="border rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <TaxCategoryIcon categoryId={group.id} />
                  <h3 className="font-semibold text-gray-800">{CATEGORY_NAMES[group.id][language]}</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">मागील वर्षांची थकबाकी</p>
                    <p className="font-semibold text-gray-800">{money(group.previousDue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">चालू वर्ष {currentFinancialYear}-{currentFinancialYear + 1}</p>
                    <p className="font-semibold text-gray-800">{money(group.currentDue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">एकूण देय रक्कम</p>
                    <p className="font-bold text-green-700">{money(group.remaining)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={payAmounts[group.id] || ""}
                    onChange={(e) => setPayAmounts({ ...payAmounts, [group.id]: e.target.value })}
                    placeholder="रक्कम टाका"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring focus:ring-green-300 focus:outline-none"
                  />
                  <button
                    onClick={() => handlePayCategory(group)}
                    disabled={processingId === group.id}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {processingId === group.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <RazorpayMark />
                        <span>ऑनलाइन भरा</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          ))}

          {paymentGroups.every(g => g.remaining === 0) && (
            <p className="text-gray-500 text-center py-4">कोणतेही थकीत कर नाहीत</p>
          )}
        </div>

        {/* Login Button for Full Access */}
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">संपूर्ण माहिती पाहण्यासाठी लॉगिन करा</p>
          <button
            onClick={() => (window.location.href = "/user-login")}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            लॉगिन करा
          </button>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </div>
  );
}
