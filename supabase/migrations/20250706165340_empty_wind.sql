/*
  # Criação do sistema de conteúdo anime

  1. Novas Tabelas
    - `anime_content`
      - `id` (uuid, chave primária)
      - `title` (text, título do anime)
      - `description` (text, descrição)
      - `poster_url` (text, URL do poster)
      - `iframe_url` (text, URL do iframe do player)
      - `type` (text, tipo: 'movie' ou 'series')
      - `genre` (text, gênero)
      - `year` (integer, ano de lançamento)
      - `rating` (numeric, avaliação)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `anime_content`
    - Política para leitura pública
    - Política para criação/edição autenticada
*/

CREATE TABLE IF NOT EXISTS anime_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  poster_url text,
  iframe_url text,
  type text CHECK (type IN ('movie', 'series')) DEFAULT 'movie',
  genre text,
  year integer,
  rating numeric(2,1) CHECK (rating >= 0 AND rating <= 10),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE anime_content ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública
CREATE POLICY "Público pode visualizar conteúdo"
  ON anime_content
  FOR SELECT
  TO public
  USING (true);

-- Política para criação/edição (requer autenticação)
CREATE POLICY "Usuários autenticados podem criar conteúdo"
  ON anime_content
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem editar conteúdo"
  ON anime_content
  FOR UPDATE
  TO authenticated
  USING (true);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_anime_content_type ON anime_content(type);
CREATE INDEX IF NOT EXISTS idx_anime_content_genre ON anime_content(genre);
CREATE INDEX IF NOT EXISTS idx_anime_content_year ON anime_content(year);
CREATE INDEX IF NOT EXISTS idx_anime_content_rating ON anime_content(rating);