import React, { useEffect, useState } from "react";
import ExecutiveBoard from "../Components/ExecutiveBoard";
import Navbar from "../Components/Navbar";
import NewsSection from "../Components/NewsSection";
import DevelopmentSlideshow from "../Components/DevelopmentSection";


import PlacesSection from "../Components/PlacesSection";
import ContactSection from "../Components/ContactSection";
import FooterSection from "../Components/FooterSection";
import CertificatesSection from "../Components/CertificatesSection";
import DakhalaMagani from "../Components/DakhalaMagani";
import ServicesSection from "../Components/ServicesSection";
import TaxSection from "../Components/TaxSection";
import SamajSudharak from "../Components/SamajSudharak";
import GovernmentOfficials from "../Components/GovernmentOfficials";
import SloganTicker from "../Components/SloganTicker";
import AamchyaSeva from "../Components/ourServices";
import EmergencyContact from "../Components/EmergencyContact";
import { useSiteConfig } from "../utils/SiteConfigContext";
import { useLanguage } from "../utils/LanguageContext";


const sectionIds = [
  "home",
  "about",
  "development",
  "services",
  "certificates",
  "tax",
  "members",
  "places",
  "contact",
];

const MainPage = () => {
  const [activeSection, setActiveSection] = useState("home");
  // Mobile nav state
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { config, loading } = useSiteConfig();
  const { lang } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);

        if (section && section.offsetTop <= window.scrollY + 100) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50/50 via-white to-orange-50/50">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = config?.stats || [];
  const heroTitle = config?.heroTitle 
    ? (lang === "mr" ? config.heroTitle : (config.heroTitleEn || "Digital Gram Panchayat Gomevadi"))
    : (lang === "mr" ? "डिजिटल ग्रामपंचायत गोमेवाडी" : "Digital Gram Panchayat Gomevadi");

  const heroSubtitle = config?.heroSubtitle 
    ? (lang === "mr" ? config.heroSubtitle : (config.heroSubtitleEn || "Welcome to Digital Grampanchayat Portal"))
    : (lang === "mr" ? "आपले डिजिटल ग्रामपंचायत पोर्टल" : "Welcome to Digital Grampanchayat Portal");

  const heroImage = config?.heroImage || "/images/village.png";
  const aboutTitle = config?.aboutTitle 
    ? (lang === "mr" ? config.aboutTitle : (config.aboutTitleEn || "Village Profile"))
    : (lang === "mr" ? "गावाची माहिती" : "Village Profile");

  const aboutParagraphs = config?.aboutParagraphs || [];

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 font-sans ">
        {/* Navbar */}
        <Navbar activeSection={activeSection} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} />

     

      <section id="home" className="relative w-full flex justify-center items-center">
        <div className="relative w-full ">
          <img
            src={heroImage}
            alt="गाव दृश्य"
            className="w-full object-cover h-64 sm:h-80 md:h-full"
          />
  <div className="absolute inset-0 flex flex-col items-center justify-top text-center px-4 py-8 md:py-20">
      <h1 className="text-3xl md:text-[2.5rem] font-extrabold drop-shadow md:mb-5 text-green-700">
            {heroTitle}
          </h1>
          <p className="text-xl md:text-3xl mb-6 font-bold text-green-700">{heroSubtitle}</p>
        </div>
      </div>
    </section>

    <SloganTicker />

    <div className="bottom-village-content flex flex-col items-center w-full px-1 md:px-0 lg:px-15">
      {/* Stats Cards */}
  <div className="flex flex-wrap justify-center px-2 gap-4 sm:gap-8 mt-8 mb-8 w-full">
        {stats.map((stat, idx) => (
          <div
              key={idx}
              className={
                `bg-white rounded-xl shadow-lg px-8 py-5 flex flex-col items-center 
                border-l-4 border-green-400 hover:-translate-y-1 hover:shadow-xl transition
                w-full sm:flex-1 sm:min-w-[160px]
                animate-[fadeUpSmall_0.7s_ease-out]`
              }
              style={{animationDelay: `${0.1 + idx * 0.1}s`}}>
            <div>
               <div className="text-4xl mb-2 flex justify-center ">{stat.icon}</div>
              <div className="text-2xl font-bold text-green-700 mb-1 flex justify-center">{stat.number}</div>
              <div className="text-gray-600 text-base flex justify-center">
                {lang === "mr" ? stat.label : (
                  stat.label === "हेक्टर क्षेत्रफळ" ? "Area in Hectares" :
                  stat.label === "वार्ड संख्या" ? "Total Wards" :
                  stat.label === "एकूण लोकसंख्या" ? "Total Population" :
                  stat.label === "कुटुंब संख्या" ? "Number of Households" : stat.label
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* About Section */}
      <section id="about" className="px-5 md:px-0 py-10 w-full md:max-w-[81rem] flex flex-col items-center justify-center text-center">
        <div className="max-w-8xl w-full flex flex-col items-center">
         
          <div className="bg-white  rounded-xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-8 hover:shadow-2xl hover:-translate-y-1 transition">

             <h2 className="text-3xl md:text-[2.5rem] font-bold text-green-700 text-center mb-20 mt-5 relative">
            {aboutTitle}
            <span className="block w-24 h-1 bg-orange-400 rounded absolute left-1/2 -translate-x-1/2 -bottom-3"></span>
          </h2>
            {aboutParagraphs.map((para, idx) => (
              <p key={idx} className={`text-lg text-justify leading-relaxed${idx > 0 ? " mt-4" : ""}`}
                 dangerouslySetInnerHTML={{ __html: para }}
              />
            ))}
          </div>
        </div>
      </section>


      </div>


<SamajSudharak />

<NewsSection />

<DevelopmentSlideshow />




    

    {/* Services Section */}

<ServicesSection  />


  <CertificatesSection />

    <AamchyaSeva/>
<EmergencyContact/>
  <DakhalaMagani />


    {/* Tax Section as Component */}
    <TaxSection />

      {/* Government Officials Section */}
      <GovernmentOfficials />

      {/* कार्यकारी मंडळ Section  */}
      <ExecutiveBoard />

  

      {/* Places Section */}
      <PlacesSection />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer Section */}

<FooterSection />


  
    
  </div>
  );
}

export default MainPage;

