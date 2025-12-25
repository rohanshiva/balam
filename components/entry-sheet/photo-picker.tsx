import { BorderRadius, Colors, useThemeColors } from "@/constants/theme";
import {
  Button,
  ContextMenu,
  Host,
} from "@expo/ui/swift-ui";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
} from "react-native-reanimated";

interface PhotoPickerProps {
  photoUri: string | null;
  onPhotoChange: (uri: string | null) => void;
}

export function PhotoPicker({ photoUri, onPhotoChange }: PhotoPickerProps) {
  const themeColors = useThemeColors();

  const handlePickImageFromLibrary = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Photo Access Needed",
        "Photo access is needed to add images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onPhotoChange(result.assets[0].uri);
    }
  };

  const handleTakePhotoWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Camera Access Needed",
        "Camera access is needed to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      onPhotoChange(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoChange(null);
  };

  if (!photoUri) {
    return (
      <Host matchContents>
        <ContextMenu>
          <ContextMenu.Trigger>
            <Button
              variant="bordered"
              color={themeColors.secondaryText}
              systemImage="photo.fill"
              controlSize="large"
            />
          </ContextMenu.Trigger>
          <ContextMenu.Items>
            <Button
              color={Colors.accent.green}
              systemImage="photo.fill"
              onPress={handlePickImageFromLibrary}
            >
              Photo
            </Button>
            <Button
              color={Colors.accent.pink}
              systemImage="camera.fill"
              onPress={handleTakePhotoWithCamera}
            >
              Camera
            </Button>
          </ContextMenu.Items>
        </ContextMenu>
      </Host>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={styles.animatedContainer}
    >
      <Host matchContents>
        <ContextMenu>
          <ContextMenu.Trigger>
            <View style={styles.imageContainer}>
              <ExpoImage
                source={{ uri: photoUri }}
                style={styles.image}
                contentFit="cover"
              />
            </View>
          </ContextMenu.Trigger>
          <ContextMenu.Items>
            <Button
              role="default"
              color={Colors.accent.green}
              systemImage="photo.fill"
              onPress={handlePickImageFromLibrary}
            >
              Change Photo
            </Button>
            <Button
              role="default"
              color={Colors.accent.pink}
              systemImage="camera.fill"
              onPress={handleTakePhotoWithCamera}
            >
              Take Photo
            </Button>
            <Button
              role="destructive"
              systemImage="trash.fill"
              onPress={handleRemovePhoto}
            >
              Remove Photo
            </Button>
          </ContextMenu.Items>
        </ContextMenu>
      </Host>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    width: 64,
    height: 64,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  image: {
    width: 64,
    height: 64,
  },
});

