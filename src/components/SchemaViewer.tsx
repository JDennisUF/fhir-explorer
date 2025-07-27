import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Info, AlertCircle } from 'lucide-react';

interface SchemaProperty {
  name: string;
  type: string;
  cardinality: string;
  description: string;
  required?: boolean;
  properties?: SchemaProperty[];
}

interface SchemaViewerProps {
  resourceName: string;
  schema: SchemaProperty[];
}

export default function SchemaViewer({ resourceName, schema }: SchemaViewerProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
  const [dynamicSchema, setDynamicSchema] = useState<SchemaProperty[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Load schema from API if not provided
  useEffect(() => {
    if (!schema && resourceName) {
      setLoading(true);
      fetch(`/api/schema/${resourceName}`)
        .then(response => response.json())
        .then(data => {
          setDynamicSchema(data);
          setLoading(false);
        })
        .catch(error => {
          console.warn(`Could not load schema for ${resourceName}:`, error);
          setDynamicSchema([]);
          setLoading(false);
        });
    }
  }, [resourceName, schema]);
  
  const displaySchema = schema || dynamicSchema;

  const toggleExpanded = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const getTypeColor = (type: string) => {
    if (type.includes('string') || type === 'code' || type === 'uri') {
      return 'text-green-600 bg-green-50';
    }
    if (type.includes('boolean')) {
      return 'text-blue-600 bg-blue-50';
    }
    if (type.includes('integer') || type.includes('decimal') || type === 'date') {
      return 'text-purple-600 bg-purple-50';
    }
    if (type.includes('Reference') || type.includes('[]')) {
      return 'text-orange-600 bg-orange-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  const getCardinalityColor = (cardinality: string) => {
    if (cardinality.includes('1..1')) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    if (cardinality.includes('..1')) {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    }
    if (cardinality.includes('..*')) {
      return 'text-green-600 bg-green-50 border-green-200';
    }
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const renderProperty = (property: SchemaProperty, path: string = '', depth: number = 0) => {
    const currentPath = path ? `${path}.${property.name}` : property.name;
    const isExpanded = expandedPaths.has(currentPath);
    const hasNested = property.properties && property.properties.length > 0;

    return (
      <div key={currentPath} className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-100 pl-4' : ''}`}>
        <div className="flex items-start gap-3 py-2 hover:bg-gray-50 rounded-lg">
          {hasNested && (
            <button
              onClick={() => toggleExpanded(currentPath)}
              className="flex-shrink-0 mt-1 p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-semibold ${property.required ? 'text-red-700' : 'text-gray-900'}`}>
                {property.name}
              </span>
              {property.required && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Required
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(property.type)}`}>
                {property.type}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getCardinalityColor(property.cardinality)}`}>
                {property.cardinality}
              </span>
            </div>
            
            {property.description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {property.description}
              </p>
            )}
          </div>
        </div>
        
        {hasNested && isExpanded && (
          <div className="mt-2">
            {property.properties?.map(nestedProp => 
              renderProperty(nestedProp, currentPath, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schema...</p>
        </div>
      </div>
    );
  }

  if (!displaySchema || displaySchema.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Schema Available</h3>
          <p className="text-gray-600">
            Schema definition for <span className="font-semibold">{resourceName}</span> could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            {resourceName} Schema
          </h2>
          <span className="text-sm text-gray-500">
            ({displaySchema.length} properties)
          </span>
        </div>
      </div>
      
      <div className="px-6 py-4 max-h-[800px] overflow-y-auto">
        <div className="space-y-1">
          {displaySchema.map(property => renderProperty(property))}
        </div>
      </div>
    </div>
  );
}