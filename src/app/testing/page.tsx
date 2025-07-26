'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Play, 
  Square,
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Download,
  Plus,
  Settings,
  FileText,
  BarChart3,
  Zap,
  Shield,
  Network,
  Gauge
} from 'lucide-react';
import { 
  fhirTestingFramework, 
  TestCase, 
  TestSuite, 
  TestResult, 
  TestEnvironment 
} from '@/lib/testing-framework';

export default function TestingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'suites' | 'cases' | 'results'>('suites');
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testResults, setTestResults] = useState<Map<string, TestResult[]>>(new Map());
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<TestEnvironment>({
    serverUrl: 'https://hapi.fhir.org/baseR4',
    serverVersion: 'HAPI FHIR 6.0.0',
    fhirVersion: 'R4',
    testRunner: 'FHIR Explorer Testing Framework',
    userAgent: 'FHIR-Explorer/1.0'
  });

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = () => {
    setTestSuites(fhirTestingFramework.getAllTestSuites());
    setTestCases(fhirTestingFramework.getAllTestCases());
    setTestResults(fhirTestingFramework.getAllTestResults());
  };

  const executeTestCase = async (testId: string) => {
    setRunningTests(prev => new Set(prev).add(testId));
    
    try {
      const result = await fhirTestingFramework.executeTestCase(testId, environment);
      setTestResults(fhirTestingFramework.getAllTestResults());
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }
  };

  const executeTestSuite = async (suiteId: string) => {
    setRunningTests(prev => new Set(prev).add(suiteId));
    
    try {
      const results = await fhirTestingFramework.executeTestSuite(suiteId, environment);
      setTestResults(fhirTestingFramework.getAllTestResults());
    } catch (error) {
      console.error('Test suite execution failed:', error);
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(suiteId);
        return newSet;
      });
    }
  };

  const downloadReport = (format: 'html' | 'json' | 'xml' = 'json') => {
    const report = fhirTestingFramework.generateTestReport(format);
    const blob = new Blob([report], { 
      type: format === 'html' ? 'text/html' : format === 'xml' ? 'text/xml' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fhir-test-report-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'skipped':
        return <Square className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'validation':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'conformance':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'interoperability':
        return <Network className="h-4 w-4 text-purple-500" />;
      case 'performance':
        return <Gauge className="h-4 w-4 text-orange-500" />;
      case 'security':
        return <Shield className="h-4 w-4 text-red-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'major':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTestSummary = () => {
    const allResults = Array.from(testResults.values()).flat();
    const total = allResults.length;
    const passed = allResults.filter(r => r.status === 'passed').length;
    const failed = allResults.filter(r => r.status === 'failed').length;
    const errors = allResults.filter(r => r.status === 'error').length;

    return { total, passed, failed, errors, passRate: total > 0 ? Math.round((passed / total) * 100) : 0 };
  };

  const summary = getTestSummary();

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
                <h1 className="text-3xl font-bold text-gray-900">FHIR Testing Framework</h1>
                <p className="text-gray-600 mt-1">Automated testing for FHIR implementations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right text-sm">
                <div className="text-gray-600">Test Server:</div>
                <div className="font-medium text-gray-900">{environment.serverUrl}</div>
              </div>
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Passed</p>
                <p className="text-2xl font-bold text-green-600">{summary.passed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-red-600">{summary.failed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Errors</p>
                <p className="text-2xl font-bold text-orange-600">{summary.errors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Gauge className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pass Rate</p>
                <p className="text-2xl font-bold text-purple-600">{summary.passRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'suites', label: 'Test Suites', count: testSuites.length },
              { id: 'cases', label: 'Test Cases', count: testCases.length },
              { id: 'results', label: 'Results', count: summary.total }
            ].map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {label}
                <span className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Test Suites Tab */}
        {activeTab === 'suites' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Test Suites</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => downloadReport('html')}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button>
                <button className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                  <Plus className="h-4 w-4 mr-2" />
                  New Suite
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {testSuites.map(suite => (
                <div key={suite.id} className="bg-white rounded-lg shadow border">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{suite.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{suite.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                          <span>Version: {suite.version}</span>
                          <span>{suite.testCases.length} tests</span>
                          <span className="capitalize">{suite.configuration.reportFormat} reports</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {suite.testCases.slice(0, 3).map(testId => {
                            const testCase = fhirTestingFramework.getTestCase(testId);
                            return testCase ? (
                              <span key={testId} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(testCase.severity)}`}>
                                {getCategoryIcon(testCase.category)}
                                <span className="ml-1">{testCase.category}</span>
                              </span>
                            ) : null;
                          })}
                          {suite.testCases.length > 3 && (
                            <span className="text-xs text-gray-500">+{suite.testCases.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Modified: {new Date(suite.lastModified).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => executeTestSuite(suite.id)}
                        disabled={runningTests.has(suite.id)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {runningTests.has(suite.id) ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Run Suite
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Cases Tab */}
        {activeTab === 'cases' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Test Cases</h2>
              <button className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                <Plus className="h-4 w-4 mr-2" />
                New Test Case
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test Case
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Result
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testCases.map(testCase => {
                      const results = testResults.get(testCase.id) || [];
                      const lastResult = results[results.length - 1];
                      
                      return (
                        <tr key={testCase.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{testCase.name}</div>
                              <div className="text-sm text-gray-500">{testCase.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getCategoryIcon(testCase.category)}
                              <span className="ml-2 text-sm text-gray-900 capitalize">{testCase.category}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(testCase.severity)}`}>
                              {testCase.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {testCase.resourceType || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lastResult ? (
                              <div className="flex items-center">
                                {getStatusIcon(lastResult.status)}
                                <span className="ml-2 text-sm text-gray-900 capitalize">{lastResult.status}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Not run</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => executeTestCase(testCase.id)}
                              disabled={runningTests.has(testCase.id)}
                              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:bg-gray-300"
                            >
                              {runningTests.has(testCase.id) ? (
                                <Clock className="h-3 w-3 animate-spin" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => fhirTestingFramework.clearResults()}
                  className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Clear Results
                </button>
                <button
                  onClick={() => downloadReport('json')}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {Array.from(testResults.entries()).map(([testId, results]) => {
                const testCase = fhirTestingFramework.getTestCase(testId);
                if (!testCase) return null;

                return (
                  <div key={testId} className="bg-white rounded-lg shadow border">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{testCase.name}</h3>
                        <span className="text-sm text-gray-500">{results.length} run(s)</span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {results.slice(-5).map((result, index) => (
                        <div key={index} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(result.status)}
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {result.status}
                              </span>
                              <span className="text-sm text-gray-500">
                                {result.executionTime}ms
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(result.timestamp).toLocaleString()}
                            </span>
                          </div>
                          
                          {result.details.failureReason && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                              {result.details.failureReason}
                            </div>
                          )}
                          
                          {result.details.validationErrors && result.details.validationErrors.length > 0 && (
                            <div className="mt-2">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Validation Errors:</h4>
                              <div className="space-y-1">
                                {result.details.validationErrors.map((error, i) => (
                                  <div key={i} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                                    <span className="font-medium">{error.path}:</span> Expected {error.expected}, got {error.actual}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {result.details.performanceMetrics && result.details.performanceMetrics.length > 0 && (
                            <div className="mt-2">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Metrics:</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {result.details.performanceMetrics.map((metric, i) => (
                                  <div key={i} className={`text-sm p-2 rounded ${
                                    metric.passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                  }`}>
                                    <span className="font-medium">{metric.metric}:</span> {metric.value}{metric.unit}
                                    {metric.threshold && ` (threshold: ${metric.threshold}${metric.unit})`}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {testResults.size === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Zap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No test results yet</h3>
                  <p>Run some tests to see results here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}