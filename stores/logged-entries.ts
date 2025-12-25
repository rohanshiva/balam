import db, { id } from "@/db";
import {
  getTodayRange,
  getWeekStartTimestamp,
  sumProtein,
  type LoggedEntry,
} from "@/utils/metrics";

export type { LoggedEntry };

export interface CreateLoggedEntry {
  name: string;
  protein: number;
  timestamp?: number;
  photoUri?: string | null;
}

export const useLoggedEntries = () => {
  const { user } = db.useAuth();

  const { isLoading, error, data } = db.useQuery(
    user
      ? {
          loggedEntries: {
            $: {
              where: { "profile.user.id": user.id },
              order: { timestamp: "desc" },
            },
          },
        }
      : null
  );

  return {
    entries: data?.loggedEntries || [],
    isLoading,
    error,
  };
};

export const useTodayEntries = () => {
  const { user } = db.useAuth();
  const { startOfDay, endOfDay } = getTodayRange();

  const { isLoading, error, data } = db.useQuery(
    user
      ? {
          loggedEntries: {
            $: {
              where: {
                "profile.user.id": user.id,
                timestamp: { $gte: startOfDay, $lte: endOfDay },
              },
              order: { timestamp: "asc" },
            },
          },
        }
      : null
  );

  const entries = data?.loggedEntries || [];

  return {
    entries,
    totalProtein: sumProtein(entries),
    isLoading,
    error,
  };
};

export const useWeeklyEntries = () => {
  const { user } = db.useAuth();
  const weekStart = getWeekStartTimestamp();

  const { isLoading, error, data } = db.useQuery(
    user
      ? {
          loggedEntries: {
            $: {
              where: {
                "profile.user.id": user.id,
                timestamp: { $gte: weekStart },
              },
              order: { timestamp: "asc" },
            },
          },
        }
      : null
  );

  return {
    entries: data?.loggedEntries || [],
    isLoading,
    error,
  };
};

export const addLoggedEntry = async (
  entry: CreateLoggedEntry,
  profileId: string
): Promise<string> => {
  const entryId = id();
  await db.transact([
    db.tx.loggedEntries[entryId]
      .create({
        name: entry.name,
        protein: entry.protein,
        timestamp: entry.timestamp ?? Date.now(),
        photoUri: entry.photoUri ?? null,
      })
      .link({ profile: profileId }),
  ]);
  return entryId;
};

export const updateLoggedEntry = async (
  entryId: string,
  updates: Partial<CreateLoggedEntry>
) => {
  await db.transact([db.tx.loggedEntries[entryId].update(updates)]);
};

export const removeLoggedEntry = async (entryId: string) => {
  await db.transact([db.tx.loggedEntries[entryId].delete()]);
};
