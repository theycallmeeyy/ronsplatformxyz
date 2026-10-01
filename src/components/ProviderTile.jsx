import React from 'react';
import { Check, Copy, ExternalLink, Heart } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useToast } from '../context/ToastContext';

export default function ProviderTile({ item }) {
  const { favorites, toggleFavorite, openItemModal, getProviderStatus } = useContent();
  const { showToast } = useToast();
  const isFavorite = favorites.includes(item.id);
  const status = getProviderStatus(item);
  const host = (() => {
    try {
      return new URL(item.url).hostname.replace(/^www\./, '');
    } catch {
      return 'Provider link';
    }
  })();

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      showToast('Provider URL copied', 'success');
    } catch {
      showToast('Could not copy this URL', 'error');
    }
  };

  return (
    <article className="provider-tile group relative">
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/65 px-2.5 py-1 text-[10px] font-semibold text-zinc-300 backdrop-blur-md">
        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
        {status.label}
      </div>
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
        <button
          type="button"
          onClick={() => toggleFavorite(item.id)}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={isFavorite ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
          className={`provider-icon-button ${isFavorite ? 'is-favorite' : ''}`}
        >
          <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        <button
          type="button"
          onClick={copyUrl}
          title="Copy provider URL"
          aria-label={`Copy ${item.title} URL`}
          className="provider-icon-button"
        >
          <Copy size={16} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => openItemModal(item)}
        className="provider-open"
        aria-label={`Open ${item.title} details`}
      >
        <span className="provider-art">
          {item.bannerUrl ? (
            <img src={item.bannerUrl} alt="" loading="lazy" />
          ) : (
            <span className="provider-fallback">{item.title.slice(0, 1)}</span>
          )}
        </span>
        <span className="provider-caption">
          <span className="provider-title">{item.title}</span>
          <span className="provider-domain">
            <ExternalLink size={12} aria-hidden="true" />
            {host}
          </span>
          <span className="provider-visit" aria-hidden="true">
            <Check size={13} /> Details
          </span>
        </span>
      </button>
    </article>
  );
}