import { StationId } from '@/types';

// ═══════════════════════════════════════════════════
// 1. STATION METADATA & HELPER
// ═══════════════════════════════════════════════════

export interface StationMeta {
  fullName: string;
  shortName: string;
  code: string;
  jalurCount: number;
  lat: number;
  lng: number;
}

export const STATION_NAMES: Record<string, StationMeta> = {
  gubeng: { fullName: 'Stasiun Surabaya Gubeng', shortName: 'Gubeng', code: 'SGU', jalurCount: 6, lat: -7.2654, lng: 112.7521 },
  pasar_turi: { fullName: 'Stasiun Pasar Turi', shortName: 'Pasar Turi', code: 'SBI', jalurCount: 4, lat: -7.2483, lng: 112.7314 },
  semut: { fullName: 'Stasiun Surabaya Kota (Semut)', shortName: 'Semut', code: 'SB', jalurCount: 3, lat: -7.2415, lng: 112.7441 },
  wonokromo: { fullName: 'Stasiun Wonokromo', shortName: 'Wonokromo', code: 'WO', jalurCount: 4, lat: -7.3014, lng: 112.7383 },
  waru: { fullName: 'Stasiun Waru', shortName: 'Waru', code: 'WR', jalurCount: 3, lat: -7.3519, lng: 112.7297 },
  terminal_joyoboyo: { fullName: 'Terminal Intermoda Joyoboyo (TIJ)', shortName: 'TIJ Joyoboyo', code: 'TIJ', jalurCount: 8, lat: -7.2995, lng: 112.7368 },
  terminal_purabaya: { fullName: 'Terminal Purabaya (Bungurasih)', shortName: 'Purabaya', code: 'PBY', jalurCount: 12, lat: -7.3526, lng: 112.7235 },
  terminal_bratang: { fullName: 'Terminal Bratang', shortName: 'Bratang', code: 'BTG', jalurCount: 4, lat: -7.2954, lng: 112.7612 },
  tandes: { fullName: 'Stasiun Tandes', shortName: 'Tandes', code: 'TDS', jalurCount: 3, lat: -7.2612, lng: 112.6782 },
  kandangan: { fullName: 'Stasiun Kandangan', shortName: 'Kandangan', code: 'KND', jalurCount: 3, lat: -7.2512, lng: 112.6475 },
  benowo: { fullName: 'Stasiun Benowo', shortName: 'Benowo', code: 'BNW', jalurCount: 2, lat: -7.2341, lng: 112.5932 },
  ngagel: { fullName: 'Stasiun Ngagel', shortName: 'Ngagel', code: 'NGL', jalurCount: 2, lat: -7.2882, lng: 112.7471 },
  margorejo: { fullName: 'Stasiun Margorejo', shortName: 'Margorejo', code: 'MRG', jalurCount: 2, lat: -7.3142, lng: 112.7352 },
  jemursari: { fullName: 'Stasiun Jemursari', shortName: 'Jemursari', code: 'JMS', jalurCount: 2, lat: -7.3275, lng: 112.7341 },
  kertomenanggal: { fullName: 'Stasiun Kertomenanggal', shortName: 'Kertomenanggal', code: 'KRM', jalurCount: 2, lat: -7.3412, lng: 112.7321 },
  sidotopo: { fullName: 'Stasiun Sidotopo', shortName: 'Sidotopo', code: 'SDT', jalurCount: 4, lat: -7.2355, lng: 112.7562 },
  kalimas: { fullName: 'Stasiun Kalimas', shortName: 'Kalimas', code: 'KLM', jalurCount: 4, lat: -7.2185, lng: 112.7371 },
  benteng: { fullName: 'Stasiun Benteng', shortName: 'Benteng', code: 'BTG', jalurCount: 2, lat: -7.2091, lng: 112.7365 }
};

export function getStationInfo(stationId: StationId | string): StationMeta {
  return STATION_NAMES[stationId] ?? {
    fullName: `Stasiun ${stationId}`,
    shortName: stationId.charAt(0).toUpperCase() + stationId.slice(1),
    code: stationId.substring(0, 3).toUpperCase(),
    jalurCount: 2,
    lat: -7.2654,
    lng: 112.7521
  };
}

