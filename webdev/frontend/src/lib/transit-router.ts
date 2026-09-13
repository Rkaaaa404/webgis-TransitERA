import { StationId, RouteStep, RoutePlan } from '@/types';
import { STATION_NAMES, getStationInfo } from '@/lib/dummy-data';

export interface TransitEdge {
  from_station: StationId;
  to_station: StationId;
  mode: 'train' | 'bus' | 'feeder' | 'walk';
  route_id?: string;
  route_name: string;
  line_code: string;
  line_color: string;
  duration_min: number;
  desc: string;
}

export type TransitGraph = Record<string, TransitEdge[]>;

// Corridors of Commuter Rail (KRL / Kereta Api Komuter Surabaya)
const COMMUTER_RAIL_SEGMENTS: [StationId, StationId, number][] = [
  // West Corridor (Lintas Barat)
  ['benowo', 'kandangan', 6],
  ['kandangan', 'tandes', 5],
  ['tandes', 'pasar_turi', 7],

  // Central Core Link
  ['pasar_turi', 'semut', 6],
  ['semut', 'gubeng', 5],
  ['pasar_turi', 'gubeng', 8],

  // South Commuter Spine (Lintas Selatan Wonokromo - Waru)
  ['gubeng', 'ngagel', 4],
  ['ngagel', 'wonokromo', 4],
  ['wonokromo', 'margorejo', 3],
  ['margorejo', 'jemursari', 3],
  ['jemursari', 'kertomenanggal', 3],
  ['kertomenanggal', 'waru', 4],

  // North Branch
  ['semut', 'sidotopo', 5],
  ['semut', 'kalimas', 6],
  ['kalimas', 'benteng', 4]
];

// Fallback metadata of Surabaya transit routes if GeoJSON not loaded
const KNOWN_ROUTES_FALLBACK = [
  {
    id: 'sbr1',
    code: 'R1',
    name: 'Suroboyo Bus Koridor 1 (Purabaya - Rajawali)',
    color: '#EF4444',
    operator: 'Suroboyo Bus',
    stations: ['pasar_turi', 'wonokromo', 'semut', 'waru', 'margorejo', 'jemursari', 'kertomenanggal', 'kalimas']
  },
  {
    id: 'tmk2',
    code: 'R2',
    name: 'Trans Semanggi Suroboyo Koridor 2 (Lidah Wetan - ITS)',
    color: '#3B82F6',
    operator: 'Trans Semanggi',
    stations: ['gubeng']
  },
  {
    id: 'sbr4',
    code: 'R4',
    name: 'Suroboyo Bus Koridor 4 (TIJ - TIJ Loop)',
    color: '#10B981',
    operator: 'Suroboyo Bus',
    stations: ['gubeng', 'waru', 'jemursari', 'kertomenanggal', 'terminal_joyoboyo']
  },
  {
    id: 'sbr5',
    code: 'R5',
    name: 'Suroboyo Bus Koridor 5 (Romokalisari - Joyoboyo)',
    color: '#8B5CF6',
    operator: 'Suroboyo Bus',
    stations: ['tandes', 'kandangan', 'benowo', 'terminal_joyoboyo']
  },
  {
    id: 'fd02',
    code: 'FD02',
    name: 'Feeder WiraWiri FD02 (Park & Ride Mayjend - Balai Kota)',
    color: '#06B6D4',
    operator: 'WiraWiri Suroboyo',
    stations: ['gubeng']
  },
  {
    id: 'fd03',
    code: 'FD03',
    name: 'Feeder WiraWiri FD03 (TIJ - Yos Sudarso)',
    color: '#F59E0B',
    operator: 'WiraWiri Suroboyo',
    stations: ['wonokromo', 'ngagel', 'terminal_joyoboyo']
  },
  {
    id: 'fd04',
    code: 'FD04',
    name: 'Feeder WiraWiri FD04 (Penjaringan Sari - Gunung Anyar)',
    color: '#EC4899',
    operator: 'WiraWiri Suroboyo',
    stations: ['gubeng', 'wonokromo', 'semut', 'ngagel', 'margorejo']
  },
  {
    id: 'fd07',
    code: 'FD07',
    name: 'Feeder WiraWiri FD07 (Bratang - Pasar Turi)',
    color: '#14B8A6',
    operator: 'WiraWiri Suroboyo',
    stations: ['gubeng', 'pasar_turi', 'terminal_bratang']
  },
  {
    id: 'fd09',
    code: 'FD09',
    name: 'Feeder WiraWiri FD09 (Manukan - TIJ)',
    color: '#6366F1',
    operator: 'WiraWiri Suroboyo',
    stations: ['wonokromo', 'tandes', 'margorejo', 'kertomenanggal', 'terminal_joyoboyo']
  },
  {
    id: 'fd10',
    code: 'FD10',
    name: 'Feeder WiraWiri FD10 (Keputih - Pasar Atom)',
    color: '#84CC16',
    operator: 'WiraWiri Suroboyo',
    stations: ['gubeng', 'semut']
  },
  {
    id: 'fd12',
    code: 'FD12',
    name: 'Feeder WiraWiri FD12 (Waru - Rungkut)',
    color: '#F97316',
    operator: 'WiraWiri Suroboyo',
    stations: ['waru']
  },
  {
    id: 'sbrt',
    code: 'SBT',
    name: 'Suroboyo Bus Tumpuk Heritage Tour',
    color: '#D97706',
    operator: 'Suroboyo Bus',
    stations: ['pasar_turi', 'wonokromo', 'waru', 'margorejo', 'jemursari', 'kertomenanggal']
  }
];

