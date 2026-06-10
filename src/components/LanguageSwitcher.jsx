import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaLanguage, FaChevronDown, FaCheck } from "react-icons/fa";

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = {
    en: "English",
    hi: "हिंदी",
    mr: "मराठी",
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  const currentLanguageLabel = languages[i18n.language] || languages.en;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center text-gray-700 bg-gray-50 border border-gray-200/80 rounded-xl md:rounded-full p-2.5 md:px-5 md:py-3 transition duration-300 hover:bg-gray-100 hover:border-gray-300 shadow-md font-bold text-[17px] gap-2.5 select-none active:scale-95"
      >
        <FaLanguage className="text-green-600 text-2xl md:text-xl" />
        <span className="hidden md:block min-w-[50px] text-left">{currentLanguageLabel}</span>
        <FaChevronDown
          className={`hidden md:block text-gray-400 text-xs transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-40 bg-white border border-gray-100/90 rounded-2xl shadow-xl py-2 z-50 origin-top-right transition-all duration-200 ease-out animate-fade-in">
          {Object.entries(languages).map(([code, label]) => {
            const isSelected = i18n.language === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleLanguageChange(code)}
                className={`flex items-center justify-between w-full text-left px-5 py-3 text-[17px] font-bold transition duration-150 ${
                  isSelected
                    ? "text-green-600 bg-green-50/50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{label}</span>
                {isSelected && <FaCheck className="text-xs text-green-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
