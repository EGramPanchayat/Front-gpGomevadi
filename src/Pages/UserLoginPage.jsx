import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axioesInstance from "../utils/axioesInstance";

export default function UserLoginPage() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

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
      return toast.error("कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा");
    }

    setLoading(true);
    try {
      const { data } = await axioesInstance.post("/auth/otp/request", { mobileNumber });
      setOtpSent(true);
      startCountdown();
      toast.success("OTP यशस्वीरित्या पाठवला गेला आहे!");
      if (data.otp) {
        // Display in sandbox developer console or UI for testing convenience
        console.log(`[TESTING OTP]: ${data.otp}`);
        toast.info(`Sandbox Mode: Your OTP is ${data.otp}`, { autoClose: 10000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "OTP पाठविण्यात त्रुटी");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      return toast.error("कृपया ६ अंकी OTP कोड प्रविष्ट करा");
    }

    setLoading(true);
    try {
      const { data } = await axioesInstance.post("/auth/otp/verify", {
        mobileNumber,
        code: otp,
      });
      toast.success("लॉगिन यशस्वी झाले!");
      setTimeout(() => {
        window.location.href = "/user/dashboard";
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || "अवैध OTP किंवा सर्व्हर त्रुटी");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-green-200 p-8 w-full max-w-md relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-green-200/50 rounded-full blur-xl"></div>
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-orange-200/50 rounded-full blur-xl"></div>

        {/* SATYAMEV JAYATE LOGO */}
        <div className="flex flex-col items-center mb-8 relative">
          <img
            src="/images/satyamev.jpg"
            alt="Satyamev Jayate"
            className="h-16 w-16 rounded-full object-cover border-2 border-green-600 shadow"
          />
          <h2 className="text-2xl font-bold text-green-700 mt-3">ग्रामपंचायत गोमेवाडी</h2>
          <p className="text-gray-500 text-sm">नागरिक सेवा पोर्टल / Villager Portal</p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleRequestOtp} className="space-y-6 relative">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                मोबाईल नंबर प्रविष्ट करा
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
                  className="border-2 border-green-200 focus:border-green-600 outline-none p-3 pl-14 rounded-2xl w-full text-lg font-semibold transition"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                * लॉगिन करण्यासाठी आपला नोंदणीकृत मोबाईल नंबर वापरा.
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
                <span>पाठवत आहे...</span>
              ) : (
                <>
                  <span>OTP मिळवा / Request OTP</span>
                  <span className="text-xl">→</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 relative">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                प्रविष्ट केलेला मोबाईल नंबर
              </label>
              <div className="flex justify-between items-center bg-gray-50 border border-green-200 rounded-xl p-3 mb-4">
                <span className="font-semibold text-gray-700">+91 {mobileNumber}</span>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-xs font-bold text-orange-500 hover:underline"
                >
                  बदला / Change
                </button>
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-2">
                ६ अंकी OTP कोड प्रविष्ट करा
              </label>
              <input
                type="text"
                maxLength={6}
                required
                placeholder="******"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="border-2 border-green-200 focus:border-green-600 outline-none p-3 rounded-2xl w-full text-center text-2xl tracking-[0.7em] font-extrabold transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-2xl shadow-lg transition text-lg ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "पडताळणी होत आहे..." : "पडताळणी आणि लॉगिन"}
            </button>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-gray-500">
                  पुन्हा OTP मिळवा : <span className="font-bold text-green-700">{countdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="text-sm font-bold text-green-700 hover:underline"
                >
                  पुन्हा OTP पाठवा / Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        <div className="text-center mt-8 border-t border-gray-100 pt-4">
          <a href="/" className="text-sm text-orange-500 hover:underline font-semibold">
            ← मुख्यपृष्ठावर जा / Back to Home
          </a>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </div>
  );
}
