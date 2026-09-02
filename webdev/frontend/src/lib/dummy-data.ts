import { StationId } from '@/types';

// ═══════════════════════════════════════════════════
// 1. TRAIN SCHEDULES (KRL SRRL Surabaya)
// ═══════════════════════════════════════════════════

export interface TrainSchedule {
  id: string;
  trainName: string;
  trainNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  platform: number;
  status: 'on_time' | 'delayed' | 'departed';
  stopsAt: StationId[];
  type: 'KRL' | 'Komuter' | 'Lokal';
}

export const TRAIN_SCHEDULES: TrainSchedule[] = [
  {
    id: 'krl-01',
    trainName: 'KRL SRRL',
    trainNumber: 'KA 7501',
    origin: 'Surabaya Kota (Semut)',
    destination: 'Sidoarjo',
    departureTime: '06:15',
    arrivalTime: '06:52',
    platform: 1,
    status: 'on_time',
    stopsAt: ['semut', 'pasar_turi', 'gubeng', 'wonokromo', 'waru'],
    type: 'KRL',
  },
  {
    id: 'krl-02',
    trainName: 'KRL SRRL',
    trainNumber: 'KA 7503',
    origin: 'Sidoarjo',
    destination: 'Surabaya Kota (Semut)',
    departureTime: '07:00',
    arrivalTime: '07:38',
    platform: 2,
    status: 'on_time',
    stopsAt: ['waru', 'wonokromo', 'gubeng', 'pasar_turi', 'semut'],
    type: 'KRL',
  },
  {
    id: 'krl-03',
    trainName: 'KRL SRRL',
    trainNumber: 'KA 7505',
    origin: 'Surabaya Kota (Semut)',
    destination: 'Sidoarjo',
    departureTime: '08:30',
    arrivalTime: '09:08',
    platform: 1,
    status: 'delayed',
    stopsAt: ['semut', 'pasar_turi', 'gubeng', 'wonokromo', 'waru'],
    type: 'KRL',
  },
  {
    id: 'krl-04',
    trainName: 'KRL SRRL',
    trainNumber: 'KA 7507',
    origin: 'Sidoarjo',
    destination: 'Surabaya Kota (Semut)',
    departureTime: '09:15',
    arrivalTime: '09:53',
    platform: 2,
    status: 'on_time',
    stopsAt: ['waru', 'wonokromo', 'gubeng', 'pasar_turi', 'semut'],
    type: 'KRL',
  },
  {
    id: 'krl-05',
    trainName: 'KRL SRRL',
    trainNumber: 'KA 7509',
    origin: 'Surabaya Kota (Semut)',
    destination: 'Sidoarjo',
    departureTime: '12:00',
    arrivalTime: '12:38',
    platform: 1,
    status: 'on_time',
    stopsAt: ['semut', 'pasar_turi', 'gubeng', 'wonokromo', 'waru'],
    type: 'KRL',
  },
  {
    id: 'krl-06',
    trainName: 'KRL SRRL',
    trainNumber: 'KA 7511',
    origin: 'Sidoarjo',
    destination: 'Surabaya Kota (Semut)',
    departureTime: '14:30',
    arrivalTime: '15:08',
    platform: 2,
    status: 'on_time',
    stopsAt: ['waru', 'wonokromo', 'gubeng', 'pasar_turi', 'semut'],
    type: 'KRL',
  },
  {
    id: 'krl-07',
    trainName: 'KRL SRRL',
    trainNumber: 'KA 7513',
    origin: 'Surabaya Kota (Semut)',
    destination: 'Sidoarjo',
    departureTime: '17:00',
    arrivalTime: '17:38',
    platform: 1,
    status: 'on_time',
    stopsAt: ['semut', 'pasar_turi', 'gubeng', 'wonokromo', 'waru'],
    type: 'KRL',
  },
  {
    id: 'krl-08',
    trainName: 'KRL SRRL',
    trainNumber: 'KA 7515',
    origin: 'Sidoarjo',
    destination: 'Surabaya Kota (Semut)',
    departureTime: '18:45',
    arrivalTime: '19:23',
    platform: 2,
    status: 'departed',
    stopsAt: ['waru', 'wonokromo', 'gubeng', 'pasar_turi', 'semut'],
    type: 'KRL',
  },
];