let _cachedGraph: TransitGraph | null = null;

export function buildTransitGraph(trayekFc?: any): TransitGraph {
  if (_cachedGraph && !trayekFc) {
    return _cachedGraph;
  }

  const graph: TransitGraph = {};

  const ensureNode = (id: string) => {
    if (!graph[id]) graph[id] = [];
  };

  // 1. Add Commuter Rail edges (bidirectional)
  for (const [stA, stB, dur] of COMMUTER_RAIL_SEGMENTS) {
    ensureNode(stA);
    ensureNode(stB);

    const nameA = getStationInfo(stA).shortName;
    const nameB = getStationInfo(stB).shortName;

    graph[stA].push({
      from_station: stA,
      to_station: stB,
      mode: 'train',
      route_name: 'KRL Commuter Line Surabaya',
      line_code: 'KRL',
      line_color: '#EF4444',
      duration_min: dur,
      desc: `Naik Kereta Komuter dari ${nameA} langsung ke ${nameB} (~${dur} mnt)`
    });

    graph[stB].push({
      from_station: stB,
      to_station: stA,
      mode: 'train',
      route_name: 'KRL Commuter Line Surabaya',
      line_code: 'KRL',
      line_color: '#EF4444',
      duration_min: dur,
      desc: `Naik Kereta Komuter dari ${nameB} langsung ke ${nameA} (~${dur} mnt)`
    });
  }

  // 2. Add Bus & Feeder routes
  let routeList = KNOWN_ROUTES_FALLBACK;

  if (trayekFc?.features && Array.isArray(trayekFc.features) && trayekFc.features.length > 0) {
    routeList = trayekFc.features.map((f: any) => {
      const p = f.properties || {};
      let connected: string[] = [];
      if (Array.isArray(p.connected_station_ids)) {
        connected = p.connected_station_ids;
      } else if (typeof p.connected_stations === 'string') {
        try {
          const parsed = JSON.parse(p.connected_stations);
          if (Array.isArray(parsed)) {
            connected = parsed.map((x: any) => x.station_id || x.id);
          }
        } catch {}
      }

      return {
        id: p.route_id || f.id || 'route',
        code: p.code || 'BUS',
        name: p.display_name || p.name || 'Trayek Angkutan Umum',
        color: p.color || '#10B981',
        operator: p.operator || 'Dishub Surabaya',
        stations: connected
      };
    });
  }

  for (const r of routeList) {
    const connected = r.stations.filter(Boolean);
    if (connected.length < 2) continue;

    const isFeeder = r.code.toUpperCase().startsWith('FD') || r.code.toUpperCase().includes('FEEDER');
    const mode = isFeeder ? 'feeder' : 'bus';

    // Connect stations served by this route
    for (let i = 0; i < connected.length; i++) {
      for (let j = 0; j < connected.length; j++) {
        if (i === j) continue;
        const stA = connected[i];
        const stB = connected[j];
        ensureNode(stA);
        ensureNode(stB);

        const nameA = getStationInfo(stA).shortName;
        const nameB = getStationInfo(stB).shortName;
        const hops = Math.abs(i - j);
        const dur = Math.max(6, hops * 7);

        graph[stA].push({
          from_station: stA,
          to_station: stB,
          mode: mode,
          route_id: r.id,
          route_name: r.name,
          line_code: r.code,
          line_color: r.color,
          duration_min: dur,
          desc: `Naik ${r.name} (${r.code}) dari ${nameA} menuju ${nameB} (~${dur} mnt)`
        });
      }
    }
  }

  // 3. Add walk connectors for close terminals/stations
  const WALK_CONNECTORS: [StationId, StationId, number][] = [
    ['wonokromo', 'terminal_joyoboyo', 5],
    ['waru', 'terminal_purabaya', 7],
    ['ngagel', 'terminal_bratang', 10]
  ];

  for (const [stA, stB, dur] of WALK_CONNECTORS) {
    ensureNode(stA);
    ensureNode(stB);
    const nameA = getStationInfo(stA).shortName;
    const nameB = getStationInfo(stB).shortName;

    graph[stA].push({
      from_station: stA,
      to_station: stB,
      mode: 'walk',
      route_name: 'Jalan Kaki / Skybridge',
      line_code: 'WALK',
      line_color: '#94A3B8',
      duration_min: dur,
      desc: `Jalan kaki melalui skybridge/trotoar terpadu dari ${nameA} ke ${nameB} (~${dur} mnt)`
    });

    graph[stB].push({
      from_station: stB,
      to_station: stA,
      mode: 'walk',
      route_name: 'Jalan Kaki / Skybridge',
      line_code: 'WALK',
      line_color: '#94A3B8',
      duration_min: dur,
      desc: `Jalan kaki melalui skybridge/trotoar terpadu dari ${nameB} ke ${nameA} (~${dur} mnt)`
    });
  }

  _cachedGraph = graph;
  return graph;
}

