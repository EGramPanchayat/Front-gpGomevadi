import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axioesInstance';

// ✅ Modal Component
function DakhalaModal({ open, onClose, data, onDelete, deleting }) {
  if (!open || !data) return null;
  const safe = (v) => (v === undefined || v === null ? '' : v);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const type = safe(data.type);

  const renderTypeFields = () => {
    switch (type) {
      case 'जन्म नोंद':
        return (
          <>
            <p><span className="font-semibold">बाळाचे नाव:</span> {safe(data.childName)}</p>
            <p><span className="font-semibold">जन्म तारीख:</span> {formatDate(data.dob)}</p>
          </>
        );
      case 'मृत्यू नोंद':
        return (
          <>
            <p><span className="font-semibold">मृत व्यक्तीचे नाव:</span> {safe(data.deathName)}</p>
            <p><span className="font-semibold">मृत्यूची तारीख:</span> {formatDate(data.deathDate)}</p>
          </>
        );
      case 'विवाह नोंदणी दाखला':
        return (
          <>
            <p><span className="font-semibold">दांपत्याचे नाव:</span> {safe(data.coupleName)}</p>
            <p><span className="font-semibold">विवाह वर्ष:</span> {safe(data.marriageYear)}</p>
          </>
        );
      case '८ अ उतारा':
        return (
          <>
            <p><span className="font-semibold">मिळकत नंबर:</span> {safe(data.propertyNo)}</p>
            <p><span className="font-semibold">या व्यक्तीच्या नावाने दाखला पाहिजे आहे:</span> {safe(data.certificateName)}</p>
          </>
        );
      case 'निराधार असल्याचा दाखला मागणी':
        return <p><span className="font-semibold">निराधाराचे नाव:</span> {safe(data.niradharName)}</p>;
      case 'दारिद्र्य रेषेखाली असल्याचा दाखला':
      case 'ग्रामपंचायत येणे बाकी दाखला':
        return (
          <p><span className="font-semibold">या व्यक्तीच्या नावाने दाखला पाहिजे आहे:</span> {safe(data.certificateName)}</p>
        );
      default:
        return <p>माहिती उपलब्ध नाही.</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-6">
      <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-lg relative overflow-y-auto max-h-[90vh] transition-all">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-600 font-bold text-xl"
        >
          ×
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold text-green-700 mb-1 text-left">
          {safe(type)}
        </h2>
        <div className="w-24 h-[3px] bg-orange-500 mb-4 rounded-full"></div>

        {/* Modal content */}
        <div className="space-y-2 text-gray-700 text-[15px] leading-relaxed break-words whitespace-normal">
          <p><span className="font-semibold">अर्जदाराचे नाव:</span> {safe(data.forName)}</p>
          <p><span className="font-semibold">WhatsApp No:</span> {safe(data.whatsappNo)}</p>
          <p><span className="font-semibold">ईमेल:</span> {safe(data.email)}</p>

          {renderTypeFields()}

          {/* Image Section */}
          {type !== 'दारिद्र्य रेषेखाली असल्याचा दाखला' && type !== 'नीराधार असल्याचा दाखला' && (
            <div className="mt-3">
              <p className="font-semibold mb-1">Payment Screenshot:</p>
              <div className="flex justify-center">
                <div className="w-full max-w-md h-[250px] bg-gray-100 border border-gray-300 rounded-xl shadow-inner flex items-center justify-center overflow-hidden">
                  {data.paymentImg?.url ? (
                    <img
                      src={safe(data.paymentImg.url)}
                      alt="Payment Screenshot"
                      className="block mx-auto max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No image uploaded</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submission time */}
          {data.createdAt && (
            <p className="text-sm text-gray-500 mt-3">
              <span className="font-semibold text-gray-700">Submitted on:</span> {formatDate(data.createdAt)}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-5 gap-2 border-t pt-3">
          <button
            disabled={deleting}
            onClick={() => onDelete(data._id)}
            className={`px-4 py-1.5 rounded-lg font-semibold transition-all text-white ${
              deleting
                ? 'bg-red-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>

          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1.5 rounded-lg font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ Main Component
export default function DakhalaSubmissions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/dakhala');
      setSubs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/dakhala/${id}`);
      setSubs((s) => s.filter((x) => x._id !== id));
      setModalOpen(false);
      setModalData(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="bg-white p-4 rounded shadow text-center">
        Loading submissions...
      </div>
    );

  const validSubs = Array.isArray(subs)
    ? subs.filter((s) => s && typeof s === 'object')
    : [];

  return (
    <div className="w-full bg-white py-6 px-4 rounded-3xl shadow-2xl">
      <h1 className="text-2xl font-bold text-green-700 mb-4 border-b pb-2">
        दाखले मागणी अर्ज
      </h1>

      {validSubs.length === 0 ? (
        <p className="text-gray-600 text-left">No submissions yet.</p>
      ) : (
        <div className="flex flex-col gap-3 w-full">
          {validSubs.map((sub, index) => (
            <div
              key={sub._id}
              onClick={() => {
                setModalData(sub);
                setModalOpen(true);
              }}
              className="w-full cursor-pointer bg-gray-50 hover:bg-white rounded-xl shadow-md p-3 flex items-center gap-3 hover:shadow-lg hover:-translate-y-[2px] transition-all"
            >
              <div className="bg-green-600 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-800 break-words whitespace-normal">
                  {sub.forName || 'No Name'}
                </h3>
                <p className="text-sm text-gray-600 break-words whitespace-normal">
                  {sub.type || 'Unknown Type'}
                </p>
              </div>
              <span className="text-green-700 font-semibold text-sm">View →</span>
            </div>
          ))}
        </div>
      )}

      <DakhalaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={modalData}
        onDelete={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
