import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const EXAMPLES_PATH = path.join(process.cwd(), 'docs', 'examples');

interface FhirExample {
  resourceType: string;
  id: string;
  filename: string;
  data: any;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resourceType: string }> }
) {
  try {
    const { resourceType } = await params;
    console.log(`Loading examples for resource type: ${resourceType}`);
    const examples: FhirExample[] = [];

    // Check if examples directory exists
    try {
      await fs.access(EXAMPLES_PATH);
    } catch (error) {
      console.error(`Examples directory not found: ${EXAMPLES_PATH}`);
      return NextResponse.json({ error: `Examples directory not found: ${EXAMPLES_PATH}` }, { status: 404 });
    }

    // Read all files from examples directory
    const files = await fs.readdir(EXAMPLES_PATH);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    console.log(`Found ${jsonFiles.length} JSON files in examples directory`);

    for (const filename of jsonFiles) {
      try {
        const filePath = path.join(EXAMPLES_PATH, filename);
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);

        // Check if this example matches the requested resource type
        if (data.resourceType && data.resourceType.toLowerCase() === resourceType.toLowerCase()) {
          const example: FhirExample = {
            resourceType: data.resourceType,
            id: data.id || filename.replace('.json', ''),
            filename,
            data
          };
          examples.push(example);
          console.log(`Found matching example: ${filename}`);
        }
      } catch (error) {
        console.warn(`Failed to load example ${filename}:`, error);
      }
    }

    // Sort examples by filename for consistent ordering
    examples.sort((a, b) => a.filename.localeCompare(b.filename));
    console.log(`Returning ${examples.length} examples for ${resourceType}`);

    return NextResponse.json(examples);
  } catch (error) {
    console.error('Failed to load examples:', error);
    return NextResponse.json({ error: `Failed to load examples: ${error.message}` }, { status: 500 });
  }
}