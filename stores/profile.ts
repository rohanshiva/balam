import db, { id } from "@/db";

export const useProfile = () => {
  const { user, isLoading: authLoading, error: authError } = db.useAuth();

  // Query the user's profile (separate from $users to keep email private)
  const { data, isLoading: queryLoading, error: queryError } = db.useQuery(
    user ? { $users: { $: { where: { id: user.id } }, profile: {} } } : null
  );

  const userRecord = data?.$users?.[0];
  const profile = userRecord?.profile;

  return {
    userId: user?.id,
    profileId: profile?.id,
    proteinGoal: profile?.proteinGoal,
    nickname: profile?.nickname ?? "",
    isLoading: authLoading || queryLoading,
    error: authError || queryError,
  };
};

/**
 * Create a profile for a user if they don't have one yet.
 * Called during onboarding.
 */
export const createProfile = async (
  userId: string,
  data: { nickname: string; proteinGoal?: number }
) => {
  const profileId = id();
  await db.transact([
    db.tx.profiles[profileId]
      .update({
        nickname: data.nickname,
        proteinGoal: data.proteinGoal,
      })
      .link({ user: userId }),
  ]);
  return profileId;
};

/**
 * Update or create profile with protein goal
 */
export const updateProteinGoal = async (
  proteinGoal: number,
  userId: string,
  profileId?: string
) => {
  if (profileId) {
    await db.transact([db.tx.profiles[profileId].update({ proteinGoal })]);
  } else {
    // Create profile if it doesn't exist
    await createProfile(userId, { nickname: "", proteinGoal });
  }
};

/**
 * Update or create profile with nickname
 */
export const updateNickname = async (
  nickname: string,
  userId: string,
  profileId?: string
) => {
  if (profileId) {
    await db.transact([db.tx.profiles[profileId].update({ nickname })]);
  } else {
    // Create profile if it doesn't exist
    await createProfile(userId, { nickname });
  }
};
