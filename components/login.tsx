import { StreakGrid } from "@/components/streak-grid";
import {
  BorderRadius,
  Colors,
  FontSize,
  Spacing,
  useThemeColors,
} from "@/constants/theme";
import db from "@/db";
import { LoggedEntry } from "@/stores/logged-entries";
import {
  Button,
  Host,
  HStack,
  Image,
  Text as UIText,
  VStack,
} from "@expo/ui/swift-ui";
import { fixedSize } from "@expo/ui/swift-ui/modifiers";
import {
  makeRedirectUri,
  useAuthRequest,
  useAutoDiscovery,
} from "expo-auth-session";
import React, { useMemo } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const themeColors = useThemeColors();

  // Generate mock entries for the last ~4 months
  const mockEntries = useMemo<LoggedEntry[]>(() => {
    const entries: LoggedEntry[] = [];
    const today = new Date();
    const proteinGoal = 150; // Mock protein goal in grams

    // Generate entries for the last 120 days with varying protein amounts
    for (let i = 0; i < 120; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(12, 0, 0, 0); // Set to noon for consistency

      // Create varying protein amounts to show different colors in the grid
      // Some days have no entries (0g), some have partial (50-100g), some have full (150g+)
      const random = Math.random();
      let protein = 0;

      if (random > 0.3) {
        // 70% of days have entries
        if (random > 0.9) {
          protein = proteinGoal + Math.random() * 30; // 10% exceed goal
        } else if (random > 0.7) {
          protein = proteinGoal * 0.8 + Math.random() * proteinGoal * 0.2; // 20% are 80-100%
        } else if (random > 0.5) {
          protein = proteinGoal * 0.5 + Math.random() * proteinGoal * 0.3; // 20% are 50-80%
        } else {
          protein = Math.random() * proteinGoal * 0.5; // 20% are 0-50%
        }
      }

      if (protein > 0) {
        entries.push({
          id: `mock-${i}`,
          name: "Mock Entry",
          protein: Math.round(protein),
          timestamp: date.getTime(),
          photoUri: undefined,
        } as LoggedEntry);
      }
    }

    return entries;
  }, []);

  const discovery = useAutoDiscovery(db.auth.issuerURI());
  const [request, _response, promptAsync] = useAuthRequest(
    {
      // The unique name you gave the OAuth client when you
      // registered it on the Instant dashboard
      clientId: "google-web",
      redirectUri: makeRedirectUri(),
    },
    discovery
  );

  const handleLoginWithGoogle = async () => {
    if (!request) {
      Alert.alert("Oops!", "Sorry, something went wrong. Please try again.");
      return;
    }

    try {
      const res = await promptAsync();
      if (res.type === "error") {
        alert(res.error || "Something went wrong");
      }
      if (res.type === "success") {
        await db.auth
          .exchangeOAuthCode({
            code: res.params.code,
            codeVerifier: request.codeVerifier,
          })
          .catch((e) => alert(e.body?.message || "Something went wrong"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginWithApple = () => {
    console.log("Login with Apple");
  };

  const HallOfFameBanner = () => (
    <VStack spacing={Spacing.md}>
      <HStack spacing={Spacing.lg}>
        <Image
          systemName="laurel.leading"
          size={FontSize.xxlarge}
          color="gold"
        />
        <VStack
          spacing={Spacing.sm}
          modifiers={[fixedSize({ horizontal: true })]}
        >
          <Image systemName="medal.fill" color="silver" size={FontSize.large} />
          <UIText
            weight="semibold"
            size={FontSize.small}
            color={themeColors.text}
          >
            Speed
          </UIText>
        </VStack>
        <VStack
          spacing={Spacing.sm}
          modifiers={[fixedSize({ horizontal: true })]}
        >
          <Image
            systemName="medal.fill"
            color="gold"
            size={FontSize.xxxlarge}
          />
          <UIText weight="bold" size={FontSize.medium} color={themeColors.text}>
            Sponge
          </UIText>
        </VStack>
        <VStack
          spacing={Spacing.sm}
          modifiers={[fixedSize({ horizontal: true })]}
        >
          <Image systemName="medal.fill" color="brown" size={FontSize.large} />
          <UIText
            weight="semibold"
            size={FontSize.small}
            color={themeColors.text}
          >
            Adin
          </UIText>
        </VStack>
        <Image
          systemName="laurel.trailing"
          size={FontSize.xxlarge}
          color="gold"
        />
      </HStack>
      <UIText
        weight="medium"
        design="rounded"
        size={FontSize.medium}
        color={themeColors.secondaryText}
      >
        Track your progress with your friends
      </UIText>
    </VStack>
  );

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: themeColors.background }]}
    >
      <Host matchContents>
        <VStack
          spacing={Spacing.md}
          modifiers={[fixedSize({ horizontal: true })]}
        >
          <UIText
            weight="semibold"
            design="rounded"
            size={FontSize.large}
            color={themeColors.text}
          >
            Welcome to Balam!
          </UIText>
          <UIText
            weight="medium"
            design="rounded"
            size={FontSize.medium}
            color={themeColors.secondaryText}
          >
            A fun way to track your protein intake
          </UIText>
        </VStack>
      </Host>

      <View style={styles.gridContainer}>
        <StreakGrid entries={mockEntries} proteinGoal={150} />
      </View>

      <Host matchContents>
        <HallOfFameBanner />
      </Host>

      <Host matchContents>
        <VStack spacing={Spacing.md}>
          <Button
            variant="glassProminent"
            color={Colors.accent.blue}
            controlSize="large"
            modifiers={[fixedSize({ horizontal: true, vertical: true })]}
            onPress={() => handleLoginWithApple()}
          >
            <UIText weight="bold" size={FontSize.medium}>
              Login with Apple
            </UIText>
          </Button>
          <Button
            variant="glassProminent"
            color={Colors.accent.pink}
            controlSize="large"
            modifiers={[fixedSize({ horizontal: true, vertical: true })]}
            onPress={() => handleLoginWithGoogle()}
          >
            <UIText weight="bold" size={FontSize.medium}>
              Login with Google
            </UIText>
          </Button>
        </VStack>
      </Host>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  gridContainer: {
    width: "100%",
    transform: [{ rotate: "-2deg" }],
  },
  metricsColumn: {
    flexDirection: "column",
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  metricsRow: {
    flexDirection: "row",
    width: "100%",
  },
  metricContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.md,
  },
  metricIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  metricContent: {
    flexDirection: "column",
    gap: Spacing.xxs,
    alignItems: "flex-start",
  },
  metricTitle: {
    fontSize: FontSize.medium,
    fontWeight: "bold",
  },
  metricValue: {
    fontSize: FontSize.large,
    fontWeight: "bold",
  },
});
