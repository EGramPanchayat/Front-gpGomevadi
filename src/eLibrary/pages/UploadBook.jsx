import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Image, FileText, CheckCircle, ArrowLeft } from "lucide-react";
import axioesInstance from "../../utils/axioesInstance";
import { useLanguage } from "../../utils/LanguageContext";
import { toast } from "react-hot-toast";

export default function UploadBook() {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  // Preview & progress states
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = lang === "mr"
    ? ["शिक्षण (Educational)", "इतिहास (Historical)", "साहित्य (Literature)", "विज्ञान (Science)", "इतर (Other)"]
    : ["Educational", "Historical", "Literature", "Science", "Other"];

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error(lang === "mr" ? "कृपया फक्त इमेज फाईल निवडा" : "Please select an image file only");
        return;
      }
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error(lang === "mr" ? "कृपया फक्त PDF फाईल निवडा" : "Please select a PDF file only");
        return;
      }
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !author || !category || !pdfFile) {
      toast.error(lang === "mr" ? "कृपया सर्व आवश्यक फील्ड आणि PDF निवडा!" : "Please fill all required fields and select a PDF!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("category", category);
    formData.append("description", description);
    if (coverImage) formData.append("coverImage", coverImage);
    formData.append("pdfFile", pdfFile);

    try {
      setUploading(true);
      setUploadProgress(10);
      
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Scale from 10 to 90 during direct transmission
          setUploadProgress(10 + percentCompleted * 0.8);
        }
      };

      await axioesInstance.post("/books", formData, config);
      
      setUploadProgress(100);
      toast.success(lang === "mr" ? "पुस्तक यशस्वीरित्या अपलोड केले!" : "Book uploaded successfully!");
      setTimeout(() => {
        navigate("/elibrary/books");
      }, 1000);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      toast.error(lang === "mr" ? `अपलोड अयशस्वी: ${errMsg}` : `Upload failed: ${errMsg}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition shadow-sm border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          {lang === "mr" ? "नवीन पुस्तक अपलोड करा" : "Upload New Book"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              {lang === "mr" ? "पुस्तकाचे नाव *" : "Book Title *"}
            </label>
            <input
              type="text"
              required
              placeholder={lang === "mr" ? "उदा. श्यामची आई" : "e.g. Shyamchi Aai"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              {lang === "mr" ? "लेखक *" : "Author *"}
            </label>
            <input
              type="text"
              required
              placeholder={lang === "mr" ? "उदा. साने गुरुजी" : "e.g. Sane Guruji"}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
            {lang === "mr" ? "श्रेणी निवडा *" : "Select Category *"}
          </label>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          >
            <option value="">{lang === "mr" ? "निवडा" : "Select Category"}</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
            {lang === "mr" ? "पुस्तकाचे वर्णन / सारांश" : "Book Description / Summary"}
          </label>
          <textarea
            rows={4}
            placeholder={lang === "mr" ? "पुस्तकाबद्दल थोडी माहिती लिहा..." : "Write a short summary about the book..."}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none resize-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        {/* File uploads wrapper */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Cover image drag and drop */}
          <div className="flex flex-col">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              {lang === "mr" ? "कव्हर इमेज" : "Cover Image"}
            </label>
            <div className="flex-1 min-h-[160px] relative border-2 border-dashed border-slate-250 hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center p-4 transition bg-slate-50/50 hover:bg-slate-50 cursor-pointer overflow-hidden group">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {coverPreview ? (
                <div className="absolute inset-0 w-full h-full">
                  <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5">
                    <Image className="w-4.5 h-4.5" />
                    Change Image
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-1.5">
                  <Image className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-[11px] font-bold text-slate-500">
                    {lang === "mr" ? "इमेज निवडा किंवा ड्रॅग करा" : "Select or drag image"}
                  </p>
                  <p className="text-[9px] text-slate-400 font-semibold">JPEG, PNG, WebP up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* PDF file drag and drop */}
          <div className="flex flex-col">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              {lang === "mr" ? "PDF फाईल *" : "PDF File *"}
            </label>
            <div className="flex-1 min-h-[160px] relative border-2 border-dashed border-slate-250 hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center p-4 transition bg-slate-50/50 hover:bg-slate-50 cursor-pointer overflow-hidden">
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={handlePdfChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {pdfFile ? (
                <div className="text-center space-y-2">
                  <FileText className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-xs font-extrabold text-slate-700 max-w-[200px] truncate" title={pdfFile.name}>
                    {pdfFile.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-1.5">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-[11px] font-bold text-slate-500">
                    {lang === "mr" ? "PDF निवडा किंवा ड्रॅग करा" : "Select or drag PDF"}
                  </p>
                  <p className="text-[9px] text-slate-400 font-semibold">Only PDF up to 10MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
              <span>{lang === "mr" ? "अपलोड होत आहे..." : "Uploading Files..."}</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-600/10 transition flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{lang === "mr" ? "अपलोड सुरू आहे..." : "Processing upload..."}</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>{lang === "mr" ? "लायब्ररीमध्ये जोडा" : "Add to Library"}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
