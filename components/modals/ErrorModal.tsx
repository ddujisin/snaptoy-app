import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
} from "../../constants/theme";
import AppButton from "../shared/AppButton";

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  onRetry?: () => void;
  onPurchaseCredits?: () => void;
  showPurchaseOption?: boolean;
}

export default function ErrorModal({
  visible,
  title = "Oops!",
  message,
  onClose,
  onRetry,
  onPurchaseCredits,
  showPurchaseOption = false,
}: ErrorModalProps) {
  const isInsufficientCredits = message
    .toLowerCase()
    .includes("insufficient credits");
  const isNetworkError = message.toLowerCase().includes("network");
  const isTransformationError = message
    .toLowerCase()
    .includes("transformation");

  const getErrorIcon = () => {
    if (isInsufficientCredits) return "💳";
    if (isNetworkError) return "📡";
    if (isTransformationError) return "🎨";
    return "❌";
  };

  const getSuggestion = () => {
    if (isInsufficientCredits) {
      return "Purchase more credits to continue transforming your photos.";
    }
    if (isNetworkError) {
      return "Check your internet connection and try again.";
    }
    if (isTransformationError) {
      return "Try a different photo or background style.";
    }
    return "Please try again or contact support if the problem persists.";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.icon}>{getErrorIcon()}</Text>
            <Text style={styles.title}>{title}</Text>
          </View>

          <Text style={styles.message}>{message}</Text>

          <Text style={styles.suggestion}>{getSuggestion()}</Text>

          <View style={styles.buttonContainer}>
            {(isInsufficientCredits || showPurchaseOption) &&
              onPurchaseCredits && (
                <AppButton
                  title="Buy Credits"
                  onPress={onPurchaseCredits}
                  variant="primary"
                  style={styles.button}
                />
              )}

            {onRetry && !isInsufficientCredits && (
              <AppButton
                title="Try Again"
                onPress={onRetry}
                variant="secondary"
                style={styles.button}
              />
            )}

            <AppButton
              title="Close"
              onPress={onClose}
              variant="outline"
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  container: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    maxWidth: 340,
    width: "100%",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  icon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    textAlign: "center",
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  suggestion: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  buttonContainer: {
    width: "100%",
    gap: SPACING.md,
  },
  button: {
    width: "100%",
  },
});
