import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axioesInstance from "../utils/axioesInstance";
import { useSiteConfig } from "../utils/SiteConfigContext";
import { useSearchParams } from "react-router-dom";
import { User, ShieldCheck, CheckCircle2, Home, LayoutDashboard, Send, Lock } from "lucide-react";

export default function QrPartialPage() {
  const { config } = useSiteConfig();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [gpDetails, setGpDetails] = useState(null);
  const [family, setFamily] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [maskedMobile, setMaskedMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));
  const [countdown, setCountdown] = useState(0);

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
        }
      } catch (err) {
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

  const handleGoDashboard = async () => {
    setRequestingOtp(true);
    try {
      const { data } = await axioesInstance.post("/auth/otp/request-by-qr", {
        familyId,
        token
      });
      if (data.success) {
        setMobileNumber(data.mobileNumber);
        setMaskedMobile(data.maskedMobile);
        setOtpSent(true);
        startCountdown();
        toast.success("OTP sent to registered mobile number!");
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
    if (!otp || otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP code");
    }

    setVerifyingOtp(true);
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

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  useEffect(() => {
    if (otp.length === 6) {
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
    if (!/^\d{6}$/.test(data)) return;
    const newOtp = data.split("");
    setOtpValues(newOtp);
    setOtp(data);
    inputRefs.current[5].focus();
  };

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
      <div className="w-full max-w-md bg-slate-50 sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col min-h-screen sm:min-h-0 sm:h-[800px]">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-900 pt-12 pb-20 px-6 rounded-b-[2.5rem] shadow-md relative z-0">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-white animate-pulse" />
            <span className="text-[10px] font-bold text-white tracking-wide uppercase">QR सत्यापित</span>
          </div>
          <div className="text-center mt-4">
            <h1 className="text-2xl font-black text-white mb-1 tracking-tight">
              {gpDetails?.name || "ग्रामपंचायत गोमेवाडी"}
            </h1>
            <p className="text-orange-200 text-xs font-bold uppercase tracking-widest">
              डिजिटल नागरिक केंद्र
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
                className="w-16 h-16 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="px-6 pt-6 pb-28 flex-1 overflow-y-auto space-y-6">
          
          {/* Scan success confirmation */}
          <div className="bg-green-50/50 border border-green-150 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <h4 className="font-extrabold text-green-900 text-xs">स्कॅन यशस्वी!</h4>
              <p className="text-[10px] text-green-700 mt-0.5 font-bold">QR कोड सुरक्षितपणे ओळखला गेला आहे</p>
            </div>
          </div>

          {/* Household Info Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-orange-50 rounded-full flex items-center justify-center shrink-0 border border-orange-100">
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">कुटुंब प्रमुख</p>
                <h2 className="text-base font-black text-slate-800 leading-tight">
                  {family?.mainMemberName || "—"}
                </h2>
              </div>
            </div>
          </div>

          {!otpSent ? (
            /* Action Choice Buttons */
            <div className="space-y-3.5 pt-4">
              <button
                type="button"
                onClick={() => (window.location.href = "/")}
                className="w-full py-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-extrabold rounded-2xl flex items-center justify-center gap-2.5 transition active:scale-[0.98] shadow-sm text-sm"
              >
                <Home className="w-5 h-5 text-slate-500" />
                मुख्य वेबसाईटवर जा
              </button>

              <button
                type="button"
                onClick={handleGoDashboard}
                disabled={requestingOtp}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 transition active:scale-[0.98] disabled:opacity-75 shadow-md shadow-orange-500/20 text-sm"
              >
                {requestingOtp ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>ओटीपी पाठवत आहे...</span>
                  </>
                ) : (
                  <>
                    <LayoutDashboard className="w-5 h-5" />
                    डॅशबोर्डवर जा
                  </>
                )}
              </button>
            </div>
          ) : (
            /* OTP Verification Container */
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 space-y-6 animate-fadeIn">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-2 border border-orange-100">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm">मोबाईल पडताळणी (OTP Verification)</h3>
                <p className="text-xs text-slate-400 font-bold leading-normal">
                  नोंदणीकृत मोबाईल नंबर <span className="text-slate-850">{maskedMobile}</span> वर OTP पाठवला आहे
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {/* 6 Digit Box input fields */}
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
                      className="w-11 h-12 border-2 rounded-xl text-center font-extrabold text-base focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none bg-slate-50 transition"
                    />
                  ))}
                </div>

                <div className="text-center text-xs font-bold">
                  {countdown > 0 ? (
                    <span className="text-slate-400">
                      पुन्हा पाठवा {countdown} सेकंदात
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGoDashboard}
                      className="text-orange-600 hover:text-orange-700 transition underline"
                    >
                      OTP पुन्हा पाठवा (Resend OTP)
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={verifyingOtp || otp.length !== 6}
                  className="w-full py-3.5 bg-green-750 hover:bg-green-800 text-white font-extrabold rounded-2xl transition disabled:opacity-50 active:scale-[0.98] shadow-md shadow-green-700/20 text-xs flex items-center justify-center gap-1.5"
                >
                  {verifyingOtp ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>सत्यापित करत आहे...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      ओटीपी सत्यापित करा (Verify & Login)
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Brand footer */}
        <div className="absolute bottom-5 left-0 right-0 text-center text-[10px] text-slate-400 font-bold pointer-events-none">
          © {new Date().getFullYear()} {gpDetails?.name || "ग्रामपंचायत गोमेवाडी"} | सर्व हक्क राखीव.
        </div>

      </div>
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </div>
  );
}
