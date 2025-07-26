// Advanced 3D visualization and interactive diagrams for FHIR resources

export interface Node3D {
  id: string;
  label: string;
  type: 'resource' | 'property' | 'reference' | 'concept';
  resourceType?: string;
  position: { x: number; y: number; z: number };
  size: number;
  color: string;
  metadata: any;
  connections: string[];
}

export interface Edge3D {
  id: string;
  source: string;
  target: string;
  type: 'reference' | 'contains' | 'extends' | 'validates' | 'maps-to';
  label: string;
  strength: number;
  color: string;
  animated: boolean;
}

export interface Visualization3DConfig {
  width: number;
  height: number;
  autoRotate: boolean;
  showLabels: boolean;
  showEdges: boolean;
  enablePhysics: boolean;
  cameraPosition: { x: number; y: number; z: number };
  lighting: {
    ambient: number;
    directional: number;
    shadows: boolean;
  };
  interactions: {
    zoom: boolean;
    rotate: boolean;
    select: boolean;
    hover: boolean;
  };
}

export interface VisualizationTheme {
  name: string;
  background: string;
  nodes: {
    resource: string;
    property: string;
    reference: string;
    concept: string;
  };
  edges: {
    reference: string;
    contains: string;
    extends: string;
    validates: string;
    mapsTo: string;
  };
  lighting: {
    ambient: string;
    directional: string;
  };
}

export const VISUALIZATION_THEMES: Record<string, VisualizationTheme> = {
  default: {
    name: 'Default',
    background: '#f8fafc',
    nodes: {
      resource: '#3b82f6',
      property: '#10b981',
      reference: '#f59e0b',
      concept: '#8b5cf6'
    },
    edges: {
      reference: '#ef4444',
      contains: '#06b6d4',
      extends: '#84cc16',
      validates: '#f97316',
      mapsTo: '#ec4899'
    },
    lighting: {
      ambient: '#ffffff',
      directional: '#fbbf24'
    }
  },
  dark: {
    name: 'Dark Mode',
    background: '#1f2937',
    nodes: {
      resource: '#60a5fa',
      property: '#34d399',
      reference: '#fbbf24',
      concept: '#a78bfa'
    },
    edges: {
      reference: '#f87171',
      contains: '#22d3ee',
      extends: '#a3e635',
      validates: '#fb923c',
      mapsTo: '#f472b6'
    },
    lighting: {
      ambient: '#374151',
      directional: '#fcd34d'
    }
  },
  medical: {
    name: 'Medical',
    background: '#fefefe',
    nodes: {
      resource: '#dc2626',
      property: '#059669',
      reference: '#7c3aed',
      concept: '#0891b2'
    },
    edges: {
      reference: '#be123c',
      contains: '#0369a1',
      extends: '#166534',
      validates: '#9333ea',
      mapsTo: '#be185d'
    },
    lighting: {
      ambient: '#ffffff',
      directional: '#dc2626'
    }
  }
};

export class Visualization3DEngine {
  private nodes: Map<string, Node3D> = new Map();
  private edges: Map<string, Edge3D> = new Map();
  private config: Visualization3DConfig;
  private theme: VisualizationTheme;
  private animationFrame: number | null = null;
  private isAnimating: boolean = false;

  constructor(config: Partial<Visualization3DConfig> = {}) {
    this.config = {
      width: 800,
      height: 600,
      autoRotate: false,
      showLabels: true,
      showEdges: true,
      enablePhysics: true,
      cameraPosition: { x: 0, y: 0, z: 100 },
      lighting: {
        ambient: 0.4,
        directional: 0.8,
        shadows: true
      },
      interactions: {
        zoom: true,
        rotate: true,
        select: true,
        hover: true
      },
      ...config
    };
    this.theme = VISUALIZATION_THEMES.default;
  }

  // Data management
  addNode(node: Omit<Node3D, 'position' | 'size' | 'color'>): Node3D {
    const fullNode: Node3D = {
      ...node,
      position: this.calculateNodePosition(node.id),
      size: this.calculateNodeSize(node.type, node.metadata),
      color: this.getNodeColor(node.type),
      connections: node.connections || []
    };
    
    this.nodes.set(node.id, fullNode);
    return fullNode;
  }

  addEdge(edge: Omit<Edge3D, 'color'>): Edge3D {
    const fullEdge: Edge3D = {
      ...edge,
      color: this.getEdgeColor(edge.type)
    };
    
    this.edges.set(edge.id, fullEdge);
    return fullEdge;
  }

