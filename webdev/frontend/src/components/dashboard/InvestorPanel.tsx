'use client';

import React from 'react';
import { StationData, StationId } from '@/types';
import { DiamondGauge } from './DiamondGauge';
import dynamic from 'next/dynamic';
const TenantMixChart = dynamic(() => import('./TenantMixChart').then(mod => mod.TenantMixChart), { 
  ssr: false, 
  loading: () => <div className="w-full h-48 bg-slate-900/50 backdrop-blur-md rounded-xl animate-pulse" /> 
});
import { AIChatPanel } from '@/components/ai/AIChatPanel';
import { Building, TrendingUp, LineChart, Wallet, ArrowUpRight, Users } from 'lucide-react';
import { getDemographicsForStation } from '@/lib/dummy-data';

interface InvestorPanelProps {
  station: StationData;
  activeStation: StationId;
  activeH3Index?: string | null;
  onExecuteMapAction?: (data: any) => void;
}

export const InvestorPanel: React.FC<InvestorPanelProps> = ({
  station,
  activeStation,
  activeH3Index,
  onExecuteMapAction,
}) => {
  const demographics = getDemographicsForStation(activeStation);

  // Dummy projection data based on TOD score
  const baseGrowth = 4.5;
  const todMultiplier = (station.tod_readiness_score / 100) * 5; 
  const projectedROI = (baseGrowth + todMultiplier).toFixed(1);
  
  // Predict properti go dummy listings
  const dummyListings = [
    { id: 1, type: 'Ruko Komersial', price: 'Rp 2.4 M', roi: '12% p.a', dist: '150m' },
    { id: 2, type: 'Lahan Kosong', price: 'Rp 15 M', roi: '8% p.a', dist: '400m' },
    { id: 3, type: 'Apartemen Studio', price: 'Rp 450 Jt', roi: '9.5% p.a', dist: '50m' }
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950/80">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 flex-shrink-0 bg-slate-900/95 backdrop-blur-md z-10">
        <h3 className="text-xs font-bold text-slate-100">Investor Advisory</h3>
        <p className="text-[10px] text-slate-500">{station.name.replace('Stasiun Surabaya ', 'St. ').replace('Stasiun ', 'St. ')} Sector</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ROW 0: Area Summary (Karakteristik Pasar & Populasi 1km) */}
        {demographics && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-lime" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Area Summary</h4>
              </div>
              <span className="text-[9px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                {demographics.kecamatan} • Radius 1km
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/60 rounded-lg p-2.5 text-center border border-slate-800/80">
                <div className="text-base font-black text-brand-lime font-mono">{demographics.population.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Populasi</div>
              </div>
              <div className="bg-slate-950/60 rounded-lg p-2.5 text-center border border-slate-800/80">
                <div className="text-base font-black text-cyan-400 font-mono">{demographics.density.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Jiwa/km²</div>
              </div>
              <div className="bg-slate-950/60 rounded-lg p-2.5 text-center border border-slate-800/80">
                <div className="text-sm font-bold text-emerald-400 font-mono">{demographics.avgIncome}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Rata-rata Pendapatan</div>
              </div>
              <div className="bg-slate-950/60 rounded-lg p-2.5 text-center border border-slate-800/80">
                <div className="text-sm font-bold text-brand-teal font-mono">{demographics.employmentRate}%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Tingkat Pekerjaan</div>
              </div>
            </div>
          </div>
        )}

        {/* ROW 1: Retail Score & Tenant Mix */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-lime" />
                <h4 className="text-xs font-bold text-slate-200">Retail Success Score</h4>
              </div>
              <span className="text-[9px] tabular-nums text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
                RF Model
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center py-2">
              <DiamondGauge
                score={Math.round(station.tod_readiness_score * 1.04)} 
                label="Excellent"
                size="lg"
              />
              <p className="text-[10px] text-slate-400 text-center mt-3 leading-relaxed px-4">
                High foot traffic correlation with nearby transit hub and existing commercial clusters.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <TenantMixChart data={station.tenant_mix} />
          </div>
        </div>

        {/* ROW 2: Proyeksi Ekonomi & Properti (5 Tahun) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <LineChart className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Proyeksi Ekonomi & Properti (5 Thn)</h4>
          </div>
          
          {/* ROI Estimator */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-950/50 rounded-lg p-2.5 border border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                <Wallet className="w-3 h-3" /> 
                <span>Est. Capital Gain</span>
              </div>
              <div className="flex items-end gap-1.5">
                <span className="text-lg font-black text-brand-lime">+{projectedROI}%</span>
                <span className="text-[9px] text-slate-500 mb-1">/ tahun</span>
              </div>
            </div>
            <div className="bg-slate-950/50 rounded-lg p-2.5 border border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                <TrendingUp className="w-3 h-3" /> 
                <span>Nilai Lahan (NJOP)</span>
              </div>
              <div className="flex items-end gap-1.5">
                <span className="text-lg font-black text-cyan-400">↑ TIER 1</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Potensi kenaikan tinggi</div>
            </div>
          </div>

          {/* Properti Go Listings Integration */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-slate-300">Properti Go Listings</span>
              </div>
              <button className="text-[9px] text-brand-lime hover:underline flex items-center gap-0.5">
                Lihat Semua <ArrowUpRight className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="space-y-1.5">
              {dummyListings.map(listing => (
                <div key={listing.id} className="flex items-center justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 hover:border-brand-lime/30 cursor-pointer transition-colors group">
                  <div>
                    <div className="text-[11px] font-bold text-slate-200 group-hover:text-brand-lime transition-colors">{listing.type}</div>
                    <div className="text-[9px] text-slate-500">{listing.dist} dari Stasiun</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-bold text-emerald-400">{listing.price}</div>
                    <div className="text-[9px] text-brand-teal">ROI {listing.roi}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Advisor */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <div className="h-[450px]">
            <AIChatPanel
              activeStation={activeStation}
              activePersona="business"
              activeH3Index={activeH3Index}
              onExecuteMapAction={onExecuteMapAction}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
