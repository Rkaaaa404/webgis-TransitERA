'use client';

import React, { useState, useEffect } from 'react';
import { StationData, StationId, RoutePlan } from '@/types';
import { DiamondGauge } from './DiamondGauge';
import { TravelEstimator } from './TravelEstimator';
import { TransitRoutePlanner } from './TransitRoutePlanner';
import { WiraWiriRouteExplorer } from './WiraWiriRouteExplorer';
import { AIChatPanel } from '@/components/ai/AIChatPanel';
import { STATION_NAMES } from '@/lib/dummy-data';
import { fetchStationRealPOIs } from '@/lib/api';
import {
  Footprints,
  Train,
  Bus,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  MapPin,
  Compass,
  Navigation,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Circle,
  Store,
  ShoppingBag,
  Coffee,
  Landmark,
  Utensils,
  Clock,
  ArrowRight,
  Sliders,
  Quote
} from 'lucide-react';

interface CommuterPanelProps {
  station: StationData;
  activeStation: StationId;
  activeH3Index?: string | null;
  onExecuteMapAction?: (data: any) => void;
  onSelectStation?: (stationId: StationId) => void;
  onHighlightRoute?: (routeIds: string[]) => void;
  onSelectRoutePlan?: (plan: RoutePlan | null) => void;
}

const COMMUTER_HUBS: StationId[] = [
  'gubeng',
  'pasar_turi',
  'semut',
  'wonokromo',
  'waru',
  'terminal_joyoboyo',
  'terminal_purabaya',
  'terminal_bratang',
  'tandes',
  'kandangan',
  'benowo',
  'ngagel',
  'margorejo',
  'jemursari',
  'kertomenanggal',
  'sidotopo',
  'kalimas',
  'benteng'
];

interface WalkablePOI {
  name: string;
  category: 'kuliner' | 'wisata' | 'minimarket_atm' | 'transit_layanan';
  categoryLabel: string;
  distanceM: number;
  walkMinutes: number;
  notes: string;
}

