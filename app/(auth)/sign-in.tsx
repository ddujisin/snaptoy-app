import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, Alert } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { COLORS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import AppButton from "../../components/shared/AppButton";

export default function SignInScreen() {
  const { signIn, isAvailable, authState } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Auto-redirect if already signed in
    if (authState.user && !authState.isLoading) {
      router.replace("/(app)");
    }
  }, [authState.user, authState.isLoading]);

  const handleAppleSignIn = async () => {
    if (!isAvailable) {
      Alert.alert(
        "Apple Sign-In Unavailable",
        "Apple Sign-In is not available on this device. Please try again or contact support."
      );
      return;
    }

    try {
      setIsLoading(true);
      await signIn();
      router.replace("/(app)");
    } catch (error: any) {
      console.error("Apple Sign-In error:", error);
      if (error.code === "ERR_CANCELED") {
        // User cancelled, don't show error
        return;
      }
      Alert.alert("Sign-In Failed", error.message || "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>📸</Text>
          </View>
          <Text style={styles.title}>SnapToy</Text>
          <Text style={styles.subtitle}>Transform your toys with AI magic</Text>
        </View>

        <View style={styles.features}>
          <Text style={styles.featureText}>
            📸 Take or upload photos of your toys
          </Text>
          <Text style={styles.featureText}>
            🎨 Choose from cartoon, LEGO, or photo backgrounds
          </Text>
          <Text style={styles.featureText}>
            ✨ AI-powered background transformation
          </Text>
          <Text style={styles.featureText}>
            💾 Save and share your creations
          </Text>
        </View>

        {isAvailable ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={12}
            style={styles.appleSignInButton}
            onPress={handleAppleSignIn}
          />
        ) : (
          <AppButton
            title="🍎 Sign in with Apple"
            onPress={handleAppleSignIn}
            loading={isLoading}
            disabled={!isAvailable}
            style={styles.fallbackButton}
          />
        )}

        {authState.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{authState.error}</Text>
          </View>
        )}

        <Text style={styles.privacyText}>
          By signing in, you agree to our privacy policy. Your data is secure
          and never shared.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: SPACING.xxl,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: 48,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl + 8,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  features: {
    flex: 1,
    justifyContent: "center",
    gap: SPACING.lg,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    lineHeight: 20,
    paddingVertical: SPACING.sm,
  },
  appleSignInButton: {
    width: "100%",
    height: 50,
    marginBottom: SPACING.md,
  },
  fallbackButton: {
    marginBottom: SPACING.md,
  },
  errorContainer: {
    backgroundColor: COLORS.error + "10",
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error + "30",
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: "center",
  },
  privacyText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
});
