import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Info, AlertCircle } from 'lucide-react';

interface SchemaProperty {
  name: string;
  type: string;
  cardinality: string;
  description: string;
  required?: boolean;
  properties?: SchemaProperty[];
}

interface SchemaViewerProps {
  resourceName: string;
  schema: SchemaProperty[];
}

// Comprehensive schema data for FHIR resources
const MOCK_SCHEMAS: Record<string, SchemaProperty[]> = {
  Account: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "Account")',
      required: true
    },
    {
      name: 'identifier',
      type: 'Identifier[]',
      cardinality: '0..*',
      description: 'Account number'
    },
    {
      name: 'status',
      type: 'code',
      cardinality: '1..1',
      description: 'active | inactive | entered-in-error | on-hold | unknown',
      required: true
    },
    {
      name: 'type',
      type: 'CodeableConcept',
      cardinality: '0..1',
      description: 'E.g. patient, expense, depreciation'
    },
    {
      name: 'name',
      type: 'string',
      cardinality: '0..1',
      description: 'Human-readable label'
    },
    {
      name: 'subject',
      type: 'Reference(Patient|Device|Practitioner|PractitionerRole|Location|HealthcareService|Organization)[]',
      cardinality: '0..*',
      description: 'The entity that caused the expenses'
    }
  ],
  Appointment: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "Appointment")',
      required: true
    },
    {
      name: 'identifier',
      type: 'Identifier[]',
      cardinality: '0..*',
      description: 'External Ids for this item'
    },
    {
      name: 'status',
      type: 'code',
      cardinality: '1..1',
      description: 'proposed | pending | booked | arrived | fulfilled | cancelled | noshow | entered-in-error | checked-in | waitlist',
      required: true
    },
    {
      name: 'cancelationReason',
      type: 'CodeableConcept',
      cardinality: '0..1',
      description: 'The coded reason for the appointment being cancelled'
    },
    {
      name: 'serviceCategory',
      type: 'CodeableConcept[]',
      cardinality: '0..*',
      description: 'A broad categorization of the service that is to be performed during this appointment'
    },
    {
      name: 'serviceType',
      type: 'CodeableReference[]',
      cardinality: '0..*',
      description: 'The specific service that is to be performed during this appointment'
    },
    {
      name: 'appointmentType',
      type: 'CodeableConcept',
      cardinality: '0..1',
      description: 'The style of appointment or patient that has been booked in the slot'
    },
    {
      name: 'reasonCode',
      type: 'CodeableConcept[]',
      cardinality: '0..*',
      description: 'Coded reason this appointment is scheduled'
    },
    {
      name: 'priority',
      type: 'unsignedInt',
      cardinality: '0..1',
      description: 'Used to make informed decisions if needing to re-prioritize'
    },
    {
      name: 'description',
      type: 'string',
      cardinality: '0..1',
      description: 'Shown on a subject line in a meeting request, or appointment list'
    },
    {
      name: 'start',
      type: 'instant',
      cardinality: '0..1',
      description: 'When appointment is to take place'
    },
    {
      name: 'end',
      type: 'instant',
      cardinality: '0..1',
      description: 'When appointment is to conclude'
    },
    {
      name: 'minutesDuration',
      type: 'positiveInt',
      cardinality: '0..1',
      description: 'Can be less than start/end (e.g. estimate)'
    },
    {
      name: 'participant',
      type: 'BackboneElement[]',
      cardinality: '1..*',
      description: 'Participants involved in appointment',
      required: true,
      properties: [
        {
          name: 'type',
          type: 'CodeableConcept[]',
          cardinality: '0..*',
          description: 'Role of participant in the appointment'
        },
        {
          name: 'actor',
          type: 'Reference(Patient|Practitioner|PractitionerRole|RelatedPerson|Device|HealthcareService|Location)',
          cardinality: '0..1',
          description: 'Person, Location/HealthcareService or Device'
        },
        {
          name: 'required',
          type: 'boolean',
          cardinality: '0..1',
          description: 'Whether this participant is required to be present at the meeting'
        },
        {
          name: 'status',
          type: 'code',
          cardinality: '1..1',
          description: 'accepted | declined | tentative | needs-action',
          required: true
        }
      ]
    }
  ],
  Patient: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "Patient")',
      required: true
    },
    {
      name: 'id',
      type: 'string',
      cardinality: '0..1',
      description: 'Logical id of this artifact'
    },
    {
      name: 'identifier',
      type: 'Identifier[]',
      cardinality: '0..*',
      description: 'An identifier for this patient',
      properties: [
        {
          name: 'use',
          type: 'code',
          cardinality: '0..1',
          description: 'usual | official | temp | secondary | old'
        },
        {
          name: 'system',
          type: 'uri',
          cardinality: '0..1',
          description: 'The namespace for the identifier value'
        },
        {
          name: 'value',
          type: 'string',
          cardinality: '0..1',
          description: 'The value that is unique'
        }
      ]
    },
    {
      name: 'active',
      type: 'boolean',
      cardinality: '0..1',
      description: 'Whether this patient record is in active use'
    },
    {
      name: 'name',
      type: 'HumanName[]',
      cardinality: '0..*',
      description: 'A name associated with the patient',
      properties: [
        {
          name: 'use',
          type: 'code',
          cardinality: '0..1',
          description: 'usual | official | temp | nickname | anonymous | old | maiden'
        },
        {
          name: 'family',
          type: 'string',
          cardinality: '0..1',
          description: 'Family name (often called surname)'
        },
        {
          name: 'given',
          type: 'string[]',
          cardinality: '0..*',
          description: 'Given names (not always first names)'
        }
      ]
    },
    {
      name: 'gender',
      type: 'code',
      cardinality: '0..1',
      description: 'male | female | other | unknown'
    },
    {
      name: 'birthDate',
      type: 'date',
      cardinality: '0..1',
      description: 'The date of birth for the individual'
    }
  ],
  Observation: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "Observation")',
      required: true
    },
    {
      name: 'status',
      type: 'code',
      cardinality: '1..1',
      description: 'registered | preliminary | final | amended | corrected | cancelled | entered-in-error | unknown',
      required: true
    },
    {
      name: 'code',
      type: 'CodeableConcept',
      cardinality: '1..1',
      description: 'Type of observation (code / type)',
      required: true,
      properties: [
        {
          name: 'coding',
          type: 'Coding[]',
          cardinality: '0..*',
          description: 'Code defined by a terminology system'
        },
        {
          name: 'text',
          type: 'string',
          cardinality: '0..1',
          description: 'Plain text representation of the concept'
        }
      ]
    },
    {
      name: 'subject',
      type: 'Reference(Patient|Group|Device|Location)',
      cardinality: '1..1',
      description: 'Who and/or what the observation is about',
      required: true
    },
    {
      name: 'valueQuantity',
      type: 'Quantity',
      cardinality: '0..1',
      description: 'Actual result',
      properties: [
        {
          name: 'value',
          type: 'decimal',
          cardinality: '0..1',
          description: 'Numerical value (with implicit precision)'
        },
        {
          name: 'unit',
          type: 'string',
          cardinality: '0..1',
          description: 'Unit representation'
        }
      ]
    }
  ],
  Organization: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "Organization")',
      required: true
    },
    {
      name: 'identifier',
      type: 'Identifier[]',
      cardinality: '0..*',
      description: 'Identifies this organization across multiple systems'
    },
    {
      name: 'active',
      type: 'boolean',
      cardinality: '0..1',
      description: 'Whether the organization record is still in active use'
    },
    {
      name: 'type',
      type: 'CodeableConcept[]',
      cardinality: '0..*',
      description: 'Kind of organization'
    },
    {
      name: 'name',
      type: 'string',
      cardinality: '0..1',
      description: 'Name used for the organization'
    },
    {
      name: 'alias',
      type: 'string[]',
      cardinality: '0..*',
      description: 'A list of alternate names that the organization is known as'
    },
    {
      name: 'telecom',
      type: 'ContactPoint[]',
      cardinality: '0..*',
      description: 'A contact detail for the organization'
    },
    {
      name: 'address',
      type: 'Address[]',
      cardinality: '0..*',
      description: 'An address for the organization'
    }
  ],
  Practitioner: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "Practitioner")',
      required: true
    },
    {
      name: 'identifier',
      type: 'Identifier[]',
      cardinality: '0..*',
      description: 'An identifier for the person as this agent'
    },
    {
      name: 'active',
      type: 'boolean',
      cardinality: '0..1',
      description: 'Whether this practitioner record is in active use'
    },
    {
      name: 'name',
      type: 'HumanName[]',
      cardinality: '0..*',
      description: 'The name(s) associated with the practitioner'
    },
    {
      name: 'telecom',
      type: 'ContactPoint[]',
      cardinality: '0..*',
      description: 'A contact detail for the practitioner'
    },
    {
      name: 'address',
      type: 'Address[]',
      cardinality: '0..*',
      description: 'Address(es) of the practitioner that are not role specific'
    },
    {
      name: 'gender',
      type: 'code',
      cardinality: '0..1',
      description: 'male | female | other | unknown'
    },
    {
      name: 'birthDate',
      type: 'date',
      cardinality: '0..1',
      description: 'The date of birth for the practitioner'
    },
    {
      name: 'qualification',
      type: 'BackboneElement[]',
      cardinality: '0..*',
      description: 'Certification, licenses, or training pertaining to the provision of care',
      properties: [
        {
          name: 'identifier',
          type: 'Identifier[]',
          cardinality: '0..*',
          description: 'An identifier for this qualification for the practitioner'
        },
        {
          name: 'code',
          type: 'CodeableConcept',
          cardinality: '1..1',
          description: 'Coded representation of the qualification',
          required: true
        },
        {
          name: 'period',
          type: 'Period',
          cardinality: '0..1',
          description: 'Period during which the qualification is valid'
        },
        {
          name: 'issuer',
          type: 'Reference(Organization)',
          cardinality: '0..1',
          description: 'Organization that regulates and issues the qualification'
        }
      ]
    }
  ],
  Encounter: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "Encounter")',
      required: true
    },
    {
      name: 'identifier',
      type: 'Identifier[]',
      cardinality: '0..*',
      description: 'Identifier(s) by which this encounter is known'
    },
    {
      name: 'status',
      type: 'code',
      cardinality: '1..1',
      description: 'planned | arrived | triaged | in-progress | onleave | finished | cancelled | entered-in-error | unknown',
      required: true
    },
    {
      name: 'statusHistory',
      type: 'BackboneElement[]',
      cardinality: '0..*',
      description: 'List of past encounter statuses',
      properties: [
        {
          name: 'status',
          type: 'code',
          cardinality: '1..1',
          description: 'planned | arrived | triaged | in-progress | onleave | finished | cancelled | entered-in-error | unknown',
          required: true
        },
        {
          name: 'period',
          type: 'Period',
          cardinality: '1..1',
          description: 'The time that the episode was in the specified status',
          required: true
        }
      ]
    },
    {
      name: 'class',
      type: 'CodeableConcept',
      cardinality: '1..1',
      description: 'Classification of patient encounter',
      required: true
    },
    {
      name: 'type',
      type: 'CodeableConcept[]',
      cardinality: '0..*',
      description: 'Specific type of encounter'
    },
    {
      name: 'priority',
      type: 'CodeableConcept',
      cardinality: '0..1',
      description: 'Indicates the urgency of the encounter'
    },
    {
      name: 'subject',
      type: 'Reference(Patient|Group)',
      cardinality: '0..1',
      description: 'The patient or group present at the encounter'
    },
    {
      name: 'period',
      type: 'Period',
      cardinality: '0..1',
      description: 'The start and end time of the encounter'
    },
    {
      name: 'participant',
      type: 'BackboneElement[]',
      cardinality: '0..*',
      description: 'List of participants involved in the encounter',
      properties: [
        {
          name: 'type',
          type: 'CodeableConcept[]',
          cardinality: '0..*',
          description: 'Role of participant in the encounter'
        },
        {
          name: 'period',
          type: 'Period',
          cardinality: '0..1',
          description: 'Period of time during the encounter that the participant participated'
        },
        {
          name: 'individual',
          type: 'Reference(Practitioner|PractitionerRole|RelatedPerson)',
          cardinality: '0..1',
          description: 'Persons involved in the encounter other than the patient'
        }
      ]
    }
  ],
  Condition: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "Condition")',
      required: true
    },
    {
      name: 'identifier',
      type: 'Identifier[]',
      cardinality: '0..*',
      description: 'External Ids for this condition'
    },
    {
      name: 'clinicalStatus',
      type: 'CodeableConcept',
      cardinality: '0..1',
      description: 'active | recurrence | relapse | inactive | remission | resolved'
    },
    {
      name: 'verificationStatus',
      type: 'CodeableConcept',
      cardinality: '0..1',
      description: 'unconfirmed | provisional | differential | confirmed | refuted | entered-in-error'
    },
    {
      name: 'category',
      type: 'CodeableConcept[]',
      cardinality: '0..*',
      description: 'problem-list-item | encounter-diagnosis'
    },
    {
      name: 'severity',
      type: 'CodeableConcept',
      cardinality: '0..1',
      description: 'Subjective severity of condition'
    },
    {
      name: 'code',
      type: 'CodeableConcept',
      cardinality: '0..1',
      description: 'Identification of the condition, problem or diagnosis'
    },
    {
      name: 'bodySite',
      type: 'CodeableConcept[]',
      cardinality: '0..*',
      description: 'Anatomical location, if relevant'
    },
    {
      name: 'subject',
      type: 'Reference(Patient|Group)',
      cardinality: '1..1',
      description: 'Who has the condition?',
      required: true
    },
    {
      name: 'encounter',
      type: 'Reference(Encounter)',
      cardinality: '0..1',
      description: 'Encounter created as part of'
    }
  ],
  DiagnosticReport: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "DiagnosticReport")',
      required: true
    },
    {
      name: 'identifier',
      type: 'Identifier[]',
      cardinality: '0..*',
      description: 'Business identifier for report'
    },
    {
      name: 'basedOn',
      type: 'Reference(CarePlan|ImmunizationRecommendation|MedicationRequest|NutritionOrder|ServiceRequest)[]',
      cardinality: '0..*',
      description: 'What was requested'
    },
    {
      name: 'status',
      type: 'code',
      cardinality: '1..1',
      description: 'registered | partial | preliminary | final | amended | corrected | appended | cancelled | entered-in-error | unknown',
      required: true
    },
    {
      name: 'category',
      type: 'CodeableConcept[]',
      cardinality: '0..*',
      description: 'Service category'
    },
    {
      name: 'code',
      type: 'CodeableConcept',
      cardinality: '1..1',
      description: 'Name/Code for this diagnostic report',
      required: true
    },
    {
      name: 'subject',
      type: 'Reference(Patient|Group|Device|Location)',
      cardinality: '0..1',
      description: 'The subject of the report - usually, but not always, the patient'
    },
    {
      name: 'encounter',
      type: 'Reference(Encounter)',
      cardinality: '0..1',
      description: 'Health care event when test ordered'
    },
    {
      name: 'effectiveDateTime',
      type: 'dateTime',
      cardinality: '0..1',
      description: 'Clinically relevant time/time-period for report'
    },
    {
      name: 'issued',
      type: 'instant',
      cardinality: '0..1',
      description: 'DateTime this version was made'
    },
    {
      name: 'performer',
      type: 'Reference(Practitioner|PractitionerRole|Organization|CareTeam)[]',
      cardinality: '0..*',
      description: 'Responsible Diagnostic Service'
    },
    {
      name: 'result',
      type: 'Reference(Observation)[]',
      cardinality: '0..*',
      description: 'Observations'
    },
    {
      name: 'conclusion',
      type: 'string',
      cardinality: '0..1',
      description: 'Clinical conclusion (interpretation) of test results'
    }
  ],
  MedicationRequest: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "MedicationRequest")',
      required: true
    },
    {
      name: 'identifier',
      type: 'Identifier[]',
      cardinality: '0..*',
      description: 'External ids for this request'
    },
    {
      name: 'status',
      type: 'code',
      cardinality: '1..1',
      description: 'active | on-hold | cancelled | completed | entered-in-error | stopped | draft | unknown',
      required: true
    },
    {
      name: 'statusReason',
      type: 'CodeableConcept',
      cardinality: '0..1',
      description: 'Reason for current status'
    },
    {
      name: 'intent',
      type: 'code',
      cardinality: '1..1',
      description: 'proposal | plan | order | original-order | reflex-order | filler-order | instance-order | option',
      required: true
    },
    {
      name: 'category',
      type: 'CodeableConcept[]',
      cardinality: '0..*',
      description: 'Type of medication usage'
    },
    {
      name: 'priority',
      type: 'code',
      cardinality: '0..1',
      description: 'routine | urgent | asap | stat'
    },
    {
      name: 'medication',
      type: 'CodeableReference',
      cardinality: '1..1',
      description: 'Medication to be taken',
      required: true
    },
    {
      name: 'subject',
      type: 'Reference(Patient|Group)',
      cardinality: '1..1',
      description: 'Who or group medication request is for',
      required: true
    },
    {
      name: 'encounter',
      type: 'Reference(Encounter)',
      cardinality: '0..1',
      description: 'Encounter created as part of encounter/admission/stay'
    },
    {
      name: 'authoredOn',
      type: 'dateTime',
      cardinality: '0..1',
      description: 'When request was initially authored'
    },
    {
      name: 'requester',
      type: 'Reference(Practitioner|PractitionerRole|Organization|Patient|RelatedPerson|Device)',
      cardinality: '0..1',
      description: 'Who/What requested the Request'
    },
    {
      name: 'dosageInstruction',
      type: 'Dosage[]',
      cardinality: '0..*',
      description: 'How the medication should be taken'
    }
  ],
  Bundle: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "Bundle")',
      required: true
    },
    {
      name: 'identifier',
      type: 'Identifier',
      cardinality: '0..1',
      description: 'Persistent identifier for the bundle'
    },
    {
      name: 'type',
      type: 'code',
      cardinality: '1..1',
      description: 'document | message | transaction | transaction-response | batch | batch-response | history | searchset | collection',
      required: true
    },
    {
      name: 'timestamp',
      type: 'instant',
      cardinality: '0..1',
      description: 'When the bundle was assembled'
    },
    {
      name: 'total',
      type: 'unsignedInt',
      cardinality: '0..1',
      description: 'If search, the total number of matches'
    },
    {
      name: 'link',
      type: 'BackboneElement[]',
      cardinality: '0..*',
      description: 'Links related to this Bundle',
      properties: [
        {
          name: 'relation',
          type: 'string',
          cardinality: '1..1',
          description: 'See http://www.iana.org/assignments/link-relations/link-relations.xhtml#link-relations-1',
          required: true
        },
        {
          name: 'url',
          type: 'uri',
          cardinality: '1..1',
          description: 'Reference details for the link',
          required: true
        }
      ]
    },
    {
      name: 'entry',
      type: 'BackboneElement[]',
      cardinality: '0..*',
      description: 'Entry in the bundle - will have a resource or information',
      properties: [
        {
          name: 'link',
          type: 'BackboneElement[]',
          cardinality: '0..*',
          description: 'Links related to this entry'
        },
        {
          name: 'fullUrl',
          type: 'uri',
          cardinality: '0..1',
          description: 'URI for resource (Absolute URL)'
        },
        {
          name: 'resource',
          type: 'Resource',
          cardinality: '0..1',
          description: 'A resource in the bundle'
        },
        {
          name: 'search',
          type: 'BackboneElement',
          cardinality: '0..1',
          description: 'Search related information'
        },
        {
          name: 'request',
          type: 'BackboneElement',
          cardinality: '0..1',
          description: 'Additional execution information (transaction/batch/history)'
        },
        {
          name: 'response',
          type: 'BackboneElement',
          cardinality: '0..1',
          description: 'Results of execution (transaction/batch/history)'
        }
      ]
    }
  ],
  Claim: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "Claim")',
      required: true
    },
    {
      name: 'identifier',
      type: 'Identifier[]',
      cardinality: '0..*',
      description: 'Business Identifier for claim'
    },
    {
      name: 'status',
      type: 'code',
      cardinality: '1..1',
      description: 'active | cancelled | draft | entered-in-error',
      required: true
    },
    {
      name: 'type',
      type: 'CodeableConcept',
      cardinality: '1..1',
      description: 'Category or discipline',
      required: true
    },
    {
      name: 'subType',
      type: 'CodeableConcept',
      cardinality: '0..1',
      description: 'More granular claim type'
    },
    {
      name: 'use',
      type: 'code',
      cardinality: '1..1',
      description: 'claim | preauthorization | predetermination',
      required: true
    },
    {
      name: 'patient',
      type: 'Reference(Patient)',
      cardinality: '1..1',
      description: 'The recipient of the products and services',
      required: true
    },
    {
      name: 'billablePeriod',
      type: 'Period',
      cardinality: '0..1',
      description: 'Relevant time frame for the claim'
    },
    {
      name: 'created',
      type: 'dateTime',
      cardinality: '1..1',
      description: 'Resource creation date',
      required: true
    },
    {
      name: 'enterer',
      type: 'Reference(Practitioner|PractitionerRole)',
      cardinality: '0..1',
      description: 'Author of the claim'
    },
    {
      name: 'insurer',
      type: 'Reference(Organization)',
      cardinality: '1..1',
      description: 'Target',
      required: true
    },
    {
      name: 'provider',
      type: 'Reference(Practitioner|PractitionerRole|Organization)',
      cardinality: '1..1',
      description: 'Party responsible for the claim',
      required: true
    },
    {
      name: 'priority',
      type: 'CodeableConcept',
      cardinality: '1..1',
      description: 'Desired processing ugency',
      required: true
    },
    {
      name: 'fundsReserve',
      type: 'CodeableConcept',
      cardinality: '0..1',
      description: 'Funds requested to be reserved'
    },
    {
      name: 'related',
      type: 'BackboneElement[]',
      cardinality: '0..*',
      description: 'Prior or corollary claims',
      properties: [
        {
          name: 'claim',
          type: 'Reference(Claim)',
          cardinality: '0..1',
          description: 'Reference to the related claim'
        },
        {
          name: 'relationship',
          type: 'CodeableConcept',
          cardinality: '0..1',
          description: 'How the reference claim is related'
        },
        {
          name: 'reference',
          type: 'Identifier',
          cardinality: '0..1',
          description: 'File or case reference'
        }
      ]
    },
    {
      name: 'prescription',
      type: 'Reference(DeviceRequest|MedicationRequest|VisionPrescription)',
      cardinality: '0..1',
      description: 'Prescription authorizing services and products'
    },
    {
      name: 'originalPrescription',
      type: 'Reference(DeviceRequest|MedicationRequest|VisionPrescription)',
      cardinality: '0..1',
      description: 'Original prescription if superseded by fulfiller'
    },
    {
      name: 'payee',
      type: 'BackboneElement',
      cardinality: '0..1',
      description: 'Recipient of benefits payable',
      properties: [
        {
          name: 'type',
          type: 'CodeableConcept',
          cardinality: '1..1',
          description: 'Category of recipient',
          required: true
        },
        {
          name: 'party',
          type: 'Reference(Practitioner|PractitionerRole|Organization|Patient|RelatedPerson)',
          cardinality: '0..1',
          description: 'Recipient reference'
        }
      ]
    },
    {
      name: 'referral',
      type: 'Reference(ServiceRequest)',
      cardinality: '0..1',
      description: 'Treatment referral'
    },
    {
      name: 'encounter',
      type: 'Reference(Encounter)[]',
      cardinality: '0..*',
      description: 'Encounters related to this billed item'
    },
    {
      name: 'facility',
      type: 'Reference(Location|Organization)',
      cardinality: '0..1',
      description: 'Servicing facility'
    },
    {
      name: 'careTeam',
      type: 'BackboneElement[]',
      cardinality: '0..*',
      description: 'Members of the care team',
      properties: [
        {
          name: 'sequence',
          type: 'positiveInt',
          cardinality: '1..1',
          description: 'Order of care team',
          required: true
        },
        {
          name: 'provider',
          type: 'Reference(Practitioner|PractitionerRole|Organization)',
          cardinality: '1..1',
          description: 'Practitioner or organization',
          required: true
        },
        {
          name: 'responsible',
          type: 'boolean',
          cardinality: '0..1',
          description: 'Indicator of the lead practitioner'
        },
        {
          name: 'role',
          type: 'CodeableConcept',
          cardinality: '0..1',
          description: 'Function within the team'
        },
        {
          name: 'specialty',
          type: 'CodeableConcept',
          cardinality: '0..1',
          description: 'Practitioner credential or specialization'
        }
      ]
    },
    {
      name: 'supportingInfo',
      type: 'BackboneElement[]',
      cardinality: '0..*',
      description: 'Supporting information',
      properties: [
        {
          name: 'sequence',
          type: 'positiveInt',
          cardinality: '1..1',
          description: 'Information instance identifier',
          required: true
        },
        {
          name: 'category',
          type: 'CodeableConcept',
          cardinality: '1..1',
          description: 'Classification of the supplied information',
          required: true
        },
        {
          name: 'code',
          type: 'CodeableConcept',
          cardinality: '0..1',
          description: 'Type of information'
        },
        {
          name: 'timingDate',
          type: 'date',
          cardinality: '0..1',
          description: 'When it occurred'
        },
        {
          name: 'timingPeriod',
          type: 'Period',
          cardinality: '0..1',
          description: 'When it occurred'
        },
        {
          name: 'valueBoolean',
          type: 'boolean',
          cardinality: '0..1',
          description: 'Data to be provided'
        },
        {
          name: 'valueString',
          type: 'string',
          cardinality: '0..1',
          description: 'Data to be provided'
        },
        {
          name: 'valueQuantity',
          type: 'Quantity',
          cardinality: '0..1',
          description: 'Data to be provided'
        },
        {
          name: 'valueAttachment',
          type: 'Attachment',
          cardinality: '0..1',
          description: 'Data to be provided'
        },
        {
          name: 'valueReference',
          type: 'Reference(Any)',
          cardinality: '0..1',
          description: 'Data to be provided'
        },
        {
          name: 'valueIdentifier',
          type: 'Identifier',
          cardinality: '0..1',
          description: 'Data to be provided'
        },
        {
          name: 'reason',
          type: 'CodeableConcept',
          cardinality: '0..1',
          description: 'Explanation for the information'
        }
      ]
    },
    {
      name: 'diagnosis',
      type: 'BackboneElement[]',
      cardinality: '0..*',
      description: 'Pertinent diagnosis information',
      properties: [
        {
          name: 'sequence',
          type: 'positiveInt',
          cardinality: '1..1',
          description: 'Diagnosis instance identifier',
          required: true
        },
        {
          name: 'diagnosisCodeableConcept',
          type: 'CodeableConcept',
          cardinality: '0..1',
          description: 'Nature of illness or problem'
        },
        {
          name: 'diagnosisReference',
          type: 'Reference(Condition)',
          cardinality: '0..1',
          description: 'Nature of illness or problem'
        },
        {
          name: 'type',
          type: 'CodeableConcept[]',
          cardinality: '0..*',
          description: 'Timing or nature of the diagnosis'
        },
        {
          name: 'onAdmission',
          type: 'CodeableConcept',
          cardinality: '0..1',
          description: 'Present on admission'
        }
      ]
    },
    {
      name: 'procedure',
      type: 'BackboneElement[]',
      cardinality: '0..*',
      description: 'Clinical procedures performed',
      properties: [
        {
          name: 'sequence',
          type: 'positiveInt',
          cardinality: '1..1',
          description: 'Procedure instance identifier',
          required: true
        },
        {
          name: 'type',
          type: 'CodeableConcept[]',
          cardinality: '0..*',
          description: 'Category of procedure'
        },
        {
          name: 'date',
          type: 'dateTime',
          cardinality: '0..1',
          description: 'When the procedure was performed'
        },
        {
          name: 'procedureCodeableConcept',
          type: 'CodeableConcept',
          cardinality: '0..1',
          description: 'Specific clinical procedure'
        },
        {
          name: 'procedureReference',
          type: 'Reference(Procedure)',
          cardinality: '0..1',
          description: 'Specific clinical procedure'
        },
        {
          name: 'udi',
          type: 'Reference(Device)[]',
          cardinality: '0..*',
          description: 'Unique device identifier'
        }
      ]
    },
    {
      name: 'insurance',
      type: 'BackboneElement[]',
      cardinality: '1..*',
      description: 'Patient insurance information',
      required: true,
      properties: [
        {
          name: 'sequence',
          type: 'positiveInt',
          cardinality: '1..1',
          description: 'Insurance instance identifier',
          required: true
        },
        {
          name: 'focal',
          type: 'boolean',
          cardinality: '1..1',
          description: 'Coverage to be used for adjudication',
          required: true
        },
        {
          name: 'identifier',
          type: 'Identifier',
          cardinality: '0..1',
          description: 'Pre-assigned Claim number'
        },
        {
          name: 'coverage',
          type: 'Reference(Coverage)',
          cardinality: '1..1',
          description: 'Insurance information',
          required: true
        },
        {
          name: 'businessArrangement',
          type: 'string',
          cardinality: '0..1',
          description: 'Additional provider contract number'
        },
        {
          name: 'preAuthRef',
          type: 'string[]',
          cardinality: '0..*',
          description: 'Prior authorization reference number'
        },
        {
          name: 'claimResponse',
          type: 'Reference(ClaimResponse)',
          cardinality: '0..1',
          description: 'Adjudication results'
        }
      ]
    },
    {
      name: 'accident',
      type: 'BackboneElement',
      cardinality: '0..1',
      description: 'Details of the event',
      properties: [
        {
          name: 'date',
          type: 'date',
          cardinality: '1..1',
          description: 'When the incident occurred',
          required: true
        },
        {
          name: 'type',
          type: 'CodeableConcept',
          cardinality: '0..1',
          description: 'The nature of the accident'
        },
        {
          name: 'locationAddress',
          type: 'Address',
          cardinality: '0..1',
          description: 'Where the event occurred'
        },
        {
          name: 'locationReference',
          type: 'Reference(Location)',
          cardinality: '0..1',
          description: 'Where the event occurred'
        }
      ]
    },
    {
      name: 'patientPaid',
      type: 'Money',
      cardinality: '0..1',
      description: 'Paid by the patient'
    },
    {
      name: 'item',
      type: 'BackboneElement[]',
      cardinality: '0..*',
      description: 'Product or service provided',
      properties: [
        {
          name: 'sequence',
          type: 'positiveInt',
          cardinality: '1..1',
          description: 'Item instance identifier',
          required: true
        },
        {
          name: 'careTeamSequence',
          type: 'positiveInt[]',
          cardinality: '0..*',
          description: 'Applicable careTeam members'
        },
        {
          name: 'diagnosisSequence',
          type: 'positiveInt[]',
          cardinality: '0..*',
          description: 'Applicable diagnoses'
        },
        {
          name: 'procedureSequence',
          type: 'positiveInt[]',
          cardinality: '0..*',
          description: 'Applicable procedures'
        },
        {
          name: 'informationSequence',
          type: 'positiveInt[]',
          cardinality: '0..*',
          description: 'Applicable exception and supporting information'
        },
        {
          name: 'revenue',
          type: 'CodeableConcept',
          cardinality: '0..1',
          description: 'Revenue or cost center code'
        },
        {
          name: 'category',
          type: 'CodeableConcept',
          cardinality: '0..1',
          description: 'Benefit classification'
        },
        {
          name: 'productOrService',
          type: 'CodeableConcept',
          cardinality: '1..1',
          description: 'Billing, service, product, or drug code',
          required: true
        },
        {
          name: 'productOrServiceEnd',
          type: 'CodeableConcept',
          cardinality: '0..1',
          description: 'End of a range of codes'
        },
        {
          name: 'request',
          type: 'Reference(DeviceRequest|MedicationRequest|NutritionOrder|ServiceRequest|SupplyRequest|VisionPrescription)[]',
          cardinality: '0..*',
          description: 'Request for the item'
        },
        {
          name: 'modifier',
          type: 'CodeableConcept[]',
          cardinality: '0..*',
          description: 'Product or service billing modifiers'
        },
        {
          name: 'programCode',
          type: 'CodeableConcept[]',
          cardinality: '0..*',
          description: 'Program the product or service is provided under'
        },
        {
          name: 'servicedDate',
          type: 'date',
          cardinality: '0..1',
          description: 'Date or dates of service or product delivery'
        },
        {
          name: 'servicedPeriod',
          type: 'Period',
          cardinality: '0..1',
          description: 'Date or dates of service or product delivery'
        },
        {
          name: 'locationCodeableConcept',
          type: 'CodeableConcept',
          cardinality: '0..1',
          description: 'Place of service or where product was supplied'
        },
        {
          name: 'locationAddress',
          type: 'Address',
          cardinality: '0..1',
          description: 'Place of service or where product was supplied'
        },
        {
          name: 'locationReference',
          type: 'Reference(Location)',
          cardinality: '0..1',
          description: 'Place of service or where product was supplied'
        },
        {
          name: 'patientPaid',
          type: 'Money',
          cardinality: '0..1',
          description: 'Paid by the patient'
        },
        {
          name: 'quantity',
          type: 'Quantity',
          cardinality: '0..1',
          description: 'Count of products or services'
        },
        {
          name: 'unitPrice',
          type: 'Money',
          cardinality: '0..1',
          description: 'Fee, charge or cost per item'
        },
        {
          name: 'factor',
          type: 'decimal',
          cardinality: '0..1',
          description: 'Price scaling factor'
        },
        {
          name: 'tax',
          type: 'Money',
          cardinality: '0..1',
          description: 'Total tax'
        },
        {
          name: 'net',
          type: 'Money',
          cardinality: '0..1',
          description: 'Total item cost'
        },
        {
          name: 'udi',
          type: 'Reference(Device)[]',
          cardinality: '0..*',
          description: 'Unique device identifier'
        },
        {
          name: 'bodySite',
          type: 'BackboneElement[]',
          cardinality: '0..*',
          description: 'Anatomical location',
          properties: [
            {
              name: 'site',
              type: 'CodeableReference[]',
              cardinality: '1..*',
              description: 'Location',
              required: true
            },
            {
              name: 'subSite',
              type: 'CodeableConcept[]',
              cardinality: '0..*',
              description: 'Sub-location'
            }
          ]
        },
        {
          name: 'encounter',
          type: 'Reference(Encounter)[]',
          cardinality: '0..*',
          description: 'Encounters related to this billed item'
        },
        {
          name: 'detail',
          type: 'BackboneElement[]',
          cardinality: '0..*',
          description: 'Product or service provided',
          properties: [
            {
              name: 'sequence',
              type: 'positiveInt',
              cardinality: '1..1',
              description: 'Item instance identifier',
              required: true
            },
            {
              name: 'traceNumber',
              type: 'Identifier[]',
              cardinality: '0..*',
              description: 'Number for tracking'
            },
            {
              name: 'revenue',
              type: 'CodeableConcept',
              cardinality: '0..1',
              description: 'Revenue or cost center code'
            },
            {
              name: 'category',
              type: 'CodeableConcept',
              cardinality: '0..1',
              description: 'Benefit classification'
            },
            {
              name: 'productOrService',
              type: 'CodeableConcept',
              cardinality: '1..1',
              description: 'Billing, service, product, or drug code',
              required: true
            },
            {
              name: 'productOrServiceEnd',
              type: 'CodeableConcept',
              cardinality: '0..1',
              description: 'End of a range of codes'
            },
            {
              name: 'modifier',
              type: 'CodeableConcept[]',
              cardinality: '0..*',
              description: 'Service/Product billing modifiers'
            },
            {
              name: 'programCode',
              type: 'CodeableConcept[]',
              cardinality: '0..*',
              description: 'Program the product or service is provided under'
            },
            {
              name: 'patientPaid',
              type: 'Money',
              cardinality: '0..1',
              description: 'Paid by the patient'
            },
            {
              name: 'quantity',
              type: 'Quantity',
              cardinality: '0..1',
              description: 'Count of products or services'
            },
            {
              name: 'unitPrice',
              type: 'Money',
              cardinality: '0..1',
              description: 'Fee, charge or cost per item'
            },
            {
              name: 'factor',
              type: 'decimal',
              cardinality: '0..1',
              description: 'Price scaling factor'
            },
            {
              name: 'tax',
              type: 'Money',
              cardinality: '0..1',
              description: 'Total tax'
            },
            {
              name: 'net',
              type: 'Money',
              cardinality: '0..1',
              description: 'Total item cost'
            },
            {
              name: 'udi',
              type: 'Reference(Device)[]',
              cardinality: '0..*',
              description: 'Unique device identifier'
            }
          ]
        }
      ]
    },
    {
      name: 'total',
      type: 'Money',
      cardinality: '0..1',
      description: 'Total claim cost'
    }
  ],
  CarePlan: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "CarePlan")',
      required: true
    },
    {
      name: 'identifier',
      type: 'Identifier[]',
      cardinality: '0..*',
      description: 'External Ids for this plan'
    },
    {
      name: 'instantiatesCanonical',
      type: 'canonical[]',
      cardinality: '0..*',
      description: 'Instantiates FHIR protocol or definition'
    },
    {
      name: 'instantiatesUri',
      type: 'uri[]',
      cardinality: '0..*',
      description: 'Instantiates external protocol or definition'
    },
    {
      name: 'basedOn',
      type: 'Reference(CarePlan)[]',
      cardinality: '0..*',
      description: 'Fulfills CarePlan'
    },
    {
      name: 'replaces',
      type: 'Reference(CarePlan)[]',
      cardinality: '0..*',
      description: 'CarePlan replaced by this CarePlan'
    },
    {
      name: 'partOf',
      type: 'Reference(CarePlan)[]',
      cardinality: '0..*',
      description: 'Part of referenced CarePlan'
    },
    {
      name: 'status',
      type: 'code',
      cardinality: '1..1',
      description: 'draft | active | on-hold | revoked | completed | entered-in-error | unknown',
      required: true
    },
    {
      name: 'intent',
      type: 'code',
      cardinality: '1..1',
      description: 'proposal | plan | order | option | directive',
      required: true
    },
    {
      name: 'category',
      type: 'CodeableConcept[]',
      cardinality: '0..*',
      description: 'Type of plan'
    },
    {
      name: 'title',
      type: 'string',
      cardinality: '0..1',
      description: 'Human-friendly name for the care plan'
    },
    {
      name: 'description',
      type: 'string',
      cardinality: '0..1',
      description: 'Summary of nature of plan'
    },
    {
      name: 'subject',
      type: 'Reference(Patient|Group)',
      cardinality: '1..1',
      description: 'Who the care plan is for',
      required: true
    },
    {
      name: 'encounter',
      type: 'Reference(Encounter)',
      cardinality: '0..1',
      description: 'The Encounter during which this CarePlan was created'
    },
    {
      name: 'period',
      type: 'Period',
      cardinality: '0..1',
      description: 'Time period plan covers'
    },
    {
      name: 'created',
      type: 'dateTime',
      cardinality: '0..1',
      description: 'Date record was first recorded'
    },
    {
      name: 'custodian',
      type: 'Reference(Patient|Practitioner|PractitionerRole|Device|RelatedPerson|Organization|CareTeam)',
      cardinality: '0..1',
      description: 'Who is the designated responsible party'
    },
    {
      name: 'contributor',
      type: 'Reference(Patient|Practitioner|PractitionerRole|Device|RelatedPerson|Organization|CareTeam)[]',
      cardinality: '0..*',
      description: 'Who provided the content of the care plan'
    },
    {
      name: 'careTeam',
      type: 'Reference(CareTeam)[]',
      cardinality: '0..*',
      description: 'Who\'s involved in plan?'
    },
    {
      name: 'addresses',
      type: 'CodeableReference[]',
      cardinality: '0..*',
      description: 'Health issues this plan addresses'
    },
    {
      name: 'supportingInfo',
      type: 'Reference(Any)[]',
      cardinality: '0..*',
      description: 'Information considered as part of plan'
    },
    {
      name: 'goal',
      type: 'Reference(Goal)[]',
      cardinality: '0..*',
      description: 'Desired outcome of plan'
    },
    {
      name: 'activity',
      type: 'BackboneElement[]',
      cardinality: '0..*',
      description: 'Action to occur or has occurred as part of plan',
      properties: [
        {
          name: 'performedActivity',
          type: 'CodeableReference[]',
          cardinality: '0..*',
          description: 'Results of the activity (concept, or Appointment, Encounter, Procedure, etc.)'
        },
        {
          name: 'progress',
          type: 'Annotation[]',
          cardinality: '0..*',
          description: 'Comments about the activity status/progress'
        },
        {
          name: 'reference',
          type: 'Reference(Appointment|CommunicationRequest|DeviceRequest|MedicationRequest|NutritionOrder|Task|ServiceRequest|VisionPrescription|RequestOrchestration)',
          cardinality: '0..1',
          description: 'Activity details defined in specific resource'
        },
        {
          name: 'plannedActivityDetail',
          type: 'BackboneElement',
          cardinality: '0..1',
          description: 'In-line definition of activity',
          properties: [
            {
              name: 'kind',
              type: 'code',
              cardinality: '0..1',
              description: 'Appointment | CommunicationRequest | DeviceRequest | MedicationRequest | NutritionOrder | Task | ServiceRequest | VisionPrescription'
            },
            {
              name: 'instantiatesCanonical',
              type: 'canonical[]',
              cardinality: '0..*',
              description: 'Instantiates FHIR protocol or definition'
            },
            {
              name: 'instantiatesUri',
              type: 'uri[]',
              cardinality: '0..*',
              description: 'Instantiates external protocol or definition'
            },
            {
              name: 'code',
              type: 'CodeableConcept',
              cardinality: '0..1',
              description: 'Detail type of activity'
            },
            {
              name: 'reasonCode',
              type: 'CodeableConcept[]',
              cardinality: '0..*',
              description: 'Why activity should be done or why activity was prohibited'
            },
            {
              name: 'reasonReference',
              type: 'Reference(Condition|Observation|DiagnosticReport|DocumentReference)[]',
              cardinality: '0..*',
              description: 'Why activity is needed'
            },
            {
              name: 'goal',
              type: 'Reference(Goal)[]',
              cardinality: '0..*',
              description: 'Goals this activity relates to'
            },
            {
              name: 'status',
              type: 'code',
              cardinality: '1..1',
              description: 'not-started | scheduled | in-progress | on-hold | completed | cancelled | stopped | unknown | entered-in-error',
              required: true
            },
            {
              name: 'statusReason',
              type: 'CodeableConcept',
              cardinality: '0..1',
              description: 'Reason for current status'
            },
            {
              name: 'doNotPerform',
              type: 'boolean',
              cardinality: '0..1',
              description: 'If true, activity is prohibiting action'
            },
            {
              name: 'scheduledTiming',
              type: 'Timing',
              cardinality: '0..1',
              description: 'When activity is to occur'
            },
            {
              name: 'scheduledPeriod',
              type: 'Period',
              cardinality: '0..1',
              description: 'When activity is to occur'
            },
            {
              name: 'scheduledString',
              type: 'string',
              cardinality: '0..1',
              description: 'When activity is to occur'
            },
            {
              name: 'location',
              type: 'CodeableReference',
              cardinality: '0..1',
              description: 'Where it should happen'
            },
            {
              name: 'reportedBoolean',
              type: 'boolean',
              cardinality: '0..1',
              description: 'Reported rather than primary record'
            },
            {
              name: 'reportedReference',
              type: 'Reference(Patient|RelatedPerson|Practitioner|PractitionerRole|Organization)',
              cardinality: '0..1',
              description: 'Reported rather than primary record'
            },
            {
              name: 'performer',
              type: 'Reference(Practitioner|PractitionerRole|Organization|RelatedPerson|Patient|CareTeam|HealthcareService|Device)[]',
              cardinality: '0..*',
              description: 'Who will be responsible?'
            },
            {
              name: 'productCodeableConcept',
              type: 'CodeableConcept',
              cardinality: '0..1',
              description: 'What is administered/supplied'
            },
            {
              name: 'productReference',
              type: 'Reference(Medication|Substance)',
              cardinality: '0..1',
              description: 'What is administered/supplied'
            },
            {
              name: 'dailyAmount',
              type: 'Quantity',
              cardinality: '0..1',
              description: 'How to consume/day?'
            },
            {
              name: 'quantity',
              type: 'Quantity',
              cardinality: '0..1',
              description: 'How much to administer/supply/consume'
            },
            {
              name: 'description',
              type: 'string',
              cardinality: '0..1',
              description: 'Extra info describing activity to perform'
            }
          ]
        }
      ]
    },
    {
      name: 'note',
      type: 'Annotation[]',
      cardinality: '0..*',
      description: 'Comments about the plan'
    }
  ],
  ServiceRequest: [
    {
      name: 'resourceType',
      type: 'string',
      cardinality: '1..1',
      description: 'The type of resource (always "ServiceRequest")',
      required: true
    },
    {
      name: 'identifier',
      type: 'Identifier[]',
      cardinality: '0..*',
      description: 'Identifiers assigned to this order'
    },
    {
      name: 'instantiatesCanonical',
      type: 'canonical[]',
      cardinality: '0..*',
      description: 'Instantiates FHIR protocol or definition'
    },
    {
      name: 'instantiatesUri',
      type: 'uri[]',
      cardinality: '0..*',
      description: 'Instantiates external protocol or definition'
    },
    {
      name: 'basedOn',
      type: 'Reference(CarePlan|ServiceRequest|MedicationRequest)[]',
      cardinality: '0..*',
      description: 'What request fulfills'
    },
    {
      name: 'replaces',
      type: 'Reference(ServiceRequest)[]',
      cardinality: '0..*',
      description: 'What request replaces'
    },
    {
      name: 'requisition',
      type: 'Identifier',
      cardinality: '0..1',
      description: 'Composite Request ID'
    },
    {
      name: 'status',
      type: 'code',
      cardinality: '1..1',
      description: 'draft | active | on-hold | revoked | completed | entered-in-error | unknown',
      required: true
    },
    {
      name: 'intent',
      type: 'code',
      cardinality: '1..1',
      description: 'proposal | plan | directive | order | original-order | reflex-order | filler-order | instance-order | option',
      required: true
    },
    {
      name: 'category',
      type: 'CodeableConcept[]',
      cardinality: '0..*',
      description: 'Classification of service'
    },
    {
      name: 'priority',
      type: 'code',
      cardinality: '0..1',
      description: 'routine | urgent | asap | stat'
    },
    {
      name: 'doNotPerform',
      type: 'boolean',
      cardinality: '0..1',
      description: 'True if service/procedure should not be performed'
    },
    {
      name: 'code',
      type: 'CodeableConcept',
      cardinality: '0..1',
      description: 'What is being requested/ordered'
    },
    {
      name: 'orderDetail',
      type: 'CodeableReference[]',
      cardinality: '0..*',
      description: 'Additional order information'
    },
    {
      name: 'quantityQuantity',
      type: 'Quantity',
      cardinality: '0..1',
      description: 'Service amount'
    },
    {
      name: 'quantityRatio',
      type: 'Ratio',
      cardinality: '0..1',
      description: 'Service amount'
    },
    {
      name: 'quantityRange',
      type: 'Range',
      cardinality: '0..1',
      description: 'Service amount'
    },
    {
      name: 'subject',
      type: 'Reference(Patient|Group|Location|Device)',
      cardinality: '1..1',
      description: 'Individual or Entity the service is ordered for',
      required: true
    },
    {
      name: 'focus',
      type: 'Reference(Any)[]',
      cardinality: '0..*',
      description: 'What the service request is about, when it is not about the subject of record'
    },
    {
      name: 'encounter',
      type: 'Reference(Encounter)',
      cardinality: '0..1',
      description: 'Encounter in which the request was created'
    },
    {
      name: 'occurrenceDateTime',
      type: 'dateTime',
      cardinality: '0..1',
      description: 'When service should occur'
    },
    {
      name: 'occurrencePeriod',
      type: 'Period',
      cardinality: '0..1',
      description: 'When service should occur'
    },
    {
      name: 'occurrenceTiming',
      type: 'Timing',
      cardinality: '0..1',
      description: 'When service should occur'
    },
    {
      name: 'asNeededBoolean',
      type: 'boolean',
      cardinality: '0..1',
      description: 'Preconditions for service'
    },
    {
      name: 'asNeededCodeableConcept',
      type: 'CodeableConcept',
      cardinality: '0..1',
      description: 'Preconditions for service'
    },
    {
      name: 'authoredOn',
      type: 'dateTime',
      cardinality: '0..1',
      description: 'Date request signed'
    },
    {
      name: 'requester',
      type: 'Reference(Practitioner|PractitionerRole|Organization|Patient|RelatedPerson|Device)',
      cardinality: '0..1',
      description: 'Who/what is requesting service'
    },
    {
      name: 'performerType',
      type: 'CodeableConcept',
      cardinality: '0..1',
      description: 'Performer role'
    },
    {
      name: 'performer',
      type: 'Reference(Practitioner|PractitionerRole|Organization|CareTeam|HealthcareService|Patient|Device|RelatedPerson)[]',
      cardinality: '0..*',
      description: 'Requested performer'
    },
    {
      name: 'location',
      type: 'CodeableReference[]',
      cardinality: '0..*',
      description: 'Requested location'
    },
    {
      name: 'reason',
      type: 'CodeableReference[]',
      cardinality: '0..*',
      description: 'Explanation/Justification for procedure or service'
    },
    {
      name: 'insurance',
      type: 'Reference(Coverage|ClaimResponse)[]',
      cardinality: '0..*',
      description: 'Associated insurance coverage'
    },
    {
      name: 'supportingInfo',
      type: 'CodeableReference[]',
      cardinality: '0..*',
      description: 'Additional clinical information'
    },
    {
      name: 'specimen',
      type: 'Reference(Specimen)[]',
      cardinality: '0..*',
      description: 'Procedure Samples'
    },
    {
      name: 'bodySite',
      type: 'CodeableConcept[]',
      cardinality: '0..*',
      description: 'Location on Body'
    },
    {
      name: 'bodyStructure',
      type: 'Reference(BodyStructure)',
      cardinality: '0..1',
      description: 'BodyStructure-based location on the subject'
    },
    {
      name: 'note',
      type: 'Annotation[]',
      cardinality: '0..*',
      description: 'Comments'
    },
    {
      name: 'patientInstruction',
      type: 'CodeableReference[]',
      cardinality: '0..*',
      description: 'Patient or consumer-oriented instructions'
    },
    {
      name: 'relevantHistory',
      type: 'Reference(Provenance)[]',
      cardinality: '0..*',
      description: 'Request provenance'
    }
  ]
};

