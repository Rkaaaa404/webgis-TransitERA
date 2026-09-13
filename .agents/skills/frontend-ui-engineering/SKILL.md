---
name: frontend-ui-engineering
description: "Production-quality frontend UI engineering for TransitERA WebGIS. Covers React 19 / Next.js App Router component architecture, MapLibre GL JS interactive map patterns, H3 choropleth rendering, Recharts radar charts, Tailwind CSS, responsive mobile bottom sheets, accessibility, and Lighthouse ≥ 85 performance targets."
---

# Frontend UI Engineering (TransitERA)

Production engineering guidelines for **TransitERA WebGIS**, built with **Next.js 16 (App Router + Turbopack), React 19, MapLibre GL JS, Tailwind CSS, and Recharts**.

---

## 1. Component Architecture

### Project File Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout + Fonts + Theme Provider
│   ├── page.tsx                # Main WebGIS Single-Page App (Split View)
│   ├── metodologi/page.tsx     # Methodology & Data Sources Documentation
│   └── survey/page.tsx         # Field Survey Gallery & Documentation
├── components/
│   ├── map/
│   │   ├── MapContainer.tsx    # MapLibre instance & viewport controller
│   │   ├── H3ChoroplethLayer.tsx # H3 TOD Score & NJOP Premium layer
│   │   ├── StationMarkers.tsx  # SRRL commuter stations & feeder stops
│   │   ├── SurveyPointsLayer.tsx # Activity & Mission crowdsourced survey points
│   │   └── LayerControl.tsx    # Layer toggles & dynamic color ramps
│   ├── dashboard/
│   │   ├── Scorecard5D.tsx     # Numeric scorecards for 5D TOD dimensions
│   │   ├── RadarChart5D.tsx    # Recharts 5D radar comparison
│   │   └── ScenarioSimulator.tsx # What-if policy intervention slider
│   ├── ai/
│   │   ├── AIChatPanel.tsx     # Spatial AI chat bubble & streaming UI
│   │   └── CuratedPromptChips.tsx # Pre-curated quick action chips
│   └── ui/
│       ├── MobileBottomSheet.tsx # Draggable drawer for mobile viewports
│       └── HeaderNav.tsx       # Header, station selector, theme toggle
```

### Component Design Principles
- **Composition over Configuration**: Prefer composable primitives (`<CardHeader>`, `<CardBody>`) over rigid multi-prop wrappers.
- **Separate Data Fetching from Presentation**: Containers manage state and SWR/fetch; presentation components remain pure and testable.
- **Single Responsibility**: Each component should perform one clear presentation or interaction role.

---

## 2. Strict Anti-Emoji & Iconography Standards

> [!IMPORTANT]
> **STRICT PROHIBITION OF RAW UNICODE EMOJIS IN PRODUCTION UI**
> Never use raw Unicode emoji characters (e.g., 🚏, 🌊, 🚄, ✨, 👁️, 📈, 🚀, 💡, 🏷️) in interface copy, button labels, dashboard cards, badges, map popups, or dialog modals.

### Why Emojis are Banned:
1. **Cross-Platform Rendering Inconsistency**: Emojis render drastically differently across Windows, macOS, iOS, Android, and Linux, distorting vertical alignment and visual hierarchy.
2. **Unprofessional Appearance**: Raw emojis produce an amateur, prototype feel rather than an authoritative, competition-ready WebGIS application.
3. **Screen Reader (a11y) Barriers**: Screen readers announce literal emoji names aloud, degrading accessibility.

### Mandatory UI Icon Standard:
- **Lucide Icons (`lucide-react`)**: Default standard for all iconography:
  - Transit Stations: `<TrainFront className="w-4 h-4 text-sky-400" />`
  - Bus Feeders: `<Bus className="w-4 h-4 text-emerald-400" />`
  - Flood Hazard: `<CloudRain className="w-4 h-4 text-blue-400" />`
  - Night Light (NTL) / AI: `<Sparkles className="w-4 h-4 text-amber-400" />`
  - Survey Points: `<Eye className="w-4 h-4 text-cyan-400" />`
  - Geography / Markers: `<MapPin className="w-4 h-4 text-brand-lime" />`
  - Analytics: `<TrendingUp className="w-4 h-4" />` or `<BarChart3 className="w-4 h-4" />`
- **Accessible Primitives**: Use Radix UI / shadcn `<Badge>`, `<Tooltip>`, `<Dialog>`, `<Popover>`, `<Slider>`.

---

## 3. Evil Martians Tailwind CSS Best Practices

1. **Prune Redundant Utility Classes**:
   - `pt-4 pb-4` → `py-4`
   - `flex flex-row justify-between` → `flex justify-between` (`flex-row` is default)
   - `border border-dotted border-2 border-black border-opacity-50` → `border-dotted border-2 border-black/50`
2. **Semantic Design Tokens Over Magic Values**:
   - Never use arbitrary values like `p-[13px]` or `text-[#aabbcc]`. Use semantic tokens (`p-3`, `text-slate-400`, `bg-brand-indigo`).
3. **Avoid `@apply` for Style Extraction**:
   - Extract repeating markup into reusable React components rather than creating synthetic CSS classes.
4. **Use Fixed Variant Maps for Shared Components**:
   ```tsx
   const BADGE_VARIANTS = {
     todHigh: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
     todMedium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
     todLow: "bg-rose-500/20 text-rose-400 border-rose-500/30",
   };
   ```

---

## 4. Next.js 16 & React 19 Standards

1. **Async Request APIs**:
   - In Next.js 16, `params`, `searchParams`, `cookies()`, and `headers()` are asynchronous. Always use `await params`.
2. **Server Components by Default**:
   - Root layouts, static documentation, and metadata remain Server Components. Mark `"use client"` only on interactive leaf components.
3. **Dynamic Import for Heavy Client Libraries**:
   - Load MapLibre GL JS and Recharts dynamically with `ssr: false`:
   ```tsx
   const DynamicMapContainer = dynamic(() => import('@/components/map/MapContainer'), {
     ssr: false,
     loading: () => <MapSkeleton />,
   });
   ```
4. **Eliminate Request Waterfalls**:
   - Use `Promise.all()` when requesting multiple spatial layers or endpoints.

---

## 5. Performance & WebGL Lifecycle (Lighthouse ≥ 85)

1. **Viewport-based Layer Fetching**: Load heavy survey and parcel points only when zoom level $\ge 12$.
2. **WebGL Context Cleanup**: Always unmount MapLibre instances cleanly:
   ```typescript
   useEffect(() => {
     return () => {
       mapInstance?.remove();
     };
   }, [mapInstance]);
   ```
3. **Core Web Vitals Targets**:
   - **LCP** $\le 2.5\text{s}$
   - **FCP** $< 1.8\text{s}$
   - **INP** $\le 200\text{ms}$
   - **CLS** $\le 0.1$
