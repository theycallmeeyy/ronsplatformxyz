import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class CustomNavigationBar extends StatelessWidget {
  const CustomNavigationBar({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final isDesktop = MediaQuery.of(context).size.width >= 768;

    if (isDesktop) {
      return _buildDesktopHeader(context, auth);
    }
    return _buildMobileHeader(context, auth);
  }

  // Desktop Header
  Widget _buildDesktopHeader(BuildContext context, AuthProvider auth) {
    return Container(
      height: 80,
      padding: const EdgeInsets.symmetric(horizontal: 32),
      decoration: BoxDecoration(
        color: AppTheme.background.withOpacity(0.85),
        border: const Border(
            bottom: BorderSide(color: AppTheme.glassBorder, width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Logo & Brand Name
          MouseRegion(
            cursor: SystemMouseCursors.click,
            child: GestureDetector(
              onTap: () {
                if (auth.ageVerified) auth.setCurrentRoute('home');
              },
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: AppTheme.primaryGradient,
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryPurple.withOpacity(0.5),
                          blurRadius: 20,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        'R',
                        style: GoogleFonts.inter(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  ShaderMask(
                    shaderCallback: (bounds) =>
                        AppTheme.textGradient.createShader(bounds),
                    child: Text(
                      'Ronkws',
                      style: GoogleFonts.inter(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Nav Links (Only when authenticated)
          if (auth.ageVerified)
            Row(
              children: [
                _navButton(context, auth,
                    label: 'Home', route: 'home', icon: Icons.home),
                const SizedBox(width: 24),
                _navButton(context, auth,
                    label: 'Trending',
                    route: 'trending',
                    icon: Icons.trending_up),
                const SizedBox(width: 24),
                _navButton(context, auth,
                    label: 'Favorites', route: 'favorites', icon: Icons.star),
                const SizedBox(width: 24),
                _navButton(context, auth,
                    label: 'Search', route: 'search', icon: Icons.search),
                if (auth.isAdmin) ...[
                  const SizedBox(width: 24),
                  _navButton(context, auth,
                      label: 'Admin',
                      route: 'admin',
                      icon: Icons.admin_panel_settings,
                      isAdminBtn: true),
                ],
              ],
            ),

          // User Actions
          Row(
            children: [
              if (auth.isAuthenticated) ...[
                GestureDetector(
                  onTap: () => auth.setCurrentRoute('profile'),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white.withOpacity(0.1)),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 16,
                          backgroundColor:
                              AppTheme.primaryPurple.withOpacity(0.4),
                          backgroundImage:
                              NetworkImage(auth.currentUser?.avatar ?? ''),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          auth.currentUser?.name ?? '',
                          style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                IconButton(
                  icon: const Icon(Icons.logout,
                      color: AppTheme.textSecondary, size: 20),
                  onPressed: () => auth.logout(),
                  tooltip: 'Sign Out',
                ),
              ] else if (auth.ageVerified) ...[
                const Text('Guest session',
                    style: TextStyle(color: AppTheme.textSecondary)),
              ],
            ],
          ),
        ],
      ),
    );
  }

  // Mobile Top Header
  Widget _buildMobileHeader(BuildContext context, AuthProvider auth) {
    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: AppTheme.background.withOpacity(0.85),
        border: const Border(
            bottom: BorderSide(color: AppTheme.glassBorder, width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: AppTheme.primaryPurple,
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryPurple.withOpacity(0.4),
                      blurRadius: 15,
                    ),
                  ],
                ),
                child: Center(
                  child: Text('R',
                      style: GoogleFonts.inter(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: Colors.white)),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'Ronkws',
                style: GoogleFonts.inter(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.lightPurple),
              ),
            ],
          ),
          if (auth.isAuthenticated)
            GestureDetector(
              onTap: () => auth.setCurrentRoute('profile'),
              child: CircleAvatar(
                radius: 18,
                backgroundColor: AppTheme.primaryPurple.withOpacity(0.4),
                backgroundImage: NetworkImage(auth.currentUser?.avatar ?? ''),
              ),
            )
          else if (auth.ageVerified)
            const Text('Guest',
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _navButton(
    BuildContext context,
    AuthProvider auth, {
    required String label,
    required String route,
    required IconData icon,
    bool isAdminBtn = false,
  }) {
    final isSelected = auth.currentRoute == route;
    final textColor = isSelected
        ? AppTheme.lightPurple
        : isAdminBtn
            ? AppTheme.accentAmber
            : AppTheme.textSecondary;

    return InkWell(
      onTap: () => auth.setCurrentRoute(route),
      child: Container(
        padding: const EdgeInsets.only(bottom: 4),
        decoration: BoxDecoration(
          border: isSelected
              ? const Border(
                  bottom: BorderSide(color: AppTheme.primaryPurple, width: 2))
              : null,
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: textColor),
            const SizedBox(width: 6),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class MobileBottomNavBar extends StatelessWidget {
  const MobileBottomNavBar({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    if (!auth.ageVerified) return const SizedBox.shrink();

    return Container(
      height: 65,
      decoration: BoxDecoration(
        color: const Color(0xF2181622),
        border: const Border(
            top: BorderSide(color: AppTheme.glassBorder, width: 1)),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryPurple.withOpacity(0.15),
            blurRadius: 24,
            offset: const Offset(0, -8),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _navItem(context, auth,
              label: 'Home', route: 'home', icon: Icons.home),
          _navItem(context, auth,
              label: 'Trending', route: 'trending', icon: Icons.trending_up),
          _navItem(context, auth,
              label: 'Favorites', route: 'favorites', icon: Icons.star),
          _navItem(context, auth,
              label: 'Search', route: 'search', icon: Icons.search),
          if (auth.isAuthenticated)
            _navItem(context, auth,
                label: 'Profile', route: 'profile', icon: Icons.person),
        ],
      ),
    );
  }

  Widget _navItem(BuildContext context, AuthProvider auth,
      {required String label, required String route, required IconData icon}) {
    final isSelected = auth.currentRoute == route;

    return GestureDetector(
      onTap: () => auth.setCurrentRoute(route),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: isSelected
            ? BoxDecoration(
                color: AppTheme.primaryPurple.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              )
            : null,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                size: 22,
                color:
                    isSelected ? AppTheme.lightPurple : AppTheme.textSecondary),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color:
                    isSelected ? AppTheme.lightPurple : AppTheme.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
