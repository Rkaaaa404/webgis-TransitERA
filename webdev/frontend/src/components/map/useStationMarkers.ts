import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { StationId, StationData } from '@/types';
import { FALLBACK_STATIONS } from '@/lib/api';

export function useStationMarkers(
  map: maplibregl.Map | null,
  isMapLoaded: boolean,
  onSelectStation: (stationId: StationId) => void,
  activeStation?: StationId,
  activePersona?: string
) {
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!map || !isMapLoaded) return;

    // Clear existing markers if re-rendering
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const isCommuterMode = activePersona === 'commuter';

    FALLBACK_STATIONS.forEach((st: StationData) => {
      const isSelected = st.id === activeStation;
      const isTerminal = st.id.startsWith('terminal_');
      const isFocus = Boolean(st.is_tier_1);
      const kecamatan = st.kecamatan || 'Surabaya';
      const shortName = st.name.replace('Stasiun Surabaya ', 'St. ').replace('Stasiun ', 'St. ');

      // CRITICAL: outer `el` must have FIXED, INVARIANT size.
      // MapLibre sets `el.style.transform = translate(x,y)` directly.
      // ANY CSS property on `el` that changes its bounding box (size, scale, etc.)
      // during a hover will cause MapLibre to re-read the bounding box and
      // reposition the marker. Hover effects MUST be scoped to an inner child only.
      const el = document.createElement('div');
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.position = 'relative';
      el.style.cursor = 'pointer';
      el.style.userSelect = 'none';
      // DO NOT add any transform, scale, or transition to `el` itself.

      if (isCommuterMode) {
        if (isSelected) {
          el.innerHTML = `
            <div id="inner-pin" style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: linear-gradient(135deg, #06b6d4, #10b981);
              border: 3px solid #0f172a;
              box-shadow: 0 0 18px rgba(6, 182, 212, 0.75), 0 4px 10px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              transition: transform 0.18s ease, box-shadow 0.18s ease;
              will-change: transform;
            ">
              <svg style="width: 18px; height: 18px;" fill="none" stroke="#0f172a" stroke-width="2.5" viewBox="0 0 24 24">
                ${isTerminal
                  ? '<rect x="3" y="4" width="18" height="15" rx="2" /><path d="M4 11h16M8 15h.01M16 15h.01M6 19v2M18 19v2" />'
                  : '<rect x="4" y="3" width="16" height="16" rx="2" /><path d="M4 11h16M12 3v8M8 19l-3 3M16 19l3 3M8 15h.01M16 15h.01" />'}
              </svg>
            </div>
            <div style="
              position: absolute;
              top: calc(100% + 5px);
              left: 50%;
              transform: translateX(-50%);
              white-space: nowrap;
              background: rgba(15, 23, 42, 0.95);
              color: #f8fafc;
              font-family: system-ui, sans-serif;
              font-weight: 700;
              font-size: 10px;
              padding: 3px 8px;
              border-radius: 6px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.5);
              border: 1px solid rgba(6, 182, 212, 0.6);
              pointer-events: none;
              display: flex;
              align-items: center;
              gap: 4px;
              z-index: 20;
            ">
              <span>${shortName}</span>
              <span style="color: #67e8f9; font-size: 8.5px; font-weight: 600;">• Kec. ${kecamatan}</span>
            </div>
          `;
        } else {
          el.innerHTML = `
            <div id="inner-pin" style="
              width: 24px;
              height: 24px;
              margin: 6px;
              border-radius: 50%;
              background: #0f172a;
              border: 2px solid #475569;
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              transition: transform 0.18s ease, border-color 0.18s ease;
              will-change: transform;
            ">
              <svg style="width: 12px; height: 12px;" fill="none" stroke="#94a3b8" stroke-width="2.2" viewBox="0 0 24 24">
                ${isTerminal
                  ? '<rect x="3" y="4" width="18" height="15" rx="2" /><path d="M4 11h16M8 15h.01M16 15h.01" />'
                  : '<rect x="4" y="3" width="16" height="16" rx="2" /><path d="M4 11h16M8 15h.01M16 15h.01" />'}
              </svg>
            </div>
            <div style="
              position: absolute;
              top: calc(100% + 4px);
              left: 50%;
              transform: translateX(-50%);
              white-space: nowrap;
              background: rgba(15, 23, 42, 0.9);
              color: #e2e8f0;
              font-size: 9px;
              font-weight: 600;
              padding: 1px 6px;
              border-radius: 4px;
              border: 1px solid rgba(71, 85, 105, 0.6);
              pointer-events: none;
              opacity: 0.85;
              z-index: 10;
            ">
              <span>${shortName}</span>
            </div>
          `;
        }
      } else {
        // Desain Standar untuk Persona Pemerintah / Bisnis
        const iconSize = isFocus ? 16 : 13;
        const bgGrad = isFocus
          ? 'linear-gradient(to top right, #4FC5C2, #B1FC91)'
          : 'linear-gradient(to top right, #1e293b, #334155)';
        const borderCol = isFocus ? '#12175E' : '#64748b';
        const pinSize = isFocus ? 32 : 26;
        const margin = (36 - pinSize) / 2;
        const focusTag = isFocus
          ? '<span style="color: #B1FC91; font-size: 8px; font-weight: 600; margin-left: 3px;">• Focus Area</span>'
          : '';

        el.innerHTML = `
          <div id="inner-pin" style="
            width: ${pinSize}px;
            height: ${pinSize}px;
            margin: ${margin}px;
            border-radius: 50%;
            background: ${bgGrad};
            border: 2px solid ${borderCol};
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.18s ease;
            will-change: transform;
          ">
            <svg style="width: ${iconSize}px; height: ${iconSize}px;" fill="none" stroke="${isFocus ? '#0f172a' : '#f8fafc'}" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </div>
          <div style="
            position: absolute;
            top: calc(100% + 4px);
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
            background: rgba(15, 23, 42, 0.92);
            color: white;
            font-weight: 600;
            font-size: 9.5px;
            padding: 2px 7px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.4);
            border: 1px solid rgba(51, 65, 85, 0.7);
            pointer-events: none;
            display: flex;
            align-items: center;
            z-index: 10;
          ">
            <span>${shortName}</span>
            ${focusTag}
          </div>
        `;
      }

      // Hover scale applied via JS events on INNER div only — never on outer `el`
      const innerPin = el.querySelector<HTMLElement>('#inner-pin');
      if (innerPin) {
        el.addEventListener('mouseenter', () => {
          innerPin.style.transform = 'scale(1.2)';
          if (isCommuterMode && !isSelected) {
            innerPin.style.borderColor = '#06b6d4';
          }
        });
        el.addEventListener('mouseleave', () => {
          innerPin.style.transform = 'scale(1)';
          if (isCommuterMode && !isSelected) {
            innerPin.style.borderColor = '#475569';
          }
        });
      }

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectStation(st.id as StationId);
        map.flyTo({
          center: [st.longitude, st.latitude],
          zoom: isCommuterMode ? 14.5 : 14.0,
          duration: 700,
          essential: true,
        });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([st.longitude, st.latitude])
        .addTo(map);
        
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [map, isMapLoaded, onSelectStation, activeStation, activePersona]);
}
