'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Network, Info, Search, Filter } from 'lucide-react';
import ResourceGraph from '@/components/ResourceGraph';
import { FHIR_RESOURCES, FHIR_LEVELS } from '@/lib/fhir-data';

export default function RelationshipsPage() {
  const router = useRouter();
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNodeClick = (resourceName: string) => {
    setSelectedResource(resourceName);
  };

  const handleResourceSelect = (resourceName: string) => {
    setSelectedResource(resourceName);
  };

  const filteredResources = Object.values(FHIR_RESOURCES).filter(resource => {
    if (searchQuery && !resource.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterLevel && resource.level !== filterLevel) {
      return false;
    }
    if (filterCategory && resource.category !== filterCategory) {
      return false;
    }
    return true;
  });

  const categories = Array.from(new Set(Object.values(FHIR_RESOURCES).map(r => r.category)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Explorer
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">FHIR Resource Relationships</h1>
                <p className="text-gray-600 mt-1">Interactive visualization of FHIR resource connections</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Network className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h3>
              
              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Resources
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Level Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  FHIR Level
                </label>
                <select
                  value={filterLevel || ''}
                  onChange={(e) => setFilterLevel(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">All Levels</option>
                  {Object.entries(FHIR_LEVELS).map(([level, name]) => (
                    <option key={level} value={level}>
                      Level {level}: {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filterCategory || ''}
                  onChange={(e) => setFilterCategory(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterLevel(null);
                  setFilterCategory(null);
                  setSelectedResource(null);
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>

            {/* Resource List */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Resources ({filteredResources.length})
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredResources.map(resource => (
                  <button
                    key={resource.name}
                    onClick={() => handleResourceSelect(resource.name)}
                    className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedResource === resource.name ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{resource.name}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        L{resource.level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {resource.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Graph Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    How to Use the Relationship Graph
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Click on any node to select a resource and highlight its connections</li>
                      <li>Use the zoom controls to get a closer look at specific areas</li>
                      <li>Different line types show different relationship types (references, related, hierarchical)</li>
                      <li>Node colors represent categories, border colors represent FHIR levels</li>
                      <li>Use the sidebar to filter resources and focus on specific areas of interest</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Graph */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Resource Relationship Map
                  {selectedResource && (
                    <span className="ml-2 text-sm font-normal text-blue-600">
                      - Focused on {selectedResource}
                    </span>
                  )}
                </h3>
              </div>
              <div className="p-4">
                <ResourceGraph
                  focusResource={selectedResource}
                  onNodeClick={handleNodeClick}
                  height={700}
                />
              </div>
            </div>

            {/* Quick Actions */}
            {selectedResource && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions for {selectedResource}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push(`/resource/${selectedResource}`)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => router.push(`/playground?resource=${selectedResource}`)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Try in Playground
                  </button>
                  <button
                    onClick={() => router.push(`/learn?focus=${selectedResource}`)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}