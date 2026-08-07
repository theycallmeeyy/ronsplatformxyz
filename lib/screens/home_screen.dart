import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/content_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/content_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  final List<String> _categories = const [
    'All',
    'Movies',
    'TV Shows',
    'Anime',
    'Manga',
    'Live TV',
    'Sports',
    'Apps',
  ];

  @override
  Widget build(BuildContext context) {
    final contentProvider = Provider.of<ContentProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final items = contentProvider.filteredItems;
    final watchHistory = contentProvider.watchHistory;

    return SingleChildScrollView(
      padding: const EdgeInsets.only(top: 100, bottom: 100, left: 20, right: 20),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(40),
                decoration: AppTheme.glassDecoration(
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryPurple.withOpacity(0.15),
                      blurRadius: 32,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    ShaderMask(
                      shaderCallback: (bounds) => AppTheme.textGradient.createShader(bounds),
                      child: Text(
                        'Ronkws\nYour Streaming Everything',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 36,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          height: 1.2,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Discover movies, TV shows, anime, manga, live TV, apps, and sports all in one seamless place.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () => authProvider.setCurrentRoute('search'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryPurple,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                        elevation: 8,
                        shadowColor: AppTheme.primaryPurple.withOpacity(0.5),
                      ),
                      child: const Text('Explore Now', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Stats Row
              LayoutBuilder(
                builder: (context, constraints) {
                  return Row(
                    children: [
                      Expanded(child: _statCard('15K+', 'Total Sites', Icons.language)),
                      const SizedBox(width: 12),
                      Expanded(child: _statCard('42', 'Categories', Icons.category)),
                      const SizedBox(width: 12),
                      Expanded(child: _statCard('120+', 'Regions', Icons.public)),
                    ],
                  );
                },
              ),

              const SizedBox(height: 32),

              // Search Bar
              Container(
                decoration: BoxDecoration(
                  color: AppTheme.cardBg.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: Colors.white.withOpacity(0.15)),
                ),
                child: TextField(
                  style: const TextStyle(color: Colors.white),
                  onChanged: (val) => contentProvider.setSearchQuery(val),
                  decoration: InputDecoration(
                    hintText: 'Search for movies, TV shows, anime, platforms...',
                    prefixIcon: const Icon(Icons.search, color: AppTheme.textSecondary),
                    suffixIcon: contentProvider.searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.close, color: AppTheme.textSecondary),
                            onPressed: () => contentProvider.setSearchQuery(''),
                          )
                        : null,
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Category Pills
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _categories.map((cat) {
                    final isSelected = contentProvider.selectedCategory == cat;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(cat),
                        selected: isSelected,
                        onSelected: (_) => contentProvider.setSelectedCategory(cat),
                        selectedColor: AppTheme.primaryPurple,
                        backgroundColor: AppTheme.cardBg,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : AppTheme.textSecondary,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 32),

              // Continue Watching Section
              if (watchHistory.isNotEmpty) ...[
                Row(
                  children: [
                    const Icon(Icons.play_circle, color: AppTheme.primaryPurple, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Continue Watching',
                      style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 200,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: watchHistory.length,
                    itemBuilder: (context, index) {
                      final item = watchHistory[index];
                      return GestureDetector(
                        onTap: () {
                          final fullItem = contentProvider.items.firstWhere(
                            (i) => i.id == item.id,
                            orElse: () => contentProvider.items.first,
                          );
                          contentProvider.openItemModal(fullItem);
                        },
                        child: Container(
                          width: 240,
                          margin: const EdgeInsets.only(right: 16),
                          decoration: AppTheme.glassDecoration(borderRadius: 16),
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                height: 120,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  image: DecorationImage(
                                    image: NetworkImage(item.bannerUrl),
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                child: const Center(
                                  child: Icon(Icons.play_arrow, size: 36, color: Colors.white),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                item.title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                              ),
                              const SizedBox(height: 8),
                              LinearProgressIndicator(
                                value: item.progress / 100.0,
                                backgroundColor: Colors.white12,
                                color: AppTheme.primaryPurple,
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 32),
              ],

              // Main Content Grid Section Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.grid_view, color: AppTheme.primaryPurple, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        contentProvider.selectedCategory == 'All' ? 'Featured Streaming Hub' : '${contentProvider.selectedCategory} Collection',
                        style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ],
                  ),
                  Text(
                    '${items.length} items available',
                    style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Content Grid
              if (items.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(40),
                  decoration: AppTheme.glassDecoration(),
                  child: Column(
                    children: [
                      const Icon(Icons.search_off, size: 48, color: AppTheme.textMuted),
                      const SizedBox(height: 12),
                      Text(
                        'No content found',
                        style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'No streaming items matched your search query or selected category.',
                        style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          contentProvider.setSearchQuery('');
                          contentProvider.setSelectedCategory('All');
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryPurple),
                        child: const Text('Reset Filters'),
                      ),
                    ],
                  ),
                )
              else
                LayoutBuilder(
                  builder: (context, constraints) {
                    int crossAxisCount = 3;
                    if (constraints.maxWidth < 600) {
                      crossAxisCount = 1;
                    } else if (constraints.maxWidth < 900) {
                      crossAxisCount = 2;
                    }

                    return GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: crossAxisCount,
                        crossAxisSpacing: 20,
                        mainAxisSpacing: 20,
                        childAspectRatio: 0.72,
                      ),
                      itemCount: items.length,
                      itemBuilder: (context, index) {
                        return ContentCard(item: items[index]);
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

  Widget _statCard(String value, String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.glassDecoration(borderRadius: 20),
      child: Column(
        children: [
          Icon(icon, color: AppTheme.lightPurple, size: 28),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white),
          ),
          const SizedBox(height: 2),
          Text(
            label.toUpperCase(),
            style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.textSecondary, letterSpacing: 0.5),
          ),
        ],
      ),
    );
  }
}
