import React from "react";
import { motion } from "framer-motion";
import { GrEmptyCircle } from "react-icons/gr";

const SloganTicker = () => {
  const slogans = [
    "एकच ध्येय, स्वच्छ आणि समृद्ध गाव!",
    "चला, एकत्र येऊया, गाव सुंदर बनवूया!",
    "ग्रामपंचायत: गाव विकासाचे केंद्र!",
    "आपला ग्रामविकास, आपले योगदान!",
    "पंचायत राज, स्वयंपूर्ण महाराष्ट्र.",
  ];

  // Render slogans with icon in front
  const text = slogans.map((slogan, index) => (
    <span key={index} className="flex items-center gap-2 mx-6">
      <GrEmptyCircle className="text-green-700 text-sm flex-shrink-0" />
      <span className="whitespace-nowrap">{slogan}</span>
    </span>
  ));

  return (
    <section className="w-full bg-white overflow-hidden py-4 border-t-2 border-b-2 mt-5 border-orange-300">
      <div className="relative w-full overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap text-green-900 text-base sm:text-lg font-bold tracking-wide"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 25, // smooth and long enough for mobile
          }}
          style={{ width: "max-content" }}
        >
          {/* triple content for continuous loop */}
          <div className="flex">{text}</div>
          <div className="flex">{text}</div>
          <div className="flex">{text}</div>
        </motion.div>
      </div>
    </section>
  );
};

export default SloganTicker;
