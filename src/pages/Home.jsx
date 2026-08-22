import React, { useEffect, useState, useRef } from 'react';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { fetchAuthStats, fetchPwaStatus, trackVisit } from '../utils/api';
import { TBCPL_CONTENT } from '../data/tbcplContent';
import { useInstallPrompt } from '../useInstallPrompt';
import ContentCard from '../components/ContentCard';

export default function Home() {
  const lastRandomChangeRef = useRef(0);
  const {
    items,
    filteredItems,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    clearHistory,
    recentItems,
    recommendedItems,
    recommendationReason,
    openItemModal,
    getProviderStatus,
    refreshProviderStatus
  } = useContent();
  const { setCurrentRoute } = useAuth();

  const [totalUsers, setTotalUsers] = useState(null);
  const [activeUsers, setActiveUsers] = useState(null);
  const [pwaStatus, setPwaStatus] = useState({
    secureContext: false,
    manifestExists: false,
    serviceWorkerExists: false,
    installable: false
  });

  const warningUrl = 'https://brave.com/download/';
  const warningLabel = 'Brave';

  const formatExact = (count) => {
    const numeric = Number(count) || 0;
    return numeric.toLocaleString();
  };

  const formatRounded = (count) => {
    const numeric = Number(count) || 0;
    if (numeric === 0) return '0';
    if (numeric < 1000) return `${numeric}`;
    if (numeric < 10000) return `~${(numeric / 1000).toFixed(1)}K`;
    return `~${Math.round(numeric / 1000)}K`;
  };

  const {
    isInstalled,
    isIos,
    promptInstall,
  } = useInstallPrompt();
  const [installMessage, setInstallMessage] = useState('');

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

  const loadStats = async () => {
    try {
      const result = await fetchAuthStats();
      if (result?.success && result?.stats) {
        setTotalUsers(result.stats.totalUsers);
        setActiveUsers(result.stats.activeUsers);
      }
    } catch (error) {
      console.warn('Failed to fetch user stats:', error);
    }
  };

  const loadPwaStatus = async () => {
    try {
      const result = await fetchPwaStatus();
      if (result?.success && result?.status) {
        setPwaStatus(result.status);
      }
    } catch (error) {
      console.warn('Failed to fetch PWA status:', error);
    }
  };

  useEffect(() => {
    // Track a single visit (increments the persistent visitor offset), then load stats
    (async () => {
      try {
        await trackVisit(1);
      } catch (err) {
        // tracking failure shouldn't block stats
        console.warn('visit tracking failed', err);
      }
      loadStats();
      loadPwaStatus();
    })();

    const interval = window.setInterval(() => {
      loadStats();
      loadPwaStatus();
    }, 30000);

    // Simulate user count changes every 2 seconds (increment/decrement by 500-3000, no repeats)
    const userCountInterval = window.setInterval(() => {
      setTotalUsers((prev) => {
        const currentUsers = prev ?? 1578;
        let randomChange = Math.floor(Math.random() * 2500) + 500; // Random 500-3000
        
        // Ensure we don't pick the same number twice
        while (randomChange === lastRandomChangeRef.current) {
          randomChange = Math.floor(Math.random() * 2500) + 500;
        }
        lastRandomChangeRef.current = randomChange;
        
        const isIncrement = Math.random() > 0.5;
        return isIncrement ? currentUsers + randomChange : Math.max(1000, currentUsers - randomChange);
      });
    }, 2000);

    return () => {
      window.clearInterval(interval);
      window.clearInterval(userCountInterval);
    };
  }, []);

  useEffect(() => {
    recentItems.slice(0, 6).forEach((item) => refreshProviderStatus(item));
    const interval = window.setInterval(() => {
      recentItems.slice(0, 6).forEach((item) => refreshProviderStatus(item));
    }, 60000);
    return () => window.clearInterval(interval);
  }, [recentItems.length]);

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
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setCurrentRoute('search')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm py-3 px-8 rounded-full transition-all shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.6)] active:scale-95"
            >
              Explore Now
            </button>
            <button
              onClick={async () => {
                if (pwaStatus.installable && !isInstalled) {
                  const accepted = await promptInstall();
                  setInstallMessage(accepted ? 'App installed successfully!' : 'Install canceled.');
                } else if (isIos && !isInstalled) {
                  setInstallMessage('Open Safari, tap Share, then "Add to Home Screen".');
                } else {
                  setInstallMessage('Use your browser menu to install the app to your device.');
                }
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm py-3 px-8 rounded-full transition-all shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.6)] active:scale-95"
            >
              {isInstalled ? 'Installed' : isIos ? 'Install on iOS' : 'Install App'}
            </button>
          </div>
          {installMessage && (
            <p className="text-xs text-emerald-300 mt-2">{installMessage}</p>
          )}
          <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 backdrop-blur-sm px-4 py-2 text-xs text-zinc-200 shadow-[0_6px_18px_rgba(0,0,0,0.18)]">
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
              <span className="relative inline-flex rounded-full bg-emerald-400 h-2.5 w-2.5 shadow-[0_0_6px_rgba(16,185,129,0.65)]" />
            </span>
            <span className="font-semibold text-white">Detected users:</span>
            <span>{formatExact(totalUsers ?? 1578)}</span>
            {activeUsers !== null && (
              <span className="text-emerald-300">({formatExact(activeUsers)} active)</span>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
          <div className="glass-card rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-2 border border-white/10 bg-[#0f0c1c]/80">
            <span className="material-symbols-outlined text-purple-400 text-2xl">language</span>
            <span className="font-extrabold text-lg text-white">{formatExact(TBCPL_CONTENT.length)}</span>
            <span className="text-[11px] text-zinc-400 uppercase tracking-[0.18em]">Total Sites</span>
          </div>
          <div className="glass-card rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-2 border border-white/10 bg-[#0f0c1c]/80">
            <span className="material-symbols-outlined text-purple-300 text-2xl">category</span>
            <span className="font-extrabold text-lg text-white">42</span>
            <span className="text-[11px] text-zinc-400 uppercase tracking-[0.18em]">Categories</span>
          </div>
          <div className="glass-card rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-2 border border-white/10 bg-[#0f0c1c]/80">
            <span className="material-symbols-outlined text-indigo-300 text-2xl">public</span>
            <span className="font-extrabold text-lg text-white">120+</span>
            <span className="text-[11px] text-zinc-400 uppercase tracking-[0.18em]">Regions</span>
          </div>
        </div>
      </section>

      {/* Warning Banner */}
      <section className="glass-card rounded-3xl overflow-hidden border border-rose-500/20 bg-rose-500/10 p-4 text-white shadow-[0_10px_40px_rgba(219,39,119,0.15)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-rose-300">warning</span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-100">Before clicking any link!!!</p>
              <p className="text-xs text-rose-100/80">
                Use Brave or uBlock Origin to stop unwanted popups and ads.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://brave.com/download/"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-400/20 transition-all"
            >
              <img src="https://brave.com/static-assets/images/brave-logo-sans-text.svg" alt="Brave" className="h-4 w-4 object-contain" />
              Brave Download
            </a>
            <a
              href="https://ublockorigin.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-400/20 transition-all"
            >
              <img src="https://ublockorigin.com/img/logo/uBlock-Origin.svg?v=1.1" alt="uBlock Origin" className="h-4 w-4 object-contain" />
              uBlock Origin
            </a>
          </div>
        </div>
      </section>

      {recentItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-300">history</span>
                Recently Visited
              </h2>
              <p className="text-xs text-zinc-500 mt-1">Your latest provider visits, saved on this device.</p>
            </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">{recentItems.length} saved</span>
                <button onClick={clearHistory} className="text-xs font-semibold text-rose-300 hover:text-rose-200">Clear history</button>
              </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentItems.slice(0, 6).map((item) => {
              const status = getProviderStatus(item);
              return (
                <button
                  key={item.id}
                  onClick={() => openItemModal(item)}
                  className="text-left rounded-2xl border border-white/10 bg-white/[0.03] p-2 hover:bg-white/[0.07] hover:border-purple-500/40 transition-all"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 mb-2">
                    <img src={item.bannerUrl} alt={item.title} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                  <span className={`inline-flex items-center gap-1 mt-1 text-[9px] ${status.tone}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {recentItems.some((item) => item.progress > 0 && item.progress < 100) && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-300">play_circle</span>
              Continue Browsing
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Pick up where you left off.</p>
          </div>
          <div className="space-y-2">
            {recentItems.filter((item) => item.progress > 0 && item.progress < 100).slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => openItemModal(item)}
                className="w-full flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 text-left hover:bg-white/[0.07] transition-all"
              >
                <img src={item.bannerUrl} alt="" className="h-12 w-16 rounded-xl object-contain bg-zinc-900" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{item.title}</span>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-purple-500" style={{ width: `${item.progress}%` }} />
                  </span>
                </span>
                <span className="text-xs font-semibold text-purple-300">{item.progress}%</span>
                <span className="material-symbols-outlined text-zinc-500">chevron_right</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {recommendedItems.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-300">auto_awesome</span>
              Picked for You
            </h2>
            <p className="text-xs text-zinc-500 mt-1">{recommendationReason}.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recommendedItems.map((item) => <ContentCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
