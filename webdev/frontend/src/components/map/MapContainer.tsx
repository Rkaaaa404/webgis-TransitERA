'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { StationId, RoutePlan } from '@/types';
import { BASEMAP_STYLES, FALLBACK_BASEMAP_STYLES, SURABAYA_DEFAULT_ZOOM } from '@/lib/mapid';
import { FALLBACK_STATIONS, fetchMapidSurvey, fetchTransitNodes, fetchTransitRoutes, fetchFloodHazard, fetchNighttimeLight, fetchShoppingCenters } from '@/lib/api';
import { ChoroplethMode, BasemapStyleKey, LayerControl } from './LayerControl';
import { PersonaType } from '@/lib/persona';
import { Layers } from 'lucide-react';

import { useH3Layer } from './useH3Layer';
import { useStationMarkers, bringStationMarkersToFront } from './useStationMarkers';
import { useStationPerimeter } from './useStationPerimeter';
import { useTransitRoute } from './useTransitRoute';
import { useIsochroneLayer, IsochroneMode, IsochroneMinutes, IsochroneViewType } from './useIsochroneLayer';

interface MapContainerProps {
  activeStation: StationId;
  onSelectStation: (stationId: StationId) => void;
  activePersona: PersonaType;
  choroplethMode: ChoroplethMode;
  onChangeChoroplethMode?: (mode: ChoroplethMode) => void;
  basemapStyle: BasemapStyleKey;
  onChangeBasemapStyle?: (style: BasemapStyleKey) => void;
  showSurveyPoints: boolean;
  onToggleSurveyPoints?: () => void;
  h3ScoreRange?: [number, number];
  h3RingFilter?: number;
  highlightedH3Index?: string | null;
  onSelectH3Index?: (index: string | null) => void;
  mapActionTrigger?: any;
  activeRouteIds?: string[];
  activeRoutePlan?: RoutePlan | null;
  // ATR/BPN Layer Controls
  showGistaru?: boolean;
  showBhumi?: boolean;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  activeStation,
  onSelectStation,
  activePersona,
  choroplethMode,
  onChangeChoroplethMode,
  basemapStyle,
  onChangeBasemapStyle,
  showSurveyPoints,
  onToggleSurveyPoints,
  h3ScoreRange,
  h3RingFilter,
  highlightedH3Index,
  onSelectH3Index,
  mapActionTrigger,
  activeRouteIds = [],
  activeRoutePlan = null,
  showGistaru = false,
  showBhumi = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(false);
  const [showTransitNodes, setShowTransitNodes] = useState(false);
  const [showTransitRoutes, setShowTransitRoutes] = useState(true);
  const [showFloodHazard, setShowFloodHazard] = useState(false);
  const [showNighttimeLight, setShowNighttimeLight] = useState(false);
  const [showShoppingCenters, setShowShoppingCenters] = useState(false);
  const [showIsochrone, setShowIsochrone] = useState(false);
  const [isochroneMode, setIsochroneMode] = useState<IsochroneMode>('walk');
  const [isochroneMinutes, setIsochroneMinutes] = useState<IsochroneMinutes>(15);
  const [isochroneViewType, setIsochroneViewType] = useState<IsochroneViewType>('network');
  const [surveyCount, setSurveyCount] = useState<number | null>(null);
  const [transitCount, setTransitCount] = useState<number | null>(null);
  const [routesCount, setRoutesCount] = useState<number | null>(null);
  const [shoppingCount, setShoppingCount] = useState<number | null>(null);
  const [floodCount, setFloodCount] = useState<number | null>(null);
  const [ntlCount, setNtlCount] = useState<number | null>(null);
  const currentStyleRef = useRef<BasemapStyleKey>(basemapStyle);

  // 0. Pre-fetch Dynamic Layer Counts
  useEffect(() => {
    fetchTransitNodes().then((d) => setTransitCount(d.features?.length ?? 125)).catch(() => setTransitCount(125));
    fetchTransitRoutes().then((d) => setRoutesCount(d.features?.length ?? 16)).catch(() => setRoutesCount(16));
    fetchShoppingCenters().then((d) => setShoppingCount(d.features?.length ?? 35)).catch(() => setShoppingCount(35));
    fetchFloodHazard().then((d) => setFloodCount(d.features?.length ?? 1553)).catch(() => setFloodCount(1553));
    fetchNighttimeLight().then((d) => setNtlCount(d.features?.length ?? 52)).catch(() => setNtlCount(52));
    fetchMapidSurvey().then((d) => setSurveyCount(d.features?.length ?? 100)).catch(() => setSurveyCount(100));
  }, []);

