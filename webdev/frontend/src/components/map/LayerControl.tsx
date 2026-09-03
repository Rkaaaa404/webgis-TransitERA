import React from 'react';
import { Layers, Eye, Map, Check, X, Bus, CloudRain, Sparkles } from 'lucide-react';

export type ChoroplethMode = 'tod_score' | 'njop_premium' | 'typology';
export type BasemapStyleKey = 'street' | 'street-2d' | 'dark' | 'light' | 'satellite';

interface LayerControlProps {
  choroplethMode: ChoroplethMode;
  onChangeChoroplethMode: (mode: ChoroplethMode) => void;
  showSurveyPoints: boolean;
  onToggleSurveyPoints: () => void;
  showTransitNodes?: boolean;
  onToggleTransitNodes?: () => void;
  showFloodHazard?: boolean;
  onToggleFloodHazard?: () => void;
  showNighttimeLight?: boolean;
  onToggleNighttimeLight?: () => void;
  basemapStyle: BasemapStyleKey;
  onChangeBasemapStyle: (style: BasemapStyleKey) => void;
  onClose?: () => void;
}

export const LayerControl: React.FC<LayerControlProps> = ({
  choroplethMode,
  onChangeChoroplethMode,
  showSurveyPoints,
  onToggleSurveyPoints,
  showTransitNodes = false,
  onToggleTransitNodes,
  showFloodHazard = false,
  onToggleFloodHazard,
  showNighttimeLight = false,
  onToggleNighttimeLight,
  basemapStyle,
  onChangeBasemapStyle,
  onClose
}) => {
  return (
    <div className="bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl rounded-xl p-3 text-slate-200 text-xs w-72 space-y-3 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-brand-lime" />
          <span className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">
            Layer Control &amp; Basemap
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Basemap Style Switcher */}
      <div>
        <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
          <Map className="w-3 h-3 text-slate-400" />
          MAPID MAPS Basemap
        </div>
        <div className="grid grid-cols-3 gap-1">
          {([
            { key: 'street', label: 'Street 3D' },
            { key: 'street-2d', label: 'Street 2D' },
            { key: 'dark', label: 'Dark' },
            { key: 'light', label: 'Light' },
            { key: 'satellite', label: 'Satellite' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onChangeBasemapStyle(key)}
              className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all border text-center ${
                basemapStyle === key
                  ? 'bg-brand-lime text-slate-950 border-brand-lime shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Choropleth Mode Selector */}
      <div>
        <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5">
          Overlay Choropleth H3
        </div>
        <div className="space-y-1">
          <button
            onClick={() => onChangeChoroplethMode('tod_score')}
            className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-between border transition-all ${
              choroplethMode === 'tod_score'
                ? 'bg-brand-lime/15 border-brand-lime/50 text-brand-lime font-bold'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-300'
            }`}
          >
            <span>TOD Readiness Score (5D)</span>
            {choroplethMode === 'tod_score' && <Check className="w-3.5 h-3.5 text-brand-lime" />}
          </button>

          <button
            onClick={() => onChangeChoroplethMode('njop_premium')}
            className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-between border transition-all ${
              choroplethMode === 'njop_premium'
                ? 'bg-brand-lime/15 border-brand-lime/50 text-brand-lime font-bold'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-300'
            }`}
          >
            <span>Estimasi Nilai Lahan (%ΔNJOP)</span>
            {choroplethMode === 'njop_premium' && <Check className="w-3.5 h-3.5 text-brand-lime" />}
          </button>

          <button
            onClick={() => onChangeChoroplethMode('typology')}
            className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-between border transition-all ${
              choroplethMode === 'typology'
                ? 'bg-brand-lime/15 border-brand-lime/50 text-brand-lime font-bold'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-300'
            }`}
          >
            <span>Tipologi Kawasan (Cluster)</span>
            {choroplethMode === 'typology' && <Check className="w-3.5 h-3.5 text-brand-lime" />}
          </button>
        </div>
      </div>

      {/* Overlay Layers Toggle */}
      <div className="space-y-1">
        <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">
          Layer Spasial Tematik
        </div>

        <button
          onClick={onToggleSurveyPoints}
          className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-between border transition-all ${
            showSurveyPoints
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Survei Lapangan
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
            360 Titik
          </span>
        </button>

        {onToggleTransitNodes && (
          <button
            onClick={onToggleTransitNodes}
            className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-between border transition-all ${
              showTransitNodes
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5" />
              Halte Feeder &amp; Bus
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              125 Titik
            </span>
          </button>
        )}

        {onToggleFloodHazard && (
          <button
            onClick={onToggleFloodHazard}
            className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-between border transition-all ${
              showFloodHazard
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 font-bold'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5" />
              Zona Kerentanan Banjir
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              1.553 Zona
            </span>
          </button>
        )}

        {onToggleNighttimeLight && (
          <button
            onClick={onToggleNighttimeLight}
            className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-between border transition-all ${
              showNighttimeLight
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Cahaya Malam (NTL)
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              52 Zona
            </span>
          </button>
        )}
      </div>

      {/* Dynamic Color Ramp Legend */}
      <div className="pt-2 border-t border-slate-800">
        <div className="text-[10px] font-semibold text-slate-400 mb-1.5">
          {choroplethMode === 'tod_score'
            ? 'Legenda TOD Readiness Score'
            : choroplethMode === 'njop_premium'
            ? 'Legenda Kenaikan %ΔNJOP'
            : 'Legenda Tipologi Kawasan'}
        </div>

        {choroplethMode === 'tod_score' && (
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 w-full" />
            <div className="flex justify-between text-[9px] text-slate-400 font-medium">
              <span>0 (Rendah)</span>
              <span>50 (Sedang)</span>
              <span>100 (Tinggi)</span>
            </div>
          </div>
        )}

        {choroplethMode === 'njop_premium' && (
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 w-full" />
            <div className="flex justify-between text-[9px] text-slate-400 font-medium">
              <span>+0%</span>
              <span>+10%</span>
              <span>+20%</span>
            </div>
          </div>
        )}

        {choroplethMode === 'typology' && (
          <div className="space-y-1 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-[#B1FC91]" />
              <span className="text-slate-300">Commercial Transit Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-[#4FC5C2]" />
              <span className="text-slate-300">Mixed-Use Residential</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-[#F59E0B]" />
              <span className="text-slate-300">Mixed-Use Heritage Core</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-[#473DD2]" />
              <span className="text-slate-300">Low-Access Feeder Zone</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
