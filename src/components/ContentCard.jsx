import React from 'react';
import { useContent } from '../context/ContentContext';

export default function ContentCard({ item }) {
  const { favorites, toggleFavorite, openItemModal } = useContent();
  const isFav = favorites.includes(item.id);

  return (
    <div className="glass-card rounded-[24px] overflow-hidden group relative hover:shadow-[0px_8px_32px_rgba(124,58,237,0.3)] border border-white/10 hover:border-purple-500/40 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between">
      {/* Banner / Poster Section */}
      <div className="h-44 w-full relative overflow-hidden bg-zinc-900">
        {item.bannerUrl ? (
          <img
            src={item.bannerUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/60 to-zinc-900 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-purple-400">movie</span>
          </div>
        )}

        <div className="absolute inset-0 vignette-overlay" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 bg-[#181622]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
          <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
            {item.category}
          </span>
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isFav
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-black/40 text-zinc-400 hover:text-white border border-white/10'
          }`}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <span
            className="material-symbols-outlined text-[18px] block"
            style={{ fontVariationSettings: `'FILL' ${isFav ? 1 : 0}` }}
          >
            favorite
          </span>
        </button>

        {/* Rating badge */}
        {item.rating && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-xs font-semibold text-amber-300">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            {item.rating}
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            {item.year || '2024'}
          </span>
          {item.duration && <span>{item.duration}</span>}
        </div>

        {/* Open / Watch CTA Button */}
        <button
          onClick={() => openItemModal(item)}
          className="w-full mt-1 bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-semibold text-xs py-2.5 rounded-xl border border-purple-500/40 hover:border-purple-400 transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(124,58,237,0.2)]"
        >
          <span>Open</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