export default function SchemaViewer({ resourceName, schema }: SchemaViewerProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
  
  // Use mock data if no schema provided
  const displaySchema = schema || MOCK_SCHEMAS[resourceName] || [];

  const toggleExpanded = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const getTypeColor = (type: string) => {
    if (type.includes('string') || type === 'code' || type === 'uri') {
      return 'text-green-600 bg-green-50';
    }
    if (type.includes('boolean')) {
      return 'text-blue-600 bg-blue-50';
    }
    if (type.includes('integer') || type.includes('decimal') || type === 'date') {
      return 'text-purple-600 bg-purple-50';
    }
    if (type.includes('Reference') || type.includes('[]')) {
      return 'text-orange-600 bg-orange-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  const getCardinalityColor = (cardinality: string) => {
    if (cardinality.startsWith('1..')) {
      return 'text-red-600 bg-red-50'; // Required
    }
    return 'text-gray-600 bg-gray-50'; // Optional
  };

  const renderProperty = (property: SchemaProperty, path: string, depth: number = 0) => {
    const hasChildren = property.properties && property.properties.length > 0;
    const isExpanded = expandedPaths.has(path);
    const indent = depth * 20;

    return (
      <div key={path} className="border-l border-gray-200 pl-4 ml-2">
        <div className="flex items-start space-x-3 py-2">
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(path)}
              className="mt-1 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          {!hasChildren && <div className="w-4 mt-1" />}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-mono font-medium text-gray-900">
                {property.name}
              </span>
              {property.required && (
                <AlertCircle className="h-3 w-3 text-red-500" title="Required field" />
              )}
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(property.type)}`}>
                {property.type}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getCardinalityColor(property.cardinality)}`}>
                {property.cardinality}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              {property.description}
            </p>
            
            {hasChildren && isExpanded && (
              <div className="mt-3">
                {property.properties!.map((child, index) => 
                  renderProperty(child, `${path}.${child.name}`, depth + 1)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (displaySchema.length === 0) {
    return (
      <div className="text-center py-8">
        <Info className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Schema Not Available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Schema definition for {resourceName} is not yet available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              FHIR {resourceName} Schema
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This shows the structure definition for the {resourceName} resource, including 
                data types, cardinality constraints, and field descriptions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Resource Properties</h4>
          <div className="flex space-x-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-50 border border-red-200 rounded mr-1"></div>
              Required (1..*)
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded mr-1"></div>
              Optional (0..*)
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {displaySchema.map((property) => 
            renderProperty(property, property.name, 0)
          )}
        </div>
      </div>
    </div>
  );
}