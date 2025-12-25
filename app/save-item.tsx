import Text from "@/components/Text";
import { Colors, FontSize, Spacing, useThemeColors } from "@/constants/theme";
import { useProfile } from "@/stores/profile";
import { addSavedItem } from "@/stores/saved-items";
import {
  createGlassModifier,
  interactivePadding,
  roundedClipShape,
} from "@/utils/ui-modifiers";
import { Button, Host, TextField, Text as UIText } from "@expo/ui/swift-ui";
import {
  fixedSize
} from "@expo/ui/swift-ui/modifiers";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";

interface NameInputProps {
  onNameChange: (name: string) => void;
}

const NameInput = ({ onNameChange }: NameInputProps) => {
  const themeColors = useThemeColors();
  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: themeColors.secondaryText }]}>Name</Text>
      <Host matchContents>
        <TextField
          placeholder="Chicken Sandwich"
          onChangeText={onNameChange}
          modifiers={[
            interactivePadding,
            createGlassModifier(false, "transparent"),
            roundedClipShape,
          ]}
        />
      </Host>
    </View>
  );
};

interface ProteinInputProps {
  onProteinChange: (protein: string) => void;
}

const ProteinInput = ({ onProteinChange }: ProteinInputProps) => {
  const themeColors = useThemeColors();
  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: themeColors.secondaryText }]}>Protein</Text>
      <Host matchContents>
        <TextField
          keyboardType="decimal-pad"
          placeholder="31"
          onChangeText={onProteinChange}
          modifiers={[
            interactivePadding,
            createGlassModifier(false, "transparent"),
            roundedClipShape,
          ]}
        />
      </Host>
    </View>
  );
};

interface SaveButtonProps {
  isSaving: boolean;
  onPress: () => void;
}

const SaveButton = ({ isSaving, onPress }: SaveButtonProps) => (
  <Host matchContents>
    <Button
      variant="glassProminent"
      controlSize="large"
      color={Colors.accent.blue}
      modifiers={[fixedSize({ horizontal: true, vertical: true })]}
      onPress={onPress}
      disabled={isSaving}
    >
      <UIText weight="bold" size={FontSize.medium}>
        {isSaving ? "Saving..." : "Save Item"}
      </UIText>
    </Button>
  </Host>
);

export default function SaveItem() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const { profileId } = useProfile();
  const [name, setName] = useState("");
  const [protein, setProtein] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (name && protein && category && profileId) {
      const proteinValue = parseFloat(protein);
      if (!isNaN(proteinValue)) {
        try {
          setIsSaving(true);
          await addSavedItem({
            category: category,
            name,
            protein: proteinValue,
          }, profileId);
          router.back();
        } catch (error) {
          console.error("Error saving item:", error);
          Alert.alert("Oops!", "Sorry, something went wrong. Please try again.");
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Dimensions.get("window").height * 0.2 }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputsContainer}>
          <NameInput onNameChange={setName} />
          <ProteinInput onProteinChange={setProtein} />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <SaveButton isSaving={isSaving} onPress={handleSave} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: "center",
  },
  inputsContainer: {
    gap: Spacing.md,
  },
  inputContainer: {
    gap: Spacing.md,
  },
  label: {
    fontWeight: "medium",
    fontSize: FontSize.large,
  },
  buttonContainer: {
    alignSelf: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
});
