import { NextRequest, NextResponse } from 'next/server';
import { generateResourceSchema } from '../../../../lib/schema-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resourceType: string }> }
) {
  try {
    const { resourceType } = await params;
    const schema = generateResourceSchema(resourceType);
    
    return NextResponse.json(schema);
  } catch (error) {
    console.error('Error generating schema:', error);
    return NextResponse.json({ error: 'Failed to generate schema' }, { status: 500 });
  }
}