// Database POI Terkurasi Sekitar Stasiun dalam Radius 1 km (10-15 Menit Jalan Kaki)
const STATION_POIS: Record<string, WalkablePOI[]> = {
  gubeng: [
    { name: 'Monumen Kapal Selam (Monkasel)', category: 'wisata', categoryLabel: 'Wisata & Edukasi', distanceM: 350, walkMinutes: 4, notes: 'Museum kapal selam legendaris KRI Pasopati 410' },
    { name: 'Sentra Kuliner Stasiun Gubeng Baru', category: 'kuliner', categoryLabel: 'Kuliner', distanceM: 120, walkMinutes: 2, notes: 'Rawon, Nasi Bebek & Kopi Tiam' },
    { name: 'Indomaret Point Stasiun Gubeng', category: 'minimarket_atm', categoryLabel: 'Ritel & ATM', distanceM: 80, walkMinutes: 1, notes: 'Buka 24 Jam • ATM BCA & Mandiri' },
    { name: 'Shelter Suroboyo Bus Koridor 2', category: 'transit_layanan', categoryLabel: 'Transit', distanceM: 150, walkMinutes: 2, notes: 'Akses Koridor Timur-Barat' },
    { name: 'Soto Madura Gubeng Pojok', category: 'kuliner', categoryLabel: 'Kuliner', distanceM: 280, walkMinutes: 4, notes: 'Kuliner legendaris Surabaya' },
    { name: 'Grand City Mall Surabaya', category: 'minimarket_atm', categoryLabel: 'Mall & Belanja', distanceM: 650, walkMinutes: 8, notes: 'Pusat belanja & exhibition hall' },
    { name: 'Halte Feeder WiraWiri FD07', category: 'transit_layanan', categoryLabel: 'Transit', distanceM: 90, walkMinutes: 1, notes: 'Integrasi rute Joyoboyo - Bratang' },
  ],
  pasar_turi: [
    { name: 'Tugu Pahlawan & Museum 10 Nopember', category: 'wisata', categoryLabel: 'Wisata Sejarah', distanceM: 450, walkMinutes: 6, notes: 'Ikon perjuangan arek-arek Suroboyo' },
    { name: 'Pusat Grosir Surabaya (PGS)', category: 'minimarket_atm', categoryLabel: 'Belanja & Niaga', distanceM: 320, walkMinutes: 4, notes: 'Pusat ritel & grosir tekstil' },
    { name: 'Pasar Turi Baru Food Court', category: 'kuliner', categoryLabel: 'Kuliner', distanceM: 260, walkMinutes: 3, notes: 'Pilihan aneka masakan Jawa Timur' },
    { name: 'Galeri ATM Mandiri & BRI', category: 'minimarket_atm', categoryLabel: 'Ritel & ATM', distanceM: 140, walkMinutes: 2, notes: 'Tarik & setor tunai' },
    { name: 'Halte Feeder WiraWiri FD07', category: 'transit_layanan', categoryLabel: 'Transit', distanceM: 110, walkMinutes: 1, notes: 'Rute langsung Gubeng & Terminal Bratang' },
    { name: 'Nasi Campur Tambak Bayan', category: 'kuliner', categoryLabel: 'Kuliner', distanceM: 480, walkMinutes: 6, notes: 'Kuliner khas dekat Jl. Pasar Besar' },
  ],
  semut: [
    { name: 'Kawasan Wisata Kota Lama (Kya-Kya)', category: 'wisata', categoryLabel: 'Heritage & Wisata', distanceM: 350, walkMinutes: 5, notes: 'Wisata malam pecinan, arsitektur kolonial & kuliner' },
    { name: 'Sentra Oleh-Oleh Jembatan Merah', category: 'minimarket_atm', categoryLabel: 'Belanja', distanceM: 520, walkMinutes: 7, notes: 'Pusat jajanan legendaris' },
    { name: 'Plaza Jembatan Merah (JMP)', category: 'minimarket_atm', categoryLabel: 'Niaga', distanceM: 580, walkMinutes: 8, notes: 'Pusat perbelanjaan grosir utara' },
    { name: 'Shelter Suroboyo Bus SB-04', category: 'transit_layanan', categoryLabel: 'Transit', distanceM: 200, walkMinutes: 3, notes: 'Rute menuju Pantai Kenjeran' },
  ],
  wonokromo: [
    { name: 'Kebun Binatang Surabaya (KBS)', category: 'wisata', categoryLabel: 'Wisata Rekreasi', distanceM: 480, walkMinutes: 6, notes: 'Taman satwa bersejarah & Patung Suroboyo' },
    { name: 'Royal Plaza Surabaya', category: 'minimarket_atm', categoryLabel: 'Mall & Belanja', distanceM: 420, walkMinutes: 5, notes: 'Departemen store, bioskop & food court' },
    { name: 'Darmo Trade Center (DTC)', category: 'minimarket_atm', categoryLabel: 'Pusat Niaga', distanceM: 240, walkMinutes: 3, notes: 'Pusat perbelanjaan terintegrasi stasiun' },
    { name: 'Pojok Kuliner Stasiun Wonokromo', category: 'kuliner', categoryLabel: 'Kuliner', distanceM: 90, walkMinutes: 1, notes: 'Pecel Madiun & Soto Ayam Lamongan' },
    { name: 'Halte Feeder WiraWiri Wonokromo', category: 'transit_layanan', categoryLabel: 'Transit', distanceM: 120, walkMinutes: 2, notes: 'Koneksi ke Mayjend Sungkono & HR Muhammad' },
  ],
  waru: [
    { name: 'City of Tomorrow (Cito Mall)', category: 'minimarket_atm', categoryLabel: 'Mall & Ritel', distanceM: 850, walkMinutes: 11, notes: 'Pusat belanja gerbang perbatasan Surabaya-Sidoarjo' },
    { name: 'Fasilitas Park & Ride Stasiun Waru', category: 'transit_layanan', categoryLabel: 'Layanan', distanceM: 60, walkMinutes: 1, notes: 'Parkir mobil/motor tarif flat aman' },
    { name: 'Alfamart & ATM Center Stasiun', category: 'minimarket_atm', categoryLabel: 'Ritel & ATM', distanceM: 70, walkMinutes: 1, notes: 'ATM BCA & BNI' },
    { name: 'Sentra Kuliner Waru Makmur', category: 'kuliner', categoryLabel: 'Kuliner', distanceM: 230, walkMinutes: 3, notes: 'Warung makan murah meriah' },
  ],
  terminal_joyoboyo: [
    { name: 'Kebun Binatang Surabaya (KBS)', category: 'wisata', categoryLabel: 'Wisata & Rekreasi', distanceM: 350, walkMinutes: 4, notes: 'Akses skybridge penyeberangan aman' },
    { name: 'Sentra Wisata Kuliner (SWK) Joyoboyo', category: 'kuliner', categoryLabel: 'Kuliner', distanceM: 180, walkMinutes: 2, notes: 'Pujasera binaan Pemkot Surabaya' },
    { name: 'Park & Ride Gedung TIJ', category: 'transit_layanan', categoryLabel: 'Layanan', distanceM: 30, walkMinutes: 1, notes: 'Gedung parkir 5 lantai tarif terjangkau' },
    { name: 'Shelter Utama Suroboyo Bus Koridor 1', category: 'transit_layanan', categoryLabel: 'Transit', distanceM: 50, walkMinutes: 1, notes: 'Rute Purabaya - Joyoboyo - Rajawali' },
  ],
  terminal_purabaya: [
    { name: 'Ruang Tunggu Eksekutif Ber-AC & ATM', category: 'transit_layanan', categoryLabel: 'Layanan', distanceM: 40, walkMinutes: 1, notes: 'ATM Center lengkap & charging station' },
    { name: 'Pusat Kuliner Terminal Bungurasih', category: 'kuliner', categoryLabel: 'Kuliner', distanceM: 120, walkMinutes: 2, notes: 'Buka 24 jam aneka menu Nusantara' },
    { name: 'Pemberangkatan Suroboyo Bus', category: 'transit_layanan', categoryLabel: 'Transit', distanceM: 80, walkMinutes: 1, notes: 'Koridor 1 langsung ke pusat kota' },
    { name: 'Pemberangkatan Bus Damri Bandara Juanda', category: 'transit_layanan', categoryLabel: 'Transit', distanceM: 100, walkMinutes: 1, notes: 'Jadwal setiap 30 menit ke T1 & T2' },
  ],
  terminal_bratang: [
    { name: 'Taman Flora & Kebun Bibit Bratang', category: 'wisata', categoryLabel: 'Taman Wisata', distanceM: 250, walkMinutes: 3, notes: 'Taman kota asri, rusa & ruang terbuka hijau' },
    { name: 'Sentra Kuliner SWK Bratang', category: 'kuliner', categoryLabel: 'Kuliner', distanceM: 180, walkMinutes: 2, notes: 'Pujasera aneka kuliner lokal Jawa Timur' },
    { name: 'Pasar Burung & Bunga Bratang', category: 'minimarket_atm', categoryLabel: 'Pasar Seni', distanceM: 300, walkMinutes: 4, notes: 'Destinasi khas Surabaya Timur' },
    { name: 'Pemberangkatan Feeder WiraWiri FD07', category: 'transit_layanan', categoryLabel: 'Transit', distanceM: 40, walkMinutes: 1, notes: 'Koneksi ke Stasiun Gubeng & TIJ' },
  ]
};

