/**
 * Common utility functions used across the application
 */

/**
 * Helper function to check if data is empty
 * @param data - Data to check for emptiness
 * @returns true if data is empty, false otherwise
 */
export function isEmpty(data: any): boolean {
  if (data === null || data === undefined) return true;
  if (typeof data === 'string') return data.trim().length === 0;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === 'object') return Object.keys(data).length === 0;
  return false;
}

/**
 * Helper to extract inserted ID from knex returning result
 * @param result - Result from knex insert operation
 * @returns Extracted ID as number
 */
export function extractInsertedId(result: unknown): number {
  if (!result || !Array.isArray(result) || result.length === 0)
    throw new Error('Failed to create source record');
  const rec = result[0];
  return typeof rec === 'object' && rec !== null
    ? (rec as { id?: unknown }).id
      ? Number((rec as { id: unknown }).id)
      : Number(rec)
    : Number(rec);
}