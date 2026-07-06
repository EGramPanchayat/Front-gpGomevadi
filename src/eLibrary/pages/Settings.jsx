import React from "react";
import { Settings as SettingsIcon, ShieldCheck, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import { useLanguage } from "../../utils/LanguageContext";

export default function Settings() {
  const { lang } = useLanguage();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          {lang === "mr" ? "लायब्ररी सेटिंग्स" : "Library Settings"}
        </h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">
          {lang === "mr" ? "ई-वाचनालय प्रणाली आणि परवानग्या व्यवस्थापित करा" : "Manage eLibrary configurations and permissions"}
        </p>
      </div>

      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Mock System Configurations */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            {lang === "mr" ? "सामान्य सेटिंग्ज" : "General Preferences"}
          </h3>
          
          <div className="divide-y divide-slate-100 text-xs">
            <div className="flex justify-between items-center py-3.5">
              <div>
                <p className="font-bold text-slate-750">
                  {lang === "mr" ? "ऑनलाइन वाचन मोड सक्षम करा" : "Enable Online Reading Mode"}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {lang === "mr" ? "वाचकांना डाऊनलोड न करता ऑनलाइन पीडीएफ वाचण्याची परवानगी द्या" : "Allow readers to view PDFs online without download requirement"}
                </p>
              </div>
              <ToggleRight className="w-8 h-8 text-indigo-600 cursor-pointer" />
            </div>

            <div className="flex justify-between items-center py-3.5">
              <div>
                <p className="font-bold text-slate-750">
                  {lang === "mr" ? "कव्हर प्रतिमा आवश्यक आहे" : "Require Cover Image"}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {lang === "mr" ? "पुस्तके अपलोड करताना कव्हर इमेज बंधनकारक करा" : "Mandate cover image upload when uploading new books"}
                </p>
              </div>
              <ToggleLeft className="w-8 h-8 text-slate-350 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Mock Permissions */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            {lang === "mr" ? "सुरक्षा आणि परवानग्या" : "Access & Safety"}
          </h3>
          
          <div className="divide-y divide-slate-100 text-xs">
            <div className="flex justify-between items-center py-3.5">
              <div>
                <p className="font-bold text-slate-750">
                  {lang === "mr" ? "सार्वजनिक प्रवेश" : "Public Reading Access"}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {lang === "mr" ? "लॉगिन नसलेल्या वापरकर्त्यांना पुस्तके वाचण्याची परवानगी द्या" : "Allow guest website visitors to read library collections"}
                </p>
              </div>
              <ToggleRight className="w-8 h-8 text-indigo-600 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
