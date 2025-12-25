import BG from "@/components/bg";
import Entries from "@/components/entries";
import Friends from "@/components/friends";
import Metrics from "@/components/metrics";
import { StreakGrid } from "@/components/streak-grid";
import { Colors, Spacing } from "@/constants/theme";
import { useAddFriendDeepLink } from "@/stores/friendships";
import { useLoggedEntries } from "@/stores/logged-entries";
import { useProfile } from "@/stores/profile";
import { Button, Host, HStack, Spacer } from "@expo/ui/swift-ui";
import { Redirect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const backgroundColor = isDark ? "#000000" : "#FFFFFF";
  const router = useRouter();
  const { entries } = useLoggedEntries();
  const { profileId, proteinGoal, nickname, isLoading } = useProfile();
  const insets = useSafeAreaInsets();
  
  // Handle friend deep links (balam://?profileId=xxx)
  // Must be called before any early returns (rules of hooks)
  useAddFriendDeepLink(profileId);
  
  // Check if user has completed onboarding
  const isOnboarded = !!(nickname && proteinGoal);
  
  // Show loading while profile data loads
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor, justifyContent: "center", alignItems: "center" }]}>
        <BG />
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  // Redirect to onboarding if not completed
  if (!isOnboarded) {
    return <Redirect href="/edit-nickname" />;
  }

  const handleLeftButtonPress = () => {
    router.push("/settings");
  };

  const handlePlusButtonPress = () => {
    router.push("/add");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        bounces={true}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="scrollableAxes"
        style={[styles.scrollView, { backgroundColor: backgroundColor }]}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Spacing.xxl + insets.bottom,
          },
        ]}
      >
        <BG />
        <View style={{ gap: Spacing.xl }}>
          <StreakGrid entries={entries} proteinGoal={proteinGoal ?? 150} />
          <Entries />
          <Metrics />
          <Friends />
        </View>
      </ScrollView>
      <View style={[styles.floatingButtons, { paddingBottom: insets.bottom }]}>
        <Host matchContents>
          <HStack>
            <Button
              variant="glass"
              controlSize="large"
              systemImage="ellipsis"
              onPress={handleLeftButtonPress}
            />
            <Spacer />
            <Button
              variant="glassProminent"
              color={Colors.accent.blue}
              controlSize="large"
              systemImage="plus"
              onPress={handlePlusButtonPress}
            />
          </HStack>
        </Host>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  floatingButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
});