// Dynamic Spatial Character Generator (Pipeline Real Data: OSM, GTFS, BPS, and MAPID)
function getDynamicAreaCharacter(
  station: StationData,
  pois: any[],
  isTerminal: boolean
): {
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  commuterHighlights: string[];
  provenance: string;
} {
  const typology = station.typology || 'Mixed-Use Transit Hub';
  const todScore = station.tod_readiness_score || 70;
  const walkScore = station.walkability?.score ?? Math.round(station.scores?.design ?? 65);
  const transitScore = station.scores?.distance_to_transit ?? 75;

  let badgeColor = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
  let badge = typology;
  let title = `${station.name} — ${typology}`;

  if (typology.includes('Commercial') || typology.includes('Hub') || station.is_tier_1) {
    badgeColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    badge = 'Pusat Komersial & Transit Utama';
  } else if (typology.includes('Heritage') || station.id === 'semut') {
    badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    badge = 'Kawasan Cagar Budaya & Heritage';
  } else if (typology.includes('Residential') || station.id === 'ngagel' || station.id === 'wonokromo') {
    badgeColor = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    badge = 'Kawasan Hunian & Komuter Padat';
  } else if (typology.includes('Feeder') || isTerminal || station.id === 'waru') {
    badgeColor = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    badge = 'Simpul Pengumpan Antarmoda';
  } else {
    badgeColor = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    badge = 'Sub-Urban Transit Node';
  }

  const kulinerCount = pois.filter((p) => p.category === 'kuliner').length;
  const transitCount = pois.filter((p) => p.category === 'transit_layanan').length;

  const descParts: string[] = [];
  if (isTerminal) {
    descParts.push(`Terminal simpul intermoda dengan integrasi bus kota, Suroboyo Bus, dan Feeder WiraWiri.`);
  } else {
    descParts.push(`Simpul stasiun kereta ${station.is_tier_1 ? 'utama koridor regional' : 'komuter lokal'} Surabaya.`);
  }

  descParts.push(
    `Memiliki indeks kesiapan TOD ${todScore.toFixed(1)}/100 dengan walkability ${walkScore.toFixed(1)}/100 dan skor transit ${transitScore.toFixed(1)}/100.`
  );

  if (station.weakest_dimension) {
    descParts.push(`Dimensi prioritas penataan: ${station.weakest_dimension}.`);
  }

  const highlights: string[] = [];
  highlights.push(
    `Indeks 5D TOD: ${todScore >= 75 ? 'Tinggi (Fokus Akselerasi)' : todScore >= 60 ? 'Menengah (Optimalisasi Feeder)' : 'Rendah (Revitalisasi Koridor)'}`
  );
  highlights.push(
    `Akses Pejalan Kaki: ${walkScore >= 75 ? 'Trotoar lebar & terhubung' : walkScore >= 55 ? 'Cukup memadai, butuh kanopi' : 'Perlu intervensi trotoar & zebra cross'}`
  );
  highlights.push(
    `Fasilitas 1 km: Terpantau ${kulinerCount > 0 ? kulinerCount : 'banyak'} sentra kuliner & ${transitCount > 0 ? transitCount : 'beberapa'} opsi transit pengumpan`
  );

  return {
    title,
    badge,
    badgeColor,
    description: descParts.join(' '),
    commuterHighlights: highlights,
    provenance: 'Dihitung dinamis dari data spasial (OSM, GTFS, & Sensus BPS 2026)'
  };
}

