import React from 'react';
import {
  Layers,
  Eye,
  Map,
  Check,
  X,
  Bus,
  CloudRain,
  Sparkles,
  Hexagon,
  CircleDollarSign,
  Star,
  EyeOff,
  Building2,
  Clock,
  Footprints,
  Navigation,
  Car,
  Route,
} from 'lucide-react';
import { IsochroneMode, IsochroneMinutes, IsochroneViewType } from './useIsochroneLayer';

export type ChoroplethMode = 'tod_score' | 'njop_premium' | 'typology' | 'none';
export type BasemapStyleKey = 'street' | 'street-2d' | 'dark' | 'light' | 'satellite';

interface LayerControlProps {
  choroplethMode: ChoroplethMode;
  onChangeChoroplethMode: (mode: ChoroplethMode) => void;
  showSurveyPoints: boolean;
  onToggleSurveyPoints: () => void;
  showTransitNodes?: boolean;
  onToggleTransitNodes?: () => void;
  showTransitRoutes?: boolean;
  onToggleTransitRoutes?: () => void;
  showShoppingCenters?: boolean;
  onToggleShoppingCenters?: () => void;
  showFloodHazard?: boolean;
  onToggleFloodHazard?: () => void;
  showNighttimeLight?: boolean;
  onToggleNighttimeLight?: () => void;
  showIsochrone?: boolean;
  onToggleIsochrone?: () => void;
  isochroneMode?: IsochroneMode;
  onChangeIsochroneMode?: (mode: IsochroneMode) => void;
  isochroneMinutes?: IsochroneMinutes;
  onChangeIsochroneMinutes?: (mins: IsochroneMinutes) => void;
  isochroneViewType?: IsochroneViewType;
  onChangeIsochroneViewType?: (type: IsochroneViewType) => void;
  surveyCount?: number | null;
  transitCount?: number | null;
  routesCount?: number | null;
  shoppingCount?: number | null;
  floodCount?: number | null;
  ntlCount?: number | null;
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
  showTransitRoutes = false,
  onToggleTransitRoutes,
  showShoppingCenters = false,
  onToggleShoppingCenters,
  showFloodHazard = false,
  onToggleFloodHazard,
  showNighttimeLight = false,
  onToggleNighttimeLight,
  showIsochrone = false,
  onToggleIsochrone,
  isochroneMode = 'walk',
  onChangeIsochroneMode,
  isochroneMinutes = 15,
  onChangeIsochroneMinutes,
  isochroneViewType = 'network',
  onChangeIsochroneViewType,
  surveyCount,
  transitCount,
  routesCount,
  shoppingCount,
  floodCount,
  ntlCount,
  basemapStyle,
  onChangeBasemapStyle,
  onClose
}) => {
  return (
    <div className="bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl rounded-xl p-3 text-slate-200 text-xs w-72 space-y-3 shadow-2xl max-h-[85vh] overflow-y-auto">
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

      {/* ── 1. Mutually Exclusive Thematic H3 Overlay (Pilih Satu) ── */}
      <div>
        <div className="text-[10px] uppercase font-bold text-cyan-400 mb-1.5 flex items-center justify-between">
          <span>Overlay Tematik H3</span>
          <span className="text-[9px] text-brand-lime font-mono">Pilih Satu</span>
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
            <span className="flex items-center gap-1.5">
              <Hexagon className="w-3.5 h-3.5" />
              TOD Readiness Score (5D)
            </span>
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
            <span className="flex items-center gap-1.5">
              <CircleDollarSign className="w-3.5 h-3.5" />
              Estimasi Nilai Lahan (%ΔNJOP)
            </span>
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
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" />
              Tipologi Kawasan (Cluster)
            </span>
            {choroplethMode === 'typology' && <Check className="w-3.5 h-3.5 text-brand-lime" />}
          </button>

          <button
            onClick={() => onChangeChoroplethMode('none')}
            className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-between border transition-all ${
              choroplethMode === 'none'
                ? 'bg-brand-lime/15 border-brand-lime/50 text-brand-lime font-bold'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5" />
              Tanpa Grid H3 (Clean View)
            </span>
            {choroplethMode === 'none' && <Check className="w-3.5 h-3.5 text-brand-lime" />}
          </button>
        </div>
      </div>

      {/* ── Pemisah Garis Tegas ── */}
      <div className="my-2.5 border-t border-slate-800" />

      {/* ── 2. Multi-Active Contextual Overlay Layers ── */}
      <div className="space-y-1">
        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
          <span>Layer Spasial Tambahan</span>
          <span className="text-[9px] text-slate-500 font-mono">Multi-Aktif</span>
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
            Opini Publik (Survei MAPID)
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
            {typeof surveyCount === 'number' ? `${surveyCount.toLocaleString('id-ID')} Titik` : '100 Titik'}
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
              {typeof transitCount === 'number' ? `${transitCount.toLocaleString('id-ID')} Titik` : '125 Titik'}
            </span>
          </button>
        )}

        {onToggleTransitRoutes && (
          <button
            onClick={onToggleTransitRoutes}
            className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-between border transition-all ${
              showTransitRoutes
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5" />
              Trayek Bus &amp; Feeder
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              {typeof routesCount === 'number' ? `${routesCount} Rute` : '16 Rute'}
            </span>
          </button>
        )}

        {onToggleShoppingCenters && (
          <button
            onClick={onToggleShoppingCenters}
            className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-between border transition-all ${
              showShoppingCenters
                ? 'bg-pink-500/20 border-pink-500/50 text-pink-300 font-bold'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Pusat Perbelanjaan (Mall)
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              {typeof shoppingCount === 'number' ? `${shoppingCount} Mall` : '35 Mall'}
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
              {typeof floodCount === 'number' ? `${floodCount.toLocaleString('id-ID')} Zona` : '1.553 Zona'}
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
              {typeof ntlCount === 'number' ? `${ntlCount.toLocaleString('id-ID')} Zona` : '52 Zona'}
            </span>
          </button>
        )}

        {onToggleIsochrone && (
          <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
            <button
              onClick={onToggleIsochrone}
              className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-between border transition-all ${
                showIsochrone
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                15-Minute City (Isochrone)
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {isochroneMinutes} Mnt
              </span>
            </button>

            {showIsochrone && (
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2 animate-in fade-in duration-200">
                {/* Mode Selector */}
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
                    <span>Moda Jaringan Jalan</span>
                    <span className="text-[8.5px] font-mono text-cyan-400">Street Network</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        { key: 'walk', label: 'Jalan Kaki', icon: Footprints, color: 'text-emerald-400' },
                        { key: 'motor', label: 'Motor', icon: Navigation, color: 'text-cyan-400' },
                        { key: 'car', label: 'Mobil', icon: Car, color: 'text-indigo-400' },
                      ] as const
                    ).map(({ key, label, icon: Icon, color }) => (
                      <button
                        key={key}
                        onClick={() => onChangeIsochroneMode && onChangeIsochroneMode(key)}
                        className={`py-1 px-1 rounded-md text-[9.5px] font-bold border flex items-center justify-center gap-1 transition-all ${
                          isochroneMode === key
                            ? 'bg-slate-800 border-slate-600 text-white shadow-sm'
                            : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className={`w-3 h-3 ${color}`} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Selector */}
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400 mb-1">
                    Waktu Tempuh (Menit)
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {([5, 10, 15] as const).map((mins) => (
                      <button
                        key={mins}
                        onClick={() => onChangeIsochroneMinutes && onChangeIsochroneMinutes(mins)}
                        className={`py-1 px-1 rounded-md text-[10px] font-mono font-bold border transition-all text-center ${
                          isochroneMinutes === mins
                            ? 'bg-brand-lime text-slate-950 border-brand-lime shadow-sm'
                            : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {mins} Mnt
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format Tampilan (Rute Jalan vs Area Poligon) */}
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
                    <span>Tampilan Jangkauan</span>
                    <span className="text-[8px] font-mono text-brand-lime font-bold">Rute Jalan Nyata</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => onChangeIsochroneViewType && onChangeIsochroneViewType('network')}
                      className={`py-1 px-1 rounded-md text-[9.5px] font-bold border flex items-center justify-center gap-1 transition-all ${
                        isochroneViewType === 'network'
                          ? 'bg-brand-lime text-slate-950 border-brand-lime shadow-sm'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                      title="Menampilkan rute jalan kaki mengikuti koridor jalan nyata"
                    >
                      <Route className="w-3 h-3" />
                      <span>Rute Jalan</span>
                    </button>
                    <button
                      onClick={() => onChangeIsochroneViewType && onChangeIsochroneViewType('polygon')}
                      className={`py-1 px-1 rounded-md text-[9.5px] font-bold border flex items-center justify-center gap-1 transition-all ${
                        isochroneViewType === 'polygon'
                          ? 'bg-brand-lime text-slate-950 border-brand-lime shadow-sm'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                      title="Menampilkan batas luar cakupan area poligon"
                    >
                      <Hexagon className="w-3 h-3" />
                      <span>Area Poligon</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 3. Dynamic Reactive Legend (Hanya Merender Layer Aktif) ── */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
          Legenda Simbologi Aktif
        </div>

        {/* Legend: TOD Readiness Score */}
        {choroplethMode === 'tod_score' && (
          <div className="space-y-1 p-2 rounded-lg bg-slate-950/50 border border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-200">
              <span>TOD Readiness Score (5D)</span>
              <span className="text-[9px] text-brand-lime font-mono">H3 Grid</span>
            </div>
            <div className="h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 w-full" />
            <div className="flex justify-between text-[9px] text-slate-400 font-medium">
              <span>0 (Rendah)</span>
              <span>50 (Sedang)</span>
              <span>100 (Tinggi)</span>
            </div>
          </div>
        )}

        {/* Legend: %ΔNJOP Premium */}
        {choroplethMode === 'njop_premium' && (
          <div className="space-y-1 p-2 rounded-lg bg-slate-950/50 border border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-200">
              <span>Kenaikan Nilai Lahan (%ΔNJOP)</span>
              <span className="text-[9px] text-cyan-400 font-mono">H3 Grid</span>
            </div>
            <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 w-full" />
            <div className="flex justify-between text-[9px] text-slate-400 font-medium">
              <span>+0%</span>
              <span>+10%</span>
              <span>+20%</span>
            </div>
          </div>
        )}

        {/* Legend: Tipologi Kawasan */}
        {choroplethMode === 'typology' && (
          <div className="space-y-1.5 p-2 rounded-lg bg-slate-950/50 border border-slate-800 text-[10px]">
            <div className="text-[10px] font-semibold text-slate-200 mb-1">Tipologi Kawasan (Cluster)</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-[#B1FC91] shrink-0" />
              <span className="text-slate-300">Commercial Transit Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-[#4FC5C2] shrink-0" />
              <span className="text-slate-300">Mixed-Use Residential Area</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-[#F59E0B] shrink-0" />
              <span className="text-slate-300">Mixed-Use Heritage Core</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-[#473DD2] shrink-0" />
              <span className="text-slate-300">Low-Accessibility Feeder Zone</span>
            </div>
          </div>
        )}

        {/* Legend: Contextual Symbols */}
        <div className="space-y-1 pt-1 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-brand-lime to-brand-teal border border-white shrink-0" />
            <span className="text-slate-300">Simpul Transit / Stasiun &amp; Terminal</span>
          </div>

          {showSurveyPoints && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 border border-white shrink-0" />
              <span className="text-slate-300">Opini Publik / Survei MAPID</span>
            </div>
          )}

          {showTransitRoutes && (
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded bg-amber-400 shrink-0" />
              <span className="text-slate-300">Trayek Suroboyo Bus &amp; Feeder WiraWiri</span>
            </div>
          )}

          {showTransitNodes && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 shrink-0" />
              <span className="text-slate-300">Halte Feeder &amp; Bus Stop</span>
            </div>
          )}

          {showShoppingCenters && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 border border-white shrink-0" />
              <span className="text-slate-300">Pusat Perbelanjaan &amp; Mall (35 Lokasi)</span>
            </div>
          )}

          {showFloodHazard && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-blue-500/80 border border-blue-400 shrink-0" />
              <span className="text-slate-300">Zona Kerentanan Banjir</span>
            </div>
          )}

          {showNighttimeLight && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-amber-400/80 border border-amber-300 shrink-0" />
              <span className="text-slate-300">Cahaya Malam (Aktivitas NTL)</span>
            </div>
          )}

          {showIsochrone && (
            <div className="pt-1.5 border-t border-slate-800/60 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-200 font-semibold flex items-center gap-1">
                  {isochroneViewType === 'network' ? (
                    <Route className="w-3 h-3 text-brand-lime" />
                  ) : (
                    <Hexagon className="w-3 h-3 text-brand-lime" />
                  )}
                  <span>
                    {isochroneViewType === 'network' ? 'Rute Jaringan Jalan' : 'Batas Area'}{' '}
                    ({isochroneMinutes} Mnt)
                  </span>
                </span>
                <span className="text-[9px] font-mono text-cyan-400 font-bold">
                  {isochroneMode === 'walk' ? '4.5 km/h' : isochroneMode === 'motor' ? '24 km/h' : '18.5 km/h'}
                </span>
              </div>

              {isochroneViewType === 'network' ? (
                <div className="grid grid-cols-3 gap-1 pt-0.5 text-[8.5px] font-mono">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-1 bg-emerald-400 rounded-full shrink-0" />
                    <span>5 Mnt (~380m)</span>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-400">
                    <span className="w-2.5 h-1 bg-cyan-400 rounded-full shrink-0" />
                    <span>10 Mnt (~750m)</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <span className="w-2.5 h-1 bg-amber-400 rounded-full shrink-0" />
                    <span>15 Mnt (~1.15km)</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[8.5px] text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-400 shrink-0" />
                  <span>Batas poligon luar jangkauan {isochroneMinutes} menit</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
