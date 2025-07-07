/*
  # Fix RLS policies for anime content

  1. Security Updates
    - Update INSERT policy to allow anonymous users to create content
    - Ensure SELECT policy allows public access
    - Keep UPDATE policy for authenticated users only
  
  2. Changes Made
    - Modified INSERT policy to allow 'anon' role
    - Verified SELECT policy allows public access
    - Maintained UPDATE policy for authenticated users
*/

-- Drop existing INSERT policy and recreate with proper permissions
DROP POLICY IF EXISTS "Usuários autenticados podem criar conteúdo" ON anime_content;

-- Create new INSERT policy that allows anonymous users
CREATE POLICY "Public can create anime content"
  ON anime_content
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure SELECT policy allows public access (should already exist but verify)
DROP POLICY IF EXISTS "Público pode visualizar conteúdo" ON anime_content;

CREATE POLICY "Public can view anime content"
  ON anime_content
  FOR SELECT
  TO anon, authenticated, public
  USING (true);

-- Keep UPDATE policy for authenticated users only
DROP POLICY IF EXISTS "Usuários autenticados podem editar conteúdo" ON anime_content;

CREATE POLICY "Authenticated users can update anime content"
  ON anime_content
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);