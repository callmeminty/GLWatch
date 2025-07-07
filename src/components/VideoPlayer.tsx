import React, { useState, useEffect, useMemo } from 'react';
import { X, ExternalLink, Play, List, ChevronLeft, ChevronRight, Monitor, Clock } from 'lucide-react';
import { AnimeContent, Episode } from '../lib/supabase';
import { useEpisodes } from '../hooks/useEpisodes';

interface VideoPlayerProps {
  anime: AnimeContent;
  onClose: () => void;
}

export function VideoPlayer({ anime, onClose }: VideoPlayerProps) {
  const { episodes, loading } = useEpisodes(anime.type === 'series' ? anime.id : undefined);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [showEpisodes, setShowEpisodes] = useState(anime.type === 'series');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    if (episodes.length > 0 && !selectedEpisode) {
      setSelectedEpisode(episodes[0]);
    }
  }, [episodes, selectedEpisode]);

  useEffect(() => {
    setIframeError(false);
  }, [selectedEpisode]);

  const currentIframe = selectedEpisode?.iframe_url || anime.iframe_url;
  const currentTitle = selectedEpisode 
    ? `${anime.title} - Episódio ${selectedEpisode.episode_number}${selectedEpisode.title ? `: ${selectedEpisode.title}` : ''}`
    : anime.title;

  const processIframeUrl = (url: string) => {
    if (!url) return '';
    // If it's already an iframe, return as is but remove sandbox and referrerpolicy
    if (url.includes('<iframe')) {
      return url
        .replace(/width="[^"]*"/, 'width="100%"')
        .replace(/height="[^"]*"/, 'height="100%"')
        .replace(/sandbox="[^"]*"/g, '')
        .replace(/referrerpolicy="[^"]*"/g, '');
    }
    // If it's a direct URL, create iframe without sandbox
    return `<iframe src="${url}" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay; encrypted-media; fullscreen"></iframe>`;
  };

  const getDirectUrl = (url: string) => {
    if (!url) return '';
    
    if (url.includes('<iframe')) {
      const srcMatch = url.match(/src="([^"]*)"/);
      return srcMatch ? srcMatch[1] : '';
    }
    
    return url;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const goToNextEpisode = () => {
    if (!selectedEpisode || episodes.length === 0) return;
    
    const currentIndex = episodes.findIndex(ep => ep.id === selectedEpisode.id);
    if (currentIndex < episodes.length - 1) {
      setSelectedEpisode(episodes[currentIndex + 1]);
    }
  };

  const goToPreviousEpisode = () => {
    if (!selectedEpisode || episodes.length === 0) return;
    
    const currentIndex = episodes.findIndex(ep => ep.id === selectedEpisode.id);
    if (currentIndex > 0) {
      setSelectedEpisode(episodes[currentIndex - 1]);
    }
  };

  const currentEpisodeIndex = selectedEpisode 
    ? episodes.findIndex(ep => ep.id === selectedEpisode.id)
    : -1;

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className={`bg-gray-900/95 backdrop-blur-md rounded-2xl w-full max-h-[95vh] overflow-hidden border border-gray-800/50 ${
        isFullscreen ? 'max-w-none h-full' : 'max-w-7xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">{currentTitle}</h2>
            {anime.type === 'series' && episodes.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">
                  {selectedEpisode ? `${currentEpisodeIndex + 1}/${episodes.length}` : `${episodes.length} episódios`}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {anime.type === 'series' && episodes.length > 0 && (
              <button
                onClick={() => setShowEpisodes(!showEpisodes)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
                  showEpisodes 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm">Episódios</span>
              </button>
            )}
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
            >
              <Monitor className="w-5 h-5" />
            </button>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Video Player */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 flex-1">
              {currentIframe ? (
                <div className="relative h-full">
                  <div 
                    className={`w-full bg-black rounded-xl overflow-hidden ${
                      isFullscreen ? 'h-full' : 'aspect-video'
                    }`}
                    dangerouslySetInnerHTML={{ __html: processIframeUrl(currentIframe) }}
                  />
                </div>
              ) : (
                <div className={`flex items-center justify-center bg-gray-800/50 rounded-xl ${
                  isFullscreen ? 'h-full' : 'aspect-video'
                }`}>
                  <div className="text-center">
                    <Play className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">Nenhum player disponível</p>
                    <p className="text-sm text-gray-500">
                      Este conteúdo não possui um link de player configurado.
                    </p>
                  </div>
                </div>
              )}
              
              {/* External Link */}
              {currentIframe && (
                <div className="mt-4 flex items-center justify-center">
                  <a
                    href={getDirectUrl(currentIframe)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir player em nova aba</span>
                  </a>
                </div>
              )}
            </div>

            {/* Description */}
            {!isFullscreen && anime.description && (
              <div className="p-4 border-t border-gray-800/50">
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-2">Sinopse</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{anime.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Episodes Sidebar */}
          {anime.type === 'series' && showEpisodes && !isFullscreen && (
            <div className="w-80 border-l border-gray-800/50 bg-gray-900/50 flex flex-col max-h-[80vh]">
              <div className="p-4 border-b border-gray-800/50">
                <h3 className="font-semibold text-white">Lista de Episódios</h3>
                <p className="text-sm text-gray-400 mt-1">{episodes.length} episódios disponíveis</p>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                {loading ? (
                  <div className="p-4 text-center text-gray-400">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Carregando episódios...
                  </div>
                ) : episodes.length > 0 ? (
                  <div className="p-2 space-y-2">
                    {episodes.map((episode, index) => (
                      <button
                        key={episode.id}
                        onClick={() => setSelectedEpisode(episode)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                          selectedEpisode?.id === episode.id
                            ? 'bg-blue-500/20 border border-blue-500/30 shadow-lg'
                            : 'hover:bg-gray-800/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            selectedEpisode?.id === episode.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {episode.episode_number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              selectedEpisode?.id === episode.id ? 'text-blue-400' : 'text-white'
                            }`}>
                              {episode.title || `Episódio ${episode.episode_number}`}
                            </p>
                            {episode.description && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {episode.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                              {episode.duration && (
                                <span className="text-xs text-gray-500">
                                  {episode.duration} min
                                </span>
                              )}
                              {episode.iframe_url && (
                                <span className="text-xs text-green-400">
                                  ● Disponível
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400">
                    <List className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm">Nenhum episódio encontrado</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}