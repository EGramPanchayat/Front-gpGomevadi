import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axioesInstance from "../utils/axioesInstance";
import { useLanguage } from "../utils/LanguageContext";
import { getCertificateTypeName } from "../utils/translations";

const DETAILS_LABELS = {
  whatsappNo: { mr: "व्हॉट्सँप क्रमांक", en: "WhatsApp No" },
  email: { mr: "ईमेल", en: "Email" },
  transactionId: { mr: "व्यवहार ID", en: "Transaction ID" },
  dob: { mr: "जन्म तारीख", en: "Date of Birth" },
  childName: { mr: "बालकाचे नाव", en: "Child Name" },
  deathName: { mr: "मयत व्यक्तीचे नाव", en: "Deceased Name" },
  deathDate: { mr: "मृत्यू तारीख", en: "Death Date" },
  coupleName: { mr: "पती-पत्नीचे नाव", en: "Couple Name" },
  marriageYear: { mr: "लग्नाचे वर्ष", en: "Marriage Year" },
  propertyNo: { mr: "मालमत्ता क्रमांक", en: "Property / Tax ID No" },
  certificateName: { mr: "दाखला नाव", en: "Certificate Name" },
  niradharName: { mr: "निराधार व्यक्तीचे नाव", en: "Destitute Name" },
};

