import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axioesInstance from "../utils/axioesInstance";
import { BiImageAdd, BiBuildingHouse } from "react-icons/bi";
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from "react-icons/fi";

const DevelopementWorkAdmin = () => {
  const [savedWorks, setSavedWorks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSavedWorks, setOpenSavedWorks] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      const res = await axioesInstance.get("/devworks");
      setSavedWorks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !image) {
      toast.error("सर्व फील्ड्स भरणे आवश्यक आहे (शीर्षक, वर्णन, इमेज)");
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("description", description.trim());
    fd.append("image", image);
    try {
      await axioesInstance.post("/admin/devworks", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchWorks();
      setTitle("");
      setDescription("");
      setImage(null);
      toast.success("विकास काम यशस्वीरित्या जतन केले!");
    } catch (err) {
      toast.error("विकास काम जतन करण्यात त्रुटी आली.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("तुम्हाला खात्री आहे की तुम्हाला हे विकास काम डिलीट करायचे आहे?")) return;
    try {
      await axioesInstance.delete(`/admin/devworks/${id}`);
      setSavedWorks(list => list.filter(item => item._id !== id));
      toast.success("विकास काम डिलीट केले");
    } catch (err) {
      toast.error("विकास काम डिलीट करण्यात त्रुटी आली.");
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
          <h2 className="text-2xl font-black text-white drop-shadow-md">विकास कामे व्यवस्थापन (Development Works Hub)</h2>
          <p className="text-sm text-green-100 font-semibold mt-1">ग्रामपंचायत विकास कामे, फोटो नोंदणी आणि नागरिकांसाठी प्रगती माहिती व्यवस्थापन पॅनेल</p>
        </div>

        <div className="relative z-10 bg-slate-100 p-1.5 rounded-2xl shrink-0">
          <div className="bg-green-700 text-white shadow-md px-4 py-2.5 rounded-xl font-bold text-xs">
            {savedWorks.length} विकास कामे
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Upload Form Section */}
        <div className="w-full space-y-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-green-900/5 border border-green-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50/30 p-6 border-b border-green-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-green-800">नवीन काम जोडा</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">कार्याचे शीर्षक</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all outline-none"
                    placeholder="उदा. नवीन रस्ता बांधकाम"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">कार्याचे वर्णन</label>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all outline-none min-h-[120px] resize-none"
                    placeholder="कामाविषयी सविस्तर माहिती लिहा..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">कामाचा फोटो</label>
                  <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${image ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 hover:border-green-400 bg-gray-50 text-gray-500 hover:bg-green-50/50'}`}>
                    <BiImageAdd className="text-3xl" />
                    <span className="text-sm font-semibold text-center truncate w-full px-2">
                      {image ? image.name : "फोटो निवडण्यासाठी क्लिक करा"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <><FiPlus className="text-lg" /> काम प्रकाशित करा</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Saved Works Section */}
        <div className="w-full space-y-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-green-900/5 border border-green-100 overflow-hidden flex flex-col">
            <button
              type="button"
              onClick={() => setOpenSavedWorks(!openSavedWorks)}
              className="w-full bg-gradient-to-r from-green-50 to-emerald-50/30 p-6 border-b border-green-100 flex items-center justify-between hover:bg-green-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-green-800">जतन केलेली कामे</h2>
                <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold">{savedWorks.length} कामे</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600">
                {openSavedWorks ? <FiChevronUp /> : <FiChevronDown />}
              </div>
            </button>
            
            {openSavedWorks && (
              <div className="flex-1 p-6 bg-gray-50/50 overflow-y-auto">
                {savedWorks.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center justify-center text-gray-400 h-full">
                    <BiBuildingHouse className="text-6xl mb-4 opacity-20" />
                    <p className="font-semibold text-lg">कोणतीही विकास कामे उपलब्ध नाहीत</p>
                    <p className="text-sm mt-2">डावीकडील फॉर्म वापरून नवीन काम जोडा</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {savedWorks.slice(0, showAll ? savedWorks.length : 4).map(work => (
                      <div key={work._id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all overflow-hidden flex flex-col relative">
                        <div className="h-48 relative overflow-hidden bg-gray-100">
                          {work.image ? (
                            <img
                              src={work.image.url || work.image}
                              alt={work.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                              <BiImageAdd className="text-4xl mb-2 opacity-30" />
                              <span className="text-xs font-medium">No Image</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <button
                            onClick={() => handleDelete(work._id)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all scale-95 hover:scale-105 shadow-md backdrop-blur-sm"
                            title="Delete"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </div>
                        
                        <div className="p-5 flex-1 flex flex-col">
                          <h4 className="text-lg font-bold text-green-900 mb-2 line-clamp-2">
                            {work.title}
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                            {work.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!showAll && savedWorks.length > 4 && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => setShowAll(true)}
                        className="bg-green-50 text-green-700 hover:bg-green-100 font-bold py-2.5 px-6 rounded-full transition-colors flex items-center gap-2"
                      >
                        अधिक कामे पहा <FiChevronDown />
                      </button>
                    </div>
                  )}
                  {showAll && savedWorks.length > 4 && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => setShowAll(false)}
                        className="bg-green-50 text-green-700 hover:bg-green-100 font-bold py-2.5 px-6 rounded-full transition-colors flex items-center gap-2"
                      >
                        कमी कामे पहा <FiChevronUp />
                      </button>
                    </div>
                  )}
                </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DevelopementWorkAdmin;
