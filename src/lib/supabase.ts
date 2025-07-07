import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface AnimeContent {
  id: string;
  title: string;
  description?: string;
  poster_url?: string;
  iframe_url?: string;
  type: 'movie' | 'series';
  genre?: string;
  year?: number;
  rating?: number;
  episode_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Episode {
  id: string;
  anime_id: string;
  episode_number: number;
  title?: string;
  description?: string;
  iframe_url?: string;
  duration?: number;
  season_number?: number;
  created_at: string;
  updated_at: string;
}