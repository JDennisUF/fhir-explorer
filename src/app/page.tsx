'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FHIR_LEVELS, FHIR_RESOURCES, searchResources } from '@/lib/fhir-data';
import ResourceCard from '@/components/ResourceCard';
import SearchAndFilter from '@/components/SearchAndFilter';

export default function Home() {
  const router = useRouter();
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

    return filteredResources;
  }, [searchQuery, selectedLevel, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FHIR R4 Explorer</h1>
              <p className="text-gray-600 mt-1">Interactive learning tool for FHIR Release 4</p>
            </div>
            <div className="text-sm text-gray-500">
              Explore and learn FHIR resources organized by the 5-level hierarchy
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

        {/* Resource Cards Grid */}
        {resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
