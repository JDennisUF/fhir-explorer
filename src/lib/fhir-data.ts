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
  reasoning: "Advanced clinical reasoning tools, Libraries, Guidance responses",
  financial: "Financial transactions, claims, coverage, and billing",
  workflow: "Workflow and task management, communication, requests",
  specialized: "Specialized resources for specific domains",
  documents: "Document management and composition",
  messaging: "Messaging and event definitions",
  conformance: "Conformance and capability declarations",
  security: "Security, audit, and consent management"
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
  },

  // Additional Level 3: Administrative Resources
  "Account": {
    name: "Account",
    description: "A financial tool for tracking value accrued for a particular purpose",
    level: 3,
    category: "administrative",
    examples: ["account-example.json"],
    relatedResources: ["Patient", "Organization", "ChargeItem"],
    commonUses: ["Patient billing", "Insurance tracking", "Cost center management"],
    keyProperties: ["status", "type", "name", "subject", "owner"]
  },
  "Appointment": {
    name: "Appointment",
    description: "A booking of a healthcare event among patient(s), practitioner(s), related person(s) and/or device(s)",
    level: 3,
    category: "administrative",
    examples: ["appointment-example.json"],
    relatedResources: ["Patient", "Practitioner", "Location", "Schedule", "Slot"],
    commonUses: ["Scheduling visits", "Booking procedures", "Resource management"],
    keyProperties: ["status", "appointmentType", "start", "end", "participant", "subject"]
  },
  "AppointmentResponse": {
    name: "AppointmentResponse",
    description: "A reply to an appointment request for a patient and/or practitioner(s)",
    level: 3,
    category: "administrative",
    examples: ["appointmentresponse-example.json"],
    relatedResources: ["Appointment", "Patient", "Practitioner"],
    commonUses: ["Accepting appointments", "Declining appointments", "Tentative responses"],
    keyProperties: ["appointment", "start", "end", "participantType", "actor", "participantStatus"]
  },
  "Schedule": {
    name: "Schedule",
    description: "A container for slots of time that may be available for booking appointments",
    level: 3,
    category: "administrative",
    relatedResources: ["Slot", "Appointment", "Practitioner", "Location"],
    commonUses: ["Availability management", "Resource scheduling", "Time slot definition"],
    keyProperties: ["active", "serviceCategory", "serviceType", "specialty", "actor"]
  },
  "Slot": {
    name: "Slot",
    description: "A slot of time on a schedule that may be available for booking appointments",
    level: 3,
    category: "administrative",
    relatedResources: ["Schedule", "Appointment"],
    commonUses: ["Available time slots", "Booking windows", "Resource availability"],
    keyProperties: ["serviceCategory", "serviceType", "specialty", "appointmentType", "schedule", "status", "start", "end"]
  },
  "Person": {
    name: "Person",
    description: "Demographics and administrative information about a person independent of a specific health-related context",
    level: 3,
    category: "administrative",
    relatedResources: ["Patient", "Practitioner", "RelatedPerson"],
    commonUses: ["Master person index", "Identity management", "Person linking"],
    keyProperties: ["identifier", "name", "telecom", "gender", "birthDate", "address"]
  },
  "RelatedPerson": {
    name: "RelatedPerson",
    description: "Information about a person that is involved in the care for a patient, but who is not the target of healthcare",
    level: 3,
    category: "administrative",
    examples: ["RelatedPerson-denovoFather.json"],
    relatedResources: ["Patient", "Person"],
    commonUses: ["Emergency contacts", "Care givers", "Family members", "Guardians"],
    keyProperties: ["patient", "relationship", "name", "telecom", "gender", "address"]
  },
  "PractitionerRole": {
    name: "PractitionerRole",
    description: "A specific set of Roles/Locations/specialties/services that a practitioner may perform at an organization",
    level: 3,
    category: "administrative",
    relatedResources: ["Practitioner", "Organization", "Location", "HealthcareService"],
    commonUses: ["Provider directories", "Role assignments", "Specialty tracking"],
    keyProperties: ["practitioner", "organization", "code", "specialty", "location", "healthcareService"]
  },
  "OrganizationAffiliation": {
    name: "OrganizationAffiliation",
    description: "Defines an affiliation/assocciation/relationship between 2 distinct organizations",
    level: 3,
    category: "administrative",
    relatedResources: ["Organization", "Location", "HealthcareService"],
    commonUses: ["Network relationships", "Partnerships", "Referral networks"],
    keyProperties: ["organization", "participatingOrganization", "network", "code", "specialty"]
  },
  "Endpoint": {
    name: "Endpoint",
    description: "The technical details of an endpoint that can be used for electronic services",
    level: 3,
    category: "administrative",
    relatedResources: ["Organization", "Practitioner", "PractitionerRole"],
    commonUses: ["Service directories", "Integration endpoints", "Communication channels"],
    keyProperties: ["status", "connectionType", "name", "managingOrganization", "contact", "address"]
  },

  // Financial Resources
  "ChargeItem": {
    name: "ChargeItem",
    description: "The resource ChargeItem describes the provision of healthcare provider products for a certain patient",
    level: 4,
    category: "financial",
    examples: ["chargeitem-example.json"],
    relatedResources: ["Account", "Patient", "Encounter", "Procedure"],
    commonUses: ["Billing items", "Service charges", "Product charges"],
    keyProperties: ["status", "code", "subject", "context", "occurrenceDateTime", "quantity", "priceOverride"]
  },
  "ChargeItemDefinition": {
    name: "ChargeItemDefinition",
    description: "The ChargeItemDefinition resource provides the properties that apply to the (billing) codes",
    level: 2,
    category: "financial",
    examples: ["chargeitemdefinition-device-example.json"],
    relatedResources: ["ChargeItem"],
    commonUses: ["Billing code definitions", "Pricing rules", "Charge templates"],
    keyProperties: ["url", "status", "code", "instance", "applicability", "propertyGroup"]
  },
  "Claim": {
    name: "Claim",
    description: "A provider issued list of professional services and products provided, or to be provided, to a patient",
    level: 4,
    category: "financial",
    examples: ["claim-example.json"],
    relatedResources: ["Patient", "Coverage", "ClaimResponse", "ExplanationOfBenefit"],
    commonUses: ["Insurance claims", "Billing submissions", "Reimbursement requests"],
    keyProperties: ["status", "type", "use", "patient", "created", "provider", "priority", "insurance"]
  },
  "ClaimResponse": {
    name: "ClaimResponse",
    description: "This resource provides the adjudication details from the processing of a Claim resource",
    level: 4,
    category: "financial",
    examples: ["claimresponse-example.json"],
    relatedResources: ["Claim", "Patient", "Coverage"],
    commonUses: ["Claim adjudication", "Payment decisions", "Denial explanations"],
    keyProperties: ["status", "type", "use", "patient", "created", "insurer", "requestor", "outcome"]
  },
  "Coverage": {
    name: "Coverage",
    description: "Financial instrument which may be used to reimburse or pay for health care products and services",
    level: 4,
    category: "financial",
    relatedResources: ["Patient", "Organization", "Claim"],
    commonUses: ["Insurance coverage", "Benefit eligibility", "Coverage verification"],
    keyProperties: ["status", "type", "policyHolder", "subscriber", "beneficiary", "payor"]
  },
  "CoverageEligibilityRequest": {
    name: "CoverageEligibilityRequest",
    description: "The CoverageEligibilityRequest provides patient and insurance coverage information to an insurer",
    level: 4,
    category: "financial",
    relatedResources: ["Coverage", "Patient", "CoverageEligibilityResponse"],
    commonUses: ["Eligibility verification", "Benefit inquiry", "Coverage validation"],
    keyProperties: ["status", "priority", "purpose", "patient", "created", "provider", "insurer"]
  },
  "CoverageEligibilityResponse": {
    name: "CoverageEligibilityResponse",
    description: "This resource provides eligibility and plan details from the processing of an CoverageEligibilityRequest",
    level: 4,
    category: "financial",
    relatedResources: ["CoverageEligibilityRequest", "Coverage", "Patient"],
    commonUses: ["Eligibility confirmation", "Benefit details", "Coverage status"],
    keyProperties: ["status", "purpose", "patient", "created", "requestor", "outcome", "insurer"]
  },
  "EnrollmentRequest": {
    name: "EnrollmentRequest",
    description: "This resource provides the insurance enrollment details to the insurer regarding a specified coverage",
    level: 4,
    category: "financial",
    relatedResources: ["Coverage", "Patient", "Organization"],
    commonUses: ["Insurance enrollment", "Coverage applications", "Member registration"],
    keyProperties: ["status", "created", "insurer", "provider", "candidate", "coverage"]
  },
  "EnrollmentResponse": {
    name: "EnrollmentResponse",
    description: "This resource provides enrollment and plan details from the processing of an EnrollmentRequest",
    level: 4,
    category: "financial",
    relatedResources: ["EnrollmentRequest", "Coverage"],
    commonUses: ["Enrollment confirmation", "Coverage approval", "Registration response"],
    keyProperties: ["status", "request", "outcome", "disposition", "created", "organization"]
  },
  "ExplanationOfBenefit": {
    name: "ExplanationOfBenefit",
    description: "This resource provides the details of the outcome of processing the given insurance claim",
    level: 4,
    category: "financial",
    examples: ["explanationofbenefit-example.json"],
    relatedResources: ["Claim", "ClaimResponse", "Coverage", "Patient"],
    commonUses: ["EOB statements", "Payment explanations", "Benefit summaries"],
    keyProperties: ["status", "type", "use", "patient", "created", "insurer", "provider", "outcome"]
  },
  "Invoice": {
    name: "Invoice",
    description: "Invoice containing collected ChargeItems from an Account with calculated individual and total price",
    level: 4,
    category: "financial",
    examples: ["invoice-example.json"],
    relatedResources: ["Account", "ChargeItem", "Patient"],
    commonUses: ["Patient invoices", "Billing statements", "Payment requests"],
    keyProperties: ["status", "type", "subject", "recipient", "date", "participant", "totalNet"]
  },
  "PaymentNotice": {
    name: "PaymentNotice",
    description: "This resource provides the status of the payment for goods and services rendered",
    level: 4,
    category: "financial",
    relatedResources: ["PaymentReconciliation", "Claim"],
    commonUses: ["Payment notifications", "Payment status", "Remittance advice"],
    keyProperties: ["status", "request", "response", "created", "provider", "payment", "paymentDate"]
  },
  "PaymentReconciliation": {
    name: "PaymentReconciliation",
    description: "This resource provides payment details and claim references supporting a bulk payment",
    level: 4,
    category: "financial",
    relatedResources: ["Claim", "ClaimResponse", "PaymentNotice"],
    commonUses: ["Payment reconciliation", "Bulk payments", "Claim settlements"],
    keyProperties: ["status", "period", "created", "paymentIssuer", "request", "requestor", "outcome"]
  },
  "InsurancePlan": {
    name: "InsurancePlan",
    description: "Details of a Health Insurance product/plan provided by an organization",
    level: 3,
    category: "financial",
    relatedResources: ["Organization", "Coverage"],
    commonUses: ["Insurance products", "Plan catalogs", "Benefit designs"],
    keyProperties: ["status", "type", "name", "ownedBy", "administeredBy", "coverageArea"]
  },

  // Clinical Resources - Additional
  "CarePlan": {
    name: "CarePlan",
    description: "Describes the intention of how one or more practitioners intend to deliver care for a particular patient",
    level: 4,
    category: "clinical",
    examples: ["careplan-example.json"],
    relatedResources: ["Patient", "Goal", "ServiceRequest", "Procedure", "CareTeam"],
    commonUses: ["Treatment plans", "Care coordination", "Clinical protocols"],
    keyProperties: ["status", "intent", "category", "title", "subject", "period", "activity"]
  },
  "CareTeam": {
    name: "CareTeam",
    description: "The Care Team includes all the people and organizations who plan to participate in the coordination and delivery of care",
    level: 4,
    category: "clinical",
    examples: ["careteam-example.json"],
    relatedResources: ["Patient", "Practitioner", "Organization", "CarePlan"],
    commonUses: ["Care coordination", "Team management", "Provider collaboration"],
    keyProperties: ["status", "category", "name", "subject", "period", "participant"]
  },
  "Goal": {
    name: "Goal",
    description: "Describes the intended objective(s) for a patient, group or organization care",
    level: 4,
    category: "clinical",
    relatedResources: ["Patient", "CarePlan", "Observation"],
    commonUses: ["Care goals", "Treatment targets", "Health objectives"],
    keyProperties: ["lifecycleStatus", "achievementStatus", "category", "description", "subject", "target"]
  },
  "ServiceRequest": {
    name: "ServiceRequest",
    description: "A record of a request for service such as diagnostic investigations, treatments, or operations",
    level: 4,
    category: "clinical",
    examples: ["ServiceRequest-genomicServiceRequest.json"],
    relatedResources: ["Patient", "Practitioner", "DiagnosticReport", "Procedure"],
    commonUses: ["Lab orders", "Procedure requests", "Referrals", "Consultation requests"],
    keyProperties: ["status", "intent", "category", "code", "subject", "requester", "reasonCode"]
  },
  "ClinicalImpression": {
    name: "ClinicalImpression",
    description: "A record of a clinical assessment performed to determine what problem(s) may affect the patient",
    level: 4,
    category: "clinical",
    examples: ["clinicalimpression-example.json"],
    relatedResources: ["Patient", "Encounter", "Condition", "Observation"],
    commonUses: ["Clinical assessments", "Diagnostic impressions", "Care summaries"],
    keyProperties: ["status", "subject", "encounter", "effectiveDateTime", "assessor", "summary", "finding"]
  },
  "DetectedIssue": {
    name: "DetectedIssue",
    description: "Indicates an actual or potential clinical issue with or between one or more active or proposed clinical actions",
    level: 4,
    category: "clinical",
    relatedResources: ["Patient", "MedicationRequest", "Observation"],
    commonUses: ["Drug interactions", "Clinical alerts", "Safety warnings"],
    keyProperties: ["status", "code", "severity", "patient", "identifiedDateTime", "author", "implicated"]
  },
  "FamilyMemberHistory": {
    name: "FamilyMemberHistory",
    description: "Significant health conditions for a person related to the patient relevant in the context of care",
    level: 4,
    category: "clinical",
    relatedResources: ["Patient", "Condition", "RelatedPerson"],
    commonUses: ["Family history", "Genetic risk factors", "Hereditary conditions"],
    keyProperties: ["status", "patient", "date", "name", "relationship", "condition"]
  },
  "Flag": {
    name: "Flag",
    description: "Prospective warnings of potential issues when providing care to the patient",
    level: 4,
    category: "clinical",
    relatedResources: ["Patient", "Encounter", "Practitioner"],
    commonUses: ["Clinical alerts", "Safety warnings", "Patient flags"],
    keyProperties: ["status", "category", "code", "subject", "period", "author"]
  },
  "RiskAssessment": {
    name: "RiskAssessment",
    description: "An assessment of the likely outcome(s) for a patient or other subject as well as the likelihood of each outcome",
    level: 4,
    category: "clinical",
    relatedResources: ["Patient", "Condition", "Observation"],
    commonUses: ["Risk calculations", "Outcome predictions", "Clinical decision support"],
    keyProperties: ["status", "method", "subject", "encounter", "occurrenceDateTime", "performer", "prediction"]
  },
  "AdverseEvent": {
    name: "AdverseEvent",
    description: "An event that results in unintended harm to a patient or research subject",
    level: 4,
    category: "clinical",
    examples: ["adverseevent-example.json"],
    relatedResources: ["Patient", "MedicationRequest", "Device", "Procedure"],
    commonUses: ["Safety reporting", "Adverse drug events", "Medical device incidents"],
    keyProperties: ["actuality", "category", "event", "subject", "encounter", "date", "detected"]
  },
  "Basic": {
    name: "Basic",
    description: "Basic is used for handling concepts not yet defined in FHIR, narrative-only resources, etc.",
    level: 1,
    category: "foundation",
    examples: ["basic-example.json"],
    relatedResources: ["Patient", "Practitioner"],
    commonUses: ["Custom resources", "Narrative content", "Extension resources"],
    keyProperties: ["identifier", "code", "subject", "created", "author"]
  },

  // Medication Resources
  "Medication": {
    name: "Medication",
    description: "This resource is primarily used for the identification and definition of a medication for the purposes of prescribing",
    level: 4,
    category: "clinical",
    relatedResources: ["MedicationRequest", "MedicationAdministration", "MedicationDispense"],
    commonUses: ["Drug definitions", "Medication catalogs", "Formulary management"],
    keyProperties: ["code", "status", "manufacturer", "form", "ingredient", "batch"]
  },
  "MedicationAdministration": {
    name: "MedicationAdministration",
    description: "Describes the event of a patient consuming or otherwise being administered a medication",
    level: 4,
    category: "clinical",
    relatedResources: ["Medication", "MedicationRequest", "Patient", "Practitioner"],
    commonUses: ["Medication administration records", "MAR documentation", "Drug delivery tracking"],
    keyProperties: ["status", "medication", "subject", "context", "effectiveDateTime", "performer", "dosage"]
  },
  "MedicationDispense": {
    name: "MedicationDispense",
    description: "Indicates that a medication product is to be or has been dispensed for a named person/patient",
    level: 4,
    category: "clinical",
    relatedResources: ["Medication", "MedicationRequest", "Patient", "Practitioner"],
    commonUses: ["Pharmacy dispensing", "Medication fulfillment", "Drug supply tracking"],
    keyProperties: ["status", "medication", "subject", "performer", "authorizingPrescription", "quantity", "whenHandedOver"]
  },
  "MedicationKnowledge": {
    name: "MedicationKnowledge",
    description: "Information about a medication that is used to support knowledge",
    level: 2,
    category: "support",
    relatedResources: ["Medication"],
    commonUses: ["Drug information", "Clinical decision support", "Medication databases"],
    keyProperties: ["code", "status", "manufacturer", "doseForm", "intendedRoute", "contraindication"]
  },
  "MedicationStatement": {
    name: "MedicationStatement",
    description: "A record of a medication that is being consumed by a patient",
    level: 4,
    category: "clinical",
    relatedResources: ["Medication", "MedicationRequest", "Patient"],
    commonUses: ["Medication history", "Current medications", "Medication reconciliation"],
    keyProperties: ["status", "statusReason", "category", "medication", "subject", "effectiveDateTime", "informationSource"]
  },

  // Device Resources
  "Device": {
    name: "Device",
    description: "A type of a manufactured item that is used in the provision of healthcare",
    level: 4,
    category: "clinical",
    examples: ["Device-NGS-device.json"],
    relatedResources: ["Patient", "DeviceRequest", "DeviceUsage"],
    commonUses: ["Medical devices", "Implants", "Equipment tracking"],
    keyProperties: ["identifier", "status", "manufacturer", "deviceName", "type", "patient", "owner"]
  },
  "DeviceAssociation": {
    name: "DeviceAssociation",
    description: "A record of association or dissociation of a device with a patient",
    level: 4,
    category: "clinical",
    relatedResources: ["Device", "Patient"],
    commonUses: ["Device implantation", "Device removal", "Device-patient relationships"],
    keyProperties: ["identifier", "device", "category", "status", "statusReason", "subject", "bodyStructure"]
  },
  "DeviceDefinition": {
    name: "DeviceDefinition",
    description: "The characteristics, operational status and capabilities of a medical-related component of a medical device",
    level: 2,
    category: "support",
    relatedResources: ["Device"],
    commonUses: ["Device specifications", "Product catalogs", "Regulatory information"],
    keyProperties: ["identifier", "udiDeviceIdentifier", "manufacturer", "deviceName", "type", "specialization"]
  },
  "DeviceDispense": {
    name: "DeviceDispense",
    description: "A record of dispensation of a device",
    level: 4,
    category: "clinical",
    relatedResources: ["Device", "DeviceRequest", "Patient"],
    commonUses: ["Device dispensing", "DME delivery", "Device fulfillment"],
    keyProperties: ["status", "device", "subject", "performer", "basedOn", "type", "quantity"]
  },
  "DeviceMetric": {
    name: "DeviceMetric",
    description: "Describes a measurement, calculation or setting capability of a medical device",
    level: 4,
    category: "clinical",
    relatedResources: ["Device", "Observation"],
    commonUses: ["Device measurements", "Monitoring parameters", "Device capabilities"],
    keyProperties: ["identifier", "type", "unit", "source", "parent", "operationalStatus", "color"]
  },
  "DeviceRequest": {
    name: "DeviceRequest",
    description: "Represents a request for a patient to employ a medical device",
    level: 4,
    category: "clinical",
    relatedResources: ["Device", "Patient", "Practitioner"],
    commonUses: ["Device orders", "DME prescriptions", "Equipment requests"],
    keyProperties: ["status", "intent", "priority", "device", "subject", "encounter", "requester"]
  },
  "DeviceUsage": {
    name: "DeviceUsage",
    description: "A record of a device being used by a patient where the record is the result of a report from the patient",
    level: 4,
    category: "clinical",
    relatedResources: ["Device", "Patient"],
    commonUses: ["Device usage tracking", "Patient-reported usage", "Compliance monitoring"],
    keyProperties: ["status", "category", "patient", "derivedFrom", "device", "timingDateTime", "dateAsserted"]
  },

  // Specimen and Diagnostic Resources
  "Specimen": {
    name: "Specimen",
    description: "A sample to be used for analysis",
    level: 4,
    category: "clinical",
    examples: ["Specimen-genomicSpecimen.json"],
    relatedResources: ["Patient", "DiagnosticReport", "Observation"],
    commonUses: ["Lab specimens", "Pathology samples", "Biobank samples"],
    keyProperties: ["identifier", "status", "type", "subject", "receivedTime", "collection", "processing"]
  },
  "SpecimenDefinition": {
    name: "SpecimenDefinition",
    description: "A kind of specimen with associated set of requirements",
    level: 2,
    category: "support",
    relatedResources: ["Specimen"],
    commonUses: ["Specimen requirements", "Collection protocols", "Lab test specifications"],
    keyProperties: ["identifier", "typeCollected", "patientPreparation", "timeAspect", "collection", "typeTested"]
  },
  "BodyStructure": {
    name: "BodyStructure",
    description: "Record details about an anatomical structure",
    level: 4,
    category: "clinical",
    examples: ["bodystructure-example-tumor.json"],
    relatedResources: ["Patient", "Condition", "Procedure"],
    commonUses: ["Anatomical references", "Tumor locations", "Surgical sites"],
    keyProperties: ["identifier", "active", "morphology", "location", "description", "patient"]
  },

  // Imaging Resources
  "ImagingStudy": {
    name: "ImagingStudy",
    description: "Representation of the content produced in a DICOM imaging study",
    level: 4,
    category: "clinical",
    relatedResources: ["Patient", "DiagnosticReport", "Encounter"],
    commonUses: ["Radiology studies", "Medical imaging", "DICOM metadata"],
    keyProperties: ["identifier", "status", "modality", "subject", "encounter", "started", "series"]
  },
  "ImagingSelection": {
    name: "ImagingSelection",
    description: "A selection of DICOM SOP instances and/or frames within a single Study and Series",
    level: 4,
    category: "clinical",
    relatedResources: ["ImagingStudy", "Patient"],
    commonUses: ["Image annotations", "ROI selections", "Key images"],
    keyProperties: ["identifier", "status", "subject", "derivedFrom", "endpoint", "seriesUid", "instance"]
  },

  // Immunization Resources
  "Immunization": {
    name: "Immunization",
    description: "Describes the event of a patient being administered a vaccine or a record of an immunization",
    level: 4,
    category: "clinical",
    relatedResources: ["Patient", "Practitioner", "ImmunizationRecommendation"],
    commonUses: ["Vaccination records", "Immunization tracking", "Vaccine administration"],
    keyProperties: ["status", "statusReason", "vaccineCode", "patient", "encounter", "occurrenceDateTime", "performer"]
  },
  "ImmunizationEvaluation": {
    name: "ImmunizationEvaluation",
    description: "Describes a comparison of an immunization event against published recommendations",
    level: 4,
    category: "clinical",
    relatedResources: ["Immunization", "Patient", "ImmunizationRecommendation"],
    commonUses: ["Vaccine evaluation", "Immunization assessment", "Vaccine series tracking"],
    keyProperties: ["identifier", "status", "patient", "date", "authority", "targetDisease", "immunizationEvent"]
  },
  "ImmunizationRecommendation": {
    name: "ImmunizationRecommendation",
    description: "A patient's point-in-time set of recommendations according to a published immunization schedule",
    level: 4,
    category: "clinical",
    relatedResources: ["Patient", "Immunization"],
    commonUses: ["Vaccine recommendations", "Immunization schedules", "Vaccine forecasting"],
    keyProperties: ["identifier", "patient", "date", "authority", "recommendation"]
  },

  // Nutrition Resources
  "NutritionOrder": {
    name: "NutritionOrder",
    description: "A request to supply a diet, formula feeding (enteral) or oral nutritional supplement to a patient/resident",
    level: 4,
    category: "clinical",
    relatedResources: ["Patient", "Practitioner", "Encounter"],
    commonUses: ["Diet orders", "Nutrition therapy", "Enteral feeding"],
    keyProperties: ["identifier", "status", "intent", "patient", "encounter", "dateTime", "orderer"]
  },
  "NutritionProduct": {
    name: "NutritionProduct",
    description: "A food or fluid product that is consumed by patients",
    level: 4,
    category: "clinical",
    relatedResources: ["NutritionOrder"],
    commonUses: ["Nutrition products", "Dietary supplements", "Enteral formulas"],
    keyProperties: ["status", "category", "code", "manufacturer", "nutrient", "ingredient"]
  },
  "NutritionIntake": {
    name: "NutritionIntake",
    description: "A record of food or fluid that is being consumed by a patient",
    level: 4,
    category: "clinical",
    relatedResources: ["Patient", "NutritionOrder"],
    commonUses: ["Nutrition intake tracking", "Dietary monitoring", "Food consumption records"],
    keyProperties: ["identifier", "status", "statusReason", "category", "code", "subject", "encounter"]
  },

  // Documents and Composition Resources
  "DocumentReference": {
    name: "DocumentReference",
    description: "A reference to a document of any kind for any purpose",
    level: 4,
    category: "documents",
    examples: ["DocumentReference-genomicFile1.json"],
    relatedResources: ["Patient", "Practitioner", "Organization", "Binary"],
    commonUses: ["Clinical documents", "Medical records", "Images", "Reports"],
    keyProperties: ["status", "type", "category", "subject", "date", "author", "content"]
  },
  "Composition": {
    name: "Composition",
    description: "A set of healthcare-related information that is assembled together into a single logical package",
    level: 4,
    category: "documents",
    examples: ["composition-example.json"],
    relatedResources: ["Patient", "Practitioner", "DocumentReference"],
    commonUses: ["Clinical documents", "Discharge summaries", "Progress notes"],
    keyProperties: ["status", "type", "category", "subject", "date", "author", "title", "section"]
  },
  "Binary": {
    name: "Binary",
    description: "A resource that contains raw data",
    level: 1,
    category: "foundation",
    examples: ["binary-example.json"],
    relatedResources: ["DocumentReference", "Media"],
    commonUses: ["File storage", "Document content", "Image data"],
    keyProperties: ["contentType", "securityContext", "data"]
  },

  // Workflow and Task Resources
  "Task": {
    name: "Task",
    description: "A task to be performed",
    level: 4,
    category: "workflow",
    relatedResources: ["Patient", "Practitioner", "ServiceRequest"],
    commonUses: ["Work assignments", "Clinical tasks", "Administrative tasks"],
    keyProperties: ["status", "intent", "priority", "code", "description", "for", "requester", "owner"]
  },
  "Communication": {
    name: "Communication",
    description: "A record of a communication even if it is planned or has failed",
    level: 4,
    category: "workflow",
    examples: ["communication-example.json"],
    relatedResources: ["Patient", "Practitioner", "CommunicationRequest"],
    commonUses: ["Patient communications", "Provider messages", "Care coordination"],
    keyProperties: ["status", "category", "priority", "subject", "encounter", "sent", "received", "sender"]
  },
  "CommunicationRequest": {
    name: "CommunicationRequest",
    description: "A request to convey information; e.g. the CDS system proposes that an alert be sent to a responsible provider",
    level: 4,
    category: "workflow",
    examples: ["communicationrequest-example.json"],
    relatedResources: ["Patient", "Practitioner", "Communication"],
    commonUses: ["Communication requests", "Alert requests", "Notification requests"],
    keyProperties: ["status", "priority", "category", "subject", "encounter", "occurrenceDateTime", "requester"]
  },
  "Transport": {
    name: "Transport",
    description: "Record of transport of patient or goods",
    level: 4,
    category: "workflow",
    relatedResources: ["Patient", "Location"],
    commonUses: ["Patient transport", "Equipment transport", "Supply delivery"],
    keyProperties: ["status", "intent", "priority", "code", "description", "subject", "currentLocation"]
  },

  // Messaging Resources
  "MessageHeader": {
    name: "MessageHeader",
    description: "The header for a message exchange that is either requesting or responding to an action",
    level: 2,
    category: "messaging",
    relatedResources: ["Bundle", "OperationOutcome"],
    commonUses: ["Message routing", "Event notifications", "System integration"],
    keyProperties: ["event", "destination", "sender", "timestamp", "source", "focus"]
  },
  "MessageDefinition": {
    name: "MessageDefinition",
    description: "Defines the characteristics of a message that can be shared between systems",
    level: 2,
    category: "messaging",
    relatedResources: ["MessageHeader"],
    commonUses: ["Message specifications", "Integration patterns", "Event definitions"],
    keyProperties: ["url", "identifier", "version", "name", "title", "status", "experimental", "category"]
  },

  // Security and Audit Resources
  "AuditEvent": {
    name: "AuditEvent",
    description: "A record of an event relevant for purposes such as operations, privacy, security, maintenance, and performance audits",
    level: 2,
    category: "security",
    examples: ["auditevent-example.json"],
    relatedResources: ["Patient", "Practitioner", "Organization"],
    commonUses: ["Security auditing", "Access logging", "Privacy tracking"],
    keyProperties: ["type", "subtype", "action", "period", "recorded", "outcome", "agent", "source"]
  },
  "Consent": {
    name: "Consent",
    description: "A record of a healthcare consumer's choices or choices made on their behalf by a third party",
    level: 2,
    category: "security",
    relatedResources: ["Patient", "Practitioner", "Organization"],
    commonUses: ["Privacy consent", "Treatment consent", "Research consent"],
    keyProperties: ["status", "scope", "category", "patient", "dateTime", "performer", "provision"]
  },
  "Provenance": {
    name: "Provenance",
    description: "Provenance of a resource is a record that describes entities and processes involved in producing and delivering or otherwise influencing that resource",
    level: 2,
    category: "security",
    relatedResources: ["Patient", "Practitioner", "Organization"],
    commonUses: ["Data lineage", "Audit trails", "Attribution tracking"],
    keyProperties: ["target", "occurredDateTime", "recorded", "policy", "location", "reason", "activity", "agent"]
  },
  "Permission": {
    name: "Permission",
    description: "Permission resource holds access rules for a given domain of content",
    level: 2,
    category: "security",
    relatedResources: ["Patient", "Practitioner", "Organization"],
    commonUses: ["Access control", "Permission management", "Security policies"],
    keyProperties: ["status", "intent", "asserter", "assertionDate", "validity", "purpose", "dataScope"]
  },

  // Conformance and Terminology Resources
  "TerminologyCapabilities": {
    name: "TerminologyCapabilities",
    description: "A TerminologyCapabilities resource documents a set of capabilities of a FHIR Server that may be used as a statement",
    level: 2,
    category: "conformance",
    relatedResources: ["CapabilityStatement", "ValueSet", "CodeSystem"],
    commonUses: ["Server capabilities", "Terminology services", "API documentation"],
    keyProperties: ["url", "version", "name", "title", "status", "experimental", "date", "publisher"]
  },
  "NamingSystem": {
    name: "NamingSystem",
    description: "A curated namespace that issues unique symbols within that namespace for the identification of concepts, people, devices, etc.",
    level: 2,
    category: "support",
    relatedResources: ["Identifier"],
    commonUses: ["Identifier systems", "Namespace management", "Code system registration"],
    keyProperties: ["name", "status", "kind", "date", "publisher", "responsible", "type", "description"]
  },
  "SearchParameter": {
    name: "SearchParameter",
    description: "A search parameter that defines a named search item that can be used to search/filter on a resource",
    level: 2,
    category: "conformance",
    relatedResources: ["CapabilityStatement"],
    commonUses: ["Search definitions", "API parameters", "Query specifications"],
    keyProperties: ["url", "version", "name", "status", "experimental", "date", "publisher", "description", "code"]
  },
  "OperationDefinition": {
    name: "OperationDefinition",
    description: "A formal computable definition of an operation or a named query",
    level: 2,
    category: "conformance",
    relatedResources: ["CapabilityStatement"],
    commonUses: ["Operation definitions", "Custom operations", "Server functions"],
    keyProperties: ["url", "version", "name", "title", "status", "kind", "experimental", "date", "publisher"]
  },
  "GraphDefinition": {
    name: "GraphDefinition",
    description: "A formal computable definition of a graph of resources",
    level: 2,
    category: "conformance",
    relatedResources: ["Bundle"],
    commonUses: ["Resource graphs", "Data relationships", "Query definitions"],
    keyProperties: ["url", "version", "name", "status", "experimental", "date", "publisher", "description", "start"]
  },
  "StructureMap": {
    name: "StructureMap",
    description: "A Map of relationships between 2 structures that can be used to transform data",
    level: 2,
    category: "conformance",
    relatedResources: ["StructureDefinition"],
    commonUses: ["Data transformation", "Mapping rules", "Format conversion"],
    keyProperties: ["url", "identifier", "version", "name", "title", "status", "experimental", "date"]
  },

  // Testing and Validation Resources
  "TestScript": {
    name: "TestScript",
    description: "A structured set of tests against a FHIR server or client implementation",
    level: 2,
    category: "conformance",
    relatedResources: ["TestReport"],
    commonUses: ["API testing", "Conformance testing", "Integration testing"],
    keyProperties: ["url", "identifier", "version", "name", "title", "status", "experimental", "date"]
  },
  "TestReport": {
    name: "TestReport",
    description: "A summary of information based on the results of executing a TestScript",
    level: 2,
    category: "conformance",
    relatedResources: ["TestScript"],
    commonUses: ["Test results", "Conformance reports", "Validation outcomes"],
    keyProperties: ["identifier", "name", "status", "testScript", "result", "score", "tester", "issued"]
  },
  "TestPlan": {
    name: "TestPlan",
    description: "A plan for executing testing on an artifact or specifications",
    level: 2,
    category: "conformance",
    relatedResources: ["TestScript", "TestReport"],
    commonUses: ["Test planning", "Test case organization", "Testing strategies"],
    keyProperties: ["url", "identifier", "version", "name", "title", "status", "experimental", "date"]
  },

  // Research and Evidence Resources
  "ResearchStudy": {
    name: "ResearchStudy",
    description: "A scientific study of nature that sometimes includes a hypothesis that must be proven or disproven",
    level: 5,
    category: "reasoning",
    relatedResources: ["ResearchSubject", "Patient", "Organization"],
    commonUses: ["Clinical trials", "Research protocols", "Study management"],
    keyProperties: ["identifier", "title", "protocol", "partOf", "status", "primaryPurposeType", "phase"]
  },
  "ResearchSubject": {
    name: "ResearchSubject",
    description: "A research subject is an entity that is the subject of investigation activities in a research study",
    level: 5,
    category: "reasoning",
    relatedResources: ["ResearchStudy", "Patient"],
    commonUses: ["Study enrollment", "Subject tracking", "Research participation"],
    keyProperties: ["identifier", "status", "progress", "period", "study", "subject", "assignedArm"]
  },
  "Evidence": {
    name: "Evidence",
    description: "The Evidence Resource provides a machine-interpretable expression of an evidence concept",
    level: 5,
    category: "reasoning",
    relatedResources: ["EvidenceVariable", "Citation"],
    commonUses: ["Evidence synthesis", "Research evidence", "Clinical evidence"],
    keyProperties: ["url", "identifier", "version", "name", "title", "status", "experimental", "date"]
  },
  "EvidenceVariable": {
    name: "EvidenceVariable",
    description: "The EvidenceVariable resource describes an element that knowledge (Evidence, Assertion, Recommendation) is about",
    level: 5,
    category: "reasoning",
    relatedResources: ["Evidence", "Population"],
    commonUses: ["Study variables", "Research parameters", "Evidence factors"],
    keyProperties: ["url", "identifier", "version", "name", "title", "status", "experimental", "date"]
  },
  "EvidenceReport": {
    name: "EvidenceReport",
    description: "The EvidenceReport Resource is a specialized container for a collection of resources and codeable concepts",
    level: 5,
    category: "reasoning",
    relatedResources: ["Evidence", "Citation"],
    commonUses: ["Evidence reports", "Research summaries", "Systematic reviews"],
    keyProperties: ["url", "status", "useContext", "publisher", "contact", "author", "editor", "reviewer"]
  },
  "Citation": {
    name: "Citation",
    description: "The Citation Resource enables reference to any knowledge artifact for purposes of identification and attribution",
    level: 5,
    category: "reasoning",
    examples: ["citation-example-research-doi.json"],
    relatedResources: ["Evidence", "EvidenceReport"],
    commonUses: ["Research citations", "Literature references", "Knowledge attribution"],
    keyProperties: ["url", "identifier", "version", "name", "title", "status", "experimental", "date"]
  },

  // Specialized Clinical Resources
  "GenomicStudy": {
    name: "GenomicStudy",
    description: "A genomics study is a set of analyses performed to analyze and generate genomic data",
    level: 4,
    category: "specialized",
    relatedResources: ["Patient", "Specimen", "DocumentReference"],
    commonUses: ["Genomic analysis", "DNA sequencing", "Genetic testing"],
    keyProperties: ["identifier", "status", "type", "subject", "encounter", "startDate", "basedOn"]
  },
  "MolecularSequence": {
    name: "MolecularSequence",
    description: "Representation of a molecular sequence",
    level: 4,
    category: "specialized",
    relatedResources: ["Patient", "Specimen", "Observation"],
    commonUses: ["DNA sequences", "RNA sequences", "Protein sequences"],
    keyProperties: ["identifier", "type", "coordinateSystem", "patient", "specimen", "device", "quantity"]
  },
  "BiologicallyDerivedProduct": {
    name: "BiologicallyDerivedProduct",
    description: "A material substance originating from a biological entity intended to be transplanted or infused",
    level: 4,
    category: "specialized",
    examples: ["biologicallyderivedproduct-example.json"],
    relatedResources: ["Patient", "Procedure"],
    commonUses: ["Blood products", "Tissue transplants", "Cell therapy"],
    keyProperties: ["identifier", "biologicalSourceEvent", "processingFacility", "division", "status", "expirationDate"]
  },
  "BiologicallyDerivedProductDispense": {
    name: "BiologicallyDerivedProductDispense",
    description: "A record of dispensation of a biologically derived product",
    level: 4,
    category: "specialized",
    examples: ["biologicallyderivedproductdispense-example.json"],
    relatedResources: ["BiologicallyDerivedProduct", "Patient"],
    commonUses: ["Blood transfusions", "Tissue dispensing", "Cell product delivery"],
    keyProperties: ["identifier", "basedOn", "partOf", "status", "product", "patient", "matchStatus"]
  },

  // Substance and Product Resources
  "Substance": {
    name: "Substance",
    description: "A homogeneous material with a definite composition",
    level: 4,
    category: "specialized",
    relatedResources: ["Medication", "SubstanceDefinition"],
    commonUses: ["Chemical substances", "Material definitions", "Ingredient tracking"],
    keyProperties: ["identifier", "status", "category", "code", "description", "instance"]
  },
  "SubstanceDefinition": {
    name: "SubstanceDefinition",
    description: "The detailed description of a substance, typically at a level beyond what is used for prescribing",
    level: 2,
    category: "specialized",
    relatedResources: ["Substance", "Medication"],
    commonUses: ["Drug definitions", "Chemical specifications", "Regulatory data"],
    keyProperties: ["identifier", "version", "status", "classification", "grade", "description", "informationSource"]
  },
  "SubstanceNucleicAcid": {
    name: "SubstanceNucleicAcid",
    description: "Nucleic acids are defined by three distinct elements: the base, sugar and linkage",
    level: 2,
    category: "specialized",
    relatedResources: ["SubstanceDefinition"],
    commonUses: ["DNA/RNA structure", "Nucleic acid definitions", "Genetic material"],
    keyProperties: ["sequenceType", "numberOfSubunits", "areaOfHybridisation", "oligoNucleotideType"]
  },
  "SubstancePolymer": {
    name: "SubstancePolymer",
    description: "Properties of a polymer",
    level: 2,
    category: "specialized",
    relatedResources: ["SubstanceDefinition"],
    commonUses: ["Polymer definitions", "Material science", "Drug delivery systems"],
    keyProperties: ["class", "geometry", "copolymerConnectivity", "modification", "monomerSet"]
  },
  "SubstanceProtein": {
    name: "SubstanceProtein",
    description: "A SubstanceProtein is defined as a single unit of a linear amino acid sequence",
    level: 2,
    category: "specialized",
    relatedResources: ["SubstanceDefinition"],
    commonUses: ["Protein definitions", "Biologic drugs", "Therapeutic proteins"],
    keyProperties: ["sequenceType", "numberOfSubunits", "disulfideLinkage", "subunit"]
  },
  "SubstanceReferenceInformation": {
    name: "SubstanceReferenceInformation",
    description: "Todo",
    level: 2,
    category: "specialized",
    relatedResources: ["SubstanceDefinition"],
    commonUses: ["Reference data", "Substance information", "Regulatory references"],
    keyProperties: ["comment", "gene", "geneElement", "classification", "target"]
  },
  "SubstanceSourceMaterial": {
    name: "SubstanceSourceMaterial",
    description: "Source material shall capture information on the taxonomic and anatomical origins",
    level: 2,
    category: "specialized",
    relatedResources: ["SubstanceDefinition"],
    commonUses: ["Source materials", "Natural products", "Biological origins"],
    keyProperties: ["sourceMaterialClass", "sourceMaterialType", "sourceMaterialState", "organismId", "organismName"]
  },

  // Product Definition Resources
  "MedicinalProductDefinition": {
    name: "MedicinalProductDefinition",
    description: "Detailed definition of a medicinal product, typically for uses other than direct patient care",
    level: 2,
    category: "specialized",
    relatedResources: ["Medication", "ManufacturedItemDefinition"],
    commonUses: ["Drug registration", "Regulatory submissions", "Product catalogs"],
    keyProperties: ["identifier", "type", "domain", "version", "status", "statusDate", "description"]
  },
  "ManufacturedItemDefinition": {
    name: "ManufacturedItemDefinition",
    description: "The definition and characteristics of a medicinal manufactured item, such as a tablet or capsule",
    level: 2,
    category: "specialized",
    relatedResources: ["MedicinalProductDefinition", "Ingredient"],
    commonUses: ["Product specifications", "Manufacturing definitions", "Regulatory data"],
    keyProperties: ["identifier", "status", "name", "manufacturedDoseForm", "unitOfPresentation", "manufacturer"]
  },
  "AdministrableProductDefinition": {
    name: "AdministrableProductDefinition",
    description: "A medicinal product in the final form which is suitable for administering to a patient",
    level: 2,
    category: "specialized",
    examples: ["administrableproductdefinition-example.json"],
    relatedResources: ["MedicinalProductDefinition"],
    commonUses: ["Administration forms", "Dosage forms", "Route specifications"],
    keyProperties: ["identifier", "status", "formOf", "administrableDoseForm", "unitOfPresentation", "routeOfAdministration"]
  },
  "PackagedProductDefinition": {
    name: "PackagedProductDefinition",
    description: "A medically related item or items, in a container or package",
    level: 2,
    category: "specialized",
    relatedResources: ["MedicinalProductDefinition"],
    commonUses: ["Product packaging", "Commercial packages", "Regulatory packaging"],
    keyProperties: ["identifier", "name", "type", "packageFor", "status", "statusDate", "containedItemQuantity"]
  },
  "Ingredient": {
    name: "Ingredient",
    description: "An ingredient of a manufactured item or pharmaceutical product",
    level: 2,
    category: "specialized",
    relatedResources: ["ManufacturedItemDefinition", "Substance"],
    commonUses: ["Drug ingredients", "Active substances", "Excipients"],
    keyProperties: ["identifier", "status", "for", "role", "function", "allergenicIndicator", "substance"]
  },
  "RegulatedAuthorization": {
    name: "RegulatedAuthorization",
    description: "Regulatory approval, clearance or licencing of a regulated product, treatment, facility or activity",
    level: 2,
    category: "specialized",
    relatedResources: ["MedicinalProductDefinition", "Organization"],
    commonUses: ["Drug approvals", "Medical device clearances", "Facility licenses"],
    keyProperties: ["identifier", "subject", "type", "description", "region", "status", "statusDate"]
  },
  "ClinicalUseDefinition": {
    name: "ClinicalUseDefinition",
    description: "A single issue - either an indication, contraindication, interaction or an undesirable effect",
    level: 2,
    category: "specialized",
    examples: ["clinicalusedefinition-example.json"],
    relatedResources: ["MedicinalProductDefinition", "Medication"],
    commonUses: ["Drug interactions", "Contraindications", "Indications"],
    keyProperties: ["identifier", "type", "category", "subject", "status", "description"]
  },

  // Supply Chain Resources
  "SupplyRequest": {
    name: "SupplyRequest",
    description: "A record of a request for a medication, substance or device used in the healthcare setting",
    level: 4,
    category: "workflow",
    relatedResources: ["SupplyDelivery", "Organization", "Device"],
    commonUses: ["Supply orders", "Equipment requests", "Medication orders"],
    keyProperties: ["status", "category", "priority", "itemCodeableConcept", "quantity", "parameter", "occurrence"]
  },
  "SupplyDelivery": {
    name: "SupplyDelivery",
    description: "Record of delivery of what is supplied",
    level: 4,
    category: "workflow",
    relatedResources: ["SupplyRequest", "Patient"],
    commonUses: ["Supply deliveries", "Equipment delivery", "Medication delivery"],
    keyProperties: ["identifier", "basedOn", "partOf", "status", "patient", "type", "suppliedItem"]
  },
  "InventoryItem": {
    name: "InventoryItem",
    description: "A functional description of an inventory item used in inventory and supply-related workflows",
    level: 4,
    category: "workflow",
    relatedResources: ["Organization", "Location"],
    commonUses: ["Inventory management", "Stock tracking", "Supply chain"],
    keyProperties: ["identifier", "status", "category", "code", "name", "responsibleOrganization"]
  },
  "InventoryReport": {
    name: "InventoryReport",
    description: "A report of inventory or stock items",
    level: 4,
    category: "workflow",
    relatedResources: ["InventoryItem", "Organization"],
    commonUses: ["Inventory reports", "Stock levels", "Supply audits"],
    keyProperties: ["identifier", "status", "countType", "operationType", "operationTypeReason", "reportedDateTime"]
  },

  // Episode and Care Management
  "EpisodeOfCare": {
    name: "EpisodeOfCare",
    description: "An association between a patient and an organization / healthcare provider(s)",
    level: 3,
    category: "administrative",
    relatedResources: ["Patient", "Organization", "Encounter"],
    commonUses: ["Care episodes", "Treatment periods", "Care management"],
    keyProperties: ["identifier", "status", "type", "diagnosis", "patient", "managingOrganization", "period"]
  },
  "List": {
    name: "List",
    description: "A list is a curated collection of resources",
    level: 1,
    category: "foundation",
    relatedResources: ["Patient", "Practitioner"],
    commonUses: ["Resource collections", "Care lists", "Problem lists"],
    keyProperties: ["identifier", "status", "mode", "title", "code", "subject", "encounter", "date"]
  },
  "Group": {
    name: "Group",
    description: "Represents a defined collection of entities that may be discussed or acted upon collectively",
    level: 3,
    category: "administrative",
    examples: ["Group-denovoFamily.json"],
    relatedResources: ["Patient", "Person", "ResearchStudy"],
    commonUses: ["Patient cohorts", "Study populations", "Care teams"],
    keyProperties: ["identifier", "active", "type", "actual", "code", "name", "quantity", "member"]
  },
  "Linkage": {
    name: "Linkage",
    description: "Identifies two or more records (resource instances) that refer to the same real-world 'occurrence'",
    level: 1,
    category: "foundation",
    relatedResources: ["Patient", "Person"],
    commonUses: ["Record linking", "Duplicate detection", "Identity management"],
    keyProperties: ["active", "author", "item"]
  },

  // Additional Foundation Resources
  "Bundle": {
    name: "Bundle",
    description: "A container for a collection of resources",
    level: 1,
    category: "foundation",
    examples: ["bundle-example.json"],
    relatedResources: ["Patient", "Practitioner", "Organization"],
    commonUses: ["Message bundles", "Document bundles", "Search results"],
    keyProperties: ["identifier", "type", "timestamp", "total", "link", "entry"]
  },
  "Parameters": {
    name: "Parameters",
    description: "This resource is a non-persisted resource used to pass information into and back from an operation",
    level: 1,
    category: "foundation",
    relatedResources: ["OperationDefinition"],
    commonUses: ["Operation parameters", "Function calls", "API inputs"],
    keyProperties: ["parameter"]
  },
  "OperationOutcome": {
    name: "OperationOutcome",
    description: "A collection of error, warning, or information messages that result from a system action",
    level: 1,
    category: "foundation",
    relatedResources: ["Bundle"],
    commonUses: ["Error messages", "Validation results", "System responses"],
    keyProperties: ["issue"]
  },

  // Additional Workflow Resources
  "RequestOrchestration": {
    name: "RequestOrchestration",
    description: "A set of related requests that can be used to capture intended activities that have inter-dependencies",
    level: 4,
    category: "workflow",
    relatedResources: ["Patient", "Practitioner", "ServiceRequest"],
    commonUses: ["Care orchestration", "Workflow management", "Request coordination"],
    keyProperties: ["identifier", "instantiatesCanonical", "instantiatesUri", "basedOn", "replaces", "groupIdentifier", "status"]
  },
  "GuidanceResponse": {
    name: "GuidanceResponse",
    description: "A guidance response is the formal response to a guidance request",
    level: 5,
    category: "reasoning",
    relatedResources: ["Patient", "Practitioner", "PlanDefinition"],
    commonUses: ["Decision support", "Clinical guidance", "Recommendation responses"],
    keyProperties: ["requestIdentifier", "identifier", "moduleUri", "moduleCanonical", "status", "subject"]
  },

  // Additional Specialized Resources
  "Contract": {
    name: "Contract",
    description: "Legally enforceable, formally recorded unilateral or bilateral directive",
    level: 4,
    category: "specialized",
    relatedResources: ["Patient", "Organization", "Practitioner"],
    commonUses: ["Legal agreements", "Care contracts", "Business agreements"],
    keyProperties: ["identifier", "url", "version", "status", "legalState", "instantiatesCanonical", "instantiatesUri"]
  },
  "Requirements": {
    name: "Requirements",
    description: "A set of requirements - a list of features, properties, capabilities or limitations",
    level: 2,
    category: "conformance",
    examples: ["Requirements-example1.json"],
    relatedResources: ["ImplementationGuide"],
    commonUses: ["System requirements", "Functional specifications", "Implementation requirements"],
    keyProperties: ["url", "identifier", "version", "name", "title", "status", "experimental", "date"]
  },
  "ActorDefinition": {
    name: "ActorDefinition",
    description: "The ActorDefinition resource is used to describe an actor",
    level: 2,
    category: "conformance",
    examples: ["actordefinition-client.json"],
    relatedResources: ["CapabilityStatement"],
    commonUses: ["System actors", "Integration roles", "API participants"],
    keyProperties: ["url", "identifier", "version", "name", "title", "status", "experimental", "date"]
  },

  // Additional Resources
  "ExampleScenario": {
    name: "ExampleScenario",
    description: "Example of workflow instance",
    level: 2,
    category: "conformance",
    relatedResources: ["ImplementationGuide"],
    commonUses: ["Workflow examples", "Use case scenarios", "Implementation examples"],
    keyProperties: ["url", "identifier", "version", "name", "title", "status", "experimental", "date"]
  },
  "FormularyItem": {
    name: "FormularyItem",
    description: "The FormularyItem tracks the availability and cost of a medicinal product",
    level: 4,
    category: "financial",
    relatedResources: ["Medication", "InsurancePlan"],
    commonUses: ["Drug formularies", "Coverage lists", "Medication benefits"],
    keyProperties: ["identifier", "code", "status"]
  },
  "MeasureReport": {
    name: "MeasureReport",
    description: "The MeasureReport resource contains the results of the calculation of a measure",
    level: 5,
    category: "reasoning",
    relatedResources: ["Measure", "Patient", "Organization"],
    commonUses: ["Quality reporting", "Performance measurement", "Clinical metrics"],
    keyProperties: ["identifier", "status", "type", "measure", "subject", "date", "reporter", "period"]
  },
  "ObservationDefinition": {
    name: "ObservationDefinition",
    description: "Set of definitional characteristics for a kind of observation or measurement",
    level: 2,
    category: "support",
    relatedResources: ["Observation"],
    commonUses: ["Lab test definitions", "Vital sign specifications", "Measurement protocols"],
    keyProperties: ["category", "code", "identifier", "permittedDataType", "multipleResultsAllowed", "method"]
  },
  "EventDefinition": {
    name: "EventDefinition",
    description: "The EventDefinition resource provides a reusable description of when a particular event can occur",
    level: 2,
    category: "conformance",
    relatedResources: ["PlanDefinition"],
    commonUses: ["Event specifications", "Trigger definitions", "Workflow events"],
    keyProperties: ["url", "identifier", "version", "name", "title", "status", "experimental", "date"]
  },
  "ConditionDefinition": {
    name: "ConditionDefinition",
    description: "A definition of a condition and information relevant to managing it",
    level: 2,
    category: "support",
    relatedResources: ["Condition"],
    commonUses: ["Condition definitions", "Clinical protocols", "Care guidelines"],
    keyProperties: ["url", "identifier", "version", "name", "title", "status", "experimental", "date"]
  },
  "ArtifactAssessment": {
    name: "ArtifactAssessment",
    description: "This Resource provides one or more comments, classifiers or ratings about a Resource",
    level: 5,
    category: "reasoning",
    examples: ["artifactassessment-example-certainty-rating.json"],
    relatedResources: ["Citation", "Evidence"],
    commonUses: ["Resource assessment", "Quality ratings", "Evidence evaluation"],
    keyProperties: ["identifier", "title", "citeAs", "date", "copyright", "approvalDate", "lastReviewDate"]
  },
  "EncounterHistory": {
    name: "EncounterHistory",
    description: "A record of significant events/milestones key data throughout the history of an Encounter",
    level: 3,
    category: "administrative",
    relatedResources: ["Encounter", "Patient"],
    commonUses: ["Encounter tracking", "Visit history", "Care transitions"],
    keyProperties: ["encounter", "identifier", "status", "class", "type", "serviceType", "subject"]
  },
  "Subscription": {
    name: "Subscription",
    description: "The subscription resource is used to define a push-based subscription from a server to another system",
    level: 2,
    category: "messaging",
    relatedResources: ["SubscriptionTopic"],
    commonUses: ["Event subscriptions", "Real-time notifications", "System integration"],
    keyProperties: ["status", "end", "reason", "filterBy", "channelType", "endpoint", "parameter"]
  },
  "SubscriptionStatus": {
    name: "SubscriptionStatus",
    description: "The SubscriptionStatus resource describes the state of a Subscription during notifications",
    level: 2,
    category: "messaging",
    relatedResources: ["Subscription"],
    commonUses: ["Subscription monitoring", "Notification status", "Event tracking"],
    keyProperties: ["status", "type", "eventsSinceSubscriptionStart", "notificationEvent", "subscription"]
  },
  "SubscriptionTopic": {
    name: "SubscriptionTopic",
    description: "Describes a stream of resource state changes or events and annotated with labels useful to filter subscriptions",
    level: 2,
    category: "messaging",
    relatedResources: ["Subscription"],
    commonUses: ["Event definitions", "Subscription topics", "Notification types"],
    keyProperties: ["url", "identifier", "version", "title", "status", "experimental", "date", "publisher"]
  },
  "VerificationResult": {
    name: "VerificationResult",
    description: "Describes validation requirements, source(s), status and dates for one or more elements",
    level: 3,
    category: "administrative",
    relatedResources: ["Patient", "Practitioner", "Organization"],
    commonUses: ["Credential verification", "License validation", "Identity verification"],
    keyProperties: ["target", "targetLocation", "need", "status", "statusDate", "validationType", "validationProcess"]
  },
  "VisionPrescription": {
    name: "VisionPrescription",
    description: "An authorization for the provision of glasses and/or contact lenses to a patient",
    level: 4,
    category: "clinical",
    relatedResources: ["Patient", "Practitioner", "Encounter"],
    commonUses: ["Eye prescriptions", "Glasses orders", "Contact lens prescriptions"],
    keyProperties: ["identifier", "status", "created", "patient", "encounter", "dateWritten", "prescriber", "lensSpecification"]
  },
  "CompartmentDefinition": {
    name: "CompartmentDefinition",
    description: "A compartment definition that defines how resources are accessed on a server",
    level: 2,
    category: "conformance",
    examples: ["compartmentdefinition-patient.json"],
    relatedResources: ["CapabilityStatement"],
    commonUses: ["Access control", "Data partitioning", "Security compartments"],
    keyProperties: ["url", "version", "name", "status", "experimental", "date", "publisher", "description", "code"]
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