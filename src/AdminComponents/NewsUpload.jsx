import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axioesInstance from "../utils/axioesInstance";
import { BiNews, BiBookmarkAlt, BiTrash, BiFileBlank, BiCloudUpload } from "react-icons/bi";
import { FiFileText, FiPlus, FiTrash2 } from "react-icons/fi";

const NewsUpload = () => {
  // States for News
  const [newsText, setNewsText] = useState("");
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsList, setNewsList] = useState([]);

  // States for Notice
  const [noticeDesc, setNoticeDesc] = useState("");
  const [noticePdf, setNoticePdf] = useState(null);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeList, setNoticeList] = useState([]);

  useEffect(() => {
    fetchNews();
    fetchNotices();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axioesInstance.get("/news");
      setNewsList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotices = async () => {
    try {
      const res = await axioesInstance.get("/notices");
      setNoticeList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    if (!newsText.trim()) return toast.error("Please enter news text");
    setNewsLoading(true);
    try {
      await axioesInstance.post("/admin/news", { text: newsText });
      setNewsText("");
      await fetchNews();
      toast.success("News uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload news");
    } finally {
      setNewsLoading(false);
    }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    if (!noticeDesc.trim()) return toast.error("Please enter notice description");
    setNoticeLoading(true);
    try {
      const fd = new FormData();
      fd.append("description", noticeDesc.trim());
      if (noticePdf) fd.append("pdfFile", noticePdf);

      await axioesInstance.post("/admin/notices", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNoticeDesc("");
      setNoticePdf(null);
      await fetchNotices();
      toast.success("Notice uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload notice");
    } finally {
      setNoticeLoading(false);
    }
  };

  const handleNewsDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news?")) return;
    try {
      await axioesInstance.delete(`/admin/news/${id}`);
      await fetchNews();
      toast.success("News deleted");
    } catch (err) {
      toast.error("Failed to delete news");
    }
  };

  const handleNoticeDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      await axioesInstance.delete(`/admin/notices/${id}`);
      await fetchNotices();
      toast.success("Notice deleted");
    } catch (err) {
      toast.error("Failed to delete notice");
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
          <h2 className="text-2xl font-black text-white drop-shadow-md">बातम्या आणि सूचना व्यवस्थापन (News & Notices Hub)</h2>
          <p className="text-sm text-green-100 font-semibold mt-1">गावच्या ताज्या बातम्या, सूचना पत्रे आणि नागरिकांपर्यंत माहिती पोहोचवण्याचे व्यवस्थापन पॅनेल</p>
        </div>

        <div className="relative z-10 flex bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0 w-full md:w-auto">
          <div className="flex-1 md:flex-none bg-green-700 text-white shadow-md px-4 py-2.5 rounded-xl font-bold text-xs text-center">
            {newsList.length} बातम्या
          </div>
          <div className="flex-1 md:flex-none bg-green-700 text-white shadow-md px-4 py-2.5 rounded-xl font-bold text-xs text-center">
            {noticeList.length} सूचना
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* News Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-green-900/5 border border-green-100 overflow-hidden flex flex-col h-[700px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50/30 p-6 border-b border-green-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <BiNews className="text-xl" />
                </div>
                <h2 className="text-xl font-bold text-green-800">बातम्या (News)</h2>
              </div>
              <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold">{newsList.length} बातम्या</span>
            </div>

            {/* Upload Form */}
            <div className="p-6 border-b border-gray-100 bg-white">
              <form onSubmit={handleNewsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">नवीन बातमी जोडा</label>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all outline-none resize-none min-h-[100px]"
                    placeholder="येथे बातमीचा मजकूर लिहा..."
                    value={newsText}
                    onChange={e => setNewsText(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={newsLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                >
                  {newsLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <><FiPlus className="text-lg" /> बातमी प्रकाशित करा</>
                  )}
                </button>
              </form>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              <div className="space-y-4">
                {newsList.length === 0 ? (
                  <div className="text-center py-10 flex flex-col items-center justify-center text-gray-400">
                    <BiNews className="text-5xl mb-3 opacity-20" />
                    <p>कोणतीही बातमी उपलब्ध नाही</p>
                  </div>
                ) : (
                  newsList.map(news => (
                    <div key={news._id} className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all relative">
                      <div className="pr-10">
                        <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{news.text}</p>
                        <p className="text-xs text-gray-400 mt-3 font-medium">{new Date(news.createdAt || Date.now()).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => handleNewsDelete(news._id)}
                        className="absolute right-4 top-4 w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all scale-95 hover:scale-105"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notices Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-orange-900/5 border border-orange-100 overflow-hidden flex flex-col h-[700px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50/30 p-6 border-b border-orange-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <BiBookmarkAlt className="text-xl" />
                </div>
                <h2 className="text-xl font-bold text-orange-800">सूचना पत्र (Notices)</h2>
              </div>
              <span className="bg-orange-100 text-orange-700 py-1 px-3 rounded-full text-xs font-bold">{noticeList.length} सूचना</span>
            </div>

            {/* Upload Form */}
            <div className="p-6 border-b border-gray-100 bg-white">
              <form onSubmit={handleNoticeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">नवीन सूचना जोडा</label>
                  <textarea
                    value={noticeDesc}
                    onChange={(e) => setNoticeDesc(e.target.value)}
                    placeholder="येथे सूचनेचा मजकूर लिहा..."
                    className="w-full border border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all outline-none resize-none min-h-[100px]"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className={`flex-1 flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-3 cursor-pointer transition-all ${noticePdf ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-300 hover:border-orange-400 bg-gray-50 text-gray-500 hover:bg-orange-50/50'}`}>
                    <BiCloudUpload className="text-xl" />
                    <span className="text-sm font-semibold truncate">
                      {noticePdf ? noticePdf.name : "PDF जोडा (पर्यायी)"}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => setNoticePdf(e.target.files?.[0] || null)}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={noticeLoading}
                    className="sm:w-1/3 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                  >
                    {noticeLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <><FiPlus className="text-lg" /> प्रकाशित करा</>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              <div className="space-y-4">
                {noticeList.length === 0 ? (
                  <div className="text-center py-10 flex flex-col items-center justify-center text-gray-400">
                    <BiBookmarkAlt className="text-5xl mb-3 opacity-20" />
                    <p>कोणतीही सूचना उपलब्ध नाही</p>
                  </div>
                ) : (
                  noticeList.map((item) => (
                    <div key={item._id} className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-md transition-all relative flex flex-col gap-3">
                      <div className="flex items-start gap-3 pr-8">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0 mt-1">
                          <FiFileText />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>
                          <div className="flex items-center justify-between mt-4">
                            {item.pdfUrl ? (
                              <a
                                href={item.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full transition-colors"
                              >
                                <BiFileBlank className="text-sm" /> PDF पहा
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">PDF नाही</span>
                            )}
                            <span className="text-xs text-gray-400 font-medium">{new Date(item.createdAt || Date.now()).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleNoticeDelete(item._id)}
                        className="absolute right-4 top-4 w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all scale-95 hover:scale-105"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewsUpload;
