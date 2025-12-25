/**
 * Formats a number to show 1 decimal place if it has decimals,
 * otherwise shows the whole number without decimals.
 * 
 * @example
 * formatNumber(8) // "8"
 * @example
 * formatNumber(8.47) // "8.5"
 * @example
 * formatNumber(8.00) // "8"
 */
export function formatNumber(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

/**
 * Truncates a timestamp to the start of the day (00:00:00).
 */
export function truncTime(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.valueOf();
}

/**
 * Adds a specified number of days to a timestamp.
 */
export function addDays(timestamp: number, days: number): number {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + days);
  return date.valueOf();
}

/**
 * Removes a specified number of days from a timestamp.
 */
export function removeDays(timestamp: number, days: number): number {
  return addDays(timestamp, -days);
}

/**
 * Item handler types for category navigation
 */
export enum ItemHandler {
  Select = "select",
  Edit = "edit",
}

