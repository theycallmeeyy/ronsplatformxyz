import React from 'react';
import { useContent } from '../context/ContentContext';

export default function ContentCard({ item }) {
  const { favorites, toggleFavorite, openItemModal } = useContent();
  const isFav = favorites.includes(item.id);

  return (
    <div className="rounded-[24px] overflow-hidden group relative border border-white/10 bg-[#0d0b14] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(79,63,218,0.22)]">
      <div className="h-28 w-full overflow-hidden bg-zinc-900">
        {item.bannerUrl ? (
          <img
            src={item.bannerUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-zinc-900 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-purple-400">movie</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-400 font-semibold">
            {item.category}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
            className={`rounded-full p-2 transition-all ${
              isFav
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: `'FILL' ${isFav ? 1 : 0}` }}
            >
              favorite
            </span>
          </button>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-white line-clamp-2">
            {item.title}
          </h3>
          <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            {item.year || '2024'}
          </span>
          {item.duration && <span>{item.duration}</span>}
        </div>

        <button
          onClick={() => openItemModal(item)}
          className="w-full bg-purple-600/90 hover:bg-purple-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all"
        >
          Open
        </button>
      </div>
    </div>
  );
}
