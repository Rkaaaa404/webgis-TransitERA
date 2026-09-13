import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { StationId, StationData } from '@/types';
import { FALLBACK_STATIONS } from '@/lib/api';

const TRAIN_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>`;

const BUS_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.3-.1-.6-.2-.8L20 8M4 18H2v-4a4 4 0 0 1 4-4h12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>`;

function formatStationShortName(name: string): string {
  return name
    .replace('Stasiun Surabaya ', 'St. ')
    .replace('Stasiun ', 'St. ')
    .replace('Terminal Intermoda ', 'Term. ')
    .replace('Terminal ', 'Term. ');
}

function buildStationGeoJSON(): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: FALLBACK_STATIONS.map((st: StationData) => ({
      type: 'Feature',
      id: st.id,
      geometry: {
        type: 'Point',
        coordinates: [st.longitude, st.latitude],
      },
      properties: {
        id: st.id,
        name: st.name,
        shortName: formatStationShortName(st.name),
        kecamatan: st.kecamatan || 'Surabaya',
        isTerminal: st.id.startsWith('terminal_'),
        isFocus: Boolean(st.is_tier_1),
        longitude: st.longitude,
        latitude: st.latitude,
        tod_readiness_score: st.tod_readiness_score,
        typology: st.typology,
      },
    })),
  };
}

/**
 * useStationMarkers
 * 
 * Renders prominent, unobscured DOM-based transit station badges directly on the map overlay.
 * Because DOM markers render in the HTML overlay above the WebGL canvas, they are guaranteed
 * to sit above H3 hexagons, survey points, isochrones, transit lines, and basemap layers.
 */
