import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { INITIAL_CONTENT } from '../data/initialData';
import { useToast } from './ToastContext';

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const { showToast } = useToast();

  // Content items state (persisted in localStorage)
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('ronkws_catalog');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_CONTENT;
  });

  // Favorites state (array of item IDs)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('ronkws_favorites');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return ['net-01', 'dis-02', 'mov-101'];
  });

  // Watch history state: array of { id, title, progress, lastWatched }
  const [watchHistory, setWatchHistory] = useState(() => {
    const saved = localStorage.getItem('ronkws_watch_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'mov-101', title: 'Neon Shadows: 2145', progress: 65, category: 'Movies', bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
      { id: 'tv-201', title: 'Starlight Protocol', progress: 40, category: 'TV Shows', bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' }
    ];
  });

  // Currently active filter & search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'rating', 'newest'

  // Modal active content item
  const [activeModalItem, setActiveModalItem] = useState(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ronkws_catalog', JSON.stringify(items));
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

  // Open item in modal player & update watch history
  const openItemModal = (item) => {
    setActiveModalItem(item);
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
      year: newContent.year || new Date().getFullYear().toString()
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
