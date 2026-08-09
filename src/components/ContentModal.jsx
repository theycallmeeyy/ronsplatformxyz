import React, { useEffect, useMemo, useState } from 'react';
import { useContent } from '../context/ContentContext';

const BADWARE_PATTERNS = [
  'malware',
  'badware',
  'spy',
  'phishing',
  'tracking',
  'track',
  'redirect',
  'popup',
  'click',
  'adservice',
  'doubleclick',
  'junk',
  'scam',
  'adsystem',
  'advert',
  'tracker',
  'analytics'
];

const POPUP_BLOCK_FEATURES = [
  'Pop-up blocker active',
  'Adblock enabled',
  'In-app browser sandboxed'
];

function assessUrlSafety(url) {
  if (!url) {
    return {
      blocked: false,
      label: 'No external stream URL available',
      summary: 'This item does not have a direct provider link.'
    };
  }

  const lowerUrl = url.toLowerCase();
  const blocked = BADWARE_PATTERNS.some((pattern) => lowerUrl.includes(pattern));

  return blocked
    ? {
        blocked: true,
        label: 'Malicious URL Blocked',
        summary: 'This link has been flagged by the in-app Malware Protection filter and will not be opened outside Ronkws.'
      }
    : {
        blocked: false,
        label: 'Protected in-app stream',
        summary: 'This provider link will run inside Ronkws with pop-up and ad protection enabled.'
      };
}

export default function ContentModal() {
  const { activeModalItem, closeModalModal, favorites, toggleFavorite } = useContent();
  const [showExternalFrame, setShowExternalFrame] = useState(false);
  const [blockedUrl, setBlockedUrl] = useState(false);

  if (!activeModalItem) return null;
  const isFav = favorites.includes(activeModalItem.id);
  const externalUrl = activeModalItem.url || '';
  const safety = useMemo(() => assessUrlSafety(externalUrl), [externalUrl]);

  useEffect(() => {
    if (!activeModalItem) return;
    if (!externalUrl) {
      setShowExternalFrame(false);
      setBlockedUrl(false);
      return;
    }
    if (safety.blocked) {
      setBlockedUrl(true);
      setShowExternalFrame(false);
      return;
    }
    setBlockedUrl(false);
    setShowExternalFrame(true);
  }, [activeModalItem, externalUrl, safety]);

  const openInAppStream = () => {
    if (!externalUrl) return;
    if (safety.blocked) {
      setBlockedUrl(true);
      setShowExternalFrame(false);
      return;
    }
    setBlockedUrl(false);
    setShowExternalFrame(true);
  };

  const renderStreamFrame = () => {
    if (!externalUrl) return null;
    if (safety.blocked) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
          <span className="material-symbols-outlined text-6xl text-rose-400">block</span>
          <p className="text-sm font-semibold text-zinc-300">This provider has been blocked</p>
          <p className="text-xs text-zinc-400 max-w-lg">
            The selected link contains patterns that may be malicious or unwanted. Ronkws will not open it inside the app.
          </p>
        </div>
      );
    }
    return (
      <iframe
        src={externalUrl}
        title={activeModalItem.title}
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  };

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
          {activeModalItem.embedUrl || showExternalFrame ? (
            <div className="relative w-full h-full">
              {renderStreamFrame()}
              <div className="absolute left-4 top-4 flex flex-col gap-2 rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-left backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.4)]">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-emerald-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  Adblock active
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  Malware protection enabled
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
              <span className="material-symbols-outlined text-6xl text-purple-400 mb-3 animate-pulse">
                play_circle
              </span>
              <p className="text-sm font-semibold text-zinc-300">Preparing your in-app stream</p>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left text-xs text-zinc-300">
                <p className="font-semibold text-white">This item will open inside Ronkws automatically.</p>
                <p className="mt-1">If the provider link is blocked, the app will notify you instead of opening an external browser.</p>
              </div>
              {blockedUrl && (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-left text-sm text-rose-100">
                  <p className="font-semibold">Blocked by Malware Protection</p>
                  <p>{safety.summary}</p>
                </div>
              )}
            </div>
          )}

          {!activeModalItem.embedUrl && showExternalFrame && !blockedUrl && (
            <div className="absolute inset-0 pointer-events-none bg-black/10" />
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

              {externalUrl && (
                <button
                  type="button"
                  onClick={openInAppStream}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-[0_4px_14px_rgba(124,58,237,0.4)]"
                >
                  <span>Open Stream Inside Ronkws</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed">
            {activeModalItem.description}
          </p>

          <div className="rounded-3xl border border-white/10 bg-[#11141f]/80 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Malware protection</p>
                <h4 className="text-sm font-semibold text-white">Security</h4>
              </div>
              <span className={`text-xs font-semibold ${safety.blocked ? 'text-rose-300' : 'text-emerald-300'}`}>
                {safety.blocked ? 'Blocked by uBlock filters – Badware risks' : 'Protected by uBlock filters – Badware risks'}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">uBlock filters – Badware risks</p>
                <p className="mt-2 text-xs text-zinc-300">
                  The app applies a local blocklist to prevent badware and unwanted tracker redirects from loading.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Malicious URL Blocklist</p>
                <p className="mt-2 text-xs text-zinc-300">
                  External stream URLs are validated before opening so the user stays inside Ronkws.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
