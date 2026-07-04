import { useState } from "react";
import axioesInstance from "../utils/axioesInstance";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DevelopementWorkAdmin from "../AdminComponents/DevelopementWorkAdmin";
import NewsUpload from "../AdminComponents/NewsUpload";

import QRUploadModal from "../AdminComponents/QRUploadModal";
import DakhalaSubmissions from "../AdminComponents/DakhalaSubmissions";
import ExecutiveBoardAdmin from "../AdminComponents/ExecutiveBoardAdmin";
import GovOfficialsAdmin from "../AdminComponents/GovOfficialsAdmin";
import SiteSettingsAdmin from "../AdminComponents/SiteSettingsAdmin";
import { Link } from "react-scroll";
import NoticeUploadModal from "../AdminComponents/NoticeUploadModal";

export default function AdminDashboard() {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null); // 'exec', 'officers', 'gov', or null

  const toggleSection = (section) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  // Close mobile navbar menu helper
  const closeMobileMenu = () => {
    try {
      const menu = document.getElementById('navbar-menu');
      const toggle = document.getElementById('navbar-toggle');
      if (menu && toggle && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
        toggle.classList.remove('hidden');
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <>
      <QRUploadModal open={qrModalOpen} onClose={() => setQrModalOpen(false)} />
      <NoticeUploadModal open={noticeModalOpen} onClose={() => setNoticeModalOpen(false)} />
      
      {/* NAVBAR */}
      <nav className="bg-green-700 text-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/satyamev.jpg"
              alt="Logo"
              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow"
            />
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-bold tracking-wide whitespace-nowrap">
                ग्रामपंचायत गोमेवाडी
              </h1>
              <span className="text-sm md:text-base text-white/80">
                ता. आटपाडी जि. सांगली
              </span>
            </div>
          </div>

          <div className="relative w-full">
            <button
              id="navbar-toggle"
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 absolute right-4 top-1/2 -translate-y-1/2 z-50"
              onClick={() => {
                const menu = document.getElementById("navbar-menu");
                const toggle = document.getElementById("navbar-toggle");
                if (menu.classList.contains("hidden")) {
                  menu.classList.remove("hidden");
                  toggle.classList.add("hidden");
                }
              }}
              aria-label="Open menu"
            >
              <span className="block w-7 h-0.5 bg-white mb-1 rounded"></span>
              <span className="block w-7 h-0.5 bg-white mb-1 rounded"></span>
              <span className="block w-7 h-0.5 bg-white rounded"></span>
            </button>
            <div
              id="navbar-menu"
              className="hidden md:flex gap-8 text-base font-semibold items-center fixed md:static left-0 top-16 w-full bg-green-700 md:bg-transparent rounded-b shadow-2xl md:shadow-none p-6 md:p-0 z-50"
            >
              {/* Cross button for mobile nav */}
              <button
                className="absolute right-4 top-4 text-white text-2xl md:hidden"
                aria-label="Close menu"
                onClick={() => {
                  const menu = document.getElementById("navbar-menu");
                  const toggle = document.getElementById("navbar-toggle");
                  menu.classList.add("hidden");
                  toggle.classList.remove("hidden");
                }}
              >
                ×
              </button>
              <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-start md:justify-end gap-6 md:gap-8 mt-8 md:mt-0">
                <Link to="news-section" smooth duration={500} onClick={() => { closeMobileMenu(); setQrModalOpen(false); }} className="cursor-pointer text-gray-300 hover:text-green-300">बातम्या</Link>
                <button
                  className="cursor-pointer text-gray-300 hover:text-green-300 text-base font-semibold bg-transparent border-none p-0 m-0"
                  onClick={() => { setNoticeModalOpen(true); closeMobileMenu(); }}
                  style={{ fontWeight: "inherit" }}
                >
                  सूचना
                </button>
                <Link to="devworks-section" smooth duration={500} onClick={() => { closeMobileMenu(); setQrModalOpen(false); }} className="cursor-pointer text-gray-300 hover:text-green-300">विकास कामे</Link>
                
                {/* On Desktop these go to sections, on mobile we scroll to accordion area */}
                <Link to="site-settings-section" smooth duration={500} onClick={() => { closeMobileMenu(); setQrModalOpen(false); }} className="cursor-pointer text-gray-300 hover:text-green-300">सामान्य माहिती</Link>
                <Link to="exec-section" smooth duration={500} onClick={() => { closeMobileMenu(); setQrModalOpen(false); }} className="cursor-pointer text-gray-300 hover:text-green-300">कार्यकारिणी</Link>
                <Link to="gov-officials-section" smooth duration={500} onClick={() => { closeMobileMenu(); setQrModalOpen(false); }} className="cursor-pointer text-gray-300 hover:text-green-300">शासकीय अधिकारी</Link>
                
                <button
                  className="cursor-pointer text-gray-300 hover:text-green-300 text-base font-semibold bg-transparent border-none p-0 m-0"
                  onClick={() => { setQrModalOpen(true); closeMobileMenu(); }}
                  style={{ fontWeight: "inherit" }}
                >
                  कर
                </button>
                <button
                  onClick={async () => {
                    closeMobileMenu();
                    setQrModalOpen(false);
                    try {
                      await axioesInstance.post("/admin/logout");
                    } catch (e) {
                      // ignore
                    }
                    window.location.href = "/login";
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow font-bold transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="pt-24 min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <section id="news-section" className="max-w-7xl mx-auto mb-12">
          <NewsUpload />
        </section>
        <section id="devworks-section" className="max-w-7xl mx-auto mb-12">
          <DevelopementWorkAdmin />
        </section>

        <section id="dakhala-section" className="max-w-7xl mx-auto mb-12">
          <DakhalaSubmissions />
        </section>

        {/* Desktop View: Show all sections normally */}
        <div className="hidden md:block">
          {/* EXEC BOARD ADMIN */}
          <section id="exec-section" className="max-w-7xl mx-auto mb-12">
            <ExecutiveBoardAdmin mode="all" />
          </section>

          <section id="gov-officials-section" className="max-w-7xl mx-auto mb-12">
            <GovOfficialsAdmin />
          </section>

          <section id="site-settings-section" className="max-w-7xl mx-auto mb-12">
            <SiteSettingsAdmin />
          </section>
        </div>

        {/* Mobile View: Accordion style with 3 stacked rectangles */}
        <div id="mobile-accordion-section" className="block md:hidden space-y-4 max-w-7xl mx-auto mb-12">
          
          {/* Item 1: गाव कार्यकारिणी व्यवस्थापन */}
          <div className="bg-white rounded-2xl shadow-md border border-green-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('exec')}
              className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-green-700 text-lg bg-green-50 hover:bg-green-100 transition duration-300"
            >
              <span>गाव कार्यकारिणी व्यवस्थापन</span>
              <span className={`transform transition-transform duration-300 ${openSection === 'exec' ? 'rotate-180' : 'rotate-0'}`}>
                ▼
              </span>
            </button>
            {openSection === 'exec' && (
              <div className="p-4 bg-white border-t border-green-100">
                <ExecutiveBoardAdmin mode="exec" />
              </div>
            )}
          </div>

          {/* Item 2: अधिकारी */}
          <div className="bg-white rounded-2xl shadow-md border border-green-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('officers')}
              className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-green-700 text-lg bg-green-50 hover:bg-green-100 transition duration-300"
            >
              <span>अधिकारी</span>
              <span className={`transform transition-transform duration-300 ${openSection === 'officers' ? 'rotate-180' : 'rotate-0'}`}>
                ▼
              </span>
            </button>
            {openSection === 'officers' && (
              <div className="p-4 bg-white border-t border-green-100">
                <ExecutiveBoardAdmin mode="officers" />
              </div>
            )}
          </div>

          {/* Item 3: शासकीय अधिकारी व्यवस्थापन */}
          <div className="bg-white rounded-2xl shadow-md border border-green-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('gov')}
              className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-green-700 text-lg bg-green-50 hover:bg-green-100 transition duration-300"
            >
              <span>शासकीय अधिकारी व्यवस्थापन</span>
              <span className={`transform transition-transform duration-300 ${openSection === 'gov' ? 'rotate-180' : 'rotate-0'}`}>
                ▼
              </span>
            </button>
            {openSection === 'gov' && (
              <div className="p-4 bg-white border-t border-green-100">
                <GovOfficialsAdmin />
              </div>
            )}
          </div>

          {/* Item 4: सामान्य माहिती */}
          <div className="bg-white rounded-2xl shadow-md border border-green-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('site-settings')}
              className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-green-700 text-lg bg-green-50 hover:bg-green-100 transition duration-300"
            >
              <span>सामान्य माहिती व्यवस्थापन</span>
              <span className={`transform transition-transform duration-300 ${openSection === 'site-settings' ? 'rotate-180' : 'rotate-0'}`}>
                ▼
              </span>
            </button>
            {openSection === 'site-settings' && (
              <div className="p-4 bg-white border-t border-green-100">
                <SiteSettingsAdmin />
              </div>
            )}
          </div>
        </div>
      </main>

      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </>
  );
}
