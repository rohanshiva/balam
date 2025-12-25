import { Text as RNText, TextProps, StyleSheet } from "react-native";

export default function Text({ style, ...props }: TextProps) {
  return <RNText style={[styles.text, style]} {...props} />;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "ui-rounded",
  },
});

