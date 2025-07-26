// FHIR Client for connecting to live FHIR servers

export interface FHIRServer {
  id: string;
  name: string;
  baseUrl: string;
  description: string;
  version: string; // R4, R5, etc.
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'oauth2';
    credentials?: {
      username?: string;
      password?: string;
      token?: string;
      clientId?: string;
      clientSecret?: string;
      tokenUrl?: string;
    };
  };
  capabilities?: FHIRCapabilityStatement;
  status: 'online' | 'offline' | 'unknown';
  lastChecked?: string;
}

export interface FHIRCapabilityStatement {
  resourceType: 'CapabilityStatement';
  id: string;
  status: string;
  date: string;
  publisher?: string;
  kind: 'instance' | 'capability' | 'requirements';
  software?: {
    name: string;
    version?: string;
  };
  fhirVersion: string;
  format: string[];
  rest: Array<{
    mode: 'client' | 'server';
    resource: Array<{
      type: string;
      interaction: Array<{
        code: 'read' | 'vread' | 'update' | 'patch' | 'delete' | 'history' | 'create' | 'search-type';
      }>;
      searchParam?: Array<{
        name: string;
        type: 'number' | 'date' | 'string' | 'token' | 'reference' | 'composite' | 'quantity' | 'uri' | 'special';
        documentation?: string;
      }>;
    }>;
  }>;
}

export interface FHIRSearchParams {
  [key: string]: string | string[];
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  id?: string;
  type: 'searchset' | 'collection' | 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history';
  total?: number;
  link?: Array<{
    relation: 'self' | 'next' | 'previous' | 'first' | 'last';
    url: string;
  }>;
  entry?: Array<{
    fullUrl?: string;
    resource?: any;
    search?: {
      mode?: 'match' | 'include' | 'outcome';
      score?: number;
    };
  }>;
}

export interface FHIROperationOutcome {
  resourceType: 'OperationOutcome';
  issue: Array<{
    severity: 'fatal' | 'error' | 'warning' | 'information';
    code: string;
    details?: {
      text?: string;
    };
    diagnostics?: string;
    location?: string[];
  }>;
}

export class FHIRClient {
  private servers: Map<string, FHIRServer> = new Map();
  private activeServerId: string | null = null;

  constructor() {
    this.initializeTestServers();
  }

  private initializeTestServers() {
    // Add some public FHIR test servers
    const testServers: FHIRServer[] = [
      {
        id: 'hapi-r4',
        name: 'HAPI FHIR R4 Test Server',
        baseUrl: 'https://hapi.fhir.org/baseR4',
        description: 'Public HAPI FHIR R4 test server provided by University Health Network',
        version: 'R4',
        authentication: { type: 'none' },
        status: 'unknown'
      },
      {
        id: 'test-fhir',
        name: 'test.fhir.org',
        baseUrl: 'https://test.fhir.org/r4',
        description: 'HL7 FHIR test server',
        version: 'R4',
        authentication: { type: 'none' },
        status: 'unknown'
      },
      {
        id: 'local-server',
        name: 'Local FHIR Server',
        baseUrl: 'http://localhost:8080/fhir',
        description: 'Local development FHIR server',
        version: 'R4',
        authentication: { type: 'none' },
        status: 'unknown'
      }
    ];

    testServers.forEach(server => {
      this.servers.set(server.id, server);
    });
  }

  // Server Management
  getAllServers(): FHIRServer[] {
    return Array.from(this.servers.values());
  }

  getServer(id: string): FHIRServer | undefined {
    return this.servers.get(id);
  }

  addServer(server: Omit<FHIRServer, 'status' | 'lastChecked'>): FHIRServer {
    const newServer: FHIRServer = {
      ...server,
      status: 'unknown'
    };
    
    this.servers.set(server.id, newServer);
    return newServer;
  }

  updateServer(id: string, updates: Partial<FHIRServer>): FHIRServer | null {
    const existing = this.servers.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.servers.set(id, updated);
    return updated;
  }

  deleteServer(id: string): boolean {
    if (this.activeServerId === id) {
      this.activeServerId = null;
    }
    return this.servers.delete(id);
  }

  setActiveServer(id: string): boolean {
    if (this.servers.has(id)) {
      this.activeServerId = id;
      return true;
    }
    return false;
  }

  getActiveServer(): FHIRServer | null {
    return this.activeServerId ? this.servers.get(this.activeServerId) || null : null;
  }

