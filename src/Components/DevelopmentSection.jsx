import React, { useEffect, useState } from "react";
import axioesInstance from "../utils/axioesInstance";

function useDevelopmentWorks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    axioesInstance
      .get("/devworks")
      .then((res) => {
        setLoading(false);
        return res.data;
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
  return { items, loading, error };
}

function DevelopmentSlideshow() {
  const { items: developmentItems, loading, error } = useDevelopmentWorks();
  const [current, setCurrent] = useState(0);

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    if (!loading && developmentItems.length > 0) {
      const timer = setTimeout(() => {
        setCurrent((prev) => (prev + 1) % developmentItems.length);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [current, loading, developmentItems.length]);

  const goPrev = () =>
    setCurrent((prev) => (prev - 1 + developmentItems.length) % developmentItems.length);
  const goNext = () =>
    setCurrent((prev) => (prev + 1) % developmentItems.length);

  // Touch Swipe handlers
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      goNext();
    } else if (isRightSwipe) {
      goPrev();
    }
  };

  if (loading) return <div className="w-full text-center py-10">विकास कामे लोड होत आहेत...</div>;
  if (error) return <div className="w-full text-center py-10 ">विकास कामे उपलब्ध नाहीत.</div>;
  if (!developmentItems.length) return <div className="w-full text-center py-10">विकास कामे उपलब्ध नाहीत.</div>;

  const item = developmentItems[current];

  return (
    <div className="flex justify-center items-center w-full flex-grow">
      <div className="w-full mx-auto max-w-[1200px] rounded-3xl overflow-hidden bg-white shadow-lg p-6 md:p-10" style={{ borderRadius: '24px' }}>
        {/* Image Section with swipe and click listeners */}
        <div 
          className="relative h-[280px] sm:h-[340px] w-full flex justify-center items-center overflow-hidden bg-gray-100 rounded-2xl select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img
            src={item.image?.url || item.image}
            alt={item.title}
            className="h-full w-full object-cover pointer-events-none"
          />
          {/* Invisible click guides on desktop */}
          <div 
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="hidden md:block absolute top-0 left-0 h-full w-1/2 cursor-w-resize z-10"
            title="Previous (मागे)"
          />
          <div 
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="hidden md:block absolute top-0 right-0 h-full w-1/2 cursor-e-resize z-10"
            title="Next (पुढे)"
          />
        </div>
        {/* Info Section */}
        <div className="w-full flex flex-col justify-between items-center bg-white px-3 py-3 h-[170px] sm:h-[180px]">
          <div className="flex flex-col items-center text-center w-full px-2">
            <h5 className="text-base sm:text-lg font-bold mb-1 mt-1 break-words line-clamp-2">
              {item.title}
            </h5>
            <p className="text-xs sm:text-sm text-gray-700 break-words line-clamp-3">
              {item.description}
            </p>
          </div>
          {/* Dots */}
          <div className="flex gap-2 mt-2">
            {developmentItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  idx === current ? "bg-green-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DevelopmentSlideshow;
