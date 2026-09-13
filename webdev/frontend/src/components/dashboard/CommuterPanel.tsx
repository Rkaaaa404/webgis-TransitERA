'use client';

import React, { useState, useEffect } from 'react';
import { StationData, StationId } from '@/types';
import { DiamondGauge } from './DiamondGauge';
import { TravelEstimator } from './TravelEstimator';
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
  ArrowRight
} from 'lucide-react';

interface CommuterPanelProps {
  station: StationData;
  activeStation: StationId;
  activeH3Index?: string | null;
  onExecuteMapAction?: (data: any) => void;
  onSelectStation?: (stationId: StationId) => void;
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
  category: 'kuliner' | 'minimarket_atm' | 'transit_layanan';
  categoryLabel: string;
  distanceM: number;
  walkMinutes: number;
  notes: string;
}

// Database POI Terkurasi Sekitar Stasiun dalam Radius 1 km (10-15 Menit Jalan Kaki)
const STATION_POIS: Record<string, WalkablePOI[]> = {
  gubeng: [
    { name: 'Sentra Kuliner Stasiun Gubeng Baru', category: 'kuliner', categoryLabel: 'Kuliner', distanceM: 120, walkMinutes: 2, notes: 'Rawon, Nasi Bebek & Kopi Tiam' },
    { name: 'Indomaret Point Stasiun Gubeng', category: 'minimarket_atm', categoryLabel: 'Ritel & ATM', distanceM: 80, walkMinutes: 1, notes: 'Buka 24 Jam • ATM BCA & Mandiri' },
    { name: 'Shelter Suroboyo Bus Koridor 2', category: 'transit_layanan', categoryLabel: 'Transit', distanceM: 150, walkMinutes: 2, notes: 'Akses Koridor Timur-Barat' },
    { name: 'Soto Madura Gubeng Pojok', category: 'kuliner', categoryLabel: 'Kuliner', distanceM: 280, walkMinutes: 4, notes: 'Kuliner legendaris Surabaya' },
    { name: 'Grand City Mall Surabaya', category: 'minimarket_atm', categoryLabel: 'Mall & Belanja', distanceM: 650, walkMinutes: 8, notes: 'Pusat belanja & exhibition hall' },
    { name: 'Halte Feeder WiraWiri FD07', category: 'transit_layanan', categoryLabel: 'Transit', distanceM: 90, walkMinutes: 1, notes: 'Integrasi rute Joyoboyo - Bratang' },
  ],
  pasar_turi: [
    { name: 'Pusat Grosir Surabaya (PGS)', category: 'minimarket_atm', categoryLabel: 'Belanja & Niaga', distanceM: 320, walkMinutes: 4, notes: 'Pusat ritel & grosir tekstil' },
    { name: 'Pasar Turi Baru Food Court', category: 'kuliner', categoryLabel: 'Kuliner', distanceM: 260, walkMinutes: 3, notes: 'Pilihan aneka masakan Jawa Timur' },
    { name: 'Galeri ATM Mandiri & BRI', category: 'minimarket_atm', categoryLabel: 'Ritel & ATM', distanceM: 140, walkMinutes: 2, notes: 'Tarik & setor tunai' },
    { name: 'Halte Feeder WiraWiri FD01', category: 'transit_layanan', categoryLabel: 'Transit', distanceM: 110, walkMinutes: 1, notes: 'Rute langsung Tunjungan Plaza & Alun-Alun' },
    { name: 'Nasi Campur Tambak Bayan', category: 'kuliner', categoryLabel: 'Kuliner', distanceM: 480, walkMinutes: 6, notes: 'Kuliner khas dekat Jl. Pasar Besar' },
  ],
  semut: [
    { name: 'Kawasan Wisata Kota Lama (Kya-Kya)', category: 'kuliner', categoryLabel: 'Heritage & Kuliner', distanceM: 350, walkMinutes: 5, notes: 'Wisata malam pecinan & jajanan khas' },
    { name: 'Sentra Oleh-Oleh Jembatan Merah', category: 'minimarket_atm', categoryLabel: 'Belanja', distanceM: 520, walkMinutes: 7, notes: 'Pusat jajanan legendaris' },
    { name: 'Plaza Jembatan Merah (JMP)', category: 'minimarket_atm', categoryLabel: 'Niaga', distanceM: 580, walkMinutes: 8, notes: 'Pusat perbelanjaan grosir utara' },
    { name: 'Shelter Suroboyo Bus SB-04', category: 'transit_layanan', categoryLabel: 'Transit', distanceM: 200, walkMinutes: 3, notes: 'Rute menuju Pantai Kenjeran' },
  ],
  wonokromo: [
    { name: 'Royal Plaza Surabaya', category: 'minimarket_atm', categoryLabel: 'Mall & Belanja', distanceM: 420, walkMinutes: 5, notes: 'Departemen store, bioskop & food court' },
    { name: 'Darmo Trade Center (DTC)', category: 'minimarket_atm', categoryLabel: 'Pusat Niaga', distanceM: 240, walkMinutes: 3, notes: 'Pusat perbelanjaan terintegrasi stasiun' },
    { name: 'Pojok Kuliner Stasiun Wonokromo', category: 'kuliner', categoryLabel: 'Kuliner', distanceM: 90, walkMinutes: 1, notes: 'Pecel Madiun & Soto Ayam Lamongan' },
    { name: 'Halte Feeder WiraWiri Wonokromo', category: 'transit_layanan', categoryLabel: 'Transit', distanceM: 120, walkMinutes: 2, notes: 'Koneksi ke Mayjend Sungkono & HR Muhammad' },
  ],
  waru: [
    { name: 'Fasilitas Park & Ride Stasiun Waru', category: 'transit_layanan', categoryLabel: 'Layanan', distanceM: 60, walkMinutes: 1, notes: 'Parkir mobil/motor tarif flat aman' },
    { name: 'Alfamart & ATM Center Stasiun', category: 'minimarket_atm', categoryLabel: 'Ritel & ATM', distanceM: 70, walkMinutes: 1, notes: 'ATM BCA & BNI' },
    { name: 'Sentra Kuliner Waru Makmur', category: 'kuliner', categoryLabel: 'Kuliner', distanceM: 230, walkMinutes: 3, notes: 'Warung makan murah meriah' },
    { name: 'City of Tomorrow (Cito Mall)', category: 'minimarket_atm', categoryLabel: 'Mall & Ritel', distanceM: 850, walkMinutes: 11, notes: 'Pusat belanja gerbang perbatasan' },
  ],
  terminal_joyoboyo: [
    { name: 'Kebun Binatang Surabaya (KBS)', category: 'kuliner', categoryLabel: 'Wisata & Rekreasi', distanceM: 350, walkMinutes: 4, notes: 'Akses skybridge penyeberangan aman' },
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
    { name: 'Taman Flora & Kuliner Bratang', category: 'kuliner', categoryLabel: 'Taman & Kuliner', distanceM: 250, walkMinutes: 3, notes: 'Taman kota asri & sentra kuliner kaki lima' },
    { name: 'Pasar Burung & Bunga Bratang', category: 'minimarket_atm', categoryLabel: 'Pasar Seni', distanceM: 300, walkMinutes: 4, notes: 'Destinasi khas Surabaya Timur' },
    { name: 'Pemberangkatan Feeder WiraWiri FD07', category: 'transit_layanan', categoryLabel: 'Transit', distanceM: 40, walkMinutes: 1, notes: 'Koneksi ke Stasiun Gubeng & TIJ' },
  ]
};

