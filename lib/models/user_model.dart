class UserModel {
  final String id;
  final String name;
  final String email;
  final String password;
  final String role; // 'user' or 'admin'
  final String avatar;
  final String memberSince;
  final String bio;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.password,
    required this.role,
    required this.avatar,
    required this.memberSince,
    required this.bio,
  });

  bool get isAdmin => role == 'admin';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      password: json['password'] as String,
      role: json['role'] as String? ?? 'user',
      avatar: json['avatar'] as String? ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      memberSince: json['memberSince'] as String? ?? '2024',
      bio: json['bio'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'password': password,
      'role': role,
      'avatar': avatar,
      'memberSince': memberSince,
      'bio': bio,
    };
  }

  UserModel copyWith({
    String? id,
    String? name,
    String? email,
    String? password,
    String? role,
    String? avatar,
    String? memberSince,
    String? bio,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      password: password ?? this.password,
      role: role ?? this.role,
      avatar: avatar ?? this.avatar,
      memberSince: memberSince ?? this.memberSince,
      bio: bio ?? this.bio,
    );
  }
}
