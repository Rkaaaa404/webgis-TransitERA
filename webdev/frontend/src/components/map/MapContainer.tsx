'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { StationId } from '@/types';
import { BASEMAP_STYLES, SURABAYA_DEFAULT_ZOOM } from '@/lib/mapid';
import { FALLBACK_STATIONS, fetchMapidSurvey, fetchTransitNodes, fetchFloodHazard, fetchNighttimeLight } from '@/lib/api';
import { ChoroplethMode, BasemapStyleKey, LayerControl } from './LayerControl';
import { PersonaType } from '@/lib/persona';
import { Layers } from 'lucide-react';

import { useH3Layer } from './useH3Layer';
import { useStationMarkers } from './useStationMarkers';

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
  mapActionTrigger
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(false);
  const [showTransitNodes, setShowTransitNodes] = useState(false);
  const [showFloodHazard, setShowFloodHazard] = useState(false);
  const [showNighttimeLight, setShowNighttimeLight] = useState(false);
  const currentStyleRef = useRef<BasemapStyleKey>(basemapStyle);

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
      bearing: 0
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('error', (e) => {
      console.error('MAPLIBRE ERROR:', e.error || e);
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
  useH3Layer(mapRef.current, isMapLoaded, choroplethMode, onSelectH3Index, h3ScoreRange, h3RingFilter);
  useStationMarkers(mapRef.current, isMapLoaded, onSelectStation);

  // 1.5 Add Feeder Routes layer for Commuter Persona
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;
    
    if (activePersona === 'commuter') {
      if (!map.getSource('feeder-routes-source')) {
        map.addSource('feeder-routes-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [112.7521, -7.2654], // Gubeng
                    [112.7481, -7.2704],
                    [112.7431, -7.2754],
                    [112.7383, -7.3014]  // Wonokromo
                  ]
                }
              }
            ]
          }
        });
        map.addLayer({
          id: 'feeder-routes-line',
          type: 'line',
          source: 'feeder-routes-source',
          paint: {
            'line-color': '#B1FC91',
            'line-width': 3,
            'line-dasharray': [2, 2],
            'line-opacity': 0.8
          }
        });
      } else {
        if (map.getLayer('feeder-routes-line')) {
          map.setLayoutProperty('feeder-routes-line', 'visibility', 'visible');
        }
      }
    } else {
      if (map.getLayer('feeder-routes-line')) {
        map.setLayoutProperty('feeder-routes-line', 'visibility', 'none');
      }
    }
  }, [activePersona, isMapLoaded]);

  // 2. Survey Points Layer
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;

    if (showSurveyPoints) {
      fetchMapidSurvey().then((surveyData) => {
        if (!map.getSource('survey-points-source')) {
          map.addSource('survey-points-source', {
            type: 'geojson',
            data: surveyData
          });

          map.addLayer({
            id: 'survey-points-circle',
            type: 'circle',
            source: 'survey-points-source',
            paint: {
              'circle-radius': 5,
              'circle-color': '#4FC5C2',
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#ffffff'
            }
          });
        } else {
          (map.getSource('survey-points-source') as maplibregl.GeoJSONSource).setData(surveyData);
          if (map.getLayer('survey-points-circle')) {
            map.setLayoutProperty('survey-points-circle', 'visibility', 'visible');
          }
        }
      });
    } else {
      if (map.getLayer('survey-points-circle')) {
        map.setLayoutProperty('survey-points-circle', 'visibility', 'none');
      }
    }
  }, [showSurveyPoints, isMapLoaded]);

  // 2.1 Halte Bus & Feeder Layer
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;

    if (showTransitNodes) {
      fetchTransitNodes().then((data) => {
        if (!map.getSource('transit-nodes-source')) {
          map.addSource('transit-nodes-source', { type: 'geojson', data });
          map.addLayer({
            id: 'transit-nodes-circle',
            type: 'circle',
            source: 'transit-nodes-source',
            paint: {
              'circle-radius': 5,
              'circle-color': '#10B981',
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#ffffff'
            }
          });

          map.on('click', 'transit-nodes-circle', (e) => {
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
              .addTo(map);
          });
        } else {
          (map.getSource('transit-nodes-source') as maplibregl.GeoJSONSource).setData(data);
          if (map.getLayer('transit-nodes-circle')) {
            map.setLayoutProperty('transit-nodes-circle', 'visibility', 'visible');
          }
        }
      });
    } else {
      if (map.getLayer('transit-nodes-circle')) {
        map.setLayoutProperty('transit-nodes-circle', 'visibility', 'none');
      }
    }
  }, [showTransitNodes, isMapLoaded]);

  // 2.2 Flood Hazard Vulnerability Layer
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;

    if (showFloodHazard) {
      fetchFloodHazard().then((data) => {
        if (!map.getSource('flood-hazard-source')) {
          map.addSource('flood-hazard-source', { type: 'geojson', data });
          map.addLayer({
            id: 'flood-hazard-fill',
            type: 'fill',
            source: 'flood-hazard-source',
            paint: {
              'fill-color': '#3B82F6',
              'fill-opacity': 0.35
            }
          });
          map.addLayer({
            id: 'flood-hazard-line',
            type: 'line',
            source: 'flood-hazard-source',
            paint: {
              'line-color': '#2563EB',
              'line-width': 1
            }
          });

          map.on('click', 'flood-hazard-fill', (e) => {
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
              .addTo(map);
          });
        } else {
          (map.getSource('flood-hazard-source') as maplibregl.GeoJSONSource).setData(data);
          if (map.getLayer('flood-hazard-fill')) {
            map.setLayoutProperty('flood-hazard-fill', 'visibility', 'visible');
            map.setLayoutProperty('flood-hazard-line', 'visibility', 'visible');
          }
        }
      });
    } else {
      if (map.getLayer('flood-hazard-fill')) {
        map.setLayoutProperty('flood-hazard-fill', 'visibility', 'none');
        map.setLayoutProperty('flood-hazard-line', 'visibility', 'none');
      }
    }
  }, [showFloodHazard, isMapLoaded]);

  // 2.3 Nighttime Light (NTL) Economic Radiance Layer
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;

    if (showNighttimeLight) {
      fetchNighttimeLight().then((data) => {
        if (!map.getSource('ntl-source')) {
          map.addSource('ntl-source', { type: 'geojson', data });
          map.addLayer({
            id: 'ntl-fill',
            type: 'fill',
            source: 'ntl-source',
            paint: {
              'fill-color': '#F59E0B',
              'fill-opacity': 0.28
            }
          });
          map.addLayer({
            id: 'ntl-line',
            type: 'line',
            source: 'ntl-source',
            paint: {
              'line-color': '#D97706',
              'line-width': 1
            }
          });
        } else {
          (map.getSource('ntl-source') as maplibregl.GeoJSONSource).setData(data);
          if (map.getLayer('ntl-fill')) {
            map.setLayoutProperty('ntl-fill', 'visibility', 'visible');
            map.setLayoutProperty('ntl-line', 'visibility', 'visible');
          }
        }
      });
    } else {
      if (map.getLayer('ntl-fill')) {
        map.setLayoutProperty('ntl-fill', 'visibility', 'none');
        map.setLayoutProperty('ntl-line', 'visibility', 'none');
      }
    }
  }, [showNighttimeLight, isMapLoaded]);

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
                  showFloodHazard={showFloodHazard}
                  onToggleFloodHazard={() => setShowFloodHazard((prev) => !prev)}
                  showNighttimeLight={showNighttimeLight}
                  onToggleNighttimeLight={() => setShowNighttimeLight((prev) => !prev)}
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
