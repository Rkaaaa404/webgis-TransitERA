import { StationData, StationId } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api';

export const FALLBACK_STATIONS: StationData[] = [
  {
    id: 'gubeng',
    name: 'Stasiun Surabaya Gubeng',
    latitude: -7.2654,
    longitude: 112.7521,
    tod_readiness_score: 84.5,
    scores: {
      density: 88.0,
      diversity: 85.5,
      design: 78.0,
      destination_accessibility: 90.0,
      distance_to_transit: 81.5
    },
    benchmark_scores: {
      density: 77.0,
      diversity: 76.5,
      design: 62.5,
      destination_accessibility: 79.5,
      distance_to_transit: 78.0
    },
    typology: 'Commercial Transit Hub',
    weakest_dimension: 'Design',
    strongest_dimension: 'Destination Accessibility',
    status: 'Focus Area',
    is_tier_1: true,
    njop_premium: {
      avg_njop_premium_pct: 14.8,
      ci_lower_pct: 11.2,
      ci_upper_pct: 18.4,
      affected_h3_count: 19,
      r_squared: 0.78,
      direct_effect_pct: 10.2,
      spillover_effect_pct: 4.6
    },
    policy_recommendations: [
      'Perluasan jalur pedestrian berkanopi di koridor timur menuju Jalan Dharmahusada.',
      'Penambahan integrasi halte feeder WiraWiri rute FD07 langsung di lobby stasiun.',
      'Penerapan insentif lantai bangunan (FAR bonus) untuk hunian vertikal terjangkau dalam radius 400m.'
    ],
    menu_go_recommendations: [
      { name: 'Kopi Gubeng Asli', distance: '120m', price: 'Medium', crowd: 'High' },
      { name: 'Warung Nasi Madura', distance: '250m', price: 'Low', crowd: 'Medium' }
    ],
    tenant_mix: [
      { label: 'F&B', value: 48, color: 'bg-brand-lime' },
      { label: 'Retail', value: 36, color: 'bg-amber-500' },
      { label: 'Services', value: 28, color: 'bg-emerald-500' },
      { label: 'UMKM (Micro)', value: 18, color: 'bg-cyan-500' }
    ],
    travel_estimates: [
      { destination: 'RSUD Dr. Soetomo', time: '10 min', icon: 'walk' },
      { destination: 'Grand City Mall', time: '5 min', icon: 'car' }
    ]
  },
  {
    id: 'pasar_turi',
    name: 'Stasiun Pasar Turi',
    latitude: -7.2478,
    longitude: 112.7306,
    tod_readiness_score: 79.2,
    scores: {
      density: 82.0,
      diversity: 86.0,
      design: 65.5,
      destination_accessibility: 83.0,
      distance_to_transit: 79.5
    },
    benchmark_scores: {
      density: 77.0,
      diversity: 76.5,
      design: 62.5,
      destination_accessibility: 79.5,
      distance_to_transit: 78.0
    },
    typology: 'Commercial Transit Hub',
    weakest_dimension: 'Design',
    strongest_dimension: 'Diversity',
    status: 'Focus Area',
    is_tier_1: true,
    njop_premium: {
      avg_njop_premium_pct: 12.3,
      ci_lower_pct: 9.1,
      ci_upper_pct: 15.5,
      affected_h3_count: 19,
      r_squared: 0.74,
      direct_effect_pct: 8.5,
      spillover_effect_pct: 3.8
    },
    policy_recommendations: [
      'Penataan relokasi kantong parkir liar dan PKL yang meluber di Jalan Semarang.',
      'Peningkatan kualitas trotoar dengan tactile paving standar disabilitas menuju Pasar Turi Baru.',
      'Penyediaan integrasi antarmoda terpadu Suroboyo Bus Koridor 3.'
    ],
    menu_go_recommendations: [
      { name: 'Lontong Balap Pak Gendut', distance: '150m', price: 'Low', crowd: 'High' },
      { name: 'Soto Madura Tapak Siring', distance: '300m', price: 'Medium', crowd: 'High' }
    ],
    tenant_mix: [
      { label: 'Retail Pakaian', value: 55, color: 'bg-brand-lime' },
      { label: 'F&B', value: 30, color: 'bg-amber-500' },
      { label: 'Grosir/Jasa', value: 25, color: 'bg-emerald-500' },
      { label: 'UMKM Keliling', value: 40, color: 'bg-cyan-500' }
    ],
    travel_estimates: [
      { destination: 'Tugu Pahlawan', time: '12 min', icon: 'walk' },
      { destination: 'Pasar Turi Baru', time: '3 min', icon: 'walk' }
    ]
  },
  {
    id: 'semut',
    name: 'Stasiun Surabaya Kota (Semut)',
    latitude: -7.2372,
    longitude: 112.7431,
    tod_readiness_score: 71.0,
    scores: {
      density: 74.0,
      diversity: 78.0,
      design: 60.0,
      destination_accessibility: 75.0,
      distance_to_transit: 68.0
    },
    benchmark_scores: {
      density: 77.0,
      diversity: 76.5,
      design: 62.5,
      destination_accessibility: 79.5,
      distance_to_transit: 78.0
    },
    typology: 'Mixed-Use Heritage Core',
    weakest_dimension: 'Design',
    strongest_dimension: 'Diversity',
    status: 'Surabaya Rail Network',
    is_tier_1: false,
    njop_premium: {
      avg_njop_premium_pct: 9.7,
      ci_lower_pct: 6.8,
      ci_upper_pct: 12.6,
      affected_h3_count: 19,
      r_squared: 0.69,
      direct_effect_pct: 6.8,
      spillover_effect_pct: 2.9
    },
    policy_recommendations: [
      'Revitalisasi koridor heritage kawasan pecinan Kya-Kya dan Jembatan Merah terhubung ke stasiun.',
      'Penambahan titik feeder WiraWiri untuk menghubungkan kawasan bisnis pergudangan.',
      'Perbaikan drainase jalan untuk mengeliminasi genangan saat musim hujan tinggi.'
    ],
    menu_go_recommendations: [
      {
            'name': 'Kupang Lontong Pasar Besar',
            'distance': '120m',
            'price': 'Low',
            'crowd': 'High'
      },
      {
            'name': 'Nasi Bebek Tugu Pahlawan Semut',
            'distance': '280m',
            'price': 'Low',
            'crowd': 'High'
      }
],
    tenant_mix: [
      {
            'label': 'Retail & Grosir',
            'value': 45,
            'color': 'bg-brand-lime'
      },
      {
            'label': 'F&B Heritage',
            'value': 30,
            'color': 'bg-amber-500'
      },
      {
            'label': 'Jasa Ekspedisi',
            'value': 15,
            'color': 'bg-emerald-500'
      },
      {
            'label': 'UMKM Khas',
            'value': 10,
            'color': 'bg-cyan-500'
      }
],
    travel_estimates: [
      {
            'destination': 'Wisata Kota Lama (Kya-Kya)',
            'time': '4 min',
            'icon': 'walk'
      },
      {
            'destination': 'Pasar Atom Mall',
            'time': '6 min',
            'icon': 'walk'
      },
      {
            'destination': 'Jembatan Merah Plaza',
            'time': '8 min',
            'icon': 'feeder'
      }
]
  },
  {
    id: 'wonokromo',
    name: 'Stasiun Wonokromo',
    latitude: -7.3014,
    longitude: 112.7383,
    tod_readiness_score: 76.4,
    scores: {
      density: 82.5,
      diversity: 74.0,
      design: 58.2,
      destination_accessibility: 79.1,
      distance_to_transit: 88.0
    },
    benchmark_scores: {
      density: 77.0,
      diversity: 76.5,
      design: 62.5,
      destination_accessibility: 79.5,
      distance_to_transit: 78.0
    },
    typology: 'Dense Commuter Mixed-Use',
    weakest_dimension: 'Design',
    strongest_dimension: 'Distance to Transit',
    status: 'Focus Area',
    is_tier_1: true,
    njop_premium: {
      avg_njop_premium_pct: 11.5,
      ci_lower_pct: 8.4,
      ci_upper_pct: 14.6,
      affected_h3_count: 19,
      r_squared: 0.72,
      direct_effect_pct: 8.1,
      spillover_effect_pct: 3.4
    },
    policy_recommendations: [
      'Peningkatan kualitas trotoar timur stasiun menuju DTC (Darmo Trade Center) dan frontage Ahmad Yani.',
      'Pembangunan JPO modern atau penyeberangan sebidang ramah pejalan kaki.',
      'Penataan terminal angkutan mikrolet terintegrasi dengan gate stasiun.'
    ],
    menu_go_recommendations: [
      {
            'name': 'Soto Jagalan Wonokromo',
            'distance': '150m',
            'price': 'Low',
            'crowd': 'High'
      },
      {
            'name': 'Tahu Tek Pintu Air Wonokromo',
            'distance': '210m',
            'price': 'Low',
            'crowd': 'Medium'
      }
],
    tenant_mix: [
      {
            'label': 'F&B & Kuliner',
            'value': 42,
            'color': 'bg-brand-lime'
      },
      {
            'label': 'Retail Pakaian DTC',
            'value': 32,
            'color': 'bg-amber-500'
      },
      {
            'label': 'Jasa & Konter',
            'value': 16,
            'color': 'bg-emerald-500'
      },
      {
            'label': 'UMKM Stasiun',
            'value': 10,
            'color': 'bg-cyan-500'
      }
],
    travel_estimates: [
      {
            'destination': 'Royal Plaza Surabaya',
            'time': '5 min',
            'icon': 'walk'
      },
      {
            'destination': 'Darmo Trade Center (DTC)',
            'time': '3 min',
            'icon': 'walk'
      },
      {
            'destination': 'Kebun Binatang Surabaya (KBS)',
            'time': '7 min',
            'icon': 'walk'
      }
]
  },
  {
    id: 'waru',
    name: 'Stasiun Waru',
    latitude: -7.3519,
    longitude: 112.7297,
    tod_readiness_score: 68.3,
    scores: {
      density: 70.0,
      diversity: 65.0,
      design: 52.0,
      destination_accessibility: 71.5,
      distance_to_transit: 83.0
    },
    benchmark_scores: {
      density: 77.0,
      diversity: 76.5,
      design: 62.5,
      destination_accessibility: 79.5,
      distance_to_transit: 78.0
    },
    typology: 'Suburban Feeder Node',
    weakest_dimension: 'Design',
    strongest_dimension: 'Distance to Transit',
    status: 'Surabaya Rail Network',
    is_tier_1: false,
    njop_premium: {
      avg_njop_premium_pct: 8.2,
      ci_lower_pct: 5.5,
      ci_upper_pct: 10.9,
      affected_h3_count: 37,
      r_squared: 0.65,
      direct_effect_pct: 5.9,
      spillover_effect_pct: 2.3
    },
    policy_recommendations: [
      'Pembangunan skywalk pedestrian terintegrasi langsung antara Stasiun Waru dengan Terminal Purabaya sesuai Perda RTRW Surabaya No. 8/2024.',
      'Ekspansi koridor feeder WiraWiri rute selatan Sidoarjo-Surabaya.',
      'Pencegahan titik genangan banjir berkala di persimpangan Bundaran Waru.'
    ],
    menu_go_recommendations: [
      { name: 'Rawon Gajah Waru', distance: '180m', price: 'Medium', crowd: 'High' },
      { name: 'Soto Ayam Lamongan Waru', distance: '220m', price: 'Low', crowd: 'Medium' }
    ],
    tenant_mix: [
      { label: 'Transport / Agent', value: 45, color: 'bg-brand-lime' },
      { label: 'F&B', value: 30, color: 'bg-amber-500' },
      { label: 'Convenience Retail', value: 15, color: 'bg-cyan-500' },
      { label: 'Jasa & Pengiriman', value: 10, color: 'bg-emerald-500' }
    ],
    travel_estimates: [
      { destination: 'Terminal Purabaya (Bungurasih)', time: '5 min', icon: 'walk' },
      { destination: 'City of Tomorrow (CITO)', time: '8 min', icon: 'bus' }
    ]
  },
  {
    id: 'terminal_joyoboyo',
    name: 'Terminal Intermoda Joyoboyo (TIJ)',
    kecamatan: 'Wonokromo',
    latitude: -7.2995,
    longitude: 112.7368,
    tod_readiness_score: 82.4,
    scores: {
      density: 86.0,
      diversity: 84.0,
      design: 75.0,
      destination_accessibility: 88.5,
      distance_to_transit: 92.0
    },
    benchmark_scores: {
      density: 77.0,
      diversity: 76.5,
      design: 62.5,
      destination_accessibility: 79.5,
      distance_to_transit: 78.0
    },
    typology: 'Commercial Transit Hub',
    weakest_dimension: 'Design',
    strongest_dimension: 'Distance to Transit',
    status: 'Focus Area (Hub Intermoda)',
    is_tier_1: true,
    njop_premium: {
      avg_njop_premium_pct: 13.8,
      ci_lower_pct: 10.4,
      ci_upper_pct: 17.2,
      affected_h3_count: 37,
      r_squared: 0.77,
      direct_effect_pct: 9.6,
      spillover_effect_pct: 4.2
    },
    policy_recommendations: [
      'Optimalisasi integrasi intermoda TIJ dengan Stasiun Wonokromo via Skybridge Sawunggaling sesuai Permen ATR/BPN No. 16/2017.',
      'Penyediaan fasilitas park-and-ride berinsentif untuk menekan kendaraan pribadi ke pusat kota.',
      'Pengembangan koridor UMKM kuliner Menu Go di concourse TIJ.'
    ],
    menu_go_recommendations: [
      { name: 'Sentra Kuliner TIJ Joyoboyo', distance: '50m', price: 'Low', crowd: 'High' },
      { name: 'Kopitiam Joyoboyo', distance: '120m', price: 'Medium', crowd: 'Medium' }
    ],
    tenant_mix: [
      { label: 'F&B & Kuliner Halal', value: 45, color: 'bg-brand-lime' },
      { label: 'Retail & Convenience', value: 30, color: 'bg-amber-500' },
      { label: 'Layanan Tiket & Keagenan', value: 15, color: 'bg-cyan-500' },
      { label: 'UMKM Oleh-Oleh', value: 10, color: 'bg-emerald-500' }
    ],
    travel_estimates: [
      { destination: 'Kebun Binatang Surabaya (KBS)', time: '3 min', icon: 'walk' },
      { destination: 'Stasiun Wonokromo', time: '3 min', icon: 'walk' },
      { destination: 'Royal Plaza', time: '6 min', icon: 'bus' }
    ]
  },
  {
    id: 'terminal_purabaya',
    name: 'Terminal Purabaya (Bungurasih)',
    kecamatan: 'Waru / Gayungan',
    latitude: -7.3526,
    longitude: 112.7235,
    tod_readiness_score: 79.8,
    scores: {
      density: 83.0,
      diversity: 82.5,
      design: 68.0,
      destination_accessibility: 85.0,
      distance_to_transit: 94.0
    },
    benchmark_scores: {
      density: 77.0,
      diversity: 76.5,
      design: 62.5,
      destination_accessibility: 79.5,
      distance_to_transit: 78.0
    },
    typology: 'Commercial Transit Hub',
    weakest_dimension: 'Design',
    strongest_dimension: 'Distance to Transit',
    status: 'Focus Area (Hub Antarkota)',
    is_tier_1: true,
    njop_premium: {
      avg_njop_premium_pct: 11.9,
      ci_lower_pct: 8.8,
      ci_upper_pct: 15.0,
      affected_h3_count: 37,
      r_squared: 0.73,
      direct_effect_pct: 8.2,
      spillover_effect_pct: 3.7
    },
    policy_recommendations: [
      'Peningkatan kanopi pelindung pejalan kaki dan sterilisasi jalur drop-off bus antarkota.',
      'Integrasi tiket terusan elektronik multi-operator (Trans Jatim, Suroboyo Bus, dan KAI Commuter).',
      'Peningkatan penerangan malam hari (NTL) di koridor pedestrian penghubung stasiun-terminal.'
    ],
    menu_go_recommendations: [
      { name: 'Pecel Madiun Purabaya', distance: '80m', price: 'Low', crowd: 'High' },
      { name: 'Roti O Concourse Bungurasih', distance: '40m', price: 'Low', crowd: 'High' }
    ],
    tenant_mix: [
      { label: 'F&B Takeaway', value: 40, color: 'bg-brand-lime' },
      { label: 'Minimarket & Retail', value: 35, color: 'bg-amber-500' },
      { label: 'Agen Bus & Logistik', value: 15, color: 'bg-cyan-500' },
      { label: 'Jasa Titip & Charging', value: 10, color: 'bg-emerald-500' }
    ],
    travel_estimates: [
      { destination: 'Stasiun Waru (Skybridge)', time: '5 min', icon: 'walk' },
      { destination: 'Mall CITO Surabaya', time: '7 min', icon: 'bus' },
      { destination: 'Bandara Juanda (Shuttle DAMRI)', time: '20 min', icon: 'car' }
    ]
  },
  {
    id: 'terminal_bratang',
    name: 'Terminal Bratang',
    kecamatan: 'Gubeng',
    latitude: -7.2954,
    longitude: 112.7612,
    tod_readiness_score: 74.5,
    scores: {
      density: 79.0,
      diversity: 76.0,
      design: 64.0,
      destination_accessibility: 78.0,
      distance_to_transit: 86.0
    },
    benchmark_scores: {
      density: 77.0,
      diversity: 76.5,
      design: 62.5,
      destination_accessibility: 79.5,
      distance_to_transit: 78.0
    },
    typology: 'Mixed-Use Residential Area',
    weakest_dimension: 'Design',
    strongest_dimension: 'Distance to Transit',
    status: 'Surabaya Transit Network',
    is_tier_1: false,
    njop_premium: {
      avg_njop_premium_pct: 10.1,
      ci_lower_pct: 7.4,
      ci_upper_pct: 12.8,
      affected_h3_count: 37,
      r_squared: 0.71,
      direct_effect_pct: 7.1,
      spillover_effect_pct: 3.0
    },
    policy_recommendations: [
      'Penataan shelter transit Feeder WiraWiri rute FD07 dan FD11.',
      'Integrasi area kuliner malam Pasar Burung Bratang dengan konsep pedestrian plaza ramah lingkungan.',
      'Perbaikan resapan air dan pemeliharaan pohon peneduh di sekeliling terminal.'
    ],
    menu_go_recommendations: [
      { name: 'Pujasera Bratang Indah', distance: '100m', price: 'Low', crowd: 'Medium' },
      { name: 'Kopi Tiam Taman Flora', distance: '150m', price: 'Low', crowd: 'High' }
    ],
    tenant_mix: [
      { label: 'F&B Lokal', value: 50, color: 'bg-brand-lime' },
      { label: 'Retail Tradisional', value: 25, color: 'bg-amber-500' },
      { label: 'Jasa Servis & Cuci', value: 15, color: 'bg-cyan-500' },
      { label: 'Kios Bunga & Hobi', value: 10, color: 'bg-emerald-500' }
    ],
    travel_estimates: [
      { destination: 'Taman Flora Bratang', time: '3 min', icon: 'walk' },
      { destination: 'Pasar Burung Bratang', time: '4 min', icon: 'walk' },
      { destination: 'Stasiun Surabaya Gubeng', time: '12 min', icon: 'bus' }
    ]
  },
  {
    id: 'tandes',
    name: 'Stasiun Tandes',
    latitude: -7.2590,
    longitude: 112.6870,
    tod_readiness_score: 47.5,
    scores: { density: 50.0, diversity: 55.0, design: 55.0, destination_accessibility: 45.0, distance_to_transit: 50.0 },
    benchmark_scores: { density: 77.0, diversity: 76.5, design: 62.5, destination_accessibility: 79.5, distance_to_transit: 78.0 },
    typology: 'Suburban Commuter & Feeder Priority',
    weakest_dimension: 'Destination Accessibility',
    strongest_dimension: 'Diversity',
    status: 'Surabaya Rail Network',
    is_tier_1: false,
    njop_premium: { avg_njop_premium_pct: 6.5, ci_lower_pct: 4.8, ci_upper_pct: 8.1, affected_h3_count: 19, r_squared: 0.70, direct_effect_pct: 4.5, spillover_effect_pct: 2.0 },
    policy_recommendations: ['Peningkatan frekuensi feeder bus koridor barat Surabaya.'],
    menu_go_recommendations: [
      {
            'name': 'Warung Nasi Campur Tandes',
            'distance': '110m',
            'price': 'Low',
            'crowd': 'Medium'
      },
      {
            'name': 'Bakso Kikil Manukan Tandes',
            'distance': '240m',
            'price': 'Low',
            'crowd': 'High'
      }
],
    tenant_mix: [
      {
            'label': 'Retail & Minimarket',
            'value': 38,
            'color': 'bg-brand-lime'
      },
      {
            'label': 'F&B Lokal',
            'value': 35,
            'color': 'bg-amber-500'
      },
      {
            'label': 'Jasa Bengkel/Teknik',
            'value': 17,
            'color': 'bg-emerald-500'
      },
      {
            'label': 'UMKM Manukan',
            'value': 10,
            'color': 'bg-cyan-500'
      }
],
    travel_estimates: [
      {
            'destination': 'Pasar Tandes',
            'time': '3 min',
            'icon': 'walk'
      },
      {
            'destination': 'Sentra Kuliner Manukan Lor',
            'time': '7 min',
            'icon': 'feeder'
      },
      {
            'destination': 'Kawasan Industri Margomulyo',
            'time': '12 min',
            'icon': 'feeder'
      }
]
  },
  {
    id: 'kandangan',
    name: 'Stasiun Kandangan',
    latitude: -7.2505,
    longitude: 112.6575,
    tod_readiness_score: 48.0,
    scores: { density: 48.0, diversity: 52.0, design: 52.0, destination_accessibility: 42.0, distance_to_transit: 55.0 },
    benchmark_scores: { density: 77.0, diversity: 76.5, design: 62.5, destination_accessibility: 79.5, distance_to_transit: 78.0 },
    typology: 'Suburban Commuter & Feeder Priority',
    weakest_dimension: 'Destination Accessibility',
    strongest_dimension: 'Distance to Transit',
    status: 'Surabaya Rail Network',
    is_tier_1: false,
    njop_premium: { avg_njop_premium_pct: 6.2, ci_lower_pct: 4.6, ci_upper_pct: 7.8, affected_h3_count: 19, r_squared: 0.70, direct_effect_pct: 4.3, spillover_effect_pct: 1.9 },
    policy_recommendations: ['Penyediaan drop-off point feeder terpadu menuju perumahan barat.'],
    menu_go_recommendations: [
      {
            'name': 'Warung Soto Madura Kandangan',
            'distance': '130m',
            'price': 'Low',
            'crowd': 'Medium'
      },
      {
            'name': 'Depot Nasi Pecel Benowo Indah',
            'distance': '260m',
            'price': 'Low',
            'crowd': 'Medium'
      }
],
    tenant_mix: [
      {
            'label': 'Warung & F&B',
            'value': 40,
            'color': 'bg-brand-lime'
      },
      {
            'label': 'Toko Kelontong',
            'value': 32,
            'color': 'bg-amber-500'
      },
      {
            'label': 'Jasa Ekspedisi',
            'value': 18,
            'color': 'bg-emerald-500'
      },
      {
            'label': 'UMKM Sub-Urban',
            'value': 10,
            'color': 'bg-cyan-500'
      }
],
    travel_estimates: [
      {
            'destination': 'Kawasan Pergudangan Margomulyo',
            'time': '8 min',
            'icon': 'feeder'
      },
      {
            'destination': 'Pasar Balongsari',
            'time': '10 min',
            'icon': 'feeder'
      },
      {
            'destination': 'Sentra Wisata Kuliner Kandangan',
            'time': '4 min',
            'icon': 'walk'
      }
]
  },
  {
    id: 'benowo',
    name: 'Stasiun Benowo',
    latitude: -7.2341,
    longitude: 112.6152,
    tod_readiness_score: 50.5,
    scores: { density: 45.0, diversity: 55.0, design: 69.0, destination_accessibility: 40.0, distance_to_transit: 50.8 },
    benchmark_scores: { density: 77.0, diversity: 76.5, design: 62.5, destination_accessibility: 79.5, distance_to_transit: 78.0 },
    typology: 'Suburban Commuter & Feeder Priority',
    weakest_dimension: 'Destination Accessibility',
    strongest_dimension: 'Design',
    status: 'Surabaya Rail Network',
    is_tier_1: false,
    njop_premium: { avg_njop_premium_pct: 7.3, ci_lower_pct: 5.5, ci_upper_pct: 9.1, affected_h3_count: 19, r_squared: 0.70, direct_effect_pct: 5.1, spillover_effect_pct: 2.2 },
    policy_recommendations: ['Integrasi rute shuttle menuju Stadion Gelora Bung Tomo (GBT).'],
    menu_go_recommendations: [
      {
            'name': 'Warung Rawon Pakal Benowo',
            'distance': '140m',
            'price': 'Low',
            'crowd': 'Medium'
      },
      {
            'name': 'Depot Prasmanan Sumber Rejo',
            'distance': '220m',
            'price': 'Low',
            'crowd': 'Medium'
      }
],
    tenant_mix: [
      {
            'label': 'F&B & Warung',
            'value': 44,
            'color': 'bg-brand-lime'
      },
      {
            'label': 'Kelontong / Ritel',
            'value': 30,
            'color': 'bg-amber-500'
      },
      {
            'label': 'Park & Ride',
            'value': 16,
            'color': 'bg-cyan-500'
      },
      {
            'label': 'Jasa Komuter',
            'value': 10,
            'color': 'bg-emerald-500'
      }
],
    travel_estimates: [
      {
            'destination': 'Stadion Gelora Bung Tomo (GBT)',
            'time': '7 min',
            'icon': 'feeder'
      },
      {
            'destination': 'Terminal Benowo',
            'time': '5 min',
            'icon': 'walk'
      },
      {
            'destination': 'Perbatasan Gresik Menganti',
            'time': '12 min',
            'icon': 'feeder'
      }
]
  },
  {
    id: 'ngagel',
    name: 'Stasiun Ngagel',
    latitude: -7.2882,
    longitude: 112.7485,
    tod_readiness_score: 54.9,
    scores: { density: 65.0, diversity: 60.0, design: 58.0, destination_accessibility: 58.0, distance_to_transit: 62.0 },
    benchmark_scores: { density: 77.0, diversity: 76.5, design: 62.5, destination_accessibility: 79.5, distance_to_transit: 78.0 },
    typology: 'Heritage & Mixed Urban Core',
    weakest_dimension: 'Design',
    strongest_dimension: 'Density',
    status: 'Surabaya Rail Network',
    is_tier_1: false,
    njop_premium: { avg_njop_premium_pct: 7.8, ci_lower_pct: 5.8, ci_upper_pct: 9.8, affected_h3_count: 19, r_squared: 0.72, direct_effect_pct: 5.5, spillover_effect_pct: 2.3 },
    policy_recommendations: ['Pemberhentian komuter padat penghubung koridor industri dan perkuliahan.'],
    menu_go_recommendations: [
      {
            'name': 'Kantin Mahasiswa Ngagel',
            'distance': '90m',
            'price': 'Low',
            'crowd': 'High'
      },
      {
            'name': 'Kopi & Toast Baratajaya',
            'distance': '180m',
            'price': 'Medium',
            'crowd': 'Medium'
      }
],
    tenant_mix: [
      {
            'label': 'F&B & Kafe Kampus',
            'value': 46,
            'color': 'bg-brand-lime'
      },
      {
            'label': 'Fotokopi / Jasa Belajar',
            'value': 24,
            'color': 'bg-amber-500'
      },
      {
            'label': 'Retail & Fashion',
            'value': 18,
            'color': 'bg-emerald-500'
      },
      {
            'label': 'UMKM Kuliner',
            'value': 12,
            'color': 'bg-cyan-500'
      }
],
    travel_estimates: [
      {
            'destination': 'Kampus UBAYA Ngagel',
            'time': '5 min',
            'icon': 'walk'
      },
      {
            'destination': 'Marvel City Mall',
            'time': '8 min',
            'icon': 'walk'
      },
      {
            'destination': 'Taman Bratang Flora',
            'time': '7 min',
            'icon': 'feeder'
      }
]
  },
  {
    id: 'margorejo',
    name: 'Stasiun Margorejo',
    latitude: -7.3142,
    longitude: 112.7354,
    tod_readiness_score: 60.1,
    scores: { density: 70.0, diversity: 65.0, design: 60.0, destination_accessibility: 65.0, distance_to_transit: 68.0 },
    benchmark_scores: { density: 77.0, diversity: 76.5, design: 62.5, destination_accessibility: 79.5, distance_to_transit: 78.0 },
    typology: 'Heritage & Mixed Urban Core',
    weakest_dimension: 'Design',
    strongest_dimension: 'Density',
    status: 'Surabaya Rail Network',
    is_tier_1: false,
    njop_premium: { avg_njop_premium_pct: 8.5, ci_lower_pct: 6.4, ci_upper_pct: 10.6, affected_h3_count: 19, r_squared: 0.72, direct_effect_pct: 6.0, spillover_effect_pct: 2.5 },
    policy_recommendations: ['Integrasi trotoar frontage road Jalan Ahmad Yani menuju pusat komersial Marina.'],
    menu_go_recommendations: [
      {
            'name': 'Soto Daging Marina Margorejo',
            'distance': '160m',
            'price': 'Low',
            'crowd': 'High'
      },
      {
            'name': 'Penyetan Mas Bro Frontage',
            'distance': '230m',
            'price': 'Low',
            'crowd': 'Medium'
      }
],
    tenant_mix: [
      {
            'label': 'Pusat Elektronik & Gadget',
            'value': 40,
            'color': 'bg-brand-lime'
      },
      {
            'label': 'F&B Frontage',
            'value': 34,
            'color': 'bg-amber-500'
      },
      {
            'label': 'Jasa Servis HP/Laptop',
            'value': 16,
            'color': 'bg-emerald-500'
      },
      {
            'label': 'Minimarket 24h',
            'value': 10,
            'color': 'bg-cyan-500'
      }
],
    travel_estimates: [
      {
            'destination': 'Plaza Marina Surabaya',
            'time': '4 min',
            'icon': 'walk'
      },
      {
            'destination': 'Masjid Nasional Al-Akbar',
            'time': '10 min',
            'icon': 'feeder'
      },
      {
            'destination': 'RS Bhayangkara H.S. Samsoeri',
            'time': '8 min',
            'icon': 'walk'
      }
]
  },
  {
    id: 'jemursari',
    name: 'Stasiun Jemursari',
    latitude: -7.3276,
    longitude: 112.7335,
    tod_readiness_score: 55.8,
    scores: { density: 68.0, diversity: 62.0, design: 58.0, destination_accessibility: 60.0, distance_to_transit: 64.0 },
    benchmark_scores: { density: 77.0, diversity: 76.5, design: 62.5, destination_accessibility: 79.5, distance_to_transit: 78.0 },
    typology: 'Heritage & Mixed Urban Core',
    weakest_dimension: 'Design',
    strongest_dimension: 'Density',
    status: 'Surabaya Rail Network',
    is_tier_1: false,
    njop_premium: { avg_njop_premium_pct: 7.9, ci_lower_pct: 5.9, ci_upper_pct: 9.9, affected_h3_count: 19, r_squared: 0.72, direct_effect_pct: 5.5, spillover_effect_pct: 2.4 },
    policy_recommendations: ['Penguatan jalur penyeberangan aman pejalan kaki melintasi rel kereta ganda.'],
    menu_go_recommendations: [
      {
            'name': 'Bebek Goreng Jemursari',
            'distance': '140m',
            'price': 'Medium',
            'crowd': 'High'
      },
      {
            'name': 'Depot Nasi Kuning Wonocolo',
            'distance': '210m',
            'price': 'Low',
            'crowd': 'Medium'
      }
],
    tenant_mix: [
      {
            'label': 'Kantor & Perbankan',
            'value': 36,
            'color': 'bg-brand-lime'
      },
      {
            'label': 'F&B Perkantoran',
            'value': 36,
            'color': 'bg-amber-500'
      },
      {
            'label': 'Klinik / Farmasi',
            'value': 18,
            'color': 'bg-emerald-500'
      },
      {
            'label': 'Jasa Kurir',
            'value': 10,
            'color': 'bg-cyan-500'
      }
],
    travel_estimates: [
      {
            'destination': 'Kawasan Perkantoran Jemursari',
            'time': '5 min',
            'icon': 'walk'
      },
      {
            'destination': 'RSI Surabaya Jemursari',
            'time': '9 min',
            'icon': 'feeder'
      },
      {
            'destination': 'Frontage Road Ahmad Yani',
            'time': '3 min',
            'icon': 'walk'
      }
]
  },
  {
    id: 'kertomenanggal',
    name: 'Stasiun Kertomenanggal',
    latitude: -7.3406,
    longitude: 112.7294,
    tod_readiness_score: 57.0,
    scores: { density: 66.0, diversity: 60.0, design: 58.0, destination_accessibility: 58.0, distance_to_transit: 65.0 },
    benchmark_scores: { density: 77.0, diversity: 76.5, design: 62.5, destination_accessibility: 79.5, distance_to_transit: 78.0 },
    typology: 'Heritage & Mixed Urban Core',
    weakest_dimension: 'Design',
    strongest_dimension: 'Density',
    status: 'Surabaya Rail Network',
    is_tier_1: false,
    njop_premium: { avg_njop_premium_pct: 8.0, ci_lower_pct: 6.0, ci_upper_pct: 10.0, affected_h3_count: 19, r_squared: 0.72, direct_effect_pct: 5.6, spillover_effect_pct: 2.4 },
    policy_recommendations: ['Fasilitas park-and-ride komuter perbatasan selatan Surabaya.'],
    menu_go_recommendations: [
      {
            'name': 'Warung Bu Kris Gayungan',
            'distance': '170m',
            'price': 'Medium',
            'crowd': 'High'
      },
      {
            'name': 'Pecel Madiun Menanggal',
            'distance': '220m',
            'price': 'Low',
            'crowd': 'Medium'
      }
],
    tenant_mix: [
      {
            'label': 'F&B Komuter',
            'value': 42,
            'color': 'bg-brand-lime'
      },
      {
            'label': 'Retail & Minimarket',
            'value': 30,
            'color': 'bg-amber-500'
      },
      {
            'label': 'Park & Ride',
            'value': 18,
            'color': 'bg-cyan-500'
      },
      {
            'label': 'Jasa Pengiriman',
            'value': 10,
            'color': 'bg-emerald-500'
      }
],
    travel_estimates: [
      {
            'destination': 'Kampus UNESA Ketintang',
            'time': '8 min',
            'icon': 'feeder'
      },
      {
            'destination': 'Masjid Nasional Al-Akbar',
            'time': '6 min',
            'icon': 'feeder'
      },
      {
            'destination': 'City of Tomorrow (CITO)',
            'time': '7 min',
            'icon': 'feeder'
      }
]
  },
  {
    id: 'sidotopo',
    name: 'Stasiun Sidotopo',
    latitude: -7.2319,
    longitude: 112.7562,
    tod_readiness_score: 65.7,
    scores: { density: 78.0, diversity: 68.0, design: 58.0, destination_accessibility: 65.0, distance_to_transit: 70.0 },
    benchmark_scores: { density: 77.0, diversity: 76.5, design: 62.5, destination_accessibility: 79.5, distance_to_transit: 78.0 },
    typology: 'Dense Urban Commuter Spine',
    weakest_dimension: 'Design',
    strongest_dimension: 'Density',
    status: 'Surabaya Rail Network',
    is_tier_1: false,
    njop_premium: { avg_njop_premium_pct: 9.0, ci_lower_pct: 6.8, ci_upper_pct: 11.2, affected_h3_count: 19, r_squared: 0.74, direct_effect_pct: 6.3, spillover_effect_pct: 2.7 },
    policy_recommendations: ['Optimalisasi kawasan depo KA Sidotopo sebagai transit node terpadu Surabaya Utara.'],
    menu_go_recommendations: [
      {
            'name': 'Sate Madura Pegirian Sidotopo',
            'distance': '130m',
            'price': 'Low',
            'crowd': 'High'
      },
      {
            'name': 'Nasi Krawu Simokerto',
            'distance': '240m',
            'price': 'Low',
            'crowd': 'Medium'
      }
],
    tenant_mix: [
      {
            'label': 'F&B & Kuliner Madura',
            'value': 44,
            'color': 'bg-brand-lime'
      },
      {
            'label': 'Retail Suku Cadang KA',
            'value': 28,
            'color': 'bg-amber-500'
      },
      {
            'label': 'Jasa Ekspedisi',
            'value': 18,
            'color': 'bg-emerald-500'
      },
      {
            'label': 'UMKM Warga',
            'value': 10,
            'color': 'bg-cyan-500'
      }
],
    travel_estimates: [
      {
            'destination': 'Sentra Kuliner Sidotopo Lor',
            'time': '4 min',
            'icon': 'walk'
      },
      {
            'destination': 'Depo Lokomotif Sidotopo',
            'time': '3 min',
            'icon': 'walk'
      },
      {
            'destination': 'Wisata Religi Sunan Ampel',
            'time': '10 min',
            'icon': 'feeder'
      }
]
  },
  {
    id: 'kalimas',
    name: 'Stasiun Kalimas',
    latitude: -7.2199,
    longitude: 112.7350,
    tod_readiness_score: 50.9,
    scores: { density: 52.0, diversity: 55.0, design: 50.0, destination_accessibility: 52.0, distance_to_transit: 54.0 },
    benchmark_scores: { density: 77.0, diversity: 76.5, design: 62.5, destination_accessibility: 79.5, distance_to_transit: 78.0 },
    typology: 'Suburban Commuter & Feeder Priority',
    weakest_dimension: 'Design',
    strongest_dimension: 'Diversity',
    status: 'Surabaya Rail Network',
    is_tier_1: false,
    njop_premium: { avg_njop_premium_pct: 6.8, ci_lower_pct: 5.1, ci_upper_pct: 8.5, affected_h3_count: 19, r_squared: 0.70, direct_effect_pct: 4.8, spillover_effect_pct: 2.0 },
    policy_recommendations: ['Integrasi logistik dan angkutan barang pelabuhan Tanjung Perak.'],
    menu_go_recommendations: [
      {
            'name': 'Warung Nasi Ikan Bakar Perak',
            'distance': '150m',
            'price': 'Medium',
            'crowd': 'Medium'
      },
      {
            'name': 'Kopi Dermaga Kalimas',
            'distance': '180m',
            'price': 'Low',
            'crowd': 'High'
      }
],
    tenant_mix: [
      {
            'label': 'Kantor Logistik & Cargo',
            'value': 48,
            'color': 'bg-brand-lime'
      },
      {
            'label': 'F&B Pekerja Pelabuhan',
            'value': 32,
            'color': 'bg-amber-500'
      },
      {
            'label': 'Retail Kebutuhan Kapal',
            'value': 12,
            'color': 'bg-emerald-500'
      },
      {
            'label': 'Jasa Keagenan',
            'value': 8,
            'color': 'bg-cyan-500'
      }
],
    travel_estimates: [
      {
            'destination': 'Terminal Penumpang Gapura Surya',
            'time': '6 min',
            'icon': 'feeder'
      },
      {
            'destination': 'Pusat Logistik Kalimas',
            'time': '3 min',
            'icon': 'walk'
      },
      {
            'destination': 'Pelabuhan Tanjung Perak',
            'time': '8 min',
            'icon': 'feeder'
      }
]
  },
  {
    id: 'benteng',
    name: 'Stasiun Benteng',
    latitude: -7.2023,
    longitude: 112.7402,
    tod_readiness_score: 47.4,
    scores: { density: 48.0, diversity: 50.0, design: 48.0, destination_accessibility: 46.0, distance_to_transit: 50.0 },
    benchmark_scores: { density: 77.0, diversity: 76.5, design: 62.5, destination_accessibility: 79.5, distance_to_transit: 78.0 },
    typology: 'Suburban Commuter & Feeder Priority',
    weakest_dimension: 'Destination Accessibility',
    strongest_dimension: 'Diversity',
    status: 'Surabaya Rail Network',
    is_tier_1: false,
    njop_premium: { avg_njop_premium_pct: 6.1, ci_lower_pct: 4.5, ci_upper_pct: 7.7, affected_h3_count: 19, r_squared: 0.70, direct_effect_pct: 4.2, spillover_effect_pct: 1.9 },
    policy_recommendations: ['Penyediaan shuttle feeder khusus kawasan pelabuhan dan pangkalan militer.']
  }
];

