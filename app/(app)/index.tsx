import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { usePhotoTransform } from "../../hooks/usePhotoTransform";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
} from "../../constants/theme";
import CreditCounter from "../../components/shared/CreditCounter";
import AppButton from "../../components/shared/AppButton";
import LoadingOverlay from "../../components/shared/LoadingOverlay";
import ErrorModal from "../../components/modals/ErrorModal";
import BackgroundSelectionModal from "../../components/modals/BackgroundSelectionModal";

export default function MainScreen() {
  const { authState } = useAuth();
  const {
    isTransforming,
    currentImage,
    result,
    error,
    progress,
    hasCredits,
    takePhoto,
    pickPhoto,
    transformPhoto,
    clearError,
    reset,
  } = usePhotoTransform();

  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleImageSelection = () => {
    Alert.alert("Select Image", "Choose how you want to add your toy photo:", [
      { text: "Take Photo", onPress: handleTakePhoto },
      { text: "Choose from Gallery", onPress: handlePickGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleTakePhoto = async () => {
    const result = await takePhoto();
    if (!result.success && result.error) {
      setShowError(true);
    }
  };

  const handlePickGallery = async () => {
    const result = await pickPhoto();
    if (!result.success && result.error) {
      setShowError(true);
    }
  };

  const handleStartTransform = () => {
    if (!currentImage) {
      Alert.alert("No Photo", "Please select a photo first.");
      return;
    }
    if (!hasCredits) {
      router.push("/(app)/purchase");
      return;
    }
    setShowBackgroundModal(true);
  };

  const handleConfirmTransform = async (
    backgroundType: "cartoon" | "lego" | "photo",
    customPrompt?: string
  ) => {
    setShowBackgroundModal(false);

    const result = await transformPhoto(backgroundType, customPrompt);
    if (!result.success && result.error) {
      setShowError(true);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
    clearError();
  };

  const handleRetry = () => {
    setShowError(false);
    clearError();
    setShowBackgroundModal(true);
  };

  const handlePurchaseCredits = () => {
    setShowError(false);
    router.push("/(app)/purchase");
  };

  const handleNewPhoto = () => {
    reset();
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Transform Your Toy</Text>
            <CreditCounter
              onPurchasePress={() => router.push("/(app)/purchase")}
            />
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

          {/* Current Photo or Image Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {currentImage ? "Your Photo" : "1. Select Your Toy Photo"}
            </Text>

            {currentImage ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: currentImage }}
                  style={styles.selectedImage}
                />
                <View style={styles.imageOverlay}>
                  <AppButton
                    title="Change Photo"
                    onPress={handleImageSelection}
                    size="small"
                    variant="outline"
                    style={styles.changePhotoButton}
                  />
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.imageSelector}
                onPress={handleImageSelection}
              >
                <View style={styles.imagePlaceholder}>
                  <Ionicons
                    name="camera"
                    size={48}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.placeholderText}>Tap to add photo</Text>
                  <Text style={styles.placeholderSubtext}>
                    Camera or Photo Library
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Result Display */}
          {result && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✨ Transformed Photo</Text>
              <View style={styles.resultContainer}>
                {result.resultImageUrl ? (
                  <Image
                    source={{ uri: result.resultImageUrl }}
                    style={styles.resultImage}
                  />
                ) : (
                  <View style={styles.resultPlaceholder}>
                    <Text style={styles.resultStatus}>
                      {result.status === "processing"
                        ? "🔄 Processing..."
                        : result.status === "failed"
                        ? "❌ Failed"
                        : "✅ Completed"}
                    </Text>
                  </View>
                )}

                <View style={styles.resultActions}>
                  <AppButton
                    title="Start New Photo"
                    onPress={handleNewPhoto}
                    variant="outline"
                    size="small"
                  />
                  {result.resultImageUrl && (
                    <AppButton
                      title="Save to Gallery"
                      onPress={() =>
                        Alert.alert(
                          "Coming Soon",
                          "Save functionality will be added!"
                        )
                      }
                      variant="secondary"
                      size="small"
                    />
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Transform Button */}
          {currentImage && !result && (
            <View style={styles.section}>
              <AppButton
                title={
                  hasCredits
                    ? "Choose Background & Transform"
                    : "Buy Credits to Transform"
                }
                onPress={handleStartTransform}
                variant={hasCredits ? "primary" : "secondary"}
                size="large"
                style={styles.transformButton}
              />

              {hasCredits && (
                <Text style={styles.transformNote}>
                  💡 This will use 1 credit to transform your photo
                </Text>
              )}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push("/(app)/history")}
            >
              <Ionicons name="time" size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push("/(app)/profile")}
            >
              <Ionicons name="person" size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isTransforming}
        message="Transforming your photo with AI magic..."
        progress={progress || undefined}
      />

      {/* Background Selection Modal */}
      <BackgroundSelectionModal
        visible={showBackgroundModal}
        onClose={() => setShowBackgroundModal(false)}
        onConfirm={handleConfirmTransform}
        loading={isTransforming}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showError && !!error}
        title="Transformation Error"
        message={error || ""}
        onClose={handleCloseError}
        onRetry={error?.includes("transformation") ? handleRetry : undefined}
        onPurchaseCredits={
          error?.includes("credit") ? handlePurchaseCredits : undefined
        }
        showPurchaseOption={error?.includes("credit")}
      />
    </>
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
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
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
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  placeholderSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  imageContainer: {
    position: "relative",
    aspectRatio: 4 / 3,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
  },
  changePhotoButton: {
    backgroundColor: COLORS.background + "E6",
  },
  resultContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  resultImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    resizeMode: "cover",
  },
  resultPlaceholder: {
    aspectRatio: 4 / 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  resultStatus: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  resultActions: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  transformButton: {
    marginBottom: SPACING.sm,
  },
  transformNote: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  quickAction: {
    alignItems: "center",
    padding: SPACING.md,
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});
