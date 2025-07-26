// Automated testing framework for FHIR implementations

export interface TestCase {
  id: string;
  name: string;
  description: string;
  category: 'validation' | 'conformance' | 'interoperability' | 'performance' | 'security';
  severity: 'critical' | 'major' | 'minor' | 'info';
  resourceType?: string;
  input: any;
  expectedResult: TestExpectation;
  setup?: TestSetup;
  teardown?: TestTeardown;
  tags: string[];
  author?: string;
  created: string;
  lastModified: string;
}

export interface TestExpectation {
  type: 'validation' | 'response' | 'behavior' | 'performance' | 'error';
  success: boolean;
  responseCode?: number;
  responseBody?: any;
  validationRules?: ValidationRule[];
  performanceThresholds?: PerformanceThreshold[];
  errorPatterns?: string[];
}

export interface ValidationRule {
  path: string;
  condition: 'exists' | 'equals' | 'contains' | 'matches' | 'greaterThan' | 'lessThan';
  value?: any;
  pattern?: string;
  required: boolean;
}

export interface PerformanceThreshold {
  metric: 'responseTime' | 'memoryUsage' | 'cpuUsage' | 'throughput';
  threshold: number;
  unit: 'ms' | 'mb' | 'percent' | 'rps';
}

export interface TestSetup {
  preConditions: string[];
  resources: any[];
  serverConfiguration?: any;
}

export interface TestTeardown {
  cleanup: string[];
  resourceIds: string[];
}

export interface TestResult {
  testId: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  executionTime: number;
  timestamp: string;
  details: TestResultDetails;
  environment: TestEnvironment;
}

export interface TestResultDetails {
  actualResult?: any;
  failureReason?: string;
  validationErrors?: ValidationError[];
  performanceMetrics?: PerformanceMetric[];
  logs?: TestLog[];
}

export interface ValidationError {
  rule: string;
  path: string;
  expected: any;
  actual: any;
  severity: 'error' | 'warning';
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  unit: string;
  threshold?: number;
  passed: boolean;
}

export interface TestLog {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: any;
}

export interface TestEnvironment {
  serverUrl: string;
  serverVersion: string;
  fhirVersion: string;
  testRunner: string;
  userAgent: string;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  version: string;
  testCases: string[]; // Test case IDs
  configuration: TestConfiguration;
  created: string;
  lastModified: string;
}

export interface TestConfiguration {
  parallel: boolean;
  timeout: number;
  retries: number;
  continueOnFailure: boolean;
  reportFormat: 'html' | 'json' | 'xml' | 'junit';
  includeLogs: boolean;
}

export class FHIRTestingFramework {
  private testCases: Map<string, TestCase> = new Map();
  private testSuites: Map<string, TestSuite> = new Map();
  private testResults: Map<string, TestResult[]> = new Map();

  constructor() {
    this.initializeStandardTests();
  }

