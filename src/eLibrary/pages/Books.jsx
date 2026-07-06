import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { BookOpen, Search, Trash2, Filter } from "lucide-react";
import BookCard from "../components/BookCard";
import axioesInstance from "../../utils/axioesInstance";
import { useLanguage } from "../../utils/LanguageContext";
import { toast } from "react-hot-toast";

export default function Books() {
  const { lang } = useLanguage();
  const { searchTerm } = useOutletContext();
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    checkAdminRole();
    fetchBooks();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset pagination on search change
  }, [searchTerm, selectedCategory]);

  const checkAdminRole = async () => {
    try {
      const res = await axioesInstance.get("/admin/check");
      setIsAdmin(res.data?.ok || false);
    } catch {
      setIsAdmin(false);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await axioesInstance.get("/books");
      setBooks(res.data || []);
    } catch {
      toast.error(lang === "mr" ? "पुस्तके लोड करण्यात अयशस्वी" : "Failed to load books");
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

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm(lang === "mr" ? "तुम्हाला खात्री आहे की हे पुस्तक हटवायचे आहे?" : "Are you sure you want to delete this book?")) {
      return;
    }
    try {
      await axioesInstance.delete(`/books/${bookId}`);
      toast.success(lang === "mr" ? "पुस्तक यशस्वीरित्या हटवले!" : "Book deleted successfully!");
      setBooks(prev => prev.filter(b => b._id !== bookId));
    } catch {
      toast.error(lang === "mr" ? "पुस्तक हटविण्यात अयशस्वी" : "Failed to delete book");
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

  return (
    <div className="space-y-6">
      {/* Header section with category filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {lang === "mr" ? "सर्व पुस्तके" : "All Books Collection"}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            {lang === "mr" ? `एकूण ${filteredBooks.length} पुस्तके उपलब्ध` : `Showing ${filteredBooks.length} books available`}
          </p>
        </div>

        {/* Filter options */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
              <Filter className="w-4 h-4" />
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white border border-slate-250 p-2 pl-9 pr-6 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-50 transition"
            >
              <option value="">{lang === "mr" ? "सर्व श्रेणी" : "All Categories"}</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white border border-slate-150 rounded-2xl p-4 space-y-4 shadow-sm animate-pulse">
              <div className="aspect-[3/4] bg-slate-100 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded w-5/6" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center p-16 bg-white border border-slate-150 rounded-3xl space-y-3">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto stroke-[1.5]" />
          <h3 className="font-extrabold text-slate-700 text-sm">
            {lang === "mr" ? "कोणतीही पुस्तके आढळली नाहीत." : "No books found"}
          </h3>
          <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto">
            {lang === "mr"
              ? "आपण शोधलेले पुस्तक किंवा लेखक सापडले नाही. कृपया दुसरा शब्द वापरून पहा."
              : "We couldn't find the book or author you were looking for. Please try another search term."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedBooks.map((book) => (
            <div key={book._id} className="relative group/card">
              <BookCard book={book} onDownload={handleDownloadBook} />
              
              {/* Delete trigger for admins */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleDeleteBook(book._id)}
                  className="absolute top-3 right-3 p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-650 rounded-xl shadow-md scale-0 group-hover/card:scale-100 transition-all duration-200 cursor-pointer"
                  title={lang === "mr" ? "पुस्तक हटवा" : "Delete Book"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
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
    </div>
  );
}
