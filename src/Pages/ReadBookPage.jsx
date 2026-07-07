import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { BiBookOpen } from "react-icons/bi";
import axioesInstance from "../utils/axioesInstance";
import { useLanguage } from "../utils/LanguageContext";
import { useSiteConfig } from "../utils/SiteConfigContext";
import { toast } from "react-hot-toast";

// Configure PDFJS worker from cdnjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export default function ReadBookPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const { config } = useSiteConfig();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [pdfFileUrl, setPdfFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
      {/* 1. TOP COMPACT NAVBAR */}
      <div className="h-14 px-4 bg-white border-b border-gray-150 flex items-center justify-between shadow-sm relative z-10 shrink-0">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => navigate("/elibrary")}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 transition active:scale-90 cursor-pointer"
            title={lang === "mr" ? "परत जा" : "Go Back"}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Book Stack Logo */}
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
            <BiBookOpen className="text-base text-orange-500" />
          </div>

          {/* Title & Subtitle */}
          <div className="min-w-0">
            <p className="text-[9px] font-bold tracking-wider uppercase text-slate-400 leading-none">
              {config?.gpName || "ग्रामपंचायत गोमेवाडी"}
            </p>
            <h2 className="text-xs font-black tracking-tight text-slate-800 mt-0.5 leading-none">
              {lang === "mr" ? "डिजिटल ई-वाचनालय" : "Digital eLibrary"}
            </h2>
          </div>
        </div>

        {/* Book Title */}
        <div className="text-right min-w-0 max-w-[250px] sm:max-w-[400px]">
          <p className="text-xs font-black text-slate-800 truncate leading-none" title={book?.title}>
            {loading ? "..." : book?.title}
          </p>
          <p className="text-[9px] font-bold text-slate-400 leading-none mt-1">
            {lang === "mr" ? "लेखक:" : "Author:"} {loading ? "..." : book?.author}
          </p>
        </div>
      </div>

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
            <div className="shadow-lg border border-gray-150 bg-white p-3 rounded-2xl overflow-hidden transition-all duration-200">
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

        {/* 2. BOTTOM CONTROLS BAR (ZOOM & PAGE NAVIGATOR) */}
        {!loading && book && (
          <div className="bg-white border-t border-gray-150 px-4 py-3 flex items-center justify-between gap-4 shadow-inner shrink-0 relative z-10">
            {/* Zoom Controls */}
            <div className="flex items-center bg-green-50/30 rounded-xl p-0.5 border border-green-200/55">
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-white rounded-lg text-green-700 hover:text-green-950 transition active:scale-95 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono font-black w-12 text-center text-orange-500">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-white rounded-lg text-green-700 hover:text-green-950 transition active:scale-95 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Page Navigator */}
            <div className="flex items-center gap-2 bg-green-50/30 rounded-xl p-0.5 border border-green-200/55">
              <button
                disabled={pageNumber <= 1}
                onClick={handlePrevPage}
                className="p-1.5 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-green-700 hover:text-green-950 transition active:scale-90 cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-black text-orange-500 px-1 font-mono">
                {getPageRangeLabel()}
              </span>
              <button
                disabled={isMobile ? pageNumber >= (numPages || 1) : pageNumber + 1 >= (numPages || 1)}
                onClick={handleNextPage}
                className="p-1.5 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-green-700 hover:text-green-950 transition active:scale-90 cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
