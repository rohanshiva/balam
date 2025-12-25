import db from "@/db";
import type { AppSchema } from "@/instant.schema";
import { id, InstaQLEntity } from "@instantdb/react-native";
import { useMemo } from "react";

export type SavedItem = InstaQLEntity<AppSchema, "savedItems">;

export interface CreateSavedItem {
  category: string;
  name: string;
  protein: number;
}

/**
 * Hook to get all saved items for the current user.
 * For category-specific access, use `useSavedItemsByCategory` instead.
 */
export const useSavedItems = () => {
  const { user } = db.useAuth();

  const { isLoading, error, data } = db.useQuery(
    user
      ? {
          savedItems: {
            $: {
              where: { "profile.user.id": user.id },
            },
          },
        }
      : null
  );

  return {
    items: data?.savedItems ?? [],
    isLoading,
    error,
  };
};

/**
 * Hook to get saved items for a specific category.
 * Fetches all items and filters client-side for simplicity.
 * InstantDB deduplicates subscriptions, so multiple calls are efficient.
 */
export const useSavedItemsByCategory = (category: string) => {
  const { items, isLoading, error } = useSavedItems();

  const filtered = useMemo(
    () => items.filter((item) => item.category === category),
    [items, category]
  );

  return {
    items: filtered,
    isLoading,
    error,
  };
};

export const addSavedItem = async (
  item: CreateSavedItem,
  profileId: string
): Promise<string> => {
  const itemId = id();
  await db.transact([
    db.tx.savedItems[itemId]
      .create({
        name: item.name,
        protein: item.protein,
        category: item.category,
      })
      .link({ profile: profileId }),
  ]);
  return itemId;
};

export const updateSavedItem = async (
  itemId: string,
  updates: Partial<CreateSavedItem>
) => {
  await db.transact([db.tx.savedItems[itemId].update(updates)]);
};

export const removeSavedItem = async (itemId: string) => {
  await db.transact([db.tx.savedItems[itemId].delete()]);
};
