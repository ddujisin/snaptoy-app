import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, Modal } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "../../constants/theme";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: string;
}

export default function LoadingOverlay({
  visible,
  message = "Processing your photo with AI magic...",
  progress,
}: LoadingOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>

          <Text style={styles.message}>{message}</Text>

          {progress && <Text style={styles.progress}>{progress}</Text>}

          <Text style={styles.timeInfo}>This may take up to 30 seconds</Text>

          <View style={styles.tip}>
            <Text style={styles.tipEmoji}>✨</Text>
            <Text style={styles.tipText}>
              Our AI is carefully crafting the perfect background for your toy!
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: SPACING.xxl,
    alignItems: "center",
    maxWidth: 320,
    width: "100%",
  },
  spinnerContainer: {
    marginBottom: SPACING.lg,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  progress: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  timeInfo: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  tip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    maxWidth: 280,
  },
  tipEmoji: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginRight: SPACING.sm,
  },
  tipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
