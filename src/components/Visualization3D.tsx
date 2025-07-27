'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Play, 
  Pause, 
  Settings, 
  Download,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  Palette,
  BarChart3,
  Info,
  Mouse
} from 'lucide-react';
import { 
  visualization3DEngine, 
  Node3D, 
  Edge3D, 
  VISUALIZATION_THEMES,
  Visualization3DConfig 
} from '@/lib/visualization-3d';

interface Visualization3DProps {
  data?: any;
  width?: number;
  height?: number;
  className?: string;
  onNodeSelect?: (node: Node3D | null) => void;
  onNodeHover?: (node: Node3D | null) => void;
}

export default function Visualization3D({ 
  data, 
  width = 800, 
  height = 600, 
  className = '', 
  onNodeSelect,
  onNodeHover 
}: Visualization3DProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [engine] = useState(() => visualization3DEngine);
  const [selectedNode, setSelectedNode] = useState<Node3D | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node3D | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [cameraAngle, setCameraAngle] = useState({ x: 0, y: 0, z: 0 });
  const [zoom, setZoom] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<Visualization3DConfig>(engine.getConfig());
  const animationRef = useRef<number>();
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (data) {
      engine.createFHIRResourceVisualization(data);
      render();
    }
  }, [data]);

  useEffect(() => {
    engine.updateConfig({ width, height });
    setConfig(engine.getConfig());
    render();
  }, [width, height]);

  const render = useCallback(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const nodes = engine.getNodes();
    const edges = engine.getEdges();

    // Clear previous content
    svg.innerHTML = '';

    // Create main group with transforms
    const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mainGroup.setAttribute('transform', `translate(${width/2}, ${height/2}) scale(${zoom})`);
    svg.appendChild(mainGroup);

    // Render edges first (behind nodes)
    if (config.showEdges) {
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (sourceNode && targetNode) {
          renderEdge(mainGroup, edge, sourceNode, targetNode);
        }
      });
    }

    // Render nodes
    nodes.forEach(node => {
      renderNode(mainGroup, node);
    });

    // Add labels if enabled
    if (config.showLabels) {
      nodes.forEach(node => {
        renderLabel(mainGroup, node);
      });
    }
  }, [width, height, zoom, config, cameraAngle]);

  const renderNode = (parent: SVGElement, node: Node3D) => {
    const projected = project3DTo2D(node.position, cameraAngle);
    
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('transform', `translate(${projected.x}, ${projected.y})`);
    nodeGroup.setAttribute('data-node-id', node.id);
    nodeGroup.style.cursor = 'pointer';
    
    // Create node shape based on type
    let shape: SVGElement;
    switch (node.type) {
      case 'resource':
        shape = createResourceNode(node);
        break;
      case 'reference':
        shape = createReferenceNode(node);
        break;
      case 'property':
        shape = createPropertyNode(node);
        break;
      default:
        shape = createDefaultNode(node);
    }
    
    nodeGroup.appendChild(shape);
    
    // Add interaction events
    nodeGroup.addEventListener('click', () => handleNodeClick(node));
    nodeGroup.addEventListener('mouseenter', () => handleNodeHover(node));
    nodeGroup.addEventListener('mouseleave', () => handleNodeHover(null));
    
    parent.appendChild(nodeGroup);
  };

  const renderEdge = (parent: SVGElement, edge: Edge3D, source: Node3D, target: Node3D) => {
    const sourceProjected = project3DTo2D(source.position, cameraAngle);
    const targetProjected = project3DTo2D(target.position, cameraAngle);
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', sourceProjected.x.toString());
    line.setAttribute('y1', sourceProjected.y.toString());
    line.setAttribute('x2', targetProjected.x.toString());
    line.setAttribute('y2', targetProjected.y.toString());
    line.setAttribute('stroke', edge.color);
    line.setAttribute('stroke-width', (edge.strength * 2).toString());
    line.setAttribute('opacity', '0.6');
    
    if (edge.animated) {
      line.style.strokeDasharray = '5,5';
      line.style.animation = 'dash 1s linear infinite';
    }
    
    // Add arrowhead for directed edges
    if (edge.type === 'reference') {
      const marker = createArrowMarker(edge.color);
      line.setAttribute('marker-end', `url(#arrow-${edge.id})`);
      parent.appendChild(marker);
    }
    
    parent.appendChild(line);
  };

  const renderLabel = (parent: SVGElement, node: Node3D) => {
    const projected = project3DTo2D(node.position, cameraAngle);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', (projected.x + node.size + 5).toString());
    text.setAttribute('y', (projected.y + 4).toString());
    text.setAttribute('font-size', '10');
    text.setAttribute('font-family', 'sans-serif');
    text.setAttribute('fill', '#374151');
    text.textContent = node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label;
    
    parent.appendChild(text);
  };

  const createResourceNode = (node: Node3D): SVGElement => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', (-node.size).toString());
    rect.setAttribute('y', (-node.size).toString());
    rect.setAttribute('width', (node.size * 2).toString());
    rect.setAttribute('height', (node.size * 2).toString());
    rect.setAttribute('fill', node.color);
    rect.setAttribute('stroke', '#fff');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('rx', '4');
    
    if (selectedNode?.id === node.id) {
      rect.setAttribute('stroke', '#3b82f6');
      rect.setAttribute('stroke-width', '3');
    }
    
    return rect;
  };

  const createReferenceNode = (node: Node3D): SVGElement => {
    const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const size = node.size;
    diamond.setAttribute('points', `0,${-size} ${size},0 0,${size} ${-size},0`);
    diamond.setAttribute('fill', node.color);
    diamond.setAttribute('stroke', '#fff');
    diamond.setAttribute('stroke-width', '2');
    
    if (selectedNode?.id === node.id) {
      diamond.setAttribute('stroke', '#3b82f6');
      diamond.setAttribute('stroke-width', '3');
    }
    
    return diamond;
  };

  const createPropertyNode = (node: Node3D): SVGElement => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', node.size.toString());
    circle.setAttribute('fill', node.color);
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', '2');
    
    if (selectedNode?.id === node.id) {
      circle.setAttribute('stroke', '#3b82f6');
      circle.setAttribute('stroke-width', '3');
    }
    
    return circle;
  };

  const createDefaultNode = (node: Node3D): SVGElement => {
    return createPropertyNode(node);
  };

  const createArrowMarker = (color: string): SVGElement => {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', `arrow-${Math.random().toString(36).substr(2, 9)}`);
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0,0 0,6 9,3');
    polygon.setAttribute('fill', color);
    
    marker.appendChild(polygon);
    defs.appendChild(marker);
    
    return defs;
  };

  const project3DTo2D = (position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }) => {
    // Simple 3D to 2D projection with rotation
    const { x, y, z } = position;
    const { x: rx, y: ry } = rotation;
    
    // Apply rotations
    const cosX = Math.cos(rx);
    const sinX = Math.sin(rx);
    const cosY = Math.cos(ry);
    const sinY = Math.sin(ry);
    
    const rotatedY = y * cosX - z * sinX;
    const rotatedZ = y * sinX + z * cosX;
    const rotatedX = x * cosY + rotatedZ * sinY;
    const finalZ = -x * sinY + rotatedZ * cosY;
    
    // Perspective projection
    const perspective = 200;
    const projectedX = (rotatedX * perspective) / (perspective + finalZ + 100);
    const projectedY = (rotatedY * perspective) / (perspective + finalZ + 100);
    
    return { x: projectedX, y: projectedY };
  };

  const handleNodeClick = (node: Node3D) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
    onNodeSelect?.(selectedNode?.id === node.id ? null : node);
    render();
  };

  const handleNodeHover = (node: Node3D | null) => {
    setHoveredNode(node);
    onNodeHover?.(node);
  };

  const startAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const animate = () => {
      setCameraAngle(prev => ({
        ...prev,
        y: prev.y + 0.01
      }));
      
      // Continue animation if still animating
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const resetView = () => {
    setCameraAngle({ x: 0, y: 0, z: 0 });
    setZoom(1);
  };

  const changeTheme = (themeName: string) => {
    engine.setTheme(themeName);
    setCurrentTheme(themeName);
    render();
  };

  const updateConfigValue = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    engine.updateConfig(newConfig);
    setConfig(newConfig);
    render();
  };

  const exportVisualization = () => {
    const exportData = engine.exportVisualization();
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fhir-visualization-3d.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const analytics = engine.getNetworkAnalytics();

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    isAnimatingRef.current = isAnimating;
    
    if (isAnimating) {
      const animate = () => {
        setCameraAngle(prev => ({
          ...prev,
          y: prev.y + 0.01
        }));
        
        if (isAnimatingRef.current) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating]);

  return (
    <div className={`relative bg-white rounded-lg shadow ${className}`}>
      {/* Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 z-10 space-y-2">
          <div className="flex items-center space-x-2 bg-white rounded-lg shadow px-3 py-2">
            <button
              onClick={resetView}
              className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.min(prev * 1.2, 3))}
              className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.3))}
              className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
              title={isAnimating ? "Pause Animation" : "Start Animation"}
            >
              {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
          
          <div className="flex items-center space-x-2 bg-white rounded-lg shadow px-3 py-2">
            <button
              onClick={() => updateConfigValue('showLabels', !config.showLabels)}
              className={`p-1 transition-colors ${config.showLabels ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              title="Toggle Labels"
            >
              {config.showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
              title="Analytics"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={exportVisualization}
              className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
              title="Export"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Theme Selector */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow px-3 py-2">
          <select
            value={currentTheme}
            onChange={(e) => changeTheme(e.target.value)}
            className="text-sm border-none focus:ring-0"
          >
            {Object.entries(VISUALIZATION_THEMES).map(([key, theme]) => (
              <option key={key} value={key}>{theme.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main SVG Canvas */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg"
        style={{ background: VISUALIZATION_THEMES[currentTheme].background }}
        onMouseMove={(e) => {
          if (e.buttons === 1) { // Left mouse button held
            const deltaX = e.movementX;
            const deltaY = e.movementY;
            setCameraAngle(prev => ({
              ...prev,
              y: prev.y + deltaX * 0.01,
              x: prev.x + deltaY * 0.01
            }));
          }
        }}
      />

      {/* Controls Toggle */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute bottom-4 left-4 p-2 bg-white rounded-lg shadow text-gray-600 hover:text-gray-900 transition-colors"
        title={showControls ? "Hide Controls" : "Show Controls"}
      >
        {showControls ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 z-20 bg-white rounded-lg shadow p-4 w-64">
          <h3 className="font-semibold text-gray-900 mb-3">Visualization Settings</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Show Edges
              </label>
              <input
                type="checkbox"
                checked={config.showEdges}
                onChange={(e) => updateConfigValue('showEdges', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enable Physics
              </label>
              <input
                type="checkbox"
                checked={config.enablePhysics}
                onChange={(e) => updateConfigValue('enablePhysics', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auto Rotate
              </label>
              <input
                type="checkbox"
                checked={config.autoRotate}
                onChange={(e) => updateConfigValue('autoRotate', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(false)}
            className="mt-4 w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
          >
            Close
          </button>
        </div>
      )}

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="absolute bottom-16 left-4 z-20 bg-white rounded-lg shadow p-4 w-64">
          <h3 className="font-semibold text-gray-900 mb-3">Network Analytics</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Nodes:</span>
              <span className="font-medium">{analytics.totalNodes}</span>
            </div>
            <div className="flex justify-between">
              <span>Edges:</span>
              <span className="font-medium">{analytics.totalEdges}</span>
            </div>
            <div className="flex justify-between">
              <span>Density:</span>
              <span className="font-medium">{(analytics.density * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Connectivity:</span>
              <span className="font-medium">{analytics.averageConnectivity.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="mt-3">
            <h4 className="font-medium text-gray-900 mb-2">Most Connected:</h4>
            <div className="space-y-1 text-xs">
              {analytics.mostConnected.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="truncate">{item.nodeId.split('-').pop()}</span>
                  <span>{item.connections}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => setShowAnalytics(false)}
            className="mt-4 w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
          >
            Close
          </button>
        </div>
      )}

      {/* Node Info Panel */}
      {(selectedNode || hoveredNode) && (
        <div className="absolute bottom-4 right-4 z-20 bg-white rounded-lg shadow p-4 w-64">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-gray-900">
              {selectedNode ? 'Selected' : 'Hovered'} Node
            </h3>
          </div>
          
          {(selectedNode || hoveredNode) && (
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Label:</span>
                <span className="ml-2">{(selectedNode || hoveredNode)!.label}</span>
              </div>
              <div>
                <span className="font-medium">Type:</span>
                <span className="ml-2 capitalize">{(selectedNode || hoveredNode)!.type}</span>
              </div>
              <div>
                <span className="font-medium">Connections:</span>
                <span className="ml-2">{(selectedNode || hoveredNode)!.connections.length}</span>
              </div>
              {(selectedNode || hoveredNode)!.resourceType && (
                <div>
                  <span className="font-medium">Resource Type:</span>
                  <span className="ml-2">{(selectedNode || hoveredNode)!.resourceType}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 center z-10">
        <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded text-xs flex items-center space-x-2">
          <Mouse className="h-3 w-3" />
          <span>Drag to rotate • Scroll to zoom • Click nodes to select</span>
        </div>
      </div>
    </div>
  );
}