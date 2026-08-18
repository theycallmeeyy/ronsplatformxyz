import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { TBCPL_CONTENT } from '../data/tbcplContent';
import { useToast } from './ToastContext';

const ContentContext = createContext(null);
const CATALOG_VERSION = 2;
const CATALOG_STORAGE_KEY = 'ronkws_catalog_v2';

export function ContentProvider({ children }) {
  const { showToast } = useToast();

  // Content items state (persisted in localStorage)
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.version === CATALOG_VERSION && Array.isArray(parsed.data)) {
          return parsed.data;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return TBCPL_CONTENT;
  });

  // Favorites state (array of item IDs)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('ronkws_favorites');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // Watch history state: array of { id, title, progress, lastWatched }
  const [watchHistory, setWatchHistory] = useState(() => {
    const saved = localStorage.getItem('ronkws_watch_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // Currently active filter & search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'rating', 'newest'

  // Modal active content item
  const [activeModalItem, setActiveModalItem] = useState(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify({
      version: CATALOG_VERSION,
      data: items
    }));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('ronkws_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('ronkws_watch_history', JSON.stringify(watchHistory));
  }, [watchHistory]);

  // Toggle Favorite
  const toggleFavorite = (itemId) => {
    setFavorites((prev) => {
      const isFav = prev.includes(itemId);
      const updated = isFav ? prev.filter((id) => id !== itemId) : [...prev, itemId];
      const item = items.find((i) => i.id === itemId);
      showToast(
        isFav
          ? `Removed ${item?.title || 'item'} from Favorites`
          : `Added ${item?.title || 'item'} to Favorites`,
        isFav ? 'info' : 'success'
      );
      return updated;
    });
  };

  const openExternalLink = (url) => {
    if (!url) return false;
    // Push a state to history so back button brings user to home
    window.history.pushState({ source: 'ronkws_platform' }, '', window.location.href);
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) {
      newWindow.focus();
      return true;
    }
    return false;
  };

  // Open item in modal player, or open external platform URLs directly if no embed is available.
  const openItemModal = (item) => {
    const externalOnly = item?.url && !item?.embedUrl;
    const openedExternally = externalOnly && openExternalLink(item.url);

    if (!externalOnly || !openedExternally) {
      setActiveModalItem(item);
    }

    // Add or update watch history
    setWatchHistory((prev) => {
      const existing = prev.find((w) => w.id === item.id);
      const progress = existing ? Math.min(100, existing.progress + 15) : 25;
      const updatedItem = {
        id: item.id,
        title: item.title,
        progress,
        category: item.category,
        bannerUrl: item.bannerUrl || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80'
      };
      return [updatedItem, ...prev.filter((w) => w.id !== item.id)];
    });
  };

  const closeModalModal = () => {
    setActiveModalItem(null);
  };

  // Admin Actions: Add, Edit, Delete Content
  const addContent = (newContent) => {
    const item = {
      ...newContent,
      id: `item-${Date.now()}`,
      views: '0',
      rating: parseFloat(newContent.rating) || 4.5,
      year: newContent.year || new Date().getFullYear().toString(),
      isTrending: false,
      isRecommended: false
    };
    setItems((prev) => [item, ...prev]);
    showToast(`Added "${item.title}" to catalog!`, 'success');
  };

  const updateContent = (id, updatedFields) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
    showToast(`Updated content successfully!`, 'success');
  };

  const toggleTrending = (itemId) => {
    let title = 'Item';
    let nextTrending = false;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        title = item.title || title;
        nextTrending = !item.isTrending;
        return { ...item, isTrending: nextTrending };
      })
    );
    showToast(
      `${title} ${nextTrending ? 'marked as' : 'removed from'} trending`,
      'success'
    );
  };

  const toggleRecommended = (itemId) => {
    let title = 'Item';
    let nextRecommended = false;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        title = item.title || title;
        nextRecommended = !item.isRecommended;
        return { ...item, isRecommended: nextRecommended };
      })
    );
    showToast(
      `${title} ${nextRecommended ? 'marked as' : 'removed from'} recommendations`,
      'success'
    );
  };

  const deleteContent = (id) => {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setFavorites((prev) => prev.filter((favId) => favId !== id));
    setWatchHistory((prev) => prev.filter((w) => w.id !== id));
    showToast(`Deleted "${item?.title || 'item'}" from catalog`, 'info');
  };

  // Filtered & Sorted items memoized
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchCat = item.category?.toLowerCase().includes(q);
          return matchTitle || matchDesc || matchCat;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'newest') return (b.year || '').localeCompare(a.year || '');
        return 0; // Default order
      });
  }, [items, selectedCategory, searchQuery, sortBy]);

  const favoriteItems = useMemo(() => {
    return items.filter((item) => favorites.includes(item.id));
  }, [items, favorites]);

  return (
    <ContentContext.Provider
      value={{
        items,
        filteredItems,
        favoriteItems,
        favorites,
        watchHistory,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        activeModalItem,
        toggleFavorite,
        openItemModal,
        closeModalModal,
        addContent,
        updateContent,
        deleteContent
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within ContentProvider');
  }
  return context;
}
