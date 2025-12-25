import Text from "@/components/Text";
import { Colors, FontSize, Spacing, useThemeColors } from "@/constants/theme";
import type { SavedItem } from "@/stores";
import { useCurrentEntryStore, useSavedItemsByCategory } from "@/stores";
import { ItemHandler } from "@/utils";
import {
  Button,
  Host,
  HStack,
  Spacer,
  Text as UIText,
  VStack,
} from "@expo/ui/swift-ui";
import {
  clipShape,
  fixedSize,
  glassEffect,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";

export default function Category() {
  const rawTheme = useColorScheme();
  const theme = rawTheme === "dark" ? "dark" : "light";
  const themeColors = useThemeColors();
  const { height: windowHeight } = useWindowDimensions();

  const { category, handler } = useLocalSearchParams<{
    category: string;
    handler?: string;
  }>();
  const { items: categoryItems, isLoading } = useSavedItemsByCategory(
    category || ""
  );
  const { setFromSavedItem } = useCurrentEntryStore();

  const handleItemPress = (item: SavedItem) => {
    if (handler === ItemHandler.Edit) {
      router.push({
        pathname: "/edit-item",
        params: {
          category: category || "",
          itemId: item.id,
        },
      });
    } else {
      // Default: select the item
      setFromSavedItem(item.name, item.protein);
      router.back();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.scrollContainer, styles.centerContainer]}>
        <ActivityIndicator size="large" color={themeColors.secondaryText} />
      </View>
    );
  }

  const AddButton = () => (
    <Host matchContents>
      <Button
        variant="glassProminent"
        controlSize="large"
        color={Colors.accent.blue}
        modifiers={[fixedSize({ horizontal: true, vertical: true })]}
        onPress={() =>
          router.push({
            pathname: "/save-item",
            params: { category: category || "" },
          })
        }
      >
        <UIText weight="bold" size={FontSize.medium}>
          Add Item
        </UIText>
      </Button>
    </Host>
  );

  // Account for header (~100), padding, and safe areas
  const emptyStateHeight = windowHeight * 0.42;

  const EmptyState = () => (
    <View style={[styles.emptyStateContainer, { minHeight: emptyStateHeight }]}>
      <View style={styles.emptyMessageContainer}>
        <Text style={[styles.emptyText, { color: themeColors.secondaryText }]}>
          Your saved {category?.toLowerCase()} will appear here
        </Text>
      </View>
      <View style={styles.addButtonContainer}>
        <AddButton />
      </View>
    </View>
  );

  const ItemsList = () => (
    <>
      <View style={{ gap: 10 }}>
        {categoryItems.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => handleItemPress(item)}>
            <Host matchContents>
              <VStack modifiers={[clipShape("roundedRectangle", 16)]}>
                <HStack
                  modifiers={[
                    padding({
                      horizontal: Spacing.md,
                      vertical: Spacing.md,
                    }),
                    glassEffect({
                      glass: {
                        variant: "regular",
                        interactive: true,
                        tint: theme === "dark" ? "transparent" : "white",
                      },
                      shape: "rectangle",
                    }),
                  ]}
                >
                  <UIText
                    color={themeColors.secondaryText}
                    weight="medium"
                    size={FontSize.medium}
                  >
                    {item.name}
                  </UIText>
                  <Spacer />
                  <UIText
                    color={themeColors.secondaryText}
                    weight="medium"
                    size={FontSize.medium}
                  >
                    {`${item.protein} g`}
                  </UIText>
                </HStack>
              </VStack>
            </Host>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.addButtonContainer}>
        <AddButton />
      </View>
    </>
  );

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {categoryItems.length ? <ItemsList /> : <EmptyState />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonContainer: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  emptyStateContainer: {
    justifyContent: "space-between",
  },
  emptyMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: FontSize.medium,
    fontWeight: "500",
  },
});