// Klasifikasi Karakter Area Berbasis Model AI
const AREA_CLASSIFICATIONS: Record<string, {
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  commuterHighlights: string[];
}> = {
  gubeng: {
    title: 'Pusat Komersial & Finansial Inti (CBD TOD)',
    badge: 'Kawasan Komersial Utama',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    description: 'Kawasan berkepadatan ekonomi tinggi dengan kantor perbankan, hotel berbintang, dan rumah sakit rujukan. Didukung trotoar berkanopi dan konektivitas bus pengumpan terpadat.',
    commuterHighlights: [
      'Pusat transit kereta antarkota & komuter tersibuk',
      'Terhubung Feeder WiraWiri FD07 & Suroboyo Bus',
      'Trotoar lebar dengan tactile paving menuju pusat kota'
    ]
  },
  pasar_turi: {
    title: 'Pusat Niaga Grosir & Koridor Transit Utara',
    badge: 'Kawasan Perdagangan Grosir',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    description: 'Pusat perdagangan tekstil dan grosir Jawa Timur (Pusat Grosir Surabaya & Pasar Turi Baru). Pergerakan komuter sangat tinggi pada jam kerja dan hari pasar.',
    commuterHighlights: [
      'Akses Feeder WiraWiri FD01 langsung ke Tunjungan Plaza',
      'Bus kota langsung ke Pelabuhan Tanjung Perak',
      'Sentra perbelanjaan barang kebutuhan berharga grosir'
    ]
  },
  semut: {
    title: 'Kawasan Cagar Budaya & Wisata Heritage',
    badge: 'Kawasan Budaya & Heritage',
    badgeColor: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    description: 'Koridor Kota Lama Surabaya bernilai sejarah tinggi dengan arsitektur kolonial, wisata kuliner pecinan Kya-Kya, dan pusat perdagangan tradisional.',
    commuterHighlights: [
      'Zona pejalan kaki ramah wisata jalan sore',
      'Koneksi angkutan pengumpan ke wisata Kota Lama',
      'Banyak sentra jajanan legendaris dan oleh-oleh khas'
    ]
  },
  wonokromo: {
    title: 'Kawasan Komuter Padat & Hunian Campuran',
    badge: 'Kawasan Padat Komuter',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    description: 'Simpul komuter paling strategis di Surabaya Selatan yang mempertemukan pusat perbelanjaan (Royal Plaza & DTC) dengan permukiman padat penduduk.',
    commuterHighlights: [
      'Interchange antarmoda cepat menuju Surabaya Barat',
      'Akses belanja kebutuhan sehari-hari sebelum pulang',
      'Angkutan umum tersedia hingga larut malam'
    ]
  },
  waru: {
    title: 'Simpul Pengumpan Sub-Urban & Park-and-Ride',
    badge: 'Gerbang Aglomerasi',
    badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    description: 'Simpul perbatasan Surabaya–Sidoarjo yang berfungsi sebagai gerbang komuter utama untuk beralih dari kendaraan pribadi ke transportasi umum massal.',
    commuterHighlights: [
      'Tersedia gedung parkir kendaraan pribadi aman (Park & Ride)',
      'Kereta komuter KRD Sidoarjo - Surabaya setiap 30 menit',
      'Menghindari titik macet parah Bundaran Waru'
    ]
  },
  terminal_joyoboyo: {
    title: 'Simpul Intermoda Terpadu & Destinasi Hijau',
    badge: 'Terminal Modern Multimoda',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    description: 'Terminal intermoda bertingkat modern yang mengintegrasikan Suroboyo Bus, Feeder WiraWiri, dan akses pejalan kaki langsung ke Kebun Binatang Surabaya.',
    commuterHighlights: [
      'Gedung parkir 5 lantai berkapasitas ratusan kendaraan',
      'Skybridge penyeberangan aman ke Kebun Binatang Surabaya',
      'Ruang tunggu ber-AC dengan charging station gratis'
    ]
  },
  terminal_purabaya: {
    title: 'Pusat Transit Regional Terpadu Jawa Timur',
    badge: 'Simpul Antarkota 24 Jam',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    description: 'Terminal induk bus antarkota terbesar di Indonesia Timur dengan sistem tiket digital, ruang tunggu modern, dan operasional layanan antarmoda 24 jam.',
    commuterHighlights: [
      'Akses bus bandara Damri langsung ke Bandara Juanda',
      'Pemberangkatan Suroboyo Bus Koridor 1 ke pusat kota',
      'Pusat layanan kuliner dan fasilitas umum 24 jam'
    ]
  },
  terminal_bratang: {
    title: 'Simpul Pengumpan Wilayah Timur & Pendidikan',
    badge: 'Simpul Feeder Timur',
    badgeColor: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    description: 'Pusat transit pengumpan kawasan Surabaya Timur yang melayani rute kampus perguruan tinggi ternama serta sentra kuliner dan taman kota flora.',
    commuterHighlights: [
      'Feeder WiraWiri FD07 terhubung ke Stasiun Gubeng & TIJ',
      'Dekat dengan kampus-kampus ternama Surabaya Timur',
      'Taman kota rindang cocok untuk istirahat sejenak'
    ]
  },
  tandes: {
    title: 'Kawasan Komuter Barat & Sentra Industri Ringan',
    badge: 'Komuter Surabaya Barat',
    badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    description: 'Simpul transit komuter strategis di koridor barat Surabaya yang melayani mobilitas pekerja industri dan permukiman Tandes–Manukan.',
    commuterHighlights: [
      'Stasiun perhentian KRD komuter Lamongan & Bojonegoro',
      'Akses dekat kawasan kuliner dan pasar tradisional Tandes',
      'Terhubung feeder WiraWiri menuju Benowo dan pusat kota'
    ]
  },
  kandangan: {
    title: 'Simpul Percabangan Rel & Permukiman Sub-Urban',
    badge: 'Simpul Rel Sub-Urban',
    badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    description: 'Titik percabangan jalur kereta api lintas utara (Semarang) dan lintas tengah, melayani perumahan sub-urban di Surabaya Barat.',
    commuterHighlights: [
      'Pemberhentian kereta komuter lokal terjangkau',
      'Suasana kawasan permukiman yang tenang dan asri',
      'Akses cepat menuju kawasan pergudangan Margomulyo'
    ]
  },
  benowo: {
    title: 'Gerbang Transit Barat & Akses Stadion GBT',
    badge: 'Transit Perbatasan Barat',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    description: 'Stasiun paling barat Kota Surabaya yang berbatasan dengan Gresik, berperan sebagai gerbang mobilitas dan akses utama menuju Gelora Bung Tomo (GBT).',
    commuterHighlights: [
      'Akses utama menuju Stadion Gelora Bung Tomo (GBT)',
      'Simpul transit komuter lintas Surabaya–Gresik–Lamongan',
      'Park-and-ride kendaraan roda dua untuk warga komuter'
    ]
  },
  ngagel: {
    title: 'Koridor Urban Campuran & Kampus Pendidikan',
    badge: 'Kampus & Urban Mixed',
    badgeColor: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    description: 'Kawasan transit di jantung kota Surabaya yang dikelilingi kampus universitas swasta ternama, pusat perbelanjaan DTC, dan perkantoran.',
    commuterHighlights: [
      'Sangat dekat dengan kawasan kampus UBAYA Ngagel',
      'Dikelilingi sentra kuliner mahasiswa dan minimarket 24 jam',
      'Koneksi angkutan mikrolet dan feeder WiraWiri melimpah'
    ]
  },
  margorejo: {
    title: 'Koridor Komersial Frontage Road & Hunian',
    badge: 'Frontage Koridor Selatan',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    description: 'Simpul transit komuter di frontage road Jl. Ahmad Yani yang terintegrasi dengan pusat grosir Marina Plaza dan kawasan perumahan Margorejo Indah.',
    commuterHighlights: [
      'Akses langsung ke pusat elektronik Plaza Marina',
      'Jalur pedestrian frontage road lebar dan berkanopi pohon',
      'Frekuensi angkutan umum koridor utama Ahmad Yani tinggi'
    ]
  },
  jemursari: {
    title: 'Kawasan Perkantoran Selatan & Koridor Komuter',
    badge: 'Koridor Perkantoran Selatan',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    description: 'Simpul transit strategis bagi pekerja perkantoran di koridor Jl. Jemursari dan Jl. Ahmad Yani Selatan dengan aktivitas jam kerja yang padat.',
    commuterHighlights: [
      'Perhentian utama pekerja kantor BUMN dan swasta koridor selatan',
      'Akses mudah ke pusat perbankan dan kuliner Jemursari',
      'Terhubung halte Suroboyo Bus koridor utama'
    ]
  },
  kertomenanggal: {
    title: 'Simpul Transit Aglomerasi Selatan (Waru Gateway)',
    badge: 'Gerbang Aglomerasi Selatan',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    description: 'Stasiun komuter di gerbang perbatasan selatan Surabaya, melayani kawasan kampus UNESA Ketintang dan mobilitas warga Menanggal.',
    commuterHighlights: [
      'Dekat Masjid Agung Al-Akbar dan kawasan kampus Menanggal',
      'Simpul peralihan komuter sebelum memasuki stasiun Waru',
      'Akses jalan tol Waru-Juanda sangat mudah'
    ]
  },
  sidotopo: {
    title: 'Kawasan Depo Perkeretaapian & Hunian Padat Utara',
    badge: 'Sentra Depo Kereta Api',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    description: 'Kawasan bersejarah depo perkeretaapian terbesar di Surabaya yang melayani mobilitas warga Surabaya Utara dan sentra UMKM lokal.',
    commuterHighlights: [
      'Pusat kegiatan perawatan lokomotif dan kereta api bersejarah',
      'Akses pasar tradisional Sidotopo dan kuliner lokal khas Madura',
      'Koneksi angkutan kota menuju Jembatan Suramadu'
    ]
  },
  kalimas: {
    title: 'Kawasan Logistik Pelabuhan Tanjung Perak',
    badge: 'Logistik & Pelabuhan',
    badgeColor: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    description: 'Stasiun ujung utara jaringan kereta barang dan komuter dekat Pelabuhan Tanjung Perak dengan karakter dominan logistik dan pergudangan maritim.',
    commuterHighlights: [
      'Akses terdekat ke pelabuhan penumpang Gapura Surya Nusantara',
      'Sentra kantor ekspedisi kapal laut dan pergudangan',
      'Koneksi bus kota rute Tanjung Perak - Bungurasih'
    ]
  },
  benteng: {
    title: 'Kawasan Pangkalan Maritim & Transit Pesisir Utara',
    badge: 'Pesisir Utara Maritim',
    badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    description: 'Simpul transit paling utara Surabaya di dekat pangkalan TNI AL Ujung dan Monumen Jalasveva Jayamahe dengan akses pemandangan Selat Madura.',
    commuterHighlights: [
      'Akses Monumen Jalasveva Jayamahe dan wisata maritim',
      'Dekat dengan dermaga penyeberangan kapal Ujung-Kamal',
      'Kawasan pesisir berangin segar dengan suasana khas bahari'
    ]
  }
};

