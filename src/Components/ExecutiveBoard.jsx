import React, { useEffect, useState } from "react";
import axioesInstance from "../utils/axioesInstance";

const ExecutiveBoard = () => {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axioesInstance
      .get("/exboard-karyakari-mandal")
      .then((res) => {
        setBoard(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false); // no error message, just stop loading
      });
  }, []);

  if (loading)
    return (
      <div className="w-full text-center py-10 flex flex-col items-center justify-center">
        <svg
          className="animate-spin -ml-1 mr-3 h-8 w-8 text-green-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        {/* spinner only - no text message */}
      </div>
    );

  if (!board)
    return <div className="w-full text-center py-10">डेटा उपलब्ध नाही.</div>;

  return (
    <>
      <section
        id="members"
        className="relative w-full pt-30 md:pt-30 pb-10 flex flex-col items-center bg-gray-50"
      >
        <div className="max-w-10xl w-full mx-auto">
          <h2 className="text-3xl md:text-[2.5rem] font-bold text-green-700 text-center mb-8 relative">
            कार्यकारी मंडळ
          </h2>

          {/* Sarpanch and Upsarpanch */}
          <div className="flex flex-col md:flex-row gap-8 mb-10 justify-center items-center">
            {/* Sarpanch Card */}
            <div className="flex flex-col items-center text-center bg-green-900 rounded-xl shadow-xl p-5 w-72 md:w-64 border-b-4 border-green-500 hover:translate-x-1 transition-transform duration-300 ease-in-out">
              <span className="bg-green-700 text-white text-s font-bold px-3 py-1 rounded-full mb-2">
                सरपंच
              </span>
              <img
                src={board.sarpanch?.image || "/images/profile.png"}
                alt={board.sarpanch?.name}
                className="w-24 h-24 rounded-full object-cover mb-3 mt-4"
              />
              <h6 className="text-base font-normal mb-1 text-white">
                {board.sarpanch?.name}
              </h6>
              <p className="text-green-200 text-sm mb-1 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline h-4 w-4 text-green-400 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h2.28a2 2 0 011.7 1.06l1.52 2.71a2 2 0 01-.45 2.45l-1.27 1.02a16.06 16.06 0 006.58 6.58l1.02-1.27a2 2 0 012.45-.45l2.71 1.52A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C9.16 23 3 16.84 3 9V8a2 2 0 012-2z"
                  />
                </svg>
                +91 {board.sarpanch?.mobile}
              </p>
            </div>

            {/* Upsarpanch Card */}
            <div className="flex flex-col items-center text-center bg-green-900 rounded-xl shadow-xl p-5 w-72 md:w-64 border-b-4 border-green-500 hover:translate-x-1 transition-transform duration-300 ease-in-out">
              <span className="bg-green-700 text-white text-s font-bold px-3 py-1 rounded-full mb-2">
                उपसरपंच
              </span>
              <img
                src={board.upsarpanch?.image || "/images/profile.png"}
                alt={board.upsarpanch?.name}
                className="w-24 h-24 rounded-full object-cover mb-3 mt-4"
              />
              <h6 className="text-base font-normal mb-1 text-white">
                {board.upsarpanch?.name}
              </h6>
              <p className="text-green-200 text-sm mb-1 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline h-4 w-4 text-green-400 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h2.28a2 2 0 011.7 1.06l1.52 2.71a2 2 0 01-.45 2.45l-1.27 1.02a16.06 16.06 0 006.58 6.58l1.02-1.27a2 2 0 012.45-.45l2.71 1.52A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C9.16 23 3 16.84 3 9V8a2 2 0 012-2z"
                  />
                </svg>
                +91 {board.upsarpanch?.mobile}
              </p>
            </div>
          </div>

          {/* Other members */}
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-x-15 gap-y-10">
              {board.members?.map((m, idx) => (
                <div
                  key={m._id || idx}
                  className="flex flex-col items-center text-center bg-white rounded-xl shadow-xl p-3 w-70 md:w-44 sm:w-48 border-1 border-orange-500 hover:translate-x-1 transition-transform duration-300 ease-in-out"
                >
                  <span className="text-green-700 text-[1.1rem] font-bold px-3 py-1 rounded-full mb-2">
                    सदस्य
                  </span>
                  <img
                    src={m.image || "/images/profile.png"}
                    alt={m.name}
                    className="w-24 h-24 rounded-full object-cover mb-3"
                  />
                  <h6 className="text-base font-normal mb-1">{m.name}</h6>
                  <p className="text-gray-700 text-sm mb-1 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline h-4 w-4 text-green-600 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h2.28a2 2 0 011.7 1.06l1.52 2.71a2 2 0 01-.45 2.45l-1.27 1.02a16.06 16.06 0 006.58 6.58l1.02-1.27a2 2 0 012.45-.45l2.71 1.52A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C9.16 23 3 16.84 3 9V8a2 2 0 012-2z"
                      />
                    </svg>
                    +91 {m.mobile}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Officials */}
      <section id="officials" className="py-10 pt-20 bg-blue-50">
        <div className="max-w-6xl mx-auto px-2">
          <h2 className="text-3xl md:text-[2.5rem] font-bold text-green-700 text-center mb-10 relative">
            कर्मचारी
            <span className="block w-24 h-1 bg-orange-400 rounded absolute left-1/2 -translate-x-1/2 -bottom-3"></span>
          </h2>

          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {board.staff?.officers?.length > 0 ? (
              <>
                {/* Officers with image */}
                {board.staff.officers
                  .filter(
                    (o) =>
                      ![
                        "पाणीपुरवठा कर्मचारी",
                        "लिपिक",
                        "शिपाई",
                        "डेटा ऑपरेटर",
                      ].includes(o.role)
                  )
                  .map((officer, idx) => (
                    <div
                      key={officer._id || idx}
                      className="flex flex-col items-center text-center bg-green-900 rounded-xl shadow-xl p-5 w-75 md:w-64 border-b-4 border-green-500 hover:translate-x-1 transition-transform duration-300 ease-in-out"
                    >
                      <span className="bg-green-700 text-white text-s font-bold px-3 py-1 rounded-full mb-2">
                        {officer.role}
                      </span>
                      <img
                        src={officer.image || "/images/profile.png"}
                        alt={officer.role}
                        className="w-24 h-24 rounded-full object-cover mb-3 mt-4"
                      />
                      <h6 className="text-base font-normal mb-1 text-white">
                        {officer.name}
                      </h6>
                      <p className="text-green-200 text-sm mb-1 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="inline h-4 w-4 text-green-400 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h2.28a2 2 0 011.7 1.06l1.52 2.71a2 2 0 01-.45 2.45l-1.27 1.02a16.06 16.06 0 006.58 6.58l1.02-1.27a2 2 0 012.45-.45l2.71 1.52A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C9.16 23 3 16.84 3 9V8a2 2 0 012-2z"
                          />
                        </svg>
                        +91 {officer.mobile}
                      </p>
                    </div>
                  ))}

                {/* Other staff */}
                <div className="flex flex-wrap justify-center gap-6 w-full mt-8">
                  {board.staff.officers
                    .filter((o) =>
                      [
                        "पाणीपुरवठा कर्मचारी",
                        "लिपिक",
                        "शिपाई",
                        "डेटा ऑपरेटर",
                      ].includes(o.role)
                    )
                    .map((officer, idx) => (
                      <div
                        key={officer._id || idx}
                        className="bg-white rounded-lg shadow w-75 md:w-64 flex flex-col items-center border border-green-700 overflow-hidden hover:translate-x-1 transition-transform duration-300 ease-in-out"
                      >
                        <div className="w-full bg-green-700 text-white text-center py-2 text-base font-semibold">
                          {officer.role}
                        </div>
                        <div className="p-4 flex flex-col items-center">
                          <h6 className="text-lg font-semibold mb-1">
                            {officer.name}
                          </h6>
                          <p className="text-gray-700 text-base mb-0 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="inline h-5 w-5 text-green-600 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h2.28a2 2 0 011.7 1.06l1.52 2.71a2 2 0 01-.45 2.45l-1.27 1.02a16.06 16.06 0 006.58 6.58l1.02-1.27a2 2 0 012.45-.45l2.71 1.52A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C9.16 23 3 16.84 3 9V8a2 2 0 012-2z"
                              />
                            </svg>
                            +91 {officer.mobile}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="w-full text-center py-10">
                कोणतेही कर्मचारी उपलब्ध नाहीत.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ExecutiveBoard;
