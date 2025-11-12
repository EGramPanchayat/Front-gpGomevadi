import React, { useState, useEffect } from "react";
import axioesInstance from "../utils/axioesInstance";
import { toast } from "react-toastify";
import { BiBookmarkAlt } from "react-icons/bi";

const NoticeUploadModal = ({ open, onClose }) => {
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);

  useEffect(() => {
    if (open) fetchList();
  }, [open]);

  const fetchList = async () => {
    try {
      const res = await axioesInstance.get("/notices");
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return toast.error("Description required");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("description", description.trim());
      if (pdfFile) fd.append("pdfFile", pdfFile);

      await axioesInstance.post("/notices", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDescription("");
      setPdfFile(null);
      toast.success("Notice uploaded");
      await fetchList();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      await axioesInstance.delete(`/notices/${id}`);
      toast.success("Deleted");
      await fetchList();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 
        bg-black/40 
        backdrop-blur-[8px] 
        flex justify-center items-center 
        z-[9999] 
        p-4
        animate-fadeIn
        transition-all duration-300
      "
    >
      <div
        className="
          bg-white/95 
          rounded-2xl 
          shadow-2xl 
          w-full max-w-3xl 
          max-h-[90vh] 
          flex flex-col 
          border border-white/30 
          backdrop-blur-lg
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-green-700 rounded-t-2xl">
          <h3 className="text-2xl font-bold text-white">सूचना पत्र</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-orange-300 text-3xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-4 border-b pb-6">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description / सूचना"
              className="w-full border border-green-600 rounded p-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />

            <div className="flex items-center gap-4 flex-wrap">
              <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                {pdfFile ? "PDF selected" : "Attach PDF (optional)"}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
              </label>

              {pdfFile && (
                <span className="text-sm text-gray-600 break-all max-w-full">
                  {pdfFile.name}
                </span>
              )}

              <button
                type="submit"
                disabled={loading}
                className="ml-auto bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>

          {/* Notice List */}
          <div>
            <h3 className="text-xl font-bold text-green-700 mb-4">All Notices</h3>
            <ul className="space-y-4">
              {list.length === 0 ? (
                <p className="text-gray-500 text-center">No notices available.</p>
              ) : (
                list.map((item) => (
                  <li
                    key={item._id}
                    className="bg-gray-50 p-4 rounded-xl shadow flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-3 overflow-x-hidden">
                      <BiBookmarkAlt className="text-green-700 text-2xl flex-shrink-0 mt-1" />
                      <div className="flex flex-col w-full">
                        <p className="text-gray-800 break-words whitespace-pre-wrap">
                          {item.description}
                        </p>
                        {item.pdfUrl && (
                          <a
                            href={item.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline text-sm mt-2 break-all"
                          >
                            View PDF
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t pt-2 text-sm text-gray-500">
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 p-6 border-t border-gray-200 bg-gray-100 rounded-b-2xl justify-end">
          <button
            onClick={onClose}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            बंद करा
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeUploadModal;
