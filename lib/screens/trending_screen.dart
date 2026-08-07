import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/content_provider.dart';
import '../theme/app_theme.dart';

class TrendingScreen extends StatelessWidget {
  const TrendingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final contentProvider = Provider.of<ContentProvider>(context);
    final allItems = contentProvider.items;
    final trendingItems = allItems.where((i) => i.isTrending || i.rank != null).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.only(top: 100, bottom: 100, left: 20, right: 20),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Page Header
              Text(
                'Trending Now',
                style: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
              ),
              const SizedBox(height: 4),
              Text(
                'Discover what everyone is watching today across all platforms.',
                style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 32),

              // Top Ranked Highlights Horizontal Carousel
              Row(
                children: [
                  const Icon(Icons.local_fire_department, color: AppTheme.accentRose, size: 22),
                  const SizedBox(width: 8),
                  Text(
                    'Top Ranked Highlights',
                    style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              SizedBox(
                height: 380,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: trendingItems.take(5).length,
                  itemBuilder: (context, index) {
                    final item = trendingItems[index];
                    return GestureDetector(
                      onTap: () => contentProvider.openItemModal(item),
                      child: Container(
                        width: 260,
                        margin: const EdgeInsets.only(right: 20),
                        decoration: AppTheme.glassDecoration(borderRadius: 24),
                        clipBehavior: Clip.antiAlias,
                        child: Stack(
                          children: [
                            // Poster Background
                            Positioned.fill(
                              child: Image.network(
                                item.bannerUrl,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => Container(color: AppTheme.cardBgElevated),
                              ),
                            ),
                            // Dark Vignette Gradient
                            Positioned.fill(
                              child: Container(
                                decoration: const BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [Colors.transparent, Color(0xE614121D)],
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                  ),
                                ),
                              ),
                            ),
                            // Card Info Content
                            Positioned(
                              bottom: 20,
                              left: 20,
                              right: 20,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: index == 0
                                              ? AppTheme.primaryPurple
                                              : index == 1
                                                  ? AppTheme.accentIndigo
                                                  : const Color(0xFF3F3F46),
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: Text(
                                          '#${index + 1}',
                                          style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        item.category,
                                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.lightPurple),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    item.title,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    item.description,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textSecondary),
                                  ),
                                  const SizedBox(height: 10),
                                  Row(
                                    children: [
                                      const Icon(Icons.star, size: 14, color: AppTheme.accentAmber),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${item.rating} • ${item.views ?? "1.1M"} Views',
                                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.accentAmber),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 40),

              // Popular Today Vertical List
              Row(
                children: [
                  const Icon(Icons.trending_up, color: AppTheme.primaryPurple, size: 22),
                  const SizedBox(width: 8),
                  Text(
                    'Popular Today',
                    style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: allItems.length,
                itemBuilder: (context, index) {
                  final item = allItems[index];
                  return GestureDetector(
                    onTap: () => contentProvider.openItemModal(item),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: AppTheme.glassDecoration(borderRadius: 20),
                      child: Row(
                        children: [
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(16),
                              image: DecorationImage(
                                image: NetworkImage(item.bannerUrl),
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.star, size: 14, color: AppTheme.accentAmber),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${item.rating}',
                                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.accentAmber),
                                    ),
                                    Text(
                                      ' • ${item.category} • ${item.views ?? "1.1M"} views',
                                      style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  item.description,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textMuted),
                                ),
                              ],
                            ),
                          ),
                          const Icon(Icons.arrow_forward, color: AppTheme.lightPurple),
                        ],
                      ),
                    ),
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
