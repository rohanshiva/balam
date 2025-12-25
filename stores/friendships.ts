import db, { id } from "@/db";
import type { LoggedEntry } from "@/utils/metrics";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { Alert } from "react-native";

/**
 * A friend with their logged entries (for leaderboard)
 */
export interface FriendData {
  id: string;
  visibleId: string; // The profile ID (what we show/use for friendships)
  nickname: string;
  loggedEntries: LoggedEntry[];
  friendshipId?: string; // The friendship ID (for removing friends)
}

/**
 * Hook to get current user and their friends with entries.
 * Uses reactive query - updates automatically when data changes.
 */
export const useFriendsWithEntries = () => {
  const { user } = db.useAuth();

  // Query through profiles for friendships (loggedEntries now linked to profiles)
  const { isLoading, error, data } = db.useQuery(
    user
      ? {
          // Get my profile with friendships and entries
          profiles: {
            $: {
              where: { "user.id": user.id },
            },
            loggedEntries: {},
            friendshipsAsOne: {
              profileTwo: { loggedEntries: {} },
            },
            friendshipsAsTwo: {
              profileOne: { loggedEntries: {} },
            },
          },
        }
      : null
  );

  // Process the data into a clean format
  const { currentUser, friends } = useMemo(() => {
    if (!data || !user) {
      return { currentUser: null, friends: [] };
    }

    const myProfile = data.profiles?.[0];
    if (!myProfile) {
      return { currentUser: null, friends: [] };
    }

    // Current user - entries are now on profile directly
    const currentUser: FriendData = {
      id: user.id,
      visibleId: myProfile.id,
      nickname: myProfile.nickname || "You",
      loggedEntries: myProfile.loggedEntries || [],
    };

    // Extract friends from friendships
    const friendsMap = new Map<string, FriendData>();

    // From friendshipsAsOne (I'm profileOne, friend is profileTwo)
    for (const fs of myProfile.friendshipsAsOne || []) {
      const friendProfile = fs.profileTwo;
      if (friendProfile && !friendsMap.has(friendProfile.id)) {
        friendsMap.set(friendProfile.id, {
          id: friendProfile.id,
          visibleId: friendProfile.id,
          nickname: friendProfile.nickname || "Anonymous",
          loggedEntries: friendProfile.loggedEntries || [],
          friendshipId: fs.id,
        });
      }
    }

    // From friendshipsAsTwo (I'm profileTwo, friend is profileOne)
    for (const fs of myProfile.friendshipsAsTwo || []) {
      const friendProfile = fs.profileOne;
      if (friendProfile && !friendsMap.has(friendProfile.id)) {
        friendsMap.set(friendProfile.id, {
          id: friendProfile.id,
          visibleId: friendProfile.id,
          nickname: friendProfile.nickname || "Anonymous",
          loggedEntries: friendProfile.loggedEntries || [],
          friendshipId: fs.id,
        });
      }
    }

    return {
      currentUser,
      friends: Array.from(friendsMap.values()),
    };
  }, [data, user]);

  return { currentUser, friends, isLoading, error };
};

/**
 * Get the current user's profile ID
 */
export const getMyProfileId = async (userId: string): Promise<string | null> => {
  const result = await db.queryOnce({
    profiles: { $: { where: { "user.id": userId } } },
  });
  return result.data.profiles?.[0]?.id || null;
};

/**
 * Creates a friendship between two profiles using profile IDs directly.
 * No $users traversal needed - keeps $users private.
 * Returns { alreadyFriends: true } if already connected.
 */
export const addFriendByProfileId = async (
  myProfileId: string,
  friendProfileId: string
): Promise<{ alreadyFriends: boolean }> => {
  // Check if already friends (either direction)
  const existing = await db.queryOnce({
    friendships: {
      $: {
        where: {
          or: [
            { "profileOne.id": myProfileId, "profileTwo.id": friendProfileId },
            { "profileOne.id": friendProfileId, "profileTwo.id": myProfileId },
          ],
        },
      },
    },
  });

  if ((existing.data.friendships?.length ?? 0) > 0) {
    return { alreadyFriends: true };
  }

  // Create friendship between profiles
  await db.transact([
    db.tx.friendships[id()]
      .update({ createdAt: Date.now() })
      .link({ profileOne: myProfileId, profileTwo: friendProfileId }),
  ]);

  return { alreadyFriends: false };
};

/**
 * Remove a friendship
 */
export const removeFriend = async (friendshipId: string) => {
  await db.transact([db.tx.friendships[friendshipId].delete()]);
};

/**
 * Hook to handle deep link friend adding.
 * Call this on the home screen to process ?profileId=xxx params.
 */
export const useAddFriendDeepLink = (myProfileId: string | undefined) => {
  const params = useLocalSearchParams<{ profileId?: string }>();
  const router = useRouter();
  const processedRef = useRef(false);

  useEffect(() => {
    const friendProfileId = params.profileId;
    if (!friendProfileId || !myProfileId || processedRef.current) return;

    processedRef.current = true;
    router.setParams({ profileId: undefined });

    if (friendProfileId === myProfileId) {
      Alert.alert("Oops!", "You can't add yourself as a friend.");
      return;
    }

    (async () => {
      try {
        // Get friend's profile for their nickname (query by profile ID directly)
        const friendData = await db.queryOnce({
          profiles: { $: { where: { id: friendProfileId } } },
        });
        const nickname =
          friendData.data.profiles?.[0]?.nickname || "your friend";
        const result = await addFriendByProfileId(myProfileId, friendProfileId);

        if (result.alreadyFriends) {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );
          Alert.alert(
            "Already Friends!",
            `You and ${nickname} are already friends.`
          );
        } else {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          Alert.alert("Friend Added!", `You and ${nickname} are now friends!`);
        }
      } catch (error) {
        console.error("Error adding friend:", error);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Sorry, something went wrong. Please try again.";
        Alert.alert("Oops!", errorMessage);
      }
    })();
  }, [params.profileId, myProfileId, router]);
};