export async function fetchStations(): Promise<StationData[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/stations?all=true`, { next: { revalidate: 60 } });
    if (res.ok) {
      const summaries: any[] = await res.json();
      // Merge backend data with enrichment fields from fallback (menu_go, tenant_mix, etc.)
      return summaries.map(summary => {
        const enriched = FALLBACK_STATIONS.find(s => s.id === summary.id);
        return {
          ...summary,
          // Keep backend as source-of-truth for core fields, with robust fallback
          scores: summary.scores ?? enriched?.scores ?? { density: 50, diversity: 50, design: 50, destination_accessibility: 50, distance_to_transit: 50 },
          benchmark_scores: summary.benchmark_scores ?? enriched?.benchmark_scores ?? { density: 50, diversity: 50, design: 50, destination_accessibility: 50, distance_to_transit: 50 },
          njop_premium: enriched?.njop_premium ?? summary.njop_premium ?? { avg_njop_premium_pct: 0, ci_lower_pct: 0, ci_upper_pct: 0, affected_h3_count: 0, r_squared: 0, direct_effect_pct: 0, spillover_effect_pct: 0 },
          policy_recommendations: enriched?.policy_recommendations ?? summary.policy_recommendations ?? [],
          // Frontend-only enrichment
          menu_go_recommendations: enriched?.menu_go_recommendations ?? [],
          tenant_mix: enriched?.tenant_mix ?? [],
          travel_estimates: enriched?.travel_estimates ?? [],
        };
      });
    }
  } catch (err) {
    console.warn('Backend offline, using fallback dataset:', err);
  }
  return FALLBACK_STATIONS;
}

export async function fetchStationTOD(stationId: StationId): Promise<StationData> {
  try {
    const res = await fetch(`${API_BASE_URL}/tod-score/${stationId}`);
    if (res.ok) {
      const data = await res.json();
      const enriched = FALLBACK_STATIONS.find(s => s.id === stationId);
      return {
        id: data.station_id,
        name: data.station_name,
        latitude: enriched?.latitude ?? 0,
        longitude: enriched?.longitude ?? 0,
        tod_readiness_score: data.tod_readiness_score,
        scores: data.scores,
        benchmark_scores: data.benchmark_scores,
        typology: data.typology,
        weakest_dimension: data.weakest_dimension,
        strongest_dimension: data.strongest_dimension,
        status: enriched?.status ?? '',
        njop_premium: enriched?.njop_premium ?? { avg_njop_premium_pct: 0, ci_lower_pct: 0, ci_upper_pct: 0, affected_h3_count: 0, r_squared: 0, direct_effect_pct: 0, spillover_effect_pct: 0 },
        policy_recommendations: data.policy_recommendations,
        menu_go_recommendations: enriched?.menu_go_recommendations ?? [],
        tenant_mix: enriched?.tenant_mix ?? [],
        travel_estimates: enriched?.travel_estimates ?? [],
      };
    }
  } catch (err) {
    console.warn(`fetchStationTOD(${stationId}) failed, using fallback:`, err);
  }
  return FALLBACK_STATIONS.find(s => s.id === stationId) ?? FALLBACK_STATIONS[0];
}

export async function fetchH3Grid(stationId?: StationId): Promise<any> {
  try {
    const url = stationId ? `${API_BASE_URL}/h3-grid?station=${stationId}` : `${API_BASE_URL}/h3-grid`;
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend offline, generating client H3 grid:', err);
  }
  
  // Client-side fallback generator
  return generateClientH3Grid(stationId);
}

export async function fetchMapidSurvey(surveyType?: string, missionSubtype?: string, station?: StationId): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (surveyType) params.append('survey_type', surveyType);
    if (missionSubtype) params.append('mission_subtype', missionSubtype);
    if (station) params.append('station', station);

    const res = await fetch(`${API_BASE_URL}/survey-points?${params.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend offline, loading real MAPID survey activities dataset:', err);
  }

  // Load real dataset from public/data/sample_activity_mapid.geojson
  try {
    const res = await fetch('/data/sample_activity_mapid.geojson');
    if (res.ok) return await res.json();
  } catch (e) {}

  return { type: 'FeatureCollection', features: [] };
}

