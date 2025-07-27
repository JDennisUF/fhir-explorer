// Client-side example loader for FHIR resources
export interface FhirExample {
  resourceType: string;
  id: string;
  filename: string;
  data: any;
}

export async function loadExamplesForResource(resourceType: string): Promise<FhirExample[]> {
  try {
    const response = await fetch(`/api/examples/${resourceType}`);
    if (!response.ok) {
      throw new Error(`Failed to load examples: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading examples:', error);
    return [];
  }
}

// Helper to get a pretty display name for an example
export function getExampleDisplayName(example: FhirExample): string {
  // Try to get a meaningful name from the example data
  if (example.data.name) {
    if (typeof example.data.name === 'string') return example.data.name;
    if (example.data.name.text) return example.data.name.text;
    if (example.data.name[0]?.text) return example.data.name[0].text;
  }
  
  if (example.data.title) return example.data.title;
  if (example.data.description) return example.data.description;
  if (example.data.text?.div) {
    // Extract text from HTML div
    const div = example.data.text.div;
    const textMatch = div.match(/>([^<]+)</);
    if (textMatch) return textMatch[1].trim();
  }

  // Fall back to filename
  return example.filename.replace('.json', '').replace(/^[^-]+-/, '');
}