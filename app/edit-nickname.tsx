import BG from "@/components/bg";
import {
  Colors,
  FontSize,
  Spacing,
  useThemeColors
} from "@/constants/theme";
import { updateNickname, useProfile } from "@/stores/profile";
import {
  createGlassModifier,
  roundedClipShape,
} from "@/utils/ui-modifiers";
import {
  Button,
  Host,
  TextField,
  Text as UIText,
  VStack,
} from "@expo/ui/swift-ui";
import {
  fixedSize,
  padding
} from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditNickname() {
  const theme = useColorScheme() as "dark" | "light";
  const themeColors = useThemeColors();
  const { userId, profileId, nickname: currentNickname } = useProfile();
  const [nickname, setNickname] = useState(currentNickname || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      Alert.alert("Nickname Required", "Please enter a nickname.");
      return;
    }

    try {
      setIsSaving(true);
      await updateNickname(trimmedNickname, userId!, profileId);
      router.replace("/edit-protein-goal");
    } catch (error) {
      Alert.alert("Oops!", "Sorry, something went wrong. Please try again.");
      console.error("Error saving nickname:", error);
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.root,
        { backgroundColor: theme === "dark" ? "#161616" : "white" },
      ]}
    >
      <BG />
      <Host matchContents>
        <VStack spacing={Spacing.lg}>
          <VStack spacing={Spacing.sm}>
            <UIText
              weight="bold"
              size={FontSize.large}
              color={themeColors.text}
              design="rounded"
            >
              What's your nickname?
            </UIText>
            <UIText
              weight="semibold"
              size={FontSize.medium}
              color={themeColors.secondaryText}
              design="rounded"
              modifiers={[fixedSize({ horizontal: true })]}
            >
              This how your friends will see you in the app
            </UIText>
          </VStack>
          <TextField
            placeholder="Enter nickname"
            onChangeText={setNickname}
            autocorrection={false}
            modifiers={[
              padding({
                horizontal: Spacing.md,
                vertical: Spacing.md,
              }),
              createGlassModifier(false, theme),
              roundedClipShape,
            ]}
          />
          <Button
            variant="glassProminent"
            color={Colors.accent.blue}
            controlSize="extraLarge"
            modifiers={[fixedSize({ horizontal: true, vertical: true })]}
            onPress={handleSave}
            disabled={isSaving || !nickname.trim()}
          >
            <UIText weight="bold" size={FontSize.large} color="white">
              {isSaving ? "Saving..." : "Continue"}
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
    justifyContent: "space-evenly",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  inputContainer: {
    width: "100%",
  },
});
