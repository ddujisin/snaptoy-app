import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCredits } from "../../hooks/useCredits";
import { CreditPurchaseResponse } from "../../types/api";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
} from "../../constants/theme";
import { CREDIT_PACKAGES } from "../../constants/api";
import AppButton from "../../components/shared/AppButton";
import CreditCounter from "../../components/shared/CreditCounter";
import LoadingOverlay from "../../components/shared/LoadingOverlay";
import ErrorModal from "../../components/modals/ErrorModal";

interface PackageCardProps {
  packageKey: keyof typeof CREDIT_PACKAGES;
  packageInfo: (typeof CREDIT_PACKAGES)[keyof typeof CREDIT_PACKAGES];
  onPurchase: (packageKey: keyof typeof CREDIT_PACKAGES) => void;
  loading: boolean;
}

function PackageCard({
  packageKey,
  packageInfo,
  onPurchase,
  loading,
}: PackageCardProps) {
  const isPopular = packageInfo.value === "popular";
  const isBestValue = packageInfo.value === "best";

  return (
    <TouchableOpacity
      style={[
        styles.packageCard,
        isPopular && styles.popularCard,
        isBestValue && styles.bestValueCard,
      ]}
      onPress={() => onPurchase(packageKey)}
      disabled={loading}
      activeOpacity={0.8}
    >
      {isPopular && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>POPULAR</Text>
        </View>
      )}
      {isBestValue && (
        <View style={[styles.badge, styles.bestValueBadge]}>
          <Text style={styles.badgeText}>BEST VALUE</Text>
        </View>
      )}

      <View style={styles.packageHeader}>
        <Text style={styles.packageName}>{packageInfo.name}</Text>
        <Text style={styles.packagePrice}>{packageInfo.priceString}</Text>
      </View>

      <Text style={styles.packageDescription}>{packageInfo.description}</Text>

      <View style={styles.creditsContainer}>
        <Text style={styles.creditsAmount}>{packageInfo.credits}</Text>
        <Text style={styles.creditsLabel}>credits</Text>
      </View>

      {packageInfo.savings && (
        <Text style={styles.savings}>💰 {packageInfo.savings}</Text>
      )}

      <View style={styles.features}>
        <View style={styles.feature}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.featureText}>
            Transform {packageInfo.credits} photos
          </Text>
        </View>
        <View style={styles.feature}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.featureText}>All background types</Text>
        </View>
        <View style={styles.feature}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.featureText}>Custom prompts</Text>
        </View>
      </View>

      <AppButton
        title={`Buy ${packageInfo.name}`}
        onPress={() => onPurchase(packageKey)}
        variant={isBestValue ? "primary" : isPopular ? "secondary" : "outline"}
        loading={loading}
        style={styles.purchaseButton}
      />
    </TouchableOpacity>
  );
}

