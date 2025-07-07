import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { AnimeCard } from './components/AnimeCard';
import { VideoPlayer } from './components/VideoPlayer';
import { AddContentForm } from './components/AddContentForm';
import { AutoContentForm } from './components/AutoContentForm';
import { FilterBar } from './components/FilterBar';
import { ContentSeeder } from './components/ContentSeeder';
import { useAnimeContent } from './hooks/useAnimeContent';
import { useEpisodes } from './hooks/useEpisodes';
import { AnimeContent } from './lib/supabase';
import { Loader2, Play, AlertCircle, Database } from 'lucide-react';

function App() {
  const { content, loading, error, addContent, refetch, deleteContent } = useAnimeContent();
  const { addEpisode } = useEpisodes();
  const [selectedAnime, setSelectedAnime] = useState<AnimeContent | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAutoForm, setShowAutoForm] = useState(false);
  const [showSeeder, setShowSeeder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  const availableGenres = useMemo(() => {
    const genres = content
      .map(item => item.genre)
      .filter((genre): genre is string => Boolean(genre))
      .filter((genre, index, arr) => arr.indexOf(genre) === index);
    return genres.sort();
  }, [content]);

  const filteredContent = useMemo(() => {
    let filtered = content;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    if (selectedGenre) {
      filtered = filtered.filter(item => item.genre === selectedGenre);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'year':
          return (b.year || 0) - (a.year || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [content, searchTerm, selectedType, selectedGenre, sortBy]);

  const handleAddContent = async (newContent: Omit<AnimeContent, 'id' | 'created_at' | 'updated_at'>) => {
    await addContent(newContent);
  };

  const handleAddContentWithEpisodes = async (
    newContent: Omit<AnimeContent, 'id' | 'created_at' | 'updated_at'>, 
    episodes?: Array<{
      episode_number: number;
      title: string;
      iframe_url: string;
      duration: number;
      season_number?: number;
    }>
  ) => {
    try {
      // Add the main content first
      const addedContent = await addContent(newContent);
      
      // If there are episodes, add them
      if (episodes && episodes.length > 0 && addedContent) {
        for (const episode of episodes) {
          const episodeData: any = {
            anime_id: addedContent.id,
            episode_number: episode.episode_number,
            title: episode.title,
            iframe_url: episode.iframe_url,
            duration: episode.duration,
            description: `${episode.title} - Episode ${episode.episode_number}`,
          };
          if (typeof episode.season_number === 'number' && !isNaN(episode.season_number)) {
            episodeData.season_number = episode.season_number;
          }
          await addEpisode(episodeData);
        }
      }
    } catch (error) {
      console.error('Error adding content with episodes:', error);
      throw error;
    }
  };

  const handleContentAdded = () => {
    refetch();
  };

  const handleRemoveContent = async (id: string) => {
    try {
      await deleteContent(id);
    } catch (err) {
      alert('Erro ao remover conteúdo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Erro de Conexão</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="bg-gray-800/50 rounded-xl p-4 text-left">
            <p className="text-sm text-gray-300 mb-2">Para resolver:</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Configure as variáveis do Supabase</li>
              <li>• Verifique sua conexão com a internet</li>
              <li>• Certifique-se de que o banco está ativo</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header
        onShowAddForm={() => setShowAddForm(true)}
        onShowAutoForm={() => setShowAutoForm(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <FilterBar
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
          availableGenres={availableGenres}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Content Seeder - Show when no content */}
        {content.length === 0 && !loading && (
          <div className="mb-8">
            <ContentSeeder onContentAdded={handleContentAdded} />
          </div>
        )}

        {/* Demo Content Button - Show when there is content */}
        {content.length > 0 && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowSeeder(!showSeeder)}
              className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-300 px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
            >
              <Database className="w-4 h-4" />
              <span>Gerenciar Conteúdo Demo</span>
            </button>
          </div>
        )}

        {showSeeder && content.length > 0 && (
          <div className="mb-8">
            <ContentSeeder onContentAdded={handleContentAdded} />
          </div>
        )}

        {filteredContent.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {searchTerm || selectedType || selectedGenre ? 'Nenhum resultado encontrado' : 'Bem-vindo ao GLWatch'}
              </h3>
              <p className="text-gray-400 mb-8">
                {searchTerm || selectedType || selectedGenre 
                  ? 'Tente ajustar os filtros ou termo de busca para encontrar o que procura'
                  : 'Sua plataforma de streaming de animes. Comece adicionando conteúdo automaticamente ou use nosso conteúdo de demonstração!'
                }
              </p>
              {!searchTerm && !selectedType && !selectedGenre && content.length === 0 && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setShowAutoForm(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    Busca Automática
                  </button>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    Adicionar Manualmente
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Content Stats */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-gray-400">
                <span className="text-white font-medium">{filteredContent.length}</span> {filteredContent.length === 1 ? 'item encontrado' : 'itens encontrados'}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>{content.filter(c => c.type === 'movie').length} filmes</span>
                <span>{content.filter(c => c.type === 'series').length} séries</span>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {filteredContent.map(anime => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  onClick={setSelectedAnime}
                  onRemove={handleRemoveContent}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {selectedAnime && (
        <VideoPlayer
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
        />
      )}

      {showAddForm && (
        <AddContentForm
          onSubmit={handleAddContent}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {showAutoForm && (
        <AutoContentForm
          onSubmit={handleAddContentWithEpisodes}
          onClose={() => setShowAutoForm(false)}
        />
      )}
    </div>
  );
}

export default App;