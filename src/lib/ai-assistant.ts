// AI-powered assistance for intelligent code suggestions and error detection

export interface AIAssistantConfig {
  enableSuggestions: boolean;
  enableErrorDetection: boolean;
  enableContextualHelp: boolean;
  suggestionThreshold: number; // 0-1, confidence threshold for showing suggestions
}

export interface CodeSuggestion {
  id: string;
  type: 'completion' | 'improvement' | 'fix' | 'alternative';
  title: string;
  description: string;
  code: string;
  explanation: string;
  confidence: number; // 0-1
  category: 'syntax' | 'validation' | 'best-practice' | 'performance' | 'security';
  position?: {
    line: number;
    column: number;
  };
}

export interface ErrorDetection {
  id: string;
  severity: 'error' | 'warning' | 'info';
  type: 'syntax' | 'validation' | 'logic' | 'best-practice';
  title: string;
  message: string;
  fix?: string;
  position?: {
    line: number;
    column: number;
    length: number;
  };
  references?: string[];
}

export interface ContextualHelp {
  id: string;
  type: 'definition' | 'example' | 'documentation' | 'tutorial';
  title: string;
  content: string;
  links?: Array<{
    text: string;
    url: string;
  }>;
  examples?: string[];
}

export interface AIContext {
  currentResource?: string;
  userExperience: 'beginner' | 'intermediate' | 'advanced';
  recentErrors: string[];
  learningGoals: string[];
  preferredLanguage: string;
}

export class AIAssistant {
  private config: AIAssistantConfig;
  private context: AIContext;
  private suggestionCache: Map<string, CodeSuggestion[]> = new Map();
  private errorPatterns: Map<string, ErrorDetection> = new Map();
  private helpDatabase: Map<string, ContextualHelp> = new Map();

  constructor(config: AIAssistantConfig = {
    enableSuggestions: true,
    enableErrorDetection: true,
    enableContextualHelp: true,
    suggestionThreshold: 0.7
  }) {
    this.config = config;
    this.context = {
      userExperience: 'beginner',
      recentErrors: [],
      learningGoals: [],
      preferredLanguage: 'en'
    };
    
    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase() {
    // Initialize common error patterns
    this.errorPatterns.set('missing-resourcetype', {
      id: 'missing-resourcetype',
      severity: 'error',
      type: 'validation',
      title: 'Missing resourceType',
      message: 'Every FHIR resource must have a resourceType field',
      fix: 'Add "resourceType": "ResourceName" to the root of your JSON object',
      references: ['https://hl7.org/fhir/R4/resource.html#Resource']
    });

    this.errorPatterns.set('invalid-date-format', {
      id: 'invalid-date-format',
      severity: 'error',
      type: 'validation',
      title: 'Invalid date format',
      message: 'FHIR dates must be in YYYY-MM-DD format',
      fix: 'Use ISO 8601 date format: YYYY-MM-DD',
      references: ['https://hl7.org/fhir/R4/datatypes.html#date']
    });

    this.errorPatterns.set('missing-required-field', {
      id: 'missing-required-field',
      severity: 'error',
      type: 'validation',
      title: 'Missing required field',
      message: 'This field is required by the FHIR specification',
      references: ['https://hl7.org/fhir/R4/']
    });

    this.errorPatterns.set('invalid-reference-format', {
      id: 'invalid-reference-format',
      severity: 'warning',
      type: 'validation',
      title: 'Invalid reference format',
      message: 'FHIR references should follow the format "ResourceType/id"',
      fix: 'Use format: "Patient/123" or "https://example.com/fhir/Patient/123"',
      references: ['https://hl7.org/fhir/R4/references.html']
    });

    // Initialize contextual help
    this.helpDatabase.set('Patient', {
      id: 'patient-help',
      type: 'definition',
      title: 'Patient Resource',
      content: 'The Patient resource covers data about patients and animals receiving care or other health-related services.',
      links: [
        { text: 'Official Documentation', url: 'https://hl7.org/fhir/R4/patient.html' },
        { text: 'Examples', url: 'https://hl7.org/fhir/R4/patient-examples.html' }
      ],
      examples: [
        'Simple patient with name and gender',
        'Patient with multiple identifiers',
        'Patient with contact information'
      ]
    });

    this.helpDatabase.set('Observation', {
      id: 'observation-help',
      type: 'definition',
      title: 'Observation Resource',
      content: 'Observations are central to healthcare and are used to support diagnosis, monitor progress, determine baselines and patterns.',
      links: [
        { text: 'Official Documentation', url: 'https://hl7.org/fhir/R4/observation.html' },
        { text: 'Vital Signs Profile', url: 'https://hl7.org/fhir/R4/observation-vitalsigns.html' }
      ],
      examples: [
        'Simple vital signs observation',
        'Laboratory result',
        'Observation with components'
      ]
    });
  }

  // Main AI analysis methods
  analyzeCode(code: string, resourceType?: string): {
    suggestions: CodeSuggestion[];
    errors: ErrorDetection[];
    help: ContextualHelp[];
  } {
    const suggestions = this.generateSuggestions(code, resourceType);
    const errors = this.detectErrors(code, resourceType);
    const help = this.getContextualHelp(code, resourceType);

    return { suggestions, errors, help };
  }

  private generateSuggestions(code: string, resourceType?: string): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];
    
