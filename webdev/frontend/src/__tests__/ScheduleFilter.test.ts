import { describe, it, expect } from 'vitest';
import {
  getTrainSchedulesForStation,
  getBusRoutesForStation,
  getTouristDestinationsForStation,
  getStationInfo,
  getDirectionsUrl,
  STATION_NAMES,
} from '@/lib/dummy-data';

describe('Station-Specific Transit Schedules and Feeders', () => {
  it('should return accurate station metadata for all 5 stations', () => {
    expect(getStationInfo('gubeng').code).toBe('SGU');
    expect(getStationInfo('pasar_turi').code).toBe('SBI');
    expect(getStationInfo('semut').code).toBe('SB');
    expect(getStationInfo('wonokromo').code).toBe('WO');
    expect(getStationInfo('waru').code).toBe('WR');
  });

  it('should calculate departure times and platforms specific to Stasiun Gubeng', () => {
    const gubengTrains = getTrainSchedulesForStation('gubeng');
    expect(gubengTrains.length).toBeGreaterThan(0);

    // KA 7501 departs Gubeng at 06:31 on Jalur 4 heading to Sidoarjo
    const ka7501 = gubengTrains.find((t) => t.trainNumber === 'KA 7501');
    expect(ka7501).toBeDefined();
    expect(ka7501?.departureTime).toBe('06:31');
    expect(ka7501?.platform).toBe(4);
    expect(ka7501?.destination).toBe('Sidoarjo');
    expect(ka7501?.nextStop).toBe('Wonokromo');

    // KA 7503 departs Gubeng at 07:30 on Jalur 1 heading to Surabaya Kota
    const ka7503 = gubengTrains.find((t) => t.trainNumber === 'KA 7503');
    expect(ka7503).toBeDefined();
    expect(ka7503?.departureTime).toBe('07:30');
    expect(ka7503?.platform).toBe(1);
    expect(ka7503?.nextStop).toBe('Pasar Turi');
  });

  it('should reflect line-specific stops (CL Sindro vs CL Dhoho/Penataran)', () => {
    const pasarTuriTrains = getTrainSchedulesForStation('pasar_turi');
    const semutTrains = getTrainSchedulesForStation('semut');

    // CL Sindro (KA 531) originates at Pasar Turi, does not stop at Semut
    expect(pasarTuriTrains.some((t) => t.trainNumber === 'KA 531')).toBe(true);
    expect(semutTrains.some((t) => t.trainNumber === 'KA 531')).toBe(false);

    // CL Dhoho (KA 401) stops at Semut, bypasses Pasar Turi
    expect(semutTrains.some((t) => t.trainNumber === 'KA 401')).toBe(true);
    expect(pasarTuriTrains.some((t) => t.trainNumber === 'KA 401')).toBe(false);
  });

  it('should correctly flag terminus arrivals at Semut', () => {
    const semutTrains = getTrainSchedulesForStation('semut');
    const ka7503 = semutTrains.find((t) => t.trainNumber === 'KA 7503');
    expect(ka7503?.isTerminus).toBe(true);
    expect(ka7503?.destination).toContain('Pemberhentian Akhir');
    expect(ka7503?.departureTime).toBe('07:45');
  });

  it('should filter bus routes per station with both Suroboyo Bus and WiraWiri', () => {
    const gubengBuses = getBusRoutesForStation('gubeng');
    expect(gubengBuses.some((b) => b.routeCode.includes('SB-02'))).toBe(true);
    expect(gubengBuses.some((b) => b.routeCode.includes('FD-07'))).toBe(true);

    const wonokromoBuses = getBusRoutesForStation('wonokromo');
    expect(wonokromoBuses.some((b) => b.routeCode.includes('SB-05'))).toBe(true);
    expect(wonokromoBuses.some((b) => b.routeCode.includes('FD-04'))).toBe(true);
  });

  it('should generate valid Google Maps navigation hyperlinks from origin station to tourist destination', () => {
    const semutMeta = getStationInfo('semut');
    const semutSpots = getTouristDestinationsForStation('semut');
    expect(semutSpots.length).toBeGreaterThan(0);

    const houseOfSampoerna = semutSpots.find((s) => s.name === 'House of Sampoerna');
    expect(houseOfSampoerna).toBeDefined();

    const url = getDirectionsUrl(semutMeta.lat, semutMeta.lng, houseOfSampoerna!.lat, houseOfSampoerna!.lng, 'walking');
    expect(url).toContain('https://www.google.com/maps/dir/?api=1');
    expect(url).toContain(`origin=${semutMeta.lat},${semutMeta.lng}`);
    expect(url).toContain(`destination=${houseOfSampoerna!.lat},${houseOfSampoerna!.lng}`);
    expect(url).toContain('travelmode=walking');
  });
});
