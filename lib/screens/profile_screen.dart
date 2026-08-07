import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/content_provider.dart';
import '../theme/app_theme.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _darkMode = true;
  bool _notifications = true;
  bool _autoplay = true;

  // Edit Profile Form
  final _editNameController = TextEditingController();
  final _editBioController = TextEditingController();
  final _editAvatarController = TextEditingController();

  // Change Password Form
  final _currPassController = TextEditingController();
  final _newPassController = TextEditingController();
  String? _passError;

  final List<String> _avatarPresets = const [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  ];

  void _showEditProfileDialog(BuildContext context, AuthProvider auth) {
    _editNameController.text = auth.currentUser?.name ?? '';
    _editBioController.text = auth.currentUser?.bio ?? '';
    _editAvatarController.text = auth.currentUser?.avatar ?? '';

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
                  const Text('Edit Profile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppTheme.textSecondary),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              content: SizedBox(
                width: 400,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: _editNameController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(labelText: 'Full Name'),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _editBioController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(labelText: 'Bio / Status'),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _editAvatarController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(labelText: 'Avatar URL or Preset'),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: _avatarPresets.map((preset) {
                        return GestureDetector(
                          onTap: () {
                            setModalState(() {
                              _editAvatarController.text = preset;
                            });
                          },
                          child: CircleAvatar(
                            radius: 20,
                            backgroundImage: NetworkImage(preset),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel', style: TextStyle(color: AppTheme.textSecondary)),
                ),
                ElevatedButton(
                  onPressed: () {
                    auth.updateProfile(
                      name: _editNameController.text,
                      bio: _editBioController.text,
                      avatar: _editAvatarController.text,
                    );
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryPurple),
                  child: const Text('Save Changes'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showChangePasswordDialog(BuildContext context, AuthProvider auth) {
    _currPassController.clear();
    _newPassController.clear();
    _passError = null;

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
                  const Text('Change Password', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppTheme.textSecondary),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              content: SizedBox(
                width: 400,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: _currPassController,
                      obscureText: true,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(labelText: 'Current Password'),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _newPassController,
                      obscureText: true,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(labelText: 'New Password (min 6 chars)'),
                    ),
                    if (_passError != null) ...[
                      const SizedBox(height: 8),
                      Text(_passError!, style: const TextStyle(color: AppTheme.accentRose, fontSize: 12)),
                    ],
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel', style: TextStyle(color: AppTheme.textSecondary)),
                ),
                ElevatedButton(
                  onPressed: () {
                    setModalState(() => _passError = null);
                    if (_currPassController.text.isEmpty) {
                      setModalState(() => _passError = 'Current password is required');
                      return;
                    }
                    if (_newPassController.text.length < 6) {
                      setModalState(() => _passError = 'New password must be at least 6 characters');
                      return;
                    }

                    final success = auth.changePassword(_currPassController.text, _newPassController.text);
                    if (success) {
                      Navigator.pop(context);
                    } else {
                      setModalState(() => _passError = 'Incorrect current password');
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryPurple),
                  child: const Text('Update Password'),
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
    _editNameController.dispose();
    _editBioController.dispose();
    _editAvatarController.dispose();
    _currPassController.dispose();
    _newPassController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final contentProvider = Provider.of<ContentProvider>(context);
    final user = auth.currentUser;

    return SingleChildScrollView(
      padding: const EdgeInsets.only(top: 100, bottom: 100, left: 20, right: 20),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 680),
          child: Column(
            children: [
              // Profile Header Card
              Container(
                padding: const EdgeInsets.all(32),
                decoration: AppTheme.glassDecoration(borderRadius: 32),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 48,
                      backgroundColor: AppTheme.primaryPurple,
                      backgroundImage: NetworkImage(user?.avatar ?? ''),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          user?.name ?? '',
                          style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        if (auth.isAdmin) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.accentAmber.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.accentAmber.withOpacity(0.3)),
                            ),
                            child: const Text(
                              'ADMIN',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.accentAmber),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.email ?? '',
                      style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      user?.bio ?? 'Streaming enthusiast',
                      style: GoogleFonts.inter(fontSize: 13, fontStyle: FontStyle.italic, color: AppTheme.lightPurple),
                    ),
                    const SizedBox(height: 24),

                    // Stats Row
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Column(
                              children: [
                                Text('${contentProvider.watchHistory.length}', style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w900, color: AppTheme.lightPurple)),
                                const Text('Watched', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Column(
                              children: [
                                Text('${contentProvider.favorites.length}', style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w900, color: AppTheme.lightPurple)),
                                const Text('Favorites', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Open Admin Dashboard Button (if admin)
              if (auth.isAdmin) ...[
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton.icon(
                    onPressed: () => auth.setCurrentRoute('admin'),
                    icon: const Icon(Icons.admin_panel_settings, color: AppTheme.accentAmber),
                    label: const Text('Open Admin Control Dashboard', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.accentAmber)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.accentAmber.withOpacity(0.15),
                      side: BorderSide(color: AppTheme.accentAmber.withOpacity(0.3)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // Settings List
              Container(
                decoration: AppTheme.glassDecoration(borderRadius: 24),
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.edit, color: AppTheme.lightPurple),
                      title: const Text('Edit Profile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      trailing: const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
                      onTap: () => _showEditProfileDialog(context, auth),
                    ),
                    const Divider(color: AppTheme.glassBorder, height: 1),
                    ListTile(
                      leading: const Icon(Icons.lock, color: AppTheme.lightPurple),
                      title: const Text('Change Password', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      trailing: const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
                      onTap: () => _showChangePasswordDialog(context, auth),
                    ),
                    const Divider(color: AppTheme.glassBorder, height: 1),
                    SwitchListTile(
                      secondary: const Icon(Icons.dark_mode, color: AppTheme.lightPurple),
                      title: const Text('Dark Mode', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      value: _darkMode,
                      activeColor: AppTheme.primaryPurple,
                      onChanged: (val) => setState(() => _darkMode = val),
                    ),
                    const Divider(color: AppTheme.glassBorder, height: 1),
                    SwitchListTile(
                      secondary: const Icon(Icons.notifications, color: AppTheme.lightPurple),
                      title: const Text('Notifications', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      value: _notifications,
                      activeColor: AppTheme.primaryPurple,
                      onChanged: (val) => setState(() => _notifications = val),
                    ),
                    const Divider(color: AppTheme.glassBorder, height: 1),
                    SwitchListTile(
                      secondary: const Icon(Icons.play_circle, color: AppTheme.lightPurple),
                      title: const Text('Autoplay Next Episode', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      value: _autoplay,
                      activeColor: AppTheme.primaryPurple,
                      onChanged: (val) => setState(() => _autoplay = val),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Sign Out Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton.icon(
                  onPressed: () => auth.logout(),
                  icon: const Icon(Icons.logout, color: AppTheme.accentRose),
                  label: const Text('Sign Out', style: TextStyle(color: AppTheme.accentRose, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    backgroundColor: AppTheme.accentRose.withOpacity(0.1),
                    side: BorderSide(color: AppTheme.accentRose.withOpacity(0.3)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
