import React from "react";

const FooterSection = () => (
  <section className="bg-blue-50">
    <footer className="bg-green-700 text-white py-10 rounded-t-[5rem]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          <div className="flex-1 mb-6 md:mb-0">
            <h5 className="mb-3 flex items-center gap-2 font-bold text-xl"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="4" y="8" width="16" height="8" rx="2"/></svg>ग्रामपंचायत गोमेवाडी</h5>
            <p className="mb-0 text-base">जिल्हा: सांगली<br/>तालुका: आटपाडी<br/>राज्य: महाराष्ट्र</p>
          </div>
          <div className="flex-1 mb-6 md:mb-0">
            <h5 className="mb-3 flex items-center gap-2 font-bold text-xl"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 5a2 2 0 012-2h2.28a2 2 0 011.7 1.06l1.52 2.71a2 2 0 01-.45 2.45l-1.27 1.02a16.06 16.06 0 006.58 6.58l1.02-1.27a2 2 0 012.45-.45l2.71 1.52A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C9.16 23 3 16.84 3 9V8a2 2 0 012-2z"/></svg>संपर्क माहिती</h5>
            <ul className="space-y-2 text-base">
              <li className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="7" width="20" height="10" rx="2" /><polyline points="2,7 12,13 22,7" /></svg>grampanchayatgomewadi@gmail.com</li>

              <li className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 2L12 22"/><path d="M6 12L12 2L18 12"/></svg>सकाळी 10:00 ते संध्याकाळी 5:00</li>
            </ul>
          </div>
          <div className="flex-1">
            <h5 className="mb-3 flex items-center gap-2 font-bold text-xl"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="4" y="8" width="16" height="8" rx="2"/></svg>उपयुक्त दुवे</h5>
            <div className="flex flex-col gap-2">
              <a href="https://rdd.maharashtra.gov.in/" target="_blank" className="text-white hover:underline flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M18 13v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6"/><path d="M15 10l5-5m0 0l-5-5m5 5H9"/></svg>महाराष्ट्र सरकार</a>
              <a href="https://zpsangli.maharashtra.gov.in/" target="_blank" className="text-white hover:underline flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M18 13v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6"/><path d="M15 10l5-5m0 0l-5-5m5 5H9"/></svg>जिल्हा परिषद सांगली</a>
              
            </div>
          </div>
        </div>
        <hr className="border-white my-4" />
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="mb-0">&copy; 2025 Developed by <span className="font-bold">SDG Groups</span></p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="/login" className="underline text-white">Admin Login</a>
            

            <a 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=anwit3171@gmail.com&su=Hello&body=I%20want%20to%20contact%20you" 
                target="_blank" 
                className="underline text-white"
              >
                Mail Us
              </a>

          </div>
        </div>
      </div>
    </footer>
  </section>
);

export default FooterSection;
