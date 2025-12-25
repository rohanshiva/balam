import { CategorySelector } from "@/components/entry-sheet/category-selector";
import {
  AnimatedValue,
  NumpadWithAnimations,
} from "@/components/entry-sheet/numpad";
import { PhotoPicker } from "@/components/entry-sheet/photo-picker";
import Text from "@/components/Text";
import { BorderRadius, Colors, FontSize, Spacing, useThemeColors } from "@/constants/theme";
import { useCurrentEntryStore } from "@/stores";
import { removeLoggedEntry, updateLoggedEntry, useLoggedEntries } from "@/stores/logged-entries";
import { Button, Host, HStack, Image, Text as UIText } from "@expo/ui/swift-ui";
import { clipShape, fixedSize, glassEffect, padding } from "@expo/ui/swift-ui/modifiers";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const TimePickerButton = () => {
  const themeColors = useThemeColors();
  return (
    <Host matchContents>
      <Button
        variant="bordered"
        controlSize="regular"
        color={themeColors.secondaryText}
        systemImage="calendar.badge.clock"
        onPress={() => router.push("/time-picker")}
      />
    </Host>
  );
};

const CloseButton = () => {
  const themeColors = useThemeColors();
  return (
    <Host matchContents>
      <Button
        variant="bordered"
        controlSize="regular"
        role="cancel"
        color={themeColors.secondaryText}
        systemImage="xmark"
        onPress={() => router.back()}
      />
    </Host>
  );
};

const EditTitle = () => {
  const themeColors = useThemeColors();
  return (
    <View style={styles.titleContainer}>
      <Text style={[styles.titleText, { color: themeColors.secondaryText }]}>Edit Entry</Text>
    </View>
  );
};

interface ProteinValueDisplayProps {
  protein: string;
}

const ProteinValueDisplay = ({ protein }: ProteinValueDisplayProps) => {
  const themeColors = useThemeColors();
  return (
    <View style={styles.numpadValueContainer}>
      <AnimatedValue value={protein} />
      <Text style={[styles.unitText, { color: themeColors.secondaryText }]}>g</Text>
    </View>
  );
};

interface NameSelectorProps {
  name: string;
  onNameChange: (name: string) => void;
}

const NameSelector = ({ name, onNameChange }: NameSelectorProps) => {
  const themeColors = useThemeColors();
  
  const handlePress = () => {
    Alert.prompt(
      "What did you eat?",
      "Hope you enjoyed it!",
      (text: string) => {
        if (text) {
          onNameChange(text);
        }
      },
      "plain-text",
      name
    );
  };

  return (
    <Host matchContents style={styles.nameContainer}>
      <Button onPress={handlePress}>
        <HStack
          spacing={Spacing.xs}
          alignment="center"
          modifiers={[
            padding({
              horizontal: Spacing.sm,
              vertical: Spacing.xs,
            }),
            glassEffect({
              glass: {
                variant: "regular",
                interactive: true,
                tint: "transparent",
              },
              shape: "rectangle",
            }),
            fixedSize({ horizontal: true }),
            clipShape("roundedRectangle", BorderRadius.xxl),
          ]}
        >
          <UIText
            size={FontSize.small}
            color={themeColors.secondaryText}
            weight="regular"
          >
            {name}
          </UIText>
          <Image
            systemName="chevron.forward.circle.fill"
            size={FontSize.small}
            color={themeColors.secondaryText}
          />
        </HStack>
      </Button>
    </Host>
  );
};

interface DeleteButtonProps {
  isDeleting: boolean;
  isDisabled: boolean;
  onPress: () => void;
}

const DeleteButton = ({ isDeleting, isDisabled, onPress }: DeleteButtonProps) => (
  <Host matchContents style={styles.deleteButtonContainer}>
    <Button onPress={onPress} disabled={isDisabled}>
      <HStack
        spacing={Spacing.xs}
        alignment="center"
        modifiers={[
          padding({
            horizontal: Spacing.sm,
            vertical: Spacing.xs,
          }),
          glassEffect({
            glass: {
              variant: "regular",
              interactive: true,
              tint: Colors.accent.pink,
            },
            shape: "rectangle",
          }),
          fixedSize({ horizontal: true }),
          clipShape("roundedRectangle", BorderRadius.xxl),
        ]}
      >
        <Image systemName="xmark.bin.fill" size={FontSize.small} color={"white"} />
        <UIText size={FontSize.small} color="white" weight="bold">
          {isDeleting ? "Deleting..." : "Delete Entry"}
        </UIText>
      </HStack>
    </Button>
  </Host>
);

interface EntryTypeToggleProps {
  entryType: string;
  onEntryTypeChange: (type: string) => void;
}

const EntryTypeToggle = ({ entryType, onEntryTypeChange }: EntryTypeToggleProps) => {
  const themeColors = useThemeColors();
  return (
    <Host matchContents>
      <HStack spacing={Spacing.sm}>
        <Button
          variant={entryType === "custom" ? "glassProminent" : "borderless"}
          controlSize="large"
          systemImage="number"
          color={
            entryType === "custom"
              ? Colors.accent.blue
              : themeColors.secondaryText
          }
          onPress={() => onEntryTypeChange("custom")}
        />
        <Button
          variant={entryType === "saved" ? "glassProminent" : "borderless"}
          controlSize="large"
          systemImage="frying.pan.fill"
          color={
            entryType === "saved"
              ? Colors.accent.blue
              : themeColors.secondaryText
          }
          onPress={() => onEntryTypeChange("saved")}
        />
      </HStack>
    </Host>
  );
};

