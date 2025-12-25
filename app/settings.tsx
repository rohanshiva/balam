import RNText from "@/components/Text";
import {
  BorderRadius,
  Colors,
  FontSize,
  Spacing,
  useThemeColors,
} from "@/constants/theme";
import db from "@/db";
import {
  updateNickname,
  updateProteinGoal,
  useProfile,
} from "@/stores/profile";
import { ItemHandler } from "@/utils";
import {
  createGlassModifier,
  getGlassTintColor,
  interactivePadding,
  roundedClipShape,
} from "@/utils/ui-modifiers";
import { Button, Host, HStack, Image, Spacer, Text } from "@expo/ui/swift-ui";
import {
  fixedSize
} from "@expo/ui/swift-ui/modifiers";
import { GlassView } from "expo-glass-effect";
import { router } from "expo-router";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

const Header = () => {
  const themeColors = useThemeColors();
  return (
    <Host matchContents>
      <HStack>
        <Spacer />
        <Text weight="semibold" size={FontSize.large} color={themeColors.text}>
          Settings
        </Text>
        <Spacer />
      </HStack>
    </Host>
  );
};

const Info = () => {
  const theme = useColorScheme() as "dark" | "light";
  const themeColors = useThemeColors();

  const IconRow = () => (
    <View style={styles.iconRow}>
      <Host matchContents>
        <Image
          systemName="takeoutbag.and.cup.and.straw.fill"
          color={Colors.accent.orange}
        />
      </Host>
      <Host matchContents>
        <Image
          systemName="chart.line.uptrend.xyaxis.circle.fill"
          color={Colors.accent.blue}
        />
      </Host>
      <View style={{ opacity: 0.6 }}>
        <Host matchContents>
          <Image systemName="dumbbell.fill" color={Colors.accent.pink} />
        </Host>
      </View>
      <View style={{ opacity: 0.7 }}>
        <Host matchContents>
          <Image systemName="bolt.heart.fill" color={Colors.accent.green} />
        </Host>
      </View>
    </View>
  );

  const TitleWithUnderline = () => (
    <View style={styles.titleRow}>
      <RNText style={[styles.clubTitle, { color: themeColors.text }]}>
        The{" "}
      </RNText>
      <View style={styles.underlinedWord}>
        <RNText style={[styles.clubTitle, { color: themeColors.text }]}>
          Protein
        </RNText>
      </View>
      <RNText style={[styles.clubTitle, { color: themeColors.text }]}>
        {" "}
        Club
      </RNText>
    </View>
  );

  return (
    <GlassView
      style={styles.infoContainer}
      glassEffectStyle="regular"
      tintColor={getGlassTintColor(theme)}
      isInteractive={true}
    >
      <IconRow />
      <TitleWithUnderline />
      <RNText style={[styles.infoText, { color: themeColors.secondaryText }]}>
        Track your intake. Stay on target.
      </RNText>
    </GlassView>
  );
};

const Profile = () => {
  const theme = useColorScheme() as "dark" | "light";
  const themeColors = useThemeColors();
  const { userId, profileId, nickname, proteinGoal } = useProfile();

  const handleNicknamePress = () => {
    Alert.prompt(
      "Edit Nickname",
      "",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (value?: string) => {
            if (value && userId) {
              updateNickname(value.trim(), userId, profileId);
            }
          },
        },
      ],
      "plain-text",
      nickname
    );
  };

  const handleProteinGoalPress = () => {
    Alert.prompt(
      "Edit Protein Goal (g)",
      "",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (value?: string) => {
            const numValue = parseInt(value || "", 10);
            if (!isNaN(numValue) && numValue > 0 && userId) {
              updateProteinGoal(numValue, userId, profileId);
            }
          },
        },
      ],
      "plain-text",
      String(proteinGoal)
    );
  };

  return (
    <View style={styles.chatContainer}>
      <Host matchContents>
        <Text
          weight="semibold"
          size={FontSize.big}
          color={themeColors.text}
          modifiers={[fixedSize({ horizontal: true })]}
        >
          Profile
        </Text>
      </Host>
      <View style={styles.categoriesContainer}>
        <Host matchContents>
          <HStack
            modifiers={[
              createGlassModifier(true, theme),
              roundedClipShape,
            ]}
            onPress={handleNicknamePress}
          >
            <HStack modifiers={[interactivePadding]}>
              <Text
                weight="medium"
                size={FontSize.normal}
                color={themeColors.text}
              >
                Nickname
              </Text>
              <Spacer />
              <Text
                weight="regular"
                size={FontSize.normal}
                color={themeColors.secondaryText}
              >
                {nickname || "Not set"}
              </Text>
            </HStack>
          </HStack>
        </Host>
        <Host matchContents>
          <HStack
            modifiers={[
              createGlassModifier(true, theme),
              roundedClipShape,
            ]}
            onPress={handleProteinGoalPress}
          >
            <HStack modifiers={[interactivePadding]}>
              <Text
                weight="medium"
                size={FontSize.normal}
                color={themeColors.text}
              >
                Protein Goal
              </Text>
              <Spacer />
              <Text
                weight="regular"
                size={FontSize.normal}
                color={themeColors.secondaryText}
              >
                {`${proteinGoal}g`}
              </Text>
            </HStack>
          </HStack>
        </Host>
      </View>
    </View>
  );
};

