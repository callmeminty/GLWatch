import React from 'react';

interface HeroBannerProps {
  backgroundUrl: string;
  title: string;
  subtitle?: string;
  onWatch?: () => void;
  onAddToWatchLater?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  backgroundUrl,
  title,
  subtitle,
  onWatch,
  onAddToWatchLater,
}) => (
  <section className="relative w-full h-[60vh] min-h-[400px] flex items-end justify-start overflow-hidden">
    <img
      src={backgroundUrl}
      alt={title}
      className="absolute inset-0 w-full h-full object-cover object-center z-0"
      draggable={false}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10" />
    <div className="relative z-20 px-12 pb-16 max-w-4xl">
      {subtitle && <span className="block mb-2 text-base md:text-lg font-bold tracking-widest text-white/80 uppercase montserrat drop-shadow">{subtitle}</span>}
      <h1 className="montserrat text-6xl md:text-7xl font-extrabold uppercase text-[#FFB800] drop-shadow mb-8 tracking-tight" style={{letterSpacing: '-0.04em'}}>
        {title}
      </h1>
      <div className="flex gap-4">
        <button
          onClick={onWatch}
          className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#FFB800] text-black text-lg font-bold montserrat shadow-lg hover:bg-yellow-400 transition tracking-wide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-5.197-3.027A1 1 0 008 9.027v5.946a1 1 0 001.555.832l5.197-3.027a1 1 0 000-1.664z" /></svg>
          Assistir Filme
        </button>
        <button
          onClick={onAddToWatchLater}
          className="flex items-center gap-2 px-8 py-3 rounded-full bg-secondary text-white/80 text-lg font-bold montserrat shadow-lg hover:bg-secondary/80 border border-white/10 transition tracking-wide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Adicionar a ver depois
        </button>
      </div>
    </div>
  </section>
);

export default HeroBanner; 