// Profile and Implementation Guide management for advanced schema tools

export interface FHIRProfile {
  id: string;
  name: string;
  description: string;
  baseResource: string;
  version: string;
  status: 'draft' | 'active' | 'retired';
  publisher?: string;
  elements: ProfileElement[];
  constraints: ProfileConstraint[];
  created: string;
  lastModified: string;
}

export interface ProfileElement {
  path: string;
  name: string;
  type: string[];
  cardinality: {
    min: number;
    max: string; // "*" for unbounded
  };
  description?: string;
  binding?: {
    strength: 'required' | 'extensible' | 'preferred' | 'example';
    valueSet?: string;
  };
  mustSupport?: boolean;
  isModifier?: boolean;
  fixedValue?: any;
}

export interface ProfileConstraint {
  key: string;
  severity: 'error' | 'warning';
  human: string;
  expression: string; // FHIRPath expression
  source?: string;
}

export interface ImplementationGuide {
  id: string;
  name: string;
  title: string;
  description: string;
  version: string;
  status: 'draft' | 'active' | 'retired';
  publisher?: string;
  jurisdiction?: string[];
  profiles: string[]; // Profile IDs
  extensions: CustomExtension[];
  valueSets: ValueSet[];
  examples: IGExample[];
  created: string;
  lastModified: string;
}

export interface CustomExtension {
  id: string;
  url: string;
  name: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'retired';
  context: {
    type: 'element' | 'extension';
    expression: string;
  }[];
  type: string[];
  cardinality: {
    min: number;
    max: string;
  };
}

export interface ValueSet {
  id: string;
  url: string;
  name: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'retired';
  compose: {
    include: {
      system: string;
      concept?: {
        code: string;
        display: string;
      }[];
    }[];
  };
}

export interface IGExample {
  id: string;
  name: string;
  title: string;
  description: string;
  profileReference: string;
  resourceType: string;
  resource: any; // The actual FHIR resource
}

export class ProfileManager {
  private profiles: Map<string, FHIRProfile> = new Map();
  private implementationGuides: Map<string, ImplementationGuide> = new Map();

  constructor() {
    this.loadSampleProfiles();
  }