// ═══════════════════════════════════════════════════
// 2. FEEDER SUROBOYO BUS ROUTES
// ═══════════════════════════════════════════════════

export interface BusStop {
  name: string;
  lat: number;
  lng: number;
}

export interface BusRoute {
  id: string;
  routeCode: string;
  routeName: string;
  color: string;
  frequency: string;
  operatingHours: string;
  fare: string;
  nearestStation: StationId;
  stops: BusStop[];
  estimatedTime: string;
}

export const BUS_ROUTES: BusRoute[] = [
  {
    id: 'sb-01',
    routeCode: 'SB-01',
    routeName: 'Purabaya ↔ Rajawali',
    color: '#ef4444',
    frequency: 'Setiap 15 menit',
    operatingHours: '05:30 - 21:00 WIB',
    fare: 'Rp 5.000 / Botol Plastik',
    nearestStation: 'waru',
    stops: [
      { name: 'Terminal Purabaya', lat: -7.3530, lng: 112.7320 },
      { name: 'Stasiun Waru', lat: -7.3519, lng: 112.7297 },
      { name: 'Bundaran Waru', lat: -7.3455, lng: 112.7350 },
      { name: 'Jl. Ahmad Yani', lat: -7.3280, lng: 112.7375 },
      { name: 'DTC Wonokromo', lat: -7.3050, lng: 112.7380 },
      { name: 'Stasiun Wonokromo', lat: -7.3014, lng: 112.7383 },
      { name: 'Jl. Raya Darmo', lat: -7.2850, lng: 112.7400 },
      { name: 'Tugu Pahlawan', lat: -7.2455, lng: 112.7378 },
      { name: 'Jl. Rajawali', lat: -7.2370, lng: 112.7410 },
    ],
    estimatedTime: '45 menit',
  },
  {
    id: 'sb-02',
    routeCode: 'SB-02',
    routeName: 'Gubeng ↔ Kampus Timur',
    color: '#3b82f6',
    frequency: 'Setiap 20 menit',
    operatingHours: '06:00 - 20:30 WIB',
    fare: 'Rp 5.000 / Botol Plastik',
    nearestStation: 'gubeng',
    stops: [
      { name: 'Stasiun Gubeng', lat: -7.2654, lng: 112.7521 },
      { name: 'RSUD Dr. Soetomo', lat: -7.2680, lng: 112.7580 },
      { name: 'Jl. Dharmahusada', lat: -7.2710, lng: 112.7650 },
      { name: 'Unair Kampus C', lat: -7.2740, lng: 112.7720 },
      { name: 'Galaxy Mall', lat: -7.2780, lng: 112.7780 },
      { name: 'Kampus Timur', lat: -7.2820, lng: 112.7930 },
    ],
    estimatedTime: '30 menit',
  },
  {
    id: 'sb-03',
    routeCode: 'SB-03',
    routeName: 'Pasar Turi ↔ Tanjung Perak',
    color: '#10b981',
    frequency: 'Setiap 25 menit',
    operatingHours: '05:30 - 19:00 WIB',
    fare: 'Rp 5.000 / Botol Plastik',
    nearestStation: 'pasar_turi',
    stops: [
      { name: 'Stasiun Pasar Turi', lat: -7.2478, lng: 112.7306 },
      { name: 'Jl. Semarang', lat: -7.2450, lng: 112.7320 },
      { name: 'Pasar Turi Baru', lat: -7.2430, lng: 112.7340 },
      { name: 'Jl. Perak Timur', lat: -7.2310, lng: 112.7370 },
      { name: 'Pelabuhan Tanjung Perak', lat: -7.2180, lng: 112.7350 },
    ],
    estimatedTime: '25 menit',
  },
  {
    id: 'sb-04',
    routeCode: 'SB-04',
    routeName: 'Semut ↔ Kenjeran',
    color: '#f59e0b',
    frequency: 'Setiap 20 menit',
    operatingHours: '06:00 - 20:00 WIB',
    fare: 'Rp 5.000 / Botol Plastik',
    nearestStation: 'semut',
    stops: [
      { name: 'Stasiun Surabaya Kota', lat: -7.2372, lng: 112.7431 },
      { name: 'Jembatan Merah', lat: -7.2400, lng: 112.7420 },
      { name: 'Kya-Kya Pecinan', lat: -7.2430, lng: 112.7450 },
      { name: 'Jl. Kenjeran', lat: -7.2480, lng: 112.7570 },
      { name: 'Pantai Kenjeran Baru', lat: -7.2380, lng: 112.7890 },
    ],
    estimatedTime: '35 menit',
  },
  {
    id: 'sb-05',
    routeCode: 'SB-05',
    routeName: 'Wonokromo ↔ Mayjend Sungkono',
    color: '#8b5cf6',
    frequency: 'Setiap 15 menit',
    operatingHours: '06:00 - 21:00 WIB',
    fare: 'Rp 5.000 / Botol Plastik',
    nearestStation: 'wonokromo',
    stops: [
      { name: 'Stasiun Wonokromo', lat: -7.3014, lng: 112.7383 },
      { name: 'Royal Plaza', lat: -7.3020, lng: 112.7310 },
      { name: 'Jl. Mayjend Sungkono', lat: -7.2920, lng: 112.7200 },
      { name: 'Ciputra World', lat: -7.2890, lng: 112.7100 },
      { name: 'Pakuwon Mall', lat: -7.2850, lng: 112.6980 },
    ],
    estimatedTime: '25 menit',
  },
];