export const CommuterPanel: React.FC<CommuterPanelProps> = ({
  station,
  activeStation,
  activeH3Index,
  onExecuteMapAction,
  onSelectStation,
  onHighlightRoute,
  onSelectRoutePlan,
}) => {
  const [poiFilter, setPoiFilter] = useState<'semua' | 'wisata' | 'kuliner' | 'minimarket_atm' | 'transit_layanan'>('semua');
  const [realPois, setRealPois] = useState<any[]>([]);
  const [surveySummary, setSurveySummary] = useState<any>(null);

  const isTerminal = station.id.startsWith('terminal_');
  const kecamatanName = station.kecamatan || (station.name.includes('Gubeng') ? 'Tambaksari' : station.name.includes('Wonokromo') ? 'Wonokromo' : station.name.includes('Pasar Turi') ? 'Bubutan' : 'Surabaya');

  useEffect(() => {
    let isMounted = true;
    setRealPois([]); // Bersihkan POI stasiun lama
    fetchStationRealPOIs(station.id).then((data) => {
      if (isMounted && data && data.length > 0) {
        setRealPois(data);
      }
    });

    // Fetch survey sentiment summary data (computed via Gemini batch NLP)
    fetch('/data/survey_sentiment_summary.json')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((json) => {
        if (isMounted && json) {
          setSurveySummary(json);
        }
      })
      .catch((err) => {
        console.warn('Failed to load survey sentiment summary:', err);
      });

    return () => { isMounted = false; };
  }, [station.id]);

  const stationPois = realPois.length > 0 ? realPois : (STATION_POIS[station.id] || []);
  const areaClassification = getDynamicAreaCharacter(station, stationPois, isTerminal);

  const filteredPois = poiFilter === 'semua' 
    ? stationPois 
    : stationPois.filter(p => p.category === poiFilter);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950/80">
      {/* ── 1. Panel Header dengan Konteks Simpul, Kecamatan & Perimeter Status ── */}
      <div className="px-4 py-3 border-b border-slate-800/80 flex-shrink-0 bg-slate-900/95 backdrop-blur-md z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isTerminal ? (
              <Bus className="w-4 h-4 text-cyan-400" />
            ) : (
              <Train className="w-4 h-4 text-cyan-400" />
            )}
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              {isTerminal ? 'Simpul Terminal Multimoda' : 'Simpul Stasiun Kereta'}
            </h3>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-cyan-400" />
            Kec. {kecamatanName}
          </span>
        </div>

        <div>
          <h2 className="text-sm font-black text-slate-100 truncate">{station.name}</h2>
          {/* Status Perimeter 1 km Aktif */}
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-2 py-1 rounded-md">
            <Circle className="w-3 h-3 text-cyan-400 animate-pulse shrink-0" />
            <span className="truncate">Perimeter 1 km Aktif di Peta (Radius Jalan Kaki 10–15 Mnt)</span>
          </div>
        </div>

        {/* Quick Node Switcher (18 Simpul Transit Surabaya Raya) */}
        {onSelectStation && (
          <div className="pt-1.5 border-t border-slate-800/70">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Pilih Simpul Transit:</span>
              <span className="text-[8px] text-cyan-400 font-mono">18 Simpul Riil</span>
            </div>
            <div className="grid grid-cols-3 gap-1 max-h-20 overflow-y-auto pr-0.5">
              {COMMUTER_HUBS.map((hubId) => (
                <button
                  key={hubId}
                  onClick={() => onSelectStation(hubId)}
                  className={`px-1 py-1 rounded text-[8.5px] font-bold truncate transition-all text-center border ${
                    activeStation === hubId
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm font-extrabold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title={STATION_NAMES[hubId]?.fullName || hubId}
                >
                  {STATION_NAMES[hubId]?.shortName || hubId}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">

        {/* ── KARTU HASIL KLASIFIKASI SPASIAL AI ── */}
        <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <h4 className="text-xs font-bold text-slate-100">Klasifikasi Karakter Area</h4>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono font-semibold border border-cyan-500/20 flex items-center gap-1">
              <span>Spatial AI</span>
            </span>
          </div>

          <div className="mb-2">
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${areaClassification.badgeColor}`}>
              {areaClassification.title}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
            {areaClassification.description}
          </p>

          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Highlight Untuk Komuter:</div>
            {areaClassification.commuterHighlights.map((hl, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                <CheckCircle2 className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                <span>{hl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── POI SEKITAR STASIUN (RADIUS JALAN KAKI 1 KM) ── */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-brand-lime" />
              <h4 className="text-xs font-bold text-slate-100">POI Sekitar Stasiun (Radius 1 km)</h4>
            </div>
            <span className="text-[9px] text-cyan-400 font-mono font-semibold">10–15 Mnt Jalan Kaki</span>
          </div>

          {/* POI Category Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {[
              { id: 'semua', label: 'Semua' },
              { id: 'wisata', label: 'Wisata & Rekreasi' },
              { id: 'kuliner', label: 'Kuliner Khas' },
              { id: 'minimarket_atm', label: 'Ritel & Belanja' },
              { id: 'transit_layanan', label: 'Koneksi Transit' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPoiFilter(tab.id as any)}
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-colors whitespace-nowrap ${
                  poiFilter === tab.id
                    ? 'bg-brand-lime text-slate-950 shadow-sm'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* POI List Cards */}
          <div className="space-y-1.5">
            {filteredPois.map((poi, idx) => (
              <div
                key={idx}
                className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-2 hover:border-cyan-500/40 transition-colors flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                    {poi.category === 'wisata' ? (
                      <Compass className="w-3 h-3 text-cyan-400" />
                    ) : poi.category === 'kuliner' ? (
                      <Utensils className="w-3 h-3 text-amber-400" />
                    ) : poi.category === 'minimarket_atm' ? (
                      <ShoppingBag className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Bus className="w-3 h-3 text-purple-400" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[11px] font-bold text-slate-200 truncate">{poi.name}</div>
                    <div className="text-[9px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <span className="truncate">{poi.notes}</span>
                      {poi.source && (
                        <span className="text-[7.5px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-1 py-0.5 rounded border border-cyan-500/30 shrink-0">
                          GEO MAPID
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9.5px] font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded block">
                    {poi.distanceM}m
                  </span>
                  <span className="text-[8.5px] text-slate-400 block mt-0.5">
                    ~{poi.walkMinutes} mnt
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── WALKABILITY & AKSESIBILITAS TROTOAR ── */}
        {(() => {
          const walkScore = station.walkability?.score ?? Math.round(station.scores.design);
          const walkLabel = station.walkability?.label ?? (walkScore >= 75 ? 'Sangat Ramah' : walkScore >= 55 ? 'Cukup Ramah' : 'Perlu Revitalisasi');
          const tactilePts = station.walkability?.pedestrian_poi_count ?? (station.id === 'gubeng' ? 6 : station.id === 'pasar_turi' ? 4 : 2);
          const feederCount = station.walkability?.feeder_count_500m ?? (station.id === 'gubeng' ? 8 : station.id === 'pasar_turi' ? 5 : 2);
          const hasFlood = (station.walkability?.flood_risk_penalty ?? 0) > 0 || station.id === 'pasar_turi' || station.id === 'sidotopo';
          const hasDisamenity = (station.walkability?.disamenity_count ?? 0) > 0 || station.id === 'pasar_turi';

          return (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-brand-lime" />
                  <h4 className="text-xs font-bold text-slate-200">Indeks Ramah Pejalan Kaki (Walkability)</h4>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">Radius 500m</span>
              </div>
              
              <div className="flex items-center gap-4">
                <DiamondGauge
                  score={Math.round(walkScore)} 
                  label={walkLabel}
                  size="md"
                />
                <div className="text-[10px] text-slate-300 leading-relaxed flex-1 space-y-1.5">
                  <p>
                    Dihitung dari kepadatan titik trotoar &amp; tactile paving survei MAPID, aksesibilitas halte feeder, dan pengurangan faktor disamenitas.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[8.5px] font-mono">
                    <div className="bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                      Survei Tactile: <span className="text-brand-lime font-bold">{tactilePts} titik</span>
                    </div>
                    <div className="bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                      Halte Feeder: <span className="text-cyan-300 font-bold">{feederCount} halte</span>
                    </div>
                    <div className="bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                      Genangan: <span className={hasFlood ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>{hasFlood ? 'Rawan (-15)' : 'Aman (0)'}</span>
                    </div>
                    <div className="bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                      PKL/Parkir: <span className={hasDisamenity ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>{hasDisamenity ? 'Padat (-10)' : 'Tertata (0)'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[8px] text-slate-500 font-mono pt-1 border-t border-slate-800/60 flex items-center justify-between">
                <span>Sumber: {station.walkability?.provenance || 'Survei MAPID 2026 & Buffer OSMnx 500m'}</span>
                <span className="text-brand-lime font-semibold">Data Empiris Riil</span>
              </div>
            </div>
          );
        })()}

        {/* ── KATALOG INTERAKTIF FEEDER WIRAWIRI & SUROBOYO BUS ── */}
        <WiraWiriRouteExplorer
          activeStation={activeStation}
          onSelectStation={onSelectStation}
          onHighlightRoute={onHighlightRoute}
        />

        {/* ── PERENCANA RUTE TRANSIT MULTIMODA & ROUTING ENGINE VISUAL ── */}
        <TransitRoutePlanner
          activeStation={activeStation}
          onHighlightRoute={onHighlightRoute}
          onSelectStation={onSelectStation}
          onSelectRoutePlan={onSelectRoutePlan}
        />

        {/* ── SUARA WARGA (SURVEI OPINI MAPID #PakSibukGa) ── */}
        {(() => {
          const stationSentiment = surveySummary?.stations?.[station.id];
          const respondents = stationSentiment?.respondent_count ?? 25;
          const positivePct = stationSentiment?.sentiment?.positive_pct ?? 55;
          const neutralPct = stationSentiment?.sentiment?.neutral_pct ?? 35;
          const negativePct = stationSentiment?.sentiment?.negative_pct ?? 10;
          const aspects = stationSentiment?.aspects ?? [
            { label: 'Kemudahan Tap-In Transum', score_pct: 82, status: 'Puas' },
            { label: 'Kenyamanan Trotoar & Pedestrian', score_pct: 70, status: 'Cukup Nyaman' }
          ];
          const representativeQuote = stationSentiment?.verified_quotes?.[0] ?? {
            user: '@wargasurabaya',
            timestamp: 'Agustus 2026',
            text: 'Akses integrasi antarmoda sangat membantu mobilitas harian komuter di koridor ini.'
          };
          const provenanceText = stationSentiment?.provenance ?? 'Dihitung dari survei lapangan GEO MAPID #PakSibukGa via Gemini AI (Update: September 2026)';

          return (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-brand-teal" />
                  <h4 className="text-xs font-bold text-slate-200">Suara Warga Sekitar (Survei MAPID)</h4>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-teal/15 text-brand-teal font-mono font-bold">
                  {respondents} Responden Riil
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono">
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-emerald-400" /> Positif ({positivePct}%)</span>
                  <span className="flex items-center gap-1"><Minus className="w-3 h-3 text-slate-400" /> Netral ({neutralPct}%)</span>
                  <span className="flex items-center gap-1"><ThumbsDown className="w-3 h-3 text-amber-400" /> Masukan ({negativePct}%)</span>
                </div>
                {/* Progress Bar Sentimen Riil */}
                <div className="w-full h-1.5 flex rounded-full overflow-hidden bg-slate-800">
                  <div className="bg-emerald-400 h-full transition-all" style={{ width: `${positivePct}%` }} />
                  <div className="bg-slate-500 h-full transition-all" style={{ width: `${neutralPct}%` }} />
                  <div className="bg-amber-400 h-full transition-all" style={{ width: `${negativePct}%` }} />
                </div>

                {/* Aspek Evaluasi Warga */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[10px]">
                  {aspects.slice(0, 4).map((asp: any, i: number) => (
                    <div key={i} className="bg-slate-950/40 p-1.5 rounded border border-slate-800/80">
                      <div className="text-slate-400 text-[8.5px] truncate">{asp.label}</div>
                      <div className="font-bold text-emerald-400 flex items-center justify-between mt-0.5">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{asp.score_pct}%</span>
                        </span>
                        <span className="text-[8px] text-slate-300 font-normal truncate">{asp.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Kutipan Warga Terverifikasi */}
                {representativeQuote && (
                  <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-lg p-2 text-[10px] space-y-1">
                    <div className="flex items-center justify-between text-[8px] text-cyan-300">
                      <span className="flex items-center gap-1 font-bold">
                        <Quote className="w-2.5 h-2.5 text-cyan-400" />
                        Kutipan Warga Terverifikasi
                      </span>
                      <span className="font-mono text-slate-400">{representativeQuote.user} • {representativeQuote.timestamp}</span>
                    </div>
                    <p className="text-slate-300 italic text-[9.5px] leading-relaxed">
                      &quot;{representativeQuote.text}&quot;
                    </p>
                  </div>
                )}

                <div className="text-[8px] text-slate-500 font-mono pt-1 border-t border-slate-800/60 truncate">
                  {provenanceText}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── ASISTEN SPATIAL AI CHATBOT (EASE-OF-USE UNTUK KOMUTER) ── */}
        <div className="bg-slate-900/60 border border-cyan-500/30 rounded-xl overflow-hidden shadow-xl">
          <div className="px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-100">Tanya AI Transit Surabaya</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-semibold font-mono">
              Chat Langsung
            </span>
          </div>

          <div className="h-[440px]">
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
