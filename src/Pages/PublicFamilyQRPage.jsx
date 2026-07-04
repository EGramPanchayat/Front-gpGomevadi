import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axioesInstance from "../utils/axioesInstance";

export default function PublicFamilyQRPage() {
  const { familyId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState(null);
  const [bills, setBills] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [payAmounts, setPayAmounts] = useState({}); // Stores input pay amounts per billId

  useEffect(() => {
    if (!familyId || !token) {
      setLoading(false);
      return;
    }

    axioesInstance
      .get(`/family/lookup/${familyId}?token=${token}`)
      .then((res) => {
        setFamily(res.data.family);
        setBills(res.data.bills || []);
        // Initialize payment inputs
        const initialAmounts = {};
        (res.data.bills || []).forEach((b) => {
          initialAmounts[b._id] = b.amount - b.paidAmount;
        });
        setPayAmounts(initialAmounts);
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || "अवैध QR लिंक किंवा माहिती आढळली नाही");
      })
      .finally(() => {
        setLoading(false);
      });
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

  const handlePay = async (bill) => {
    const payAmt = Number(payAmounts[bill._id]);
    const maxPayable = bill.amount - bill.paidAmount;

    if (isNaN(payAmt) || payAmt <= 0 || payAmt > maxPayable) {
      return toast.error(`कृपया ₹१ ते ₹${maxPayable} दरम्यान योग्य रक्कम प्रविष्ट करा`);
    }

    setProcessingId(bill._id);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK load failed");
      }

      // Initialize Razorpay Order on server
      const { data: orderData } = await axioesInstance.post("/payments/order", {
        billId: bill._id,
        amount: payAmt,
      });

      if (orderData.mock) {
        // Simulated sandbox mode
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
            toast.success("₹" + payAmt + " कर भरणा यशस्वी झाला!");
            setTimeout(() => window.location.reload(), 1500);
          } catch (verifyErr) {
            toast.error("भरणा पडताळणी अयशस्वी");
          }
        }, 1500);
        return;
      }

      // Real Checkout
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
            toast.success("भरणा यशस्वीरित्या पूर्ण झाला!");
            setTimeout(() => window.location.reload(), 1500);
          } catch (e) {
            toast.error("पेमेंट पडताळणी अयशस्वी झाली");
          }
        },
        prefill: {
          name: family.mainMemberName,
        },
        theme: {
          color: "#15803d", // Green
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      toast.error(err.message || "पेमेंट प्रक्रिया सुरू करण्यात अक्षम");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-200">
          <span className="text-red-500 text-6xl block mb-4">⚠️</span>
          <h2 className="text-xl font-bold text-gray-800">लिंक अवैध आहे किंवा कालबाह्य झाली आहे</h2>
          <p className="text-gray-500 mt-2">कृपया क्यूआर कोड पुन्हा स्कॅन करा.</p>
          <a href="/" className="mt-6 inline-block bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-xl shadow transition">
            मुख्यपृष्ठ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 p-4 sm:p-6 flex flex-col items-center">
      <div className="max-w-xl w-full space-y-6">
        {/* Government Header */}
        <div className="flex flex-col items-center text-center">
          <img
            src="/images/satyamev.jpg"
            alt="Satyamev Jayate"
            className="h-16 w-16 rounded-full object-cover border-2 border-green-600 shadow mb-2"
          />
          <h1 className="text-2xl font-bold text-green-700">ग्रामपंचायत गोमेवाडी</h1>
          <p className="text-gray-500 text-sm">डिजिटल कर संकलन प्रणाली</p>
        </div>

        {/* Household card details */}
        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full"></div>
          <h3 className="text-lg font-bold text-green-700 border-b pb-2 mb-4">कुटुंब माहिती</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">मुख्य सदस्याचे नाव:</span>
              <span className="font-bold text-gray-800">{family.mainMemberName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">घर क्रमांक:</span>
              <span className="font-bold text-gray-800">{family.houseNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">कुटुंब संख्या:</span>
              <span className="font-bold text-gray-800">
                {family.menCount + family.womenCount + family.seniorCount + family.childrenCount} सदस्य 
                <span className="text-xs text-gray-400 font-normal ml-1">
                  (पुरुष: {family.menCount}, महिला: {family.womenCount}, बालके/ज्येष्ठ: {family.seniorCount + family.childrenCount})
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Taxes and Ledger */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-green-700 px-1">थकीत कर विवरण</h3>
          {bills.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-green-100 shadow-xl text-center text-gray-500">
              कोणताही कर थकीत नाही. गाव विकासात सहकार्य केल्याबद्दल धन्यवाद!
            </div>
          ) : (
            bills.map((bill) => {
              const pendingAmount = bill.amount - bill.paidAmount;
              const isPaid = bill.status === "paid";

              return (
                <div
                  key={bill._id}
                  className="bg-white rounded-3xl shadow-xl border border-green-100 p-6 flex flex-col justify-between relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 capitalize">
                        {bill.taxType === "house" ? "घरपट्टी / House Tax" : 
                         bill.taxType === "water" ? "पाणीपट्टी / Water Tax" : 
                         bill.taxType === "health" ? "आरोग्य कर / Health Tax" : 
                         `${bill.taxType} Tax`}
                      </h4>
                      <p className="text-sm text-gray-500">वर्ष: {bill.year}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isPaid
                          ? "bg-green-100 text-green-700"
                          : bill.status === "partial"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {isPaid ? "Paid" : bill.status === "partial" ? "Partial" : "Pending"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-50 py-3 mb-4 text-center">
                    <div>
                      <p className="text-xs text-gray-400">एकूण कर</p>
                      <p className="text-lg font-bold text-gray-700">₹{bill.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">जमा रक्कम</p>
                      <p className="text-lg font-bold text-green-600">₹{bill.paidAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">थकीत रक्कम</p>
                      <p className="text-lg font-bold text-red-600">₹{pendingAmount}</p>
                    </div>
                  </div>

                  {!isPaid && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">भरणा करावयाची रक्कम प्रविष्ट करा (₹)</label>
                        <input
                          type="number"
                          value={payAmounts[bill._id] || ""}
                          max={pendingAmount}
                          min={1}
                          onChange={(e) =>
                            setPayAmounts({
                              ...payAmounts,
                              [bill._id]: e.target.value,
                            })
                          }
                          className="border border-green-200 outline-none p-2 rounded-xl w-full font-bold text-gray-800"
                        />
                      </div>
                      <button
                        onClick={() => handlePay(bill)}
                        disabled={processingId !== null}
                        className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                      >
                        {processingId === bill._id ? (
                          <span>प्रक्रिया सुरू आहे...</span>
                        ) : (
                          <>
                            <span>₹{payAmounts[bill._id] || 0} भरा / Pay Now</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="text-center text-xs text-gray-400 pt-8">
          © ग्रामपंचायत गोमेवाडी. सर्व हक्क सुरक्षित.
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </div>
  );
}
