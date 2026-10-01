// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ronkws_streaming_hub/screens/age_gate_screen.dart';

void main() {
  testWidgets('Age gate lets adults continue', (WidgetTester tester) async {
    var continued = false;
    await tester.pumpWidget(
      MaterialApp(
        home: AgeGateScreen(onContinue: () => continued = true),
      ),
    );

    expect(find.text('Before you enter'), findsOneWidget);
    await tester.tap(find.text('I’m 18 or older, continue'));
    expect(continued, isTrue);
  });

  testWidgets('Underage selection blocks access', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: AgeGateScreen(onContinue: () {}),
      ),
    );

    await tester.tap(find.text('I’m under 18, exit'));
    await tester.pump();

    expect(find.text('Access unavailable'), findsOneWidget);
    expect(find.text('You can’t continue to Ronkws.'), findsOneWidget);
  });
}
