import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Library } from "lucide-react";
import Navbar from "../Components/Navbar";
import FooterSection from "../Components/FooterSection";
import axioesInstance from "../utils/axioesInstance";
import { useLanguage } from "../utils/LanguageContext";
import { toast } from "react-hot-toast";

// Configure PDFJS worker from cdnjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function ReadBookPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const res = await axioesInstance.get(`/books/${id}`);
      setBook(res.data);
    } catch {
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
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || prev));
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Site Navbar */}
      <Navbar activeSection="" mobileNavOpen={false} setMobileNavOpen={() => {}} />

      {/* Main Reader Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col">
        {/* Header toolbar styled in green and orange */}
        <div className="bg-green-800 border-b border-green-950 rounded-t-3xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-white shadow-md">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/elibrary")}
              className="p-2 hover:bg-green-700/50 rounded-xl text-green-200 hover:text-white transition"
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
            <div className="flex items-center gap-4">
              {/* Zoom */}
              <div className="flex items-center bg-green-900/60 border border-green-900 rounded-xl p-0.5">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-green-800 rounded-lg text-green-200 hover:text-white transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono font-bold w-12 text-center text-green-100">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-green-800 rounded-lg text-green-200 hover:text-white transition"
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
                <span className="text-[10px] font-bold text-green-100 px-1 font-mono">
                  {pageNumber} / {numPages || "..."}
                </span>
                <button
                  disabled={pageNumber >= (numPages || 1)}
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
        <div className="flex-1 bg-slate-800 border-x border-b border-slate-200/20 rounded-b-3xl min-h-[60vh] flex items-center justify-center p-6 shadow-md overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center space-y-2 text-white">
              <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
              <span className="text-xs font-bold text-slate-300">
                {lang === "mr" ? "पुस्तक फाईल लोड होत आहे..." : "Loading book file..."}
              </span>
            </div>
          ) : !book || !book.pdfFile ? (
            <div className="text-center py-10 bg-slate-900 text-slate-400 p-8 rounded-2xl max-w-sm">
              <p className="text-xs font-bold">{lang === "mr" ? "पुस्तक फाईल आढळली नाही." : "PDF file not found."}</p>
            </div>
          ) : (
            <div className="shadow-2xl border border-slate-700 bg-white rounded-lg overflow-hidden transition-all duration-200">
              <Document
                file={book.pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="w-64 h-80 flex flex-col items-center justify-center bg-slate-900 text-slate-400 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                    <span className="text-[10px] font-bold">Rendering PDF Page...</span>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
              </Document>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