  removeNode(nodeId: string): boolean {
    if (!this.nodes.has(nodeId)) return false;
    
    // Remove associated edges
    const edgesToRemove = Array.from(this.edges.values())
      .filter(edge => edge.source === nodeId || edge.target === nodeId)
      .map(edge => edge.id);
    
    edgesToRemove.forEach(edgeId => this.edges.delete(edgeId));
    
    return this.nodes.delete(nodeId);
  }

  removeEdge(edgeId: string): boolean {
    return this.edges.delete(edgeId);
  }

  clear(): void {
    this.nodes.clear();
    this.edges.clear();
  }

  // Visualization methods
  createFHIRResourceVisualization(resource: any): void {
    this.clear();
    
    // Add main resource node
    const mainNode = this.addNode({
      id: `${resource.resourceType}-${resource.id || 'main'}`,
      label: `${resource.resourceType}${resource.id ? ` (${resource.id})` : ''}`,
      type: 'resource',
      resourceType: resource.resourceType,
      metadata: resource,
      connections: []
    });

    // Process resource properties
    this.processResourceProperties(resource, mainNode.id, 0);
    
    // Apply physics layout
    this.applyForceDirectedLayout();
  }

  private processResourceProperties(obj: any, parentId: string, depth: number, path: string = ''): void {
    if (depth > 3) return; // Limit depth to prevent overcrowding

    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      const nodeId = `${parentId}-${currentPath}`;

      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          // Handle arrays
          if (value.length > 0) {
            const arrayNode = this.addNode({
              id: nodeId,
              label: `${key} (${value.length})`,
              type: 'property',
              metadata: { key, value, type: 'array' },
              connections: []
            });

            this.addEdge({
              id: `${parentId}-to-${nodeId}`,
              source: parentId,
              target: nodeId,
              type: 'contains',
              label: 'contains',
              strength: 0.8,
              animated: false
            });

            // Process array elements (limited)
            value.slice(0, 3).forEach((item, index) => {
              if (typeof item === 'object' && item !== null) {
                this.processResourceProperties(item, nodeId, depth + 1, `${currentPath}[${index}]`);
              }
            });
          }
        } else {
          // Handle objects
          if (this.isReference(value)) {
            // Handle FHIR references
            const refNode = this.addNode({
              id: nodeId,
              label: value.reference || value.display || key,
              type: 'reference',
              metadata: { key, value, type: 'reference' },
              connections: []
            });

            this.addEdge({
              id: `${parentId}-to-${nodeId}`,
              source: parentId,
              target: nodeId,
              type: 'reference',
              label: 'references',
              strength: 1.0,
              animated: true
            });
          } else {
            // Regular object
            const objNode = this.addNode({
              id: nodeId,
              label: value.display || value.text || key,
              type: 'property',
              metadata: { key, value, type: 'object' },
              connections: []
            });

            this.addEdge({
              id: `${parentId}-to-${nodeId}`,
              source: parentId,
              target: nodeId,
              type: 'contains',
              label: 'contains',
              strength: 0.6,
              animated: false
            });

            this.processResourceProperties(value, nodeId, depth + 1, currentPath);
          }
        }
      } else if (this.isImportantProperty(key)) {
        // Handle important primitive values
        const propNode = this.addNode({
          id: nodeId,
          label: `${key}: ${String(value)}`,
          type: 'property',
          metadata: { key, value, type: 'primitive' },
          connections: []
        });

        this.addEdge({
          id: `${parentId}-to-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'contains',
          label: 'has',
          strength: 0.4,
          animated: false
        });
      }
    });
  }

  private isReference(obj: any): boolean {
    return obj && (obj.reference || obj.identifier || obj.type === 'Reference');
  }

  private isImportantProperty(key: string): boolean {
    const importantProps = ['id', 'status', 'code', 'system', 'value', 'display', 'text', 'active'];
    return importantProps.includes(key);
  }

  // Layout algorithms
  private applyForceDirectedLayout(): void {
    const nodes = Array.from(this.nodes.values());
    const edges = Array.from(this.edges.values());
    
    // Initialize positions if not set
    nodes.forEach((node, index) => {
      if (!node.position || (node.position.x === 0 && node.position.y === 0 && node.position.z === 0)) {
        const angle = (index / nodes.length) * 2 * Math.PI;
        const radius = 30 + (index % 3) * 20;
        node.position = {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: (index % 5 - 2) * 10
        };
      }
    });

    // Apply force-directed algorithm (simplified)
    for (let iteration = 0; iteration < 100; iteration++) {
      // Repulsive forces between all nodes
      nodes.forEach(nodeA => {
        nodes.forEach(nodeB => {
          if (nodeA.id !== nodeB.id) {
            const dx = nodeA.position.x - nodeB.position.x;
            const dy = nodeA.position.y - nodeB.position.y;
            const dz = nodeA.position.z - nodeB.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1;
            const force = 500 / (distance * distance);
            
            nodeA.position.x += (dx / distance) * force * 0.1;
            nodeA.position.y += (dy / distance) * force * 0.1;
            nodeA.position.z += (dz / distance) * force * 0.1;
          }
        });
      });

      // Attractive forces for connected nodes
      edges.forEach(edge => {
        const sourceNode = this.nodes.get(edge.source);
        const targetNode = this.nodes.get(edge.target);
        
        if (sourceNode && targetNode) {
          const dx = targetNode.position.x - sourceNode.position.x;
          const dy = targetNode.position.y - sourceNode.position.y;
          const dz = targetNode.position.z - sourceNode.position.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1;
          const force = (distance - 30) * edge.strength;
          
          sourceNode.position.x += (dx / distance) * force * 0.05;
          sourceNode.position.y += (dy / distance) * force * 0.05;
          sourceNode.position.z += (dz / distance) * force * 0.05;
          
          targetNode.position.x -= (dx / distance) * force * 0.05;
          targetNode.position.y -= (dy / distance) * force * 0.05;
          targetNode.position.z -= (dz / distance) * force * 0.05;
        }
      });
    }
  }

  private calculateNodePosition(nodeId: string): { x: number; y: number; z: number } {
    // Default positioning - will be overridden by layout algorithm
    return { x: 0, y: 0, z: 0 };
  }

  private calculateNodeSize(type: Node3D['type'], metadata: any): number {
    const baseSizes = {
      resource: 10,
      property: 6,
      reference: 8,
      concept: 7
    };
    
    let size = baseSizes[type];
    
    // Adjust size based on metadata
    if (metadata) {
      if (type === 'resource' && metadata.id) size += 3;
      if (type === 'property' && Array.isArray(metadata.value)) {
        size += Math.min(metadata.value.length * 0.5, 5);
      }
    }
    
    return size;
  }

  private getNodeColor(type: Node3D['type']): string {
    return this.theme.nodes[type];
  }

  private getEdgeColor(type: Edge3D['type']): string {
    return this.theme.edges[type] || this.theme.edges.reference;
  }

  // Configuration methods
  setTheme(themeName: string): void {
    if (VISUALIZATION_THEMES[themeName]) {
      this.theme = VISUALIZATION_THEMES[themeName];
      this.updateColors();
    }
  }

  updateConfig(newConfig: Partial<Visualization3DConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  private updateColors(): void {
    this.nodes.forEach(node => {
      node.color = this.getNodeColor(node.type);
    });
    
    this.edges.forEach(edge => {
      edge.color = this.getEdgeColor(edge.type);
    });
  }

  // Animation methods
  startAnimation(): void {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.animate();
  }

  stopAnimation(): void {
    this.isAnimating = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private animate(): void {
    if (!this.isAnimating) return;
    
    // Update animated edges
    const time = Date.now() * 0.001;
    this.edges.forEach(edge => {
      if (edge.animated) {
        edge.strength = 0.8 + Math.sin(time * 2) * 0.2;
      }
    });
    
    // Auto-rotate if enabled
    if (this.config.autoRotate) {
      this.config.cameraPosition.x = Math.cos(time * 0.1) * 100;
      this.config.cameraPosition.z = Math.sin(time * 0.1) * 100;
    }
    
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  // Data export methods
  exportVisualization(): { nodes: Node3D[]; edges: Edge3D[]; config: Visualization3DConfig } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
      config: this.config
    };
  }

  importVisualization(data: { nodes: Node3D[]; edges: Edge3D[]; config?: Partial<Visualization3DConfig> }): void {
    this.clear();
    
    data.nodes.forEach(node => this.nodes.set(node.id, node));
    data.edges.forEach(edge => this.edges.set(edge.id, edge));
    
    if (data.config) {
      this.updateConfig(data.config);
    }
  }

  // Analysis methods
  getNetworkAnalytics() {
    const nodes = Array.from(this.nodes.values());
    const edges = Array.from(this.edges.values());
    
    const nodesByType = nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const edgesByType = edges.reduce((acc, edge) => {
      acc[edge.type] = (acc[edge.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const connectivity = nodes.map(node => {
      const connections = edges.filter(edge => 
        edge.source === node.id || edge.target === node.id
      ).length;
      return { nodeId: node.id, connections };
    }).sort((a, b) => b.connections - a.connections);
    
    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodesByType,
      edgesByType,
      mostConnected: connectivity.slice(0, 5),
      averageConnectivity: connectivity.length > 0 
        ? connectivity.reduce((sum, n) => sum + n.connections, 0) / connectivity.length 
        : 0,
      density: nodes.length > 1 
        ? edges.length / (nodes.length * (nodes.length - 1) / 2)
        : 0
    };
  }

  // Query methods
  findNode(predicate: (node: Node3D) => boolean): Node3D | undefined {
    return Array.from(this.nodes.values()).find(predicate);
  }

  findNodes(predicate: (node: Node3D) => boolean): Node3D[] {
    return Array.from(this.nodes.values()).filter(predicate);
  }

  getConnectedNodes(nodeId: string, depth: number = 1): Set<string> {
    const connected = new Set<string>();
    const queue = [{ id: nodeId, currentDepth: 0 }];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const { id, currentDepth } = queue.shift()!;
      
      if (visited.has(id) || currentDepth > depth) continue;
      visited.add(id);
      
      if (currentDepth > 0) connected.add(id);
      
      // Find connected nodes
      this.edges.forEach(edge => {
        if (edge.source === id && !visited.has(edge.target)) {
          queue.push({ id: edge.target, currentDepth: currentDepth + 1 });
        }
        if (edge.target === id && !visited.has(edge.source)) {
          queue.push({ id: edge.source, currentDepth: currentDepth + 1 });
        }
      });
    }
    
    return connected;
  }

  // Getters
  getNodes(): Node3D[] {
    return Array.from(this.nodes.values());
  }

  getEdges(): Edge3D[] {
    return Array.from(this.edges.values());
  }

  getConfig(): Visualization3DConfig {
    return { ...this.config };
  }

  getTheme(): VisualizationTheme {
    return { ...this.theme };
  }
}

// Utility functions
export function generateColorPalette(count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 137.508) % 360; // Golden angle
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  return colors;
}

export function calculateNodeDistribution(nodes: Node3D[]): { sphere: Node3D[]; grid: Node3D[]; tree: Node3D[] } {
  // Different distribution algorithms for different visualization needs
  return {
    sphere: distributeOnSphere(nodes),
    grid: distributeOnGrid(nodes),
    tree: distributeAsTree(nodes)
  };
}

function distributeOnSphere(nodes: Node3D[]): Node3D[] {
  const radius = 50;
  return nodes.map((node, index) => {
    const phi = Math.acos(1 - 2 * (index + 0.5) / nodes.length);
    const theta = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5);
    
    return {
      ...node,
      position: {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi)
      }
    };
  });
}

function distributeOnGrid(nodes: Node3D[]): Node3D[] {
  const gridSize = Math.ceil(Math.cbrt(nodes.length));
  const spacing = 20;
  
  return nodes.map((node, index) => {
    const x = (index % gridSize) * spacing;
    const y = (Math.floor(index / gridSize) % gridSize) * spacing;
    const z = Math.floor(index / (gridSize * gridSize)) * spacing;
    
    return {
      ...node,
      position: { x, y, z }
    };
  });
}

function distributeAsTree(nodes: Node3D[]): Node3D[] {
  // Simplified tree layout - in practice, you'd use the actual graph structure
  const levels = Math.ceil(Math.log2(nodes.length + 1));
  
  return nodes.map((node, index) => {
    const level = Math.floor(Math.log2(index + 1));
    const positionInLevel = index - (Math.pow(2, level) - 1);
    const maxInLevel = Math.pow(2, level);
    
    return {
      ...node,
      position: {
        x: (positionInLevel - maxInLevel / 2 + 0.5) * 30,
        y: -level * 40,
        z: 0
      }
    };
  });
}

// Export singleton
export const visualization3DEngine = new Visualization3DEngine();