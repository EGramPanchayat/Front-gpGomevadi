import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  Upload, 
  Download, 
  Settings, 
  ArrowLeft,
  BookMarked
} from "lucide-react";
import { useLanguage } from "../../utils/LanguageContext";

export default function Sidebar({ isOpen }) {
  const { lang } = useLanguage();
  const location = useLocation();

  const menuItems = [
    {
      path: "/elibrary",
      icon: LayoutDashboard,
      label_en: "Dashboard",
      label_mr: "डॅशबोर्ड",
      exact: true
    },
    {
      path: "/elibrary/books",
      icon: BookOpen,
      label_en: "Books",
      label_mr: "पुस्तके",
      exact: false
    },
    {
      path: "/elibrary/upload",
      icon: Upload,
      label_en: "Upload Book",
      label_mr: "पुस्तक अपलोड करा",
      exact: false
    },
    {
      path: "/elibrary/downloads",
      icon: Download,
      label_en: "Downloads",
      label_mr: "डाउनलोड्स",
      exact: false
    },
    {
      path: "/elibrary/settings",
      icon: Settings,
      label_en: "Settings",
      label_mr: "सेटिंग्ज",
      exact: false
    }
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-900 text-slate-100 transition-all duration-300 border-r border-slate-800 ${
      isOpen ? "w-64" : "w-20"
    }`}>
      {/* Header / Brand */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        <Link to="/elibrary" className="flex items-center gap-2 font-black text-lg tracking-tight select-none">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/20 text-white shrink-0">
            <BookMarked className="w-5 h-5" />
          </div>
          {isOpen && (
            <span className="bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent transition-opacity duration-300 font-sans">
              eLibrary
            </span>
          )}
        </Link>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          const label = lang === "mr" ? item.label_mr : item.label_en;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 font-bold text-sm ${
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {isOpen && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer back link */}
      <div className="p-4 border-t border-slate-800">
        <Link
          to="/"
          className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition duration-200 font-bold text-xs text-rose-450 hover:bg-slate-800/60 ${
            isOpen ? "" : "justify-center"
          }`}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {isOpen && <span>{lang === "mr" ? "वेबसाइटवर परत जा" : "Back to Website"}</span>}
        </Link>
      </div>
    </aside>
  );
}
