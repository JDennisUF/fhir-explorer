import React, { useState } from 'react';
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

// Mock schema data for common FHIR resources
const MOCK_SCHEMAS: Record<string, SchemaProperty[]> = {
  Patient: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "Patient")',
      required: true
    },
    {
      name: 'id',
      type: 'string',
      cardinality: '0..1',
      description: 'Logical id of this artifact'
    },
    {
      name: 'identifier',
      type: 'Identifier[]',
      cardinality: '0..*',
      description: 'An identifier for this patient',
      properties: [
        {
          name: 'use',
          type: 'code',
          cardinality: '0..1',
          description: 'usual | official | temp | secondary | old'
        },
        {
          name: 'system',
          type: 'uri',
          cardinality: '0..1',
          description: 'The namespace for the identifier value'
        },
        {
          name: 'value',
          type: 'string',
          cardinality: '0..1',
          description: 'The value that is unique'
        }
      ]
    },
    {
      name: 'active',
      type: 'boolean',
      cardinality: '0..1',
      description: 'Whether this patient record is in active use'
    },
    {
      name: 'name',
      type: 'HumanName[]',
      cardinality: '0..*',
      description: 'A name associated with the patient',
      properties: [
        {
          name: 'use',
          type: 'code',
          cardinality: '0..1',
          description: 'usual | official | temp | nickname | anonymous | old | maiden'
        },
        {
          name: 'family',
          type: 'string',
          cardinality: '0..1',
          description: 'Family name (often called surname)'
        },
        {
          name: 'given',
          type: 'string[]',
          cardinality: '0..*',
          description: 'Given names (not always first names)'
        }
      ]
    },
    {
      name: 'gender',
      type: 'code',
      cardinality: '0..1',
      description: 'male | female | other | unknown'
    },
    {
      name: 'birthDate',
      type: 'date',
      cardinality: '0..1',
      description: 'The date of birth for the individual'
    }
  ],
  Observation: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "Observation")',
      required: true
    },
    {
      name: 'status',
      type: 'code',
      cardinality: '1..1',
      description: 'registered | preliminary | final | amended | corrected | cancelled | entered-in-error | unknown',
      required: true
    },
    {
      name: 'code',
      type: 'CodeableConcept',
      cardinality: '1..1',
      description: 'Type of observation (code / type)',
      required: true,
      properties: [
        {
          name: 'coding',
          type: 'Coding[]',
          cardinality: '0..*',
          description: 'Code defined by a terminology system'
        },
        {
          name: 'text',
          type: 'string',
          cardinality: '0..1',
          description: 'Plain text representation of the concept'
        }
      ]
    },
    {
      name: 'subject',
      type: 'Reference(Patient|Group|Device|Location)',
      cardinality: '1..1',
      description: 'Who and/or what the observation is about',
      required: true
    },
    {
      name: 'valueQuantity',
      type: 'Quantity',
      cardinality: '0..1',
      description: 'Actual result',
      properties: [
        {
          name: 'value',
          type: 'decimal',
          cardinality: '0..1',
          description: 'Numerical value (with implicit precision)'
        },
        {
          name: 'unit',
          type: 'string',
          cardinality: '0..1',
          description: 'Unit representation'
        }
      ]
    }
  ]
};

export default function SchemaViewer({ resourceName, schema }: SchemaViewerProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
  
  // Use mock data if no schema provided
  const displaySchema = schema || MOCK_SCHEMAS[resourceName] || [];

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
    if (cardinality.startsWith('1..')) {
      return 'text-red-600 bg-red-50'; // Required
    }
    return 'text-gray-600 bg-gray-50'; // Optional
  };

  const renderProperty = (property: SchemaProperty, path: string, depth: number = 0) => {
    const hasChildren = property.properties && property.properties.length > 0;
    const isExpanded = expandedPaths.has(path);
    const indent = depth * 20;

    return (
      <div key={path} className="border-l border-gray-200 pl-4 ml-2">
        <div className="flex items-start space-x-3 py-2">
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(path)}
              className="mt-1 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          {!hasChildren && <div className="w-4 mt-1" />}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-mono font-medium text-gray-900">
                {property.name}
              </span>
              {property.required && (
                <AlertCircle className="h-3 w-3 text-red-500" title="Required field" />
              )}
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(property.type)}`}>
                {property.type}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getCardinalityColor(property.cardinality)}`}>
                {property.cardinality}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              {property.description}
            </p>
            
            {hasChildren && isExpanded && (
              <div className="mt-3">
                {property.properties!.map((child, index) => 
                  renderProperty(child, `${path}.${child.name}`, depth + 1)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (displaySchema.length === 0) {
    return (
      <div className="text-center py-8">
        <Info className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Schema Not Available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Schema definition for {resourceName} is not yet available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              FHIR {resourceName} Schema
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This shows the structure definition for the {resourceName} resource, including 
                data types, cardinality constraints, and field descriptions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Resource Properties</h4>
          <div className="flex space-x-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-50 border border-red-200 rounded mr-1"></div>
              Required (1..*)
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded mr-1"></div>
              Optional (0..*)
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {displaySchema.map((property) => 
            renderProperty(property, property.name, 0)
          )}
        </div>
      </div>
    </div>
  );
}