// Simple FHIRPath evaluation engine for common queries
// This is a simplified implementation for educational purposes

export interface FHIRPathResult {
  success: boolean;
  result: any;
  error?: string;
  resultType: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'undefined';
}

export interface FHIRPathExample {
  path: string;
  description: string;
  category: 'basic' | 'navigation' | 'filtering' | 'functions' | 'advanced';
  resourceType?: string;
}

export class FHIRPathEngine {
  // Common FHIRPath examples
  static examples: FHIRPathExample[] = [
    // Basic Navigation
    { path: 'Patient.name', description: 'Get all names from a Patient', category: 'basic', resourceType: 'Patient' },
    { path: 'Patient.name.family', description: 'Get family names', category: 'basic', resourceType: 'Patient' },
    { path: 'Patient.name.given', description: 'Get given names', category: 'basic', resourceType: 'Patient' },
    { path: 'Patient.gender', description: 'Get patient gender', category: 'basic', resourceType: 'Patient' },
    { path: 'Patient.birthDate', description: 'Get birth date', category: 'basic', resourceType: 'Patient' },
    
    // Navigation
    { path: 'Patient.identifier.value', description: 'Get identifier values', category: 'navigation', resourceType: 'Patient' },
    { path: 'Patient.address.city', description: 'Get cities from addresses', category: 'navigation', resourceType: 'Patient' },
    { path: 'Observation.code.coding.display', description: 'Get observation code displays', category: 'navigation', resourceType: 'Observation' },
    { path: 'Observation.subject.reference', description: 'Get subject reference', category: 'navigation', resourceType: 'Observation' },
    
    // Filtering
    { path: 'Patient.name.where(use = "official")', description: 'Get official names only', category: 'filtering', resourceType: 'Patient' },
    { path: 'Patient.identifier.where(system = "http://hospital.example.org/patient-ids")', description: 'Filter identifiers by system', category: 'filtering', resourceType: 'Patient' },
    { path: 'Patient.address.where(use = "home")', description: 'Get home addresses only', category: 'filtering', resourceType: 'Patient' },
    { path: 'Observation.component.where(code.coding.code = "8480-6")', description: 'Filter components by code', category: 'filtering', resourceType: 'Observation' },
    
    // Functions
    { path: 'Patient.name.family.first()', description: 'Get first family name', category: 'functions', resourceType: 'Patient' },
    { path: 'Patient.name.given.count()', description: 'Count given names', category: 'functions', resourceType: 'Patient' },
    { path: 'Patient.identifier.empty()', description: 'Check if identifiers are empty', category: 'functions', resourceType: 'Patient' },
    { path: 'Patient.name.exists()', description: 'Check if names exist', category: 'functions', resourceType: 'Patient' },
    
    // Advanced
    { path: 'Patient.name.where(use = "official").family.first()', description: 'Get first official family name', category: 'advanced', resourceType: 'Patient' },
    { path: 'Patient.identifier.where(system.exists()).value', description: 'Get values of identifiers with system', category: 'advanced', resourceType: 'Patient' },
    { path: 'Observation.component.where(valueQuantity.exists()).valueQuantity.value', description: 'Get quantity values from components', category: 'advanced', resourceType: 'Observation' }
  ];

  static evaluate(path: string, resource: any): FHIRPathResult {
    try {
      // Handle empty or undefined resource
      if (!resource) {
        return {
          success: false,
          error: 'Resource is required',
          result: undefined,
          resultType: 'undefined'
        };
      }

      // Simple path evaluation - split by dots and navigate
      const result = this.evaluatePath(path, resource);
      const resultType = this.getResultType(result);

      return {
        success: true,
        result: result,
        resultType: resultType
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        result: undefined,
        resultType: 'undefined'
      };
    }
  }

  private static evaluatePath(path: string, context: any): any {
    // Handle root context
    if (path === '' || path === '.') {
      return context;
    }

    // Split path and process each segment
    const segments = this.parsePath(path);
    let current = context;

    for (const segment of segments) {
      current = this.evaluateSegment(segment, current);
      
      // If we get undefined/null at any point, return it
      if (current === undefined || current === null) {
        return current;
      }
    }

    return current;
  }

