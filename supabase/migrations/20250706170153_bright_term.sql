/*
  # Add episodes support for series

  1. New Tables
    - `episodes`
      - `id` (uuid, primary key)
      - `anime_id` (uuid, foreign key to anime_content)
      - `episode_number` (integer)
      - `title` (text)
      - `description` (text)
      - `iframe_url` (text)
      - `duration` (integer, in minutes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `episodes` table
    - Add policies for public read and authenticated write

  3. Changes
    - Add episode_count column to anime_content
*/

-- Add episode count to anime_content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anime_content' AND column_name = 'episode_count'
  ) THEN
    ALTER TABLE anime_content ADD COLUMN episode_count integer DEFAULT 1;
  END IF;
END $$;

-- Create episodes table
CREATE TABLE IF NOT EXISTS episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id uuid NOT NULL REFERENCES anime_content(id) ON DELETE CASCADE,
  episode_number integer NOT NULL,
  title text,
  description text,
  iframe_url text,
  duration integer, -- in minutes
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(anime_id, episode_number)
);

ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

-- Policies for episodes
CREATE POLICY "Public can view episodes"
  ON episodes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create episodes"
  ON episodes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update episodes"
  ON episodes
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete episodes"
  ON episodes
  FOR DELETE
  TO authenticated
  USING (true);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_episodes_anime_id ON episodes(anime_id);
CREATE INDEX IF NOT EXISTS idx_episodes_number ON episodes(anime_id, episode_number);