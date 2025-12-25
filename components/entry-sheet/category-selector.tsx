import { FontSize, Spacing, useThemeColors } from "@/constants/theme";
import { createGlassModifier } from "@/utils/ui-modifiers";
import {
  Button,
  Host,
  HStack,
  Image,
  Spacer,
  Text as UIText,
  VStack,
} from "@expo/ui/swift-ui";
import { clipShape, padding } from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, useColorScheme, View } from "react-native";

interface CategorySelectorProps {
  onCategorySelect?: (category: string) => void;
}

export function CategorySelector({ onCategorySelect }: CategorySelectorProps) {
  const rawTheme = useColorScheme();
  const theme = rawTheme === "dark" ? "dark" : "light";
  const themeColors = useThemeColors();

  const handleOpenCategorySheet = (category: string) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
    router.push({
      pathname: "/category",
      params: { category },
    });
  };

  return (
    <View style={styles.savedEntriesCategoriesContainer}>
      <Host matchContents>
        <Button onPress={() => handleOpenCategorySheet("drinks")}>
          <VStack modifiers={[clipShape("roundedRectangle", 16)]}>
            <HStack
              modifiers={[
                padding({
                  horizontal: Spacing.md,
                  vertical: Spacing.lg,
                }),
                createGlassModifier(true, theme),
              ]}
            >
              <UIText
                color={themeColors.secondaryText}
                weight="medium"
                size={FontSize.normal}
              >
                Drinks
              </UIText>
              <Spacer />
              <Image
                systemName="chevron.forward.circle.fill"
                color={themeColors.secondaryText}
                size={FontSize.medium}
              />
            </HStack>
          </VStack>
        </Button>
      </Host>
      <Host matchContents>
        <Button onPress={() => handleOpenCategorySheet("meals")}>
          <VStack modifiers={[clipShape("roundedRectangle", 16)]}>
            <HStack
              modifiers={[
                padding({
                  horizontal: Spacing.md,
                  vertical: Spacing.lg,
                }),
                createGlassModifier(true, theme),
              ]}
            >
              <UIText
                color={themeColors.secondaryText}
                weight="medium"
                size={FontSize.normal}
              >
                Meals
              </UIText>
              <Spacer />
              <Image
                systemName="chevron.forward.circle.fill"
                color={themeColors.secondaryText}
                size={FontSize.medium}
              />
            </HStack>
          </VStack>
        </Button>
      </Host>
      <Host matchContents>
        <Button onPress={() => handleOpenCategorySheet("snacks")}>
          <VStack modifiers={[clipShape("roundedRectangle", 16)]}>
            <HStack
              modifiers={[
                padding({
                  horizontal: Spacing.md,
                  vertical: Spacing.lg,
                }),
                createGlassModifier(true, theme),
              ]}
            >
              <UIText
                color={themeColors.secondaryText}
                weight="medium"
                size={FontSize.normal}
              >
                Snacks
              </UIText>
              <Spacer />
              <Image
                systemName="chevron.forward.circle.fill"
                color={themeColors.secondaryText}
                size={FontSize.medium}
              />
            </HStack>
          </VStack>
        </Button>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  savedEntriesCategoriesContainer: {
    flex: 1,
    flexDirection: "column",
    gap: Spacing.md,
    justifyContent: "center",
  },
});
