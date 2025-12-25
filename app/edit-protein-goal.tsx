import BG from "@/components/bg";
import {
  Colors,
  FontSize,
  Spacing,
  useThemeColors
} from "@/constants/theme";
import { updateProteinGoal, useProfile } from "@/stores/profile";
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

export default function EditProteinGoal() {
  const theme = useColorScheme() as "dark" | "light";
  const themeColors = useThemeColors();
  const { userId, profileId, proteinGoal: currentProteinGoal } = useProfile();
  const [proteinGoalInput, setProteinGoalInput] = useState(
    currentProteinGoal ? String(currentProteinGoal) : ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const goal = parseFloat(proteinGoalInput);

    if (isNaN(goal) || goal <= 0) {
      Alert.alert("Invalid Goal", "Please enter a protein goal greater than 0.");
      return;
    }

    setIsSaving(true);
    try {
      await updateProteinGoal(goal, userId!, profileId);
      router.replace("/");
    } catch (error) {
      Alert.alert("Oops!", "Sorry, something went wrong. Please try again.");
      console.error("Error saving protein goal:", error);
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
              What's your protein goal?
            </UIText>
            <UIText
              weight="semibold"
              size={FontSize.medium}
              color={themeColors.secondaryText}
              design="rounded"
              modifiers={[fixedSize({ horizontal: true })]}
            >
              Recommended: ~1.6g protein per kg (≈1g per lb)
            </UIText>
          </VStack>
          <TextField
            keyboardType="decimal-pad"
            placeholder="31"
            onChangeText={setProteinGoalInput}
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
            disabled={isSaving || !proteinGoalInput.trim()}
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
