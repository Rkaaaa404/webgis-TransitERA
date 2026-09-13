---
name: mapid-maps-integration
description: Comprehensive integration guide for MAPID MAPS Basemaps (Street 3D/2D, Street 2D, Dark, Light, Satellite across GL Style, TileJSON, WMTS, XYZ formats in MapLibre GL JS), MAPID Data Catalog ingestion, and GEO MAPID REST API survey synchronization.
---

# MAPID MAPS & GEO MAPID API Integration Guide (TransitERA)

Official integration guide for **MAPID MAPS** basemaps, **MAPID Data Catalog** spatial datasets, and **GEO MAPID** survey synchronization REST APIs in **TransitERA WebGIS**.

---

## 1. MAPID MAPS Basemap Catalog & Endpoints

MAPID MAPS provides 5 official styles supporting **GL Style**, **TileJSON**, **WMTS**, and **XYZ**:

| Style | Key | GL Style URL Format | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **Dark Mapid** | `dark` | `https://basemap.mapid.io/styles/dark/style.json?key={KEY}` | **Primary WebGIS Theme**: Maximum contrast for H3 choropleths, TOD scores, and glow overlays. |
| **Street Mapid** | `basic` | `https://basemap.mapid.io/styles/basic/style.json?key={KEY}` | Urban navigation, 3D extruded buildings, and feeder transit routing. |
| **Street 2D** | `street-2d-building` | `https://basemap.mapid.io/styles/street-2d-building/style.json?key={KEY}` | Lightweight mode for low-power mobile devices or heavy polygon overlays. |
| **Light Mapid** | `light` | `https://basemap.mapid.io/styles/light/style.json?key={KEY}` | Clean aesthetic for formal reporting, print exports, and methodology documentation. |
| **Satellite** | `satellite` | `https://basemap.mapid.io/styles/satellite/style.json?key={KEY}` | High-res satellite verification of railway right-of-ways, physical infrastructure, and land cover. |

### Fallback Architecture in Next.js (`src/lib/mapid.ts`)
To prevent black screens when MAPID API keys are unconfigured during local development or network outages:

```typescript
export const FALLBACK_BASEMAP_STYLES: Record<string, string> = {
  street: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  'street-2d': 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  satellite: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
};

const MAPID_KEY = process.env.NEXT_PUBLIC_MAPID_API_KEY || '';

export const BASEMAP_STYLES: Record<string, string> = {
  street: MAPID_KEY ? `https://basemap.mapid.io/styles/basic/style.json?key=${MAPID_KEY}` : FALLBACK_BASEMAP_STYLES.street,
  'street-2d': MAPID_KEY ? `https://basemap.mapid.io/styles/street-2d-building/style.json?key=${MAPID_KEY}` : FALLBACK_BASEMAP_STYLES['street-2d'],
  dark: MAPID_KEY ? `https://basemap.mapid.io/styles/dark/style.json?key=${MAPID_KEY}` : FALLBACK_BASEMAP_STYLES.dark,
  light: MAPID_KEY ? `https://basemap.mapid.io/styles/light/style.json?key=${MAPID_KEY}` : FALLBACK_BASEMAP_STYLES.light,
  satellite: MAPID_KEY ? `https://basemap.mapid.io/styles/satellite/style.json?key=${MAPID_KEY}` : FALLBACK_BASEMAP_STYLES.satellite,
};
```

---

## 2. GEO MAPID REST API (Survey Data Synchronization)

To fetch field survey points (*Community Maps Activity* with hashtag `#PakSibukGa` and *Missions*):

- **Endpoint**: `https://server.mapid.io/web/competition/`
- **Method**: `POST`
- **Headers**:
  - `Content-Type`: `application/json`
  - `X-API-KEY`: Loaded securely from `MAPID_API_KEY` in backend `.env` (Never exposed to frontend).

### Request Payload Example:
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [112.70, -7.36],
        [112.80, -7.36],
        [112.80, -7.20],
        [112.70, -7.20],
        [112.70, -7.36]
      ]
    ]
  },
  "offset": 0,
  "hashtag": ["PakSibukGa"]
}
```

### Operational Rules & Pagination:
1. **Batch Limits**: Maximum **60 features** per batch for Activity data; **100 features** for Mission data.
2. **Maintenance Window**: MAPID servers undergo daily maintenance between **16:00 - 17:00 WIB**. Backend must fall back to local calibrated GeoJSON points during this period.
3. **Graceful Fallback**: If `MAPID_API_KEY` is unset or MAPID server returns non-200, backend serves the 100 calibrated field survey records from local storage.
