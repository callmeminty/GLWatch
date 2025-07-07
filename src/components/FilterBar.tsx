import React from 'react';
import { Filter, Film, Tv, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  availableGenres: string[];
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function FilterBar({ 
  selectedType, 
  onTypeChange, 
  selectedGenre, 
  onGenreChange, 
  availableGenres,
  sortBy,
  onSortChange 
}: FilterBarProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-gray-800/50">
      <div className="flex items-center space-x-2 mb-6">
        <SlidersHorizontal className="w-5 h-5 text-blue-400" />
        <h3 className="text-white font-medium">Filtros e Ordenação</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tipo de Conteúdo
          </label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          >
            <option value="">Todos os tipos</option>
            <option value="movie">Filmes</option>
            <option value="series">Séries</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Gênero
          </label>
          <select
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          >
            <option value="">Todos os gêneros</option>
            {availableGenres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ordenar por
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          >
            <option value="created_at">Mais recentes</option>
            <option value="title">Título A-Z</option>
            <option value="year">Ano de lançamento</option>
            <option value="rating">Melhor avaliação</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Filtros Rápidos
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => onTypeChange('')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all ${
                selectedType === '' 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">Todos</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onTypeChange('movie')}
          className={`px-6 py-2 rounded-xl font-medium transition-colors border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/50
            ${selectedType === 'movie' 
              ? 'bg-primary text-white border-primary' 
              : 'bg-secondary text-accent hover:bg-primary/10 hover:text-primary'}`}
        >
          <Film className="w-4 h-4" />
          <span>Filmes</span>
        </button>
        
        <button
          onClick={() => onTypeChange('series')}
          className={`px-6 py-2 rounded-xl font-medium transition-colors border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/50
            ${selectedType === 'series' 
              ? 'bg-primary text-white border-primary' 
              : 'bg-secondary text-accent hover:bg-primary/10 hover:text-primary'}`}
        >
          <Tv className="w-4 h-4" />
          <span>Séries</span>
        </button>

        {availableGenres.slice(0, 4).map(genre => (
          <button
            key={genre}
            className={`px-6 py-2 rounded-xl font-medium transition-colors border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/50
              ${selectedGenre === genre 
                ? 'bg-primary text-white border-primary' 
                : 'bg-secondary text-accent hover:bg-primary/10 hover:text-primary'}`}
            onClick={() => onGenreChange(selectedGenre === genre ? '' : genre)}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
}