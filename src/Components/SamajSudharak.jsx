import React from "react";
import { useSiteConfig } from "../utils/SiteConfigContext";

const SamajSudharak = () => {
  const { config } = useSiteConfig();
  const reformers = config?.reformers || [];

  if (!reformers.length) return null;

  return (
    <section
      id="samajsudharak"
      className="w-full flex flex-col items-center bg-white pt-10 pb-20 md:py-30 px-8 md:px-0"
    >
      <div className="max-w-6xl w-full mx-auto">
        {/* Heading */}
        <h2 className="text-3xl md:text-[2.5rem] font-bold text-green-700 text-center mb-12 relative">
          समाज सुधारक
          <span className="block w-24 h-1 bg-orange-400 rounded absolute left-1/2 -translate-x-1/2 -bottom-3"></span>
        </h2>

        {/* Grid of reformers - 6 cols on desktop, 3 cols on tablet, 3 cols on mobile */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-1 md:gap-6">
          {reformers.map((reformer, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center"
            >
              {/* Framed Image */}
              <div className="w-full aspect-square mb-3 border-2 border-orange-400 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-100">
                <img
                  src={reformer.image}
                  alt={reformer.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name and Description */}
              
            
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SamajSudharak;
