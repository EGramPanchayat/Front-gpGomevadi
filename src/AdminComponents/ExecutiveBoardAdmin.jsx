import React, { useEffect, useState, memo } from "react";
import { v4 as uuidv4 } from "uuid";
import axioesInstance from "../utils/axioesInstance";
import { toast } from "react-toastify";

// helpers
const newMember = (data = {}) => ({
  _id: data._id || uuidv4(),
  name: data.name || "",
  mobile: data.mobile || "",
  image: null,
  imageUrl: data.image?.url || data.image || "",
});

const newOfficer = (role, data = {}) => ({
  role,
  _id: data._id || uuidv4(),
  name: data.name || "",
  mobile: data.mobile || "",
  image: null,
  imageUrl: data.image?.url || data.image || "",
});

// Card used in admin form
const Card = memo(function Card({ title, data, onChange, allowRemove, onRemove, lang }) {
  return (
    <div className="flex flex-col items-center bg-white p-4 sm:p-6 rounded-2xl shadow w-full max-w-xs sm:w-64 text-center mx-auto">
      <h4 className="font-bold text-lg mb-3">{title}</h4>
      <div className="relative mb-3">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
          {data.imageUrl ? (
            <img src={data.imageUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <span className="text-gray-400">{lang === "mr" ? "चित्र नाही" : "No Image"}</span>
          )}
        </div>
      </div>
      <input
        placeholder={lang === "mr" ? "नाव" : "Name"}
        value={data.name}
        onChange={e => onChange("name", e.target.value)}
        className="border border-green-600 p-2 rounded w-full mb-2 text-left"
      />
      <div className="relative w-full mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 select-none">+91</span>
        <input
          type="tel"
          placeholder={lang === "mr" ? "मोबाईल" : "Mobile"}
          value={data.mobile}
          onChange={e => onChange("mobile", e.target.value.replace(/[^\d]/g, ""))}
          className="border border-green-600 p-2 pl-12 rounded w-full text-left"
          maxLength={10}
        />
      </div>
      <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-semibold">
        {lang === "mr" ? "फोटो" : "Image"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => onChange("image", e.target.files[0])}
        />
      </label>
      {allowRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-3 bg-red-500 text-white px-3 py-1 rounded shadow"
        >
          {lang === "mr" ? "हटवा" : "Delete"}
        </button>
      )}
    </div>
  );
});

import { useLanguage } from "../utils/LanguageContext";

