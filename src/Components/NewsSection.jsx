import React, { useEffect, useState, useRef } from "react";
import axioesInstance from "../utils/axioesInstance";
import { BiNews, BiCalendar, BiChevronLeft, BiChevronRight } from "react-icons/bi";

const NewsSection = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [visibleItems, setVisibleItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axioesInstance.get("/news"); // GET /news
        // Sort latest first
        const sorted = (res.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNewsItems(sorted);
      } catch (err) {
        console.error("Error fetching news:", err);
      }
    };
    fetchNews();
  }, []);

  // Limit home grid view to latest 2 news items
  const latestNews = newsItems.slice(0, 2);

  useEffect(() => {
    if (!latestNews.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            latestNews.forEach((_, index) => {
              setTimeout(() => {
                setVisibleItems((prev) => [...new Set([...prev, index])]);
              }, index * 120); // Staggered delays
            });
          } else {
            setVisibleItems([]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const sectionEl = sectionRef.current;
    if (sectionEl) observer.observe(sectionEl);
    return () => sectionEl && observer.unobserve(sectionEl);
  }, [newsItems]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("mr-IN", options);
  };

  const handleNext = () => {
    if (modalIndex < newsItems.length - 1) {
      setModalIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (modalIndex > 0) {
      setModalIndex((prev) => prev - 1);
    }
  };

  return (
    <section
      id="news-section"
      ref={sectionRef}
      className="w-full bg-gradient-to-b from-orange-50/20 to-white pt-16 border-[3px] border-green-900 border-b-0 rounded-t-[36px] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center px-4 md:px-20 mb-12">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-green-800 relative inline-block">
            बातम्या आणि घडामोडी
            <span className="block w-24 h-1 bg-orange-500 rounded mx-auto mt-2.5"></span>
          </h2>
        </div>

        {/* 2-column Grid for Latest 2 News */}
        {latestNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {latestNews.map((item, idx) => (
              <div
                key={item._id || idx}
                className={`flex gap-4 p-5 bg-white border border-green-100 hover:border-green-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-700 ease-out transform ${
                  visibleItems.includes(idx)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-10"
                }`}
              >
                {/* News Icon/Badge */}
                <div className="h-12 w-12 bg-green-50 text-green-700 flex items-center justify-center rounded-xl shrink-0">
                  <BiNews className="text-2xl" />
                </div>

                {/* News Content */}
                <div className="flex flex-col justify-between flex-grow min-w-0">
                  <p className="text-gray-800 text-base font-semibold leading-relaxed mb-3 break-words whitespace-pre-line">
                    {item.text}
                  </p>

                  {item.createdAt && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-auto">
                      <BiCalendar className="text-sm text-orange-500" />
                      {formatDate(item.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 font-medium text-lg w-full">
            कोणतीही बातमी उपलब्ध नाही.
          </div>
        )}
      </div>

      {/* Bottom Ribbon Bar - 100% Width */}
      {newsItems.length > 0 && (
        <div className="w-full bg-green-905 bg-green-900 text-white py-4 px-6 md:px-20 flex items-center shadow-lg relative overflow-hidden gap-4 min-h-[68px]">
          {/* Ribbon Label Badge */}
          <div className="bg-orange-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shrink-0 uppercase tracking-wider select-none animate-pulse">
            महत्वाचे
          </div>

          {/* Moving News Marquee */}
          <marquee className="flex-grow text-white font-bold text-base" scrollamount="4">
            {newsItems.map((item, idx) => (
              <span key={item._id || idx} className="mx-6">
                • {item.text}
              </span>
            ))}
          </marquee>

          {/* View All Button at the end of the ribbon */}
          {newsItems.length > 2 && (
            <button
              onClick={() => {
                setModalIndex(0);
                setShowModal(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shrink-0 whitespace-nowrap transition duration-300 transform hover:scale-105"
            >
              सर्व बातम्या पहा
            </button>
          )}
        </div>
      )}

      {/* One-by-one News Modal */}
      {showModal && newsItems.length > 0 && (
        <div className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 flex flex-col items-center relative border border-green-150 animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition"
            >
              ×
            </button>

            {/* Modal Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-14 w-14 bg-green-50 text-green-700 flex items-center justify-center rounded-2xl mb-3">
                <BiNews className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-green-800">
                ग्रामपंचायत बातम्या
              </h3>
              <span className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">
                बातमी {modalIndex + 1} / {newsItems.length}
              </span>
            </div>

            {/* News Body Card */}
            <div className="w-full bg-gray-50/70 border border-green-100/50 rounded-2xl p-5 md:p-6 mb-6 flex flex-col justify-between min-h-[160px]">
              <p className="text-gray-800 text-base md:text-lg font-semibold leading-relaxed break-words whitespace-pre-line text-center flex-grow flex items-center justify-center">
                {newsItems[modalIndex].text}
              </p>

              {newsItems[modalIndex].createdAt && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-bold mt-4 pt-3 border-t border-dashed border-gray-200">
                  <BiCalendar className="text-sm text-orange-500" />
                  {formatDate(newsItems[modalIndex].createdAt)}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between w-full gap-4 mt-auto">
              <button
                onClick={handlePrev}
                disabled={modalIndex === 0}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-4 rounded-xl font-bold border transition ${
                  modalIndex === 0
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-green-700 border-green-600 hover:bg-green-50"
                }`}
              >
                <BiChevronLeft className="text-xl" />
                मागे
              </button>

              <button
                onClick={handleNext}
                disabled={modalIndex === newsItems.length - 1}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-4 rounded-xl font-bold transition ${
                  modalIndex === newsItems.length - 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800 text-white shadow-sm"
                }`}
              >
                पुढे
                <BiChevronRight className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default NewsSection;
