'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Lightbulb, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X, 
  ThumbsUp, 
  ThumbsDown,
  Wand2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Code,
  BookOpen
} from 'lucide-react';
import { aiAssistant, CodeSuggestion, ErrorDetection, ContextualHelp } from '@/lib/ai-assistant';

interface AIAssistantProps {
  code: string;
  resourceType?: string;
  onCodeUpdate?: (code: string) => void;
  isVisible?: boolean;
  onToggle?: () => void;
}

export default function AIAssistant({ 
  code, 
  resourceType, 
  onCodeUpdate, 
  isVisible = true, 
  onToggle 
}: AIAssistantProps) {
  const [analysis, setAnalysis] = useState<{
    suggestions: CodeSuggestion[];
    errors: ErrorDetection[];
    help: ContextualHelp[];
  }>({ suggestions: [], errors: [], help: [] });
  
  const [activeTab, setActiveTab] = useState<'suggestions' | 'errors' | 'help'>('suggestions');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const analyzeTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Debounce analysis to avoid too frequent updates
    if (analyzeTimeoutRef.current) {
      clearTimeout(analyzeTimeoutRef.current);
    }

    analyzeTimeoutRef.current = setTimeout(() => {
      analyzeCode();
    }, 1000);

    return () => {
      if (analyzeTimeoutRef.current) {
        clearTimeout(analyzeTimeoutRef.current);
      }
    };
  }, [code, resourceType]);

  const analyzeCode = async () => {
    if (!code.trim()) {
      setAnalysis({ suggestions: [], errors: [], help: [] });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = aiAssistant.analyzeCode(code, resourceType);
      setAnalysis(result);
      
      // Auto-select tab based on content
      if (result.errors.length > 0) {
        setActiveTab('errors');
      } else if (result.suggestions.length > 0) {
        setActiveTab('suggestions');
      } else if (result.help.length > 0) {
        setActiveTab('help');
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (suggestion: CodeSuggestion) => {
    if (onCodeUpdate) {
      onCodeUpdate(suggestion.code);
      aiAssistant.trackUserInteraction('accepted', suggestion.id);
    }
  };

  const rejectSuggestion = (suggestionId: string) => {
    aiAssistant.trackUserInteraction('rejected', suggestionId);
    // Remove suggestion from current list
    setAnalysis(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.id !== suggestionId)
    }));
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'completion':
        return <Code className="h-4 w-4 text-blue-500" />;
      case 'improvement':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'fix':
        return <Wand2 className="h-4 w-4 text-green-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
        title="Open AI Assistant"
      >
        <Bot className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="bg-white border-l border-gray-200 w-80 flex flex-col max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">AI Assistant</h3>
          {isAnalyzing && (
            <div className="flex items-center space-x-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span className="text-xs text-blue-600">Analyzing...</span>
            </div>
          )}
        </div>
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'suggestions', label: 'Suggestions', count: analysis.suggestions.length, icon: Lightbulb },
          { id: 'errors', label: 'Issues', count: analysis.errors.length, icon: AlertTriangle },
          { id: 'help', label: 'Help', count: analysis.help.length, icon: HelpCircle }
        ].map(({ id, label, count, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 text-sm font-medium transition-colors ${
              activeTab === id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {count > 0 && (
              <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${
                activeTab === id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="p-4 space-y-4">
            {analysis.suggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No suggestions available</p>
                <p className="text-xs mt-1">Try writing some FHIR JSON to get AI-powered suggestions</p>
              </div>
            ) : (
              analysis.suggestions.map(suggestion => (
                <div key={suggestion.id} className="border border-gray-200 rounded-lg">
                  <div className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        {getSuggestionIcon(suggestion.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">{suggestion.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                              {Math.round(suggestion.confidence * 100)}% confidence
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                              {suggestion.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => applySuggestion(suggestion)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Apply suggestion"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => rejectSuggestion(suggestion.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Reject suggestion"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleExpanded(suggestion.id)}
                      className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
                    >
                      <span>{expandedItems.has(suggestion.id) ? 'Hide details' : 'Show details'}</span>
                      <ArrowRight className={`h-3 w-3 transform transition-transform ${
                        expandedItems.has(suggestion.id) ? 'rotate-90' : ''
                      }`} />
                    </button>
                    
                    {expandedItems.has(suggestion.id) && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border">
                        <p className="text-xs text-gray-700 mb-3">{suggestion.explanation}</p>
                        <div className="bg-gray-900 rounded p-2 overflow-x-auto">
                          <pre className="text-xs text-green-400 whitespace-pre-wrap">
                            {suggestion.code}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Errors Tab */}
        {activeTab === 'errors' && (
          <div className="p-4 space-y-4">
            {analysis.errors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm">No issues found</p>
                <p className="text-xs mt-1">Your FHIR resource looks good!</p>
              </div>
            ) : (
              analysis.errors.map(error => (
                <div key={error.id} className={`border rounded-lg ${
                  error.severity === 'error' ? 'border-red-200 bg-red-50' :
                  error.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  <div className="p-3">
                    <div className="flex items-start space-x-2">
                      {getSeverityIcon(error.severity)}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">{error.title}</h4>
                        <p className="text-xs text-gray-700 mt-1">{error.message}</p>
                        {error.fix && (
                          <div className="mt-2 p-2 bg-white rounded border text-xs">
                            <strong>Fix:</strong> {error.fix}
                          </div>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            error.severity === 'error' ? 'bg-red-100 text-red-800' :
                            error.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {error.severity}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                            {error.type}
                          </span>
                        </div>
                        {error.references && error.references.length > 0 && (
                          <div className="mt-2">
                            {error.references.map((ref, index) => (
                              <a
                                key={index}
                                href={ref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-700 underline mr-2"
                              >
                                Reference
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Help Tab */}
        {activeTab === 'help' && (
          <div className="p-4 space-y-4">
            {analysis.help.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No contextual help available</p>
                <p className="text-xs mt-1">Help will appear based on your code content</p>
              </div>
            ) : (
              analysis.help.map(help => (
                <div key={help.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">{help.title}</h4>
                      <p className="text-xs text-gray-700 mt-1 whitespace-pre-line">{help.content}</p>
                      
                      {help.examples && help.examples.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-xs font-medium text-gray-900 mb-1">Examples:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {help.examples.map((example, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-blue-500 mr-1">•</span>
                                <span>{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {help.links && help.links.length > 0 && (
                        <div className="mt-3 space-x-2">
                          {help.links.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 underline"
                            >
                              {link.text}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Powered by AI</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {/* Open settings */}}
              className="text-gray-400 hover:text-gray-600"
              title="Settings"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}