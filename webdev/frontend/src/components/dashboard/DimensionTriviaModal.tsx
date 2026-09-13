'use client';

import React, { useState } from 'react';
import { StationData } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { 
  Building2, 
  Store, 
  Footprints, 
  MapPin, 
  Route, 
  Lightbulb, 
  CheckCircle2, 
  Target, 
  Award, 
  AlertTriangle, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export type DimensionKey = 'density' | 'diversity' | 'design' | 'destination' | 'distance';

interface DimensionTriviaModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: StationData;
  initialDimension?: DimensionKey;
}

interface DimensionContent {
  key: DimensionKey;
  name: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  badgeColor: string;
  ahpWeight: string;
  theoryQuote: string;
  triviaFacts: string[];
  interventions: {
    category: string;
    items: string[];
  }[];
  bestPractice: {
    city: string;
    summary: string;
  };
  kpiTarget: string;
}

const DIMENSIONS_DATA: Record<DimensionKey, DimensionContent> = {
  density: {
    key: 'density',
    name: 'Density',
    subtitle: 'Kepadatan Kawasan & Intensitas Bangunan',
    icon: Building2,
    color: 'text-indigo-400',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    ahpWeight: 'Bobot AHP: 22%',
    theoryQuote: 'Kepadatan populasi dan unit hunian yang terkonsentrasi di radius 400-800m menjamin ketersediaan pengguna transit (ridership) yang berkelanjutan dan memangkas ketergantungan kendaraan bermotor (Cervero & Kockelman, 1997).',
    triviaFacts: [
      'Peningkatan kepadatan sebesar 10% di kawasan stasiun terbukti menurunkan emisi karbon perjalanan harian hingga 2.8%.',
      'Di kawasan koridor stasiun Surabaya (Gubeng & Wonokromo), densitas eksisting masih didominasi perumahan horizontal 1-2 lantai (KDB tinggi, KLB rendah), menyisakan ruang densifikasi vertikal yang masif.',
      'Rasio hunian berbanding halte transit di Surabaya saat ini masih di bawah standar transit kota metropolitan Asia Tenggara.'
    ],
    interventions: [
      {
        category: 'Aksi Cepat & Regulasi (0 - 12 Bulan)',
        items: [
          'Pemberian Insentif Bonus KLB (FAR Bonus) dari 3.0 menjadi 5.0–7.5 untuk bangunan vertikal yang terintegrasi fisik dengan stasiun.',
          'Mewajibkan minimal 25% unit apartemen/rusun baru dialokasikan sebagai hunian terjangkau (Affordable Housing) bagi pekerja komuter.',
          'Penghapusan ketentuan batas minimum parkir mobil (Parking Maximum Policy) untuk gedung di radius 400m guna menekan biaya pembangunan hunian.'
        ]
      },
      {
        category: 'Perencanaan Spasial & Investasi (1 - 3 Tahun)',
        items: [
          'Penyusunan Perwali TOD Overlay Zone yang mengizinkan konsolidasi tanah (land pooling) di sekitar stasiun untuk superblok terpadu.',
          'Pemanfaatan aset lahan tidur PT KAI dan Pemkot untuk pembangunan Rusunawa/Rusunami TOD bersubsidi bagi masyarakat berpenghasilan rendah (MBR).',
          'Pemberian diskon PBB (Pajak Bumi dan Bangunan) selama 3 tahun pertama bagi proyek residensial vertikal padat di koridor SRRL.'
        ]
      }
    ],
    bestPractice: {
      city: 'Hong Kong & Stasiun Dukuh Atas Jakarta',
      summary: 'Konsep "Rail plus Property" (R+P) memaksimalkan KLB di atas depo dan stasiun menjadi superblok hunian vertikal terintegrasi.'
    },
    kpiTarget: 'Kepadatan > 180 jiwa/ha, KLB rata-rata > 4.5, dan ridership harian stasiun meningkat > 30%.'
  },
  diversity: {
    key: 'diversity',
    name: 'Diversity',
    subtitle: 'Keragaman Tata Guna Lahan & Aktivitas Campuran',
    icon: Store,
    color: 'text-cyan-400',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    ahpWeight: 'Bobot AHP: 20%',
    theoryQuote: 'Bauran guna lahan (Mixed-Use) menciptakan aktivitas 24/7 di sekitar simpul transit, membagi rata beban perjalanan bolak-balik tanpa memicu kemacetan satu arah (Cervero, 2002).',
    triviaFacts: [
      'Indeks Entropi Keragaman ideal berkisar 0.7 - 0.9. Stasiun Pasar Turi dan Semut kaya akan fungsi retail grosir, namun kekurangan komponen ruang terbuka publik dan hunian komuter malam hari.',
      'Kawasan dengan diversitas tinggi memiliki angka kejahatan jalanan (street crime) lebih rendah 40% karena adanya "Eyes on the Street" dari toko, kafe, dan pejalan kaki sepanjang waktu.',
      'Data survei MAPID #PakSibukGa menunjukkan 68% komuter menginginkan gerai kuliner higienis dan minimarket praktis tepat di koridor keluar-masuk stasiun.'
    ],
    interventions: [
      {
        category: 'Aksi Cepat & Penataan UMKM (0 - 12 Bulan)',
        items: [
          'Pemberdayaan UMKM kuliner lokal terkurasi (Program Menu Go & Struk Go) ke dalam kios tertata di concourse stasiun dan plaza pedestrian.',
          'Penerapan aturan "Active Ground Floor" (lantai 1 wajib transparan & melarang pagar beton tinggi) pada bangunan komersial yang berbatasan langsung dengan trotoar.',
          'Penyediaan fasilitas co-working space mikro dan loket penitipan paket di pintu stasiun untuk melayani kebutuhan komuter modern.'
        ]
      },
      {
        category: 'Reformasi Tata Ruang Mixed-Use (1 - 3 Tahun)',
        items: [
          'Relaksasi zonasi RDTR Surabaya dari zonasi tunggal kaku menjadi zonasi campuran fleksibel (Flexible Mixed-Use Overlay).',
          'Insentif pengurangan pajak retribusi bagi perkantoran yang menyertakan fasilitas penitipan anak (daycare) dan apotek/klinik bagi penumpang.',
          'Pembangunan plaza ruang terbuka hijau multifungsi yang bisa bertransformasi menjadi pasar seni mingguan (weekend creative market).'
        ]
      }
    ],
    bestPractice: {
      city: 'Tokyo (Roppongi Hills & Shibuya Station)',
      summary: 'Integrasi lantai stasiun dengan underground shopping mall, galeri seni, universitas mini, dan kantor pemerintahan satu atap.'
    },
    kpiTarget: 'Indeks Entropi Land-Use > 0.78 dan jam aktivitas publik aktif hingga pukul 22:30.'
  },
  design: {
    key: 'design',
    name: 'Design',
    subtitle: 'Desain Ramah Pejalan Kaki & Akses First-Mile',
    icon: Footprints,
    color: 'text-amber-400',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    ahpWeight: 'Bobot AHP: 24%',
    theoryQuote: 'Kualitas lingkungan pejalan kaki (pencahayaan, kanopi peneduh, keamanan crossing) adalah penentu terbesar apakah warga bersedia beralih dari sepeda motor ke stasiun kereta (Ewing & Cervero, 2010).',
    triviaFacts: [
      'Design secara konsisten menjadi dimensi dengan skor terendah di stasiun Surabaya (rata-rata skor < 70) akibat trotoar terputus, parkir liar, dan tidak adanya peneduh cuaca tropis.',
      'Keberadaan kanopi peneduh cuaca (weather-protected canopy) mampu meningkatkan radius jalan kaki warga Indonesia dari 300 meter menjadi 750 meter.',
      '92% responden survei difabel dan lansia di Surabaya mengeluhkan guiding block trotoar yang terbentur tiang utilitas atau pohon peneduh yang salah posisi.'
    ],
    interventions: [
      {
        category: 'Aksi Cepat First-Mile (0 - 6 Bulan)',
        items: [
          'Pemasangan Kanopi Pedestrian Berkelanjutan dari pintu timur & barat stasiun menghubungkan halte bus terdekat (bebas hujan dan terik matahari).',
          'Penertiban parkir liar dan relokasi PKL liar ke kantong sentra kuliner berjarak 50 meter dengan sistem tenda seragam.',
          'Peninggian zebra cross (Raised Crosswalk / Speed Table) dengan tombol Pelican Crossing di ruas depan stasiun agar kendaraan wajib berhenti.',
          'Penataan kabel udara kusut menjadi ducting terpadu bawah tanah (underground utility box) di koridor trotoar primer.'
        ]
      },
      {
        category: 'Standarisasi Infrastruktur Ramah Disabilitas (6 - 24 Bulan)',
        items: [
          'Pelebaran trotoar standar Permen PUPR minimal 2.5 hingga 3.5 meter dengan ubin taktil (guiding block) mulus tanpa celah lubang.',
          'Pemasangan Penerangan Jalan Umum (PJU) Pedestrian bertenaga surya setiap 15 meter untuk memastikan rasa aman pejalan kaki perempuan di malam hari.',
          'Penanaman pohon peneduh rindang (Tabebuya & Tanjung) yang memiliki akar tunggang agar tidak merusak ubin trotoar.',
          'Pemasangan sensor CCTV AI pendeteksi okupasi kendaraan bermotor di atas jalur pedestrian.'
        ]
      }
    ],
    bestPractice: {
      city: 'Singapura (Walk2Ride Covered Walkways)',
      summary: 'Jalur berkanopi menerus dari setiap stasiun MRT menjangkau sekolah, klinik, dan kompleks HDB dalam radius 400 meter tanpa terputus.'
    },
    kpiTarget: 'Walk Score > 85/100, 100% trotoar ramah difabel, dan eliminasi total parkir liar di radius 200m stasiun.'
  },
  destination: {
    key: 'destination',
    name: 'Destination Accessibility',
    subtitle: 'Aksesibilitas Destinasi Utama Kota',
    icon: MapPin,
    color: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    ahpWeight: 'Bobot AHP: 18%',
    theoryQuote: 'Kemampuan sistem transit menjangkau pusat-pusat konsentrasi lapangan kerja, pendidikan, dan layanan publik dalam waktu tempuh kompetitif terhadap kendaraan pribadi (Cervero, 1998).',
    triviaFacts: [
      'Stasiun Gubeng memiliki skor Destination Accessibility tertinggi (90/100) karena lokasinya di sentral CBD Surabaya dan kedekatannya dengan RSUD Dr. Soetomo & Unair.',
      'Analisis Spatial Durbin Model (SDM) membuktikan bahwa setiap kenaikan 1 poin Destination Accessibility menyumbang kenaikan +0.42% pada nilai estimasi NJOP properti sekitar.',
      'Komuter rela berganti moda hingga 2 kali asalkan waktu tunggu transfer (headway) dapat diprediksi secara real-time di aplikasi smartphone.'
    ],
    interventions: [
      {
        category: 'Integrasi Rute & Jadwal Transit (0 - 12 Bulan)',
        items: [
          'Sinkronisasi Jadwal Kedatangan (Timetable Coordination) antara kereta komuter SRRL dan Trans Semanggi Suroboyo (headway transfer < 6 menit).',
          'Penerapan Sistem Tarif Terintegrasi (MaaS Surabaya) satu kartu/QRIS untuk kereta lokal, Suroboyo Bus, dan Feeder WiraWiri.',
          'Pemasangan layar Passenger Information Display System (PIDS) real-time jadwal bus kota tepat di aula kedatangan stasiun.'
        ]
      },
      {
        category: 'Prioritas Angkutan Massal (1 - 3 Tahun)',
        items: [
          'Penerapan Transit Signal Priority (TSP) di simpang jalan utama agar bus feeder selalu mendapat lampu hijau ketika mendekati stasiun.',
          'Penyediaan jalur khusus bus (dedicated bus lane) di koridor jalan penghubung stasiun ke pusat perkantoran Jalan Basuki Rahmat & Pemuda.',
          'Ekspansi rute Feeder WiraWiri menjangkau kawasan kampus dan perumahan padat yang belum terlayani bus besar.'
        ]
      }
    ],
    bestPractice: {
      city: 'Curitiba & Seoul (Integrated Transit Card)',
      summary: 'Integrasi sistem tiket BRT dan kereta komuter dengan tarif tunggal flat serta transfer gratis dalam kurun 60 menit.'
    },
    kpiTarget: 'Waktu tunggu transfer < 8 menit dan aksesibilitas ke pusat kerja 30 menit mencapai > 75% wilayah aglomerasi.'
  },
  distance: {
    key: 'distance',
    name: 'Distance to Transit',
    subtitle: 'Jarak & Kecepatan Menuju Pintu Stasiun',
    icon: Route,
    color: 'text-blue-400',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    ahpWeight: 'Bobot AHP: 16%',
    theoryQuote: 'Jarak fisik yang pendek menjadi tidak bermakna jika terhambat pembatas fisik (barrier effect). Rute terpendek dan permeabilitas tinggi adalah kunci kenyamanan transit (Frank et al., 2006).',
    triviaFacts: [
      'Rasio keterhubungan rute (Pedestrian Route Directness / PRD) ideal adalah di bawah 1.3. Nilai di atas 1.5 berarti pejalan kaki harus memutar rute 50% lebih jauh dari jarak lurus.',
      'Banyak stasiun kereta di Jawa memiliki "Severance Effect" parah: rel membelah kawasan menjadi dua, di mana warga di sisi seberang harus memutar sejauh 1.5 km hanya untuk menyeberang rel.',
      'Fasilitas parkir sepeda aman (bike locker) dan drop-off ojol yang teratur terbukti memperluas jangkauan tangkapan stasiun dari 800 meter menjadi 3 kilometer.'
    ],
    interventions: [
      {
        category: 'Aksesibilitas Multi-Pintu & Drop-off (0 - 12 Bulan)',
        items: [
          'Pembangunan Jembatan Penyeberangan Orang (JPO) / Skybridge modern menghubungkan sisi barat dan timur stasiun tanpa harus melewati pintu tiket kereta.',
          'Pembuatan Zona Drop-off & Pick-up Ojol (Ride-Hailing Bay) khusus yang teduh dan teratur agar tidak menimbulkan antrean macet di badan jalan.',
          'Penyediaan stasiun sepeda sewa (Bike-Sharing Station) dan parkir sepeda berkanopi dengan kamera pengawas 24 jam.'
        ]
      },
      {
        category: 'Permeabilitas Jaringan Jalan Mikro (1 - 3 Tahun)',
        items: [
          'Pembukaan akses gang-gang pemukiman (permeable alleyways) menuju stasiun dengan perbaikan penerangan dan paving block.',
          'Pemasangan Papan Petunjuk Arah Isochrone (Wayfinding 5-Menit & 10-Menit Jalan Kaki) di setiap persimpangan gang warga.',
          'Underpass pejalan kaki ber-AC dan lift aksesibel yang ramah kursi roda dan sepeda lipat.'
        ]
      }
    ],
    bestPractice: {
      city: 'Utrecht Centraal (Belanda)',
      summary: 'Gedung parkir sepeda terbesar di dunia (12.500 slot) terhubung langsung ke peron kereta, memungkinkan transfer sepeda-kereta dalam 2 menit.'
    },
    kpiTarget: 'Pedestrian Route Directness < 1.25, waktu tempuh rata-rata first-mile < 6 menit, dan konektivitas dua sisi stasiun.'
  }
};

