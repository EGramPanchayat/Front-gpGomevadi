import React from "react";
import { useSiteConfig } from "../utils/SiteConfigContext";

const PlacesSection = () => {
  const { config } = useSiteConfig();
  const places = config?.places || [];

  if (!places.length) return null;

  return (
  <section id="places" className="py-10 bg-white pt-17 md:pt-30 ">
    <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
      <h2 className="text-3xl md:text-[2.5rem] font-bold text-green-700 mb-10 relative">गावातील प्रसिद्ध स्थळे
        <span className="block w-24 h-1 bg-orange-400 rounded absolute left-1/2 -translate-x-1/2 -bottom-3"></span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {places.map((place, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg p-4 fade-in flex flex-col justify-between items-center h-full hover:shadow-2xl hover:-translate-y-1 transition">
            <img src={place.image} alt={place.name} className="w-full h-48 object-cover rounded-xl mb-4" />
            <h5 className="text-lg font-bold mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 2L12 22"/><path d="M6 12L12 2L18 12"/>
              </svg>
              {place.name}
            </h5>
            <p className="text-justify">{place.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default PlacesSection;