export async function fetchStationIsochrone(
  stationId?: StationId,
  mode?: 'walk' | 'motor' | 'car',
  minutes?: number
): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (stationId) params.append('station', stationId);
    if (mode) params.append('mode', mode);
    if (minutes !== undefined) params.append('minutes', String(minutes));

    const res = await fetch(`${API_BASE_URL}/isochrone?${params.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend /isochrone offline, loading pre-computed client isochrone dataset:', err);
  }

  // Load client-side pre-computed isochrone features
  try {
    const res = await fetch('/data/station_isochrones.json');
    if (res.ok) {
      const allData = await res.json();
      let features = allData.features || [];
      if (stationId) {
        features = features.filter((f: any) => f.properties?.station_id === stationId);
      }
      if (mode) {
        features = features.filter((f: any) => f.properties?.mode === mode);
      }
      if (minutes !== undefined) {
        features = features.filter((f: any) => f.properties?.minutes === minutes);
      }
      return { type: 'FeatureCollection', features };
    }
  } catch (e) {
    console.warn('Failed to load local station_isochrones.json:', e);
  }

  return { type: 'FeatureCollection', features: [] };
}

export async function queryAI(prompt: string, activeStation?: StationId): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, active_station: activeStation })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend offline, using local AI responder:', err);
  }

  // Local fallback responder
  return localAIResponder(prompt, activeStation);
}

export async function simulateScenario(
  targetStation: StationId,
  interventionType: 'feeder_extension' | 'pedestrian_upgrade' | 'mixed_use_rezoning',
  scenarioId: string = 'sim_scenario'
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario_id: scenarioId,
        target_station: targetStation,
        intervention_type: interventionType
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('simulateScenario backend call failed, using client model:', err);
  }

  // Fallback calculation
  const impacts: Record<string, { deltaScore: number; deltaNjop: number; impacts: Record<string, number> }> = {
    feeder_extension: {
      deltaScore: 7.5,
      deltaNjop: 3.2,
      impacts: { distance_to_transit: 12.0, destination_accessibility: 6.5, diversity: 4.0, design: 8.5, density: 2.0 }
    },
    pedestrian_upgrade: {
      deltaScore: 5.2,
      deltaNjop: 2.1,
      impacts: { design: 18.0, destination_accessibility: 5.0, diversity: 2.5, density: 1.5, distance_to_transit: 3.0 }
    },
    mixed_use_rezoning: {
      deltaScore: 6.1,
      deltaNjop: 4.3,
      impacts: { diversity: 15.0, density: 8.0, destination_accessibility: 7.0, design: 4.0, distance_to_transit: 2.0 }
    }
  };
  const imp = impacts[interventionType] || impacts.feeder_extension;
  const st = FALLBACK_STATIONS.find(s => s.id === targetStation) || FALLBACK_STATIONS[0];
  return {
    scenario_id: scenarioId,
    target_station: targetStation,
    baseline_tod_score: st.tod_readiness_score,
    simulated_tod_score: +(st.tod_readiness_score + imp.deltaScore).toFixed(1),
    delta_tod_score: imp.deltaScore,
    baseline_njop_premium_pct: st.njop_premium.avg_njop_premium_pct,
    simulated_njop_premium_pct: +(st.njop_premium.avg_njop_premium_pct + imp.deltaNjop).toFixed(1),
    delta_njop_premium_pct: imp.deltaNjop,
    dimension_impacts: imp.impacts,
    summary_narrative: `Intervensi ${interventionType.replace('_', ' ')} pada simpul ${st.name} meningkatkan kesiapan TOD dari ${st.tod_readiness_score} ke ${+(st.tod_readiness_score + imp.deltaScore).toFixed(1)} (+${imp.deltaScore} poin).`
  };
}

export async function calculateAHP(scores: any, pairwiseMatrix?: number[][]): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/ahp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scores, pairwise_matrix: pairwiseMatrix })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('calculateAHP backend call failed:', err);
  }
  return null;
}

export async function estimateSDM(todScore: number, distanceM: number = 250): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/sdm-estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tod_score: todScore, distance_to_station_m: distanceM })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('estimateSDM backend call failed:', err);
  }
  return null;
}

export async function classifyTypology(scores: any, todScore?: number): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/typology`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scores, tod_readiness_score: todScore })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('classifyTypology backend call failed:', err);
  }
  return null;
}

