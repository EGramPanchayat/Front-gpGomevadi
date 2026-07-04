import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axioesInstance from "../utils/axioesInstance";

const DevelopementWorkAdmin = () => {
  const [savedWorks, setSavedWorks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSavedWorks, setOpenSavedWorks] = useState(false);

  useEffect(() => {
    axioesInstance.get("/devworks").then(res => {
      setSavedWorks(Array.isArray(res.data) ? res.data : []);
    });
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !image) {
      toast.error("All fields (Title, Description, Image) are required.");
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("image", image);
    try {
      await axioesInstance.post("/admin/devworks", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { data } = await axioesInstance.get("/devworks");
      setSavedWorks(Array.isArray(data) ? data : []);
      setTitle("");
      setDescription("");
      setImage(null);
      toast.success("Work added successfully");
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

      {/* ---------- Add Work Form ---------- */}
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        <div className=" p-4 rounded mb-4 ">
          <input
            className="border border-green-600 p-2 rounded w-full mb-2 break-words"
            placeholder="कार्याचे शीर्षक"
            value={title}
            required
            onChange={e => setTitle(e.target.value)}
          />
          <textarea
            className="border border-green-600 p-2 rounded w-full mb-2 min-h-[60px] break-words whitespace-pre-wrap"
            placeholder="कार्याचे वर्णन"
            value={description}
            required
            onChange={e => setDescription(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2 relative">
            <label className="bg-green-700 text-white px-6 py-3 rounded shadow cursor-pointer text-base">
              Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e =>
                  setImage(e.target.files ? e.target.files[0] : null)
                }
              />
            </label>

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
      </form>

      {/* ---------- Saved Works Cards ---------- */}
      <div className="my-10 border border-green-200 rounded-2xl overflow-hidden shadow">
        <button
          type="button"
          onClick={() => setOpenSavedWorks(prev => !prev)}
          className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-green-700 text-lg bg-green-50 hover:bg-green-100 transition duration-300"
        >
          <span>जतन केलेली कामे</span>
          <span className={`transform transition-transform duration-300 ${openSavedWorks ? 'rotate-180' : 'rotate-0'}`}>
            ▼
          </span>
        </button>
        {openSavedWorks && (
          <div className="p-6 bg-white border-t border-green-100">
            {savedWorks.length === 0 ? (
              <div className="text-gray-500 text-center py-4">कोणतीही विकास कामे जतन केलेली नाहीत.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedWorks.map(work => (
                  <div
                    key={work._id}
                    className="relative bg-white rounded-xl transition-all overflow-hidden pb-3 flex flex-col border border-green-200 hover:shadow-lg transition duration-300"
                  >
                    {work.image ? (
                      <img
                        src={work.image.url || work.image}
                        alt={work.title}
                        className="w-full h-40 object-cover mb-2 rounded-t"
                      />
                    ) : (
                      <div className="h-40 bg-green-50 flex items-center justify-center text-green-700 font-bold mb-2">No Image</div>
                    )}
                    <h4 className="text-lg font-bold text-green-700 mb-1 px-3 text-center break-words whitespace-pre-wrap">
                      {work.title}
                    </h4>
                    <p className="text-gray-700 px-3 text-center text-sm break-words whitespace-pre-wrap">
                      {work.description}
                    </p>
                    <button
                      onClick={() => handleDelete(work._id)}
                      className="bg-red-500 text-white px-3 py-1 mt-auto rounded text-sm font-semibold shadow hover:bg-red-600 transition self-center"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default DevelopementWorkAdmin;
