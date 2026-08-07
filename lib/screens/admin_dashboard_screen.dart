import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/content_item.dart';
import '../providers/auth_provider.dart';
import '../providers/content_provider.dart';
import '../theme/app_theme.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  String _activeTab = 'content'; // 'content' or 'users'

  // Add / Edit Content Form Controllers
  final _titleController = TextEditingController();
  String _category = 'Movies';
  final _yearController = TextEditingController(text: '2024');
  final _urlController = TextEditingController();
  final _embedUrlController = TextEditingController();
  final _bannerUrlController = TextEditingController();
  final _descController = TextEditingController();
  final _ratingController = TextEditingController(text: '4.8');
  ContentItem? _editingItem;

  void _openAddContentDialog(BuildContext context, ContentProvider contentProvider) {
    _editingItem = null;
    _titleController.clear();
    _category = 'Movies';
    _yearController.text = '2024';
    _urlController.clear();
    _embedUrlController.clear();
    _bannerUrlController.clear();
    _descController.clear();
    _ratingController.text = '4.8';

    _showContentDialog(context, contentProvider);
  }

  void _openEditContentDialog(BuildContext context, ContentProvider contentProvider, ContentItem item) {
    _editingItem = item;
    _titleController.text = item.title;
    _category = item.category;
    _yearController.text = item.year;
    _urlController.text = item.url ?? '';
    _embedUrlController.text = item.embedUrl ?? '';
    _bannerUrlController.text = item.bannerUrl;
    _descController.text = item.description;
    _ratingController.text = item.rating.toString();

    _showContentDialog(context, contentProvider);
  }

  void _showContentDialog(BuildContext context, ContentProvider contentProvider) {
    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return AlertDialog(
              backgroundColor: AppTheme.cardBg,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
              title: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(_editingItem != null ? 'Edit Content Item' : 'Add New Content Item', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppTheme.textSecondary),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              content: SizedBox(
                width: 500,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextField(
                        controller: _titleController,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Title'),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: _category,
                              dropdownColor: AppTheme.cardBg,
                              style: const TextStyle(color: Colors.white, fontSize: 14),
                              decoration: const InputDecoration(labelText: 'Category'),
                              items: const [
                                DropdownMenuItem(value: 'Movies', child: Text('Movies')),
                                DropdownMenuItem(value: 'TV Shows', child: Text('TV Shows')),
                                DropdownMenuItem(value: 'Anime', child: Text('Anime')),
                                DropdownMenuItem(value: 'Manga', child: Text('Manga')),
                                DropdownMenuItem(value: 'Live TV', child: Text('Live TV')),
                                DropdownMenuItem(value: 'Sports', child: Text('Sports')),
                                DropdownMenuItem(value: 'Apps', child: Text('Apps')),
                              ],
                              onChanged: (val) {
                                if (val != null) setModalState(() => _category = val);
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextField(
                              controller: _yearController,
                              style: const TextStyle(color: Colors.white),
                              decoration: const InputDecoration(labelText: 'Year'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _urlController,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Direct Stream / Website URL'),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _embedUrlController,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Video Embed Trailer URL'),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _bannerUrlController,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Poster / Banner Image URL'),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _descController,
                        maxLines: 3,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Description'),
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel', style: TextStyle(color: AppTheme.textSecondary)),
                ),
                ElevatedButton(
                  onPressed: () {
                    final newItem = ContentItem(
                      id: _editingItem?.id ?? 'item-${DateTime.now().millisecondsSinceEpoch}',
                      title: _titleController.text,
                      category: _category,
                      type: _category.toLowerCase(),
                      url: _urlController.text.isNotEmpty ? _urlController.text : null,
                      embedUrl: _embedUrlController.text.isNotEmpty ? _embedUrlController.text : null,
                      bannerUrl: _bannerUrlController.text.isNotEmpty ? _bannerUrlController.text : 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80',
                      description: _descController.text,
                      rating: double.tryParse(_ratingController.text) ?? 4.5,
                      year: _yearController.text,
                    );

                    if (_editingItem != null) {
                      contentProvider.updateContent(_editingItem!.id, newItem);
                    } else {
                      contentProvider.addContent(newItem);
                    }
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryPurple),
                  child: const Text('Save Item'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  void dispose() {
    _titleController.dispose();
    _yearController.dispose();
    _urlController.dispose();
    _embedUrlController.dispose();
    _bannerUrlController.dispose();
    _descController.dispose();
    _ratingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final contentProvider = Provider.of<ContentProvider>(context);

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
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.accentAmber.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.accentAmber.withOpacity(0.3)),
                            ),
                            child: const Text('ADMIN MODE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.accentAmber)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Control Dashboard',
                        style: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                      Text(
                        'Manage streaming services, platform content, and user permissions in real time.',
                        style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary),
                      ),
                    ],
                  ),
                  ElevatedButton.icon(
                    onPressed: () => _openAddContentDialog(context, contentProvider),
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('Add New Content'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryPurple,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 32),

              // Stats Row
              Row(
                children: [
                  Expanded(child: _statCard('Total Items', '${contentProvider.items.length}', Colors.white)),
                  const SizedBox(width: 12),
                  Expanded(child: _statCard('Active Categories', '8', AppTheme.lightPurple)),
                  const SizedBox(width: 12),
                  Expanded(child: _statCard('Registered Users', '${auth.users.length}', AppTheme.accentAmber)),
                  const SizedBox(width: 12),
                  Expanded(child: _statCard('Total Views', '14.8M', AppTheme.accentEmerald)),
                ],
              ),

              const SizedBox(height: 32),

              // Tab Switcher
              Row(
                children: [
                  ChoiceChip(
                    label: Text('Content Catalog (${contentProvider.items.length})'),
                    selected: _activeTab == 'content',
                    onSelected: (_) => setState(() => _activeTab = 'content'),
                    selectedColor: AppTheme.primaryPurple,
                    backgroundColor: AppTheme.cardBg,
                    labelStyle: TextStyle(
                      color: _activeTab == 'content' ? Colors.white : AppTheme.textSecondary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(width: 12),
                  ChoiceChip(
                    label: Text('Users Management (${auth.users.length})'),
                    selected: _activeTab == 'users',
                    onSelected: (_) => setState(() => _activeTab = 'users'),
                    selectedColor: AppTheme.primaryPurple,
                    backgroundColor: AppTheme.cardBg,
                    labelStyle: TextStyle(
                      color: _activeTab == 'users' ? Colors.white : AppTheme.textSecondary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Catalog Table
              if (_activeTab == 'content')
                Container(
                  decoration: AppTheme.glassDecoration(borderRadius: 24),
                  clipBehavior: Clip.antiAlias,
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: DataTable(
                      headingRowColor: WidgetStateProperty.all(Colors.white.withOpacity(0.05)),
                      columns: const [
                        DataColumn(label: Text('Item Title', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('Category', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('Rating', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('Year', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('Actions', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold))),
                      ],
                      rows: contentProvider.items.map((item) {
                        return DataRow(
                          cells: [
                            DataCell(
                              Row(
                                children: [
                                  CircleAvatar(
                                    radius: 18,
                                    backgroundImage: NetworkImage(item.bannerUrl),
                                  ),
                                  const SizedBox(width: 12),
                                  Text(item.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                            DataCell(Text(item.category, style: const TextStyle(color: AppTheme.lightPurple, fontWeight: FontWeight.bold))),
                            DataCell(Text('★ ${item.rating}', style: const TextStyle(color: AppTheme.accentAmber, fontWeight: FontWeight.bold))),
                            DataCell(Text(item.year, style: const TextStyle(color: AppTheme.textSecondary))),
                            DataCell(
                              Row(
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.edit, color: AppTheme.lightPurple, size: 18),
                                    onPressed: () => _openEditContentDialog(context, contentProvider, item),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.delete, color: AppTheme.accentRose, size: 18),
                                    onPressed: () => contentProvider.deleteContent(item.id),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        );
                      }).toList(),
                    ),
                  ),
                ),

              // Users Management Table
              if (_activeTab == 'users')
                Container(
                  decoration: AppTheme.glassDecoration(borderRadius: 24),
                  clipBehavior: Clip.antiAlias,
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: DataTable(
                      headingRowColor: WidgetStateProperty.all(Colors.white.withOpacity(0.05)),
                      columns: const [
                        DataColumn(label: Text('User', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('Email', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('Role', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold))),
                        DataColumn(label: Text('Actions', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold))),
                      ],
                      rows: auth.users.map((u) {
                        return DataRow(
                          cells: [
                            DataCell(
                              Row(
                                children: [
                                  CircleAvatar(
                                    radius: 16,
                                    backgroundImage: NetworkImage(u.avatar),
                                  ),
                                  const SizedBox(width: 12),
                                  Text(u.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                            DataCell(Text(u.email, style: const TextStyle(color: AppTheme.textSecondary))),
                            DataCell(
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: u.isAdmin ? AppTheme.accentAmber.withOpacity(0.2) : AppTheme.primaryPurple.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  u.role.toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: u.isAdmin ? AppTheme.accentAmber : AppTheme.lightPurple,
                                  ),
                                ),
                              ),
                            ),
                            DataCell(
                              Row(
                                children: [
                                  TextButton(
                                    onPressed: () => auth.toggleUserRole(u.id),
                                    child: const Text('Toggle Role', style: TextStyle(fontSize: 12, color: AppTheme.lightPurple)),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.delete, color: AppTheme.accentRose, size: 18),
                                    onPressed: () => auth.deleteUser(u.id),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        );
                      }).toList(),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statCard(String label, String value, Color valueColor) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: AppTheme.glassDecoration(borderRadius: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
          const SizedBox(height: 6),
          Text(value, style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w900, color: valueColor)),
        ],
      ),
    );
  }
}
