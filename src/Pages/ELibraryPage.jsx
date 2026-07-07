import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axioesInstance from "../utils/axioesInstance";
import { useLanguage } from "../utils/LanguageContext";
import { useSiteConfig } from "../utils/SiteConfigContext";
import { toast } from "react-hot-toast";

// Icon imports to match ELibraryAdminDashboard
import { 
  BiBookOpen, 
  BiSearch, 
  BiCategory, 
  BiCalendar, 
  BiDownload, 
  BiSolidBook, 
  BiArrowBack 
} from "react-icons/bi";
import { FiFileText } from "react-icons/fi";

export default function ELibraryPage() {
  const { lang, setLang } = useLanguage();
  const { config } = useSiteConfig();
  const navigate = useNavigate();

  // Search & Filter states
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBookDetail, setSelectedBookDetail] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Dark/Light theme state (synced with localStorage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("elibraryTheme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("elibraryTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

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

  const getCategoryBaseName = (cat) => {
    if (!cat) return lang === "mr" ? "इतर" : "Other";
    const mapping = {
      "Educational": lang === "mr" ? "शिक्षण" : "Educational",
      "Historical": lang === "mr" ? "इतिहास" : "Historical",
      "Literature": lang === "mr" ? "साहित्य" : "Literature",
      "Science": lang === "mr" ? "विज्ञान" : "Science",
      "Other": lang === "mr" ? "इतर" : "Other"
    };
    return mapping[cat] || cat;
  };

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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-emerald-950/90 text-slate-100" : "bg-slate-50 text-slate-800"} font-sans flex flex-col`}>
      {/* HEADER SECTION */}
      <header className="relative bg-green-700 text-white rounded-b-3xl md:rounded-b-[40px] shadow-lg overflow-hidden">
        
        {/* Subtle Decorative Solid Color Corner Circles (10% opacity, no blur) */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-green-500/10 pointer-events-none transform translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-orange-500/10 pointer-events-none transform -translate-x-6 translate-y-6" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-white/5 pointer-events-none transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-4 left-1/4 w-20 h-20 rounded-full bg-orange-500/5 pointer-events-none" />
        <div className="absolute bottom-2 right-1/4 w-28 h-28 rounded-full bg-green-400/15 pointer-events-none" />
        <div className="absolute -top-10 left-10 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

        {/* 1. MOBILE HEADER LAYOUT (lg:hidden) */}
        <div className="lg:hidden p-5 flex flex-col gap-4">
          {/* Top line: Back Arrow */}
          <div className="relative z-10 flex items-center">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-sm"
              title={lang === "mr" ? "मुख्यपृष्ठावर जा" : "Back to Home"}
            >
              <BiArrowBack className="text-xl" />
            </button>
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
              {lang === "mr" ? "डिजिटल ई-वाचनालय" : "Digital eLibrary"}
            </h1>
            <p className="text-slate-200 text-xs md:text-sm font-semibold mt-1">
              {lang === "mr" ? "वाचनातून विचार, विचारातून विकास." : "Read to Think, Think to Progress."}
            </p>
          </div>

          {/* Fourth line: Total Books and Settings Capsule with WHITE background */}
          <div className="relative z-10 flex items-center gap-3 mt-2 w-full">
            {/* Total Books Capsule (White Background) */}
            <div className="h-12 px-4 rounded-2xl flex items-center gap-3 bg-white text-slate-800 border border-gray-100 shadow-sm flex-1 min-w-0">
              <div className="p-1.5 bg-emerald-50 rounded-xl text-emerald-700 shrink-0">
                <BiSolidBook className="text-lg" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider font-extrabold text-gray-400 leading-none truncate">{lang === "mr" ? "एकूण पुस्तके" : "Books"}</p>
                <p className="text-sm font-black text-slate-800 mt-0.5 leading-none">{books.length}</p>
              </div>
            </div>

            {/* Unified Controls Capsule (White Background) */}
            <div className="h-12 flex items-center justify-between gap-3 border border-gray-100 rounded-2xl px-4 bg-white text-slate-800 shadow-sm flex-1 min-w-0">
              {/* Language Switcher */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setLang("mr")}
                  className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all duration-200 cursor-pointer ${
                    lang === "mr"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-gray-550 hover:text-gray-900"
                  }`}
                >
                  मराठी
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all duration-200 cursor-pointer ${
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
          </div>
        </div>

        {/* 2. DESKTOP HEADER LAYOUT (hidden lg:flex) */}
        <div className="hidden lg:flex p-8 flex-row items-center justify-between gap-6 w-full">
          {/* TITLE AND LOGO */}
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner shrink-0">
              <BiBookOpen className="text-3xl text-orange-355" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
                {config?.gpName 
                  ? (lang === "mr" ? `${config.gpName} डिजिटल ई-वाचनालय` : `${config.gpName} Digital eLibrary`)
                  : (lang === "mr" ? "डिजिटल ई-वाचनालय" : "Digital eLibrary")}
              </h1>
              <p className="text-slate-200 text-sm font-semibold mt-0.5">
                {lang === "mr" ? "वाचनातून विचार, विचारातून विकास." : "Read to Think, Think to Progress."}
              </p>
            </div>
          </div>

          {/* HEADER CONTROLS AND ACTION BUTTON */}
          <div className="flex flex-row items-center gap-4 relative z-10 shrink-0">
            {/* STATS CAPSULES */}
            <div className="h-14 px-4 rounded-2xl flex items-center gap-3 bg-white text-slate-800 border border-gray-100 shadow-sm">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                <BiSolidBook className="text-xl" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 leading-none">{lang === "mr" ? "एकूण पुस्तके" : "Books"}</p>
                <p className="text-base font-black text-slate-800 mt-1 leading-none">{books.length}</p>
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
                      : "text-gray-550 hover:text-gray-900"
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

            {/* BACK TO WEBSITE HOME */}
            <button
              onClick={() => navigate("/")}
              className="h-14 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-455 hover:to-amber-550 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-orange-555/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
            >
              <BiArrowBack className="text-base" />
              <span>{lang === "mr" ? "मुख्यपृष्ठावर जा" : "Back to Home"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* SEARCH & FILTER BAR */}
        <div className={`rounded-3xl p-6 border transition-all duration-300 ${
          isDarkMode 
            ? "bg-emerald-900/10 border-emerald-700/20 shadow-[0_8px_30px_rgb(0,0,0,0.3)]" 
            : "bg-white border-emerald-800/20 shadow-[0_8px_30px_rgb(2,44,34,0.04)]"
        } space-y-5`}>
          
          {/* Top Row: Search Input */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <span className={`absolute inset-y-0 left-4 flex items-center pointer-events-none ${isDarkMode ? "text-emerald-500/80" : "text-emerald-700/60"}`}>
                <BiSearch className="text-xl" />
              </span>
              <input
                type="text"
                placeholder={lang === "mr" ? "पुस्तकाचे नाव, लेखक किंवा प्रकार शोधा..." : "Search title, author or genre..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold outline-none transition-all shadow-inner border ${
                  isDarkMode 
                    ? "bg-[#01221a] border-emerald-800/30 text-slate-200 focus:border-orange-500 focus:bg-[#01221a]/80" 
                    : "bg-emerald-50/30 border-emerald-100 text-slate-800 focus:bg-white focus:border-orange-500"
                }`}
              />
            </div>
          </div>

          {/* Bottom Row: Category Separation Tab Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1.5 border-t border-slate-700/10 dark:border-emerald-800/20">
            <p className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              <BiCategory className="text-sm" />
              <span>{lang === "mr" ? "श्रेणीनुसार वर्गीकरण" : "Category Wise Separation"}</span>
            </p>
            
            {/* Unified Tabs Pill Container */}
            <div className={`flex flex-wrap items-center gap-1 p-1 rounded-2xl border ${
              isDarkMode 
                ? "bg-[#01221a]/40 border-emerald-800/20" 
                : "bg-slate-100/80 border-slate-200/50"
            }`}>
              {["All", "Educational", "Historical", "Literature", "Science", "Other"].map((cat) => {
                const isSelected = selectedCategory === (cat === "All" ? "" : cat);
                const label = lang === "mr" ? (
                  cat === "All" ? "सर्व पुस्तके" :
                  cat === "Educational" ? "शिक्षण" :
                  cat === "Historical" ? "इतिहास" :
                  cat === "Literature" ? "साहित्य" :
                  cat === "Science" ? "विज्ञान" : "इतर"
                ) : cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === "All" ? "" : cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                        : isDarkMode
                          ? "text-slate-400 hover:text-white hover:bg-emerald-800/20"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOOKS GRID DIRECTORY */}
        <div className="transition-colors min-h-[500px] flex flex-col bg-transparent">
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-850/20 border-emerald-800/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <BiBookOpen className="text-lg" />
              </div>
              <h3 className={`text-base font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                {lang === "mr" ? "एकत्रित पुस्तक सूची" : "Shared Books Directory"}
              </h3>
            </div>
            <div className={`text-[10px] font-bold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              {lang === "mr" ? `${filteredBooks.length} आढळले` : `${filteredBooks.length} Books Found`}
            </div>
          </div>

          {/* GRID RENDER */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className={`text-xs font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{lang === "mr" ? "पुस्तक सूची लोड होत आहे..." : "Loading books directory..."}</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
              <BiBookOpen className="text-6xl opacity-40 text-orange-500" />
              <div className="text-center">
                <p className="text-xs font-bold text-slate-450">{lang === "mr" ? "लायब्ररीमध्ये कोणतीही पुस्तके आढळली नाहीत" : "No uploaded books found"}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {paginatedBooks.map((book) => (
                <div 
                  key={book._id} 
                  onClick={() => setSelectedBookDetail(book)}
                  className="transition-all duration-300 flex flex-col h-full hover:scale-[1.02] active:scale-[0.98] cursor-pointer bg-transparent"
                >
                  {/* COVER FRAME (WITH SOFT ROUNDED SHADOW AND BORDER) */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-[#01221a]/50 shadow-md hover:shadow-lg border border-slate-150/40 dark:border-emerald-800/10">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-fill"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500 p-4">
                        <FiFileText className="text-3xl stroke-[1.5]" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-2">{lang === "mr" ? "कव्हर नाही" : "No Cover"}</span>
                      </div>
                    )}
                  </div>

                  {/* DETAILS (BELOW COVER) - ONLY NAME & AUTHOR */}
                  <div className="pt-3 pb-1 text-center flex-1 flex flex-col justify-start bg-transparent">
                    <h4 className={`font-black text-xs sm:text-sm line-clamp-1 leading-snug tracking-tight ${isDarkMode ? "text-white" : "text-slate-800"}`} title={book.title}>
                      {book.title}
                    </h4>
                    <p className={`text-[10px] sm:text-xs font-semibold truncate mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {lang === "mr" ? "Author : " : "Author : "}{book.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-700/20">
              <p className="text-xs text-slate-400 font-bold">
                {lang === "mr"
                  ? `एकूण ${filteredBooks.length} पैकी ${startIndex + 1} ते ${Math.min(startIndex + itemsPerPage, filteredBooks.length)} पुस्तके`
                  : `Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredBooks.length)} of ${filteredBooks.length}`}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3.5 py-2 rounded-xl text-xs font-black border border-slate-700/20 hover:bg-white dark:hover:bg-[#01221a] disabled:opacity-50 disabled:cursor-not-allowed transition bg-transparent text-slate-400"
                >
                  {lang === "mr" ? "← मागील" : "← Previous"}
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-3.5 py-2 rounded-xl text-xs font-black border border-slate-700/20 hover:bg-white dark:hover:bg-[#01221a] disabled:opacity-50 disabled:cursor-not-allowed transition bg-transparent text-slate-400"
                >
                  {lang === "mr" ? "पुढील →" : "Next →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* BOOK DETAIL MODAL */}
      {selectedBookDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white text-slate-800 rounded-3xl overflow-hidden shadow-2xl relative p-6 space-y-5 border border-gray-150">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedBookDetail(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer z-10"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Split Content: Left Cover, Right Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
              {/* Left Column: Cover Image */}
              <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center border border-gray-100 shadow-sm">
                {selectedBookDetail.coverImage ? (
                  <img 
                    src={selectedBookDetail.coverImage} 
                    alt={selectedBookDetail.title} 
                    className="w-full h-full object-fill"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-4">
                    <FiFileText className="text-4xl stroke-[1.5]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-2">No Cover</span>
                  </div>
                )}
              </div>

              {/* Right Column: Title, Author, Genre Info */}
              <div className="flex flex-col justify-center space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800 leading-snug tracking-tight">
                    {selectedBookDetail.title}
                  </h3>
                </div>

                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 leading-none">
                    {lang === "mr" ? "लेखक" : "Author"}
                  </p>
                  <p className="text-sm font-extrabold text-slate-700 mt-1.5">
                    {selectedBookDetail.author}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 leading-none mb-1.5">
                    {lang === "mr" ? "प्रकार" : "Genre"}
                  </p>
                  <span className="text-[9px] font-black px-2.5 py-1 rounded-md border uppercase tracking-wider bg-orange-500/10 text-orange-600 border-orange-500/20 inline-block">
                    {getCategoryBaseName(selectedBookDetail.category)}
                  </span>
                </div>

                {/* Additional Quick Stats */}
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5">
                    <BiDownload className="text-xs text-orange-500" />
                    <span>{selectedBookDetail.downloads || 0} {lang === "mr" ? "डाउनलोड" : "downloads"}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BiCalendar className="text-xs text-emerald-600" />
                    <span>{new Date(selectedBookDetail.createdAt).toLocaleDateString(lang === "mr" ? "mr-IN" : "en-IN")}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Section: Read and Download Side by Side (Both Orange Buttons) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedBookDetail(null);
                  navigate(`/elibrary/read/${selectedBookDetail._id}`);
                }}
                className="py-3.5 rounded-2xl text-center text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all shadow-md shadow-orange-500/15 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BiBookOpen className="text-base" />
                <span>{lang === "mr" ? "वाचन सुरू करा" : "Start Reading"}</span>
              </button>
              <button
                onClick={() => {
                  handleDownloadBook(selectedBookDetail._id, selectedBookDetail.title);
                }}
                className="py-3.5 rounded-2xl text-center text-xs font-black bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white transition-all shadow-md shadow-orange-600/15 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BiDownload className="text-base" />
                <span>{lang === "mr" ? "डाउनलोड" : "Download"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
