'use client';

import React, { useState, useEffect } from 'react';
import { StationId } from '@/types';
import { PersonaType, getPersonaConfig } from '@/lib/persona';
import { ChoroplethMode, BasemapStyleKey } from '@/components/map/LayerControl';
import {
  getTrainSchedulesForStation,
  getBusRoutesForStation,
  getTouristDestinationsForStation,
  getDemographicsForStation,
  getEnvironmentForStation,
  getStationInfo,
  getDirectionsUrl,
  STATION_NAMES,
  TrainSchedule,
  BusRoute,
  TouristDestination,
} from '@/lib/dummy-data';
import {
  Layers, Map, Users, TreePine, SlidersHorizontal,
  Store, Landmark, DollarSign, Home,
  Train as TrainIcon, Bus, MapPin, Settings, HelpCircle, MessageSquare, Video,
  ChevronRight, ChevronDown, Clock, AlertTriangle, Droplets, Wind, Thermometer,
  Eye, EyeOff, Star, Hexagon, ScrollText, BarChart2, CircleDollarSign, Building2,
  Navigation, ExternalLink, Footprints, Circle
} from 'lucide-react';

interface SidebarContainerProps {
  activePersona: PersonaType;
  activeStation?: StationId;
  onSelectStation?: (stationId: StationId) => void;
  choroplethMode: ChoroplethMode;
  onChangeChoroplethMode: (mode: ChoroplethMode) => void;
  showSurveyPoints: boolean;
  onToggleSurveyPoints: () => void;
  basemapStyle: BasemapStyleKey;
  onChangeBasemapStyle: (style: BasemapStyleKey) => void;
  h3ScoreRange?: [number, number];
  onChangeH3ScoreRange?: (range: [number, number]) => void;
  h3RingFilter?: number;
  onChangeH3RingFilter?: (ring: number) => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  onOpenFeedback?: () => void;
  onOpenVideoTutorial?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isMobileMode?: boolean;
  // ATR/BPN Layer Controls
  showGistaru?: boolean;
  onToggleGistaru?: () => void;
  showBhumi?: boolean;
  onToggleBhumi?: () => void;
}

