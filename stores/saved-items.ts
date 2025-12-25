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
 * Use the returned `byCategory` helper for filtered access.
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

  const items = data?.savedItems || [];

  // Client-side filter by category
  const byCategory = useMemo(() => {
    return (category: string) => items.filter((item) => item.category === category);
  }, [items]);

  return {
    items,
    byCategory,
    isLoading,
    error,
  };
};

/**
 * Hook to get saved items for a specific category.
 * Uses client-side filtering from the main query.
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

export const addSavedItem = async (item: CreateSavedItem, profileId: string) => {
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
