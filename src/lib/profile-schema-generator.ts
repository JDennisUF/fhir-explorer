import fs from 'fs';
import path from 'path';

interface SchemaField {
  name: string;
  type: string;
  cardinality: string;
  description: string;
  required?: boolean;
  properties?: SchemaField[];
}

interface ElementDefinition {
  path: string;
  short?: string;
  comment?: string;
  min?: number;
  max?: string;
  type?: Array<{ code: string }>;
  mustSupport?: boolean;
}

interface StructureDefinition {
  resourceType: string;
  type: string;
  name: string;
  differential?: {
    element: ElementDefinition[];
  };
  snapshot?: {
    element: ElementDefinition[];
  };
}

function generateResourceSchemaFromProfile(resourceName: string): SchemaField[] {
  try {
    const profilePath = path.join(process.cwd(), 'docs', 'examples', `${resourceName.toLowerCase()}.profile.json`);
    
    if (!fs.existsSync(profilePath)) {
      console.warn(`Profile file not found for resource: ${resourceName}`);
      return [];
    }

    const profileContent = fs.readFileSync(profilePath, 'utf-8');
    const profile: StructureDefinition = JSON.parse(profileContent);
    
    // Use snapshot elements which contain the full definition
    const elements = profile.snapshot?.element || [];
    const fields: SchemaField[] = [];
    
    // Get the root element to determine base fields
    // const resourceElement = elements.find(e => e.path === resourceName);
    
    // Process each element
    elements.forEach(element => {
      const { path, short, min, max, type } = element;
      
      // Skip the root resource element itself
      if (path === resourceName) return;
      
      // Only process direct children of the resource (not nested elements for now)
      const pathParts = path.split('.');
      if (pathParts.length !== 2 || pathParts[0] !== resourceName) return;
      
      const fieldName = pathParts[1];
      
      // Skip choice type variations (e.g., skip deceasedDateTime if we have deceased[x])
      if (fieldName.includes('[x]') || elements.some(e => e.path === `${resourceName}.${fieldName.replace(/[A-Z].*$/, '[x]')}`)) {
        if (!fieldName.includes('[x]')) return;
      }
      
      // Determine cardinality
      const minCard = min ?? 0;
      const maxCard = max === '*' ? '*' : (max ? parseInt(max) : 1);
      const cardinality = maxCard === '*' ? `${minCard}..*` : `${minCard}..${maxCard}`;
      
      // Determine type
      let fieldType = 'string';
      if (type && type.length > 0) {
        if (type.length === 1) {
          fieldType = type[0].code;
        } else {
          // Multiple types - show as choice
          fieldType = type.map(t => t.code).join(' | ');
        }
      }
      
      // Handle array types
      if (maxCard === '*' || (typeof maxCard === 'number' && maxCard > 1)) {
        if (!fieldType.includes('[]') && !fieldType.includes(' | ')) {
          fieldType += '[]';
        }
      }
      
      // Use short description, fallback to field name
      const description = short || `${fieldName} field`;
      
      fields.push({
        name: fieldName.replace('[x]', ''),
        type: fieldType,
        cardinality,
        description,
        required: minCard > 0
      });
    });
    
    // Sort fields to put required fields first, then alphabetically
    fields.sort((a, b) => {
      if (a.required && !b.required) return -1;
      if (!a.required && b.required) return 1;
      return a.name.localeCompare(b.name);
    });
    
    return fields;
  } catch (error) {
    console.error(`Error generating schema for ${resourceName}:`, error);
    return [];
  }
}

export { generateResourceSchemaFromProfile, type SchemaField };