import Text from "@/components/Text";
import {
  BorderRadius,
  Colors,
  FontSize,
  Spacing,
  useThemeColors,
} from "@/constants/theme";
import db from "@/db";
import { addFriendByProfileId } from "@/stores/friendships";
import { useProfile } from "@/stores/profile";
import { Button, Host, HStack, Image, Text as UIText } from "@expo/ui/swift-ui";
import { fixedSize } from "@expo/ui/swift-ui/modifiers";
import { CameraView, useCameraPermissions } from "expo-camera";
import { GlassView } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Share, StyleSheet, useColorScheme, View } from "react-native";
import QRCode from "react-native-qrcode-skia";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const CloseButton = () => {
  const themeColors = useThemeColors();
  return (
    <Host matchContents>
      <Button
        variant="bordered"
        controlSize="regular"
        role="cancel"
        color={themeColors.secondaryText}
        systemImage="xmark"
        onPress={() => router.dismissAll()}
      />
    </Host>
  );
};

interface ViewTypeToggleProps {
  viewType: string;
  onViewTypeChange: (type: string) => void;
}

const ViewTypeToggle = ({
  viewType,
  onViewTypeChange,
}: ViewTypeToggleProps) => {
  const themeColors = useThemeColors();
  return (
    <Host matchContents>
      <HStack spacing={Spacing.sm}>
        <Button
          variant={viewType === "qrcode" ? "glassProminent" : "borderless"}
          controlSize="large"
          systemImage="qrcode"
          color={
            viewType === "qrcode"
              ? Colors.accent.blue
              : themeColors.secondaryText
          }
          onPress={() => onViewTypeChange("qrcode")}
        />
        <Button
          variant={viewType === "scanner" ? "glassProminent" : "borderless"}
          controlSize="large"
          systemImage="camera.fill"
          color={
            viewType === "scanner"
              ? Colors.accent.blue
              : themeColors.secondaryText
          }
          onPress={() => onViewTypeChange("scanner")}
        />
      </HStack>
    </Host>
  );
};

interface QRCodeDisplayProps {
  profileId: string;
}

const QRCodeDisplay = ({ profileId }: QRCodeDisplayProps) => {
  const theme = useColorScheme() as "dark" | "light";
  const themeColors = useThemeColors();
  // Deep link uses profileId directly (no $users traversal needed)
  const shareableLink = `balam://?profileId=${profileId}`;

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({
      message: `Add me on Protein Tracker! ${shareableLink}`,
      url: shareableLink,
    });
  };

  return (
    <View style={styles.qrContainer}>
      <GlassView
        style={{
          padding: Spacing.lg,
          borderRadius: BorderRadius.xl,
        }}
        glassEffectStyle="clear"
        tintColor={theme === "dark" ? "transparent" : "white"}
        isInteractive={true}
      >
        <QRCode
          value={shareableLink}
          size={250}
          color={themeColors.secondaryText}
          shapeOptions={{
            shape: "rounded",
            eyePatternShape: "rounded",
            eyePatternGap: 0,
            gap: 1,
          }}
        />
      </GlassView>
      <Host matchContents>
        <Button
          variant="glassProminent"
          color={Colors.accent.blue}
          controlSize="large"
          onPress={handleShare}
          modifiers={[fixedSize({ horizontal: true })]}
        >
          <UIText weight="semibold" size={FontSize.medium}>
            Share Link
          </UIText>
        </Button>
      </Host>
      <Text style={[styles.infoText, { color: themeColors.secondaryText }]}>
        Your QR code is private. If you share it with someone, they can scan it
        with their camera to add you as a friend
      </Text>
    </View>
  );
};

/**
 * Parse profile ID from QR code data.
 * Supports new format (balam://?profileId=xxx)
 */
const parseProfileIdFromQR = (data: string): string | null => {
  // New format: balam://?profileId=xxx
  if (data.startsWith("balam://?profileId=")) {
    return data.replace("balam://?profileId=", "");
  }
  return null;
};

interface QRScannerProps {
  currentProfileId: string;
}

