import { describe, it, expect } from 'vitest';
import { FALLBACK_STATIONS } from '@/lib/api';

describe('TransitERA Station Data & Scorecard Contract', () => {
  it('contains SRRL Surabaya stations and major intermodal terminals', () => {
    expect(FALLBACK_STATIONS.length).toBeGreaterThanOrEqual(8);
    const stationIds = FALLBACK_STATIONS.map((s) => s.id);
    expect(stationIds).toContain('gubeng');
    expect(stationIds).toContain('pasar_turi');
    expect(stationIds).toContain('semut');
    expect(stationIds).toContain('wonokromo');
    expect(stationIds).toContain('waru');
    expect(stationIds).toContain('terminal_joyoboyo');
    expect(stationIds).toContain('terminal_purabaya');
    expect(stationIds).toContain('terminal_bratang');
  });

  it('validates 5D dimensions range between 0 and 100', () => {
    FALLBACK_STATIONS.forEach((station) => {
      expect(station.tod_readiness_score).toBeGreaterThanOrEqual(0);
      expect(station.tod_readiness_score).toBeLessThanOrEqual(100);

      expect(station.scores.density).toBeGreaterThanOrEqual(0);
      expect(station.scores.diversity).toBeGreaterThanOrEqual(0);
      expect(station.scores.design).toBeGreaterThanOrEqual(0);
      expect(station.scores.destination_accessibility).toBeGreaterThanOrEqual(0);
      expect(station.scores.distance_to_transit).toBeGreaterThanOrEqual(0);

      expect(station.njop_premium.avg_njop_premium_pct).toBeGreaterThan(0);
      expect(station.njop_premium.ci_lower_pct).toBeLessThan(station.njop_premium.ci_upper_pct);
    });
  });
});
