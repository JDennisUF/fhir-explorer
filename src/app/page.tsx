'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FHIR_LEVELS, FHIR_RESOURCES, searchResources } from '@/lib/fhir-data';
import ResourceCard from '@/components/ResourceCard';
import SearchAndFilter from '@/components/SearchAndFilter';
import LanguageSelector from '@/components/LanguageSelector';
import { useI18n } from '@/contexts/I18nContext';

export default function Home() {
  const router = useRouter();
  const { t } = useI18n();
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3 | 4 | 5 | null>(3);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const resources = useMemo(() => {
    let filteredResources = Object.values(FHIR_RESOURCES);

    // Apply search filter
    if (searchQuery) {
      filteredResources = searchResources(searchQuery);
    }

    // Apply level filter
    if (selectedLevel && !searchQuery) {
      filteredResources = filteredResources.filter(resource => resource.level === selectedLevel);
    }

    // Apply category filter
    if (selectedCategory) {
      filteredResources = filteredResources.filter(resource => resource.category === selectedCategory);
    }

    return filteredResources.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedLevel, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('header.title')}</h1>
              <p className="text-gray-600 mt-1">{t('header.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden lg:block text-sm text-gray-500">
                {t('header.description')}
              </span>
              <LanguageSelector variant="compact" />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => router.push('/learn')}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs md:text-sm font-medium"
                >
                  <span className="md:hidden">📚</span>
                  <span className="hidden md:inline">📚 {t('navigation.learn')}</span>
                </button>
                <button
                  onClick={() => router.push('/relationships')}
                  className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-xs md:text-sm font-medium"
                >
                  <span className="md:hidden">🔗</span>
                  <span className="hidden md:inline">🔗 {t('navigation.relationships')}</span>
                </button>
                <button
                  onClick={() => router.push('/fhirpath')}
                  className="inline-flex items-center px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-xs md:text-sm font-medium"
                >
                  <span className="md:hidden">🔍</span>
                  <span className="hidden md:inline">🔍 {t('navigation.fhirpath')}</span>
                </button>
                <button
                  onClick={() => router.push('/profiles')}
                  className="inline-flex items-center px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-xs md:text-sm font-medium"
                >
                  <span className="md:hidden">⚙️</span>
                  <span className="hidden md:inline">⚙️ {t('navigation.profiles')}</span>
                </button>
                <button
                  onClick={() => router.push('/servers')}
                  className="inline-flex items-center px-3 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors text-xs md:text-sm font-medium"
                >
                  <span className="md:hidden">🌐</span>
                  <span className="hidden md:inline">🌐 {t('navigation.servers')}</span>
                </button>
                <button
                  onClick={() => router.push('/testing')}
                  className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs md:text-sm font-medium"
                >
                  <span className="md:hidden">🧪</span>
                  <span className="hidden md:inline">🧪 {t('navigation.testing')}</span>
                </button>
                <button
                  onClick={() => router.push('/playground')}
                  className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-xs md:text-sm font-medium"
                >
                  <span className="md:hidden">🛝</span>
                  <span className="hidden md:inline">🛝 {t('navigation.playground')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <SearchAndFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {searchQuery 
              ? `Search Results for "${searchQuery}"` 
              : selectedLevel
                ? `Level ${selectedLevel}: ${FHIR_LEVELS[selectedLevel]}`
                : 'All FHIR Resources'
            }
          </h2>
          <p className="text-gray-600 mt-1">
            Found {resources.length} resource{resources.length !== 1 ? 's' : ''}
            {selectedCategory && ` in ${selectedCategory} category`}
          </p>
        </div>

        {/* Resource Cards List */}
        {resources.length > 0 ? (
          <div className="space-y-2">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.name}
                resource={resource}
                onClick={() => router.push(`/resource/${resource.name}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.072-2.329C5.241 12.049 5 11.355 5 10.5S5.241 8.951 5.928 8.329C7.533 6.881 9.66 6 12 6s4.467.881 6.072 2.329C18.759 8.951 19 9.645 19 10.5s-.241 1.551-.928 2.171z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or clearing the filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
