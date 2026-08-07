import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Color Palette Constants
  static const Color background = Color(0xFF14121D);
  static const Color cardBg = Color(0xFF181622);
  static const Color cardBgElevated = Color(0xFF1F1C2E);
  static const Color glassBorder = Color(0x26FFFFFF); // 15% White
  static const Color glassBorderSubtle = Color(0x1AFFFFFF); // 10% White

  static const Color primaryPurple = Color(0xFF7C3AED);
  static const Color primaryPurpleHover = Color(0xFF6D28D9);
  static const Color lightPurple = Color(0xFFD8B4FE);
  static const Color accentIndigo = Color(0xFF4F46E5);
  static const Color accentRose = Color(0xFFF43F5E);
  static const Color accentAmber = Color(0xFFF59E0B);
  static const Color accentEmerald = Color(0xFF10B981);

  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFA1A1AA); // Zinc-400
  static const Color textMuted = Color(0xFF71717A); // Zinc-500

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF7C3AED), Color(0xFF4F46E5)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient textGradient = LinearGradient(
    colors: [Color(0xFFD8B4FE), Color(0xFFC7D2FE), Color(0xFFC084FC)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const RadialGradient heroGlowGradient = RadialGradient(
    center: Alignment.center,
    radius: 0.8,
    colors: [Color(0x3D7C3AED), Color(0x0014121D)],
  );

  // Glass Card Decoration Helper
  static BoxDecoration glassDecoration({
    Color? color,
    Color? borderColor,
    double borderRadius = 24.0,
    List<BoxShadow>? boxShadow,
  }) {
    return BoxDecoration(
      color: color ?? cardBg.withOpacity(0.85),
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: borderColor ?? glassBorder,
        width: 1.0,
      ),
      boxShadow: boxShadow ??
          [
            BoxShadow(
              color: primaryPurple.withOpacity(0.12),
              blurRadius: 24,
              spreadRadius: 0,
              offset: const Offset(0, 8),
            ),
          ],
    );
  }

  // Theme Data Definition
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: primaryPurple,
      colorScheme: const ColorScheme.dark(
        primary: primaryPurple,
        secondary: accentIndigo,
        surface: cardBg,
        error: accentRose,
      ),
      textTheme: GoogleFonts.interTextTheme(
        ThemeData.dark().textTheme.apply(
              bodyColor: textPrimary,
              displayColor: textPrimary,
            ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cardBg.withOpacity(0.8),
        hintStyle: GoogleFonts.inter(color: textMuted, fontSize: 14),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(24),
          borderSide: const BorderSide(color: glassBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(24),
          borderSide: const BorderSide(color: glassBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(24),
          borderSide: const BorderSide(color: primaryPurple, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(24),
          borderSide: const BorderSide(color: accentRose),
        ),
      ),
    );
  }
}
