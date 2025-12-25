import { BorderRadius, FontSize, Spacing, useThemeColors } from "@/constants/theme";
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
import { StyleSheet, useColorScheme, View } from "react-native";

const CATEGORIES = ["drinks", "meals", "snacks"] as const;

type Category = (typeof CATEGORIES)[number];

interface CategorySelectorProps {
  onCategorySelect?: (category: Category) => void;
}

export function CategorySelector({ onCategorySelect }: CategorySelectorProps) {
  const rawTheme = useColorScheme();
  const theme = rawTheme === "dark" ? "dark" : "light";
  const themeColors = useThemeColors();

  const handleOpenCategorySheet = (category: Category) => {
    onCategorySelect?.(category);
    router.push({
      pathname: "/category",
      params: { category },
    });
  };

  const CategoryButton = ({ category }: { category: Category }) => {
    const label = category.charAt(0).toUpperCase() + category.slice(1);

    return (
      <Host matchContents>
        <Button onPress={() => handleOpenCategorySheet(category)}>
          <VStack modifiers={[clipShape("roundedRectangle", BorderRadius.lg)]}>
            <HStack
              modifiers={[
                padding({ horizontal: Spacing.md, vertical: Spacing.lg }),
                createGlassModifier(true, theme),
              ]}
            >
              <UIText
                color={themeColors.secondaryText}
                weight="medium"
                size={FontSize.normal}
              >
                {label}
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
    );
  };

  return (
    <View style={styles.container}>
      {CATEGORIES.map((category) => (
        <CategoryButton key={category} category={category} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    gap: Spacing.md,
    justifyContent: "center",
  },
});
