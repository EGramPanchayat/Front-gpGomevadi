import React, { useState, useEffect, useRef } from "react";
import { BiBookmarkAlt } from "react-icons/bi";
import axioesInstance from "../utils/axioesInstance";

const services = [
  {
    emoji: "🏠",
    title: "घरकुल",
    description: "घर संबंधित सर्व योजना आणि सुविधांची माहिती मिळवा.",
    pdfPath: "/pdf/घरकुल.pdf",
  },
  {
    emoji: "🎓",
    title: "शिक्षण विभाग",
    description: "शैक्षणिक संस्था आणि शिष्यवृत्तीची माहिती.",
    pdfPath: "/pdf/स्वाधार योजना.pdf",
  },
  {
    emoji: "❤️",
    title: "आरोग्य सेवा",
    description: "प्राथमिक आरोग्य सेवा आणि वैद्यकीय सुविधा.",
    pdfPath: "/pdf/आयुष्मान भारत योजना.pdf",
  },
  {
    emoji: "📊",
    title: "योजना",
    description: "शासनाच्या विविध योजनांची माहिती.",
    pdfPath: "/pdf/योजना.pdf",
  },
  {
    emoji: "📜",
    title: "सूचना व परिपत्रके",
    description: "महत्वाच्या शासकीय सूचना आणि परिपत्रकांची माहिती पहा.",
    type: "dynamic",
  },
];

const AamchyaSeva = () => {
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [visibleCards, setVisibleCards] = useState([]);
  const [notices, setNotices] = useState([]);
  const [showNoticesModal, setShowNoticesModal] = useState(false);
  const sectionRef = useRef(null);

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Animate cards on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            services.forEach((_, index) => {
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

  // Handle card click
  const handleCardClick = async (service) => {
    if (service.type === "dynamic") {
      try {
        const res = await axioesInstance.get("/notices");
        setNotices(res.data || []);
        setShowNoticesModal(true);
      } catch (err) {
        console.error("Error fetching notices:", err);
        alert("सूचना आणताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
      }
    } else if (service.pdfPath) {
      setSelectedPdf(service);
    }
  };

  const handleDownload = (path, title) => {
    const link = document.createElement("a");
    link.href = path;
    link.download = title + ".pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseModal = () => {
    setSelectedPdf(null);
    setShowNoticesModal(false);
  };

  return (
    <>
      {/* Section Header */}
      <section
        id="services"
        ref={sectionRef}
        className="w-full pt-14  bg-gradient-to-b from-green-50 to-orange-50 overflow-x-hidden"
      >
        <div className="w-full mx-auto max-w-[1200px] px-4 overflow-x-hidden">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl pt-5 font-extrabold text-green-800 relative inline-block">
              आमच्या सेवा
              <span className="block w-24 h-1 bg-orange-500 rounded mx-auto mt-2"></span>
            </h2>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 pb-30 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 overflow-hidden">
            {services.map((service, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(service)}
                className={`relative transform transition-all duration-700 ease-in-out ${
                  visibleCards.includes(index)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                } ${
                  service.pdfPath || service.type === "dynamic"
                    ? "hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                    : "opacity-70 cursor-not-allowed"
                } bg-white border border-green-200 rounded-2xl shadow-md p-6 text-center group break-all whitespace-pre-wrap`}
              >
                <div className="text-5xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                  {service.emoji}
                </div>
                <h4 className="text-xl font-bold text-green-800 mb-2 break-all">
                  {service.title}
                </h4>
                <p className="text-gray-700 text-sm md:text-base mb-3 break-all whitespace-pre-wrap">
                  {service.description}
                </p>
                <div className="w-12 h-1 bg-orange-400 mx-auto rounded-full transition-all duration-300 group-hover:w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm overflow-x-hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fadeIn overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-green-700 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white break-all">
                {selectedPdf.title}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-orange-300 text-3xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Conditional PDF view */}
            <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-4 overflow-hidden">

              {isMobile ? (
                <>
                  <p className="text-gray-700 text-center mb-4">
                    खालील बटणावर क्लिक करून PDF डाउनलोड करा 👇
                  </p>
                  <button
                    onClick={() =>
                      handleDownload(selectedPdf.pdfPath, selectedPdf.title)
                    }
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    ⬇️ डाउनलोड करा
                  </button>
                </>
              ) : (
                <iframe
                  src={`${selectedPdf.pdfPath}#toolbar=1`}
                  width="100%"
                  height="100%"
                  style={{ border: "none", minHeight: "70vh" }}
                  title={selectedPdf.title}
                />
              )}
            </div>

            {/* Footer buttons for desktop */}
            {!isMobile && (
              <div className="flex gap-4 p-6 border-t border-gray-200 bg-gray-100">
                <button
                  onClick={() =>
                    handleDownload(selectedPdf.pdfPath, selectedPdf.title)
                  }
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  ⬇️ डाउनलोड करा
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
                >
                  बंद करा
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notices Modal */}
      {showNoticesModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm overflow-x-hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fadeIn overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-orange-600 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white break-all">
                सूचना व परिपत्रके
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-yellow-300 text-3xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 break-all whitespace-pre-wrap">
              {notices.length === 0 ? (
                <p className="text-center text-gray-600 break-all">
                  कोणतीही सूचना उपलब्ध नाही.
                </p>
              ) : (
                notices.map((notice, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-green-200 rounded-2xl shadow-xs p-6 text-center
"
                  >
                    <div className="flex items-start gap-3 break-all">
                      <BiBookmarkAlt className="text-green-700 text-xl flex-shrink-0 mt-1" />
                      <div className="flex-1 break-all">
                        {notice.createdAt && (
                          <div className="text-xs text-gray-500 mb-1 break-all">
                            {new Date(notice.createdAt).toLocaleString()}
                          </div>
                        )}
                        <p className="text-gray-700 text-sm mb-2 break-all whitespace-pre-wrap">
                          {notice.description || ""}
                        </p>
                        {notice.pdfUrl && (
                          <button
                            onClick={() =>
                              handleDownload(notice.pdfUrl, "सूचना")
                            }
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-700 transition"
                          >
                            ⬇️ डाउनलोड करा
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-100 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-500 transition"
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AamchyaSeva;