function generateClientH3Grid(stationId?: StationId) {
  const targetStations = stationId 
    ? FALLBACK_STATIONS.filter(s => s.id === stationId)
    : FALLBACK_STATIONS;

  const cellMap = new Map<string, any>();

  targetStations.forEach(s => {
    const hexRadiusKm = 0.18;
    // Center cell
    const centerFeature = createHexFeature(s.id, s.name, s.longitude, s.latitude, s.tod_readiness_score, s.njop_premium.avg_njop_premium_pct, s.typology, 0, 0);
    const centerKey = `${Math.round(s.latitude * 350)},${Math.round(s.longitude * 350)}`;
    cellMap.set(centerKey, centerFeature);

    // 37 cells total per station (Center + 3 hexagonal rings = ~1.000m TOD catchment)
    for (let r = 1; r <= 3; r++) {
      for (let side = 0; side < 6; side++) {
        for (let step = 0; step < r; step++) {
          const angle1 = (60 * side) * (Math.PI / 180);
          const angle2 = (60 * ((side + 2) % 6)) * (Math.PI / 180);
          const dx = ((r - step) * Math.cos(angle1) + step * Math.cos(angle2)) * (hexRadiusKm * Math.sqrt(3));
          const dy = ((r - step) * Math.sin(angle1) + step * Math.sin(angle2)) * (hexRadiusKm * Math.sqrt(3));
          
          const latOffset = dy / 111.0;
          const lonOffset = dx / (111.0 * Math.cos(s.latitude * (Math.PI / 180)));
          
          const cellLon = +(s.longitude + lonOffset).toFixed(6);
          const cellLat = +(s.latitude + latOffset).toFixed(6);
          const decay = Math.max(0.55, +(1.0 - (r * 0.07)).toFixed(2));
          const cellScore = +(s.tod_readiness_score * decay).toFixed(1);
          const cellNjop = +(s.njop_premium.avg_njop_premium_pct * decay).toFixed(1);
          
          const spatialKey = `${Math.round(cellLat * 350)},${Math.round(cellLon * 350)}`;
          const existing = cellMap.get(spatialKey);

          const newFeature = createHexFeature(s.id, s.name, cellLon, cellLat, cellScore, cellNjop, s.typology, r, cellMap.size + 1);

          if (!existing) {
            cellMap.set(spatialKey, newFeature);
          } else {
            // Spatial Tie-Breaking:
            // Prefer the closer station (lower ring distance)
            const existingRing = existing.properties.ring_distance;
            const existingScore = existing.properties.tod_readiness_score;

            if (!existing.properties.overlapping_stations) {
              existing.properties.overlapping_stations = [existing.properties.station_cluster];
            }
            if (!existing.properties.overlapping_stations.includes(s.id)) {
              existing.properties.overlapping_stations.push(s.id);
            }
            existing.properties.is_shared_catchment = true;

            if (r < existingRing || (r === existingRing && cellScore > existingScore)) {
              newFeature.properties.overlapping_stations = existing.properties.overlapping_stations;
              newFeature.properties.is_shared_catchment = true;
              cellMap.set(spatialKey, newFeature);
            }
          }
        }
      }
    }
  });

  return { type: 'FeatureCollection', features: Array.from(cellMap.values()) };
}

