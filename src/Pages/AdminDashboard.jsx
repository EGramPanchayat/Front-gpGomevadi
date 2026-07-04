import { useState } from "react";
import axioesInstance from "../utils/axioesInstance";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Existing Admin Components
import DevelopementWorkAdmin from "../AdminComponents/DevelopementWorkAdmin";
import NewsUpload from "../AdminComponents/NewsUpload";
import QRUploadModal from "../AdminComponents/QRUploadModal";
import DakhalaSubmissions from "../AdminComponents/DakhalaSubmissions";
import ExecutiveBoardAdmin from "../AdminComponents/ExecutiveBoardAdmin";
import GovOfficialsAdmin from "../AdminComponents/GovOfficialsAdmin";
import SiteSettingsAdmin from "../AdminComponents/SiteSettingsAdmin";
import NoticeUploadModal from "../AdminComponents/NoticeUploadModal";

// New VMS Components
import VmsFamiliesAdmin from "../AdminComponents/VmsFamiliesAdmin";
import VmsTaxesAdmin from "../AdminComponents/VmsTaxesAdmin";
import VmsApplicationsAdmin from "../AdminComponents/VmsApplicationsAdmin";

export default function AdminDashboard() {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'development', 'submissions', 'families', 'taxes', 'vms-apps', 'members'
  
  // Collapse state for Members tab
  const [openSection, setOpenSection] = useState(null); 

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

  return (
    <>
      <QRUploadModal open={qrModalOpen} onClose={() => setQrModalOpen(false)} />
      <NoticeUploadModal open={noticeModalOpen} onClose={() => setNoticeModalOpen(false)} />

      <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-orange-50/30 font-sans flex flex-col md:flex-row">
        
        {/* PREMIUM SIDEBAR */}
        <aside className="w-full md:w-64 bg-green-950 text-white p-6 flex flex-col justify-between shadow-2xl z-30">
          <div className="space-y-8">
            
            {/* LOGO AREA */}
            <div className="flex items-center gap-3 border-b border-green-900 pb-4">
              <img
                src="/images/satyamev.jpg"
                alt="Logo"
                className="h-12 w-12 rounded-full object-cover border-2 border-white shadow"
              />
              <div>
                <h2 className="font-bold text-lg leading-tight">गोमेवाडी GP</h2>
                <span className="text-xs text-orange-400 font-bold">प्रशासकीय डॅशबोर्ड</span>
              </div>
            </div>

            {/* NAVIGATION TABS */}
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full text-left p-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition ${
                  activeTab === "overview" ? "bg-orange-500 text-white shadow-lg" : "hover:bg-green-900 text-green-100"
                }`}
              >
                <span>📰 बातम्या व सूचना / News</span>
              </button>

              <button
                onClick={() => setActiveTab("development")}
                className={`w-full text-left p-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition ${
                  activeTab === "development" ? "bg-orange-500 text-white shadow-lg" : "hover:bg-green-900 text-green-100"
                }`}
              >
                <span>🏗️ विकास कामे / Projects</span>
              </button>

              <button
                onClick={() => setActiveTab("submissions")}
                className={`w-full text-left p-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition ${
                  activeTab === "submissions" ? "bg-orange-500 text-white shadow-lg" : "hover:bg-green-900 text-green-100"
                }`}
              >
                <span>📥 सार्वजनिक दाखला अर्ज</span>
              </button>

              <div className="border-t border-green-900 my-2 pt-2 text-[10px] text-green-400 font-bold tracking-wider uppercase">
                VMS (कुटुंब व कर व्यवस्थापन)
              </div>

              <button
                onClick={() => setActiveTab("families")}
                className={`w-full text-left p-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition ${
                  activeTab === "families" ? "bg-orange-500 text-white shadow-lg" : "hover:bg-green-900 text-green-100"
                }`}
              >
                <span>🏠 कुटुंब नोंदणी / Families</span>
              </button>

              <button
                onClick={() => setActiveTab("taxes")}
                className={`w-full text-left p-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition ${
                  activeTab === "taxes" ? "bg-orange-500 text-white shadow-lg" : "hover:bg-green-900 text-green-100"
                }`}
              >
                <span>💰 कर विवरण / Taxes Config</span>
              </button>

              <button
                onClick={() => setActiveTab("vms-apps")}
                className={`w-full text-left p-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition ${
                  activeTab === "vms-apps" ? "bg-orange-500 text-white shadow-lg" : "hover:bg-green-900 text-green-100"
                }`}
              >
                <span>📝 नागरिक दाखला विनंती</span>
              </button>

              <div className="border-t border-green-900 my-2 pt-2 text-[10px] text-green-400 font-bold tracking-wider uppercase">
                संस्था व रचना
              </div>

              <button
                onClick={() => setActiveTab("members")}
                className={`w-full text-left p-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition ${
                  activeTab === "members" ? "bg-orange-500 text-white shadow-lg" : "hover:bg-green-900 text-green-100"
                }`}
              >
                <span>👥 सदस्य व शासकीय अधिकारी</span>
              </button>
            </nav>
          </div>

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="w-full mt-8 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-bold transition shadow-md"
          >
            Logout / बाहेर पडा
          </button>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <main className="flex-1 p-6 md:p-10 space-y-6 overflow-y-auto">
          
          {/* HEADER BAR */}
          <header className="flex justify-between items-center bg-white rounded-3xl shadow-md border border-green-100 p-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {activeTab === "overview" && "बातम्या आणि सूचना व्यवस्थापन"}
                {activeTab === "development" && "विकास कामे व्यवस्थापन"}
                {activeTab === "submissions" && "सार्वजनिक दाखले मागण्या यादी"}
                {activeTab === "families" && "गाव कुटुंब नोंदणी केंद्र"}
                {activeTab === "taxes" && "कर आकारणी आणि वसुली व्यवस्थापन"}
                {activeTab === "vms-apps" && "नागरिक दाखला विनंती मंजुरी केंद्र"}
                {activeTab === "members" && "अधिकारी, कार्यकारिणी आणि गाव माहिती"}
              </h1>
              <p className="text-sm text-gray-400">ग्रामपंचायत गोमेवाडी डिजिटल प्रणाली</p>
            </div>
            
            {/* Quick trigger buttons inside overview */}
            {activeTab === "overview" && (
              <div className="flex gap-2">
                <button
                  onClick={() => setNoticeModalOpen(true)}
                  className="bg-green-700 hover:bg-green-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition"
                >
                  🔔 नवीन सूचना
                </button>
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition"
                >
                  🖼️ QR अद्ययावत करा
                </button>
              </div>
            )}
          </header>

          {/* RENDERING DYNAMIC PANEL TABS */}
          <div className="space-y-6">
            
            {activeTab === "overview" && <NewsUpload />}
            
            {activeTab === "development" && <DevelopementWorkAdmin />}
            
            {activeTab === "submissions" && <DakhalaSubmissions />}
            
            {activeTab === "families" && <VmsFamiliesAdmin />}
            
            {activeTab === "taxes" && <VmsTaxesAdmin />}
            
            {activeTab === "vms-apps" && <VmsApplicationsAdmin />}
            
            {activeTab === "members" && (
              <div className="space-y-4 max-w-7xl mx-auto">
                {/* Accordion List for Desktop & Mobile to maintain unified premium look */}
                
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
