import React, { useState } from 'react';
import { X, Search, Download, Film, Tv, Zap, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { tmdbService, malService, generateVidlinkUrl, getGenreNames } from '../services/tmdbApi';
import { AnimeContent } from '../lib/supabase';

interface AutoContentFormProps {
  onSubmit: (content: Omit<AnimeContent, 'id' | 'created_at' | 'updated_at'>, episodes?: Array<{
    episode_number: number;
    title: string;
    iframe_url: string;
    duration: number;
    season_number?: number;
  }>) => Promise<void>;
  onClose: () => void;
}

type ContentType = 'movie' | 'series' | 'anime';

interface FetchedContent {
  title: string;
  description: string;
  poster_url: string;
  iframe_url: string;
  type: 'movie' | 'series';
  genre: string;
  year: number;
  rating: number;
  episode_count?: number;
  episodes?: Array<{
    episode_number: number;
    title: string;
    iframe_url: string;
    duration: number;
    season_number?: number;
  }>;
}

export function AutoContentForm({ onSubmit, onClose }: AutoContentFormProps) {
  const [contentType, setContentType] = useState<ContentType>('movie');
  const [contentId, setContentId] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedContent, setFetchedContent] = useState<FetchedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subOrDub, setSubOrDub] = useState<'sub' | 'dub'>('sub');

  const handleFetch = async () => {
    if (!contentId.trim()) return;

    setIsLoading(true);
    setError(null);
    setFetchedContent(null);

    try {
      const id = parseInt(contentId);
      if (isNaN(id)) {
        throw new Error('ID deve ser um número válido');
      }

      if (contentType === 'anime') {
        const anime = await malService.getAnime(id);
        const content: FetchedContent = {
          title: anime.title,
          description: anime.synopsis || '',
          poster_url: anime.images?.jpg?.large_image_url || '',
          iframe_url: generateVidlinkUrl('anime', id, undefined, 1, subOrDub),
          type: anime.type === 'Movie' ? 'movie' : 'series',
          genre: anime.genres?.[0]?.name || 'Anime',
          year: anime.year || new Date().getFullYear(),
          rating: anime.score || 0,
          episode_count: anime.episodes || 1
        };

        // Generate episodes for anime series
        if (content.type === 'series' && anime.episodes > 1) {
          if (episodeNumber && episodeNumber.trim() !== '') {
            // If specific episode number is provided, only generate that episode
            const epNumber = parseInt(episodeNumber);
            if (epNumber >= 1 && epNumber <= anime.episodes) {
              content.episodes = [{
                episode_number: epNumber,
                title: `Episode ${epNumber}`,
                iframe_url: generateVidlinkUrl('anime', id, undefined, epNumber, subOrDub),
                duration: 24 // Default anime episode duration
              }];
              content.episode_count = 1;
            } else {
              throw new Error(`Episódio ${epNumber} não encontrado. O anime tem ${anime.episodes} episódios.`);
            }
          } else {
            // Generate all episodes
            content.episodes = Array.from({ length: Math.min(anime.episodes, 50) }, (_, i) => ({
              episode_number: i + 1,
              title: `Episode ${i + 1}`,
              iframe_url: generateVidlinkUrl('anime', id, undefined, i + 1, subOrDub),
              duration: 24 // Default anime episode duration
            }));
          }
        }

        setFetchedContent(content);
      } else if (contentType === 'movie') {
        const movie = await tmdbService.getMovie(id);
        const content: FetchedContent = {
          title: movie.title,
          description: movie.overview || '',
          poster_url: movie.poster_path || '',
          iframe_url: generateVidlinkUrl('movie', id),
          type: 'movie',
          genre: getGenreNames(movie.genre_ids || [], 'movie'),
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : new Date().getFullYear(),
          rating: movie.vote_average || 0,
          episode_count: 1
        };

        setFetchedContent(content);
      } else if (contentType === 'series') {
        const series = await tmdbService.getSeries(id);
        const episodes = await tmdbService.getAllSeasons(id);
        
        const content: FetchedContent = {
          title: series.name,
          description: series.overview || '',
          poster_url: series.poster_path || '',
          iframe_url: episodes.length > 0 ? generateVidlinkUrl('tv', id, episodes[0].season_number, episodes[0].episode_number) : '',
          type: 'series',
          genre: getGenreNames(series.genre_ids || [], 'tv'),
          year: series.first_air_date ? new Date(series.first_air_date).getFullYear() : new Date().getFullYear(),
          rating: series.vote_average || 0,
          episode_count: episodes.length
        };

        // Generate episodes for TV series
        if (episodeNumber && episodeNumber.trim() !== '') {
          // If specific episode number is provided, only generate that episode
          const epNumber = parseInt(episodeNumber);
          const specificEpisode = episodes.find(ep => ep.episode_number === epNumber);
          
          if (specificEpisode) {
            content.episodes = [{
              episode_number: specificEpisode.episode_number,
              title: specificEpisode.name || `Episode ${specificEpisode.episode_number}`,
              iframe_url: generateVidlinkUrl('tv', id, specificEpisode.season_number, specificEpisode.episode_number),
              duration: specificEpisode.runtime || 45
            }];
            content.episode_count = 1;
          } else {
            throw new Error(`Episódio ${epNumber} não encontrado. A série tem ${episodes.length} episódios.`);
          }
        } else {
          // Generate all episodes (limit to first 50 episodes to avoid overwhelming)
          content.episodes = episodes.slice(0, 50).map(ep => ({
            episode_number: ep.episode_number,
            title: ep.name || `Episode ${ep.episode_number}`,
            iframe_url: generateVidlinkUrl('tv', id, ep.season_number, ep.episode_number),
            duration: ep.runtime || 45
          }));
        }

        setFetchedContent(content);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar conteúdo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!fetchedContent) return;

    try {
      await onSubmit({
        title: fetchedContent.title,
        description: fetchedContent.description,
        poster_url: fetchedContent.poster_url,
        iframe_url: fetchedContent.iframe_url,
        type: fetchedContent.type,
        genre: fetchedContent.genre,
        year: fetchedContent.year,
        rating: fetchedContent.rating,
        episode_count: fetchedContent.episode_count
      }, fetchedContent.episodes);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar conteúdo');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getPlaceholder = () => {
    switch (contentType) {
      case 'movie':
        return 'Ex: 634649 (Spider-Man: No Way Home)';
      case 'series':
        return 'Ex: 94997 (House of the Dragon)';
      case 'anime':
        return 'Ex: 38000 (Demon Slayer)';
      default:
        return '';
    }
  };

  const getApiSource = () => {
    switch (contentType) {
      case 'movie':
      case 'series':
        return 'TMDB (The Movie Database)';
      case 'anime':
        return 'MAL (MyAnimeList)';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card rounded-2xl p-8 shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <div>
            <h2 className="text-2xl font-bold text-white">Busca Automática de Conteúdo</h2>
            <p className="text-gray-400 mt-1">Adicione conteúdo automaticamente usando apenas o ID</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Tipo de Conteúdo
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setContentType('movie')}
                className={`flex items-center space-x-3 p-4 rounded-xl border transition-all ${
                  contentType === 'movie'
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                    : 'bg-gray-800/30 border-gray-700/50 text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                <Film className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Filme</div>
                  <div className="text-xs opacity-75">TMDB ID</div>
                </div>
              </button>

              <button
                onClick={() => setContentType('series')}
                className={`flex items-center space-x-3 p-4 rounded-xl border transition-all ${
                  contentType === 'series'
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                    : 'bg-gray-800/30 border-gray-700/50 text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                <Tv className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Série</div>
                  <div className="text-xs opacity-75">TMDB ID</div>
                </div>
              </button>

              <button
                onClick={() => setContentType('anime')}
                className={`flex items-center space-x-3 p-4 rounded-xl border transition-all ${
                  contentType === 'anime'
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                    : 'bg-gray-800/30 border-gray-700/50 text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                <Zap className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Anime</div>
                  <div className="text-xs opacity-75">MAL ID</div>
                </div>
              </button>
            </div>
          </div>

          {/* ID Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {contentType === 'anime' ? 'MyAnimeList ID' : 'TMDB ID'}
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                placeholder={getPlaceholder()}
                className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
              <button
                onClick={handleFetch}
                disabled={isLoading || !contentId.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Buscando...' : 'Buscar'}</span>
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Fonte: {getApiSource()}
            </p>
          </div>

          {/* Episode Number Input for Series */}
          {(contentType === 'series' || contentType === 'anime') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número do Episódio (opcional)
              </label>
              <input
                type="number"
                min="1"
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(e.target.value)}
                placeholder="Deixe vazio para adicionar todos os episódios"
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
              <p className="text-sm text-gray-400 mt-2">
                Se especificado, apenas este episódio será adicionado. Se vazio, todos os episódios serão adicionados automaticamente.
              </p>
            </div>
          )}

          {/* Anime Sub/Dub Selection */}
          {contentType === 'anime' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Idioma Preferido
              </label>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSubOrDub('sub')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    subOrDub === 'sub'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700/30 border border-gray-700/30'
                  }`}
                >
                  Legendado (Sub)
                </button>
                <button
                  onClick={() => setSubOrDub('dub')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    subOrDub === 'dub'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700/30 border border-gray-700/30'
                  }`}
                >
                  Dublado (Dub)
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-medium">Erro ao buscar conteúdo</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Fetched Content Preview */}
          {fetchedContent && (
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Conteúdo Encontrado</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      {fetchedContent.poster_url && (
                        <img
                          src={fetchedContent.poster_url}
                          alt={fetchedContent.title}
                          className="w-full max-w-48 rounded-lg"
                        />
                      )}
                    </div>
                    
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <h4 className="font-medium text-white">{fetchedContent.title}</h4>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-3">{fetchedContent.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Tipo:</span>
                          <span className="text-white ml-2">{fetchedContent.type === 'movie' ? 'Filme' : 'Série'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Gênero:</span>
                          <span className="text-white ml-2">{fetchedContent.genre}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Ano:</span>
                          <span className="text-white ml-2">{fetchedContent.year}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Avaliação:</span>
                          <span className="text-white ml-2">{fetchedContent.rating.toFixed(1)}</span>
                        </div>
                        {fetchedContent.episode_count && fetchedContent.episode_count > 1 && (
                          <div>
                            <span className="text-gray-400">Episódios:</span>
                            <span className="text-white ml-2">{fetchedContent.episode_count}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Player URL:</p>
                        <p className="text-xs text-blue-400 font-mono break-all">{fetchedContent.iframe_url}</p>
                      </div>

                      {/* Episodes Preview */}
                      {fetchedContent.episodes && fetchedContent.episodes.length > 0 && (
                        <div className="bg-gray-700/30 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-2">
                            {fetchedContent.episodes.length} episódios serão criados automaticamente
                          </p>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {fetchedContent.episodes.slice(0, 5).map((ep, index) => (
                              <div key={index} className="text-xs text-gray-300">
                                Ep {ep.episode_number}: {ep.title}
                              </div>
                            ))}
                            {fetchedContent.episodes.length > 5 && (
                              <div className="text-xs text-gray-400">
                                ... e mais {fetchedContent.episodes.length - 5} episódios
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-800/50">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!fetchedContent}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Adicionar Conteúdo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}