function createHexFeature(stId: string, stName: string, lon: number, lat: number, score: number, njop: number, typology: string, ring: number, idx: number) {
  const coords: number[][] = [];
  const radiusKm = 0.17;
  const latDegPerKm = 1.0 / 111.0;
  const lonDegPerKm = 1.0 / (111.0 * Math.cos(lat * (Math.PI / 180)));

  for (let i = 0; i < 6; i++) {
    const angleRad = (60 * i - 30) * (Math.PI / 180);
    const dLat = radiusKm * Math.sin(angleRad) * latDegPerKm;
    const dLon = radiusKm * Math.cos(angleRad) * lonDegPerKm;
    coords.push([+(lon + dLon).toFixed(6), +(lat + dLat).toFixed(6)]);
  }
  const stBaseH3: Record<string, string> = {
    gubeng: '898d80835d3ffff',
    pasar_turi: '898d8083113ffff',
    semut: '898d8083037ffff',
    wonokromo: '898d80824dbffff',
    waru: '898d8090d73ffff',
    tandes: '898d8080503ffff',
    kandangan: '898d8080ccfffff',
    benowo: '898d808096bffff',
    ngagel: '898d809196bffff',
    margorejo: '898d8090a2fffff',
    jemursari: '898d809086fffff',
    kertomenanggal: '898d8090837ffff',
    kalimas: '898d808337bffff',
    benteng: '898d8083227ffff',
    sidotopo: '898d8083053ffff',
  };
  const centerHex = stBaseH3[stId] || '898d80835d3ffff';
  const h3Index = idx === 0 ? centerHex : `${centerHex.slice(0, 11)}${idx.toString(16).padStart(2, '0')}ffff`;
  return {
    type: 'Feature',
    id: h3Index,
    properties: {
      h3_index: h3Index,
      station_cluster: stId,
      station_name: stName,
      ring_distance: ring,
      tod_readiness_score: score,
      density_score: +(score * 1.05).toFixed(1),
      diversity_score: +(score * 0.98).toFixed(1),
      design_score: +(score * 0.85).toFixed(1),
      destination_score: +(score * 1.02).toFixed(1),
      distance_score: +(100 - ring * 12).toFixed(1),
      typology,
      predicted_njop_premium_pct: njop,
      ci_lower_pct: +(njop * 0.75).toFixed(1),
      ci_upper_pct: +(njop * 1.25).toFixed(1),
      njop_m2: Math.round(8500000 * (1 + njop / 100)),
      overlapping_stations: [stId],
      is_shared_catchment: false
    },
    geometry: {
      type: 'Polygon',
      coordinates: [coords]
    }
  };
}

