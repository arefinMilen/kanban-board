/**
 * Fractional Indexing Utility Functions
 * Pure functions for calculating midpoints and detecting tight float gaps.
 */

export const MIN_GAP_THRESHOLD = 1e-6;
export const DEFAULT_ORDER_STEP = 1000.0;

/**
 * Calculates a new float order at a target index among sorted sibling orders.
 */
export function computeOrderAtPosition(
  targetIndex: number,
  siblingOrders: number[],
  step = DEFAULT_ORDER_STEP,
): number {
  if (!siblingOrders || siblingOrders.length === 0) {
    return step;
  }

  // Head of column
  if (targetIndex <= 0) {
    return siblingOrders[0] / 2.0;
  }

  // Tail of column
  if (targetIndex >= siblingOrders.length) {
    return siblingOrders[siblingOrders.length - 1] + step;
  }

  // Midpoint between neighbors
  const prevOrder = siblingOrders[targetIndex - 1];
  const nextOrder = siblingOrders[targetIndex];

  return (prevOrder + nextOrder) / 2.0;
}

/**
 * Checks whether the gap between two adjacent order values is below the minimum threshold.
 */
export function isGapTooTight(
  prevOrder: number,
  nextOrder: number,
  minGap = MIN_GAP_THRESHOLD,
): boolean {
  return Math.abs(nextOrder - prevOrder) < minGap;
}

/**
 * Generates an array of evenly spaced clean integer orders (1000.0, 2000.0, 3000.0, ...).
 */
export function generateRenormalizedOrders(
  count: number,
  step = DEFAULT_ORDER_STEP,
): number[] {
  return Array.from({ length: count }, (_, i) => (i + 1) * step);
}
