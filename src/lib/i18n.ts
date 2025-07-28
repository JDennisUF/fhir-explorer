// Internationalization system for multi-language support

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'pt' | 'ru';

export interface TranslationKey {
  key: string;
  defaultValue: string;
  interpolations?: Record<string, any>;
}

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    flag: '🇺🇸'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    flag: '🇪🇸'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    flag: '🇫🇷'
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    flag: '🇩🇪'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
    flag: '🇨🇳'
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    flag: '🇯🇵'
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr',
    flag: '🇵🇹'
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    direction: 'ltr',
    flag: '🇷🇺'
  }
};

// Translation storage
export interface TranslationBundle {
  [key: string]: string | TranslationBundle;
}

// English translations (default)
export const EN_TRANSLATIONS: TranslationBundle = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    open: 'Open',
    export: 'Export',
    import: 'Import',
    download: 'Download',
    upload: 'Upload'
  },
  navigation: {
    home: 'Home',
    learn: 'Learn FHIR',
    relationships: 'Relationships',
    fhirpath: 'FHIRPath',
    profiles: 'Profiles',
    servers: 'Servers',
    testing: 'Testing',
    playground: 'Playground'
  },
  header: {
    title: 'FHIR R4 Explorer',
    subtitle: 'Interactive learning tool for FHIR Release 4',
    description: 'Explore and learn FHIR resources organized by the 5-level hierarchy'
  },
  fhir: {
    levels: {
      1: 'Foundation',
      2: 'Base',
      3: 'Clinical',
      4: 'Financial',
      5: 'Specialized'
    },
    resources: {
      patient: 'Patient',
      observation: 'Observation',
      encounter: 'Encounter',
      practitioner: 'Practitioner',
      organization: 'Organization',
      medication: 'Medication',
      condition: 'Condition',
      procedure: 'Procedure',
      diagnosticReport: 'Diagnostic Report',
      immunization: 'Immunization'
    },
    validation: {
      valid: 'Valid FHIR Resource',
      invalid: 'Invalid FHIR Resource',
      errors: 'Errors',
      warnings: 'Warnings',
      missingResourceType: 'Missing required field: resourceType',
      invalidDateFormat: 'Date must be in YYYY-MM-DD format',
      invalidGender: 'Gender must be one of: male, female, other, unknown'
    }
  },
  testing: {
    title: 'FHIR Testing Framework',
    subtitle: 'Automated testing for FHIR implementations',
    testSuites: 'Test Suites',
    testCases: 'Test Cases',
    results: 'Results',
    run: 'Run',
    runSuite: 'Run Suite',
    passed: 'Passed',
    failed: 'Failed',
    errors: 'Errors',
    passRate: 'Pass Rate',
    totalTests: 'Total Tests',
    noResults: 'No test results yet',
    runSomeTests: 'Run some tests to see results here'
  },
  playground: {
    title: 'FHIR Playground',
    subtitle: 'Test and validate FHIR resources interactively',
    editor: 'FHIR Resource Editor',
    validation: 'Validation Results',
    formatted: 'Formatted Resource',
    loadExample: 'Load Example...',
    patientExample: 'Patient Example',
    observationExample: 'Observation Example',
    validateFhir: 'Validate FHIR',
    aiAssistant: 'AI Assistant',
    tips: 'Tips for Using the Playground'
  },
  ai: {
    suggestions: 'Suggestions',
    issues: 'Issues',
    help: 'Help',
    analyzing: 'Analyzing...',
    noSuggestions: 'No suggestions available',
    tryWriting: 'Try writing some FHIR JSON to get AI-powered suggestions',
    noIssues: 'No issues found',
    looksGood: 'Your FHIR resource looks good!',
    noHelp: 'No contextual help available',
    helpWillAppear: 'Help will appear based on your code content',
    confidence: 'confidence',
    applyChirurgia: 'Apply suggestion',
    rejectSuggestion: 'Reject suggestion',
    showDetails: 'Show details',
    hideDetails: 'Hide details'
  },
};