export function findRoute(
  fromStation: StationId,
  toStation: StationId,
  trayekFc?: any
): RoutePlan | null {
  const graph = buildTransitGraph(trayekFc);
  const fromId = fromStation.toLowerCase().trim();
  const toId = toStation.toLowerCase().trim();

  const fromMeta = getStationInfo(fromId);
  const toMeta = getStationInfo(toId);

  // Case 1: Same Station
  if (fromId === toId) {
    const departingEdges = graph[fromId] || [];
    const uniqueRoutes = new Map<string, TransitEdge>();
    for (const edge of departingEdges) {
      const key = edge.line_code;
      if (!uniqueRoutes.has(key)) {
        uniqueRoutes.set(key, edge);
      }
    }

    const steps: RouteStep[] = Array.from(uniqueRoutes.values()).map((edge) => ({
      mode: edge.mode,
      route_id: edge.route_id,
      route_name: edge.route_name,
      line_code: edge.line_code,
      line_color: edge.line_color,
      from_station: fromMeta.shortName,
      to_station: getStationInfo(edge.to_station).shortName,
      duration_min: edge.duration_min,
      desc: `Tersedia ${edge.route_name} (${edge.line_code}) menuju ${getStationInfo(edge.to_station).shortName}`
    }));

    return {
      from: fromId,
      to: toId,
      steps: steps.slice(0, 4),
      total_min: 0,
      route_ids: Array.from(uniqueRoutes.values()).map(e => e.route_id).filter(Boolean) as string[],
      has_transfer: false
    };
  }

  // Case 2: BFS Shortest Path Search
  interface QueueItem {
    current: string;
    path: TransitEdge[];
    totalDuration: number;
    transfers: number;
  }

  const queue: QueueItem[] = [{ current: fromId, path: [], totalDuration: 0, transfers: 0 }];
  const visited = new Map<string, number>(); // station -> min transfers
  visited.set(fromId, 0);

  let bestPlan: QueueItem | null = null;

  while (queue.length > 0) {
    const item = queue.shift()!;
    const { current, path, totalDuration, transfers } = item;

    if (current === toId) {
      if (!bestPlan || totalDuration < bestPlan.totalDuration) {
        bestPlan = item;
      }
      continue;
    }

    if (transfers >= 2) continue; // max 2 transfers allowed

    const neighbors = graph[current] || [];
    for (const edge of neighbors) {
      const nextSt = edge.to_station;

      // Check if mode/route transfer occurs
      const lastEdge = path[path.length - 1];
      const isTransfer = lastEdge && (lastEdge.route_id !== edge.route_id || lastEdge.mode !== edge.mode);
      const nextTransfers = transfers + (isTransfer ? 1 : 0);
      const transferPenalty = isTransfer ? 5 : 0; // 5 min transfer waiting time
      const nextDuration = totalDuration + edge.duration_min + transferPenalty;

      const prevMinTransfers = visited.get(nextSt);
      if (prevMinTransfers === undefined || nextTransfers < prevMinTransfers) {
        visited.set(nextSt, nextTransfers);
        queue.push({
          current: nextSt,
          path: [...path, edge],
          totalDuration: nextDuration,
          transfers: nextTransfers
        });
      }
    }
  }

  if (bestPlan && bestPlan.path.length > 0) {
    const allCoords: [number, number][] = [];
    const steps: RouteStep[] = [];

    // 1. Initial walk leg: dari pintu stasiun ke peron / halte keberangkatan
    const firstEdge = bestPlan.path[0];
    const startMeta = getStationInfo(firstEdge.from_station);
    const startCoord: [number, number] = [startMeta.lng, startMeta.lat];
    allCoords.push(startCoord);

    const initialWalkTarget: [number, number] = [
      Number((startMeta.lng + 0.0006).toFixed(6)),
      Number((startMeta.lat + 0.0005).toFixed(6))
    ];
    steps.push({
      mode: 'walk',
      from_station: startMeta.shortName,
      to_station: `${startMeta.shortName} Gate`,
      duration_min: 3,
      desc: `Jalan kaki dari pintu masuk ${startMeta.shortName} menuju peron transit`,
      coordinates: [startCoord, initialWalkTarget]
    });
    allCoords.push(initialWalkTarget);

    let currentCoord = initialWalkTarget;

    // 2. Transit Legs (Kereta / Bus / Feeder)
    for (let i = 0; i < bestPlan.path.length; i++) {
      const edge = bestPlan.path[i];
      const fromSt = getStationInfo(edge.from_station);
      const toSt = getStationInfo(edge.to_station);
      const toCoord: [number, number] = [toSt.lng, toSt.lat];

      // Interpolasi kelengkungan koridor
      const midLng = Number(((fromSt.lng + toSt.lng) / 2 + (edge.mode === 'train' ? 0.0006 : -0.0008)).toFixed(6));
      const midLat = Number(((fromSt.lat + toSt.lat) / 2 + (edge.mode === 'train' ? -0.0004 : 0.0006)).toFixed(6));
      const legCoords: [number, number][] = [currentCoord, [midLng, midLat], toCoord];

      steps.push({
        mode: edge.mode,
        route_id: edge.route_id,
        route_name: edge.route_name,
        line_code: edge.line_code,
        line_color: edge.line_color,
        from_station: fromSt.shortName,
        to_station: toSt.shortName,
        duration_min: edge.duration_min,
        desc: edge.desc,
        coordinates: legCoords
      });

      allCoords.push([midLng, midLat], toCoord);
      currentCoord = toCoord;

      // Leg transfer antarmoda jika ada pergantian moda atau rute
      if (i < bestPlan.path.length - 1) {
        const nextEdge = bestPlan.path[i + 1];
        if (nextEdge.route_id !== edge.route_id || nextEdge.mode !== edge.mode) {
          const transferTarget: [number, number] = [
            Number((toSt.lng - 0.0005).toFixed(6)),
            Number((toSt.lat + 0.0005).toFixed(6))
          ];
          steps.push({
            mode: 'walk',
            from_station: `${toSt.shortName} Gate`,
            to_station: `Halte ${nextEdge.line_code}`,
            duration_min: 4,
            desc: `Transfer antarmoda: jalan kaki menuju peron/halte ${nextEdge.route_name}`,
            coordinates: [currentCoord, transferTarget]
          });
          allCoords.push(transferTarget);
          currentCoord = transferTarget;
        }
      }
    }

    // 3. Final walk leg menuju pintu keluar tujuan
    const destMeta = getStationInfo(toId);
    const destExitCoord: [number, number] = [
      Number((destMeta.lng + 0.0005).toFixed(6)),
      Number((destMeta.lat - 0.0005).toFixed(6))
    ];
    steps.push({
      mode: 'walk',
      from_station: `${destMeta.shortName} Gate`,
      to_station: `Pintu Keluar ${destMeta.shortName}`,
      duration_min: 3,
      desc: `Keluar melalui jalur pedestrian ramah disabilitas menuju area penjemputan`,
      coordinates: [currentCoord, destExitCoord]
    });
    allCoords.push(destExitCoord);

    const routeIds = Array.from(new Set(bestPlan.path.map(e => e.route_id).filter(Boolean))) as string[];

    return {
      from: fromId as StationId,
      to: toId as StationId,
      steps,
      total_min: bestPlan.totalDuration + 6,
      route_ids: routeIds,
      has_transfer: bestPlan.transfers > 0,
      geometry: allCoords
    };
  }

  // Fallback if no direct or multi-hop path found: suggest connecting via closest primary hub (Gubeng / Wonokromo)
  const fallbackHub: StationId = 'gubeng';
  const hubMeta = getStationInfo(fallbackHub);
  const fromCoord: [number, number] = [fromMeta.lng, fromMeta.lat];
  const hubCoord: [number, number] = [hubMeta.lng, hubMeta.lat];
  const toCoord: [number, number] = [toMeta.lng, toMeta.lat];

  const mid1: [number, number] = [Number(((fromMeta.lng + hubMeta.lng) / 2).toFixed(6)), Number(((fromMeta.lat + hubMeta.lat) / 2).toFixed(6))];
  const mid2: [number, number] = [Number(((hubMeta.lng + toMeta.lng) / 2).toFixed(6)), Number(((hubMeta.lat + toMeta.lat) / 2).toFixed(6))];

  return {
    from: fromId as StationId,
    to: toId as StationId,
    steps: [
      {
        mode: 'feeder',
        from_station: fromMeta.shortName,
        to_station: hubMeta.shortName,
        duration_min: 15,
        desc: `Gunakan mikrolet/feeder penghubung dari ${fromMeta.shortName} menuju hub transit utama ${hubMeta.shortName}`,
        coordinates: [fromCoord, mid1, hubCoord]
      },
      {
        mode: 'train',
        from_station: hubMeta.shortName,
        to_station: toMeta.shortName,
        duration_min: 20,
        desc: `Lanjutkan perjalanan transit dari ${hubMeta.shortName} menuju stasiun tujuan ${toMeta.shortName}`,
        coordinates: [hubCoord, mid2, toCoord]
      }
    ],
    total_min: 35,
    route_ids: ['sbr1', 'fd04'],
    has_transfer: true,
    geometry: [fromCoord, mid1, hubCoord, mid2, toCoord]
  };
}

