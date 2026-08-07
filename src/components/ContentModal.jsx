import React from 'react';
import { useContent } from '../context/ContentContext';

export default function ContentModal() {
  const { activeModalItem, closeModalModal, favorites, toggleFavorite } = useContent();

  if (!activeModalItem) return null;
  const isFav = favorites.includes(activeModalItem.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#181622] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <span className="bg-purple-600/30 text-purple-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase border border-purple-500/30">
              {activeModalItem.category}
            </span>
            <h2 className="font-bold text-lg text-white truncate max-w-md">
              {activeModalItem.title}
            </h2>
          </div>
          <button
            onClick={closeModalModal}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Video Player / Stream Frame */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {activeModalItem.embedUrl ? (
            <iframe
              src={activeModalItem.embedUrl}
              title={activeModalItem.title}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <span className="material-symbols-outlined text-6xl text-purple-400 mb-3 animate-pulse">
                play_circle
              </span>
              <p className="text-sm font-semibold text-zinc-300">Live Streaming Ready</p>
              <a
                href={activeModalItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all"
              >
                Open External Stream Link
              </a>
            </div>
          )}
        </div>

        {/* Modal Info Footer */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white">{activeModalItem.title}</h3>
              <p className="text-xs text-zinc-400 mt-1">
                {activeModalItem.genre} • {activeModalItem.year} • {activeModalItem.duration || 'HD'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleFavorite(activeModalItem.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isFav
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: `'FILL' ${isFav ? 1 : 0}` }}
                >
                  favorite
                </span>
                {isFav ? 'Favorited' : 'Add Favorite'}
              </button>

              {activeModalItem.url && (
                <a
                  href={activeModalItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-[0_4px_14px_rgba(124,58,237,0.4)]"
                >
                  <span>Visit Direct Provider</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
              )}
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed">
            {activeModalItem.description}
          </p>
        </div>
      </div>
    </div>
  );
}
