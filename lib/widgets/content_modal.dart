import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';
import '../providers/content_provider.dart';
import '../theme/app_theme.dart';

class ContentModal extends StatefulWidget {
  const ContentModal({super.key});

  @override
  State<ContentModal> createState() => _ContentModalState();
}

class _ContentModalState extends State<ContentModal> {
  YoutubePlayerController? _ytController;
  String? _lastVideoId;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final item = Provider.of<ContentProvider>(context).activeModalItem;
    if (item != null && item.embedUrl != null) {
      final videoId = _extractYoutubeId(item.embedUrl!);
      if (videoId != null && videoId != _lastVideoId) {
        _lastVideoId = videoId;
        _ytController?.close();
        _ytController = YoutubePlayerController.fromVideoId(
          videoId: videoId,
          autoPlay: true,
          params: const YoutubePlayerParams(
            showControls: true,
            showFullscreenButton: true,
          ),
        );
      }
    }
  }

  String? _extractYoutubeId(String url) {
    if (url.contains('embed/')) {
      final parts = url.split('embed/');
      if (parts.length > 1) {
        final idPart = parts[1].split('?')[0];
        return idPart;
      }
    }
    if (url.contains('v=')) {
      final parts = url.split('v=');
      if (parts.length > 1) {
        final idPart = parts[1].split('&')[0];
        return idPart;
      }
    }
    return 'dQw4w9WgXcQ';
  }

  @override
  void dispose() {
    _ytController?.close();
    super.dispose();
  }

  Future<void> _launchExternalUrl(String urlString) async {
    final Uri uri = Uri.parse(urlString);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final contentProvider = Provider.of<ContentProvider>(context);
    final item = contentProvider.activeModalItem;

    if (item == null) return const SizedBox.shrink();

    final isFav = contentProvider.favorites.contains(item.id);

    return Scaffold(
      backgroundColor: Colors.black.withOpacity(0.85),
      body: Center(
        child: Container(
          width: double.infinity,
          constraints: const BoxConstraints(maxWidth: 900),
          margin: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.cardBg,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: Colors.white.withOpacity(0.15)),
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryPurple.withOpacity(0.3),
                blurRadius: 32,
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Modal Header Bar
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                color: const Color(0xFF14121D),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryPurple.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.primaryPurple.withOpacity(0.4)),
                            ),
                            child: Text(
                              item.category.toUpperCase(),
                              style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.lightPurple),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              item.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppTheme.textSecondary),
                      onPressed: () => contentProvider.closeModalModal(),
                    ),
                  ],
                ),
              ),

              // Player View Container
              Container(
                width: double.infinity,
                height: 380,
                color: Colors.black,
                child: _ytController != null
                    ? YoutubePlayer(controller: _ytController!)
                    : Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.play_circle_fill, size: 64, color: AppTheme.primaryPurple),
                            const SizedBox(height: 12),
                            Text(
                              'Live Streaming Ready',
                              style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            const SizedBox(height: 16),
                            if (item.url != null)
                              ElevatedButton(
                                onPressed: () => _launchExternalUrl(item.url!),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.primaryPurple,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                ),
                                child: const Text('Open External Stream Link'),
                              ),
                          ],
                        ),
                      ),
              ),

              // Modal Info Body
              Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.title,
                                style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${item.genre ?? item.category} • ${item.year} • ${item.duration ?? "HD"}',
                                style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary),
                              ),
                            ],
                          ),
                        ),
                        Row(
                          children: [
                            OutlinedButton.icon(
                              onPressed: () => contentProvider.toggleFavorite(item.id),
                              icon: Icon(
                                isFav ? Icons.favorite : Icons.favorite_border,
                                size: 18,
                                color: isFav ? AppTheme.accentRose : AppTheme.textSecondary,
                              ),
                              label: Text(
                                isFav ? 'Favorited' : 'Add Favorite',
                                style: TextStyle(color: isFav ? AppTheme.accentRose : AppTheme.textSecondary),
                              ),
                              style: OutlinedButton.styleFrom(
                                backgroundColor: isFav ? AppTheme.accentRose.withOpacity(0.2) : Colors.white.withOpacity(0.05),
                                side: BorderSide(color: isFav ? AppTheme.accentRose.withOpacity(0.4) : Colors.white12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                            if (item.url != null) ...[
                              const SizedBox(width: 10),
                              ElevatedButton.icon(
                                onPressed: () => _launchExternalUrl(item.url!),
                                icon: const Icon(Icons.open_in_new, size: 16),
                                label: const Text('Visit Direct Provider'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.primaryPurple,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      item.description,
                      style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary, height: 1.5),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
