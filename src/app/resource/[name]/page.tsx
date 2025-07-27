'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FHIR_RESOURCES, FHIR_LEVELS, FhirResourceInfo } from '@/lib/fhir-data';
import { loadExamplesForResource, getExampleDisplayName, FhirExample } from '@/lib/example-loader';
import { ArrowLeft, ExternalLink, Code, BookOpen, Boxes } from 'lucide-react';
import JsonViewer from '@/components/JsonViewer';
import SchemaViewer from '@/components/SchemaViewer';
import CodeGenerator from '@/components/CodeGenerator';
import Visualization3D from '@/components/Visualization3D';

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resourceName = params.name as string;
  
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'examples' | 'codegen' | 'visualization'>('overview');
  const [exampleData, setExampleData] = useState<FhirExample[]>([]);
  const [loading, setLoading] = useState(false);

  const resource: FhirResourceInfo | undefined = FHIR_RESOURCES[resourceName];

  useEffect(() => {
    loadExamples();
  }, [resourceName]);

  const loadExamples = async () => {
    setLoading(true);
    try {
      const examples = await loadExamplesForResource(resourceName);
      setExampleData(examples.slice(0, 3)); // Show first 3 examples
    } catch (error) {
      console.error('Error loading examples:', error);
      setExampleData([]);
    } finally {
      setLoading(false);
    }
  };

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Resource Not Found</h1>
          <p className="text-gray-600 mb-6">The resource "{resourceName}" could not be found.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Return to Explorer
          </button>
        </div>
      </div>
    );
  }

  const levelColors = {
    1: 'bg-red-100 text-red-800 border-red-200',
    2: 'bg-orange-100 text-orange-800 border-orange-200', 
    3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    4: 'bg-green-100 text-green-800 border-green-200',
    5: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const categoryColors = {
    foundation: 'bg-gray-100 text-gray-700 border-gray-200',
    support: 'bg-purple-100 text-purple-700 border-purple-200',
    administrative: 'bg-blue-100 text-blue-700 border-blue-200',
    clinical: 'bg-green-100 text-green-700 border-green-200',
    reasoning: 'bg-indigo-100 text-indigo-700 border-indigo-200'
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
                <h1 className="text-3xl font-bold text-gray-900">{resource.name}</h1>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${levelColors[resource.level]}`}>
                    Level {resource.level}: {FHIR_LEVELS[resource.level]}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border capitalize ${categoryColors[resource.category as keyof typeof categoryColors]}`}>
                    {resource.category}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href={`https://hl7.org/fhir/R4/${resource.name.toLowerCase()}.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Official Docs
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Description */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            {resource.description}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'schema', label: 'Schema', icon: Code },
                { id: 'examples', label: 'Examples', icon: ExternalLink, count: 0 },
                { id: 'visualization', label: '3D Visualization', icon: Boxes },
                { id: 'codegen', label: 'Code Generator', icon: Code }
              ].map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center space-x-2 ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {count !== undefined && count > 0 && (
                    <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab resource={resource} exampleCount={exampleData.length} />
            )}
            
            {activeTab === 'schema' && (
              <SchemaTab resource={resource} />
            )}
            
            {activeTab === 'examples' && (
              <ExamplesTab 
                resourceName={resourceName}
                examples={exampleData} 
                loading={loading}
              />
            )}
            
            {activeTab === 'visualization' && (
              <VisualizationTab resource={resource} examples={exampleData} />
            )}
            
            {activeTab === 'codegen' && (
              <CodeGeneratorTab resource={resource} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ resource, exampleCount }: { resource: FhirResourceInfo; exampleCount: number }) {
  const router = useRouter();
  
  const relatedResourcesData = resource.relatedResources
    ? resource.relatedResources.map(name => FHIR_RESOURCES[name]).filter(Boolean)
    : Object.values(FHIR_RESOURCES).filter(r => 
        r.level === resource.level && r.name !== resource.name
      ).slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">FHIR Level</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                Level {resource.level}: {FHIR_LEVELS[resource.level]}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900 capitalize">
                {resource.category}
              </dd>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Examples Available</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {exampleCount} example{exampleCount !== 1 ? 's' : ''}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Maturity Level</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {resource.maturityLevel || 'Standard'}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {resource.commonUses && resource.commonUses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Use Cases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resource.commonUses.map((useCase, index) => (
              <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <p className="text-sm text-blue-900">{useCase}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {resource.keyProperties && resource.keyProperties.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Properties</h3>
          <div className="flex flex-wrap gap-2">
            {resource.keyProperties.map((property) => (
              <span key={property} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {property}
              </span>
            ))}
          </div>
        </div>
      )}

      {relatedResourcesData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedResourcesData.map((related) => (
              <button
                key={related.name}
                onClick={() => router.push(`/resource/${related.name}`)}
                className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
              >
                <h4 className="font-medium text-gray-900">{related.name}</h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {related.description}
                </p>
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    Level {related.level}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SchemaTab({ resource }: { resource: FhirResourceInfo }) {
  return (
    <SchemaViewer 
      resourceName={resource.name}
      schema={undefined as any} // Let SchemaViewer use its mock data
    />
  );
}

function ExamplesTab({ 
  resourceName,
  examples, 
  loading 
}: { 
  resourceName: string;
  examples: FhirExample[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading examples...</p>
      </div>
    );
  }

  if (examples.length === 0) {
    return (
      <div className="text-center py-8">
        <ExternalLink className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Examples Available</h3>
        <p className="mt-1 text-sm text-gray-500">
          No example files are currently available for {resourceName} resources.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {examples.map((example) => (
        <div key={example.filename} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {getExampleDisplayName(example)}
              </h3>
              <span className="text-sm text-gray-500">{example.filename}</span>
            </div>
            {example.data.description && (
              <p className="text-sm text-gray-600 mt-1">{example.data.description}</p>
            )}
          </div>
          <div className="p-4">
            <JsonViewer 
              data={example.data} 
              filename={example.filename}
              maxHeight="max-h-96"
            />
          </div>
        </div>
      ))}
      
      <div className="text-center py-4 text-sm text-gray-500">
        Showing first {examples.length} examples for {resourceName}
      </div>
    </div>
  );
}

function VisualizationTab({ resource, examples }: { resource: FhirResourceInfo; examples: FhirExample[] }) {
  const [selectedExample, setSelectedExample] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Use first example with data as default visualization
  const defaultExample = examples.find(ex => ex.data)?.data;
  const visualizationData = selectedExample || defaultExample;

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Boxes className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-indigo-800">
              3D Visualization for {resource.name}
            </h3>
            <div className="mt-2 text-sm text-indigo-700">
              <p>
                Explore the structure and relationships of {resource.name} resources in an interactive 3D environment. 
                This visualization helps understand the complexity and connections within FHIR resources.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Example Selector */}
      {examples.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Select Example to Visualize:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setSelectedExample(example.data)}
                disabled={!example.data}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  selectedExample === example.data
                    ? 'border-blue-500 bg-blue-50'
                    : example.data
                    ? 'border-gray-300 hover:border-gray-400 bg-white'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              >
                <div className="font-medium text-sm">
                  {getExampleDisplayName(example)}
                </div>
                {example.data ? (
                  <div className="text-xs text-gray-600 mt-1">
                    {Object.keys(example.data).length} properties
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 mt-1">No data available</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3D Visualization */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {visualizationData ? (
          <Visualization3D
            data={visualizationData}
            width={800}
            height={600}
            onNodeSelect={setSelectedNode}
            className="w-full"
          />
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-500">
            <div className="text-center">
              <Boxes className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No visualization data available</h3>
              <p className="text-sm">
                {examples.length > 0 
                  ? 'Select an example above to visualize its structure'
                  : 'Load examples first to see 3D visualizations'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Selected Node Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Label:</dt>
                  <dd className="text-sm text-gray-900">{selectedNode.label}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type:</dt>
                  <dd className="text-sm text-gray-900 capitalize">{selectedNode.type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Connections:</dt>
                  <dd className="text-sm text-gray-900">{selectedNode.connections?.length || 0}</dd>
                </div>
                {selectedNode.resourceType && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Resource Type:</dt>
                    <dd className="text-sm text-gray-900">{selectedNode.resourceType}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-2">Metadata:</h5>
              <div className="bg-gray-50 rounded p-2 max-h-32 overflow-y-auto">
                <pre className="text-xs text-gray-700">
                  {JSON.stringify(selectedNode.metadata, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visualization Help */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">How to Use the 3D Visualization</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Navigation:</h5>
            <ul className="space-y-1">
              <li>• Drag to rotate the view</li>
              <li>• Scroll to zoom in/out</li>
              <li>• Click nodes to select them</li>
              <li>• Use controls for auto-rotation</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Node Types:</h5>
            <ul className="space-y-1">
              <li>• <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>Squares: Resources</li>
              <li>• <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>Circles: Properties</li>
              <li>• <span className="inline-block w-3 h-3 bg-orange-500 mr-2" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></span>Diamonds: References</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeGeneratorTab({ resource }: { resource: FhirResourceInfo }) {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Code className="h-5 w-5 text-purple-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800">
              Code Generator for {resource.name}
            </h3>
            <div className="mt-2 text-sm text-purple-700">
              <p>
                Generate TypeScript interfaces, JavaScript objects, JSON examples, and cURL commands 
                for the {resource.name} resource. Perfect for developers getting started with FHIR implementation.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <CodeGenerator resourceName={resource.name} />
    </div>
  );
}