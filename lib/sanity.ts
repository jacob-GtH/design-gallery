// lib/sanity.ts
import { createClient } from '@sanity/client';

export const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: 'production',
    apiVersion: '2023-05-03',
    useCdn: true,
    token: process.env.SANITY_API_TOKEN
});