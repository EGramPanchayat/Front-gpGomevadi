import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axioesInstance from "../utils/axioesInstance";
import { BiBookOpen, BiTrash, BiCloudUpload } from "react-icons/bi";
import { FiFileText, FiPlus, FiTrash2 } from "react-icons/fi";
import { useLanguage } from "../utils/LanguageContext";

const VmsELibraryAdmin = () => {
  const { lang } = useLanguage();

  // Form states
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Books list states
  const [booksList, setBooksList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

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

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoadingList(true);
      const res = await axioesInstance.get("/books");
      setBooksList(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error(lang === "mr" ? "पुस्तके लोड करण्यात अयशस्वी" : "Failed to fetch books");
    } finally {
      setLoadingList(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !category || !pdfFile) {
      return toast.error(lang === "mr" ? "कृपया आवश्यक माहिती भरा आणि PDF फाईल जोडा" : "Please fill all required fields and upload PDF");
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("author", author.trim());
      fd.append("category", category);
      fd.append("description", description.trim());
      if (coverImage) fd.append("coverImage", coverImage);
      fd.append("pdfFile", pdfFile);

      await axioesInstance.post("/books", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Clear form
      setTitle("");
      setAuthor("");
      setCategory("");
      setDescription("");
      setCoverImage(null);
      setPdfFile(null);
      
      // Reset inputs
      document.getElementById("coverInput").value = "";
      document.getElementById("pdfInput").value = "";

      await fetchBooks();
      toast.success(lang === "mr" ? "पुस्तक यशस्वीरित्या अपलोड केले!" : "Book uploaded successfully");
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
      await axioesInstance.delete(`/books/${id}`);
      await fetchBooks();
      toast.success(lang === "mr" ? "पुस्तक हटवले!" : "Book deleted successfully");
    } catch {
      toast.error(lang === "mr" ? "पुस्तक हटवण्यात अयशस्वी" : "Failed to delete book");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden bg-green-900 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-600/30 rounded-full pointer-events-none z-0"></div>
        <div className="absolute -bottom-24 -left-16 w-56 h-56 bg-orange-500/30 rounded-full pointer-events-none z-0"></div>
        <div className="absolute top-1/2 left-[60%] w-16 h-16 bg-yellow-400/30 rounded-full -translate-y-1/2 pointer-events-none z-0"></div>

        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white drop-shadow-md">
            {lang === "mr" ? "ई-वाचनालय व्यवस्थापन" : "eLibrary Management Hub"}
          </h2>
          <p className="text-sm text-green-100 font-semibold mt-1">
            {lang === "mr" 
              ? "गावच्या डिजिटल वाचनालयाची पुस्तके अपलोड करणे, व्यवस्थापित करणे आणि हटवणे यासाठीचे पॅनेल" 
              : "Upload, review, search and delete village digital books collection"}
          </p>
        </div>

        <div className="relative z-10 flex bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0 w-full md:w-auto">
          <div className="flex-1 md:flex-none bg-green-700 text-white shadow-md px-4 py-2.5 rounded-xl font-bold text-xs text-center">
            {booksList.length} {lang === "mr" ? "एकूण पुस्तके" : "Total Books"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upload Form Box */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-green-900/5 border border-green-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50/30 p-6 border-b border-green-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <BiCloudUpload className="text-xl" />
                </div>
                <h2 className="text-xl font-bold text-green-800">
                  {lang === "mr" ? "नवीन पुस्तक जोडा" : "Add New Book"}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  {lang === "mr" ? "पुस्तकाचे नाव *" : "Book Title *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "mr" ? "उदा. श्यामची आई" : "e.g. Shyamchi Aai"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-green-700 focus:ring-1 focus:ring-green-700 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  {lang === "mr" ? "लेखक *" : "Author *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "mr" ? "उदा. साने गुरुजी" : "e.g. Sane Guruji"}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-green-700 focus:ring-1 focus:ring-green-700 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  {lang === "mr" ? "श्रेणी निवडा *" : "Select Category *"}
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:bg-white focus:border-green-700 focus:ring-1 focus:ring-green-700 transition"
                >
                  <option value="">{lang === "mr" ? "निवडा" : "Select Category"}</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  {lang === "mr" ? "पुस्तकाचे वर्णन / सारांश" : "Book Description / Summary"}
                </label>
                <textarea
                  rows={3}
                  placeholder={lang === "mr" ? "पुस्तकाबद्दल थोडी माहिती लिहा..." : "Write a short summary about the book..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none resize-none focus:bg-white focus:border-green-700 focus:ring-1 focus:ring-green-700 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    {lang === "mr" ? "कव्हर प्रतिमा" : "Cover Image"}
                  </label>
                  <input
                    type="file"
                    id="coverInput"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files[0])}
                    className="w-full text-xs font-bold file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-green-100 file:text-green-800 hover:file:bg-green-200 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    {lang === "mr" ? "PDF फाईल *" : "PDF File *"}
                  </label>
                  <input
                    type="file"
                    id="pdfInput"
                    accept="application/pdf"
                    required
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    className="w-full text-xs font-bold file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-green-100 file:text-green-800 hover:file:bg-green-200 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3.5 mt-2 bg-green-700 hover:bg-green-800 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                    <span>{lang === "mr" ? "अपलोड होत आहे..." : "Uploading Book..."}</span>
                  </>
                ) : (
                  <>
                    <FiPlus className="text-sm" />
                    <span>{lang === "mr" ? "लायब्ररीमध्ये जोडा" : "Add to Library"}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Existing Books List View */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-green-900/5 border border-green-100 overflow-hidden flex flex-col h-[650px]">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50/30 p-6 border-b border-green-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <BiBookOpen className="text-xl" />
                </div>
                <h2 className="text-xl font-bold text-green-800">
                  {lang === "mr" ? "लायब्ररी पुस्तके यादी" : "Library Books Directory"}
                </h2>
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-sass-scrollbar">
              {loadingList ? (
                <div className="flex justify-center items-center h-48">
                  <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : booksList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 space-y-2">
                  <BiBookOpen className="text-4xl" />
                  <p className="text-xs font-bold">{lang === "mr" ? "कोणतीही पुस्तके अपलोड केलेली नाहीत" : "No uploaded books found"}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {booksList.map((book) => (
                    <div key={book._id} className="flex justify-between items-center py-4.5 first:pt-0 last:pb-0 group">
                      <div className="flex items-center gap-4">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt=""
                            className="w-10 h-12 object-cover rounded-lg border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-12 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
                            <FiFileText />
                          </div>
                        )}
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-xs line-clamp-1">{book.title}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{book.author} | {book.category}</p>
                          <p className="text-[9px] text-green-700 font-bold mt-0.5">{book.downloads || 0} downloads</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(book._id)}
                        className="p-2 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-xl transition cursor-pointer"
                        title={lang === "mr" ? "पुस्तक हटवा" : "Delete Book"}
                      >
                        <FiTrash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VmsELibraryAdmin;
