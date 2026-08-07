---
name: Lumina Noir
colors:
  surface: '#181622'
  surface-dim: '#14121d'
  surface-bright: '#3a3744'
  surface-container-lowest: '#0f0d18'
  surface-container-low: '#1c1a26'
  surface-container: '#201e2a'
  surface-container-high: '#2b2835'
  surface-container-highest: '#363340'
  on-surface: '#e6e0f0'
  on-surface-variant: '#ccc3d8'
  inverse-surface: '#e6e0f0'
  inverse-on-surface: '#312f3b'
  outline: '#958da1'
  outline-variant: '#4a4455'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3f008e'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#732ee4'
  secondary: '#ddb7ff'
  on-secondary: '#490080'
  secondary-container: '#6f00be'
  on-secondary-container: '#d6a9ff'
  tertiary: '#ddb8ff'
  on-tertiary: '#490081'
  tertiary-container: '#844abe'
  on-tertiary-container: '#f2e0ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#f0dbff'
  secondary-fixed-dim: '#ddb7ff'
  on-secondary-fixed: '#2c0051'
  on-secondary-fixed-variant: '#6900b3'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb8ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#62259b'
  background: '#14121d'
  on-background: '#e6e0f0'
  surface-variant: '#363340'
  text-primary: '#FFFFFF'
  text-secondary: '#B3B3C6'
  glow-purple: rgba(124, 58, 237, 0.4)
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  margin-mobile: 20px
  margin-desktop: 48px
  gutter: 16px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style

The design system is engineered for a premium streaming aggregator experience, evoking a sense of cinematic immersion and high-tech sophistication. The brand personality is "The Conductor"—an authoritative yet effortless guide through the vast landscape of digital media. 

The visual style employs a refined **Glassmorphism** approach mixed with **Modern Corporate** reliability. It utilizes deep layered depth, soft neon-inspired glows, and significant negative space to create a "theater-mode" atmosphere that keeps the focus entirely on the content. The interface feels alive through the use of subtle background blurs and translucent surfaces that react to underlying imagery.

## Colors

The palette is anchored in a monochromatic purple spectrum to maintain a cohesive, high-end "night mode" aesthetic. 

- **Primary & Secondary:** Used for high-priority actions, progress indicators, and active states. 
- **Background & Surface:** The background (`#0D0B16`) is nearly black to ensure infinite depth on OLED screens, while the surface (`#181622`) provides necessary contrast for containerized content.
- **Accent & Glow:** Lavender tints and semi-transparent purple glows are used sparingly to highlight featured content and "hero" moments, creating a sense of luminescence without causing visual fatigue.

## Typography

This design system utilizes **Inter** for its exceptional legibility and modern, neutral characteristics which balance the expressive purple color palette.

- **Scale:** Large display styles are reserved for Hero titles and content discovery headers.
- **Hierarchy:** Use `label-md` for metadata (e.g., "IMDb 8.5", "4K", "2024") to provide high-density information without cluttering the UI.
- **Weight:** Bold and Extra Bold weights are prioritized for headlines to ensure they stand out against vibrant background gradients.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a focus on horizontal scrolling modules for mobile discovery. 

- **Mobile:** A single-column flow for vertical browsing, using a 4-column internal grid for smaller cards (statistics/chips). 
- **Margins:** Comfortable 20px side margins ensure content does not feel cramped against the bezel.
- **Spacing Rhythm:** Based on an 8px scale. Use `stack-md` for spacing between elements within a card, and `stack-lg` for spacing between distinct sections or sections headers.

## Elevation & Depth

Depth is achieved through **Backdrop Blurs** and **Tonal Layering** rather than traditional black shadows.

- **Level 1 (Base):** The core background.
- **Level 2 (Surfaces):** Cards and Search bars using a 1px inner stroke (border) with 10% white opacity to define edges.
- **Level 3 (Interactive):** Glassmorphic overlays with a `blur(12px)` and a subtle `glow-purple` outer shadow (0px 8px 24px) for active or featured states.
- **Hero Banners:** Utilize a radial gradient "underglow" that bleeds slightly behind the card to create a 3D floating effect.

## Shapes

The shape language is defined by oversized, friendly curves that mimic the hardware of modern mobile devices. 

- **Core Radius:** 24px is the standard for all primary content cards and hero containers.
- **Small Elements:** Buttons, input fields, and category chips should use a 12px or fully rounded (pill) radius to maintain the "soft" brand personality.
- **Consistency:** Ensure that nested elements (e.g., an image inside a card) have a slightly smaller radius (16px) to maintain visual concentricity.

## Components

### Glassmorphic Cards
- **Construction:** Background color `#181622` at 80% opacity, 1px border of white at 15% opacity.
- **Visuals:** Add a subtle purple drop shadow with a large spread (30px+) for "Featured" items.

### Navigation & Inputs
- **Bottom Nav:** A floating container with a high backdrop blur and primary purple icons for the active state.
- **Search Bar:** Pill-shaped, semi-transparent background, with an "Options" button that triggers a frosted glass bottom sheet.

### Action Buttons
- **Primary ("Open"):** Solid `#7C3AED` fill with white text.
- **Secondary ("Favorite"):** Ghost style with a purple border or a subtle glass background with a lavender heart icon.

### Category Chips
- **Interaction:** Horizontal scrolling. Inactive chips use a dark surface; active chips utilize a purple-to-lavender gradient.

### Hero Banners
- **Styling:** Dynamic height (approx 40% of viewport). Use "Vignette" overlays (black gradients at the bottom) to ensure typography remains legible over movie poster art.