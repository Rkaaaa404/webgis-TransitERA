import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { StationId, StationData } from '@/types';
import { FALLBACK_STATIONS } from '@/lib/api';

export function useStationMarkers(
  map: maplibregl.Map | null,
  isMapLoaded: boolean,
  onSelectStation: (stationId: StationId) => void
) {
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!map || !isMapLoaded) return;

    // Clear existing markers if re-rendering
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    console.log('Adding station markers to map...');
    FALLBACK_STATIONS.forEach((st: StationData) => {
      const isFocus = Boolean(st.is_tier_1);
      const el = document.createElement('div');
      el.className = 'station-marker-pin cursor-pointer group z-10 transition-transform hover:scale-110';
      
      const pinSize = isFocus ? 32 : 26;
      const iconSize = isFocus ? 16 : 13;
      const bgGrad = isFocus 
        ? 'linear-gradient(to top right, #4FC5C2, #B1FC91)' 
        : 'linear-gradient(to top right, #1e293b, #334155)';
      const borderCol = isFocus ? '#12175E' : '#64748b';
      const focusTag = isFocus 
        ? '<span style="color: #B1FC91; font-size: 8px; font-weight: 600; margin-left: 3px;">• Focus Area</span>' 
        : '';

      el.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="width: ${pinSize}px; height: ${pinSize}px; border-radius: 50%; background: ${bgGrad}; border: 2px solid ${borderCol}; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">
            <svg style="width: ${iconSize}px; height: ${iconSize}px;" fill="none" stroke="${isFocus ? '#0f172a' : '#f8fafc'}" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </div>
          <div style="position: absolute; bottom: -22px; white-space: nowrap; background: rgba(15, 23, 42, 0.92); color: white; font-weight: 600; font-size: 9.5px; padding: 2px 7px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.4); border: 1px solid rgba(51, 65, 85, 0.7); pointer-events: none; display: flex; align-items: center;">
            <span>${st.name.replace('Stasiun Surabaya ', 'St. ').replace('Stasiun ', 'St. ')}</span>
            ${focusTag}
          </div>
        </div>
      `;

      el.addEventListener('click', () => {
        onSelectStation(st.id as StationId);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([st.longitude, st.latitude])
        .addTo(map);
        
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [map, isMapLoaded, onSelectStation]);
}
