import { FhirResourceInfo } from '@/lib/fhir-data';
import React from 'react';

interface ResourceCardProps {
  resource: FhirResourceInfo;
  onClick?: () => void;
}

export default function ResourceCard({ resource, onClick }: ResourceCardProps) {
  const levelColors = {
    1: 'bg-red-100 text-red-800',
    2: 'bg-orange-100 text-orange-800', 
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-green-100 text-green-800',
    5: 'bg-blue-100 text-blue-800'
  };

  const categoryColors = {
    foundation: 'bg-gray-100 text-gray-700',
    support: 'bg-purple-100 text-purple-700',
    administrative: 'bg-blue-100 text-blue-700',
    clinical: 'bg-green-100 text-green-700',
    reasoning: 'bg-indigo-100 text-indigo-700'
  };

  return (
    <div 
      className="bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 p-3 cursor-pointer border border-gray-200 hover:border-blue-300"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        {/* Left section: Name and description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {resource.name}
            </h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${levelColors[resource.level]}`}>
              Level {resource.level}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${categoryColors[resource.category as keyof typeof categoryColors]}`}>
              {resource.category}
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-1 truncate">
            {resource.description}
          </p>
        </div>
        
        {/* Right section: Examples info and count */}
        <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
          {resource.examples && resource.examples.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-500">
                {resource.examples.length} example{resource.examples.length > 1 ? 's' : ''}
              </div>
              <div className="flex space-x-1">
                {resource.examples.slice(0, 2).map((example) => (
                  <span key={example} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-50 text-gray-600">
                    {example.replace('.json', '').replace(/^[a-z]+-/, '').substring(0, 8)}
                  </span>
                ))}
                {resource.examples.length > 2 && (
                  <span className="text-xs text-gray-400">
                    +{resource.examples.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}