import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/initial_data.dart';
import '../models/content_item.dart';
import '../models/watch_history_item.dart';
import 'toast_provider.dart';

class ContentProvider extends ChangeNotifier {
  final ToastProvider toastProvider;

  List<ContentItem> _items = [];
  List<String> _favorites = [];
  List<WatchHistoryItem> _watchHistory = [];

  String _searchQuery = '';
  String _selectedCategory = 'All';
  String _sortBy = 'popular'; // 'popular', 'rating', 'newest'
  ContentItem? _activeModalItem;
  bool _isInitialized = false;

  ContentProvider({required this.toastProvider}) {
    _loadFromPrefs();
  }

  // Getters
  List<ContentItem> get items => List.unmodifiable(_items);
  List<String> get favorites => List.unmodifiable(_favorites);
  List<WatchHistoryItem> get watchHistory => List.unmodifiable(_watchHistory);

  String get searchQuery => _searchQuery;
  String get selectedCategory => _selectedCategory;
  String get sortBy => _sortBy;
  ContentItem? get activeModalItem => _activeModalItem;
  bool get isInitialized => _isInitialized;

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void setSelectedCategory(String category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void setSortBy(String sort) {
    _sortBy = sort;
    notifyListeners();
  }

  Future<void> _loadFromPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      // Load Catalog
      final catalogJson = prefs.getString('ronkws_catalog');
      if (catalogJson != null && catalogJson.isNotEmpty) {
        final List decoded = jsonDecode(catalogJson);
        _items = decoded.map((i) => ContentItem.fromJson(i)).toList();
      } else {
        _items = List.from(InitialData.initialContent);
      }

      // Load Favorites
      final favsJson = prefs.getString('ronkws_favorites');
      if (favsJson != null && favsJson.isNotEmpty) {
        final List decoded = jsonDecode(favsJson);
        _favorites = decoded.cast<String>();
      } else {
        _favorites = ['net-01', 'dis-02', 'mov-101'];
      }

      // Load Watch History
      final historyJson = prefs.getString('ronkws_watch_history');
      if (historyJson != null && historyJson.isNotEmpty) {
        final List decoded = jsonDecode(historyJson);
        _watchHistory = decoded.map((i) => WatchHistoryItem.fromJson(i)).toList();
      } else {
        _watchHistory = List.from(InitialData.initialWatchHistory);
      }
    } catch (e) {
      if (kDebugMode) print('Error loading ContentProvider state: $e');
      _items = List.from(InitialData.initialContent);
      _favorites = ['net-01', 'dis-02', 'mov-101'];
      _watchHistory = List.from(InitialData.initialWatchHistory);
    } finally {
      _isInitialized = true;
      notifyListeners();
    }
  }

  Future<void> _saveCatalogToPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final catalogJson = jsonEncode(_items.map((i) => i.toJson()).toList());
      await prefs.setString('ronkws_catalog', catalogJson);
    } catch (e) {
      if (kDebugMode) print('Error saving catalog: $e');
    }
  }

  Future<void> _saveFavoritesToPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final favsJson = jsonEncode(_favorites);
      await prefs.setString('ronkws_favorites', favsJson);
    } catch (e) {
      if (kDebugMode) print('Error saving favorites: $e');
    }
  }

  Future<void> _saveWatchHistoryToPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyJson = jsonEncode(_watchHistory.map((w) => w.toJson()).toList());
      await prefs.setString('ronkws_watch_history', historyJson);
    } catch (e) {
      if (kDebugMode) print('Error saving watch history: $e');
    }
  }

  // Filtered & Sorted items computation
  List<ContentItem> get filteredItems {
    final list = _items.where((item) {
      // Category filter
      if (_selectedCategory != 'All' && item.category != _selectedCategory) {
        return false;
      }
      // Search query filter
      if (_searchQuery.trim().isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchTitle = item.title.toLowerCase().contains(q);
        final matchDesc = item.description.toLowerCase().contains(q);
        final matchCat = item.category.toLowerCase().contains(q);
        final matchGenre = item.genre?.toLowerCase().contains(q) ?? false;
        return matchTitle || matchDesc || matchCat || matchGenre;
      }
      return true;
    }).toList();

    // Sort
    if (_sortBy == 'rating') {
      list.sort((a, b) => b.rating.compareTo(a.rating));
    } else if (_sortBy == 'newest') {
      list.sort((a, b) => b.year.compareTo(a.year));
    }

    return list;
  }

  List<ContentItem> get favoriteItems {
    return _items.where((item) => _favorites.contains(item.id)).toList();
  }

  // Toggle Favorite
  void toggleFavorite(String itemId) {
    final isFav = _favorites.contains(itemId);
    if (isFav) {
      _favorites.remove(itemId);
    } else {
      _favorites.add(itemId);
    }

    final item = _items.firstWhere(
      (i) => i.id == itemId,
      orElse: () => ContentItem(
        id: itemId,
        title: 'Item',
        category: 'All',
        type: 'movie',
        description: '',
        rating: 4.5,
        year: '2024',
        bannerUrl: '',
      ),
    );

    toastProvider.showToast(
      isFav ? 'Removed "${item.title}" from Favorites' : 'Added "${item.title}" to Favorites',
      isFav ? ToastType.info : ToastType.success,
    );

    _saveFavoritesToPrefs();
    notifyListeners();
  }

  // Open item in modal player & update watch history
  void openItemModal(ContentItem item) {
    _activeModalItem = item;

    // Update watch history
    final existingIndex = _watchHistory.indexWhere((w) => w.id == item.id);
    double progress = 25.0;
    if (existingIndex != -1) {
      progress = (_watchHistory[existingIndex].progress + 15.0).clamp(0.0, 100.0);
      _watchHistory.removeAt(existingIndex);
    }

    _watchHistory.insert(
      0,
      WatchHistoryItem(
        id: item.id,
        title: item.title,
        progress: progress,
        category: item.category,
        bannerUrl: item.bannerUrl.isNotEmpty
            ? item.bannerUrl
            : 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80',
      ),
    );

    _saveWatchHistoryToPrefs();
    notifyListeners();
  }

  void closeModalModal() {
    _activeModalItem = null;
    notifyListeners();
  }

  // Admin Actions: Add, Edit, Delete Content
  void addContent(ContentItem newItem) {
    _items.insert(0, newItem);
    toastProvider.showToast('Added "${newItem.title}" to catalog!', ToastType.success);
    _saveCatalogToPrefs();
    notifyListeners();
  }

  void updateContent(String id, ContentItem updatedItem) {
    final index = _items.indexWhere((i) => i.id == id);
    if (index != -1) {
      _items[index] = updatedItem;
      toastProvider.showToast('Updated "${updatedItem.title}" successfully!', ToastType.success);
      _saveCatalogToPrefs();
      notifyListeners();
    }
  }

  void deleteContent(String id) {
    final index = _items.indexWhere((i) => i.id == id);
    if (index != -1) {
      final title = _items[index].title;
      _items.removeAt(index);
      _favorites.remove(id);
      _watchHistory.removeWhere((w) => w.id == id);

      toastProvider.showToast('Deleted "$title" from catalog', ToastType.info);
      _saveCatalogToPrefs();
      _saveFavoritesToPrefs();
      _saveWatchHistoryToPrefs();
      notifyListeners();
    }
  }
}
