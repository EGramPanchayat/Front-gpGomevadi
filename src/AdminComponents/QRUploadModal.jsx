import React, { useState, useEffect } from "react";
import axioesInstance from "../utils/axioesInstance";

const QRUploadModal = ({ open, onClose }) => {
  const [panipattiQR, setPanipattiQR] = useState(null);
  const [gharPattiQR, setGharPattiQR] = useState(null);
  const [paymentQR, setPaymentQR] = useState(null);
  const [existingPanipatti, setExistingPanipatti] = useState(null);
  const [existingGharPatti, setExistingGharPatti] = useState(null);
  const [existingPaymentQR, setExistingPaymentQR] = useState(null);
  const [previewPanipatti, setPreviewPanipatti] = useState(null);
  const [previewGharPatti, setPreviewGharPatti] = useState(null);
  const [previewPaymentQR, setPreviewPaymentQR] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (setter) => (e) => {
    const f = e.target.files[0] || null;
    setter(f);
    if (f) {
      const url = URL.createObjectURL(f);
      if (setter === setPanipattiQR) setPreviewPanipatti(url);
      if (setter === setGharPattiQR) setPreviewGharPatti(url);
      if (setter === setPaymentQR) setPreviewPaymentQR(url);
    } else {
      if (setter === setPanipattiQR) setPreviewPanipatti(null);
      if (setter === setGharPattiQR) setPreviewGharPatti(null);
      if (setter === setPaymentQR) setPreviewPaymentQR(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!panipattiQR && !gharPattiQR && !paymentQR) return;
    setLoading(true);
    const fd = new FormData();
    if (panipattiQR) fd.append("panipattiQR", panipattiQR);
    if (gharPattiQR) fd.append("gharPattiQR", gharPattiQR);
    if (paymentQR) fd.append("paymentQR", paymentQR);
    try {
      await axioesInstance.post("/upload-qr", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      try {
        const { data: refreshed } = await axioesInstance.get("/qr");
        setExistingPanipatti(refreshed?.panipattiQR?.url || null);
        setExistingGharPatti(refreshed?.gharPattiQR?.url || null);
        setExistingPaymentQR(refreshed?.paymentQR?.url || null);
      } catch {}
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await axioesInstance.get("/qr");
        if (!mounted) return;
        setExistingPanipatti(data?.panipattiQR?.url || null);
        setExistingGharPatti(data?.gharPattiQR?.url || null);
        setExistingPaymentQR(data?.paymentQR?.url || null);
      } catch {}
    })();
    return () => {
      mounted = false;
      if (previewPanipatti) URL.revokeObjectURL(previewPanipatti);
      if (previewGharPatti) URL.revokeObjectURL(previewGharPatti);
      if (previewPaymentQR) URL.revokeObjectURL(previewPaymentQR);
      setPreviewPanipatti(null);
      setPreviewGharPatti(null);
      setPreviewPaymentQR(null);
    };
  }, [open]);

  if (!open) return null;

  const qrFields = [
    { label: "Panipatti QR", preview: previewPanipatti, existing: existingPanipatti, setter: setPanipattiQR },
    { label: "GharPatti QR", preview: previewGharPatti, existing: existingGharPatti, setter: setGharPattiQR },
    { label: "Dakhala payment", preview: previewPaymentQR, existing: existingPaymentQR, setter: setPaymentQR },
  ];

  return (
    <div className="fixed inset-0 z-95 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-[360px] md:w-full md:max-w-5xl p-4 relative my-5">
        {/* Close button */}
        <button
          className="absolute -top-0.5 -right-0.5 bg-white rounded-full shadow-md w-8 h-8 flex items-center justify-center text-red-600 font-bold hover:bg-red-100 z-50"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 className="text-lg font-bold text-green-700 mb-2 md:mb-6 pb-2 text-center border-b-2 border-orange-300">
          Upload QR Codes
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-4">
            {qrFields.map(({ label, preview, existing, setter }) => (
              <div
                key={label}
                className="flex-1 bg-green-900 rounded-xl p-3 flex flex-col items-center text-center text-white gap-2"
              >
                <h2 className="bg-green-700 text-white font-bold mb-2 py-1 px-4 rounded-3xl text-center text-sm">
                  {label}
                </h2>

                {/* Responsive height: mobile = h-16, laptop/md+ = h-24 */}
                <div className="h-16 md:h-24 w-full bg-green-900 rounded flex items-center justify-center">
                  {preview ? (
                    <img src={preview} alt="preview" className="h-full w-auto object-contain" />
                  ) : existing ? (
                    <img src={existing} alt="existing" className="h-full w-auto object-contain" />
                  ) : (
                    <div className="text-gray-200 text-xs md:text-sm">No QR uploaded</div>
                  )}
                </div>

                <label className="mt-1 bg-white text-orange-500 font-semibold px-3 py-1 rounded cursor-pointer text-xs md:text-sm w-full text-center">
                  QR निवडा
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange(setter)}
                    className="hidden"
                  />
                </label>

                {/* preview removal disabled per request */}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-green-700 text-white px-4 py-2 rounded shadow w-full font-bold"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QRUploadModal;
