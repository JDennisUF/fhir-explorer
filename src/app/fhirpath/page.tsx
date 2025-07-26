'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Play, BookOpen, Code, Info, Copy, Check, Download } from 'lucide-react';
import { FHIRPathEngine, FHIRPathExample } from '@/lib/fhirpath-engine';
import JsonViewer from '@/components/JsonViewer';

const sampleResources = {
  Patient: {
    "resourceType": "Patient",
    "id": "example-patient",
    "identifier": [
      {
        "use": "usual",
        "system": "http://hospital.example.org/patient-ids",
        "value": "MRN123456"
      },
      {
        "use": "secondary", 
        "system": "http://national-id.example.org",
        "value": "SSN987654321"
      }
    ],
    "active": true,
    "name": [
      {
        "use": "official",
        "family": "Johnson",
        "given": ["Sarah", "Marie"]
      },
      {
        "use": "nickname",
        "given": ["Sally"]
      }
    ],
    "gender": "female",
    "birthDate": "1985-03-15",
    "address": [
      {
        "use": "home",
        "line": ["123 Main Street", "Apt 4B"],
        "city": "Anytown", 
        "state": "CA",
        "postalCode": "12345"
      },
      {
        "use": "work",
        "line": ["456 Business Ave"],
        "city": "Worktown",
        "state": "CA", 
        "postalCode": "54321"
      }
    ]
  },
  Observation: {
    "resourceType": "Observation",
    "id": "example-bp",
    "status": "final",
    "category": [
      {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
            "code": "vital-signs"
          }
        ]
      }
    ],
    "code": {
      "coding": [
        {
          "system": "http://loinc.org",
          "code": "85354-9",
          "display": "Blood pressure panel"
        }
      ]
    },
    "subject": {
      "reference": "Patient/example-patient"
    },
    "component": [
      {
        "code": {
          "coding": [
            {
              "system": "http://loinc.org",
              "code": "8480-6",
              "display": "Systolic blood pressure"
            }
          ]
        },
        "valueQuantity": {
          "value": 120,
          "unit": "mmHg",
          "system": "http://unitsofmeasure.org",
          "code": "mm[Hg]"
        }
      },
      {
        "code": {
          "coding": [
            {
              "system": "http://loinc.org", 
              "code": "8462-4",
              "display": "Diastolic blood pressure"
            }
          ]
        },
        "valueQuantity": {
          "value": 80,
          "unit": "mmHg",
          "system": "http://unitsofmeasure.org",
          "code": "mm[Hg]"
        }
      }
    ]
  }
};

