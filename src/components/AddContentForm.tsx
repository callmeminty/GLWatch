import React, { useState } from 'react';
import { X, Save, Plus, Trash2, ExternalLink } from 'lucide-react';
import { AnimeContent, Episode } from '../lib/supabase';

interface AddContentFormProps {
  onSubmit: (content: Omit<AnimeContent, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
}

interface EpisodeForm {
  episode_number: number;
  title: string;
  iframe_url: string;
  duration: number;
}

export function AddContentForm({ onSubmit, onClose }: AddContentFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poster_url: '',
    iframe_url: '',
    type: 'movie' as 'movie' | 'series',
    genre: '',
    year: new Date().getFullYear(),
    rating: 0,
    episode_count: 1
  });
  
  const [episodes, setEpisodes] = useState<EpisodeForm[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const contentData = {
        ...formData,
        episode_count: formData.type === 'series' ? episodes.length || 1 : 1
      };
      
      await onSubmit(contentData);
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar conteúdo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEpisode = () => {
    setEpisodes(prev => [...prev, {
      episode_number: prev.length + 1,
      title: '',
      iframe_url: '',
      duration: 24
    }]);
  };

  const removeEpisode = (index: number) => {
    setEpisodes(prev => prev.filter((_, i) => i !== index));
  };

  const updateEpisode = (index: number, field: keyof EpisodeForm, value: string | number) => {
    setEpisodes(prev => prev.map((ep, i) => 
      i === index ? { ...ep, [field]: value } : ep
    ));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const generateEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // If it's already an iframe, return as is
    if (url.includes('<iframe')) return url;
    
    // If it's a direct URL, create iframe
    return `<iframe src="${url}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
  };

  const previewEmbed = (url: string) => {
    if (!url) return null;
    
    let embedUrl = '';
    if (url.includes('<iframe')) {
      const srcMatch = url.match(/src="([^"]*)"/);
      embedUrl = srcMatch ? srcMatch[1] : '';
    } else {
      embedUrl = url;
    }
    
    return embedUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card rounded-2xl p-4 md:p-8 shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto mx-2">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-800/50">
          <h2 className="text-2xl font-bold text-white">Adicionar Conteúdo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="Digite o título do anime"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value as 'movie' | 'series';
                  setFormData({ ...formData, type: newType });
                  if (newType === 'movie') {
                    setEpisodes([]);
                  }
                }}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              >
                <option value="movie">Filme</option>
                <option value="series">Série</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder="Descreva o enredo do anime..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL do Poster
            </label>
            <input
              type="url"
              value={formData.poster_url}
              onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder="https://image.tmdb.org/t/p/w500/poster.jpg"
            />
          </div>

          {formData.type === 'movie' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Player URL ou Código Iframe
              </label>
              <textarea
                value={formData.iframe_url}
                onChange={(e) => setFormData({ ...formData, iframe_url: e.target.value })}
                rows={4}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder='https://embed.su/embed/movie/123456 ou <iframe src="..." width="640" height="400" frameborder="0" allowfullscreen></iframe>'
              />
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-400">
                  Exemplos de URLs suportadas:
                </p>
                <div className="bg-gray-800/30 rounded-lg p-3 space-y-1">
                  <p className="text-xs text-gray-300">• https://embed.su/embed/movie/123456</p>
                  <p className="text-xs text-gray-300">• https://vidsrc.to/embed/movie/123456</p>
                  <p className="text-xs text-gray-300">• Código iframe completo</p>
                </div>
                {formData.iframe_url && previewEmbed(formData.iframe_url) && (
                  <div className="flex items-center space-x-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                    <a 
                      href={previewEmbed(formData.iframe_url)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Testar player em nova aba
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gênero
              </label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="Ação, Drama, Romance..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ano
              </label>
              <input
                type="number"
                min="1900"
                max="2030"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Avaliação (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>

          {/* Episodes Section for Series */}
          {formData.type === 'series' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Episódios</h3>
                <button
                  type="button"
                  onClick={addEpisode}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Episódio</span>
                </button>
              </div>

              {episodes.length === 0 && (
                <div className="text-center py-8 bg-gray-800/20 rounded-xl border-2 border-dashed border-gray-700/50">
                  <p className="text-gray-400 mb-2">Nenhum episódio adicionado</p>
                  <p className="text-sm text-gray-500">Clique em "Adicionar Episódio" para começar</p>
                </div>
              )}

              {episodes.map((episode, index) => (
                <div key={index} className="bg-gray-800/30 rounded-xl p-5 space-y-4 border border-gray-700/30">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">Episódio {episode.episode_number}</h4>
                    <button
                      type="button"
                      onClick={() => removeEpisode(index)}
                      className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Título do episódio"
                      value={episode.title}
                      onChange={(e) => updateEpisode(index, 'title', e.target.value)}
                      className="bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <input
                      type="number"
                      placeholder="Duração (min)"
                      value={episode.duration}
                      onChange={(e) => updateEpisode(index, 'duration', parseInt(e.target.value))}
                      className="bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div>
                    <textarea
                      placeholder="URL do player ou código iframe do episódio"
                      value={episode.iframe_url}
                      onChange={(e) => updateEpisode(index, 'iframe_url', e.target.value)}
                      rows={3}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    {episode.iframe_url && previewEmbed(episode.iframe_url) && (
                      <div className="flex items-center space-x-2 text-sm mt-2">
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                        <a 
                          href={previewEmbed(episode.iframe_url)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Testar player
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Conteúdo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}