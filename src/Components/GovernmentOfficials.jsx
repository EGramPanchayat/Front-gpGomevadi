import React, { useEffect, useState } from "react";
import axioesInstance from "../utils/axioesInstance";

const GovernmentOfficials = () => {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axioesInstance
      .get("/gov-officials")
      .then((res) => {
        setOfficials(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load government officials:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section id="gov-officials" className="w-full flex justify-center items-center bg-white py-16 px-5 md:px-20">
        <div className="text-center text-green-700 font-semibold text-lg">लोड होत आहे...</div>
      </section>
    );
  }

  if (!officials.length) return null;

  return (
    <section
      id="gov-officials"
      className="w-full flex justify-center items-center bg-white py-16 px-5 md:px-20"
    >
      <div className="max-w-6xl w-full flex flex-col justify-between items-center gap-10">
        {/* Heading */}
        <h2 className="text-[1.8rem] sm:text-[2rem] font-bold text-green-700 text-center mb-8 w-full relative">
          ग्राम विकास व पंचायतराज विभाग, महाराष्ट्र राज्य
          <span className="block w-24 h-1 bg-orange-400 rounded absolute left-1/2 -translate-x-1/2 -bottom-3"></span>
        </h2>

        {/* Officials Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 place-items-center">
          {officials.map((official) => (
            <div
              key={official._id}
              className="flex flex-col items-center text-center bg-green-900 rounded-xl shadow-xl p-4 sm:p-5 w-36 sm:w-56 md:w-64 border-b-4 border-green-500 hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              {/* Role */}
              <span className="block w-full bg-green-700 text-white text-[0.7rem] sm:text-sm font-bold py-2 rounded-md mb-3 leading-tight text-center">
                {official.role}
              </span>

              {/* Image */}
              <img
                src={official.image}
                alt={official.name}
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover mb-3 mt-1"
              />

              {/* Name */}
              <h6 className="text-xs sm:text-base font-normal mb-1 text-white">
                {official.name}
              </h6>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GovernmentOfficials;
