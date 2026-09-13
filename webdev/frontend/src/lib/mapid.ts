// ==============================================================================
// TransitERA Basemap & Cartographic Configuration
// Supports MAPID GL Style with Graceful Fallback to High-Speed Carto Vector Styles
// ==============================================================================

export const FALLBACK_BASEMAP_STYLES: Record<string, string> = {
  // Carto Voyager (Clean Street Navigation Vector Style)
  street: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',

  // Carto Voyager 2D
  'street-2d': 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',

  // Carto Dark Matter (Sleek Dark Theme for TOD Analysis)
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',

  // Carto Positron (Minimal Light Style)
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',

  // Satellite fallback
  satellite: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
};

// MAPID API Key from Environment or Default Vercel Whitelisted Key
const MAPID_KEY = process.env.NEXT_PUBLIC_MAPID_API_KEY || '6a96748353df37905b3a5f39';

export const BASEMAP_STYLES: Record<string, string> = {
  // If MAPID_KEY is provided in .env, use official MAPID tiles; otherwise fallback to Carto GL
  street: MAPID_KEY ? `https://basemap.mapid.io/styles/basic/style.json?key=${MAPID_KEY}` : FALLBACK_BASEMAP_STYLES.street,
  'street-2d': MAPID_KEY ? `https://basemap.mapid.io/styles/street-2d-building/style.json?key=${MAPID_KEY}` : FALLBACK_BASEMAP_STYLES['street-2d'],
  dark: MAPID_KEY ? `https://basemap.mapid.io/styles/dark/style.json?key=${MAPID_KEY}` : FALLBACK_BASEMAP_STYLES.dark,
  light: MAPID_KEY ? `https://basemap.mapid.io/styles/light/style.json?key=${MAPID_KEY}` : FALLBACK_BASEMAP_STYLES.light,
  satellite: MAPID_KEY ? `https://basemap.mapid.io/styles/satellite/style.json?key=${MAPID_KEY}` : FALLBACK_BASEMAP_STYLES.satellite,
};

export const SURABAYA_CENTER: [number, number] = [112.7521, -7.2654];
export const SURABAYA_DEFAULT_ZOOM = 13.2;

export const SURABAYA_BOUNDS: [[number, number], [number, number]] = [
  [112.55, -7.38], // Southwest coordinates
  [112.85, -7.18]  // Northeast coordinates
];
