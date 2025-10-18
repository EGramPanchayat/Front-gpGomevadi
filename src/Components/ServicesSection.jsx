
const ServicesSection = () => (
  <section
    id="services"
    className="flex flex-col items-center justify-center w-full bg-gray-50 py-8 pt-20 md:py-0"
  >
    <div
      className="w-full mx-auto max-w-[1200px] rounded-3xl overflow-hidden bg-white shadow-lg p-3 md:p-10"
      style={{ borderRadius: '24px' }}
    >
      <h2 className="text-3xl md:text-[2.5rem] font-extrabold text-green-700 text-center mb-10 md:mt-15 sm:mb-14">
        मुख्य योजना
      </h2>
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Left Side */}
        <div className="flex flex-col gap-6 w-full md:w-1/2">
          {/* Swachh Bharat Mission */}
          <div className="bg-white rounded-2xl shadow-md p-6 w-full border-l-4 border-orange-400 hover:shadow-xl hover:-translate-y-1 transition" data-aos="fade-up" data-aos-delay="100">
            <h5 className="text-base sm:text-lg md:text-xl font-medium mb-3 flex items-center gap-3">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M4 17l4-8m4 8l4-8" />
                </svg>
              </span>
              स्वच्छ भारत मिशन
            </h5>
            <p className="text-sm sm:text-base leading-relaxed">ग्रामिण व शहरी भागात स्वच्छता अभियान राबविण्याची योजना.</p>
          </div>
          {/* Digital Anganwadi */}
          <div className="bg-white rounded-2xl shadow-md p-6 w-full border-l-4 border-orange-400 hover:shadow-xl hover:-translate-y-1 transition" data-aos="fade-up" data-aos-delay="150">
            <h5 className="text-base sm:text-lg md:text-xl font-medium mb-3 flex items-center gap-3">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="8" r="4" />
                  <rect x="6" y="14" width="12" height="6" rx="3" />
                </svg>
              </span>
              डिजिटल अंगणवाडी
            </h5>
            <p className="text-sm sm:text-base leading-relaxed">अंगणवाडी केंद्रांना आधुनिक तंत्रज्ञानाने सक्षम करण्ये.</p>
          </div>
          {/* Digital School */}
          <div className="bg-white rounded-2xl shadow-md p-6 w-full border-l-4 border-orange-400 hover:shadow-xl hover:-translate-y-1 transition" data-aos="fade-up" data-aos-delay="200">
            <h5 className="text-base sm:text-lg md:text-xl font-medium mb-3 flex items-center gap-3">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 3L2 9l10 6 10-6-10-6z" />
                  <path d="M2 9v6a2 2 0 002 2h16a2 2 0 002-2V9" />
                </svg>
              </span>
              डिजिटल शाळा
            </h5>
            <p className="text-sm sm:text-base leading-relaxed">विद्यालयांना डिजिटल शिक्षण सुविधा उपलब्ध करून देणे.</p>
          </div>
        </div>
        {/* Right Side */}
        <div className="flex flex-col gap-6 w-full md:w-1/2">
          {/* Digital Grampanchayat */}
          <div className="bg-white rounded-2xl shadow-md p-6 w-full border-l-4 border-orange-400 hover:shadow-xl hover:-translate-y-1 transition" data-aos="fade-up" data-aos-delay="250">
            <h5 className="text-base sm:text-lg md:text-xl font-medium mb-3 flex items-center gap-3">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="4" y="8" width="16" height="12" rx="2" />
                  <rect x="9" y="12" width="6" height="8" rx="1" />
                </svg>
              </span>
              डिजिटल ग्रामपंचायत
            </h5>
            <p className="text-sm sm:text-base leading-relaxed">ग्रामपंचायत कार्यप्रणालीमध्ये डिजिटलायझेशनचा समावेश.</p>
          </div>
          {/* CCTV */}
          <div className="bg-white rounded-2xl shadow-md p-6 w-full border-l-4 border-orange-400 hover:shadow-xl hover:-translate-y-1 transition" data-aos="fade-up" data-aos-delay="300">
            <h5 className="text-base sm:text-lg md:text-xl font-medium mb-3 flex items-center gap-3">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="3" y="7" width="18" height="10" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              शाळा व अंगणवाडी CCTV
            </h5>
            <p className="text-sm sm:text-base leading-relaxed">विद्यालयांच्या सुरक्षिततेसाठी सीसीटीव्ही सुविधा.</p>
          </div>
          {/* Aqua RO */}
          <div className="bg-white rounded-2xl shadow-md p-6 w-full border-l-4 border-orange-400 hover:shadow-xl hover:-translate-y-1 transition" data-aos="fade-up" data-aos-delay="350">
            <h5 className="text-base sm:text-lg md:text-xl font-medium mb-3 flex items-center gap-3">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 2C12 2 7 8 7 12a5 5 0 0010 0c0-4-5-10-5-10z" />
                </svg>
              </span>
              अ‍ॅक्वा आरओ शुद्ध पाणी प्रकल्प
            </h5>
            <p className="text-sm sm:text-base leading-relaxed">गावात शुद्ध पिण्याचे पाणी उपलब्ध करण्याची योजना.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ServicesSection;
