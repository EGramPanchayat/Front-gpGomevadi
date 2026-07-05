import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axioesInstance from "../utils/axioesInstance";
import { useSiteConfig } from "../utils/SiteConfigContext";
import jsPDF from "jspdf";
import { Search, Printer, Download, Check, X, Eye } from "lucide-react";

export default function QrPrintAdmin() {
  const { config } = useSiteConfig();
  const [families, setFamilies] = useState([]);
  const [filteredFamilies, setFilteredFamilies] = useState([]);
  const [selectedFamilies, setSelectedFamilies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [previewFamily, setPreviewFamily] = useState(null);

  useEffect(() => {
    fetchFamilies();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = families.filter(
        (family) =>
          family.mainMemberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          family.familyId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          family.houseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFamilies(filtered);
    } else {
      setFilteredFamilies(families);
    }
  }, [searchTerm, families]);

  // Set default preview family once list loads
  useEffect(() => {
    if (filteredFamilies.length > 0 && !previewFamily) {
      setPreviewFamily(filteredFamilies[0]);
    }
  }, [filteredFamilies, previewFamily]);

  const fetchFamilies = async () => {
    try {
      const res = await axioesInstance.get("/admin/families");
      setFamilies(res.data || []);
      setFilteredFamilies(res.data || []);
    } catch (err) {
      toast.error("Failed to load families");
    } finally {
      setLoading(false);
    }
  };

  const toggleFamilySelection = (familyId) => {
    setSelectedFamilies((prev) =>
      prev.includes(familyId)
        ? prev.filter((id) => id !== familyId)
        : [...prev, familyId]
    );
  };

  const selectAll = () => {
    setSelectedFamilies(filteredFamilies.map((f) => f._id));
  };

  const deselectAll = () => {
    setSelectedFamilies([]);
  };

  const drawCardOnCanvas = (family, config) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1800;
      canvas.height = 1100;
      const ctx = canvas.getContext("2d");

      const qrImg = new Image();
      const satyamevImg = new Image();

      let loadedCount = 0;
      const checkLoaded = () => {
        loadedCount++;
        if (loadedCount === 2) {
          renderEverything();
        }
      };

      qrImg.onload = checkLoaded;
      qrImg.onerror = () => {
        console.error("QR load failed");
        checkLoaded();
      };

      satyamevImg.onload = checkLoaded;
      satyamevImg.onerror = () => {
        console.error("Satyamev load failed");
        checkLoaded();
      };

      const loginUrl = `${window.location.origin}/qr-partial?familyId=${family.familyId}&token=${family.qrToken}`;
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(loginUrl)}`;
      qrImg.crossOrigin = "anonymous";

      satyamevImg.src = "/images/satyamev.jpg";

      const renderEverything = () => {
        // Draw background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw outer dark green border
        ctx.strokeStyle = "#14532d"; // Dark Green
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.roundRect(15, 15, 1770, 1070, 40);
        ctx.stroke();

        // Draw inner orange accent border
        ctx.strokeStyle = "#f97316"; // Orange
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(35, 35, 1730, 1030, 30);
        ctx.stroke();

        // Top rectangular plate (Dark Green background) - Height increased to 360px
        ctx.fillStyle = "#14532d";
        ctx.beginPath();
        ctx.roundRect(45, 45, 1710, 360, 20);
        ctx.fill();

        // 1. Maharashtra Shasan (Centered at Y = 105)
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "bold 44px sans-serif";
        ctx.fillText("महाराष्ट्र शासन", 900, 110);

        // 2. Satyamev Circle Logo (Centered at X = 900, Y = 205, Radius = 60px)
        ctx.save();
        ctx.beginPath();
        ctx.arc(900, 205, 60, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        try {
          ctx.drawImage(satyamevImg, 840, 145, 120, 120);
        } catch (e) {
          ctx.fillStyle = "#ffffff";
          ctx.fill();
        }
        ctx.restore();

        // Circle border
        ctx.strokeStyle = "#eab308"; // Gold
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(900, 205, 60, 0, Math.PI * 2);
        ctx.stroke();

        // 3. Grampanchayat Name (Centered at Y = 312)
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "bold 40px sans-serif";
        const gpName = config?.gpName || "ग्रामपंचायत गोमेवाडी";
        ctx.fillText(gpName, 900, 312);

        // 4. Taluka, District (Centered at Y = 365)
        ctx.fillStyle = "#ffedd5"; // Light orange
        ctx.font = "bold 28px sans-serif";
        const taluka = config?.taluka || "आटपाडी";
        const district = config?.district || "सांगली";
        ctx.fillText(`ता. ${taluka}, जि. ${district}`, 900, 365);

        // Draw white card for QR Code (shifted down slightly)
        ctx.fillStyle = "#f8fafc";
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(100, 435, 560, 600, 30);
        ctx.fill();
        ctx.stroke();

        // Draw QR Code image
        try {
          ctx.drawImage(qrImg, 150, 465, 460, 460);
        } catch (e) {
          ctx.fillStyle = "#fee2e2";
          ctx.fillRect(150, 465, 460, 460);
        }

        // Text below QR Code
        ctx.fillStyle = "#166534";
        ctx.font = "bold 30px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("लॉगिन करण्यासाठी स्कॅन करा", 380, 995);

        // Draw Right Details (aligned inline)
        ctx.textAlign = "left";
        const membersCount = (family.menCount || 0) + (family.womenCount || 0) + (family.seniorCount || 0) + (family.childrenCount || 0);

        let startY = 445;
        const stripHeight = 110;
        const stripWidth = 900;
        const lineGap = 138;

        const drawDataStrip = (label, value) => {
          // Draw card background strip
          ctx.fillStyle = "#fff7ed"; // Light orange background
          ctx.strokeStyle = "#ffedd5"; // Orange border outline
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(750, startY, stripWidth, stripHeight, 20);
          ctx.fill();
          ctx.stroke();

          // Draw label & value in bold orange
          ctx.fillStyle = "#ea580c"; // Orange text color
          ctx.font = "bold 42px sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(`${label}  ${value}`, 800, startY + (stripHeight / 2) + 14);
        };

        // Render strips
        drawDataStrip("कुटुंब ID:", family.familyId);
        startY += lineGap;
        drawDataStrip("कुटुंब प्रमुख:", family.mainMemberName || "—");
        startY += lineGap;
        drawDataStrip("सदस्य संख्या:", `${membersCount} सदस्य`);
        startY += lineGap;
        drawDataStrip("घर क्रमांक:", family.houseNumber || "—");

        resolve(canvas.toDataURL("image/png"));
      };
    });
  };

  const generatePDF = async (familiesToPrint) => {
    setGenerating(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      
      for (let i = 0; i < familiesToPrint.length; i++) {
        const family = familiesToPrint[i];
        const imgData = await drawCardOnCanvas(family, config);
        const cardIndexOnPage = i % 2;
        
        if (i > 0 && cardIndexOnPage === 0) {
          pdf.addPage();
        }
        
        const yPos = cardIndexOnPage === 0 ? 15 : 145;
        pdf.addImage(imgData, "PNG", 15, yPos, 180, 110);
      }
      
      pdf.save(`qr-codes-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrintAll = () => {
    if (filteredFamilies.length === 0) {
      return toast.error("No families to print");
    }
    generatePDF(filteredFamilies);
  };

  const handlePrintSelected = () => {
    const selected = filteredFamilies.filter((f) => selectedFamilies.includes(f._id));
    if (selected.length === 0) {
      return toast.error("No families selected");
    }
    generatePDF(selected);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-950 via-green-900 to-emerald-900 rounded-3xl p-6 shadow-xl text-white">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-600/20 rounded-full pointer-events-none z-0"></div>
        <div className="absolute -bottom-24 -left-16 w-56 h-56 bg-orange-500/20 rounded-full pointer-events-none z-0"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <span>🖨️</span> QR कोड प्रिंट केंद्र (QR Print Station)
            </h2>
            <p className="text-green-200 mt-1 text-xs font-semibold">
              गावातील कुटुंबांचे QR कोड प्लेट्स प्रिंट करा आणि PDF स्वरूपात डाउनलोड करा
            </p>
          </div>
          {/* Removed A4 Layout Badge */}
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Family list & controls (SaaS layout) */}
        <div className="lg:col-span-7 space-y-6 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6 space-y-4">
            
            {/* Search and select buttons */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                शोधा आणि फिल्टर करा
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="नाव, कुटुंब ID किंवा घर क्रमांक प्रविष्ट करा..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm font-semibold transition"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={selectAll}
                className="flex-1 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold hover:bg-green-100 transition text-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                सर्व निवडा
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition text-xs flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                निवड रद्द करा
              </button>
            </div>
            
            {/* Print action trigger area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrintAll}
                disabled={generating}
                className="w-full px-5 py-3.5 bg-green-700 hover:bg-green-800 text-white rounded-xl font-extrabold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 transform duration-150 text-xs"
              >
                <Printer className="w-4.5 h-4.5" />
                सर्व प्रिंट करा ({filteredFamilies.length})
              </button>
              <button
                type="button"
                onClick={handlePrintSelected}
                disabled={generating || selectedFamilies.length === 0}
                className="w-full px-5 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-extrabold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 transform duration-150 text-xs"
              >
                <Download className="w-4.5 h-4.5" />
                निवडलेले प्रिंट करा ({selectedFamilies.length})
              </button>
            </div>
          </div>

          {/* Families checklist panel */}
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-55 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-sm">
                कुटुंब सूची ({filteredFamilies.length})
              </h3>
              {selectedFamilies.length > 0 && (
                <span className="text-[10px] font-black bg-orange-105 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                  {selectedFamilies.length} निवडले
                </span>
              )}
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto custom-sass-scrollbar">
              {filteredFamilies.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm font-semibold">
                  कोणतेही कुटुंब सापडले नाही.
                </div>
              ) : (
                filteredFamilies.map((family) => (
                  <div
                    key={family._id}
                    className={`p-4 transition flex items-center gap-4 cursor-pointer select-none ${
                      previewFamily?._id === family._id ? "bg-green-50/50" : "hover:bg-slate-50/50"
                    }`}
                    onClick={() => setPreviewFamily(family)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFamilies.includes(family._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleFamilySelection(family._id);
                      }}
                      className="w-5 h-5 rounded border-slate-350 text-green-600 focus:ring-green-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-sm">{family.mainMemberName}</span>
                        <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                          {family.familyId}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-semibold mt-1">
                        घर क्रमांक: {family.houseNumber} | सदस्य: {(family.menCount || 0) + (family.womenCount || 0) + (family.seniorCount || 0) + (family.childrenCount || 0)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFamily(family);
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition text-[11px] font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        पहा
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          generatePDF([family]);
                        }}
                        className="px-2.5 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition text-[11px] font-bold flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        प्रिंट
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Live QR Plate Preview Mockup (Ultra SaaS design) */}
        <div className="lg:col-span-5 sticky top-6 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-150 p-6 space-y-6">
            <div className="border-b pb-3">
              <h3 className="font-black text-slate-800 text-sm tracking-tight flex items-center gap-2">
                <span className="text-orange-500">✨</span> कुटुंब QR प्लेट प्रिव्ह्यू (Live Card Preview)
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                प्रिटिंगसाठी कार्डचा लाईव्ह लेआउट असा दिसेल
              </p>
            </div>

            {previewFamily ? (
              <div className="relative border-4 border-green-900 rounded-3xl p-5 pb-8 bg-white shadow-lg space-y-4 max-w-sm mx-auto select-none">
                {/* Inner Orange outline */}
                <div className="absolute inset-1.5 border border-orange-500 rounded-2xl pointer-events-none" />

                                {/* Card header (vertical stack) */}
                <div className="relative bg-green-900 rounded-xl p-4 flex flex-col items-center text-center text-white space-y-2">
                  <h4 className="font-black text-xs leading-none">महाराष्ट्र शासन</h4>
                  {/* Satyamev Circle Logo */}
                  <div className="w-10 h-10 rounded-full border-2 border-yellow-400 bg-white flex items-center justify-center overflow-hidden shrink-0">
                    <img src="/images/satyamev.jpg" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <h5 className="font-black text-[11px] text-white/95 leading-none">
                    {config?.gpName || "ग्रामपंचायत गोमेवाडी"}
                  </h5>
                  <p className="text-[9px] text-orange-200 font-bold leading-none">
                    ता. {config?.taluka || "आटपाडी"}, जि. {config?.district || "सांगली"}
                  </p>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-12 gap-3 items-center pt-2 relative z-10">
                  {/* Left QR area */}
                  <div className="col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        `${window.location.origin}/qr-partial?familyId=${previewFamily.familyId}&token=${previewFamily.qrToken}`
                      )}`}
                      alt="Preview QR"
                      className="w-20 h-20 object-contain p-1 bg-white border border-slate-100 rounded-lg shadow-sm"
                    />
                    <span className="text-[7px] font-black text-green-700 mt-2 block text-center leading-none">
                      लॉगिनसाठी स्कॅन करा
                    </span>
                  </div>

                                    {/* Right Details badges */}
                  <div className="col-span-7 space-y-2.5">
                    {/* Family ID badge */}
                    <div className="flex items-center bg-orange-50 border border-orange-200 px-3.5 py-2.5 rounded-2xl text-orange-700 font-black text-sm">
                      <span>कुटुंब ID: &nbsp;</span>
                      <span className="ml-1">{previewFamily.familyId}</span>
                    </div>

                    {/* Main Member name */}
                    <div className="flex items-center bg-orange-50 border border-orange-200 px-3.5 py-2.5 rounded-2xl text-orange-700 font-black text-sm">
                      <span>कुटुंब प्रमुख: &nbsp;</span>
                      <span className="ml-1 truncate max-w-[130px]">{previewFamily.mainMemberName || "—"}</span>
                    </div>

                    {/* Members Count */}
                    <div className="flex items-center bg-orange-50 border border-orange-200 px-3.5 py-2.5 rounded-2xl text-orange-700 font-black text-sm">
                      <span>सदस्य संख्या: &nbsp;</span>
                      <span className="ml-1">
                        {(previewFamily.menCount || 0) + (previewFamily.womenCount || 0) + (previewFamily.seniorCount || 0) + (previewFamily.childrenCount || 0)} सदस्य
                      </span>
                    </div>

                    {/* House Number */}
                    <div className="flex items-center bg-orange-50 border border-orange-200 px-3.5 py-2.5 rounded-2xl text-orange-700 font-black text-sm">
                      <span>घर क्रमांक: &nbsp;</span>
                      <span className="ml-1 truncate max-w-[130px]">{previewFamily.houseNumber || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>प्रिव्ह्यू लोड होत आहे...</span>
              </div>
            )}
          </div>
        </div>
        
      </div>

      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </div>
  );
}