/* ── Orange Toggle ── */
function Toggle({ active, onToggle, label, icon }: { active: boolean; onToggle: () => void; label: string; icon?: React.ReactNode }) {
  return (
    <button onClick={onToggle} className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs hover:bg-slate-800/40 transition-colors group">
      <div className="flex items-center gap-2">
        {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
        <span className={`font-medium ${active ? 'text-slate-200' : 'text-slate-400'}`}>{label}</span>
      </div>
      <div className={`toggle-switch ${active ? 'active' : ''}`} />
    </button>
  );
}

/* ── Nav Item ── */
function NavItem({ icon: Icon, label, active, onClick, badge, expandable, expanded, showLabelOnDesktop = true }: {
  icon: React.ElementType; label: string; active?: boolean; onClick?: () => void; badge?: string; expandable?: boolean; expanded?: boolean; showLabelOnDesktop?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition-colors group/item ${
        active ? 'bg-brand-500/20 text-brand-lime' : 'hover:bg-slate-800/40 text-slate-300'
      }`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-brand-lime' : 'text-slate-400 group-hover/item:text-slate-200'}`} />
        <span className={`text-xs font-medium truncate ${showLabelOnDesktop ? 'md:hidden group-hover:block lg:block' : ''}`}>
          {label}
        </span>
      </div>
      {badge && <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider shrink-0 ${showLabelOnDesktop ? 'md:hidden group-hover:block lg:block' : ''} ${active ? 'bg-brand-lime text-brand-900' : 'bg-slate-700 text-slate-300'}`}>{badge}</span>}
      {expandable && (
        <div className={`shrink-0 ${showLabelOnDesktop ? 'md:hidden group-hover:block lg:block' : ''}`}>
          {expanded ? <ChevronDown className="w-3.5 h-3.5 opacity-50" /> : <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
        </div>
      )}
    </button>
  );
}

/* ── Section Header ── */
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 pt-3 pb-1">
      {label}
    </div>
  );
}

/* ── Basemap Grid (shared) ── */
function BasemapGrid({ basemapStyle, onChangeBasemapStyle }: { basemapStyle: BasemapStyleKey; onChangeBasemapStyle: (s: BasemapStyleKey) => void }) {
  return (
    <>
      <SectionHeader label="MAPID MAPS Basemap" />
      <div className="px-3">
        <div className="grid grid-cols-2 gap-1.5">
          {([
            { key: 'dark', label: 'Dark' },
            { key: 'street', label: 'Street 3D' },
            { key: 'street-2d', label: 'Street 2D' },
            { key: 'light', label: 'Light' },
            { key: 'satellite', label: 'Satellite' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onChangeBasemapStyle(key)}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all border ${
                basemapStyle === key
                  ? 'bg-brand-lime text-slate-950 border-brand-lime shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export const SidebarContainer: React.FC<SidebarContainerProps> = ({
  activePersona,
  activeStation = 'gubeng',
  onSelectStation,
  choroplethMode,
  onChangeChoroplethMode,
  showSurveyPoints,
  onToggleSurveyPoints,
  basemapStyle,
  onChangeBasemapStyle,
  h3ScoreRange = [0, 100],
  onChangeH3ScoreRange,
  h3RingFilter = 5,
  onChangeH3RingFilter,
  onOpenSettings,
  onOpenHelp,
  onOpenFeedback,
  onOpenVideoTutorial,
  isOpen = false,
  onClose,
  isMobileMode,
  showGistaru,
  onToggleGistaru,
  showBhumi,
  onToggleBhumi,
}) => {
  const [govActiveTab, setGovActiveTab] = useState<'filter' | 'layers' | 'legends' | 'demographics' | 'environment'>('filter');
  const [bizActiveTab, setBizActiveTab] = useState<'filter' | 'layers' | 'legends' | 'competitors' | 'poilist'>('filter');
  const [comActiveTab, setComActiveTab] = useState<'filter' | 'layers' | 'legends' | 'schedules' | 'routes' | 'tourist'>('layers');

  const config = getPersonaConfig(activePersona);

  // General Layer States
  const [showEconomicPOI, setShowEconomicPOI] = useState(true);
  const [showNJOPZone, setShowNJOPZone] = useState(true);
  const [showPropertiGo, setShowPropertiGo] = useState(false);

  // Business Specific State
  const [njopRange, setNjopRange] = useState<[number, number]>([10, 50]);

  // Commuter Specific State
  const [showKRL, setShowKRL] = useState(true);
  const [showBus, setShowBus] = useState(true);
  const [trainDirectionFilter, setTrainDirectionFilter] = useState<'all' | 'southbound' | 'northbound'>('all');
  const [envDataMap, setEnvDataMap] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch('/data/station_environment_data.json')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) setEnvDataMap(data);
      })
      .catch(() => {});
  }, []);

  const demographics = getDemographicsForStation(activeStation);
  const rawEnv = envDataMap[activeStation] || getEnvironmentForStation(activeStation);
  const environment = rawEnv ? {
    ...rawEnv,
    greenSpacePct: rawEnv.green_space_pct ?? rawEnv.greenSpacePct ?? 18.5,
    aqiColor: rawEnv.aqi_color ?? rawEnv.aqiColor ?? '#f59e0b',
    aqiLabel: rawEnv.aqi_label ?? rawEnv.aqiLabel ?? 'Sedang',
    floodRisk: rawEnv.flood_risk ?? rawEnv.floodRisk ?? 'rendah',
    floodRiskColor: rawEnv.flood_risk_color ?? rawEnv.floodRiskColor ?? '#10b981',
    floodNote: rawEnv.flood_note ?? 'Perlu penguatan drainase primer koridor stasiun.',
    provenance: 'Sumber: Open-Meteo (Copernicus CAMS), BPBD Kota Surabaya, & RTRW Perda 8/2024'
  } : undefined;
  const trainSchedules = getTrainSchedulesForStation(activeStation);
  const busRoutes = getBusRoutesForStation(activeStation);
  const touristSpots = getTouristDestinationsForStation(activeStation);
  const stationInfo = getStationInfo(activeStation);

  const filteredTrains = trainSchedules.filter((t) => {
    if (trainDirectionFilter === 'all') return true;
    return t.direction === trainDirectionFilter;
  });

  // SHARED UI RENDERERS (FILTER, LAYERS, LEGENDS)
  // ---------------------------------------------------------------------------
  
  const renderFilterTab = () => (
    <div className="px-3 py-3 space-y-3 border-t border-slate-800/60 mt-2">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Filter Spasial</div>
        <button
          onClick={() => {
            onChangeH3ScoreRange?.([0, 100]);
            onChangeH3RingFilter?.(5);
            setNjopRange([0, 25]);
          }}
          className="text-[9px] text-slate-400 hover:text-brand-lime underline"
        >
          Reset Filter
        </button>
      </div>
      
      {/* H3 Catchment & Score Filter */}
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-slate-300 font-medium">Radius Zonasi Buffer H3</label>
            <span className="text-[10px] text-brand-lime font-bold">Ring ≤ {h3RingFilter} (~{h3RingFilter * 300}m)</span>
          </div>
          <p className="text-[9px] text-slate-500 mb-1.5 leading-tight">Lapisan cincin heksagonal H3 dari simpul stasiun aktif (Ring 1 ≈ 300m s/d Ring 5 ≈ 1.500m).</p>
          <input type="range" min={0} max={5} value={h3RingFilter} onChange={(e) => onChangeH3RingFilter?.(+e.target.value)}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-lime" />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Min TOD Score: <span className="text-brand-lime font-bold">{h3ScoreRange[0]}</span></label>
          <input type="range" min={0} max={100} value={h3ScoreRange[0]} onChange={(e) => onChangeH3ScoreRange?.([+e.target.value, h3ScoreRange[1]])}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-lime" />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Max TOD Score: <span className="text-brand-lime font-bold">{h3ScoreRange[1]}</span></label>
          <input type="range" min={0} max={100} value={h3ScoreRange[1]} onChange={(e) => onChangeH3ScoreRange?.([h3ScoreRange[0], +e.target.value])}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-lime" />
        </div>
      </div>

      {/* NJOP Premium Filter */}
      <div className="pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] text-slate-300 font-medium">Estimasi Kenaikan Nilai Tanah (%ΔNJOP)</label>
          <span className="text-[10px] text-brand-lime font-bold">+{njopRange[0]}% – +{njopRange[1]}%</span>
        </div>
        <p className="text-[9px] text-slate-500 mb-1.5 leading-tight">Rentang estimasi persentase kenaikan nilai pasar / NJOP tanah di sekitar koridor transit.</p>
        <div className="flex gap-2">
          <input type="range" min={0} max={25} value={njopRange[0]} onChange={(e) => setNjopRange([+e.target.value, njopRange[1]])}
            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-lime" />
          <input type="range" min={0} max={25} value={njopRange[1]} onChange={(e) => setNjopRange([njopRange[0], +e.target.value])}
            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-lime" />
        </div>
      </div>
    </div>
  );

  const renderLayersTab = (isGovBiz: boolean) => (
    <>
      <SectionHeader label="Lapisan Peta (Layers)" />
      <div className="px-3 pb-2">
        {activePersona !== 'commuter' ? (
          <>
            {/* ── Lapisan Utama Tematik H3 (Pilih Salah Satu) ── */}
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1 pt-1 pb-1.5 flex items-center justify-between">
              <span>Analisis Tematik H3</span>
              <span className="text-[9px] text-brand-lime font-mono">Pilih Satu</span>
            </div>
            <div className="space-y-1">
              <Toggle
                active={choroplethMode === 'tod_score'}
                onToggle={() => onChangeChoroplethMode('tod_score')}
                label="H3 TOD Grid (5D)"
                icon={<Hexagon className="w-4 h-4" />}
              />
              <Toggle
                active={choroplethMode === 'njop_premium'}
                onToggle={() => onChangeChoroplethMode('njop_premium')}
                label="Zona Nilai Lahan (%ΔNJOP)"
                icon={<CircleDollarSign className="w-4 h-4" />}
              />
              <Toggle
                active={choroplethMode === 'typology'}
                onToggle={() => onChangeChoroplethMode('typology')}
                label="Tipologi Kawasan (Cluster)"
                icon={<Star className="w-4 h-4" />}
              />
              <Toggle
                active={choroplethMode === 'none'}
                onToggle={() => onChangeChoroplethMode('none')}
                label="Tanpa Grid H3 (Clean View)"
                icon={<EyeOff className="w-4 h-4" />}
              />
            </div>
            {/* ── Pemisah Garis ── */}
            <div className="my-2.5 border-t border-slate-800" />
          </>
        ) : (
          <>
            {/* ── Cakupan Perimeter Khusus Komuter (Radius 1 km) ── */}
            <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 px-1 pt-1 pb-1.5 flex items-center justify-between">
              <span>Cakupan Area Transit</span>
              <span className="text-[9px] text-cyan-400 font-mono">Buffer Stasiun</span>
            </div>
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-100">Perimeter Radius 1 km</span>
                  <span className="text-[9px] text-cyan-300">Zonasi buffer sirkular transit komuter</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded border border-cyan-500/30">
                Aktif
              </span>
            </div>
            {/* ── Pemisah Garis ── */}
            <div className="my-2.5 border-t border-slate-800" />
          </>
        )}

        {/* ── Lapisan Tambahan (Bisa Dinyalakan Bersamaan) ── */}
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1 pb-1.5 flex items-center justify-between">
          <span>Lapisan Tambahan</span>
          <span className="text-[9px] text-slate-500 font-mono">Multi-Aktif</span>
        </div>
        <div className="space-y-1">
          <Toggle
            active={showGistaru ?? false}
            onToggle={onToggleGistaru ?? (() => {})}
            label="Kawasan BWP (GISTARU)"
            icon={<Map className="w-4 h-4" />}
          />
          <Toggle
            active={showBhumi ?? false}
            onToggle={onToggleBhumi ?? (() => {})}
            label="Persil Tanah (Bhumi ATR)"
            icon={<ScrollText className="w-4 h-4" />}
          />
          <Toggle
            active={showSurveyPoints}
            onToggle={onToggleSurveyPoints}
            label="Opini Publik (Survei MAPID)"
            icon={<BarChart2 className="w-4 h-4" />}
          />
          {isGovBiz && (
            <Toggle
              active={showEconomicPOI}
              onToggle={() => setShowEconomicPOI(!showEconomicPOI)}
              label="Economic POI"
              icon={<Building2 className="w-4 h-4" />}
            />
          )}
        </div>
      </div>

      <BasemapGrid basemapStyle={basemapStyle} onChangeBasemapStyle={onChangeBasemapStyle} />
    </>
  );

  const renderLegendsTab = () => (
    <div className="px-3 py-3 space-y-3 border-t border-slate-800/60 mt-2">
      {/* Header Legenda Interaktif dengan Quick Selector */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Legenda Simbologi Peta</div>
        {activePersona !== 'commuter' && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onChangeChoroplethMode('tod_score')}
              title="Tampilkan Legenda & Layer TOD"
              className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
                choroplethMode === 'tod_score'
                  ? 'bg-brand-lime text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              TOD
            </button>
            <button
              onClick={() => onChangeChoroplethMode('njop_premium')}
              title="Tampilkan Legenda & Layer NJOP"
              className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
                choroplethMode === 'njop_premium'
                  ? 'bg-brand-lime text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              NJOP
            </button>
            <button
              onClick={() => onChangeChoroplethMode('typology')}
              title="Tampilkan Legenda & Layer Tipologi"
              className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
                choroplethMode === 'typology'
                  ? 'bg-brand-lime text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tipologi
            </button>
            <button
              onClick={() => onChangeChoroplethMode('none')}
              title="Nonaktifkan Grid H3"
              className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
                choroplethMode === 'none'
                  ? 'bg-brand-lime text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Clean
            </button>
          </div>
        )}
      </div>

      {/* Legenda Khusus Komuter */}
      {activePersona === 'commuter' && (
        <div className="space-y-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] font-bold text-slate-200 mb-1">Legenda Khusus Komuter</div>
          <div className="flex items-center gap-2 text-[10px] text-slate-300">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-cyan-400 bg-cyan-500/20 shrink-0" />
            <span>Perimeter Radius 1 km (Buffer Transit)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-300">
            <span className="w-4 h-1 bg-brand-lime rounded-full shrink-0" />
            <span>Koridor Feeder WiraWiri &amp; Suroboyo Bus</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-500/40 shrink-0" />
            <span>Simpul Stasiun / Terminal Terpilih</span>
          </div>
        </div>
      )}

      {/* Mode Bersih - Muncul saat mode none aktif pada non-komuter */}
      {activePersona !== 'commuter' && choroplethMode === 'none' && (
        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 text-[10px] text-slate-400 text-center">
          Grid H3 dinonaktifkan (Peta Bersih).
        </div>
      )}
      
      {/* TOD Score Legend - Muncul saat mode TOD aktif */}
      {choroplethMode === 'tod_score' && (
        <div className="space-y-1.5 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 transition-all">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-200">
            <span>TOD Readiness Score (0-100)</span>
            <span className="text-[9px] text-brand-lime font-mono">Aktif</span>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 w-full shadow-inner" />
          <div className="flex justify-between text-[9px] text-slate-400 font-medium">
            <span>0 (Rendah)</span><span>50 (Sedang)</span><span>100 (Tinggi)</span>
          </div>
        </div>
      )}

      {/* NJOP Legend - Muncul saat mode NJOP aktif */}
      {choroplethMode === 'njop_premium' && (
        <div className="space-y-1.5 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 transition-all">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-200">
            <span>Estimasi %ΔNJOP Premium</span>
            <span className="text-[9px] text-cyan-400 font-mono">Aktif</span>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 w-full shadow-inner" />
          <div className="flex justify-between text-[9px] text-slate-400 font-medium">
            <span>+0%</span><span>+10%</span><span>+20%</span>
          </div>
        </div>
      )}

      {/* Typology Legend - Muncul saat mode Tipologi aktif */}
      {choroplethMode === 'typology' && (
        <div className="space-y-2 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 transition-all">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-200">
            <span>Tipologi Kawasan (Cluster Analysis)</span>
            <span className="text-[9px] text-purple-400 font-mono">Aktif</span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-3 h-3 rounded bg-[#B1FC91] flex-shrink-0 shadow-sm" />
              <span className="text-slate-300">Commercial Transit Hub</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-3 h-3 rounded bg-[#F59E0B] flex-shrink-0 shadow-sm" />
              <span className="text-slate-300">Mixed-Use Heritage Core</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-3 h-3 rounded bg-[#4FC5C2] flex-shrink-0 shadow-sm" />
              <span className="text-slate-300">Mixed-Use Residential Area</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-3 h-3 rounded bg-[#473DD2] flex-shrink-0 shadow-sm" />
              <span className="text-slate-300">Low-Accessibility Feeder Zone</span>
            </div>
          </div>
        </div>
      )}

      {/* Station & Survey Markers */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
        <div className="text-[10px] font-semibold text-slate-300">Simbol & Marker Aktif</div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-brand-lime to-brand-teal border border-white flex-shrink-0 shadow-sm" />
          <span className="text-slate-400">Simpul Stasiun SRRL</span>
        </div>
        {showSurveyPoints && (
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-3 h-3 rounded-full bg-pink-500 border border-white flex-shrink-0 shadow-sm" />
            <span className="text-slate-400">Titik Opini Publik / Survei MAPID</span>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobileMode) {
    return (
      <div className="flex-1 overflow-y-auto py-1 px-2 w-full h-full">
        {/* ══════ Government Sidebar ══════ */}
        {activePersona === 'government' && (
          <>
            <SectionHeader label="Spatial Planning Tools" />
            <div className="px-2 space-y-0.5">
              <NavItem icon={SlidersHorizontal} label="Filter Spasial" active={govActiveTab === 'filter'} onClick={() => setGovActiveTab('filter')} badge={h3ScoreRange[0] > 0 || h3ScoreRange[1] < 100 || h3RingFilter < 5 || njopRange[0] > 0 || njopRange[1] < 25 ? 'Aktif' : undefined} />
              <NavItem icon={Layers} label="Lapisan Peta (Layers)" active={govActiveTab === 'layers'} onClick={() => setGovActiveTab('layers')} />
              <NavItem icon={Map} label="Legenda (Legends)" active={govActiveTab === 'legends'} onClick={() => setGovActiveTab('legends')} />
              <div className="my-1 border-t border-slate-800/80" />
              <NavItem icon={Users} label="Demografi Spasial" active={govActiveTab === 'demographics'} onClick={() => setGovActiveTab('demographics')} />
              <NavItem icon={TreePine} label="Lingkungan & RTH" active={govActiveTab === 'environment'} onClick={() => setGovActiveTab('environment')} />
            </div>

            {/* General Features Rendering */}
            {govActiveTab === 'filter' && renderFilterTab()}
            {govActiveTab === 'layers' && renderLayersTab(true)}
            {govActiveTab === 'legends' && renderLegendsTab()}

            {/* Demographics Panel for Government */}
            {govActiveTab === 'demographics' && demographics && (
              <div className="px-3 py-3 space-y-3 border-t border-slate-800/60 mt-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-brand-lime uppercase tracking-wider">
                    Statistik Radius 1km
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800/30 p-2 rounded-lg border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 mb-1">Populasi</div>
                    <div className="font-mono text-sm text-slate-200">{demographics.population.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-800/30 p-2 rounded-lg border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 mb-1">Kepadatan (jiwa/km²)</div>
                    <div className="font-mono text-sm text-slate-200">{demographics.density.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Environment Panel for Government */}
            {govActiveTab === 'environment' && environment && (
              <div className="px-3 py-3 space-y-3 border-t border-slate-800/60 mt-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-brand-lime uppercase tracking-wider">
                    Indikator RTH & Polusi
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Air Quality Index</span>
                    <span className={`font-mono ${environment.aqi > 100 ? 'text-red-400' : 'text-brand-lime'}`}>{environment.aqi}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Cakupan RTH</span>
                    <span className="font-mono text-slate-200">{environment.greenSpacePct}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Flood Risk</span>
                    <span className="font-mono text-slate-200">{environment.floodRisk}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tourist Destinations Panel (Mobile) */}
            {comActiveTab === 'tourist' && (
              <div className="px-3 py-3 space-y-2 border-t border-slate-800/60 mt-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Destinasi Terdekat</div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-brand-lime/10 text-brand-lime font-bold border border-brand-lime/20">
                    {touristSpots.length} POI
                  </span>
                </div>

                {/* Station Filter Pills */}
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                    <span className="truncate">Titik Asal: {stationInfo.fullName}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/70">
                    {Array.from(new Set([activeStation, 'gubeng', 'pasar_turi', 'semut', 'wonokromo', 'waru'] as StationId[])).map((stId) => (
                      <button
                        key={stId}
                        onClick={() => onSelectStation?.(stId)}
                        className={`px-2 py-1 rounded text-[9px] font-bold truncate transition-all text-center ${
                          activeStation === stId
                            ? 'bg-brand-lime text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {STATION_NAMES[stId]?.shortName || stId}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {touristSpots.map((d) => {
                    const routeUrl = getDirectionsUrl(
                      stationInfo.lat,
                      stationInfo.lng,
                      d.lat,
                      d.lng,
                      d.walkTime.includes('Bus') ? 'transit' : 'walking'
                    );

                    return (
                      <div key={d.id} className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-200">{d.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{d.description}</div>
                            <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400">
                              <span className="text-amber-300 font-bold flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" /> {d.rating}
                              </span>
                              <span>·</span>
                              <span>{d.distanceFromStation}</span>
                              <span>·</span>
                              <span>{d.walkTime}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-slate-700/40 flex items-center justify-between">
                          <span className="text-[8.5px] text-slate-400">Dari: {stationInfo.shortName}</span>
                          <a
                            href={routeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-lime/15 text-brand-lime text-[9px] font-bold border border-brand-lime/30 hover:bg-brand-lime hover:text-slate-950 transition-all"
                          >
                            <Navigation className="w-2.5 h-2.5" />
                            <span>Petunjuk Rute</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                  {touristSpots.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-500 italic">
                      Belum ada destinasi wisata terdata di sekitar {stationInfo.shortName}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════ Business Sidebar ══════ */}
        {activePersona === 'business' && (
          <>
            <SectionHeader label="Business & Investor" />
            <div className="px-2 space-y-0.5">
              <NavItem icon={SlidersHorizontal} label="Filter Spasial" active={bizActiveTab === 'filter'} onClick={() => setBizActiveTab('filter')} badge={h3ScoreRange[0] > 0 || h3ScoreRange[1] < 100 || h3RingFilter < 5 || njopRange[0] > 0 || njopRange[1] < 25 ? 'Aktif' : undefined} />
              <NavItem icon={Layers} label="Lapisan Peta" active={bizActiveTab === 'layers'} onClick={() => setBizActiveTab('layers')} />
              <NavItem icon={Map} label="Legenda" active={bizActiveTab === 'legends'} onClick={() => setBizActiveTab('legends')} />
              <div className="my-1 border-t border-slate-800/80" />
              <NavItem icon={Store} label="Daftar Kompetitor" active={bizActiveTab === 'competitors'} onClick={() => setBizActiveTab('competitors')} />
              <NavItem icon={Landmark} label="POI Utama" active={bizActiveTab === 'poilist'} onClick={() => setBizActiveTab('poilist')} />
            </div>

            {bizActiveTab === 'filter' && renderFilterTab()}
            {bizActiveTab === 'layers' && renderLayersTab(true)}
            {bizActiveTab === 'legends' && renderLegendsTab()}
          </>
        )}

        {/* ══════ Commuter Sidebar ══════ */}
        {activePersona === 'commuter' && (
          <>
            <SectionHeader label="Commuter Transit" />
            <div className="px-2 space-y-0.5">
              <NavItem icon={Layers} label="Lapisan Peta" active={comActiveTab === 'layers'} onClick={() => setComActiveTab('layers')} />
              <NavItem icon={Map} label="Legenda" active={comActiveTab === 'legends'} onClick={() => setComActiveTab('legends')} />
              <div className="my-1 border-t border-slate-800/80" />
              <NavItem icon={TrainIcon} label="Jadwal Kereta" active={comActiveTab === 'schedules'} onClick={() => setComActiveTab('schedules')} />
              <NavItem icon={Bus} label="Rute Feeder/Bus" active={comActiveTab === 'routes'} onClick={() => setComActiveTab('routes')} />
              <NavItem icon={MapPin} label="Destinasi Wisata" active={comActiveTab === 'tourist'} onClick={() => setComActiveTab('tourist')} />
            </div>

            {comActiveTab === 'layers' && renderLayersTab(false)}
            {comActiveTab === 'legends' && renderLegendsTab()}

            {/* Train Schedules Panel */}
            {comActiveTab === 'schedules' && (
              <div className="px-3 py-3 space-y-2 border-t border-slate-800/60 mt-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Jadwal Stasiun</div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-brand-lime/10 text-brand-lime font-bold border border-brand-lime/20">
                    {stationInfo.code}
                  </span>
                </div>

                {/* Station Filter Pills */}
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                    <span className="truncate">{stationInfo.fullName}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/70">
                    {Array.from(new Set([activeStation, 'gubeng', 'pasar_turi', 'semut', 'wonokromo', 'waru', 'terminal_joyoboyo', 'terminal_purabaya', 'terminal_bratang'] as StationId[])).map((stId) => (
                      <button
                        key={stId}
                        onClick={() => onSelectStation?.(stId)}
                        className={`px-2 py-1 rounded text-[9px] font-bold truncate transition-all text-center ${
                          activeStation === stId
                            ? 'bg-brand-lime text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {STATION_NAMES[stId]?.shortName || stId}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direction Filter */}
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'southbound', label: 'Ke Selatan ↓' },
                    { id: 'northbound', label: 'Ke Utara ↑' },
                  ].map((dir) => (
                    <button
                      key={dir.id}
                      onClick={() => setTrainDirectionFilter(dir.id as any)}
                      className={`py-1 text-[9px] rounded font-semibold transition-all ${
                        trainDirectionFilter === dir.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800/60 text-slate-400'
                      }`}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>

                {/* Train List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {filteredTrains.map((ts, idx) => (
                    <div key={idx} className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-200">{ts.trainName}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-700/60 font-mono text-slate-300">{ts.trainNumber}</span>
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            {ts.isTerminus ? (
                              <span className="text-amber-300 font-medium">Tiba di {stationInfo.shortName} (Terminus)</span>
                            ) : (
                              <span>{stationInfo.shortName} → <span className="text-cyan-300 font-semibold">{ts.destination}</span></span>
                            )}
                          </div>
                          {ts.nextStop && !ts.isTerminus && (
                            <div className="text-[8px] text-slate-500 mt-0.5">Stop berikut: {ts.nextStop}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm font-black text-brand-lime leading-none">{ts.departureTime}</div>
                          <div className={`text-[8px] font-bold uppercase mt-1 px-1 py-0.2 rounded inline-block ${
                            ts.status === 'on_time' ? 'text-emerald-400' : ts.status === 'delayed' ? 'text-amber-400' : 'text-slate-500'
                          }`}>
                            {ts.status.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-700/40 text-[9px] text-slate-400">
                        <span>Jalur {ts.platform}</span>
                        <span>{ts.isTerminus ? `Tiba: ${ts.arrivalTime}` : `Estimasi Tiba: ${ts.arrivalTime}`}</span>
                      </div>
                    </div>
                  ))}
                  {filteredTrains.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-500 italic">
                      Tidak ada jadwal kereta untuk filter ini
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Bus Routes Panel */}
            {comActiveTab === 'routes' && (
              <div className="px-3 py-3 space-y-2 border-t border-slate-800/60 mt-2">
                <div className="text-[10px] font-bold text-brand-lime uppercase tracking-wider mb-2">Feeder Terintegrasi</div>
                {busRoutes.map((br, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-800/30 p-2 rounded border border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: br.color }}></div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{br.routeName}</div>
                        <div className="text-[10px] text-slate-400">Frek: {br.frequency}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Mobile Backdrop - Left for safety, but typically unused if isMobileMode handles mobile view */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel with group hover for Tablet */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[300px] bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col h-full shadow-2xl overflow-hidden flex-shrink-0 transition-all duration-300 md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:w-[80px] lg:w-[300px] hover:w-[300px] group`}
      >
      {/* ── Sidebar Header ── */}
      <div className="px-4 py-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-lime shrink-0" />
          <div className="md:hidden group-hover:block lg:block whitespace-nowrap overflow-hidden transition-all">
            <h3 className="text-xs font-bold text-brand-lime">{config.sidebarTitle}</h3>
            <p className="text-[10px] text-slate-500">{config.sidebarSubtitle}</p>
          </div>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto py-1">

        {/* ══════ Government Sidebar ══════ */}
        {activePersona === 'government' && (
          <>
            <SectionHeader label="Spatial Planning Tools" />
            <div className="px-2 space-y-0.5">
              <NavItem icon={SlidersHorizontal} label="Filter Spasial" active={govActiveTab === 'filter'} onClick={() => setGovActiveTab('filter')} badge={h3ScoreRange[0] > 0 || h3ScoreRange[1] < 100 || h3RingFilter < 5 || njopRange[0] > 0 || njopRange[1] < 25 ? 'Aktif' : undefined} />
              <NavItem icon={Layers} label="Lapisan Peta (Layers)" active={govActiveTab === 'layers'} onClick={() => setGovActiveTab('layers')} />
              <NavItem icon={Map} label="Legenda (Legends)" active={govActiveTab === 'legends'} onClick={() => setGovActiveTab('legends')} />
              <div className="my-1 border-t border-slate-800/80" />
              <NavItem icon={Users} label="Demografi Spasial" active={govActiveTab === 'demographics'} onClick={() => setGovActiveTab('demographics')} />
              <NavItem icon={TreePine} label="Lingkungan & RTH" active={govActiveTab === 'environment'} onClick={() => setGovActiveTab('environment')} />
            </div>

            {/* General Features Rendering */}
            {govActiveTab === 'filter' && renderFilterTab()}
            {govActiveTab === 'layers' && renderLayersTab(true)}
            {govActiveTab === 'legends' && renderLegendsTab()}

            {/* Demographics Panel for Government */}
            {govActiveTab === 'demographics' && demographics && (
              <div className="px-3 py-3 space-y-3 border-t border-slate-800/60 mt-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-brand-lime uppercase tracking-wider">
                    {demographics.kecamatan}
                  </div>
                  <span className="text-[9px] bg-brand-lime/10 border border-brand-lime/30 text-brand-lime px-1.5 py-0.5 rounded font-semibold">
                    Radius Buffer
                  </span>
                </div>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/40">
                    <div className="text-base font-black text-brand-lime">{demographics.population.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-400">Total Populasi</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/40">
                    <div className="text-base font-black text-cyan-400">{demographics.density.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-400">Kepadatan (Jiwa/km²)</div>
                  </div>
                </div>

                {/* Age Pyramid / Distribution */}
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/40">
                  <div className="text-[10px] font-semibold text-slate-300 mb-2">Struktur Demografi Usia</div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-slate-400">Usia Muda (0-17 thn)</span>
                        <span className="text-slate-200 font-bold">{demographics.ageDistribution.youth}%</span>
                      </div>
                      <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${demographics.ageDistribution.youth}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-slate-400">Usia Produktif (18-55 thn)</span>
                        <span className="text-slate-200 font-bold">{demographics.ageDistribution.productive}%</span>
                      </div>
                      <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${demographics.ageDistribution.productive}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-slate-400">Usia Lansia (56+ thn)</span>
                        <span className="text-slate-200 font-bold">{demographics.ageDistribution.elderly}%</span>
                      </div>
                      <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${demographics.ageDistribution.elderly}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Socio-Economic Status */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/40">
                    <div className="text-xs font-bold text-slate-200">{demographics.householdCount.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-400">Kepala Keluarga</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/40">
                    <div className="text-xs font-bold text-emerald-400">{demographics.employmentRate}%</div>
                    <div className="text-[9px] text-slate-400">Tingkat Bekerja</div>
                  </div>
                </div>
              </div>
            )}

            {/* Environment & Disaster Panel for Government */}
            {govActiveTab === 'environment' && environment && (
              <div className="px-3 py-3 space-y-2 border-t border-slate-800/60 mt-2">
                <div className="text-[10px] font-bold text-brand-lime uppercase tracking-wider">Daya Dukung Lingkungan & Risiko</div>
                
                {/* AQI */}
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/40 flex items-center gap-3">
                  <Wind className="w-5 h-5 flex-shrink-0" style={{ color: environment.aqiColor }} />
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] text-slate-400">Kualitas Udara (AQI)</span>
                      <span className="text-sm font-black" style={{ color: environment.aqiColor }}>{environment.aqi}</span>
                    </div>
                    <div className="text-[10px] font-medium" style={{ color: environment.aqiColor }}>{environment.aqiLabel}</div>
                    <div className="text-[9px] text-slate-500">PM2.5: {environment.pm25} µg/m³</div>
                  </div>
                </div>

                {/* Flood Risk */}
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/40 flex items-center gap-3">
                  <Droplets className="w-5 h-5 flex-shrink-0" style={{ color: environment.floodRiskColor }} />
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] text-slate-400">Mitigasi Banjir</span>
                      <span className="text-xs font-bold uppercase px-1.5 py-0.5 rounded" style={{ color: environment.floodRiskColor, backgroundColor: `${environment.floodRiskColor}15`, border: `1px solid ${environment.floodRiskColor}40` }}>
                        Risiko {environment.floodRisk}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1">{environment.floodNote}</div>
                  </div>
                </div>

                {/* RTH & Micro Climate */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/40">
                    <TreePine className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-emerald-400">{environment.greenSpacePct}%</div>
                    <div className="text-[9px] text-slate-400">Cakupan RTH</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/40">
                    <Thermometer className="w-4 h-4 text-red-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-red-400">{environment.temperature}°C</div>
                    <div className="text-[9px] text-slate-400">Suhu Permukaan</div>
                  </div>
                </div>

                {/* Provenance Badge */}
                <div className="pt-2 border-t border-slate-800/70">
                  <div className="text-[8px] text-slate-400 leading-tight">
                    <span className="text-brand-lime font-bold">Data Empiris Riil: </span>
                    {environment.provenance}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════ Business/Investor Sidebar ══════ */}
        {activePersona === 'business' && (
          <>
            <SectionHeader label="Business/Investor Views" />
            <div className="px-2 space-y-0.5">
              <NavItem icon={SlidersHorizontal} label="Filter Spasial" active={bizActiveTab === 'filter'} onClick={() => setBizActiveTab('filter')} badge={h3ScoreRange[0] > 0 || h3ScoreRange[1] < 100 || h3RingFilter < 5 || njopRange[0] > 0 || njopRange[1] < 25 ? 'Aktif' : undefined} />
              <NavItem icon={Layers} label="Lapisan Peta (Layers)" active={bizActiveTab === 'layers'} onClick={() => setBizActiveTab('layers')} />
              <NavItem icon={Map} label="Legenda (Legends)" active={bizActiveTab === 'legends'} onClick={() => setBizActiveTab('legends')} />
              <div className="my-1 border-t border-slate-800/80" />
              <NavItem icon={Store} label="Daftar Kompetitor" active={bizActiveTab === 'competitors'} onClick={() => setBizActiveTab('competitors')} />
              <NavItem icon={Landmark} label="POI Utama" active={bizActiveTab === 'poilist'} onClick={() => setBizActiveTab('poilist')} />
            </div>

            {/* General Features Rendering */}
            {bizActiveTab === 'filter' && renderFilterTab()}
            {bizActiveTab === 'layers' && renderLayersTab(true)}
            {bizActiveTab === 'legends' && renderLegendsTab()}


          </>
        )}

        {/* ══════ Commuter Sidebar ══════ */}
        {activePersona === 'commuter' && (
          <>
            <SectionHeader label="Navigation" />
            <div className="px-2 space-y-0.5">
              <NavItem icon={Layers} label="Lapisan Peta (Layers)" active={comActiveTab === 'layers'} onClick={() => setComActiveTab('layers')} />
              <NavItem icon={Map} label="Legenda (Legends)" active={comActiveTab === 'legends'} onClick={() => setComActiveTab('legends')} />
                <div className="my-1 border-t border-slate-800/80" />
              <NavItem icon={TrainIcon} label="Jadwal Transit" active={comActiveTab === 'schedules'} onClick={() => setComActiveTab('schedules')} badge={`${trainSchedules.length + busRoutes.length}`} />
              <NavItem icon={MapPin} label="Destinasi Terdekat" active={comActiveTab === 'tourist'} onClick={() => setComActiveTab('tourist')} badge={`${touristSpots.length}`} />
            </div>

            {/* General Features Rendering */}
            {comActiveTab === 'layers' && renderLayersTab(false)}
            {comActiveTab === 'legends' && renderLegendsTab()}

            {/* Consolidated Schedules */}
            {comActiveTab === 'schedules' && (
              <div className="px-3 py-3 space-y-2 border-t border-slate-800/60 mt-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Jadwal Transportasi</div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
                    {stationInfo.code}
                  </span>
                </div>

                {/* Selected Station Indicator & Quick Switcher */}
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                      <span className="truncate">{stationInfo.fullName}</span>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-800/70">
                    <div className="text-[8px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">Filter Lokasi Stasiun:</div>
                    <div className="grid grid-cols-5 gap-1">
                      {(['gubeng', 'pasar_turi', 'semut', 'wonokromo', 'waru'] as StationId[]).map((stId) => {
                        const isAct = activeStation === stId;
                        const st = STATION_NAMES[stId];
                        return (
                          <button
                            key={stId}
                            onClick={() => onSelectStation?.(stId)}
                            className={`px-1 py-1 rounded text-[9px] font-bold truncate transition-all text-center ${
                              isAct
                                ? 'bg-brand-lime text-slate-950 shadow-sm ring-1 ring-brand-lime'
                                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                            }`}
                            title={st.fullName}
                          >
                            {st.shortName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Direction Filter (Arah Tujuan) */}
                <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Arah Perjalanan Kereta</div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'all', label: 'Semua Arah' },
                      { id: 'southbound', label: 'Ke Selatan ↓' },
                      { id: 'northbound', label: 'Ke Utara ↑' },
                    ].map((dir) => (
                      <button
                        key={dir.id}
                        onClick={() => setTrainDirectionFilter(dir.id as any)}
                        className={`py-1 px-1 rounded text-[9px] font-semibold text-center transition-all ${
                          trainDirectionFilter === dir.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                            : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        {dir.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">FILTER MODA</div>
                  <Toggle active={showKRL} onToggle={() => setShowKRL(!showKRL)} label={`Kereta Commuter (${filteredTrains.length})`} />
                  <Toggle active={showBus} onToggle={() => setShowBus(!showBus)} label={`Feeder Terintegrasi (${busRoutes.length})`} />
                </div>

                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {/* Commuter Line */}
                  {showKRL && filteredTrains.map((ts, idx) => (
                    <div key={`krl-${idx}`} className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50 hover:border-brand-lime/30 transition-colors">
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="flex items-start gap-2">
                          <div className={`p-1 rounded mt-0.5 ${ts.direction === 'southbound' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                            <TrainIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-200">{ts.trainName}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/70 font-mono text-slate-300 font-bold">{ts.trainNumber}</span>
                            </div>
                            <div className="text-[9px] text-slate-400 mt-0.5">
                              {ts.isTerminus ? (
                                <span className="text-amber-300 font-semibold">Tiba di {stationInfo.shortName} (Terminus)</span>
                              ) : (
                                <>
                                  <span className="text-slate-300 font-medium">{stationInfo.shortName}</span> → <span className="text-cyan-300 font-semibold">{ts.destination}</span>
                                </>
                              )}
                            </div>
                            {ts.nextStop && !ts.isTerminus && (
                              <div className="text-[8.5px] text-slate-500 mt-0.5">
                                Stop berikutnya: <span className="text-slate-300 font-medium">{ts.nextStop}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-black text-brand-lime font-mono leading-none">{ts.departureTime}</div>
                          <div className="text-[8px] text-slate-400 mt-0.5">WIB</div>
                          <div className={`text-[8.5px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded inline-block ${
                            ts.status === 'on_time'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : ts.status === 'delayed'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-700/50 text-slate-500'
                          }`}>
                            {ts.status.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-700/40 text-[9px]">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span className="font-semibold text-slate-300">Jalur {ts.platform}</span>
                        </span>
                        <span className="text-slate-400">
                          {ts.isTerminus ? `Waktu Tiba: ${ts.arrivalTime}` : `Estimasi Tiba: ${ts.arrivalTime}`}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Suroboyo Bus & WiraWiri */}
                  {showBus && busRoutes.map((br, idx) => (
                    <div key={`bus-${idx}`} className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50 hover:border-brand-lime/30 transition-colors">
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-slate-700/40" style={{ color: br.color }}>
                            <Bus className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-200">{br.routeCode}</span>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-700/40 text-slate-300">Feeder</span>
                            </div>
                            <div className="text-[9px] text-slate-400 mt-0.5">{br.routeName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-bold text-slate-200 bg-slate-700/60 px-1.5 py-0.5 rounded font-mono">{br.estimatedTime}</div>
                        </div>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-2 pt-1.5 border-t border-slate-700/40 flex justify-between">
                        <span>{br.frequency}</span>
                        <span className="text-brand-lime font-mono">{br.fare}</span>
                      </div>
                    </div>
                  ))}

                  {(!showKRL && !showBus) && (
                    <div className="text-center py-6 text-xs text-slate-500 italic">
                      Silakan aktifkan salah satu moda transportasi di atas
                    </div>
                  )}

                  {showKRL && filteredTrains.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-500 italic">
                      Tidak ada jadwal kereta untuk filter ini di {stationInfo.shortName}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tourist Destinations */}
            {comActiveTab === 'tourist' && (
              <div className="px-3 py-3 space-y-2 border-t border-slate-800/60 mt-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Destinasi Terdekat</div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
                    {touristSpots.length} POI
                  </span>
                </div>

                {/* Selected Station Indicator & Quick Switcher */}
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                      <span className="truncate">Titik Asal: {stationInfo.fullName}</span>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-800/70">
                    <div className="text-[8px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">Filter Lokasi Stasiun:</div>
                    <div className="grid grid-cols-5 gap-1">
                      {(['gubeng', 'pasar_turi', 'semut', 'wonokromo', 'waru'] as StationId[]).map((stId) => {
                        const isAct = activeStation === stId;
                        const st = STATION_NAMES[stId];
                        return (
                          <button
                            key={stId}
                            onClick={() => onSelectStation?.(stId)}
                            className={`px-1 py-1 rounded text-[9px] font-bold truncate transition-all text-center ${
                              isAct
                                ? 'bg-brand-lime text-slate-950 shadow-sm ring-1 ring-brand-lime'
                                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                            }`}
                            title={st.fullName}
                          >
                            {st.shortName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {touristSpots.map((d) => {
                    const routeUrl = getDirectionsUrl(
                      stationInfo.lat,
                      stationInfo.lng,
                      d.lat,
                      d.lng,
                      d.walkTime.includes('Bus') ? 'transit' : 'walking'
                    );

                    return (
                      <div
                        key={d.id}
                        className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50 hover:border-brand-lime/30 transition-all group"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-10 h-10 bg-slate-800/90 rounded-lg flex items-center justify-center shrink-0 border border-slate-700 text-cyan-400 group-hover:text-brand-lime group-hover:border-brand-lime/30 transition-colors">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h5 className="text-xs font-bold text-slate-100 group-hover:text-brand-lime transition-colors leading-snug">
                                {d.name}
                              </h5>
                              <span className="text-[9px] text-amber-300 font-bold flex items-center gap-0.5 shrink-0 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" /> {d.rating}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                              {d.description}
                            </p>

                            <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-400">
                              <span className="font-semibold text-slate-300 flex items-center gap-1">
                                <Footprints className="w-3 h-3 text-cyan-400" /> {d.distanceFromStation}
                              </span>
                              <span className="text-slate-600">·</span>
                              <span className="flex items-center gap-1 text-slate-300">
                                <Clock className="w-3 h-3 text-slate-400" /> {d.walkTime}
                              </span>
                            </div>

                            {/* Hyperlink Rute Navigasi dari Stasiun Asal */}
                            <div className="mt-2 pt-1.5 border-t border-slate-700/50 flex items-center justify-between">
                              <span className="text-[8.5px] text-slate-400 truncate max-w-[130px]">
                                Dari: <span className="text-slate-300 font-medium">{stationInfo.shortName}</span>
                              </span>
                              <a
                                href={routeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-lime/15 hover:bg-brand-lime text-brand-lime hover:text-slate-950 text-[9.5px] font-bold transition-all border border-brand-lime/30 hover:border-brand-lime shadow-sm group/btn shrink-0"
                                title={`Buka rute navigasi dari ${stationInfo.fullName} ke ${d.name} di Google Maps`}
                              >
                                <Navigation className="w-3 h-3 shrink-0 group-hover/btn:rotate-45 transition-transform" />
                                <span>Petunjuk Rute</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70 group-hover/btn:opacity-100" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {touristSpots.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-500 italic">
                      Belum ada destinasi wisata terdata di sekitar {stationInfo.shortName}
                    </div>
                  )}
                </div>
              </div>
            )}


          </>
        )}
      </div>

      {/* ══════ Bottom Actions ══════ */}
      <div className="border-t border-slate-800/80 px-2 py-2 space-y-0.5">
        <NavItem icon={Video} label="Video Tutorial" onClick={onOpenVideoTutorial} />
        <NavItem icon={Settings} label="Pengaturan" onClick={onOpenSettings} />
        <NavItem icon={HelpCircle} label="Pusat Bantuan" onClick={onOpenHelp} />
        <NavItem icon={MessageSquare} label="Kirim Feedback" onClick={onOpenFeedback} />
      </div>
    </aside>
    </>
  );
};
