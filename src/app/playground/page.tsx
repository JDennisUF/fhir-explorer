'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Save, Download, RefreshCw, AlertCircle, CheckCircle, ArrowLeft, Bot } from 'lucide-react';
import JsonViewer from '@/components/JsonViewer';
import AIAssistant from '@/components/AIAssistant';

export default function FHIRPlayground() {
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState(JSON.stringify({
    "resourceType": "Patient",
    "id": "example",
    "name": [{
      "use": "official",
      "family": "Doe",
      "given": ["John"]
    }],
    "gender": "male",
    "birthDate": "1980-01-01"
  }, null, 2));
  
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [currentResourceType, setCurrentResourceType] = useState<string>('Patient');

  // Detect resource type changes
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.resourceType && parsed.resourceType !== currentResourceType) {
        setCurrentResourceType(parsed.resourceType);
      }
    } catch (error) {
      // Ignore JSON parsing errors
    }
  }, [jsonInput]);

  const validateFHIR = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setParsedJson(parsed);
      
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Basic FHIR validation
      if (!parsed.resourceType) {
        errors.push('Missing required field: resourceType');
      }
      
      if (parsed.resourceType === 'Patient') {
        if (!parsed.name && !parsed.identifier) {
          warnings.push('Patient should have at least a name or identifier');
        }
        if (parsed.birthDate && !/^\\d{4}-\\d{2}-\\d{2}$/.test(parsed.birthDate)) {
          errors.push('birthDate must be in YYYY-MM-DD format');
        }
        if (parsed.gender && !['male', 'female', 'other', 'unknown'].includes(parsed.gender)) {
          errors.push('gender must be one of: male, female, other, unknown');
        }
      }
      
      if (parsed.resourceType === 'Observation') {
        if (!parsed.status) {
          errors.push('Observation must have a status');
        }
        if (!parsed.code) {
          errors.push('Observation must have a code');
        }
        if (!parsed.subject) {
          errors.push('Observation must have a subject');
        }
      }
      
      setValidationResult({
        isValid: errors.length === 0,
        errors,
        warnings
      });
      setShowValidation(true);
      
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: ['Invalid JSON format'],
        warnings: []
      });
      setParsedJson(null);
      setShowValidation(true);
    }
  };

  const loadExample = (example: string) => {
    const examples = {
      patient: {
        "resourceType": "Patient",
        "id": "example-patient",
        "identifier": [{
          "use": "usual",
          "system": "http://hospital.example.org/patient-ids",
          "value": "MRN123456"
        }],
        "active": true,
        "name": [{
          "use": "official",
          "family": "Johnson",
          "given": ["Sarah", "Marie"]
        }],
        "gender": "female",
        "birthDate": "1985-03-15",
        "address": [{
          "use": "home",
          "line": ["123 Main Street"],
          "city": "Anytown",
          "state": "CA",
          "postalCode": "12345"
        }]
      },
      observation: {
        "resourceType": "Observation",
        "id": "example-bp",
        "status": "final",
        "category": [{
          "coding": [{
            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
            "code": "vital-signs"
          }]
        }],
        "code": {
          "coding": [{
            "system": "http://loinc.org",
            "code": "85354-9",
            "display": "Blood pressure panel"
          }]
        },
        "subject": {
          "reference": "Patient/example-patient"
        },
        "component": [{
          "code": {
            "coding": [{
              "system": "http://loinc.org",
              "code": "8480-6",
              "display": "Systolic blood pressure"
            }]
          },
          "valueQuantity": {
            "value": 120,
            "unit": "mmHg"
          }
        }]
      }
    };
    
    const selectedExample = examples[example as keyof typeof examples];
    if (selectedExample) {
      setJsonInput(JSON.stringify(selectedExample, null, 2));
      setValidationResult(null);
      setShowValidation(false);
    }
  };

  const downloadJson = () => {
    if (parsedJson) {
      const blob = new Blob([JSON.stringify(parsedJson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${parsedJson.resourceType || 'fhir'}-${parsedJson.id || 'resource'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleAICodeUpdate = (newCode: string) => {
    setJsonInput(newCode);
    setValidationResult(null);
    setShowValidation(false);
    
    // Try to detect resource type from the new code
    try {
      const parsed = JSON.parse(newCode);
      if (parsed.resourceType) {
        setCurrentResourceType(parsed.resourceType);
      }
    } catch (error) {
      // Ignore parsing errors - AI assistant will handle them
    }
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
                <h1 className="text-3xl font-bold text-gray-900">FHIR Playground</h1>
                <p className="text-gray-600 mt-1">Test and validate FHIR resources interactively</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  showAIAssistant 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-120px)]">
        <div className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${
          showAIAssistant ? 'mr-80' : ''
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Input Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">FHIR Resource Editor</h2>
                    <div className="flex items-center space-x-2">
                      <select
                        onChange={(e) => loadExample(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Load Example...</option>
                        <option value="patient">Patient Example</option>
                        <option value="observation">Observation Example</option>
                      </select>
                      <button
                        onClick={() => setJsonInput('')}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded"
                        title="Clear"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="w-full h-96 font-mono text-sm border border-gray-300 rounded p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter your FHIR JSON resource here..."
                  />
                </div>
                
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={validateFHIR}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Validate FHIR
                    </button>
                    
                    {parsedJson && (
                      <button
                        onClick={downloadJson}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Output Panel */}
            <div className="space-y-6">
              {/* Validation Results */}
              {showValidation && validationResult && (
                <div className="bg-white rounded-lg shadow">
                  <div className="border-b border-gray-200 p-4">
                    <h2 className="text-lg font-semibold text-gray-900">Validation Results</h2>
                  </div>
                  
                  <div className="p-4">
                    <div className={`flex items-center p-3 rounded-lg mb-4 ${
                      validationResult.isValid 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      {validationResult.isValid ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-medium text-green-800">Valid FHIR Resource</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                          <span className="font-medium text-red-800">Invalid FHIR Resource</span>
                        </>
                      )}
                    </div>
                    
                    {validationResult.errors.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-medium text-red-800 mb-2">Errors:</h3>
                        <ul className="space-y-1">
                          {validationResult.errors.map((error, index) => (
                            <li key={index} className="text-sm text-red-700 flex items-start">
                              <span className="text-red-500 mr-2">•</span>
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {validationResult.warnings.length > 0 && (
                      <div>
                        <h3 className="font-medium text-yellow-800 mb-2">Warnings:</h3>
                        <ul className="space-y-1">
                          {validationResult.warnings.map((warning, index) => (
                            <li key={index} className="text-sm text-yellow-700 flex items-start">
                              <span className="text-yellow-500 mr-2">•</span>
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Formatted JSON Display */}
              {parsedJson && (
                <div className="bg-white rounded-lg shadow">
                  <div className="border-b border-gray-200 p-4">
                    <h2 className="text-lg font-semibold text-gray-900">Formatted Resource</h2>
                  </div>
                  
                  <div className="p-4">
                    <JsonViewer 
                      data={parsedJson}
                      maxHeight="max-h-96"
                    />
                  </div>
                </div>
              )}

              {/* Help Panel */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">💡 Tips for Using the Playground</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Use the example dropdown to load sample FHIR resources</li>
                  <li>• The validator checks basic FHIR structure and common field requirements</li>
                  <li>• All resources must have a resourceType field</li>
                  <li>• Patient resources should include name, identifier, or both</li>
                  <li>• Observation resources require status, code, and subject fields</li>
                  <li>• Use proper date format (YYYY-MM-DD) for date fields</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Assistant Panel */}
        <AIAssistant
          code={jsonInput}
          resourceType={currentResourceType}
          onCodeUpdate={handleAICodeUpdate}
          isVisible={showAIAssistant}
          onToggle={() => setShowAIAssistant(!showAIAssistant)}
        />
      </div>
    </div>
  );
}