import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axioesInstance from "../utils/axioesInstance";

const NewsUpload = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [newsList, setNewsList] = useState([]);

  // Fetch all news
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    const res = await axioesInstance.get("/news");
    setNewsList(Array.isArray(res.data) ? res.data : []);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axioesInstance.post("/admin/news", { text });
      setText("");
      await fetchNews();
  toast.success("News uploaded successfully");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    await axioesInstance.delete(`/admin/news/${id}`);
    await fetchNews();
  };

  return (
  <section className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-10 mb-12">
      <h2 className="text-2xl font-bold text-green-700 mb-6 border-b pb-4">बातम्या</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          className="border border-green-600 p-2 rounded w-full"
          placeholder="Enter news text"
          value={text}
          onChange={e => setText(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
      <div className="mt-8">
  <h3 className="text-2xl font-bold text-green-700 mb-4">All News</h3>
        <ul className="space-y-4">
          {newsList.map(news => (
            <li key={news._id} className="relative bg-gray-50 p-4 rounded shadow min-h-[56px] flex items-end">
              <span className="text-gray-800 flex-1 break-words overflow-x-auto" style={{ wordBreak: 'break-word' }}>{news.text}</span>
              <button
                onClick={() => handleDelete(news._id)}
                className="absolute right-2 top-2 text-red-500 hover:text-red-700 text-xl font-bold"
                title="Delete"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default NewsUpload;
