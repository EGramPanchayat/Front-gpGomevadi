const CertificatesSection = () => (
  <section
    id="certificates"
    className="flex flex-col items-center w-full bg-gray-50 pt-10 md:pt-20 md:pb-30"
  >
    <div
      className="w-full mx-auto max-w-[1200px] rounded-3xl overflow-hidden bg-white shadow-lg p-6 md:p-10"
      style={{ borderRadius: '24px' }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-green-700 text-center mb-6">
        प्रमाणपत्रे
      </h2>

      <div className="flex flex-col md:flex-row gap-5 w-full">
        {/* Left Side */}
        <div className="flex flex-col gap-5 w-full md:w-1/2">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow p-5 w-full border border-orange-600 transition-all duration-300 hover:shadow-md hover:-translate-x-1">
            <h4 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="4" y="8" width="16" height="10" rx="2" />
                  <rect x="9" y="12" width="6" height="6" rx="1" />
                </svg>
              </span>
              नोकरी व्यवसायासाठी नाहरकत स्वयंघोषणापत्र
            </h4>
            <p className="text-sm md:text-base leading-snug">
              नोकरी किंवा व्यवसायासाठी आवश्यक प्रमाणपत्र.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow p-5 w-full border border-orange-600 transition-all duration-300 hover:shadow-md hover:-translate-x-1">
            <h4 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="8" y1="8" x2="16" y2="16" strokeWidth="2" />
                  <line x1="16" y1="8" x2="8" y2="16" strokeWidth="2" />
                </svg>
              </span>
              बेरोजगार असल्याबाबत स्वयंघोषणापत्र
            </h4>
            <p className="text-sm md:text-base leading-snug">
              बेरोजगार असल्याचे प्रमाणित करणारे अधिकृत पत्र.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow p-5 w-full border border-orange-600 transition-all duration-300 hover:shadow-md hover:-translate-x-1">
            <h4 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M3 12l9-9 9 9" />
                  <rect x="6" y="12" width="12" height="8" rx="2" />
                </svg>
              </span>
              रहिवासी स्वयंघोषणापत्र
            </h4>
            <p className="text-sm md:text-base leading-snug">
              गावातील रहिवासाचा पुरावा म्हणून वापरले जाते.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col gap-5 w-full md:w-1/2">
          {/* Card 4 */}
          <div className="bg-white rounded-2xl shadow p-5 w-full border border-orange-600 transition-all duration-300 hover:shadow-md hover:-translate-x-1">
            <h4 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="4" y="6" width="16" height="14" rx="2" />
                  <line x1="8" y1="10" x2="8" y2="14" strokeWidth="2" />
                  <line x1="16" y1="10" x2="16" y2="14" strokeWidth="2" />
                </svg>
              </span>
              वयाबाबत स्वयंघोषणापत्र
            </h4>
            <p className="text-sm md:text-base leading-snug">
              कायदेशीर वय प्रमाणित करण्यासाठी आवश्यक.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-2xl shadow p-5 w-full border border-orange-600 transition-all duration-300 hover:shadow-md hover:-translate-x-1">
            <h4 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <polygon points="13 2 13 13 17 13 12 22 12 11 8 11 13 2" />
                </svg>
              </span>
              वीज जोडणीसाठी नाहरकत स्वंयघोषणापत्र
            </h4>
            <p className="text-sm md:text-base leading-snug">
              वीज जोडणी घेण्यासाठी आवश्यक प्रमाणपत्र.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-2xl shadow p-5 w-full border border-orange-600 transition-all duration-300 hover:shadow-md hover:-translate-x-1">
            <h4 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8 12h8M8 16h8M8 8h8" />
                </svg>
              </span>
              योजनेचा लाभ न घेतल्याबाबत स्वयंघोषणापत्र
            </h4>
            <p className="text-sm md:text-base leading-snug">
              सरकारी योजनेचा लाभ न घेतल्याचे प्रमाणपत्र.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CertificatesSection;
