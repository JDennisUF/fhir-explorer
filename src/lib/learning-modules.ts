// Learning module definitions and tutorial content
export interface LearningStep {
  id: string;
  title: string;
  description: string;
  content: string;
  resourceFocus?: string;
  interactive?: boolean;
  quiz?: QuizQuestion[];
  codeExample?: string;
  nextSteps?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  prerequisites?: string[];
  steps: LearningStep[];
  category: 'foundation' | 'clinical' | 'integration' | 'advanced';
}

// Learning modules data
export const LEARNING_MODULES: Record<string, LearningModule> = {
  
  // BEGINNER MODULES
  'fhir-basics': {
    id: 'fhir-basics',
    title: 'FHIR Fundamentals',
    description: 'Learn the core concepts of FHIR and understand the 5-level hierarchy',
    difficulty: 'beginner',
    estimatedTime: '20 minutes',
    category: 'foundation',
    steps: [
      {
        id: 'what-is-fhir',
        title: 'What is FHIR?',
        description: 'Introduction to Fast Healthcare Interoperability Resources',
        content: `
          FHIR (Fast Healthcare Interoperability Resources) is a standard for exchanging healthcare information electronically. 
          
          **Key Benefits:**
          - **Interoperability**: Different healthcare systems can communicate
          - **Modern Technology**: Built on web standards (REST, JSON, XML)
          - **Modular Design**: Resources can be used independently or combined
          - **Open Standard**: Free to implement and use
          
          **Real-world Impact:**
          FHIR enables your doctor's office to share your lab results with a specialist, or for your pharmacy to access your prescription history securely.
        `,
        nextSteps: ['fhir-hierarchy']
      },
      {
        id: 'fhir-hierarchy',
        title: 'The 5-Level Hierarchy',
        description: 'Understanding how FHIR organizes resources',
        content: `
          FHIR organizes resources into 5 logical levels:
          
          **Level 1: Foundation** 🏗️
          - Base resource types and data structures
          - XML/JSON formatting rules
          - Extensions and data types
          
          **Level 2: Support** 🔧
          - Implementation guidance
          - Security and conformance
          - Terminology management (ValueSets, CodeSystems)
          
          **Level 3: Administrative** 👥
          - Core entities: Patient, Practitioner, Organization
          - Identity and relationship management
          
          **Level 4: Clinical** 🏥
          - Healthcare data: Observations, Procedures, Medications
          - Clinical workflow and documentation
          
          **Level 5: Reasoning** 🧠
          - Decision support and quality measures
          - Clinical guidelines and protocols
        `,
        quiz: [
          {
            id: 'hierarchy-1',
            question: 'Which FHIR level contains Patient and Practitioner resources?',
            type: 'multiple-choice',
            options: ['Level 1: Foundation', 'Level 2: Support', 'Level 3: Administrative', 'Level 4: Clinical'],
            correctAnswer: 2,
            explanation: 'Level 3 (Administrative) contains core healthcare entities like Patient, Practitioner, and Organization.'
          }
        ],
        nextSteps: ['resources-intro']
      },
      {
        id: 'resources-intro',
        title: 'Understanding Resources',
        description: 'What are FHIR resources and how do they work?',
        content: `
          **Resources** are the building blocks of FHIR. Each resource represents a specific healthcare concept.
          
          **Key Characteristics:**
          - **Structured Data**: Each resource has a defined schema
          - **Unique Identity**: Resources have logical IDs
          - **References**: Resources can link to other resources
          - **Extensible**: Custom data can be added via extensions
          
          **Common Resource Examples:**
          - **Patient**: Demographics and contact information
          - **Observation**: Lab results, vital signs, measurements
          - **Procedure**: Medical procedures performed
          - **Medication**: Drug information and prescriptions
          
          **Resource Structure:**
          Every resource includes:
          - \`resourceType\`: Identifies the type (e.g., "Patient")
          - \`id\`: Unique identifier
          - Data elements specific to that resource type
        `,
        resourceFocus: 'Patient',
        nextSteps: ['json-basics']
      }
    ]
  },

  'patient-journey': {
    id: 'patient-journey',
    title: 'Patient Journey Scenario',
    description: 'Follow a patient through their healthcare journey using FHIR resources',
    difficulty: 'intermediate',
    estimatedTime: '30 minutes',
    category: 'clinical',
    prerequisites: ['fhir-basics'],
    steps: [
      {
        id: 'patient-registration',
        title: 'Patient Registration',
        description: 'Creating a patient record with demographics',
        content: `
          Our journey begins when Sarah Johnson visits her new doctor's office. The first step is creating her patient record.
          
          **Patient Resource Elements:**
          - **Identifiers**: Medical record number, SSN
          - **Demographics**: Name, date of birth, gender
          - **Contact Information**: Address, phone, email
          - **Emergency Contacts**: Next of kin information
          
          **Why This Matters:**
          Accurate patient demographics ensure:
          - Correct identity matching across systems
          - Proper billing and insurance processing
          - Emergency contact accessibility
          - Demographic analysis for population health
        `,
        resourceFocus: 'Patient',
        codeExample: `{
  "resourceType": "Patient",
  "id": "sarah-johnson",
  "identifier": [
    {
      "use": "usual",
      "system": "http://hospital.example.org/patient-ids",
      "value": "MRN123456"
    }
  ],
  "name": [
    {
      "use": "official",
      "family": "Johnson",
      "given": ["Sarah", "Marie"]
    }
  ],
  "gender": "female",
  "birthDate": "1985-03-15",
  "address": [
    {
      "use": "home",
      "line": ["123 Main Street"],
      "city": "Anytown",
      "state": "CA",
      "postalCode": "12345"
    }
  ]
}`,
        nextSteps: ['encounter-creation']
      },
      {
        id: 'encounter-creation',
        title: 'The Visit Begins',
        description: 'Creating an encounter record for the appointment',
        content: `
          Sarah arrives for her appointment. An **Encounter** resource is created to track this healthcare interaction.
          
          **Encounter Resource Purpose:**
          - Links patient to healthcare providers
          - Tracks visit details (date, time, location)
          - Groups all activities during this visit
          - Supports billing and scheduling
          
          **Key Elements:**
          - **Status**: planned → arrived → in-progress → finished
          - **Class**: ambulatory, emergency, inpatient
          - **Subject**: Reference to the Patient
          - **Participants**: Doctors, nurses involved
          - **Period**: Start and end times
        `,
        resourceFocus: 'Encounter',
        codeExample: `{
  "resourceType": "Encounter",
  "id": "sarah-visit-001",
  "status": "in-progress",
  "class": {
    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code": "AMB",
    "display": "ambulatory"
  },
  "subject": {
    "reference": "Patient/sarah-johnson",
    "display": "Sarah Johnson"
  },
  "participant": [
    {
      "individual": {
        "reference": "Practitioner/dr-smith",
        "display": "Dr. Smith"
      }
    }
  ],
  "period": {
    "start": "2024-01-15T10:00:00Z"
  }
}`,
        nextSteps: ['vital-signs']
      },
      {
        id: 'vital-signs',
        title: 'Taking Vital Signs',
        description: 'Recording observations during the visit',
        content: `
          The nurse takes Sarah's vital signs. Each measurement becomes an **Observation** resource.
          
          **Why Observations Matter:**
          - Baseline health measurements
          - Trending over time
          - Clinical decision support
          - Quality reporting
          
          **Vital Signs Observations:**
          - Blood Pressure: 120/80 mmHg
          - Heart Rate: 72 bpm
          - Temperature: 98.6°F
          - Weight: 140 lbs
          - Height: 5'6"
          
          **Key Observation Elements:**
          - **Status**: final, preliminary, corrected
          - **Code**: What was measured (LOINC codes)
          - **Subject**: Patient reference
          - **Value**: The measurement result
          - **Encounter**: Links to the visit
        `,
        resourceFocus: 'Observation',
        codeExample: `{
  "resourceType": "Observation",
  "id": "sarah-bp-001",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "vital-signs"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "85354-9",
        "display": "Blood pressure panel"
      }
    ]
  },
  "subject": {
    "reference": "Patient/sarah-johnson"
  },
  "encounter": {
    "reference": "Encounter/sarah-visit-001"
  },
  "component": [
    {
      "code": {
        "coding": [
          {
            "system": "http://loinc.org",
            "code": "8480-6",
            "display": "Systolic blood pressure"
          }
        ]
      },
      "valueQuantity": {
        "value": 120,
        "unit": "mmHg"
      }
    }
  ]
}`,
        quiz: [
          {
            id: 'observation-quiz',
            question: 'What FHIR resource type is used to record vital signs?',
            type: 'multiple-choice',
            options: ['Patient', 'Encounter', 'Observation', 'Procedure'],
            correctAnswer: 2,
            explanation: 'Observation resources are used to record measurements, including vital signs, lab results, and other clinical assessments.'
          }
        ],
        nextSteps: ['diagnosis-plan']
      }
    ]
  },

  'resource-relationships': {
    id: 'resource-relationships',
    title: 'Understanding Resource Relationships',
    description: 'Learn how FHIR resources connect and reference each other',
    difficulty: 'intermediate',
    estimatedTime: '25 minutes',
    category: 'integration',
    prerequisites: ['fhir-basics'],
    steps: [
      {
        id: 'references-intro',
        title: 'Resource References',
        description: 'How resources link to each other',
        content: `
          FHIR resources don't exist in isolation - they're connected through **references**.
          
          **Types of References:**
          
          **1. Literal References**
          \`"reference": "Patient/123"\`
          - Points to a specific resource by ID
          - Most common type of reference
          
          **2. Logical References**  
          \`"identifier": { "system": "...", "value": "..." }\`
          - References by business identifier
          - Useful when you don't know the resource ID
          
          **3. Contained Resources**
          Resources embedded within other resources
          - Used for resources that don't exist independently
          
          **Reference Components:**
          - **reference**: The target resource
          - **display**: Human-readable description  
          - **type**: Resource type (optional)
        `,
        nextSteps: ['common-patterns']
      }
    ]
  }
};

// Helper functions
export function getLearningModulesByCategory(category: string): LearningModule[] {
  return Object.values(LEARNING_MODULES).filter(module => module.category === category);
}

export function getLearningModulesByDifficulty(difficulty: string): LearningModule[] {
  return Object.values(LEARNING_MODULES).filter(module => module.difficulty === difficulty);
}

export function getPrerequisiteModules(moduleId: string): LearningModule[] {
  const module = LEARNING_MODULES[moduleId];
  if (!module?.prerequisites) return [];
  
  return module.prerequisites
    .map(prereqId => LEARNING_MODULES[prereqId])
    .filter(Boolean);
}