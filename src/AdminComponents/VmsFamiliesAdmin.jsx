import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axioesInstance from "../utils/axioesInstance";

export default function VmsFamiliesAdmin() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [familyId, setFamilyId] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [mainMemberName, setMainMemberName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [address, setAddress] = useState("");
  const [menCount, setMenCount] = useState(0);
  const [womenCount, setWomenCount] = useState(0);
  const [seniorCount, setSeniorCount] = useState(0);
  const [childrenCount, setChildrenCount] = useState(0);

  const [saving, setSaving] = useState(false);


  const fetchFamilies = () => {
    setLoading(true);
    axioesInstance
      .get("/admin/families")
      .then((res) => {
        setFamilies(res.data || []);
      })
      .catch(() => {
        toast.error("Failed to load family list");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!familyId || !houseNumber || !mainMemberName || !mobileNumber || !address) {
      return toast.error("Please fill all required fields");
    }

    setSaving(true);
    try {
      await axioesInstance.post("/admin/families", {
        familyId,
        houseNumber,
        mainMemberName,
        mobileNumber,
        whatsappNumber,
        address,
        menCount,
        womenCount,
        seniorCount,
        childrenCount,
      });
      toast.success("Family registered successfully!");
      // Reset form
      setFamilyId("");
      setHouseNumber("");
      setMainMemberName("");
      setMobileNumber("");
      setWhatsappNumber("");
      setAddress("");
      setMenCount(0);
      setWomenCount(0);
      setSeniorCount(0);
      setChildrenCount(0);
      fetchFamilies();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error during registration");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this family? All related taxes and applications may also be deleted.")) {
      return;
    }
    try {
      await axioesInstance.delete(`/admin/families/${id}`);
      toast.success("Family deleted successfully");
      fetchFamilies();
    } catch (err) {
      toast.error("Error while deleting");
    }
  };

  return (
    <div className="space-y-8">
      {/* ADD FAMILY CARD */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-100">
        <h3 className="text-xl font-bold text-green-700 mb-6 border-b pb-2">
          नवीन कुटुंब नोंदणी (Register Household)
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">कुटुंब आयडी (Unique Family ID) *</label>
            <input
              type="text"
              required
              placeholder="उदा. FM0001"
              value={familyId}
              onChange={(e) => setFamilyId(e.target.value)}
              className="border border-green-600 p-2.5 rounded-xl w-full text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">घर क्रमांक (House No.) *</label>
            <input
              type="text"
              required
              placeholder="उदा. H-102"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              className="border border-green-600 p-2.5 rounded-xl w-full text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">मुख्य सदस्याचे नाव (Head Name) *</label>
            <input
              type="text"
              required
              placeholder="उदा. सतीश मारुती शिंदे"
              value={mainMemberName}
              onChange={(e) => setMainMemberName(e.target.value)}
              className="border border-green-600 p-2.5 rounded-xl w-full text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">मोबाईल नंबर (OTP साठी) *</label>
            <input
              type="tel"
              required
              maxLength={10}
              placeholder="98XXXXXXXX"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
              className="border border-green-600 p-2.5 rounded-xl w-full text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">व्हॉट्सॲप मोबाईल नंबर</label>
            <input
              type="tel"
              maxLength={10}
              placeholder="98XXXXXXXX"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
              className="border border-green-600 p-2.5 rounded-xl w-full text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">पत्ता (Address) *</label>
            <input
              type="text"
              required
              placeholder="उदा. गोमेवाडी गल्ली क्र. ३"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border border-green-600 p-2.5 rounded-xl w-full text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">पुरुष संख्या</label>
              <input
                type="number"
                value={menCount}
                onChange={(e) => setMenCount(Number(e.target.value))}
                className="border border-green-600 p-2 rounded-xl w-full text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">महिला संख्या</label>
              <input
                type="number"
                value={womenCount}
                onChange={(e) => setWomenCount(Number(e.target.value))}
                className="border border-green-600 p-2 rounded-xl w-full text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ज्येष्ठ नागरिक</label>
              <input
                type="number"
                value={seniorCount}
                onChange={(e) => setSeniorCount(Number(e.target.value))}
                className="border border-green-600 p-2 rounded-xl w-full text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">बालके (0-18)</label>
              <input
                type="number"
                value={childrenCount}
                onChange={(e) => setChildrenCount(Number(e.target.value))}
                className="border border-green-600 p-2 rounded-xl w-full text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 px-4 rounded-xl shadow transition"
            >
              {saving ? "नोंदणी होत आहे..." : "कुटुंब नोंदवा / Save"}
            </button>
          </div>
        </form>
      </div>

      {/* FAMILIES LIST */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-100">
        <h3 className="text-xl font-bold text-green-700 mb-4 border-b pb-2">
          नोंदणीकृत कुटुंब यादी (Registered Families)
        </h3>

        {loading ? (
          <div className="text-center py-6">लोड होत आहे...</div>
        ) : families.length === 0 ? (
          <p className="text-center text-gray-500 py-6">अद्याप कोणतीही कुटुंबे नोंदवलेली नाहीत.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-green-50 text-green-800 font-bold border-b border-green-100">
                  <th className="p-4 rounded-l-xl">ID</th>
                  <th className="p-4">घर क्र.</th>
                  <th className="p-4">सदस्य नाव</th>
                  <th className="p-4">मोबाईल</th>
                  <th className="p-4">लोकसंख्या</th>
                  <th className="p-4 rounded-r-xl text-center">क्रिया</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {families.map((f) => (
                  <tr key={f._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-bold text-gray-700">{f.familyId}</td>
                    <td className="p-4 font-semibold text-gray-600">{f.houseNumber}</td>
                    <td className="p-4 text-gray-800 font-bold">{f.mainMemberName}</td>
                    <td className="p-4 font-mono text-gray-500">{f.mobileNumber}</td>
                    <td className="p-4 text-gray-600">
                      {f.menCount + f.womenCount + f.seniorCount + f.childrenCount}
                    </td>
                    <td className="p-4 flex gap-2 justify-center">

                      <button
                        onClick={() => handleDelete(f._id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow"
                      >
                        हटवा
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


    </div>
  );
}