// ═══════════════════════════════════════════════════
// 3. TOURIST DESTINATIONS
// ═══════════════════════════════════════════════════

export interface TouristDestination {
  id: string;
  name: string;
  category: 'heritage' | 'nature' | 'shopping' | 'culinary' | 'religious';
  description: string;
  lat: number;
  lng: number;
  rating: number;
  nearestStation: StationId;
  distanceFromStation: string;
  walkTime: string;

}

export const TOURIST_DESTINATIONS: TouristDestination[] = [
  {
    id: 'td-01', name: 'Tugu Pahlawan', category: 'heritage',
    description: 'Monumen ikonik peringatan Pertempuran 10 November 1945.',
    lat: -7.2455, lng: 112.7378, rating: 4.6, nearestStation: 'pasar_turi',
    distanceFromStation: '800m', walkTime: '10 min',
  },
  {
    id: 'td-02', name: 'House of Sampoerna', category: 'heritage',
    description: 'Museum rokok & arsitektur kolonial Belanda.',
    lat: -7.2340, lng: 112.7350, rating: 4.7, nearestStation: 'semut',
    distanceFromStation: '500m', walkTime: '7 min',
  },
  {
    id: 'td-03', name: 'Surabaya Submarine Monument', category: 'heritage',
    description: 'Kapal selam KRI Pasopati 410 sebagai museum.',
    lat: -7.2365, lng: 112.7485, rating: 4.4, nearestStation: 'semut',
    distanceFromStation: '700m', walkTime: '9 min',
  },
  {
    id: 'td-04', name: 'Kebun Binatang Surabaya', category: 'nature',
    description: 'Kebun binatang tertua di Asia Tenggara.',
    lat: -7.2925, lng: 112.7360, rating: 4.2, nearestStation: 'wonokromo',
    distanceFromStation: '1.1km', walkTime: '15 min',
  },
  {
    id: 'td-05', name: 'Jembatan Merah', category: 'heritage',
    description: 'Jembatan bersejarah kawasan pecinan Surabaya.',
    lat: -7.2400, lng: 112.7420, rating: 4.3, nearestStation: 'semut',
    distanceFromStation: '350m', walkTime: '5 min',
  },
  {
    id: 'td-06', name: 'Grand City Mall', category: 'shopping',
    description: 'Pusat perbelanjaan premium di jantung kota.',
    lat: -7.2720, lng: 112.7530, rating: 4.5, nearestStation: 'gubeng',
    distanceFromStation: '900m', walkTime: '12 min',
  },
  {
    id: 'td-07', name: 'Tunjungan Plaza', category: 'shopping',
    description: 'Mall legendaris Surabaya sejak 1986.',
    lat: -7.2610, lng: 112.7380, rating: 4.4, nearestStation: 'gubeng',
    distanceFromStation: '1.5km', walkTime: '20 min',
  },
  {
    id: 'td-08', name: 'Masjid Al-Akbar Surabaya', category: 'religious',
    description: 'Masjid terbesar kedua di Indonesia.',
    lat: -7.3245, lng: 112.7170, rating: 4.8, nearestStation: 'wonokromo',
    distanceFromStation: '3.2km', walkTime: '40 min',
  },
  {
    id: 'td-09', name: 'Pantai Kenjeran Baru', category: 'nature',
    description: 'Taman wisata tepi laut dengan patung Empat Wajah.',
    lat: -7.2380, lng: 112.7890, rating: 4.1, nearestStation: 'semut',
    distanceFromStation: '5km', walkTime: 'Bus 35 min',
  },
  {
    id: 'td-10', name: 'Kampung Arab Ampel', category: 'culinary',
    description: 'Kawasan kuliner khas Timur Tengah & masjid bersejarah.',
    lat: -7.2300, lng: 112.7410, rating: 4.5, nearestStation: 'semut',
    distanceFromStation: '1km', walkTime: '13 min',
  },
  {
    id: 'td-11', name: 'Klenteng Hok An Kiong', category: 'heritage',
    description: 'Klenteng tertua di Surabaya sejak 1830.',
    lat: -7.2410, lng: 112.7430, rating: 4.3, nearestStation: 'semut',
    distanceFromStation: '600m', walkTime: '8 min',
  },
  {
    id: 'td-12', name: 'Suroboyo Carnival Night Market', category: 'culinary',
    description: 'Pasar malam terbesar di Surabaya.',
    lat: -7.2540, lng: 112.7870, rating: 4.0, nearestStation: 'gubeng',
    distanceFromStation: '4km', walkTime: 'Bus 25 min',
  },
  {
    id: 'td-13', name: 'Royal Plaza', category: 'shopping',
    description: 'Pusat perbelanjaan dekat stasiun Wonokromo.',
    lat: -7.3020, lng: 112.7310, rating: 4.2, nearestStation: 'wonokromo',
    distanceFromStation: '300m', walkTime: '4 min',
  },
  {
    id: 'td-14', name: 'Lontong Balap Pak Gendut', category: 'culinary',
    description: 'Kuliner legendaris khas Pasar Turi.',
    lat: -7.2485, lng: 112.7315, rating: 4.6, nearestStation: 'pasar_turi',
    distanceFromStation: '150m', walkTime: '2 min',
  },
  {
    id: 'td-15', name: 'Terminal Purabaya', category: 'heritage',
    description: 'Terminal bus terbesar di Asia Tenggara.',
    lat: -7.3530, lng: 112.7320, rating: 3.8, nearestStation: 'waru',
    distanceFromStation: '200m', walkTime: '3 min',
  },
];

