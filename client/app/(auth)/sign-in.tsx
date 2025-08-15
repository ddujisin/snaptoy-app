import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { COLORS, SPACING, TYPOGRAPHY } from "../../constants/theme";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);

      // Mock Apple Sign-In for now
      const mockCredential = {
        identityToken: "mock-identity-token",
        user: "mock-user-id",
        email: "user@apple.com",
        fullName: {
          givenName: "John",
          familyName: "Doe",
        },
      };

      await signIn(mockCredential);
      router.replace("/(app)");
    } catch (error: any) {
      Alert.alert("Sign-In Failed", error.message);
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

        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleAppleSignIn}
          disabled={isLoading}
        >
          <Text style={styles.signInButtonText}>
            {isLoading ? "Signing you in..." : "🍎 Sign in with Apple"}
          </Text>
        </TouchableOpacity>

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
  signInButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  signInButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.background,
  },
  privacyText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
});
