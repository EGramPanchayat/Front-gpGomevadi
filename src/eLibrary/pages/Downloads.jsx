import React, { useState, useEffect } from "react";
import { Download, BookOpen, Clock } from "lucide-react";
import axioesInstance from "../../utils/axioesInstance";
import { useLanguage } from "../../utils/LanguageContext";
import { toast } from "react-hot-toast";

export default function Downloads() {
  const { lang } = useLanguage();
  const [downloadedBooks, setDownloadedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloadedBooks();
  }, []);

  const fetchDownloadedBooks = async () => {
    try {
      setLoading(true);
      const res = await axioesInstance.get("/books");
      // Filter books that have downloads > 0 to simulate downloaded books list
      const list = (res.data || []).filter(b => b.downloads > 0);
      setDownloadedBooks(list);
    } catch {
      toast.error(lang === "mr" ? "डाउनलोड माहिती लोड करण्यात अयशस्वी" : "Failed to load download logs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          {lang === "mr" ? "डाउनलोड लॉग इतिहास" : "Download History Logs"}
        </h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">
          {lang === "mr" ? "लायब्ररीमधील सर्वाधिक डाउनलोड केलेल्या पुस्तकांचा इतिहास" : "Historical records of book downloads across eLibrary portal"}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-16 bg-white border border-slate-150 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : downloadedBooks.length === 0 ? (
        <div className="text-center p-16 bg-white border border-slate-150 rounded-3xl space-y-3">
          <Download className="w-16 h-16 text-slate-300 mx-auto stroke-[1.5]" />
          <h3 className="font-extrabold text-slate-700 text-sm">
            {lang === "mr" ? "अद्याप कोणतेही डाउनलोड नाहीत" : "No download logs found"}
          </h3>
          <p className="text-xs text-slate-400 font-semibold">
            {lang === "mr" ? "या पोर्टलवरून अद्याप कोणतीही पुस्तके डाउनलोड केली गेली नाहीत." : "No books have been downloaded from this portal yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="divide-y divide-slate-100">
            {downloadedBooks.map((book) => (
              <div key={book._id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{book.title}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {lang === "mr" ? "लेखक:" : "Author:"} {book.author}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-450 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{lang === "mr" ? "अद्ययावत" : "Updated"}</span>
                  </div>
                  <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-755 font-black rounded-full text-[10px] uppercase">
                    {book.downloads} {lang === "mr" ? "वेळा" : "Times"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
