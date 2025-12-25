import Friends from "@/components/friends";
import { Spacing } from "@/constants/theme";
import { ScrollView, StyleSheet, View } from "react-native";


export default function Leaderboard() {
  return (
    <ScrollView
      style={styles.scrollContainer}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <View style={styles.friendsContainer}>
        <Friends limit={false} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  friendsContainer: {
    marginBottom: Spacing.lg,
  },
});