function localAIResponder(prompt: string, activeStation?: StationId) {
  const p = prompt.toLowerCase();
  
  // 1. Detect target station from prompt or activeStation
  let matchedId: StationId = activeStation || 'gubeng';
  if (p.includes('gubeng') || p.includes('sgu')) matchedId = 'gubeng';
  else if (p.includes('pasar turi') || p.includes('pasarturi') || p.includes('turi') || p.includes('sbi')) matchedId = 'pasar_turi';
  else if (p.includes('semut') || p.includes('surabaya kota') || p.includes('kota')) matchedId = 'semut';
  else if (p.includes('wonokromo') || p.includes('wo')) matchedId = 'wonokromo';
  else if (p.includes('waru') || p.includes('wr')) matchedId = 'waru';

  const st = FALLBACK_STATIONS.find(s => s.id === matchedId) || FALLBACK_STATIONS[0];

  if (p.includes('bandingkan') || p.includes('compare')) {
    const otherSt = matchedId === 'gubeng' ? FALLBACK_STATIONS[3] : FALLBACK_STATIONS[0]; // Wonokromo vs Gubeng
    return {
      status: 'success',
      data: {
        action: 'compare_stations',
        target_station: st.id,
        view_state: { center: [st.longitude, st.latitude], zoom: 12.5 },
        text_response: `Perbandingan menunjukkan **${st.name} (Skor TOD ${st.tod_readiness_score})** memiliki kesiapan ${st.tod_readiness_score >= otherSt.tod_readiness_score ? 'lebih tinggi' : 'berbeda'} dibanding **${otherSt.name} (Skor TOD ${otherSt.tod_readiness_score})**. Dimensi terlemah di ${st.name} adalah **${st.weakest_dimension}**, sedangkan di ${otherSt.name} adalah **${otherSt.weakest_dimension}**.`
      }
    };
  }

  if (p.includes('terlemah') || p.includes('weakest')) {
    return {
      status: 'success',
      data: {
        action: 'highlight_and_zoom',
        target_station: st.id,
        view_state: { center: [st.longitude, st.latitude], zoom: 14.5 },
        text_response: `Dimensi terlemah di **${st.name}** adalah **${st.weakest_dimension}** (${st.scores[st.weakest_dimension.toLowerCase() as keyof typeof st.scores] ?? 'Perlu Peningkatan'} / 100). Intervensi prioritas: ${st.policy_recommendations[0]}`
      }
    };
  }

  if (p.includes('nilai tanah') || p.includes('njop') || p.includes('harga') || p.includes('premium')) {
    return {
      status: 'success',
      data: {
        action: 'highlight_and_zoom',
        target_layer: 'h3_njop_premium',
        target_station: st.id,
        view_state: { center: [st.longitude, st.latitude], zoom: 14.2 },
        text_response: `Berdasarkan estimasi Spatial Durbin Model (SDM) pada radius 250-400m di sekitar **${st.name}**, kesiapan TOD saat ini adalah **${st.tod_readiness_score} / 100** dengan potensi kenaikan nilai lahan (**%ΔNJOP**) rata-rata **+${st.njop_premium.avg_njop_premium_pct}%** (CI 95%: ${st.njop_premium.ci_lower_pct}% – ${st.njop_premium.ci_upper_pct}%) pasca penguatan koridor transit dan pedestrian.`
      }
    };
  }

  return {
    status: 'success',
    data: {
      action: 'highlight_and_zoom',
      target_station: st.id,
      view_state: { center: [st.longitude, st.latitude], zoom: 14.5 },
      text_response: `Kawasan **${st.name}** memiliki **TOD Readiness Score ${st.tod_readiness_score}** (${st.status}). Dimensi terkuat: *${st.strongest_dimension}*, terlemah: *${st.weakest_dimension}*. Rekomendasi: ${st.policy_recommendations[0]}`
    }
  };
}

export async function fetchTransitNodes(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/layers/transit-nodes`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend offline, loading real Halte Surabaya dataset:', err);
  }
  try {
    const res = await fetch('/data/halte_surabaya.geojson');
    if (res.ok) return await res.json();
  } catch (e) {}
  return { type: 'FeatureCollection', features: [] };
}

export async function fetchFloodHazard(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/layers/flood-hazard`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend offline, loading real Banjir Surabaya dataset:', err);
  }
  try {
    const res = await fetch('/data/banjir_surabaya.geojson');
    if (res.ok) return await res.json();
  } catch (e) {}
  return { type: 'FeatureCollection', features: [] };
}

export async function fetchNighttimeLight(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/layers/nighttime-light`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend offline, loading real Nighttime Light dataset:', err);
  }
  try {
    const res = await fetch('/data/nighttime_light_surabaya.geojson');
    if (res.ok) return await res.json();
  } catch (e) {}
  return { type: 'FeatureCollection', features: [] };
}

export async function fetchStationsLayer(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/layers/stations`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend offline, loading real Stasiun Surabaya dataset:', err);
  }
  try {
    const res = await fetch('/data/stasiun_surabaya.geojson');
    if (res.ok) return await res.json();
  } catch (e) {}
  return { type: 'FeatureCollection', features: [] };
}

export async function fetchTransitRoutes(stationId?: string): Promise<any> {
  try {
    const url = stationId 
      ? `${API_BASE_URL}/layers/transit-routes?station_id=${encodeURIComponent(stationId)}`
      : `${API_BASE_URL}/layers/transit-routes`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend offline, loading real Trayek Surabaya dataset:', err);
  }
  try {
    const res = await fetch('/data/trayek_surabaya.geojson');
    if (res.ok) {
      const data = await res.json();
      if (stationId) {
        const st_id = stationId.toLowerCase().trim();
        return {
          ...data,
          features: data.features.filter((f: any) =>
            f.properties?.connected_station_ids?.includes(st_id)
          )
        };
      }
      return data;
    }
  } catch (e) {}
  return { type: 'FeatureCollection', features: [] };
}

