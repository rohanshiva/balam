import { BorderRadius, Colors, FontSize, Spacing, useThemeColors } from "@/constants/theme";
import { removeSavedItem, updateSavedItem, useSavedItems } from "@/stores/saved-items";
import { Button, Host, TextField, Text as UIText } from "@expo/ui/swift-ui";
import {
  clipShape,
  fixedSize,
  glassEffect,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import Text from "@/components/Text";

interface NameInputProps {
  value: string;
  keySuffix?: string;
  onNameChange: (name: string) => void;
}

const NameInput = ({ value, keySuffix, onNameChange }: NameInputProps) => {
  const themeColors = useThemeColors();
  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: themeColors.secondaryText }]}>Name</Text>
      <Host matchContents>
        <TextField
          key={`name-${keySuffix || 'new'}`}
          defaultValue={value}
          placeholder="Chicken Sandwich"
          onChangeText={onNameChange}
          modifiers={[
            padding({
              horizontal: Spacing.md,
              vertical: Spacing.md,
            }),
            glassEffect({
              glass: {
                variant: "regular",
                interactive: false,
                tint: "transparent",
              },
            }),
            clipShape("roundedRectangle", BorderRadius.lg),
          ]}
        />
      </Host>
    </View>
  );
};

interface ProteinInputProps {
  value: string;
  keySuffix?: string;
  onProteinChange: (protein: string) => void;
}

const ProteinInput = ({ value, keySuffix, onProteinChange }: ProteinInputProps) => {
  const themeColors = useThemeColors();
  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: themeColors.secondaryText }]}>Protein</Text>
      <Host matchContents>
        <TextField
          key={`protein-${keySuffix || 'new'}`}
          defaultValue={value}
          keyboardType="decimal-pad"
          placeholder="31"
          onChangeText={onProteinChange}
          modifiers={[
            padding({
              horizontal: Spacing.md,
              vertical: Spacing.md,
            }),
            glassEffect({
              glass: {
                variant: "regular",
                interactive: false,
                tint: "transparent",
              },
            }),
            clipShape("roundedRectangle", BorderRadius.lg),
          ]}
        />
      </Host>
    </View>
  );
};

interface ActionButtonsProps {
  isSaving: boolean;
  isDeleting: boolean;
  onUpdate: () => void;
  onDelete: () => void;
}

const ActionButtons = ({ isSaving, isDeleting, onUpdate, onDelete }: ActionButtonsProps) => (
  <View style={styles.actionsRow}>
    <Host matchContents>
      <Button
        variant="glassProminent"
        controlSize="large"
        color={Colors.accent.pink}
        modifiers={[fixedSize({ horizontal: true, vertical: true })]}
        onPress={onDelete}
        disabled={isDeleting || isSaving}
      >
        <UIText weight="bold" size={FontSize.medium}>
          {isDeleting ? "Deleting..." : "Delete"}
        </UIText>
      </Button>
    </Host>
    <Host matchContents>
      <Button
        variant="glassProminent"
        controlSize="large"
        color={Colors.accent.blue}
        modifiers={[fixedSize({ horizontal: true, vertical: true })]}
        onPress={onUpdate}
        disabled={isSaving || isDeleting}
      >
        <UIText weight="bold" size={FontSize.medium}>
          {isSaving ? "Updating..." : "Update"}
        </UIText>
      </Button>
    </Host>
  </View>
);

export default function EditItem() {
  const { category, itemId } = useLocalSearchParams<{ 
    category: string; 
    itemId: string;
  }>();
  const { items } = useSavedItems();
  const existingItem = items.find(item => item.id === itemId);
  
  const [name, setName] = useState("");
  const [protein, setProtein] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (existingItem) {
      setName(existingItem.name);
      setProtein(existingItem.protein.toString());
    }
  }, [existingItem]);

  const handleUpdate = async () => {
    if (name && protein && category && itemId) {
      const proteinValue = parseFloat(protein);
      if (!isNaN(proteinValue)) {
        try {
          setIsSaving(true);
          await updateSavedItem(itemId, {
            name,
            protein: proteinValue,
            category,
          });
          router.back();
        } catch (error) {
          console.error("Error updating item:", error);
          Alert.alert("Oops!", "Sorry, something went wrong. Please try again.");
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Item?",
      "Are you sure you want to delete this item?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await removeSavedItem(itemId);
              // Dismiss both edit-item and category sheets
              router.dismiss(2);
            } catch (error) {
              console.error("Error deleting item:", error);
              Alert.alert("Oops!", "Sorry, something went wrong. Please try again.");
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputsContainer}>
        <NameInput value={name} keySuffix={itemId} onNameChange={setName} />
        <ProteinInput value={protein} keySuffix={itemId} onProteinChange={setProtein} />
      </View>

      <View style={styles.buttonContainer}>
        <ActionButtons 
          isSaving={isSaving}
          isDeleting={isDeleting}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  inputsContainer: {
    flex: 1,
    justifyContent: "center",
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
    alignItems: "center",
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    justifyContent: "center",
  },
});