export function getDirectionsUrl(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  mode: 'walking' | 'transit' | 'driving' = 'walking'
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=${mode}`;
}

// ═══════════════════════════════════════════════════
// 2. TRAIN SCHEDULES (KRL SRRL Surabaya & Commuter Lines)
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
  direction?: 'southbound' | 'northbound';
  directionLabel?: string;
  currentStationName?: string;
  nextStop?: string;
  isTerminus?: boolean;
}

export interface StationStopConfig {
  station: StationId;
  dep: string;
  platform: number;
}

export interface TrainMasterData {
  id: string;
  trainName: string;
  trainNumber: string;
  type: 'KRL' | 'Komuter' | 'Lokal';
  direction: 'southbound' | 'northbound';
  origin: string;
  destination: string;
  terminusArrival: string;
  status: 'on_time' | 'delayed' | 'departed';
  stops: StationStopConfig[];
}

export const TRAIN_MASTER_DATA: TrainMasterData[] = [
  // 1. KRL SRRL - Pagi Southbound
  {
    id: 'krl-01',
    trainName: 'KRL SRRL',
    trainNumber: 'KA 7501',
    type: 'KRL',
    direction: 'southbound',
    origin: 'Surabaya Kota (Semut)',
    destination: 'Sidoarjo',
    terminusArrival: '06:58',
    status: 'on_time',
    stops: [
      { station: 'semut', dep: '06:15', platform: 1 },
      { station: 'pasar_turi', dep: '06:23', platform: 3 },
      { station: 'gubeng', dep: '06:31', platform: 4 },
      { station: 'wonokromo', dep: '06:41', platform: 2 },
      { station: 'waru', dep: '06:49', platform: 1 },
    ],
  },
  // 2. Commuter Line Sindro - Pagi Southbound (starts from Pasar Turi)
  {
    id: 'cl-sindro-01',
    trainName: 'Commuter Line Sindro',
    trainNumber: 'KA 531',
    type: 'Komuter',
    direction: 'southbound',
    origin: 'Pasar Turi',
    destination: 'Sidoarjo',
    terminusArrival: '06:18',
    status: 'on_time',
    stops: [
      { station: 'pasar_turi', dep: '05:40', platform: 2 },
      { station: 'gubeng', dep: '05:49', platform: 4 },
      { station: 'wonokromo', dep: '05:59', platform: 2 },
      { station: 'waru', dep: '06:07', platform: 1 },
    ],
  },
  // 3. Commuter Line Dhoho - Pagi Southbound (Semut -> Gubeng -> Wonokromo -> Waru)
  {
    id: 'cl-dhoho-01',
    trainName: 'Commuter Line Dhoho',
    trainNumber: 'KA 401',
    type: 'Lokal',
    direction: 'southbound',
    origin: 'Surabaya Kota (Semut)',
    destination: 'Kertosono - Blitar',
    terminusArrival: '05:42',
    status: 'on_time',
    stops: [
      { station: 'semut', dep: '05:00', platform: 2 },
      { station: 'gubeng', dep: '05:12', platform: 5 },
      { station: 'wonokromo', dep: '05:22', platform: 3 },
      { station: 'waru', dep: '05:31', platform: 2 },
    ],
  },
  // 4. KRL SRRL - Pagi Northbound (Sidoarjo -> Semut)
  {
    id: 'krl-02',
    trainName: 'KRL SRRL',
    trainNumber: 'KA 7503',
    type: 'KRL',
    direction: 'northbound',
    origin: 'Sidoarjo',
    destination: 'Surabaya Kota (Semut)',
    terminusArrival: '07:45',
    status: 'on_time',
    stops: [
      { station: 'waru', dep: '07:12', platform: 2 },
      { station: 'wonokromo', dep: '07:20', platform: 1 },
      { station: 'gubeng', dep: '07:30', platform: 1 },
      { station: 'pasar_turi', dep: '07:38', platform: 2 },
      { station: 'semut', dep: '07:45', platform: 2 },
    ],
  },
  // 5. Commuter Line Penataran - Pagi Southbound
  {
    id: 'cl-penataran-01',
    trainName: 'Commuter Line Penataran',
    trainNumber: 'KA 421',
    type: 'Lokal',
    direction: 'southbound',
    origin: 'Surabaya Kota (Semut)',
    destination: 'Malang - Blitar',
    terminusArrival: '07:54',
    status: 'on_time',
    stops: [
      { station: 'semut', dep: '07:10', platform: 1 },
      { station: 'gubeng', dep: '07:22', platform: 5 },
      { station: 'wonokromo', dep: '07:33', platform: 3 },
      { station: 'waru', dep: '07:42', platform: 2 },
    ],
  },
  // 6. Commuter Line Sindro - Pagi Northbound (Terminates at Pasar Turi)
  {
    id: 'cl-sindro-02',
    trainName: 'Commuter Line Sindro',
    trainNumber: 'KA 532',
    type: 'Komuter',
    direction: 'northbound',
    origin: 'Sidoarjo',
    destination: 'Pasar Turi',
    terminusArrival: '08:55',
    status: 'on_time',
    stops: [
      { station: 'waru', dep: '08:27', platform: 2 },
      { station: 'wonokromo', dep: '08:35', platform: 1 },
      { station: 'gubeng', dep: '08:45', platform: 1 },
      { station: 'pasar_turi', dep: '08:55', platform: 2 },
    ],
  },
  // 7. KRL SRRL - Pagi Menjelang Siang Southbound
  {
    id: 'krl-03',
    trainName: 'KRL SRRL',
    trainNumber: 'KA 7505',
    type: 'KRL',
    direction: 'southbound',
    origin: 'Surabaya Kota (Semut)',
    destination: 'Sidoarjo',
    terminusArrival: '09:14',
    status: 'delayed',
    stops: [
      { station: 'semut', dep: '08:30', platform: 1 },
      { station: 'pasar_turi', dep: '08:38', platform: 3 },
      { station: 'gubeng', dep: '08:46', platform: 4 },
      { station: 'wonokromo', dep: '08:56', platform: 2 },
      { station: 'waru', dep: '09:04', platform: 1 },
    ],
  },
  // 8. KRL SRRL - Siang Northbound
  {
    id: 'krl-04',
    trainName: 'KRL SRRL',
    trainNumber: 'KA 7507',
    type: 'KRL',
    direction: 'northbound',
    origin: 'Sidoarjo',
    destination: 'Surabaya Kota (Semut)',
    terminusArrival: '10:00',
    status: 'on_time',
    stops: [
      { station: 'waru', dep: '09:27', platform: 2 },
      { station: 'wonokromo', dep: '09:35', platform: 1 },
      { station: 'gubeng', dep: '09:45', platform: 1 },
      { station: 'pasar_turi', dep: '09:53', platform: 2 },
      { station: 'semut', dep: '10:00', platform: 2 },
    ],
  },
  // 9. KRL SRRL - Siang Southbound
  {
    id: 'krl-05',
    trainName: 'KRL SRRL',
    trainNumber: 'KA 7509',
    type: 'KRL',
    direction: 'southbound',
    origin: 'Surabaya Kota (Semut)',
    destination: 'Sidoarjo',
    terminusArrival: '12:44',
    status: 'on_time',
    stops: [
      { station: 'semut', dep: '12:00', platform: 1 },
      { station: 'pasar_turi', dep: '12:08', platform: 3 },
      { station: 'gubeng', dep: '12:16', platform: 4 },
      { station: 'wonokromo', dep: '12:26', platform: 2 },
      { station: 'waru', dep: '12:34', platform: 1 },
    ],
  },
  // 10. KRL SRRL - Sore Northbound
  {
    id: 'krl-06',
    trainName: 'KRL SRRL',
    trainNumber: 'KA 7511',
    type: 'KRL',
    direction: 'northbound',
    origin: 'Sidoarjo',
    destination: 'Surabaya Kota (Semut)',
    terminusArrival: '15:15',
    status: 'on_time',
    stops: [
      { station: 'waru', dep: '14:42', platform: 2 },
      { station: 'wonokromo', dep: '14:50', platform: 1 },
      { station: 'gubeng', dep: '15:00', platform: 1 },
      { station: 'pasar_turi', dep: '15:08', platform: 2 },
      { station: 'semut', dep: '15:15', platform: 2 },
    ],
  },
  // 11. KRL SRRL - Sore Rush Hour Southbound
  {
    id: 'krl-07',
    trainName: 'KRL SRRL (Rush Hour)',
    trainNumber: 'KA 7513',
    type: 'KRL',
    direction: 'southbound',
    origin: 'Surabaya Kota (Semut)',
    destination: 'Sidoarjo',
    terminusArrival: '17:48',
    status: 'on_time',
    stops: [
      { station: 'semut', dep: '17:00', platform: 1 },
      { station: 'pasar_turi', dep: '17:08', platform: 3 },
      { station: 'gubeng', dep: '17:17', platform: 4 },
      { station: 'wonokromo', dep: '17:28', platform: 2 },
      { station: 'waru', dep: '17:36', platform: 1 },
    ],
  },
  // 12. KRL SRRL - Malam Rush Hour Northbound
  {
    id: 'krl-08',
    trainName: 'KRL SRRL (Rush Hour)',
    trainNumber: 'KA 7515',
    type: 'KRL',
    direction: 'northbound',
    origin: 'Sidoarjo',
    destination: 'Surabaya Kota (Semut)',
    terminusArrival: '19:30',
    status: 'departed',
    stops: [
      { station: 'waru', dep: '18:57', platform: 2 },
      { station: 'wonokromo', dep: '19:05', platform: 1 },
      { station: 'gubeng', dep: '19:15', platform: 1 },
      { station: 'pasar_turi', dep: '19:23', platform: 2 },
      { station: 'semut', dep: '19:30', platform: 2 },
    ],
  },
  // 13. Commuter Line Arjonegoro - Koridor Surabaya Barat (Pasar Turi -> Benowo)
  {
    id: 'cl-arjonegoro-01',
    trainName: 'Commuter Line Arjonegoro',
    trainNumber: 'KA 491',
    type: 'Komuter',
    direction: 'northbound',
    origin: 'Surabaya Pasar Turi',
    destination: 'Bojonegoro',
    terminusArrival: '08:30',
    status: 'on_time',
    stops: [
      { station: 'pasar_turi', dep: '06:10', platform: 2 },
      { station: 'tandes', dep: '06:19', platform: 1 },
      { station: 'kandangan', dep: '06:27', platform: 1 },
      { station: 'benowo', dep: '06:36', platform: 1 },
    ],
  },
  // 14. Commuter Line Arjonegoro - Koridor Surabaya Barat (Benowo -> Pasar Turi)
  {
    id: 'cl-arjonegoro-02',
    trainName: 'Commuter Line Arjonegoro',
    trainNumber: 'KA 492',
    type: 'Komuter',
    direction: 'southbound',
    origin: 'Bojonegoro',
    destination: 'Surabaya Pasar Turi',
    terminusArrival: '10:45',
    status: 'on_time',
    stops: [
      { station: 'benowo', dep: '10:15', platform: 2 },
      { station: 'kandangan', dep: '10:24', platform: 2 },
      { station: 'tandes', dep: '10:32', platform: 2 },
      { station: 'pasar_turi', dep: '10:45', platform: 1 },
    ],
  },
  // 15. Commuter Line Supas - Koridor Surabaya Selatan (Semut -> Waru via Halte Lokal)
  {
    id: 'cl-supas-01',
    trainName: 'Commuter Line Supas',
    trainNumber: 'KA 501',
    type: 'Komuter',
    direction: 'southbound',
    origin: 'Surabaya Kota (Semut)',
    destination: 'Pasuruan',
    terminusArrival: '07:35',
    status: 'on_time',
    stops: [
      { station: 'semut', dep: '05:45', platform: 2 },
      { station: 'gubeng', dep: '05:55', platform: 4 },
      { station: 'ngagel', dep: '06:01', platform: 1 },
      { station: 'wonokromo', dep: '06:08', platform: 2 },
      { station: 'margorejo', dep: '06:14', platform: 1 },
      { station: 'jemursari', dep: '06:20', platform: 1 },
      { station: 'kertomenanggal', dep: '06:26', platform: 1 },
      { station: 'waru', dep: '06:33', platform: 2 },
    ],
  },
  // 16. Commuter Line Supas - Koridor Surabaya Selatan (Waru -> Semut)
  {
    id: 'cl-supas-02',
    trainName: 'Commuter Line Supas',
    trainNumber: 'KA 502',
    type: 'Komuter',
    direction: 'northbound',
    origin: 'Pasuruan',
    destination: 'Surabaya Kota (Semut)',
    terminusArrival: '18:15',
    status: 'on_time',
    stops: [
      { station: 'waru', dep: '17:25', platform: 1 },
      { station: 'kertomenanggal', dep: '17:32', platform: 2 },
      { station: 'jemursari', dep: '17:38', platform: 2 },
      { station: 'margorejo', dep: '17:44', platform: 2 },
      { station: 'wonokromo', dep: '17:51', platform: 1 },
      { station: 'ngagel', dep: '17:58', platform: 2 },
      { station: 'gubeng', dep: '18:05', platform: 3 },
      { station: 'semut', dep: '18:15', platform: 1 },
    ],
  },
  // 17. Feeder Logistik & Kereta Rel Dipo (Sidotopo - Kalimas - Benteng)
  {
    id: 'ka-feeder-dipo-01',
    trainName: 'KA Feeder Pelabuhan & Dipo',
    trainNumber: 'KLB 901',
    type: 'Lokal',
    direction: 'northbound',
    origin: 'Sidotopo Dipo',
    destination: 'Benteng Tanjung Perak',
    terminusArrival: '09:40',
    status: 'on_time',
    stops: [
      { station: 'sidotopo', dep: '09:05', platform: 1 },
      { station: 'kalimas', dep: '09:20', platform: 1 },
      { station: 'benteng', dep: '09:40', platform: 1 },
    ],
  },
  // 18. Feeder Logistik & Kereta Rel Dipo (Benteng -> Sidotopo)
  {
    id: 'ka-feeder-dipo-02',
    trainName: 'KA Feeder Pelabuhan & Dipo',
    trainNumber: 'KLB 902',
    type: 'Lokal',
    direction: 'southbound',
    origin: 'Benteng Tanjung Perak',
    destination: 'Sidotopo Dipo',
    terminusArrival: '16:45',
    status: 'on_time',
    stops: [
      { station: 'benteng', dep: '16:10', platform: 1 },
      { station: 'kalimas', dep: '16:25', platform: 2 },
      { station: 'sidotopo', dep: '16:45', platform: 2 },
    ],
  },
];

export const TRAIN_SCHEDULES: TrainSchedule[] = [
  {
    id: 'krl-01',
    trainName: 'KRL SRRL',
    trainNumber: 'KA 7501',
    origin: 'Surabaya Kota (Semut)',
    destination: 'Sidoarjo',
    departureTime: '06:15',
    arrivalTime: '06:58',
    platform: 1,
    status: 'on_time',
    stopsAt: ['semut', 'pasar_turi', 'gubeng', 'wonokromo', 'waru'],
    type: 'KRL',
    direction: 'southbound',
    directionLabel: 'Arah Sidoarjo (Selatan)',
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
  // WIRAWIRI FEEDER INTEGRATION
  {
    id: 'fd-01',
    routeCode: 'FD-01 (WiraWiri)',
    routeName: 'Stasiun Pasar Turi ↔ Tunjungan ↔ Balai Pemuda',
    color: '#06b6d4',
    frequency: 'Setiap 10 menit',
    operatingHours: '05:30 - 21:00 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'pasar_turi',
    stops: [
      { name: 'Stasiun Pasar Turi', lat: -7.2478, lng: 112.7306 },
      { name: 'Siola Tunjungan', lat: -7.2560, lng: 112.7380 },
      { name: 'Tunjungan Plaza', lat: -7.2620, lng: 112.7390 },
      { name: 'Balai Pemuda (Alun-Alun)', lat: -7.2635, lng: 112.7445 },
    ],
    estimatedTime: '15 menit',
  },
  {
    id: 'fd-07',
    routeCode: 'FD-07 (WiraWiri)',
    routeName: 'TIJ Joyoboyo ↔ Bratang ↔ Stasiun Gubeng',
    color: '#06b6d4',
    frequency: 'Setiap 10 menit',
    operatingHours: '05:30 - 21:30 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'gubeng',
    stops: [
      { name: 'Stasiun Gubeng Baru', lat: -7.2654, lng: 112.7521 },
      { name: 'Grand City', lat: -7.2610, lng: 112.7505 },
      { name: 'Terminal Bratang', lat: -7.2930, lng: 112.7600 },
      { name: 'Terminal Intermoda Joyoboyo', lat: -7.2990, lng: 112.7370 },
    ],
    estimatedTime: '20 menit',
  },
  {
    id: 'fd-03',
    routeCode: 'FD-03 (WiraWiri)',
    routeName: 'Stasiun Kota (Semut) ↔ Ampel ↔ Kenjeran',
    color: '#06b6d4',
    frequency: 'Setiap 12 menit',
    operatingHours: '05:30 - 21:00 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'semut',
    stops: [
      { name: 'Stasiun Surabaya Kota', lat: -7.2372, lng: 112.7431 },
      { name: 'Wisata Religi Ampel', lat: -7.2300, lng: 112.7430 },
      { name: 'Pegirian', lat: -7.2340, lng: 112.7480 },
      { name: 'Sentra Ikan Bulak Kenjeran', lat: -7.2350, lng: 112.7950 },
    ],
    estimatedTime: '25 menit',
  },
  {
    id: 'fd-04',
    routeCode: 'FD-04 (WiraWiri)',
    routeName: 'Stasiun Wonokromo ↔ TIJ Joyoboyo ↔ KBS',
    color: '#06b6d4',
    frequency: 'Setiap 10 menit',
    operatingHours: '05:30 - 21:00 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'wonokromo',
    stops: [
      { name: 'Stasiun Wonokromo', lat: -7.3014, lng: 112.7383 },
      { name: 'DTC Wonokromo', lat: -7.3050, lng: 112.7380 },
      { name: 'TIJ Joyoboyo', lat: -7.2990, lng: 112.7370 },
      { name: 'Kebon Binatang Surabaya (KBS)', lat: -7.2960, lng: 112.7360 },
    ],
    estimatedTime: '15 menit',
  },
  {
    id: 'fd-06',
    routeCode: 'FD-06 (WiraWiri)',
    routeName: 'TIJ Joyoboyo ↔ Stasiun Waru ↔ Bandara Juanda',
    color: '#06b6d4',
    frequency: 'Setiap 15 menit',
    operatingHours: '05:00 - 21:30 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'waru',
    stops: [
      { name: 'Terminal Purabaya', lat: -7.3530, lng: 112.7320 },
      { name: 'Stasiun Waru', lat: -7.3519, lng: 112.7297 },
      { name: 'Aloha Juanda', lat: -7.3680, lng: 112.7400 },
      { name: 'Bandara Internasional Juanda T1', lat: -7.3790, lng: 112.7870 },
    ],
    estimatedTime: '25 menit',
  },
  {
    id: 'fd-07',
    routeCode: 'FD-07 (WiraWiri)',
    routeName: 'TIJ Joyoboyo ↔ Mayangkara ↔ Bratang',
    color: '#10b981',
    frequency: 'Setiap 10 menit',
    operatingHours: '05:30 - 21:00 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'terminal_joyoboyo',
    stops: [
      { name: 'TIJ Joyoboyo', lat: -7.2995, lng: 112.7368 },
      { name: 'Flyover Mayangkara', lat: -7.2980, lng: 112.7380 },
      { name: 'Ngagel Jaya Selatan', lat: -7.2930, lng: 112.7510 },
      { name: 'Terminal Bratang', lat: -7.2954, lng: 112.7612 },
    ],
    estimatedTime: '15 menit',
  },
  {
    id: 'sb-01',
    routeCode: 'Suroboyo Bus R1/R2',
    routeName: 'Terminal Purabaya ↔ Rajawali (Koridor 1)',
    color: '#dc2626',
    frequency: 'Setiap 8 menit',
    operatingHours: '05:00 - 22:00 WIB',
    fare: 'Rp 5.000 (QRIS / Sampah Plastik)',
    nearestStation: 'terminal_purabaya',
    stops: [
      { name: 'Terminal Purabaya', lat: -7.3526, lng: 112.7235 },
      { name: 'Halte Kertomenanggal', lat: -7.3410, lng: 112.7310 },
      { name: 'Halte Wonokromo', lat: -7.3010, lng: 112.7380 },
      { name: 'Halte Basuki Rahmat', lat: -7.2650, lng: 112.7420 },
    ],
    estimatedTime: '35 menit',
  },
  {
    id: 'fd-08',
    routeCode: 'FD-08 (WiraWiri)',
    routeName: 'Terminal Bratang ↔ Manyar ↔ Kenjeran Park',
    color: '#06b6d4',
    frequency: 'Setiap 12 menit',
    operatingHours: '05:30 - 21:00 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'terminal_bratang',
    stops: [
      { name: 'Terminal Bratang', lat: -7.2954, lng: 112.7612 },
      { name: 'Pasar Bunga Bratang', lat: -7.2940, lng: 112.7620 },
      { name: 'Manyar Kertoarjo', lat: -7.2820, lng: 112.7680 },
      { name: 'Kenjeran Park', lat: -7.2450, lng: 112.7950 },
    ],
    estimatedTime: '20 menit',
  },
  {
    id: 'fd-01',
    routeCode: 'FD-01 (WiraWiri)',
    routeName: 'Stasiun Tandes ↔ Manukan ↔ Benowo',
    color: '#f59e0b',
    frequency: 'Setiap 10 menit',
    operatingHours: '05:30 - 21:00 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'tandes',
    stops: [
      { name: 'Stasiun Tandes', lat: -7.2612, lng: 112.6782 },
      { name: 'Halte Bayangan Balongsari', lat: -7.2600, lng: 112.6790 },
      { name: 'Sentra Kuliner Manukan', lat: -7.2580, lng: 112.6680 },
      { name: 'Terminal Manukan', lat: -7.2550, lng: 112.6610 },
    ],
    estimatedTime: '18 menit',
  },
  {
    id: 'fd-01b',
    routeCode: 'FD-01B (WiraWiri)',
    routeName: 'Stasiun Kandangan ↔ Sememi ↔ Pakal',
    color: '#f59e0b',
    frequency: 'Setiap 15 menit',
    operatingHours: '05:30 - 20:30 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'kandangan',
    stops: [
      { name: 'Stasiun Kandangan', lat: -7.2512, lng: 112.6475 },
      { name: 'Pasar Sememi', lat: -7.2480, lng: 112.6420 },
      { name: 'Polsek Pakal', lat: -7.2420, lng: 112.6310 },
      { name: 'Kecamatan Benowo', lat: -7.2380, lng: 112.6250 },
    ],
    estimatedTime: '15 menit',
  },
  {
    id: 'fd-01c',
    routeCode: 'FD-01C (WiraWiri)',
    routeName: 'Stasiun Benowo ↔ GBT ↔ Romokalisari',
    color: '#10b981',
    frequency: 'Setiap 15 menit',
    operatingHours: '05:30 - 21:00 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'benowo',
    stops: [
      { name: 'Stasiun Benowo', lat: -7.2341, lng: 112.5932 },
      { name: 'Terminal Benowo', lat: -7.2320, lng: 112.5950 },
      { name: 'Stadion GBT', lat: -7.2345, lng: 112.6150 },
      { name: 'Mangrove Romokalisari', lat: -7.2080, lng: 112.6350 },
    ],
    estimatedTime: '20 menit',
  },
  {
    id: 'fd-02b',
    routeCode: 'FD-02 (WiraWiri)',
    routeName: 'Stasiun Ngagel ↔ Marvell City ↔ Gubeng Pojok',
    color: '#06b6d4',
    frequency: 'Setiap 10 menit',
    operatingHours: '05:30 - 21:00 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'ngagel',
    stops: [
      { name: 'Stasiun Ngagel', lat: -7.2882, lng: 112.7471 },
      { name: 'Marvell City', lat: -7.2885, lng: 112.7485 },
      { name: 'Jl. Sulawesi', lat: -7.2780, lng: 112.7490 },
      { name: 'Stasiun Gubeng Baru', lat: -7.2654, lng: 112.7521 },
    ],
    estimatedTime: '12 menit',
  },
  {
    id: 'sb-03',
    routeCode: 'Trans Semanggi K2L',
    routeName: 'Stasiun Margorejo ↔ Jemursari ↔ Lidah Wetan',
    color: '#8b5cf6',
    frequency: 'Setiap 10 menit',
    operatingHours: '05:00 - 21:30 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'margorejo',
    stops: [
      { name: 'Stasiun Margorejo', lat: -7.3142, lng: 112.7352 },
      { name: 'Polda Jatim', lat: -7.3150, lng: 112.7330 },
      { name: 'Taman Pelangi', lat: -7.3205, lng: 112.7315 },
      { name: 'Royal Plaza', lat: -7.3050, lng: 112.7360 },
    ],
    estimatedTime: '15 menit',
  },
  {
    id: 'sb-04',
    routeCode: 'Trans Semanggi K2L',
    routeName: 'Stasiun Jemursari ↔ Plaza Marina ↔ Rungkut Industri',
    color: '#8b5cf6',
    frequency: 'Setiap 10 menit',
    operatingHours: '05:00 - 21:30 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'jemursari',
    stops: [
      { name: 'Stasiun Jemursari', lat: -7.3275, lng: 112.7341 },
      { name: 'Halte Jemur Ngawinan', lat: -7.3280, lng: 112.7360 },
      { name: 'Plaza Marina', lat: -7.3175, lng: 112.7385 },
      { name: 'SIER Rungkut Industri', lat: -7.3250, lng: 112.7600 },
    ],
    estimatedTime: '18 menit',
  },
  {
    id: 'sb-05',
    routeCode: 'Suroboyo Bus Koridor 1',
    routeName: 'Stasiun Kertomenanggal ↔ Cito Mall ↔ Bungurasih',
    color: '#dc2626',
    frequency: 'Setiap 8 menit',
    operatingHours: '05:00 - 22:00 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'kertomenanggal',
    stops: [
      { name: 'Stasiun Kertomenanggal', lat: -7.3412, lng: 112.7321 },
      { name: 'Dinas Pendapatan Jatim', lat: -7.3420, lng: 112.7310 },
      { name: 'Cito Mall', lat: -7.3465, lng: 112.7290 },
      { name: 'Terminal Purabaya', lat: -7.3526, lng: 112.7235 },
    ],
    estimatedTime: '10 menit',
  },
  {
    id: 'fd-09',
    routeCode: 'FD-09 (WiraWiri)',
    routeName: 'Stasiun Sidotopo ↔ Pegirian ↔ Jembatan Merah',
    color: '#06b6d4',
    frequency: 'Setiap 12 menit',
    operatingHours: '05:30 - 21:00 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'sidotopo',
    stops: [
      { name: 'Stasiun Sidotopo', lat: -7.2355, lng: 112.7562 },
      { name: 'Dipo Lokomotif', lat: -7.2350, lng: 112.7565 },
      { name: 'Pasar Pegirian', lat: -7.2340, lng: 112.7480 },
      { name: 'Jembatan Merah Plaza', lat: -7.2400, lng: 112.7420 },
    ],
    estimatedTime: '14 menit',
  },
  {
    id: 'sb-06',
    routeCode: 'Suroboyo Bus R1 Tanjung Perak',
    routeName: 'Stasiun Kalimas ↔ Perak Timur ↔ Jembatan Merah',
    color: '#dc2626',
    frequency: 'Setiap 10 menit',
    operatingHours: '05:00 - 21:30 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'kalimas',
    stops: [
      { name: 'Stasiun Kalimas', lat: -7.2185, lng: 112.7371 },
      { name: 'Pelabuhan Tanjung Perak', lat: -7.2020, lng: 112.7340 },
      { name: 'Halte Perak Timur', lat: -7.2150, lng: 112.7360 },
      { name: 'Jembatan Merah', lat: -7.2400, lng: 112.7420 },
    ],
    estimatedTime: '16 menit',
  },
  {
    id: 'fd-10',
    routeCode: 'FD-10 (WiraWiri)',
    routeName: 'Stasiun Benteng ↔ Ampel ↔ Semut',
    color: '#10b981',
    frequency: 'Setiap 12 menit',
    operatingHours: '05:30 - 21:00 WIB',
    fare: 'Rp 5.000 (QRIS / Kartu)',
    nearestStation: 'benteng',
    stops: [
      { name: 'Stasiun Benteng', lat: -7.2091, lng: 112.7365 },
      { name: 'Pangkalan Militer Ujung', lat: -7.2050, lng: 112.7390 },
      { name: 'Wisata Religi Ampel', lat: -7.2285, lng: 112.7420 },
      { name: 'Stasiun Kota (Semut)', lat: -7.2415, lng: 112.7441 },
    ],
    estimatedTime: '15 menit',
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
  {
    id: 'td-16', name: 'Taman Pelangi Surabaya', category: 'nature',
    description: 'Taman kota berhias lampu warna-warni di bundaran Dolog Ahmad Yani.',
    lat: -7.3205, lng: 112.7315, rating: 4.4, nearestStation: 'margorejo',
    distanceFromStation: '450m', walkTime: '6 min',
  },
  {
    id: 'td-17', name: 'Plaza Marina IT Center', category: 'shopping',
    description: 'Pusat perbelanjaan gadget, ponsel, dan komputer terlengkap di Jawa Timur.',
    lat: -7.3175, lng: 112.7385, rating: 4.3, nearestStation: 'jemursari',
    distanceFromStation: '600m', walkTime: '8 min',
  },
  {
    id: 'td-18', name: 'City of Tomorrow (Cito) Mall', category: 'shopping',
    description: 'Mall gerbang masuk Surabaya Selatan dekat bundaran Waru.',
    lat: -7.3465, lng: 112.7290, rating: 4.3, nearestStation: 'kertomenanggal',
    distanceFromStation: '400m', walkTime: '5 min',
  },
  {
    id: 'td-19', name: 'Marvell City Mall', category: 'shopping',
    description: 'Pusat belanja modern, bioskop, dan kuliner terintegrasi Ngagel.',
    lat: -7.2885, lng: 112.7485, rating: 4.4, nearestStation: 'ngagel',
    distanceFromStation: '200m', walkTime: '3 min',
  },
  {
    id: 'td-20', name: 'Sentra Wisata Kuliner Bratang Binangun', category: 'culinary',
    description: 'Pusat kuliner binaan Pemkot Surabaya dan pasar bunga legendaris Bratang.',
    lat: -7.2950, lng: 112.7615, rating: 4.5, nearestStation: 'terminal_bratang',
    distanceFromStation: '80m', walkTime: '1 min',
  },
  {
    id: 'td-21', name: 'Jembatan Sawunggaling & TIJ', category: 'heritage',
    description: 'Jembatan ikonik Surabaya penghubung TIJ Joyoboyo langsung ke KBS.',
    lat: -7.2985, lng: 112.7375, rating: 4.6, nearestStation: 'terminal_joyoboyo',
    distanceFromStation: '100m', walkTime: '2 min',
  },
  {
    id: 'td-22', name: 'Grand Pakuwon Food Junction', category: 'culinary',
    description: 'Pusat kuliner tepi danau dengan wahana rekreasi keluarga Surabaya Barat.',
    lat: -7.2625, lng: 112.6710, rating: 4.5, nearestStation: 'tandes',
    distanceFromStation: '800m', walkTime: '10 min',
  },
  {
    id: 'td-23', name: 'Sentra Kuliner Sememi', category: 'culinary',
    description: 'Pusat jajanan dan UMKM kuliner khas Surabaya Barat.',
    lat: -7.2515, lng: 112.6485, rating: 4.2, nearestStation: 'kandangan',
    distanceFromStation: '250m', walkTime: '3 min',
  },
  {
    id: 'td-24', name: 'Stadion Gelora Bung Tomo (GBT)', category: 'heritage',
    description: 'Stadion internasional kebanggaan Persebaya dan venue Piala Dunia U-17.',
    lat: -7.2345, lng: 112.6150, rating: 4.7, nearestStation: 'benowo',
    distanceFromStation: '2.2km', walkTime: 'Feeder 8 min',
  },
  {
    id: 'td-25', name: 'Dipo Lokomotif Sidotopo', category: 'heritage',
    description: 'Dipo lokomotif dan bengkel kereta api terbesar bersejarah sejak zaman kolonial.',
    lat: -7.2350, lng: 112.7565, rating: 4.5, nearestStation: 'sidotopo',
    distanceFromStation: '150m', walkTime: '2 min',
  },
  {
    id: 'td-26', name: 'Surabaya North Quay (SNQ)', category: 'nature',
    description: 'Wisata sunset tepi laut dermaga kapal pesiar mewah internasional.',
    lat: -7.2025, lng: 112.7350, rating: 4.6, nearestStation: 'kalimas',
    distanceFromStation: '1.8km', walkTime: 'Feeder 7 min',
  },
  {
    id: 'td-27', name: 'Wisata Religi Kawasan Sunan Ampel', category: 'religious',
    description: 'Kompleks makam Sunan Ampel dan lorong perdagangan heritage Timur Tengah.',
    lat: -7.2285, lng: 112.7420, rating: 4.8, nearestStation: 'benteng',
    distanceFromStation: '600m', walkTime: '8 min',
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
  {
    stationId: 'terminal_joyoboyo', kecamatan: 'Kec. Wonokromo',
    population: 148_200, density: 14_900,
    avgIncome: 'Rp 4.4 jt/bln', incomeLevel: 'medium',
    ageDistribution: { youth: 23, productive: 63, elderly: 14 },
    householdCount: 37_050, employmentRate: 87.4,
  },
  {
    stationId: 'terminal_purabaya', kecamatan: 'Kec. Waru / Gayungan',
    population: 218_900, density: 9_200,
    avgIncome: 'Rp 3.5 jt/bln', incomeLevel: 'low',
    ageDistribution: { youth: 29, productive: 58, elderly: 13 },
    householdCount: 54_700, employmentRate: 80.1,
  },
  {
    stationId: 'terminal_bratang', kecamatan: 'Kec. Gubeng',
    population: 131_500, density: 15_200,
    avgIncome: 'Rp 4.9 jt/bln', incomeLevel: 'high',
    ageDistribution: { youth: 21, productive: 66, elderly: 13 },
    householdCount: 32_875, employmentRate: 88.6,
  },
  {
    stationId: 'tandes', kecamatan: 'Kec. Tandes',
    population: 114_800, density: 10_800,
    avgIncome: 'Rp 4.2 jt/bln', incomeLevel: 'medium',
    ageDistribution: { youth: 26, productive: 61, elderly: 13 },
    householdCount: 28_450, employmentRate: 85.4,
  },
  {
    stationId: 'kandangan', kecamatan: 'Kec. Benowo',
    population: 74_500, density: 6_800,
    avgIncome: 'Rp 3.6 jt/bln', incomeLevel: 'low',
    ageDistribution: { youth: 28, productive: 59, elderly: 13 },
    householdCount: 18_200, employmentRate: 82.1,
  },
  {
    stationId: 'benowo', kecamatan: 'Kec. Pakal',
    population: 62_300, density: 5_400,
    avgIncome: 'Rp 3.4 jt/bln', incomeLevel: 'low',
    ageDistribution: { youth: 29, productive: 58, elderly: 13 },
    householdCount: 15_400, employmentRate: 81.3,
  },
  {
    stationId: 'ngagel', kecamatan: 'Kec. Wonokromo',
    population: 142_500, density: 14_800,
    avgIncome: 'Rp 4.8 jt/bln', incomeLevel: 'medium',
    ageDistribution: { youth: 23, productive: 64, elderly: 13 },
    householdCount: 35_600, employmentRate: 88.2,
  },
  {
    stationId: 'margorejo', kecamatan: 'Kec. Wonocolo',
    population: 82_100, density: 12_400,
    avgIncome: 'Rp 4.6 jt/bln', incomeLevel: 'medium',
    ageDistribution: { youth: 24, productive: 63, elderly: 13 },
    householdCount: 20_500, employmentRate: 87.5,
  },
  {
    stationId: 'jemursari', kecamatan: 'Kec. Wonocolo',
    population: 84_200, density: 12_700,
    avgIncome: 'Rp 4.7 jt/bln', incomeLevel: 'medium',
    ageDistribution: { youth: 24, productive: 63, elderly: 13 },
    householdCount: 21_050, employmentRate: 87.9,
  },
  {
    stationId: 'kertomenanggal', kecamatan: 'Kec. Gayungan',
    population: 46_200, density: 7_900,
    avgIncome: 'Rp 4.5 jt/bln', incomeLevel: 'medium',
    ageDistribution: { youth: 25, productive: 62, elderly: 13 },
    householdCount: 11_550, employmentRate: 86.4,
  },
  {
    stationId: 'sidotopo', kecamatan: 'Kec. Semampir',
    population: 183_400, density: 28_200,
    avgIncome: 'Rp 3.2 jt/bln', incomeLevel: 'low',
    ageDistribution: { youth: 32, productive: 55, elderly: 13 },
    householdCount: 45_800, employmentRate: 79.8,
  },
  {
    stationId: 'kalimas', kecamatan: 'Kec. Pabean Cantian',
    population: 42_100, density: 7_800,
    avgIncome: 'Rp 3.9 jt/bln', incomeLevel: 'medium',
    ageDistribution: { youth: 29, productive: 57, elderly: 14 },
    householdCount: 10_500, employmentRate: 83.2,
  },
  {
    stationId: 'benteng', kecamatan: 'Kec. Pabean Cantian',
    population: 44_500, density: 8_200,
    avgIncome: 'Rp 3.8 jt/bln', incomeLevel: 'medium',
    ageDistribution: { youth: 30, productive: 56, elderly: 14 },
    householdCount: 11_100, employmentRate: 82.5,
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
  {
    stationId: 'terminal_joyoboyo', aqi: 68, aqiLabel: 'Sedang', aqiColor: '#f59e0b',
    floodRisk: 'sedang', floodRiskColor: '#f59e0b',
    greenSpacePct: 25.4, noiseLevel: 69, noiseLevelLabel: 'Moderate', pm25: 26, temperature: 31,
  },
  {
    stationId: 'terminal_purabaya', aqi: 105, aqiLabel: 'Tidak Sehat (Sensitif)', aqiColor: '#f97316',
    floodRisk: 'tinggi', floodRiskColor: '#ef4444',
    greenSpacePct: 11.5, noiseLevel: 80, noiseLevelLabel: 'Very High', pm25: 46, temperature: 34,
  },
  {
    stationId: 'terminal_bratang', aqi: 70, aqiLabel: 'Sedang', aqiColor: '#f59e0b',
    floodRisk: 'rendah', floodRiskColor: '#10b981',
    greenSpacePct: 28.0, noiseLevel: 66, noiseLevelLabel: 'Moderate', pm25: 27, temperature: 32,
  },
  {
    stationId: 'tandes', aqi: 75, aqiLabel: 'Sedang', aqiColor: '#f59e0b',
    floodRisk: 'rendah', floodRiskColor: '#10b981',
    greenSpacePct: 15.2, noiseLevel: 67, noiseLevelLabel: 'Moderate', pm25: 30, temperature: 32,
  },
  {
    stationId: 'kandangan', aqi: 62, aqiLabel: 'Sedang', aqiColor: '#f59e0b',
    floodRisk: 'sedang', floodRiskColor: '#f59e0b',
    greenSpacePct: 32.5, noiseLevel: 60, noiseLevelLabel: 'Low', pm25: 22, temperature: 31,
  },
  {
    stationId: 'benowo', aqi: 58, aqiLabel: 'Baik', aqiColor: '#10b981',
    floodRisk: 'sedang', floodRiskColor: '#f59e0b',
    greenSpacePct: 38.0, noiseLevel: 58, noiseLevelLabel: 'Low', pm25: 19, temperature: 31,
  },
  {
    stationId: 'ngagel', aqi: 74, aqiLabel: 'Sedang', aqiColor: '#f59e0b',
    floodRisk: 'rendah', floodRiskColor: '#10b981',
    greenSpacePct: 17.8, noiseLevel: 69, noiseLevelLabel: 'Moderate', pm25: 29, temperature: 32,
  },
  {
    stationId: 'margorejo', aqi: 78, aqiLabel: 'Sedang', aqiColor: '#f59e0b',
    floodRisk: 'rendah', floodRiskColor: '#10b981',
    greenSpacePct: 19.4, noiseLevel: 71, noiseLevelLabel: 'High', pm25: 31, temperature: 32,
  },
  {
    stationId: 'jemursari', aqi: 76, aqiLabel: 'Sedang', aqiColor: '#f59e0b',
    floodRisk: 'rendah', floodRiskColor: '#10b981',
    greenSpacePct: 20.1, noiseLevel: 70, noiseLevelLabel: 'Moderate', pm25: 30, temperature: 32,
  },
  {
    stationId: 'kertomenanggal', aqi: 82, aqiLabel: 'Sedang', aqiColor: '#f59e0b',
    floodRisk: 'rendah', floodRiskColor: '#10b981',
    greenSpacePct: 21.0, noiseLevel: 73, noiseLevelLabel: 'High', pm25: 34, temperature: 33,
  },
  {
    stationId: 'sidotopo', aqi: 92, aqiLabel: 'Tidak Sehat (Sensitif)', aqiColor: '#f97316',
    floodRisk: 'tinggi', floodRiskColor: '#ef4444',
    greenSpacePct: 7.5, noiseLevel: 76, noiseLevelLabel: 'High', pm25: 41, temperature: 33,
  },
  {
    stationId: 'kalimas', aqi: 98, aqiLabel: 'Tidak Sehat (Sensitif)', aqiColor: '#f97316',
    floodRisk: 'tinggi', floodRiskColor: '#ef4444',
    greenSpacePct: 5.2, noiseLevel: 78, noiseLevelLabel: 'Very High', pm25: 44, temperature: 34,
  },
  {
    stationId: 'benteng', aqi: 94, aqiLabel: 'Tidak Sehat (Sensitif)', aqiColor: '#f97316',
    floodRisk: 'tinggi', floodRiskColor: '#ef4444',
    greenSpacePct: 6.8, noiseLevel: 75, noiseLevelLabel: 'High', pm25: 42, temperature: 33,
  },
];

// ═══════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════

export function getTrainSchedulesForStation(stationId: StationId): TrainSchedule[] {
  const stationMeta = getStationInfo(stationId);
  const results: TrainSchedule[] = [];

  for (const train of TRAIN_MASTER_DATA) {
    const stopIdx = train.stops.findIndex((s) => s.station === stationId);
    if (stopIdx === -1) continue; // Skip trains that do not call at this station

    const currentStop = train.stops[stopIdx];
    const isFirstStop = stopIdx === 0;
    const isLastStop = stopIdx === train.stops.length - 1;

    // Determine next stop
    let nextStop: string | undefined;
    if (isLastStop) {
      if (train.direction === 'southbound') {
        nextStop = 'Stasiun Sidoarjo (Terminus)';
      } else {
        nextStop = undefined;
      }
    } else {
      const nextStationId = train.stops[stopIdx + 1].station;
      nextStop = STATION_NAMES[nextStationId]?.shortName || nextStationId;
    }

    // Check if this train terminates at this station
    const isTerminus = isLastStop && (
      train.direction === 'northbound' && (stationId === 'semut' || (stationId === 'pasar_turi' && train.destination === 'Pasar Turi'))
    );

    const stopsAtList = train.stops.map((s) => s.station);

    // Dynamic origin and destination display
    const originDisplay = isFirstStop ? stationMeta.fullName : train.origin;
    const destDisplay = isTerminus ? `Pemberhentian Akhir (${stationMeta.shortName})` : train.destination;

    results.push({
      id: `${train.id}-${stationId}`,
      trainName: train.trainName,
      trainNumber: train.trainNumber,
      type: train.type,
      direction: train.direction,
      directionLabel: train.direction === 'southbound' 
        ? 'Arah Sidoarjo (Selatan)' 
        : (isTerminus ? `Tiba di ${stationMeta.shortName}` : 'Arah Surabaya Kota (Utara)'),
      origin: originDisplay,
      destination: destDisplay,
      departureTime: currentStop.dep,
      arrivalTime: train.terminusArrival,
      platform: currentStop.platform,
      status: train.status,
      stopsAt: stopsAtList,
      currentStationName: stationMeta.fullName,
      nextStop,
      isTerminus,
    });
  }

  // Sort chronologically by departure time
  return results.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
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
