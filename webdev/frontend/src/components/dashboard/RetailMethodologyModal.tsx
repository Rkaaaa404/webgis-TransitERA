'use client';

import React from 'react';
import {
  X,
  TrendingUp,
  Store,
  Coffee,
  ShoppingBag,
  Footprints,
  TrainFront,
  Users,
  Layers,
  Wallet,
  CheckCircle2,
  Database,
  ExternalLink,
} from 'lucide-react';
import { StationData } from '@/types';

interface RetailMethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: StationData;
  computedScore: number;
  variableBreakdown: {
    footTraffic: number;
    transitAccess: number;
    demographicDensity: number;
    landUseDiversity: number;
    purchasingPower: number;
  };
}

export const RetailMethodologyModal: React.FC<RetailMethodologyModalProps> = ({
  isOpen,
  onClose,
  station,
  computedScore,
  variableBreakdown,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">Metodologi Retail Success Score</h3>
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Beta v1.2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Model Multi-Kriteria Spasial untuk Evaluasi Titik Usaha TOD
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs text-slate-300">
          {/* Target Sektor Banner */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs">
              <Store className="w-4 h-4 text-brand-lime" />
              <span>Target Sektor Spesifik: Retail Komuter & Convenience F&B</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11.5px]">
              Skor ini dirancang secara khusus untuk menilai kelayakan usaha komersial skala mikro hingga menengah yang bergantung pada arus pejalan kaki stasiun, antara lain:
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300">
                <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Kedai Kopi to-go</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300">
                <Store className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Minimarket Transit</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Quick Service F&B</span>
              </div>
            </div>
          </div>

          {/* Formula & Bobot */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Formula Pembobotan Variabel Input
              </span>
              <span className="font-mono text-xs font-black text-brand-lime">
                Skor {station.name}: {computedScore}/100
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3 font-mono text-[11px]">
              {/* Var 1: Foot Traffic */}
              <div>
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5 font-sans font-medium text-xs">
                    <Footprints className="w-3.5 h-3.5 text-brand-lime" /> 30% Foot Traffic Proxy (NTL & POI)
                  </span>
                  <span className="font-bold text-brand-lime">{variableBreakdown.footTraffic.toFixed(1)} / 100</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-lime rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, variableBreakdown.footTraffic)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  Diestimasi dari densitas pencahayaan malam VIIRS NOAA & survei titik aktivitas komersial MAPID.
                </div>
              </div>

              {/* Var 2: Transit Accessibility */}
              <div>
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5 font-sans font-medium text-xs">
                    <TrainFront className="w-3.5 h-3.5 text-cyan-400" /> 25% Aksesibilitas & Konektivitas Transit
                  </span>
                  <span className="font-bold text-cyan-400">{variableBreakdown.transitAccess.toFixed(1)} / 100</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, variableBreakdown.transitAccess)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  Jarak jalan kaki langsung, integrasi feeder WiraWiri, dan halte bus pendukung.
                </div>
              </div>

              {/* Var 3: Demographic Density */}
              <div>
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5 font-sans font-medium text-xs">
                    <Users className="w-3.5 h-3.5 text-amber-400" /> 20% Densitas Kependudukan Catchment
                  </span>
                  <span className="font-bold text-amber-400">{variableBreakdown.demographicDensity.toFixed(1)} / 100</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, variableBreakdown.demographicDensity)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  Kepadatan penduduk riil per kilometer persegi (BPS Kota Surabaya {station.kecamatan || 'Surabaya'}).
                </div>
              </div>

              {/* Var 4: Land-Use Diversity */}
              <div>
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5 font-sans font-medium text-xs">
                    <Layers className="w-3.5 h-3.5 text-purple-400" /> 15% Diversitas Guna Lahan (Entropy Mix)
                  </span>
                  <span className="font-bold text-purple-400">{variableBreakdown.landUseDiversity.toFixed(1)} / 100</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, variableBreakdown.landUseDiversity)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  Keseimbangan guna lahan komersial, residensial, dan perkantoran untuk menjamin foot traffic siang & malam.
                </div>
              </div>

              {/* Var 5: Purchasing Power */}
              <div>
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5 font-sans font-medium text-xs">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" /> 10% Daya Beli & Tingkat Pekerjaan (SES)
                  </span>
                  <span className="font-bold text-emerald-400">{variableBreakdown.purchasingPower.toFixed(1)} / 100</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, variableBreakdown.purchasingPower)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  Indeks Sosial Ekonomi (SES) dan rasio angkatan kerja aktif di sekitar simpul.
                </div>
              </div>
            </div>
          </div>

          {/* Sumber Data */}
          <div className="space-y-2">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" /> Sumber Data Resmi & Terverifikasi
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">MAPID Spatial Catalog</div>
                <div className="text-[10.5px] text-slate-400">Pusat Perbelanjaan & Titik Survei Lapangan 2025/2026.</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">NOAA VIIRS NTL</div>
                <div className="text-[10.5px] text-slate-400">Citra Satelit Nighttime Radiance 500m Surabaya.</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">BPS Kota Surabaya</div>
                <div className="text-[10.5px] text-slate-400">Statistik Kependudukan & Profil Kesejahteraan Warga.</div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">OpenStreetMap & Dishub</div>
                <div className="text-[10.5px] text-slate-400">Jaringan Rute Suroboyo Bus & Feeder WiraWiri.</div>
              </div>
            </div>
          </div>

          {/* Disclaimer / Catatan Penting */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 leading-relaxed flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Catatan Keputusan Investasi:</strong> Skor ini berstatus <em>Beta Experimental</em> dan berfungsi sebagai indikator pendukung keputusan spasial makro. Keputusan sewa tempat/investasi wajib dilengkapi dengan studi kelayakan mikro langsung (survei kompetitor lokal, kondisi fisik ruko/lot, dan regulasi zonasi daerah).
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-900 bg-brand-lime hover:bg-brand-lime/90 rounded-xl transition-all shadow-md"
          >
            Tutup Informasi
          </button>
        </div>
      </div>
    </div>
  );
};
