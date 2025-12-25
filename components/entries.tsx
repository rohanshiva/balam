import {
  FontSize,
  Spacing,
  useThemeColors
} from "@/constants/theme";
import { useTodayEntries } from "@/stores/logged-entries";
import { formatNumber } from "@/utils";
import {
  createGlassModifier,
  interactivePadding,
  roundedClipShape,
} from "@/utils/ui-modifiers";
import { Host, HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { useColorScheme } from "react-native";

export default function Entries() {
  const { entries: todayEntries } = useTodayEntries();
  const theme = useColorScheme() as "light" | "dark";
  const themeColors = useThemeColors();
  const router = useRouter();

  const handleEntryPress = (entryId: string) => {
    router.push({
      pathname: "/edit",
      params: { id: entryId },
    });
  };

  const EntryRow = ({ entry }: { entry: (typeof todayEntries)[0] }) => {
    const EntryName = () => (
      <Text color={themeColors.text} weight="semibold" design="rounded">
        {entry.name}
      </Text>
    );

    const EntryTime = () => (
      <Text
        color={themeColors.secondaryText}
        weight="medium"
        size={FontSize.small}
        design="monospaced"
      >
        {`at ${format(entry.timestamp, "HH:mm")}`}
      </Text>
    );

    const EntryProtein = () => (
      <Text color={themeColors.secondaryText} weight="medium" design="rounded">
        {`${formatNumber(entry.protein)} g`}
      </Text>
    );

    return (
      <VStack>
        <HStack
          modifiers={[
            interactivePadding,
            createGlassModifier(true, theme),
          ]}
          onPress={() => handleEntryPress(entry.id)}
        >
          <VStack alignment="leading" spacing={Spacing.sm}>
            <EntryName />
            <EntryTime />
          </VStack>
          <Spacer />
          <EntryProtein />
        </HStack>
      </VStack>
    );
  };

  const EmptyState = () => (
    <VStack alignment="center" spacing={Spacing.md}>
      <VStack
        modifiers={[
          interactivePadding,
          createGlassModifier(true, theme),
          roundedClipShape,
        ]}
      >
        <HStack>
          <Spacer />
          <Text
            color={themeColors.secondaryText}
            weight="semibold"
            design="rounded"
          >
            Nothing logged here so far
          </Text>
          <Spacer />
        </HStack>
      </VStack>
    </VStack>
  );

  return (
    <Host matchContents>
      <VStack spacing={Spacing.sm} alignment="leading">
        <Text
          weight="semibold"
          design="rounded"
          color={themeColors.text}
          size={FontSize.big}
        >
          Entries
        </Text>
        <VStack modifiers={[roundedClipShape]}>
          {todayEntries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
          {todayEntries.length === 0 && <EmptyState />}
        </VStack>
      </VStack>
    </Host>
  );
}
