import React, { useEffect, useState } from "react";
import axioesInstance from "../utils/axioesInstance";
import { PiPhoneCallLight } from "react-icons/pi";

const ExecutiveBoard = () => {
  const [board, setBoard] = useState(null);

  useEffect(() => {
    axioesInstance
      .get("/exboard-karyakari-mandal")
      .then((res) => {
        if (res?.data) setBoard(res.data);
      })
      .catch(() => {
        setBoard(null);
      });
  }, []);

  // ✅ Hide completely if no data received
  if (
    !board ||
    (!board.sarpanch &&
      !board.upsarpanch &&
      (!board.members || board.members.length === 0) &&
      (!board.staff || !board.staff.officers?.length))
  ) {
    return null;
  }

  return (
    <>
      {/* कार्यकारी मंडळ Section */}
      {(board.sarpanch || board.upsarpanch || board.members?.length > 0) && (
        <section
          id="members"
          className="relative w-full pt-20 pb-10 flex flex-col items-center bg-gray-50"
        >
          <div className="max-w-7xl w-full mx-auto px-4">
            <h2 className="text-3xl md:text-[2.5rem] font-bold text-green-700 text-center mb-8 relative">
              कार्यकारी मंडळ
              <span className="block w-24 h-1 bg-orange-400 rounded absolute left-1/2 -translate-x-1/2 -bottom-3"></span>
            </h2>

            {/* Sarpanch & Upsarpanch */}
            <div className="flex flex-col md:flex-row gap-8 mb-10 justify-center items-center">
              {board.sarpanch && (
                <div className="flex flex-col items-center text-center bg-green-900 rounded-xl shadow-xl p-5 w-72 md:w-64 border-b-4 border-green-500 hover:translate-x-1 transition-transform duration-300 ease-in-out">
                  <span className="bg-green-700 text-white text-s font-bold px-3 py-1 rounded-full mb-2">
                    सरपंच
                  </span>
                  <img
                    src={board.sarpanch.image || "/images/profile.png"}
                    alt={board.sarpanch.name}
                    className="w-24 h-24 rounded-full object-cover mb-3 mt-4"
                  />
                  <h6 className="text-base font-normal mb-1 text-white">
                    {board.sarpanch.name}
                  </h6>
                  <p className="text-green-200 text-sm mb-1 flex items-center justify-center gap-1">
                    <PiPhoneCallLight className="text-green-300 text-lg" />
                    +91 {board.sarpanch.mobile}
                  </p>
                </div>
              )}

              {board.upsarpanch && (
                <div className="flex flex-col items-center text-center bg-green-900 rounded-xl shadow-xl p-5 w-72 md:w-64 border-b-4 border-green-500 hover:translate-x-1 transition-transform duration-300 ease-in-out">
                  <span className="bg-green-700 text-white text-s font-bold px-3 py-1 rounded-full mb-2">
                    उपसरपंच
                  </span>
                  <img
                    src={board.upsarpanch.image || "/images/profile.png"}
                    alt={board.upsarpanch.name}
                    className="w-24 h-24 rounded-full object-cover mb-3 mt-4"
                  />
                  <h6 className="text-base font-normal mb-1 text-white">
                    {board.upsarpanch.name}
                  </h6>
                  <p className="text-green-200 text-sm mb-1 flex items-center justify-center gap-1">
                    <PiPhoneCallLight className="text-green-300 text-lg" />
                    +91 {board.upsarpanch.mobile}
                  </p>
                </div>
              )}
            </div>

            {/* Members */}
    
            {board.members?.length > 0 && (
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-6">
                {board.members.map((m, idx) => (
                  <div
                    key={m._id || idx}
                    className="flex flex-col items-center text-center bg-white rounded-xl shadow-md overflow-hidden 
                              w-[285px] md:w-[256px] lg:w-[192px] h-[200px]  
                              hover:shadow-2xl transition-all duration-300 ease-in-out"
                  >
                    <div className="w-full bg-green-700 text-white text-center py-1.5 text-xs font-semibold tracking-wide">
                      {m.role || "सदस्य"}
                    </div>

                    <div className="pt-3 pb-2 flex flex-col items-center justify-between flex-grow">
                      <img
                        src={m.image || "/images/profile.png"}
                        alt={m.name}
                        className="w-19 h-19 rounded-full object-cover"
                      />
                      <h6 className="text-sm font-medium font-semibold">
                        {m.name}
                      </h6>
                      <p className="text-gray-700 text-xs pb-3 flex items-center justify-center leading-tight gap-1">
                        <PiPhoneCallLight className="text-green-600 text-sm" />
                        +91 {m.mobile}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              </div>
            )}
          </div>
        </section>
      )}

      {/* कर्मचारी Section */}
      {board.staff?.officers?.length > 0 && (
        <section id="officials" className="py-10 pt-20 bg-blue-50">
          <div className="max-w-6xl mx-auto px-2">
            <h2 className="text-3xl md:text-[2.5rem] font-bold text-green-700 text-center mb-10 relative">
              कर्मचारी
              <span className="block w-24 h-1 bg-orange-400 rounded absolute left-1/2 -translate-x-1/2 -bottom-3"></span>
            </h2>

            <div className="flex flex-wrap justify-center gap-8 mb-8">
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
                    <p className="text-green-200 text-sm mb-1 flex items-center justify-center gap-1">
                      <PiPhoneCallLight className="text-green-300 text-lg" />
                      +91 {officer.mobile}
                    </p>
                  </div>
                ))}

              {/* Other Staff */}
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
                        <p className="text-gray-700 text-base mb-0 flex items-center justify-center gap-1">
                          <PiPhoneCallLight className="text-green-600 text-lg" />
                          +91 {officer.mobile}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default ExecutiveBoard;