  // Server Testing
  async testConnection(serverId: string): Promise<{ success: boolean; error?: string; capabilities?: FHIRCapabilityStatement }> {
    const server = this.servers.get(serverId);
    if (!server) {
      return { success: false, error: 'Server not found' };
    }

    try {
      const response = await this.makeRequest(server, 'metadata', 'GET');
      
      if (response.ok) {
        const capabilities = await response.json() as FHIRCapabilityStatement;
        
        // Update server status and capabilities
        this.updateServer(serverId, {
          status: 'online',
          lastChecked: new Date().toISOString(),
          capabilities
        });

        return { success: true, capabilities };
      } else {
        this.updateServer(serverId, {
          status: 'offline',
          lastChecked: new Date().toISOString()
        });

        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      this.updateServer(serverId, {
        status: 'offline',
        lastChecked: new Date().toISOString()
      });

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // FHIR Operations
  async searchResources(
    resourceType: string, 
    params?: FHIRSearchParams, 
    serverId?: string
  ): Promise<{ success: boolean; data?: FHIRBundle; error?: string }> {
    const server = serverId ? this.servers.get(serverId) : this.getActiveServer();
    if (!server) {
      return { success: false, error: 'No server selected' };
    }

    try {
      let url = resourceType;
      if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
          } else {
            searchParams.append(key, value);
          }
        });
        url += `?${searchParams.toString()}`;
      }

      const response = await this.makeRequest(server, url, 'GET');
      
      if (response.ok) {
        const bundle = await response.json() as FHIRBundle;
        return { success: true, data: bundle };
      } else {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error occurred' 
      };
    }
  }

  async readResource(
    resourceType: string, 
    id: string, 
    serverId?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const server = serverId ? this.servers.get(serverId) : this.getActiveServer();
    if (!server) {
      return { success: false, error: 'No server selected' };
    }

    try {
      const response = await this.makeRequest(server, `${resourceType}/${id}`, 'GET');
      
      if (response.ok) {
        const resource = await response.json();
        return { success: true, data: resource };
      } else {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error occurred' 
      };
    }
  }

  async createResource(
    resource: any, 
    serverId?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const server = serverId ? this.servers.get(serverId) : this.getActiveServer();
    if (!server) {
      return { success: false, error: 'No server selected' };
    }

    if (!resource.resourceType) {
      return { success: false, error: 'Resource must have a resourceType' };
    }

    try {
      const response = await this.makeRequest(
        server, 
        resource.resourceType, 
        'POST',
        resource
      );
      
      if (response.ok || response.status === 201) {
        const createdResource = await response.json();
        return { success: true, data: createdResource };
      } else {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error occurred' 
      };
    }
  }

  async updateResource(
    resource: any, 
    serverId?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const server = serverId ? this.servers.get(serverId) : this.getActiveServer();
    if (!server) {
      return { success: false, error: 'No server selected' };
    }

    if (!resource.resourceType || !resource.id) {
      return { success: false, error: 'Resource must have resourceType and id' };
    }

    try {
      const response = await this.makeRequest(
        server, 
        `${resource.resourceType}/${resource.id}`, 
        'PUT',
        resource
      );
      
      if (response.ok) {
        const updatedResource = await response.json();
        return { success: true, data: updatedResource };
      } else {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error occurred' 
      };
    }
  }

  async deleteResource(
    resourceType: string, 
    id: string, 
    serverId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const server = serverId ? this.servers.get(serverId) : this.getActiveServer();
    if (!server) {
      return { success: false, error: 'No server selected' };
    }

    try {
      const response = await this.makeRequest(server, `${resourceType}/${id}`, 'DELETE');
      
      if (response.ok || response.status === 204) {
        return { success: true };
      } else {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error occurred' 
      };
    }
  }

  // Helper method to make HTTP requests with authentication
  private async makeRequest(
    server: FHIRServer, 
    path: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any
  ): Promise<Response> {
    const url = `${server.baseUrl}/${path}`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/fhir+json',
      'Content-Type': 'application/fhir+json'
    };

    // Add authentication headers
    if (server.authentication) {
      switch (server.authentication.type) {
        case 'basic':
          if (server.authentication.credentials?.username && server.authentication.credentials?.password) {
            const credentials = btoa(
              `${server.authentication.credentials.username}:${server.authentication.credentials.password}`
            );
            headers['Authorization'] = `Basic ${credentials}`;
          }
          break;
        case 'bearer':
          if (server.authentication.credentials?.token) {
            headers['Authorization'] = `Bearer ${server.authentication.credentials.token}`;
          }
          break;
      }
    }

    const config: RequestInit = {
      method,
      headers,
      mode: 'cors' // Enable CORS
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(body);
    }

    return fetch(url, config);
  }

  // Utility methods
  getCapabilities(serverId?: string): FHIRCapabilityStatement | undefined {
    const server = serverId ? this.servers.get(serverId) : this.getActiveServer();
    return server?.capabilities;
  }

  getSupportedResources(serverId?: string): string[] {
    const capabilities = this.getCapabilities(serverId);
    if (!capabilities?.rest?.[0]?.resource) {
      return [];
    }

    return capabilities.rest[0].resource.map(r => r.type);
  }

  getSearchParameters(resourceType: string, serverId?: string): Array<{ name: string; type: string; documentation?: string }> {
    const capabilities = this.getCapabilities(serverId);
    if (!capabilities?.rest?.[0]?.resource) {
      return [];
    }

    const resourceConfig = capabilities.rest[0].resource.find(r => r.type === resourceType);
    return resourceConfig?.searchParam || [];
  }

  // Export server configuration
  exportServerConfig(serverId: string): string | null {
    const server = this.servers.get(serverId);
    if (!server) return null;

    // Remove sensitive data before export
    const exportData = {
      ...server,
      authentication: server.authentication ? {
        type: server.authentication.type,
        // Don't export credentials
      } : undefined
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Import server configuration
  importServerConfig(configJson: string): FHIRServer | null {
    try {
      const server = JSON.parse(configJson) as FHIRServer;
      
      // Validate required fields
      if (!server.id || !server.name || !server.baseUrl) {
        throw new Error('Invalid server configuration');
      }

      this.servers.set(server.id, server);
      return server;
    } catch (error) {
      console.error('Failed to import server configuration:', error);
      return null;
    }
  }
}

// Singleton instance
export const fhirClient = new FHIRClient();