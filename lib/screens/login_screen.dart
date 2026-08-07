import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  String _mode = 'login'; // 'login' or 'signup'

  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _showPassword = false;

  String? _nameError;
  String? _emailError;
  String? _passwordError;

  void _fillUserDemo() {
    setState(() {
      _emailController.text = 'user@ronkws.com';
      _passwordController.text = 'password123';
      _emailError = null;
      _passwordError = null;
    });
  }

  void _fillAdminDemo() {
    setState(() {
      _emailController.text = 'admin@ronkws.com';
      _passwordController.text = 'admin123';
      _emailError = null;
      _passwordError = null;
    });
  }

  void _handleSubmit() {
    setState(() {
      _emailError = _validateEmail(_emailController.text);
      _passwordError = _validatePassword(_passwordController.text);
      if (_mode == 'signup') {
        _nameError = _nameController.text.trim().isEmpty ? 'Full name is required' : null;
      } else {
        _nameError = null;
      }
    });

    if (_emailError != null || _passwordError != null || _nameError != null) {
      return;
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (_mode == 'login') {
      auth.login(_emailController.text, _passwordController.text);
    } else {
      auth.signup(_nameController.text, _emailController.text, _passwordController.text);
    }
  }

  String? _validateEmail(String val) {
    if (val.trim().isEmpty) return 'Email is required';
    final regex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    if (!regex.hasMatch(val.trim())) return 'Please enter a valid email address';
    return null;
  }

  String? _validatePassword(String val) {
    if (val.isEmpty) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return null;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 440),
            padding: const EdgeInsets.all(32),
            decoration: AppTheme.glassDecoration(
              borderRadius: 28,
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryPurple.withOpacity(0.2),
                  blurRadius: 32,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Logo Badge
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    gradient: AppTheme.primaryGradient,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryPurple.withOpacity(0.5),
                        blurRadius: 25,
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      'R',
                      style: GoogleFonts.inter(fontSize: 40, fontWeight: FontWeight.w900, color: Colors.white),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Ronkws Streaming Hub',
                  style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 16),

                // Title & Subtitle
                Text(
                  _mode == 'login' ? 'Welcome Back' : 'Create Account',
                  style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white),
                ),
                const SizedBox(height: 4),
                Text(
                  _mode == 'login'
                      ? 'Your streaming everything starts here.'
                      : 'Join thousands enjoying unlimited entertainment.',
                  style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),

                // Form Fields
                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      if (_mode == 'signup') ...[
                        TextFormField(
                          controller: _nameController,
                          style: const TextStyle(color: Colors.white, fontSize: 14),
                          decoration: InputDecoration(
                            hintText: 'Full name',
                            prefixIcon: const Icon(Icons.person, color: AppTheme.textSecondary, size: 20),
                            errorText: _nameError,
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      TextFormField(
                        controller: _emailController,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          hintText: 'Email address',
                          prefixIcon: const Icon(Icons.email, color: AppTheme.textSecondary, size: 20),
                          errorText: _emailError,
                        ),
                      ),
                      const SizedBox(height: 16),

                      TextFormField(
                        controller: _passwordController,
                        obscureText: !_showPassword,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          hintText: 'Password',
                          prefixIcon: const Icon(Icons.lock, color: AppTheme.textSecondary, size: 20),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _showPassword ? Icons.visibility : Icons.visibility_off,
                              color: AppTheme.textSecondary,
                              size: 20,
                            ),
                            onPressed: () => setState(() => _showPassword = !_showPassword),
                          ),
                          errorText: _passwordError,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Submit Button
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: _handleSubmit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryPurple,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                            elevation: 8,
                            shadowColor: AppTheme.primaryPurple.withOpacity(0.5),
                          ),
                          child: Text(
                            _mode == 'login' ? 'Sign In' : 'Create Account',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Mode Switcher
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      _mode == 'login' ? "Don't have an account?" : 'Already have an account?',
                      style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                    ),
                    TextButton(
                      onPressed: () {
                        setState(() {
                          _mode = _mode == 'login' ? 'signup' : 'login';
                          _nameError = null;
                          _emailError = null;
                          _passwordError = null;
                        });
                      },
                      child: Text(
                        _mode == 'login' ? 'Create Account' : 'Sign In',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.lightPurple),
                      ),
                    ),
                  ],
                ),

                const Divider(color: AppTheme.glassBorder, height: 32),

                // Quick Demo Login Buttons
                Text(
                  'QUICK TEST LOGIN',
                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.textMuted, letterSpacing: 1.2),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    OutlinedButton(
                      onPressed: _fillUserDemo,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.lightPurple,
                        side: const BorderSide(color: AppTheme.glassBorder),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      child: const Text('User Demo', style: TextStyle(fontSize: 12)),
                    ),
                    const SizedBox(width: 12),
                    OutlinedButton(
                      onPressed: _fillAdminDemo,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.accentAmber,
                        side: const BorderSide(color: AppTheme.glassBorder),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      child: const Text('Admin Demo', style: TextStyle(fontSize: 12)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
