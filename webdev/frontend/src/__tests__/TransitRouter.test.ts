import { describe, it, expect } from 'vitest';
import { buildTransitGraph, findRoute } from '../lib/transit-router';

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
});
