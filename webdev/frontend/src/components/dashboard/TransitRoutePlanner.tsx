'use client';

import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  ArrowRight, 
  ArrowUpDown, 
  TrainFront, 
  Bus, 
  Footprints, 
  Clock, 
  MapPin, 
  Eye, 
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StationId, RoutePlan, RouteStep } from '@/types';
import { STATION_NAMES, getStationInfo } from '@/lib/dummy-data';
import { findRoute } from '@/lib/transit-router';
import { fetchTransitRoutes } from '@/lib/api';

interface TransitRoutePlannerProps {
  activeStation: StationId;
  onHighlightRoute?: (routeIds: string[]) => void;
  onSelectRoutePlan?: (plan: RoutePlan | null) => void;
  onSelectStation?: (stationId: StationId) => void;
}

const AVAILABLE_STATIONS: { id: StationId; name: string }[] = Object.entries(STATION_NAMES).map(
  ([id, meta]) => ({
    id: id as StationId,
    name: meta.fullName
  })
);

export const TransitRoutePlanner: React.FC<TransitRoutePlannerProps> = ({
  activeStation,
  onHighlightRoute,
  onSelectRoutePlan,
  onSelectStation
}) => {
  const [fromStation, setFromStation] = useState<StationId>(activeStation || 'gubeng');
  const [toStation, setToStation] = useState<StationId>('benowo');
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [isHighlighted, setIsHighlighted] = useState<boolean>(true); // Default true agar rute langsung tampil
  const [trayekData, setTrayekData] = useState<any>(null);

  // Sync fromStation when activeStation changes from external map click
  useEffect(() => {
    if (activeStation && activeStation !== fromStation) {
      setFromStation(activeStation);
      if (activeStation === toStation) {
        setToStation(activeStation === 'benowo' ? 'gubeng' : 'benowo');
      }
    }
  }, [activeStation]);

  // Load real trayek data in background for accurate routing
  useEffect(() => {
    let isMounted = true;
    fetchTransitRoutes()
      .then((data) => {
        if (isMounted && data) {
          setTrayekData(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute initial route plan on mount & emit to map
  useEffect(() => {
    handleSearchRoute();
  }, [fromStation, toStation, trayekData]);

  const handleSearchRoute = () => {
    const result = findRoute(fromStation, toStation, trayekData);
    setPlan(result);
    if (isHighlighted && result) {
      onSelectRoutePlan?.(result);
      onHighlightRoute?.(result.route_ids);
    }
  };

  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const handleToggleHighlight = () => {
    if (!plan) return;
    if (isHighlighted) {
      onHighlightRoute?.([]);
      onSelectRoutePlan?.(null);
      setIsHighlighted(false);
    } else {
      onHighlightRoute?.(plan.route_ids);
      onSelectRoutePlan?.(plan);
      setIsHighlighted(true);
    }
  };

  const getStepIcon = (mode: RouteStep['mode']) => {
    switch (mode) {
      case 'train':
        return <TrainFront className="w-3.5 h-3.5 text-rose-400" />;
      case 'feeder':
        return <Bus className="w-3.5 h-3.5 text-cyan-400" />;
      case 'bus':
        return <Bus className="w-3.5 h-3.5 text-emerald-400" />;
      case 'walk':
      default:
        return <Footprints className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* ── ROUTE INPUT BOX ── */}
      <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-200 text-[11px] font-bold">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>Perencana Rute Multimoda</span>
          </div>
          <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded">
            KRL + Bus + Feeder
          </span>
        </div>

        {/* Input Selectors */}
        <div className="grid grid-cols-1 gap-2 relative">
          {/* Origin */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Asal Keberangkatan
              </label>
              <select
                value={fromStation}
                onChange={(e) => setFromStation(e.target.value as StationId)}
                className="w-full bg-transparent text-[11px] font-semibold text-slate-100 focus:outline-none cursor-pointer truncate"
              >
                {AVAILABLE_STATIONS.map((st) => (
                  <option key={`from-${st.id}`} value={st.id} className="bg-slate-900 text-slate-100">
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="absolute right-3 top-[34px] z-10">
            <button
              onClick={handleSwapStations}
              title="Tukar Asal & Tujuan"
              className="p-1 rounded-full bg-slate-800 border border-slate-700 hover:border-cyan-500/60 hover:bg-slate-700 text-slate-300 transition-colors shadow-sm"
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>

          {/* Destination */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Tujuan Transit
              </label>
              <select
                value={toStation}
                onChange={(e) => setToStation(e.target.value as StationId)}
                className="w-full bg-transparent text-[11px] font-semibold text-slate-100 focus:outline-none cursor-pointer truncate"
              >
                {AVAILABLE_STATIONS.map((st) => (
                  <option key={`to-${st.id}`} value={st.id} className="bg-slate-900 text-slate-100">
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSearchRoute}
          className="w-full py-1.5 px-3 rounded-lg bg-brand-lime hover:bg-brand-lime/90 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Cari Rute Transit</span>
        </button>
      </div>

      {/* ── ROUTE RESULT DISPLAY ── */}
      {plan && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2.5">
          {/* Header Summary */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div>
              <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                <span>{getStationInfo(plan.from).shortName}</span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
                <span>{getStationInfo(plan.to).shortName}</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                {plan.has_transfer ? '1x Transfer Antarmoda' : 'Rute Langsung Tanpa Transfer'}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-[12px] font-extrabold text-cyan-300">
                <Clock className="w-3.5 h-3.5" />
                <span>~{plan.total_min} mnt</span>
              </div>
              <span className="text-[8.5px] text-slate-400 block mt-0.5">
                {plan.steps.length} segmen perjalanan
              </span>
            </div>
          </div>

          {/* Step Timeline */}
          <div className="space-y-2 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-slate-800">
            {plan.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 relative">
                {/* Node icon */}
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border z-10"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: step.line_color || '#38BDF8'
                  }}
                >
                  {getStepIcon(step.mode)}
                </div>

                {/* Step Details */}
                <div className="flex-1 min-w-0 bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {step.line_code && (
                        <span 
                          className="px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-950 uppercase shrink-0"
                          style={{ backgroundColor: step.line_color || '#38BDF8' }}
                        >
                          {step.line_code}
                        </span>
                      )}
                      <span className="text-[10.5px] font-bold text-slate-200 truncate">
                        {step.route_name || 'Trayek Transit'}
                      </span>
                    </div>

                    <span className="text-[9px] font-mono text-cyan-400 shrink-0">
                      ~{step.duration_min} mnt
                    </span>
                  </div>

                  <p className="text-[9.5px] text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Map Highlight Buttons */}
          <div className="pt-1.5 flex items-center gap-2">
            <button
              onClick={handleToggleHighlight}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                isHighlighted
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>{isHighlighted ? 'Sembunyikan Jalur Peta' : 'Sorot Rute di Peta'}</span>
            </button>

            {isHighlighted && (
              <button
                onClick={() => {
                  onHighlightRoute?.([]);
                  setIsHighlighted(false);
                }}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                title="Reset Tampilan Peta"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Disclaimer Jadwal & Operasional */}
          <div className="flex items-center gap-1.5 text-[8.5px] text-slate-400 bg-slate-950/50 p-1.5 rounded border border-slate-800/80">
            <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Estimasi waktu tempuh berbasis rute & headway resmi. Pelacakan GPS armada real-time dalam integrasi.</span>
          </div>
        </div>
      )}
    </div>
  );
};
