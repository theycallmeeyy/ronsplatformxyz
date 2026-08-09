import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/initial_data.dart';
import '../models/user_model.dart';
import 'toast_provider.dart';

class AuthProvider extends ChangeNotifier {
  final ToastProvider toastProvider;

  List<UserModel> _users = [];
  UserModel? _currentUser;
  bool _playIntroAnimation = false;
  String _currentRoute = 'login';
  bool _isInitialized = false;

  AuthProvider({required this.toastProvider}) {
    _loadFromPrefs();
  }

  // Getters
  List<UserModel> get users => List.unmodifiable(_users);
  UserModel? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isAdmin => _currentUser?.isAdmin ?? false;
  bool get playIntroAnimation => _playIntroAnimation;
  String get currentRoute => _currentRoute;
  bool get isInitialized => _isInitialized;

  void setCurrentRoute(String route) {
    _currentRoute = route;
    _saveCurrentRouteToPrefs();
    notifyListeners();
  }

  Future<void> _loadFromPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      // Load registered users
      final usersJson = prefs.getString('ronkws_users');
      if (usersJson != null && usersJson.isNotEmpty) {
        final List decoded = jsonDecode(usersJson);
        _users = decoded.map((item) => UserModel.fromJson(item)).toList();
      } else {
        _users = List.from(InitialData.initialUsers);
      }

      // Load active user session
      final activeUserJson = prefs.getString('ronkws_active_user');
      final savedRoute = prefs.getString('ronkws_current_route');
      if (activeUserJson != null && activeUserJson.isNotEmpty) {
        final decoded = jsonDecode(activeUserJson);
        _currentUser = UserModel.fromJson(decoded);
        _currentRoute = savedRoute ?? 'home';
      } else {
        _currentUser = null;
        _currentRoute = 'login';
      }
    } catch (e) {
      if (kDebugMode) print('Error loading AuthProvider state: $e');
      _users = List.from(InitialData.initialUsers);
      _currentUser = null;
      _currentRoute = 'login';
    } finally {
      _isInitialized = true;
      notifyListeners();
    }
  }

  Future<void> _saveUsersToPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final usersJson = jsonEncode(_users.map((u) => u.toJson()).toList());
      await prefs.setString('ronkws_users', usersJson);
    } catch (e) {
      if (kDebugMode) print('Error saving users: $e');
    }
  }

  Future<void> _saveActiveUserToPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (_currentUser != null) {
        final activeUserJson = jsonEncode(_currentUser!.toJson());
        await prefs.setString('ronkws_active_user', activeUserJson);
      } else {
        await prefs.remove('ronkws_active_user');
      }
    } catch (e) {
      if (kDebugMode) print('Error saving active user: $e');
    }
  }

  Future<void> _saveCurrentRouteToPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('ronkws_current_route', _currentRoute);
    } catch (e) {
      if (kDebugMode) print('Error saving current route: $e');
    }
  }

  // Login handler
  bool login(String email, String password) {
    final trimmedEmail = email.trim().toLowerCase();
    final foundIndex = _users.indexWhere(
      (u) => u.email.toLowerCase() == trimmedEmail && u.password == password,
    );

    if (foundIndex == -1) {
      toastProvider.showToast(
          'Invalid email or password. Try user@ronkws.com / password123',
          ToastType.error);
      return false;
    }

    _currentUser = _users[foundIndex];
    _currentRoute = 'home';
    _playIntroAnimation = true; // Trigger 4-second cinematic intro
    toastProvider.showToast(
        'Welcome back, ${_currentUser!.name}!', ToastType.success);
    _saveActiveUserToPrefs();
    _saveCurrentRouteToPrefs();
    notifyListeners();
    return true;
  }

  // Sign up handler
  bool signup(String name, String email, String password) {
    final trimmedEmail = email.trim().toLowerCase();
    final exists = _users.any((u) => u.email.toLowerCase() == trimmedEmail);

    if (exists) {
      toastProvider.showToast(
          'An account with this email already exists', ToastType.error);
      return false;
    }

    final newUser = UserModel(
      id: 'usr-${DateTime.now().millisecondsSinceEpoch}',
      name: name.trim(),
      email: trimmedEmail,
      password: password,
      role: 'user',
      avatar:
          'https://api.dicebear.com/7.x/bottts/svg?seed=${Uri.encodeComponent(name)}',
      memberSince: DateTime.now().year.toString(),
      bio: 'New Ronkws Streaming Hub Enthusiast',
    );

    _users.add(newUser);
    _currentUser = newUser;
    _currentRoute = 'home';
    _playIntroAnimation = true; // Trigger logo intro animation
    toastProvider.showToast('Account created successfully!', ToastType.success);
    _saveUsersToPrefs();
    _saveActiveUserToPrefs();
    _saveCurrentRouteToPrefs();
    notifyListeners();
    return true;
  }

  // Logout handler
  void logout() {
    _currentUser = null;
    _playIntroAnimation = false;
    _currentRoute = 'login';
    toastProvider.showToast('Logged out successfully', ToastType.info);
    _saveActiveUserToPrefs();
    _saveCurrentRouteToPrefs();
    notifyListeners();
  }

  // Profile Update
  void updateProfile({String? name, String? bio, String? avatar}) {
    if (_currentUser == null) return;

    final updatedUser = _currentUser!.copyWith(
      name: name ?? _currentUser!.name,
      bio: bio ?? _currentUser!.bio,
      avatar: avatar ?? _currentUser!.avatar,
    );

    _currentUser = updatedUser;
    final index = _users.indexWhere((u) => u.id == updatedUser.id);
    if (index != -1) {
      _users[index] = updatedUser;
    }

    toastProvider.showToast('Profile updated successfully!', ToastType.success);
    _saveUsersToPrefs();
    _saveActiveUserToPrefs();
    notifyListeners();
  }

  // Change Password
  bool changePassword(String currentPassword, String newPassword) {
    if (_currentUser == null) return false;

    if (_currentUser!.password != currentPassword) {
      toastProvider.showToast('Current password is incorrect', ToastType.error);
      return false;
    }

    final updatedUser = _currentUser!.copyWith(password: newPassword);
    _currentUser = updatedUser;
    final index = _users.indexWhere((u) => u.id == updatedUser.id);
    if (index != -1) {
      _users[index] = updatedUser;
    }

    toastProvider.showToast(
        'Password changed successfully!', ToastType.success);
    _saveUsersToPrefs();
    _saveActiveUserToPrefs();
    notifyListeners();
    return true;
  }

  // Admin User Management
  void toggleUserRole(String userId) {
    final index = _users.indexWhere((u) => u.id == userId);
    if (index != -1) {
      final user = _users[index];
      final newRole = user.role == 'admin' ? 'user' : 'admin';
      final updatedUser = user.copyWith(role: newRole);
      _users[index] = updatedUser;

      if (_currentUser?.id == userId) {
        _currentUser = updatedUser;
        _saveActiveUserToPrefs();
      }

      toastProvider.showToast(
          'Role updated for ${user.name} to $newRole', ToastType.success);
      _saveUsersToPrefs();
      notifyListeners();
    }
  }

  void deleteUser(String userId) {
    final index = _users.indexWhere((u) => u.id == userId);
    if (index != -1) {
      _users.removeAt(index);
      toastProvider.showToast('User account deleted', ToastType.info);
      _saveUsersToPrefs();
      notifyListeners();
    }
  }

  void completeIntroAnimation() {
    _playIntroAnimation = false;
    _currentRoute = 'home';
    notifyListeners();
  }
}
