'use client';

import React, { useState } from 'react';
import { StationData } from '@/types';
import { TrendingUp, AlertTriangle, CheckCircle, ArrowUpRight, BarChart2, Sparkles, ChevronRight } from 'lucide-react';
import { DimensionTriviaModal, DimensionKey } from './DimensionTriviaModal';

interface Scorecard5DProps {
  station: StationData;
}

export const Scorecard5D: React.FC<Scorecard5DProps> = ({ station }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<DimensionKey>('design');

  const getDimensionKey = (name: string): DimensionKey => {
    const lower = name.toLowerCase();
    if (lower.includes('dens')) return 'density';
    if (lower.includes('diver')) return 'diversity';
    if (lower.includes('desig')) return 'design';
    if (lower.includes('destin')) return 'destination';
    if (lower.includes('dist')) return 'distance';
    return 'design';
  };

  const handleOpenModal = (dimKey?: DimensionKey) => {
    if (dimKey) setSelectedDimension(dimKey);
    setIsModalOpen(true);
  };

  const dimensions: { label: string; key: DimensionKey; score: number; color: string }[] = [
    { label: 'Density', key: 'density', score: station.scores.density, color: 'bg-indigo-500' },
    { label: 'Diversity', key: 'diversity', score: station.scores.diversity, color: 'bg-cyan-500' },
    { label: 'Design', key: 'design', score: station.scores.design, color: 'bg-amber-500' },
    { label: 'Destination', key: 'destination', score: station.scores.destination_accessibility, color: 'bg-emerald-500' },
    { label: 'Distance', key: 'distance', score: station.scores.distance_to_transit, color: 'bg-blue-500' }
  ];

  return (
    <div className="space-y-3 text-slate-200">
      {/* Top Main Card: Score & Status */}
      <div className="bg-slate-900/70 rounded-xl p-3.5 border border-slate-800 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                {station.tod_readiness_score}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5" />
                {station.status.split(' ')[0]}
              </span>
            </div>
            <p className="text-xs font-semibold text-cyan-300 mt-1">{station.typology}</p>
          </div>

          {/* %ΔNJOP Premium Badge */}
          <div className="text-right bg-blue-950/60 border border-blue-800/40 px-2.5 py-1.5 rounded-lg">
            <div className="text-[10px] text-blue-300 font-medium flex items-center gap-1 justify-end">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Est. %ΔNJOP
            </div>
            <div className="text-sm font-bold text-emerald-400">
              +{station.njop_premium.avg_njop_premium_pct}%
            </div>
            <div className="text-[9px] text-slate-400">
              CI: {station.njop_premium.ci_lower_pct}% - {station.njop_premium.ci_upper_pct}%
            </div>
          </div>
        </div>

        {/* 5D Progress Bars - Interactive Click */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>Dimensi TOD (Cervero 5D)</span>
            <span className="text-[9px] text-brand-lime font-medium">Klik baris untuk trivia & aksi</span>
          </div>

          {dimensions.map((dim) => (
            <div 
              key={dim.label} 
              onClick={() => handleOpenModal(dim.key)}
              className="text-xs cursor-pointer p-1.5 -mx-1.5 rounded-lg hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 transition-all group"
              title={`Klik untuk melihat trivia & intervensi dimensi ${dim.label}`}
            >
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-slate-300 font-medium group-hover:text-brand-lime flex items-center gap-1 transition-colors">
                  {dim.label}
                  <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span className="font-bold text-slate-200 group-hover:text-white font-mono">{dim.score}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${dim.color} rounded-full transition-all duration-500`}
                  style={{ width: `${dim.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Hyperlink Banner Pop up Trivia & Panduan Aksi */}
        <button
          onClick={() => handleOpenModal()}
          className="w-full mt-3 py-1.5 px-2.5 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-lime/30 hover:border-brand-lime/60 rounded-lg text-[11px] font-semibold text-brand-lime flex items-center justify-between transition-all group shadow-sm"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-lime animate-pulse" />
            Buka Trivia & Panduan Intervensi 5D
          </span>
          <span className="text-[10px] text-slate-400 group-hover:text-brand-lime flex items-center gap-0.5">
            Pelajari 5 Dimensi <ChevronRight className="w-3 h-3" />
          </span>
        </button>
      </div>

      {/* Highlights: Weakest & Strongest Indicator (Clickable Cards) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleOpenModal(getDimensionKey(station.weakest_dimension))}
          className="bg-amber-950/30 border border-amber-800/40 hover:border-amber-500/70 hover:bg-amber-950/50 rounded-lg p-2.5 text-left transition-all group cursor-pointer w-full flex flex-col justify-between"
          title="Klik untuk membuka trivia dan rekomendasi aksi dimensi terlemah"
        >
          <div>
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Dimensi Terlemah
              </span>
              <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-amber-400" />
            </div>
            <div className="text-xs font-bold text-slate-200 mt-1 group-hover:text-amber-300 transition-colors">
              {station.weakest_dimension}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Fokus intervensi trotoar / first-mile</div>
          </div>
          <div className="text-[9px] text-amber-400/80 group-hover:text-amber-300 font-medium mt-2 flex items-center gap-0.5">
            <span>Buka Trivia & Solusi</span> &rarr;
          </div>
        </button>

        <button
          onClick={() => handleOpenModal(getDimensionKey(station.strongest_dimension))}
          className="bg-emerald-950/30 border border-emerald-800/40 hover:border-emerald-500/70 hover:bg-emerald-950/50 rounded-lg p-2.5 text-left transition-all group cursor-pointer w-full flex flex-col justify-between"
          title="Klik untuk membuka trivia dan keunggulan dimensi terkuat"
        >
          <div>
            <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                Dimensi Terkuat
              </span>
              <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-emerald-400" />
            </div>
            <div className="text-xs font-bold text-slate-200 mt-1 group-hover:text-emerald-300 transition-colors">
              {station.strongest_dimension}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Modal utama simpul transit</div>
          </div>
          <div className="text-[9px] text-emerald-400/80 group-hover:text-emerald-300 font-medium mt-2 flex items-center gap-0.5">
            <span>Buka Detail Keunggulan</span> &rarr;
          </div>
        </button>
      </div>

      {/* Policy Recommendations Snippet */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5">
        <div className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center justify-between mb-1">
          <span className="flex items-center gap-1">
            <BarChart2 className="w-3 h-3" />
            Rekomendasi Kebijakan
          </span>
          <button 
            onClick={() => handleOpenModal()} 
            className="text-[9px] text-brand-lime hover:underline flex items-center gap-0.5"
          >
            Lihat Semua Panduan &rarr;
          </button>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {station.policy_recommendations[0]}
        </p>
      </div>

      {/* Pop up Modal Trivia & Panduan Aksi 5D */}
      <DimensionTriviaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        station={station}
        initialDimension={selectedDimension}
      />
    </div>
  );
};
