import Text from "@/components/Text";
import { Colors, FontSize, Spacing, useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const NUMPAD_LAYOUT = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "delete"],
];

const ACCENT_COLORS = [
  Colors.accent.blue,
  Colors.accent.green,
  Colors.accent.pink,
  Colors.accent.orange,
];

interface TapAnimationProps {
  id: string;
  x: number;
  y: number;
  number: string;
  onComplete: (id: string) => void;
}

function TapAnimation({ id, x, y, number, onComplete }: TapAnimationProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.5);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  React.useEffect(() => {
    translateY.value = 0;
    translateX.value = 0;
    opacity.value = 1;
    scale.value = 0.5;

    scale.value = withTiming(1, { duration: 300 });

    translateY.value = withSequence(
      withTiming(-60, { duration: 600 }),
      withTiming(-100, { duration: 500 }),
      withTiming(-130, { duration: 500 })
    );

    translateX.value = withSequence(
      withTiming(-8, { duration: 300 }),
      withTiming(12, { duration: 300 }),
      withTiming(-6, { duration: 300 }),
      withTiming(8, { duration: 300 }),
      withTiming(-4, { duration: 300 })
    );

    opacity.value = withTiming(0, { duration: 500 });

    const timer = setTimeout(() => {
      onComplete(id);
    }, 2500);

    return () => clearTimeout(timer);
  }, [id, onComplete]);

  const randomColor =
    ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];

  return (
    <Animated.View
      style={[
        styles.tapAnimation,
        animatedStyle,
        {
          backgroundColor: randomColor,
          left: x - FontSize.medium / 2,
          top: y - FontSize.medium / 2,
        },
      ]}
    >
      <Text style={styles.tapAnimationText}>{number}</Text>
    </Animated.View>
  );
}

interface AnimatedValueProps {
  value: string;
}

export function AnimatedValue({ value }: AnimatedValueProps) {
  const themeColors = useThemeColors();
  const displayValue = value === "0" ? "0" : value;
  const digits = displayValue.split("");

  return (
    <View style={styles.animatedValueContainer}>
      {digits.map((digit, index) => (
        <Animated.Text
          key={`${digit}-${index}`}
          entering={FadeInDown.duration(200)}
          exiting={FadeOutUp.duration(200)}
          layout={LinearTransition.duration(200)}
          style={[styles.numpadValueText, { color: themeColors.secondaryText }]}
        >
          {digit}
        </Animated.Text>
      ))}
    </View>
  );
}

interface NumpadButtonProps {
  label: string;
  onPress: (input: string) => void;
  onTapAnimation: (x: number, y: number, number: string) => void;
}

function NumpadButton({ label, onPress, onTapAnimation }: NumpadButtonProps) {
  const themeColors = useThemeColors();
  const isDelete = label === "delete";
  const buttonRef = React.useRef<View>(null);

  const handlePress = () => {
    if (!isDelete && buttonRef.current) {
      buttonRef.current.measureInWindow((pageX, pageY, width, height) => {
        const centerX = pageX + width / 2;
        const centerY = pageY + height / 2;
        onTapAnimation(centerX, centerY, label);
      });
    }
    onPress(label);
  };

  return (
    <TouchableOpacity
      ref={buttonRef}
      style={styles.numpadButton}
      onPress={handlePress}
    >
      {!isDelete ? (
        <Text style={[styles.numpadButtonText, { color: themeColors.text }]}>{label}</Text>
      ) : (
        <Ionicons
          name="chevron-back"
          size={FontSize.large}
          color={themeColors.text}
        />
      )}
    </TouchableOpacity>
  );
}

interface NumpadProps {
  onInput: (input: string) => void;
  onTapAnimation: (x: number, y: number, number: string) => void;
}

function Numpad({ onInput, onTapAnimation }: NumpadProps) {
  return (
    <View style={styles.numpadContainer}>
      {NUMPAD_LAYOUT.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.numpadRow}>
          {row.map((button) => (
            <View key={button} style={styles.numpadButtonWrapper}>
              <NumpadButton
                label={button}
                onPress={onInput}
                onTapAnimation={onTapAnimation}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

interface NumpadWithAnimationsProps {
  value: string;
  setProtein: (value: string) => void;
}

export function NumpadWithAnimations({ value, setProtein }: NumpadWithAnimationsProps) {
  const [animations, setAnimations] = useState<
    Array<{
      id: string;
      x: number;
      y: number;
      number: string;
    }>
  >([]);
  const containerRef = React.useRef<View>(null);
  const [containerLayout, setContainerLayout] = React.useState({ x: 0, y: 0 });

  const handleInput = (input: string) => {
    if (input === "delete") {
      setProtein(value.length === 1 ? "0" : value.slice(0, -1));
      return;
    }

    if (input === ".") {
      setProtein(value.includes(".") ? value : value + ".");
      return;
    }

    setProtein(value === "0" ? input : value + input);
  };

  const handleTapAnimation = (x: number, y: number, number: string) => {
    const relativeX = x - containerLayout.x;
    const relativeY = y - containerLayout.y;
    const id = `${Date.now()}-${Math.random()}`;
    setAnimations((prev) => [...prev, { id, x: relativeX, y: relativeY, number }]);
  };

  const handleAnimationComplete = (id: string) => {
    setAnimations((prev) => prev.filter((anim) => anim.id !== id));
  };

  const handleLayout = (_event: LayoutChangeEvent) => {
    containerRef.current?.measureInWindow((pageX, pageY) => {
      setContainerLayout({ x: pageX, y: pageY });
    });
  };

  return (
    <View 
      ref={containerRef}
      style={styles.container}
      onLayout={handleLayout}
    >
      {animations.map((animation) => (
        <TapAnimation
          key={animation.id}
          id={animation.id}
          x={animation.x}
          y={animation.y}
          number={animation.number}
          onComplete={handleAnimationComplete}
        />
      ))}
      <Numpad onInput={handleInput} onTapAnimation={handleTapAnimation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedValueContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  numpadValueText: {
    fontWeight: "bold",
    fontSize: FontSize.large,
  },
  numpadContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  numpadRow: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "center",
  },
  numpadButtonWrapper: {
    flex: 1,
  },
  numpadButton: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
  },
  numpadButtonText: {
    fontWeight: "medium",
    fontSize: FontSize.large,
  },
  tapAnimation: {
    position: "absolute",
    width: FontSize.medium,
    height: FontSize.medium,
    borderRadius: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  tapAnimationText: {
    color: "white",
    fontSize: FontSize.small,
  },
});
