'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Server, 
  Plus, 
  Play, 
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download,
  Upload,
  Settings,
  Eye,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react';
import { fhirClient, FHIRServer, FHIRBundle } from '@/lib/fhir-client';
import JsonViewer from '@/components/JsonViewer';

export default function ServersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'servers' | 'search' | 'test'>('servers');
  const [servers, setServers] = useState<FHIRServer[]>([]);
  const [activeServer, setActiveServer] = useState<FHIRServer | null>(null);
  const [showAddServer, setShowAddServer] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [connectionResults, setConnectionResults] = useState<Map<string, any>>(new Map());
  
  // Search state
  const [selectedResourceType, setSelectedResourceType] = useState('Patient');
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<FHIRBundle | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // New server form
  const [newServer, setNewServer] = useState({
    id: '',
    name: '',
    baseUrl: '',
    description: '',
    version: 'R4',
    authType: 'none'
  });

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = () => {
    const allServers = fhirClient.getAllServers();
    setServers(allServers);
    
    const active = fhirClient.getActiveServer();
    setActiveServer(active);
  };

  const handleTestConnection = async (serverId: string) => {
    setTesting(serverId);
    const result = await fhirClient.testConnection(serverId);
    
    setConnectionResults(prev => new Map(prev.set(serverId, result)));
    setTesting(null);
    loadServers(); // Refresh to show updated status
  };

  const handleSetActive = (serverId: string) => {
    if (fhirClient.setActiveServer(serverId)) {
      loadServers();
    }
  };

  const handleAddServer = () => {
    if (!newServer.id || !newServer.name || !newServer.baseUrl) {
      return;
    }

    const server = fhirClient.addServer({
      id: newServer.id,
      name: newServer.name,
      baseUrl: newServer.baseUrl.replace(/\/$/, ''), // Remove trailing slash
      description: newServer.description,
      version: newServer.version as any,
      authentication: { type: newServer.authType as any }
    });

    if (server) {
      setShowAddServer(false);
      setNewServer({
        id: '',
        name: '',
        baseUrl: '',
        description: '',
        version: 'R4',
        authType: 'none'
      });
      loadServers();
    }
  };

  const handleDeleteServer = (serverId: string) => {
    if (confirm('Are you sure you want to delete this server?')) {
      fhirClient.deleteServer(serverId);
      loadServers();
    }
  };

  const handleSearch = async () => {
    if (!activeServer) {
      setSearchError('No active server selected');
      return;
    }

    setSearching(true);
    setSearchError(null);
    setSearchResults(null);

    // Filter out empty search parameters
    const filteredParams = Object.entries(searchParams)
      .filter(([_, value]) => value.trim() !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const result = await fhirClient.searchResources(selectedResourceType, filteredParams);
    
    if (result.success && result.data) {
      setSearchResults(result.data);
    } else {
      setSearchError(result.error || 'Search failed');
    }
    
    setSearching(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'offline':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const supportedResources = activeServer ? fhirClient.getSupportedResources(activeServer.id) : [];
  const searchParameters = activeServer ? fhirClient.getSearchParameters(selectedResourceType, activeServer.id) : [];

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
                <h1 className="text-3xl font-bold text-gray-900">FHIR Server Integration</h1>
                <p className="text-gray-600 mt-1">Connect and interact with live FHIR servers</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {activeServer && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
                  {getStatusIcon(activeServer.status)}
                  <span className="text-sm font-medium text-blue-900">
                    {activeServer.name}
                  </span>
                </div>
              )}
              <Server className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'servers', label: 'Server Management', icon: Server },
              { id: 'search', label: 'Resource Search', icon: Search },
              { id: 'test', label: 'API Testing', icon: Play }
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

        {/* Servers Tab */}
        {activeTab === 'servers' && (
          <div className="space-y-6">
            {/* Add Server Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Configured Servers</h2>
              <button
                onClick={() => setShowAddServer(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Server
              </button>
            </div>

            {/* Server List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servers.map(server => (
                <div key={server.id} className="bg-white rounded-lg shadow border">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{server.name}</h3>
                          {activeServer?.id === server.id && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{server.description}</p>
                        <p className="text-gray-500 text-xs font-mono mb-3">{server.baseUrl}</p>
                        
                        <div className="flex items-center space-x-2 mb-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(server.status)}`}>
                            {getStatusIcon(server.status)}
                            <span className="ml-1 capitalize">{server.status}</span>
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {server.version}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Connection Test Result */}
                    {connectionResults.has(server.id) && (
                      <div className="mb-4 p-3 rounded-lg text-sm">
                        {connectionResults.get(server.id).success ? (
                          <div className="bg-green-50 text-green-700 border border-green-200 rounded">
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Connection successful
                            </div>
                            {connectionResults.get(server.id).capabilities && (
                              <div className="mt-1 text-xs">
                                Server: {connectionResults.get(server.id).capabilities.software?.name || 'Unknown'}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-red-50 text-red-700 border border-red-200 rounded p-2">
                            <div className="flex items-center">
                              <XCircle className="h-4 w-4 mr-2" />
                              Connection failed
                            </div>
                            <div className="mt-1 text-xs">
                              {connectionResults.get(server.id).error}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Server Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTestConnection(server.id)}
                          disabled={testing === server.id}
                          className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
                        >
                          {testing === server.id ? (
                            <>
                              <Clock className="h-3 w-3 mr-1 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-1" />
                              Test
                            </>
                          )}
                        </button>
                        
                        {activeServer?.id !== server.id && (
                          <button
                            onClick={() => handleSetActive(server.id)}
                            className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                          >
                            Set Active
                          </button>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="Edit Server"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteServer(server.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Delete Server"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Server Form */}
            {showAddServer && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="border-b border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900">Add FHIR Server</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Server ID
                      </label>
                      <input
                        type="text"
                        value={newServer.id}
                        onChange={(e) => setNewServer({ ...newServer, id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="unique-server-id"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Server Name
                      </label>
                      <input
                        type="text"
                        value={newServer.name}
                        onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="My FHIR Server"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base URL
                      </label>
                      <input
                        type="url"
                        value={newServer.baseUrl}
                        onChange={(e) => setNewServer({ ...newServer, baseUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/fhir"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newServer.description}
                        onChange={(e) => setNewServer({ ...newServer, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        placeholder="Description of this server"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          FHIR Version
                        </label>
                        <select
                          value={newServer.version}
                          onChange={(e) => setNewServer({ ...newServer, version: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="R4">R4</option>
                          <option value="R5">R5</option>
                          <option value="STU3">STU3</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Authentication
                        </label>
                        <select
                          value={newServer.authType}
                          onChange={(e) => setNewServer({ ...newServer, authType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="none">None</option>
                          <option value="basic">Basic Auth</option>
                          <option value="bearer">Bearer Token</option>
                          <option value="oauth2">OAuth 2.0</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 p-4 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowAddServer(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddServer}
                      disabled={!newServer.id || !newServer.name || !newServer.baseUrl}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Add Server
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Search Form */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Resources</h3>
                
                {!activeServer ? (
                  <div className="text-center py-8">
                    <WifiOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No active server selected</p>
                    <button
                      onClick={() => setActiveTab('servers')}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Configure servers
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resource Type
                      </label>
                      <select
                        value={selectedResourceType}
                        onChange={(e) => setSelectedResourceType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {supportedResources.length > 0 ? (
                          supportedResources.map(resource => (
                            <option key={resource} value={resource}>
                              {resource}
                            </option>
                          ))
                        ) : (
                          <option value="Patient">Patient</option>
                        )}
                      </select>
                    </div>

                    {/* Search Parameters */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Parameters
                      </label>
                      <div className="space-y-3">
                        {searchParameters.length > 0 ? (
                          searchParameters.slice(0, 5).map(param => (
                            <div key={param.name}>
                              <label className="block text-xs text-gray-600 mb-1">
                                {param.name} ({param.type})
                              </label>
                              <input
                                type="text"
                                value={searchParams[param.name] || ''}
                                onChange={(e) => setSearchParams({
                                  ...searchParams,
                                  [param.name]: e.target.value
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder={param.documentation || `Enter ${param.name}`}
                              />
                            </div>
                          ))
                        ) : (
                          // Default search parameters for common resources
                          <>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                family (string)
                              </label>
                              <input
                                type="text"
                                value={searchParams.family || ''}
                                onChange={(e) => setSearchParams({
                                  ...searchParams,
                                  family: e.target.value
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Family name"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                given (string)
                              </label>
                              <input
                                type="text"
                                value={searchParams.given || ''}
                                onChange={(e) => setSearchParams({
                                  ...searchParams,
                                  given: e.target.value
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Given name"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleSearch}
                      disabled={searching}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {searching ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Search Results */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
                </div>
                <div className="p-4">
                  {searchError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-red-600 mr-2" />
                        <span className="text-red-700 font-medium">Search Error</span>
                      </div>
                      <p className="text-red-600 text-sm mt-1">{searchError}</p>
                    </div>
                  )}

                  {searchResults ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Found {searchResults.total || searchResults.entry?.length || 0} results
                        </span>
                        {searchResults.entry && searchResults.entry.length > 0 && (
                          <button
                            onClick={() => {
                              const blob = new Blob([JSON.stringify(searchResults, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `search-results-${Date.now()}.json`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </button>
                        )}
                      </div>

                      {searchResults.entry && searchResults.entry.length > 0 ? (
                        <div className="space-y-3">
                          {searchResults.entry.slice(0, 10).map((entry, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {entry.resource?.resourceType} - {entry.resource?.id}
                                  </h4>
                                  {entry.resource?.name && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {Array.isArray(entry.resource.name) 
                                        ? `${entry.resource.name[0]?.given?.join(' ')} ${entry.resource.name[0]?.family}`
                                        : entry.resource.name
                                      }
                                    </p>
                                  )}
                                  {entry.fullUrl && (
                                    <p className="text-xs text-gray-500 font-mono mt-1">
                                      {entry.fullUrl}
                                    </p>
                                  )}
                                </div>
                                <button
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                  onClick={() => {
                                    // Show resource details in modal or expand
                                    console.log('View resource:', entry.resource);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          {searchResults.entry.length > 10 && (
                            <div className="text-center py-4 text-sm text-gray-500">
                              Showing first 10 of {searchResults.entry.length} results
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p>No resources found matching your search criteria</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>Enter search criteria and click Search to find resources</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Tab */}
        {activeTab === 'test' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Testing Tools</h3>
            <div className="text-center py-12 text-gray-500">
              <Play className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>API testing interface coming soon...</p>
              <p className="text-sm mt-2">This will include tools for CRUD operations, custom requests, and response analysis.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}