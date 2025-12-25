import {
  BorderRadius,
  FontSize,
  Spacing,
  useThemeColors,
} from "@/constants/theme";
import { useLoggedEntries } from "@/stores";
import {
  calculateAllMetrics,
  METRIC_CONFIG,
  type UserMetrics,
} from "@/utils/metrics";
import { Host, Image } from "@expo/ui/swift-ui";
import { GlassView } from "expo-glass-effect";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Text from "@/components/Text";

interface MetricProps {
  title: string;
  value: string;
  icon: string;
}

function Metric({ title, value, icon }: MetricProps) {
  const themeColors = useThemeColors();

  const MetricIcon = () => (
    <GlassView
      glassEffectStyle="clear"
      tintColor="transparent"
      isInteractive={true}
      style={styles.metricIconContainer}
    >
      <Host matchContents>
        <Image
          systemName={icon as any}
          size={FontSize.medium}
          color={themeColors.secondaryText}
        />
      </Host>
    </GlassView>
  );

  const MetricContent = () => (
    <View style={styles.metricContent}>
      <Text style={[styles.metricTitle, { color: themeColors.secondaryText }]}>
        {title}
      </Text>
      <Text style={[styles.metricValue, { color: themeColors.text }]}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={styles.metricContainer}>
      <MetricIcon />
      <MetricContent />
    </View>
  );
}

export default function Metrics() {
  const { entries } = useLoggedEntries();

  const metrics: UserMetrics = useMemo(
    () => calculateAllMetrics(entries),
    [entries]
  );

  const getFormattedValue = (index: number) =>
    METRIC_CONFIG[index].format(metrics[METRIC_CONFIG[index].key]);

  const FirstRow = () => (
    <View style={styles.metricsRow}>
      <Metric
        title={METRIC_CONFIG[0].label}
        icon={METRIC_CONFIG[0].icon}
        value={getFormattedValue(0)}
      />
      <Metric
        title={METRIC_CONFIG[1].label}
        icon={METRIC_CONFIG[1].icon}
        value={getFormattedValue(1)}
      />
    </View>
  );

  const SecondRow = () => (
    <View style={styles.metricsRow}>
      <Metric
        title={METRIC_CONFIG[2].label}
        icon={METRIC_CONFIG[2].icon}
        value={getFormattedValue(2)}
      />
      <Metric
        title={METRIC_CONFIG[3].label}
        icon={METRIC_CONFIG[3].icon}
        value={getFormattedValue(3)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.metricsColumn}>
        <FirstRow />
        <SecondRow />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
