import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { ChoroplethMode } from './LayerControl';
import { fetchH3Grid } from '@/lib/api';

function getChoroplethPaintExpression(mode: ChoroplethMode): any {
  if (mode === 'tod_score') {
    return [
      'interpolate',
      ['linear'],
      ['get', 'tod_readiness_score'],
      40, '#D32F2F',
      60, '#F59E0B',
      75, '#4FC5C2',
      85, '#22C55E',
      100, '#22C55E'
    ];
  } else if (mode === 'njop_premium') {
    return [
      'interpolate',
      ['linear'],
      ['get', 'predicted_njop_premium_pct'],
      3.0, '#3663D8',
      7.0, '#4FC5C2',
      11.0, '#22C55E',
      16.0, '#B1FC91',
      25.0, '#B1FC91'
    ];
  } else if (mode === 'typology') {
    return [
      'match',
      ['get', 'typology'],
      'Commercial Transit Hub', '#B1FC91',
      'Mixed-Use Residential Area', '#4FC5C2',
      'Mixed-Use Heritage Core', '#F59E0B',
      'Low-Accessibility Feeder Zone', '#473DD2',
      '#3A3468'
    ];
  } else {
    return 'rgba(0,0,0,0)';
  }
}

function getFilterExpression(h3ScoreRange?: [number, number], h3RingFilter?: number): any {
  const minScore = h3ScoreRange ? h3ScoreRange[0] : 0;
  const maxScore = h3ScoreRange ? h3ScoreRange[1] : 100;
  const maxRing = h3RingFilter !== undefined ? h3RingFilter : 5;

  return [
    'all',
    ['>=', ['get', 'tod_readiness_score'], minScore],
    ['<=', ['get', 'tod_readiness_score'], maxScore],
    ['<=', ['get', 'ring_distance'], maxRing]
  ];
}

