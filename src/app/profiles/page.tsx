'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Download, 
  Upload, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Layers,
  Code2,
  BookOpen
} from 'lucide-react';
import { profileManager, FHIRProfile, ImplementationGuide, ValidationResult } from '@/lib/profile-manager';
import JsonViewer from '@/components/JsonViewer';

export default function ProfilesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profiles' | 'implementation-guides' | 'validator'>('profiles');
  const [profiles, setProfiles] = useState<FHIRProfile[]>([]);
  const [implementationGuides, setImplementationGuides] = useState<ImplementationGuide[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<FHIRProfile | null>(null);
  const [selectedIG, setSelectedIG] = useState<ImplementationGuide | null>(null);
  
  // Validator state
  const [validationResource, setValidationResource] = useState('');
  const [selectedProfileForValidation, setSelectedProfileForValidation] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    setProfiles(profileManager.getAllProfiles());
    setImplementationGuides(profileManager.getAllImplementationGuides());
  }, []);

  const handleProfileSelect = (profile: FHIRProfile) => {
    setSelectedProfile(profile);
  };

  const handleIGSelect = (ig: ImplementationGuide) => {
    setSelectedIG(ig);
  };

  const exportProfile = (profileId: string) => {
    const exported = profileManager.exportProfile(profileId);
    if (exported) {
      const blob = new Blob([exported], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profileId}-profile.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportIG = (igId: string) => {
    const exported = profileManager.exportImplementationGuide(igId);
    if (exported) {
      const blob = new Blob([exported], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${igId}-implementation-guide.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const validateResource = () => {
    if (!validationResource || !selectedProfileForValidation) {
      return;
    }

    try {
      const resource = JSON.parse(validationResource);
      const result = profileManager.validateResourceAgainstProfile(resource, selectedProfileForValidation);
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: ['Invalid JSON format'],
        warnings: []
      });
    }
  };

  const loadExampleResource = () => {
    const examplePatient = {
      "resourceType": "Patient",
      "id": "example-validation",
      "identifier": [
        {
          "use": "usual",
          "system": "http://hospital.example.org/patient-ids",
          "value": "MRN123456"
        }
      ],
      "active": true,
      "name": [
        {
          "use": "official",
          "family": "Johnson",
          "given": ["Sarah"]
        }
      ],
      "gender": "female",
      "birthDate": "1985-03-15"
    };
    
    setValidationResource(JSON.stringify(examplePatient, null, 2));
    setSelectedProfileForValidation('us-core-patient');
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
                <h1 className="text-3xl font-bold text-gray-900">Advanced Schema Tools</h1>
                <p className="text-gray-600 mt-1">Manage profiles, implementation guides, and validate resources</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'profiles', label: 'Profiles', icon: Layers },
              { id: 'implementation-guides', label: 'Implementation Guides', icon: BookOpen },
              { id: 'validator', label: 'Profile Validator', icon: CheckCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Profiles Tab */}
        {activeTab === 'profiles' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">FHIR Profiles</h2>
                    <button
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {profiles.map(profile => (
                    <div
                      key={profile.id}
                      onClick={() => handleProfileSelect(profile)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedProfile?.id === profile.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{profile.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{profile.description}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              {profile.baseResource}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              profile.status === 'active' 
                                ? 'bg-green-100 text-green-700'
                                : profile.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {profile.status}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportProfile(profile.id);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded"
                          title="Export Profile"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              {selectedProfile ? (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedProfile.name}</h2>
                        <p className="text-gray-600 mt-1">{selectedProfile.description}</p>
                        <div className="flex items-center mt-3 space-x-4">
                          <span className="text-sm text-gray-500">
                            Base: <span className="font-medium">{selectedProfile.baseResource}</span>
                          </span>
                          <span className="text-sm text-gray-500">
                            Version: <span className="font-medium">{selectedProfile.version}</span>
                          </span>
                          <span className="text-sm text-gray-500">
                            Publisher: <span className="font-medium">{selectedProfile.publisher || 'Unknown'}</span>
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedProfile.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : selectedProfile.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedProfile.status}
                      </span>
                    </div>
                  </div>

                  {/* Profile Elements */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200 p-4">
                      <h3 className="text-lg font-semibold text-gray-900">Profile Elements</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Path
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cardinality
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Must Support
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedProfile.elements.map((element, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {element.path}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {element.type.join(' | ')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {element.cardinality.min}..{element.cardinality.max}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {element.mustSupport ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Profile Constraints */}
                  {selectedProfile.constraints.length > 0 && (
                    <div className="bg-white rounded-lg shadow">
                      <div className="border-b border-gray-200 p-4">
                        <h3 className="text-lg font-semibold text-gray-900">Constraints</h3>
                      </div>
                      <div className="p-4 space-y-4">
                        {selectedProfile.constraints.map((constraint, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start">
                              <div className={`flex-shrink-0 mt-1 ${
                                constraint.severity === 'error' ? 'text-red-500' : 'text-yellow-500'
                              }`}>
                                <AlertCircle className="h-4 w-4" />
                              </div>
                              <div className="ml-3 flex-1">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-900">{constraint.key}</span>
                                  <span className={`ml-2 px-2 py-1 text-xs rounded ${
                                    constraint.severity === 'error' 
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {constraint.severity}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{constraint.human}</p>
                                <p className="text-xs text-gray-500 mt-2 font-mono">
                                  {constraint.expression}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Profile Selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a profile from the list to view its details and elements.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Implementation Guides Tab */}
        {activeTab === 'implementation-guides' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* IG List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Implementation Guides</h2>
                    <button className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-1" />
                      New
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {implementationGuides.map(ig => (
                    <button
                      key={ig.id}
                      onClick={() => handleIGSelect(ig)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedIG?.id === ig.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{ig.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{ig.description}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              v{ig.version}
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              {ig.profiles.length} profiles
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportIG(ig.id);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded"
                          title="Export IG"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* IG Details */}
            <div className="lg:col-span-2">
              {selectedIG ? (
                <div className="space-y-6">
                  {/* IG Header */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900">{selectedIG.title}</h2>
                    <p className="text-gray-600 mt-1">{selectedIG.description}</p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Publisher</dt>
                        <dd className="text-sm text-gray-900">{selectedIG.publisher}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Version</dt>
                        <dd className="text-sm text-gray-900">{selectedIG.version}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="text-sm text-gray-900 capitalize">{selectedIG.status}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Profiles</dt>
                        <dd className="text-sm text-gray-900">{selectedIG.profiles.length}</dd>
                      </div>
                    </div>
                  </div>

                  {/* Profiles in IG */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200 p-4">
                      <h3 className="text-lg font-semibold text-gray-900">Included Profiles</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {selectedIG.profiles.map(profileId => {
                        const profile = profiles.find(p => p.id === profileId);
                        return profile ? (
                          <div key={profileId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div>
                              <h4 className="font-medium text-gray-900">{profile.name}</h4>
                              <p className="text-sm text-gray-600">{profile.description}</p>
                            </div>
                            <button
                              onClick={() => setSelectedProfile(profile)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View Details
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* Extensions */}
                  {selectedIG.extensions.length > 0 && (
                    <div className="bg-white rounded-lg shadow">
                      <div className="border-b border-gray-200 p-4">
                        <h3 className="text-lg font-semibold text-gray-900">Extensions</h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {selectedIG.extensions.map(extension => (
                          <div key={extension.id} className="p-3 border border-gray-200 rounded-lg">
                            <h4 className="font-medium text-gray-900">{extension.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{extension.description}</p>
                            <div className="flex items-center mt-2 space-x-2">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-mono">
                                {extension.url}
                              </span>
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                {extension.type.join(' | ')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Implementation Guide Selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select an implementation guide from the list to view its details.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validator Tab */}
        {activeTab === 'validator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900">Resource Validation</h2>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Profile
                    </label>
                    <select
                      value={selectedProfileForValidation}
                      onChange={(e) => setSelectedProfileForValidation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose a profile...</option>
                      {profiles.map(profile => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name} ({profile.baseResource})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        FHIR Resource (JSON)
                      </label>
                      <button
                        onClick={loadExampleResource}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Load Example
                      </button>
                    </div>
                    <textarea
                      value={validationResource}
                      onChange={(e) => setValidationResource(e.target.value)}
                      className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="Paste your FHIR resource JSON here..."
                    />
                  </div>

                  <button
                    onClick={validateResource}
                    disabled={!validationResource || !selectedProfileForValidation}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Validate Resource
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-900">Validation Results</h2>
                </div>
                <div className="p-4">
                  {validationResult ? (
                    <div className="space-y-4">
                      {/* Status */}
                      <div className={`flex items-center p-4 rounded-lg ${
                        validationResult.isValid
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        {validationResult.isValid ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                            <span className="font-medium text-green-800">Resource is valid</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                            <span className="font-medium text-red-800">Resource has validation errors</span>
                          </>
                        )}
                      </div>

                      {/* Errors */}
                      {validationResult.errors.length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                          <ul className="space-y-2">
                            {validationResult.errors.map((error, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-red-500 mr-2 mt-1">•</span>
                                <span className="text-sm text-red-700">{error}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Warnings */}
                      {validationResult.warnings.length > 0 && (
                        <div>
                          <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
                          <ul className="space-y-2">
                            {validationResult.warnings.map((warning, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-yellow-500 mr-2 mt-1">•</span>
                                <span className="text-sm text-yellow-700">{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Code2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>Select a profile and enter a resource to validate</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}