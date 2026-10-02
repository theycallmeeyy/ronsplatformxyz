import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { TBCPL_CONTENT } from '../data/tbcplContent';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { assessUrlSafety, getProviderStatus as getLocalProviderStatus } from '../utils/linkSafety';
import {
  checkProviderStatus as fetchProviderStatus,
  clearUserHistory,
  fetchCatalogItems,
  deleteSiteRequest as removeSiteRequest,
  fetchSiteRequests,
  fetchUserData,
  saveUserData,
  submitCatalogItem,
  submitSiteRequest,
  updateSiteRequest as saveSiteRequest
} from '../utils/api';

const ContentContext = createContext(null);
const CATALOG_VERSION = 2;
const CATALOG_STORAGE_KEY = 'ronkws_catalog_v2';
const WATCH_HISTORY_STORAGE_KEY = 'ronkws_watch_history_v2';
const CLICK_ANALYTICS_STORAGE_KEY = 'ronkws_click_analytics_v2';
const CATEGORY_FILTER_GROUPS = {
  'Movies & Shows': ['Movies', 'TV Shows'],
  'Live TV & Sports': ['Live TV', 'Sports']
};

export function ContentProvider({ children }) {
  const { showToast } = useToast();
  const { isAdmin, setCurrentRoute, user, preferences, replacePreferences } = useAuth();
  const [syncReady, setSyncReady] = useState(false);

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
    const saved = localStorage.getItem(WATCH_HISTORY_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });
  const [clickAnalytics, setClickAnalytics] = useState(() => {
    const saved = localStorage.getItem(CLICK_ANALYTICS_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {};
  });
  const [favoriteGroups, setFavoriteGroups] = useState(() => {
    const saved = localStorage.getItem('ronkws_favorite_groups');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {};
  });
  const [favoriteCategories, setFavoriteCategories] = useState(() => {
    const saved = localStorage.getItem('ronkws_favorite_categories');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return ['Watch later'];
  });
  const [providerStatuses, setProviderStatuses] = useState({});
  const [providerHistory, setProviderHistory] = useState(() => {
    const saved = localStorage.getItem('ronkws_provider_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {};
  });
  const [siteRequests, setSiteRequests] = useState([]);
  const refreshSiteRequests = useCallback(async () => {
    if (!isAdmin) throw new Error('Admin access required.');
    const result = await fetchSiteRequests();
    if (!result?.success) throw new Error(result?.error || 'Unable to load site requests.');
    setSiteRequests(Array.isArray(result.requests) ? result.requests : []);
  }, [isAdmin]);

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
    let cancelled = false;
    fetchCatalogItems()
      .then((result) => {
        if (!result?.success) throw new Error(result?.error || 'Unable to load shared catalog items.');
        if (cancelled || !Array.isArray(result.items) || !result.items.length) return;
        setItems((current) => {
          const sharedIds = new Set(result.items.map((item) => item.id));
          return [...result.items, ...current.filter((item) => !sharedIds.has(item.id))];
        });
      })
      .catch((error) => {
        console.error('Unable to load shared catalog items:', error);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    localStorage.setItem('ronkws_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(WATCH_HISTORY_STORAGE_KEY, JSON.stringify(watchHistory));
  }, [watchHistory]);

  useEffect(() => {
    localStorage.setItem(CLICK_ANALYTICS_STORAGE_KEY, JSON.stringify(clickAnalytics));
  }, [clickAnalytics]);

  useEffect(() => {
    localStorage.setItem('ronkws_provider_history', JSON.stringify(providerHistory));
  }, [providerHistory]);

  useEffect(() => {
    let cancelled = false;
    if (!isAdmin) {
      setSiteRequests([]);
      return undefined;
    }

    refreshSiteRequests()
      .catch((error) => {
        if (cancelled) return;
        console.error('Unable to load site requests:', error);
        showToast(error.message || 'Unable to load site requests.', 'error');
      });

    return () => { cancelled = true; };
  }, [isAdmin, refreshSiteRequests, showToast]);

  useEffect(() => {
    let cancelled = false;
    setSyncReady(false);
    if (!user?.id) return undefined;

    fetchUserData()
      .then((result) => {
        if (cancelled || !result?.success || !result.data) return;
        const data = result.data;
        setWatchHistory(Array.isArray(data.watchHistory) ? data.watchHistory : []);
        setClickAnalytics(data.clickAnalytics && typeof data.clickAnalytics === 'object' ? data.clickAnalytics : {});
        setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
        setFavoriteGroups(data.favoriteGroups && typeof data.favoriteGroups === 'object' ? data.favoriteGroups : {});
        setFavoriteCategories(Array.isArray(data.favoriteCategories) && data.favoriteCategories.length ? data.favoriteCategories : ['Watch later']);
        setProviderHistory(data.providerHistory && typeof data.providerHistory === 'object' ? data.providerHistory : {});
        if (data.preferences && typeof data.preferences === 'object') replacePreferences(data.preferences);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSyncReady(true);
      });

    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    if (!syncReady || !user?.id) return undefined;
    const timeout = window.setTimeout(() => {
      saveUserData({ watchHistory, clickAnalytics, favorites, favoriteGroups, favoriteCategories, providerHistory, preferences }).catch(() => {});
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [syncReady, user?.id, watchHistory, clickAnalytics, favorites, favoriteGroups, favoriteCategories, providerHistory, preferences]);

  useEffect(() => {
    localStorage.setItem('ronkws_favorite_groups', JSON.stringify(favoriteGroups));
  }, [favoriteGroups]);

  useEffect(() => {
    localStorage.setItem('ronkws_favorite_categories', JSON.stringify(favoriteCategories));
  }, [favoriteCategories]);

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

  // Open item in modal player, or open external platform URLs directly if no embed is available.
  const openItemModal = (item) => {
    const safety = assessUrlSafety(item?.url);
    if (item?.url && safety.blocked) {
      showToast(`${item.title}: ${safety.label}`, 'error');
      return;
    }

    const visitedAt = new Date().toISOString();
    const updatedAnalytics = preferences.analyticsTracking
      ? {
          ...clickAnalytics,
          [item.id]: {
            clicks: (clickAnalytics[item.id]?.clicks || 0) + 1,
            lastClicked: visitedAt,
            events: [...(clickAnalytics[item.id]?.events || []), visitedAt].slice(-365)
          }
        }
      : clickAnalytics;
    const existing = watchHistory.find((entry) => entry.id === item.id);
    const updatedHistory = preferences.browsingHistory
      ? [
          {
            id: item.id,
            title: item.title,
            progress: existing ? Math.min(100, existing.progress + 15) : 25,
            category: item.category,
            bannerUrl: item.bannerUrl || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80',
            lastVisited: visitedAt
          },
          ...watchHistory.filter((entry) => entry.id !== item.id)
        ]
      : watchHistory;
    setClickAnalytics(updatedAnalytics);
    setWatchHistory(updatedHistory);
    localStorage.setItem(CLICK_ANALYTICS_STORAGE_KEY, JSON.stringify(updatedAnalytics));
    localStorage.setItem(WATCH_HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

    setActiveModalItem(item);
  };

  const closeModalModal = () => {
    setActiveModalItem(null);
  };

  const clearHistory = async () => {
    setWatchHistory([]);
    setClickAnalytics({});
    localStorage.setItem(WATCH_HISTORY_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(CLICK_ANALYTICS_STORAGE_KEY, JSON.stringify({}));
    if (user?.id) {
      await clearUserHistory().catch(() => {});
    }
    showToast('Browsing history cleared.', 'success');
  };

  const refreshProviderStatus = async (item) => {
    if (!item?.url) return;
    try {
      const result = await fetchProviderStatus(item.url);
      if (result?.success) {
        const checkedAt = result.checkedAt || new Date().toISOString();
        setProviderStatuses((prev) => ({
          ...prev,
          [item.id]: { status: result.status, checkedAt }
        }));
        setProviderHistory((prev) => ({
          ...prev,
          [item.id]: [...(prev[item.id] || []), { status: result.status, checkedAt }].slice(-744)
        }));
        if (result.status === 'offline' && preferences.notifications && providerStatuses[item.id]?.status !== 'offline') {
          showToast(`${item.title} appears to be offline.`, 'error');
        }
      }
    } catch {
      setProviderStatuses((prev) => ({ ...prev, [item.id]: { status: 'offline' } }));
    }
  };

  const setFavoriteCategory = (itemId, category) => {
    const normalizedCategory = category.trim();
    if (!normalizedCategory) return;
    setFavoriteGroups((prev) => ({ ...prev, [itemId]: normalizedCategory }));
    setFavoriteCategories((prev) => (
      prev.includes(normalizedCategory) ? prev : [...prev, normalizedCategory]
    ));
  };

  const addFavoriteCategory = (category) => {
    const normalizedCategory = category.trim();
    if (!normalizedCategory || favoriteCategories.includes(normalizedCategory)) return false;
    setFavoriteCategories((prev) => [...prev, normalizedCategory]);
    return true;
  };

  const recentItems = useMemo(() => (
    [...watchHistory]
      .sort((a, b) => new Date(b.lastVisited || 0) - new Date(a.lastVisited || 0))
      .map((entry) => {
        const item = items.find((catalogItem) => catalogItem.id === entry.id);
        return item ? { ...item, progress: entry.progress, lastVisited: entry.lastVisited } : entry;
      })
  ), [items, watchHistory]);

  const analyticsItems = useMemo(() => (
    items
      .map((item) => ({ ...item, clickCount: clickAnalytics[item.id]?.clicks || 0 }))
      .sort((a, b) => b.clickCount - a.clickCount)
  ), [items, clickAnalytics]);

  const trafficByDay = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return { date, label: date.toLocaleDateString(undefined, { weekday: 'short' }), clicks: 0 };
    });
    const start = days[0].date.getTime();
    Object.values(clickAnalytics).forEach((entry) => {
      (entry.events || []).forEach((event) => {
        const eventTime = new Date(event).getTime();
        const day = days.find((candidate, index) => {
          const end = index === days.length - 1 ? Date.now() + 86400000 : days[index + 1].date.getTime();
          return eventTime >= candidate.date.getTime() && eventTime < end;
        });
        if (day && eventTime >= start) day.clicks += 1;
      });
    });
    return days;
  }, [clickAnalytics]);

  const recommendedItems = useMemo(() => {
    const visitedIds = new Set(watchHistory.map((entry) => entry.id));
    const preferredCategories = new Set(watchHistory.slice(0, 5).map((entry) => entry.category));
    const matches = items.filter((item) => !visitedIds.has(item.id) && preferredCategories.has(item.category));
    return [...matches, ...items.filter((item) => !visitedIds.has(item.id) && !matches.includes(item))].slice(0, 6);
  }, [items, watchHistory]);

  const recommendationReason = useMemo(() => {
    const preferredCategory = watchHistory.find((entry) => entry.category)?.category;
    return preferredCategory
      ? `Because you visited ${preferredCategory} providers`
      : 'Because these providers are popular in Ronkws';
  }, [watchHistory]);

  const getProviderStatus = (item) => {
    const checked = providerStatuses[item.id];
    if (!checked) return getLocalProviderStatus(item);
    if (checked.status === 'online') return { label: 'Online', tone: 'text-emerald-300', dot: 'bg-emerald-400' };
    return { label: 'Offline', tone: 'text-rose-300', dot: 'bg-rose-400' };
  };

  const getProviderReliability = (item) => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const records = (providerHistory[item.id] || []).filter((record) => new Date(record.checkedAt).getTime() >= monthStart.getTime());
    if (!records.length) return null;
    const online = records.filter((record) => record.status === 'online').length;
    return Math.round((online / records.length) * 100);
  };

  // Admin Actions: Add, Edit, Delete Content
  const addContent = async (newContent) => {
    if (!isAdmin) throw new Error('Only administrators can add catalog items.');
    const result = await submitCatalogItem({
      ...newContent,
      rating: parseFloat(newContent.rating) || 4.5,
      year: newContent.year || new Date().getFullYear().toString(),
      isTrending: false,
      isRecommended: false
    });
    if (!result?.success || !result.item) {
      throw new Error(result?.error || 'Unable to add catalog item.');
    }
    const item = result.item;
    setItems((prev) => [item, ...prev]);
    showToast(`Added "${item.title}" to catalog!`, 'success');
    return item;
  };

  const updateContent = (id, updatedFields) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
    showToast(`Updated content successfully!`, 'success');
  };

  const toggleTrending = (itemId) => {
    if (!isAdmin) {
      showToast('Only administrators can change trending items.', 'error');
      return;
    }

    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;
    const nextTrending = !item.isTrending;
    setItems((prev) => prev.map((entry) => entry.id === itemId ? { ...entry, isTrending: nextTrending } : entry));
    showToast(
      `${item.title || 'Item'} ${nextTrending ? 'marked as' : 'removed from'} trending`,
      'success'
    );
  };

  const toggleRecommended = (itemId) => {
    if (!isAdmin) {
      showToast('Only administrators can change recommendations.', 'error');
      return;
    }

    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;
    const nextRecommended = !item.isRecommended;
    setItems((prev) => prev.map((entry) => entry.id === itemId ? { ...entry, isRecommended: nextRecommended } : entry));
    showToast(
      `${item.title || 'Item'} ${nextRecommended ? 'marked as' : 'removed from'} recommendations`,
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

  const addSiteRequest = async (request) => {
    const result = await submitSiteRequest(request);
    if (!result?.success || !result.request) {
      throw new Error(result?.error || 'Unable to submit site request.');
    }
    if (isAdmin) setSiteRequests((prev) => [result.request, ...prev]);
    showToast('Your site request was submitted for review.', 'success');
    return result.request;
  };

  const markSiteRequestAdded = async (requestId) => {
    if (!isAdmin) throw new Error('Admin access required.');
    try {
      const result = await saveSiteRequest(requestId, { status: 'added' });
      if (!result?.success || !result.request) {
        throw new Error(result?.error || 'Unable to update site request.');
      }
      setSiteRequests((prev) => prev.map((request) => request.id === requestId ? result.request : request));
      showToast('Request marked as added.', 'success');
    } catch (error) {
      showToast(error.message || 'Unable to update site request.', 'error');
      throw error;
    }
  };

  const deleteSiteRequest = async (requestId) => {
    if (!isAdmin) throw new Error('Admin access required.');
    try {
      const result = await removeSiteRequest(requestId);
      if (!result?.success) throw new Error(result?.error || 'Unable to remove site request.');
      setSiteRequests((prev) => prev.filter((request) => request.id !== requestId));
      showToast('Site request removed.', 'info');
    } catch (error) {
      showToast(error.message || 'Unable to remove site request.', 'error');
      throw error;
    }
  };

  // Filtered & Sorted items memoized
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Category filter
        const matchingCategories = CATEGORY_FILTER_GROUPS[selectedCategory] || [selectedCategory];
        if (selectedCategory !== 'All' && !matchingCategories.includes(item.category)) {
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
        siteRequests,
        refreshSiteRequests,
        markSiteRequestAdded,
        deleteSiteRequest,
        filteredItems,
        favoriteItems,
        favorites,
        watchHistory,
        clearHistory,
        recentItems,
        clickAnalytics,
        analyticsItems,
        trafficByDay,
        recommendedItems,
        recommendationReason,
        refreshProviderStatus,
        getProviderReliability,
        favoriteGroups,
        favoriteCategories,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        activeModalItem,
        toggleFavorite,
        setFavoriteCategory,
        addFavoriteCategory,
        getProviderStatus,
        openItemModal,
        closeModalModal,
        addContent,
        updateContent,
        deleteContent,
        addSiteRequest
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
