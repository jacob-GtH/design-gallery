import { NextResponse } from 'next/server';
import { client } from '@/sanity/design-cms/lib/client';

export async function GET() {
  try {
    const designers = await client.fetch(`*[_type == "designer"]{
      _id,
      name
    }`);
    return NextResponse.json(designers);
  } catch (error) {
    console.error('❌ Failed to fetch designers:', error);
    return NextResponse.json({ error: 'Failed to fetch designers' }, { status: 500 });
  }
}
