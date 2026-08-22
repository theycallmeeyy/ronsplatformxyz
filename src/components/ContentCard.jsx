import React from 'react';
import { useContent } from '../context/ContentContext';

export default function ContentCard({ item }) {
  const { favorites, toggleFavorite, openItemModal } = useContent();
  const isFav = favorites.includes(item.id);
  const isLogoBanner = item.bannerUrl?.includes('/logo/') || item.bannerUrl?.includes('/socials/') || item.bannerUrl?.includes('/logo');
  const ratingValue = Number(item.rating) || 0;

  return (
    <div className="rounded-2xl sm:rounded-[20px] overflow-hidden group relative border border-white/10 bg-[#0d0b14] shadow-[0_10px_24px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(79,63,218,0.18)]">
      <div className={`relative w-full aspect-[4/3] sm:aspect-square overflow-hidden ${isLogoBanner ? 'bg-zinc-950 flex items-center justify-center p-2 sm:p-4' : 'bg-zinc-900'}`}>
        {item.bannerUrl ? (
          <img
            src={item.bannerUrl}
            alt={item.title}
            className={`w-full h-full ${isLogoBanner ? 'object-contain opacity-90' : 'object-cover group-hover:scale-105 opacity-100'} transition-transform duration-500`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-zinc-900 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-purple-400">movie</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="p-2 sm:p-4 flex flex-col gap-1.5 sm:gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] uppercase tracking-[0.24em] text-zinc-400 font-semibold">
            {item.category}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
            className={`rounded-full p-1.5 sm:p-2 transition-all ${
              isFav
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span
              className="material-symbols-outlined text-[14px] sm:text-[16px]"
              style={{ fontVariationSettings: `'FILL' ${isFav ? 1 : 0}` }}
            >
              favorite
            </span>
          </button>
        </div>

        <div>
          <h3 className="font-semibold text-xs sm:text-sm text-white line-clamp-2">
            {item.title}
          </h3>
          <p className="text-[9px] sm:text-[11px] text-zinc-400 mt-1 sm:mt-2 line-clamp-2 leading-tight">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 text-yellow-400">
              {Array.from({ length: 5 }).map((_, idx) => {
                const starVal = idx + 1;
                return (
                  <span key={idx} className="material-symbols-outlined text-[11px] sm:text-[14px] text-zinc-500">star</span>
                );
              })}
            </div>
            <div className="text-[8px] sm:text-xs leading-tight text-zinc-400 ml-1 sm:ml-2">Rating available in preview</div>
          </div>
        </div>

        

        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            {item.year || '2024'}
          </span>
          {item.duration && <span>{item.duration}</span>}
        </div>

        <button
          onClick={() => openItemModal(item)}
          className="w-full bg-purple-600/90 hover:bg-purple-500 text-white font-semibold text-[10px] sm:text-[11px] py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all"
        >
          Open
        </button>
      </div>
    </div>
  );
}