export function useStationMarkers(
  map: maplibregl.Map | null,
  isMapLoaded: boolean,
  onSelectStation: (stationId: StationId) => void,
  activeStation?: StationId,
  activePersona?: string
) {
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // 1. Maintain WebGL anchor layer so other hooks (H3, isochrone, survey) keep their layer order
  useEffect(() => {
    if (!map || !isMapLoaded) return;

    const sourceId = 'station-points-source';
    const haloLayerId = 'station-points-halo';

    // Remove legacy symbol/circle layers to prevent duplicate faint text
    if (map.getLayer('station-points-label')) {
      try { map.removeLayer('station-points-label'); } catch {}
    }
    if (map.getLayer('station-points-circle')) {
      try { map.removeLayer('station-points-circle'); } catch {}
    }
    if (map.getLayer('station-points-hit-target')) {
      try { map.removeLayer('station-points-hit-target'); } catch {}
    }

    const geoData = buildStationGeoJSON();
    const existingSource = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
    if (!existingSource) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geoData,
      });
    } else {
      existingSource.setData(geoData);
    }

    // Subtle ground halo on the WebGL canvas (acting as ground footprint under the marker)
    if (!map.getLayer(haloLayerId)) {
      map.addLayer({
        id: haloLayerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'id'], activeStation || ''],
            20,
            ['get', 'isFocus'],
            14,
            8,
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'id'], activeStation || ''],
            '#06b6d4',
            ['get', 'isFocus'],
            '#22d3ee',
            '#38bdf8',
          ],
          'circle-opacity': [
            'case',
            ['==', ['get', 'id'], activeStation || ''],
            0.35,
            ['get', 'isFocus'],
            0.2,
            0.1,
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.6,
        },
      });
    } else {
      map.setPaintProperty(haloLayerId, 'circle-radius', [
        'case',
        ['==', ['get', 'id'], activeStation || ''],
        20,
        ['get', 'isFocus'],
        14,
        8,
      ]);
      map.setPaintProperty(haloLayerId, 'circle-color', [
        'case',
        ['==', ['get', 'id'], activeStation || ''],
        '#06b6d4',
        ['get', 'isFocus'],
        '#22d3ee',
        '#38bdf8',
      ]);
      map.setPaintProperty(haloLayerId, 'circle-opacity', [
        'case',
        ['==', ['get', 'id'], activeStation || ''],
        0.35,
        ['get', 'isFocus'],
        0.2,
        0.1,
      ]);
    }

    bringStationMarkersToFront(map);
  }, [map, isMapLoaded, activeStation]);

  // 2. High-Contrast DOM Markers (100% Unobscured Above H3 Grid & Survey Points)
  useEffect(() => {
    if (!map || !isMapLoaded) return;

    // Fast-path: If markers are already initialized, update active state without recreating DOM
    if (markersRef.current.length === FALLBACK_STATIONS.length) {
      FALLBACK_STATIONS.forEach((st, idx) => {
        const marker = markersRef.current[idx];
        if (!marker) return;
        const el = marker.getElement();
        const isSelected = st.id === activeStation;

        if (isSelected) {
          el.classList.add('is-active');
          el.style.zIndex = '9999';
          const dot = el.querySelector('.station-dot');
          if (dot && !dot.querySelector('.station-pulse-ring')) {
            const ring = document.createElement('div');
            ring.className = 'station-pulse-ring';
            dot.appendChild(ring);
          }
        } else {
          el.classList.remove('is-active');
          el.style.zIndex = st.is_tier_1 ? '500' : '100';
          const ring = el.querySelector('.station-pulse-ring');
          if (ring) ring.remove();
        }
      });
      return;
    }

    // Clean up any existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const newMarkers: maplibregl.Marker[] = [];

    FALLBACK_STATIONS.forEach((st: StationData) => {
      const isSelected = st.id === activeStation;
      const isFocus = Boolean(st.is_tier_1);
      const isTerminal = st.id.startsWith('terminal_');
      const shortName = formatStationShortName(st.name);
      const roundedTod = st.tod_readiness_score ? Math.round(st.tod_readiness_score) : 0;

      let todClass = 'tod-chip-mid';
      if (roundedTod >= 80) todClass = 'tod-chip-high';
      else if (roundedTod < 70) todClass = 'tod-chip-low';

      const el = document.createElement('div');
      el.className = `transit-station-marker ${isSelected ? 'is-active' : ''} ${isFocus ? 'is-focus' : ''}`;
      el.style.zIndex = isSelected ? '9999' : (isFocus ? '500' : '100');

      el.innerHTML = `
        <div class="station-pill">
          <div class="station-icon-box">
            ${isTerminal ? BUS_SVG : TRAIN_SVG}
          </div>
          <span class="station-name-text">${shortName}</span>
          <span class="station-tod-chip ${todClass}">${roundedTod}</span>
        </div>
        <div class="station-anchor">
          <div class="station-caret"></div>
          <div class="station-dot">
            ${isSelected ? '<div class="station-pulse-ring"></div>' : ''}
          </div>
        </div>
      `;

      // Click Interaction: Select station & smooth camera transition
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectStation(st.id);
        map.flyTo({
          center: [st.longitude, st.latitude],
          zoom: activePersona === 'commuter' ? 14.8 : 14.2,
          duration: 650,
          essential: true,
        });
      });

      // Hover Interaction: Elevation & Rich Contextual Popup
      el.addEventListener('mouseenter', () => {
        if (!popupRef.current) {
          popupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: [0, -38],
            className: 'station-hover-popup',
          });
        }
        const kec = st.kecamatan || 'Surabaya';
        const todScore = st.tod_readiness_score ? st.tod_readiness_score.toFixed(1) : '-';
        const typology = st.typology || 'Simpul Multimoda';

        popupRef.current
          .setLngLat([st.longitude, st.latitude])
          .setHTML(`
            <div style="
              font-family: system-ui, -apple-system, sans-serif;
              padding: 4px 2px;
              min-width: 175px;
              color: #f8fafc;
            ">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
                <span style="
                  font-size: 9px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  color: ${isFocus ? '#22d3ee' : '#94a3b8'};
                  background: ${isFocus ? 'rgba(6, 182, 212, 0.15)' : 'rgba(148, 163, 184, 0.1)'};
                  padding: 1px 6px;
                  border-radius: 4px;
                ">
                  ${isFocus ? 'Focus TOD Tier-1' : (isTerminal ? 'Terminal Bus/Feeder' : 'Stasiun Kereta')}
                </span>
                <span style="font-size: 9.5px; font-weight: 700; color: #38bdf8;">
                  TOD ${todScore}
                </span>
              </div>
              <div style="font-weight: 700; font-size: 12.5px; color: #ffffff; margin-bottom: 2px;">
                ${st.name}
              </div>
              <div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px;">
                Kec. ${kec} &bull; <span style="color: #cbd5e1;">${typology}</span>
              </div>
              <div style="
                font-size: 9px;
                color: #38bdf8;
                border-top: 1px solid rgba(56, 189, 248, 0.2);
                padding-top: 4px;
                margin-top: 4px;
              ">
                Klik untuk memilih stasiun & profil kawasan
              </div>
            </div>
          `)
          .addTo(map);
      });

      el.addEventListener('mouseleave', () => {
        if (popupRef.current) {
          popupRef.current.remove();
        }
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'bottom',
      })
        .setLngLat([st.longitude, st.latitude])
        .addTo(map);

      newMarkers.push(marker);
    });

    markersRef.current = newMarkers;

    // Zoom-adaptive density handler: Compact icon if zoomed far out (< 11.2)
    const handleZoom = () => {
      if (!map) return;
      const zoom = map.getZoom();
      const isCompact = zoom < 11.2;
      markersRef.current.forEach((marker) => {
        const markerEl = marker.getElement();
        if (isCompact) {
          markerEl.classList.add('is-compact');
        } else {
          markerEl.classList.remove('is-compact');
        }
      });
    };

    map.on('zoom', handleZoom);
    handleZoom();

    return () => {
      map.off('zoom', handleZoom);
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [map, isMapLoaded, onSelectStation, activeStation, activePersona]);
}

/**
 * Utility to bring station marker WebGL ground footprint to the top of the canvas stack.
 * DOM markers are natively always above the WebGL canvas.
 */
export function bringStationMarkersToFront(map: maplibregl.Map) {
  const haloLayerId = 'station-points-halo';
  try {
    if (map.getLayer(haloLayerId)) {
      map.moveLayer(haloLayerId);
    }
  } catch {}
}
