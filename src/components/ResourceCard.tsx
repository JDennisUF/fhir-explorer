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
      className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-6 cursor-pointer border border-gray-200 hover:border-blue-300"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">
          {resource.name}
        </h3>
        <div className="flex space-x-2 ml-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColors[resource.level]}`}>
            Level {resource.level}
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {resource.description}
      </p>
      
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${categoryColors[resource.category as keyof typeof categoryColors]}`}>
          {resource.category}
        </span>
        
        {resource.examples && resource.examples.length > 0 && (
          <div className="text-xs text-gray-500">
            {resource.examples.length} example{resource.examples.length > 1 ? 's' : ''} available
          </div>
        )}
      </div>
      
      {resource.examples && resource.examples.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {resource.examples.slice(0, 3).map((example) => (
              <span key={example} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                {example.replace('.json', '').replace(/^[a-z]+-/, '')}
              </span>
            ))}
            {resource.examples.length > 3 && (
              <span className="text-xs text-gray-400 py-1">
                +{resource.examples.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}