const Chat = () => {
  const theme = useColorScheme() as "dark" | "light";
  const themeColors = useThemeColors();

  const handleEmailPress = async () => {
    const emailUrl = "mailto:rohanshiva.socials@gmail.com";
    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        console.log("Mail app is not available");
        // Optionally show an alert to the user
      }
    } catch (error) {
      console.log("Error opening email:", error);
      // Optionally show an alert to the user
    }
  };

  return (
    <View style={styles.chatContainer}>
      <Host matchContents>
        <Text
          weight="semibold"
          size={FontSize.big}
          color={themeColors.text}
          modifiers={[fixedSize({ horizontal: true })]}
        >
          Let's chat
        </Text>
      </Host>
      <GlassView
        style={styles.reviewContainer}
        glassEffectStyle="regular"
        tintColor={getGlassTintColor(theme)}
        isInteractive={true}
      >
        <RNText
          style={[styles.reviewText, { color: themeColors.secondaryText }]}
        >
          If you are enjoying your time here, please consider leaving a good
          review. Otherwise, let us know what we can do to improve!
        </RNText>
        <Host matchContents>
          <Button
            variant="glassProminent"
            color={Colors.accent.pink}
            controlSize="large"
            modifiers={[fixedSize({ horizontal: true, vertical: true })]}
          >
            <Text weight="bold" size={FontSize.medium} color="white">
              Leave a review
            </Text>
          </Button>
        </Host>
      </GlassView>
      <Host matchContents>
        <HStack
          modifiers={[
            createGlassModifier(true, theme),
            roundedClipShape,
          ]}
          onPress={handleEmailPress}
        >
          <HStack modifiers={[interactivePadding]}>
            <Text
              weight="medium"
              size={FontSize.normal}
              color={themeColors.text}
            >
              Email support
            </Text>
            <Spacer />
            <Image
              systemName="arrow.up.forward.circle.fill"
              color={themeColors.secondaryText}
              size={FontSize.normal}
            />
          </HStack>
        </HStack>
      </Host>
    </View>
  );
};

const Library = () => {
  const theme = useColorScheme() as "dark" | "light";
  const themeColors = useThemeColors();

  const handleCategoryPress = (category: string) => {
    router.push({
      pathname: "/category",
      params: { category, handler: ItemHandler.Edit },
    });
  };

  return (
    <View style={styles.chatContainer}>
      <Host matchContents>
        <Text
          weight="semibold"
          size={FontSize.big}
          color={themeColors.text}
          modifiers={[fixedSize({ horizontal: true })]}
        >
          Your Library
        </Text>
      </Host>
      <View style={styles.categoriesContainer}>
        <Host matchContents>
          <Button onPress={() => handleCategoryPress("drinks")}>
            <HStack
              modifiers={[
                interactivePadding,
                createGlassModifier(true, theme),
                roundedClipShape,
              ]}
            >
              <Text
                weight="medium"
                size={FontSize.normal}
                color={themeColors.text}
              >
                Drinks
              </Text>
              <Spacer />
              <Image
                systemName="chevron.forward.circle.fill"
                color={themeColors.secondaryText}
                size={FontSize.medium}
              />
            </HStack>
          </Button>
        </Host>
        <Host matchContents>
          <Button onPress={() => handleCategoryPress("meals")}>
            <HStack
              modifiers={[
                interactivePadding,
                createGlassModifier(true, theme),
                roundedClipShape,
              ]}
            >
              <Text
                weight="medium"
                size={FontSize.normal}
                color={themeColors.text}
              >
                Meals
              </Text>
              <Spacer />
              <Image
                systemName="chevron.forward.circle.fill"
                color={themeColors.secondaryText}
                size={FontSize.medium}
              />
            </HStack>
          </Button>
        </Host>
        <Host matchContents>
          <Button onPress={() => handleCategoryPress("snacks")}>
            <HStack
              modifiers={[
                interactivePadding,
                createGlassModifier(true, theme),
                roundedClipShape,
              ]}
            >
              <Text
                weight="medium"
                size={FontSize.normal}
                color={themeColors.text}
              >
                Snacks
              </Text>
              <Spacer />
              <Image
                systemName="chevron.forward.circle.fill"
                color={themeColors.secondaryText}
                size={FontSize.medium}
              />
            </HStack>
          </Button>
        </Host>
      </View>
    </View>
  );
};

const Footer = () => {
  const handleSignOut = () => {
    Alert.alert("Sign Out?", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          db.auth.signOut();
        },
      },
    ]);
  };

  return (
    <View style={styles.footerContainer}>
      <Host matchContents>
        <Button
          variant="glass"
          color={Colors.accent.pink}
          controlSize="large"
          modifiers={[fixedSize({ horizontal: true, vertical: true })]}
          onPress={handleSignOut}
        >
          <Text size={FontSize.medium} color={Colors.accent.pink}>
            Sign Out
          </Text>
        </Button>
      </Host>
    </View>
  );
};

export default function Settings() {
  return (
    <ScrollView
      style={styles.scrollContainer}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <View style={styles.container}>
        <Header />
        <Info />
        <Profile />
        <Library />
        <Chat />
        <Footer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  container: {
    flex: 1,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoContainer: {
    flexDirection: "column",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  infoTitleText: {
    fontSize: FontSize.large,
    fontWeight: "bold",
  },
  infoText: {
    fontSize: FontSize.normal,
    fontWeight: "regular",
  },
  iconRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
  },
  clubTitle: {
    fontSize: FontSize.xlarge,
    fontWeight: "bold",
  },
  underlinedWord: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.accent.blue,
    paddingBottom: 4, // Adjust this to control space between text and underline
  },
  chatContainer: {
    flexDirection: "column",
    gap: Spacing.sm,
  },
  categoriesContainer: {
    flexDirection: "column",
    gap: Spacing.sm,
  },
  reviewContainer: {
    flexDirection: "column",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  reviewText: {
    fontSize: FontSize.medium,
  },
  emailText: {
    fontSize: FontSize.medium,
    fontWeight: "semibold",
  },
  emailContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  footerContainer: {
    alignItems: "center",
  },
});
