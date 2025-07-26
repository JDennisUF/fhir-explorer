'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  SupportedLanguage, 
  i18nManager, 
  SUPPORTED_LANGUAGES,
  useTranslation as useI18nTranslation
} from '@/lib/i18n';

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, interpolations?: Record<string, any>) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (date: Date) => string;
  pluralize: (key: string, count: number, interpolations?: Record<string, any>) => string;
  isRTL: boolean;
  languageConfig: typeof SUPPORTED_LANGUAGES[SupportedLanguage];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: SupportedLanguage;
}

export function I18nProvider({ children, defaultLanguage = 'en' }: I18nProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load language from i18nManager after mount
    const currentLang = i18nManager.getCurrentLanguage();
    setLanguageState(currentLang);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Update document attributes when language changes
      const config = SUPPORTED_LANGUAGES[language];
      document.documentElement.lang = language;
      document.documentElement.dir = config.direction;
      
      // Update meta tags
      const langMeta = document.querySelector('meta[name="language"]');
      if (langMeta) {
        langMeta.setAttribute('content', language);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'language';
        meta.content = language;
        document.head.appendChild(meta);
      }
    }
  }, [language, mounted]);

  const setLanguage = (newLanguage: SupportedLanguage) => {
    i18nManager.setLanguage(newLanguage);
    setLanguageState(newLanguage);
  };

  const { t, formatNumber, formatDate, formatRelativeTime, pluralize } = useI18nTranslation();

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
    formatNumber,
    formatDate,
    formatRelativeTime,
    pluralize,
    isRTL: SUPPORTED_LANGUAGES[language].direction === 'rtl',
    languageConfig: SUPPORTED_LANGUAGES[language]
  };

  // Show loading placeholder until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Higher-order component for class components
export function withI18n<P extends object>(Component: React.ComponentType<P & I18nContextType>) {
  return function WrappedComponent(props: P) {
    const i18n = useI18n();
    return <Component {...props} {...i18n} />;
  };
}

// Translation key extraction utilities
export function extractTranslationKeys(content: string): string[] {
  const keyPattern = /\bt\(['"`]([^'"`]+)['"`]\)/g;
  const keys: string[] = [];
  let match;

  while ((match = keyPattern.exec(content)) !== null) {
    keys.push(match[1]);
  }

  return [...new Set(keys)]; // Remove duplicates
}

// Development utilities for translation management
export const I18nDevTools = {
  // Find missing translations
  findMissingKeys: (sourceLanguage: SupportedLanguage = 'en', targetLanguage: SupportedLanguage) => {
    return i18nManager.getMissingTranslations(sourceLanguage, targetLanguage);
  },

  // Export translations for external translation services
  exportForTranslation: (language: SupportedLanguage) => {
    return i18nManager.exportTranslations(language);
  },

  // Import translations from external services
  importTranslations: (language: SupportedLanguage, translations: string) => {
    return i18nManager.importTranslations(language, translations);
  },

  // Validate translation completeness
  validateTranslations: () => {
    const languages = Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[];
    const report: Record<string, { total: number; missing: string[] }> = {};

    languages.forEach(lang => {
      if (lang !== 'en') {
        const missing = i18nManager.getMissingTranslations('en', lang);
        report[lang] = {
          total: missing.length,
          missing
        };
      }
    });

    return report;
  },

  // Generate translation statistics
  getTranslationStats: () => {
    const languages = Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[];
    const stats: Record<string, { completeness: number; total: number; translated: number }> = {};

    languages.forEach(lang => {
      if (lang !== 'en') {
        const missing = i18nManager.getMissingTranslations('en', lang);
        const englishKeys = i18nManager.exportTranslations('en');
        const totalKeys = (englishKeys.match(/"/g) || []).length / 2; // Rough estimate
        const translated = totalKeys - missing.length;
        
        stats[lang] = {
          completeness: Math.round((translated / totalKeys) * 100),
          total: totalKeys,
          translated
        };
      }
    });

    return stats;
  }
};

// Localized component wrapper
export function Localized({ 
  children, 
  fallback 
}: { 
  children: (i18n: I18nContextType) => ReactNode;
  fallback?: ReactNode;
}) {
  try {
    const i18n = useI18n();
    return <>{children(i18n)}</>;
  } catch (error) {
    console.warn('Localized component used outside I18nProvider:', error);
    return <>{fallback || null}</>;
  }
}

// Date and time utilities with locale support
export const useLocaleFormatters = () => {
  const { language, formatDate, formatNumber, formatRelativeTime } = useI18n();

  return {
    // Standard formatters
    formatDate,
    formatNumber,
    formatRelativeTime,

    // Specialized formatters
    formatCurrency: (amount: number, currency = 'USD') => 
      formatNumber(amount, { style: 'currency', currency }),

    formatPercent: (value: number) => 
      formatNumber(value / 100, { style: 'percent' }),

    formatFileSize: (bytes: number) => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 Bytes';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return formatNumber(parseFloat((bytes / Math.pow(1024, i)).toFixed(2))) + ' ' + sizes[i];
    },

    formatShortDate: (date: Date) => 
      formatDate(date, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),

    formatLongDate: (date: Date) => 
      formatDate(date, { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),

    formatTime: (date: Date) => 
      formatDate(date, { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),

    formatDateTime: (date: Date) => 
      formatDate(date, { 
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
  };
};