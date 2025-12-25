import Text from "@/components/Text";
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

  // Split metrics into rows of 2
  const rows = [METRIC_CONFIG.slice(0, 2), METRIC_CONFIG.slice(2, 4)];

  return (
    <View style={styles.container}>
      <View style={styles.metricsColumn}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.metricsRow}>
            {row.map((config) => (
              <Metric
                key={config.key}
                title={config.label}
                icon={config.icon}
                value={config.format(metrics[config.key])}
              />
            ))}
          </View>
        ))}
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
