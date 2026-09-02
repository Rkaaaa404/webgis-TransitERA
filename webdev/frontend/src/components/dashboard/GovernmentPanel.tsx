'use client';

import React, { useState } from 'react';
import { StationData, StationId } from '@/types';
import { DiamondGauge } from './DiamondGauge';
import { Scorecard5D } from './Scorecard5D';
import { ScenarioSimulator } from './ScenarioSimulator';
import dynamic from 'next/dynamic';

const RadarChart5D = dynamic(() => import('./RadarChart5D').then(mod => mod.RadarChart5D), { 
  ssr: false, 
  loading: () => <div className="w-full h-64 bg-slate-900/50 backdrop-blur-md rounded-xl animate-pulse" /> 
});

import { AIChatPanel } from '@/components/ai/AIChatPanel';
import { Footprints, Shield, BarChart3, Sliders, Bot, LayoutGrid, CheckCircle2 } from 'lucide-react';

interface GovernmentPanelProps {
  station: StationData;
  activeStation: StationId;
  activeH3Index?: string | null;
  onExecuteMapAction?: (data: any) => void;
}

type GovPanelTab = 'scorecard' | 'simulation' | 'ai' | 'all';

export const GovernmentPanel: React.FC<GovernmentPanelProps> = ({
  station,
  activeStation,
  activeH3Index,
  onExecuteMapAction,
}) => {
  const [activeTab, setActiveTab] = useState<GovPanelTab>('scorecard');

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950/80">
      {/* ── Panel Header ── */}
      <div className="px-4 py-3 border-b border-slate-800/80 flex-shrink-0 bg-slate-900/95 backdrop-blur-md z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Spatial Decision Support</h3>
            </div>
            <p className="text-[11px] text-brand-lime font-semibold mt-0.5">
              {station.name.replace('Stasiun Surabaya ', 'St. ').replace('Stasiun ', 'St. ')}
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-lime/15 text-brand-lime border border-brand-lime/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {station.status.split(' ')[0]}
          </span>
        </div>

        {/* ── Sub Tabs Navigation ── */}
        <div className="grid grid-cols-4 gap-1 mt-3 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('scorecard')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded text-[10px] font-bold transition-all ${
              activeTab === 'scorecard'
                ? 'bg-brand-lime text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="5D TOD Scorecard & Radar"
          >
            <BarChart3 className="w-3 h-3" />
            <span>5D TOD</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded text-[10px] font-bold transition-all ${
              activeTab === 'simulation'
                ? 'bg-brand-lime text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Simulasi Skenario Kebijakan What-If"
          >
            <Sliders className="w-3 h-3" />
            <span>Simulasi</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded text-[10px] font-bold transition-all ${
              activeTab === 'ai'
                ? 'bg-brand-lime text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Asisten AI Tata Ruang"
          >
            <Bot className="w-3 h-3" />
            <span>AI Advisor</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded text-[10px] font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-brand-lime text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Semua Modul Terbuka"
          >
            <LayoutGrid className="w-3 h-3" />
            <span>Semua</span>
          </button>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* ══ TAB 1: 5D SCORECARD & RADAR ══ */}
        {(activeTab === 'scorecard' || activeTab === 'all') && (
          <div className="space-y-4">
            {/* Comprehensive 5D Scorecard */}
            <Scorecard5D station={station} />

            {/* 5D TOD Radar Chart */}
            <RadarChart5D station={station} />

            {/* Walkability Index */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Footprints className="w-4 h-4 text-brand-lime" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Walkability & First-Mile Index</h4>
              </div>
              <div className="flex items-center gap-4">
                <DiamondGauge
                  score={Math.round(station.scores.design * 0.72)}
                  label="walkability"
                  sublabel={
                    station.scores.design >= 70
                      ? 'Konektivitas pedestrian sangat baik dengan jalur teduh dalam radius 1km.'
                      : 'Zona prioritas intervensi trotoar pejalan kaki sepanjang koridor akses feeder.'
                  }
                  size="sm"
                />
                <div className="flex-1 space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Trotoar Terkoneksi</span>
                      <span className="font-bold text-slate-200">{Math.round(station.scores.design * 0.8)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-lime rounded-full" style={{ width: `${station.scores.design * 0.8}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Tactile Paving Disabilitas</span>
                      <span className="font-bold text-slate-200">{Math.round(station.scores.design * 0.55)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${station.scores.design * 0.55}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 2: POLICY SIMULATION (WHAT-IF) ══ */}
        {(activeTab === 'simulation' || activeTab === 'all') && (
          <div className="space-y-4">
            {/* Interactive Scenario Simulator */}
            <ScenarioSimulator station={station} />

            {/* Policy Recommendations */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Rekomendasi Kebijakan Tata Ruang</h4>
              </div>
              <ul className="space-y-2">
                {station.policy_recommendations.map((rec, i) => (
                  <li key={i} className="text-[11px] text-slate-300 leading-relaxed flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="w-5 h-5 rounded-full bg-brand-lime/20 text-brand-lime font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                      {i + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ══ TAB 3: SPATIAL AI ADVISOR ══ */}
        {(activeTab === 'ai' || activeTab === 'all') && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-brand-lime" />
                <span className="text-[11px] font-bold text-slate-200">Asisten Spatial AI Tata Ruang</span>
              </div>
              <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">RAG + Function Calling</span>
            </div>
            <div className="h-[450px]">
              <AIChatPanel
                activeStation={activeStation}
                activePersona="government"
                activeH3Index={activeH3Index}
                onExecuteMapAction={onExecuteMapAction}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
