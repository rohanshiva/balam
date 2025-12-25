/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { useColorScheme } from "react-native";

export const FontSize = {
  xsmall: 10,
  small: 12,
  medium: 16,
  normal: 18,
  big: 20,
  large: 24,
  xlarge: 32,
  xxlarge: 40,
  xxxlarge: 48,
};

// Design system - spacing scales
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Colors = {
  accent: {
    blue: "#38BEFF",
    pink: "#F168AC",
    orange: "#F28240",
    green: "#4AD089",
  },
  light: {
    text: "#40464C",
    secondaryText: "#9C9B9F",
    secondaryBackground: "#E7E7E7",
  },
  dark: {
    text: "#FDFDFF",
    secondaryText: "#98979D",
    secondaryBackground: "#161616",
  },
};

// 10 colors between #E7E7E7 (light secondaryBackground) and #38BEFF (accent.blue)
// Smooth gradient from light gray to blue
export const lightProteinGradient: string[] = [
  "transparent", // 0% - base (231, 231, 231)
  "#D4E0E8", // ~11% (212, 224, 232)
  "#C1D9E9", // ~22% (193, 217, 233)
  "#AED2EA", // ~33% (174, 210, 234)
  "#9BCBEB", // ~44% (155, 203, 235)
  "#88C4EC", // ~55% (136, 196, 236)
  "#75BDED", // ~66% (117, 189, 237)
  "#62B6EE", // ~77% (98, 182, 238)
  "#4FAFEF", // ~88% (79, 175, 239)
  "#38BEFF", // 100% - accent.blue (56, 190, 255)
];

// 10 colors between #4A494E (dark secondaryBackground) and #38BEFF (accent.blue)
// Smooth gradient from dark gray to blue
export const darkProteinGradient: string[] = [
  "transparent", // 0% - base (231, 231, 231)
  "#98979D", // ~11% (212, 224, 232)
  "#C1D9E9", // ~22% (193, 217, 233)
  "#AED2EA", // ~33% (174, 210, 234)
  "#9BCBEB", // ~44% (155, 203, 235)
  "#88C4EC", // ~55% (136, 196, 236)
  "#75BDED", // ~66% (117, 189, 237)
  "#62B6EE", // ~77% (98, 182, 238)
  "#4FAFEF", // ~88% (79, 175, 239)
  "#38BEFF", // 100% - accent.blue (56, 190, 255)
];

export function useColor(
  color: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const rawTheme = useColorScheme() as "light" | "dark";
  return Colors[rawTheme][color];
}

/**
 * Hook that returns theme-aware colors based on the current color scheme.
 * Returns colors from Colors.light or Colors.dark depending on the system theme.
 */
export function useThemeColors() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const streakGridColors =
    theme === "dark" ? darkProteinGradient : lightProteinGradient;

  return {
    text: Colors[theme].text,
    secondaryText: Colors[theme].secondaryText,
    secondaryBackground: Colors[theme].secondaryBackground,
    streakGridColors: streakGridColors,
    background: theme === "dark" ? "#000000" : "#FFFFFF",
  };
}
