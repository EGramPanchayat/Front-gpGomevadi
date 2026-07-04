import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axioesInstance from "../utils/axioesInstance";

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState(null);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'taxes', 'applications'

  // Application form states
  const [appType, setAppType] = useState("birth");
  const [applicantName, setApplicantName] = useState("");
  const [appDetails, setAppDetails] = useState("");
  const [submittingApp, setSubmittingApp] = useState(false);

  // Razorpay payment state
  const [payAmounts, setPayAmounts] = useState({});
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    // Check if authenticated
    axioesInstance
      .get("/auth/otp/check")
      .then((res) => {
        if (!res.data.ok) {
          window.location.href = "/user-login";
          return;
        }
        setFamily(res.data.family);
        return Promise.all([
          axioesInstance.get(`/taxes/${res.data.family.familyId}`),
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
        toast.error("माहिती लोड करण्यात त्रुटी किंवा सत्र संपले आहे");
        window.location.href = "/user-login";
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axioesInstance.post("/auth/otp/logout");
      toast.success("सत्र समाप्त झाले");
      setTimeout(() => {
        window.location.href = "/user-login";
      }, 1000);
    } catch {
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
      return toast.error(`कृपया ₹१ ते ₹${maxPayable} दरम्यान योग्य रक्कम प्रविष्ट करा`);
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
            toast.success("₹" + payAmt + " भरणा यशस्वी झाला!");
            setTimeout(() => window.location.reload(), 1500);
          } catch (verifyErr) {
            toast.error("भरणा पडताळणी अयशस्वी");
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
          color: "#15803d",
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

  const handleApplyCertificate = async (e) => {
    e.preventDefault();
    if (!applicantName.trim()) {
      return toast.error("कृपया अर्जदाराचे नाव प्रविष्ट करा");
    }

    setSubmittingApp(true);
    try {
      await axioesInstance.post("/user/applications", {
        applicantName,
        type: appType,
        details: { description: appDetails },
      });
      toast.success("अर्ज यशस्वीरित्या सादर केला गेला आहे!");
      setApplicantName("");
      setAppDetails("");
      // Refresh list
      const { data } = await axioesInstance.get("/user/applications");
      setApplications(data.applications || []);
    } catch (err) {
      toast.error("अर्ज सादर करताना त्रुटी आली");
    } finally {
      setSubmittingApp(false);
    }
  };

  const calculateTotalDues = () => {
    return bills.reduce((sum, b) => sum + (b.amount - b.paidAmount), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-orange-50/50 font-sans flex flex-col md:flex-row">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="w-full md:w-64 bg-green-900 text-white p-6 flex flex-col justify-between shadow-2xl relative">
        <div className="space-y-8">
          {/* LOGO */}
          <div className="flex items-center gap-3 border-b border-green-800 pb-4">
            <img
              src="/images/satyamev.jpg"
              alt="Logo"
              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow"
            />
            <div>
              <h2 className="font-bold text-lg leading-tight">गोमेवाडी GP</h2>
              <span className="text-xs text-white/60">नागरिक डॅशबोर्ड</span>
            </div>
          </div>

          {/* User profile widget */}
          <div className="bg-green-800/50 rounded-2xl p-4 border border-green-700">
            <p className="text-xs text-green-300">घरमालक / Member</p>
            <p className="font-bold text-base truncate">{family?.mainMemberName}</p>
            <p className="text-xs text-white/50">घर क्र: {family?.houseNumber}</p>
          </div>

          {/* MENU LINKS */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition ${
                activeTab === "overview" ? "bg-orange-500 text-white shadow-lg" : "hover:bg-green-800 text-green-100"
              }`}
            >
              <span>📊 डॅशबोर्ड / Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("taxes")}
              className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition ${
                activeTab === "taxes" ? "bg-orange-500 text-white shadow-lg" : "hover:bg-green-800 text-green-100"
              }`}
            >
              <span>💳 कर व देयके / Pay Taxes</span>
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition ${
                activeTab === "applications" ? "bg-orange-500 text-white shadow-lg" : "hover:bg-green-800 text-green-100"
              }`}
            >
              <span>📄 दाखला अर्ज / Certificates</span>
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-8 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition shadow-md"
        >
          Logout / बाहेर पडा
        </button>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-6 md:p-10 space-y-6 overflow-y-auto">
        
        {/* TOP STATUS NAV */}
        <header className="flex justify-between items-center bg-white rounded-3xl shadow-md border border-green-100 p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === "overview" && "डॅशबोर्ड सारांश / Overview"}
              {activeTab === "taxes" && "करांचे विवरण व ऑनलाईन पेमेंट"}
              {activeTab === "applications" && "शासकीय दाखला मागणी केंद्र"}
            </h1>
            <p className="text-sm text-gray-400">स्वागत आहे, कुटुंब आयडी: {family?.familyId}</p>
          </div>
          <div className="flex gap-4">
            <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-2xl font-bold text-sm hidden sm:inline-block">
              थकीत कर: ₹{calculateTotalDues()}
            </span>
          </div>
        </header>

        {/* ──────── TAB 1: OVERVIEW ──────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* STATS METERS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow border border-green-100 flex flex-col justify-between">
                <span className="text-gray-400 text-sm font-semibold">एकूण थकीत रक्कम</span>
                <span className="text-3xl font-extrabold text-red-600 mt-2">₹{calculateTotalDues()}</span>
                <button onClick={() => setActiveTab("taxes")} className="text-xs font-bold text-green-700 hover:underline mt-4 text-left">
                  तपशील पहा →
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow border border-green-100 flex flex-col justify-between">
                <span className="text-gray-400 text-sm font-semibold">दाखला अर्ज संख्या</span>
                <span className="text-3xl font-extrabold text-orange-500 mt-2">{applications.length} अर्ज</span>
                <button onClick={() => setActiveTab("applications")} className="text-xs font-bold text-green-700 hover:underline mt-4 text-left">
                  नवीन अर्ज करा →
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow border border-green-100 flex flex-col justify-between">
                <span className="text-gray-400 text-sm font-semibold">पूर्ण झालेले दाखले</span>
                <span className="text-3xl font-extrabold text-green-600 mt-2">
                  {applications.filter(a => a.status === "completed").length}
                </span>
                <button onClick={() => setActiveTab("applications")} className="text-xs font-bold text-green-700 hover:underline mt-4 text-left">
                  डाऊनलोड करा →
                </button>
              </div>
            </div>

            {/* QUICK BILLS PREVIEW */}
            <div className="bg-white rounded-3xl shadow p-6 border border-green-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">सद्य थकीत बिले (Pending Taxes)</h3>
              {bills.filter(b => b.status !== "paid").length === 0 ? (
                <p className="text-gray-500 text-center py-6">सर्व कर जमा आहेत! थँक्यू.</p>
              ) : (
                <div className="space-y-4">
                  {bills.filter(b => b.status !== "paid").map(b => (
                    <div key={b._id} className="flex justify-between items-center p-3 rounded-2xl hover:bg-gray-50 transition border border-gray-100">
                      <div>
                        <p className="font-bold text-gray-700 capitalize">{b.taxType} Tax ({b.year})</p>
                        <p className="text-xs text-gray-400">एकूण: ₹{b.amount} | जमा: ₹{b.paidAmount}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-red-600 text-lg">₹{b.amount - b.paidAmount}</span>
                        <button
                          onClick={() => setActiveTab("taxes")}
                          className="bg-green-700 hover:bg-green-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow"
                        >
                          पेमेंट करा
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────── TAB 2: TAXES ──────── */}
        {activeTab === "taxes" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Taxes list (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">करांचे विवरण (Tax Breakdown)</h3>
                
                {bills.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">कराची बिले उपलब्ध नाहीत.</p>
                ) : (
                  <div className="space-y-6">
                    {bills.map((bill) => {
                      const pendingAmount = bill.amount - bill.paidAmount;
                      const isPaid = bill.status === "paid";

                      return (
                        <div key={bill._id} className="border border-green-100 rounded-3xl p-5 hover:shadow-lg transition duration-300">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-lg text-gray-800 capitalize">
                                {bill.taxType === "house" ? "घरपट्टी / House Tax" : 
                                 bill.taxType === "water" ? "पाणीपट्टी / Water Tax" : 
                                 bill.taxType === "health" ? "आरोग्य कर / Health Tax" : 
                                 `${bill.taxType} Tax`}
                              </h4>
                              <p className="text-xs text-gray-400">वर्ष: {bill.year}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isPaid ? "bg-green-100 text-green-700" : bill.status === "partial" ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-600"
                            }`}>
                              {isPaid ? "Paid" : bill.status === "partial" ? "Partial" : "Pending"}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-2xl py-3 text-center mb-4">
                            <div>
                              <p className="text-xs text-gray-400">एकूण कर</p>
                              <p className="font-bold text-gray-700">₹{bill.amount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">भरलेली रक्कम</p>
                              <p className="font-bold text-green-600">₹{bill.paidAmount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">उर्वरित कर</p>
                              <p className="font-bold text-red-600">₹{pendingAmount}</p>
                            </div>
                          </div>

                          {!isPaid && (
                            <div className="flex flex-col sm:flex-row gap-3 items-end">
                              <div className="w-full">
                                <label className="block text-xs font-bold text-gray-500 mb-1">रक्कम टाका (₹)</label>
                                <input
                                  type="number"
                                  value={payAmounts[bill._id] || ""}
                                  max={pendingAmount}
                                  min={1}
                                  onChange={(e) => setPayAmounts({ ...payAmounts, [bill._id]: e.target.value })}
                                  className="border border-green-200 outline-none p-2 rounded-xl w-full font-bold text-gray-800 text-sm"
                                />
                              </div>
                              <button
                                onClick={() => handlePay(bill)}
                                disabled={processingId !== null}
                                className="bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 px-6 rounded-xl shadow w-full sm:w-auto whitespace-nowrap text-sm"
                              >
                                {processingId === bill._id ? "Processing..." : "ऑनलाईन भरा"}
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
              <div className="bg-white rounded-3xl shadow p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">भरणा इतिहास (Receipts Ledger)</h3>
                {payments.length === 0 ? (
                  <p className="text-gray-500 text-center py-6 text-sm">पेमेंट इतिहास उपलब्ध नाही.</p>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    {payments.map((p) => (
                      <div key={p._id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center text-sm font-bold text-gray-800">
                          <span className="capitalize">{p.taxType} Tax</span>
                          <span className="text-green-600">+₹{p.amountPaid}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                          <span>{new Date(p.paymentDate).toLocaleDateString()}</span>
                          <span className="uppercase text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
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
              <div className="bg-white rounded-3xl shadow p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">नवीन दाखला अर्ज (Apply)</h3>
                <form onSubmit={handleApplyCertificate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">दाखला प्रकार</label>
                    <select
                      value={appType}
                      onChange={(e) => setAppType(e.target.value)}
                      className="border border-green-600 p-2.5 rounded-xl w-full text-sm outline-none"
                    >
                      <option value="birth">जन्म दाखला (Birth Certificate)</option>
                      <option value="death">मृत्यू दाखला (Death Certificate)</option>
                      <option value="income">उत्पन्न दाखला (Income Certificate)</option>
                      <option value="marriage">विवाह दाखला (Marriage Certificate)</option>
                      <option value="residence">रहिवासी दाखला (Residence Certificate)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">अर्जदाराचे नाव</label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. राहुल विकास शेटे"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="border border-green-600 p-2.5 rounded-xl w-full text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">इतर सविस्तर माहिती / कारण</label>
                    <textarea
                      rows={3}
                      placeholder="अर्ज करण्यासाठी लागणारी कारणे किंवा संदर्भ माहिती..."
                      value={appDetails}
                      onChange={(e) => setAppDetails(e.target.value)}
                      className="border border-green-600 p-2.5 rounded-xl w-full text-sm outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingApp}
                    className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl shadow transition"
                  >
                    {submittingApp ? "सादर होत आहे..." : "अर्ज सादर करा"}
                  </button>
                </form>
              </div>
            </div>

            {/* Applications tracker logs (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">अर्जांची स्थिती (Applications Status)</h3>
                
                {applications.length === 0 ? (
                  <p className="text-gray-500 text-center py-10">अद्याप कोणताही अर्ज केलेला नाही.</p>
                ) : (
                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
                    {applications.map((app) => (
                      <div key={app._id} className="border border-green-100 rounded-3xl p-5 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-lg text-gray-800 capitalize">
                              {app.type === "birth" ? "जन्म दाखला अर्ज" : 
                               app.type === "death" ? "मृत्यू दाखला अर्ज" : 
                               app.type === "income" ? "उत्पन्न दाखला अर्ज" : 
                               app.type === "marriage" ? "विवाह दाखला अर्ज" : 
                               "रहिवासी दाखला अर्ज"}
                            </h4>
                            <p className="text-xs text-gray-400">अर्जदार: {app.applicantName}</p>
                            <p className="text-[10px] text-gray-400 mt-1">तारीख: {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>
                          
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            app.status === "completed" 
                              ? "bg-green-100 text-green-700" 
                              : app.status === "need_documents" 
                              ? "bg-red-100 text-red-600" 
                              : "bg-orange-100 text-orange-600"
                          }`}>
                            {app.status === "completed" ? "Completed" : app.status === "need_documents" ? "Need Documents" : "Pending"}
                          </span>
                        </div>

                        {app.details?.description && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-3 font-medium">
                            तपशील: {app.details.description}
                          </p>
                        )}

                        {/* Admin remarks if any */}
                        {app.remark && (
                          <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r-xl mb-3">
                            <p className="text-xs font-bold text-orange-700">अधिकारी रिमार्क (Remark):</p>
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
                              📥 दाखला डाऊनलोड करा / Download Certificate
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
    </div>
  );
}
