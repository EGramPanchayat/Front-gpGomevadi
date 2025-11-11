import React from "react";
import { motion } from "framer-motion";
import { GrEmptyCircle } from "react-icons/gr";

const SloganTicker = () => {
  const slogans = [
    "एकच ध्येय, स्वच्छ आणि समृद्ध गाव!",
    "चला, एकत्र येऊया, गाव सुंदर बनवूया!",
    "ग्रामपंचायत: गाव विकासाचे केंद्र!",
    "आपला ग्रामविकास, आपले योगदान!",
  ];

  // Render slogans with icon in front
  const text = slogans.map((slogan, index) => (
    <span
      key={index}
      className="flex items-center gap-2 mx-6"
    >
      <GrEmptyCircle className="text-green-700 text-sm" />
      <span>{slogan}</span>
    </span>
  ));

  return (
    <section className="w-full bg-white overflow-hidden py-4 border-t-2 border-b-2 mt-5 border-orange-300">
      <motion.div
        className="flex whitespace-nowrap text-green-700 text-base md:text-lg font-semibold tracking-wide"
        animate={{ x: ["100%", "-100%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 10, // slower, smooth scroll
        }}
      >
        {text}
        {/* duplicate for seamless loop */}
        {text}
      </motion.div>
    </section>
  );
};

export default SloganTicker;
