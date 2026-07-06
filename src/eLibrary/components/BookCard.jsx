import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Download, Calendar } from "lucide-react";
import { useLanguage } from "../../utils/LanguageContext";

export default function BookCard({ book, onDownload }) {
  const { lang } = useLanguage();

  // Pick customized tag colors based on category name
  const getCategoryColor = (cat) => {
    const term = cat.toLowerCase();
    if (term.includes("educat") || term.includes("शिक्षण")) return "bg-blue-50 text-blue-700 border-blue-150";
    if (term.includes("hist") || term.includes("इतिहास")) return "bg-amber-50 text-amber-700 border-amber-150";
    if (term.includes("sci") || term.includes("विज्ञान")) return "bg-teal-50 text-teal-700 border-teal-150";
    if (term.includes("lit") || term.includes("साहित्य") || term.includes("fict")) return "bg-purple-50 text-purple-700 border-purple-150";
    return "bg-slate-50 text-slate-700 border-slate-150";
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <BookOpen className="w-12 h-12 stroke-[1.5] mb-2 text-indigo-200" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">No Cover Image</span>
          </div>
        )}
        
        {/* Category tag */}
        <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider shadow-sm backdrop-blur-sm bg-white/90 ${getCategoryColor(book.category)}`}>
          {book.category}
        </span>
      </div>

      {/* Book Metadata details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors" title={book.title}>
            {book.title}
          </h3>
          <p className="text-[11px] text-slate-500 font-bold mt-1" title={book.author}>
            {lang === "mr" ? "द्वारा:" : "By:"} {book.author}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100/60">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 stroke-[2]" />
              {new Date(book.createdAt).toLocaleDateString(lang === "mr" ? "mr-IN" : "en-IN")}
            </span>
            <span>
              {book.downloads || 0} {lang === "mr" ? "डाउनलोड" : "downloads"}
            </span>
          </div>

          {/* Read / Download Action triggers */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/elibrary/read/${book._id}`}
              className="flex items-center justify-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-xl text-xs transition border border-indigo-100/50 shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{lang === "mr" ? "वाचा" : "Read"}</span>
            </Link>
            <button
              onClick={() => onDownload(book._id, book.title)}
              className="flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-indigo-600/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === "mr" ? "डाउनलोड" : "Download"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