    try {
      const parsed = JSON.parse(code);
      
      // Resource-specific suggestions
      if (resourceType === 'Patient') {
        suggestions.push(...this.generatePatientSuggestions(parsed));
      } else if (resourceType === 'Observation') {
        suggestions.push(...this.generateObservationSuggestions(parsed));
      }
      
      // General FHIR suggestions
      suggestions.push(...this.generateGeneralSuggestions(parsed));
      
    } catch (error) {
      // JSON parsing error - suggest JSON formatting
      suggestions.push({
        id: 'json-format-fix',
        type: 'fix',
        title: 'Fix JSON formatting',
        description: 'The JSON appears to be malformed',
        code: this.suggestJSONFix(code),
        explanation: 'Proper JSON formatting is required for FHIR resources',
        confidence: 0.9,
        category: 'syntax'
      });
    }

    return suggestions.filter(s => s.confidence >= this.config.suggestionThreshold);
  }

  private generatePatientSuggestions(patient: any): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];

    // Suggest adding identifier if missing
    if (!patient.identifier || patient.identifier.length === 0) {
      suggestions.push({
        id: 'patient-add-identifier',
        type: 'improvement',
        title: 'Add patient identifier',
        description: 'Patient resources should have at least one identifier',
        code: JSON.stringify({
          ...patient,
          identifier: [{
            use: 'usual',
            system: 'http://hospital.example.org/patient-ids',
            value: 'MRN123456'
          }]
        }, null, 2),
        explanation: 'Identifiers help uniquely identify patients across different systems',
        confidence: 0.8,
        category: 'best-practice'
      });
    }

    // Suggest name formatting improvements
    if (patient.name && patient.name[0] && !patient.name[0].use) {
      suggestions.push({
        id: 'patient-name-use',
        type: 'improvement',
        title: 'Add name use indicator',
        description: 'Specify how the name should be used',
        code: JSON.stringify({
          ...patient,
          name: [{
            use: 'official',
            ...patient.name[0]
          }]
        }, null, 2),
        explanation: 'The "use" field indicates the purpose of the name (official, usual, nickname, etc.)',
        confidence: 0.7,
        category: 'best-practice'
      });
    }

    // Suggest adding active status
    if (patient.active === undefined) {
      suggestions.push({
        id: 'patient-add-active',
        type: 'improvement',
        title: 'Add active status',
        description: 'Indicate whether the patient record is active',
        code: JSON.stringify({
          ...patient,
          active: true
        }, null, 2),
        explanation: 'The active field indicates whether the patient record is currently in use',
        confidence: 0.6,
        category: 'best-practice'
      });
    }

    return suggestions;
  }

  private generateObservationSuggestions(observation: any): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];

    // Suggest adding category for vital signs
    if (!observation.category && observation.code?.coding?.[0]?.system === 'http://loinc.org') {
      const vitalSignsCodes = ['8480-6', '8462-4', '8310-5', '8302-2']; // Common vital signs
      if (vitalSignsCodes.includes(observation.code.coding[0].code)) {
        suggestions.push({
          id: 'observation-add-category',
          type: 'improvement',
          title: 'Add vital signs category',
          description: 'Categorize this observation as vital signs',
          code: JSON.stringify({
            ...observation,
            category: [{
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }]
            }]
          }, null, 2),
          explanation: 'Categories help organize observations by type for easier searching and filtering',
          confidence: 0.9,
          category: 'best-practice'
        });
      }
    }

    // Suggest proper reference format for subject
    if (observation.subject && typeof observation.subject === 'string') {
      suggestions.push({
        id: 'observation-fix-subject',
        type: 'fix',
        title: 'Fix subject reference format',
        description: 'Subject should be a reference object',
        code: JSON.stringify({
          ...observation,
          subject: {
            reference: observation.subject
          }
        }, null, 2),
        explanation: 'FHIR references should be objects with a "reference" field',
        confidence: 0.95,
        category: 'validation'
      });
    }

    return suggestions;
  }

  private generateGeneralSuggestions(resource: any): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];

    // Suggest adding meta information
    if (!resource.meta) {
      suggestions.push({
        id: 'general-add-meta',
        type: 'improvement',
        title: 'Add metadata',
        description: 'Include resource metadata for better tracking',
        code: JSON.stringify({
          ...resource,
          meta: {
            versionId: '1',
            lastUpdated: new Date().toISOString()
          }
        }, null, 2),
        explanation: 'Metadata helps track resource versions and update history',
        confidence: 0.5,
        category: 'best-practice'
      });
    }

    // Suggest adding text narrative
    if (!resource.text && this.context.userExperience === 'intermediate') {
      suggestions.push({
        id: 'general-add-text',
        type: 'improvement',
        title: 'Add human-readable text',
        description: 'Include a narrative description of the resource',
        code: JSON.stringify({
          ...resource,
          text: {
            status: 'generated',
            div: '<div>Human-readable description goes here</div>'
          }
        }, null, 2),
        explanation: 'Text narratives provide human-readable summaries of the resource content',
        confidence: 0.4,
        category: 'best-practice'
      });
    }

    return suggestions;
  }

  private detectErrors(code: string, resourceType?: string): ErrorDetection[] {
    const errors: ErrorDetection[] = [];

    try {
      const parsed = JSON.parse(code);

      // Check for required resourceType
      if (!parsed.resourceType) {
        errors.push({
          ...this.errorPatterns.get('missing-resourcetype')!,
          position: { line: 1, column: 1, length: 1 }
        });
      }

      // Check for invalid date formats
      this.checkDateFormats(parsed, errors);

      // Resource-specific validation
      if (resourceType === 'Patient') {
        this.validatePatientResource(parsed, errors);
      } else if (resourceType === 'Observation') {
        this.validateObservationResource(parsed, errors);
      }

    } catch (jsonError) {
      errors.push({
        id: 'json-syntax-error',
        severity: 'error',
        type: 'syntax',
        title: 'JSON Syntax Error',
        message: 'Invalid JSON format: ' + (jsonError as Error).message,
        fix: 'Check for missing commas, quotes, or brackets'
      });
    }

    return errors;
  }

  private checkDateFormats(obj: any, errors: ErrorDetection[], path: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key;
      
      if (key.includes('Date') || key.includes('date')) {
        if (typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}/.test(value)) {
          errors.push({
            ...this.errorPatterns.get('invalid-date-format')!,
            position: this.findFieldPosition(key)
          });
        }
      } else if (typeof value === 'object' && value !== null) {
        this.checkDateFormats(value, errors, fullPath);
      }
    }
  }

  private validatePatientResource(patient: any, errors: ErrorDetection[]) {
    // Check for at least name or identifier
    if ((!patient.name || patient.name.length === 0) && 
        (!patient.identifier || patient.identifier.length === 0)) {
      errors.push({
        id: 'patient-name-or-identifier',
        severity: 'error',
        type: 'validation',
        title: 'Missing name or identifier',
        message: 'Patient must have at least a name or identifier',
        fix: 'Add either a name array or identifier array'
      });
    }

    // Validate gender values
    if (patient.gender && !['male', 'female', 'other', 'unknown'].includes(patient.gender)) {
      errors.push({
        id: 'patient-invalid-gender',
        severity: 'error',
        type: 'validation',
        title: 'Invalid gender value',
        message: 'Gender must be one of: male, female, other, unknown',
        fix: `Change gender to one of the valid values`
      });
    }
  }

  private validateObservationResource(observation: any, errors: ErrorDetection[]) {
    // Check required fields
    if (!observation.status) {
      errors.push({
        id: 'observation-missing-status',
        severity: 'error',
        type: 'validation',
        title: 'Missing status',
        message: 'Observation must have a status field',
        fix: 'Add status field with values like "final", "preliminary", etc.'
      });
    }

    if (!observation.code) {
      errors.push({
        id: 'observation-missing-code',
        severity: 'error',
        type: 'validation',
        title: 'Missing code',
        message: 'Observation must have a code field',
        fix: 'Add code field with coding system and code value'
      });
    }

    if (!observation.subject) {
      errors.push({
        id: 'observation-missing-subject',
        severity: 'error',
        type: 'validation',
        title: 'Missing subject',
        message: 'Observation must have a subject field',
        fix: 'Add subject field with reference to Patient or other resource'
      });
    }
  }

  private getContextualHelp(code: string, resourceType?: string): ContextualHelp[] {
    const help: ContextualHelp[] = [];

    if (resourceType && this.helpDatabase.has(resourceType)) {
      help.push(this.helpDatabase.get(resourceType)!);
    }

    // Add context-sensitive help based on code content
    if (code.includes('valueQuantity')) {
      help.push({
        id: 'valuequantity-help',
        type: 'documentation',
        title: 'Quantity Data Type',
        content: 'The Quantity type represents a measured amount with units.',
        links: [
          { text: 'Quantity Documentation', url: 'https://hl7.org/fhir/R4/datatypes.html#Quantity' }
        ],
        examples: [
          '{"value": 120, "unit": "mmHg", "system": "http://unitsofmeasure.org", "code": "mm[Hg]"}'
        ]
      });
    }

    return help;
  }

  private suggestJSONFix(code: string): string {
    // Simple JSON fixing - in practice, this would use more sophisticated parsing
    let fixed = code;
    
    // Add missing quotes around property names
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    
    // Fix trailing commas
    fixed = fixed.replace(/,\s*([}\]])/g, '$1');
    
    // Add missing commas
    fixed = fixed.replace(/"\s*\n\s*"/g, '",\n"');
    
    return fixed;
  }

  private findFieldPosition(fieldName: string): { line: number; column: number; length: number } {
    // Simplified position finding - in practice, this would use proper AST parsing
    return { line: 1, column: 1, length: fieldName.length };
  }

  // Public API methods
  updateContext(context: Partial<AIContext>) {
    this.context = { ...this.context, ...context };
  }

  updateConfig(config: Partial<AIAssistantConfig>) {
    this.config = { ...this.config, ...config };
  }

  getSmartCompletions(code: string, cursorPosition: number): CodeSuggestion[] {
    // Analyze code at cursor position and suggest completions
    const beforeCursor = code.substring(0, cursorPosition);
    const afterCursor = code.substring(cursorPosition);
    
    const completions: CodeSuggestion[] = [];
    
    // Suggest property completions based on context
    if (beforeCursor.includes('"resourceType": "Patient"')) {
      completions.push({
        id: 'patient-property-completion',
        type: 'completion',
        title: 'Patient properties',
        description: 'Common Patient resource properties',
        code: '"name": [{"use": "official", "family": "", "given": [""]}]',
        explanation: 'Add patient name information',
        confidence: 0.8,
        category: 'syntax'
      });
    }
    
    return completions;
  }

  explainCode(code: string, selection?: { start: number; end: number }): ContextualHelp | null {
    if (selection) {
      const selectedCode = code.substring(selection.start, selection.end);
      
      // Analyze selected code and provide explanation
      if (selectedCode.includes('coding')) {
        return {
          id: 'coding-explanation',
          type: 'definition',
          title: 'Coding Element',
          content: 'A Coding is a reference to a code defined by a terminology system. It provides a symbol and its meaning.',
          links: [
            { text: 'Coding Documentation', url: 'https://hl7.org/fhir/R4/datatypes.html#Coding' }
          ]
        };
      }
    }
    
    return null;
  }

  getHelpForError(errorId: string): ContextualHelp | null {
    const error = this.errorPatterns.get(errorId);
    if (error) {
      return {
        id: `help-${errorId}`,
        type: 'tutorial',
        title: `How to fix: ${error.title}`,
        content: error.message + (error.fix ? '\n\nSolution: ' + error.fix : ''),
        links: error.references?.map(ref => ({ text: 'Reference', url: ref })) || []
      };
    }
    return null;
  }

  // Analytics and learning
  trackUserInteraction(type: 'accepted' | 'rejected' | 'modified', suggestionId: string) {
    // Track how users interact with suggestions to improve AI
    // This would be used to train and improve the suggestion engine
    console.log(`User ${type} suggestion ${suggestionId}`);
  }

  exportLearningData(): string {
    return JSON.stringify({
      context: this.context,
      config: this.config,
      cacheStats: {
        suggestionsGenerated: this.suggestionCache.size,
        errorsDetected: this.errorPatterns.size
      },
      timestamp: new Date().toISOString()
    }, null, 2);
  }
}

// Singleton instance
export const aiAssistant = new AIAssistant();