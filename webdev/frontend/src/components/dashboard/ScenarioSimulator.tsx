'use client';

import React, { useState, useEffect } from 'react';
import { StationData, StationId } from '@/types';
import { simulateScenario } from '@/lib/api';
import { 
  Sliders, 
  ArrowRight, 
  Check, 
  Loader2, 
  Sparkles, 
  TrendingUp, 
  Zap,
  RotateCcw
} from 'lucide-react';

interface ScenarioSimulatorProps {
  station: StationData;
}

type InterventionKey = 'feeder_extension' | 'pedestrian_upgrade' | 'mixed_use_rezoning';

interface InterventionConfig {
  key: InterventionKey;
  label: string;
  focus: string;
  primaryDimensionKey: string;
}

const INTERVENTIONS: InterventionConfig[] = [
  { 
    key: 'feeder_extension', 
    label: 'Ekspansi Feeder WiraWiri / Suroboyo Bus',
    focus: 'Distance (+12.0) & Destination (+6.5)',
    primaryDimensionKey: 'distance'
  },
  { 
    key: 'pedestrian_upgrade', 
    label: 'Jalur Pedestrian Berkanopi & Tactile Paving',
    focus: 'Design (+18.0) & Walkability',
    primaryDimensionKey: 'design'
  },
  { 
    key: 'mixed_use_rezoning', 
    label: 'Insentif FAR / Rezoning Hunian Campuran',
    focus: 'Diversity (+15.0) & Density (+8.0)',
    primaryDimensionKey: 'diversity'
  }
];

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ station }) => {
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionKey>('feeder_extension');
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isSubscribed = true;

    const runSimulation = async () => {
      setIsLoading(true);
      try {
        const result = await simulateScenario(
          station.id as StationId,
          selectedIntervention,
          `sim_${station.id}_${selectedIntervention}`
        );
        if (isSubscribed) {
          setSimulationData(result);
        }
      } catch (err) {
        console.error('Simulation error:', err);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    };

    runSimulation();

    return () => {
      isSubscribed = false;
    };
  }, [station.id, selectedIntervention]);

  const simulatedTOD = simulationData?.simulated_tod_score ?? +(station.tod_readiness_score + 7.5).toFixed(1);
  const deltaScore = simulationData?.delta_tod_score ?? 7.5;
  const simulatedNJOP = simulationData?.simulated_njop_premium_pct ?? +(station.njop_premium.avg_njop_premium_pct + 3.2).toFixed(1);
  const deltaNJOP = simulationData?.delta_njop_premium_pct ?? 3.2;

  // Dimension deltas from simulation API or model
  const dimImpacts = simulationData?.dimension_impacts ?? {
    feeder_extension: { distance_to_transit: 12.0, destination_accessibility: 6.5, design: 8.5, diversity: 4.0, density: 2.0 },
    pedestrian_upgrade: { design: 18.0, destination_accessibility: 5.0, distance_to_transit: 3.0, diversity: 2.5, density: 1.5 },
    mixed_use_rezoning: { diversity: 15.0, density: 8.0, destination_accessibility: 7.0, design: 4.0, distance_to_transit: 2.0 }
  }[selectedIntervention];

  const dimensionList = [
    { 
      key: 'density', 
      label: 'Density', 
      baseline: station.scores.density,
      delta: dimImpacts?.density ?? 2.0,
      color: 'bg-indigo-500'
    },
    { 
      key: 'diversity', 
      label: 'Diversity', 
      baseline: station.scores.diversity,
      delta: dimImpacts?.diversity ?? 4.0,
      color: 'bg-cyan-500'
    },
    { 
      key: 'design', 
      label: 'Design', 
      baseline: station.scores.design,
      delta: dimImpacts?.design ?? 8.5,
      color: 'bg-amber-500'
    },
    { 
      key: 'destination', 
      label: 'Destination', 
      baseline: station.scores.destination_accessibility,
      delta: dimImpacts?.destination_accessibility ?? 6.5,
      color: 'bg-emerald-500'
    },
    { 
      key: 'distance', 
      label: 'Distance', 
      baseline: station.scores.distance_to_transit,
      delta: dimImpacts?.distance_to_transit ?? 12.0,
      color: 'bg-blue-500'
    }
  ];

  // Find maximum delta to highlight the most impacted dimension
  const maxDelta = Math.max(...dimensionList.map(d => d.delta));

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 text-slate-200 space-y-3.5">
      {/* ── Header & Simulation Toggle ── */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-brand-lime" />
          Simulasi Skenario Intervensi (What-If)
        </h4>
        <button
          onClick={() => setIsSimulated(!isSimulated)}
          className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
            isSimulated
              ? 'bg-brand-lime text-slate-950 font-black shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {isSimulated ? (
            <>
              <Zap className="w-2.5 h-2.5 text-slate-950 fill-current" />
              Simulasi Aktif
            </>
          ) : (
            <>
              <RotateCcw className="w-2.5 h-2.5" />
              Baseline Eksisting
            </>
          )}
        </button>
      </div>

      {/* ── Skenario Pilihan Intervensi ── */}
      <div className="space-y-1.5">
        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pilih Skenario Intervensi</div>
        {INTERVENTIONS.map(({ key, label, focus }) => (
          <button
            key={key}
            onClick={() => {
              setSelectedIntervention(key);
              setIsSimulated(true);
            }}
            className={`w-full text-left p-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between border ${
              selectedIntervention === key
                ? 'bg-brand-lime/15 border-brand-lime/50 text-brand-lime font-bold shadow-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                {isLoading && selectedIntervention === key && <Loader2 className="w-3 h-3 animate-spin text-brand-lime" />}
                <span>{label}</span>
              </div>
              <div className="text-[9px] text-slate-400 font-normal mt-0.5 flex items-center gap-1">
                <span className="text-slate-500">Dampak:</span>
                <span className={selectedIntervention === key ? 'text-brand-lime font-mono' : 'text-slate-400 font-mono'}>{focus}</span>
              </div>
            </div>
            {selectedIntervention === key && <Check className="w-3.5 h-3.5 text-brand-lime shrink-0" />}
          </button>
        ))}
      </div>

      {/* ── Perbandingan Skor Makro ── */}
      <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
        <div>
          <span className="text-[10px] text-slate-400">TOD Readiness Score</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className={`text-sm ${isSimulated ? 'text-slate-500 line-through' : 'text-slate-200 font-bold'}`}>
              {station.tod_readiness_score}
            </span>
            {isSimulated && (
              <>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-base font-black text-brand-lime">
                  {simulatedTOD}
                </span>
                <span className="text-[10px] text-brand-lime font-bold">+{deltaScore}</span>
              </>
            )}
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400">Estimasi %ΔNJOP</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className={`text-sm ${isSimulated ? 'text-slate-500 line-through' : 'text-slate-200 font-bold'}`}>
              +{station.njop_premium.avg_njop_premium_pct}%
            </span>
            {isSimulated && (
              <>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-base font-black text-emerald-400">
                  +{simulatedNJOP}%
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">+{deltaNJOP}%</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Proyeksi Nilai 5 Dimensi TOD Berdasarkan Skenario ── */}
      <div className="bg-slate-950/40 border border-slate-800/70 rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-brand-lime" />
            <span>Proyeksi Nilai 5 Dimensi TOD</span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono">
            {isSimulated ? 'Simulasi vs Baseline' : 'Nilai Eksisting'}
          </span>
        </div>

        <div className="space-y-2 pt-0.5">
          {dimensionList.map((dim) => {
            const simulatedVal = Math.min(100, +(dim.baseline + (isSimulated ? dim.delta : 0)).toFixed(1));
            const isPrimary = isSimulated && dim.delta === maxDelta;

            return (
              <div key={dim.key} className="space-y-1 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-300 font-medium">{dim.label}</span>
                    {isPrimary && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-lime/20 text-brand-lime border border-brand-lime/30 font-bold uppercase tracking-wider animate-pulse">
                        Dampak Terbesar
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className={`text-xs ${isSimulated ? 'text-slate-500 line-through' : 'text-slate-300 font-bold'}`}>
                      {dim.baseline}
                    </span>
                    {isSimulated && (
                      <>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                        <span className="text-xs font-black text-brand-lime">{simulatedVal}</span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">
                          +{dim.delta}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar Dual Layer (Baseline + Delta Increment) */}
                <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden flex relative shadow-inner">
                  {/* Baseline width */}
                  <div 
                    className={`h-full ${dim.color} transition-all duration-500`}
                    style={{ width: `${Math.min(100, dim.baseline)}%` }}
                  />
                  {/* Delta Increment */}
                  {isSimulated && dim.delta > 0 && (
                    <div 
                      className="h-full bg-brand-lime animate-pulse transition-all duration-500 border-l border-white/50"
                      style={{ width: `${Math.min(100 - dim.baseline, dim.delta)}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Narasi Ringkasan Dampak Skenario ── */}
      {isSimulated && (
        <div className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800 text-[10px] text-slate-300 leading-relaxed">
          <div className="flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-lime shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-brand-lime">Ringkasan Skenario: </span>
              <span>
                {simulationData?.summary_narrative ?? (
                  selectedIntervention === 'pedestrian_upgrade'
                    ? `Intervensi Jalur Pedestrian secara spesifik mengatrol dimensi Design (+18.0 poin) yang menjadi titik kritis stasiun ${station.name}, meningkatkan skor TOD ke ${simulatedTOD}.`
                    : selectedIntervention === 'feeder_extension'
                    ? `Ekspansi feeder memperluas jangkauan first-mile Stasiun ${station.name} dengan lonjakan terbesar pada dimensi Distance (+12.0 poin) dan Destination (+6.5 poin).`
                    : `Insentif FAR dan rezoning hunian campuran mendorong diversifikasi fungsi lahan (+15.0 poin) serta densitas penduduk (+8.0 poin) di sekitar Stasiun ${station.name}.`
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