// Spanish translations
export const ES_TRANSLATIONS: TranslationBundle = {
  common: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    update: 'Actualizar',
    search: 'Buscar',
    filter: 'Filtrar',
    clear: 'Limpiar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    close: 'Cerrar',
    open: 'Abrir',
    export: 'Exportar',
    import: 'Importar',
    download: 'Descargar',
    upload: 'Subir'
  },
  navigation: {
    home: 'Inicio',
    learn: 'Aprender FHIR',
    relationships: 'Relaciones',
    fhirpath: 'FHIRPath',
    profiles: 'Perfiles',
    servers: 'Servidores',
    testing: 'Pruebas',
    playground: 'Zona de Pruebas'
  },
  header: {
    title: 'Explorador FHIR R4',
    subtitle: 'Herramienta de aprendizaje interactiva para FHIR Release 4',
    description: 'Explora y aprende recursos FHIR organizados por la jerarquía de 5 niveles'
  },
  fhir: {
    levels: {
      1: 'Fundación',
      2: 'Base',
      3: 'Clínico',
      4: 'Financiero',
      5: 'Especializado'
    },
    validation: {
      valid: 'Recurso FHIR Válido',
      invalid: 'Recurso FHIR Inválido',
      errors: 'Errores',
      warnings: 'Advertencias',
      missingResourceType: 'Campo requerido faltante: resourceType',
      invalidDateFormat: 'La fecha debe estar en formato YYYY-MM-DD',
      invalidGender: 'El género debe ser uno de: male, female, other, unknown'
    }
  },
};

// French translations
export const FR_TRANSLATIONS: TranslationBundle = {
  common: {
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Avertissement',
    info: 'Information',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    update: 'Mettre à jour',
    search: 'Rechercher',
    filter: 'Filtrer',
    clear: 'Effacer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    close: 'Fermer',
    open: 'Ouvrir',
    export: 'Exporter',
    import: 'Importer',
    download: 'Télécharger',
    upload: 'Téléverser'
  },
  navigation: {
    home: 'Accueil',
    learn: 'Apprendre FHIR',
    relationships: 'Relations',
    fhirpath: 'FHIRPath',
    profiles: 'Profils',
    servers: 'Serveurs',
    testing: 'Tests',
    playground: 'Terrain de jeu'
  },
  header: {
    title: 'Explorateur FHIR R4',
    subtitle: 'Outil d\'apprentissage interactif pour FHIR Release 4',
    description: 'Explorez et apprenez les ressources FHIR organisées par la hiérarchie à 5 niveaux'
  }
};

// Translation collection
export const TRANSLATIONS: Record<SupportedLanguage, TranslationBundle> = {
  en: EN_TRANSLATIONS,
  es: ES_TRANSLATIONS,
  fr: FR_TRANSLATIONS,
  de: EN_TRANSLATIONS, // Fallback to English for now
  zh: EN_TRANSLATIONS, // Fallback to English for now
  ja: EN_TRANSLATIONS, // Fallback to English for now
  pt: EN_TRANSLATIONS, // Fallback to English for now
  ru: EN_TRANSLATIONS  // Fallback to English for now
};

// Translation utility functions
export class I18nManager {
  private currentLanguage: SupportedLanguage = 'en';
  private fallbackLanguage: SupportedLanguage = 'en';
  private translations: Record<SupportedLanguage, TranslationBundle>;

  constructor() {
    this.translations = TRANSLATIONS;
    this.loadLanguageFromStorage();
  }