export function useH3Layer(
  map: maplibregl.Map | null,
  isMapLoaded: boolean,
  choroplethMode: ChoroplethMode,
  onSelectH3Index?: (index: string | null) => void,
  h3ScoreRange?: [number, number],
  h3RingFilter?: number,
  activePersona?: string
) {
  const cachedDataRef = useRef<any>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // 1. Initial / Style-Switch Layer Setup
  useEffect(() => {
    if (!map || !isMapLoaded) return;

    let isSubscribed = true;

    const setupH3Layers = async () => {
      // Use cached data or fetch
      let h3Data = cachedDataRef.current;
      if (!h3Data) {
        h3Data = await fetchH3Grid();
        if (!isSubscribed) return;
        cachedDataRef.current = h3Data;
      }

      // Check if source already exists
      if (!map.getSource('h3-tod-source')) {
        map.addSource('h3-tod-source', {
          type: 'geojson',
          data: h3Data,
          generateId: true
        });
      } else {
        (map.getSource('h3-tod-source') as maplibregl.GeoJSONSource).setData(h3Data);
      }

      const isVisible = choroplethMode !== 'none' && activePersona !== 'commuter';
      const visibility = isVisible ? 'visible' : 'none';

      // Add Fill Layer if not present
      if (!map.getLayer('h3-tod-fill')) {
        map.addLayer({
          id: 'h3-tod-fill',
          type: 'fill',
          source: 'h3-tod-source',
          layout: {
            visibility: visibility
          },
          paint: {
            'fill-color': getChoroplethPaintExpression(choroplethMode),
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.88,
              0.62
            ]
          },
          filter: getFilterExpression(h3ScoreRange, h3RingFilter)
        });
      } else {
        map.setLayoutProperty('h3-tod-fill', 'visibility', visibility);
        if (isVisible) {
          map.setPaintProperty('h3-tod-fill', 'fill-color', getChoroplethPaintExpression(choroplethMode));
        }
        map.setFilter('h3-tod-fill', getFilterExpression(h3ScoreRange, h3RingFilter));
      }

      // Add Border Layer if not present
      if (!map.getLayer('h3-tod-border')) {
        map.addLayer({
          id: 'h3-tod-border',
          type: 'line',
          source: 'h3-tod-source',
          layout: {
            visibility: visibility
          },
          paint: {
            'line-color': '#4A4478',
            'line-width': 1.0,
            'line-opacity': 0.65
          },
          filter: getFilterExpression(h3ScoreRange, h3RingFilter)
        });
      } else {
        map.setLayoutProperty('h3-tod-border', 'visibility', visibility);
        map.setFilter('h3-tod-border', getFilterExpression(h3ScoreRange, h3RingFilter));
      }

      // Event Listeners for Interaction
      let hoveredStateId: any = null;

      map.on('mousemove', 'h3-tod-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features.length > 0) {
          if (hoveredStateId !== null) {
            map.setFeatureState({ source: 'h3-tod-source', id: hoveredStateId }, { hover: false });
          }
          hoveredStateId = e.features[0].id;
          map.setFeatureState({ source: 'h3-tod-source', id: hoveredStateId }, { hover: true });
        }
      });

      map.on('mouseleave', 'h3-tod-fill', () => {
        map.getCanvas().style.cursor = '';
        if (hoveredStateId !== null) {
          map.setFeatureState({ source: 'h3-tod-source', id: hoveredStateId }, { hover: false });
        }
        hoveredStateId = null;
      });

      map.on('click', 'h3-tod-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const props = e.features[0].properties;
          const coordinates = e.lngLat;
          
          if (onSelectH3Index) {
            onSelectH3Index(props.h3_index);
          }

          if (popupRef.current) popupRef.current.remove();

          const popupContent = `
            <div class="space-y-1.5 text-xs text-slate-100 p-1">
              <div class="flex items-center justify-between border-b border-slate-700 pb-1">
                <span class="font-bold text-[#B1FC91]">Sel H3: ${props.h3_index}</span>
                <span class="text-[10px] bg-[#4FC5C2]/20 px-1.5 py-0.5 rounded text-[#4FC5C2] font-semibold border border-[#4FC5C2]/40">${props.station_name}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span class="text-slate-400">TOD Score:</span>
                  <div class="text-sm font-bold text-[#22C55E]">${props.tod_readiness_score} / 100</div>
                </div>
                <div>
                  <span class="text-slate-400">Est. %ΔNJOP:</span>
                  <div class="text-sm font-bold text-[#B1FC91]">+${props.predicted_njop_premium_pct}%</div>
                </div>
              </div>
              <div class="text-[10px] text-slate-300 pt-1 border-t border-slate-800">
                Tipologi: <strong class="text-slate-100">${props.typology}</strong>
              </div>
            </div>
          `;

          popupRef.current = new maplibregl.Popup({ closeButton: true, closeOnClick: false })
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map);
        }
      });
    };

    setupH3Layers();

    return () => {
      isSubscribed = false;
      if (popupRef.current) popupRef.current.remove();
    };
  }, [map, isMapLoaded, onSelectH3Index]);

  // 2. Update Paint Property & Visibility dynamically when choroplethMode or activePersona changes
  useEffect(() => {
    if (!map || !isMapLoaded) return;
    const isVisible = choroplethMode !== 'none' && activePersona !== 'commuter';
    const visibility = isVisible ? 'visible' : 'none';

    if (map.getLayer('h3-tod-fill')) {
      map.setLayoutProperty('h3-tod-fill', 'visibility', visibility);
      if (isVisible) {
        map.setPaintProperty('h3-tod-fill', 'fill-color', getChoroplethPaintExpression(choroplethMode));
      }
    }
    if (map.getLayer('h3-tod-border')) {
      map.setLayoutProperty('h3-tod-border', 'visibility', visibility);
    }
  }, [map, isMapLoaded, choroplethMode, activePersona]);

  // 3. Update Filter Expression dynamically
  useEffect(() => {
    if (!map || !isMapLoaded || !map.getLayer('h3-tod-fill')) return;
    const filterExpr = getFilterExpression(h3ScoreRange, h3RingFilter);
    map.setFilter('h3-tod-fill', filterExpr);
    if (map.getLayer('h3-tod-border')) {
      map.setFilter('h3-tod-border', filterExpr);
    }
  }, [map, isMapLoaded, h3ScoreRange, h3RingFilter]);
}
