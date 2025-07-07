import { useState, useEffect } from 'react';
import { supabase, AnimeContent } from '../lib/supabase';

export function useAnimeContent() {
  const [content, setContent] = useState<AnimeContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('anime_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const addContent = async (newContent: Omit<AnimeContent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('anime_content')
        .insert([newContent])
        .select()
        .single();

      if (error) throw error;
      setContent(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao adicionar conteúdo');
    }
  };

  const updateContent = async (id: string, updates: Partial<AnimeContent>) => {
    try {
      const { data, error } = await supabase
        .from('anime_content')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setContent(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar conteúdo');
    }
  };

  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('anime_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setContent(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao deletar conteúdo');
    }
  };

  return {
    content,
    loading,
    error,
    addContent,
    updateContent,
    deleteContent,
    refetch: fetchContent
  };
}