export default function VmsApplicationsAdmin() {
  const { lang } = useLanguage();
  const detailLabel = (key) => DETAILS_LABELS[key]?.[lang] || DETAILS_LABELS[key]?.mr || key;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab, applications]);

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
        toast.error("Failed to load applications list");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const [pdfFile, setPdfFile] = useState(null);

  const handleOpenDetails = (app) => {
    setSelectedApp(app);
    setStatus(app.status);
    setRemark(app.remark || "");
    setDocumentUrl(app.documentUrl || "");
    setPdfFile(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("status", status);
      formData.append("remark", remark);
      if (pdfFile) {
        formData.append("pdfFile", pdfFile);
      } else {
        formData.append("documentUrl", documentUrl);
      }

      await axioesInstance.post(`/admin/applications/${selectedApp._id}/status`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Application details updated!");
      setSelectedApp(null);
      setPdfFile(null);
      fetchApplications();
    } catch (err) {
      toast.error("Error while updating");
    } finally {
      setUpdating(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (activeSubTab === "pending") {
      return app.status === "pending" || app.status === "need_documents";
    }
    return app.status === "completed";
  });

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden bg-green-900 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-600/30 rounded-full pointer-events-none z-0"></div>
        <div className="absolute -bottom-24 -left-16 w-56 h-56 bg-orange-500/30 rounded-full pointer-events-none z-0"></div>
        <div className="absolute top-1/2 left-[60%] w-16 h-16 bg-yellow-400/30 rounded-full -translate-y-1/2 pointer-events-none z-0"></div>

        <div className="relative z-10">
          <h2 className="text-2xl font-black text-white drop-shadow-md">
            {lang === "mr" ? "दाखले मागणी अर्ज" : "Certificate Requests"}
          </h2>
          <p className="text-sm text-green-100 font-semibold mt-1">
            {lang === "mr" ? "ग्रामपंचायत दाखले अर्ज, पडताळणी, रिमार्क आणि मंजुरी व्यवस्थापन पॅनेल" : "Gram Panchayat Certificate Requests, Verification, Remarks & Approval Panel"}
          </p>
        </div>

        {/* TAB CONTROLS */}
        <div className="relative z-10 flex bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab("pending")}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
              activeSubTab === "pending"
                ? "bg-green-700 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>{lang === "mr" ? "प्रलंबित अर्ज" : "Pending"}</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
              activeSubTab === "pending" ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"
            }`}>
              {applications.filter(a => a.status !== "completed").length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("completed")}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
              activeSubTab === "completed"
                ? "bg-green-700 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>{lang === "mr" ? "पूर्ण झालेले अर्ज" : "Completed"}</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
              activeSubTab === "completed" ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"
            }`}>
              {applications.filter(a => a.status === "completed").length}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* APPLICATIONS LIST TABLE (2/3 width) */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xl border border-green-100">
        <h3 className="text-xl font-bold text-green-700 mb-4 border-b pb-2">
          {lang === "mr" ? "अर्ज यादी" : "Certificate Request Queue"}
        </h3>

        {loading ? (
          <div className="text-center py-6 text-gray-500">लोड होत आहे...</div>
        ) : filteredApps.length === 0 ? (
          <p className="text-center text-gray-500 py-6">
            {activeSubTab === "pending"
              ? (lang === "mr" ? "सध्या कोणताही प्रलंबित अर्ज नाही." : "No pending applications.")
              : (lang === "mr" ? "सध्या कोणताही पूर्ण झालेला अर्ज नाही." : "No completed applications.")}
          </p>
        ) : (
            (() => {
              const itemsPerPage = 10;
              const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              const paginatedApps = filteredApps.slice(startIndex, startIndex + itemsPerPage);

              return (
                <>
                  {/* DESKTOP VIEW */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-green-50 text-green-800 font-bold border-b border-green-100">
                          <th className="p-4 rounded-l-xl">{lang === "mr" ? "नाव व घर ID" : "Name & House ID"}</th>
                          <th className="p-4">{lang === "mr" ? "दाखला प्रकार" : "Certificate Type"}</th>
                          <th className="p-4">{lang === "mr" ? "अर्ज तारीख" : "Application Date"}</th>
                          {activeSubTab === "completed" && <th className="p-4">{lang === "mr" ? "पूर्ण वेळ" : "Completed At"}</th>}
                          <th className="p-4">{lang === "mr" ? "स्थिती" : "Status"}</th>
                          <th className="p-4 rounded-r-xl text-center">{lang === "mr" ? "कृती" : "Action"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {paginatedApps.map((app) => (
                          <tr key={app._id} className="hover:bg-gray-50/50 transition">
                            <td className="p-4">
                              <p className="font-bold text-gray-800">{app.applicantName}</p>
                              <span className="text-[10px] text-gray-400 font-mono">ID: {app.familyId}</span>
                            </td>
                            <td className="p-4 capitalize font-bold text-gray-700">
                              {getCertificateTypeName(app.type, lang)}
                            </td>
                            <td className="p-4 text-gray-500">{new Date(app.createdAt).toLocaleDateString("en-US")}</td>
                            {activeSubTab === "completed" && (
                              <td className="p-4 text-gray-500 font-medium">
                                {new Date(app.completedAt || app.updatedAt).toLocaleString("en-US", {
                                  day: "numeric",
                                  month: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true
                                })}
                              </td>
                            )}
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
                                {lang === "mr" ? "पुनरावलोकन" : "Review"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE VIEW CARD LIST */}
                  <div className="block md:hidden space-y-4">
                    {paginatedApps.map((app) => (
                      <div
                        key={app._id}
                        className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-3 ${
                          selectedApp?._id === app._id ? "border-green-700 ring-1 ring-green-700" : "border-slate-100"
                        }`}
                      >
                        {/* Header: Type and Status */}
                        <div className="flex justify-between items-center">
                          <span className="capitalize font-bold text-gray-700 text-xs">
                            {getCertificateTypeName(app.type, lang)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            app.status === "completed" 
                              ? "bg-green-100 text-green-700" 
                              : app.status === "need_documents" 
                              ? "bg-red-100 text-red-650" 
                              : "bg-orange-100 text-orange-650"
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        {/* Applicant details */}
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{app.applicantName}</p>
                            <span className="text-[10px] text-gray-400 font-mono">ID: {app.familyId}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold mt-1">
                            {new Date(app.createdAt).toLocaleDateString(lang === "mr" ? "mr-IN" : "en-IN")}
                          </span>
                        </div>

                        {/* Action row */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          {activeSubTab === "completed" && (
                            <span className="text-[10px] text-gray-400">
                              {lang === "mr" ? "पूर्ण वेळ:" : "Completed:"} {new Date(app.completedAt || app.updatedAt).toLocaleDateString(lang === "mr" ? "mr-IN" : "en-IN")}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(app)}
                            className="bg-green-700 hover:bg-green-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow flex items-center gap-1.5 ml-auto"
                          >
                            🔍 {lang === "mr" ? "पुनरावलोकन" : "Review"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* PAGINATION CONTROLS */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500 font-bold">
                        {lang === "mr" 
                          ? `एकूण ${filteredApps.length} पैकी ${startIndex + 1} ते ${Math.min(startIndex + itemsPerPage, filteredApps.length)} अर्ज दर्शवत आहे` 
                          : `Showing ${startIndex + 1} to ${Math.min(startIndex + itemsPerPage, filteredApps.length)} of ${filteredApps.length} requests`}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          className="px-3.5 py-2 rounded-xl text-xs font-extrabold border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {lang === "mr" ? "← पूर्वी" : "← Prev"}
                        </button>
                        <button
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          className="px-3.5 py-2 rounded-xl text-xs font-extrabold border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {lang === "mr" ? "पुढील →" : "Next →"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()
        )}
      </div>

      {/* APPLICATION DETAILS & REMARKS (1/3 width) */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-100">
        <h3 className="text-xl font-bold text-green-700 mb-4 border-b pb-2">
          {lang === "mr" ? "अर्ज पुनरावलोकन" : "Review Details"}
        </h3>
        
        {!selectedApp ? (
          <p className="text-gray-500 text-center py-12 text-sm">
            {lang === "mr" ? "तपशील आणि रिमार्क जोडण्यासाठी डाव्या बाजूने अर्ज निवडा." : "Select an application from the left to view details and add remarks."}
          </p>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-green-100 text-sm space-y-2">
              <p><strong>{lang === "mr" ? "अर्जदार:" : "Applicant:"}</strong> {selectedApp.applicantName}</p>
              <p className="capitalize"><strong>{lang === "mr" ? "प्रकार:" : "Type:"}</strong> {getCertificateTypeName(selectedApp.type, lang)}</p>
              
              {/* Render all submitted details */}
              {selectedApp.details && Object.keys(selectedApp.details).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                  <p className="font-extrabold text-green-700 text-xs mb-1">
                    {lang === "mr" ? "अर्ज माहिती:" : "Submitted Details:"}
                  </p>
                  {Object.entries(selectedApp.details).map(([key, val]) => {
                    if (!val) return null;
                    const label = detailLabel(key);
                    return (
                      <p key={key} className="bg-white p-2 rounded-xl border border-gray-100 text-xs">
                        <strong className="text-gray-600">{label}:</strong> <span className="font-semibold text-gray-800">{val}</span>
                      </p>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {lang === "mr" ? "अर्ज स्थिती" : "Status"}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-green-600 p-2 rounded-xl w-full text-sm outline-none font-bold"
              >
                <option value="pending">{lang === "mr" ? "प्रलंबित" : "Pending"}</option>
                <option value="completed">{lang === "mr" ? "पूर्ण झाले" : "Completed"}</option>
                <option value="need_documents">{lang === "mr" ? "कागदपत्रे अपूर्ण" : "Need Documents"}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {lang === "mr" ? "अधिकारी शेरा" : "Remarks / Queries"}
              </label>
              <textarea
                rows={3}
                placeholder={lang === "mr" ? "उदा. रहिवासी दाखल्यासाठी रेशन कार्डची प्रत सादर करा." : "e.g. Please submit ration card copy."}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="border border-green-600 p-2.5 rounded-xl w-full text-sm outline-none"
              />
            </div>

            {status === "completed" && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {lang === "mr" ? "दाखला पीडीएफ अपलोड करा" : "Upload Certificate PDF"}
                </label>
                <input
                  type="file"
                  key={selectedApp._id}
                  accept=".pdf,application/pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  className="border border-green-600 p-2 rounded-xl w-full text-sm outline-none bg-white font-semibold"
                />
                {selectedApp.documentUrl && !pdfFile && (
                  <p className="text-[11px] text-green-700 mt-1 font-bold">
                    ✓ {lang === "mr" ? "आधीच अपलोड केलेली फाइल:" : "Already uploaded file:"}{" "}
                    <a href={selectedApp.documentUrl} target="_blank" rel="noreferrer" className="underline">
                      {lang === "mr" ? "पहा" : "View"}
                    </a>
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updating}
                className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl text-sm transition"
              >
                {updating ? (lang === "mr" ? "जतन होत आहे..." : "Saving...") : (lang === "mr" ? "अद्यतनित करा" : "Update Status")}
              </button>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 rounded-xl text-sm transition"
              >
                {lang === "mr" ? "रद्द करा" : "Cancel"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    </div>
  );
}
