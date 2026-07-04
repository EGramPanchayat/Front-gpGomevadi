import React from "react";
import { useSiteConfig } from "../utils/SiteConfigContext";

const ContactSection = () => {
  const { config } = useSiteConfig();
  const contact = config?.contact || {};

  return (
  <section id="contact" className="py-20  bg-blue-50">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl md:text-[2.5rem] font-bold text-green-700 mb-10 relative">संपर्क</h2>
      <div className="flex flex-col md:flex-row gap-8 items-stretch">
        {/* Contact Info */}
        <div className="md:w-1/2 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
            <h5 className="text-xl font-extrabold mb-2 flex items-center gap-2 text-left">
              {/* Location SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
              </svg>
              पत्ता
            </h5>
            <p className="text-gray-700 text-left" style={{ whiteSpace: "pre-line" }}>
              {contact.address || ""}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
            <h5 className="text-xl font-extrabold mb-2 flex items-center gap-2 text-left">
              {/* Contact SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M21 8V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v1" />
                <rect x="3" y="8" width="18" height="13" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
              </svg>
              संपर्क
            </h5>
            <p className="text-gray-700 mb-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M4 4h16v16H4z" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
              <a href={`mailto:${contact.email || ""}`} className="text-blue-600 font-semibold">{contact.email || ""}</a>
            </p>
            
          </div>
        </div>
        {/* Map */}
        <div className="md:w-1/2 flex items-center justify-center">
          <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
            <iframe src={contact.googleMapsEmbedUrl || ""} width="100%" height="100%" style={{border:0}} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            <div className="text-center text-sm text-gray-700 mt-1">{contact.mapCaption || ""}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};

export default ContactSection;
