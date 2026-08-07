import React, { useEffect, useState } from 'react';
import { useContent } from '../context/ContentContext';
import ContentCard from '../components/ContentCard';

export default function SearchPage() {
  const {
    filteredItems,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy
  } = useContent();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    if (drawerVisible) {
      const frame = requestAnimationFrame(() => setDrawerOpen(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [drawerVisible]);

  const handleDrawerTransitionEnd = (event) => {
    if (event.propertyName !== 'transform') return;
    if (!drawerOpen) {
      setDrawerVisible(false);
    }
  };

  const categories = ['All', 'Movies', 'TV Shows', 'Anime', 'Manga', 'Live TV', 'Sports', 'Apps'];

  return (
    <div className="pt-24 md:pt-28 px-5 md:px-12 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Search Header */}
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Search & Discover
        </h1>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, genre, category, platform..."
            className="w-full bg-[#181622] border border-white/15 rounded-2xl py-4 pl-12 pr-12 text-white text-base placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-xl"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 md:hidden">
          <p className="text-xs text-zinc-400">
            Found <span className="text-purple-300 font-bold">{filteredItems.length}</span> results
          </p>
          <button
            onClick={openDrawer}
            className="rounded-2xl bg-purple-600 px-4 py-3 text-xs font-semibold text-white hover:bg-purple-500 transition"
          >
            Open Filters
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-[320px_1fr]">
        <aside className="hidden md:block glass-panel rounded-3xl border border-white/10 p-6 shadow-[0_8px_32px_rgba(124,58,237,0.12)] md:sticky md:top-28">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Search Hub</p>
              <h2 className="text-2xl font-bold text-white">Find your next stream</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Categories</span>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-xs font-semibold text-purple-300 hover:text-white"
                >
                  Reset
                </button>
              </div>
              <div className="grid gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-purple-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.25)]'
                        : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#181622] border border-white/15 text-white text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="hidden md:flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-400">
              Found <span className="text-purple-300 font-bold">{filteredItems.length}</span> results
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-xs text-purple-300 font-semibold hover:text-white"
            >
              Clear Filters
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-3xl p-8 border border-white/10">
              <span className="material-symbols-outlined text-6xl text-zinc-500 mb-3">search_off</span>
              <h3 className="text-xl font-bold text-white mb-1">No matching results</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mb-4">
                We couldn't find anything for "{searchQuery}". Try searching for popular terms like "Netflix", "Sci-Fi", "Anime", or "Marvel".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="bg-purple-600 text-white text-xs font-semibold px-5 py-2.5 rounded-full"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {drawerVisible && (
        <div className="fixed inset-0 z-50 bg-black/70 md:hidden transition-opacity duration-300" aria-hidden={!drawerOpen}>
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-sm glass-panel rounded-l-3xl border border-white/10 bg-[#0f0b18] p-6 overflow-auto shadow-[0_24px_80px_rgba(0,0,0,0.65)] transition-transform duration-300 ease-out ${
              drawerOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
            onTransitionEnd={handleDrawerTransitionEnd}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Filters</p>
                <h2 className="text-2xl font-bold text-white">Search Controls</h2>
              </div>
              <button
                onClick={closeDrawer}
                className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 transition"
              >
                Close
              </button>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, genre, category, platform..."
                  className="w-full bg-[#181622] border border-white/15 rounded-2xl py-4 pl-12 pr-12 text-white text-base placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-xl"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Categories</span>
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="text-xs font-semibold text-purple-300 hover:text-white"
                  >
                    Reset
                  </button>
                </div>
                <div className="grid gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                        selectedCategory === cat
                          ? 'bg-purple-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.25)]'
                          : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#181622] border border-white/15 text-white text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
