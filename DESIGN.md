# Mosaic Home - Design Specification

## 🎨 Design Philosophy
Mosaic Home follows a **Modern Minimalist** aesthetic, blending **Glassmorphism** with **Bento Grid** layouts. The goal is to create a "zen" environment that is visually quiet yet highly functional.

## 🏛️ Core Principles

### 1. Visual Hierarchy & Typography
- **Primary Focus:** The Clock (Time) is the largest element, using thin font weights (`200` or `300`) to feel light despite its size.
- **Secondary Focus:** The Greeting and Quote provide context and inspiration without competing with the time.
- **Fluid Scale:** Typography should feel balanced across different screen sizes.

### 2. Glassmorphism (Backdrop Effects)
- **Surfaces:** Use semi-transparent backgrounds (`rgba(255, 255, 255, 0.1)` or `rgba(0, 0, 0, 0.3)`) paired with `backdrop-filter: blur()`.
- **Contrast:** When a background image is present, the UI elements must maintain legibility through background overlays and subtle text shadows.

### 3. Alignment & Grids
- **Alignment:** Centralized widget stack. The Greeting, Time, and Quote must share a vertical center axis.
- **Spacing:** Use a consistent 8px/4px based spacing system.
- **Bento Grid:** Bookmark icons should be housed in uniform "tiles" with rounded corners (`--radius-md`).

### 4. Interactive Feedback
- **Hover States:** Subtle scaling (`scale(1.05)`) and background shifts.
- **Transitions:** All state changes (modals, hover, search) use `0.3s ease` or `cubic-bezier(0.34, 1.56, 0.64, 1)` for a "bouncy" premium feel.

## 🛠️ Components

### The Widget Stack
Located at the top-center, the stack includes:
1. **Greeting:** Small, uppercase, letter-spaced (`2px`).
2. **Time:** Large, ultra-light.
3. **Date:** Medium, secondary color.
4. **Quote:** Small, italic, restricted width for readability.

### Search Bar
- Pill-shaped (`border-radius: 9999px`).
- Deep focus shadows to indicate active state.

### FAB (Floating Action Button)
- Glassmorphic style when a background is set.
- Offset from the bottom-right corner for ergonomic reach.
