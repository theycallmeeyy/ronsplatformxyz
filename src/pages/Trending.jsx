import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';

export default function Trending() {
  const { isAdmin } = useAuth();
  const { items, openItemModal, toggleTrending, toggleRecommended } = useContent();

  const trendingItems = items.filter((i) => i.isTrending || i.rank || i.isRecommended);
  const topTrendingItem = items.find((item) => item.isTrending) || items[0];

  return (
    <div className="pt-24 md:pt-28 px-5 md:px-12 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Page Title */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
              Trending Now
            </h1>
            <p className="text-sm text-zinc-400">Discover what everyone is watching today across all platforms.</p>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-xs uppercase tracking-[0.24em] text-amber-300 font-semibold bg-amber-500/10 px-3 py-2 rounded-full border border-amber-500/20">
                Admin Controls Active
              </span>
              <button
                onClick={() => topTrendingItem && toggleTrending(topTrendingItem.id)}
                disabled={!topTrendingItem}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2 rounded-2xl shadow-[0_4px_14px_rgba(124,58,237,0.4)] transition-all disabled:bg-white/10 disabled:text-zinc-400"
              >
                Toggle Top Trending
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Most Visited Horizontal Carousel */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-500" style={{ fontVariationSettings: "'FILL' 1" }}>
            local_fire_department
          </span>
          Top Ranked Highlights
        </h2>

        <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar -mx-5 px-5 md:mx-0 md:px-0 snap-x snap-mandatory">
          {trendingItems.slice(0, 5).map((item, index) => (
            <div
              key={item.id}
              onClick={() => openItemModal(item)}
              className="snap-center shrink-0 w-[280px] h-[400px] glass-card relative overflow-hidden group cursor-pointer rounded-[28px] border border-white/10 hover:border-purple-500/50 hover:shadow-[0_8px_32px_rgba(124,58,237,0.4)] transition-all duration-500"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.bannerUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14121d] via-[#14121d]/40 to-transparent" />

              <div className="absolute bottom-0 left-0 p-6 w-full space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-widest text-white shadow-md ${
                      index === 0
                        ? 'bg-purple-600 shadow-purple-600/50'
                        : index === 1
                        ? 'bg-indigo-600 shadow-indigo-600/50'
                        : 'bg-zinc-700'
                    }`}
                  >
                    #{index + 1}
                  </span>
                  <span className="text-xs font-semibold text-purple-300">{item.category}</span>
                </div>

                <h3 className="font-extrabold text-xl text-white line-clamp-2 leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-300">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  {item.rating} • {item.views} Views
                </div>
                {item.isRecommended && (
                  <span className="inline-flex items-center gap-1 uppercase text-[10px] tracking-[0.2em] text-white bg-slate-900/80 px-2 py-1 rounded-full mt-2">
                    <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                    Recommended
                  </span>
                )}
                {isAdmin && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleTrending(item.id);
                      }}
                      className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full transition-all"
                    >
                      {item.isTrending ? 'Untrend' : 'Trend'}
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleRecommended(item.id);
                      }}
                      className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white bg-zinc-800/80 hover:bg-zinc-700 px-3 py-2 rounded-full transition-all"
                    >
                      {item.isRecommended ? 'Unrecommend' : 'Recommend'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Today Vertical List */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-400">trending_up</span>
          Popular Today
        </h2>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => openItemModal(item)}
              className="glass-card p-4 flex items-center gap-4 rounded-[24px] cursor-pointer hover:bg-purple-900/20 border border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shrink-0 relative bg-zinc-900">
                <img
                  src={item.bannerUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-base md:text-lg text-white group-hover:text-purple-300 transition-colors truncate">
                  {item.title}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
                  <span className="flex items-center gap-1 text-amber-300 font-semibold">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    {item.rating}
                  </span>
                  <span>•</span>
                  <span>{item.category}</span>
                  <span>•</span>
                  <span>{item.views || '1.1M'} views</span>
                  {item.isRecommended && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-white bg-slate-900/80 px-2 py-1 rounded-full">
                      <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-1 hidden md:block">
                  {item.description}
                </p>
                {isAdmin && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleTrending(item.id);
                      }}
                      className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full transition-all"
                    >
                      {item.isTrending ? 'Untrend' : 'Trend'}
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleRecommended(item.id);
                      }}
                      className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white bg-zinc-800/80 hover:bg-zinc-700 px-3 py-2 rounded-full transition-all"
                    >
                      {item.isRecommended ? 'Unrecommend' : 'Recommend'}
                    </button>
                  </div>
                )}
              </div>

              <button className="p-2 text-purple-300 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-2xl">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
