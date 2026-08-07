class WatchHistoryItem {
  final String id;
  final String title;
  final double progress; // 0 to 100
  final String category;
  final String bannerUrl;

  WatchHistoryItem({
    required this.id,
    required this.title,
    required this.progress,
    required this.category,
    required this.bannerUrl,
  });

  factory WatchHistoryItem.fromJson(Map<String, dynamic> json) {
    return WatchHistoryItem(
      id: json['id'] as String,
      title: json['title'] as String,
      progress: (json['progress'] as num?)?.toDouble() ?? 0.0,
      category: json['category'] as String? ?? 'Movies',
      bannerUrl: json['bannerUrl'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'progress': progress,
      'category': category,
      'bannerUrl': bannerUrl,
    };
  }

  WatchHistoryItem copyWith({
    String? id,
    String? title,
    double? progress,
    String? category,
    String? bannerUrl,
  }) {
    return WatchHistoryItem(
      id: id ?? this.id,
      title: title ?? this.title,
      progress: progress ?? this.progress,
      category: category ?? this.category,
      bannerUrl: bannerUrl ?? this.bannerUrl,
    );
  }
}
