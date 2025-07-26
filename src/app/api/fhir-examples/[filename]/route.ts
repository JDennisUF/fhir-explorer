import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // Security check - only allow .json files and prevent directory traversal
    if (!filename.endsWith('.json') || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Read the file from the docs/examples directory
    const filePath = join(process.cwd(), '..', 'docs', 'examples', filename);
    const fileContent = await readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('Error reading FHIR example:', error);
    return NextResponse.json(
      { error: 'File not found or invalid JSON' },
      { status: 404 }
    );
  }
}