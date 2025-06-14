// File: app/api/designs/route.ts
import { NextResponse } from 'next/server';
import { client } from '../../../lib/sanity.client';
import groq from 'groq';

const query = groq`*[_type == "design"] | order(_createdAt desc){
  _id,
  title,
  slug,
"imageUrl": mainImage.asset->url,
  category,
  description
}`;

export async function GET() {
  try {
    const designs = await client.fetch(query);
    return NextResponse.json(designs);
  } catch (error) {
    console.error('❌ Failed to fetch designs:', error);
    return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 });
  }
}