export default function FHIRPathPlayground() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fhirPathQuery, setFhirPathQuery] = useState('Patient.name.family');
  const [selectedResource, setSelectedResource] = useState<'Patient' | 'Observation'>('Patient');
  const [customResource, setCustomResource] = useState('');
  const [useCustomResource, setUseCustomResource] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  // Initialize with URL parameters if provided
  useEffect(() => {
    const query = searchParams.get('query');
    const resource = searchParams.get('resource');
    
    if (query) {
      setFhirPathQuery(query);
    }
    if (resource && (resource === 'Patient' || resource === 'Observation')) {
      setSelectedResource(resource);
    }
  }, [searchParams]);

  const executeQuery = () => {
    setError(null);
    setResult(null);

    let resource;
    if (useCustomResource) {
      try {
        resource = JSON.parse(customResource);
      } catch (err) {
        setError('Invalid JSON in custom resource');
        return;
      }
    } else {
      resource = sampleResources[selectedResource];
    }

    const pathResult = FHIRPathEngine.evaluate(fhirPathQuery, resource);
    
    if (pathResult.success) {
      setResult({
        value: pathResult.result,
        type: pathResult.resultType,
        query: fhirPathQuery
      });
    } else {
      setError(pathResult.error || 'Unknown error occurred');
    }
  };

  const loadExample = (example: FHIRPathExample) => {
    setFhirPathQuery(example.path);
    if (example.resourceType && (example.resourceType === 'Patient' || example.resourceType === 'Observation')) {
      setSelectedResource(example.resourceType);
    }
    setUseCustomResource(false);
  };

  const filteredExamples = FHIRPathEngine.examples.filter(
    example => selectedCategory === 'all' || example.category === selectedCategory
  );

  const categories = [
    { id: 'all', label: 'All Examples' },
    { id: 'basic', label: 'Basic Navigation' },
    { id: 'navigation', label: 'Property Navigation' },
    { id: 'filtering', label: 'Filtering' },
    { id: 'functions', label: 'Functions' },
    { id: 'advanced', label: 'Advanced' }
  ];

  const copyResult = async () => {
    if (!result) return;
    
    try {
      const resultText = typeof result.value === 'object' 
        ? JSON.stringify(result.value, null, 2)
        : String(result.value);
      
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy result', err);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    
    const resultText = typeof result.value === 'object' 
      ? JSON.stringify(result.value, null, 2)
      : String(result.value);
    
    const blob = new Blob([resultText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fhirpath-result-${Date.now()}.${typeof result.value === 'object' ? 'json' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
                <h1 className="text-3xl font-bold text-gray-900">FHIRPath Playground</h1>
                <p className="text-gray-600 mt-1">Test FHIRPath expressions interactively</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Code className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Examples Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    About FHIRPath
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      FHIRPath is a simple navigation and extraction language for FHIR resources. 
                      Use it to navigate through resource properties, filter data, and extract specific values.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Categories */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900">Examples</h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredExamples.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => loadExample(example)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <div className="font-mono text-sm text-blue-600 mb-1">
                        {example.path}
                      </div>
                      <div className="text-xs text-gray-600">
                        {example.description}
                      </div>
                      {example.resourceType && (
                        <div className="text-xs text-gray-500 mt-1">
                          For: {example.resourceType}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Query Input */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900">FHIRPath Query</h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FHIRPath Expression
                  </label>
                  <input
                    type="text"
                    value={fhirPathQuery}
                    onChange={(e) => setFhirPathQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="Enter FHIRPath expression..."
                  />
                </div>

                {/* Resource Selection */}
                <div className="flex items-center space-x-4">
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      checked={!useCustomResource}
                      onChange={() => setUseCustomResource(false)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Use sample resource:</span>
                  </label>
                  <select
                    value={selectedResource}
                    onChange={(e) => setSelectedResource(e.target.value as 'Patient' | 'Observation')}
                    disabled={useCustomResource}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="Patient">Patient</option>
                    <option value="Observation">Observation</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center text-sm mb-2">
                    <input
                      type="radio"
                      checked={useCustomResource}
                      onChange={() => setUseCustomResource(true)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Use custom resource (JSON):</span>
                  </label>
                  {useCustomResource && (
                    <textarea
                      value={customResource}
                      onChange={(e) => setCustomResource(e.target.value)}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="Paste your FHIR resource JSON here..."
                    />
                  )}
                </div>

                <button
                  onClick={executeQuery}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Execute Query
                </button>
              </div>
            </div>

            {/* Resource Display */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {useCustomResource ? 'Custom Resource' : `Sample ${selectedResource} Resource`}
                </h2>
              </div>
              <div className="p-4">
                <JsonViewer 
                  data={useCustomResource ? (customResource ? JSON.parse(customResource || '{}') : {}) : sampleResources[selectedResource]}
                  maxHeight="max-h-64"
                />
              </div>
            </div>

            {/* Result Display */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Query Result</h2>
                  {result && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={copyResult}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                      >
                        {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={downloadResult}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="text-red-600 font-medium">Error:</div>
                      <div className="ml-2 text-red-700">{error}</div>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Query: <code className="bg-gray-100 px-2 py-1 rounded">{result.query}</code>
                      </span>
                      <span className="text-gray-600">
                        Type: <code className="bg-gray-100 px-2 py-1 rounded">{result.type}</code>
                      </span>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Result:</span>
                      </div>
                      <div className="p-4">
                        {typeof result.value === 'object' ? (
                          <JsonViewer data={result.value} maxHeight="max-h-64" />
                        ) : (
                          <pre className="text-sm font-mono text-gray-900 whitespace-pre-wrap">
                            {String(result.value)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!result && !error && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>Enter a FHIRPath expression and click "Execute Query" to see results</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}