import React from "react";
import { useNavigate } from "react-router-dom";

const TaxSection = () => {
  const navigate = useNavigate();

  const handlePay = () => {
    navigate("/user-login");
  };

  return (
    <section className="w-full flex justify-center items-center bg-white py-10 px-4">
      <div
        id="tax"
        className="w-full bg-gradient-to-br from-green-100 to-blue-50 
                   flex flex-col md:flex-row justify-between items-stretch 
                   rounded-3xl shadow-2xl transition-all duration-300 
                   p-6 md:p-10 gap-6 max-w-[1200px] mx-auto overflow-hidden"
      >
        {/* Left Section: Title (30%) */}
        <div className="w-full md:w-[30%] flex items-center justify-center md:justify-start">
          <h2 className="text-2xl md:text-3xl font-semibold text-green-700 relative text-center w-full after:content-[''] after:block after:w-16 after:h-1 after:bg-orange-500 after:mx-auto after:mt-2 rounded-full">
            कर भरणा
          </h2>
        </div>

        {/* Right Section: Cards (70%) */}
        <div className="w-full md:w-[70%] flex flex-col md:flex-row gap-6">
          {/* पाणीपट्टी Card */}
          <div
            className="bg-white rounded-2xl shadow-lg flex flex-col items-center 
                       p-5 sm:p-6 min-h-[300px] w-full hover:shadow-2xl 
                       hover:-translate-y-1 transition-transform duration-300"
          >
            <img
              src="/images/water-supply.png"
              alt="पाणीपट्टी"
              className="w-full h-40 sm:h-44 object-cover rounded mb-2"
            />
            <h5 className="text-lg sm:text-xl font-semibold mt-2 mb-2">
              पाणीपट्टी
            </h5>
            <p className="mb-3 text-sm text-center text-gray-700">
              घरगुती व शेती पाणीपट्टी ऑनलाइन भरा.
            </p>
            <button
              className="bg-green-600 text-white px-6 py-2 rounded-lg w-full mt-auto 
                         hover:bg-green-700 transition text-base font-medium"
              onClick={handlePay}
            >
              भरा
            </button>
          </div>

          {/* मालमत्ता कर Card */}
          <div
            className="bg-white rounded-2xl shadow-lg flex flex-col items-center 
                       p-5 sm:p-6 min-h-[300px] w-full hover:shadow-2xl 
                       hover:-translate-y-1 transition-transform duration-300"
          >
            <img
              src="/images/home.jpeg"
              alt="मालमत्ता कर"
              className="w-full h-40 sm:h-44 object-cover rounded mb-2"
            />
            <h5 className="text-lg sm:text-xl font-semibold mt-2 mb-2">
              मालमत्ता कर
            </h5>
            <p className="mb-3 text-sm text-center text-gray-700">
              घर व शेतजमिनीसाठी मालमत्ता कर भरा.
            </p>
            <button
              className="bg-green-600 text-white px-6 py-2 rounded-lg w-full mt-auto 
                         hover:bg-green-700 transition text-base font-medium"
              onClick={handlePay}
            >
              भरा
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaxSection;
