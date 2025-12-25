import {
  Colors,
  FontSize,
  Spacing,
  useThemeColors
} from "@/constants/theme";
import { useFriendsWithEntries, type FriendData } from "@/stores/friendships";
import {
  calculateAllMetrics,
  formatMetricValue,
  METRIC_CONFIG,
  type UserMetrics,
} from "@/utils/metrics";
import {
  createGlassModifier,
  interactivePadding,
  roundedClipShape,
} from "@/utils/ui-modifiers";
import {
  Button,
  Host,
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  fixedSize,
  frame,
  padding
} from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";

interface FriendsProps {
  showHallOfFameBanner?: boolean;
  limit?: boolean;
}

interface LeaderboardEntry extends UserMetrics {
  id: string;
  nickname: string;
  isCurrentUser: boolean;
}

export default function Friends({
  showHallOfFameBanner = true,
  limit = true,
}: FriendsProps) {
  const theme = useColorScheme() as "light" | "dark";
  const themeColors = useThemeColors();
  const [selectedMetric, setSelectedMetric] = useState(0);

  const { currentUser, friends, isLoading } = useFriendsWithEntries();

  // Build sorted leaderboard entries
  const leaderboardEntries = useMemo((): LeaderboardEntry[] => {
    const toEntry = (user: FriendData, isMe: boolean): LeaderboardEntry => ({
      id: user.id,
      nickname: user.nickname,
      isCurrentUser: isMe,
      ...calculateAllMetrics(user.loggedEntries),
    });

    const entries: LeaderboardEntry[] = [];

    if (currentUser) {
      entries.push(toEntry(currentUser, true));
    }

    friends.forEach((friend) => entries.push(toEntry(friend, false)));

    // Sort by selected metric (descending)
    const sortKey = METRIC_CONFIG[selectedMetric].key;
    return entries.sort((a, b) => b[sortKey] - a[sortKey]);
  }, [currentUser, friends, selectedMetric]);

  const glassModifier = (interactive: boolean) =>
    createGlassModifier(interactive, theme);

  const HallOfFameBanner = () => (
    <HStack>
      <Spacer />
      <HStack spacing={Spacing.sm}>
        <Image systemName="laurel.leading" size={FontSize.xxlarge} color="gold" />
        <Text weight="semibold" design="rounded" color={themeColors.text} size={FontSize.big}>
          Hall of Fame
        </Text>
        <Image systemName="laurel.trailing" size={FontSize.xxlarge} color="gold" />
      </HStack>
      <Spacer />
    </HStack>
  );

  const MetricSelector = () => {
    const prev = () =>
      setSelectedMetric((i) => (i - 1 + METRIC_CONFIG.length) % METRIC_CONFIG.length);
    const next = () =>
      setSelectedMetric((i) => (i + 1) % METRIC_CONFIG.length);

    return (
      <HStack spacing={Spacing.md}>
        <HStack spacing={Spacing.md}>
          <Button variant="glass" onPress={prev}>
            <Image systemName="chevron.left" size={FontSize.medium} color={themeColors.secondaryText} />
          </Button>
          <Button variant="glass" onPress={next}>
            <Image systemName="chevron.right" size={FontSize.medium} color={themeColors.secondaryText} />
          </Button>
        </HStack>
        <Text weight="medium" design="rounded" color={themeColors.text} size={FontSize.big}>
          {METRIC_CONFIG[selectedMetric].label}
        </Text>
      </HStack>
    );
  };

  const RankIcon = ({ index }: { index: number }) => {
    const medalColors = ["gold", "silver", "brown"];
    return (
      <HStack alignment="center" modifiers={[frame({ width: 40, alignment: "center" })]}>
        {index < 3 ? (
          <Image systemName="medal.fill" size={FontSize.large} color={medalColors[index]} />
        ) : (
          <Text weight="bold" size={FontSize.big} color={themeColors.secondaryText} design="rounded">
            {`${index + 1}`}
          </Text>
        )}
      </HStack>
    );
  };

  const LeaderboardRow = ({ entry, index }: { entry: LeaderboardEntry; index: number }) => (
    <HStack modifiers={[interactivePadding, glassModifier(true)]}>
      <HStack spacing={Spacing.sm} alignment="center">
        <RankIcon index={index} />
        <Text
          color={entry.isCurrentUser ? Colors.accent.blue : themeColors.text}
          weight="semibold"
          design="rounded"
        >
          {entry.nickname}
        </Text>
      </HStack>
      <Spacer />
      <Text color={themeColors.secondaryText} weight="medium" design="rounded">
        {formatMetricValue(entry, selectedMetric)}
      </Text>
    </HStack>
  );

  const ViewAllRow = () => (
    <HStack
      modifiers={[interactivePadding, glassModifier(true)]}
      onPress={() => router.push("/leaderboard")}
    >
      <HStack spacing={Spacing.sm} alignment="center">
        <HStack alignment="center" modifiers={[frame({ width: 40, alignment: "center" })]}>
          <Image
            systemName="arrow.down.left.and.arrow.up.right.circle.fill"
            size={FontSize.large}
            color={Colors.accent.pink}
          />
        </HStack>
        <Text color={themeColors.text} weight="semibold" design="rounded">
          View All
        </Text>
      </HStack>
      <Spacer />
    </HStack>
  );

  const EmptyState = () => (
    <HStack modifiers={[padding({ horizontal: Spacing.md, vertical: Spacing.lg }), glassModifier(false)]}>
      <Spacer />
      <Text color={themeColors.secondaryText} weight="medium" design="rounded">
        Add friends to compete on the leaderboard!
      </Text>
      <Spacer />
    </HStack>
  );

  if (isLoading) {
    return (
      <View style={{ padding: Spacing.xl, alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  const displayedEntries = limit ? leaderboardEntries.slice(0, 3) : leaderboardEntries;
  const showViewAll = limit && leaderboardEntries.length > 3;

  return (
    <Host matchContents>
      <VStack spacing={Spacing.md} alignment="leading">
        {showHallOfFameBanner && <HallOfFameBanner />}

        <HStack modifiers={[padding({ horizontal: Spacing.sm })]} spacing={Spacing.md}>
          <MetricSelector />
          <Spacer />
          <Button
            variant="borderless"
            color={Colors.accent.blue}
            modifiers={[fixedSize({ horizontal: true, vertical: true })]}
            onPress={() => router.push("/add-friend")}
          >
            Add Friend
          </Button>
        </HStack>

        <VStack modifiers={[glassModifier(false), roundedClipShape]}>
          {displayedEntries.length === 0 ? (
            <EmptyState />
          ) : (
            displayedEntries.map((entry, i) => (
              <LeaderboardRow key={entry.id} entry={entry} index={i} />
            ))
          )}
          {showViewAll && <ViewAllRow />}
        </VStack>
      </VStack>
    </Host>
  );
}
