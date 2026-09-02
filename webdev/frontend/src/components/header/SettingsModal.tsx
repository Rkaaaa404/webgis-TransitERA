'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { PersonaType } from '@/lib/persona';
import {
  Settings, Map, Eye, Building2, Briefcase, Train,
  Footprints, Bus, Globe, Sliders, CheckCircle2, ChevronRight,
} from 'lucide-react';

interface AppSettings {
  // Global
  basemap: 'dark' | 'street' | 'satellite';
  units: 'metric' | 'imperial';
  language: 'id' | 'en';
  h3Resolution: 8 | 9;
  showPopupOnHover: boolean;
  animateTransitions: boolean;
  highContrast: boolean;
  // Government
  todThreshold: number;
  ahpWeightMode: 'default' | 'custom' | 'equal';
  exportFormat: 'geojson' | 'shapefile' | 'csv';
  analysisMode: 'hexagon' | 'kelurahan' | 'kecamatan';
  // Business
  investRadius: 500 | 1000 | 2000;
  njopDisplay: 'per_m2' | 'per_unit';
  roiPeriod: 5 | 10 | 15;
  showPremiumZone: boolean;
  // Commuter
  preferredStation: string;
  travelMode: 'krl' | 'bus' | 'walk';
  showFeederRoutes: boolean;
  commuteReminder: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  basemap: 'dark', units: 'metric', language: 'id', h3Resolution: 8,
  showPopupOnHover: true, animateTransitions: true, highContrast: false,
  todThreshold: 60, ahpWeightMode: 'default', exportFormat: 'geojson',
  analysisMode: 'hexagon',
  investRadius: 1000, njopDisplay: 'per_m2', roiPeriod: 10, showPremiumZone: true,
  preferredStation: 'gubeng', travelMode: 'krl', showFeederRoutes: true,
  commuteReminder: false,
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona?: PersonaType;
}

function SettingSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-slate-800/80 last:border-b-0">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-brand-lime/80">{icon}</span>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function OptionGroup<T extends string | number>({
  label, options, value, onChange,
}: { label: string; options: { value: T; label: React.ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1.5">{label}</p>
      <div className="flex gap-1.5 flex-wrap">
        {options.map((opt) => (
          <button key={String(opt.value)} onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              value === opt.value
                ? 'bg-brand-lime/20 border border-brand-lime/50 text-brand-lime'
                : 'bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}>{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, description, value, onChange }: {
  label: string; description?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs text-slate-300 font-medium">{label}</p>
        {description && <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{description}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors ${value ? 'bg-brand-teal' : 'bg-slate-700'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function SliderRow({ label, value, min, max, step = 1, onChange, format = (v: number) => String(v) }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs text-slate-400">{label}</p>
        <span className="text-xs font-bold text-brand-lime tabular-nums">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-700 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-lime cursor-pointer accent-brand-lime" />
    </div>
  );
}

const PERSONA_LABELS: Record<PersonaType, { label: string; icon: React.ReactNode; color: string }> = {
  government: { label: 'Government', icon: <Building2 className="w-3.5 h-3.5" />, color: 'text-blue-400' },
  business: { label: 'Business', icon: <Briefcase className="w-3.5 h-3.5" />, color: 'text-purple-400' },
  commuter: { label: 'Commuter', icon: <Train className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
};

export function SettingsModal({ isOpen, onClose, activePersona = 'government' }: SettingsModalProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('transitera_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  const personaInfo = PERSONA_LABELS[activePersona];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pengaturan" maxWidth="md"
      subtitle={`Konfigurasi platform TransitERA — mode ${personaInfo.label}`}
      icon={<Settings className="w-4 h-4" />}>

      {/* Persona Badge */}
      <div className="px-5 pt-4 pb-0">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
          activePersona === 'government' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
          activePersona === 'business'   ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                                          'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {personaInfo.icon}
          Preferensi {personaInfo.label} Aktif
        </div>
      </div>

      {/* ── GLOBAL SETTINGS ── */}
      <SettingSection title="Basemap" icon={<Map className="w-3.5 h-3.5" />}>
        <OptionGroup label="Gaya Peta Dasar"
          options={[{ value: 'dark', label: 'Dark' }, { value: 'street', label: 'Street' }, { value: 'satellite', label: 'Satellite' }]}
          value={settings.basemap} onChange={(v) => update('basemap', v as AppSettings['basemap'])} />
        <OptionGroup label="Resolusi H3 Grid"
          options={[{ value: 8, label: 'Res 8 – Regional' }, { value: 9, label: 'Res 9 – Detail' }]}
          value={settings.h3Resolution} onChange={(v) => update('h3Resolution', v as 8 | 9)} />
      </SettingSection>

      <SettingSection title="Tampilan" icon={<Eye className="w-3.5 h-3.5" />}>
        <Toggle label="Popup saat Hover" description="Info hexagon muncul saat hover"
          value={settings.showPopupOnHover} onChange={(v) => update('showPopupOnHover', v)} />
        <Toggle label="Animasi Transisi" description="Efek saat berpindah layer"
          value={settings.animateTransitions} onChange={(v) => update('animateTransitions', v)} />
        <Toggle label="High Contrast Mode" description="Kontras warna untuk aksesibilitas"
          value={settings.highContrast} onChange={(v) => update('highContrast', v)} />
      </SettingSection>

      {/* ── GOVERNMENT SETTINGS ── */}
      {activePersona === 'government' && (
        <SettingSection title="Pengaturan Government" icon={<Building2 className="w-3.5 h-3.5" />}>
          <SliderRow label="Ambang Skor TOD Minimum" value={settings.todThreshold}
            min={0} max={100} step={5} onChange={(v) => update('todThreshold', v)}
            format={(v) => `${v} / 100`} />
          <OptionGroup label="Mode Bobot AHP"
            options={[{ value: 'default', label: 'Standard Expert' }, { value: 'custom', label: 'Kustom' }, { value: 'equal', label: 'Equal Weight' }]}
            value={settings.ahpWeightMode} onChange={(v) => update('ahpWeightMode', v as AppSettings['ahpWeightMode'])} />
          <OptionGroup label="Unit Analisis Spasial"
            options={[{ value: 'hexagon', label: 'H3 Hexagon' }, { value: 'kelurahan', label: 'Kelurahan' }, { value: 'kecamatan', label: 'Kecamatan' }]}
            value={settings.analysisMode} onChange={(v) => update('analysisMode', v as AppSettings['analysisMode'])} />
          <OptionGroup label="Format Ekspor Data"
            options={[{ value: 'geojson', label: 'GeoJSON' }, { value: 'shapefile', label: 'Shapefile' }, { value: 'csv', label: 'CSV' }]}
            value={settings.exportFormat} onChange={(v) => update('exportFormat', v as AppSettings['exportFormat'])} />
        </SettingSection>
      )}

      {/* ── BUSINESS SETTINGS ── */}
      {activePersona === 'business' && (
        <SettingSection title="Pengaturan Business" icon={<Briefcase className="w-3.5 h-3.5" />}>
          <OptionGroup label="Radius Analisis Investasi"
            options={[{ value: 500, label: '500 m' }, { value: 1000, label: '1 km' }, { value: 2000, label: '2 km' }]}
            value={settings.investRadius} onChange={(v) => update('investRadius', v as 500 | 1000 | 2000)} />
          <OptionGroup label="Tampilan Nilai NJOP"
            options={[{ value: 'per_m2', label: 'per m²' }, { value: 'per_unit', label: 'per Unit' }]}
            value={settings.njopDisplay} onChange={(v) => update('njopDisplay', v as AppSettings['njopDisplay'])} />
          <OptionGroup label="Periode Kalkulasi ROI"
            options={[{ value: 5, label: '5 Tahun' }, { value: 10, label: '10 Tahun' }, { value: 15, label: '15 Tahun' }]}
            value={settings.roiPeriod} onChange={(v) => update('roiPeriod', v as 5 | 10 | 15)} />
          <Toggle label="Tampilkan Zona Premium"
            description="Sorot kawasan dengan %ΔNJOP tertinggi di peta"
            value={settings.showPremiumZone} onChange={(v) => update('showPremiumZone', v)} />
        </SettingSection>
      )}

      {/* ── COMMUTER SETTINGS ── */}
      {activePersona === 'commuter' && (
        <SettingSection title="Pengaturan Commuter" icon={<Train className="w-3.5 h-3.5" />}>
          <OptionGroup label="Mode Transportasi Default"
            options={[
              { value: 'krl', label: <div className="flex items-center gap-1.5"><Train className="w-3.5 h-3.5" /><span>KRL SRRL</span></div> },
              { value: 'bus', label: <div className="flex items-center gap-1.5"><Bus className="w-3.5 h-3.5" /><span>Suroboyo Bus</span></div> },
              { value: 'walk', label: <div className="flex items-center gap-1.5"><Footprints className="w-3.5 h-3.5" /><span>Jalan Kaki</span></div> }
            ]}
            value={settings.travelMode} onChange={(v) => update('travelMode', v as AppSettings['travelMode'])} />
          <Toggle label="Tampilkan Rute Feeder"
            description="Overlay rute Suroboyo Bus di peta"
            value={settings.showFeederRoutes} onChange={(v) => update('showFeederRoutes', v)} />
          <Toggle label="Pengingat Jadwal Commute"
            description="Notifikasi 15 menit sebelum keberangkatan"
            value={settings.commuteReminder} onChange={(v) => update('commuteReminder', v)} />
        </SettingSection>
      )}

      {/* ── UNIT & LANGUAGE ── */}
      <SettingSection title="Unit & Bahasa" icon={<Globe className="w-3.5 h-3.5" />}>
        <OptionGroup label="Sistem Satuan"
          options={[{ value: 'metric', label: 'Metrik (m/km)' }, { value: 'imperial', label: 'Imperial (ft/mi)' }]}
          value={settings.units} onChange={(v) => update('units', v as AppSettings['units'])} />
        <OptionGroup label="Bahasa Antarmuka"
          options={[{ value: 'id', label: 'Bahasa Indonesia' }, { value: 'en', label: 'English' }]}
          value={settings.language} onChange={(v) => update('language', v as AppSettings['language'])} />
      </SettingSection>

      {/* ── SYSTEM INFO ── */}
      <SettingSection title="Info Sistem" icon={<Sliders className="w-3.5 h-3.5" />}>
        {[
          ['Versi Platform', 'TransitERA v1.0.0-beta'],
          ['Data Engine', 'H3 Res 8/9 + PostGIS'],
          ['AI Engine', 'Gemini 2.0 Flash'],
          ['Basemap', 'MAPID Maps API'],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-xs text-slate-500 py-1 px-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
            <span>{k}</span><span className="text-slate-400">{v}</span>
          </div>
        ))}
      </SettingSection>

      {/* Footer */}
      <div className="px-5 py-4 flex items-center justify-between gap-3 border-t border-slate-800">
        <button onClick={() => { setSettings(DEFAULT_SETTINGS); setSaved(false); }}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          Reset ke Default
        </button>
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            saved
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
              : 'bg-brand-lime hover:bg-[#8CE0C4] text-white shadow-lg shadow-brand-lime/20'
          }`}>
          {saved ? <><CheckCircle2 className="w-3.5 h-3.5" />Tersimpan!</> : <>Simpan Pengaturan<ChevronRight className="w-3.5 h-3.5" /></>}
        </button>
      </div>
    </Modal>
  );
}
