import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axioesInstance from "../utils/axioesInstance";

export default function VmsTaxesAdmin() {
  const [families, setFamilies] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Assign tax states
  const [taxType, setTaxType] = useState("house");
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Record payment states
  const [payAmount, setPayAmount] = useState("");
  const [selectedBillId, setSelectedBillId] = useState("");
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    axioesInstance
      .get("/admin/families")
      .then((res) => {
        setFamilies(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedFamilyId(res.data[0].familyId);
        }
      })
      .catch(() => {
        toast.error("कुटुंब यादी लोड करण्यात त्रुटी");
      });
  }, []);

  const fetchTaxes = (famId) => {
    if (!famId) return;
    setLoading(true);
    axioesInstance
      .get(`/taxes/${famId}`)
      .then((res) => {
        setBills(res.data.bills || []);
        setPayments(res.data.payments || []);
      })
      .catch(() => {
        toast.error("कर विवरण माहिती लोड करण्यात अपयश");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedFamilyId) {
      fetchTaxes(selectedFamilyId);
    }
  }, [selectedFamilyId]);

  const handleAssignTax = async (e) => {
    e.preventDefault();
    if (!selectedFamilyId || !taxType || !year || !amount) {
      return toast.error("कृपया सर्व आवश्यक रकाने भरा");
    }

    setAssigning(true);
    try {
      await axioesInstance.post("/admin/taxes/assign", {
        familyId: selectedFamilyId,
        taxType,
        year: Number(year),
        amount: Number(amount),
        dueDate: dueDate || undefined,
      });
      toast.success("कर यशस्वीरित्या लागू केला!");
      setAmount("");
      setDueDate("");
      fetchTaxes(selectedFamilyId);
    } catch (err) {
      toast.error(err.response?.data?.error || "कर लागू करताना त्रुटी");
    } finally {
      setAssigning(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedBillId || !payAmount) {
      return toast.error("कर प्रकार आणि जमा रक्कम प्रविष्ट करा");
    }

    setRecording(true);
    try {
      await axioesInstance.post("/admin/payments/offline", {
        billId: selectedBillId,
        amountPaid: Number(payAmount),
      });
      toast.success("भरणा नोंद यशस्वीरित्या जमा केली!");
      setPayAmount("");
      setSelectedBillId("");
      fetchTaxes(selectedFamilyId);
    } catch (err) {
      toast.error(err.response?.data?.error || "भरणा नोंदवताना त्रुटी");
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HOUSEHOLD SELECTION HEADER */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-green-700">कर व्यवस्थापन आणि संकलन (Taxes Ledger)</h3>
          <p className="text-sm text-gray-500">कुटुंब निवडून कर लागू करा किंवा पेमेंट नोंदवा</p>
        </div>
        <div className="w-full md:w-80">
          <label className="block text-xs font-bold text-gray-700 mb-1">कुटुंब निवडा (Select Family Head):</label>
          <select
            value={selectedFamilyId}
            onChange={(e) => setSelectedFamilyId(e.target.value)}
            className="border-2 border-green-600 p-2.5 rounded-xl w-full text-sm outline-none font-bold text-gray-800"
          >
            {families.map((f) => (
              <option key={f._id} value={f.familyId}>
                {f.familyId} - {f.mainMemberName} (घर क्र: {f.houseNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ASSIGN TAX FORM */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-100">
          <h4 className="text-lg font-bold text-green-700 mb-4 border-b pb-2">नवीन कर लागू करा (Assign Tax)</h4>
          <form onSubmit={handleAssignTax} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">कर प्रकार (Tax Type)</label>
                <select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value)}
                  className="border border-green-600 p-2 rounded-xl w-full text-sm outline-none"
                >
                  <option value="house">घरपट्टी / House Tax</option>
                  <option value="water">पाणीपट्टी / Water Tax</option>
                  <option value="health">आरोग्य कर / Health Tax</option>
                  <option value="electricity">वीज कर / Electricity Tax</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">आकारणी वर्ष (Year)</label>
                <input
                  type="number"
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="border border-green-600 p-2 rounded-xl w-full text-sm outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">कर रक्कम (Amount) *</label>
                <input
                  type="number"
                  required
                  placeholder="उदा. ५००"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border border-green-600 p-2 rounded-xl w-full text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">अंतिम तारीख (Due Date)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="border border-green-600 p-2 rounded-xl w-full text-sm outline-none text-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={assigning}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl shadow transition"
            >
              {assigning ? "लागू होत आहे..." : "कर लागू करा / Assign"}
            </button>
          </form>
        </div>

        {/* RECORD OFFLINE PAYMENT FORM */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-100">
          <h4 className="text-lg font-bold text-green-700 mb-4 border-b pb-2">रोख/ऑफलाईन भरणा नोंदवा (Cash Receipt)</h4>
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">थकीत कर निवडा (Select Unpaid Bill)</label>
              <select
                value={selectedBillId}
                onChange={(e) => setSelectedBillId(e.target.value)}
                className="border border-green-600 p-2.5 rounded-xl w-full text-sm outline-none text-gray-800"
              >
                <option value="">-- कर निवडा --</option>
                {bills
                  .filter((b) => b.status !== "paid")
                  .map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.taxType.toUpperCase()} ({b.year}) - थकीत: ₹{b.amount - b.paidAmount} (एकूण: ₹{b.amount})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">भरलेली रोख रक्कम (Amount Paid) *</label>
              <input
                type="number"
                required
                placeholder="उदा. ३००"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="border border-green-600 p-2.5 rounded-xl w-full text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={recording}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow transition"
            >
              {recording ? "नोंदणी होत आहे..." : "भरणा जमा करा / Record Cash"}
            </button>
          </form>
        </div>
      </div>

      {/* BILLS LEDGER TABLE */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-100">
        <h4 className="text-lg font-bold text-green-700 mb-4 border-b pb-2">चालू थकीत आणि भरलेले कर तपशील</h4>
        {loading ? (
          <div className="text-center py-6 text-gray-500">लोड होत आहे...</div>
        ) : bills.length === 0 ? (
          <p className="text-center text-gray-500 py-6">या कुटुंबासाठी कोणतेही कर नोंदवलेले नाहीत.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-green-50 text-green-800 font-bold border-b border-green-100">
                  <th className="p-4 rounded-l-xl">कर प्रकार</th>
                  <th className="p-4">आकारणी वर्ष</th>
                  <th className="p-4">एकूण रक्कम</th>
                  <th className="p-4">जमा रक्कम</th>
                  <th className="p-4">उर्वरित देय</th>
                  <th className="p-4 rounded-r-xl">स्थिती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bills.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 capitalize font-bold text-gray-700">{b.taxType} Tax</td>
                    <td className="p-4 font-semibold text-gray-600">{b.year}</td>
                    <td className="p-4 text-gray-800">₹{b.amount}</td>
                    <td className="p-4 text-green-600 font-bold">₹{b.paidAmount}</td>
                    <td className="p-4 text-red-600 font-bold">₹{b.amount - b.paidAmount}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        b.status === "paid" ? "bg-green-100 text-green-700" : b.status === "partial" ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-700"
                      }`}>
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAYMENT HISTORY LOG */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-100">
        <h4 className="text-lg font-bold text-green-700 mb-4 border-b pb-2">पेमेंट जमा इतिहास (Payment Transaction Log)</h4>
        {loading ? (
          <div className="text-center py-6 text-gray-500">लोड होत आहे...</div>
        ) : payments.length === 0 ? (
          <p className="text-gray-500 text-center py-6">अद्याप कोणताही व्यवहार झालेला नाही.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-green-50 text-green-800 font-bold border-b border-green-100">
                  <th className="p-4 rounded-l-xl">तारीख</th>
                  <th className="p-4">कर प्रकार</th>
                  <th className="p-4">भरलेली रक्कम</th>
                  <th className="p-4">भरणा पद्धती</th>
                  <th className="p-4 rounded-r-xl">व्यवहार आयडी</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 text-gray-600 font-medium">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td className="p-4 capitalize font-bold text-gray-700">{p.taxType} Tax</td>
                    <td className="p-4 font-bold text-green-600">₹{p.amountPaid}</td>
                    <td className="p-4">
                      <span className="uppercase text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-gray-400 break-all">{p.transactionId}</td>
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
