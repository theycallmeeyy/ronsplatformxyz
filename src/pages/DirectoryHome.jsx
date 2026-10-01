import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Clapperboard, Coins, Globe2, Orbit, Search, ShieldAlert, Smartphone, Tv, X } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { trackVisit } from '../utils/api';
import ProviderTile from '../components/ProviderTile';

const CATEGORY_SECTIONS = [
  { key: 'Movies & Shows', categories: ['Movies', 'TV Shows'], icon: Clapperboard },
  { key: 'Anime', categories: ['Anime'], icon: Orbit },
  { key: 'Manga', categories: ['Manga'], icon: BookOpen },
  { key: 'Live TV & Sports', categories: ['Live TV', 'Sports'], icon: Tv },
  { key: 'Paid', categories: ['Paid'], icon: Coins },
  { key: 'Apps', categories: ['Apps'], icon: Smartphone }
];

export default function DirectoryHome() {
  const {
    items,
    favorites,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery
  } = useContent();
  const [showSafetyNote, setShowSafetyNote] = useState(
    () => sessionStorage.getItem('ronkws_safety_note_dismissed') !== 'true'
  );
  const searchRef = useRef(null);
  const categories = useMemo(() => {
    const available = new Set(items.map((item) => item.category));
    return CATEGORY_SECTIONS.filter((section) => section.categories.some((category) => available.has(category)))
      .map((section) => ({
        ...section,
        count: items.filter((item) => section.categories.includes(item.category)).length
      }));
  }, [items]);

  const visibleCategories = selectedCategory === 'All'
    ? categories
    : categories.filter((section) => section.key === selectedCategory);

  useEffect(() => {
    trackVisit(1).catch((error) => console.warn('Visit tracking failed:', error));
  }, []);

  useEffect(() => {
    const focusSearch = (event) => {
      const target = event.target;
      if (event.key !== '/' || (target instanceof HTMLElement && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName)))) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  const chooseCategory = (category) => {
    setSelectedCategory((current) => current === category ? 'All' : category);
  };

  const dismissSafetyNote = () => {
    sessionStorage.setItem('ronkws_safety_note_dismissed', 'true');
    setShowSafetyNote(false);
  };

  const searchFilteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [item.title, item.description, item.category, item.url]
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  return (
    <div className="directory-page">
      <main className="directory-shell">
        <section className="directory-intro" aria-labelledby="directory-title">
          <div className="directory-brand-lockup">
            <div className="directory-brand-mark" aria-hidden="true"><img src="/logo/ronkws-glass-mark.svg" alt="" /></div>
            <div>
              <p className="directory-eyebrow">Ronkws Streaming Hub</p>
              <h1 id="directory-title">Your streaming everything</h1>
            </div>
          </div>
          <p className="directory-subtitle">
            Find a platform by category. Browse the global directory and open provider details before visiting.
          </p>

          <div className="directory-metrics" aria-label="Directory overview">
            <div><strong>{items.length}</strong><span>Sites</span></div>
            <div><strong>{categories.length}</strong><span>Categories</span></div>
            <div><strong>{favorites.length}</strong><span>Saved</span></div>
          </div>
        </section>

        <div className="directory-tools">
          <label className="directory-search">
            <Search size={18} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search sites and categories"
              aria-label="Search providers"
            />
            {searchQuery ? (
              <button type="button" onClick={() => setSearchQuery('')} title="Clear search" aria-label="Clear search">
                <X size={16} />
              </button>
            ) : <kbd>/</kbd>}
          </label>
          <div className="directory-region" aria-label="Catalog region">
            <Globe2 size={17} aria-hidden="true" />
            <span>Global catalog</span>
          </div>
        </div>

        <div className="directory-content-layout">
          <aside className="category-sidebar">
            <p className="category-sidebar-title">Categories</p>
            <nav aria-label="Filter by category">
              {categories.map(({ key, count, icon: CategoryIcon }) => (
                <button
                  type="button"
                  key={key}
                  className={`category-sidebar-item ${selectedCategory === key || (selectedCategory === 'All' && key === categories[0].key) ? 'is-active' : ''}`}
                  onClick={() => chooseCategory(key)}
                  aria-pressed={selectedCategory === key}
                >
                  <CategoryIcon size={19} aria-hidden="true" />
                  <span>{key}</span>
                  <span className="category-sidebar-count">{count}</span>
                </button>
              ))}
            </nav>
          </aside>

          <div id="provider-directory" className="provider-directory">
            {visibleCategories.map(({ key, categories: sourceCategories, count }, index) => {
            const categoryItems = searchFilteredItems.filter((item) => sourceCategories.includes(item.category));
            if (!categoryItems.length) return null;
            return (
              <section
                key={key}
                id={`category-${key.replaceAll(' ', '-')}`}
                className="provider-category"
              >
                <div className="provider-category-heading">
                  <div>
                    <span className="category-kicker">Directory / {String(index + 1).padStart(2, '0')}</span>
                    <h2>{key}</h2>
                  </div>
                  <span className="category-count">{categoryItems.length}</span>
                </div>
                <div className="provider-grid">
                  {categoryItems.map((item) => <ProviderTile key={item.id} item={item} />)}
                </div>
              </section>
            );
          })}
          {searchFilteredItems.length === 0 && (
            <div className="directory-empty">
              <Search size={26} />
              <h2>{items.length === 0 ? 'No providers available' : 'No providers found'}</h2>
              <p>{items.length === 0 ? 'The provider directory is currently empty.' : 'Try another provider or category name.'}</p>
            </div>
            )}
          </div>
        </div>
      </main>

      {showSafetyNote && (
        <aside className="directory-safety-note" aria-label="External link safety notice">
          <div className="safety-note-icon"><ShieldAlert size={19} /></div>
          <div className="safety-note-copy">
            <strong>Before opening an external link</strong>
            <span>Use a trusted content blocker to reduce intrusive ads and pop-ups.</span>
          </div>
          <div className="safety-note-links">
            <a href="https://brave.com/download/" target="_blank" rel="noreferrer noopener">
              <img src="https://brave.com/static-assets/images/brave-logo-sans-text.svg" alt="" />
              Brave Download
            </a>
            <a href="https://ublockorigin.com/" target="_blank" rel="noreferrer noopener">
              <img src="https://ublockorigin.com/img/logo/uBlock-Origin.svg?v=1.1" alt="" />
              uBlock Origin
            </a>
          </div>
          <button type="button" onClick={dismissSafetyNote} title="Dismiss notice" aria-label="Dismiss safety notice">
            <X size={18} />
          </button>
        </aside>
      )}
    </div>
  );
}