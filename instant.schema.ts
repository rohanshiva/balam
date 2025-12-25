import { i } from "@instantdb/react-native";

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    profiles: i.entity({
      nickname: i.string().indexed().optional(),
      proteinGoal: i.number().optional(),
    }),
    loggedEntries: i.entity({
      name: i.string(),
      protein: i.number(),
      timestamp: i.number().indexed(),
      photoUri: i.string().optional(),
    }),
    savedItems: i.entity({
      name: i.string(),
      protein: i.number(),
      category: i.string().indexed(),
    }),
    friendships: i.entity({
      createdAt: i.number().indexed(),
    }),
  },
  links: {
    // User <-> Profile (one-to-one, profile is public facing)
    userProfile: {
      forward: {
        on: "profiles",
        has: "one",
        label: "user",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "one",
        label: "profile",
      },
    },
    profileLoggedEntries: {
      forward: {
        on: "loggedEntries",
        has: "one",
        label: "profile",
        onDelete: "cascade",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "loggedEntries",
      },
    },
    profileSavedItems: {
      forward: {
        on: "savedItems",
        has: "one",
        label: "profile",
        onDelete: "cascade",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "savedItems",
      },
    },
    // Friendships link to profiles (public), not $users (private)
    friendshipOne: {
      forward: {
        on: "friendships",
        has: "one",
        label: "profileOne",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "friendshipsAsOne",
      },
    },
    friendshipTwo: {
      forward: {
        on: "friendships",
        has: "one",
        label: "profileTwo",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "friendshipsAsTwo",
      },
    },
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
