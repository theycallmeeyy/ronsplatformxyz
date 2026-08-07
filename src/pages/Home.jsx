import React from 'react';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import ContentCard from '../components/ContentCard';

export default function Home() {
  const {
    filteredItems,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    watchHistory,
    openItemModal
  } = useContent();
  const { setCurrentRoute } = useAuth();

  const categories = [
    'All',
    'Movies',
    'TV Shows',
    'Anime',
    'Manga',
    'Live TV',
    'Sports',
    'Apps'
  ];

  return (
    <div className="pt-24 md:pt-28 px-5 md:px-12 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden glass-card p-8 md:p-12 min-h-[300px] flex flex-col justify-center items-center text-center border border-white/10 shadow-[0_8px_32px_rgba(124,58,237,0.15)]">
        <div className="absolute inset-0 hero-glow opacity-60 pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Ronkws <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-purple-400">
              Your Streaming Everything
            </span>
          </h1>
          <p className="text-sm md:text-base text-zinc-300 font-normal">
            Discover movies, TV shows, anime, manga, live TV, apps, and sports all in one seamless place.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setCurrentRoute('search')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm py-3 px-8 rounded-full transition-all shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.6)] active:scale-95"
            >
              Explore Now
            </button>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1 hover:shadow-[0px_8px_24px_rgba(124,58,237,0.2)] transition-all border border-white/10">
          <span className="material-symbols-outlined text-purple-400 text-3xl mb-1">language</span>
          <span className="font-extrabold text-xl md:text-2xl text-white">15K+</span>
          <span className="text-[10px] md:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Sites</span>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1 hover:shadow-[0px_8px_24px_rgba(124,58,237,0.2)] transition-all border border-white/10">
          <span className="material-symbols-outlined text-purple-300 text-3xl mb-1">category</span>
          <span className="font-extrabold text-xl md:text-2xl text-white">42</span>
          <span className="text-[10px] md:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Categories</span>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1 hover:shadow-[0px_8px_24px_rgba(124,58,237,0.2)] transition-all border border-white/10">
          <span className="material-symbols-outlined text-indigo-300 text-3xl mb-1">public</span>
          <span className="font-extrabold text-xl md:text-2xl text-white">120+</span>
          <span className="text-[10px] md:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Regions</span>
        </div>
      </section>

      {/* Search Bar & Filters */}
      <section className="space-y-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for movies, TV shows, anime, platforms..."
            className="w-full bg-[#181622]/80 border border-white/15 rounded-full py-3.5 pl-12 pr-4 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-md transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="overflow-x-auto hide-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
          <div className="flex gap-2.5 min-w-max pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_4px_14px_rgba(124,58,237,0.4)] scale-105'
                    : 'glass-card text-zinc-300 hover:text-white hover:border-purple-500/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Continue Watching Section */}
      {watchHistory.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400">play_circle</span>
              Continue Watching
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-3">
            {watchHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  const fullItem = filteredItems.find((i) => i.id === item.id);
                  if (fullItem) openItemModal(fullItem);
                }}
                className="shrink-0 w-64 glass-card rounded-2xl p-3 border border-white/10 hover:border-purple-500/40 cursor-pointer transition-all group"
              >
                <div className="h-32 rounded-xl overflow-hidden relative mb-2 bg-zinc-900">
                  <img src={item.bannerUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-4xl text-white">play_arrow</span>
                  </div>
                </div>
                <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Content Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400">grid_view</span>
            {selectedCategory === 'All' ? 'Featured Streaming Hub' : `${selectedCategory} Collection`}
          </h2>
          <span className="text-xs text-zinc-400">{filteredItems.length} items available</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl p-8 border border-white/10">
            <span className="material-symbols-outlined text-5xl text-zinc-500 mb-2">search_off</span>
            <h3 className="text-lg font-bold text-white">No content found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              No streaming items matched your search query or selected category.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-full"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
