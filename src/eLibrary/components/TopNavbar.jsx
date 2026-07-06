import React from "react";
import { Menu, Search, Globe2, User } from "lucide-react";
import { useLanguage } from "../../utils/LanguageContext";

export default function TopNavbar({ sidebarOpen, setSidebarOpen, searchTerm, setSearchTerm }) {
  const { lang, setLang } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-150 bg-white/85 px-6 backdrop-blur-md shadow-sm">
      {/* Left section: Sidebar toggle button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition shadow-sm border border-slate-200"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="hidden sm:block text-base font-extrabold text-slate-800 tracking-tight">
          {lang === "mr" ? "ई-वाचनालय नियंत्रण" : "eLibrary Portal"}
        </h1>
      </div>

      {/* Middle section: Global Search connected to state */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder={lang === "mr" ? "पुस्तके किंवा लेखक शोधा..." : "Search books or authors..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right section: Lang context switch & Avatar */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Language switch */}
        <button
          onClick={() => setLang(lang === "mr" ? "en" : "mr")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition border border-slate-200 shadow-sm"
        >
          <Globe2 className="w-4 h-4 text-indigo-500" />
          <span>{lang === "mr" ? "English" : "मराठी"}</span>
        </button>

        {/* Profile Avatar Placeholder */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600 font-extrabold text-sm shadow-inner">
            <User className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>
    </header>
  );
}
