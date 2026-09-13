import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { StationId, StationData } from '@/types';
import { FALLBACK_STATIONS } from '@/lib/api';

/**
 * Builds a GeoJSON FeatureCollection containing all 15 transit stations with
 * dynamic metadata for WebGL-native rendering and sub-pixel zoom alignment.
 */
function buildStationGeoJSON(activeStation?: StationId): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: FALLBACK_STATIONS.map((st: StationData) => {
      const isSelected = st.id === activeStation;
      const isTerminal = st.id.startsWith('terminal_');
      const isFocus = Boolean(st.is_tier_1);
      const kecamatan = st.kecamatan || 'Surabaya';
      const shortName = st.name.replace('Stasiun Surabaya ', 'St. ').replace('Stasiun ', 'St. ');

      return {
        type: 'Feature',
        id: st.id,
        geometry: {
          type: 'Point',
          coordinates: [st.longitude, st.latitude],
        },
        properties: {
          id: st.id,
          name: st.name,
          shortName,
          kecamatan,
          isSelected,
          isTerminal,
          isFocus,
          longitude: st.longitude,
          latitude: st.latitude,
          tod_readiness_score: st.tod_readiness_score,
          typology: st.typology,
        },
      };
    }),
  };
}

export function useStationMarkers(
  map: maplibregl.Map | null,
  isMapLoaded: boolean,
  onSelectStation: (stationId: StationId) => void,
  activeStation?: StationId,
  activePersona?: string
) {
  const popupRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    if (!map || !isMapLoaded) return;

    const sourceId = 'station-points-source';
    const haloLayerId = 'station-points-halo';
    const circleLayerId = 'station-points-circle';
    const labelLayerId = 'station-points-label';

    const geoData = buildStationGeoJSON(activeStation);

    // 1. Source Setup
    const existingSource = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
    if (!existingSource) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geoData,
      });
    } else {
      existingSource.setData(geoData);
    }

    // 2. Halo Layer (Pulse / Outer Highlight ring)
    if (!map.getLayer(haloLayerId)) {
      map.addLayer({
        id: haloLayerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'id'], activeStation || ''],
            18,
            ['get', 'isFocus'],
            13,
            9,
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'id'], activeStation || ''],
            '#06b6d4',
            ['get', 'isFocus'],
            '#B1FC91',
            '#475569',
          ],
          'circle-opacity': [
            'case',
            ['==', ['get', 'id'], activeStation || ''],
            0.4,
            ['get', 'isFocus'],
            0.3,
            0.15,
          ],
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'id'], activeStation || ''],
            2,
            ['get', 'isFocus'],
            1,
            0,
          ],
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'id'], activeStation || ''],
            '#06b6d4',
            '#B1FC91',
          ],
          'circle-stroke-opacity': 0.85,
        },
      });
    } else {
      map.setPaintProperty(haloLayerId, 'circle-radius', [
        'case',
        ['==', ['get', 'id'], activeStation || ''],
        18,
        ['get', 'isFocus'],
        13,
        9,
      ]);
      map.setPaintProperty(haloLayerId, 'circle-color', [
        'case',
        ['==', ['get', 'id'], activeStation || ''],
        '#06b6d4',
        ['get', 'isFocus'],
        '#B1FC91',
        '#475569',
      ]);
      map.setPaintProperty(haloLayerId, 'circle-opacity', [
        'case',
        ['==', ['get', 'id'], activeStation || ''],
        0.4,
        ['get', 'isFocus'],
        0.3,
        0.15,
      ]);
    }

    // 3. Core Pin Circle Layer
    if (!map.getLayer(circleLayerId)) {
      map.addLayer({
        id: circleLayerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'id'], activeStation || ''],
            10,
            ['get', 'isFocus'],
            7.5,
            5.5,
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'id'], activeStation || ''],
            '#06b6d4',
            ['get', 'isFocus'],
            '#4FC5C2',
            '#0f172a',
          ],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'id'], activeStation || ''],
            '#ffffff',
            ['get', 'isFocus'],
            '#12175E',
            '#94a3b8',
          ],
          'circle-stroke-opacity': 1.0,
        },
      });
    } else {
      map.setPaintProperty(circleLayerId, 'circle-radius', [
        'case',
        ['==', ['get', 'id'], activeStation || ''],
        10,
        ['get', 'isFocus'],
        7.5,
        5.5,
      ]);
      map.setPaintProperty(circleLayerId, 'circle-color', [
        'case',
        ['==', ['get', 'id'], activeStation || ''],
        '#06b6d4',
        ['get', 'isFocus'],
        '#4FC5C2',
        '#0f172a',
      ]);
      map.setPaintProperty(circleLayerId, 'circle-stroke-color', [
        'case',
        ['==', ['get', 'id'], activeStation || ''],
        '#ffffff',
        ['get', 'isFocus'],
        '#12175E',
        '#94a3b8',
      ]);
    }

    // 4. Station Label Symbol Layer (Native Vector Text Rendering)
    if (!map.getLayer(labelLayerId)) {
      map.addLayer({
        id: labelLayerId,
        type: 'symbol',
        source: sourceId,
        layout: {
          'text-field': ['get', 'shortName'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10,
            8.5,
            12.5,
            10,
            15,
            12,
          ],
          'text-offset': [0, 1.15],
          'text-anchor': 'top',
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': [
            'case',
            ['==', ['get', 'id'], activeStation || ''],
            '#67e8f9',
            ['get', 'isFocus'],
            '#B1FC91',
            '#e2e8f0',
          ],
          'text-halo-color': '#0f172a',
          'text-halo-width': 2.5,
          'text-halo-blur': 0.5,
        },
      });
    } else {
      map.setPaintProperty(labelLayerId, 'text-color', [
        'case',
        ['==', ['get', 'id'], activeStation || ''],
        '#67e8f9',
        ['get', 'isFocus'],
        '#B1FC91',
        '#e2e8f0',
      ]);
    }

    // 5. Native Event Handlers
    const handleClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      const feat = e.features?.[0];
      if (!feat || !feat.properties) return;

      const stId = feat.properties.id as StationId;
      const lng = Number(feat.properties.longitude);
      const lat = Number(feat.properties.latitude);

      onSelectStation(stId);
      map.flyTo({
        center: [lng, lat],
        zoom: activePersona === 'commuter' ? 14.5 : 14.0,
        duration: 700,
        essential: true,
      });
    };

    const handleMouseEnter = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      map.getCanvas().style.cursor = 'pointer';
      const feat = e.features?.[0];
      if (!feat || !feat.properties) return;

      const name = feat.properties.name;
      const kec = feat.properties.kecamatan;
      const todScore = feat.properties.tod_readiness_score;
      const coords = (feat.geometry as GeoJSON.Point).coordinates;

      if (!popupRef.current) {
        popupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: [0, -14],
          className: 'station-hover-popup',
        });
      }

      popupRef.current
        .setLngLat([coords[0], coords[1]])
        .setHTML(`
          <div style="
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(6, 182, 212, 0.4);
            border-radius: 8px;
            padding: 8px 12px;
            color: #f8fafc;
            font-family: system-ui, sans-serif;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            min-width: 140px;
          ">
            <div style="font-weight: 700; font-size: 11.5px; color: #f8fafc; margin-bottom: 2px;">
              ${name}
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 9.5px; color: #94a3b8;">
              <span>Kec. ${kec}</span>
              <span style="color: #67e8f9; font-weight: 700; background: rgba(6, 182, 212, 0.15); padding: 1px 6px; border-radius: 4px;">
                TOD ${todScore}
              </span>
            </div>
          </div>
        `)
        .addTo(map);
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
      if (popupRef.current) {
        popupRef.current.remove();
      }
    };

    map.on('click', circleLayerId, handleClick);
    map.on('mouseenter', circleLayerId, handleMouseEnter);
    map.on('mouseleave', circleLayerId, handleMouseLeave);

    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      map.off('click', circleLayerId, handleClick);
      map.off('mouseenter', circleLayerId, handleMouseEnter);
      map.off('mouseleave', circleLayerId, handleMouseLeave);
    };
  }, [map, isMapLoaded, onSelectStation, activeStation, activePersona]);
}
