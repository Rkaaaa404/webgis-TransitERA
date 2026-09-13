'use client';

import React, { useState, useEffect } from 'react';
import { StationId } from '@/types';
import { fetchTransitRoutes } from '@/lib/api';
import {
  Bus,
  MapPin,
  Clock,
  CircleDollarSign,
  ArrowRight,
  Eye,
  CheckCircle2,
  Train,
  CreditCard,
  QrCode,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface RouteFeatureProps {
  route_id: string;
  code: string;
  name: string;
  title: string;
  display_name: string;
  operator: string;
  category: string;
  is_feeder: boolean;
  color: string;
  hours: string;
  fare: string;
  connected_stations: Array<{
    station_id: string;
    station_name: string;
    distance_m: number;
  }>;
  connected_station_ids: string[];
}

interface WiraWiriRouteExplorerProps {
  activeStation: StationId;
  onSelectStation?: (stationId: StationId) => void;
  onHighlightRoute?: (routeIds: string[]) => void;
}

export const WiraWiriRouteExplorer: React.FC<WiraWiriRouteExplorerProps> = ({
  activeStation,
  onSelectStation,
  onHighlightRoute,
}) => {
  const [routes, setRoutes] = useState<RouteFeatureProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'station' | 'all'>('station');
  const [typeFilter, setTypeFilter] = useState<'all' | 'feeder' | 'bus'>('all');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchTransitRoutes()
      .then((fc) => {
        if (isMounted && fc?.features) {
          const parsed = fc.features.map((f: any) => {
            const p = f.properties || {};
            let conn = p.connected_stations || [];
            if (typeof conn === 'string') {
              try { conn = JSON.parse(conn); } catch { conn = []; }
            }
            let connIds = p.connected_station_ids || [];
            if (typeof connIds === 'string') {
              try { connIds = JSON.parse(connIds); } catch { connIds = []; }
            }
            return {
              ...p,
              connected_stations: conn,
              connected_station_ids: connIds,
            } as RouteFeatureProps;
          });
          setRoutes(parsed);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter routes: by active station or show all
  const stationRoutes = routes.filter((r) =>
    r.connected_station_ids?.includes(activeStation)
  );

  const displayedRoutes = (filterMode === 'station' ? stationRoutes : routes).filter((r) => {
    if (typeFilter === 'feeder') return r.is_feeder;
    if (typeFilter === 'bus') return !r.is_feeder;
    return true;
  });

  const handleHighlight = (routeId: string) => {
    if (selectedRouteId === routeId) {
      // Toggle off
      setSelectedRouteId(null);
      onHighlightRoute?.([]);
    } else {
      setSelectedRouteId(routeId);
      onHighlightRoute?.([routeId]);
    }
  };

  const handleReset = () => {
    setSelectedRouteId(null);
    onHighlightRoute?.([]);
  };

  return (
    <div className="bg-slate-900/70 border border-cyan-500/30 rounded-xl p-3.5 space-y-3 shadow-lg">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Bus className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Rute Feeder WiraWiri &amp; Bus</span>
              <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Resmi DISHUB
              </span>
            </h4>
            <p className="text-[9px] text-slate-400">Angkutan pengumpan terintegrasi stasiun komuter</p>
          </div>
        </div>
        {selectedRouteId && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset Peta</span>
          </button>
        )}
      </div>

      {/* ── Info Praktis untuk Orang Awam ── */}
      <div className="grid grid-cols-3 gap-1 text-[8.5px] bg-slate-950/60 p-2 rounded-lg border border-slate-800">
        <div className="flex items-center gap-1 text-slate-300">
          <CircleDollarSign className="w-3 h-3 text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[7.5px]">Tarif Integrasi</span>
            <strong className="text-emerald-400">Rp 5.000 / 2 Jam</strong>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-300 border-x border-slate-800/80 px-1">
          <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[7.5px]">Jam Operasi</span>
            <strong className="text-slate-200">05.30 - 21.00</strong>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-300 pl-0.5">
          <QrCode className="w-3 h-3 text-amber-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[7.5px]">Metode Bayar</span>
            <strong className="text-slate-200">QRIS / E-Money</strong>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center justify-between gap-1 pt-0.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterMode('station')}
            className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${
              filterMode === 'station'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Stasiun Ini ({stationRoutes.length})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua Koridor ({routes.length})
          </button>
        </div>

        <div className="flex items-center gap-0.5 bg-slate-950/70 p-0.5 rounded border border-slate-800">
          {(['all', 'feeder', 'bus'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase ${
                typeFilter === t
                  ? 'bg-slate-800 text-brand-lime font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'all' ? 'Semua' : t === 'feeder' ? 'WiraWiri' : 'Bus'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Routes List ── */}
      {loading ? (
        <div className="py-6 text-center text-slate-500 text-[10px] animate-pulse">
          Memuat trayek resmi Surabaya...
        </div>
      ) : displayedRoutes.length === 0 ? (
        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-center text-[10px] text-slate-400 space-y-1">
          <p>Belum ada rute Feeder WiraWiri langsung di pintu stasiun ini.</p>
          <button
            onClick={() => setFilterMode('all')}
            className="text-cyan-400 font-bold underline hover:text-cyan-300"
          >
            Lihat semua 16 koridor Kota Surabaya &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-0.5">
          {displayedRoutes.map((r) => {
            const isSelected = selectedRouteId === r.route_id;
            const badgeColor = r.color || '#10b981';

            return (
              <div
                key={r.route_id}
                className={`p-2.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-md ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Badge, Title, Action */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span
                      style={{ backgroundColor: badgeColor }}
                      className="px-1.5 py-0.5 rounded text-[9px] font-black text-white shrink-0 uppercase tracking-wider shadow-sm mt-0.5"
                    >
                      {r.is_feeder ? `FD ${r.code}` : r.code}
                    </span>
                    <div>
                      <div className="text-[11px] font-bold text-slate-100 leading-tight">
                        {r.display_name || r.title}
                      </div>
                      <div className="text-[8.5px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span className="text-cyan-400 font-semibold">{r.operator || 'DISHUB Surabaya'}</span>
                        <span>•</span>
                        <span>{r.hours || '05:30 - 21:00'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleHighlight(r.route_id)}
                    className={`px-2 py-1 rounded text-[9px] font-bold transition-all shrink-0 flex items-center gap-1 ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    <Eye className="w-2.5 h-2.5" />
                    <span>{isSelected ? 'Tersorot' : 'Lihat di Peta'}</span>
                  </button>
                </div>

                {/* Bottom Row: Connected Stations Tags */}
                {r.connected_stations && r.connected_stations.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex flex-wrap items-center gap-1">
                    <span className="text-[8px] text-slate-400 font-mono flex items-center gap-0.5 mr-0.5">
                      <Train className="w-2.5 h-2.5 text-slate-400" />
                      Koneksi:
                    </span>
                    {r.connected_stations.map((st) => {
                      const isCurrent = st.station_id === activeStation;
                      return (
                        <button
                          key={st.station_id}
                          onClick={() => onSelectStation?.(st.station_id as StationId)}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-medium transition-colors ${
                            isCurrent
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                          }`}
                          title={`Klik untuk pindah ke ${st.station_name}`}
                        >
                          {st.station_name.replace('Stasiun Surabaya ', '').replace('Stasiun ', '')} ({st.distance_m}m)
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
