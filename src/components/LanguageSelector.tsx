'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { 
  SUPPORTED_LANGUAGES, 
  SupportedLanguage, 
  LanguageConfig,
  useTranslation 
} from '@/lib/i18n';

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'dropdown' | 'compact' | 'full';
}

export default function LanguageSelector({ 
  className = '',
  showLabel = true,
  variant = 'dropdown'
}: LanguageSelectorProps) {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded ${variant === 'compact' ? 'h-8 w-12' : 'h-10 w-32'} ${className}`} />
    );
  }

  const currentLanguage = SUPPORTED_LANGUAGES[language];

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    setIsOpen(false);
    
    // Announce language change for accessibility
    if (typeof window !== 'undefined') {
      const announcement = `Language changed to ${SUPPORTED_LANGUAGES[newLanguage].name}`;
      const div = document.createElement('div');
      div.setAttribute('aria-live', 'polite');
      div.setAttribute('aria-atomic', 'true');
      div.className = 'sr-only';
      div.textContent = announcement;
      document.body.appendChild(div);
      setTimeout(() => document.body.removeChild(div), 1000);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`Current language: ${currentLanguage.name}. Click to change language.`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="text-lg">{currentLanguage.flag}</span>
          <ChevronDown className="ml-1 h-3 w-3" />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="listbox" aria-label="Select language">
                {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                      lang.code === language ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                    role="option"
                    aria-selected={lang.code === language}
                  >
                    <span className="text-lg mr-3">{lang.flag}</span>
                    <span className="flex-1 text-left">{lang.nativeName}</span>
                    <span className="text-xs text-gray-500 ml-2">{lang.name}</span>
                    {lang.code === language && (
                      <Check className="h-4 w-4 ml-2 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`space-y-3 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">
          <Globe className="inline h-4 w-4 mr-2" />
          Language / Idioma / Langue
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center px-3 py-2 text-sm rounded-md border transition-colors ${
                lang.code === language
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg mr-2">{lang.flag}</span>
              <div className="text-left">
                <div className="font-medium">{lang.nativeName}</div>
                <div className="text-xs text-gray-500">{lang.name}</div>
              </div>
              {lang.code === language && (
                <Check className="h-4 w-4 ml-auto text-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={`Current language: ${currentLanguage.name}. Click to change language.`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4 mr-2" />
        {showLabel && (
          <>
            <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.nativeName}</span>
            <span className="sm:hidden">{currentLanguage.flag}</span>
          </>
        )}
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="listbox" aria-label="Select language">
              {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors ${
                    lang.code === language ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                  role="option"
                  aria-selected={lang.code === language}
                >
                  <span className="text-lg mr-3">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{lang.nativeName}</div>
                    <div className="text-xs text-gray-500">{lang.name}</div>
                  </div>
                  {lang.code === language && (
                    <Check className="h-4 w-4 ml-2 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Language detection and auto-setup hook
export function useLanguageDetection() {
  useEffect(() => {
    // Set initial language direction
    const currentLang = SUPPORTED_LANGUAGES[document.documentElement.lang as SupportedLanguage] || 
                       SUPPORTED_LANGUAGES.en;
    document.documentElement.dir = currentLang.direction;
  }, []);
}

// Language toggle for quick switching between two languages
export function LanguageToggle({ 
  primaryLang = 'en', 
  secondaryLang = 'es',
  className = ''
}: {
  primaryLang?: SupportedLanguage;
  secondaryLang?: SupportedLanguage;
  className?: string;
}) {
  const { language, setLanguage } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = language === primaryLang ? secondaryLang : primaryLang;
    setLanguage(newLang);
  };

  const currentConfig = SUPPORTED_LANGUAGES[language];
  const otherLang = language === primaryLang ? secondaryLang : primaryLang;
  const otherConfig = SUPPORTED_LANGUAGES[otherLang];

  return (
    <button
      onClick={toggleLanguage}
      className={`inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors ${className}`}
      title={`Switch to ${otherConfig.name}`}
    >
      <span className="mr-1">{currentConfig.flag}</span>
      <span className="mx-1">⇄</span>
      <span className="ml-1">{otherConfig.flag}</span>
    </button>
  );
}