  // 1. Initialize MapLibre GL Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const currentStation = FALLBACK_STATIONS.find((s) => s.id === activeStation) || FALLBACK_STATIONS[0];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: BASEMAP_STYLES[basemapStyle] || BASEMAP_STYLES.street,
      center: [currentStation.longitude, currentStation.latitude],
      zoom: SURABAYA_DEFAULT_ZOOM,
      pitch: 30,
      bearing: 0,
      attributionControl: false // Configured with custom MAPID attribution below
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    // Official Attribution: MAPID Basemaps & Spatial Data + CARTO / OpenStreetMap
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: [
          '<a href="https://mapid.io" target="_blank" rel="noopener noreferrer" style="color: #67e8f9; font-weight: 600;">Basemap by MAPID</a>',
        ],
      }),
      'bottom-right'
    );

    map.on('error', (e) => {
      console.error('MAPLIBRE ERROR:', e.error || e);
      const errStr = String(e.error?.message || e.error || '');
      if (errStr.includes('401') || errStr.includes('Failed to fetch') || errStr.includes('Forbidden')) {
        const fallback = FALLBACK_BASEMAP_STYLES[basemapStyle] || FALLBACK_BASEMAP_STYLES.street;
        console.warn('MapLibre: Auto-switching to reliable fallback style:', fallback);
        try {
          map.setStyle(fallback);
        } catch {}
      }
    });

    // Suppress console spam: provide a silent 1x1 transparent fallback
    const attachMissingImageHandler = () => {
      map.on('styleimagemissing', (e: { id: string }) => {
        if (!map.hasImage(e.id)) {
          const emptyData = new Uint8Array(4); // RGBA = [0,0,0,0]
          map.addImage(e.id, { width: 1, height: 1, data: emptyData });
        }
      });
    };

    map.on('style.load', () => {
      attachMissingImageHandler();
      setIsMapLoaded(true);
    });

    map.on('load', () => {
      map.resize();
      setTimeout(() => map.resize(), 100);
      setTimeout(() => map.resize(), 500);
      setIsMapLoaded(true);
    });

    mapRef.current = map;
    currentStyleRef.current = basemapStyle;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Use Custom Hooks for Modular Layers
  useH3Layer(mapRef.current, isMapLoaded, choroplethMode, onSelectH3Index, h3ScoreRange, h3RingFilter, activePersona);
  useStationMarkers(mapRef.current, isMapLoaded, onSelectStation, activeStation, activePersona);
  useStationPerimeter(mapRef.current, isMapLoaded, activeStation, activePersona);
  useIsochroneLayer(mapRef.current, isMapLoaded, showIsochrone, activeStation, isochroneMode, isochroneMinutes, isochroneViewType);
  useTransitRoute(mapRef.current, isMapLoaded, activeRoutePlan, activeRouteIds);

  // 1.5 Add Real Transit Routes layer (16 trayek Suroboyo Bus & Feeder WiraWiri)
  useEffect(() => {
    let isMounted = true;
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;
    
    const shouldShow = showTransitRoutes || activePersona === 'commuter';

    if (shouldShow) {
      fetchTransitRoutes().then((data) => {
        if (!isMounted || !mapRef.current) return;
        const currentMap = mapRef.current;
        if (typeof currentMap.getSource !== 'function' || !currentMap.getStyle()) return;
        if (!data || !data.type) return;

        if (!currentMap.getSource('transit-routes-source')) {
          currentMap.addSource('transit-routes-source', {
            type: 'geojson',
            data
          });

          currentMap.addLayer({
            id: 'transit-routes-line',
            type: 'line',
            source: 'transit-routes-source',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': ['coalesce', ['get', 'color'], '#10B981'],
              'line-width': [
                'interpolate', ['linear'], ['zoom'],
                10, 2.0,
                13, 3.5,
                16, 5.0
              ],
              'line-opacity': 0.85
            }
          });

          // Interactive Popup on Route Click
          currentMap.on('click', 'transit-routes-line', (e) => {
            const props = e.features?.[0]?.properties;
            if (!props) return;

            let connStations = '';
            try {
              if (props.connected_stations) {
                const parsed = typeof props.connected_stations === 'string' ? JSON.parse(props.connected_stations) : props.connected_stations;
                if (Array.isArray(parsed) && parsed.length > 0) {
                  connStations = parsed.map((s: any) => `<span style="background: rgba(15,23,42,0.1); border: 1px solid rgba(15,23,42,0.2); padding: 1px 5px; border-radius: 4px; font-size: 9.5px; margin-right: 3px; display: inline-block;">${s.station_name.replace('Stasiun ', '')} (${s.distance_m}m)</span>`).join('');
                }
              }
            } catch {}

            new maplibregl.Popup({ closeButton: true, maxWidth: '320px' })
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="font-family: system-ui, sans-serif; padding: 6px 4px; font-size: 12px; color: #0f172a;">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
                    <span style="background: ${props.color || '#059669'}; color: #ffffff; padding: 2px 7px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase;">
                      ${props.code || 'Trayek'}
                    </span>
                    <span style="font-size: 10px; color: #64748b; font-weight: 600;">
                      ${props.hours || '05:30 - 21:00 WIB'}
                    </span>
                  </div>
                  <strong style="font-size: 13px; color: #0f172a; display: block; margin-top: 4px;">
                    ${props.display_name || props.title}
                  </strong>
                  <div style="margin: 4px 0; font-size: 11px; color: #475569;">
                    <span>Operator: <strong>${props.operator || 'WiraWiri / Suroboyo Bus'}</strong></span><br/>
                    <span>Tarif: <strong style="color: #059669;">${props.fare || 'Rp 5.000'}</strong></span>
                  </div>
                  ${connStations ? `
                    <div style="margin-top: 6px; padding-top: 5px; border-top: 1px solid #e2e8f0;">
                      <div style="font-size: 9.5px; font-weight: 700; color: #64748b; margin-bottom: 3px;">INTEGRASI STASIUN KERETA:</div>
                      <div>${connStations}</div>
                    </div>
                  ` : ''}
                </div>
              `)
              .addTo(currentMap);
          });

          currentMap.on('mouseenter', 'transit-routes-line', () => {
            if (mapRef.current?.getCanvas()) mapRef.current.getCanvas().style.cursor = 'pointer';
          });
          currentMap.on('mouseleave', 'transit-routes-line', () => {
            if (mapRef.current?.getCanvas()) mapRef.current.getCanvas().style.cursor = '';
          });
        } else {
          const src = currentMap.getSource('transit-routes-source') as maplibregl.GeoJSONSource | undefined;
          if (src && typeof src.setData === 'function') {
            src.setData(data);
          }
          if (currentMap.getLayer('transit-routes-line')) {
            currentMap.setLayoutProperty('transit-routes-line', 'visibility', 'visible');
          }
        }
      }).catch(() => {});
    } else {
      if (map && typeof map.getLayer === 'function' && map.getLayer('transit-routes-line')) {
        map.setLayoutProperty('transit-routes-line', 'visibility', 'none');
      }
    }

    return () => {
      isMounted = false;
    };
  }, [showTransitRoutes, activePersona, isMapLoaded]);

  // 2. Survey Points Layer (#PakSibukGa 360 Titik)
  useEffect(() => {
    let isMounted = true;
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;

    if (showSurveyPoints) {
      fetchMapidSurvey().then((surveyData) => {
        if (!isMounted || !mapRef.current) return;
        const currentMap = mapRef.current;
        if (typeof currentMap.getSource !== 'function' || !currentMap.getStyle()) return;
        if (!surveyData || !surveyData.type) return;

        if (surveyData.features) {
          setSurveyCount(surveyData.features.length);
        }

        if (!currentMap.getSource('survey-points-source')) {
          currentMap.addSource('survey-points-source', {
            type: 'geojson',
            data: surveyData
          });

          const beforeStationId = currentMap.getLayer('station-points-halo') ? 'station-points-halo' : undefined;

          // Circle layer with dynamic category color-coding for Activities (placed under station markers)
          currentMap.addLayer({
            id: 'survey-points-circle',
            type: 'circle',
            source: 'survey-points-source',
            paint: {
              'circle-radius': 5.5,
              'circle-color': [
                'match',
                ['get', 'category'],
                'Pedestrian & Walkability', '#06B6D4',     // Cyan untuk Pedestrian
                'Transit Multimodal', '#10B981',           // Emerald untuk Transit Multimodal
                'Hambatan & Disamenity', '#F59E0B',        // Amber untuk Hambatan / PKL
                'User Experience & Dinamika', '#8B5CF6',   // Violet untuk UX / Antrean
                '#3B82F6'                                  // Blue default
              ],
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#ffffff'
            }
          }, beforeStationId);

          bringStationMarkersToFront(currentMap);

          // Interactive Detail Popup on Click
          currentMap.on('click', 'survey-points-circle', (e) => {
            const props = e.features?.[0]?.properties;
            if (!props) return;

            const categoryColors: Record<string, string> = {
              'Pedestrian & Walkability': '#06b6d4',
              'Transit Multimodal': '#10b981',
              'Hambatan & Disamenity': '#f59e0b',
              'User Experience & Dinamika': '#8b5cf6',
            };
            const categoryIcons: Record<string, string> = {
              'Pedestrian & Walkability': `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M13 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0M5 17l3-5 2 2 2-4 3 5M9 12l-1 3"/></svg>`,
              'Transit Multimodal': `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16M8 15h.01M16 15h.01"/></svg>`,
              'Hambatan & Disamenity': `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>`,
              'User Experience & Dinamika': `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
            };
            const badgeBg = categoryColors[props.category] || '#3b82f6';
            const catIcon = categoryIcons[props.category] || '';

            // Resolve image from any possible field name
            let imageUrl = '';
            try {
              const imgField = props.images || props.image || props.foto || props.photo || props.picture || '';
              if (imgField) {
                const parsed = typeof imgField === 'string'
                  ? (imgField.startsWith('[') ? JSON.parse(imgField) : [imgField])
                  : imgField;
                if (Array.isArray(parsed) && parsed.length > 0) {
                  imageUrl = String(parsed[0]).trim();
                }
              }
            } catch {
              // ignore parse errors
            }

            const imageHtml = imageUrl
              ? `<div style="margin: 8px 0 6px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                   <img src="${imageUrl}" alt="Foto Lapangan"
                     style="width: 100%; height: 120px; object-fit: cover; display: block;"
                     onerror="this.parentElement.style.display='none'" />
                 </div>`
              : '';

            new maplibregl.Popup({ closeButton: true, maxWidth: '300px', className: 'survey-popup-dark' })
              .setLngLat(e.lngLat)
              .setHTML(`
                <style>
                  .survey-popup-dark .maplibregl-popup-content {
                    background: rgba(15, 23, 42, 0.97) !important;
                    border: 1px solid rgba(99, 102, 241, 0.3) !important;
                    border-radius: 12px !important;
                    padding: 12px !important;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.6) !important;
                  }
                  .survey-popup-dark .maplibregl-popup-close-button {
                    color: #94a3b8 !important;
                    font-size: 18px !important;
                  }
                  .survey-popup-dark .maplibregl-popup-tip {
                    border-top-color: rgba(15, 23, 42, 0.97) !important;
                  }
                </style>
                <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #e2e8f0;">

                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
                    <span style="
                      background: ${badgeBg}22;
                      color: ${badgeBg};
                      border: 1px solid ${badgeBg}55;
                      padding: 3px 8px;
                      border-radius: 20px;
                      font-size: 9px;
                      font-weight: 700;
                      text-transform: uppercase;
                      letter-spacing: 0.6px;
                      display: inline-flex;
                      align-items: center;
                      gap: 4px;
                    ">
                      <span style="color: ${badgeBg};">${catIcon}</span>
                      ${props.category || 'Survey Activity'}
                    </span>
                    <span style="font-size: 10px; color: #64748b; font-weight: 600; white-space: nowrap;">
                      ${props.id || '#PakSibukGa'}
                    </span>
                  </div>

                  <div style="font-size: 13px; font-weight: 700; color: #f1f5f9; line-height: 1.4; margin-bottom: 5px;">
                    ${props.title || 'Observasi Lapangan'}
                  </div>

                  <p style="margin: 0 0 8px; color: #94a3b8; font-size: 11px; line-height: 1.5;">
                    ${props.description || 'Data survei primer koridor transit Surabaya.'}
                  </p>

                  ${imageHtml}

                  <div style="
                    padding-top: 8px;
                    border-top: 1px solid rgba(99,102,241,0.2);
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 5px;
                    font-size: 10px;
                  ">
                    <div style="color: #64748b;">
                      <span style="color: #94a3b8; font-weight: 600; display: block; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 1px;">Lokasi</span>
                      <span style="color: #cbd5e1;">${props.station_name || props.station_cluster || '-'}</span>
                    </div>
                    <div style="color: #64748b;">
                      <span style="color: #94a3b8; font-weight: 600; display: block; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 1px;">Zona</span>
                      <span style="color: #cbd5e1;">${props.zone ? props.zone.split(' ')[0] : 'Catchment'}</span>
                    </div>
                    <div style="color: #64748b;">
                      <span style="color: #94a3b8; font-weight: 600; display: block; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 1px;">Surveyor</span>
                      <span style="color: #cbd5e1;">${props.user || props.surveyor || '@PakSibukGa'}</span>
                    </div>
                    <div style="color: #64748b;">
                      <span style="color: #94a3b8; font-weight: 600; display: block; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 1px;">Waktu</span>
                      <span style="color: #cbd5e1;">${(props.timestamp || '').split(' ')[1] || (props.date || 'WIB')}</span>
                    </div>
                  </div>
                </div>
              `)
              .addTo(currentMap);
          });

          // Pointer cursor on hover
          currentMap.on('mouseenter', 'survey-points-circle', () => {
            if (mapRef.current?.getCanvas()) mapRef.current.getCanvas().style.cursor = 'pointer';
          });
          currentMap.on('mouseleave', 'survey-points-circle', () => {
            if (mapRef.current?.getCanvas()) mapRef.current.getCanvas().style.cursor = '';
          });
        } else {
          const src = currentMap.getSource('survey-points-source') as maplibregl.GeoJSONSource | undefined;
          if (src && typeof src.setData === 'function') {
            src.setData(surveyData);
          }
          if (currentMap.getLayer('survey-points-circle')) {
            currentMap.setLayoutProperty('survey-points-circle', 'visibility', 'visible');
          }
        }
      }).catch(() => {});
    } else {
      if (map && typeof map.getLayer === 'function' && map.getLayer('survey-points-circle')) {
        map.setLayoutProperty('survey-points-circle', 'visibility', 'none');
      }
    }

    return () => {
      isMounted = false;
    };
  }, [showSurveyPoints, isMapLoaded]);

  // 2.1 Halte Bus & Feeder Layer
  useEffect(() => {
    let isMounted = true;
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;

    if (showTransitNodes) {
      fetchTransitNodes().then((data) => {
        if (!isMounted || !mapRef.current) return;
        const currentMap = mapRef.current;
        if (typeof currentMap.getSource !== 'function' || !currentMap.getStyle()) return;
        if (!data || !data.type) return;

        const beforeStationId = currentMap.getLayer('station-points-halo') ? 'station-points-halo' : undefined;

        if (!currentMap.getSource('transit-nodes-source')) {
          currentMap.addSource('transit-nodes-source', { type: 'geojson', data });
          currentMap.addLayer({
            id: 'transit-nodes-circle',
            type: 'circle',
            source: 'transit-nodes-source',
            paint: {
              'circle-radius': 5,
              'circle-color': '#10B981',
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#ffffff'
            }
          }, beforeStationId);

          bringStationMarkersToFront(currentMap);

          currentMap.on('click', 'transit-nodes-circle', (e) => {
            const props = e.features?.[0]?.properties;
            if (!props) return;
            new maplibregl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="font-family: sans-serif; padding: 4px; font-size: 12px;">
                  <div style="display: flex; items-center; gap: 6px; margin-bottom: 2px;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981; margin-top: 3px;"></span>
                    <strong style="color: #059669;">${props.NAMA || 'Halte Bus'}</strong>
                  </div>
                  <span style="color: #4b5563; font-size: 11px;">${props.ALAMAT || 'Kota Surabaya'}</span>
                </div>
              `)
              .addTo(currentMap);
          });
        } else {
          const src = currentMap.getSource('transit-nodes-source') as maplibregl.GeoJSONSource | undefined;
          if (src && typeof src.setData === 'function') {
            src.setData(data);
          }
          if (currentMap.getLayer('transit-nodes-circle')) {
            currentMap.setLayoutProperty('transit-nodes-circle', 'visibility', 'visible');
          }
        }
      }).catch(() => {});
    } else {
      if (map && typeof map.getLayer === 'function' && map.getLayer('transit-nodes-circle')) {
        map.setLayoutProperty('transit-nodes-circle', 'visibility', 'none');
      }
    }

    return () => {
      isMounted = false;
    };
  }, [showTransitNodes, isMapLoaded]);

  // 2.2 Flood Hazard Vulnerability Layer
  useEffect(() => {
    let isMounted = true;
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;

    if (showFloodHazard) {
      fetchFloodHazard().then((data) => {
        if (!isMounted || !mapRef.current) return;
        const currentMap = mapRef.current;
        if (typeof currentMap.getSource !== 'function' || !currentMap.getStyle()) return;
        if (!data || !data.type) return;

        const beforeStationId = currentMap.getLayer('station-points-halo') ? 'station-points-halo' : undefined;

        if (!currentMap.getSource('flood-hazard-source')) {
          currentMap.addSource('flood-hazard-source', { type: 'geojson', data });
          currentMap.addLayer({
            id: 'flood-hazard-fill',
            type: 'fill',
            source: 'flood-hazard-source',
            paint: {
              'fill-color': '#3B82F6',
              'fill-opacity': 0.25
            }
          }, beforeStationId);
          currentMap.addLayer({
            id: 'flood-hazard-line',
            type: 'line',
            source: 'flood-hazard-source',
            paint: {
              'line-color': '#2563EB',
              'line-width': 1
            }
          }, beforeStationId);

          bringStationMarkersToFront(currentMap);

          currentMap.on('click', 'flood-hazard-fill', (e) => {
            const props = e.features?.[0]?.properties;
            if (!props) return;
            new maplibregl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="font-family: sans-serif; padding: 4px; font-size: 12px;">
                  <div style="display: flex; items-center; gap: 6px; margin-bottom: 2px;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #2563eb; margin-top: 3px;"></span>
                    <strong style="color: #2563EB;">Zona Risiko Genangan Banjir</strong>
                  </div>
                  <span style="font-size: 11px; color: #475569;">Tingkat Kerentanan: ${props.Kelas || 'Terancam Banjir'}</span>
                </div>
              `)
              .addTo(currentMap);
          });
        } else {
          const src = currentMap.getSource('flood-hazard-source') as maplibregl.GeoJSONSource | undefined;
          if (src && typeof src.setData === 'function') {
            src.setData(data);
          }
          if (currentMap.getLayer('flood-hazard-fill')) {
            currentMap.setLayoutProperty('flood-hazard-fill', 'visibility', 'visible');
            currentMap.setLayoutProperty('flood-hazard-line', 'visibility', 'visible');
          }
        }
      }).catch(() => {});
    } else {
      if (map && typeof map.getLayer === 'function' && map.getLayer('flood-hazard-fill')) {
        map.setLayoutProperty('flood-hazard-fill', 'visibility', 'none');
        map.setLayoutProperty('flood-hazard-line', 'visibility', 'none');
      }
    }

    return () => {
      isMounted = false;
    };
  }, [showFloodHazard, isMapLoaded]);

  // 2.3 Nighttime Light (NTL) Economic Radiance Layer
  useEffect(() => {
    let isMounted = true;
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;

    if (showNighttimeLight) {
      fetchNighttimeLight().then((data) => {
        if (!isMounted || !mapRef.current) return;
        const currentMap = mapRef.current;
        if (typeof currentMap.getSource !== 'function' || !currentMap.getStyle()) return;
        if (!data || !data.type) return;

        const beforeStationId = currentMap.getLayer('station-points-halo') ? 'station-points-halo' : undefined;

        if (!currentMap.getSource('ntl-source')) {
          currentMap.addSource('ntl-source', { type: 'geojson', data });
          currentMap.addLayer({
            id: 'ntl-fill',
            type: 'fill',
            source: 'ntl-source',
            paint: {
              'fill-color': '#F59E0B',
              'fill-opacity': 0.22
            }
          }, beforeStationId);
          currentMap.addLayer({
            id: 'ntl-line',
            type: 'line',
            source: 'ntl-source',
            paint: {
              'line-color': '#D97706',
              'line-width': 1
            }
          }, beforeStationId);

          bringStationMarkersToFront(currentMap);
        } else {
          const src = currentMap.getSource('ntl-source') as maplibregl.GeoJSONSource | undefined;
          if (src && typeof src.setData === 'function') {
            src.setData(data);
          }
          if (currentMap.getLayer('ntl-fill')) {
            currentMap.setLayoutProperty('ntl-fill', 'visibility', 'visible');
            currentMap.setLayoutProperty('ntl-line', 'visibility', 'visible');
          }
        }
      }).catch(() => {});
    } else {
      if (map && typeof map.getLayer === 'function' && map.getLayer('ntl-fill')) {
        map.setLayoutProperty('ntl-fill', 'visibility', 'none');
        map.setLayoutProperty('ntl-line', 'visibility', 'none');
      }
    }

    return () => {
      isMounted = false;
    };
  }, [showNighttimeLight, isMapLoaded]);

  // 2.4 Shopping Centers (Pusat Perbelanjaan GEO MAPID 2025) Layer
  useEffect(() => {
    let isMounted = true;
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;

    if (showShoppingCenters) {
      fetchShoppingCenters().then((data) => {
        if (!isMounted || !mapRef.current) return;
        const currentMap = mapRef.current;
        if (typeof currentMap.getSource !== 'function' || !currentMap.getStyle()) return;
        if (!data || !data.type) return;

        const beforeStationId = currentMap.getLayer('station-points-halo') ? 'station-points-halo' : undefined;

        if (!currentMap.getSource('shopping-centers-source')) {
          currentMap.addSource('shopping-centers-source', { type: 'geojson', data });
          currentMap.addLayer({
            id: 'shopping-centers-circle',
            type: 'circle',
            source: 'shopping-centers-source',
            paint: {
              'circle-radius': 6,
              'circle-color': '#EC4899',
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#ffffff'
            }
          }, beforeStationId);

          bringStationMarkersToFront(currentMap);

          currentMap.on('click', 'shopping-centers-circle', (e) => {
            const props = e.features?.[0]?.properties;
            if (!props) return;
            new maplibregl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="font-family: sans-serif; padding: 4px; font-size: 12px; color: #0f172a;">
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ec4899;"></span>
                    <strong style="color: #db2777;">${props.NAMA || 'Pusat Perbelanjaan'}</strong>
                  </div>
                  <div style="color: #475569; font-size: 11px; margin-top: 2px;">${props.ALAMAT || 'Kota Surabaya'}</div>
                  <div style="color: #64748b; font-size: 9.5px; margin-top: 4px; font-weight: 600;">Sumber: GEO MAPID Data Catalog 2025</div>
                </div>
              `)
              .addTo(currentMap);
          });
        } else {
          const src = currentMap.getSource('shopping-centers-source') as maplibregl.GeoJSONSource | undefined;
          if (src && typeof src.setData === 'function') {
            src.setData(data);
          }
          if (currentMap.getLayer('shopping-centers-circle')) {
            currentMap.setLayoutProperty('shopping-centers-circle', 'visibility', 'visible');
          }
        }
      }).catch(() => {});
    } else {
      if (map && typeof map.getLayer === 'function' && map.getLayer('shopping-centers-circle')) {
        map.setLayoutProperty('shopping-centers-circle', 'visibility', 'none');
      }
    }

    return () => {
      isMounted = false;
    };
  }, [showShoppingCenters, isMapLoaded]);

  // 2.5 Dynamic Basemap Style Switch
  useEffect(() => {
    if (!mapRef.current || currentStyleRef.current === basemapStyle) return;
    currentStyleRef.current = basemapStyle;
    setIsMapLoaded(false);

    const styleUrl = BASEMAP_STYLES[basemapStyle] || BASEMAP_STYLES.street;
    mapRef.current.setStyle(styleUrl, { diff: false });
  }, [basemapStyle]);

  // 4. Fly to station when activeStation changes
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;
    const st = FALLBACK_STATIONS.find((s) => s.id === activeStation);
    if (st) {
      mapRef.current.flyTo({
        center: [st.longitude, st.latitude],
        zoom: 14.5,
        pitch: 35,
        essential: true,
        duration: 1500
      });
    }
  }, [activeStation, isMapLoaded]);

  // 5. React to Spatial AI Trigger Action
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded || !mapActionTrigger) return;
    const map = mapRef.current;
    const vs = mapActionTrigger.view_state;

    if (vs && vs.center) {
      map.flyTo({
        center: vs.center,
        zoom: vs.zoom || 14.0,
        pitch: vs.pitch || 30,
        essential: true,
        duration: 1800
      });
    }
  }, [mapActionTrigger, isMapLoaded]);

  // 6. GISTARU — Rencana Pola Ruang RDTR Surabaya (ATR/BPN)
  useEffect(() => {
    let isMounted = true;
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    if (showGistaru) {
      fetch(`${API_BASE}/api/layers/gistaru`)
        .then((r) => r.json())
        .then((data) => {
          if (!isMounted || !mapRef.current) return;
          const m = mapRef.current;
          if (!m.getStyle()) return;

          // Zone-code color palette (RDTR Surabaya sub-zones)
          const ZONA_COLORS: Record<string, string> = {
            'R': '#6366f1',   // Perumahan – Indigo
            'K': '#f59e0b',   // Perdagangan & Jasa – Amber
            'P': '#10b981',   // Perkantoran – Emerald
            'W': '#3b82f6',   // Kawasan Industri – Blue
            'I': '#64748b',   // Industri – Slate
            'RTH': '#22c55e', // Ruang Terbuka Hijau – Green
            'SPU': '#8b5cf6', // Sarana Pelayanan Umum – Violet
            'KT': '#ec4899',  // Kawasan TOD – Pink
            'default': '#94a3b8',
          };

          const beforeStationId = m.getLayer('station-points-halo') ? 'station-points-halo' : undefined;

          if (!m.getSource('gistaru-source')) {
            m.addSource('gistaru-source', { type: 'geojson', data });

            // Polygon fill (rendered under station markers)
            m.addLayer({
              id: 'gistaru-fill',
              type: 'fill',
              source: 'gistaru-source',
              paint: {
                'fill-color': [
                  'match',
                  ['slice', ['coalesce', ['get', 'KODZON'], ['get', 'KODSZN'], 'default'], 0, 1],
                  'R', ZONA_COLORS['R'],
                  'K', ZONA_COLORS['K'],
                  'P', ZONA_COLORS['P'],
                  'W', ZONA_COLORS['W'],
                  'I', ZONA_COLORS['I'],
                  ZONA_COLORS['default'],
                ],
                'fill-opacity': 0.25,
              },
            }, beforeStationId);

            // Polygon border
            m.addLayer({
              id: 'gistaru-line',
              type: 'line',
              source: 'gistaru-source',
              paint: {
                'line-color': '#f59e0b',
                'line-width': 0.8,
                'line-opacity': 0.6,
              },
            }, beforeStationId);

            bringStationMarkersToFront(m);

            // Click popup
            m.on('click', 'gistaru-fill', (e) => {
              const p = e.features?.[0]?.properties;
              if (!p) return;
              new maplibregl.Popup({ maxWidth: '280px' })
                .setLngLat(e.lngLat)
                .setHTML(`
                  <div style="font-family:system-ui,sans-serif;font-size:12px;color:#0f172a;padding:6px 4px">
                    <div style="font-weight:700;font-size:13px;margin-bottom:4px">${p.NAMOBJ || p.NAMZON || 'Pola Ruang'}</div>
                    <div style="color:#475569;margin-bottom:3px">
                      Zona: <strong>${p.NAMZON || '–'}</strong> (${p.KODZON || '–'})<br/>
                      Sub-Zona: <strong>${p.NAMSZN || '–'}</strong> (${p.KODSZN || '–'})<br/>
                      BWP: <strong>${p.KODBWP || '–'}${p.KOSBWP ? '-' + p.KOSBWP : ''}</strong><br/>
                      Kelurahan: <strong>${p.WADMKD || '–'}</strong>, ${p.WADMKC || ''}<br/>
                      Luas: <strong>${p.LUASHA ? p.LUASHA.toFixed(2) + ' ha' : '–'}</strong><br/>
                      TOD: <strong>${p.TOD_04 || '–'}</strong>
                    </div>
                    <div style="font-size:9px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:4px;margin-top:4px">
                      Sumber: GISTARU ATR/BPN — RDTR Kota Surabaya Perda No. 8 Tahun 2018
                    </div>
                  </div>
                `)
                .addTo(m);
            });
            m.on('mouseenter', 'gistaru-fill', () => { if (m.getCanvas()) m.getCanvas().style.cursor = 'pointer'; });
            m.on('mouseleave', 'gistaru-fill', () => { if (m.getCanvas()) m.getCanvas().style.cursor = ''; });
          } else {
            const src = m.getSource('gistaru-source') as maplibregl.GeoJSONSource | undefined;
            if (src) src.setData(data);
          }

          if (m.getLayer('gistaru-fill')) m.setLayoutProperty('gistaru-fill', 'visibility', 'visible');
          if (m.getLayer('gistaru-line')) m.setLayoutProperty('gistaru-line', 'visibility', 'visible');
        })
        .catch(() => {});
    } else {
      const m = mapRef.current;
      if (m?.getLayer('gistaru-fill')) m.setLayoutProperty('gistaru-fill', 'visibility', 'none');
      if (m?.getLayer('gistaru-line')) m.setLayoutProperty('gistaru-line', 'visibility', 'none');
    }
    return () => { isMounted = false; };
  }, [showGistaru, isMapLoaded]);

  // 7. BHUMI — Persil Bidang Tanah (ATR/BPN)
  useEffect(() => {
    let isMounted = true;
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    if (showBhumi) {
      fetch(`${API_BASE}/api/layers/bhumi`)
        .then((r) => r.json())
        .then((data) => {
          if (!isMounted || !mapRef.current) return;
          const m = mapRef.current;
          if (!m.getStyle()) return;

          const beforeStationId = m.getLayer('station-points-halo') ? 'station-points-halo' : undefined;

          if (!m.getSource('bhumi-source')) {
            m.addSource('bhumi-source', { type: 'geojson', data });

            // Fill by tipe hak (placed under station markers)
            m.addLayer({
              id: 'bhumi-fill',
              type: 'fill',
              source: 'bhumi-source',
              paint: {
                'fill-color': [
                  'match',
                  ['coalesce', ['get', 'tipehak'], 'HGB'],
                  'Hak Milik', '#22c55e',
                  'Hak Guna Bangunan', '#3b82f6',
                  'Hak Pakai', '#f59e0b',
                  'Hak Guna Usaha', '#ef4444',
                  '#94a3b8',
                ],
                'fill-opacity': 0.25,
              },
            }, beforeStationId);

            // Border
            m.addLayer({
              id: 'bhumi-line',
              type: 'line',
              source: 'bhumi-source',
              paint: {
                'line-color': '#22c55e',
                'line-width': 1.0,
                'line-opacity': 0.7,
              },
            }, beforeStationId);

            bringStationMarkersToFront(m);

            // Click popup
            m.on('click', 'bhumi-fill', (e) => {
              const p = e.features?.[0]?.properties;
              if (!p) return;
              new maplibregl.Popup({ maxWidth: '280px' })
                .setLngLat(e.lngLat)
                .setHTML(`
                  <div style="font-family:system-ui,sans-serif;font-size:12px;color:#0f172a;padding:6px 4px">
                    <div style="font-weight:700;font-size:13px;margin-bottom:4px">Bidang Tanah</div>
                    <div style="color:#475569;margin-bottom:3px">
                      NIB: <strong>${p.nib || p.persilpasifid || '–'}</strong><br/>
                      Tipe Hak: <strong>${p.tipehak || '–'}</strong><br/>
                      Luas: <strong>${p.luas ? Math.round(p.luas) + ' m²' : '–'}</strong><br/>
                      Akurasi: <strong>${p.akurasibidang || '–'}</strong><br/>
                      Stasiun Terdekat: <strong>${(p._station_id || '–').replace(/_/g, ' ')}</strong>
                    </div>
                    <div style="font-size:9px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:4px;margin-top:4px">
                      Sumber: BHUMI ATR/BPN — Bidang Tanah Terdaftar
                    </div>
                  </div>
                `)
                .addTo(m);
            });
            m.on('mouseenter', 'bhumi-fill', () => { if (m.getCanvas()) m.getCanvas().style.cursor = 'pointer'; });
            m.on('mouseleave', 'bhumi-fill', () => { if (m.getCanvas()) m.getCanvas().style.cursor = ''; });
          } else {
            const src = m.getSource('bhumi-source') as maplibregl.GeoJSONSource | undefined;
            if (src) src.setData(data);
          }

          if (m.getLayer('bhumi-fill')) m.setLayoutProperty('bhumi-fill', 'visibility', 'visible');
          if (m.getLayer('bhumi-line')) m.setLayoutProperty('bhumi-line', 'visibility', 'visible');
        })
        .catch(() => {});
    } else {
      const m = mapRef.current;
      if (m?.getLayer('bhumi-fill')) m.setLayoutProperty('bhumi-fill', 'visibility', 'none');
      if (m?.getLayer('bhumi-line')) m.setLayoutProperty('bhumi-line', 'visibility', 'none');
    }
    return () => { isMounted = false; };
  }, [showBhumi, isMapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      
      {/* Title Overlay for Business Persona */}
      {activePersona === 'business' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md border border-brand-lime/30 shadow-lg shadow-brand-lime/10 px-4 py-2 rounded-xl text-center">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
              Surabaya Transit Corridor - Commercial H3 Spatial Analysis
            </h2>
          </div>
        </div>
      )}

      {/* Floating Layer & Basemap Control Widget (Top-Left) */}
      {onChangeBasemapStyle && onChangeChoroplethMode && onToggleSurveyPoints && (
        <div className="absolute top-4 left-4 z-20">
          <div className="relative">
            {/* Trigger Button */}
            <button
              onClick={() => setIsLayerControlOpen(!isLayerControlOpen)}
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-brand-lime px-3 py-2 rounded-xl border border-slate-700/70 backdrop-blur-md shadow-xl transition-all font-semibold text-xs"
              title="Toggle Layer & Basemap Control"
            >
              <Layers className="w-4 h-4 text-brand-lime" />
              <span className="hidden sm:inline">Layers &amp; Basemap</span>
              <span className="text-[9px] bg-brand-lime/20 text-brand-lime font-bold px-1.5 py-0.5 rounded uppercase">
                {basemapStyle}
              </span>
            </button>

            {/* Dropdown Floating Panel */}
            {isLayerControlOpen && (
              <div className="absolute top-12 left-0 z-30 animate-in fade-in zoom-in-95 duration-150">
                <LayerControl
                  choroplethMode={choroplethMode}
                  onChangeChoroplethMode={(mode) => {
                    onChangeChoroplethMode(mode);
                  }}
                  showSurveyPoints={showSurveyPoints}
                  onToggleSurveyPoints={onToggleSurveyPoints}
                  showTransitNodes={showTransitNodes}
                  onToggleTransitNodes={() => setShowTransitNodes((prev) => !prev)}
                  showTransitRoutes={showTransitRoutes}
                  onToggleTransitRoutes={() => setShowTransitRoutes((prev) => !prev)}
                  routesCount={routesCount}
                  showShoppingCenters={showShoppingCenters}
                  onToggleShoppingCenters={() => setShowShoppingCenters((prev) => !prev)}
                  shoppingCount={shoppingCount}
                  showFloodHazard={showFloodHazard}
                  onToggleFloodHazard={() => setShowFloodHazard((prev) => !prev)}
                  showNighttimeLight={showNighttimeLight}
                  onToggleNighttimeLight={() => setShowNighttimeLight((prev) => !prev)}
                  showIsochrone={showIsochrone}
                  onToggleIsochrone={() => setShowIsochrone((prev) => !prev)}
                  isochroneMode={isochroneMode}
                  onChangeIsochroneMode={(mode) => setIsochroneMode(mode)}
                  isochroneMinutes={isochroneMinutes}
                  onChangeIsochroneMinutes={(mins) => setIsochroneMinutes(mins)}
                  isochroneViewType={isochroneViewType}
                  onChangeIsochroneViewType={(type) => setIsochroneViewType(type)}
                  surveyCount={surveyCount}
                  transitCount={transitCount}
                  floodCount={floodCount}
                  ntlCount={ntlCount}
                  basemapStyle={basemapStyle}
                  onChangeBasemapStyle={(style) => {
                    onChangeBasemapStyle(style);
                  }}
                  onClose={() => setIsLayerControlOpen(false)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
