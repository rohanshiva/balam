import { CategorySelector } from "@/components/entry-sheet/category-selector";
import {
  AnimatedValue,
  NumpadWithAnimations,
} from "@/components/entry-sheet/numpad";
import { PhotoPicker } from "@/components/entry-sheet/photo-picker";
import Text from "@/components/Text";
import {
  Colors,
  FontSize,
  Spacing,
  useThemeColors
} from "@/constants/theme";
import { useCurrentEntryStore } from "@/stores";
import { addLoggedEntry, useTodayEntries } from "@/stores/logged-entries";
import { useProfile } from "@/stores/profile";
import {
  compactPadding,
  createGlassModifier,
  roundedXxlClipShape,
} from "@/utils/ui-modifiers";
import { Button, Host, HStack, Image, Text as UIText } from "@expo/ui/swift-ui";
import {
  fixedSize
} from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import React, { useState } from "react";
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
        onPress={() => router.dismiss()}
      />
    </Host>
  );
};

interface ProteinChangeDisplayProps {
  currentProtein: number;
  newProtein: string;
}

const ProteinChangeDisplay = ({
  currentProtein,
  newProtein,
}: ProteinChangeDisplayProps) => {
  const themeColors = useThemeColors();
  return (
    <View style={styles.changeContainer}>
      <View style={styles.previousValueContainer}>
        <Text
          style={[
            styles.previousValueText,
            { color: themeColors.secondaryText },
          ]}
          numberOfLines={1}
        >
          {`${currentProtein} g`}
        </Text>
      </View>
      <Host matchContents>
        <Image
          systemName="arrow.right.circle.dotted"
          color={Colors.accent.pink}
        />
      </Host>
      <View style={styles.currentValueContainer}>
        <Text style={styles.currentValueText} numberOfLines={1}>
          {`${newProtein} g`}
        </Text>
      </View>
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
      <Text style={[styles.unitText, { color: themeColors.secondaryText }]}>
        g
      </Text>
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
            compactPadding,
            createGlassModifier(true, "transparent"),
            fixedSize({ horizontal: true }),
            roundedXxlClipShape,
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

interface EntryTypeToggleProps {
  entryType: string;
  onEntryTypeChange: (type: string) => void;
}

const EntryTypeToggle = ({
  entryType,
  onEntryTypeChange,
}: EntryTypeToggleProps) => {
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

interface LogButtonProps {
  isLogging: boolean;
  onPress: () => void;
}

const LogButton = ({ isLogging, onPress }: LogButtonProps) => (
  console.log("LogButton", isLogging),
  (
    <Host matchContents>
      <Button
        variant="glassProminent"
        color={Colors.accent.blue}
        controlSize="large"
        modifiers={[fixedSize({ horizontal: true, vertical: true })]}
        onPress={onPress}
      >
        <UIText weight="bold" size={FontSize.medium}>
          {isLogging ? "Logging..." : "Log"}
        </UIText>
      </Button>
    </Host>
  )
);

export default function Add() {
  const [entryType, setEntryType] = useState("custom");
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  const { totalProtein: currentProtein } = useTodayEntries();
  const { profileId } = useProfile();

  const {
    name,
    protein,
    timestamp,
    photoUri,
    setName,
    setProtein,
    setPhotoUri,
    reset,
  } = useCurrentEntryStore();

  const measureViewHeight = (height: number) => {
    setContainerHeight((prev) => {
      // Use the larger height to ensure both views fit
      return prev === null ? height : Math.max(prev, height);
    });
  };

  const handleLog = async () => {
    const proteinValue = parseFloat(protein);
    if (!isNaN(proteinValue) && proteinValue > 0 && name && profileId) {
      try {
        setIsLogging(true);
        await addLoggedEntry(
          {
            name,
            protein: proteinValue,
            timestamp,
            photoUri,
          },
          profileId
        );
        reset();
        router.back();
      } catch (error) {
        console.error("Error logging entry:", error);
        Alert.alert("Oops!", "Sorry, something went wrong. Please try again.");
      } finally {
        setIsLogging(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TimePickerButton />
        <ProteinChangeDisplay
          currentProtein={currentProtein}
          newProtein={protein}
        />
        <CloseButton />
      </View>

      <View style={styles.numpadValueAndNameContainer}>
        <ProteinValueDisplay protein={protein} />
        <NameSelector name={name} onNameChange={setName} />
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

      <View style={styles.logButtonContainer}>
        <PhotoPicker photoUri={photoUri} onPhotoChange={setPhotoUri} />
        <EntryTypeToggle
          entryType={entryType}
          onEntryTypeChange={setEntryType}
        />
        <LogButton isLogging={isLogging} onPress={handleLog} />
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
  changeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    justifyContent: "space-around",
  },
  previousValueContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  currentValueContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  previousValueText: {
    fontWeight: "bold",
    fontSize: FontSize.normal,
  },
  currentValueText: {
    color: Colors.accent.blue,
    fontWeight: "bold",
    fontSize: FontSize.normal,
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
  nameText: {
    fontWeight: "medium",
    fontSize: FontSize.small,
  },
  logButtonContainer: {
    flex: 1,
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
