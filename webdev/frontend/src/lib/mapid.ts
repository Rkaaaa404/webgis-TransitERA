// MAPID API Key
const MAPID_KEY = process.env.NEXT_PUBLIC_MAPID_API_KEY || '6a96748353df37905b3a5f39';

export const BASEMAP_STYLES: Record<string, string> = {
  // Street Mapid (Default: 3D & 2D building) [ID: basic]
  street: `https://basemap.mapid.io/styles/basic/style.json?key=${MAPID_KEY}`,

  // Street Mapid - 2D building only [ID: street-2d-building]
  'street-2d': `https://basemap.mapid.io/styles/street-2d-building/style.json?key=${MAPID_KEY}`,

  // Dark Mapid [ID: dark]
  dark: `https://basemap.mapid.io/styles/dark/style.json?key=${MAPID_KEY}`,

  // Light Mapid [ID: light]
  light: `https://basemap.mapid.io/styles/light/style.json?key=${MAPID_KEY}`,

  // Satellite [ID: satellite]
  satellite: `https://basemap.mapid.io/styles/satellite/style.json?key=${MAPID_KEY}`,
};

export const SURABAYA_CENTER: [number, number] = [112.7521, -7.2654];
export const SURABAYA_DEFAULT_ZOOM = 13.2;

export const SURABAYA_BOUNDS: [[number, number], [number, number]] = [
  [112.55, -7.38], // Southwest coordinates
  [112.85, -7.18]  // Northeast coordinates
];
