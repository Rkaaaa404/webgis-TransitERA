'use client';

import React, { useState } from 'react';
import { StationData } from '@/types';
import { Store, Coffee, ShoppingBag, DollarSign, MapPin, CheckCircle2 } from 'lucide-react';

interface BusinessSiteProfileProps {
  station: StationData;
  onHighlightCell?: (h3Index: string) => void;
}

export const BusinessSiteProfile: React.FC<BusinessSiteProfileProps> = ({ station, onHighlightCell }) => {
  const [selectedBiz, setSelectedBiz] = useState<'coffee' | 'warung' | 'retail'>('coffee');

  const stationH3 = {
    gubeng: '898d80835d3ffff',
    pasar_turi: '898d808311bffff',
    semut: '898d808302bffff',
    wonokromo: '898d80824cbffff',
    waru: '898d8090d7bffff',
  }[station.id] || '898d80835d3ffff';

  const bizProfiles = {
    coffee: {
      label: 'Kedai Kopi / Cafe Komuter',
      icon: Coffee,
      spendingProxy: 'Rp 28.000 - Rp 45.000',
      recommendedH3: stationH3,
      catchmentRadius: '0 - 250 meter',
      matchScore: 94,
      rationale: 'Tingginya komuter pejalan kaki pagi/sore hari dan percampuran guna lahan komersial aktif.'
    },
    warung: {
      label: 'Warung Makan / F&B Lokal',
      icon: Store,
      spendingProxy: 'Rp 15.000 - Rp 30.000',
      recommendedH3: stationH3,
      catchmentRadius: '100 - 400 meter',
      matchScore: 89,
      rationale: 'Daya beli stabil dari pekerja transit dan mahasiswa di sekitar koridor feeder.'
    },
    retail: {
      label: 'Minimarket & Retail Harian',
      icon: ShoppingBag,
      spendingProxy: 'Rp 35.000 - Rp 60.000',
      recommendedH3: stationH3,
      catchmentRadius: '0 - 150 meter',
      matchScore: 96,
      rationale: 'Volume transaksi Struk Go tertinggi di dekat gate keluar stasiun.'
    }
  };

  const active = bizProfiles[selectedBiz];
  const IconComponent = active.icon;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 text-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Store className="w-3.5 h-3.5 text-cyan-400" />
          Profil Kesesuaian Lokasi Usaha (UMKM)
        </h4>
        <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
          Proksi Transaksi Riil
        </span>
      </div>

      {/* Business Type Chips */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {(['coffee', 'warung', 'retail'] as const).map((type) => {
          const ItemIcon = bizProfiles[type].icon;
          return (
            <button
              key={type}
              onClick={() => setSelectedBiz(type)}
              className={`p-2 rounded-lg text-center flex flex-col items-center gap-1 transition-all border ${
                selectedBiz === type
                  ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ItemIcon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold">{type === 'coffee' ? 'Coffee' : type === 'warung' ? 'Warung' : 'Retail'}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Recommendation Details */}
      <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
            <IconComponent className="w-4 h-4 text-cyan-400" />
            {active.label}
          </div>
          <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Match: {active.matchScore}%
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              Daya Beli Struk Go
            </div>
            <div className="font-bold text-slate-200 mt-0.5">{active.spendingProxy}</div>
          </div>

          <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              Catchment Ideal
            </div>
            <div className="font-bold text-slate-200 mt-0.5">{active.catchmentRadius}</div>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
          {active.rationale}
        </p>

        {onHighlightCell && (
          <button
            onClick={() => onHighlightCell(active.recommendedH3)}
            className="w-full mt-2 py-1.5 px-3 bg-cyan-600/80 hover:bg-cyan-600 text-slate-950 font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <MapPin className="w-3 h-3" />
            Sorot Sel H3 Rekomendasi di Peta
          </button>
        )}
      </div>
    </div>
  );
};
