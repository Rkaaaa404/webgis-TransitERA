import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { StationId } from '@/types';
import { fetchStationIsochrone } from '@/lib/api';
import { bringStationMarkersToFront } from './useStationMarkers';

export type IsochroneMode = 'walk' | 'motor' | 'car';
export type IsochroneMinutes = 5 | 10 | 15;
export type IsochroneViewType = 'network' | 'polygon';

const MODE_COLORS: Record<IsochroneMode, string> = {
  walk: '#10b981', // Emerald
  motor: '#06b6d4', // Cyan
  car: '#6366f1', // Indigo
};

export function useIsochroneLayer(
  map: maplibregl.Map | null,
  isMapLoaded: boolean,
  showIsochrone: boolean,
  activeStation: StationId,
  mode: IsochroneMode = 'walk',
  minutes: IsochroneMinutes = 15,
  viewType: IsochroneViewType = 'network'
) {
  const popupRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    if (!map || !isMapLoaded) return;

    let isMounted = true;
    const sourceId = 'station-isochrone-source';
    const casingLayerId = 'station-isochrone-route-casing';
    const routeLayerId = 'station-isochrone-route-line';
    const nodesLayerId = 'station-isochrone-nodes';
    const labelsLayerId = 'station-isochrone-labels';
    const fillLayerId = 'station-isochrone-fill';
    const polygonLineLayerId = 'station-isochrone-line';

    const color = MODE_COLORS[mode] || '#10b981';

    const hideAllLayers = () => {
      [casingLayerId, routeLayerId, nodesLayerId, labelsLayerId, fillLayerId, polygonLineLayerId].forEach((lid) => {
        if (map.getLayer(lid)) {
          map.setLayoutProperty(lid, 'visibility', 'none');
        }
      });
    };

    if (!showIsochrone) {
      hideAllLayers();
      return;
    }

    fetchStationIsochrone(activeStation, mode, minutes).then((data) => {
      if (!isMounted || !map) return;
      if (!data || !data.type) return;

      const existingSource = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
      if (!existingSource) {
        map.addSource(sourceId, {
          type: 'geojson',
          data,
        });
      } else {
        existingSource.setData(data);
      }

      const beforeLayer = map.getLayer('station-points-halo') ? 'station-points-halo' : undefined;

      // ── 1. STREET NETWORK ROUTE CASING (Dark outline under the streets) ──
      if (!map.getLayer(casingLayerId)) {
        map.addLayer(
          {
            id: casingLayerId,
            type: 'line',
            source: sourceId,
            filter: ['in', ['get', 'feature_type'], ['literal', ['street_route', 'street_network']]],
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
              visibility: viewType === 'network' ? 'visible' : 'none',
            },
            paint: {
              'line-color': '#020617',
              'line-width': ['interpolate', ['linear'], ['zoom'], 11, 4, 14, 7, 17, 10],
              'line-opacity': 0.85,
            },
          },
          beforeLayer
        );
      } else {
        map.setLayoutProperty(casingLayerId, 'visibility', viewType === 'network' ? 'visible' : 'none');
      }

      // ── 2. STREET NETWORK ROUTE LINE (Vibrant street corridors following real roads) ──
      if (!map.getLayer(routeLayerId)) {
        map.addLayer(
          {
            id: routeLayerId,
            type: 'line',
            source: sourceId,
            filter: ['in', ['get', 'feature_type'], ['literal', ['street_route', 'street_network']]],
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
              visibility: viewType === 'network' ? 'visible' : 'none',
            },
            paint: {
              'line-color': [
                'case',
                ['has', 'color'],
                ['get', 'color'],
                color
              ],
              'line-width': ['interpolate', ['linear'], ['zoom'], 11, 2.5, 14, 4.5, 17, 7.0],
              'line-opacity': 0.95,
            },
          },
          beforeLayer
        );
      } else {
        map.setLayoutProperty(routeLayerId, 'visibility', viewType === 'network' ? 'visible' : 'none');
      }

      // ── 3. ROUTE DESTINATION NODES (Points at 5/10/15m endpoints) ──
      if (!map.getLayer(nodesLayerId)) {
        map.addLayer(
          {
            id: nodesLayerId,
            type: 'circle',
            source: sourceId,
            filter: ['==', ['get', 'feature_type'], 'route_node'],
            layout: {
              visibility: viewType === 'network' ? 'visible' : 'none',
            },
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 3.0, 14, 5.0, 17, 7.5],
              'circle-color': [
                'case',
                ['has', 'color'],
                ['get', 'color'],
                color
              ],
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 1.8,
              'circle-opacity': 0.95,
            },
          },
          beforeLayer
        );
      } else {
        map.setLayoutProperty(nodesLayerId, 'visibility', viewType === 'network' ? 'visible' : 'none');
      }

      // ── 4. ROUTE LABELS (Destination text on street endpoints) ──
      if (!map.getLayer(labelsLayerId)) {
        map.addLayer(
          {
            id: labelsLayerId,
            type: 'symbol',
            source: sourceId,
            filter: ['==', ['get', 'feature_type'], 'route_node'],
            layout: {
              'text-field': ['get', 'node_label'],
              'text-size': ['interpolate', ['linear'], ['zoom'], 12, 8.5, 14, 10.5, 17, 12],
              'text-offset': [0, 1.2],
              'text-anchor': 'top',
              'text-optional': true,
              visibility: viewType === 'network' ? 'visible' : 'none',
            },
            paint: {
              'text-color': '#f8fafc',
              'text-halo-color': '#020617',
              'text-halo-width': 2.2,
            },
          },
          beforeLayer
        );
      } else {
        map.setLayoutProperty(labelsLayerId, 'visibility', viewType === 'network' ? 'visible' : 'none');
      }

      // ── 5. OPTIONAL POLYGON FILL (For Area view mode) ──
      if (!map.getLayer(fillLayerId)) {
        map.addLayer(
          {
            id: fillLayerId,
            type: 'fill',
            source: sourceId,
            filter: ['==', ['get', 'feature_type'], 'boundary_envelope'],
            layout: {
              visibility: viewType === 'polygon' ? 'visible' : 'none',
            },
            paint: {
              'fill-color': color,
              'fill-opacity': 0.18,
            },
          },
          beforeLayer
        );
      } else {
        map.setLayoutProperty(fillLayerId, 'visibility', viewType === 'polygon' ? 'visible' : 'none');
        map.setPaintProperty(fillLayerId, 'fill-color', color);
      }

      // ── 6. OPTIONAL POLYGON BOUNDARY LINE ──
      if (!map.getLayer(polygonLineLayerId)) {
        map.addLayer(
          {
            id: polygonLineLayerId,
            type: 'line',
            source: sourceId,
            filter: ['==', ['get', 'feature_type'], 'boundary_envelope'],
            layout: {
              visibility: viewType === 'polygon' ? 'visible' : 'none',
            },
            paint: {
              'line-color': color,
              'line-width': 2.0,
              'line-dasharray': [3, 2],
              'line-opacity': 0.8,
            },
          },
          beforeLayer
        );
      } else {
        map.setLayoutProperty(polygonLineLayerId, 'visibility', viewType === 'polygon' ? 'visible' : 'none');
        map.setPaintProperty(polygonLineLayerId, 'line-color', color);
      }
    });

    bringStationMarkersToFront(map);

    // Hover tooltip interaction on street network routes
    const handleMouseEnter = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      map.getCanvas().style.cursor = 'pointer';
      const feat = e.features?.[0];
      if (!feat || !feat.properties) return;

      const streetName = feat.properties.street_name || feat.properties.station_name || 'Koridor Jalan';
      const quality = feat.properties.quality || 'Jalur Pedestrian Terkoneksi';
      const landmark = feat.properties.landmark_reached || 'Pusat Aktivitas Komuter';
      const distM = feat.properties.distance_m || 400;
      const walkTime = feat.properties.walk_time_text || `~${feat.properties.minutes || minutes} Menit`;
      const speed = feat.properties.speed_kmh || 4.5;
      const corridorColor = feat.properties.color || color;

      if (!popupRef.current) {
        popupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'isochrone-street-popup',
        });
      }

      popupRef.current
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="
            background: rgba(2, 6, 23, 0.96);
            backdrop-filter: blur(12px);
            border: 1px solid ${corridorColor}88;
            border-radius: 8px;
            padding: 8px 12px;
            color: #f8fafc;
            font-family: system-ui, sans-serif;
            box-shadow: 0 10px 25px rgba(0,0,0,0.6);
            font-size: 11px;
            min-width: 190px;
          ">
            <div style="font-weight: 800; color: ${corridorColor}; margin-bottom: 2px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span style="truncate">${streetName}</span>
              <span style="font-size: 8.5px; background: rgba(255,255,255,0.1); padding: 1px 5px; rounded: 4px; font-mono font-bold;">Rute Jalan</span>
            </div>
            <div style="color: #94a3b8; font-size: 9.5px; margin-bottom: 4px;">
              ${quality}
            </div>
            <div style="display: flex; justify-content: space-between; gap: 8px; font-size: 9.5px; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px; margin-bottom: 3px;">
              <span>Waktu: <strong style="color: ${corridorColor};">${walkTime}</strong></span>
              <span>Jarak: <strong>${distM}m</strong></span>
              <span>Kecepatan: <strong>${speed} km/h</strong></span>
            </div>
            <div style="font-size: 9px; color: #38bdf8; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); padding: 2px 6px; border-radius: 4px;">
              Menuju: <strong>${landmark}</strong>
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

    map.on('mouseenter', routeLayerId, handleMouseEnter);
    map.on('mouseleave', routeLayerId, handleMouseLeave);
    map.on('mouseenter', nodesLayerId, handleMouseEnter);
    map.on('mouseleave', nodesLayerId, handleMouseLeave);

    return () => {
      isMounted = false;
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      map.off('mouseenter', routeLayerId, handleMouseEnter);
      map.off('mouseleave', routeLayerId, handleMouseLeave);
      map.off('mouseenter', nodesLayerId, handleMouseEnter);
      map.off('mouseleave', nodesLayerId, handleMouseLeave);
    };
  }, [map, isMapLoaded, showIsochrone, activeStation, mode, minutes, viewType]);
}
