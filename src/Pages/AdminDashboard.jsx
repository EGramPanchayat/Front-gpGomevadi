import { useState, useEffect } from "react";
import axioesInstance from "../utils/axioesInstance";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSiteConfig } from "../utils/SiteConfigContext";

// Existing Admin Components
import DevelopementWorkAdmin from "../AdminComponents/DevelopementWorkAdmin";
import NewsUpload from "../AdminComponents/NewsUpload";
import DakhalaSubmissions from "../AdminComponents/DakhalaSubmissions";
import ExecutiveBoardAdmin from "../AdminComponents/ExecutiveBoardAdmin";
import GovOfficialsAdmin from "../AdminComponents/GovOfficialsAdmin";
import SiteSettingsAdmin from "../AdminComponents/SiteSettingsAdmin";

// VMS Components
import VmsFamiliesAdmin from "../AdminComponents/VmsFamiliesAdmin";
import VmsTaxesAdmin from "../AdminComponents/VmsTaxesAdmin";
import VmsApplicationsAdmin from "../AdminComponents/VmsApplicationsAdmin";

export default function AdminDashboard() {
  const { config } = useSiteConfig();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [openSection, setOpenSection] = useState(null);

  const [language, setLanguage] = useState(() => localStorage.getItem("lang") || "mr");
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);


  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const handleLogout = async () => {
    try {
      await axioesInstance.post("/admin/logout");
    } catch (e) {
      // ignore
    }
    window.location.href = "/login";
  };

  const navItems = [
    { key: "dashboard", label: "डॅशबोर्ड" },
    { key: "overview", label: "बातम्या व सूचना" },
    { key: "development", label: "विकास कामे" },
  ];

  const vmsItems = [
    { key: "families", label: "कुटुंब नोंदणी" },
    { key: "taxes", label: "कर विवरण" },
    { key: "vms-apps", label: "दाखले मागणी अर्ज" },
  ];

  const memberItems = [
    { key: "members", label: "सदस्य व शासकीय अधिकारी" },
  ];

  const tabTitles = {
    dashboard: "प्रशासकीय डॅशबोर्ड",
    overview: "बातम्या आणि सूचना व्यवस्थापन",

    development: "विकास कामे व्यवस्थापन",
    submissions: "सार्वजनिक दाखले मागण्या यादी",
    families: "गाव कुटुंब नोंदणी केंद्र",
    taxes: "कर आकारणी आणि वसुली व्यवस्थापन",
    "vms-apps": "दाखले मागणी अर्ज मंजुरी केंद्र",
    members: "अधिकारी, कार्यकारिणी आणि गाव माहिती",
  };

  const NavButton = ({ tabKey, label }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 transition ${
        activeTab === tabKey
          ? "bg-orange-500 text-white shadow-lg"
          : isDarkMode
            ? "hover:bg-slate-800 text-slate-350"
            : "hover:bg-green-800/40 text-green-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className={`h-screen overflow-hidden font-sans flex flex-col md:flex-row transition-colors duration-300 ${isDarkMode
        ? "bg-slate-950 text-slate-100"
        : "bg-gradient-to-br from-green-50/50 via-white to-orange-50/50 text-gray-800"
      }`}>

        {/* SIDEBAR */}
        <aside className={`hidden md:flex md:w-64 p-6 flex-col justify-between shadow-2xl relative transition-colors duration-300 ${isDarkMode ? "bg-slate-900 border-r border-slate-800 text-white" : "bg-green-900 text-white"
          }`}>
          <div className="space-y-8">

            <div className={`flex flex-col border-b pb-4 gap-3 ${isDarkMode ? "border-slate-800" : "border-green-800"}`}>
              {/* Row for Logo Circle + Grampanchayat Name */}
              {(() => {
                const gpVillageName = config?.gpName ? config.gpName.replace(/ग्रामपंचायत/g, "").trim() : "गोमेवाडी";
                return (
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/satyamev.jpg"
                      alt="Logo"
                      className="h-14 w-14 rounded-full object-cover border-2 border-white shadow shrink-0"
                    />
                    <div className="min-w-0">
                      <h2 className="font-black text-[17px] leading-tight text-white tracking-wide">ग्रामपंचायत</h2>
                      <h3 className="font-black text-[17px] leading-tight text-white mt-0.5 tracking-wide">{gpVillageName}</h3>
                    </div>
                  </div>
                );
              })()}
              
              {/* Full width bottom info: Tal & Dist dynamic in Marathi */}
              <div className="flex justify-between items-center text-xs font-black text-gray-100 mt-1">
                <span>ता. {config?.taluka || "आटपाडी"}</span>
                <span>जि. {config?.district || "सांगली"}</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${isDarkMode ? "bg-slate-800 text-green-400 border border-slate-700" : "bg-white/10 text-orange-300 border border-white/10"}`}>Admin</span>
              </div>
            </div>

            {/* NAVIGATION */}
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavButton key={item.key} tabKey={item.key} label={item.label} />
              ))}

              <div className={`border-t my-2 pt-2 text-[10px] font-bold tracking-wider uppercase ${isDarkMode ? "border-slate-800 text-slate-500" : "border-green-800 text-green-400"}`}>
                कुटुंब व कर
              </div>

              {vmsItems.map((item) => (
                <NavButton key={item.key} tabKey={item.key} label={item.label} />
              ))}

              <div className={`border-t my-2 pt-2 text-[10px] font-bold tracking-wider uppercase ${isDarkMode ? "border-slate-800 text-slate-500" : "border-green-800 text-green-400"}`}>
                संस्था व रचना
              </div>

              {memberItems.map((item) => (
                <NavButton key={item.key} tabKey={item.key} label={item.label} />
              ))}
            </nav>
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition border border-white/20 shadow-md flex items-center justify-center gap-2"
          >
            बाहेर पडा
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 pt-6 px-4 md:pt-8 md:px-8 pb-28 md:pb-10 space-y-4 md:space-y-6 overflow-y-auto relative">




          {/* TAB CONTENT */}
          <div className="space-y-6">

            {activeTab === "dashboard" && (
              <div className="space-y-6">

                {/* VILLAGE IDENTITY HEADER */}
                <div className="relative bg-gradient-to-r from-green-900 via-green-800 to-emerald-900 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                  <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-orange-400/10 rounded-full translate-y-1/2" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    <img src="/images/satyamev.jpg" alt="GP Logo" className="h-20 w-20 rounded-full border-4 border-white/30 shadow-lg object-cover" />
                    <div>
                      <h1 className="text-3xl font-black tracking-tight">{config?.gpName || "ग्रामपंचायत गोमेवाडी"}</h1>
                      <p className="text-green-200 mt-1 text-sm font-semibold">
                        {config?.taluka && `ता. ${config.taluka}`}{config?.district && ` | जि. ${config.district}`}{config?.state && ` | ${config.state}`}{config?.pincode && ` — ${config.pincode}`}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="bg-orange-500/30 border border-orange-400/40 text-orange-200 text-xs font-bold px-3 py-1 rounded-full">ODF+ गाव</span>
                        <span className="bg-white/10 border border-white/20 text-white/80 text-xs font-bold px-3 py-1 rounded-full">डिजिटल ग्रामपंचायत</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(config?.stats || [
                    { number: "2200", label: "हेक्टर क्षेत्रफळ" },
                    { number: "4", label: "वार्ड संख्या" },
                    { number: "3,711", label: "एकूण लोकसंख्या" },
                    { number: "758", label: "कुटुंब संख्या" },
                  ]).map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-green-100 shadow-md p-5 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-0.5 transition">
                      <p className="text-3xl font-black text-green-700">{stat.number}</p>
                      <p className="text-xs text-gray-500 font-semibold mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* ABOUT + CONTACT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* About */}
                  <div className="bg-white rounded-2xl border border-green-100 shadow-md p-6">
                    <h3 className="text-base font-black text-green-800 mb-3 pb-2 border-b border-green-100">{config?.aboutTitle || "गावाची माहिती"}</h3>
                    <div className="space-y-3">
                      {(config?.aboutParagraphs || []).map((para, i) => (
                        <p key={i} className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: para }} />
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="bg-white rounded-2xl border border-green-100 shadow-md p-6">
                    <h3 className="text-base font-black text-green-800 mb-3 pb-2 border-b border-green-100">संपर्क माहिती</h3>
                    <div className="space-y-3 text-sm">
                      {config?.contact?.address && (
                        <div className="flex gap-3">
                          <span className="text-green-700 font-bold min-w-[70px]">पत्ता</span>
                          <span className="text-gray-600 whitespace-pre-line">{config.contact.address}</span>
                        </div>
                      )}
                      {config?.contact?.email && (
                        <div className="flex gap-3">
                          <span className="text-green-700 font-bold min-w-[70px]">ईमेल</span>
                          <a href={`mailto:${config.contact.email}`} className="text-green-600 hover:underline break-all">{config.contact.email}</a>
                        </div>
                      )}
                      {config?.contact?.phone && (
                        <div className="flex gap-3">
                          <span className="text-green-700 font-bold min-w-[70px]">फोन</span>
                          <span className="text-gray-600">{config.contact.phone}</span>
                        </div>
                      )}
                      {config?.contact?.officeHours && (
                        <div className="flex gap-3">
                          <span className="text-green-700 font-bold min-w-[70px]">वेळ</span>
                          <span className="text-gray-600">{config.contact.officeHours}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SERVICES */}
                {config?.services?.length > 0 && (
                  <div className="relative overflow-hidden bg-white rounded-3xl border border-green-100 shadow-md p-6 md:p-8">
                    {/* Background decoration circles (Top-Left, Top-Right, Bottom-Left, Bottom-Right) */}
                    <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-emerald-50 pointer-events-none"></div>
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-50 pointer-events-none"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-orange-50 pointer-events-none"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-teal-50 pointer-events-none"></div>

                    <h3 className="relative z-10 text-base font-black text-green-800 mb-6 pb-2 border-b border-green-100">
                      शासकीय योजना व सेवा
                    </h3>
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {config.services.map((svc, i) => (
                        <div
                          key={i}
                          className="bg-white/90 rounded-2xl p-5 border border-green-100 shadow-sm flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                        >
                          {svc.iconSvg && (
                            <div className="p-3 rounded-full flex-shrink-0 flex items-center justify-center bg-green-50 text-green-700">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                dangerouslySetInnerHTML={{ __html: svc.iconSvg }}
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-extrabold text-green-900 text-sm mb-1">{svc.title}</p>
                            <p className="text-xs text-gray-500 font-semibold leading-relaxed">{svc.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* QUICK NAV CARDS */}
                <div className="relative overflow-hidden bg-white rounded-3xl border border-green-100 shadow-md p-6 md:p-8">
                  {/* Floating abstract decorative circles (Top-Left, Top-Right, Bottom-Left, Bottom-Right) */}
                  <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-orange-50 pointer-events-none"></div>
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-teal-50 pointer-events-none"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-blue-50 pointer-events-none"></div>
                  <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-green-50 pointer-events-none"></div>

                  <h3 className="relative z-10 text-base font-black text-green-800 mb-6 pb-2 border-b border-green-100">
                    जलद नेव्हिगेशन
                  </h3>
                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: "overview", label: "बातम्या व सूचना", desc: "बातम्या आणि सूचना जोडा" },
                      { key: "development", label: "विकास कामे", desc: "विकास प्रकल्प व्यवस्थापन" },
                      { key: "submissions", label: "दाखला अर्ज", desc: "नागरिक अर्ज पहा" },
                      { key: "families", label: "कुटुंब नोंदणी", desc: "कुटुंब माहिती व्यवस्थापन" },
                      { key: "taxes", label: "कर विवरण", desc: "कर आकारणी व वसुली" },
                      { key: "members", label: "सदस्य / अधिकारी", desc: "संस्था व रचना" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setActiveTab(item.key)}
                        className="text-left p-5 bg-gradient-to-br from-orange-50/80 to-amber-50/40 border border-orange-200/50 rounded-2xl hover:shadow-md hover:border-orange-400 hover:-translate-y-0.5 transition-all duration-300 flex justify-between items-center group"
                      >
                        <div>
                          <p className="font-extrabold text-orange-900 text-sm group-hover:text-orange-950 transition-colors">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500 font-semibold mt-1 group-hover:text-gray-600">
                            {item.desc}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                          <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {activeTab === "overview" && <NewsUpload />}

            {activeTab === "development" && <DevelopementWorkAdmin />}

            {activeTab === "submissions" && <DakhalaSubmissions />}

            {activeTab === "families" && <VmsFamiliesAdmin />}

            {activeTab === "taxes" && <VmsTaxesAdmin />}

            {activeTab === "vms-apps" && <VmsApplicationsAdmin />}

            {activeTab === "members" && (
              <div className="space-y-4 max-w-7xl mx-auto">
                <div className="relative overflow-hidden bg-green-900 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-600/30 rounded-full pointer-events-none z-0"></div>
                  <div className="absolute -bottom-24 -left-16 w-56 h-56 bg-orange-500/30 rounded-full pointer-events-none z-0"></div>
                  <div className="absolute top-1/2 left-[60%] w-16 h-16 bg-yellow-400/30 rounded-full -translate-y-1/2 pointer-events-none z-0"></div>

                  <div className="relative z-10">
                    <h2 className="text-2xl font-black text-white drop-shadow-md">सदस्य, अधिकारी आणि गाव माहिती केंद्र (Village Administration Hub)</h2>
                    <p className="text-sm text-green-100 font-semibold mt-1">ग्रामपंचायत कार्यकारिणी, अधिकारी, शासकीय अधिकारी आणि सामान्य माहिती व्यवस्थापन पॅनेल</p>
                  </div>

                  <div className="relative z-10 bg-slate-100 p-1.5 rounded-2xl shrink-0">
                    <div className="bg-green-700 text-white shadow-md px-4 py-2.5 rounded-xl font-bold text-xs">
                      ४ व्यवस्थापन विभाग
                    </div>
                  </div>
                </div>

                {/* 1: गाव कार्यकारिणी */}
                <div className="bg-white rounded-3xl shadow-md border border-green-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("exec")}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-green-700 text-lg bg-green-50 hover:bg-green-100 transition duration-300"
                  >
                    <span>गाव कार्यकारिणी व्यवस्थापन</span>
                    <span className={`transform transition-transform duration-300 ${openSection === "exec" ? "rotate-180" : "rotate-0"}`}>
                      ▼
                    </span>
                  </button>
                  {openSection === "exec" && (
                    <div className="p-6 bg-white border-t border-green-100">
                      <ExecutiveBoardAdmin mode="exec" />
                    </div>
                  )}
                </div>

                {/* 2: अधिकारी */}
                <div className="bg-white rounded-3xl shadow-md border border-green-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("officers")}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-green-700 text-lg bg-green-50 hover:bg-green-100 transition duration-300"
                  >
                    <span>अधिकारी व्यवस्थापन</span>
                    <span className={`transform transition-transform duration-300 ${openSection === "officers" ? "rotate-180" : "rotate-0"}`}>
                      ▼
                    </span>
                  </button>
                  {openSection === "officers" && (
                    <div className="p-6 bg-white border-t border-green-100">
                      <ExecutiveBoardAdmin mode="officers" />
                    </div>
                  )}
                </div>

                {/* 3: शासकीय अधिकारी */}
                <div className="bg-white rounded-3xl shadow-md border border-green-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("gov")}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-green-700 text-lg bg-green-50 hover:bg-green-100 transition duration-300"
                  >
                    <span>शासकीय अधिकारी व्यवस्थापन</span>
                    <span className={`transform transition-transform duration-300 ${openSection === "gov" ? "rotate-180" : "rotate-0"}`}>
                      ▼
                    </span>
                  </button>
                  {openSection === "gov" && (
                    <div className="p-6 bg-white border-t border-green-100">
                      <GovOfficialsAdmin />
                    </div>
                  )}
                </div>

                {/* 4: सामान्य माहिती */}
                <div className="bg-white rounded-3xl shadow-md border border-green-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("site-settings")}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-green-700 text-lg bg-green-50 hover:bg-green-100 transition duration-300"
                  >
                    <span>सामान्य माहिती व्यवस्थापन</span>
                    <span className={`transform transition-transform duration-300 ${openSection === "site-settings" ? "rotate-180" : "rotate-0"}`}>
                      ▼
                    </span>
                  </button>
                  {openSection === "site-settings" && (
                    <div className="p-6 bg-white border-t border-green-100">
                      <SiteSettingsAdmin />
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </main>
      </div>

      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </>
  );
}
