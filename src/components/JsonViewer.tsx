import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  filename?: string;
  maxHeight?: string;
}

export default function JsonViewer({ data, filename, maxHeight = 'max-h-96' }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const toggleExpanded = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const renderValue = (value: any, path: string, depth: number = 0): React.ReactNode => {
    const indent = depth * 20;

    if (value === null) {
      return <span className="text-gray-500">null</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-blue-600">{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-green-600">{value}</span>;
    }

    if (typeof value === 'string') {
      return <span className="text-red-600">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      const isExpanded = expandedPaths.has(path);
      return (
        <div>
          <button
            onClick={() => toggleExpanded(path)}
            className="inline-flex items-center text-gray-700 hover:text-gray-900"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="ml-1 text-blue-600">[{value.length}]</span>
          </button>
          {isExpanded && (
            <div className="ml-6 border-l border-gray-200 pl-4">
              {value.map((item, index) => (
                <div key={index} className="py-1">
                  <span className="text-gray-500 text-sm">{index}: </span>
                  {renderValue(item, `${path}.${index}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      const isExpanded = expandedPaths.has(path);
      
      return (
        <div>
          <button
            onClick={() => toggleExpanded(path)}
            className="inline-flex items-center text-gray-700 hover:text-gray-900"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="ml-1 text-blue-600">{`{${keys.length}}`}</span>
          </button>
          {isExpanded && (
            <div className="ml-6 border-l border-gray-200 pl-4">
              {keys.map((key) => (
                <div key={key} className="py-1">
                  <span className="text-purple-600 font-medium">"{key}"</span>
                  <span className="text-gray-500">: </span>
                  {renderValue(value[key], `${path}.${key}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span className="text-gray-800">{String(value)}</span>;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          {filename && (
            <>
              <h4 className="text-sm font-medium text-gray-900">
                {filename.replace('.json', '').replace(/^[a-z]+-/, '')}
              </h4>
              <p className="text-xs text-gray-500 mt-1">{filename}</p>
            </>
          )}
        </div>
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
        >
          {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Content */}
      <div className={`p-4 bg-white font-mono text-sm overflow-auto ${maxHeight}`}>
        {renderValue(data, 'root')}
      </div>
    </div>
  );
}