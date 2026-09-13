import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { StationId } from '@/types';
import { FALLBACK_STATIONS } from '@/lib/api';
import { bringStationMarkersToFront } from './useStationMarkers';

/**
 * Menghasilkan GeoJSON Polygon lingkaran beradius radiusKm (default 1 km)
 * dengan koreksi geodesik latitude Kota Surabaya (~ -7.26°).
 */
function generateCircleGeoJSON(centerLng: number, centerLat: number, radiusKm: number = 1.0, points: number = 64) {
  const coords: [number, number][] = [];
  // 1 derajat latitude ~ 110.574 km
  // 1 derajat longitude ~ 111.320 * cos(lat) km
  const distanceY = radiusKm / 110.574;
  const distanceX = radiusKm / (111.320 * Math.cos((centerLat * Math.PI) / 180));

  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([centerLng + x, centerLat + y]);
  }

  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [coords],
        },
        properties: {
          radius_km: radiusKm,
          station_center: [centerLng, centerLat],
        },
      },
    ],
  };
}

export function useStationPerimeter(
  map: maplibregl.Map | null,
  isMapLoaded: boolean,
  activeStation: StationId | undefined,
  activePersona: string | undefined
) {
  const labelMarkerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!map || !isMapLoaded) return;

    // Bersihkan label marker lama jika ada
    if (labelMarkerRef.current) {
      labelMarkerRef.current.remove();
      labelMarkerRef.current = null;
    }

    const sourceId = 'station-perimeter-1km-source';
    const fillLayerId = 'station-perimeter-1km-fill';
    const lineLayerId = 'station-perimeter-1km-line';

    // Lingkaran perimeter 1 km hanya aktif saat persona komuter dan stasiun dipilih
    const isCommuterMode = activePersona === 'commuter';

    if (!isCommuterMode || !activeStation) {
      // Sembunyikan atau bersihkan layer jika bukan mode komuter
      if (map.getLayer(fillLayerId)) map.setLayoutProperty(fillLayerId, 'visibility', 'none');
      if (map.getLayer(lineLayerId)) map.setLayoutProperty(lineLayerId, 'visibility', 'none');
      return;
    }

    const station = FALLBACK_STATIONS.find((s) => s.id === activeStation);
    if (!station) return;

    const circleData = generateCircleGeoJSON(station.longitude, station.latitude, 1.0);

    // 1. Update atau Buat Source
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: circleData,
      });
    } else {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(circleData);
    }

    const beforeLayer = map.getLayer('station-points-halo') ? 'station-points-halo' : undefined;

    // 2. Tambah / Tampilkan Layer Fill
    if (!map.getLayer(fillLayerId)) {
      map.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        layout: {
          visibility: 'visible',
        },
        paint: {
          'fill-color': '#06b6d4',
          'fill-opacity': 0.12,
        },
      }, beforeLayer);
    } else {
      map.setLayoutProperty(fillLayerId, 'visibility', 'visible');
    }

    // 3. Tambah / Tampilkan Layer Garis Putus-putus
    if (!map.getLayer(lineLayerId)) {
      map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        layout: {
          visibility: 'visible',
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#06b6d4',
          'line-width': 2.0,
          'line-dasharray': [3, 2],
          'line-opacity': 0.85,
        },
      }, beforeLayer);
    } else {
      map.setLayoutProperty(lineLayerId, 'visibility', 'visible');
    }

    // Pastikan titik stasiun selalu berada paling atas
    bringStationMarkersToFront(map);

    // 4. Tambahkan Floating Label Marker di Puncak Utara Lingkaran 1 km
    const distanceY = 1.0 / 110.574;
    const labelLngLat: [number, number] = [station.longitude, station.latitude + distanceY];

    const labelEl = document.createElement('div');
    labelEl.className = 'station-perimeter-badge pointer-events-none select-none transition-all animate-fade-in';
    labelEl.innerHTML = `
      <div style="
        background: rgba(8, 51, 68, 0.94);
        color: #67e8f9;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 10px;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 9999px;
        border: 1px solid rgba(6, 182, 212, 0.6);
        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
        transform: translate(-50%, -50%);
      ">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 6px #22d3ee;"></span>
        <span>Perimeter Radius 1 km</span>
      </div>
    `;

    const marker = new maplibregl.Marker({
      element: labelEl,
      anchor: 'center',
    })
      .setLngLat(labelLngLat)
      .addTo(map);

    labelMarkerRef.current = marker;

    return () => {
      if (labelMarkerRef.current) {
        labelMarkerRef.current.remove();
        labelMarkerRef.current = null;
      }
    };
  }, [map, isMapLoaded, activeStation, activePersona]);
}
