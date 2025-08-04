// sanity/design-cms/env.ts
// أعلى env.ts
import dotenv from 'dotenv'
import path from 'path'

// تحميل .env.local من جذر المشروع
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })


export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-06-09'

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID',
)
export const token = assertValue(
  process.env.SANITY_API_TOKEN,
  'Missing environment variable: SANITY_API_TOKEN',
)

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET',
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
