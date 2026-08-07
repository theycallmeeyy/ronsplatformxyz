import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/content_item.dart';
import '../providers/content_provider.dart';
import '../theme/app_theme.dart';

class ContentCard extends StatelessWidget {
  final ContentItem item;

  const ContentCard({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    final contentProvider = Provider.of<ContentProvider>(context);
    final isFav = contentProvider.favorites.contains(item.id);

    return Container(
      decoration: AppTheme.glassDecoration(),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner / Poster Image Section
          Stack(
            children: [
              Container(
                height: 176,
                width: double.infinity,
                color: const Color(0xFF18181B),
                child: item.bannerUrl.isNotEmpty
                    ? Image.network(
                        item.bannerUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: AppTheme.cardBgElevated,
                            child: const Center(
                              child: Icon(Icons.movie, size: 48, color: AppTheme.primaryPurple),
                            ),
                          );
                        },
                      )
                    : Container(
                        color: AppTheme.cardBgElevated,
                        child: const Center(
                          child: Icon(Icons.movie, size: 48, color: AppTheme.primaryPurple),
                        ),
                      ),
              ),

              // Dark Overlay Gradient
              Positioned.fill(
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.transparent, Colors.black87],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                ),
              ),

              // Category Pill Badge
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xE6181622),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                  ),
                  child: Text(
                    item.category.toUpperCase(),
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.lightPurple,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),

              // Favorite Button (Heart)
              Positioned(
                top: 12,
                right: 12,
                child: GestureDetector(
                  onTap: () => contentProvider.toggleFavorite(item.id),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isFav ? AppTheme.accentRose.withOpacity(0.2) : Colors.black45,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isFav ? AppTheme.accentRose.withOpacity(0.4) : Colors.white12,
                      ),
                    ),
                    child: Icon(
                      isFav ? Icons.favorite : Icons.favorite_border,
                      size: 18,
                      color: isFav ? AppTheme.accentRose : AppTheme.textSecondary,
                    ),
                  ),
                ),
              ),

              // Rating Badge
              Positioned(
                bottom: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.star, size: 14, color: AppTheme.accentAmber),
                      const SizedBox(width: 4),
                      Text(
                        '${item.rating}',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.accentAmber,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Details Section
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  item.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppTheme.textSecondary,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.calendar_today, size: 14, color: AppTheme.textMuted),
                        const SizedBox(width: 4),
                        Text(
                          item.year,
                          style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                    if (item.duration != null)
                      Text(
                        item.duration!,
                        style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary),
                      ),
                  ],
                ),
                const SizedBox(height: 14),

                // Open CTA Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => contentProvider.openItemModal(item),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryPurple.withOpacity(0.2),
                      foregroundColor: AppTheme.lightPurple,
                      elevation: 0,
                      side: BorderSide(color: AppTheme.primaryPurple.withOpacity(0.4)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Open', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        SizedBox(width: 6),
                        Icon(Icons.arrow_forward, size: 16),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
