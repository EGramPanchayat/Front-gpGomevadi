import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axioesInstance"; // matching workspace spelling
import { useLanguage } from "../utils/LanguageContext";
import { 
  BiBookOpen, 
  BiTrash, 
  BiCloudUpload, 
  BiSearch, 
  BiArrowBack, 
  BiSolidBook, 
  BiDownload, 
  BiCalendar, 
  BiCategory, 
  BiX 
} from "react-icons/bi";
import { FiPlus, FiTrash2, FiFileText } from "react-icons/fi";
import { useSiteConfig } from "../utils/SiteConfigContext";

const ELibraryAdminDashboard = () => {
  const { lang, setLang } = useLanguage();
  const { config } = useSiteConfig();
  const navigate = useNavigate();

  // Theme state synchronized with AdminDashboard
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  // Sticky mobile header scroll detection
  const [showStickyMobileHeader, setShowStickyMobileHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyMobileHeader(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Form & Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Books and stats states
  const [booksList, setBooksList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [stats, setStats] = useState({ totalBooks: 0, totalDownloads: 0 });

  const categories = [
    "Agriculture",
    "Autobiography",
    "Culinary",
    "History",
    "Music",
    "Mythology",
    "Personal Essays",
    "Physical Education",
    "Short Stories",
    "Travel",
    "Other"
  ];

  // Helper to map DB category to base filter category
  const getCategoryBaseName = (cat) => {
    if (!cat) return "Other";
    if (cat.includes("Agriculture")) return "Agriculture";
    if (cat.includes("Autobiography")) return "Autobiography";
    if (cat.includes("Culinary")) return "Culinary";
    if (cat.includes("History")) return "History";
    if (cat.includes("Music")) return "Music";
    if (cat.includes("Mytholog")) return "Mythology";
    if (cat.includes("Personal Essays") || cat.includes("Self Help")) return "Personal Essays";
    if (cat.includes("Physical Education")) return "Physical Education";
    if (cat.includes("Short Stor") || cat.includes("Short Stories")) return "Short Stories";
    if (cat.includes("Travel")) return "Travel";
    return "Other";
  };

  useEffect(() => {
    fetchBooks();
    fetchStats();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoadingList(true);
      const res = await axiosInstance.get("/books");
      setBooksList(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error(lang === "mr" ? "पुस्तके लोड करण्यात अयशस्वी" : "Failed to fetch books");
    } finally {
      setLoadingList(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get("/books/stats");
      if (res.data) {
        setStats({
          totalBooks: res.data.totalBooks || 0,
          totalDownloads: res.data.totalDownloads || 0
        });
      }
    } catch {
      // fail silently
    }
  };

  // Handle cover selection and set preview URL
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
    } else {
      setCoverImage(null);
      setCoverImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !category || !pdfFile) {
      return toast.error(
        lang === "mr" 
          ? "कृपया आवश्यक माहिती भरा आणि PDF फाईल जोडा" 
          : "Please fill all required fields and upload PDF"
      );
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("author", author.trim());
      fd.append("category", category);
      if (coverImage) fd.append("coverImage", coverImage);
      fd.append("pdfFile", pdfFile);

      await axiosInstance.post("/books", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Clear form
      setTitle("");
      setAuthor("");
      setCategory("");
      setCoverImage(null);
      setCoverImagePreview(null);
      setPdfFile(null);
      
      // Close modal
      setIsUploadModalOpen(false);

      toast.success(lang === "mr" ? "पुस्तक यशस्वीरित्या अपलोड केले!" : "Book uploaded successfully");
      await fetchBooks();
      await fetchStats();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      toast.error(lang === "mr" ? `अपलोड अयशस्वी: ${errorMsg}` : `Upload failed: ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(lang === "mr" ? "तुम्हाला खात्री आहे की हे पुस्तक हटवायचे आहे?" : "Are you sure you want to delete this book?")) return;
    try {
      await axiosInstance.delete(`/books/${id}`);
      toast.success(lang === "mr" ? "पुस्तक हटवले!" : "Book deleted successfully");
      await fetchBooks();
      await fetchStats();
    } catch {
      toast.error(lang === "mr" ? "पुस्तक हटवण्यात अयशस्वी" : "Failed to delete book");
    }
  };

  const handleDownload = async (bookId) => {
    try {
      const response = await axiosInstance.get(`/books/download/${bookId}`);
      if (response.data?.url) {
        window.open(response.data.url, "_blank");
        setBooksList(prev => prev.map(b => b._id === bookId ? { ...b, downloads: response.data.downloads } : b));
        await fetchStats();
      } else {
        toast.error(lang === "mr" ? "पुस्तक डाउनलोड लिंक उपलब्ध नाही" : "Book download link not available");
      }
    } catch {
      toast.error(lang === "mr" ? "डाउनलोड करण्यात अयशस्वी" : "Failed to download book");
    }
  };

  // Filter books list based on search and category filter
  const filteredBooks = (() => {
    const filtered = booksList.filter(book => {
      const matchesSearch = 
        book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (selectedCategoryFilter === "All") return matchesSearch;
      const bookBaseCat = getCategoryBaseName(book.category);
      return matchesSearch && bookBaseCat === selectedCategoryFilter;
    });

    // Books always shown at the top row (in this order)
    const PINNED_TITLES = ["आठवणींचा हिंदोळा", "ययाति", "खिडकी", "अभिव्यक्ती"];

    // Pin featured books to top (in specified order), rest follow
    const pinned = PINNED_TITLES
      .map(t => filtered.find(b => b.title === t))
      .filter(Boolean);
    const rest = filtered.filter(b => !PINNED_TITLES.includes(b.title));
    return [...pinned, ...rest];
  })();

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans antialiased ${
      isDarkMode 
        ? "bg-slate-950 text-white" 
        : "bg-gradient-to-br from-green-50/50 via-white to-orange-50/50 text-slate-800"
    }`}>

      {/* STICKY COMPACT MOBILE HEADER */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 lg:hidden text-white shadow-md transition-all duration-300 transform ${
          isDarkMode ? "bg-slate-900" : "bg-green-900"
        } ${
          showStickyMobileHeader ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="h-20 px-5 flex items-center gap-4">
          {/* Back button */}
          <button
            onClick={() => navigate("/admin")}
            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 active:scale-90 transition cursor-pointer"
          >
            <BiArrowBack className="text-2xl" />
          </button>

          {/* Book Logo */}
          <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
            <BiBookOpen className="text-2xl text-orange-300" />
          </div>

          {/* Title & Subtitle */}
          <div className="min-w-0 flex items-center gap-3">
            {/* Logo in circle (mobile only) */}
            <div className="w-10 h-10 rounded-full border border-white/20 bg-white overflow-hidden shrink-0 lg:hidden">
              <img src="/images/satyamev.jpg" alt="Satyamev Jayate" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm lg:text-[10px] font-bold tracking-wider uppercase opacity-90 truncate leading-tight">
                {config?.gpName || "ग्रामपंचायत गोमेवाडी"}
              </p>
              <h2 className="text-lg lg:text-xs font-black tracking-tight mt-1 leading-tight">
                {lang === "mr" ? "डिजिटल ई-वाचनालय" : "Digital eLibrary"}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* HEADER SECTION */}
      <header className={`relative text-white rounded-b-3xl md:rounded-b-[40px] shadow-lg overflow-hidden ${
          isDarkMode ? "bg-slate-900" : "bg-green-900"
        }`}>

          {/* Decorative Corner Circles */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-orange-500/10 pointer-events-none transform translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-green-500/10 pointer-events-none transform -translate-x-6 translate-y-6" />
          <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-white/5 pointer-events-none transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-4 left-1/4 w-20 h-20 rounded-full bg-orange-500/5 pointer-events-none" />
          <div className="absolute bottom-2 right-1/4 w-28 h-28 rounded-full bg-green-400/15 pointer-events-none" />
          <div className="absolute -top-10 left-10 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

          {/* 1. MOBILE HEADER LAYOUT (lg:hidden) */}
          <div className="lg:hidden p-5 flex flex-col gap-4">
            {/* Top line: Back Arrow */}
            <div className="relative z-10 flex items-center">
              <button
                onClick={() => navigate("/admin")}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-sm"
                title={lang === "mr" ? "अॅडमिन डॅशबोर्डवर जा" : "Back to Admin Dashboard"}
              >
                <BiArrowBack className="text-xl" />
              </button>
            </div>

            {/* Second line: Grampanchayat Name with Satyamev Jayate circle logo (Mobile only) */}
            <div className="relative z-10 flex items-center gap-2.5">
              {/* Logo in circle (mobile only) */}
              <div className="w-9 h-9 rounded-full border border-white/20 bg-white overflow-hidden shrink-0 lg:hidden">
                <img src="/images/satyamev.jpg" alt="Satyamev Jayate" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl lg:text-sm font-bold tracking-wider text-emerald-100 uppercase opacity-95">
                {config?.gpName || "ग्रामपंचायत गोमेवाडी"}
              </h2>
            </div>

            {/* Third line: eLibrary Admin Title */}
            <div className="relative z-10">
              <h1 className="text-2xl font-black text-white tracking-tight leading-none">
                {lang === "mr" ? "डिजिटल ई-वाचनालय" : "eLibrary Admin Console"}
              </h1>
              <p className="text-slate-200 text-xs font-semibold mt-1">
                {lang === "mr" ? "वाचनातून विचार, विचारातून विकास." : "Read to Think, Think to Progress."}
              </p>
            </div>

            {/* Fourth line: Stats + Controls Capsules */}
            <div className="relative z-10 flex items-center gap-3 mt-2 w-full">
              {/* Total Books Capsule */}
              <div className="h-12 px-4 rounded-2xl flex items-center gap-3 bg-emerald-950/40 border border-emerald-800/30 text-white shadow-sm flex-1 min-w-0">
                <div className="p-1.5 bg-green-500/10 rounded-xl text-[#34d399] shrink-0">
                  <BiSolidBook className="text-lg animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 leading-none truncate">{lang === "mr" ? "एकूण पुस्तके" : "Books"}</p>
                  <p className="text-sm font-black text-white mt-0.5 leading-none">{stats.totalBooks}</p>
                </div>
              </div>

              {/* Unified Controls Capsule */}
              <div className="h-12 flex items-center justify-between gap-3 border border-emerald-800/30 rounded-2xl px-4 bg-emerald-950/40 text-white shadow-sm flex-1 min-w-0">
                {/* Language Switcher */}
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => setLang("mr")}
                    className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all duration-200 cursor-pointer ${
                      lang === "mr"
                        ? "bg-green-700 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    मराठी
                  </button>
                  <button
                    onClick={() => setLang("en")}
                    className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all duration-200 cursor-pointer ${
                      lang === "en"
                        ? "bg-green-700 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    En
                  </button>
                </div>

                {/* Divider */}
                <div className="w-px h-4 bg-slate-700/40" />

                {/* Theme Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-1 text-[#f59e0b] hover:text-amber-400 transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                  title={lang === "mr" ? "थीम बदला" : "Toggle Theme"}
                >
                  {isDarkMode ? (
                    <svg className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.46 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#f59e0b] stroke-current fill-none" strokeWidth="2.5" viewBox="0 0 24 24">
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
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <BiBookOpen className="text-3xl" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
                  {config?.gpName 
                    ? (lang === "mr" ? `${config.gpName} डिजिटल ई-वाचनालय` : `${config.gpName} eLibrary Admin Console`)
                    : (lang === "mr" ? "डिजिटल ई-वाचनालय" : "eLibrary Admin Console")}
                </h1>
                <p className="text-slate-200 text-sm font-semibold mt-0.5">
                  {lang === "mr" ? "वाचनातून विचार, विचारातून विकास." : "Read to Think, Think to Progress."}
                </p>
              </div>
            </div>

            {/* HEADER CONTROLS */}
            <div className="flex flex-row items-center gap-4 relative z-10 shrink-0">
              {/* STATS CAPSULE */}
              <div className="h-14 px-4 rounded-2xl flex items-center gap-3 bg-emerald-950/40 border border-emerald-800/30 text-white shadow-inner">
                <div className="p-2 bg-green-500/10 rounded-xl text-[#34d399]">
                  <BiSolidBook className="text-xl animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 leading-none">{lang === "mr" ? "एकूण पुस्तके" : "Books"}</p>
                  <p className="text-base font-black text-white mt-1 leading-none">{stats.totalBooks}</p>
                </div>
              </div>

              {/* UNIFIED CONTROLS CAPSULE */}
              <div className="h-14 flex items-center gap-3 border rounded-2xl px-4 bg-emerald-950/40 border-emerald-800/30">
                {/* Language Switcher */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLang("mr")}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all duration-200 cursor-pointer ${
                      lang === "mr"
                        ? "bg-green-700 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    मराठी
                  </button>
                  <button
                    onClick={() => setLang("en")}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all duration-200 cursor-pointer ${
                      lang === "en"
                        ? "bg-green-700 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    En
                  </button>
                </div>

                {/* Divider */}
                <div className="w-px h-4 bg-slate-700/40" />

                {/* Theme Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-1 text-[#f59e0b] hover:text-amber-400 transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                  title={lang === "mr" ? "थीम बदला" : "Toggle Theme"}
                >
                  {isDarkMode ? (
                    <svg className="w-4 h-4 fill-amber-455 text-amber-450" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.46 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#f59e0b] stroke-current fill-none" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* BACK TO ADMIN DASHBOARD */}
              <button
                onClick={() => navigate("/admin")}
                className="h-14 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-455 hover:to-amber-550 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
              >
                <BiArrowBack className="text-base" />
                <span>{lang === "mr" ? "परत जा" : "Back to Admin"}</span>
              </button>
            </div>
          </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-8 md:px-8">

        {/* SEARCH, FILTER, AND UPLOAD BAR (FULL WIDTH AT TOP) */}
        <div className={`rounded-3xl p-6 border transition-all duration-300 ${
          isDarkMode 
            ? "bg-emerald-950/20 border-emerald-800/30 shadow-[0_8px_30px_rgb(0,0,0,0.3)]" 
            : "bg-white border-emerald-800/20 shadow-[0_8px_30px_rgb(2,44,34,0.04)]"
        } space-y-5`}>
          
          {/* Top Row: Search Input (Left) + Upload Button (Right) */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
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
                    ? "bg-emerald-955 bg-[#01221a] border-emerald-800/30 text-slate-200 focus:border-orange-500 focus:bg-emerald-950/80" 
                    : "bg-emerald-50/30 border-emerald-100 text-slate-800 focus:bg-white focus:border-orange-500"
                }`}
              />
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-450 hover:to-amber-550 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-orange-555/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider shrink-0"
            >
              <FiPlus className="text-base stroke-[3]" />
              <span>{lang === "mr" ? "नवीन पुस्तक जोडा" : "Upload New Book"}</span>
            </button>
          </div>

          {/* Bottom Row: Category Separation Tab Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1.5">
            <p className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              <BiCategory className="text-sm" />
              <span>{lang === "mr" ? "श्रेणीनुसार वर्गीकरण" : "Category Wise Separation"}</span>
            </p>
            
            {/* Unified Tabs Pill Container */}
            <div className={`flex flex-wrap items-center gap-1 p-1 rounded-2xl border w-full flex-1 ${
              isDarkMode 
                ? "bg-emerald-950/40 border-emerald-800/20" 
                : "bg-slate-100/80 border-slate-200/50"
            }`}>
              {["All", "Agriculture", "Autobiography", "Culinary", "History", "Music", "Mythology", "Personal Essays", "Physical Education", "Short Stories", "Travel", "Other"].map((cat) => {
                const isSelected = selectedCategoryFilter === cat;
                const label = lang === "mr" ? (
                  cat === "All" ? "सर्व पुस्तके" :
                  cat === "Agriculture" ? "शेती" :
                  cat === "Autobiography" ? "आत्मचरित्र" :
                  cat === "Culinary" ? "पाककला" :
                  cat === "History" ? "इतिहास" :
                  cat === "Music" ? "संगीत" :
                  cat === "Mythology" ? "पुराणकथा" :
                  cat === "Personal Essays" ? "वैयक्तिक लेख" :
                  cat === "Physical Education" ? "शारीरिक शिक्षण" :
                  cat === "Short Stories" ? "लघुकथा" :
                  cat === "Travel" ? "प्रवास" : "इतर"
                ) : cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                        : isDarkMode
                          ? "text-slate-400 hover:text-white hover:bg-emerald-800/20"
                          : "text-slate-655 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* BOOKS GRID DIRECTORY (FULL WIDTH, 4 COLUMNS) */}
        <div className={`rounded-3xl border p-6 shadow-2xl transition-colors min-h-[500px] flex flex-col ${
          isDarkMode 
            ? "bg-slate-900/40 border-slate-800" 
            : "bg-white border-emerald-800/40 shadow-md"
        }`}>
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <BiBookOpen className="text-lg" />
              </div>
              <h3 className={`text-base font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                {lang === "mr" ? "सर्व पुस्तके" : "Shared Books Directory"}
              </h3>
            </div>
            <div className={`text-[10px] font-bold ${isDarkMode ? "text-slate-450" : "text-slate-500"}`}>
              {lang === "mr" ? `${filteredBooks.length} आढळले` : `${filteredBooks.length} Books Found`}
            </div>
          </div>

          {/* GRID RENDER */}
          {loadingList ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className={`text-xs font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{lang === "mr" ? "पुस्तक सूची लोड होत आहे..." : "Loading books directory..."}</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
              <BiBookOpen className="text-6xl opacity-40 text-orange-500" />
              <div className="text-center">
                <p className="text-xs font-bold text-slate-450">{lang === "mr" ? "लायब्ररीमध्ये कोणतीही पुस्तके आढळली नाहीत" : "No uploaded books found"}</p>
                <p className={`text-[10px] mt-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{lang === "mr" ? "नवीन पुस्तक जोडण्यासाठी वरील बटणावर क्लिक करा." : "Click the button above to upload a new book."}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <div 
                  key={book._id} 
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col h-full hover:scale-[1.01] ${
                    isDarkMode 
                      ? "bg-slate-900/90 border-slate-800 hover:border-emerald-500/40 hover:shadow-2xl shadow-emerald-950/50" 
                      : "bg-white border-emerald-800/20 hover:border-emerald-800/35 shadow-md hover:shadow-xl"
                  }`}
                >
                  {/* COVER FRAME */}
                  <div className="relative aspect-[3/4] w-full bg-slate-100 dark:bg-[#01221a]/50 overflow-hidden flex items-center justify-center border-b border-slate-800/10 dark:border-emerald-800/20">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-fill"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500 p-4">
                        <FiFileText className="text-3xl stroke-[1.5]" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-2">No Cover</span>
                      </div>
                    )}
                  </div>

                  {/* DETAILS (BELOW COVER) */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className={`font-extrabold text-sm line-clamp-1 leading-snug tracking-tight ${isDarkMode ? "text-white" : "text-slate-800"}`} title={book.title}>
                        {book.title}
                      </h4>
                      <div className="mt-1.5 space-y-1.5">
                        <p className={`text-xs font-semibold truncate ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {lang === "mr" ? "लेखक: " : "Author: "}{book.author}
                        </p>
                        <div>
                          <span className="text-[8px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25 inline-block">
                            {getCategoryBaseName(book.category)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold">
                        <BiDownload />
                        <span>{book.downloads || 0} {lang === "mr" ? "डाउनलोड" : "downloads"}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <BiCalendar />
                        <span>{new Date(book.createdAt).toLocaleDateString(lang === "mr" ? "mr-IN" : "en-IN")}</span>
                      </span>
                    </div>

                    {/* CARD FOOTER WITH EXPLICIT CTA ACTIONS */}
                    <div className={`pt-3 border-t flex items-center justify-between gap-2 ${isDarkMode ? "border-slate-800/80" : "border-slate-100"}`}>
                      <button
                        onClick={() => handleDownload(book._id)}
                        className="flex-1 py-2 rounded-xl text-center text-[10px] font-bold bg-orange-600/10 hover:bg-orange-600/20 text-orange-600 dark:text-orange-400 transition-colors border border-orange-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <BiDownload className="text-sm" />
                        <span>{lang === "mr" ? "डाउनलोड" : "Download"}</span>
                      </button>
                      {book.isProtected ? (
                        <div
                          className="p-2 text-slate-400 rounded-xl shrink-0 cursor-not-allowed"
                          title={lang === "mr" ? "हे पुस्तक संरक्षित आहे" : "Protected — cannot delete"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDelete(book._id)}
                          className="p-2 hover:bg-rose-500/15 text-rose-500 hover:text-rose-400 rounded-xl transition cursor-pointer border border-transparent hover:border-red-500/10 active:scale-95 shrink-0"
                          title={lang === "mr" ? "पुस्तक हटवा" : "Delete Book"}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* UPLOAD MODAL POP-UP */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className={`relative w-full max-w-lg rounded-3xl p-5 md:p-6 shadow-2xl border transition-all ${
            isDarkMode 
              ? "bg-[#01221a] border-emerald-800/40 text-white shadow-emerald-950/40" 
              : "bg-white border-slate-100 text-slate-800"
          }`}>
            {/* CLOSE BUTTON */}
            <button
              onClick={() => {
                setIsUploadModalOpen(false);
                setCoverImage(null);
                setCoverImagePreview(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full transition-all duration-250 cursor-pointer hover:scale-105 active:scale-95 bg-emerald-900/10 hover:bg-emerald-900/20 border border-emerald-900/10 text-emerald-900 dark:text-emerald-400"
              title={lang === "mr" ? "बंद करा" : "Close"}
            >
              <BiX className="text-base font-black" />
            </button>

            {/* MODAL HEADER */}
            <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${isDarkMode ? "border-emerald-800/20" : "border-slate-100"}`}>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
                <BiCloudUpload className="text-2xl" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">
                  {lang === "mr" ? "नवीन सामायिक पुस्तक जोडा" : "Add Shared Book"}
                </h2>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${isDarkMode ? "text-slate-450" : "text-slate-500"}`}>
                  {lang === "mr" ? "पुस्तकाचे नाव *" : "Book Title *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "mr" ? "उदा. श्यामची आई" : "e.g. Shyamchi Aai"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full rounded-2xl p-3.5 text-xs font-bold outline-none transition-all border shadow-inner ${
                    isDarkMode 
                      ? "bg-[#01221a]/60 border-emerald-800/20 text-slate-200 focus:border-orange-500 focus:bg-[#01221a]" 
                      : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-orange-500"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${isDarkMode ? "text-slate-450" : "text-slate-500"}`}>
                  {lang === "mr" ? "लेखक *" : "Author *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "mr" ? "उदा. साने गुरुजी" : "e.g. Sane Guruji"}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className={`w-full rounded-2xl p-3.5 text-xs font-bold outline-none transition-all border shadow-inner ${
                    isDarkMode 
                      ? "bg-[#01221a]/60 border-emerald-800/20 text-slate-200 focus:border-orange-500 focus:bg-[#01221a]" 
                      : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-orange-500"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${isDarkMode ? "text-slate-455 text-slate-400" : "text-slate-500"}`}>
                  {lang === "mr" ? "श्रेणी निवडा *" : "Select Category *"}
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full rounded-2xl p-3.5 text-xs font-bold outline-none cursor-pointer transition-all border ${
                    isDarkMode 
                      ? "bg-[#01221a]/60 border-emerald-800/20 text-slate-300 focus:border-orange-500 focus:bg-[#01221a]" 
                      : "bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:border-orange-500"
                  }`}
                >
                  <option value="">{lang === "mr" ? "-- श्रेणी निवडा --" : "-- Select Category --"}</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat} className={isDarkMode ? "bg-[#01221a] text-white" : "bg-white text-slate-800"}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* COVER SELECTION WITH IMAGE PREVIEW */}
              <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
                isDarkMode ? "bg-[#01221a]/40 border-emerald-800/20" : "bg-slate-50 border-slate-200"
              }`}>
                {/* PREVIEW CONTAINER */}
                <div className={`w-20 h-24 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border ${
                  isDarkMode ? "bg-[#01221a] border-emerald-800/20" : "bg-white border-slate-200"
                }`}>
                  {coverImagePreview ? (
                    <img src={coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-2 text-center text-[8px] font-bold">
                      <FiFileText className="text-xl mb-1 text-orange-500" />
                      <span>{lang === "mr" ? "कव्हर" : "No Cover"}</span>
                    </div>
                  )}
                </div>

                {/* FILE INPUT */}
                <div className="flex-1 min-w-0">
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-2 ${isDarkMode ? "text-slate-450" : "text-slate-500"}`}>
                    {lang === "mr" ? "कव्हर प्रतिमा" : "Cover Image"}
                  </label>
                  <input
                    type="file"
                    id="coverInput"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className={`w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-orange-500/10 file:text-orange-500 hover:file:bg-orange-500/20 transition cursor-pointer ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                  />
                </div>
              </div>

              {/* PDF SELECTION CONTAINER */}
              <div className={`p-4 rounded-2xl border ${
                isDarkMode ? "bg-[#01221a]/40 border-emerald-800/20" : "bg-slate-50 border-slate-200"
              }`}>
                <label className={`block text-[10px] font-black uppercase tracking-wider mb-2 ${isDarkMode ? "text-slate-450" : "text-slate-500"}`}>
                  {lang === "mr" ? "PDF फाईल *" : "PDF File *"}
                </label>
                <input
                  type="file"
                  id="pdfInput"
                  accept="application/pdf"
                  required
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  className={`w-full text-xs file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-orange-500/10 file:text-orange-500 hover:file:bg-orange-500/20 transition cursor-pointer ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-4 mt-6 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-450 hover:to-amber-550 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-orange-555/20 transition hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{lang === "mr" ? "क्लाउडवर अपलोड होत आहे..." : "Uploading to Cloud..."}</span>
                  </>
                ) : (
                  <>
                    <BiCloudUpload className="text-base" />
                    <span>{lang === "mr" ? "सामायिक वाचनालयात अपलोड करा" : "Upload to Shared Library"}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ELibraryAdminDashboard;