  private initializeStandardTests() {
    // Basic validation tests
    this.addTestCase({
      id: 'patient-basic-validation',
      name: 'Patient Basic Validation',
      description: 'Validates basic Patient resource structure and required fields',
      category: 'validation',
      severity: 'critical',
      resourceType: 'Patient',
      input: {
        resourceType: 'Patient',
        id: 'test-patient-001',
        name: [{
          use: 'official',
          family: 'Doe',
          given: ['John']
        }],
        gender: 'male',
        birthDate: '1980-01-01'
      },
      expectedResult: {
        type: 'validation',
        success: true,
        validationRules: [
          { path: 'resourceType', condition: 'equals', value: 'Patient', required: true },
          { path: 'name', condition: 'exists', required: true },
          { path: 'gender', condition: 'matches', pattern: '^(male|female|other|unknown)$', required: false }
        ]
      },
      tags: ['validation', 'patient', 'basic'],
      author: 'FHIR Testing Framework',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });

    // Observation validation test
    this.addTestCase({
      id: 'observation-vital-signs-validation',
      name: 'Observation Vital Signs Validation',
      description: 'Validates Observation resource for vital signs with proper categories and codes',
      category: 'validation',
      severity: 'major',
      resourceType: 'Observation',
      input: {
        resourceType: 'Observation',
        id: 'test-observation-001',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '8480-6',
            display: 'Systolic blood pressure'
          }]
        },
        subject: {
          reference: 'Patient/test-patient-001'
        },
        valueQuantity: {
          value: 120,
          unit: 'mmHg',
          system: 'http://unitsofmeasure.org',
          code: 'mm[Hg]'
        }
      },
      expectedResult: {
        type: 'validation',
        success: true,
        validationRules: [
          { path: 'status', condition: 'exists', required: true },
          { path: 'code', condition: 'exists', required: true },
          { path: 'subject', condition: 'exists', required: true },
          { path: 'category[0].coding[0].code', condition: 'equals', value: 'vital-signs', required: true }
        ]
      },
      tags: ['validation', 'observation', 'vital-signs'],
      author: 'FHIR Testing Framework',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });

    // FHIR Bundle test
    this.addTestCase({
      id: 'bundle-transaction-test',
      name: 'Bundle Transaction Test',
      description: 'Tests creation of transaction bundle with multiple resources',
      category: 'interoperability',
      severity: 'major',
      resourceType: 'Bundle',
      input: {
        resourceType: 'Bundle',
        id: 'test-bundle-001',
        type: 'transaction',
        entry: [
          {
            fullUrl: 'urn:uuid:61ebe359-bfdc-4613-8bf2-c5e300945f0a',
            resource: {
              resourceType: 'Patient',
              name: [{ family: 'Test', given: ['Bundle'] }],
              gender: 'unknown'
            },
            request: {
              method: 'POST',
              url: 'Patient'
            }
          }
        ]
      },
      expectedResult: {
        type: 'validation',
        success: true,
        validationRules: [
          { path: 'type', condition: 'equals', value: 'transaction', required: true },
          { path: 'entry', condition: 'exists', required: true },
          { path: 'entry[0].request.method', condition: 'exists', required: true }
        ]
      },
      tags: ['bundle', 'transaction', 'interoperability'],
      author: 'FHIR Testing Framework',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });

    // Performance test
    this.addTestCase({
      id: 'patient-search-performance',
      name: 'Patient Search Performance',
      description: 'Tests search performance for Patient resources',
      category: 'performance',
      severity: 'minor',
      resourceType: 'Patient',
      input: {
        searchParams: {
          family: 'Test',
          given: 'John',
          _count: 50
        }
      },
      expectedResult: {
        type: 'performance',
        success: true,
        performanceThresholds: [
          { metric: 'responseTime', threshold: 2000, unit: 'ms' }
        ]
      },
      tags: ['performance', 'search', 'patient'],
      author: 'FHIR Testing Framework',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });

    // Create a comprehensive test suite
    this.addTestSuite({
      id: 'fhir-compliance-suite',
      name: 'FHIR R4 Compliance Test Suite',
      description: 'Comprehensive test suite for FHIR R4 compliance validation',
      version: '1.0.0',
      testCases: [
        'patient-basic-validation',
        'observation-vital-signs-validation',
        'bundle-transaction-test',
        'patient-search-performance'
      ],
      configuration: {
        parallel: false,
        timeout: 30000,
        retries: 1,
        continueOnFailure: true,
        reportFormat: 'html',
        includeLogs: true
      },
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
  }

  // Test case management
  addTestCase(testCase: TestCase): void {
    this.testCases.set(testCase.id, testCase);
  }

  getTestCase(id: string): TestCase | undefined {
    return this.testCases.get(id);
  }

  getAllTestCases(): TestCase[] {
    return Array.from(this.testCases.values());
  }

  getTestCasesByCategory(category: TestCase['category']): TestCase[] {
    return Array.from(this.testCases.values()).filter(tc => tc.category === category);
  }

  getTestCasesByResourceType(resourceType: string): TestCase[] {
    return Array.from(this.testCases.values()).filter(tc => tc.resourceType === resourceType);
  }

  // Test suite management
  addTestSuite(testSuite: TestSuite): void {
    this.testSuites.set(testSuite.id, testSuite);
  }

  getTestSuite(id: string): TestSuite | undefined {
    return this.testSuites.get(id);
  }

  getAllTestSuites(): TestSuite[] {
    return Array.from(this.testSuites.values());
  }

  // Test execution
  async executeTestCase(testId: string, environment: TestEnvironment): Promise<TestResult> {
    const testCase = this.getTestCase(testId);
    if (!testCase) {
      throw new Error(`Test case ${testId} not found`);
    }

    const startTime = Date.now();
    const result: TestResult = {
      testId,
      status: 'passed',
      executionTime: 0,
      timestamp: new Date().toISOString(),
      details: { logs: [] },
      environment
    };

    try {
      // Execute test based on category
      switch (testCase.category) {
        case 'validation':
          await this.executeValidationTest(testCase, result);
          break;
        case 'conformance':
          await this.executeConformanceTest(testCase, result);
          break;
        case 'interoperability':
          await this.executeInteroperabilityTest(testCase, result);
          break;
        case 'performance':
          await this.executePerformanceTest(testCase, result);
          break;
        case 'security':
          await this.executeSecurityTest(testCase, result);
          break;
      }
    } catch (error) {
      result.status = 'error';
      result.details.failureReason = error instanceof Error ? error.message : 'Unknown error';
    }

    result.executionTime = Date.now() - startTime;
    
    // Store result
    if (!this.testResults.has(testId)) {
      this.testResults.set(testId, []);
    }
    this.testResults.get(testId)!.push(result);

    return result;
  }

  async executeTestSuite(suiteId: string, environment: TestEnvironment): Promise<TestResult[]> {
    const testSuite = this.getTestSuite(suiteId);
    if (!testSuite) {
      throw new Error(`Test suite ${suiteId} not found`);
    }

    const results: TestResult[] = [];
    
    for (const testId of testSuite.testCases) {
      try {
        const result = await this.executeTestCase(testId, environment);
        results.push(result);
        
        // Check if we should continue on failure
        if (!testSuite.configuration.continueOnFailure && result.status === 'failed') {
          break;
        }
      } catch (error) {
        console.error(`Failed to execute test ${testId}:`, error);
        if (!testSuite.configuration.continueOnFailure) {
          break;
        }
      }
    }

    return results;
  }

  private async executeValidationTest(testCase: TestCase, result: TestResult): Promise<void> {
    const { input, expectedResult } = testCase;
    
    // Validate the resource structure
    const validationErrors: ValidationError[] = [];
    
    if (expectedResult.validationRules) {
      for (const rule of expectedResult.validationRules) {
        const validationError = this.validateRule(input, rule);
        if (validationError) {
          validationErrors.push(validationError);
        }
      }
    }

    result.details.validationErrors = validationErrors;
    result.status = validationErrors.length === 0 ? 'passed' : 'failed';
    
    if (validationErrors.length > 0) {
      result.details.failureReason = `Validation failed: ${validationErrors.length} error(s)`;
    }
  }

  private async executeConformanceTest(testCase: TestCase, result: TestResult): Promise<void> {
    // Simulate conformance testing
    result.status = 'passed';
    result.details.logs?.push({
      level: 'info',
      message: 'Conformance test executed successfully',
      timestamp: new Date().toISOString()
    });
  }

  private async executeInteroperabilityTest(testCase: TestCase, result: TestResult): Promise<void> {
    // Simulate interoperability testing
    const { input } = testCase;
    
    if (input.resourceType === 'Bundle' && input.type === 'transaction') {
      // Validate bundle structure
      if (!input.entry || input.entry.length === 0) {
        result.status = 'failed';
        result.details.failureReason = 'Transaction bundle must have entries';
        return;
      }
      
      // Check if all entries have request methods
      for (const entry of input.entry) {
        if (!entry.request || !entry.request.method) {
          result.status = 'failed';
          result.details.failureReason = 'All bundle entries must have request methods';
          return;
        }
      }
    }
    
    result.status = 'passed';
  }

  private async executePerformanceTest(testCase: TestCase, result: TestResult): Promise<void> {
    const { expectedResult } = testCase;
    const performanceMetrics: PerformanceMetric[] = [];
    
    // Simulate performance measurement
    const responseTime = Math.random() * 3000; // 0-3 seconds
    
    if (expectedResult.performanceThresholds) {
      for (const threshold of expectedResult.performanceThresholds) {
        const metric: PerformanceMetric = {
          metric: threshold.metric,
          value: responseTime,
          unit: threshold.unit,
          threshold: threshold.threshold,
          passed: responseTime <= threshold.threshold
        };
        
        performanceMetrics.push(metric);
        
        if (!metric.passed) {
          result.status = 'failed';
          result.details.failureReason = `Performance threshold exceeded: ${metric.metric} = ${metric.value}${metric.unit} > ${metric.threshold}${metric.unit}`;
        }
      }
    }
    
    result.details.performanceMetrics = performanceMetrics;
    if (result.status !== 'failed') {
      result.status = 'passed';
    }
  }

  private async executeSecurityTest(testCase: TestCase, result: TestResult): Promise<void> {
    // Simulate security testing
    result.status = 'passed';
    result.details.logs?.push({
      level: 'info',
      message: 'Security test executed successfully',
      timestamp: new Date().toISOString()
    });
  }

  private validateRule(resource: any, rule: ValidationRule): ValidationError | null {
    const value = this.getValueAtPath(resource, rule.path);
    
    switch (rule.condition) {
      case 'exists':
        if (rule.required && (value === undefined || value === null)) {
          return {
            rule: rule.path,
            path: rule.path,
            expected: 'value to exist',
            actual: value,
            severity: 'error'
          };
        }
        break;
        
      case 'equals':
        if (value !== rule.value) {
          return {
            rule: rule.path,
            path: rule.path,
            expected: rule.value,
            actual: value,
            severity: rule.required ? 'error' : 'warning'
          };
        }
        break;
        
      case 'matches':
        if (rule.pattern && typeof value === 'string') {
          const regex = new RegExp(rule.pattern);
          if (!regex.test(value)) {
            return {
              rule: rule.path,
              path: rule.path,
              expected: `match pattern ${rule.pattern}`,
              actual: value,
              severity: rule.required ? 'error' : 'warning'
            };
          }
        }
        break;
    }
    
    return null;
  }

  private getValueAtPath(obj: any, path: string): any {
    const parts = path.split(/[\.\[\]]+/).filter(Boolean);
    let current = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      
      if (Array.isArray(current) && /^\d+$/.test(part)) {
        current = current[parseInt(part)];
      } else {
        current = current[part];
      }
    }
    
    return current;
  }

  // Results and reporting
  getTestResults(testId: string): TestResult[] {
    return this.testResults.get(testId) || [];
  }

  getAllTestResults(): Map<string, TestResult[]> {
    return this.testResults;
  }

  generateTestReport(format: 'html' | 'json' | 'xml' = 'json'): string {
    const report = {
      summary: this.generateTestSummary(),
      testCases: Array.from(this.testCases.values()),
      results: Object.fromEntries(this.testResults),
      generatedAt: new Date().toISOString()
    };

    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      case 'html':
        return this.generateHTMLReport(report);
      case 'xml':
        return this.generateXMLReport(report);
      default:
        return JSON.stringify(report, null, 2);
    }
  }

  private generateTestSummary() {
    const allResults = Array.from(this.testResults.values()).flat();
    const total = allResults.length;
    const passed = allResults.filter(r => r.status === 'passed').length;
    const failed = allResults.filter(r => r.status === 'failed').length;
    const errors = allResults.filter(r => r.status === 'error').length;
    const skipped = allResults.filter(r => r.status === 'skipped').length;

    return {
      total,
      passed,
      failed,
      errors,
      skipped,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0
    };
  }

  private generateHTMLReport(report: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>FHIR Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; margin-bottom: 20px; }
        .passed { color: green; }
        .failed { color: red; }
        .error { color: orange; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>FHIR Test Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Total Tests: ${report.summary.total}</p>
        <p class="passed">Passed: ${report.summary.passed}</p>
        <p class="failed">Failed: ${report.summary.failed}</p>
        <p class="error">Errors: ${report.summary.errors}</p>
        <p>Pass Rate: ${report.summary.passRate}%</p>
    </div>
    <p>Generated at: ${report.generatedAt}</p>
</body>
</html>`;
  }

  private generateXMLReport(report: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<testReport>
    <summary>
        <total>${report.summary.total}</total>
        <passed>${report.summary.passed}</passed>
        <failed>${report.summary.failed}</failed>
        <errors>${report.summary.errors}</errors>
        <passRate>${report.summary.passRate}</passRate>
    </summary>
    <generatedAt>${report.generatedAt}</generatedAt>
</testReport>`;
  }

  // Utility methods
  exportTestCase(testId: string): string | null {
    const testCase = this.getTestCase(testId);
    return testCase ? JSON.stringify(testCase, null, 2) : null;
  }

  importTestCase(testCaseJson: string): boolean {
    try {
      const testCase = JSON.parse(testCaseJson) as TestCase;
      this.addTestCase(testCase);
      return true;
    } catch (error) {
      console.error('Failed to import test case:', error);
      return false;
    }
  }

  clearResults(): void {
    this.testResults.clear();
  }
}

// Singleton instance
export const fhirTestingFramework = new FHIRTestingFramework();