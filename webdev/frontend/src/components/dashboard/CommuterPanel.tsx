'use client';

import React from 'react';
import { StationData, StationId } from '@/types';
import { DiamondGauge } from './DiamondGauge';
import { MenuGoDiscovery } from './MenuGoDiscovery';
import { TravelEstimator } from './TravelEstimator';
import { AIChatPanel } from '@/components/ai/AIChatPanel';
import { Footprints, Train, MessageCircle, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface CommuterPanelProps {
  station: StationData;
  activeStation: StationId;
  activeH3Index?: string | null;
  onExecuteMapAction?: (data: any) => void;
}

export const CommuterPanel: React.FC<CommuterPanelProps> = ({
  station,
  activeStation,
  activeH3Index,
  onExecuteMapAction,
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950/80">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 flex-shrink-0 bg-slate-900/95 backdrop-blur-md z-10">
        <h3 className="text-xs font-bold text-slate-100">Analytical Insights</h3>
        <p className="text-[10px] text-slate-500">Commuter Companion</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Walkability Index */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Footprints className="w-4 h-4 text-brand-lime" />
            <h4 className="text-xs font-bold text-slate-200">Walkability Index</h4>
          </div>
          
          <div className="flex items-center gap-4">
            <DiamondGauge
              score={Math.round(station.scores.design * 0.9)} 
              label="Excellent"
              size="md"
            />
            <p className="text-[10px] text-slate-400 leading-relaxed flex-1">
              High density of POIs within 1km. Safe and shaded pedestrian pathways available.
            </p>
          </div>
        </div>

        {/* Menu Go Discovery */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <MenuGoDiscovery recommendations={station.menu_go_recommendations} />
        </div>

        {/* Public Sentiment */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-brand-teal" />
            <h4 className="text-xs font-bold text-slate-200">Public Sentiment & Feedback</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] text-slate-300">
              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-emerald-400" /> Positif (68%)</span>
              <span className="flex items-center gap-1"><Minus className="w-3 h-3 text-slate-400" /> Netral (20%)</span>
              <span className="flex items-center gap-1"><ThumbsDown className="w-3 h-3 text-red-400" /> Negatif (12%)</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 flex rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full" style={{ width: '68%' }} />
              <div className="bg-slate-600 h-full" style={{ width: '20%' }} />
              <div className="bg-red-400 h-full" style={{ width: '12%' }} />
            </div>
            
            {/* Top Keywords */}
            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <div className="text-[9px] text-slate-500 font-bold mb-2">TOPICS OF INTEREST (X/TWITTER & SURVEY)</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 bg-brand-teal/10 text-brand-teal border border-brand-teal/20 rounded-full text-[9px]">#KebersihanStasiun</span>
                <span className="px-2 py-0.5 bg-brand-teal/10 text-brand-teal border border-brand-teal/20 rounded-full text-[9px]">Akses WiraWiri Mudah</span>
                <span className="px-2 py-0.5 bg-red-400/10 text-red-400 border border-red-400/20 rounded-full text-[9px]">Antrean Tap In Panjang</span>
                <span className="px-2 py-0.5 bg-brand-lime/10 text-brand-lime border border-brand-lime/20 rounded-full text-[9px]">Spot Foto Estetik</span>
              </div>
            </div>
          </div>
        </div>

        {/* Travel Estimator / Intermodal Journey Planner */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <TravelEstimator 
            estimates={station.travel_estimates}
            stationId={activeStation}
            stationName={station.name}
            onSelectRoute={(routeId) => {
              onExecuteMapAction?.({ action: 'highlight_route', route_id: routeId });
            }}
          />
        </div>

        {/* AI Advisor */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <div className="h-[450px]">
            <AIChatPanel
              activeStation={activeStation}
              activePersona="commuter"
              activeH3Index={activeH3Index}
              onExecuteMapAction={onExecuteMapAction}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

