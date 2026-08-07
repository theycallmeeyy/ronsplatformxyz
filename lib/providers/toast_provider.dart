import 'dart:async';
import 'package:flutter/foundation.dart';

enum ToastType { success, error, info }

class ToastMessage {
  final String id;
  final String message;
  final ToastType type;

  ToastMessage({
    required this.id,
    required this.message,
    required this.type,
  });
}

class ToastProvider extends ChangeNotifier {
  final List<ToastMessage> _toasts = [];

  List<ToastMessage> get toasts => List.unmodifiable(_toasts);

  void showToast(String message, [ToastType type = ToastType.info]) {
    final String id = '${DateTime.now().millisecondsSinceEpoch}_${_toasts.length}';
    final toast = ToastMessage(id: id, message: message, type: type);
    _toasts.add(toast);
    notifyListeners();

    Timer(const Duration(seconds: 4), () {
      removeToast(id);
    });
  }

  void removeToast(String id) {
    _toasts.removeWhere((t) => t.id == id);
    notifyListeners();
  }
}
