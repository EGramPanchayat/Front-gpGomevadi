import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axioesInstance from "../utils/axioesInstance";
import { toast } from "react-toastify";

const newOfficial = (data = {}) => ({
  _id: data._id || uuidv4(),
  role: data.role || "",
  name: data.name || "",
  image: null,
  imageUrl: data.image || "",
});

function OfficialCard({ data, onChange, onMoveUp, onMoveDown, isFirst, isLast }) {
  return (
    <div className="flex flex-col items-center bg-white p-4 sm:p-6 rounded-2xl shadow w-full max-w-xs sm:w-64 text-center mx-auto">
      <div className="relative mb-3">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
          {data.imageUrl ? (
            <img src={data.imageUrl} alt={data.role} className="h-full w-full object-cover" />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>
      </div>
      <input
        placeholder="पद (उदा. माननीय मुख्यमंत्री)"
        value={data.role}
        onChange={e => onChange("role", e.target.value)}
        className="border border-green-600 p-2 rounded w-full mb-2 text-left"
      />
      <input
        placeholder="नाव"
        value={data.name}
        onChange={e => onChange("name", e.target.value)}
        className="border border-green-600 p-2 rounded w-full mb-2 text-left"
      />
      <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-semibold mb-2">
        Image
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const file = e.target.files[0];
            if (file) {
              onChange("image", file);
              onChange("imageUrl", URL.createObjectURL(file));
            }
          }}
        />
      </label>

      {/* Reorder buttons */}
      <div className="flex gap-2 mt-2">
        {!isFirst && (
          <button
            type="button"
            onClick={onMoveUp}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded shadow text-sm"
          >
            ↑ वर
          </button>
        )}
        {!isLast && (
          <button
            type="button"
            onClick={onMoveDown}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded shadow text-sm"
          >
            ↓ खाली
          </button>
        )}
      </div>
    </div>
  );
}

export default function GovOfficialsAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [officials, setOfficials] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axioesInstance.get("/gov-officials");
        setOfficials((data || []).map(o => newOfficial(o)));
      } catch {
        setOfficials([newOfficial()]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateOfficial = (_id, key, val) =>
    setOfficials(list => list.map(o => (o._id === _id ? { ...o, [key]: val } : o)));

  const addOfficial = () => setOfficials(list => [...list, newOfficial()]);

  const removeOfficial = (_id) => setOfficials(list => list.filter(o => o._id !== _id));

  const moveUp = (index) => {
    if (index <= 0) return;
    setOfficials(list => {
      const copy = [...list];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const moveDown = (index) => {
    setOfficials(list => {
      if (index >= list.length - 1) return list;
      const copy = [...list];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  };

  const validate = () => {
    for (let i = 0; i < officials.length; i++) {
      if (!officials[i].role.trim()) return `अधिकारी ${i + 1} चे पद आवश्यक आहे`;
      if (!officials[i].name.trim()) return `अधिकारी ${i + 1} चे नाव आवश्यक आहे`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return toast.error(msg);

    setSaving(true);

    const fd = new FormData();
    officials.forEach((o, idx) => {
      fd.append(`officials[${idx}][_id]`, o._id);
      fd.append(`officials[${idx}][role]`, o.role);
      fd.append(`officials[${idx}][name]`, o.name);
      fd.append(`officials[${idx}][image]`, o.imageUrl || "");
      if (o.image) fd.append(`officialImages[${o._id}]`, o.image);
    });

    try {
      await axioesInstance.post("/admin/gov-officials", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Government officials saved successfully!");
    } catch (err) {
      toast.error(`Server error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-10 rounded-2xl shadow text-center">
        <svg
          className="animate-spin -ml-1 mr-3 h-8 w-8 text-green-600 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-10 rounded-2xl shadow-2xl space-y-12 border border-green-200">
      <h2 className="text-2xl font-bold text-green-700 mb-4 border-b sm:pb-2 md:pb-4 text-center">
        शासकीय अधिकारी व्यवस्थापन
      </h2>
      <p className="text-center text-gray-600 text-sm">
        ग्राम विकास व पंचायतराज विभागातील शासकीय अधिकाऱ्यांची माहिती व्यवस्थापित करा.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {officials.map((o, idx) => (
          <OfficialCard
            key={o._id}
            data={o}
            onChange={(k, v) => updateOfficial(o._id, k, v)}
            onMoveUp={() => moveUp(idx)}
            onMoveDown={() => moveDown(idx)}
            isFirst={idx === 0}
            isLast={idx === officials.length - 1}
          />
        ))}
      </div>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={addOfficial}
          className="bg-green-700 text-white px-4 py-2 rounded shadow"
        >
          नवीन अधिकारी जोडा
        </button>
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          className={`bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded shadow w-full max-w-md text-xl 
            ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
