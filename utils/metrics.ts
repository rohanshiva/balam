import type { AppSchema } from "@/instant.schema";
import { formatNumber } from "@/utils";
import { InstaQLEntity } from "@instantdb/react-native";
import { startOfDay, subDays } from "date-fns";

export type LoggedEntry = InstaQLEntity<AppSchema, "loggedEntries">;

// Constants
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Date utilities
export const getStartOfDayTimestamp = (date: Date = new Date()): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const getTodayRange = () => {
  const start = getStartOfDayTimestamp();
  const end = start + MS_PER_DAY - 1;
  return { startOfDay: start, endOfDay: end };
};

export const getWeekStartTimestamp = (): number => {
  return getStartOfDayTimestamp() - 6 * MS_PER_DAY;
};

// Protein calculations
export const sumProtein = (entries: LoggedEntry[]): number =>
  entries.reduce((sum, e) => sum + e.protein, 0);

export const filterEntriesInRange = (
  entries: LoggedEntry[],
  startTime: number,
  endTime: number
): LoggedEntry[] =>
  entries.filter((e) => e.timestamp >= startTime && e.timestamp <= endTime);

// Get today's entries
export const getTodayEntries = (entries: LoggedEntry[]): LoggedEntry[] => {
  const { startOfDay, endOfDay } = getTodayRange();
  return filterEntriesInRange(entries, startOfDay, endOfDay);
};

// Get weekly entries
export const getWeeklyEntries = (entries: LoggedEntry[]): LoggedEntry[] => {
  const weekStart = getWeekStartTimestamp();
  return entries.filter((e) => e.timestamp >= weekStart);
};

// Group entries by day (returns protein totals per day)
const groupProteinByDay = (entries: LoggedEntry[]): Map<string, number> => {
  const proteinByDay = new Map<string, number>();
  entries.forEach((entry) => {
    const dayKey = startOfDay(new Date(entry.timestamp)).toDateString();
    proteinByDay.set(dayKey, (proteinByDay.get(dayKey) || 0) + entry.protein);
  });
  return proteinByDay;
};

// Metric calculations (matching metrics.tsx)

/** Number of entries logged today */
export const calculateTodayEntries = (entries: LoggedEntry[]): number =>
  getTodayEntries(entries).length;

/** Total protein logged today */
export const calculateInSystem = (entries: LoggedEntry[]): number =>
  sumProtein(getTodayEntries(entries));

/** Consecutive days with any logged entry (from today backwards) */
export const calculateStreak = (entries: LoggedEntry[]): number => {
  if (entries.length === 0) return 0;

  const proteinByDay = groupProteinByDay(entries);
  let count = 0;
  let currentDate = startOfDay(new Date());

  while (proteinByDay.has(currentDate.toDateString())) {
    count++;
    currentDate = subDays(currentDate, 1);
  }

  return count;
};

/** Average protein per day that has entries this week */
export const calculateWeeklyAvg = (entries: LoggedEntry[]): number => {
  const weeklyEntries = getWeeklyEntries(entries);
  const proteinByDay = groupProteinByDay(weeklyEntries);

  if (proteinByDay.size === 0) return 0;

  const total = Array.from(proteinByDay.values()).reduce((a, b) => a + b, 0);
  return Math.round(total / proteinByDay.size);
};

// All metrics at once
export interface UserMetrics {
  todayEntries: number;
  inSystem: number;
  streak: number;
  weeklyAvg: number;
}

export const calculateAllMetrics = (entries: LoggedEntry[]): UserMetrics => ({
  todayEntries: calculateTodayEntries(entries),
  inSystem: calculateInSystem(entries),
  streak: calculateStreak(entries),
  weeklyAvg: calculateWeeklyAvg(entries),
});

// Metric display config (matching metrics.tsx order)
export type MetricKey = keyof UserMetrics;

export const METRIC_CONFIG: {
  key: MetricKey;
  label: string;
  icon: string;
  format: (value: number) => string;
}[] = [
  {
    key: "todayEntries",
    label: "Today",
    icon: "bolt.fill",
    format: (v) => `${v} ${v === 1 ? "entry" : "entries"}`,
  },
  {
    key: "inSystem",
    label: "In System",
    icon: "fork.knife",
    format: (v) => `${formatNumber(v)} g`,
  },
  {
    key: "streak",
    label: "Streak",
    icon: "flame.fill",
    format: (v) => `${v} ${v === 1 ? "day" : "days"}`,
  },
  {
    key: "weeklyAvg",
    label: "Weekly Avg",
    icon: "calendar",
    format: (v) => `${formatNumber(v)} g`,
  },
];

export const formatMetricValue = (
  metrics: UserMetrics,
  metricIndex: number
): string => {
  const config = METRIC_CONFIG[metricIndex];
  return config.format(metrics[config.key]);
};
