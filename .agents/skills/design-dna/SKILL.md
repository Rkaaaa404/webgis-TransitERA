---
name: design-dna
description: Extract, define, and apply 3-dimensional design DNA (Design System tokens, Qualitative Design Style, and Visual Effects like MapLibre GL WebGL shaders, glassmorphism, and micro-interactions). Use when refining UI aesthetics, establishing color palettes, designing cartographic visual assets, or ensuring a WOW factor.
license: MIT
---

# Design DNA for TransitERA WebGIS

A 3-dimensional methodology for crafting a world-class, premium design identity for TransitERA WebGIS.

## The Three Dimensions

1. **Design System (Tokens & Measurables)**:
   - **Palette**: Dark theme foundation (`#090d16`), Slate dark surfaces (`#0f172a`, `#1e293b`), Brand Indigo (`#6366f1`), Lime accent (`#84cc16`), Cyan/Teal indicators (`#14b8a6`).
   - **Typography**: Inter / Outfit modern sans-serif typography scales with crisp tabular numbers for coordinates and TOD scores.
   - **Spacing & Elevation**: Consistent 4px grid (`gap-2`, `p-4`, `p-6`), frosted glass backdrop blur (`backdrop-blur-md bg-slate-900/80 border border-slate-800/80`), subtle glow drop shadows.

2. **Design Style (Qualitative Feel & Perception)**:
   - **Archetype**: Futuristic Transit Command Center / High-Tech Geospatial Cockpit.
   - **Mood**: Authoritative, sleek, data-dense yet accessible and intuitive.
   - **Iconography**: Clean, vector-only Lucide icons (`lucide-react`). **Zero raw emojis** in any cards, popups, or badges.

3. **Visual Effects (WebGL & Special Rendering)**:
   - **MapLibre GL JS Cartography**:
     - 3D extruded building layers (`fill-extrusion`) colored dynamically by typology.
     - Pulsing survey beacon markers with subtle SVG/CSS keyframe radar waves.
     - Smooth H3 choropleth color ramp transitions with customized easing curves.
   - **Micro-Animations**:
     - Hover scale & border illumination (`transition-all duration-200 hover:border-indigo-500/50`).
     - Recharts radar chart animated radial sweeps on metric selection.
     - Smooth sheet drawer transitions on mobile viewports.

## Workflow: Apply DNA to New Features

1. **Token First**: Define tokens in Tailwind / CSS custom variables before writing JSX.
2. **Component Isolation**: Use semantic component wrappers instead of copy-pasting raw utility classes.
3. **Motion & Feedback**: Add tactile feedback for every user interaction (hover, click, active layer toggle).
4. **Contrast & Legibility**: Verify WCAG AA contrast (≥ 4.5:1) for all data overlays on top of the dark basemap.
