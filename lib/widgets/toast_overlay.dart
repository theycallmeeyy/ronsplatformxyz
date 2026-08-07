import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/toast_provider.dart';

class ToastOverlay extends StatelessWidget {
  final Widget child;

  const ToastOverlay({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,

        // Top Right Floating Toast List
        Positioned(
          top: 70,
          right: 16,
          child: Consumer<ToastProvider>(
            builder: (context, toastProvider, _) {
              if (toastProvider.toasts.isEmpty) {
                return const SizedBox.shrink();
              }

              return SafeArea(
                child: SizedBox(
                  width: 320,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: toastProvider.toasts.map((toast) {
                      Color bgColor;
                      Color borderColor;
                      Color textColor;
                      IconData iconData;

                      switch (toast.type) {
                        case ToastType.success:
                          bgColor = const Color(0xE6064E3B); // emerald-950/90
                          borderColor = const Color(0x4D10B981); // emerald-500/30
                          textColor = const Color(0xFFA7F3D0); // emerald-200
                          iconData = Icons.check_circle;
                          break;
                        case ToastType.error:
                          bgColor = const Color(0xE64C0519); // rose-950/90
                          borderColor = const Color(0x4DF43F5E); // rose-500/30
                          textColor = const Color(0xFFFECDD3); // rose-200
                          iconData = Icons.error;
                          break;
                        case ToastType.info:
                        default:
                          bgColor = const Color(0xE63B0764); // purple-950/90
                          borderColor = const Color(0x4D7C3AED); // purple-500/30
                          textColor = const Color(0xFFE9D5FF); // purple-200
                          iconData = Icons.info;
                          break;
                      }

                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: bgColor,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: borderColor, width: 1),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.4),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Row(
                                children: [
                                  Icon(iconData, color: textColor, size: 20),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      toast.message,
                                      style: TextStyle(
                                        color: textColor,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            GestureDetector(
                              onTap: () => toastProvider.removeToast(toast.id),
                              child: Icon(Icons.close, color: textColor.withOpacity(0.7), size: 16),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
