import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";
import { CreditProvider } from "../../context/CreditContext";

export default function AppLayout() {
  return (
    <CreditProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.background,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            paddingBottom: Platform.OS === "ios" ? 20 : 10,
            paddingTop: 10,
            height: Platform.OS === "ios" ? 90 : 70,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Transform",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="camera" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="purchase"
          options={{
            href: null, // Hide from tab bar but keep accessible via router.push
          }}
        />
      </Tabs>
    </CreditProvider>
  );
}