  // Load sample profiles for demonstration
  private loadSampleProfiles() {
    const usCore4Patient: FHIRProfile = {
      id: 'us-core-patient',
      name: 'USCorePatientProfile',
      description: 'US Core Patient Profile based on US Core R4',
      baseResource: 'Patient',
      version: '4.0.0',
      status: 'active',
      publisher: 'HL7 US Realm Steering Committee',
      created: '2023-01-01',
      lastModified: '2023-12-01',
      elements: [
        {
          path: 'Patient.identifier',
          name: 'identifier',
          type: ['Identifier'],
          cardinality: { min: 1, max: '*' },
          description: 'Must have at least one identifier',
          mustSupport: true
        },
        {
          path: 'Patient.name',
          name: 'name',
          type: ['HumanName'],
          cardinality: { min: 1, max: '*' },
          description: 'Must have at least one name',
          mustSupport: true
        },
        {
          path: 'Patient.gender',
          name: 'gender',
          type: ['code'],
          cardinality: { min: 1, max: '1' },
          description: 'Administrative Gender - the gender that the patient is considered to have for administration and record keeping purposes',
          binding: {
            strength: 'required',
            valueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
          },
          mustSupport: true
        },
        {
          path: 'Patient.birthDate',
          name: 'birthDate',
          type: ['date'],
          cardinality: { min: 0, max: '1' },
          mustSupport: true
        }
      ],
      constraints: [
        {
          key: 'us-core-1',
          severity: 'error',
          human: 'Either Patient.name.given or Patient.name.family or both SHALL be present',
          expression: 'name.family.exists() or name.given.exists()'
        }
      ]
    };

    const customObservation: FHIRProfile = {
      id: 'vital-signs-observation',
      name: 'VitalSignsObservation',
      description: 'Custom profile for vital signs observations',
      baseResource: 'Observation',
      version: '1.0.0',
      status: 'active',
      publisher: 'Example Organization',
      created: '2024-01-01',
      lastModified: '2024-01-15',
      elements: [
        {
          path: 'Observation.status',
          name: 'status',
          type: ['code'],
          cardinality: { min: 1, max: '1' },
          description: 'Status of the observation',
          fixedValue: 'final',
          mustSupport: true
        },
        {
          path: 'Observation.category',
          name: 'category',
          type: ['CodeableConcept'],
          cardinality: { min: 1, max: '1' },
          description: 'Must be vital-signs category',
          binding: {
            strength: 'required',
            valueSet: 'http://terminology.hl7.org/ValueSet/observation-category'
          },
          mustSupport: true
        },
        {
          path: 'Observation.code',
          name: 'code',
          type: ['CodeableConcept'],
          cardinality: { min: 1, max: '1' },
          description: 'Vital signs code from LOINC',
          binding: {
            strength: 'required',
            valueSet: 'http://hl7.org/fhir/ValueSet/observation-vitalsignresult'
          },
          mustSupport: true
        }
      ],
      constraints: [
        {
          key: 'vs-1',
          severity: 'error',
          human: 'If there is no component or hasMember element then either a value[x] or a data absent reason must be present',
          expression: '(component.empty() and hasMember.empty()) implies (value.exists() or dataAbsentReason.exists())'
        }
      ]
    };

    this.profiles.set(usCore4Patient.id, usCore4Patient);
    this.profiles.set(customObservation.id, customObservation);

    // Sample Implementation Guide
    const sampleIG: ImplementationGuide = {
      id: 'example-ig',
      name: 'ExampleImplementationGuide',
      title: 'Example Implementation Guide for Learning',
      description: 'A sample implementation guide demonstrating custom profiles and extensions',
      version: '1.0.0',
      status: 'active',
      publisher: 'FHIR Learning Community',
      jurisdiction: ['US'],
      profiles: ['us-core-patient', 'vital-signs-observation'],
      created: '2024-01-01',
      lastModified: '2024-01-15',
      extensions: [
        {
          id: 'patient-race',
          url: 'http://example.org/fhir/StructureDefinition/patient-race',
          name: 'PatientRace',
          title: 'Patient Race Extension',
          description: 'Extension to capture patient race information',
          status: 'active',
          context: [
            {
              type: 'element',
              expression: 'Patient'
            }
          ],
          type: ['CodeableConcept'],
          cardinality: { min: 0, max: '*' }
        }
      ],
      valueSets: [
        {
          id: 'patient-race-codes',
          url: 'http://example.org/fhir/ValueSet/patient-race-codes',
          name: 'PatientRaceCodes',
          title: 'Patient Race Codes',
          description: 'Codes for patient race',
          status: 'active',
          compose: {
            include: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-Race',
                concept: [
                  { code: '1002-5', display: 'American Indian or Alaska Native' },
                  { code: '2028-9', display: 'Asian' },
                  { code: '2054-5', display: 'Black or African American' },
                  { code: '2076-8', display: 'Native Hawaiian or Other Pacific Islander' },
                  { code: '2106-3', display: 'White' }
                ]
              }
            ]
          }
        }
      ],
      examples: [
        {
          id: 'example-us-core-patient',
          name: 'USCorePatientExample',
          title: 'US Core Patient Example',
          description: 'Example patient conforming to US Core Patient profile',
          profileReference: 'us-core-patient',
          resourceType: 'Patient',
          resource: {
            resourceType: 'Patient',
            id: 'example-us-core',
            meta: {
              profile: ['http://example.org/fhir/StructureDefinition/us-core-patient']
            },
            identifier: [
              {
                use: 'usual',
                system: 'http://hospital.example.org/patient-ids',
                value: 'MRN123456'
              }
            ],
            name: [
              {
                use: 'official',
                family: 'Smith',
                given: ['John', 'David']
              }
            ],
            gender: 'male',
            birthDate: '1980-01-01'
          }
        }
      ]
    };

    this.implementationGuides.set(sampleIG.id, sampleIG);
  }

  // Profile management methods
  getAllProfiles(): FHIRProfile[] {
    return Array.from(this.profiles.values());
  }

  getProfile(id: string): FHIRProfile | undefined {
    return this.profiles.get(id);
  }

  createProfile(profile: Omit<FHIRProfile, 'created' | 'lastModified'>): FHIRProfile {
    const newProfile: FHIRProfile = {
      ...profile,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    this.profiles.set(newProfile.id, newProfile);
    return newProfile;
  }

  updateProfile(id: string, updates: Partial<FHIRProfile>): FHIRProfile | null {
    const existing = this.profiles.get(id);
    if (!existing) return null;

    const updated: FHIRProfile = {
      ...existing,
      ...updates,
      lastModified: new Date().toISOString()
    };

    this.profiles.set(id, updated);
    return updated;
  }

  deleteProfile(id: string): boolean {
    return this.profiles.delete(id);
  }

  // Implementation Guide management methods
  getAllImplementationGuides(): ImplementationGuide[] {
    return Array.from(this.implementationGuides.values());
  }

  getImplementationGuide(id: string): ImplementationGuide | undefined {
    return this.implementationGuides.get(id);
  }

  createImplementationGuide(ig: Omit<ImplementationGuide, 'created' | 'lastModified'>): ImplementationGuide {
    const newIG: ImplementationGuide = {
      ...ig,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    this.implementationGuides.set(newIG.id, newIG);
    return newIG;
  }

  // Validation methods
  validateResourceAgainstProfile(resource: any, profileId: string): ValidationResult {
    const profile = this.getProfile(profileId);
    if (!profile) {
      return {
        isValid: false,
        errors: [`Profile ${profileId} not found`],
        warnings: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check base resource type
    if (resource.resourceType !== profile.baseResource) {
      errors.push(`Resource type ${resource.resourceType} does not match profile base ${profile.baseResource}`);
    }

    // Check must-support elements
    for (const element of profile.elements.filter(e => e.mustSupport)) {
      const value = this.getValueAtPath(resource, element.path);
      
      if (element.cardinality.min > 0 && !this.hasRequiredCardinality(value, element.cardinality)) {
        errors.push(`Required element ${element.path} is missing or has insufficient cardinality`);
      }
    }

    // Check constraints
    for (const constraint of profile.constraints) {
      // Simplified constraint checking - in a real implementation, you'd use a FHIRPath evaluator
      if (constraint.severity === 'error') {
        // This is a simplified check - real implementation would evaluate FHIRPath expressions
        if (constraint.key === 'us-core-1') {
          const names = resource.name || [];
          const hasRequiredName = names.some((name: any) => name.family || (name.given && name.given.length > 0));
          if (!hasRequiredName) {
            errors.push(constraint.human);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private getValueAtPath(resource: any, path: string): any {
    const parts = path.split('.');
    let current = resource;
    
    for (let i = 1; i < parts.length; i++) { // Skip first part (resource type)
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[parts[i]];
    }
    
    return current;
  }

  private hasRequiredCardinality(value: any, cardinality: { min: number; max: string }): boolean {
    if (Array.isArray(value)) {
      const count = value.length;
      if (count < cardinality.min) return false;
      if (cardinality.max !== '*' && count > parseInt(cardinality.max)) return false;
      return true;
    } else {
      const count = value !== undefined && value !== null ? 1 : 0;
      if (count < cardinality.min) return false;
      if (cardinality.max !== '*' && count > parseInt(cardinality.max)) return false;
      return true;
    }
  }

  // Export/Import methods
  exportProfile(id: string): string | null {
    const profile = this.getProfile(id);
    if (!profile) return null;
    
    return JSON.stringify(profile, null, 2);
  }

  exportImplementationGuide(id: string): string | null {
    const ig = this.getImplementationGuide(id);
    if (!ig) return null;
    
    // Include referenced profiles
    const exportData = {
      implementationGuide: ig,
      profiles: ig.profiles.map(pid => this.getProfile(pid)).filter(Boolean)
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  importProfile(profileJson: string): FHIRProfile | null {
    try {
      const profile = JSON.parse(profileJson) as FHIRProfile;
      this.profiles.set(profile.id, profile);
      return profile;
    } catch (error) {
      console.error('Failed to import profile:', error);
      return null;
    }
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Singleton instance
export const profileManager = new ProfileManager();