export async function fetchShoppingCenters(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/layers/shopping-centers`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend offline, loading real Pusat Perbelanjaan dataset:', err);
  }
  try {
    const res = await fetch('/data/pusat_perbelanjaan_surabaya.geojson');
    if (res.ok) return await res.json();
  } catch (e) {}
  return { type: 'FeatureCollection', features: [] };
}

export async function fetchGistaru(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/layers/gistaru`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend offline, loading real GISTARU Pola Ruang dataset:', err);
  }
  try {
    const res = await fetch('/data/gistaru_pola_ruang_surabaya.geojson');
    if (res.ok) return await res.json();
  } catch (e) {}
  return { type: 'FeatureCollection', features: [] };
}

export async function fetchBhumi(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/layers/bhumi`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend offline, loading real BHUMI Persil dataset:', err);
  }
  try {
    const res = await fetch('/data/bhumi_persil_surabaya.geojson');
    if (res.ok) return await res.json();
  } catch (e) {}
  return { type: 'FeatureCollection', features: [] };
}

export async function fetchStationRealPOIs(stationId: string): Promise<any[]> {
  try {
    const res = await fetch('/data/station_real_pois.json');
    if (res.ok) {
      const data = await res.json();
      return data[stationId] || [];
    }
  } catch (err) {
    console.warn('fetchStationRealPOIs error:', err);
  }
  return [];
}

export const FALLBACK_INTERMODAL_PLANS: Record<string, any[]> = {
  gubeng: [
    {
      destination: 'Grand City Mall & Balai Kota',
      total_time: '9 min',
      total_distance_km: 1.4,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'fd02',
      modes_used: ['walk', 'feeder'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki ke Halte Stasiun Gubeng Barat', duration: '2 min', distance: '140m' },
        { mode: 'feeder', line_code: 'FD02', line_color: '#8c2f31', desc: 'Naik Feeder WiraWiri FD02 arah Balai Kota (3 halte)', duration: '5 min', distance: '1.1 km' },
        { mode: 'walk', desc: 'Jalan kaki ke Grand City / Balai Kota', duration: '2 min', distance: '160m' }
      ]
    },
    {
      destination: 'RSUD Dr. Soetomo & UNAIR Kampus B',
      total_time: '11 min',
      total_distance_km: 1.8,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'tmk2',
      modes_used: ['walk', 'bus'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki ke Halte RSGM Prof. Moestopo', duration: '2 min', distance: '100m' },
        { mode: 'bus', line_code: 'R2', line_color: '#2f87a0', desc: 'Naik Trans Semanggi R2 arah Kejawan (4 halte)', duration: '7 min', distance: '1.5 km' },
        { mode: 'walk', desc: 'Tiba di RSUD Dr. Soetomo Gate Dharmawangsa', duration: '2 min', distance: '200m' }
      ]
    },
    {
      destination: 'Tunjungan Plaza / Koridor Tunjungan',
      total_time: '14 min',
      total_distance_km: 2.5,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'fd07',
      modes_used: ['walk', 'feeder'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki ke Halte Gubeng Pojok', duration: '3 min', distance: '180m' },
        { mode: 'feeder', line_code: 'FD07', line_color: '#4165ad', desc: 'Naik Feeder WiraWiri FD07 arah Pasar Turi (5 halte)', duration: '9 min', distance: '2.1 km' },
        { mode: 'walk', desc: 'Jalan kaki menyeberang ke Tunjungan Plaza', duration: '2 min', distance: '150m' }
      ]
    }
  ],
  pasar_turi: [
    {
      destination: 'Tugu Pahlawan & Kawasan Bersejarah',
      total_time: '7 min',
      total_distance_km: 1.1,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'fd07',
      modes_used: ['walk', 'feeder'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki ke Halte Gate St. Pasar Turi', duration: '1 min', distance: '50m' },
        { mode: 'feeder', line_code: 'FD07', line_color: '#4165ad', desc: 'Naik Feeder WiraWiri FD07 arah Bratang (2 halte)', duration: '4 min', distance: '900m' },
        { mode: 'walk', desc: 'Jalan kaki ke Monumen Tugu Pahlawan', duration: '2 min', distance: '150m' }
      ]
    },
    {
      destination: 'Pusat Grosir Surabaya (PGS) & Pasar Turi Baru',
      total_time: '4 min',
      total_distance_km: 0.3,
      fare: 'Gratis (Pedestrian)',
      route_id: 'fd07',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki melalui jalur pedestrian berkanopi Jalan Dupak', duration: '4 min', distance: '280m' }
      ]
    }
  ],
  wonokromo: [
    {
      destination: 'Kebun Binatang Surabaya (KBS)',
      total_time: '5 min',
      total_distance_km: 0.4,
      fare: 'Gratis (Pedestrian)',
      route_id: 'sbr1',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki dari pintu utara stasiun menyeberang Jembatan Sawunggaling', duration: '5 min', distance: '350m' }
      ]
    },
    {
      destination: 'Terminal Intermoda Joyoboyo (TIJ)',
      total_time: '3 min',
      total_distance_km: 0.2,
      fare: 'Gratis (Pedestrian)',
      route_id: 'fd03',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki melintasi skywalk intermoda menuju concourse bus TIJ', duration: '3 min', distance: '180m' }
      ]
    },
    {
      destination: 'Royal Plaza Surabaya',
      total_time: '5 min',
      total_distance_km: 0.4,
      fare: 'Gratis (Pedestrian)',
      route_id: 'sbr1',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki menyusuri trotoar Jalan Ahmad Yani menuju lobby Royal Plaza', duration: '5 min', distance: '400m' }
      ]
    }
  ],
  semut: [
    {
      destination: 'Kawasan Kota Lama (Jembatan Merah)',
      total_time: '6 min',
      total_distance_km: 0.9,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'fd04',
      modes_used: ['walk', 'feeder'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki ke Halte Stasiun Surabaya Kota', duration: '1 min', distance: '60m' },
        { mode: 'feeder', line_code: 'FD04', line_color: '#8f6768', desc: 'Naik Feeder WiraWiri FD04 arah Kota Lama (2 halte)', duration: '3 min', distance: '750m' },
        { mode: 'walk', desc: 'Tiba di Zona Eropa Kota Lama / Jembatan Merah', duration: '2 min', distance: '100m' }
      ]
    },
    {
      destination: 'House of Sampoerna Heritage',
      total_time: '7 min',
      total_distance_km: 1.2,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'fd04',
      modes_used: ['walk', 'feeder'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki ke Halte Stasiun Surabaya Kota', duration: '1 min', distance: '60m' },
        { mode: 'feeder', line_code: 'FD04', line_color: '#8f6768', desc: 'Naik Feeder FD04 turun di Halte Taman Sampoerna', duration: '4 min', distance: '1.0 km' },
        { mode: 'walk', desc: 'Tiba di Museum House of Sampoerna', duration: '2 min', distance: '120m' }
      ]
    }
  ],
  waru: [
    {
      destination: 'Terminal Purabaya (Bungurasih)',
      total_time: '5 min',
      total_distance_km: 0.3,
      fare: 'Gratis (Pedestrian Skybridge)',
      route_id: 'sbr1',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki melintasi skybridge intermoda Stasiun Waru ke Terminal Bungurasih', duration: '5 min', distance: '300m' }
      ]
    },
    {
      destination: 'City of Tomorrow Mall (CITO)',
      total_time: '8 min',
      total_distance_km: 0.9,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'sbr1',
      modes_used: ['walk', 'bus'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki ke Halte Waru 1', duration: '2 min', distance: '120m' },
        { mode: 'bus', line_code: 'SB1', line_color: '#10b981', desc: 'Naik Suroboyo Bus Koridor 1 arah Rajawali', duration: '4 min', distance: '700m' },
        { mode: 'walk', desc: 'Tiba di lobby CITO Mall', duration: '2 min', distance: '100m' }
      ]
    }
  ],
  terminal_joyoboyo: [
    {
      destination: 'Kebun Binatang Surabaya (KBS)',
      total_time: '3 min',
      total_distance_km: 0.2,
      fare: 'Gratis (Pedestrian)',
      route_id: 'fd03',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki langsung dari lobby TIJ menyeberang ke gerbang selatan KBS', duration: '3 min', distance: '180m' }
      ]
    },
    {
      destination: 'Stasiun Wonokromo (Integrasi Kereta)',
      total_time: '4 min',
      total_distance_km: 0.3,
      fare: 'Gratis (Skybridge)',
      route_id: 'fd03',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Melintasi Jembatan Penyeberangan Sawunggaling menuju peron Stasiun Wonokromo', duration: '4 min', distance: '280m' }
      ]
    },
    {
      destination: 'Tunjungan Plaza via Koridor 1',
      total_time: '18 min',
      total_distance_km: 4.8,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'sbr1',
      modes_used: ['bus', 'walk'],
      steps: [
        { mode: 'bus', line_code: 'SB1', line_color: '#10b981', desc: 'Naik Suroboyo Bus dari Halte TIJ arah Rajawali (7 halte)', duration: '15 min', distance: '4.6 km' },
        { mode: 'walk', desc: 'Turun di Halte Kaliasin / Tunjungan Plaza', duration: '3 min', distance: '200m' }
      ]
    }
  ],
  terminal_purabaya: [
    {
      destination: 'Stasiun Waru (KAI Commuter)',
      total_time: '5 min',
      total_distance_km: 0.4,
      fare: 'Gratis (Skywalk)',
      route_id: 'sbr1',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki lewat Skywalk penghubung concourse bus antarkota ke peron Stasiun Waru', duration: '5 min', distance: '350m' }
      ]
    },
    {
      destination: 'Pusat Kota Surabaya (Tunjungan)',
      total_time: '26 min',
      total_distance_km: 11.2,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'sbr1',
      modes_used: ['bus', 'walk'],
      steps: [
        { mode: 'bus', line_code: 'SB1', line_color: '#10b981', desc: 'Naik Suroboyo Bus Koridor 1 langsung dari shelter keberangkatan Purabaya', duration: '24 min', distance: '11 km' },
        { mode: 'walk', desc: 'Turun di Halte Basuki Rahmat', duration: '2 min', distance: '150m' }
      ]
    }
  ],
  terminal_bratang: [
    {
      destination: 'Taman Flora & Edukasi Bratang',
      total_time: '3 min',
      total_distance_km: 0.2,
      fare: 'Gratis (Pedestrian)',
      route_id: 'fd11',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki dari peron feeder ke gerbang utama Taman Flora Bratang', duration: '3 min', distance: '150m' }
      ]
    },
    {
      destination: 'Stasiun Surabaya Gubeng',
      total_time: '14 min',
      total_distance_km: 3.6,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'fd07',
      modes_used: ['feeder', 'walk'],
      steps: [
        { mode: 'feeder', line_code: 'FD07', line_color: '#4165ad', desc: 'Naik Feeder WiraWiri FD07 arah Pasar Turi (6 halte)', duration: '12 min', distance: '3.4 km' },
        { mode: 'walk', desc: 'Turun di Halte Gubeng Barat / Lobby Stasiun', duration: '2 min', distance: '150m' }
      ]
    }
  ],
  tandes: [
    {
      destination: 'Pasar Tandes & Sentra Niaga',
      total_time: '4 min',
      total_distance_km: 0.3,
      fare: 'Gratis (Pedestrian)',
      route_id: 'fd01',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki menyusuri trotoar Jl. Darmo Indah', duration: '4 min', distance: '280m' }
      ]
    },
    {
      destination: 'Sentra Kuliner Manukan Lor',
      total_time: '8 min',
      total_distance_km: 1.5,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'fd01',
      modes_used: ['walk', 'feeder'],
      steps: [
        { mode: 'walk', desc: 'Jalan ke Halte St. Tandes', duration: '1 min', distance: '60m' },
        { mode: 'feeder', line_code: 'FD01', line_color: '#3b82f6', desc: 'Naik WiraWiri FD01 arah Manukan (3 halte)', duration: '6 min', distance: '1.4 km' },
        { mode: 'walk', desc: 'Tiba di Sentra Kuliner Manukan', duration: '1 min', distance: '50m' }
      ]
    }
  ],
  kandangan: [
    {
      destination: 'Sentra Wisata Kuliner Kandangan',
      total_time: '5 min',
      total_distance_km: 0.4,
      fare: 'Gratis (Pedestrian)',
      route_id: 'fd01',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki ke SWK Kandangan Barat', duration: '5 min', distance: '380m' }
      ]
    },
    {
      destination: 'Kawasan Pergudangan Margomulyo',
      total_time: '9 min',
      total_distance_km: 2.2,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'fd08',
      modes_used: ['walk', 'feeder'],
      steps: [
        { mode: 'walk', desc: 'Ke Halte St. Kandangan', duration: '2 min', distance: '100m' },
        { mode: 'feeder', line_code: 'FD08', line_color: '#6366f1', desc: 'Naik WiraWiri FD08 arah Margomulyo (4 halte)', duration: '7 min', distance: '2.1 km' }
      ]
    }
  ],
  benowo: [
    {
      destination: 'Stadion Gelora Bung Tomo (GBT)',
      total_time: '8 min',
      total_distance_km: 2.8,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'fd08',
      modes_used: ['walk', 'feeder'],
      steps: [
        { mode: 'walk', desc: 'Jalan ke Halte St. Benowo', duration: '1 min', distance: '80m' },
        { mode: 'feeder', line_code: 'FD08', line_color: '#f59e0b', desc: 'Naik Shuttle WiraWiri GBT (langsung)', duration: '6 min', distance: '2.6 km' },
        { mode: 'walk', desc: 'Tiba di Gerbang Utama Stadion GBT', duration: '1 min', distance: '100m' }
      ]
    },
    {
      destination: 'Terminal Benowo',
      total_time: '6 min',
      total_distance_km: 0.5,
      fare: 'Gratis (Pedestrian)',
      route_id: 'fd08',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki ke Terminal Bus Benowo', duration: '6 min', distance: '450m' }
      ]
    }
  ],
  ngagel: [
    {
      destination: 'Kampus UBAYA Ngagel',
      total_time: '5 min',
      total_distance_km: 0.4,
      fare: 'Gratis (Pedestrian)',
      route_id: 'fd03',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki menuju gerbang Kampus UBAYA Ngagel', duration: '5 min', distance: '380m' }
      ]
    },
    {
      destination: 'Marvel City Mall',
      total_time: '8 min',
      total_distance_km: 0.8,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'fd03',
      modes_used: ['walk', 'feeder'],
      steps: [
        { mode: 'walk', desc: 'Ke Halte St. Ngagel', duration: '2 min', distance: '120m' },
        { mode: 'feeder', line_code: 'FD03', line_color: '#14b8a6', desc: 'Naik WiraWiri FD03 (2 halte)', duration: '5 min', distance: '650m' }
      ]
    }
  ],
  margorejo: [
    {
      destination: 'Plaza Marina Surabaya',
      total_time: '4 min',
      total_distance_km: 0.3,
      fare: 'Gratis (Pedestrian)',
      route_id: 'sbr1',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki menyeberang ke Plaza Marina', duration: '4 min', distance: '260m' }
      ]
    },
    {
      destination: 'RS Bhayangkara H.S. Samsoeri',
      total_time: '8 min',
      total_distance_km: 0.7,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'sbr1',
      modes_used: ['walk', 'bus'],
      steps: [
        { mode: 'walk', desc: 'Ke Halte Margorejo Frontage', duration: '2 min', distance: '150m' },
        { mode: 'bus', line_code: 'SBR1', line_color: '#ef4444', desc: 'Naik Suroboyo Bus Koridor 1 arah utara (1 halte)', duration: '4 min', distance: '500m' }
      ]
    }
  ],
  jemursari: [
    {
      destination: 'Kawasan Perkantoran Jemursari',
      total_time: '5 min',
      total_distance_km: 0.4,
      fare: 'Gratis (Pedestrian)',
      route_id: 'fd04',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki ke koridor perbankan Jemursari', duration: '5 min', distance: '350m' }
      ]
    },
    {
      destination: 'RSI Surabaya Jemursari',
      total_time: '9 min',
      total_distance_km: 1.8,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'fd04',
      modes_used: ['walk', 'feeder'],
      steps: [
        { mode: 'walk', desc: 'Ke Halte Komuter Jemursari', duration: '2 min', distance: '100m' },
        { mode: 'feeder', line_code: 'FD04', line_color: '#10b981', desc: 'Naik WiraWiri FD04 arah Jemursari (3 halte)', duration: '6 min', distance: '1.6 km' }
      ]
    }
  ],
  kertomenanggal: [
    {
      destination: 'Kampus UNESA Ketintang',
      total_time: '8 min',
      total_distance_km: 1.6,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'fd06',
      modes_used: ['walk', 'feeder'],
      steps: [
        { mode: 'walk', desc: 'Ke Halte Dukuh Menanggal', duration: '2 min', distance: '140m' },
        { mode: 'feeder', line_code: 'FD06', line_color: '#a855f7', desc: 'Naik WiraWiri FD06 arah UNESA (3 halte)', duration: '5 min', distance: '1.4 km' }
      ]
    },
    {
      destination: 'Masjid Nasional Al-Akbar',
      total_time: '6 min',
      total_distance_km: 1.1,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'fd06',
      modes_used: ['walk', 'feeder'],
      steps: [
        { mode: 'walk', desc: 'Ke Halte Menanggal', duration: '2 min', distance: '110m' },
        { mode: 'feeder', line_code: 'FD06', line_color: '#a855f7', desc: 'Naik WiraWiri FD06 (2 halte)', duration: '4 min', distance: '950m' }
      ]
    }
  ],
  sidotopo: [
    {
      destination: 'Depo Lokomotif & Sentra Sidotopo',
      total_time: '3 min',
      total_distance_km: 0.2,
      fare: 'Gratis (Pedestrian)',
      route_id: 'fd10',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki ke pintu gerbang Depo Sidotopo', duration: '3 min', distance: '200m' }
      ]
    },
    {
      destination: 'Kawasan Wisata Religi Sunan Ampel',
      total_time: '9 min',
      total_distance_km: 1.5,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'fd10',
      modes_used: ['walk', 'feeder'],
      steps: [
        { mode: 'walk', desc: 'Ke Halte Sidotopo Kidul', duration: '2 min', distance: '120m' },
        { mode: 'feeder', line_code: 'FD10', line_color: '#f43f5e', desc: 'Naik WiraWiri FD10 arah Ampel (3 halte)', duration: '6 min', distance: '1.3 km' }
      ]
    }
  ],
  kalimas: [
    {
      destination: 'Pusat Logistik & Pergudangan Kalimas',
      total_time: '4 min',
      total_distance_km: 0.3,
      fare: 'Gratis (Pedestrian)',
      route_id: 'fd11',
      modes_used: ['walk'],
      steps: [
        { mode: 'walk', desc: 'Jalan kaki ke area kantor logistik peti kemas', duration: '4 min', distance: '250m' }
      ]
    },
    {
      destination: 'Terminal Penumpang Gapura Surya Nusantara',
      total_time: '7 min',
      total_distance_km: 1.4,
      fare: 'Rp 5.000 (Integrasi)',
      route_id: 'fd11',
      modes_used: ['walk', 'feeder'],
      steps: [
        { mode: 'walk', desc: 'Ke Halte Kalimas Baru', duration: '2 min', distance: '100m' },
        { mode: 'feeder', line_code: 'FD11', line_color: '#64748b', desc: 'Naik WiraWiri FD11 ke Gapura Surya (2 halte)', duration: '5 min', distance: '1.3 km' }
      ]
    }
  ],
};

export async function fetchIntermodalRoutes(stationId: StationId): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/transit/intermodal-routes/${stationId}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.plans && data.plans.length > 0) return data;
    }
  } catch (err) {
    // Backend offline fallback handled below
  }
  
  const plans = FALLBACK_INTERMODAL_PLANS[stationId] || FALLBACK_INTERMODAL_PLANS['gubeng'] || [];
  return { station_id: stationId, plans };
}