export const CommuterPanel: React.FC<CommuterPanelProps> = ({
  station,
  activeStation,
  activeH3Index,
  onExecuteMapAction,
  onSelectStation,
}) => {
  const [poiFilter, setPoiFilter] = useState<'semua' | 'kuliner' | 'minimarket_atm' | 'transit_layanan'>('semua');
  const [realPois, setRealPois] = useState<any[]>([]);

  const isTerminal = station.id.startsWith('terminal_');
  const kecamatanName = station.kecamatan || (station.name.includes('Gubeng') ? 'Tambaksari' : station.name.includes('Wonokromo') ? 'Wonokromo' : station.name.includes('Pasar Turi') ? 'Bubutan' : 'Surabaya');

  const areaClassification = AREA_CLASSIFICATIONS[station.id] || {
    title: 'Kawasan Transit Terpadu',
    badge: 'Simpul Transit',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    description: 'Kawasan simpul transit yang melayani mobilitas harian warga Surabaya dengan aksesibilitas jalan kaki yang nyaman.',
    commuterHighlights: [
      'Terhubung dengan jaringan transportasi umum massal',
      'Akses pejalan kaki dalam radius 1 km',
      'Pilihan fasilitas harian di sekitar simpul'
    ]
  };

  useEffect(() => {
    let isMounted = true;
    setRealPois([]); // Bersihkan POI stasiun lama
    fetchStationRealPOIs(station.id).then((data) => {
      if (isMounted && data && data.length > 0) {
        setRealPois(data);
      }
    });
    return () => { isMounted = false; };
  }, [station.id]);

  const stationPois = realPois.length > 0 ? realPois : (STATION_POIS[station.id] || []);

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
              { id: 'kuliner', label: 'Kuliner' },
              { id: 'minimarket_atm', label: 'Ritel & ATM' },
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
                    {poi.category === 'kuliner' ? (
                      <Utensils className="w-3 h-3 text-amber-400" />
                    ) : poi.category === 'minimarket_atm' ? (
                      <ShoppingBag className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Bus className="w-3 h-3 text-cyan-400" />
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
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-brand-lime" />
              <h4 className="text-xs font-bold text-slate-200">Indeks Ramah Pejalan Kaki (Walkability)</h4>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">Radius 500m</span>
          </div>
          
          <div className="flex items-center gap-4">
            <DiamondGauge
              score={Math.round(station.scores.design * 0.92)} 
              label={station.scores.design >= 70 ? 'Sangat Nyaman' : 'Cukup Nyaman'}
              size="md"
            />
            <div className="text-[10px] text-slate-300 leading-relaxed flex-1 space-y-1">
              <p>
                Kepadatan jalur pejalan kaki berkanopi &amp; zebra cross terintegrasi menuju simpul transit dalam radius 5–10 menit jalan kaki.
              </p>
              <div className="flex items-center gap-1.5 text-[9px] text-cyan-300 font-semibold pt-0.5">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>Standar Aksesibilitas Disabilitas &amp; Tactile Paving</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── PANDUAN RUTE INTERMODA HIBRIDA & TRANSIT REAL-TIME ── */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <h4 className="text-xs font-bold text-slate-200">Koneksi Transit Multimoda &amp; Estimasi Waktu</h4>
          </div>
          <TravelEstimator 
            estimates={station.travel_estimates}
            stationId={activeStation}
            stationName={station.name}
            onSelectRoute={(routeId) => {
              onExecuteMapAction?.({ action: 'highlight_route', route_id: routeId });
            }}
          />
        </div>

        {/* ── SUARA WARGA (SURVEI OPINI MAPID #PakSibukGa) ── */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-brand-teal" />
              <h4 className="text-xs font-bold text-slate-200">Suara Warga Sekitar (Survei MAPID)</h4>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-teal/15 text-brand-teal font-mono font-bold">
              360 Responden
            </span>
          </div>
          
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-300">
              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-emerald-400" /> Positif (68%)</span>
              <span className="flex items-center gap-1"><Minus className="w-3 h-3 text-slate-400" /> Netral (20%)</span>
              <span className="flex items-center gap-1"><ThumbsDown className="w-3 h-3 text-red-400" /> Masukan (12%)</span>
            </div>
            {/* Progress Bar Sentimen */}
            <div className="w-full h-1.5 flex rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full" style={{ width: '68%' }} />
              <div className="bg-slate-600 h-full" style={{ width: '20%' }} />
              <div className="bg-amber-400 h-full" style={{ width: '12%' }} />
            </div>

            {/* Aspek Evaluasi Warga */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[10px]">
              <div className="bg-slate-950/40 p-1.5 rounded border border-slate-800/80">
                <div className="text-slate-400 text-[8.5px]">Kemudahan Tap-In Transum</div>
                <div className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>88% Puas</span>
                </div>
              </div>
              <div className="bg-slate-950/40 p-1.5 rounded border border-slate-800/80">
                <div className="text-slate-400 text-[8.5px]">Kenyamanan Trotoar Malam</div>
                <div className="font-bold text-cyan-300 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>74% Aman</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
