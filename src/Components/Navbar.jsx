import React from "react";
import { useSiteConfig } from "../utils/SiteConfigContext";
import { useLanguage } from "../utils/LanguageContext";

const NAV_LINKS = [
  { href: "#home", key: "home_link", en: "Home", mr: "मुख्यपृष्ठ", section: "home" },
  { href: "#about", key: "about_link", en: "About Village", mr: "गावाची माहिती", section: "about" },
  { href: "#development", key: "dev_link", en: "Development Works", mr: "विकास कामे", section: "development" },
  { href: "#services", key: "services_link", en: "Schemes", mr: "मुख्य योजना", section: "services" },
  { href: "#certificates", key: "certs_link", en: "Certificates", mr: "प्रमाणपत्रे", section: "certificates" },
  { href: "#tax", key: "tax_link", en: "Pay Taxes", mr: "कर भरणा", section: "tax" },
  { href: "#members", key: "board_link", en: "Executive Board", mr: "कार्यकारी मंडळ", section: "members" },
  { href: "#officials", key: "officials_link", en: "Officials", mr: "कर्मचारी", section: "officials" },
  { href: "#places", key: "tourism_link", en: "Tourism", mr: "पर्यटन", section: "places" },
  { href: "#contact", key: "contact_link", en: "Contact", mr: "संपर्क", section: "contact" },
];

const Navbar = ({ activeSection, mobileNavOpen, setMobileNavOpen }) => {
  const { config } = useSiteConfig();
  const { lang, setLang } = useLanguage();

  const gpName = config?.gpName || "ग्रामपंचायत";
  const subtitle = config ? `ता. ${config.taluka}, जि. ${config.district}` : "";
  const citizenLogin = lang === "mr" ? "नागरिक लॉगिन" : "Citizen Login";

  const linkLabel = (link) => (lang === "mr" ? link.mr : link.en);

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

        {/* Language Toggle — desktop */}
        <div className="hidden md:flex items-center gap-1 bg-green-800 rounded-full px-1 py-0.5 mr-1 border border-green-500">
          <button
            onClick={() => setLang("mr")}
            className={`px-3 py-1 rounded-full text-sm font-bold transition ${lang === "mr" ? "bg-orange-500 text-white shadow" : "text-green-200 hover:text-white"}`}
          >
            मर
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 rounded-full text-sm font-bold transition ${lang === "en" ? "bg-orange-500 text-white shadow" : "text-green-200 hover:text-white"}`}
          >
            EN
          </button>
        </div>

        {/* Hamburger for mobile only */}
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
          {NAV_LINKS.map((link) => (
            <li key={link.key}>
              <a
                href={link.href}
                className={activeSection === link.section ? "text-orange-500 font-bold underline" : "hover:text-orange-400"}
              >
                {linkLabel(link)}
              </a>
            </li>
          ))}
          <li>
            <a href="/user-login" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3.5 py-1.5 rounded-xl ml-2 shadow transition text-sm">
              {citizenLogin}
            </a>
          </li>
        </ul>
      </div>

      {/* Mobile nav dropdown */}
      {mobileNavOpen && (
        <div className="absolute left-0 right-0 top-full bg-green-700 bg-opacity-95 z-[100] rounded-b-xl shadow-2xl md:hidden">
          <button
            className="absolute top-3 right-4 text-white text-3xl bg-transparent rounded-full p-2 shadow-none"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          >
            ×
          </button>

          {/* Language toggle — mobile */}
          <div className="flex justify-center gap-2 pt-10 pb-2">
            <button
              onClick={() => setLang("mr")}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition border ${lang === "mr" ? "bg-orange-500 text-white border-orange-500" : "text-green-200 border-green-500 hover:text-white"}`}
            >
              मराठी
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition border ${lang === "en" ? "bg-orange-500 text-white border-orange-500" : "text-green-200 border-green-500 hover:text-white"}`}
            >
              English
            </button>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs mx-auto pb-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className={activeSection === link.section ? "text-orange-500 font-bold underline text-lg" : "hover:text-orange-400 text-lg"}
                onClick={() => setMobileNavOpen(false)}
              >
                {linkLabel(link)}
              </a>
            ))}
            <a
              href="/user-login"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-center py-2.5 rounded-xl text-lg mt-2 shadow transition"
              onClick={() => setMobileNavOpen(false)}
            >
              {citizenLogin}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
