'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FHIR_RESOURCES, FhirResourceInfo } from '@/lib/fhir-data';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  level: number;
  category: string;
  x: number;
  y: number;
  fx?: number;
  fy?: number;
}

interface Link {
  source: string;
  target: string;
  type: 'references' | 'related' | 'hierarchical';
}

interface ResourceGraphProps {
  focusResource?: string;
  onNodeClick?: (resourceName: string) => void;
  height?: number;
}

export default function ResourceGraph({ focusResource, onNodeClick, height = 600 }: ResourceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(focusResource || null);

  const levelColors = {
    1: '#ef4444', // red
    2: '#f97316', // orange  
    3: '#eab308', // yellow
    4: '#22c55e', // green
    5: '#3b82f6'  // blue
  };

  const categoryColors = {
    foundation: '#6b7280',
    support: '#8b5cf6',
    administrative: '#3b82f6',
    clinical: '#22c55e',
    reasoning: '#6366f1'
  };

  // Generate nodes and links from FHIR resources
  const generateGraphData = () => {
    const nodes: Node[] = [];
    const links: Link[] = [];
    const resources = Object.values(FHIR_RESOURCES);

    // Create nodes
    resources.forEach((resource, index) => {
      const angle = (index / resources.length) * 2 * Math.PI;
      const radius = 150 + resource.level * 50;
      
      nodes.push({
        id: resource.name,
        name: resource.name,
        level: resource.level,
        category: resource.category,
        x: Math.cos(angle) * radius + 400,
        y: Math.sin(angle) * radius + 300
      });
    });

    // Create links based on relationships
    resources.forEach(resource => {
      if (resource.relatedResources) {
        resource.relatedResources.forEach(relatedName => {
          if (FHIR_RESOURCES[relatedName]) {
            links.push({
              source: resource.name,
              target: relatedName,
              type: 'related'
            });
          }
        });
      }

      // Add hierarchical links (same level resources)
      const sameLevel = resources.filter(r => 
        r.level === resource.level && r.name !== resource.name
      ).slice(0, 2);
      
      sameLevel.forEach(related => {
        if (!links.some(l => 
          (l.source === resource.name && l.target === related.name) ||
          (l.source === related.name && l.target === resource.name)
        )) {
          links.push({
            source: resource.name,
            target: related.name,
            type: 'hierarchical'
          });
        }
      });

      // Add reference links for common patterns
      if (resource.name === 'Patient') {
        ['Observation', 'Condition', 'Procedure', 'MedicationRequest'].forEach(target => {
          if (FHIR_RESOURCES[target]) {
            links.push({
              source: resource.name,
              target,
              type: 'references'
            });
          }
        });
      }
    });

    return { nodes, links };
  };

  const { nodes, links } = generateGraphData();

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node.id);
    if (onNodeClick) {
      onNodeClick(node.id);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  const getLinkColor = (type: string) => {
    switch (type) {
      case 'references': return '#ef4444';
      case 'related': return '#22c55e';
      case 'hierarchical': return '#94a3b8';
      default: return '#e2e8f0';
    }
  };

  const isNodeHighlighted = (nodeId: string) => {
    if (!selectedNode) return false;
    if (nodeId === selectedNode) return true;
    
    // Highlight connected nodes
    return links.some(link => 
      (link.source === selectedNode && link.target === nodeId) ||
      (link.target === selectedNode && link.source === nodeId)
    );
  };

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 hover:bg-gray-100 rounded"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>References</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Related</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-slate-400 mr-2"></div>
            <span>Hierarchical</span>
          </div>
        </div>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-sm border border-gray-200 p-3 max-w-xs">
          <h4 className="font-medium text-gray-900">{selectedNode}</h4>
          <p className="text-sm text-gray-600 mt-1">
            {FHIR_RESOURCES[selectedNode]?.description}
          </p>
          <div className="flex items-center mt-2 space-x-2">
            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
              Level {FHIR_RESOURCES[selectedNode]?.level}
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
              {FHIR_RESOURCES[selectedNode]?.category}
            </span>
          </div>
        </div>
      )}

      {/* SVG Graph */}
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`${-pan.x} ${-pan.y} ${800 / zoom} ${600 / zoom}`}
        className="cursor-move"
      >
        {/* Links */}
        <g>
          {links.map((link, index) => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);
            
            if (!sourceNode || !targetNode) return null;

            const isHighlighted = selectedNode && (
              link.source === selectedNode || link.target === selectedNode
            );

            return (
              <line
                key={index}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={getLinkColor(link.type)}
                strokeWidth={isHighlighted ? 3 : 1}
                strokeOpacity={isHighlighted ? 0.8 : 0.3}
                strokeDasharray={link.type === 'hierarchical' ? '5,5' : 'none'}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map(node => {
            const isHighlighted = isNodeHighlighted(node.id);
            const isSelected = selectedNode === node.id;
            
            return (
              <g key={node.id}>
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 25 : isHighlighted ? 20 : 15}
                  fill={categoryColors[node.category as keyof typeof categoryColors]}
                  stroke={levelColors[node.level as keyof typeof levelColors]}
                  strokeWidth={isSelected ? 4 : isHighlighted ? 3 : 2}
                  opacity={selectedNode && !isHighlighted ? 0.3 : 1}
                  className="cursor-pointer hover:opacity-80 transition-all duration-200"
                  onClick={() => handleNodeClick(node)}
                />
                
                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y + 35}
                  textAnchor="middle"
                  fontSize={isSelected ? 14 : isHighlighted ? 12 : 10}
                  fontWeight={isSelected ? 'bold' : isHighlighted ? 'medium' : 'normal'}
                  fill={isSelected ? '#1f2937' : '#6b7280'}
                  opacity={selectedNode && !isHighlighted ? 0.5 : 1}
                  className="cursor-pointer select-none"
                  onClick={() => handleNodeClick(node)}
                >
                  {node.name}
                </text>
                
                {/* Level indicator */}
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="white"
                  className="select-none pointer-events-none"
                >
                  {node.level}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}