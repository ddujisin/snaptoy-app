import React, { useEffect } from "react";
import { router } from "expo-router";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { authState } = useAuth();

  useEffect(() => {
    if (!authState.isLoading) {
      if (authState.user) {
        router.replace("/(app)");
      } else {
        router.replace("/(auth)/sign-in");
      }
    }
  }, [authState.isLoading, authState.user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎯 SnapToy</Text>
        <Text style={styles.subtitle}>Transform your toys with AI magic!</Text>
        <Text style={styles.description}>Loading your experience...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6366f1",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 24,
  },
});