export function DimensionTriviaModal({
  isOpen,
  onClose,
  station,
  initialDimension = 'design'
}: DimensionTriviaModalProps) {
  const [activeTab, setActiveTab] = useState<DimensionKey>(initialDimension);

  // Sync tab if initialDimension changes when opening
  React.useEffect(() => {
    if (initialDimension) {
      setActiveTab(initialDimension);
    }
  }, [initialDimension, isOpen]);

  const activeContent = DIMENSIONS_DATA[activeTab];
  const IconComponent = activeContent.icon;

  // Map station scores to dimensions
  const getStationScore = (key: DimensionKey) => {
    switch (key) {
      case 'density': return station.scores.density;
      case 'diversity': return station.scores.diversity;
      case 'design': return station.scores.design;
      case 'destination': return station.scores.destination_accessibility;
      case 'distance': return station.scores.distance_to_transit;
    }
  };

  const isWeakest = station.weakest_dimension.toLowerCase().includes(activeTab.substring(0, 4));
  const isStrongest = station.strongest_dimension.toLowerCase().includes(activeTab.substring(0, 4));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Panduan Aksi & Trivia 5D TOD"
      subtitle={`Evaluasi Komprehensif Kawasan ${station.name} (Cervero 5D Framework)`}
      icon={<Sparkles className="w-5 h-5 text-brand-lime" />}
      maxWidth="xl"
    >
      <div className="space-y-4 text-slate-200">
        
        {/* ── 5D TAB SELECTOR PILLS ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin border-b border-slate-800">
          {(Object.keys(DIMENSIONS_DATA) as DimensionKey[]).map((key) => {
            const item = DIMENSIONS_DATA[key];
            const score = getStationScore(key);
            const isActive = activeTab === key;
            const ItemIcon = item.icon;
            const itemIsWeakest = station.weakest_dimension.toLowerCase().includes(key.substring(0, 4));
            const itemIsStrongest = station.strongest_dimension.toLowerCase().includes(key.substring(0, 4));

            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all border shrink-0 ${
                  isActive
                    ? 'bg-brand-lime text-slate-950 border-brand-lime shadow-lg shadow-brand-lime/10'
                    : 'bg-slate-800/70 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <ItemIcon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : item.color}`} />
                <span>{item.name}</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-md font-mono font-bold ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-300'
                }`}>
                  {score}
                </span>
                {itemIsWeakest && (
                  <span className={`text-[9px] px-1 rounded font-bold uppercase ${isActive ? 'bg-red-950 text-red-200' : 'bg-red-500/20 text-red-400'}`}>
                    Terlemah
                  </span>
                )}
                {itemIsStrongest && (
                  <span className={`text-[9px] px-1 rounded font-bold uppercase ${isActive ? 'bg-emerald-950 text-emerald-200' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    Terkuat
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── HEADER KARTU DIMENSI AKTIF ── */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 ${activeContent.color}`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{activeContent.name}</h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${activeContent.badgeColor}`}>
                    {activeContent.ahpWeight}
                  </span>
                  {isWeakest && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Prioritas Intervensi
                    </span>
                  )}
                  {isStrongest && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Aset Keunggulan
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{activeContent.subtitle}</p>
              </div>
            </div>

            {/* Meter Nilai Skor */}
            <div className="flex items-center gap-3 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800 shrink-0">
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Skor Stasiun {station.name}</div>
                <div className="text-base font-mono font-black text-brand-lime">
                  {getStationScore(activeTab)} <span className="text-xs font-normal text-slate-500">/ 100</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-brand-lime/30 flex items-center justify-center font-bold text-xs text-brand-lime bg-brand-lime/5">
                {getStationScore(activeTab) >= 80 ? 'Tinggi' : getStationScore(activeTab) >= 70 ? 'Sedang' : 'Rendah'}
              </div>
            </div>
          </div>

          {/* Quote Konsep Teori 5D */}
          <div className="mt-3 text-xs italic text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
            <span>"{activeContent.theoryQuote}"</span>
          </div>
        </div>

        {/* ── TRIVIA & FAKTA URBAN GIS ── */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-lime uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Trivia & Fakta Spasial Koridor Surabaya</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-2 pt-1">
            {activeContent.triviaFacts.map((fact, idx) => (
              <div key={idx} className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-2.5 text-xs text-slate-300 leading-relaxed flex flex-col justify-between">
                <div className="flex items-start gap-1.5 mb-1 text-[11px] font-semibold text-cyan-300">
                  <Sparkles className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Trivia #{idx + 1}</span>
                </div>
                <p className="text-[11px] text-slate-300">{fact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── APA SAJA YANG PERLU DILAKUKAN (PANDUAN INTERVENSI LENGKAP) ── */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Apa Saja yang Perlu Dilakukan? (Panduan Aksi Kebijakan)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Berdasarkan Dokumen PRD TOD 2026</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {activeContent.interventions.map((group, idx) => (
              <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 border-b border-slate-700/50 pb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-lime" />
                  <span>{group.category}</span>
                </div>
                <ul className="space-y-1.5">
                  {group.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-[11px] text-slate-300 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-lime shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER BEST PRACTICE & TARGET KPI ── */}
        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          {/* Best Practice Card */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-3 text-xs flex items-start gap-2.5">
            <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Best Practice Rujukan</div>
              <div className="text-xs font-bold text-slate-200">{activeContent.bestPractice.city}</div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{activeContent.bestPractice.summary}</div>
            </div>
          </div>

          {/* KPI Card */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-3 text-xs flex items-start gap-2.5">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Capaian (KPI)</div>
              <div className="text-xs font-bold text-emerald-400">Peningkatan Kinerja Dimensi</div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{activeContent.kpiTarget}</div>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
}