// ═══════════════════════════════════════════════════
// 4. DEMOGRAPHICS PER STATION BUFFER
// ═══════════════════════════════════════════════════

export interface DemographicData {
  stationId: StationId;
  kecamatan: string;
  population: number;
  density: number; // per km²
  avgIncome: string;
  incomeLevel: 'low' | 'medium' | 'high';
  ageDistribution: {
    youth: number; // 0-17
    productive: number; // 18-55
    elderly: number; // 56+
  };
  householdCount: number;
  employmentRate: number;
}

export const DEMOGRAPHICS: DemographicData[] = [
  {
    stationId: 'gubeng', kecamatan: 'Kec. Gubeng',
    population: 136_420, density: 15_820,
    avgIncome: 'Rp 5.2 jt/bln', incomeLevel: 'high',
    ageDistribution: { youth: 22, productive: 65, elderly: 13 },
    householdCount: 34_105, employmentRate: 89.2,
  },
  {
    stationId: 'pasar_turi', kecamatan: 'Kec. Bubutan',
    population: 98_760, density: 18_450,
    avgIncome: 'Rp 3.8 jt/bln', incomeLevel: 'medium',
    ageDistribution: { youth: 28, productive: 58, elderly: 14 },
    householdCount: 24_690, employmentRate: 82.5,
  },
  {
    stationId: 'semut', kecamatan: 'Kec. Pabean Cantikan',
    population: 78_340, density: 22_100,
    avgIncome: 'Rp 4.1 jt/bln', incomeLevel: 'medium',
    ageDistribution: { youth: 25, productive: 60, elderly: 15 },
    householdCount: 19_585, employmentRate: 84.1,
  },
  {
    stationId: 'wonokromo', kecamatan: 'Kec. Wonokromo',
    population: 152_880, density: 14_200,
    avgIncome: 'Rp 4.5 jt/bln', incomeLevel: 'medium',
    ageDistribution: { youth: 24, productive: 62, elderly: 14 },
    householdCount: 38_220, employmentRate: 86.8,
  },
  {
    stationId: 'waru', kecamatan: 'Kec. Waru (Sidoarjo)',
    population: 225_100, density: 8_900,
    avgIncome: 'Rp 3.2 jt/bln', incomeLevel: 'low',
    ageDistribution: { youth: 30, productive: 56, elderly: 14 },
    householdCount: 56_275, employmentRate: 78.3,
  },
];

