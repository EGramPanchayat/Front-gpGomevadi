import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookMarked, Download, PlusCircle, BookOpen, ArrowRight } from "lucide-react";
import StatsCard from "../components/StatsCard";
import BookCard from "../components/BookCard";
import axioesInstance from "../../utils/axioesInstance";
import { useLanguage } from "../../utils/LanguageContext";
import { toast } from "react-hot-toast";

export default function Dashboard() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalBooks: 0, totalDownloads: 0 });
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, booksRes] = await Promise.all([
        axioesInstance.get("/books/stats"),
        axioesInstance.get("/books")
      ]);
      setStats(statsRes.data || { totalBooks: 0, totalDownloads: 0 });
      setRecentBooks((booksRes.data || []).slice(0, 6)); // Top 6 books
    } catch {
      toast.error(lang === "mr" ? "माहिती लोड करण्यात अयशस्वी" : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBook = async (bookId, title) => {
    try {
      const res = await axioesInstance.get(`/books/download/${bookId}`);
      if (res.data?.url) {
        // Trigger file download
        const link = document.createElement("a");
        link.href = res.data.url;
        link.setAttribute("download", `${title}.pdf`);
        link.setAttribute("target", "_blank");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(lang === "mr" ? "डाउनलोड सुरू झाले!" : "Download started!");
        // Refresh stats
        setStats(prev => ({ ...prev, totalDownloads: prev.totalDownloads + 1 }));
      }
    } catch {
      toast.error(lang === "mr" ? "डाउनलोड करण्यात अयशस्वी" : "Failed to download book");
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-xl">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            {lang === "mr" ? "डिजिटल ई-वाचनालयात आपले स्वागत आहे!" : "Welcome to the Digital eLibrary!"}
          </h2>
          <p className="text-xs md:text-sm font-semibold text-white/80 leading-relaxed">
            {lang === "mr"
              ? "ग्रामपंचायतीच्या डिजिटल लायब्ररीमध्ये विविध शैक्षणिक, ऐतिहासिक आणि उपयुक्त पुस्तके मोफत वाचा आणि डाउनलोड करा."
              : "Read and download various educational, historical, and informative books for free in our digital portal."}
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatsCard
          title={lang === "mr" ? "एकूण पुस्तके" : "Total Books"}
          value={loading ? "..." : stats.totalBooks}
          icon={BookMarked}
          gradientClass="from-indigo-600 to-blue-500 shadow-indigo-600/10"
        />
        <StatsCard
          title={lang === "mr" ? "एकूण डाउनलोड" : "Total Downloads"}
          value={loading ? "..." : stats.totalDownloads}
          icon={Download}
          gradientClass="from-purple-600 to-indigo-500 shadow-purple-600/10"
        />
      </div>

      {/* Dashboard sections (Split grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Uploaded Books (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
              {lang === "mr" ? "नुकतीच जोडलेली पुस्तके" : "Recently Added Books"}
            </h3>
            <Link to="/elibrary/books" className="text-xs font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              {lang === "mr" ? "सर्व पहा" : "See All"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-slate-150 rounded-2xl p-4 space-y-4 shadow-sm animate-pulse">
                  <div className="aspect-[3/4] bg-slate-100 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-5/6" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentBooks.length === 0 ? (
            <div className="text-center p-12 bg-white border border-slate-150 rounded-3xl space-y-3">
              <BookOpen className="w-12 h-12 text-slate-350 mx-auto" />
              <p className="text-slate-500 font-bold text-sm">
                {lang === "mr" ? "कोणतीही पुस्तके आढळली नाहीत." : "No books available yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recentBooks.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  onDownload={handleDownloadBook}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions (1/3 width) */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
            {lang === "mr" ? "त्वरित कृती" : "Quick Actions"}
          </h3>
          
          <div className="bg-white border border-slate-150 rounded-3xl p-5 space-y-3 shadow-sm">
            <button
              onClick={() => navigate("/elibrary/upload")}
              className="w-full flex items-center justify-between p-4 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100/50 rounded-2xl text-left transition group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/10">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs">
                    {lang === "mr" ? "नवीन पुस्तक अपलोड करा" : "Upload New Book"}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {lang === "mr" ? "PDF आणि कव्हर जोडण्यासाठी" : "Add Cover and PDF file"}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => navigate("/elibrary/books")}
              className="w-full flex items-center justify-between p-4 bg-purple-50/60 hover:bg-purple-50 border border-purple-100/50 rounded-2xl text-left transition group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/10">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs">
                    {lang === "mr" ? "पुस्तके लायब्ररी शोधा" : "Browse eLibrary"}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {lang === "mr" ? "सर्व पुस्तकांची यादी आणि शोध" : "Search and read digital collection"}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
