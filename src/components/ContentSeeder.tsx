import React from 'react';
import { Database, Trash2, Download, CheckCircle } from 'lucide-react';
import { useContentSeeder } from '../hooks/useContentSeeder';

interface ContentSeederProps {
  onContentAdded: () => void;
}

export function ContentSeeder({ onContentAdded }: ContentSeederProps) {
  const { seedContent, clearAllContent, isSeeding, seedProgress } = useContentSeeder();

  const handleSeedContent = async () => {
    try {
      await seedContent();
      onContentAdded();
    } catch (error) {
      console.error('Failed to seed content:', error);
    }
  };

  const handleClearContent = async () => {
    if (window.confirm('Tem certeza que deseja remover todo o conteúdo? Esta ação não pode ser desfeita.')) {
      try {
        await clearAllContent();
        onContentAdded();
      } catch (error) {
        console.error('Failed to clear content:', error);
      }
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50">
      <div className="flex items-center space-x-3 mb-6">
        <Database className="w-6 h-6 text-blue-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">Conteúdo de Demonstração</h3>
          <p className="text-sm text-gray-400">Adicione conteúdo de exemplo para testar a plataforma</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800/30 rounded-xl p-4">
          <h4 className="font-medium text-white mb-2">O que será adicionado:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• 10 Filmes populares com players funcionais</li>
            <li>• 10 Séries com episódios e players</li>
            <li>• 10 Animes clássicos e modernos</li>
            <li>• Posters em alta qualidade</li>
            <li>• URLs de embed do vidlink.pro</li>
          </ul>
        </div>

        {isSeeding && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-blue-400 font-medium">Adicionando conteúdo...</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${seedProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mt-2">{seedProgress}% concluído</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleSeedContent}
            disabled={isSeeding}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg"
          >
            {isSeeding ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Adicionando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Adicionar Conteúdo</span>
              </>
            )}
          </button>

          <button
            onClick={handleClearContent}
            disabled={isSeeding}
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar</span>
          </button>
        </div>
      </div>
    </div>
  );
}