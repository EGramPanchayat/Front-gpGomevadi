import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axioesInstance from "../utils/axioesInstance";

const blankWork = () => ({ title: "", description: "", image: null });

const DevelopementWorkAdmin = () => {
  const [savedWorks, setSavedWorks] = useState([]);
  const [newWorks, setNewWorks] = useState([blankWork()]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axioesInstance.get("/devworks").then(res => {
      setSavedWorks(Array.isArray(res.data) ? res.data : []);
    });
  }, []);

  const handleChange = (index, field, value) => {
    setNewWorks(w =>
      w.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addRow = () => setNewWorks(w => [...w, blankWork()]);
  const removeRow = index =>
    setNewWorks(w => (w.length > 1 ? w.filter((_, i) => i !== index) : w));

  const handleSubmit = async e => {
    e.preventDefault();
    for (let i = 0; i < newWorks.length; i++) {
      const w = newWorks[i];
      if (!w.title.trim() || !w.description.trim() || !w.image) {
        toast.error("All fields (Title, Description, Image) are required.");
        return;
      }
    }
    setLoading(true);
    const fd = new FormData();
    newWorks.forEach((w, idx) => {
      fd.append(`works[${idx}][title]`, w.title);
      fd.append(`works[${idx}][description]`, w.description);
      if (w.image) fd.append(`works[${idx}][image]`, w.image);
    });
    try {
      await axioesInstance.post("/admin/devworks", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { data } = await axioesInstance.get("/devworks");
      setSavedWorks(Array.isArray(data) ? data : []);
      setNewWorks([blankWork()]);
      toast.success("New works added successfully");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    await axioesInstance.delete(`/admin/devworks/${id}`);
    setSavedWorks(list => list.filter(item => item._id !== id));
  };

  return (
    <section className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-xl p-6 mb-8">
      <h2 className="text-2xl font-bold text-green-700 mb-4 border-b pb-2">
        विकास कामे व्यवस्थापन
      </h2>

      {/* ---------- Add Works Form ---------- */}
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        {newWorks.map((work, idx) => (
          <div key={idx} className=" p-4 rounded mb-4 ">
            <input
              className="border border-green-600 p-2 rounded w-full mb-2 break-words"
              placeholder="कार्याचे शीर्षक"
              value={work.title}
              required
              onChange={e => handleChange(idx, "title", e.target.value)}
            />
            <textarea
              className="border border-green-600 p-2 rounded w-full mb-2 min-h-[60px] break-words whitespace-pre-wrap"
              placeholder="कार्याचे वर्णन"
              value={work.description}
              required
              onChange={e => handleChange(idx, "description", e.target.value)}
            />
              <div className="flex flex-wrap items-center gap-2 relative">
  <label className="bg-green-700 text-white px-6 py-3 rounded shadow cursor-pointer text-base">
    Image
    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={e =>
        handleChange(idx, "image", e.target.files ? e.target.files[0] : null)
      }
    />
  </label>

  {newWorks.length > 1 && (
    <button
      type="button"
      onClick={() => removeRow(idx)}
      className="bg-red-500 text-white px-6 py-3 rounded-full text-base"
    >
      ✕
    </button>
  )}

  <button
    type="submit"
    disabled={loading}
    className="bg-green-700 text-white px-8 py-3 rounded text-base hover:bg-green-800 ml-auto"
    style={{ marginLeft: "auto" }}
  >
    {loading ? "Saving..." : "Save"}
  </button>
</div>

          </div>
        ))}
      </form>

      {/* ---------- Saved Works Cards ---------- */}
      <div className="my-20 ">
        <h2 className="text-2xl font-bold text-green-700 mb-10  pb-2">
          जतन केलेली कामे
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
          {savedWorks.map(work => (
            <div
              key={work._id}
              className="relative bg-white rounded-xl transition-all overflow-hidden pb-3 flex flex-col  border-green-600 border"
            >
              {work.image ? (
                <img
                  src={work.image.url}
                  alt={work.title}
                  className="w-full h-40 object-cover  mb-2 rounded"
                />
              ) : (
                <span className="material-icons text-gray-400 text-5xl mb-2">image</span>
              )}

            
                <h4 className="text-lg font-bold text-green-700 mb-1 text-center break-words whitespace-pre-wrap">
                  {work.title}
                </h4>
                <p className="text-gray-700 text-center text-sm break-words whitespace-pre-wrap">
                  {work.description}
                </p>
             

              <button
                onClick={() => handleDelete(work._id)}
                className=" bg-red-500 text-white px-2 py-1 mt-2 rounded text-xs font-semibold shadow hover:bg-red-600 transition self-center"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DevelopementWorkAdmin;