export default function ExecutiveBoardAdmin({ mode = "all" }) {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sarpanch, setSarpanch] = useState({ name: "", mobile: "", image: null, imageUrl: "" });
  const [upsarpanch, setUpsarpanch] = useState({ name: "", mobile: "", image: null, imageUrl: "" });
  const [members, setMembers] = useState([]);
  const [officers, setOfficers] = useState([]);

  const getRoleLabel = (role) => {
    if (role === "ग्राम महसूल अधिकारी") return lang === "mr" ? "ग्राम महसूल अधिकारी" : "Village Revenue Officer (Talathi)";
    if (role === "ग्रामपंचायत अधिकारी") return lang === "mr" ? "ग्रामपंचायत अधिकारी" : "Grampanchayat Officer (Gram Sevak)";
    if (role === "कृषी अधिकारी") return lang === "mr" ? "कृषी अधिकारी" : "Agriculture Officer";
    if (role === "डेटा ऑपरेटर") return lang === "mr" ? "डेटा ऑपरेटर" : "Data Entry Operator";
    if (role === "पाणीपुरवठा कर्मचारी") return lang === "mr" ? "पाणीपुरवठा कर्मचारी" : "Water Supply Staff";
    if (role === "लिपिक") return lang === "mr" ? "लिपिक" : "Clerk";
    if (role === "शिपाई") return lang === "mr" ? "शिपाई" : "Peon";
    return role;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axioesInstance.get("/executive-board");
        setSarpanch({
          name: data.sarpanch?.name || "",
          mobile: data.sarpanch?.mobile || "",
          image: null,
          imageUrl: data.sarpanch?.image?.url || data.sarpanch?.image || "",
        });
        setUpsarpanch({
          name: data.upsarpanch?.name || "",
          mobile: data.upsarpanch?.mobile || "",
          image: null,
          imageUrl: data.upsarpanch?.image?.url || data.upsarpanch?.image || "",
        });
        setMembers((data.members || []).map(m => newMember(m)));

        const defaultRoles = [
          "ग्राम महसूल अधिकारी",
          "ग्रामपंचायत अधिकारी",
          "कृषी अधिकारी",
          "डेटा ऑपरेटर",
          "पाणीपुरवठा कर्मचारी",
          "लिपिक",
          "शिपाई",
        ];
        const existing = data.staff?.officers || [];
        setOfficers(
          defaultRoles.map(role => {
            const found = existing.find(o => o.role === role) || {};
            return newOfficer(role, found);
          })
        );

        
      } catch {
        setMembers([newMember()]);
        setOfficers(
          ["ग्राम महसूल अधिकारी", "ग्रामपंचायत अधिकारी", "कृषी अधिकारी", "डेटा ऑपरेटर", "पाणीपुरवठा कर्मचारी", "लिपिक", "शिपाई"].map(r =>
            newOfficer(r)
          )
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // handlers
  const updateMember = (_id, key, val) =>
    setMembers(ms => ms.map(m => (m._id === _id ? { ...m, [key]: val } : m)));

  const addMember = () => setMembers(ms => [...ms, newMember()]);

  const removeMember = _id => setMembers(ms => ms.filter(m => m._id !== _id));

  const updateOfficer = (_id, key, val) =>
    setOfficers(os => os.map(o => (o._id === _id ? { ...o, [key]: val } : o)));

  const validate = () => {
    const ten = /^\d{10}$/;
    if (!sarpanch.name.trim()) return lang === "mr" ? "सरपंचचे नाव आवश्यक आहे" : "Sarpanch name is required";
    if (!ten.test(sarpanch.mobile)) return lang === "mr" ? "सरपंचचा मोबाईल 10 अंकांचा असावा" : "Sarpanch mobile must be 10 digits";
    if (!upsarpanch.name.trim()) return lang === "mr" ? "उपसरपंचचे नाव आवश्यक आहे" : "Deputy Sarpanch name is required";
    if (!ten.test(upsarpanch.mobile)) return lang === "mr" ? "उपसरपंचचा मोबाईल 10 अंकांचा असावा" : "Deputy Sarpanch mobile must be 10 digits";
    if (!members.length) return lang === "mr" ? "किमान 1 सदस्य आवश्यक आहे" : "At least 1 member is required";
    for (let i = 0; i < members.length; i++) {
      if (!members[i].name.trim()) return lang === "mr" ? `सदस्य ${i + 1} चे नाव आवश्यक आहे` : `Member ${i + 1} name is required`;
      if (!ten.test(members[i].mobile)) return lang === "mr" ? `सदस्य ${i + 1} चा मोबाईल 10 अंकांचा असावा` : `Member ${i + 1} mobile must be 10 digits`;
    }
    for (const o of officers) {
      if (!o.name.trim()) return lang === "mr" ? `${o.role} चे नाव आवश्यक आहे` : `${getRoleLabel(o.role)} name is required`;
      if (!ten.test(o.mobile)) return lang === "mr" ? `${o.role} चा मोबाईल 10 अंकांचा असावा` : `${getRoleLabel(o.role)} mobile must be 10 digits`;
    }
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const msg = validate();
    if (msg) return toast.error(msg);

    setSaving(true);
    const fd = new FormData();
    fd.append("sarpanch[name]", sarpanch.name);
    fd.append("sarpanch[mobile]", sarpanch.mobile);
    fd.append("upsarpanch[name]", upsarpanch.name);
    fd.append("upsarpanch[mobile]", upsarpanch.mobile);
    if (sarpanch.image) fd.append("sarpanch", sarpanch.image);
    if (upsarpanch.image) fd.append("upsarpanch", upsarpanch.image);

    members.forEach((m, idx) => {
      fd.append(`members[${idx}][_id]`, m._id);
      fd.append(`members[${idx}][name]`, m.name);
      fd.append(`members[${idx}][mobile]`, m.mobile);
      if (m.image) fd.append(`memberImages[${m._id}]`, m.image);
    });

    officers.forEach((o, idx) => {
      fd.append(`staff[${idx}][_id]`, o._id);
      fd.append(`staff[${idx}][role]`, o.role);
      fd.append(`staff[${idx}][name]`, o.name);
      fd.append(`staff[${idx}][mobile]`, o.mobile);
      if (o.image) fd.append(`officerImages[${o._id}]`, o.image);
    });

    try {
      await axioesInstance.post("/admin/executive-board", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(lang === "mr" ? "कार्यकारिणी यशस्वीरीत्या जतन केली!" : "Executive board saved successfully!");
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
      {(mode === "all" || mode === "exec") && (
        <>
          <h2 className="text-2xl font-bold text-green-700 mb-4 border-b sm:pb-2 md:pb-4 text-center">
            {lang === "mr" ? "गाव कार्यकारिणी व्यवस्थापन" : "Village Executive Board Management"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card title={lang === "mr" ? "सरपंच" : "Sarpanch"} data={sarpanch} onChange={(k, v) => setSarpanch(s => ({ ...s, [k]: v }))} lang={lang} />
            <Card title={lang === "mr" ? "उपसरपंच" : "Deputy Sarpanch"} data={upsarpanch} onChange={(k, v) => setUpsarpanch(s => ({ ...s, [k]: v }))} lang={lang} />
            {members.map(m => (
              <Card key={m._id} title={lang === "mr" ? "सदस्य" : "Member"} data={m} onChange={(k, v) => updateMember(m._id, k, v)} allowRemove={members.length > 1} onRemove={() => removeMember(m._id)} lang={lang} />
            ))}
          </div>
          <div className="text-center mt-4">
            <button type="button" onClick={addMember} className="bg-green-700 text-white px-4 py-2 rounded shadow">
              {lang === "mr" ? "नवीन सदस्य जोडा" : "Add New Member"}
            </button>
          </div>
        </>
      )}

      {(mode === "all" || mode === "officers") && (
        <>
          {mode === "all" ? (
            <h3 className="text-3xl font-bold mb-4 border-t pt-10 text-green-700 text-center">
              {lang === "mr" ? "अधिकारी" : "Officials"}
            </h3>
          ) : (
            <h2 className="text-2xl font-bold text-green-700 mb-4 border-b sm:pb-2 md:pb-4 text-center">
              {lang === "mr" ? "अधिकारी" : "Officials"}
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {officers.map(o => (
              <Card key={o._id} title={getRoleLabel(o.role)} data={o} onChange={(k, v) => updateOfficer(o._id, k, v)} lang={lang} />
            ))}
          </div>
        </>
      )}

      <div className="mt-10 flex justify-center">
        <button 
          type="button" 
          className={`bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded shadow w-full max-w-md text-xl ${saving ? "opacity-60 cursor-not-allowed" : ""}`} 
          onClick={handleSubmit} 
          disabled={saving}
        >
          {saving 
            ? (lang === "mr" ? "जतन होत आहे..." : "Saving...") 
            : (lang === "mr" ? "जतन करा" : "Save")}
        </button>
      </div>
    </form>
  );
}
