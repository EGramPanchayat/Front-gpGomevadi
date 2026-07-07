import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import axioesInstance from "../utils/axioesInstance";
import { useLanguage } from "../utils/LanguageContext";
import { toast } from "react-hot-toast";

// Configure PDFJS worker from cdnjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export default function ReadBookPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
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
    <div className="h-screen bg-[#022c22] flex flex-col font-sans overflow-hidden">
      {/* Main Reader Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-4 pb-4 flex flex-col h-full overflow-hidden">
        {/* Header toolbar styled in green and orange */}
        <div className="bg-green-800 border-b border-green-955 rounded-t-3xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-white shadow-md relative overflow-hidden">
          {/* Geometric corner circles without blur but low opacity */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-600/25 rounded-full pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-orange-700/20 rounded-full pointer-events-none" />

          <div className="flex items-center gap-3 w-full sm:w-auto relative z-10">
            <button
              onClick={() => navigate("/elibrary")}
              className="p-2 hover:bg-green-700/50 rounded-xl text-green-200 hover:text-white transition cursor-pointer"
              title={lang === "mr" ? "परत जा" : "Go Back"}
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>
            <div className="truncate">
              <h3 className="font-extrabold text-xs truncate max-w-[250px]" title={book?.title}>
                {loading ? "..." : book?.title}
              </h3>
              <p className="text-[10px] text-green-200 font-bold leading-none mt-0.5">
                {lang === "mr" ? "लेखक:" : "Author:"} {loading ? "..." : book?.author}
              </p>
            </div>
          </div>

          {/* Page navigator & zoom controls */}
          {!loading && book && (
            <div className="flex items-center gap-4 relative z-10">
              {/* Zoom */}
              <div className="flex items-center bg-green-900/60 border border-green-900 rounded-xl p-0.5">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-green-800 rounded-lg text-green-200 hover:text-white transition cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono font-bold w-12 text-center text-orange-400">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-green-800 rounded-lg text-green-200 hover:text-white transition cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Page controls */}
              <div className="flex items-center gap-2 bg-green-900/60 border border-green-900 rounded-xl p-0.5">
                <button
                  disabled={pageNumber <= 1}
                  onClick={handlePrevPage}
                  className="p-1.5 hover:bg-green-850 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-green-200 hover:text-white transition cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                <span className="text-[10px] font-bold text-orange-400 px-1 font-mono">
                  {getPageRangeLabel()}
                </span>
                <button
                  disabled={isMobile ? pageNumber >= (numPages || 1) : pageNumber + 1 >= (numPages || 1)}
                  onClick={handleNextPage}
                  className="p-1.5 hover:bg-green-850 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-green-200 hover:text-white transition cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View container */}
        <div 
          ref={containerRef}
          className="flex-1 bg-[#03362a] border-x border-b border-emerald-900/40 rounded-b-3xl flex items-center justify-center p-2 sm:p-6 shadow-md overflow-hidden"
        >
          {loading || !pdfFileUrl ? (
            <div className="flex flex-col items-center space-y-2 text-white">
              <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
              <span className="text-xs font-bold text-emerald-250">
                {lang === "mr" ? "पुस्तक फाईल लोड होत आहे..." : "Loading book file..."}
              </span>
            </div>
          ) : (
            <div className="shadow-2xl border border-emerald-600/40 bg-[#022c22] p-4 rounded-2xl overflow-hidden transition-all duration-200">
              <Document
                file={pdfFileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="w-64 h-80 flex flex-col items-center justify-center bg-slate-900 text-slate-400 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                    <span className="text-[10px] font-bold">Rendering PDF Page...</span>
                  </div>
                }
              >
                <div className="flex flex-col md:flex-row items-stretch justify-center gap-6">
                  {/* Left Page */}
                  <div className="shadow-xl bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0">
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
                    <div className="shadow-xl bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0">
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
      </main>
    </div>
  );
}
