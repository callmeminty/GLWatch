import { useState, useEffect } from 'react';
import { supabase, Episode } from '../lib/supabase';

export function useEpisodes(animeId?: string) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (animeId) {
      fetchEpisodes(animeId);
    }
  }, [animeId]);

  const fetchEpisodes = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('anime_id', id)
        .order('episode_number', { ascending: true });

      if (error) throw error;
      setEpisodes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar episódios');
    } finally {
      setLoading(false);
    }
  };

  const addEpisode = async (episode: Omit<Episode, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('episodes')
        .insert([episode])
        .select()
        .single();

      if (error) throw error;
      setEpisodes(prev => [...prev, data].sort((a, b) => a.episode_number - b.episode_number));
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao adicionar episódio');
    }
  };

  const updateEpisode = async (id: string, updates: Partial<Episode>) => {
    try {
      const { data, error } = await supabase
        .from('episodes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setEpisodes(prev => prev.map(ep => ep.id === id ? data : ep));
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar episódio');
    }
  };

  const deleteEpisode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('episodes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEpisodes(prev => prev.filter(ep => ep.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao deletar episódio');
    }
  };

  return {
    episodes,
    loading,
    error,
    addEpisode,
    updateEpisode,
    deleteEpisode,
    refetch: animeId ? () => fetchEpisodes(animeId) : () => {}
  };
}