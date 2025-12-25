import Text from "@/components/Text";
import { Colors, FontSize, Spacing, useThemeColors } from "@/constants/theme";
import { useTodayEntries } from "@/stores/logged-entries";
import { useProfile } from "@/stores/profile";
import { formatNumber } from "@/utils";
import { Host, LinearProgress } from "@expo/ui/swift-ui";
import { format } from "date-fns";
import { StyleSheet, View } from "react-native";

export default function Title() {
  const themeColors = useThemeColors();
  const { totalProtein: protein } = useTodayEntries();
  const { proteinGoal = 1 } = useProfile();
  const remainingProtein = proteinGoal - protein;
  const progress = Math.max(0, Math.min(1, protein / proteinGoal));

  const DayLabel = () => (
    <Text style={[styles.day, { color: themeColors.text }]}>
      {format(new Date(), "EE")}
    </Text>
  );

  const DateLabel = () => (
    <Text style={[styles.date, { color: themeColors.secondaryText }]}>
      {format(new Date(), "MMM do")}
    </Text>
  );

  const CurrentProtein = () => (
    <Text style={[styles.currentProtein, { color: themeColors.text }]}>
      {`${formatNumber(protein)} g`}
    </Text>
  );

  const RemainingProtein = () => (
    <Text style={[styles.remainingProtein, { color: themeColors.secondaryText }]}>
      {remainingProtein > 0
        ? `${formatNumber(Math.abs(remainingProtein))} g left`
        : `${formatNumber(Math.abs(remainingProtein))} g over`}
    </Text>
  );

  const ProgressBar = () => (
    <Host matchContents>
      <LinearProgress
        progress={progress}
        color={remainingProtein > 0 ? Colors.accent.orange : Colors.accent.green}
      />
    </Host>
  );

  return (
    <View style={styles.container}>
      <View>
        <DayLabel />
        <DateLabel />
      </View>
      <CurrentProtein />
      <View style={styles.column}>
        <RemainingProtein />
        <ProgressBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flexDirection: "column",
    gap: Spacing.xs,
  },
  day: {
    fontSize: FontSize.large,
    fontWeight: "bold",
  },
  date: {
    fontSize: FontSize.medium,
    fontWeight: "semibold",
  },
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currentProtein: {
    fontWeight: "bold",
    fontSize: FontSize.large,
  },
  remainingProtein: {
    fontSize: FontSize.small,
    fontWeight: "bold",
  },
});