export default function PurchaseScreen() {
  const { creditState, purchaseCredits, refreshBalance, getPurchaseHistory } =
    useCredits();

  const [showError, setShowError] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const loadPurchaseHistory = async () => {
      try {
        await getPurchaseHistory();
        setLoadingHistory(false);
      } catch (error) {
        console.error("Failed to load purchase history:", error);
        setLoadingHistory(false);
      }
    };

    loadPurchaseHistory();
  }, []);

  const handlePurchase = async (packageKey: keyof typeof CREDIT_PACKAGES) => {
    try {
      // In a real app, you'd get the package ID from your backend packages API
      // For now, we'll use a mock package ID
      const mockPackageId =
        packageKey === "basic" ? 1 : packageKey === "value" ? 2 : 3;
      const productId = `snaptoy_credits_${packageKey}`;

      await purchaseCredits(mockPackageId.toString());

      Alert.alert(
        "Purchase Successful! 🎉",
        `You've received ${CREDIT_PACKAGES[packageKey].credits} credits!`,
        [{ text: "Great!", onPress: () => router.back() }]
      );
    } catch (error: any) {
      setShowError(true);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const renderPurchaseHistory = () => {
    if (loadingHistory) {
      return (
        <View style={styles.historyLoading}>
          <Text style={styles.historyLoadingText}>
            Loading purchase history...
          </Text>
        </View>
      );
    }

    if (creditState.purchaseHistory.length === 0) {
      return (
        <View style={styles.noHistory}>
          <Text style={styles.noHistoryText}>No purchases yet</Text>
          <Text style={styles.noHistorySubtext}>
            Purchase credits to start transforming your photos!
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.historyList}>
        {creditState.purchaseHistory
          .slice(0, 3)
          .map((purchase: CreditPurchaseResponse, index: number) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyDetails}>
                <Text style={styles.historyAmount}>
                  +{purchase.creditsAdded} credits
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.historyPrice}>
                ${purchase.amount.toFixed(2)}
              </Text>
            </View>
          ))}
      </View>
    );
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Buy Credits</Text>
            <View style={styles.headerRight}>
              <CreditCounter showPurchaseButton={false} />
            </View>
          </View>

          {/* Introduction */}
          <View style={styles.intro}>
            <Text style={styles.introTitle}>Transform More Photos! ✨</Text>
            <Text style={styles.introText}>
              Each photo transformation uses 1 credit. Choose the package that's
              right for you.
            </Text>
          </View>

          {/* Credit Packages */}
          <View style={styles.packagesContainer}>
            <Text style={styles.sectionTitle}>Credit Packages</Text>
            <View style={styles.packages}>
              {Object.entries(CREDIT_PACKAGES).map(([key, packageInfo]) => (
                <PackageCard
                  key={key}
                  packageKey={key as keyof typeof CREDIT_PACKAGES}
                  packageInfo={packageInfo}
                  onPurchase={handlePurchase}
                  loading={creditState.isLoading}
                />
              ))}
            </View>
          </View>

          {/* Purchase History */}
          <View style={styles.historyContainer}>
            <Text style={styles.sectionTitle}>Recent Purchases</Text>
            {renderPurchaseHistory()}
          </View>

          {/* Benefits */}
          <View style={styles.benefits}>
            <Text style={styles.sectionTitle}>What You Get</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefit}>
                <Ionicons name="sparkles" size={24} color={COLORS.primary} />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>AI-Powered Magic</Text>
                  <Text style={styles.benefitText}>
                    Transform your toys into cartoon, LEGO, or photo backgrounds
                  </Text>
                </View>
              </View>
              <View style={styles.benefit}>
                <Ionicons name="create" size={24} color={COLORS.primary} />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Custom Backgrounds</Text>
                  <Text style={styles.benefitText}>
                    Describe your perfect scene with custom prompts
                  </Text>
                </View>
              </View>
              <View style={styles.benefit}>
                <Ionicons name="time" size={24} color={COLORS.primary} />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Quick Results</Text>
                  <Text style={styles.benefitText}>
                    Get your transformed photos in under 30 seconds
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Restore Purchases */}
          <View style={styles.restore}>
            <AppButton
              title="Restore Purchases"
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Restore functionality will be added!"
                )
              }
              variant="outline"
              size="small"
            />
            <Text style={styles.restoreText}>
              Already purchased? Tap to restore your credits.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={creditState.isLoading}
        message="Processing your purchase..."
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showError && !!creditState.error}
        title="Purchase Failed"
        message={creditState.error || "Purchase failed. Please try again."}
        onClose={handleCloseError}
        onRetry={() => {
          setShowError(false);
          // Retry logic could be added here
        }}
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
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  headerRight: {
    // Placeholder for right side content
  },
  intro: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  introTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  introText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  packagesContainer: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  packages: {
    gap: SPACING.lg,
  },
  packageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    position: "relative",
  },
  popularCard: {
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bestValueCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "05",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  badge: {
    position: "absolute",
    top: -8,
    right: SPACING.lg,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  bestValueBadge: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.background,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  packageName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  packagePrice: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  packageDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  creditsContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  creditsAmount: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  creditsLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  savings: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
    textAlign: "center",
    marginBottom: SPACING.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  features: {
    marginBottom: SPACING.lg,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  purchaseButton: {
    // Custom styling handled by AppButton component
  },
  historyContainer: {
    padding: SPACING.lg,
  },
  historyLoading: {
    padding: SPACING.lg,
    alignItems: "center",
  },
  historyLoadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  noHistory: {
    padding: SPACING.lg,
    alignItems: "center",
  },
  noHistoryText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  noHistorySubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.xs,
  },
  historyList: {
    gap: SPACING.md,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  historyDetails: {
    flex: 1,
  },
  historyAmount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
  },
  historyDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  historyPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  benefits: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  benefitsList: {
    gap: SPACING.md,
  },
  benefit: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  benefitContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  benefitTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  restore: {
    padding: SPACING.lg,
    alignItems: "center",
  },
  restoreText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
});
