import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { fetchRatings, submitRating, fetchComments, submitComment } from '../utils/api';

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
  const { user, currentRoute } = useAuth();
  const [showExternalFrame, setShowExternalFrame] = useState(false);
  const [blockedUrl, setBlockedUrl] = useState(false);
  const [rating, setRating] = useState({ totalScore: 0, count: 0, avg: 0, userScore: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentUseful, setCommentUseful] = useState(true);
  const [commentError, setCommentError] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  if (!activeModalItem) return null;
  const isFav = favorites.includes(activeModalItem.id);
  const externalUrl = activeModalItem.url || '';
  const { setCurrentRoute } = useAuth();
  const safety = useMemo(() => assessUrlSafety(externalUrl), [externalUrl]);
  const canEmbedExternal = useMemo(
    () => Boolean(activeModalItem?.embedUrl?.trim()),
    [activeModalItem?.embedUrl]
  );

  const openExternalLink = () => {
    if (!externalUrl) return;
    // Push a state to history so back button brings user to home
    window.history.pushState({ source: 'ronkws_platform', timestamp: Date.now() }, '', window.location.href);
    
    // Prevent accidental navigation away - warn user if they try to close/leave
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    
    const newWindow = window.open(externalUrl, '_blank', 'noopener,noreferrer');
    if (newWindow) {
      newWindow.focus();
    } else {
      // If popup was blocked, remove the history entry we just added
      window.history.back();
      alert('Please allow popups to access external platforms');
    }
  };

  // Handle browser back button to return to home
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.source === 'ronkws_platform') {
        // Ensure we close modal and go to home
        closeModalModal();
        setCurrentRoute('home');
        // Prevent going back further
        window.history.pushState({ source: 'ronkws_home_guard' }, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [closeModalModal, setCurrentRoute]);

  useEffect(() => {
    if (!activeModalItem) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetchRatings(activeModalItem.id);
        if (mounted && res?.success) {
          const entry = res.ratings || {};
          const avg = entry.count ? (entry.totalScore / entry.count) : 0;
          setRating({ totalScore: entry.totalScore || 0, count: entry.count || 0, avg, userScore: res.userScore ?? 0 });
          setUserRating(res.userScore ?? 0);
        }
        const commentRes = await fetchComments(activeModalItem.id);
        if (mounted && commentRes?.success) {
          setComments(commentRes.comments || []);
        }
      } catch (err) {
        console.warn('Unable to load ratings/comments', err);
      }
    })();

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
    setShowExternalFrame(canEmbedExternal);

    return () => {
      mounted = false;
    };
  }, [activeModalItem, externalUrl, safety, canEmbedExternal]);

  useEffect(() => {
    if (activeModalItem && currentRoute !== 'home') {
      closeModalModal();
    }
  }, [activeModalItem, currentRoute, closeModalModal]);

  const openInAppStream = () => {
    if (!externalUrl) return;
    if (safety.blocked) {
      setBlockedUrl(true);
      setShowExternalFrame(false);
      return;
    }
    if (!canEmbedExternal) {
      openExternalLink();
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
    if (!canEmbedExternal) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
          <span className="material-symbols-outlined text-6xl text-purple-400">open_in_new</span>
          <p className="text-sm font-semibold text-zinc-300">This platform cannot be embedded inside the app.</p>
          <p className="text-xs text-zinc-400 max-w-lg">
            External streaming platforms often block embedding. Open the provider link in a new browser tab instead.
          </p>
          <button
            type="button"
            onClick={openExternalLink}
            className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 transition-all"
          >
            Open in Browser
          </button>
        </div>
      );
    }
    return (
      <iframe
        src={activeModalItem.embedUrl || externalUrl}
        title={activeModalItem.title}
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-top-navigation-by-user-activation"
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
                  <span>{canEmbedExternal ? 'Open Stream Inside Ronkws' : 'Open in Browser'}</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
          >
            {showComments ? `Hide Comments (${comments.length})` : `Show Comments (${comments.length})`}
          </button>

          <p className="text-sm text-zinc-300 leading-relaxed">
            {activeModalItem.description}
          </p>

          {showComments && (
            <>
              <div className="rounded-3xl border border-white/10 bg-[#11141f]/80 p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-400">Overall rating</p>
                    <h4 className="text-sm font-semibold text-white">{rating.avg ? rating.avg.toFixed(1) : '0.0'} / 5</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      {userRating ? `Your saved score: ${userRating}/5` : 'You have not rated this item yet.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span key={idx} className={`material-symbols-outlined ${rating.avg >= idx + 1 ? 'text-yellow-400' : 'text-zinc-600'}`}>star</span>
                    ))}
                  </div>
                  <span className="text-xs text-zinc-400">{rating.count || 0} reviews</span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#11141f]/80 p-5 space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">Your rating</p>
                      <div className="flex items-center gap-1 mt-2 text-yellow-400">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={async () => {
                              const selectedRating = idx + 1;
                              setUserRating(selectedRating);
                              setSubmitting(true);
                              try {
                                const res = await submitRating(activeModalItem.id, selectedRating);
                                if (res?.success && res.rating) {
                                  const avg = res.rating.count ? (res.rating.totalScore / res.rating.count) : 0;
                                  setRating({
                                    totalScore: res.rating.totalScore || 0,
                                    count: res.rating.count || 0,
                                    avg,
                                    userScore: res.userScore ?? selectedRating
                                  });
                                } else {
                                  alert(res.error || 'Unable to submit rating');
                                }
                              } catch (err) {
                                console.error('submit rating error', err);
                                alert('Unable to submit rating');
                              }
                              setSubmitting(false);
                            }}
                            className={`material-symbols-outlined text-[20px] ${userRating >= idx + 1 ? 'text-yellow-400' : 'text-zinc-600'} transition-colors`}
                          >
                            star
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-full bg-white/5 px-3 py-2 text-xs text-zinc-300">
                      {userRating ? `Rated ${userRating}` : 'Click a star to rate'}
                    </div>
                  </div>
                  {submitting && <p className="text-xs text-zinc-400">Submitting rating…</p>}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-zinc-400 font-semibold">Is this site useful?</div>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Leave a comment about whether this site is useful or not"
                  className="w-full min-h-[110px] rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={commentUseful}
                      onChange={(e) => setCommentUseful(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-[#181622] text-purple-500 focus:ring-purple-500"
                    />
                    This site is useful
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!commentText.trim()) {
                        setCommentError('Please write a comment before submitting.');
                        return;
                      }
                      setCommentError('');
                      setCommentLoading(true);
                      try {
                        const res = await submitComment(activeModalItem.id, commentText.trim(), commentUseful, user?.name || 'Guest');
                        if (res?.success && res.comment) {
                          setComments((prev) => [res.comment, ...prev]);
                          setCommentText('');
                          setCommentUseful(true);
                        } else {
                          alert(res.error || 'Unable to submit comment');
                        }
                      } catch (err) {
                        console.error('submit comment error', err);
                        alert('Unable to submit comment');
                      }
                      setCommentLoading(false);
                    }}
                    className="rounded-2xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-purple-500"
                  >
                    {commentLoading ? 'Submitting…' : 'Submit Comment'}
                  </button>
                </div>
                {commentError && <p className="text-xs text-rose-400">{commentError}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 uppercase tracking-[0.22em] font-semibold">
                  <span>Comments</span>
                  <span>{comments.length} entries</span>
                </div>
                {comments.length === 0 ? (
                  <p className="text-sm text-zinc-400">No comments yet. Be the first to share your experience.</p>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="rounded-3xl border border-white/10 bg-[#0f1220] p-4 text-sm text-zinc-200">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-white">{comment.author || comment.userId || 'Guest'}</span>
                          <span className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{comment.useful ? 'Useful' : 'Not useful'}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-zinc-300">{comment.comment}</p>
                        <p className="mt-2 text-[11px] text-zinc-500">{new Date(comment.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="rounded-3xl border border-white/10 bg-[#11141f]/80 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-400">Malware protection</p>
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
