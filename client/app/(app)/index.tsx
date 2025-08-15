import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
} from "../../constants/theme";

export default function MainScreen() {
  const { authState } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<string | null>(null);

  const handleImageSelection = () => {
    Alert.alert("Select Image", "Choose how you want to add your toy photo:", [
      { text: "Take Photo", onPress: () => handleTakePhoto() },
      { text: "Choose from Gallery", onPress: () => handlePickImage() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleTakePhoto = async () => {
    Alert.alert(
      "Coming Soon",
      "Camera functionality will be implemented next!"
    );
  };

  const handlePickImage = async () => {
    Alert.alert(
      "Coming Soon",
      "Image picker functionality will be implemented next!"
    );
  };

  const handleTransform = async () => {
    Alert.alert(
      "Transform Photo",
      "AI transformation will be implemented next!"
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Transform Your Toy</Text>
          <View style={styles.creditBadge}>
            <Ionicons name="star" size={16} color={COLORS.secondary} />
            <Text style={styles.creditText}>10 credits</Text>
          </View>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>
            Welcome, {authState.user?.firstName || "there"}! 👋
          </Text>
          <Text style={styles.welcomeText}>
            Take or upload a photo of your toy and watch it come to life in
            amazing new backgrounds!
          </Text>
        </View>

        {/* Image Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select Your Toy Photo</Text>
          <TouchableOpacity
            style={styles.imageSelector}
            onPress={handleImageSelection}
          >
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={48} color={COLORS.textSecondary} />
              <Text style={styles.placeholderText}>Tap to add photo</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Background Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Choose Background Style</Text>
          <View style={styles.backgroundOptions}>
            <TouchableOpacity
              style={[
                styles.backgroundOption,
                backgroundType === "cartoon" && styles.selectedOption,
              ]}
              onPress={() => setBackgroundType("cartoon")}
            >
              <Text style={styles.backgroundEmoji}>🎨</Text>
              <Text style={styles.backgroundLabel}>Cartoon</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.backgroundOption,
                backgroundType === "lego" && styles.selectedOption,
              ]}
              onPress={() => setBackgroundType("lego")}
            >
              <Text style={styles.backgroundEmoji}>🧱</Text>
              <Text style={styles.backgroundLabel}>LEGO</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.backgroundOption,
                backgroundType === "photo" && styles.selectedOption,
              ]}
              onPress={() => setBackgroundType("photo")}
            >
              <Text style={styles.backgroundEmoji}>📷</Text>
              <Text style={styles.backgroundLabel}>Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transform Button */}
        <TouchableOpacity
          style={[
            styles.transformButton,
            (!selectedImage || !backgroundType) && styles.disabledButton,
          ]}
          onPress={handleTransform}
          disabled={!selectedImage || !backgroundType}
        >
          <Text style={styles.transformButtonText}>
            Transform Photo (1 credit)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  creditBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  creditText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
  },
  welcomeCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  welcomeTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  imageSelector: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    aspectRatio: 4 / 3,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.sm,
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  backgroundOptions: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  backgroundOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    borderColor: COLORS.primary,
  },
  backgroundEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  backgroundLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
  },
  transformButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
  transformButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.background,
  },
});
