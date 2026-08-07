import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';

export default function Favorites() {
  const { favoriteItems, toggleFavorite, openItemModal } = useContent();
  const { setCurrentRoute } = useAuth();
  const [favSearch, setFavSearch] = useState('');

  const filteredFavs = favoriteItems.filter((item) =>
    item.title.toLowerCase().includes(favSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(favSearch.toLowerCase())
  );

  return (
    <div className="pt-24 md:pt-28 px-5 md:px-12 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
            My Favorites
          </h1>
          <p className="text-sm text-zinc-400">Manage your saved services and platforms.</p>
        </div>

        {favoriteItems.length > 0 && (
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
              search
            </span>
            <input
              type="text"
              value={favSearch}
              onChange={(e) => setFavSearch(e.target.value)}
              placeholder="Search favorites..."
              className="w-full bg-[#181622] border border-white/10 rounded-full py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}
      </section>

      {/* Grid or Empty State */}
      {filteredFavs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-card rounded-3xl border border-white/10">
          <div className="w-24 h-24 mb-6 rounded-full bg-purple-900/20 border border-purple-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.2)]">
            <span className="material-symbols-outlined text-5xl text-purple-400">heart_broken</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Favorites Saved</h3>
          <p className="text-sm text-zinc-400 max-w-md mb-6">
            You haven't saved any streaming platforms or shows yet. Explore trending content and build your custom watchlist!
          </p>
          <button
            onClick={() => setCurrentRoute('trending')}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm px-8 py-3 rounded-full shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all active:scale-95"
          >
            Explore Trending
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFavs.map((item) => (
            <article
              key={item.id}
              className="glass-card rounded-2xl overflow-hidden group relative hover:shadow-[0px_8px_32px_rgba(124,58,237,0.25)] border border-white/10 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="h-40 w-full relative bg-zinc-900 overflow-hidden">
                <img
                  src={item.bannerUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 vignette-overlay" />

                {/* Remove from favorites button */}
                <button
                  onClick={() => toggleFavorite(item.id)}
                  title="Remove from favorites"
                  className="absolute top-3 right-3 bg-black/60 backdrop-blur-md hover:bg-rose-600/30 hover:text-rose-400 transition-colors rounded-full p-2 text-zinc-300"
                >
                  <span className="material-symbols-outlined text-[20px] block">heart_broken</span>
                </button>
              </div>

              <div className="p-4 relative space-y-3">
                <div>
                  <h3 className="font-bold text-base text-white truncate">{item.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{item.category}</p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-xs font-semibold text-purple-300 bg-purple-600/20 px-2.5 py-1 rounded-md">
                    {item.genre || item.category}
                  </span>
                  <button
                    onClick={() => openItemModal(item)}
                    className="text-purple-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                  >
                    Open <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
