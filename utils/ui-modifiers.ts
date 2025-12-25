/**
 * Shared UI modifier utilities for consistent styling across the app.
 * These follow the @expo/ui/swift-ui modifier patterns.
 */

import { BorderRadius, Spacing } from "@/constants/theme";
import {
  clipShape,
  glassEffect,
  padding,
} from "@expo/ui/swift-ui/modifiers";

/**
 * Theme type used throughout the app
 */
export type Theme = "light" | "dark";

/**
 * Creates a glass effect modifier with consistent styling.
 * @param interactive - Whether the element should be interactive (default: true)
 * @param theme - Current color scheme ("light" | "dark") or custom tint color
 * @param variant - Glass variant (default: "regular")
 */
export const createGlassModifier = (
  interactive: boolean = true,
  theme: Theme | string | null | undefined = "light",
  variant: "regular" | "clear" = "regular"
) => {
  const tint =
    typeof theme === "string" && theme !== "light" && theme !== "dark"
      ? theme
      : theme === "dark"
        ? "transparent"
        : "white";

  return glassEffect({
    glass: {
      variant,
      interactive,
      tint,
    },
    shape: "rectangle",
  });
};

/**
 * Common padding modifier for interactive elements
 */
export const interactivePadding = padding({
  horizontal: Spacing.md,
  vertical: Spacing.md,
});

/**
 * Common padding modifier for compact elements
 */
export const compactPadding = padding({
  horizontal: Spacing.sm,
  vertical: Spacing.xs,
});

/**
 * Common clip shape modifier for rounded rectangles
 */
export const roundedClipShape = clipShape("roundedRectangle", BorderRadius.lg);

/**
 * Common clip shape modifier for extra large rounded rectangles
 */
export const roundedXlClipShape = clipShape("roundedRectangle", BorderRadius.xl);

/**
 * Common clip shape modifier for extra extra large rounded rectangles
 */
export const roundedXxlClipShape = clipShape(
  "roundedRectangle",
  BorderRadius.xxl
);

/**
 * GlassView tint color helper
 */
export const getGlassTintColor = (
  theme: Theme | null | undefined
): string => {
  return theme === "dark" ? "transparent" : "white";
};
