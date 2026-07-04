import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axioesInstance from "../utils/axioesInstance";

export default function VmsApplicationsAdmin() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  // Update states
  const [status, setStatus] = useState("pending");
  const [remark, setRemark] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchApplications = () => {
    setLoading(true);
    axioesInstance
      .get("/admin/applications")
      .then((res) => {
        setApplications(res.data || []);
      })
      .catch(() => {
        toast.error("अर्ज यादी लोड करताना त्रुटी आली");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleOpenDetails = (app) => {
    setSelectedApp(app);
    setStatus(app.status);
    setRemark(app.remark || "");
    setDocumentUrl(app.documentUrl || "");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdating(true);
    try {
      await axioesInstance.post(`/admin/applications/${selectedApp._id}/status`, {
        status,
        remark,
        documentUrl,
      });
      toast.success("अर्ज माहिती अद्ययावत केली!");
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      toast.error("अपडेट करताना त्रुटी आली");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* APPLICATIONS LIST TABLE (2/3 width) */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xl border border-green-100">
        <h3 className="text-xl font-bold text-green-700 mb-4 border-b pb-2">
          नागरिक दाखला अर्ज (VMS Certificate Requests)
        </h3>

        {loading ? (
          <div className="text-center py-6 text-gray-500">लोड होत आहे...</div>
        ) : applications.length === 0 ? (
          <p className="text-center text-gray-500 py-6">सध्या कोणताही अर्ज आलेला नाही.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-green-50 text-green-800 font-bold border-b border-green-100">
                  <th className="p-4 rounded-l-xl">नाव व घर ID</th>
                  <th className="p-4">दाखला प्रकार</th>
                  <th className="p-4">अर्ज तारीख</th>
                  <th className="p-4">स्थिती</th>
                  <th className="p-4 rounded-r-xl text-center">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{app.applicantName}</p>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {app.familyId}</span>
                    </td>
                    <td className="p-4 capitalize font-bold text-gray-700">
                      {app.type === "birth" ? "जन्म दाखला" : 
                       app.type === "death" ? "मृत्यू दाखला" : 
                       app.type === "income" ? "उत्पन्न दाखला" : 
                       app.type === "marriage" ? "विवाह दाखला" : 
                       "रहिवासी दाखला"}
                    </td>
                    <td className="p-4 text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        app.status === "completed" 
                          ? "bg-green-100 text-green-700" 
                          : app.status === "need_documents" 
                          ? "bg-red-100 text-red-600" 
                          : "bg-orange-100 text-orange-600"
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenDetails(app)}
                        className="bg-green-700 hover:bg-green-800 text-white font-bold px-3 py-1 rounded-xl text-xs shadow"
                      >
                        पहा / Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* APPLICATION DETAILS & REMARKS (1/3 width) */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-100">
        <h3 className="text-xl font-bold text-green-700 mb-4 border-b pb-2">अर्ज पुनरावलोकन (Review details)</h3>
        
        {!selectedApp ? (
          <p className="text-gray-500 text-center py-12 text-sm">तपशील आणि रिमार्क जोडण्यासाठी डाव्या बाजूने अर्ज निवडा.</p>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-green-100 text-sm space-y-2">
              <p><strong>अर्जदार:</strong> {selectedApp.applicantName}</p>
              <p className="capitalize"><strong>प्रकार:</strong> {selectedApp.type} Certificate</p>
              {selectedApp.details?.description && (
                <p className="mt-2 text-gray-600 bg-white p-2 rounded-xl border border-gray-100 font-medium">
                  <strong>सविस्तर माहिती:</strong> {selectedApp.details.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">अर्ज स्थिती (Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-green-600 p-2 rounded-xl w-full text-sm outline-none font-bold"
              >
                <option value="pending">प्रलंबित (Pending)</option>
                <option value="completed">पूर्ण झाले (Completed)</option>
                <option value="need_documents">कागदपत्रे अपूर्ण (Need Documents)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">अधिकारी रिमार्क (Remarks / Queries)</label>
              <textarea
                rows={3}
                placeholder="उदा. रहिवासी दाखल्यासाठी रेशन कार्डची प्रत सादर करा."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="border border-green-600 p-2.5 rounded-xl w-full text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">दाखला लिंक / URL (Certificate File URL)</label>
              <input
                type="text"
                placeholder="उदा. https://drive.google.com/..."
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                className="border border-green-600 p-2.5 rounded-xl w-full text-sm outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updating}
                className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl text-sm transition"
              >
                {updating ? "Saving..." : "Update Status"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 rounded-xl text-sm transition"
              >
                रद्द करा
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
