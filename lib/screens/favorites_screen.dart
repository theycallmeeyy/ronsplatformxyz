import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/content_provider.dart';
import '../theme/app_theme.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  String _favSearch = '';

  @override
  Widget build(BuildContext context) {
    final contentProvider = Provider.of<ContentProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final favItems = contentProvider.favoriteItems.where((item) {
      if (_favSearch.isEmpty) return true;
      final q = _favSearch.toLowerCase();
      return item.title.toLowerCase().contains(q) || item.category.toLowerCase().contains(q);
    }).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.only(top: 100, bottom: 100, left: 20, right: 20),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'My Favorites',
                        style: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Manage your saved services and platforms.',
                        style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary),
                      ),
                    ],
                  ),

                  if (contentProvider.favoriteItems.isNotEmpty)
                    SizedBox(
                      width: 260,
                      child: TextField(
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        onChanged: (val) => setState(() => _favSearch = val),
                        decoration: InputDecoration(
                          hintText: 'Search favorites...',
                          prefixIcon: const Icon(Icons.search, size: 18, color: AppTheme.textSecondary),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(20)),
                        ),
                      ),
                    ),
                ],
              ),

              const SizedBox(height: 32),

              // Favorites Grid or Empty State
              if (favItems.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(48),
                  decoration: AppTheme.glassDecoration(borderRadius: 28),
                  child: Column(
                    children: [
                      Container(
                        width: 96,
                        height: 96,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppTheme.primaryPurple.withOpacity(0.15),
                          border: Border.all(color: AppTheme.primaryPurple.withOpacity(0.3)),
                        ),
                        child: const Center(
                          child: Icon(Icons.heart_broken, size: 48, color: AppTheme.primaryPurple),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'No Favorites Saved',
                        style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "You haven't saved any streaming platforms or shows yet. Explore trending content and build your custom watchlist!",
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () => authProvider.setCurrentRoute('trending'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryPurple,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                        ),
                        child: const Text('Explore Trending', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                )
              else
                LayoutBuilder(
                  builder: (context, constraints) {
                    int crossAxisCount = 4;
                    if (constraints.maxWidth < 600) {
                      crossAxisCount = 1;
                    } else if (constraints.maxWidth < 900) {
                      crossAxisCount = 2;
                    } else if (constraints.maxWidth < 1100) {
                      crossAxisCount = 3;
                    }

                    return GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: crossAxisCount,
                        crossAxisSpacing: 20,
                        mainAxisSpacing: 20,
                        childAspectRatio: 0.85,
                      ),
                      itemCount: favItems.length,
                      itemBuilder: (context, index) {
                        final item = favItems[index];
                        return Container(
                          decoration: AppTheme.glassDecoration(borderRadius: 20),
                          clipBehavior: Clip.antiAlias,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Stack(
                                children: [
                                  Container(
                                    height: 140,
                                    width: double.infinity,
                                    decoration: BoxDecoration(
                                      image: DecorationImage(
                                        image: NetworkImage(item.bannerUrl),
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                  ),
                                  Positioned(
                                    top: 10,
                                    right: 10,
                                    child: GestureDetector(
                                      onTap: () => contentProvider.toggleFavorite(item.id),
                                      child: Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: const BoxDecoration(
                                          color: Colors.black54,
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(Icons.heart_broken, size: 18, color: AppTheme.accentRose),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              Padding(
                                padding: const EdgeInsets.all(14),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.title,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                                    ),
                                    Text(
                                      item.category,
                                      style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary),
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: AppTheme.primaryPurple.withOpacity(0.2),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            item.genre ?? item.category,
                                            style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.lightPurple),
                                          ),
                                        ),
                                        GestureDetector(
                                          onTap: () => contentProvider.openItemModal(item),
                                          child: const Row(
                                            children: [
                                              Text('Open', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.lightPurple)),
                                              SizedBox(width: 4),
                                              Icon(Icons.arrow_forward, size: 14, color: AppTheme.lightPurple),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
