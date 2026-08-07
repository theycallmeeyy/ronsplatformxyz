import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/content_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/content_card.dart';

class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

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
    final items = contentProvider.filteredItems;

    return SingleChildScrollView(
      padding: const EdgeInsets.only(top: 100, bottom: 100, left: 20, right: 20),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search Title & Bar
              Text(
                'Search & Discover',
                style: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
              ),
              const SizedBox(height: 16),

              Container(
                decoration: BoxDecoration(
                  color: AppTheme.cardBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withOpacity(0.15)),
                ),
                child: TextField(
                  autofocus: true,
                  style: const TextStyle(color: Colors.white, fontSize: 16),
                  onChanged: (val) => contentProvider.setSearchQuery(val),
                  decoration: InputDecoration(
                    hintText: 'Search by title, genre, category, platform...',
                    prefixIcon: const Icon(Icons.search, color: AppTheme.textSecondary, size: 24),
                    suffixIcon: contentProvider.searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.close, color: AppTheme.textSecondary),
                            onPressed: () => contentProvider.setSearchQuery(''),
                          )
                        : null,
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Controls & Filters Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Category Pills
                  Expanded(
                    child: SingleChildScrollView(
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
                  ),

                  // Sort Dropdown
                  Row(
                    children: [
                      const Text('Sort by: ', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary, fontWeight: FontWeight.bold)),
                      DropdownButton<String>(
                        value: contentProvider.sortBy,
                        dropdownColor: AppTheme.cardBg,
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        underline: const SizedBox(),
                        onChanged: (val) {
                          if (val != null) contentProvider.setSortBy(val);
                        },
                        items: const [
                          DropdownMenuItem(value: 'popular', child: Text('Most Popular')),
                          DropdownMenuItem(value: 'rating', child: Text('Highest Rated')),
                          DropdownMenuItem(value: 'newest', child: Text('Newest')),
                        ],
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Results Counter
              Text(
                'Found ${items.length} results',
                style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.textSecondary),
              ),

              const SizedBox(height: 16),

              // Results Grid or Empty View
              if (items.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(48),
                  decoration: AppTheme.glassDecoration(borderRadius: 28),
                  child: Column(
                    children: [
                      const Icon(Icons.search_off, size: 64, color: AppTheme.textMuted),
                      const SizedBox(height: 16),
                      Text(
                        'No matching results',
                        style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'We couldn\'t find anything for "${contentProvider.searchQuery}". Try searching for popular terms like "Netflix", "Sci-Fi", "Anime", or "Marvel".',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () {
                          contentProvider.setSearchQuery('');
                          contentProvider.setSelectedCategory('All');
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryPurple),
                        child: const Text('Clear Search'),
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
}
