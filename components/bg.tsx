import { Colors } from "@/constants/theme";
import { Circle, Host, ZStack } from "@expo/ui/swift-ui";
import {
  foregroundStyle,
  frame,
  offset,
  opacity,
  blur,
} from "@expo/ui/swift-ui/modifiers";
import React from "react";
import { View, StyleSheet } from "react-native";

const generateCircles = () => {
  const circles = [];
  const numCircles = Math.floor(Math.random() * 10) + 4;

  for (let i = 0; i < numCircles; i++) {
    const color = Object.values(Colors.accent)[
      Math.floor(Math.random() * Object.values(Colors.accent).length)
    ];
    const size = Math.random() * 300 + 150;
    const x = Math.random() * 800 - 400;
    const y = Math.random() * 1400 - 400;
    const opacity = Math.random() * 0.25 + 0.1;
    const blur = Math.random() * 50 + 60;

    circles.push({
      id: i,
      color,
      size,
      x,
      y,
      opacity: opacity,
      blur: blur,
    });
  }
  return circles;
};

function GradientBackground() {
  const circles = React.useMemo(() => generateCircles(), []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Host matchContents>
        <ZStack
          modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity })]}
        >
          {circles.map((circle) => (
            <Circle
              key={circle.id}
              modifiers={[
                frame({ width: circle.size, height: circle.size }),
                foregroundStyle(circle.color),
                offset({ x: circle.x, y: circle.y }),
                opacity(circle.opacity),
                blur(circle.blur),
              ]}
            />
          ))}
        </ZStack>
      </Host>
    </View>
  );
}

export default function BG({ gradient = true }) {
  return <GradientBackground />;
}
