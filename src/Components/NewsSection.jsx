import React, { useEffect, useState, useRef } from "react";
import axioesInstance from "../utils/axioesInstance";
import { BiNews, BiCalendar } from "react-icons/bi";

const NewsSection = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [visibleItems, setVisibleItems] = useState([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axioesInstance.get("/news"); // GET /news
        setNewsItems(res.data || []); // array of news objects
      } catch (err) {
        console.error("Error fetching news:", err);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    if (!newsItems.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            newsItems.forEach((_, index) => {
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

  return (
    <section
      id="news-section"
      ref={sectionRef}
      className="w-full bg-gradient-to-b from-orange-50/20 to-white py-16 px-4 md:px-20 border-t border-gray-100 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-green-800 relative inline-block">
            बातम्या आणि घडामोडी
            <span className="block w-24 h-1 bg-orange-500 rounded mx-auto mt-2.5"></span>
          </h2>
        </div>

        {/* 2-column Grid */}
        {newsItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {newsItems.map((item, idx) => (
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
          <div className="text-center py-8 text-gray-500 font-medium text-lg">
            कोणतीही बातमी उपलब्ध नाही.
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
