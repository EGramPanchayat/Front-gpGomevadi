import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axioesInstance from "../utils/axioesInstance";
import { useSiteConfig } from "../utils/SiteConfigContext";
import jsPDF from "jspdf";
import { Search, Printer, Download, Check, X } from "lucide-react";

export default function QrPrintAdmin() {
  const { config } = useSiteConfig();
  const [families, setFamilies] = useState([]);
  const [filteredFamilies, setFilteredFamilies] = useState([]);
  const [selectedFamilies, setSelectedFamilies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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

  const generateQRCodeUrl = (family) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/qr-partial?familyId=${family.familyId}&token=${family.qrToken}`;
  };

  const generatePDF = async (familiesToPrint) => {
    setGenerating(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const cardWidth = pageWidth - 2 * margin;
      const cardHeight = 50;
      const cardGap = 10;
      const cardsPerPage = Math.floor((pageHeight - 2 * margin) / (cardHeight + cardGap));

      let currentPage = 0;
      let cardIndex = 0;

      for (const family of familiesToPrint) {
        if (cardIndex >= cardsPerPage) {
          pdf.addPage();
          currentPage++;
          cardIndex = 0;
        }

        const yPos = margin + cardIndex * (cardHeight + cardGap);

        // Draw card border
        pdf.setDrawColor(0, 100, 0);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, "S");

        // Header background
        pdf.setFillColor(0, 100, 0);
        pdf.roundedRect(margin + 0.5, yPos + 0.5, cardWidth - 1, 12, 2, 2, "F");

        // Maharashtra Shasan
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("महाराष्ट्र शासन", pageWidth / 2, yPos + 5, { align: "center" });

        // Gram Panchayat
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.text(config?.gpName || "ग्रामपंचायत गोमेवाडी", pageWidth / 2, yPos + 9, { align: "center" });

        // Taluka and District
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        const talukaDist = `ता. ${config?.taluka || "आटपाडी"} | जि. ${config?.district || "सांगली"}`;
        pdf.text(talukaDist, pageWidth / 2, yPos + 16, { align: "center" });

        // Divider line
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.line(margin + 5, yPos + 18, pageWidth - margin - 5, yPos + 18);

        // QR Code on left
        const qrSize = 25;
        const qrX = margin + 8;
        const qrY = yPos + 22;
        
        // Draw QR code placeholder (in production, you'd use a QR code library)
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.2);
        pdf.rect(qrX, qrY, qrSize, qrSize);
        pdf.setFontSize(6);
        pdf.setTextColor(100, 100, 100);
        pdf.text("QR Code", qrX + qrSize / 2, qrY + qrSize / 2, { align: "center" });

        // Family details on right
        const detailsX = qrX + qrSize + 8;
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text(`नाव: ${family.mainMemberName}`, detailsX, qrY + 5);
        
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        const familySize = (family.menCount || 0) + (family.womenCount || 0) + (family.seniorCount || 0) + (family.childrenCount || 0);
        pdf.text(`सदस्य: ${familySize}`, detailsX, qrY + 11);
        pdf.text(`कुटुंब ID: ${family.familyId}`, detailsX, qrY + 17);
        pdf.text(`घर क्रमांक: ${family.houseNumber}`, detailsX, qrY + 23);

        cardIndex++;
      }

      pdf.save(`qr-codes-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF generated successfully!");
    } catch (err) {
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
      <div className="bg-gradient-to-r from-green-900 to-emerald-800 rounded-3xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-black">QR कोड प्रिंट</h2>
        <p className="text-green-100 mt-1">कुटुंब QR कोड प्रिंट करा आणि PDF डाउनलोड करा</p>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="कुटुंब नाव, ID किंवा घर क्रमांक शोधा..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={selectAll}
              className="flex-1 md:flex-none px-4 py-3 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              सर्व निवडा
            </button>
            <button
              onClick={deselectAll}
              className="flex-1 md:flex-none px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              निवड रद्द करा
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handlePrintAll}
            disabled={generating}
            className="flex-1 md:flex-none px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            सर्व प्रिंट करा ({filteredFamilies.length})
          </button>
          <button
            onClick={handlePrintSelected}
            disabled={generating || selectedFamilies.length === 0}
            className="flex-1 md:flex-none px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            निवडलेले प्रिंट करा ({selectedFamilies.length})
          </button>
        </div>
      </div>

      {/* Family List */}
      <div className="bg-white rounded-2xl shadow-md border border-green-100 overflow-hidden">
        <div className="p-4 bg-green-50 border-b border-green-100">
          <h3 className="font-bold text-green-800">
            कुटुंब सूची ({filteredFamilies.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {filteredFamilies.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              कोणतेही कुटुंब सापडले नाहीत
            </div>
          ) : (
            filteredFamilies.map((family) => (
              <div
                key={family._id}
                className="p-4 hover:bg-gray-50 transition flex items-center gap-4"
              >
                <input
                  type="checkbox"
                  checked={selectedFamilies.includes(family._id)}
                  onChange={() => toggleFamilySelection(family._id)}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{family.mainMemberName}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {family.familyId}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    घर क्रमांक: {family.houseNumber} | सदस्य:{" "}
                    {(family.menCount || 0) +
                      (family.womenCount || 0) +
                      (family.seniorCount || 0) +
                      (family.childrenCount || 0)}
                  </div>
                </div>
                <button
                  onClick={() => generatePDF([family])}
                  disabled={generating}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition disabled:opacity-50 flex items-center gap-1 text-sm font-medium"
                >
                  <Printer className="w-4 h-4" />
                  प्रिंट
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </div>
  );
}
