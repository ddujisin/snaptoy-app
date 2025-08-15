import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useCredits } from "../../context/CreditContext";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
} from "../../constants/theme";

interface CreditCounterProps {
  onPurchasePress?: () => void;
  showPurchaseButton?: boolean;
}

export default function CreditCounter({
  onPurchasePress,
  showPurchaseButton = true,
}: CreditCounterProps) {
  const { creditState } = useCredits();
  const { photoCredits, subscriptionTier } = creditState;

  const getTierDisplay = () => {
    switch (subscriptionTier) {
      case "standard":
        return "Standard";
      case "pro":
        return "Pro";
      default:
        return "Free";
    }
  };

  const getTierColor = () => {
    switch (subscriptionTier) {
      case "standard":
        return COLORS.secondary;
      case "pro":
        return COLORS.primary;
      default:
        return COLORS.textSecondary;
    }
  };

  const isLowCredits = photoCredits <= 2;

  return (
    <View style={styles.container}>
      <View style={styles.creditInfo}>
        <View style={styles.creditRow}>
          <Text style={styles.creditEmoji}>📸</Text>
          <Text style={[styles.creditCount, isLowCredits && styles.lowCredits]}>
            {photoCredits}
          </Text>
          <Text style={styles.creditLabel}>
            {photoCredits === 1 ? "credit" : "credits"}
          </Text>
        </View>

        <View style={styles.tierRow}>
          <View style={[styles.tierBadge, { backgroundColor: getTierColor() }]}>
            <Text style={styles.tierText}>{getTierDisplay()}</Text>
          </View>
        </View>
      </View>

      {showPurchaseButton && (
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            isLowCredits && styles.purchaseButtonHighlight,
          ]}
          onPress={onPurchasePress}
          activeOpacity={0.8}
        >
          <Text style={styles.purchaseButtonText}>+</Text>
        </TouchableOpacity>
      )}

      {isLowCredits && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>⚠️ Running low on credits</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  creditInfo: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 120,
  },
  creditRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  creditEmoji: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginRight: SPACING.xs,
  },
  creditCount: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  lowCredits: {
    color: COLORS.error,
  },
  creditLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  tierRow: {
    marginTop: SPACING.xs,
  },
  tierBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  tierText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.background,
    textTransform: "uppercase",
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.sm,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  purchaseButtonHighlight: {
    backgroundColor: COLORS.secondary,
    transform: [{ scale: 1.1 }],
  },
  purchaseButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.background,
  },
  warningContainer: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.warning + "20",
    borderRadius: BORDER_RADIUS.sm,
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.warning,
    textAlign: "center",
  },
});
