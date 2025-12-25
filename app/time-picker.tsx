import {
  BorderRadius,
  Colors,
  FontSize,
  Spacing,
  useThemeColors,
} from "@/constants/theme";
import { useCurrentEntryStore } from "@/stores/current-entry";
import {
  Button,
  DateTimePicker,
  Host,
  HStack,
  Image,
  Spacer,
  Text as UIText,
} from "@expo/ui/swift-ui";
import {
  clipShape,
  fixedSize,
  glassEffect,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, useColorScheme, View } from "react-native";

interface DatePickerRowProps {
  timestamp: number;
  onTimestampChange: (timestamp: number) => void;
}

const DatePickerRow = ({
  timestamp,
  onTimestampChange,
}: DatePickerRowProps) => {
  const theme = useColorScheme() as "light" | "dark";
  const themeColors = useThemeColors();

  const inputModifiers = [
    padding({
      horizontal: Spacing.md,
      vertical: Spacing.md,
    }),
    glassEffect({
      glass: {
        variant: "regular",
        interactive: false,
        tint: theme == "dark" ? "transparent" : "white",
      },
    }),
    clipShape("roundedRectangle", BorderRadius.sm),
  ];

  const handleDateChange = (date: Date) => {
    const newDate = new Date(date);
    const currentDate = new Date(timestamp);
    // Keep the time, update the date
    newDate.setHours(currentDate.getHours());
    newDate.setMinutes(currentDate.getMinutes());
    newDate.setSeconds(currentDate.getSeconds());
    onTimestampChange(newDate.getTime());
  };

  return (
    <Host matchContents>
      <HStack modifiers={inputModifiers}>
        <HStack spacing={Spacing.sm}>
          <Image
            systemName="clock.fill"
            size={FontSize.normal}
            color={Colors.accent.orange}
          />
          <UIText
            weight="medium"
            size={FontSize.normal}
            color={themeColors.secondaryText}
          >
            Date
          </UIText>
        </HStack>
        <Spacer />
        <DateTimePicker
          onDateSelected={handleDateChange}
          displayedComponents={"date"}
          initialDate={new Date(timestamp).toISOString()}
          variant="compact"
        />
      </HStack>
    </Host>
  );
};

interface TimePickerRowProps {
  timestamp: number;
  onTimestampChange: (timestamp: number) => void;
}

const TimePickerRow = ({
  timestamp,
  onTimestampChange,
}: TimePickerRowProps) => {
  const theme = useColorScheme() as "light" | "dark";
  const themeColors = useThemeColors();

  const inputModifiers = [
    padding({
      horizontal: Spacing.md,
      vertical: Spacing.md,
    }),
    glassEffect({
      glass: {
        variant: "regular",
        interactive: false,
        tint: theme == "dark" ? "transparent" : "white",
      },
    }),
    clipShape("roundedRectangle", BorderRadius.sm),
  ];

  const handleTimeChange = (date: Date) => {
    const newTime = new Date(date);
    const currentDate = new Date(timestamp);
    // Keep the date, update the time
    currentDate.setHours(newTime.getHours());
    currentDate.setMinutes(newTime.getMinutes());
    currentDate.setSeconds(newTime.getSeconds());
    onTimestampChange(currentDate.getTime());
  };

  return (
    <Host matchContents>
      <HStack modifiers={inputModifiers}>
        <HStack spacing={Spacing.sm}>
          <Image
            systemName="calendar"
            size={FontSize.normal}
            color={Colors.accent.pink}
          />
          <UIText
            weight="medium"
            size={FontSize.normal}
            color={themeColors.secondaryText}
          >
            Time
          </UIText>
        </HStack>
        <Spacer />
        <DateTimePicker
          onDateSelected={handleTimeChange}
          displayedComponents={"hourAndMinute"}
          initialDate={new Date(timestamp).toISOString()}
          variant="compact"
        />
      </HStack>
    </Host>
  );
};

const DoneButton = () => (
  <Host matchContents style={styles.buttonContainer}>
    <Button
      variant="glassProminent"
      controlSize="large"
      color={Colors.accent.blue}
      modifiers={[fixedSize({ horizontal: true, vertical: true })]}
      onPress={() => router.back()}
    >
      <UIText weight="bold" size={FontSize.medium}>
        Done
      </UIText>
    </Button>
  </Host>
);

export default function TimePicker() {
  const { timestamp, setTimestamp } = useCurrentEntryStore();

  return (
    <View style={styles.container}>
      <View style={styles.inputsContainer}>
        <DatePickerRow timestamp={timestamp} onTimestampChange={setTimestamp} />
        <TimePickerRow timestamp={timestamp} onTimestampChange={setTimestamp} />
      </View>
      <DoneButton />
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
  buttonContainer: {
    alignSelf: "center",
  },
});
