import React, { useState } from 'react';
import { Play, Plus, Search, Zap, User } from 'lucide-react';

interface HeaderProps {
  menuItems?: string[];
  onShowAutoForm?: () => void;
  onShowAddForm?: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function Header({ menuItems = ['Início', 'Filmes', 'Séries', 'Animes', 'Auto', 'Manual'], onShowAutoForm, onShowAddForm, searchTerm, setSearchTerm }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('owl_logged_in'));

  const handleLogout = () => {
    localStorage.removeItem('owl_logged_in');
    setIsLoggedIn(false);
    window.location.reload();
  };

  return (
    <header className="w-full px-8 py-4 flex items-center justify-between bg-black/40 backdrop-blur-md fixed top-0 left-0 z-50 border-b border-transparent">
      <div className="flex items-center gap-8">
        <h1 className="text-3xl font-extrabold italic tracking-[0.35em] montserrat select-none">
          <span className="text-white">OWL</span><span className="text-primary">.tv</span>
        </h1>
        <nav className="flex gap-8 ml-8">
          {menuItems.map((item, idx) => {
            if (item === 'Auto') {
              return (
                <button
                  key={item}
                  onClick={onShowAutoForm}
                  className={`relative text-white/90 font-bold text-lg px-1 transition-colors duration-200 hover:text-primary`}
                >
                  {item}
                </button>
              );
            }
            if (item === 'Manual') {
              return (
                <button
                  key={item}
                  onClick={onShowAddForm}
                  className={`relative text-white/90 font-bold text-lg px-1 transition-colors duration-200 hover:text-primary`}
                >
                  {item}
                </button>
              );
            }
            return (
              <a
                key={item}
                href="#"
                className={`relative text-white/90 font-bold text-lg px-1 transition-colors duration-200 ${idx === 0 ? 'after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-primary after:rounded-full after:content-[\'\']' : 'hover:text-primary'}`}
              >
                {item}
              </a>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-6">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar..."
          className="px-4 py-2 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary w-40 md:w-64 transition"
        />
        <button className="text-white/80 hover:text-primary transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </button>
        <button className="flex items-center gap-2 text-white/90 font-bold uppercase tracking-wide hover:text-primary transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>
          <span className="hidden md:inline">MINHA CONTA</span>
        </button>
        {isLoggedIn && (
          <button onClick={handleLogout} className="text-white/80 hover:text-red-400 transition-colors font-bold">Logout</button>
        )}
      </div>
    </header>
  );
}