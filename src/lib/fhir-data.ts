// FHIR Resource metadata and organization
export interface FhirResourceInfo {
  name: string;
  description: string;
  level: 1 | 2 | 3 | 4 | 5;
  category: string;
  maturityLevel?: string;
  examples?: string[];
  relatedResources?: string[];
  commonUses?: string[];
  keyProperties?: string[];
}

// FHIR's 5-level hierarchy
export const FHIR_LEVELS = {
  1: "Foundation",
  2: "Support", 
  3: "Administrative",
  4: "Clinical",
  5: "Reasoning"
} as const;

export const FHIR_CATEGORIES = {
  foundation: "Base documentation, XML/JSON support, Data types and extensions",
  support: "Implementation guidance, Security, Conformance tools, Terminology",
  administrative: "Core healthcare entities (Patient, Practitioner, Organization, Location)", 
  clinical: "Clinical records and data exchange (Allergies, Problems, Procedures, Medications)",
  reasoning: "Advanced clinical reasoning tools, Libraries, Guidance responses"
} as const;

// Core FHIR R4 Resources organized by level
export const FHIR_RESOURCES: Record<string, FhirResourceInfo> = {
  // Level 1: Foundation
  "Resource": {
    name: "Resource",
    description: "Base resource type - all FHIR resources inherit from this",
    level: 1,
    category: "foundation"
  },
  "Element": {
    name: "Element", 
    description: "Base definition for all elements in a resource",
    level: 1,
    category: "foundation"
  },
  "Extension": {
    name: "Extension",
    description: "Optional data element extensions for resources",
    level: 1,
    category: "foundation"
  },

  // Level 2: Support
  "CapabilityStatement": {
    name: "CapabilityStatement",
    description: "A statement of system capabilities",
    level: 2,
    category: "support"
  },
  "StructureDefinition": {
    name: "StructureDefinition", 
    description: "Structural definition of a FHIR resource or data type",
    level: 2,
    category: "support"
  },
  "ValueSet": {
    name: "ValueSet",
    description: "A set of codes drawn from one or more code systems",
    level: 2,
    category: "support"
  },
  "CodeSystem": {
    name: "CodeSystem",
    description: "Declares the existence of and describes a code system or code system supplement",
    level: 2,
    category: "support"
  },
  "ConceptMap": {
    name: "ConceptMap",
    description: "Mapping between concepts from different code systems",
    level: 2, 
    category: "support"
  },

  // Level 3: Administrative
  "Patient": {
    name: "Patient",
    description: "Information about an individual or animal receiving health care services",
    level: 3,
    category: "administrative",
    examples: ["patient-example.json", "patient-example-f001-pieter.json"],
    relatedResources: ["Encounter", "Observation", "Procedure", "Practitioner", "Organization"],
    commonUses: ["Patient registration", "Demographics", "Contact information", "Insurance details"],
    keyProperties: ["identifier", "name", "gender", "birthDate", "address", "telecom"]
  },
  "Practitioner": {
    name: "Practitioner", 
    description: "A person who is directly or indirectly involved in the provisioning of healthcare",
    level: 3,
    category: "administrative"
  },
  "Organization": {
    name: "Organization",
    description: "A formally or informally recognized grouping of people or organizations",
    level: 3,
    category: "administrative"
  },
  "Location": {
    name: "Location",
    description: "Details and position information for a physical place", 
    level: 3,
    category: "administrative"
  },
  "HealthcareService": {
    name: "HealthcareService",
    description: "The details of a healthcare service available at a location",
    level: 3,
    category: "administrative"
  },

  // Level 4: Clinical
  "Encounter": {
    name: "Encounter",
    description: "An interaction between a patient and healthcare provider(s)",
    level: 4,
    category: "clinical"
  },
  "Observation": {
    name: "Observation", 
    description: "Measurements and simple assertions about a patient",
    level: 4,
    category: "clinical",
    examples: ["observation-example.json", "observation-example-respiratory-rate.json"],
    relatedResources: ["Patient", "Encounter", "DiagnosticReport", "ValueSet", "CodeSystem"],
    commonUses: ["Vital signs", "Lab results", "Clinical measurements", "Survey responses"],
    keyProperties: ["status", "code", "subject", "valueQuantity", "component", "referenceRange"]
  },
  "Procedure": {
    name: "Procedure",
    description: "An action that is being or was performed on a patient",
    level: 4,
    category: "clinical"
  },
  "Condition": {
    name: "Condition",
    description: "A clinical condition, problem, diagnosis, or other event",
    level: 4, 
    category: "clinical"
  },
  "AllergyIntolerance": {
    name: "AllergyIntolerance",
    description: "Risk of harmful or undesirable physiological response",
    level: 4,
    category: "clinical"
  },
  "MedicationRequest": {
    name: "MedicationRequest",
    description: "An order or request for both supply and administration of medication",
    level: 4,
    category: "clinical"
  },
  "DiagnosticReport": {
    name: "DiagnosticReport",
    description: "The findings and interpretation of diagnostic tests",
    level: 4,
    category: "clinical"
  },

  // Level 5: Reasoning
  "PlanDefinition": {
    name: "PlanDefinition",
    description: "The definition of a plan for a series of actions",
    level: 5,
    category: "reasoning"
  },
  "ActivityDefinition": {
    name: "ActivityDefinition",
    description: "The definition of a specific activity to be taken",
    level: 5,
    category: "reasoning"
  },
  "Measure": {
    name: "Measure",
    description: "A quality measure definition",
    level: 5,
    category: "reasoning"
  },
  "Library": {
    name: "Library",
    description: "Represents a library of quality improvement components",  
    level: 5,
    category: "reasoning"
  }
};

// Helper functions
export function getResourcesByLevel(level: 1 | 2 | 3 | 4 | 5): FhirResourceInfo[] {
  return Object.values(FHIR_RESOURCES).filter(resource => resource.level === level);
}

export function getResourcesByCategory(category: string): FhirResourceInfo[] {
  return Object.values(FHIR_RESOURCES).filter(resource => resource.category === category);
}

export function searchResources(query: string): FhirResourceInfo[] {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(FHIR_RESOURCES).filter(resource => 
    resource.name.toLowerCase().includes(lowercaseQuery) ||
    resource.description.toLowerCase().includes(lowercaseQuery) ||
    resource.commonUses?.some(use => use.toLowerCase().includes(lowercaseQuery)) ||
    resource.keyProperties?.some(prop => prop.toLowerCase().includes(lowercaseQuery)) ||
    resource.relatedResources?.some(rel => rel.toLowerCase().includes(lowercaseQuery))
  );
}

export async function loadExampleData(filename: string): Promise<any> {
  try {
    const response = await fetch(`/api/fhir-examples/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading example data: ${filename}`, error);
    return null;
  }
}