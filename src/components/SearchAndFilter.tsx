import { FHIR_LEVELS } from '@/lib/fhir-data';

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLevel: 1 | 2 | 3 | 4 | 5 | null;
  setSelectedLevel: (level: 1 | 2 | 3 | 4 | 5 | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

export default function SearchAndFilter({
  searchQuery,
  setSearchQuery,
  selectedLevel,
  setSelectedLevel,
  selectedCategory,
  setSelectedCategory
}: SearchAndFilterProps) {
  const categories = [
    { key: 'foundation', label: 'Foundation' },
    { key: 'support', label: 'Support' },
    { key: 'administrative', label: 'Administrative' },
    { key: 'clinical', label: 'Clinical' },
    { key: 'reasoning', label: 'Reasoning' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Resources
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Level Filter */}
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
            FHIR Level
          </label>
          <select
            id="level"
            value={selectedLevel || ''}
            onChange={(e) => setSelectedLevel(e.target.value ? parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 : null)}
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
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {(searchQuery || selectedLevel || selectedCategory) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLevel(null);
              setSelectedCategory(null);
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}