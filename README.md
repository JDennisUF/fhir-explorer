# FHIR R4 Explorer

An interactive learning tool for exploring and understanding FHIR (Fast Healthcare Interoperability Resources) Release 4 standards.

## Features

### Phase 1 Implementation (Completed)
- **Hierarchical Resource Browser**: Navigate through FHIR's 5-level structure
  - Level 1: Foundation (Base documentation, XML/JSON support, Data types)
  - Level 2: Support (Implementation guidance, Security, Conformance tools) 
  - Level 3: Administrative (Core entities: Patient, Practitioner, Organization)
  - Level 4: Clinical (Clinical records: Observations, Procedures, Conditions)
  - Level 5: Reasoning (Advanced clinical reasoning tools, Libraries)

- **Interactive Resource Cards**: Clean, informative cards showing:
  - Resource name and description
  - FHIR level and category
  - Available examples
  - Color-coded level indicators

- **Advanced Search & Filtering**:
  - Search by resource name or description
  - Filter by FHIR level (1-5)
  - Filter by category (Foundation, Support, Administrative, Clinical, Reasoning)
  - Clear all filters functionality

- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Architecture

### Key Files

```
src/
├── app/
│   ├── page.tsx                    # Main application page
│   ├── layout.tsx                  # Root layout component
│   └── api/fhir-examples/          # API endpoints for FHIR data
├── components/
│   ├── ResourceCard.tsx            # Individual resource card component
│   └── SearchAndFilter.tsx         # Search and filtering controls
└── lib/
    └── fhir-data.ts               # FHIR resource data and utilities
```

### Data Structure

The application organizes FHIR resources using a comprehensive metadata structure:

```typescript
interface FhirResourceInfo {
  name: string;           // Resource name (e.g., "Patient")
  description: string;    // Human-readable description
  level: 1 | 2 | 3 | 4 | 5;  // FHIR hierarchy level
  category: string;       // Category (foundation, support, etc.)
  examples?: string[];    // Available example files
}
```

### FHIR Resources Included

Currently includes 26+ core FHIR R4 resources across all 5 levels:

**Level 1 (Foundation)**: Resource, Element, Extension
**Level 2 (Support)**: CapabilityStatement, StructureDefinition, ValueSet, CodeSystem, ConceptMap
**Level 3 (Administrative)**: Patient, Practitioner, Organization, Location, HealthcareService
**Level 4 (Clinical)**: Encounter, Observation, Procedure, Condition, AllergyIntolerance, MedicationRequest, DiagnosticReport
**Level 5 (Reasoning)**: PlanDefinition, ActivityDefinition, Measure, Library

## Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **React Hooks** - useState, useMemo for state management and optimization

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd fhir_tutorial/fhir-explorer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Using Existing FHIR Data

The application is designed to work with the FHIR JSON files in the `../docs/` directory. The API endpoints automatically serve example files from `../docs/examples/`.

## Learning Path

### Recommended Exploration Order:

1. **Start with Level 3 (Administrative)** - Begin with Patient, Practitioner, Organization
2. **Move to Level 4 (Clinical)** - Explore Observation, Condition, Procedure
3. **Understand Level 2 (Support)** - Learn about ValueSets, CodeSystems
4. **Explore Level 1 (Foundation)** - Deep dive into base Resource structure
5. **Advanced Level 5 (Reasoning)** - Study PlanDefinition, Measure

### Key Concepts to Learn:

- **Resource Structure**: Every FHIR resource inherits from the base Resource type
- **References**: How resources link to each other (Patient → Practitioner)
- **Terminology**: ValueSets and CodeSystems for standardized values
- **Extensions**: How to add custom data elements
- **Bundles**: Grouping related resources together

## Future Enhancements (Phase 2+)

- **Resource Detail Views**: Drill down into individual resource schemas
- **Interactive Examples**: View and edit real FHIR JSON examples
- **Resource Relationships**: Visual representation of how resources connect
- **Learning Modules**: Guided tutorials for common FHIR patterns
- **Code Generation**: Generate sample TypeScript interfaces from FHIR schemas
- **FHIRPath Playground**: Interactive query testing
- **Import/Export**: Load custom FHIR resources

## Contributing

This is a learning project for FHIR education. Contributions welcome for:
- Additional FHIR resource definitions
- Enhanced examples and documentation
- UI/UX improvements
- Educational content and tutorials

## About FHIR

FHIR (Fast Healthcare Interoperability Resources) is a standard for exchanging healthcare information electronically. Developed by HL7, it defines a set of "Resources" that represent granular clinical concepts and provides RESTful APIs for working with healthcare data.

Learn more at: https://hl7.org/fhir/
