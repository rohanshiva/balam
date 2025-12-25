import {
  BorderRadius,
  FontSize,
  Spacing,
  useThemeColors,
} from "@/constants/theme";
import { LoggedEntry } from "@/stores/logged-entries";
import { addDays, removeDays, truncTime } from "@/utils";
import { getDay } from "date-fns";
import { GlassView } from "expo-glass-effect";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Text from "@/components/Text";

const STREAK_COLUMN_GROUP_SIZE = 7;
const STREAK_GROUP_SIZE = 3;
const LOOK_BACK_DAYS = STREAK_COLUMN_GROUP_SIZE * STREAK_GROUP_SIZE * 6;

const monthAbbreviations = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

function getProteinByDate(
  entries: LoggedEntry[],
  start: number,
  end: number
): Map<number, number> {
  const proteinByDate = new Map<number, number>();

  entries.forEach((entry) => {
    const dateKey = truncTime(entry.timestamp);
    if (dateKey >= start && dateKey < end) {
      proteinByDate.set(
        dateKey,
        (proteinByDate.get(dateKey) || 0) + entry.protein
      );
    }
  });

  return proteinByDate;
}

function getColorIndexForPercentage(percentage: number): number {
  const roundedPercentage = Math.ceil(percentage / 10) * 10;
  if (roundedPercentage === 0) return 0;
  const index = Math.floor(roundedPercentage / 10) - 1;
  return Math.min(Math.max(index, 0), 9);
}

function getStreaksFromProteinByDate(
  start: number,
  end: number,
  proteinByDate: Map<number, number>,
  proteinGoal: number
): { day: number; colorIndex: number; percentage: number }[] {
  const streaks = [];

  for (let i = start; i < end; i = addDays(i, 1)) {
    const protein = proteinByDate.get(i) || 0;
    const percentage = proteinGoal > 0 ? (protein / proteinGoal) * 100 : 0;
    const colorIndex = getColorIndexForPercentage(percentage);

    streaks.push({
      day: i,
      colorIndex,
      percentage,
    });
  }
  return streaks;
}

interface TileProps {
  colorIndex: number;
}

const tileStyles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
  },
  innerTile: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
    borderRadius: BorderRadius.xs,
  },
  tileFill: {
    width: "100%",
    aspectRatio: 1,
  },
});

function Tile({ colorIndex }: TileProps) {
  const { streakGridColors } = useThemeColors();
  const tileColor = streakGridColors[colorIndex];

  return (
    <View style={tileStyles.container}>
      <View style={[tileStyles.innerTile, { backgroundColor: tileColor }]}>
        <View style={tileStyles.tileFill} />
      </View>
    </View>
  );
}

interface RowProps {
  rowData: { colorIndex: number; date: number }[];
  weekdayLabel: string;
}

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  weekdayLabel: {
    width: FontSize.xsmall,
    height: FontSize.xsmall,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayText: {
    fontSize: FontSize.xsmall,
  },
  tilesContainer: {
    flexDirection: "row",
    flex: 1,
    gap: Spacing.xs,
  },
  tileWrapper: {
    flex: 1,
    aspectRatio: 1,
  },
});

function Row({ rowData, weekdayLabel }: RowProps) {
  const themeColors = useThemeColors();
  return (
    <View style={rowStyles.container}>
      <View style={rowStyles.weekdayLabel}>
        <Text style={[rowStyles.weekdayText, { color: themeColors.secondaryText }]}>
          {weekdayLabel}
        </Text>
      </View>
      <View style={rowStyles.tilesContainer}>
        {rowData.map((item, tileIndex) => (
          <View key={tileIndex} style={rowStyles.tileWrapper}>
            <Tile colorIndex={item.colorIndex} />
          </View>
        ))}
      </View>
    </View>
  );
}

const gridStyles = StyleSheet.create({
  cardContainer: {
    flexDirection: "column",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  monthHeaderContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: Spacing.md,
    paddingLeft: Spacing.lg,
  },
  monthText: {
    fontSize: FontSize.xsmall,
  },
  monthSpacer: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: "column",
    gap: Spacing.xs,
  },
});

interface StreakGridProps {
  entries: LoggedEntry[];
  proteinGoal: number;
}

export function StreakGrid({ entries, proteinGoal }: StreakGridProps) {
  const { gridStart, gridEnd } = useMemo(() => {
    const end = addDays(truncTime(Date.now()), 1);
    const start = removeDays(end, LOOK_BACK_DAYS);
    return { gridStart: start, gridEnd: end };
  }, []);

  const proteinByDate = useMemo(
    () => getProteinByDate(entries, gridStart, gridEnd),
    [entries, gridStart, gridEnd]
  );

  const streak = useMemo(
    () =>
      getStreaksFromProteinByDate(
        gridStart,
        gridEnd,
        proteinByDate,
        proteinGoal
      ),
    [gridStart, gridEnd, proteinByDate, proteinGoal]
  );

  const gridData = useMemo(() => {
    const rows: Array<{ day: number; colorIndex: number }[]> = Array.from(
      { length: 7 },
      () => []
    );

    streak.forEach((item) => {
      const date = new Date(item.day);
      const dayOfWeek = getDay(date);
      const rowIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      rows[rowIndex].push({ day: item.day, colorIndex: item.colorIndex });
    });

    rows.forEach((row) => row.sort((a, b) => a.day - b.day));

    return rows;
  }, [streak]);

  const displayMonths = useMemo(() => {
    const uniqueMonths = new Set<number>();
    streak.forEach((item) => {
      const date = new Date(item.day);
      uniqueMonths.add(date.getMonth());
    });

    const monthIndices = Array.from(uniqueMonths).sort((a, b) => a - b);
    return monthIndices.slice(0, 6).map((idx) => monthAbbreviations[idx]);
  }, [streak]);

  const themeColors = useThemeColors();

  return (
    <GlassView
      style={gridStyles.cardContainer}
      glassEffectStyle="regular"
      tintColor={"transparent"}
      isInteractive={true}
    >
      {displayMonths.length > 0 && (
        <View style={gridStyles.monthHeader}>
          <View style={gridStyles.monthHeaderContent}>
            {displayMonths.map((month, monthIdx) => (
              <React.Fragment key={`month-${month}-${monthIdx}`}>
                <Text style={[gridStyles.monthText, { color: themeColors.secondaryText }]}>
                  {month}
                </Text>
                {monthIdx < displayMonths.length - 1 && (
                  <View style={gridStyles.monthSpacer} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      )}

      <View style={gridStyles.gridContainer}>
        {gridData.map((row, rowIndex) => (
          <Row
            key={rowIndex}
            rowData={row.map((item) => ({
              colorIndex: item.colorIndex,
              date: item.day,
            }))}
            weekdayLabel={weekdays[rowIndex]}
          />
        ))}
      </View>
    </GlassView>
  );
}