  private loadLanguageFromStorage() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fhir-explorer-language');
      if (saved && this.isValidLanguage(saved)) {
        this.currentLanguage = saved as SupportedLanguage;
      } else {
        // Detect browser language
        const browserLang = navigator.language.split('-')[0];
        if (this.isValidLanguage(browserLang)) {
          this.currentLanguage = browserLang as SupportedLanguage;
        }
      }
    }
  }

  private isValidLanguage(lang: string): boolean {
    return Object.keys(SUPPORTED_LANGUAGES).includes(lang);
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  getLanguageConfig(): LanguageConfig {
    return SUPPORTED_LANGUAGES[this.currentLanguage];
  }

  setLanguage(language: SupportedLanguage) {
    this.currentLanguage = language;
    if (typeof window !== 'undefined') {
      localStorage.setItem('fhir-explorer-language', language);
      document.documentElement.lang = language;
      document.documentElement.dir = SUPPORTED_LANGUAGES[language].direction;
    }
  }

  translate(key: string, interpolations?: Record<string, any>): string {
    const value = this.getNestedValue(this.translations[this.currentLanguage], key) ||
                  this.getNestedValue(this.translations[this.fallbackLanguage], key) ||
                  key;

    if (interpolations && typeof value === 'string') {
      return this.interpolate(value, interpolations);
    }

    return typeof value === 'string' ? value : key;
  }

  private getNestedValue(obj: TranslationBundle, path: string): string | undefined {
    const keys = path.split('.');
    let current: any = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return typeof current === 'string' ? current : undefined;
  }

  private interpolate(template: string, values: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return values[key] !== undefined ? String(values[key]) : match;
    });
  }

  // Number and date formatting
  formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLanguage, options).format(num);
  }

  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
  }

  formatRelativeTime(date: Date): string {
    const rtf = new Intl.RelativeTimeFormat(this.currentLanguage, { numeric: 'auto' });
    const diffTime = date.getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (Math.abs(diffDays) < 1) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      if (Math.abs(diffHours) < 1) {
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));
        return rtf.format(diffMinutes, 'minute');
      }
      return rtf.format(diffHours, 'hour');
    }

    return rtf.format(diffDays, 'day');
  }

  // Pluralization support
  pluralize(key: string, count: number, interpolations?: Record<string, any>): string {
    const pluralRules = new Intl.PluralRules(this.currentLanguage);
    const rule = pluralRules.select(count);
    
    const pluralKey = `${key}.${rule}`;
    const fallbackKey = `${key}.other`;
    
    const value = this.getNestedValue(this.translations[this.currentLanguage], pluralKey) ||
                  this.getNestedValue(this.translations[this.currentLanguage], fallbackKey) ||
                  this.translate(key, interpolations);

    return this.interpolate(value, { count, ...interpolations });
  }

  // Export/Import functionality
  exportTranslations(language: SupportedLanguage): string {
    return JSON.stringify(this.translations[language], null, 2);
  }

  importTranslations(language: SupportedLanguage, translations: string): boolean {
    try {
      const parsed = JSON.parse(translations);
      this.translations[language] = parsed;
      return true;
    } catch (error) {
      console.error('Failed to import translations:', error);
      return false;
    }
  }

  // Missing translations detection
  getMissingTranslations(sourceLanguage: SupportedLanguage, targetLanguage: SupportedLanguage): string[] {
    const missing: string[] = [];
    const source = this.translations[sourceLanguage];
    const target = this.translations[targetLanguage];

    const findMissing = (sourceObj: TranslationBundle, targetObj: TranslationBundle, path = '') => {
      for (const [key, value] of Object.entries(sourceObj)) {
        const fullPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'string') {
          if (!targetObj[key] || typeof targetObj[key] !== 'string') {
            missing.push(fullPath);
          }
        } else if (typeof value === 'object' && value !== null) {
          if (!targetObj[key] || typeof targetObj[key] !== 'object') {
            missing.push(fullPath);
          } else {
            findMissing(value as TranslationBundle, targetObj[key] as TranslationBundle, fullPath);
          }
        }
      }
    };

    findMissing(source, target);
    return missing;
  }
}

// Singleton instance
export const i18nManager = new I18nManager();

// Hook-like function for React components
export const useTranslation = () => {
  return {
    t: (key: string, interpolations?: Record<string, any>) => i18nManager.translate(key, interpolations),
    language: i18nManager.getCurrentLanguage(),
    setLanguage: (lang: SupportedLanguage) => i18nManager.setLanguage(lang),
    formatNumber: (num: number, options?: Intl.NumberFormatOptions) => i18nManager.formatNumber(num, options),
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => i18nManager.formatDate(date, options),
    formatRelativeTime: (date: Date) => i18nManager.formatRelativeTime(date),
    pluralize: (key: string, count: number, interpolations?: Record<string, any>) => 
      i18nManager.pluralize(key, count, interpolations)
  };
};