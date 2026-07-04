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
      localStorage.removeItem("userToken");
      toast.success("सत्र समाप्त झाले");
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

      toast.success("अर्ज आणि शुल्क यशस्वीरित्या सादर झाले!");
      
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
      toast.error("अर्ज जतन करताना त्रुटी आली");
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleApplyCertificate = async (e) => {
    e.preventDefault();

    if (!form.forName || !form.email || !form.type) {
      return toast.error("कृपया आपले नाव, ईमेल आणि दाखला प्रकार प्रविष्ट करा.");
    }

    if (form.whatsappNo && !/^[0-9]{10}$/.test(form.whatsappNo)) {
      return toast.error("व्हॉट्सऍप क्रमांक १० अंकांचा असावा");
    }

    // Type field-specific validations
    switch (form.type) {
      case 'जन्म नोंद':
        if (!form.childName || !form.dob) return toast.error("जन्माचे नाव आणि जन्मतारीख आवश्यक आहे.");
        break;
      case 'मृत्यू नोंद':
        if (!form.deathName || !form.deathDate) return toast.error("नाव आणि मृत्यूची तारीख आवश्यक आहे.");
        break;
      case 'विवाह नोंदणी दाखला':
        if (!form.coupleName || !form.marriageYear) return toast.error("दांपत्याचे नाव आणि नोंदणी वर्ष आवश्यक आहे.");
        break;
      case '८ अ उतारा':
        if (!form.propertyNo) return toast.error("मिळकत नंबर आवश्यक आहे.");
        break;
      case 'निराधार असल्याचा दाखला मागणी':
        if (!form.niradharName) return toast.error("निराधार व्यक्तीचे नाव आवश्यक आहे.");
        break;
      case 'दारिद्र्य रेषेखाली असल्याचा दाखला':
      case 'ग्रामपंचायत येणे बाकी दाखला':
        if (!form.certificateName) return toast.error("नाव आवश्यक आहे.");
        break;
    }

    const isFeeRequired = ['जन्म नोंद', 'मृत्यू नोंद', 'विवाह नोंदणी दाखला', '८ अ उतारा', 'ग्रामपंचायत येणे बाकी दाखला'].includes(form.type);

    if (isFeeRequired) {
      setSubmittingApp(true);
      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) throw new Error("Razorpay script load failed");

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
              toast.error("पेमेंट पडताळणी अयशस्वी");
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
              toast.error("पेमेंट पडताळणी अयशस्वी");
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
        toast.error(err.message || "पेमेंट प्रक्रिया सुरू करण्यात अक्षम");
        setSubmittingApp(false);
      }
    } else {
      setSubmittingApp(true);
      try {
        await submitApplicationRequest("FREE_EXEMPT");
      } catch (err) {
        toast.error("अर्ज सादर करताना त्रुटी");
        setSubmittingApp(false);
      }
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

            {/* FAMILY PROFILE DATA CARD */}
            <div className="bg-white rounded-3xl p-6 shadow border border-green-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full flex items-center justify-center opacity-70">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-lg font-extrabold text-green-800 mb-4 border-b pb-2 flex items-center gap-2">
                कुटुंबाची सविस्तर माहिती (Household Profile)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">कुटुंब प्रमुख (Head of Family)</p>
                  <p className="font-extrabold text-gray-800 text-base mt-0.5">{family?.mainMemberName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">घर क्रमांक (House Number)</p>
                  <p className="font-extrabold text-gray-800 text-base mt-0.5">{family?.houseNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">मोबाईल नंबर (Registered Phone)</p>
                  <p className="font-extrabold text-gray-800 text-base mt-0.5">{family?.mobileNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">व्हॉट्सॲप नंबर (WhatsApp Contact)</p>
                  <p className="font-extrabold text-gray-800 text-base mt-0.5">{family?.whatsappNumber || "उपलब्ध नाही"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">पत्ता (Registered Address)</p>
                  <p className="font-extrabold text-gray-800 text-base mt-0.5">{family?.address || "गोमेवाडी, महाराष्ट्र"}</p>
                </div>
                <div className="md:col-span-2 grid grid-cols-4 gap-2 text-center bg-green-50/40 p-4 rounded-2xl border border-green-100">
                  <div>
                    <span className="text-[10px] text-gray-400 font-extrabold block">पुरुष (Men)</span>
                    <span className="font-extrabold text-gray-800 text-lg">{family?.menCount ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-extrabold block">महिला (Women)</span>
                    <span className="font-extrabold text-gray-800 text-lg">{family?.womenCount ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-extrabold block">ज्येष्ठ (Seniors)</span>
                    <span className="font-extrabold text-gray-800 text-lg">{family?.seniorCount ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-extrabold block">बालके (Children)</span>
                    <span className="font-extrabold text-gray-800 text-lg">{family?.childrenCount ?? 0}</span>
                  </div>
                </div>
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
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">नवीन दाखला अर्ज (Apply for Certificate)</h3>
                <form onSubmit={handleApplyCertificate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">दाखल्याचा प्रकार (Select Type)</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="border border-green-600 p-2.5 rounded-xl w-full text-xs font-bold outline-none"
                    >
                      <option value="जन्म नोंद">जन्म नोंद (Birth Registration) - ₹20</option>
                      <option value="मृत्यू नोंद">मृत्यू नोंद (Death Registration) - ₹20</option>
                      <option value="विवाह नोंदणी दाखला">विवाह नोंदणी दाखला (Marriage Certificate) - ₹20</option>
                      <option value="८ अ उतारा">८ अ उतारा (8A Transcript) - ₹20</option>
                      <option value="ग्रामपंचायत येणे बाकी दाखला">ग्रामपंचायत येणे बाकी दाखला (No Dues Certificate) - ₹20</option>
                      <option value="दारिद्र्य रेषेखाली असल्याचा दाखला">दारिद्र्य रेषेखाली असल्याचा दाखला (BPL Certificate) - मोफत</option>
                      <option value="निराधार असल्याचा दाखला मागणी">निराधार असल्याचा दाखला मागणी (Destitute Certificate) - मोफत</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">अर्जदाराचे नाव (Applicant Name)</label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. राहुल शेटे"
                      value={form.forName}
                      onChange={(e) => setForm({ ...form, forName: e.target.value })}
                      className="border border-green-200 p-2.5 rounded-xl w-full text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">व्हॉट्सॲप नंबर (WhatsApp Number)</label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. ९८७६५४३२१०"
                      value={form.whatsappNo}
                      onChange={(e) => setForm({ ...form, whatsappNo: e.target.value })}
                      className="border border-green-200 p-2.5 rounded-xl w-full text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ईमेल पत्ता (Email Address)</label>
                    <input
                      type="email"
                      required
                      placeholder="उदा. name@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="border border-green-200 p-2.5 rounded-xl w-full text-xs outline-none"
                    />
                  </div>

                  {/* DYNAMIC FORMS STACK */}
                  {form.type === "जन्म नोंद" && (
                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100 space-y-3">
                      <p className="text-[10px] font-bold text-green-700 uppercase">👶 जन्म नोंद तपशील:</p>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">बाळाचे नाव (Child Name)</label>
                        <input
                          type="text"
                          required
                          value={form.childName}
                          onChange={(e) => setForm({ ...form, childName: e.target.value })}
                          className="border border-green-200 p-2 rounded-xl w-full text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">जन्मतारीख (Date of Birth)</label>
                        <input
                          type="date"
                          required
                          value={form.dob}
                          onChange={(e) => setForm({ ...form, dob: e.target.value })}
                          className="border border-green-200 p-2 rounded-xl w-full text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {form.type === "मृत्यू नोंद" && (
                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100 space-y-3">
                      <p className="text-[10px] font-bold text-green-700 uppercase">🪦 मृत्यू नोंद तपशील:</p>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">मृत व्यक्तीचे नाव (Deceased Name)</label>
                        <input
                          type="text"
                          required
                          value={form.deathName}
                          onChange={(e) => setForm({ ...form, deathName: e.target.value })}
                          className="border border-green-200 p-2 rounded-xl w-full text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">मृत्यूची तारीख (Date of Death)</label>
                        <input
                          type="date"
                          required
                          value={form.deathDate}
                          onChange={(e) => setForm({ ...form, deathDate: e.target.value })}
                          className="border border-green-200 p-2 rounded-xl w-full text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {form.type === "विवाह नोंदणी दाखला" && (
                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100 space-y-3">
                      <p className="text-[10px] font-bold text-green-700 uppercase">💍 विवाह नोंदणी तपशील:</p>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">दांपत्याचे नाव (Husband & Wife Names)</label>
                        <input
                          type="text"
                          required
                          placeholder="उदा. पती व पत्नी"
                          value={form.coupleName}
                          onChange={(e) => setForm({ ...form, coupleName: e.target.value })}
                          className="border border-green-200 p-2 rounded-xl w-full text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">नोंदणी वर्ष (Marriage Year)</label>
                        <input
                          type="number"
                          required
                          placeholder="उदा. २०२४"
                          value={form.marriageYear}
                          onChange={(e) => setForm({ ...form, marriageYear: e.target.value })}
                          className="border border-green-200 p-2 rounded-xl w-full text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {form.type === "८ अ उतारा" && (
                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100 space-y-3">
                      <p className="text-[10px] font-bold text-green-700 uppercase">📄 ८ अ उतारा तपशील:</p>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">मिळकत नंबर (Property Account No)</label>
                        <input
                          type="text"
                          required
                          placeholder="उदा. १८२"
                          value={form.propertyNo}
                          onChange={(e) => setForm({ ...form, propertyNo: e.target.value })}
                          className="border border-green-200 p-2 rounded-xl w-full text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {form.type === "निराधार असल्याचा दाखला मागणी" && (
                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100 space-y-3">
                      <p className="text-[10px] font-bold text-green-700 uppercase">🤝 निराधार दाखला तपशील:</p>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">निराधार व्यक्तीचे संपूर्ण नाव</label>
                        <input
                          type="text"
                          required
                          value={form.niradharName}
                          onChange={(e) => setForm({ ...form, niradharName: e.target.value })}
                          className="border border-green-200 p-2 rounded-xl w-full text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {(form.type === "दारिद्र्य रेषेखाली असल्याचा दाखला" || form.type === "ग्रामपंचायत येणे बाकी दाखला") && (
                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100 space-y-3">
                      <p className="text-[10px] font-bold text-green-700 uppercase">📑 दाखला तपशील:</p>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">दाखला ज्यांच्या नावे हवा आहे त्यांचे नाव</label>
                        <input
                          type="text"
                          required
                          value={form.certificateName}
                          onChange={(e) => setForm({ ...form, certificateName: e.target.value })}
                          className="border border-green-200 p-2 rounded-xl w-full text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingApp}
                    className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl shadow transition"
                  >
                    {submittingApp ? "सादर होत आहे..." : ['जन्म नोंद', 'मृत्यू नोंद', 'विवाह नोंदणी दाखला', '८ अ उतारा', 'ग्रामपंचायत येणे बाकी दाखला'].includes(form.type) ? "₹20 भरा आणि सबमिट करा" : "मोफत सबमिट करा"}
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
                      <div key={app._id} className="border border-green-100 rounded-3xl p-5 flex flex-col justify-between hover:shadow transition duration-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-extrabold text-lg text-gray-800">
                              {app.type}
                            </h4>
                            <p className="text-xs text-gray-400 font-bold">अर्जदार: {app.applicantName}</p>
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

                        {app.details && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-3 space-y-1 font-medium">
                            {app.details.whatsappNo && <p>💬 व्हॉट्सॲप: <span className="font-bold text-gray-800">{app.details.whatsappNo}</span></p>}
                            {app.details.email && <p>✉️ ईमेल: <span className="font-bold text-gray-800">{app.details.email}</span></p>}
                            {app.details.transactionId && <p className="font-mono text-[10px]">💳 पेमेंट ID: <span className="text-green-700 font-bold">{app.details.transactionId}</span></p>}
                            {app.details.childName && <p>👶 बाळाचे नाव: <span className="font-bold text-gray-800">{app.details.childName}</span> | जन्मतारीख: <span className="font-bold text-gray-800">{app.details.dob}</span></p>}
                            {app.details.deathName && <p>🪦 मयत व्यक्ती: <span className="font-bold text-gray-800">{app.details.deathName}</span> | तारीख: <span className="font-bold text-gray-800">{app.details.deathDate}</span></p>}
                            {app.details.coupleName && <p>💍 दांपत्य: <span className="font-bold text-gray-800">{app.details.coupleName}</span> | विवाह वर्ष: <span className="font-bold text-gray-800">{app.details.marriageYear}</span></p>}
                            {app.details.propertyNo && <p>🏠 मिळकत क्रमांक: <span className="font-bold text-gray-800">{app.details.propertyNo}</span></p>}
                            {app.details.niradharName && <p>🤝 निराधार व्यक्ती: <span className="font-bold text-gray-800">{app.details.niradharName}</span></p>}
                            {app.details.certificateName && <p>📑 दाखला नावे: <span className="font-bold text-gray-800">{app.details.certificateName}</span></p>}
                          </div>
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
