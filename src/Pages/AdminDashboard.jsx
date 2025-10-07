import React, { useState, useEffect, memo } from "react";
import { v4 as uuidv4 } from "uuid";
import axioesInstance from "../utils/axioesInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DevelopementWorkAdmin from "../AdminComponents/DevelopementWorkAdmin";
import NewsUpload from "../AdminComponents/NewsUpload";
import QRUploadModal from "../AdminComponents/QRUploadModal";
import { Link } from "react-scroll";

// ---------- Helpers ----------
const newMember = (data = {}) => ({
  _id: data._id || uuidv4(),
  name: data.name || "",
  mobile: data.mobile || "",
  image: null,
  imageUrl: data.image || "",
});

const newOfficer = (role, data = {}) => ({
  role,
  _id: data._id || uuidv4(),
  name: data.name || "",
  mobile: data.mobile || "",
  image: null,
  imageUrl: data.image || "",
});

// ---------- Memoized Card ----------
const Card = memo(function Card({ title, data, onChange, allowRemove, onRemove }) {
  return (
    <div className="flex flex-col items-center bg-white p-4 sm:p-6 rounded-2xl shadow w-full max-w-xs sm:w-64 text-center mx-auto">
      <h4 className="font-bold text-lg mb-3">{title}</h4>
      <div className="relative mb-3">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
          {data.imageUrl ? (
            <img src={data.imageUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>
      </div>
      <input
        placeholder="नाव"
        value={data.name}
        onChange={e => onChange("name", e.target.value)}
        className="border border-green-600 p-2 rounded w-full mb-2 text-left"
      />
      <div className="relative w-full mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 select-none">+91</span>
        <input
          type="tel"
          placeholder="मोबाईल"
          value={data.mobile}
          onChange={e => onChange("mobile", e.target.value.replace(/[^\d]/g, ""))}
          className="border border-green-600 p-2 pl-12 rounded w-full text-left"
          maxLength={10}
        />
      </div>
      <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-semibold">
        Image
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
          हटवा
        </button>
      )}
    </div>
  );
});

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sarpanch, setSarpanch] = useState({ name: "", mobile: "", image: null, imageUrl: "" });
  const [upsarpanch, setUpsarpanch] = useState({ name: "", mobile: "", image: null, imageUrl: "" });
  const [members, setMembers] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axioesInstance.get("/exboard-karyakari-mandal");
        setSarpanch({
          name: data.sarpanch?.name || "",
          mobile: data.sarpanch?.mobile || "",
          image: null,
          imageUrl: data.sarpanch?.image || "",
        });
        setUpsarpanch({
          name: data.upsarpanch?.name || "",
          mobile: data.upsarpanch?.mobile || "",
          image: null,
          imageUrl: data.upsarpanch?.image || "",
        });
        setMembers((data.members || []).map(m => newMember(m)));

        const defaultRoles = [
          "तलाठी",
          "ग्रामसेवक",
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
          ["तलाठी", "ग्रामसेवक", "कृषी अधिकारी", "डेटा ऑपरेटर", "पाणीपुरवठा कर्मचारी", "लिपिक", "शिपाई"].map(r =>
            newOfficer(r)
          )
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ---------- Handlers ----------
  const updateMember = (_id, key, val) =>
    setMembers(ms => ms.map(m => (m._id === _id ? { ...m, [key]: val } : m)));

  const addMember = () => setMembers(ms => [...ms, newMember()]);

  const removeMember = _id => setMembers(ms => ms.filter(m => m._id !== _id));

  const updateOfficer = (_id, key, val) =>
    setOfficers(os => os.map(o => (o._id === _id ? { ...o, [key]: val } : o)));

  const validate = () => {
    const ten = /^\d{10}$/;
    if (!sarpanch.name.trim()) return "सरपंचचे नाव आवश्यक आहे";
    if (!ten.test(sarpanch.mobile)) return "सरपंचचा मोबाईल 10 अंकांचा असावा";
    if (!upsarpanch.name.trim()) return "उपसरपंचचे नाव आवश्यक आहे";
    if (!ten.test(upsarpanch.mobile)) return "उपसरपंचचा मोबाईल 10 अंकांचा असावा";
    if (!members.length) return "किमान 1 सदस्य आवश्यक आहे";
    for (let i = 0; i < members.length; i++) {
      if (!members[i].name.trim()) return `सदस्य ${i + 1} चे नाव आवश्यक आहे`;
      if (!ten.test(members[i].mobile)) return `सदस्य ${i + 1} चा मोबाईल 10 अंकांचा असावा`;
    }
    for (const o of officers) {
      if (!o.name.trim()) return `${o.role} चे नाव आवश्यक आहे`;
      if (!ten.test(o.mobile)) return `${o.role} चा मोबाईल 10 अंकांचा असावा`;
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
      await axioesInstance.post("/exboard-karyakari-mandal", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("कार्यकारिणी यशस्वीरित्या जतन झाली!");
    } catch (err) {
      toast.error(`सर्व्हर त्रुटी: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // don't block rendering the navbar/outer shell while loading data;
  // show a localized loader inside the exec-section instead

  return (
    <>
      <QRUploadModal open={qrModalOpen} onClose={() => setQrModalOpen(false)} />
      {/* NAVBAR */}
      <nav className="bg-green-700 text-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/satyamev.jpg"
              alt="Logo"
              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow"
            />
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-bold tracking-wide whitespace-nowrap">
                ग्रामपंचायत गोमेवाडी
              </h1>
              <span className="text-sm md:text-base text-white/80">
                ता. आटपाडी जि. सांगली
              </span>
            </div>
          </div>

          <div className="relative w-full">
            <button
              id="navbar-toggle"
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 absolute right-4 top-1/2 -translate-y-1/2 z-50"
              onClick={() => {
                const menu = document.getElementById("navbar-menu");
                const toggle = document.getElementById("navbar-toggle");
                if (menu.classList.contains("hidden")) {
                  menu.classList.remove("hidden");
                  toggle.classList.add("hidden");
                }
              }}
              aria-label="Open menu"
            >
              <span className="block w-7 h-0.5 bg-white mb-1 rounded"></span>
              <span className="block w-7 h-0.5 bg-white mb-1 rounded"></span>
              <span className="block w-7 h-0.5 bg-white rounded"></span>
            </button>
            <div
              id="navbar-menu"
              className="hidden md:flex gap-8 text-base font-semibold items-center fixed md:static left-0 top-16 w-full bg-green-700 md:bg-transparent rounded-b shadow-2xl md:shadow-none p-6 md:p-0 z-50"
            >
              {/* Cross button for mobile nav */}
              <button
                className="absolute right-4 top-4 text-white text-2xl md:hidden"
                aria-label="Close menu"
                onClick={() => {
                  const menu = document.getElementById("navbar-menu");
                  const toggle = document.getElementById("navbar-toggle");
                  menu.classList.add("hidden");
                  toggle.classList.remove("hidden");
                }}
              >
                ×
              </button>
              <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-start md:justify-end gap-6 md:gap-8 mt-8 md:mt-0">
                <Link to="news-section" smooth duration={500} className="cursor-pointer text-gray-300 hover:text-green-300">बातम्या</Link>
                <Link to="devworks-section" smooth duration={500} className="cursor-pointer text-gray-300 hover:text-green-300">विकास कामे</Link>
                <Link to="exec-section" smooth duration={500} className="cursor-pointer text-gray-300 hover:text-green-300">कार्यकारिणी</Link>
                <button
                  className="cursor-pointer text-gray-300 hover:text-green-300 text-base font-semibold bg-transparent border-none p-0 m-0"
                  onClick={() => setQrModalOpen(true)}
                  style={{ fontWeight: "inherit" }}
                >
                  कर
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("adminToken");
                    window.location.href = "/login";
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow font-bold transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="pt-24 min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <section id="news-section" className="max-w-7xl mx-auto mb-12">
          <NewsUpload />
        </section>
        <section id="devworks-section" className="max-w-7xl mx-auto mb-12">
          <DevelopementWorkAdmin />
        </section>

        {/* EXEC BOARD */}
        <section id="exec-section" className="max-w-7xl mx-auto mb-12">
          {loading ? (
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
              {/* spinner only - no text message */}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-gray-50 p-10 rounded-2xl shadow-2xl space-y-12 border border-green-200"
            >
            <h2 className="text-3xl font-extrabold text-green-700 border-b pb-4 text-center">
              गाव कार्यकारिणी व्यवस्थापन
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Card
                title="सरपंच"
                data={sarpanch}
                onChange={(k, v) => setSarpanch(s => ({ ...s, [k]: v }))}
              />
              <Card
                title="उपसरपंच"
                data={upsarpanch}
                onChange={(k, v) => setUpsarpanch(s => ({ ...s, [k]: v }))}
              />
              {members.map(m => (
                <Card
                  key={m._id}
                  title="सदस्य"
                  data={m}
                  onChange={(k, v) => updateMember(m._id, k, v)}
                  allowRemove={members.length > 1}
                  onRemove={() => removeMember(m._id)}
                />
              ))}
            </div>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={addMember}
                className="bg-green-700 text-white px-4 py-2 rounded shadow"
              >
                नवीन सदस्य जोडा
              </button>
            </div>

            {/* Officers */}
            <h3 className="text-3xl font-bold mb-4 border-t pt-10 text-green-700 text-center">
              अधिकारी
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {officers.map(o => (
                <Card
                  key={o._id}
                  title={o.role}
                  data={o}
                  onChange={(k, v) => updateOfficer(o._id, k, v)}
                />
              ))}
            </div>
            {/* Save Button at the bottom */}
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                className={`bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded shadow w-full max-w-md text-xl ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
          )}
        </section>
      </main>

      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </>
  );
}