// ═══════════════════════════════════════════════════
// 5. ENVIRONMENT DATA PER STATION
// ═══════════════════════════════════════════════════

export interface EnvironmentData {
  stationId: StationId;
  aqi: number; // Air Quality Index 0-500
  aqiLabel: string;
  aqiColor: string;
  floodRisk: 'rendah' | 'sedang' | 'tinggi';
  floodRiskColor: string;
  greenSpacePct: number; // % RTH
  noiseLevel: number; // dB
  noiseLevelLabel: string;
  pm25: number;
  temperature: number;
}

export const ENVIRONMENT_DATA: EnvironmentData[] = [
  {
    stationId: 'gubeng', aqi: 72, aqiLabel: 'Sedang', aqiColor: '#f59e0b',
    floodRisk: 'rendah', floodRiskColor: '#10b981',
    greenSpacePct: 18.5, noiseLevel: 68, noiseLevelLabel: 'Moderate', pm25: 28, temperature: 32,
  },
  {
    stationId: 'pasar_turi', aqi: 95, aqiLabel: 'Tidak Sehat (Sensitif)', aqiColor: '#f97316',
    floodRisk: 'sedang', floodRiskColor: '#f59e0b',
    greenSpacePct: 8.2, noiseLevel: 75, noiseLevelLabel: 'High', pm25: 42, temperature: 33,
  },
  {
    stationId: 'semut', aqi: 88, aqiLabel: 'Sedang', aqiColor: '#f59e0b',
    floodRisk: 'tinggi', floodRiskColor: '#ef4444',
    greenSpacePct: 6.1, noiseLevel: 72, noiseLevelLabel: 'High', pm25: 38, temperature: 33,
  },
  {
    stationId: 'wonokromo', aqi: 65, aqiLabel: 'Sedang', aqiColor: '#f59e0b',
    floodRisk: 'sedang', floodRiskColor: '#f59e0b',
    greenSpacePct: 22.3, noiseLevel: 64, noiseLevelLabel: 'Moderate', pm25: 24, temperature: 31,
  },
  {
    stationId: 'waru', aqi: 110, aqiLabel: 'Tidak Sehat (Sensitif)', aqiColor: '#f97316',
    floodRisk: 'tinggi', floodRiskColor: '#ef4444',
    greenSpacePct: 12.0, noiseLevel: 78, noiseLevelLabel: 'Very High', pm25: 48, temperature: 34,
  },
];

// ═══════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════

export function getTrainSchedulesForStation(stationId: StationId): TrainSchedule[] {
  return TRAIN_SCHEDULES.filter((t) => t.stopsAt.includes(stationId));
}

export function getBusRoutesForStation(stationId: StationId): BusRoute[] {
  return BUS_ROUTES.filter((r) => r.nearestStation === stationId);
}

export function getTouristDestinationsForStation(stationId: StationId): TouristDestination[] {
  return TOURIST_DESTINATIONS.filter((d) => d.nearestStation === stationId);
}

export function getDemographicsForStation(stationId: StationId): DemographicData | undefined {
  return DEMOGRAPHICS.find((d) => d.stationId === stationId);
}

export function getEnvironmentForStation(stationId: StationId): EnvironmentData | undefined {
  return ENVIRONMENT_DATA.find((e) => e.stationId === stationId);
}
