import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

class CinematicIntro extends StatefulWidget {
  final VoidCallback onComplete;

  const CinematicIntro({super.key, required this.onComplete});

  @override
  State<CinematicIntro> createState() => _CinematicIntroState();
}

enum IntroPhase { black, reveal, sweep, hold, fade }

class _CinematicIntroState extends State<CinematicIntro> with SingleTickerProviderStateMixin {
  IntroPhase _phase = IntroPhase.black;
  late AnimationController _sweepController;

  Timer? _t1, _t2, _t3, _t4, _t5;

  @override
  void initState() {
    super.initState();

    _sweepController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );

    // Sequence timers
    _t1 = Timer(const Duration(milliseconds: 500), () {
      if (mounted) {
        setState(() => _phase = IntroPhase.reveal);
      }
    });

    _t2 = Timer(const Duration(milliseconds: 1700), () {
      if (mounted) {
        setState(() => _phase = IntroPhase.sweep);
        _sweepController.forward(from: 0.0);
      }
    });

    _t3 = Timer(const Duration(milliseconds: 2500), () {
      if (mounted) {
        setState(() => _phase = IntroPhase.hold);
      }
    });

    _t4 = Timer(const Duration(milliseconds: 3500), () {
      if (mounted) {
        setState(() => _phase = IntroPhase.fade);
      }
    });

    _t5 = Timer(const Duration(milliseconds: 4000), () {
      if (mounted) {
        widget.onComplete();
      }
    });
  }

  @override
  void dispose() {
    _sweepController.dispose();
    _t1?.cancel();
    _t2?.cancel();
    _t3?.cancel();
    _t4?.cancel();
    _t5?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isFade = _phase == IntroPhase.fade;

    return AnimatedOpacity(
      opacity: isFade ? 0.0 : 1.0,
      duration: const Duration(milliseconds: 500),
      child: Container(
        color: Colors.black,
        width: double.infinity,
        height: double.infinity,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Background Subtle Glow
            Container(
              decoration: const BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.center,
                  radius: 0.8,
                  colors: [
                    Color(0x3327272A), // Zinc-900 20%
                    Colors.black,
                  ],
                ),
              ),
            ),

            // Main Logo Reveal Box
            AnimatedScale(
              scale: _phase == IntroPhase.black
                  ? 0.85
                  : _phase == IntroPhase.fade
                      ? 1.05
                      : 1.0,
              duration: const Duration(milliseconds: 1200),
              curve: Curves.easeOutCubic,
              child: AnimatedOpacity(
                opacity: _phase == IntroPhase.black ? 0.0 : 1.0,
                duration: const Duration(milliseconds: 800),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Glow Container Box behind logo
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        // Soft Glow Effect behind box
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 1000),
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _phase == IntroPhase.reveal
                                ? Colors.white.withOpacity(0.3)
                                : _phase == IntroPhase.sweep
                                    ? AppTheme.accentRose.withOpacity(0.5)
                                    : _phase == IntroPhase.hold
                                        ? AppTheme.primaryPurple.withOpacity(0.4)
                                        : Colors.transparent,
                            boxShadow: [
                              BoxShadow(
                                color: _phase == IntroPhase.sweep
                                    ? AppTheme.accentRose.withOpacity(0.6)
                                    : AppTheme.primaryPurple.withOpacity(0.5),
                                blurRadius: 40,
                                spreadRadius: 10,
                              ),
                            ],
                          ),
                        ),

                        // Logo Card Box
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(32),
                            gradient: const LinearGradient(
                              colors: [
                                Color(0xFF7C3AED),
                                Color(0xFF4C1D95),
                                Color(0xFF1E1B4B),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            border: Border.all(
                              color: AppTheme.primaryPurple.withOpacity(0.5),
                              width: 1.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.primaryPurple.withOpacity(0.5),
                                blurRadius: 30,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              Text(
                                'R',
                                style: GoogleFonts.inter(
                                  fontSize: 64,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                  letterSpacing: 2,
                                  shadows: [
                                    Shadow(
                                      color: Colors.black.withOpacity(0.8),
                                      blurRadius: 12,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                              ),

                              // Red Sweep Laser Animation Overlay
                              if (_phase == IntroPhase.sweep || _phase == IntroPhase.hold)
                                AnimatedBuilder(
                                  animation: _sweepController,
                                  builder: (context, child) {
                                    return Positioned(
                                      left: (_sweepController.value * 240) - 60,
                                      child: Transform.rotate(
                                        angle: -0.3,
                                        child: Container(
                                          width: 35,
                                          height: 180,
                                          decoration: BoxDecoration(
                                            gradient: LinearGradient(
                                              colors: [
                                                Colors.transparent,
                                                AppTheme.accentRose.withOpacity(0.8),
                                                Colors.transparent,
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    // Brand Typography
                    Column(
                      children: [
                        AnimatedDefaultTextStyle(
                          duration: const Duration(milliseconds: 700),
                          style: GoogleFonts.inter(
                            fontSize: 36,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -1,
                            color: _phase == IntroPhase.hold ? Colors.white : AppTheme.lightPurple,
                          ),
                          child: const Text('RONKWS'),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'STREAMING HUB',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 4.0,
                            color: AppTheme.lightPurple.withOpacity(0.8),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