  private static parsePath(path: string): string[] {
    // Simple path parsing - split by dots, but handle function calls
    const segments: string[] = [];
    let current = '';
    let depth = 0;

    for (let i = 0; i < path.length; i++) {
      const char = path[i];
      
      if (char === '(' || char === '[') {
        depth++;
        current += char;
      } else if (char === ')' || char === ']') {
        depth--;
        current += char;
      } else if (char === '.' && depth === 0) {
        if (current) {
          segments.push(current);
        }
        current = '';
      } else {
        current += char;
      }
    }

    if (current) {
      segments.push(current);
    }

    return segments;
  }

  private static evaluateSegment(segment: string, context: any): any {
    // Handle function calls
    if (segment.includes('(')) {
      return this.evaluateFunction(segment, context);
    }

    // Handle where clauses
    if (segment.includes('where(')) {
      return this.evaluateWhere(segment, context);
    }

    // Handle array access
    if (segment.includes('[')) {
      return this.evaluateArrayAccess(segment, context);
    }

    // Simple property access
    if (Array.isArray(context)) {
      return context.map(item => item && typeof item === 'object' ? item[segment] : undefined)
                   .filter(item => item !== undefined);
    } else if (context && typeof context === 'object') {
      return context[segment];
    }

    return undefined;
  }

  private static evaluateFunction(segment: string, context: any): any {
    const functionMatch = segment.match(/(\w+)\((.*)\)/);
    if (!functionMatch) return undefined;

    const [, funcName, args] = functionMatch;

    switch (funcName) {
      case 'first':
        return Array.isArray(context) && context.length > 0 ? context[0] : context;
      
      case 'last':
        return Array.isArray(context) && context.length > 0 ? context[context.length - 1] : context;
      
      case 'count':
        return Array.isArray(context) ? context.length : (context !== undefined ? 1 : 0);
      
      case 'empty':
        return Array.isArray(context) ? context.length === 0 : context === undefined;
      
      case 'exists':
        return Array.isArray(context) ? context.length > 0 : context !== undefined;
      
      case 'single':
        if (Array.isArray(context)) {
          return context.length === 1 ? context[0] : undefined;
        }
        return context;
      
      default:
        throw new Error(`Unsupported function: ${funcName}`);
    }
  }

  private static evaluateWhere(segment: string, context: any): any {
    const whereMatch = segment.match(/(\w+)\.where\((.*)\)/);
    if (!whereMatch) return undefined;

    const [, property, condition] = whereMatch;
    
    if (!Array.isArray(context)) {
      context = [context];
    }

    // Get the array to filter
    const arrayToFilter = context.map(item => item && typeof item === 'object' ? item[property] : undefined)
                                .filter(item => item !== undefined)
                                .flat();

    if (!Array.isArray(arrayToFilter)) return undefined;

    // Simple condition parsing (property = "value")
    const conditionMatch = condition.match(/(\w+(?:\.\w+)*)\s*=\s*"([^"]+)"/);
    if (!conditionMatch) return arrayToFilter; // Return unfiltered if can't parse condition

    const [, conditionPath, expectedValue] = conditionMatch;

    return arrayToFilter.filter(item => {
      const value = this.evaluatePath(conditionPath, item);
      return value === expectedValue;
    });
  }

  private static evaluateArrayAccess(segment: string, context: any): any {
    const arrayMatch = segment.match(/(\w+)\[(\d+)\]/);
    if (!arrayMatch) return undefined;

    const [, property, index] = arrayMatch;
    const array = context && typeof context === 'object' ? context[property] : undefined;
    
    if (Array.isArray(array)) {
      return array[parseInt(index)];
    }

    return undefined;
  }

  private static getResultType(result: any): 'string' | 'number' | 'boolean' | 'array' | 'object' | 'undefined' {
    if (result === undefined || result === null) return 'undefined';
    if (Array.isArray(result)) return 'array';
    if (typeof result === 'object') return 'object';
    if (typeof result === 'string') return 'string';
    if (typeof result === 'number') return 'number';
    if (typeof result === 'boolean') return 'boolean';
    return 'undefined';
  }
}