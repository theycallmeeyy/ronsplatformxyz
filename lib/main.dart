import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'providers/auth_provider.dart';
import 'providers/content_provider.dart';
import 'providers/toast_provider.dart';
import 'screens/admin_dashboard_screen.dart';
import 'screens/favorites_screen.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/search_screen.dart';
import 'screens/trending_screen.dart';
import 'theme/app_theme.dart';
import 'widgets/cinematic_intro.dart';
import 'widgets/content_modal.dart';
import 'widgets/navigation_bar.dart';
import 'widgets/toast_overlay.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const RonkwsApp());
}

class RonkwsApp extends StatelessWidget {
  const RonkwsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ToastProvider()),
        ChangeNotifierProxyProvider<ToastProvider, AuthProvider>(
          create: (ctx) => AuthProvider(toastProvider: Provider.of<ToastProvider>(ctx, listen: false)),
          update: (ctx, toast, previous) => previous ?? AuthProvider(toastProvider: toast),
        ),
        ChangeNotifierProxyProvider<ToastProvider, ContentProvider>(
          create: (ctx) => ContentProvider(toastProvider: Provider.of<ToastProvider>(ctx, listen: false)),
          update: (ctx, toast, previous) => previous ?? ContentProvider(toastProvider: toast),
        ),
      ],
      child: MaterialApp(
        title: 'RonKWS Streaming Hub',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        home: const ToastOverlay(
          child: MainAppRouter(),
        ),
      ),
    );
  }
}

class MainAppRouter extends StatelessWidget {
  const MainAppRouter({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final content = Provider.of<ContentProvider>(context);

    // Show Cinematic Intro Logo Animation if just logged in / registered
    if (auth.playIntroAnimation) {
      return CinematicIntro(
        onComplete: () => auth.completeIntroAnimation(),
      );
    }

    // Unauthenticated State (Login / Sign Up)
    if (!auth.isAuthenticated) {
      return const Stack(
        children: [
          Scaffold(
            body: Column(
              children: [
                CustomNavigationBar(),
                Expanded(child: LoginScreen()),
              ],
            ),
          ),
        ],
      );
    }

    // Authenticated State with Router & Navigation
    Widget currentPage;
    switch (auth.currentRoute) {
      case 'trending':
        currentPage = const TrendingScreen();
        break;
      case 'favorites':
        currentPage = const FavoritesScreen();
        break;
      case 'search':
        currentPage = const SearchScreen();
        break;
      case 'profile':
        currentPage = const ProfileScreen();
        break;
      case 'admin':
        currentPage = const AdminDashboardScreen();
        break;
      case 'home':
      default:
        currentPage = const HomeScreen();
        break;
    }

    final isMobile = MediaQuery.of(context).size.width < 768;

    return Stack(
      children: [
        Scaffold(
          backgroundColor: AppTheme.background,
          body: Column(
            children: [
              const CustomNavigationBar(),
              Expanded(child: currentPage),
              if (isMobile) const MobileBottomNavBar(),
            ],
          ),
        ),

        // Video Player Modal Overlay
        if (content.activeModalItem != null) const ContentModal(),
      ],
    );
  }
}
