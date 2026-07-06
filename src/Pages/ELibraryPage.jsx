import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axioesInstance from "../utils/axioesInstance";
import { useLanguage } from "../utils/LanguageContext";
import { useSiteConfig } from "../utils/SiteConfigContext";
import { toast } from "react-hot-toast";
import { BookOpen, Search, Download, Calendar, Filter, Library, ArrowLeft } from "lucide-react";

export default function ELibraryPage() {
  const { lang } = useLanguage();
  const { config } = useSiteConfig();
  const navigate = useNavigate();

  // Search & Filter states
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset pagination on filter change
  }, [searchTerm, selectedCategory]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await axioesInstance.get("/books");
      setBooks(res.data || []);
    } catch {
      toast.error(lang === "mr" ? "पुस्तके लोड करण्यात अयशस्वी" : "Failed to load books collection");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBook = async (bookId, title) => {
    try {
      const res = await axioesInstance.get(`/books/download/${bookId}`);
      if (res.data?.url) {
        const link = document.createElement("a");
        link.href = res.data.url;
        link.setAttribute("download", `${title}.pdf`);
        link.setAttribute("target", "_blank");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(lang === "mr" ? "डाउनलोड सुरू झाले!" : "Download started!");
        // Increment locally
        setBooks(prev => prev.map(b => b._id === bookId ? { ...b, downloads: (b.downloads || 0) + 1 } : b));
      }
    } catch {
      toast.error(lang === "mr" ? "डाउनलोड करण्यात अयशस्वी" : "Failed to download book");
    }
  };

  // Get unique categories for dropdown filter
  const categories = [...new Set(books.map(b => b.category))];

  // Filtering books
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? book.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage);

  const getCategoryBadgeColor = (cat) => {
    const term = cat.toLowerCase();
    if (term.includes("educat") || term.includes("शिक्षण")) return "bg-green-50 text-green-700 border-green-200";
    if (term.includes("hist") || term.includes("इतिहास")) return "bg-orange-50 text-orange-700 border-orange-200";
    if (term.includes("sci") || term.includes("विज्ञान")) return "bg-teal-50 text-teal-700 border-teal-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Main content wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:py-12">
        {/* Page Identity Header */}
        <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden mb-8">
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Library className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  {lang === "mr" ? "ग्रामपंचायत ई-वाचनालय" : "Gram Panchayat eLibrary"}
                </h1>
                <p className="text-green-150 text-xs md:text-sm font-semibold mt-1">
                  {lang === "mr"
                    ? `${config?.gpName || "गोमेवाडी"} गावाची डिजिटल लायब्ररी - ज्ञान सर्वांसाठी मोफत`
                    : `Digital library collection of ${config?.gpName || "Gomevadi"} - Free knowledge for everyone`}
                </p>
              </div>
            </div>

            {/* Back to Website Button */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-5 py-2.5 rounded-2xl shadow-lg border border-orange-400/20 text-xs transition cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
              <span>{lang === "mr" ? "मुख्यपृष्ठावर जा" : "Back to Home"}</span>
            </button>
          </div>
        </div>

        {/* Search, Filter controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder={lang === "mr" ? "पुस्तके किंवा लेखक शोधा..." : "Search books or authors..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-green-700 focus:ring-1 focus:ring-green-700 transition"
            />
          </div>

          <div className="relative w-full md:w-56">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
              <Filter className="w-4 h-4" />
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 pl-9 pr-6 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:bg-white focus:border-green-700 transition"
            >
              <option value="">{lang === "mr" ? "सर्व श्रेणी" : "All Categories"}</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Books Listing Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-sm animate-pulse">
                <div className="aspect-[3/4] bg-slate-100 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-5/6" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl space-y-3">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto stroke-[1.5]" />
            <h3 className="font-extrabold text-slate-700 text-sm">
              {lang === "mr" ? "कोणतीही पुस्तके आढळली नाहीत" : "No books found"}
            </h3>
            <p className="text-xs text-slate-450 font-semibold max-w-xs mx-auto">
              {lang === "mr"
                ? "शोध शब्द किंवा श्रेणी बदलून पुन्हा प्रयत्न करा."
                : "Please try adjusting your search terms or filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedBooks.map((book) => (
              <div
                key={book._id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                {/* Cover Frame */}
                <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden border-b border-slate-100 flex items-center justify-center">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-350 p-4">
                      <BookOpen className="w-10 h-10 stroke-[1.5] mb-1.5" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">No Image</span>
                    </div>
                  )}

                  <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[9px] font-black border uppercase tracking-wider shadow-sm bg-white/95 ${getCategoryBadgeColor(book.category)}`}>
                    {book.category}
                  </span>
                </div>

                {/* Metadata content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-xs line-clamp-2 leading-snug" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-1" title={book.author}>
                      {lang === "mr" ? "द्वारा:" : "By:"} {book.author}
                    </p>
                  </div>

                  {/* Actions row */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(book.createdAt).toLocaleDateString(lang === "mr" ? "mr-IN" : "en-IN")}
                      </span>
                      <span>
                        {book.downloads || 0} {lang === "mr" ? "डाउनलोड" : "downloads"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate(`/elibrary/read/${book._id}`)}
                        className="flex items-center justify-center gap-1 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl text-[11px] transition shadow-md shadow-orange-500/10 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{lang === "mr" ? "वाचा" : "Read"}</span>
                      </button>
                      <button
                        onClick={() => handleDownloadBook(book._id, book.title)}
                        className="flex items-center justify-center gap-1 py-2 bg-green-700 hover:bg-green-800 text-white font-extrabold rounded-xl text-[11px] transition shadow-md shadow-green-700/10 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{lang === "mr" ? "डाउनलोड" : "Download"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-450 font-bold">
              {lang === "mr"
                ? `एकूण ${filteredBooks.length} पैकी ${startIndex + 1} ते ${Math.min(startIndex + itemsPerPage, filteredBooks.length)} पुस्तके`
                : `Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredBooks.length)} of ${filteredBooks.length}`}
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3.5 py-2 rounded-xl text-xs font-black border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition bg-white text-slate-650"
              >
                {lang === "mr" ? "← मागील" : "← Previous"}
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3.5 py-2 rounded-xl text-xs font-black border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition bg-white text-slate-650"
              >
                {lang === "mr" ? "पुढील →" : "Next →"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