export interface DestinationTarget {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  walkTime?: string;
  distanceFromStation?: string;
  category?: string;
  description?: string;
}

/**
 * Finds an internal route from a station to a specific POI / tourist destination
 * combining walking and feeder/bus transit without external redirects.
 */
export function findRouteToDestination(
  fromStation: StationId,
  destination: DestinationTarget,
  trayekFc?: any
): RoutePlan {
  const fromMeta = getStationInfo(fromStation);
  const startCoord: [number, number] = [fromMeta.lng, fromMeta.lat];
  const destCoord: [number, number] = [destination.lng, destination.lat];

  // Calculate approximate distance in meters
  const dLat = (destCoord[1] - startCoord[1]) * 111000;
  const dLng = (destCoord[0] - startCoord[0]) * 111000 * Math.cos((startCoord[1] * Math.PI) / 180);
  const distMeters = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));

  // Determine if it's primarily walking or transit + walking
  const isBusTransit = Boolean(
    (destination.walkTime && (destination.walkTime.includes('Bus') || destination.walkTime.includes('Feeder'))) ||
    distMeters > 1300
  );

  // Extract or calculate duration
  let parsedMinutes = 8;
  if (destination.walkTime) {
    const m = destination.walkTime.match(/(\d+)\s*mnt/i);
    if (m) parsedMinutes = parseInt(m[1], 10);
  } else {
    parsedMinutes = Math.max(3, Math.round(distMeters / 80));
  }

  const allCoords: [number, number][] = [];
  const steps: RouteStep[] = [];

  if (!isBusTransit) {
    // ── Pure Walking Route along realistic pedestrian path ──
    const corner1: [number, number] = [
      Number((startCoord[0] + (destCoord[0] - startCoord[0]) * 0.45).toFixed(6)),
      Number((startCoord[1] + (destCoord[1] - startCoord[1]) * 0.15).toFixed(6))
    ];
    const corner2: [number, number] = [
      Number((startCoord[0] + (destCoord[0] - startCoord[0]) * 0.75).toFixed(6)),
      Number((startCoord[1] + (destCoord[1] - startCoord[1]) * 0.85).toFixed(6))
    ];

    const walkCoords: [number, number][] = [startCoord, corner1, corner2, destCoord];
    walkCoords.forEach(c => allCoords.push(c));

    steps.push({
      mode: 'walk',
      from_station: fromMeta.shortName,
      to_station: destination.name,
      duration_min: parsedMinutes,
      desc: `Jalan kaki melalui jalur pedestrian dan trotoar terpadu dari ${fromMeta.shortName} menuju ${destination.name} (~${distMeters} m, ${parsedMinutes} mnt)`,
      coordinates: walkCoords
    });

    return {
      from: fromStation,
      to: (destination.id || 'poi-dest') as StationId,
      steps,
      total_min: parsedMinutes,
      route_ids: [],
      has_transfer: false,
      geometry: allCoords
    };
  } else {
    // ── Multi-Modal Transit + Walking Route (Feeder / Bus) ──
    const stopWalkCoord: [number, number] = [
      Number((startCoord[0] + 0.0006).toFixed(6)),
      Number((startCoord[1] + 0.0004).toFixed(6))
    ];
    const step1Coords: [number, number][] = [startCoord, stopWalkCoord];
    step1Coords.forEach(c => allCoords.push(c));

    steps.push({
      mode: 'walk',
      from_station: fromMeta.shortName,
      to_station: `Halte Integrasi ${fromMeta.shortName}`,
      duration_min: 3,
      desc: `Jalan kaki dari peron stasiun ke Halte Integrasi ${fromMeta.shortName} (Skybridge/Trotoar)`,
      coordinates: step1Coords
    });

    // Step 2: Transit Ride
    const destApproachCoord: [number, number] = [
      Number((destCoord[0] - (destCoord[0] - startCoord[0]) * 0.1).toFixed(6)),
      Number((destCoord[1] - (destCoord[1] - startCoord[1]) * 0.1).toFixed(6))
    ];
    const transitMidCoord: [number, number] = [
      Number(((stopWalkCoord[0] + destApproachCoord[0]) / 2 + 0.0005).toFixed(6)),
      Number(((stopWalkCoord[1] + destApproachCoord[1]) / 2 - 0.0004).toFixed(6))
    ];
    const step2Coords: [number, number][] = [stopWalkCoord, transitMidCoord, destApproachCoord];
    step2Coords.forEach(c => allCoords.push(c));

    let transitCode = 'FD02';
    let transitName = 'Feeder WiraWiri FD02';
    let transitColor = '#06B6D4';
    let routeId = 'fd02';

    if (fromStation === 'pasar_turi' || fromStation === 'semut') {
      transitCode = 'R1';
      transitName = 'Suroboyo Bus Koridor 1';
      transitColor = '#EF4444';
      routeId = 'sbr1';
    } else if (fromStation === 'wonokromo' || fromStation === 'terminal_joyoboyo') {
      transitCode = 'FD03';
      transitName = 'Feeder WiraWiri FD03';
      transitColor = '#F59E0B';
      routeId = 'fd03';
    }

    const transitMins = Math.max(7, parsedMinutes - 6);
    steps.push({
      mode: transitCode.startsWith('FD') ? 'feeder' : 'bus',
      route_id: routeId,
      route_name: transitName,
      line_code: transitCode,
      line_color: transitColor,
      from_station: `Halte ${fromMeta.shortName}`,
      to_station: `Halte Dekat ${destination.name}`,
      duration_min: transitMins,
      desc: `Naik ${transitName} (${transitCode}) dari Halte ${fromMeta.shortName} menuju halte transit terdekat ${destination.name}`,
      coordinates: step2Coords
    });

    // Step 3: Final walk to destination entrance
    const step3Coords: [number, number][] = [destApproachCoord, destCoord];
    step3Coords.forEach(c => allCoords.push(c));

    steps.push({
      mode: 'walk',
      from_station: `Halte Dekat ${destination.name}`,
      to_station: destination.name,
      duration_min: 3,
      desc: `Jalan kaki dari halte bus ke gerbang pintu masuk ${destination.name}`,
      coordinates: step3Coords
    });

    return {
      from: fromStation,
      to: (destination.id || 'poi-dest') as StationId,
      steps,
      total_min: transitMins + 6,
      route_ids: [routeId],
      has_transfer: true,
      geometry: allCoords
    };
  }
}

