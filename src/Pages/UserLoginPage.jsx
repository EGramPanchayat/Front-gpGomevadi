import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axioesInstance from "../utils/axioesInstance";
import { useLanguage } from "../utils/LanguageContext";

export default function UserLoginPage() {
  const { lang, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpValues, setOtpValues] = useState(Array(4).fill(""));
  const [checkingSession, setCheckingSession] = useState(true);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const { data } = await axioesInstance.post("/auth/otp/refresh");
        if (data.token) {
          localStorage.setItem("userToken", data.token);
          toast.success("Session active, redirecting...");
          setTimeout(() => {
            window.location.href = "/user/dashboard";
          }, 800);
        } else {
          setCheckingSession(false);
        }
      } catch {
        setCheckingSession(false);
      }
    };
    checkActiveSession();
  }, []);

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
    if (e) e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) {
      return toast.error("Please enter a valid email address");
    }

    setLoading(true);
    try {
      const { data } = await axioesInstance.post("/auth/otp/request", { email });
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
    if (!otp || otp.length !== 4) {
      return toast.error("Please enter a valid 4-digit OTP code");
    }

    setLoading(true);
    try {
      const { data } = await axioesInstance.post("/auth/otp/verify", {
        email,
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

  const handleOtpChange = (value, index) => {
    const cleanValue = value.replace(/\D/g, "");
    const newOtp = [...otpValues];
    newOtp[index] = cleanValue.substring(cleanValue.length - 1);
    setOtpValues(newOtp);
    setOtp(newOtp.join(""));

    // Focus next box if filled
    if (cleanValue && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

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

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mb-4 animate-duration-1000"></div>
          <p className="text-gray-700 font-bold">
            Checking active session...
          </p>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl h-auto md:min-h-[460px] bg-white shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Left Part - Image & Brand (Exactly like LoginPage.jsx) */}
        <div className="relative w-full md:w-1/2 h-48 md:h-auto">
          <img
            src="/images/nature1.jpg"
            alt="background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2/11 text-2xl md:text-4xl font-extrabold text-white drop-shadow-lg font-serif text-center w-full px-4 leading-normal">
            ग्रामपंचायत <br /> गोमेवाडी
          </h1>
        </div>

        {/* Right Part - Form (Functional for User OTP Login) */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-6 relative">
          <div className="w-full max-w-sm mx-auto mt-4">
            <h2 className="text-2xl font-bold mb-1 text-green-800">
              {lang === "mr" ? "आपले स्वागत आहे" : "Welcome Back"}
            </h2>
            
            {!otpSent ? (
              <form onSubmit={handleRequestOtp} className="w-full">
                <p className="text-gray-500 mb-5 text-base">
                  {lang === "mr" ? "लॉगिन करण्यासाठी आपला नोंदणीकृत ईमेल पत्ता प्रविष्ट करा" : "Enter your registered email address to login"}
                </p>
                
                <div className="mb-4 mt-10">
                  <label className="block text-sm text-gray-700 mb-1">
                    {lang === "mr" ? "नोंदणीकृत ईमेल पत्ता" : "Registered Email Address"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-green-300 focus:outline-none text-base font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-bold text-sm mt-6"
                >
                  {loading ? (lang === "mr" ? "पाठवत आहे..." : "Sending...") : t("send_otp")}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="w-full">
                <p className="text-green-600 mb-4 text-base font-medium">
                  {lang === "mr" ? "ओटीपी यशस्वीरित्या पाठवला" : "OTP sent successfully"}
                </p>
                
                <div className="mb-4 mt-6">
                  {/* Styled Mobile Number Banner */}
                  <div className="flex justify-between items-center bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 mb-5 text-sm transition">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-800">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpValues(Array(4).fill(""));
                        setOtp("");
                      }}
                      className="text-xs font-bold text-orange-600 hover:text-orange-755 hover:underline transition"
                    >
                      {lang === "mr" ? "बदला" : "change"}
                    </button>
                  </div>

                  <label className="block text-sm text-gray-700 mb-2 font-medium">{t("enter_otp")}</label>
                  
                  {/* 6 beautiful digit boxes for OTP */}
                  <div className="flex justify-between gap-2 mt-2">
                    {otpValues.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                        className="w-11 h-11 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring focus:ring-green-300 focus:border-green-600 focus:outline-none transition bg-slate-50/50"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-bold text-sm mt-6 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>{t("verifying")}</span>
                    </>
                  ) : (
                    <span>{t("verify_login")}</span>
                  )}
                </button>

                <div className="text-center mt-4">
                  {countdown > 0 ? (
                    <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-150 px-3 py-1 rounded-full text-xs text-gray-600">
                      <span>{lang === "mr" ? "पुन्हा पाठवा" : "resend"}</span>
                      <span className="font-bold text-green-700">{countdown}s</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      className="text-xs font-bold text-green-700 hover:text-green-800 hover:underline transition"
                    >
                      {t("resend_otp")}
                    </button>
                  )}
                </div>
              </form>
            )}

            <p className="text-xs text-gray-400 mt-6 text-center font-medium leading-relaxed">
              {lang === "mr" 
                ? "नोंदणी झाली नसल्यास, कृपया ग्रामपंचायत कार्यालयातून तुमच्या कुटुंबाची नोंदणी करा." 
                : "If your family is not registered, please register from the Grampanchayat Office."}
            </p>
          </div>

        </div>

      </div>
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </div>
  );
}
