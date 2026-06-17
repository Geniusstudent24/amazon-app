import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const languages = [
  { label: "English - EN" },
  { label: "español - ES - Traducción" },
  { label: "العربية - AR - الترجمة" },
  { label: "Deutsch - DE - Übersetzung" },
  { label: "עברית - HE - תרגום" },
  { label: "한국어 - KO - 번역" },
  { label: "português - PT - Tradução" },
  { label: "中文(简体) - ZH - 翻译" },
  { label: "中文(繁體) - ZH - 翻譯" },
];

const LanguageSetting = () => {
  const [language, setLanguage] = useState("English - EN");
  const navigate = useNavigate();

  const handleSave = () => {
    alert(`Saved: ${language}`);
    navigate("/");
  };

  const red = () => {
    navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Language Settings</h2>
      <p className="text-sm text-gray-600 mb-4">
        Select the language you prefer for browsing, shopping, and
        communications.
      </p>

      <div className="mb-6 space-y-2">
        {languages.map((lang, idx) => {
          return (
            <label key={idx} className="flex items-center space-x-2">
              <input
                type="radio"
                name="language"
                value={lang.label}
                checked={language === lang.label}
                onChange={() => setLanguage(lang.label)}
                className="accent-yellow-500"
              />
              <span>{lang.label}</span>
            </label>
          );
        })}
      </div>

      <div className="flex justify-end space-x-2">
        <button
          className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
          onClick={red}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default LanguageSetting;
