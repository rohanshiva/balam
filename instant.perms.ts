// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react-native";

const rules = {
  // Profiles are public-facing user data (nickname, proteinGoal)
  profiles: {
    allow: {
      // Any authenticated user can view profiles (for adding friends)
      view: "isAuthenticated",
      create: "isAuthenticated",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: [
      "isAuthenticated",
      "auth.id != null",
      "isOwner",
      "auth.id != null && auth.id in data.ref('user.id')",
    ],
  },
  // $users contains private auth data (email) - only self can view/update
  $users: {
    allow: {
      view: "isSelf",
      update: "isSelf",
      delete: "false",
    },
    bind: ["isSelf", "auth.id != null && auth.id == data.id"],
  },
  loggedEntries: {
    allow: {
      view: "isOwner || isFriendOfOwner",
      create: "isAuthenticated",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: [
      "isOwner",
      "auth.id != null && auth.id in data.ref('profile.user.id')",
      "isAuthenticated",
      "auth.id != null",
      // Friend can view if they're linked via either side of a friendship through profiles
      "isFriendOfOwner",
      "auth.id in data.ref('profile.friendshipsAsOne.profileTwo.user.id') || auth.id in data.ref('profile.friendshipsAsTwo.profileOne.user.id')",
    ],
  },
  savedItems: {
    allow: {
      view: "isOwner",
      create: "isAuthenticated",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: [
      "isOwner",
      "auth.id != null && auth.id in data.ref('profile.user.id')",
      "isAuthenticated",
      "auth.id != null",
    ],
  },
  friendships: {
    allow: {
      // Both parties can view and delete
      view: "isParty",
      // Can only create if you're one of the friends
      create: "isParty",
      delete: "isParty",
    },
    bind: [
      // You're a party if your profile is either profileOne or profileTwo
      "isParty",
      "auth.id != null && (auth.id in data.ref('profileOne.user.id') || auth.id in data.ref('profileTwo.user.id'))",
    ],
  },
} satisfies InstantRules;

export default rules;
