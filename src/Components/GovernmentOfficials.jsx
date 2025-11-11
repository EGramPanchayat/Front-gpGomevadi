

const GovernmentOfficials = () => {
  const officials = [
    {
      id: 1,
      name: "माननीय मुख्यमंत्री",
      subtitle: "श्री. देवेंद्र फडणवीस",
      image: "/images/devendraFadanwis.webp",
    },
    {
      id: 2,
      name: "माननीय उपमुख्यमंत्री",
      subtitle: "श्री. एकनाथ शिंदे",
      image: "/images/yeknathShinde.jpeg",
    },
    {
      id: 3,
      name: "माननीय उपमुख्यमंत्री",
      subtitle: "श्री. अजित पवार",
      image: "/images/ajitPawar.jpeg",
    },
    {
      id: 4,
      name: "माननीय मंत्री, ग्रामविकास व पंचायतराज विभाग",
      subtitle: "श्री. जयकुमार गोरे",
      image: "/images/jayKumar.jpeg",
    },
    {
      id: 5,
      name: "माननीय राज्यमंत्री, ग्रामविकास व पंचायतराज विभाग",
      subtitle: "श्री. योगेश कदम",
      image: "/images/yogeshKadam.png",
    },
    {
      id: 6,
      name: "प्रधान सचिव, ग्रामविकास व पंचायतराज विभाग",
      subtitle: "श्री. एकनाथ डुबळे",
      image: "/images/yeknathDwale.png",
    },
  ];

  return (
    <section
      id="officials"
      className="w-full flex justify-center items-center bg-white pt-25 md:p-20"
    >
      <section className="py-8 px-5 mx-0 w-full  to-blue-50 flex flex-col md:flex-row justify-center items-center md:mx-40 rounded-3xl">
        <div className="max-w-6xl w-full flex flex-col justify-between items-center gap-6 md:gap-10 py-5 sm:px-4">
          {/* Heading */}
          <h2 className="text-[2rem] font-bold text-green-700 text-center mb-8 w-full relative">
            ग्राम विकास व पंचायतराज विभाग, महाराष्ट्र राज्य 
            <span className="block w-24 h-1 bg-orange-400 rounded absolute left-1/2 -translate-x-1/2 -bottom-3"></span>
          </h2>

          {/* Grid of officials */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 w-full">
            {officials.map((official) => (
              <div
                key={official.id}
                className="flex flex-col items-center text-center"
              >
                {/* Image */}
                <div className="w-32 h-32 md:w-40 md:h-40 mb-3 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-gray-200 border border-gray-300">
                  <img
                    src={official.image}
                    alt={official.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name */}
                <h5 className="text-s md:text-sm font-bold text-green-700 mb-1">
                  {official.subtitle}
                </h5>

                {/* Subtitle */}
                <p className="text-s text-orange-600">{official.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
};

export default GovernmentOfficials;
