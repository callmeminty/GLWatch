import React, { useState } from 'react';
import { Play, Plus, Search, Zap } from 'lucide-react';

interface HeaderProps {
  onShowAddForm: () => void;
  onShowAutoForm: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function Header({ onShowAddForm, onShowAutoForm, searchTerm, onSearchChange }: HeaderProps) {
  return (
    <header className="bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                GL<span className="text-blue-400">Watch</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar animes..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-gray-900/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-80 transition-all"
              />
            </div>
            
            <button
              onClick={onShowAutoForm}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Zap className="w-4 h-4" />
              <span>Auto</span>
            </button>

            <button
              onClick={onShowAddForm}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Manual</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}