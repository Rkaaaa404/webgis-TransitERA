'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Footprints, 
  TrainFront, 
  Bus, 
  Car, 
  Navigation, 
  ArrowRight, 
  MapPin, 
  Ticket, 
  Compass,
  CheckCircle2
} from 'lucide-react';

import { TravelEstimateItem, StationId, IntermodalPlan, IntermodalStep } from '@/types';
import { fetchIntermodalRoutes } from '@/lib/api';

interface TravelEstimatorProps {
  estimates?: TravelEstimateItem[];
  stationId?: StationId;
  stationName?: string;
  onSelectRoute?: (routeId: string) => void;
}

export const TravelEstimator: React.FC<TravelEstimatorProps> = ({ 
  estimates = [],
  stationId = 'gubeng',
  stationName = 'Stasiun Gubeng',
  onSelectRoute
}) => {
  const [plans, setPlans] = useState<IntermodalPlan[]>([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch real curated intermodal transit plans when stationId changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchIntermodalRoutes(stationId)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.plans && res.plans.length > 0) {
          setPlans(res.plans);
          setSelectedPlanIndex(0);
        } else {
          setPlans([]);
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat rute intermoda:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [stationId]);

  const activePlan = plans[selectedPlanIndex];

  const renderStepIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'walk':
      case 'footprints':
      case 'pedestrian':
        return <Footprints className="w-3.5 h-3.5 text-cyan-400" />;
      case 'feeder':
      case 'wirawiri':
        return <Bus className="w-3.5 h-3.5 text-amber-400" />;
      case 'bus':
      case 'suroboyo_bus':
        return <Bus className="w-3.5 h-3.5 text-emerald-400" />;
      case 'train':
      case 'rail':
      case 'krl':
      case 'commuter':
        return <TrainFront className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Navigation className="w-3.5 h-3.5 text-brand-lime" />;
    }
  };

  return (
    <div className="space-y-3 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-brand-lime" />
          <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Intermodal Journey Planner
          </h4>
        </div>
        <span className="text-[10px] font-semibold text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded border border-brand-teal/20">
          WiraWiri &amp; KRL Riil
        </span>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center gap-1">
        <span>Asal:</span>
        <span className="font-bold text-slate-200 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-brand-lime" />
          {stationName.replace('Stasiun Surabaya ', 'St. ').replace('Stasiun ', 'St. ')}
        </span>
      </div>

      {/* Destination Quick Chips */}
      {plans.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {plans.map((plan, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedPlanIndex(idx);
                if (plan.route_id && onSelectRoute) {
                  onSelectRoute(plan.route_id);
                }
              }}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                selectedPlanIndex === idx
                  ? 'bg-brand-lime text-slate-950 font-bold shadow-md shadow-brand-lime/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {plan.destination.split(' ')[0]}
              {selectedPlanIndex === idx && <CheckCircle2 className="w-3 h-3 text-slate-950" />}
            </button>
          ))}
        </div>
      )}

      {/* Active Selected Journey Card */}
      {activePlan ? (
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-3">
          {/* Card Top: Destination, Duration, Fare */}
          <div className="flex justify-between items-start border-b border-slate-800/80 pb-2.5">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tujuan Akhir</span>
              <h5 className="font-bold text-slate-100 text-xs mt-0.5">{activePlan.destination}</h5>
              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Jarak: <strong>{activePlan.total_distance_km} km</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Ticket className="w-3 h-3" />
                  {activePlan.fare}
                </span>
              </div>
            </div>
            
            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 font-bold text-xs text-brand-lime bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                <Clock className="w-3 h-3" />
                {activePlan.total_time}
              </span>
            </div>
          </div>

          {/* Step-by-Step Multi-modal Transit Timeline */}
          <div className="space-y-2 relative before:absolute before:inset-y-1.5 before:left-[11px] before:w-0.5 before:bg-slate-800">
            {activePlan.steps.map((step, sIdx) => {
              const isWalk = step.mode === 'walk';
              const pillBg = step.line_color || (isWalk ? '#06b6d4' : '#10b981');

              return (
                <div key={sIdx} className="flex items-start gap-2.5 relative group">
                  {/* Step Node Icon */}
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 border shadow-sm"
                    style={{ 
                      backgroundColor: isWalk ? '#0f172a' : `${pillBg}25`, 
                      borderColor: pillBg 
                    }}
                  >
                    {renderStepIcon(step.mode)}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-[11px] text-slate-200 font-medium leading-snug">
                        {step.desc}
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-400 shrink-0">
                        {step.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {step.line_code && (
                        <span 
                          className="text-[9px] font-bold px-1.5 py-0.2 rounded text-white"
                          style={{ backgroundColor: pillBg }}
                        >
                          {step.line_code}
                        </span>
                      )}
                      {step.distance && (
                        <span className="text-[9px] text-slate-500">
                          {step.distance}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Route Selection button */}
          {activePlan.route_id && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[9.5px] text-slate-400">
                Trayek resmi terintegrasi di peta
              </span>
              <button
                onClick={() => onSelectRoute?.(activePlan.route_id!)}
                className="text-[10px] font-bold text-brand-lime hover:text-white bg-slate-900 hover:bg-slate-800 border border-brand-lime/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
              >
                <span>Lihat Jalur</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Fallback Static Estimates */
        <div className="space-y-2">
          {estimates.map((est, idx) => (
            <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300">
                  <Navigation className="w-3 h-3" />
                </div>
                <div>
                  <span className="font-bold text-slate-200 text-xs block">{est.destination}</span>
                  <span className="text-[9.5px] text-slate-500">Estimasi waktu tempuh</span>
                </div>
              </div>
              <span className="font-bold text-xs text-brand-lime bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {est.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
