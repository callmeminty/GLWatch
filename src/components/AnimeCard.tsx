import React from 'react';
import { Play, Calendar, Star, Film, Tv, Clock, ExternalLink } from 'lucide-react';
import { AnimeContent } from '../lib/supabase';

interface AnimeCardProps {
  anime: AnimeContent;
  onClick: (anime: AnimeContent) => void;
  onRemove?: (id: string) => void;
}

export function AnimeCard({ anime, onClick, onRemove }: AnimeCardProps) {
  const hasPlayer = Boolean(anime.iframe_url);
  
  return (
    <div 
      className="group cursor-pointer transition-all duration-300 hover:scale-105"
      onClick={() => onClick(anime)}
    >
      <div className="relative rounded-2xl overflow-hidden shadow-lg bg-card group min-w-[220px] max-w-[240px] h-[340px] flex-shrink-0 transition-transform duration-300 hover:scale-105">
        {/* Remove Button */}
        {onRemove && (
          <button
            className="absolute top-2 right-2 z-10 bg-red-600/80 hover:bg-red-700 text-white rounded-full p-1 shadow-lg transition-colors"
            onClick={e => {
              e.stopPropagation();
              onRemove(anime.id);
            }}
            title="Remover"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
        <div className="relative aspect-[2/3]">
          <img
            src={anime.poster_url || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400'}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
            <h3 className="text-lg font-bold text-white mb-1 drop-shadow-md line-clamp-2">{anime.title}</h3>
            <div className="flex items-center text-accent text-sm space-x-4">
              <span>{anime.year}</span>
              <span className="flex items-center"><Star className="w-4 h-4 mr-1 text-primary" />{anime.rating}</span>
              <span>{anime.episode_count} ep</span>
            </div>
          </div>
          
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className={`backdrop-blur-md rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 ${
              hasPlayer 
                ? 'bg-blue-500/20 border border-blue-500/30' 
                : 'bg-gray-500/20 border border-gray-500/30'
            }`}>
              {hasPlayer ? (
                <Play className="w-8 h-8 text-blue-400 ml-1" />
              ) : (
                <ExternalLink className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>

          {/* Status badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {/* Type badge */}
            <div className="bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 flex items-center space-x-1">
              {anime.type === 'movie' ? (
                <Film className="w-3 h-3 text-white" />
              ) : (
                <Tv className="w-3 h-3 text-white" />
              )}
              <span className="text-xs text-white font-medium">
                {anime.type === 'movie' ? 'Filme' : 'Série'}
              </span>
              {anime.type === 'series' && anime.episode_count && (
                <>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-300">{anime.episode_count} eps</span>
                </>
              )}
            </div>
            
            {/* Player status */}
            {!hasPlayer && (
              <div className="bg-orange-500/80 backdrop-blur-md rounded-lg px-2 py-1">
                <span className="text-xs text-white font-medium">Sem Player</span>
              </div>
            )}
          </div>

          {/* Rating */}
          {anime.rating && anime.rating > 0 && (
            <div className="absolute top-3 right-3">
              <div className="bg-yellow-500/90 backdrop-blur-md rounded-lg px-2 py-1 flex items-center space-x-1">
                <Star className="w-3 h-3 text-white" />
                <span className="text-xs text-white font-medium">{anime.rating}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}