import React from "react";

const GovernmentOfficials = () => {
  const officials = [
    {
      id: 1,
      name: "माननीय मुख्यमंत्री",
      subtitle: "श्री. देवेंद्र फडणवीस",
      image: "/images/devendraFadanwis.webp",
    },
    {
      id: 2,
      name: "माननीय उपमुख्यमंत्री",
      subtitle: "श्री. एकनाथ शिंदे",
      image: "/images/yeknathShinde.jpeg",
    },
    {
      id: 3,
      name: "माननीय उपमुख्यमंत्री",
      subtitle: "श्री. अजित पवार",
      image: "/images/ajitPawar.jpeg",
    },
    {
      id: 4,
      name: "माननीय मंत्री, ग्रामविकास व पंचायतराज विभाग",
      subtitle: "श्री. जयकुमार गोरे",
      image: "/images/jayKumar.jpeg",
    },
    {
      id: 5,
      name: "माननीय राज्यमंत्री, ग्रामविकास व पंचायतराज विभाग",
      subtitle: "श्री. योगेश कदम",
      image: "/images/yogeshKadam.png",
    },
    {
      id: 6,
      name: "प्रधान सचिव, ग्रामविकास व पंचायतराज विभाग",
      subtitle: "श्री. एकनाथ डवळे ",
      image: "/images/yeknathDwale.png",
    },
  ];

  return (
    <section
      id="officials"
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
              key={official.id}
              className="flex flex-col items-center text-center bg-green-900 rounded-xl shadow-xl p-4 sm:p-5 w-36 sm:w-56 md:w-64 border-b-4 border-green-500 hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              {/* Role */}
              <span className="block w-full bg-green-700 text-white text-[0.7rem] sm:text-sm font-bold py-2 rounded-md mb-3 leading-tight text-center">
                {official.name}
              </span>

              {/* Image */}
              <img
                src={official.image}
                alt={official.subtitle}
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover mb-3 mt-1"
              />

              {/* Name */}
              <h6 className="text-xs sm:text-base font-normal mb-1 text-white">
                {official.subtitle}
              </h6>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GovernmentOfficials;
