import { describe, it, expect } from 'vitest';
import { buildTransitGraph, findRoute, findRouteToDestination } from '../lib/transit-router';

describe('Transit Router Engine', () => {
  it('should build transit graph with station nodes and commuter connections', () => {
    const graph = buildTransitGraph();
    expect(graph).toBeDefined();
    expect(graph['gubeng']).toBeDefined();
    expect(graph['pasar_turi']).toBeDefined();
    expect(graph['wonokromo']).toBeDefined();
    expect(graph['waru']).toBeDefined();
    expect(graph['benowo']).toBeDefined();

    // Gubeng should have outgoing edges (KRL and/or bus)
    expect(graph['gubeng'].length).toBeGreaterThan(0);
    const hasTrainOrBus = graph['gubeng'].some(
      (edge) => edge.mode === 'train' || edge.mode === 'bus' || edge.mode === 'feeder'
    );
    expect(hasTrainOrBus).toBe(true);
  });

  it('should return departing options when origin equals destination', () => {
    const plan = findRoute('gubeng', 'gubeng');
    expect(plan).not.toBeNull();
    expect(plan?.from).toBe('gubeng');
    expect(plan?.to).toBe('gubeng');
    expect(plan?.has_transfer).toBe(false);
    expect(plan?.steps.length).toBeGreaterThan(0);
  });

  it('should find multi-hop route between Gubeng and Benowo', () => {
    const plan = findRoute('gubeng', 'benowo');
    expect(plan).not.toBeNull();
    expect(plan?.from).toBe('gubeng');
    expect(plan?.to).toBe('benowo');
    expect(plan?.steps.length).toBeGreaterThan(0);
    expect(plan?.total_min).toBeGreaterThan(0);
    expect(plan?.route_ids).toBeDefined();
  });

  it('should find direct or 1-transfer route between Wonokromo and Waru', () => {
    const plan = findRoute('wonokromo', 'waru');
    expect(plan).not.toBeNull();
    expect(plan?.from).toBe('wonokromo');
    expect(plan?.to).toBe('waru');
    expect(plan?.steps.length).toBeGreaterThan(0);
    expect(plan?.total_min).toBeLessThanOrEqual(30);
  });

  it('should provide fallback route guidance for peripheral nodes', () => {
    const plan = findRoute('benteng', 'waru');
    expect(plan).not.toBeNull();
    expect(plan?.steps.length).toBeGreaterThan(0);
    expect(plan?.total_min).toBeGreaterThan(0);
  });

  it('should calculate internal walking route to close destination (e.g. Monumen Kapal Selam)', () => {
    const plan = findRouteToDestination('gubeng', {
      name: 'Monumen Kapal Selam (Monkasel)',
      lat: -7.2658,
      lng: 112.7505,
      walkTime: '6 mnt',
      distanceFromStation: '450 m'
    });

    expect(plan).toBeDefined();
    expect(plan.from).toBe('gubeng');
    expect(plan.steps.length).toBe(1);
    expect(plan.steps[0].mode).toBe('walk');
    expect(plan.steps[0].to_station).toBe('Monumen Kapal Selam (Monkasel)');
    expect(plan.geometry).toBeDefined();
    expect(plan.geometry?.length).toBeGreaterThanOrEqual(2);
    expect(plan.total_min).toBeLessThanOrEqual(10);
  });

  it('should calculate internal multi-modal transit route to farther destination (e.g. Tunjungan Plaza)', () => {
    const plan = findRouteToDestination('gubeng', {
      name: 'Tunjungan Plaza (TP 1-6)',
      lat: -7.2625,
      lng: 112.7388,
      walkTime: '15 mnt (Bus R1)',
      distanceFromStation: '2.1 km'
    });

    expect(plan).toBeDefined();
    expect(plan.from).toBe('gubeng');
    expect(plan.steps.length).toBe(3); // walk to halte -> transit -> walk to TP
    expect(plan.steps[0].mode).toBe('walk');
    expect(plan.steps[1].mode).toBe('feeder');
    expect(plan.steps[2].mode).toBe('walk');
    expect(plan.has_transfer).toBe(true);
    expect(plan.geometry?.length).toBeGreaterThanOrEqual(4);
    expect(plan.route_ids.length).toBeGreaterThan(0);
  });
});
