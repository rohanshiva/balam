import BG from "@/components/bg";
import Title from "@/components/title";
import db from "@/db";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Login from "../components/login";

function LoadingScreen() {
  const theme = useColorScheme();
  return (
    <View style={[styles.loading, { backgroundColor: theme === "dark" ? "#000" : "#fff" }]}>
      <BG />
      <ActivityIndicator size="large" />
    </View>
  );
}

function AuthenticatedLayout() {
  const theme = useColorScheme() as "light" | "dark";
  const isGlassAvailable = isLiquidGlassAvailable();
  const blurEffect = theme === "dark" ? "systemMaterialDark" : "systemMaterialLight";

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTransparent: true,
          headerTintColor: theme === "dark" ? "white" : "black",
          headerLargeStyle: { backgroundColor: "transparent" },
          headerBlurEffect: isGlassAvailable ? undefined : blurEffect,
          headerTitle: () => <Title />,
        }}
      />
      <Stack.Screen
        name="edit-nickname"
        options={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme === "dark" ? "#161616" : "white",
          },
        }}
      />
      <Stack.Screen
        name="edit-protein-goal"
        options={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme === "dark" ? "#161616" : "white",
          },
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: "fitToContents",
          contentStyle: {
            backgroundColor: isGlassAvailable
              ? "transparent"
              : theme === "dark"
              ? "transparent"
              : "white",
          },
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.75],
          contentStyle: {
            backgroundColor: isGlassAvailable
              ? "transparent"
              : theme === "dark"
              ? "transparent"
              : "white",
          },
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="category"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.5],
          contentStyle: {
            backgroundColor: isGlassAvailable
              ? "transparent"
              : theme === "dark"
              ? "transparent"
              : "white",
          },
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="leaderboard"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.75],
          contentStyle: {
            backgroundColor: isGlassAvailable
              ? "transparent"
              : theme === "dark"
              ? "transparent"
              : "white",
          },
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="save-item"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.5],
          contentStyle: {
            height: "100%",
            width: "100%",
            backgroundColor: theme === "dark" ? "#161616" : "white",
          },
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit-item"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.5],
          contentStyle: {
            height: "100%",
            width: "100%",
            backgroundColor: theme === "dark" ? "#161616" : "white",
          },
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-friend"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.75],
          contentStyle: {
            height: "100%",
            width: "100%",
            backgroundColor: isGlassAvailable
              ? "transparent"
              : theme === "dark"
              ? "transparent"
              : "white",
          },
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="time-picker"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.5],
          contentStyle: {
            height: "100%",
            width: "100%",
            backgroundColor: isGlassAvailable
              ? "transparent"
              : theme === "dark"
              ? "transparent"
              : "white",
          },
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: "fitToContents",
          contentStyle: {
            backgroundColor: isGlassAvailable
              ? "transparent"
              : theme === "dark"
              ? "transparent"
              : "white",
          },
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const { isLoading: authLoading } = db.useAuth();

  // Show loading while auth state is being determined
  if (authLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LoadingScreen />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <db.SignedIn>
        <AuthenticatedLayout />
      </db.SignedIn>
      <db.SignedOut>
        <Login />
      </db.SignedOut>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
