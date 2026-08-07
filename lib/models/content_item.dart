class ContentItem {
  final String id;
  final String title;
  final String category;
  final String type;
  final String? url;
  final String? embedUrl;
  final String? iconBg;
  final String? iconText;
  final String description;
  final double rating;
  final String year;
  final String? views;
  final int? rank;
  final bool featured;
  final bool isTrending;
  final String bannerUrl;
  final String? duration;
  final String? genre;

  ContentItem({
    required this.id,
    required this.title,
    required this.category,
    required this.type,
    this.url,
    this.embedUrl,
    this.iconBg,
    this.iconText,
    required this.description,
    required this.rating,
    required this.year,
    this.views,
    this.rank,
    this.featured = false,
    this.isTrending = false,
    required this.bannerUrl,
    this.duration,
    this.genre,
  });

  factory ContentItem.fromJson(Map<String, dynamic> json) {
    return ContentItem(
      id: json['id'] as String,
      title: json['title'] as String,
      category: json['category'] as String,
      type: json['type'] as String,
      url: json['url'] as String?,
      embedUrl: json['embedUrl'] as String?,
      iconBg: json['iconBg'] as String?,
      iconText: json['iconText'] as String?,
      description: json['description'] as String? ?? '',
      rating: (json['rating'] as num?)?.toDouble() ?? 4.5,
      year: (json['year'] ?? json['year']?.toString()) as String? ?? '2024',
      views: json['views'] as String?,
      rank: json['rank'] as int?,
      featured: json['featured'] as bool? ?? false,
      isTrending: json['isTrending'] as bool? ?? false,
      bannerUrl: json['bannerUrl'] as String? ?? '',
      duration: json['duration'] as String?,
      genre: json['genre'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'category': category,
      'type': type,
      'url': url,
      'embedUrl': embedUrl,
      'iconBg': iconBg,
      'iconText': iconText,
      'description': description,
      'rating': rating,
      'year': year,
      'views': views,
      'rank': rank,
      'featured': featured,
      'isTrending': isTrending,
      'bannerUrl': bannerUrl,
      'duration': duration,
      'genre': genre,
    };
  }

  ContentItem copyWith({
    String? id,
    String? title,
    String? category,
    String? type,
    String? url,
    String? embedUrl,
    String? iconBg,
    String? iconText,
    String? description,
    double? rating,
    String? year,
    String? views,
    int? rank,
    bool? featured,
    bool? isTrending,
    String? bannerUrl,
    String? duration,
    String? genre,
  }) {
    return ContentItem(
      id: id ?? this.id,
      title: title ?? this.title,
      category: category ?? this.category,
      type: type ?? this.type,
      url: url ?? this.url,
      embedUrl: embedUrl ?? this.embedUrl,
      iconBg: iconBg ?? this.iconBg,
      iconText: iconText ?? this.iconText,
      description: description ?? this.description,
      rating: rating ?? this.rating,
      year: year ?? this.year,
      views: views ?? this.views,
      rank: rank ?? this.rank,
      featured: featured ?? this.featured,
      isTrending: isTrending ?? this.isTrending,
      bannerUrl: bannerUrl ?? this.bannerUrl,
      duration: duration ?? this.duration,
      genre: genre ?? this.genre,
    );
  }
}
