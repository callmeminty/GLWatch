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
import HeroBanner from './components/HeroBanner';

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
      .map((item: AnimeContent) => item.genre)
      .filter((genre: string | undefined): genre is string => Boolean(genre))
      .filter((genre: string, index: number, arr: string[]) => arr.indexOf(genre) === index);
    return genres.sort();
  }, [content]);

  const filteredContent = useMemo(() => {
    let filtered = content;

    if (searchTerm) {
      filtered = filtered.filter((item: AnimeContent) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter((item: AnimeContent) => item.type === selectedType);
    }

    if (selectedGenre) {
      filtered = filtered.filter((item: AnimeContent) => item.genre === selectedGenre);
    }

    filtered.sort((a: AnimeContent, b: AnimeContent) => {
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

  // Find the 'sinners' film from the content list
  type AnimeContentWithImages = AnimeContent & {
    backdrop_url?: string;
    poster_url?: string;
  };
  const featured = content.find((item: AnimeContentWithImages) => item.type === 'movie' && item.title.toLowerCase() === 'sinners') || null;

  // Para o banner, buscar a melhor imagem disponível
  const getBannerImage = (item: AnimeContentWithImages) => item.backdrop_url || item.poster_url || '';

  const menuItems = ['Início', 'Filmes', 'Séries', 'Animes', 'Auto', 'Manual'];

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
    <div className="min-h-screen bg-background text-white font-sans">
      <Header
        menuItems={menuItems}
        onShowAutoForm={() => setShowAutoForm(true)}
        onShowAddForm={() => setShowAddForm(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      {featured && (
        <HeroBanner
          backgroundUrl={getBannerImage(featured)}
          title={featured.title}
          subtitle={featured.year ? String(featured.year) : ''}
          onWatch={() => {}}
          onAddToWatchLater={() => {}}
        />
      )}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex gap-4 mt-8 mb-6">
          <button className="px-6 py-2 rounded-full font-semibold text-white bg-background border-2 border-primary hover:bg-primary/10 transition">Lançamentos</button>
          <button className="px-6 py-2 rounded-full font-semibold text-accent bg-background border-2 border-transparent hover:bg-primary/10 hover:text-primary transition">Novos Filmes</button>
          <button className="px-6 py-2 rounded-full font-semibold text-accent bg-background border-2 border-transparent hover:bg-primary/10 hover:text-primary transition">Populares</button>
          <button className="px-6 py-2 rounded-full font-semibold text-accent bg-background border-2 border-transparent hover:bg-primary/10 hover:text-primary transition">Mais Assistidos</button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
          {filteredContent.map(anime => (
            <AnimeCard key={anime.id} anime={anime} onClick={setSelectedAnime} />
          ))}
        </div>
      </section>

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

      <footer className="mt-16 bg-black/95 text-gray-300 pt-12 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-lg font-semibold tracking-widest text-white mb-10">
            FILMES ONLINE GRÁTIS - SERIES ONLINE - ANIMES ONLINE
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Informações</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Conta VIP</a></li>
                <li><a href="#" className="hover:underline">Suporte e FAQ</a></li>
                <li><a href="#" className="hover:underline">Política DMCA</a></li>
                <li><a href="#" className="hover:underline">Termos e condições</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Mídias Sociais</h3>
              <a href="#" className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-2 rounded-full mb-2 transition">🐦 Siga o OWL.tv</a>
              <p className="text-xs mt-2">Sem Spam! Postamos apenas atualizações do site e aplicativo.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Aplicativo OWL.tv</h3>
              <a href="#" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-2 rounded-full mb-2 transition">📱 Baixe o aplicativo</a>
              <p className="text-xs mt-2">Já conhece o nosso aplicativo?<br/>Clique e descubra mais informações!</p>
            </div>
          </div>
          <div className="text-center text-xs text-gray-400 mt-8">
            © Copyright Todos os direitos reservados a OWL.tv 2024
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;