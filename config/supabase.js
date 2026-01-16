/**
 * Supabase Client Configuration
 * 
 * This file creates and exports the Supabase client.
 * The client is used to interact with the Supabase database.
 * 
 * IMPORTANT: Keep your Supabase URL and API key in .env file (never commit it!)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase connection details (get these from your Supabase project settings)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file!');
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
