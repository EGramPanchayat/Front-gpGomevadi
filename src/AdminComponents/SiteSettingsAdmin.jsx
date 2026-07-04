import React, { useEffect, useState } from "react";
import axioesInstance from "../utils/axioesInstance";
import { toast } from "react-toastify";

export default function SiteSettingsAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [villageName, setVillageName] = useState("");
  const [gpName, setGpName] = useState("");
  const [taluka, setTaluka] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");

  // Stats
  const [area, setArea] = useState("");
  const [wards, setWards] = useState("");
  const [population, setPopulation] = useState("");
  const [families, setFamilies] = useState("");

  // Contact
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [officeHours, setOfficeHours] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axioesInstance.get("/site-config");
        setVillageName(data.villageName || "");
        setGpName(data.gpName || "");
        setTaluka(data.taluka || "");
        setDistrict(data.district || "");
        setPincode(data.pincode || "");

        // Assuming fixed order: 0: area, 1: wards, 2: population, 3: families
        if (data.stats && data.stats.length >= 4) {
          setArea(data.stats[0]?.number || "");
          setWards(data.stats[1]?.number || "");
          setPopulation(data.stats[2]?.number || "");
          setFamilies(data.stats[3]?.number || "");
        }

        if (data.contact) {
          setAddress(data.contact.address || "");
          setEmail(data.contact.email || "");
          setPhone(data.contact.phone || "");
          setOfficeHours(data.contact.officeHours || "");
        }
      } catch (err) {
        toast.error("Failed to load settings data!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      villageName,
      gpName,
      taluka,
      district,
      pincode,
      stats: [
        { icon: "🌾", number: area, label: "हेक्टर क्षेत्रफळ" },
        { icon: "🏘", number: wards, label: "वार्ड संख्या" },
        { icon: "👥", number: population, label: "एकूण लोकसंख्या" },
        { icon: "🏠", number: families, label: "कुटुंब संख्या" },
      ],
      contact: {
        address,
        email,
        phone,
        officeHours,
      }
    };

    try {
      await axioesInstance.post("/admin/site-config", payload);
      toast.success("Settings saved successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      toast.error(`Error: ${err.message}`);
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
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 sm:p-10 rounded-2xl shadow-2xl space-y-8 border border-green-200">
      <h2 className="text-2xl font-bold text-green-700 mb-4 border-b sm:pb-2 md:pb-4 text-center">
        गावाची सामान्य माहिती व्यवस्थापन
      </h2>

      {/* Grid 1: Basic Identity */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="font-bold text-lg text-green-700 border-b pb-2">१. गाव व ग्रामपंचायत नाव</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">गावचे नाव</label>
            <input
              type="text"
              value={villageName}
              onChange={(e) => setVillageName(e.target.value)}
              className="border border-green-600 p-2 rounded w-full font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">ग्रामपंचायत नाव</label>
            <input
              type="text"
              value={gpName}
              onChange={(e) => setGpName(e.target.value)}
              className="border border-green-600 p-2 rounded w-full font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">तालुका</label>
            <input
              type="text"
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
              className="border border-green-600 p-2 rounded w-full font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">जिल्हा</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="border border-green-600 p-2 rounded w-full font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">पिनकोड</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="border border-green-600 p-2 rounded w-full font-medium"
            />
          </div>
        </div>
      </div>

      {/* Grid 2: Stats */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="font-bold text-lg text-green-700 border-b pb-2">२. सांख्यिकी माहिती (Stats)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">🌾 हेक्टर क्षेत्रफळ</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="border border-green-600 p-2 rounded w-full font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">🏘 वार्ड संख्या</label>
            <input
              type="text"
              value={wards}
              onChange={(e) => setWards(e.target.value)}
              className="border border-green-600 p-2 rounded w-full font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">👥 एकूण लोकसंख्या</label>
            <input
              type="text"
              value={population}
              onChange={(e) => setPopulation(e.target.value)}
              className="border border-green-600 p-2 rounded w-full font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">🏠 कुटुंब संख्या</label>
            <input
              type="text"
              value={families}
              onChange={(e) => setFamilies(e.target.value)}
              className="border border-green-600 p-2 rounded w-full font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Grid 3: Contact */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="font-bold text-lg text-green-700 border-b pb-2">३. संपर्क माहिती (Contact)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">पत्ता (Address)</label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border border-green-600 p-2 rounded w-full font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">ईमेल आयडी</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-green-600 p-2 rounded w-full font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">मोबाईल / संपर्क क्रमांक</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-green-600 p-2 rounded w-full font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">कार्यालयीन वेळ</label>
            <input
              type="text"
              value={officeHours}
              onChange={(e) => setOfficeHours(e.target.value)}
              className="border border-green-600 p-2 rounded w-full font-medium"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button
          type="submit"
          disabled={saving}
          className={`bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded shadow w-full max-w-md text-xl ${
            saving ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
