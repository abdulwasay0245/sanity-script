// sanityClient.ts
import { createClient } from '@sanity/client';
import dotenv from 'dotenv'

dotenv.config()
export const client = createClient({
  projectId: process.env.projectId, // Replace with your project ID
  dataset: 'production',        // Or your dataset name
  apiVersion: '2024-01-04',     // Today's date or latest API version
  useCdn: false,                // Disable CDN for real-time updates
  token: process.env.token,
});