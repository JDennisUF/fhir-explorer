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

interface SchemaDefinition {
  [resourceType: string]: SchemaField[];
}

function extractTypeFromTSInterface(filePath: string): SchemaField[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fields: SchemaField[] = [];
  
  // Extract main interface
  const mainInterfaceMatch = content.match(/export interface (\w+) extends fhir\.DomainResource \{[\s\S]*?\n\}/);
  if (!mainInterfaceMatch) {
    return fields;
  }
  
  const interfaceContent = mainInterfaceMatch[0];
  
  // Parse fields from the interface
  const fieldPattern = /\/\*\*\s*([\s\S]*?)\*\/\s*(\w+)\??\s*:\s*([^;]+);/g;
  let match;
  
  while ((match = fieldPattern.exec(interfaceContent)) !== null) {
    const [, description, fieldName, typeDefinition] = match;
    
    // Skip resourceType field as it's always present
    if (fieldName === 'resourceType') {
      fields.unshift({
        name: 'resourceType',
        type: 'string',
        cardinality: '1..1',
        description: 'The type of resource',
        required: true
      });
      continue;
    }
    
    // Skip extension fields (starting with _)
    if (fieldName.startsWith('_')) {
      continue;
    }
    
    // Clean up description - extract the first sentence or main point
    let cleanDescription = description
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^\*\s*/, ''); // Remove leading asterisk
    
    // Take only the first sentence or up to the first period/newline
    const firstSentence = cleanDescription.split(/[.;]|\n/)[0];
    if (firstSentence.length > 0 && firstSentence.length < cleanDescription.length) {
      cleanDescription = firstSentence.trim();
    }
    
    // Limit length for display
    if (cleanDescription.length > 150) {
      cleanDescription = cleanDescription.substring(0, 147) + '...';
    }
    const isOptional = typeDefinition.includes('undefined');
    const isArray = typeDefinition.includes('[]');
    const isRequired = !isOptional && !fieldName.endsWith('?');
    
    // Determine cardinality
    let cardinality = '0..1';
    if (isArray) {
      cardinality = '0..*';
    }
    if (isRequired) {
      cardinality = cardinality.replace('0', '1');
    }
    
    // Extract type information
    let fieldType = typeDefinition
      .replace(/\|null/g, '')
      .replace(/\|undefined/g, '')
      .replace(/\[\]/g, '')
      .replace(/\?/g, '')
      .replace(/\(/g, '')
      .replace(/\)/g, '')
      .trim();
    
    // Convert fhir.* types to simpler names
    fieldType = fieldType.replace(/fhir\./g, '');
    
    // Handle specific type mappings
    if (fieldType.includes('\'')) {
      // Extract enum values
      const enumValues = fieldType.match(/\'([^']+)\'/g);
      if (enumValues) {
        fieldType = 'code'; // Use 'code' for enum types
      }
    } else if (fieldType === 'string') {
      // Check if it's a specific FHIR primitive type based on field name
      if (fieldName === 'birthDate') fieldType = 'date';
      else if (fieldName.includes('DateTime')) fieldType = 'dateTime';
      else if (fieldName.includes('Date')) fieldType = 'date';
      else if (fieldName.includes('Uri') || fieldName.includes('Url')) fieldType = 'uri';
    } else if (fieldType === 'boolean') {
      fieldType = 'boolean';
    } else if (fieldType === 'number') {
      fieldType = 'integer';
    }
    
    // Add array notation back if needed
    if (isArray && !fieldType.includes('[]')) {
      fieldType += '[]';
    }
    
    fields.push({
      name: fieldName,
      type: fieldType,
      cardinality,
      description: cleanDescription,
      required: isRequired
    });
  }
  
  return fields;
}

function generateResourceSchema(resourceName: string): SchemaField[] {
  const packagePath = path.join(process.cwd(), 'node_modules', '@fhir-typescript', 'r4-core');
  const filePath = path.join(packagePath, 'src', 'fhirJson', `${resourceName}.ts`);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`Schema file not found for resource: ${resourceName}`);
    return [];
  }
  
  return extractTypeFromTSInterface(filePath);
}

function generateAllResourceSchemas(): SchemaDefinition {
  const packagePath = path.join(process.cwd(), 'node_modules', '@fhir-typescript', 'r4-core');
  const resourcesPath = path.join(packagePath, 'src', 'fhirJson');
  
  if (!fs.existsSync(resourcesPath)) {
    throw new Error('FHIR TypeScript package not found');
  }
  
  const schemas: SchemaDefinition = {};
  const files = fs.readdirSync(resourcesPath);
  
  // List of main FHIR resources (excluding primitive types and infrastructure)
  const resourceTypes = [
    'Patient', 'Observation', 'Practitioner', 'Organization', 'Encounter',
    'DiagnosticReport', 'Medication', 'MedicationRequest', 'AllergyIntolerance',
    'Condition', 'Procedure', 'Immunization', 'Location', 'Device',
    'Appointment', 'CarePlan', 'CareTeam', 'Goal', 'ServiceRequest',
    'DocumentReference', 'Binary', 'Bundle', 'Composition', 'List',
    'Media', 'Questionnaire', 'QuestionnaireResponse', 'Coverage',
    'Claim', 'ExplanationOfBenefit', 'Invoice', 'Account'
  ];
  
  for (const resourceType of resourceTypes) {
    const fileName = `${resourceType}.ts`;
    if (files.includes(fileName)) {
      schemas[resourceType] = generateResourceSchema(resourceType);
    }
  }
  
  return schemas;
}

export { generateResourceSchema, generateAllResourceSchemas, type SchemaField, type SchemaDefinition };