const QRScanner = ({ currentProfileId }: QRScannerProps) => {
  const theme = useColorScheme() as "dark" | "light";
  const themeColors = useThemeColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const isProcessingRef = useRef(false);

  if (!permission?.granted) {
    if (permission !== null) {
      Alert.alert(
        "Camera Access Needed",
        "Camera access is needed to scan QR codes.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => router.back(),
          },
          {
            text: "Allow",
            onPress: async () => {
              const result = await requestPermission();
              if (!result.granted) {
                router.back();
              }
            },
          },
        ]
      );
    }

    return (
      <View style={styles.qrContainer}>
        <GlassView
          style={styles.cameraPlaceholder}
          glassEffectStyle="regular"
          tintColor={theme === "dark" ? "transparent" : "white"}
          isInteractive={true}
        >
          <Host matchContents>
            <Image
              systemName="qrcode"
              size={64}
              color={themeColors.secondaryText}
            />
          </Host>
        </GlassView>
        <Text style={[styles.infoText, { color: themeColors.secondaryText }]}>
          Scan a QR code to add a friend
        </Text>
      </View>
    );
  }

  const handleAddFriend = async (friendProfileId: string) => {
    if (isAdding) return;

    if (friendProfileId === currentProfileId) {
      Alert.alert("Oops!", "You can't add yourself as a friend.");
      isProcessingRef.current = false;
      setScanned(false);
      return;
    }

    setIsAdding(true);
    try {
      // Fetch friend's nickname first for friendly messages
      const friendData = await db.queryOnce({
        profiles: { $: { where: { id: friendProfileId } } },
      });
      const friendNickname =
        friendData.data.profiles?.[0]?.nickname || "your friend";

      const result = await addFriendByProfileId(currentProfileId, friendProfileId);

      if (result.alreadyFriends) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        );
        Alert.alert(
          "Already Friends!",
          `You and ${friendNickname} are already friends.`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        Alert.alert(
          "Friend Added!",
          `You and ${friendNickname} are now friends!`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Sorry, something went wrong. Please try again.";
      Alert.alert("Oops!", errorMessage);
      isProcessingRef.current = false;
      setScanned(false);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (isProcessingRef.current || scanned || isAdding) {
      return;
    }

    isProcessingRef.current = true;
    setScanned(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const friendProfileId = parseProfileIdFromQR(data);

    if (friendProfileId) {
      Alert.alert(
        "Add Friend?",
        "Would you like to add this person as a friend?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              isProcessingRef.current = false;
              setScanned(false);
            },
          },
          {
            text: "Add",
            onPress: () => handleAddFriend(friendProfileId),
          },
        ]
      );
    } else {
      Alert.alert("Invalid QR Code", "This QR code isn't a valid friend code.");
      isProcessingRef.current = false;
      setScanned(false);
    }
  };

  return (
    <View style={styles.qrContainer}>
      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.scannerOverlay}>
          <View
            style={[
              styles.scannerCorner,
              styles.topLeft,
              { borderColor: Colors.accent.blue },
            ]}
          />
          <View
            style={[
              styles.scannerCorner,
              styles.topRight,
              { borderColor: Colors.accent.blue },
            ]}
          />
          <View
            style={[
              styles.scannerCorner,
              styles.bottomLeft,
              { borderColor: Colors.accent.blue },
            ]}
          />
          <View
            style={[
              styles.scannerCorner,
              styles.bottomRight,
              { borderColor: Colors.accent.blue },
            ]}
          />
        </View>
      </View>
      <Text style={[styles.infoText, { color: themeColors.secondaryText }]}>
        Scan a QR code to add a friend
      </Text>
    </View>
  );
};

export default function AddFriend() {
  const [viewType, setViewType] = useState("qrcode");
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const { profileId } = useProfile();

  const measureViewHeight = (height: number) => {
    setContainerHeight((prev) =>
      prev === null ? height : Math.max(prev, height)
    );
  };

  if (!profileId) {
    return null; // Profile not loaded yet
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CloseButton />
      </View>

      <View style={styles.contentContainer}>
        {viewType === "qrcode" && (
          <Animated.View
            style={[
              styles.animatedViewContainer,
              containerHeight ? { height: containerHeight } : undefined,
            ]}
            entering={FadeIn.duration(600)}
            exiting={FadeOut.duration(600)}
            onLayout={(event) =>
              measureViewHeight(event.nativeEvent.layout.height)
            }
          >
            <QRCodeDisplay profileId={profileId} />
          </Animated.View>
        )}

        {viewType === "scanner" && (
          <Animated.View
            style={[
              styles.animatedViewContainer,
              containerHeight ? { height: containerHeight } : undefined,
            ]}
            entering={FadeIn.duration(600)}
            exiting={FadeOut.duration(600)}
            onLayout={(event) =>
              measureViewHeight(event.nativeEvent.layout.height)
            }
          >
            <QRScanner currentProfileId={profileId} />
          </Animated.View>
        )}
      </View>

      <View style={styles.toggleContainer}>
        <ViewTypeToggle viewType={viewType} onViewTypeChange={setViewType} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
  },
  animatedViewContainer: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
  },
  qrContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.lg,
  },
  infoText: {
    fontSize: FontSize.small,
    textAlign: "center",
    paddingHorizontal: Spacing.md,
  },
  cameraWrapper: {
    width: 350,
    height: 350,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    width: 350,
    height: 350,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerCorner: {
    position: "absolute",
    width: 60,
    height: 60,
    borderWidth: 4,
  },
  topLeft: {
    top: 20,
    left: 20,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: BorderRadius.lg,
  },
  topRight: {
    top: 20,
    right: 20,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: BorderRadius.lg,
  },
  bottomLeft: {
    bottom: 20,
    left: 20,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  bottomRight: {
    bottom: 20,
    right: 20,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: BorderRadius.lg,
  },
});
