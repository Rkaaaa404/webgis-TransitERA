import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { RoutePlan } from '@/types';
import { getStationInfo } from '@/lib/dummy-data';

const ROUTE_SOURCE_ID = 'multimodal-route-source';
const LAYER_WALK_CASING = 'multimodal-route-walk-casing';
const LAYER_WALK_LINE = 'multimodal-route-walk-line';
const LAYER_TRANSIT_CASING = 'multimodal-route-transit-casing';
const LAYER_TRANSIT_LINE = 'multimodal-route-transit-line';
const LAYER_WAYPOINTS = 'multimodal-route-waypoints';
const LAYER_LABELS = 'multimodal-route-labels';

export function useTransitRoute(
  map: maplibregl.Map | null,
  isMapLoaded: boolean,
  activeRoutePlan: RoutePlan | null = null,
  activeRouteIds: string[] = []
) {
  const isLayersInitialized = useRef<boolean>(false);

  // 1. Inisialisasi Source & Layers Native MapLibre untuk Rute Multimoda
  useEffect(() => {
    if (!map || !isMapLoaded) return;
    if (typeof map.getSource !== 'function') return;

    if (!map.getSource(ROUTE_SOURCE_ID)) {
      map.addSource(ROUTE_SOURCE_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Layer 1: Casing Jalan Kaki (Garis Luar Kontras)
      map.addLayer({
        id: LAYER_WALK_CASING,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        filter: ['==', ['get', 'mode'], 'walk'],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#020617',
          'line-width': 7,
          'line-opacity': 0.8
        }
      });

      // Layer 2: Garis Jalan Kaki Putus-Putus (Dashed Line Ramah Pedestrian)
      map.addLayer({
        id: LAYER_WALK_LINE,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        filter: ['==', ['get', 'mode'], 'walk'],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#a3e635', // Vibrant Lime
          'line-width': 4.0,
          'line-dasharray': [2, 2],
          'line-opacity': 1.0
        }
      });

      // Layer 3: Casing Jalur Transit (Kereta & Bus)
      map.addLayer({
        id: LAYER_TRANSIT_CASING,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        filter: ['!=', ['get', 'mode'], 'walk'],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#020617',
          'line-width': 8,
          'line-opacity': 0.85
        }
      });

      // Layer 4: Garis Solid Jalur Transit (Vibrant Multi-Color per Moda)
      map.addLayer({
        id: LAYER_TRANSIT_LINE,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        filter: ['!=', ['get', 'mode'], 'walk'],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': [
            'coalesce',
            ['get', 'line_color'],
            ['case', ['==', ['get', 'mode'], 'train'], '#f43f5e', '#06b6d4']
          ],
          'line-width': 5.5,
          'line-opacity': 0.95
        }
      });

      // Layer 5: Waypoints Pin (Stasiun Asal, Titik Transfer, Stasiun Tujuan)
      map.addLayer({
        id: LAYER_WAYPOINTS,
        type: 'circle',
        source: ROUTE_SOURCE_ID,
        filter: ['==', ['geometry-type'], 'Point'],
        paint: {
          'circle-radius': 7.5,
          'circle-color': [
            'match',
            ['get', 'role'],
            'origin', '#10b981',      // Emerald: Asal
            'transfer', '#f59e0b',    // Amber: Transfer
            'destination', '#06b6d4', // Cyan: Tujuan
            '#3b82f6'
          ],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Layer 6: Label Leg Singkat ("Jalan kaki 3 mnt", "KRD Komuter 15 mnt")
      map.addLayer({
        id: LAYER_LABELS,
        type: 'symbol',
        source: ROUTE_SOURCE_ID,
        filter: ['all', ['==', ['geometry-type'], 'Point'], ['has', 'leg_label']],
        minzoom: 11.5,
        layout: {
          'text-field': ['get', 'leg_label'],
          'text-size': 10.5,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-offset': [0, -1.2],
          'text-anchor': 'bottom',
          'text-allow-overlap': false
        },
        paint: {
          'text-color': '#f8fafc',
          'text-halo-color': '#020617',
          'text-halo-width': 2.5
        }
      });

      isLayersInitialized.current = true;
    }
  }, [map, isMapLoaded]);

  // 2. Render Rute Aktif & Auto-Fit Kamera
  useEffect(() => {
    if (!map || !isMapLoaded) return;
    const source = map.getSource(ROUTE_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    if (!activeRoutePlan || !activeRoutePlan.steps || activeRoutePlan.steps.length === 0) {
      source.setData({
        type: 'FeatureCollection',
        features: []
      });
      return;
    }

    const features: any[] = [];
    const allCoords: [number, number][] = [];

    // Buat fitur LineString untuk tiap step rute
    activeRoutePlan.steps.forEach((step, idx) => {
      let coords: [number, number][] = step.coordinates || [];

      // Fallback koordinat jika belum terdefinisi
      if (coords.length < 2) {
        const fromInfo = getStationInfo(activeRoutePlan.from);
        const toInfo = getStationInfo(activeRoutePlan.to);
        coords = [
          [fromInfo.lng, fromInfo.lat],
          [toInfo.lng, toInfo.lat]
        ];
      }

      coords.forEach(c => allCoords.push(c));

      // LineString Feature per Leg
      features.push({
        type: 'Feature',
        id: `leg-${idx}`,
        geometry: {
          type: 'LineString',
          coordinates: coords
        },
        properties: {
          mode: step.mode,
          line_code: step.line_code || '',
          line_color: step.line_color || (step.mode === 'walk' ? '#a3e635' : (step.mode === 'train' ? '#f43f5e' : '#06b6d4')),
          duration_min: step.duration_min,
          desc: step.desc
        }
      });

      // Label Titik Tengah Leg
      if (coords.length >= 2) {
        const midIdx = Math.floor(coords.length / 2);
        const midCoord = coords[midIdx];
        const modeLabel = step.mode === 'walk' 
          ? 'Jalan kaki' 
          : (step.mode === 'train' ? `KA Komuter ${step.line_code || ''}`.trim() : (step.route_name || 'Feeder Bus'));

        features.push({
          type: 'Feature',
          id: `label-${idx}`,
          geometry: {
            type: 'Point',
            coordinates: midCoord
          },
          properties: {
            leg_label: `${modeLabel} • ${step.duration_min} mnt`
          }
        });
      }
    });

    // Tambahkan Waypoint Nodes
    const fromMeta = getStationInfo(activeRoutePlan.from);
    const toMeta = getStationInfo(activeRoutePlan.to);

    // Node Asal
    features.push({
      type: 'Feature',
      id: 'origin-node',
      geometry: {
        type: 'Point',
        coordinates: [fromMeta.lng, fromMeta.lat]
      },
      properties: {
        role: 'origin',
        name: fromMeta.shortName
      }
    });

    // Node Tujuan
    features.push({
      type: 'Feature',
      id: 'destination-node',
      geometry: {
        type: 'Point',
        coordinates: [toMeta.lng, toMeta.lat]
      },
      properties: {
        role: 'destination',
        name: toMeta.shortName
      }
    });

    // Perbarui data GeoJSON di peta
    source.setData({
      type: 'FeatureCollection',
      features
    });

    // Auto-Fit Kamera MapLibre ke Seluruh Bentang Rute
    if (allCoords.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      allCoords.forEach((c) => bounds.extend(c));

      // Berikan padding aman agar rute terlihat utuh dan tidak tertutup sidebar dashboard
      map.fitBounds(bounds, {
        padding: { top: 90, bottom: 90, left: 90, right: 380 },
        duration: 900,
        maxZoom: 15.0
      });
    }
  }, [map, isMapLoaded, activeRoutePlan]);

  // 3. Highlight bus layer if activeRouteIds provided
  useEffect(() => {
    if (!map || !isMapLoaded) return;
    if (typeof map.getLayer !== 'function') return;

    const layerId = 'transit-routes-line';
    if (!map.getLayer(layerId)) return;

    if (activeRouteIds && activeRouteIds.length > 0) {
      map.setPaintProperty(layerId, 'line-opacity', [
        'case',
        ['in', ['coalesce', ['get', 'route_id'], ['get', 'id']], ['literal', activeRouteIds]],
        1.0,
        0.18
      ]);
    } else {
      map.setPaintProperty(layerId, 'line-opacity', 0.85);
    }
  }, [map, isMapLoaded, activeRouteIds]);
}
