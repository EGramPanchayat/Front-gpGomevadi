import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import axioesInstance from "../../utils/axioesInstance";
import { useLanguage } from "../../utils/LanguageContext";
import { toast } from "react-hot-toast";

// Configure PDFJS worker from cdnjs for easy bundle-free execution in Vite
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function ReadBook() {
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
      navigate("/elibrary/books");
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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-bold text-slate-500">
          {lang === "mr" ? "पुस्तक लोड होत आहे..." : "Loading book file..."}
        </p>
      </div>
    );
  }

  if (!book || !book.pdfFile) {
    return (
      <div className="text-center py-20 bg-white border border-slate-150 rounded-3xl max-w-lg mx-auto space-y-4">
        <p className="text-slate-500 font-bold text-sm">
          {lang === "mr" ? "या पुस्तकाची फाईल उपलब्ध नाही." : "PDF file for this book is not available."}
        </p>
        <button
          onClick={() => navigate("/elibrary/books")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md text-xs transition"
        >
          {lang === "mr" ? "लायब्ररीमध्ये परत जा" : "Go Back to Library"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">
      {/* Header controls bar */}
      <div className="bg-slate-950 border-b border-slate-850 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
            title={lang === "mr" ? "परत जा" : "Go Back"}
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div className="truncate">
            <h3 className="font-extrabold text-xs truncate max-w-[200px]" title={book.title}>
              {book.title}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold leading-none mt-0.5">
              {lang === "mr" ? "द्वारे:" : "By:"} {book.author}
            </p>
          </div>
        </div>

        {/* Page navigator & zoom controls */}
        <div className="flex items-center gap-4">
          {/* Zoom */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-455 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-bold w-12 text-center text-slate-300">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-455 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              disabled={pageNumber <= 1}
              onClick={handlePrevPage}
              className="p-1.5 hover:bg-slate-850 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-455 hover:text-white transition cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <span className="text-[10px] font-bold text-slate-300 px-1 font-mono">
              {pageNumber} / {numPages || "..."}
            </span>
            <button
              disabled={pageNumber >= (numPages || 1)}
              onClick={handleNextPage}
              className="p-1.5 hover:bg-slate-850 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-455 hover:text-white transition cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main PDF View Area */}
      <div className="flex-1 overflow-auto flex justify-center items-start p-6 bg-slate-950 custom-sass-scrollbar">
        <div className="shadow-2xl border border-slate-800 bg-white rounded-lg overflow-hidden transition-all duration-200">
          <Document
            file={book.pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="w-80 h-96 flex items-center justify-center bg-slate-900 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-slate-450 mr-2" />
                <span className="text-[11px] font-bold">Rendering Document...</span>
              </div>
            }
            error={
              <div className="p-8 text-center bg-rose-950 border border-rose-900 text-rose-300 rounded-xl max-w-sm">
                <p className="text-xs font-bold">Failed to render PDF page. Browser might block this file request.</p>
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
      </div>
    </div>
  );
}