interface UpdateButtonProps {
  isUpdating: boolean;
  isDisabled: boolean;
  onPress: () => void;
}

const UpdateButton = ({ isUpdating, isDisabled, onPress }: UpdateButtonProps) => (
  <Host matchContents>
    <Button
      variant="glassProminent"
      color={Colors.accent.blue}
      controlSize="large"
      modifiers={[fixedSize({ horizontal: true, vertical: true })]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <UIText weight="bold" size={FontSize.medium}>
        {isUpdating ? "Updating..." : "Update"}
      </UIText>
    </Button>
  </Host>
);

export default function Edit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entryType, setEntryType] = useState("custom");
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { entries } = useLoggedEntries();
  const entry = entries.find((e) => e.id === id);

  // Use currentEntryStore directly - same as add sheet!
  const {
    name,
    protein,
    timestamp,
    photoUri,
    setName,
    setProtein,
    setPhotoUri,
    setTimestamp,
    reset,
  } = useCurrentEntryStore();

  // Load entry data into store on mount
  useEffect(() => {
    if (entry) {
      setName(entry.name);
      setProtein(entry.protein.toString());
      setTimestamp(entry.timestamp);
      setPhotoUri(entry.photoUri ?? null);
    }

    // Reset store when unmounting
    return () => {
      reset();
    };
  }, [entry, setName, setProtein, setTimestamp, setPhotoUri, reset]);

  const measureViewHeight = (height: number) => {
    setContainerHeight((prev) => {
      return prev === null ? height : Math.max(prev, height);
    });
  };

  const handleUpdate = async () => {
    const proteinValue = parseFloat(protein);
    if (!isNaN(proteinValue) && proteinValue > 0 && name && id) {
      try {
        setIsUpdating(true);
        await updateLoggedEntry(id, {
          name,
          protein: proteinValue,
          timestamp,
          photoUri,
        });
        reset();
        router.back();
      } catch (error) {
        console.error("Error updating entry:", error);
        Alert.alert("Oops!", "Something went wrong. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Entry?", "Are you sure you want to delete this entry?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (id) {
            try {
              setIsDeleting(true);
              await removeLoggedEntry(id);
              router.back();
            } catch (error) {
              console.error("Error deleting entry:", error);
              Alert.alert("Oops!", "Sorry, something went wrong. Please try again.");
            } finally {
              setIsDeleting(false);
            }
          }
        },
      },
    ]);
  };

  if (!entry) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TimePickerButton />
        <EditTitle />
        <CloseButton />
      </View>

      <View style={styles.numpadValueAndNameContainer}>
        <ProteinValueDisplay protein={protein} />
        <NameSelector name={name} onNameChange={setName} />
        <DeleteButton 
          isDeleting={isDeleting} 
          isDisabled={isUpdating || isDeleting} 
          onPress={handleDelete} 
        />
      </View>



      <View style={styles.contentContainer}>
        {entryType === "custom" && (
          <Animated.View
            style={[
              styles.animatedViewContainer,
              containerHeight ? { height: containerHeight } : undefined,
            ]}
            entering={FadeIn.duration(600)}
            exiting={FadeOut.duration(600)}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              measureViewHeight(height);
            }}
          >
            <NumpadWithAnimations value={protein} setProtein={setProtein} />
          </Animated.View>
        )}

        {entryType === "saved" && (
          <Animated.View
            style={[
              styles.animatedViewContainer,
              containerHeight ? { height: containerHeight } : undefined,
            ]}
            entering={FadeIn.duration(600)}
            exiting={FadeOut.duration(600)}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              measureViewHeight(height);
            }}
          >
            <CategorySelector />
          </Animated.View>
        )}
      </View>

      <View style={styles.actionButtonsContainer}>
        <View style={styles.topActionsRow}>
          <PhotoPicker photoUri={photoUri} onPhotoChange={setPhotoUri} />
          <EntryTypeToggle entryType={entryType} onEntryTypeChange={setEntryType} />
          <UpdateButton 
            isUpdating={isUpdating} 
            isDisabled={isUpdating || isDeleting} 
            onPress={handleUpdate} 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontWeight: "bold",
    fontSize: FontSize.medium,
  },
  numpadValueAndNameContainer: {
    flexDirection: "column",
    gap: Spacing.md,
  },
  numpadValueContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: Spacing.xs,
  },
  unitText: {
    fontWeight: "bold",
    fontSize: FontSize.medium,
  },
  nameContainer: {
    alignItems: "center",
    alignSelf: "center",
  },
  deleteButtonContainer: {
    alignItems: "center",
    alignSelf: "center",
  },
  actionButtonsContainer: {
    flexDirection: "column",
    gap: Spacing.md,
  },
  topActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
  },
  contentContainer: {
    flex: 1,
  },
  animatedViewContainer: {
    flex: 1,
  },
});
