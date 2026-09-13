---
name: Intelligent Spatial Engine
colors:
  surface: '#121316'
  surface-dim: '#121316'
  surface-bright: '#38393c'
  surface-container-lowest: '#0d0e11'
  surface-container-low: '#1a1c1e'
  surface-container: '#1e2022'
  surface-container-high: '#292a2d'
  surface-container-highest: '#343538'
  on-surface: '#e3e2e6'
  on-surface-variant: '#c4c6cf'
  inverse-surface: '#e3e2e6'
  inverse-on-surface: '#2f3033'
  outline: '#8e9099'
  outline-variant: '#43474e'
  surface-tint: '#adc7f7'
  primary: '#adc7f7'
  on-primary: '#133057'
  primary-container: '#1a365d'
  on-primary-container: '#86a0cd'
  inverse-primary: '#455f88'
  secondary: '#ffb786'
  on-secondary: '#502400'
  secondary-container: '#f27a00'
  on-secondary-container: '#542600'
  tertiary: '#f2bc82'
  on-tertiary: '#482900'
  tertiary-container: '#4f2e00'
  on-tertiary-container: '#c6955e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#adc7f7'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#ffdcc6'
  secondary-fixed-dim: '#ffb786'
  on-secondary-fixed: '#311300'
  on-secondary-fixed-variant: '#723600'
  tertiary-fixed: '#ffddba'
  tertiary-fixed-dim: '#f2bc82'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#633f0f'
  background: '#121316'
  on-background: '#e3e2e6'
  surface-variant: '#343538'
  success-green: '#2e7d32'
  alert-red: '#d32f2f'
  map-surface: '#0b1421'
  panel-glass: rgba(26, 54, 93, 0.7)
  h3-outline: '#4a5568'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 16px
  margin-edge: 24px
  panel-width-lg: 400px
  panel-width-sm: 320px
---

## Brand & Style

The brand personality is **Technical, Visionary, and Authoritative**. This design system is built to transform raw geospatial data into a "Decision Support System" that speaks to high-stakes urban planning and investment. The core narrative, "Maps That Think!", positions the interface not as a static viewer, but as an active analytical partner.

The visual style is **Corporate / Modern** with a **Glassmorphic** overlay system.
- **Glassmorphism**: Side panels and floating widgets use frosted-glass effects to maintain a sense of spatial context, ensuring the map (the primary source of truth) is never entirely obscured.
- **Data-Centricity**: The aesthetic prioritizes information density. It uses the H3 hexagonal framework as a fundamental design motif, influencing everything from data visualization to grid patterns in the UI.
- **Atmosphere**: Professional, high-contrast, and focused. The interface should feel like a "Mission Control" for urban development.

## Colors

The system defaults to **Dark Mode** to reduce eye strain during long analytical sessions and to make chromatic data layers (Choropleths) pop against a high-contrast background.

- **Primary (Deep Transit Blue)**: Used for structural UI elements, sidebars, and primary navigation backgrounds. It evokes stability and institutional trust.
- **Secondary (KAI Orange)**: The action color. Used for interactive highlights, "FlyTo" focus states, and primary CTA buttons.
- **Success Green**: Specifically reserved for "TOD Readiness" scores and positive economic growth indicators.
- **Alert Red**: Dedicated to flood risk zones and critical infrastructure warnings.
- **Neutrals**: A range of professional grays tailored for dark mode. Avoid pure black; use `#0b1421` for the map base to maintain depth.

## Typography

The system utilizes **Inter** for its neutral, highly legible character at varying scales, essential for dense dashboards. **JetBrains Mono** is introduced for spatial coordinates, SQL queries, and tabular data to reinforce the "Intelligent/Technical" persona.

- **Headlines**: Tight letter spacing and bold weights for clear section hierarchy.
- **Data Labels**: Use `data-mono` for all numeric values in side panels and radar charts to ensure columns align perfectly and numbers are easy to scan.
- **Readability**: On mobile, headings scale down to prevent text wrapping issues in narrow side-panels or bottom-sheets.

## Layout & Spacing

The layout uses a **Fluid Grid** model centered around the map viewport. 

- **Desktop**: A fixed-width left sidebar (filters/navigation) and a collapsible right-side "AI Agent" panel. This creates a focused central mapping "stage."
- **Mobile**: Content reflows into a draggable **Bottom Sheet** system. The map remains the base layer, with UI controls accessible via a bottom navigation bar.
- **Spatial Rhythm**: Components follow an 8px square grid. However, the data visualization layer is governed by the **H3 Hexagonal Grid** (Resolution 8/9), which dictates the spacing of spatial markers and heatmaps.
- **Breakpoints**: 
    - Mobile: < 768px (Bottom Sheet active).
    - Tablet: 768px - 1024px (Side panels condensed to icons).
    - Desktop: > 1024px (Full panels visible).

## Elevation & Depth

Hierarchy is established through **Glassmorphism** and **Tonal Layering**.

- **Level 0 (Base)**: The Dark Mode Map.
- **Level 1 (Data Layer)**: Semi-transparent H3 Hexagonal choropleths (0.6 opacity) that allow the map's labels to peek through.
- **Level 2 (Panels)**: Surface containers using `panel-glass` with a 12px backdrop-blur. This provides a clear separation from the map without feeling like a heavy "wall" of color.
- **Level 3 (Popups/Modals)**: Sharp, high-contrast cards with a subtle 2px solid border in the persona-specific color (e.g., Orange for KAI, Green for Gov) and a soft ambient shadow (0px 8px 24px rgba(0,0,0,0.4)) to suggest physical projection above the map.

## Shapes

The design system uses **Soft (0.25rem)** roundedness for standard UI elements like input fields and small buttons. This maintains a professional, "engineered" look that isn't overly playful.

**Exceptions**:
- **Hexagons**: All spatial data containers must follow the H3 hexagonal geometry (6-sided, sharp corners) to maintain mathematical accuracy.
- **Status Pills**: Use `rounded-full` (pill-shape) for status indicators (e.g., "Active," "High Risk") to distinguish them from interactive action buttons.
- **Radar Charts**: Five-sided geometric shapes for AHP evaluation metrics.

## Components

- **Buttons**: Primary buttons use the KAI Orange (#f57c00) with `headline-md` weight. Ghost buttons (outline only) are used for secondary map controls to minimize visual noise.
- **AI Agent Panel**: A chat-style interface integrated into a glassmorphic sidebar. Agent responses use `body-lg` for readability and include "Action Tags" that zoom the map when clicked.
- **H3 Data Cards**: Small, floating tooltips that appear on hex-hover. They should display a "Radar Chart" summary and key metrics in `data-mono`.
- **Input Fields**: Dark backgrounds with 1px `h3-outline` borders. The focus state uses a 2px KAI Orange glow.
- **Chips/Badges**: Small, categorical indicators using `label-caps`. Color-coded by transit mode (e.g., Train: Blue, Bus: Green).
- **Bottom Sheet (Mobile)**: A draggable handle component that allows the user to swipe up for full-screen analytics or swipe down to maximize map visibility.
- **Legend**: A fixed floating widget in the bottom-right, using clear color swatches to define the H3 choropleth scales.