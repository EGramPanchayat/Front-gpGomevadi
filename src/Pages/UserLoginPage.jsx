import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axioesInstance from "../utils/axioesInstance";

const translations = {
  en: {
    title: "Gram Panchayat Gomevadi",
    subtitle: "Citizen Portal",
    enterMobile: "Enter Mobile Number",
    helperText: "* Use your registered mobile number to login.",
    requestOtp: "Request OTP",
    sending: "Sending...",
    enteredMobile: "Entered Mobile Number",
    change: "Change",
    enterOtp: "Enter 6-Digit OTP Code",
    verifying: "Verifying...",
    verifyLogin: "Verify & Login",
    resendIn: "Resend OTP in: ",
    resendOtp: "Resend OTP",
    backHome: "← Back to Home"
  },
  mr: {
    title: "ग्रामपंचायत गोमेवाडी",
    subtitle: "नागरिक सेवा पोर्टल",
    enterMobile: "मोबाईल नंबर प्रविष्ट करा",
    helperText: "* लॉगिन करण्यासाठी आपला नोंदणीकृत मोबाईल नंबर वापरा.",
    requestOtp: "OTP मिळवा",
    sending: "पाठवत आहे...",
    enteredMobile: "प्रविष्ट केलेला मोबाईल नंबर",
    change: "बदला",
    enterOtp: "६ अंकी OTP कोड प्रविष्ट करा",
    verifying: "पडताळणी होत आहे...",
    verifyLogin: "पडताळणी आणि लॉगिन",
    resendIn: "पुन्हा OTP मिळवा : ",
    resendOtp: "पुन्हा OTP पाठवा",
    backHome: "← मुख्यपृष्ठावर जा"
  }
};

export default function UserLoginPage() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [language, setLanguage] = useState(() => localStorage.getItem("lang") || "mr");
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  const t = translations[language];

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

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

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobileNumber)) {
      return toast.error("Please enter a valid 10-digit mobile number");
    }

    setLoading(true);
    try {
      const { data } = await axioesInstance.post("/auth/otp/request", { mobileNumber });
      setOtpSent(true);
      startCountdown();
      toast.success("OTP sent successfully!");
      if (data.otp) {
        console.log(`[TESTING OTP]: ${data.otp}`);
        toast.info(`Sandbox Mode: Your OTP is ${data.otp}`, { autoClose: 10000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP code");
    }

    setLoading(true);
    try {
      const { data } = await axioesInstance.post("/auth/otp/verify", {
        mobileNumber,
        code: otp,
      });
      if (data.token) {
        localStorage.setItem("userToken", data.token);
      }
      toast.success("Login successful!");
      setTimeout(() => {
        window.location.href = "/user/dashboard";
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-gradient-to-br from-green-50 via-white to-orange-50 text-gray-850"
    }`}>
      
      {/* TOP HEADER / NAVBAR */}
      <nav className={`flex justify-between items-center px-6 py-4 border-b transition duration-300 ${
        isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-green-100"
      } backdrop-blur`}>
        <div className="flex items-center gap-2.5">
          <img
            src="/images/satyamev.jpg"
            alt="Logo"
            className="h-10 w-10 rounded-full object-cover border shadow-sm"
          />
          <span className="font-extrabold text-sm tracking-tight">{t.title}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Language selection button */}
          <div className={`flex rounded-xl p-0.5 border ${isDarkMode ? "border-slate-800 bg-slate-950" : "border-gray-200 bg-gray-50"}`}>
            <button
              onClick={() => setLanguage("mr")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                language === "mr" 
                  ? "bg-green-700 text-white shadow-md" 
                  : isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-gray-500 hover:text-gray-850"
              }`}
            >
              मराठी
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                language === "en" 
                  ? "bg-green-700 text-white shadow-md" 
                  : isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-gray-500 hover:text-gray-855"
              }`}
            >
              English
            </button>
          </div>

          {/* Dark Mode toggle button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition ${
              isDarkMode 
                ? "bg-slate-800 border-slate-700 text-yellow-400" 
                : "bg-gray-100 border-gray-200 text-gray-700"
            }`}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      {/* LOGIN CARD CONTAINER */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`rounded-3xl shadow-2xl border p-8 w-full max-w-md relative overflow-hidden transition ${
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-green-200"
        }`}>
          {/* Background decoration elements */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-green-200/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-orange-200/20 rounded-full blur-xl"></div>

          {/* SATYAMEV JAYATE LOGO */}
          <div className="flex flex-col items-center mb-8 relative">
            <img
              src="/images/satyamev.jpg"
              alt="Satyamev Jayate"
              className="h-16 w-16 rounded-full object-cover border-2 border-green-600 shadow"
            />
            <h2 className="text-2xl font-bold mt-3 text-center">{t.title}</h2>
            <p className="text-gray-400 text-sm">{t.subtitle}</p>
          </div>

          {!otpSent ? (
            <form onSubmit={handleRequestOtp} className="space-y-6 relative">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2">
                  {t.enterMobile}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold select-none">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    placeholder="9876543210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                    className={`border-2 outline-none p-3 pl-14 rounded-2xl w-full text-lg font-semibold transition ${
                      isDarkMode ? "bg-slate-950 border-slate-800 text-white focus:border-green-600" : "border-green-100 focus:border-green-600 text-gray-800"
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {t.helperText}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-2xl shadow-lg transition text-lg flex items-center justify-center gap-2 ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span>{t.sending}</span>
                ) : (
                  <>
                    <span>{t.requestOtp}</span>
                    <span className="text-xl">→</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6 relative">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">
                  {t.enteredMobile}
                </label>
                <div className={`flex justify-between items-center border rounded-xl p-3 mb-4 ${
                  isDarkMode ? "bg-slate-950 border-slate-800" : "bg-gray-50 border-green-200"
                }`}>
                  <span className="font-semibold text-gray-400">+91 {mobileNumber}</span>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-xs font-bold text-orange-500 hover:underline"
                  >
                    {t.change}
                  </button>
                </div>

                <label className="block text-sm font-bold text-gray-500 mb-2">
                  {t.enterOtp}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="******"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className={`border-2 outline-none p-3 rounded-2xl w-full text-center text-2xl tracking-[0.7em] font-extrabold transition ${
                    isDarkMode ? "bg-slate-950 border-slate-800 text-white focus:border-green-600" : "border-green-100 focus:border-green-600 text-gray-800"
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-2xl shadow-lg transition text-lg ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? t.verifying : t.verifyLogin}
              </button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-500">
                    {t.resendIn}<span className="font-bold text-green-700">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="text-sm font-bold text-green-700 hover:underline"
                  >
                    {t.resendOtp}
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="text-center mt-8 border-t border-gray-150 pt-4">
            <a href="/" className="text-sm text-orange-500 hover:underline font-semibold">
              {t.backHome}
            </a>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </div>
  );
}
