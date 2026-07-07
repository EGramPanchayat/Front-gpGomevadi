import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { BiBookOpen, BiArrowBack, BiSolidBook } from "react-icons/bi";
import axioesInstance from "../utils/axioesInstance";
import { useLanguage } from "../utils/LanguageContext";
import { useSiteConfig } from "../utils/SiteConfigContext";
import { toast } from "react-hot-toast";

// Configure PDFJS worker from cdnjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export default function ReadBookPage() {
  const { id } = useParams();
  const { lang, setLang } = useLanguage();
  const { config } = useSiteConfig();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [pdfFileUrl, setPdfFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("elibraryTheme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("elibraryTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const activeUrlRef = useRef(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(null);
  const [containerHeight, setContainerHeight] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
        setContainerHeight(rect.height);
      }
    };
    
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    const timer = setTimeout(updateDimensions, 150);
    
    return () => {
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(timer);
    };
  }, [pdfFileUrl, loading]);

  const getPageWidth = () => {
    if (!containerWidth || !containerHeight) return undefined;
    
    // Vertical constraint calculation (A4 page aspect ratio height:width is ~1.414)
    const availableHeight = containerHeight - 48; // inner padding + margin borders
    const heightBasedWidth = availableHeight / 1.414;
    
    // Horizontal constraint calculation
    const padding = isMobile ? 48 : 80;
    const columns = isMobile ? 1 : 2;
    const gap = isMobile ? 0 : 24;
    const widthBasedWidth = (containerWidth - padding - gap) / columns;
    
    // Return the minimum to fit both dimensions completely on screen
    return Math.min(heightBasedWidth, widthBasedWidth);
  };

  useEffect(() => {
    fetchBookDetails();
    return () => {
      // Clear blob URL from browser RAM when user leaves or closes the reader
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
        activeUrlRef.current = null;
      }
      setPdfFileUrl(null);
      setBook(null);
    };
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const res = await axioesInstance.get(`/books/${id}`);
      setBook(res.data);

      const streamUrl = `${axioesInstance.defaults.baseURL || "/api"}/books/stream/${id}`;

      // Open persistent Cache Storage inside user browser space (disk storage)
      const cache = await caches.open("elibrary-books-cache");
      let cachedResponse = await cache.match(streamUrl);

      let blobData;
      if (cachedResponse) {
        console.log("Loading book from browser persistent disk cache...");
        blobData = await cachedResponse.blob();
      } else {
        console.log("Downloading book to browser disk cache space...");
        const response = await fetch(streamUrl, {
          headers: {
            "gp-name": import.meta.env.VITE_GP_NAME || "gpGomevadi",
          },
        });

        if (!response.ok) throw new Error("Failed to download book PDF");

        // Clone and put response in browser disk Cache Storage
        await cache.put(streamUrl, response.clone());
        blobData = await response.blob();
      }

      // Convert downloaded blob into local Object URL for streaming view
      const localUrl = URL.createObjectURL(blobData);
      activeUrlRef.current = localUrl;
      setPdfFileUrl(localUrl);
    } catch (err) {
      console.error("Failed to load PDF in user space", err);
      toast.error(lang === "mr" ? "पुस्तक लोड करण्यास अक्षम" : "Unable to load book file");
      navigate("/elibrary");
    } finally {
      setLoading(false);
    }
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(prev - (isMobile ? 1 : 2), 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + (isMobile ? 1 : 2), numPages || prev));
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const getPageRangeLabel = () => {
    if (isMobile || !numPages) return `${pageNumber} / ${numPages || "..."}`;
    if (pageNumber + 1 > numPages) return `${pageNumber} / ${numPages}`;
    return `${pageNumber}-${pageNumber + 1} / ${numPages}`;
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-800 flex flex-col font-sans overflow-hidden">
      {/* HEADER SECTION (EXACT MATCH OF ELIBRARY PAGE NAV) */}
      <header className="relative bg-green-700 text-white rounded-b-3xl md:rounded-b-[40px] shadow-lg overflow-hidden shrink-0 z-20">
        
        {/* Subtle Decorative Solid Color Corner Circles (brownish-orangeish theme) */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#78350f]/15 pointer-events-none transform translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-orange-500/10 pointer-events-none transform -translate-x-6 translate-y-6" />
        <div className="absolute top-1/3 left-1/4 w-28 h-28 rounded-full bg-[#451a03]/10 pointer-events-none" />
        <div className="absolute -top-10 left-10 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

        {/* 1. MOBILE HEADER LAYOUT (lg:hidden) */}
        <div className="lg:hidden p-5 flex flex-col gap-4">
          {/* Top line: Back Arrow and Compact Settings Capsule */}
          <div className="relative z-10 flex items-center justify-between gap-3 w-full">
            <button
              onClick={() => navigate("/elibrary")}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-sm shrink-0"
              title={lang === "mr" ? "ई-ग्रंथालय" : "eLibrary"}
            >
              <BiArrowBack className="text-lg" />
            </button>

            {/* Compact Settings Capsule (En/Mr + Theme) */}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full p-0.5 shrink-0">
              <div className="flex items-center">
                <button
                  onClick={() => setLang("mr")}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black transition-all cursor-pointer ${
                    lang === "mr"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  मराठी
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black transition-all cursor-pointer ${
                    lang === "en"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  En
                </button>
              </div>
              <div className="w-px h-3 bg-white/20" />
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1 text-amber-300 hover:text-amber-400 transition-transform active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                title={lang === "mr" ? "थीम बदला" : "Toggle Theme"}
              >
                {isDarkMode ? (
                  <svg className="w-3 h-3 fill-amber-300 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.46 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-amber-300 stroke-current fill-none" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Second line: Grampanchayat Name */}
          <div className="relative z-10">
            <h2 className="text-sm font-bold tracking-wider text-emerald-100 uppercase opacity-95">
              {config?.gpName || "ग्रामपंचायत गोमेवाडी"}
            </h2>
          </div>

          {/* Third line: eLibrary Title */}
          <div className="relative z-10">
            <h1 className="text-2xl font-black text-white tracking-tight leading-none">
              eLibrary
            </h1>
            <p className="text-slate-200 text-xs md:text-sm font-semibold mt-1">
              {lang === "mr" ? "वाचनातून विचार, विचारातून विकास." : "Read to Think, Think to Progress."}
            </p>
          </div>

          {/* Third line: Current Book Capsule (Full-width now) */}
          <div className="relative z-10 flex items-center mt-1 w-full">
            <div className="h-12 px-4 rounded-2xl flex items-center gap-3 bg-white text-slate-800 border border-gray-100 shadow-sm w-full">
              <div className="p-1.5 bg-emerald-50 rounded-xl text-emerald-700 shrink-0">
                <BiSolidBook className="text-lg" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider font-extrabold text-gray-400 leading-none truncate">{lang === "mr" ? "वाचन सुरू" : "Reading"}</p>
                <p className="text-xs font-black text-slate-800 mt-1 leading-none truncate" title={book?.title}>{loading ? "..." : book?.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. DESKTOP HEADER LAYOUT (hidden lg:flex) */}
        <div className="hidden lg:flex p-8 flex-row items-center justify-between gap-6 w-full">
          {/* TITLE AND LOGO */}
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner shrink-0">
              <BiBookOpen className="text-3xl text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
                {config?.gpName 
                  ? `${config.gpName} eLibrary`
                  : "eLibrary"}
              </h1>
              <p className="text-slate-200 text-sm font-semibold mt-0.5">
                {lang === "mr" ? "वाचनातून विचार, विचारातून विकास." : "Read to Think, Think to Progress."}
              </p>
            </div>
          </div>

          {/* HEADER CONTROLS AND ACTION BUTTON */}
          <div className="flex flex-row items-center gap-4 relative z-10 shrink-0">
            {/* BOOK DETAILS CAPSULE */}
            <div className="h-14 px-4 rounded-2xl flex items-center gap-3 bg-white text-slate-800 border border-gray-100 shadow-sm max-w-[280px]">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700 shrink-0">
                <BiSolidBook className="text-xl" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 leading-none truncate">{lang === "mr" ? "वाचन सुरू" : "Reading"}</p>
                <p className="text-sm font-black text-slate-800 mt-1 leading-none truncate" title={book?.title}>{loading ? "..." : book?.title}</p>
              </div>
            </div>

            {/* UNIFIED CONTROLS CAPSULE */}
            <div className="h-14 flex items-center gap-3 border rounded-2xl px-4 bg-white border-gray-100 text-slate-800 shadow-sm">
              {/* Language Switcher */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLang("mr")}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all duration-200 cursor-pointer ${
                    lang === "mr"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-gray-550 hover:text-gray-900"
                  }`}
                >
                  मराठी
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all duration-200 cursor-pointer ${
                    lang === "en"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-gray-555 hover:text-gray-900"
                  }`}
                >
                  En
                </button>
              </div>

              {/* Divider */}
              <div className="w-px h-4 bg-gray-200" />

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1 text-amber-500 hover:text-amber-600 transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                title={lang === "mr" ? "थीम बदला" : "Toggle Theme"}
              >
                {isDarkMode ? (
                  <svg className="w-4 h-4 fill-amber-500 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.46 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-amber-500 stroke-current fill-none" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* EXIT READER / BACK TO eLIBRARY */}
            <button
              onClick={() => navigate("/elibrary")}
              className="h-14 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
            >
              <BiArrowBack className="text-base" />
              <span>{lang === "mr" ? "ई-ग्रंथालय" : "eLibrary"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Reader Wrapper */}
      <main className="flex-1 w-full mx-auto flex flex-col h-full overflow-hidden relative">
        {/* View container */}
        <div 
          ref={containerRef}
          className="flex-1 bg-slate-100/50 flex items-center justify-center p-2 sm:p-6 overflow-hidden"
        >
          {loading || !pdfFileUrl ? (
            <div className="flex flex-col items-center space-y-2 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="text-xs font-bold">
                {lang === "mr" ? "पुस्तक फाईल लोड होत आहे..." : "Loading book file..."}
              </span>
            </div>
          ) : (
            <div className="overflow-hidden transition-all duration-200 bg-transparent">
              <Document
                file={pdfFileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="w-64 h-80 flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-3 rounded-xl">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    <span className="text-[10px] font-bold">Rendering PDF Page...</span>
                  </div>
                }
              >
                <div className="flex flex-col md:flex-row items-stretch justify-center gap-6">
                  {/* Left Page */}
                  <div className="shadow-md bg-white border border-slate-150 rounded-lg overflow-hidden shrink-0">
                    <Page
                      pageNumber={pageNumber}
                      width={getPageWidth()}
                      scale={scale}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                    />
                  </div>
                  {/* Right Page */}
                  {!isMobile && pageNumber + 1 <= numPages && (
                    <div className="shadow-md bg-white border border-slate-150 rounded-lg overflow-hidden shrink-0">
                      <Page
                        pageNumber={pageNumber + 1}
                        width={getPageWidth()}
                        scale={scale}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                      />
                    </div>
                  )}
                </div>
              </Document>
            </div>
          )}
        </div>

        {/* 2. BOTTOM CONTROLS BAR (ZOOM & PAGE NAVIGATOR - GREEN bg with WHITE capsules) */}
        {!loading && book && (
          <div className="relative bg-green-700 text-white rounded-t-2xl md:rounded-t-3xl shadow-inner shrink-0 z-10 overflow-hidden">
            {/* Subtle Decorative Solid Color Circles */}
            <div className="absolute top-0 left-1/4 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-20 h-20 rounded-full bg-orange-500/5 pointer-events-none" />

            <div className="px-4 py-3 flex items-center justify-between gap-4 relative z-10">
              {/* Zoom Controls (White Capsule) */}
              <div className="flex items-center bg-white rounded-xl p-0.5 border border-gray-100 shadow-sm text-slate-800">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-855 transition active:scale-95 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono font-black w-12 text-center text-orange-550">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-855 transition active:scale-95 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Page Navigator (White Capsule) */}
              <div className="flex items-center gap-2 bg-white rounded-xl p-0.5 border border-gray-100 shadow-sm text-slate-800">
                <button
                  disabled={pageNumber <= 1}
                  onClick={handlePrevPage}
                  className="p-1.5 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-500 hover:text-slate-855 transition active:scale-90 cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-black text-orange-550 px-1 font-mono">
                  {getPageRangeLabel()}
                </span>
                <button
                  disabled={isMobile ? pageNumber >= (numPages || 1) : pageNumber + 1 >= (numPages || 1)}
                  onClick={handleNextPage}
                  className="p-1.5 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-500 hover:text-slate-855 transition active:scale-90 cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
