import { describe, it, expect } from 'vitest';
import {
  computeOrderAtPosition,
  isGapTooTight,
  generateRenormalizedOrders,
  MIN_GAP_THRESHOLD,
} from './fractional-indexing.util';

describe('Fractional Indexing Utility', () => {
  describe('computeOrderAtPosition', () => {
    it('returns 1000.0 when inserting into an empty list', () => {
      expect(computeOrderAtPosition(0, [])).toBe(1000.0);
    });

    it('calculates midpoint for head insertion (targetIndex <= 0)', () => {
      const orders = [1000.0, 2000.0, 3000.0];
      expect(computeOrderAtPosition(0, orders)).toBe(500.0);
    });

    it('calculates midpoint for tail insertion (targetIndex >= length)', () => {
      const orders = [1000.0, 2000.0, 3000.0];
      expect(computeOrderAtPosition(3, orders)).toBe(4000.0);
      expect(computeOrderAtPosition(10, orders)).toBe(4000.0);
    });

    it('calculates midpoint for middle insertion', () => {
      const orders = [1000.0, 2000.0, 3000.0];
      // Insert at index 1 -> between index 0 (1000.0) and index 1 (2000.0)
      expect(computeOrderAtPosition(1, orders)).toBe(1500.0);

      // Insert at index 2 -> between index 1 (2000.0) and index 2 (3000.0)
      expect(computeOrderAtPosition(2, orders)).toBe(2500.0);
    });

    it('handles floating point midpoints accurately', () => {
      const orders = [1000.0, 1500.0];
      expect(computeOrderAtPosition(1, orders)).toBe(1250.0);
    });
  });

  describe('isGapTooTight', () => {
    it('returns true when gap is less than MIN_GAP_THRESHOLD (1e-6)', () => {
      const prev = 1000.0000001;
      const next = 1000.0000005;
      expect(isGapTooTight(prev, next)).toBe(true);
    });

    it('returns false when gap is larger than threshold', () => {
      const prev = 1000.0;
      const next = 1000.1;
      expect(isGapTooTight(prev, next)).toBe(false);
    });
  });

  describe('generateRenormalizedOrders', () => {
    it('generates clean spaced orders for given count', () => {
      expect(generateRenormalizedOrders(3)).toEqual([1000.0, 2000.0, 3000.0]);
      expect(generateRenormalizedOrders(5)).toEqual([
        1000.0, 2000.0, 3000.0, 4000.0, 5000.0,
      ]);
    });
  });
});
