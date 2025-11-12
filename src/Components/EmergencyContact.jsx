import React, { useEffect, useRef, useState } from "react";
import { FiPhoneCall } from "react-icons/fi";

const emergencyContacts = [
  { emoji: "🚓", title: "पोलीस", number: "१००" },
  { emoji: "🚑", title: "रूग्णवाहिका", number: "१०८" },
  { emoji: "🔥", title: "अग्निशमन", number: "१०१" },
  { emoji: "💉", title: "रक्तपेढी", number: "१०४" },
  { emoji: "⚡", title: "महापरीषण", number: "१९१२" },
];

const EmergencyContact = () => {
  const [visibleCards, setVisibleCards] = useState([]);
  const sectionRef = useRef(null);

  // Animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            emergencyContacts.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards((prev) => [...new Set([...prev, index])]);
              }, index * 150);
            });
          } else {
            setVisibleCards([]);
          }
        });
      },
      { threshold: 0.2 }
    );

    const sectionEl = sectionRef.current;
    if (sectionEl) observer.observe(sectionEl);
    return () => sectionEl && observer.unobserve(sectionEl);
  }, []);

  return (
    <section
      id="emergency"
      ref={sectionRef}
      className="w-full py-14 pb-20  overflow-x-hidden bg-white"
    >
      <div className="w-full mx-auto max-w-[1200px] px-4 overflow-x-hidden">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-green-800 relative inline-block">
            आपत्कालीन संपर्क
            <span className="block w-24 h-1 bg-orange-500 rounded mx-auto mt-2"></span>
          </h2>
        </div>

        {/* --- MOBILE VIEW (simple list) --- */}
        <div className="block md:hidden space-y-4 overflow-hidden">
          {emergencyContacts.map((item, index) => (
            <div
              key={index}
              onClick={() =>
                (window.location.href = `tel:${item.number.replace(/\D/g, "")}`)
              }
              className={`flex justify-between items-center bg-white border border-green-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-500 px-4 py-3 mx-3 cursor-pointer transform ${
                visibleCards.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {/* Left side */}
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="text-base font-semibold text-green-800">
                    {item.title}
                  </p>
                  <p className="text-lg font-bold text-red-600">{item.number}</p>
                </div>
              </div>

              {/* Right side */}
              <div className="bg-green-600 text-white p-3 rounded-full shadow-md hover:bg-green-700 transition">
                <FiPhoneCall className="text-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* --- DESKTOP VIEW (fancy grid like AamchyaSeva) --- */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 overflow-hidden">
          {emergencyContacts.map((item, index) => (
            <div
              key={index}
              onClick={() =>
                (window.location.href = `tel:${item.number.replace(/\D/g, "")}`)
              }
              className={`relative transform transition-all duration-700 ease-in-out ${
                visibleCards.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              } hover:-translate-y-2 hover:shadow-2xl cursor-pointer bg-white border border-green-200 rounded-2xl shadow-md p-6 text-center group`}
            >
              {/* Emoji */}
              <div className="text-5xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                {item.emoji}
              </div>

              {/* Title */}
              <h4 className="text-xl font-bold text-green-800 mb-3">
                {item.title}
              </h4>

              {/* Phone Icon */}
              <div className="flex justify-center mb-2">
                <div className="bg-green-600 text-white p-3 rounded-full shadow-md group-hover:bg-green-700 transition">
                  <FiPhoneCall className="text-2xl" />
                </div>
              </div>

              {/* Number */}
              <p className="text-xl font-semibold text-red-600 mb-3">
                {item.number}
              </p>

              {/* Orange underline */}
              <div className="w-12 h-1 bg-orange-400 mx-auto rounded-full transition-all duration-300 group-hover:w-20"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmergencyContact;
