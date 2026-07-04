import React from "react";
import { useSiteConfig } from "../utils/SiteConfigContext";

const Navbar = ({ activeSection, mobileNavOpen, setMobileNavOpen }) => {
  const { config } = useSiteConfig();

  const gpName = config?.gpName || "ग्रामपंचायत";
  const subtitle = config ? `ता. ${config.taluka}, जि. ${config.district}` : "";

  return (
  <nav className="sticky top-0 bg-green-700 shadow text-white z-50">
    <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3">
        <img src="/images/satya.png" alt="Logo" className="h-10 w-10 rounded-full object-cover border-2 border-white shadow mr-2" />
        <div className="flex flex-col">
          <span className="text-xl font-bold">{gpName}</span>
          <span className="text-sm font-semibold text-green-100 leading-tight">{subtitle}</span>
        </div>
      </div>
      {/* Hamburger for mobile only, hidden when menu open */}
      {!mobileNavOpen && (
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10"
          aria-label="Open menu"
          onClick={() => setMobileNavOpen(true)}
        >
          <span className="block w-7 h-0.5 bg-white mb-1 rounded"></span>
          <span className="block w-7 h-0.5 bg-white mb-1 rounded"></span>
          <span className="block w-7 h-0.5 bg-white rounded"></span>
        </button>
      )}

      {/* Desktop nav */}
      <ul className="hidden md:flex gap-4 text-base font-medium">
        <li><a href="#home" className={activeSection==="home"?"text-orange-500 font-bold underline":"hover:text-orange-400"}>मुख्यपृष्ठ</a></li>
        <li><a href="#about" className={activeSection==="about"?"text-orange-500 font-bold underline":"hover:text-orange-400"}>गावाची माहिती</a></li>
        <li><a href="#development" className={activeSection==="development"?"text-orange-500 font-bold underline":"hover:text-orange-400"}>विकास कामे</a></li>
        <li><a href="#services" className={activeSection==="services"?"text-orange-500 font-bold underline":"hover:text-orange-400"}>मुख्य योजना</a></li>
        <li><a href="#certificates" className={activeSection==="certificates"?"text-orange-500 font-bold underline":"hover:text-orange-400"}>प्रमाणपत्रे</a></li>
        <li><a href="#tax" className={activeSection==="tax"?"text-orange-500 font-bold underline":"hover:text-orange-400"}>कर भरणा</a></li>
        <li><a href="#members" className={activeSection==="members"?"text-orange-500 font-bold underline":"hover:text-orange-400"}>कार्यकारी मंडळ</a></li>
        <li><a href="#officials" className={activeSection==="officials"?"text-orange-500 font-bold underline":"hover:text-orange-400"}>कर्मचारी</a></li>
        <li><a href="#places" className={activeSection==="places"?"text-orange-500 font-bold underline":"hover:text-orange-400"}>पर्यटन</a></li>
        <li><a href="#contact" className={activeSection==="contact"?"text-orange-500 font-bold underline":"hover:text-orange-400"}>संपर्क</a></li>
        <li><a href="/user-login" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3.5 py-1.5 rounded-xl ml-2 shadow transition text-sm">नागरिक लॉगिन</a></li>
      </ul>
    </div>

    {/* Mobile nav dropdown below navbar */}
    {mobileNavOpen && (
      <div className="absolute left-0 right-0 top-full bg-green-700 bg-opacity-95 z-[100] rounded-b-xl shadow-2xl md:hidden">
       
       
  
        <button
          className="absolute top-3 right-4 text-white text-3xl bg-transparent rounded-full p-2 shadow-none"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        >
          ×
        </button>
        {/* Nav links stacked in 1 column */}
        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto pt-10 pb-6">
          <a href="#home" className={activeSection==="home"?"text-orange-500 font-bold underline text-lg":"hover:text-orange-400 text-lg"} onClick={()=>setMobileNavOpen(false)}>मुख्यपृष्ठ</a>
          <a href="#about" className={activeSection==="about"?"text-orange-500 font-bold underline text-lg":"hover:text-orange-400 text-lg"} onClick={()=>setMobileNavOpen(false)}>गावाची माहिती</a>
          <a href="#development" className={activeSection==="development"?"text-orange-500 font-bold underline text-lg":"hover:text-orange-400 text-lg"} onClick={()=>setMobileNavOpen(false)}>विकास कामे</a>
          <a href="#services" className={activeSection==="services"?"text-orange-500 font-bold underline text-lg":"hover:text-orange-400 text-lg"} onClick={()=>setMobileNavOpen(false)}>मुख्य योजना</a>
          <a href="#certificates" className={activeSection==="certificates"?"text-orange-500 font-bold underline text-lg":"hover:text-orange-400 text-lg"} onClick={()=>setMobileNavOpen(false)}>प्रमाणपत्रे</a>
          <a href="#tax" className={activeSection==="tax"?"text-orange-500 font-bold underline text-lg":"hover:text-orange-400 text-lg"} onClick={()=>setMobileNavOpen(false)}>कर भरणा</a>
          <a href="#members" className={activeSection==="members"?"text-orange-500 font-bold underline text-lg":"hover:text-orange-400 text-lg"} onClick={()=>setMobileNavOpen(false)}>कार्यकारी मंडळ</a>
          <a href="#officials" className={activeSection==="officials"?"text-orange-500 font-bold underline text-lg":"hover:text-orange-400 text-lg"} onClick={()=>setMobileNavOpen(false)}>कर्मचारी</a>
          <a href="#places" className={activeSection==="places"?"text-orange-500 font-bold underline text-lg":"hover:text-orange-400 text-lg"} onClick={()=>setMobileNavOpen(false)}>पर्यटन</a>
          <a href="#contact" className={activeSection==="contact"?"text-orange-500 font-bold underline text-lg":"hover:text-orange-400 text-lg"} onClick={()=>setMobileNavOpen(false)}>संपर्क</a>
          <a href="/user-login" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-center py-2.5 rounded-xl text-lg mt-2 shadow transition" onClick={()=>setMobileNavOpen(false)}>नागरिक लॉगिन</a>
        </div>
      </div>
    )}
  </nav>
  );
};

export default Navbar;
